import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import Cart from "@/models/cartModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { validateAndSanitize, sanitizeEmail, sanitizePhone } from "@/lib/validation/xss";

// Force Node.js runtime to avoid Edge Runtime crypto issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

connect();

// Helper function to calculate charges
const calculateCharges = (subtotal: number, city: string) => {
  // GST calculation (18%)
  const gst = subtotal * 0.18;
  
  // Transaction fee (2% of subtotal)
  const transactionFee = subtotal * 0.02;
  
  // Delivery charges based on location
  const isMumbai = city.toLowerCase().includes('mumbai') || 
                   city.toLowerCase().includes('bombay');
  
  const deliveryCharges = isMumbai ? 500 : 1000; // ₹500 for Mumbai, ₹1000 for outside
  
  return { gst, transactionFee, deliveryCharges };
};

export async function POST(request: NextRequest) {
  console.log("🛒 [CHECKOUT] Starting checkout process...");
  
  try {
    await connect();
    console.log("✅ [CHECKOUT] Database connected");
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      console.log("❌ [CHECKOUT] Unauthorized - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      shippingAddress,
      paymentMethod = "cashfree"
    } = await request.json();

    // Validate required fields
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || 
        !shippingAddress.email || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return NextResponse.json(
        { error: "Missing required shipping address fields" },
        { status: 400 }
      );
    }

    // Sanitize shipping address fields to prevent XSS
    let sanitizedAddress;
    try {
      sanitizedAddress = {
        name: validateAndSanitize(shippingAddress.name, { fieldName: 'name', maxLength: 100, strict: true }),
        phone: sanitizePhone(shippingAddress.phone),
        email: sanitizeEmail(shippingAddress.email),
        address: validateAndSanitize(shippingAddress.address, { fieldName: 'address', maxLength: 500, strict: true }),
        addressLine2: shippingAddress.addressLine2 ? validateAndSanitize(shippingAddress.addressLine2, { fieldName: 'addressLine2', maxLength: 200 }) : undefined,
        landmark: shippingAddress.landmark ? validateAndSanitize(shippingAddress.landmark, { fieldName: 'landmark', maxLength: 100 }) : '',
        city: validateAndSanitize(shippingAddress.city, { fieldName: 'city', maxLength: 100, strict: true }),
        state: validateAndSanitize(shippingAddress.state, { fieldName: 'state', maxLength: 100, strict: true }),
        pincode: validateAndSanitize(shippingAddress.pincode, { fieldName: 'pincode', maxLength: 10 }),
        country: shippingAddress.country ? validateAndSanitize(shippingAddress.country, { fieldName: 'country', maxLength: 100 }) : 'India',
        addressType: shippingAddress.addressType ? validateAndSanitize(shippingAddress.addressType, { fieldName: 'addressType', maxLength: 20 }) : 'Home',
      };
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input detected in shipping address' },
        { status: 400 }
      );
    }

    // Get user's cart
    let userObjectId;
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      // Try to look up user by email
      const User = (await import("@/models/userModel")).default;
      const userDoc = await User.findOne({ email: session.user.email });
      if (!userDoc) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }
      userObjectId = userDoc._id;
    } else {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }
    const cart = await Cart.findOne({ userId: userObjectId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((total: number, item: { productId: { price: number }, quantity: number }) => 
      total + (item.productId.price * item.quantity), 0
    );

    // Calculate charges
    const { gst, transactionFee, deliveryCharges } = calculateCharges(
      subtotal, 
      shippingAddress.city
    );

    // Calculate total
    const total = subtotal + gst + transactionFee + deliveryCharges;

    // Prepare items for checkout
    const checkoutItems = cart.items.map((item: { productId: { _id: string, name: string, price: number, image: string }, quantity: number }) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
    }));

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create checkout record with ALL required fields (using sanitized data)
    const checkout = new Order({
      userId: userObjectId,
      orderNumber: orderNumber,
      
      // Customer Information (required)
      customerInfo: {
        name: sanitizedAddress.name,
        email: sanitizedAddress.email,
        phone: sanitizedAddress.phone,
      },
      
      // Shipping Address
      shippingAddress: {
        name: sanitizedAddress.name,
        phone: sanitizedAddress.phone,
        email: sanitizedAddress.email,
        address: sanitizedAddress.address,
        addressLine2: sanitizedAddress.addressLine2, 
        landmark: sanitizedAddress.landmark,
        city: sanitizedAddress.city,
        state: sanitizedAddress.state,
        pincode: sanitizedAddress.pincode,
        country: sanitizedAddress.country,
        addressType: sanitizedAddress.addressType,
      },
      
      items: checkoutItems,
      
      // Order Summary
      orderSummary: {
        subtotal,
        gst,
        transactionFee,
        deliveryCharges,
        total,
      },
      
      // Total Amount (required)
      totalAmount: total,
      
      // Payment Information (required)
      paymentInfo: {
        method: paymentMethod,
        status: 'pending',
      },
      
      // Order Status
      status: 'pending',
    });

    await checkout.save();

    console.log("Checkout saved with address:", checkout.shippingAddress); // Debug log

    return NextResponse.json({
      success: true,
      checkoutId: checkout._id,
      orderSummary: {
        subtotal,
        gst,
        transactionFee,
        deliveryCharges,
        total,
      },
      shippingAddress: checkout.shippingAddress, // Return saved address for verification
      items: checkoutItems, // Include purchased items in the response
    });

  } catch (error: unknown) {
    console.error("Checkout error:", error); // Debug log
    const errorMessage = error instanceof Error ? error.message : 'Error creating checkout';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      console.log("❌ [CHECKOUT_GET] Unauthorized - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's cart for checkout preview
    let userObjectId;
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const User = (await import("@/models/userModel")).default;
      const userDoc = await User.findOne({ email: session.user.email });
      if (!userDoc) {
        console.log("❌ [CHECKOUT_GET] User not found by email");
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      userObjectId = userDoc._id;
    } else {
      console.log("❌ [CHECKOUT_GET] Invalid user ID format");
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId: userObjectId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      console.log("⚠️ [CHECKOUT_GET] Cart is empty");
      return NextResponse.json({ 
        items: [], 
        orderSummary: { 
          subtotal: 0, 
          gst: 0, 
          transactionFee: 0, 
          deliveryCharges: 500, 
          total: 500 
        } 
      });
    }

    console.log(`✅ [CHECKOUT_GET] Found cart with ${cart.items.length} items`);

    // Filter out items with null/deleted products and inactive products
    const validItems = cart.items.filter((item: { _id: string, productId: any, quantity: number }) => {
      if (!item.productId) {
        console.warn(`⚠️ [CHECKOUT_GET] Skipping item with null product`);
        return false;
      }
      if (item.productId.status && item.productId.status !== 'active') {
        console.warn(`⚠️ [CHECKOUT_GET] Skipping inactive product: ${item.productId.name}`);
        return false;
      }
      return true;
    });

    console.log(`✅ [CHECKOUT_GET] ${validItems.length} valid items after filtering`);

    if (validItems.length === 0) {
      console.log("⚠️ [CHECKOUT_GET] No valid items in cart after filtering");
      return NextResponse.json({ 
        items: [], 
        orderSummary: { 
          subtotal: 0, 
          gst: 0, 
          transactionFee: 0, 
          deliveryCharges: 500, 
          total: 500 
        } 
      });
    }

    const items = validItems.map((item: { _id: string, productId: { _id: string, name: string, price: number, image: string }, quantity: number }) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
    }));

    const subtotal = items.reduce((total: number, item: { price: number, quantity: number }) => 
      total + (item.price * item.quantity), 0
    );

    // For preview, use default charges (Mumbai location)
    const { gst, transactionFee, deliveryCharges } = calculateCharges(subtotal, "Mumbai");
    const total = subtotal + gst + transactionFee + deliveryCharges;

    console.log(`✅ [CHECKOUT_GET] Returning ${items.length} items, total: ₹${total}`);

    return NextResponse.json({
      items,
      orderSummary: { 
        subtotal, 
        gst, 
        transactionFee, 
        deliveryCharges, 
        total 
      },
    });

  } catch (error: unknown) {
    console.error("❌ [CHECKOUT_GET] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching checkout data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}