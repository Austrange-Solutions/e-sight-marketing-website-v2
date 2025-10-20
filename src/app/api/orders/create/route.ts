import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/orderModel";
import { connect } from "@/dbConfig/dbConfig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import mongoose from "mongoose";
import User from "@/models/userModel";
// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

connect();

export async function POST(request: NextRequest) {
  try {
    console.log("🛍️ [ORDER CREATE] Starting order creation...");

    // Ensure database connection
    await connect();
    console.log("✅ [ORDER CREATE] Database connected");

    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let userObjectId;
    // Use dynamic import for mongoose

    if (typeof session.user.id === 'string' && mongoose.Types.ObjectId.isValid(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const userDoc = await User.findOne({ email: session.user.email });
      if (!userDoc) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      userObjectId = userDoc._id;
    } else {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📦 [ORDER CREATE] Request body:", JSON.stringify(body, null, 2));

    const {
      checkoutId: incomingCheckoutId,
      paymentInfo,
      customerInfo,
    } = body;

    let checkoutId = incomingCheckoutId as string | undefined;

    // Validate required fields (paymentInfo required; checkoutId optional with server fallback)
    if (!paymentInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only allow order creation if payment is successful (paid), or if COD and pending
    if (
      (paymentInfo.method === 'cod' && paymentInfo.status !== 'pending' && paymentInfo.status !== 'paid') ||
      (paymentInfo.method !== 'cod' && paymentInfo.status !== 'paid')
    ) {
      return NextResponse.json(
        { error: "Order can only be created if payment is successful (paid)." },
        { status: 400 }
      );
    }

    // Prevent duplicate orders for same payment
    if (paymentInfo.cashfreePaymentId) {
      const existingOrder = await Order.findOne({
        'paymentInfo.cashfreePaymentId': paymentInfo.cashfreePaymentId
      });
      if (existingOrder) {
        return NextResponse.json(
          { error: "Order already exists for this payment." },
          { status: 409 }
        );
      }
    }

    // Get checkout data
    console.log("🔍 Looking for checkout with ID:", checkoutId);
    console.log("🔍 checkoutId type:", typeof checkoutId);

    // Ensure we have a valid ObjectId
    if (!checkoutId || typeof checkoutId !== 'string') {
      console.log("⚠️ No valid checkoutId provided. Attempting to find latest pending checkout for user:", userObjectId.toString());
      const latestPending = await Order.findOne({ userId: userObjectId, status: 'pending' })
        .sort({ createdAt: -1 });
      if (!latestPending) {
        console.log("❌ No pending checkout found for user.");
        return NextResponse.json(
          { error: "Invalid checkout ID" },
          { status: 400 }
        );
      }
      checkoutId = latestPending._id.toString();
      console.log("🧭 Using latest pending checkoutId:", checkoutId);
    }

    const checkout = await Order.findById(checkoutId);
    console.log("📋 Checkout found:", !!checkout, checkout ? "with items:" + checkout.items?.length : "null");

    if (!checkout) {
      console.log("❌ Checkout not found in database");

      // Let's try to find any pending orders for this user
      const pendingOrders = await Order.find({ userId: userObjectId, status: 'pending' }).limit(5);
      console.log("🔍 Found pending orders for user:", pendingOrders.length);
      pendingOrders.forEach((order, index) => {
        console.log(`📋 Pending order ${index + 1}:`, order._id.toString(), "items:", order.items?.length);
      });

      return NextResponse.json(
        { error: "Checkout not found" },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create order data
    const orderData = {
      userId: userObjectId,
      orderNumber,
      items: checkout.items,
      customerInfo: customerInfo || {
        name: checkout.shippingAddress.name,
        email: checkout.shippingAddress.email,
        phone: checkout.shippingAddress.phone,
      },
      shippingAddress: checkout.shippingAddress,
      orderSummary: checkout.orderSummary,
      totalAmount: checkout.orderSummary.total,
      paymentInfo: {
        method: paymentInfo.method || 'cashfree',
        status: paymentInfo.status || 'paid',
        cashfreeOrderId: paymentInfo.cashfreeOrderId,
        cashfreePaymentId: paymentInfo.cashfreePaymentId,
        paidAt: new Date(),
      },
      status: 'confirmed',
    };

    // Create the order
    const order = new Order(orderData);
    await order.save();

    // Update checkout status
    await Order.findByIdAndUpdate(checkoutId, {
      status: 'confirmed',
      paymentStatus: 'paid',
      cashfreeOrderId: paymentInfo.cashfreeOrderId,
      cashfreePaymentId: paymentInfo.cashfreePaymentId,
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
      },
    });

  } catch (error: unknown) {
    console.error("Order creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Cancel order endpoint
export async function PATCH(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { orderId, cancelReason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order belongs to user
    if (order.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    // Cancel the order
    order.status = 'cancelled';
    order.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelReason: cancelReason || 'Cancelled by user',
      refundStatus: order.paymentInfo.method === 'cashfree' ? 'pending' : 'none',
    };

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });

  } catch (error: unknown) {
    console.error("Order cancellation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to cancel order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
