import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import Cart from "@/models/cartModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import { NextRequest, NextResponse } from "next/server";

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

    // Prepare items for checkout - filter out invalid items
    const checkoutItems = cart.items
      .filter((item: { productId: { _id: string, name: string, price: number, image: string } | null, quantity: number }) => {
        // Skip items with null/invalid productId or missing price
        if (!item.productId || !item.productId.price) {
          console.warn('⚠️ Skipping cart item with null or invalid product data');
          return false;
        }
        return true;
      })
      .map((item: { productId: { _id: string, name: string, price: number, image: string }, quantity: number }) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.image,
      }));

    // Ensure we have valid items
    if (checkoutItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create checkout record with ALL required fields
    const checkout = new Order({
      userId: userObjectId,
      orderNumber: orderNumber,
      
      // Customer Information (required)
      customerInfo: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
      
      // Shipping Address
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.address,
        addressLine2: shippingAddress.addressLine2, 
        landmark: shippingAddress.landmark || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || "India",
        addressType: shippingAddress.addressType || "Home",
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