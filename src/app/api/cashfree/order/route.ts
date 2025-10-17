import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
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

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare order request
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: currency,
      customer_details: {
        customer_id: userDetails?.userId || `guest_${Date.now()}`,
        customer_name: userDetails?.name || "Guest",
        customer_email: userDetails?.email || "",
        customer_phone: userDetails?.phone || "",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree/callback`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree/webhook`,
      },
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
    console.log(response.data)
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
    console.error("Cashfree order creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
