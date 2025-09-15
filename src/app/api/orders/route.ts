import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";

// Force Node.js runtime to avoid Edge Runtime crypto issues
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    const skip = (page - 1) * limit;

    let userObjectId;
    const mongoose = await import('mongoose');
    if (typeof session.user.id === 'string' && mongoose.Types.ObjectId.isValid(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const User = (await import("@/models/userModel")).default;
      const userDoc = await User.findOne({ email: session.user.email });
      if (!userDoc) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      userObjectId = userDoc._id;
    } else {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 401 });
    }

    let orders = await Order.find({ userId: userObjectId })
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    // Delete invalid orders from DB
    const invalidOrders = orders.filter(order => order.status !== 'confirmed' && order.paymentInfo?.status !== 'paid');
    for (const invalidOrder of invalidOrders) {
      await Order.deleteOne({ _id: invalidOrder._id });
    }

    // Filter out deleted orders for response
    orders = orders.filter(order => order.status !== 'pending' && order.paymentInfo?.status === 'paid');

    // Pagination after filtering
    const paginatedOrders = orders.slice(skip, skip + limit);

    // Format orders for frontend
    const formattedOrders = paginatedOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      orderSummary: order.orderSummary,
      totalAmount: order.totalAmount,
      paymentInfo: order.paymentInfo,
      status: order.status,
      cancellation: order.cancellation,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error fetching orders";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, totalAmount, shippingAddress, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    const order = new Order({
      userId: session.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error creating order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}