import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import Cart from "@/models/cartModel";
import { getUserFromToken } from "@/middleware/auth";
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
    
    const userData = await getUserFromToken(request);
    console.log("🔐 [CHECKOUT] User token verification:", { 
      hasUser: !!userData, 
      userId: userData?.id,
      runtime: process.env.NEXT_RUNTIME || 'nodejs'
    });
    
    if (!userData) {
      console.log("❌ [CHECKOUT] Unauthorized - No valid user token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      shippingAddress,
      paymentMethod = "razorpay"
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
    const cart = await Cart.findOne({ userId: userData.id }).populate('items.productId');
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

    // Create checkout record with ALL required fields
    const checkout = new Order({
      userId: userData.id,
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

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's cart for checkout preview
    const cart = await Cart.findOne({ userId: userData.id }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
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

    const items = cart.items.map((item: { _id: string, productId: { _id: string, name: string, price: number, image: string }, quantity: number }) => ({
      _id: item._id,
      productId: item.productId._id,
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
    const errorMessage = error instanceof Error ? error.message : 'Error fetching checkout data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}