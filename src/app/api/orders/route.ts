import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    const skip = (page - 1) * limit;

    let orders = await Order.find({ userId: userData.id })
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
    orders = orders.filter(order => order.status === 'confirmed' && order.paymentInfo?.status === 'paid');

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
    
    const userData = await getUserFromToken(request);
    if (!userData) {
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
      userId: userData.id,
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