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

console.log("✅ [CASHFREE] SDK initialized with:", {
  environment: process.env.CASHFREE_ENDPOINT,
  mode: process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" ? "PRODUCTION" : "SANDBOX",
  appIdLength: process.env.CASHFREE_APP_ID.length,
  secretKeyLength: process.env.CASHFREE_SECRET_KEY.length,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", userDetails } = body;

    console.log("🔧 [CASHFREE ORDER] Environment:", process.env.CASHFREE_ENDPOINT);
    console.log("🔧 [CASHFREE ORDER] Creating order with amount:", amount);

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

    console.log("📤 [CASHFREE ORDER] Order request:", JSON.stringify(orderRequest, null, 2));

    // Create order
    const response = await cashfree.PGCreateOrder(orderRequest);

    // Log only the data portion, not the entire response object (which has circular refs)
    console.log("📥 [CASHFREE ORDER] Response received");

    if (!response || !response.data) {
      console.error("❌ [CASHFREE ORDER] Invalid response from Cashfree");
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderData = response.data;
    console.log("✅ [CASHFREE ORDER] Order created successfully:", orderData.order_id);
    console.log("📥 [CASHFREE ORDER] Order data:", {
      order_id: orderData.order_id,
      payment_session_id: orderData.payment_session_id ? "present" : "missing",
      order_amount: orderData.order_amount,
      order_status: orderData.order_status,
    });
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
    console.error("❌ [CASHFREE ORDER] Error:", error);
    
    // Safe error logging - avoid circular reference issues
    let errorDetails = "Unknown error";
    if (error && typeof error === 'object') {
      try {
        // Try to extract meaningful error info without circular references
        const errorObj = error as Record<string, unknown>;
        errorDetails = JSON.stringify({
          message: errorObj.message || 'Unknown',
          status: errorObj.status || errorObj.statusCode,
          code: errorObj.code,
          type: errorObj.type,
        }, null, 2);
      } catch {
        // If still fails, just use the error message
        const errorObj = error as Record<string, unknown>;
        errorDetails = String(errorObj.message || error);
      }
      console.error("❌ [CASHFREE ORDER] Error details:", errorDetails);
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
