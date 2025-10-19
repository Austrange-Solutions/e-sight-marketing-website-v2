import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime to avoid Edge Runtime issues and ensure dynamic behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { orderId } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order details from Cashfree
    const response = await cashfree.PGOrderFetchPayments(orderId);
    
    if (!response || !response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: "No payment found for this order" },
        { status: 404 }
      );
    }

    // Get the latest payment
    const payment = response.data[0];

    // Check payment status
    if (payment.payment_status !== "SUCCESS") {
      return NextResponse.json(
        { error: `Payment status: ${payment.payment_status}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        orderId: payment.order_id,
        paymentId: payment.cf_payment_id,
        paymentAmount: payment.payment_amount,
        paymentCurrency: payment.payment_currency,
        paymentStatus: payment.payment_status,
        paymentMethod: payment.payment_group,
        paymentTime: payment.payment_time,
      },
    });

  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
