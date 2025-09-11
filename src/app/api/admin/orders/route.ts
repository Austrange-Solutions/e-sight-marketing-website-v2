import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/middleware/adminAuth";
const jwt = require("jsonwebtoken");

export async function GET(request: NextRequest) {
  try {
    console.log("Admin orders API called");
    await connect();
    
  const adminData = getAdminFromRequest(request);
    console.log("Admin data:", adminData);
    
    if (!adminData) {
      console.log("Unauthorized admin access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching orders from database...");
    
    // Get all orders with user details and populate product information
    const orders = await Order.find({})
      .populate('userId', 'username email phone isAdmin')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Orders fetched:', orders.length);

    // Delete invalid orders from DB
    const invalidOrders = orders.filter(order => order.status !== 'confirmed' || order.paymentInfo?.status !== 'paid');
    for (const invalidOrder of invalidOrders) {
      await Order.deleteOne({ _id: invalidOrder._id });
    }

    // Filter out deleted orders for response
    const validOrders = orders.filter(order => order.status === 'confirmed' && order.paymentInfo?.status === 'paid');

    if (validOrders.length === 0) {
      return NextResponse.json({ 
        success: true,
        orders: [],
        stats: {
          total: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0,
        }
      });
    }

        // Transform the data to include better structure for admin dashboard
        const transformedOrders = orders.map(order => {
          try {
            return {
              _id: order._id,
              orderNumber: order.orderNumber || 'N/A',
              status: order.status || 'pending',
              totalAmount: order.totalAmount || 0,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              // Customer Information
              customer: {
                userId: order.userId?._id || 'unknown',
                username: order.userId?.username || order.customerInfo?.name || 'Unknown',
                email: order.userId?.email || order.customerInfo?.email || 'Unknown',
                phone: order.userId?.phone || order.customerInfo?.phone || 'Unknown',
                isAdmin: order.userId?.isAdmin || false,
              },
              // Order Items
              items: (order.items || []).map((item: {
                productId?: { _id?: string; name?: string; image?: string };
                name: string;
                price: number;
                quantity: number;
                image?: string;
              }) => ({
                productId: item.productId?._id || 'unknown',
                name: item.productId?.name || item.name || 'Unknown Product',
                price: item.price || 0,
                quantity: item.quantity || 0,
                image: item.productId?.image || item.image || '',
                subtotal: (item.price || 0) * (item.quantity || 0),
              })),
              // Shipping Address
              shippingAddress: order.shippingAddress || {
                name: 'N/A',
                address: 'N/A',
                city: 'N/A',
                state: 'N/A',
                pincode: 'N/A',
              },
              // Payment Information
              paymentInfo: {
                method: order.paymentInfo?.method || 'unknown',
                status: order.paymentInfo?.status || 'unknown',
                razorpayOrderId: order.paymentInfo?.razorpayOrderId || '',
                razorpayPaymentId: order.paymentInfo?.razorpayPaymentId || '',
                paidAt: order.paymentInfo?.paidAt || null,
              },
              // Order Summary
              orderSummary: order.orderSummary || {
                subtotal: 0,
                gst: 0,
                transactionFee: 0,
                deliveryCharges: 0,
                total: 0,
              },
              // Cancellation Info
              cancellation: order.cancellation || { isCancelled: false },
            };
          } catch (err) {
            console.error('Error transforming order:', order._id, err);
            return null;
          }
        }).filter(order => order !== null);

        // Get order statistics
        const stats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length,
          totalRevenue: orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        };

        console.log('Transformed orders:', transformedOrders.length);
        console.log('Stats:', stats);

        return NextResponse.json({ 
          success: true,
          orders: transformedOrders,
          stats 
        });
  } catch (error: unknown) {
    console.error("Admin orders API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}

// Update order status
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    
    const adminData = getAdminFromToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...(status === 'cancelled' && {
          'cancellation.isCancelled': true,
          'cancellation.cancelledAt': new Date(),
          'cancellation.cancelReason': 'Cancelled by admin',
        })
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error: unknown) {
    console.error("Admin order update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}

// Extracts and verifies admin token from request headers
function getAdminFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    // Replace with your JWT secret or verification logic
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET as string);
    if (decoded && decoded.isAdmin) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

