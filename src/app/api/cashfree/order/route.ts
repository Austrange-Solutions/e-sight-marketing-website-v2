import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime to avoid Edge Runtime issues and ensure dynamic behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validate required environment variables
if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Missing Cashfree credentials. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables.");
}

// Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", userDetails } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Validate customer details for production
    if (!userDetails?.email || !userDetails?.phone || !userDetails?.name) {
      return NextResponse.json(
        { error: "Customer name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare order request
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: currency,
      customer_details: {
        customer_id: userDetails?.userId || `guest_${Date.now()}`,
        customer_name: userDetails?.name,
        customer_email: userDetails?.email,
        customer_phone: userDetails?.phone,
      },
      // Intentionally omit return_url to avoid Cashfree auto-redirects when using JS checkout.
      // You can add notify_url later for webhooks if needed.
    };

    // Create order
    const response = await cashfree.PGCreateOrder(orderRequest);

    if (!response || !response.data) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderData = response.data;
    return NextResponse.json({
      order_id: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      paymentSessionId: orderData.payment_session_id,
      orderAmount: orderData.order_amount,
      orderCurrency: orderData.order_currency,
      orderStatus: orderData.order_status,
      createdAt: orderData.created_at,
      customerDetails: orderData.customer_details
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
