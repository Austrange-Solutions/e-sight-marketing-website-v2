import { connect } from "@/dbConfig/dbConfig";
import Checkout from "@/models/checkoutModel";
import Cart from "@/models/cartModel";
import { getUserFromToken } from "@/middleware/auth";
import { NextRequest, NextResponse } from "next/server";

connect();

// Helper function to calculate charges
const calculateCharges = (subtotal: number, city: string, state: string) => {
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
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
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
    const subtotal = cart.items.reduce((total: number, item: any) => 
      total + (item.productId.price * item.quantity), 0
    );

    // Calculate charges
    const { gst, transactionFee, deliveryCharges } = calculateCharges(
      subtotal, 
      shippingAddress.city, 
      shippingAddress.state
    );

    // Calculate total
    const total = subtotal + gst + transactionFee + deliveryCharges;

    // Prepare items for checkout
    const checkoutItems = cart.items.map((item: any) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
    }));

    // Create checkout record with ALL shipping address fields
    const checkout = new Checkout({
      userId: userData.id,
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
      orderSummary: {
        subtotal,
        gst,
        transactionFee,
        deliveryCharges,
        total,
      },
      paymentMethod,
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

  } catch (error: any) {
    console.error("Checkout error:", error); // Debug log
    return NextResponse.json(
      { error: error.message || "Error creating checkout" },
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

    const items = cart.items.map((item: any) => ({
      _id: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
    }));

    const subtotal = items.reduce((total: number, item: any) => 
      total + (item.price * item.quantity), 0
    );

    // For preview, use default charges (Mumbai location)
    const { gst, transactionFee, deliveryCharges } = calculateCharges(subtotal, "Mumbai", "Maharashtra");
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

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching checkout data" },
      { status: 500 }
    );
  }
}