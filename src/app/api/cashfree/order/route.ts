import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime to avoid Edge Runtime issues and ensure dynamic behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Avoid eager evaluation at build time; validate and initialize inside the handler

export async function POST(request: NextRequest) {
  try {
    // Validate env at request time (not at import/build time)
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    const endpoint = process.env.CASHFREE_ENDPOINT;
    
    console.log("🔑 [CASHFREE ORDER] Environment check:", {
      hasAppId: !!appId,
      hasSecret: !!secret,
      endpoint: endpoint || "not set",
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!appId || !secret) {
      console.error("❌ [CASHFREE ORDER] Missing credentials");
      return NextResponse.json(
        { error: "Missing Cashfree credentials. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const env = endpoint === "https://api.cashfree.com/pg" 
      ? CFEnvironment.PRODUCTION 
      : CFEnvironment.SANDBOX;
    
    console.log("🔧 [CASHFREE ORDER] Initializing Cashfree SDK:", {
      environment: env === CFEnvironment.PRODUCTION ? "PRODUCTION" : "SANDBOX"
    });
    
    const cashfree = new Cashfree(env, appId, secret);

    const body = await request.json();
    const { amount, currency = "INR", userDetails } = body;
    
    console.log("📦 [CASHFREE ORDER] Request body:", {
      amount,
      currency,
      userDetails: userDetails ? {
        hasName: !!userDetails.name,
        hasEmail: !!userDetails.email,
        hasPhone: !!userDetails.phone
      } : "missing"
    });

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
    
    console.log("📤 [CASHFREE ORDER] Creating order:", {
      orderId,
      amount: orderRequest.order_amount,
      currency: orderRequest.order_currency,
      customerId: orderRequest.customer_details.customer_id
    });

    // Create order
    const response = await cashfree.PGCreateOrder(orderRequest);
    
    console.log("✅ [CASHFREE ORDER] Order created successfully:", {
      hasResponse: !!response,
      hasData: !!response?.data
    });

    if (!response || !response.data) {
      console.error("❌ [CASHFREE ORDER] Invalid response from Cashfree:", response);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderData = response.data;
    
    console.log("🎉 [CASHFREE ORDER] Returning order data:", {
      orderId: orderData.order_id,
      hasPaymentSessionId: !!orderData.payment_session_id
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
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: error
    });
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
