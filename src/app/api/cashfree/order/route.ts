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
      console.error("❌ [CASHFREE ORDER] Missing customer details");
      return NextResponse.json(
        { error: "Customer name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize phone number (Cashfree requires exactly 10 digits, no country code)
    const phoneNumber = userDetails.phone.replace(/\D/g, ''); // Remove non-digits
    if (phoneNumber.length !== 10) {
      console.error("❌ [CASHFREE ORDER] Invalid phone number format:", userDetails.phone);
      return NextResponse.json(
        { error: "Phone number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      console.error("❌ [CASHFREE ORDER] Invalid email format:", userDetails.email);
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Generate unique order ID (Cashfree allows alphanumeric and underscore, max 50 chars)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Prepare order request
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: currency,
      customer_details: {
        customer_id: userDetails?.userId || `guest_${Date.now()}`,
        customer_name: userDetails?.name.trim(),
        customer_email: userDetails?.email.trim().toLowerCase(),
        customer_phone: phoneNumber, // Use sanitized 10-digit phone number
      },
      // Intentionally omit return_url to avoid Cashfree auto-redirects when using JS checkout.
      // You can add notify_url later for webhooks if needed.
    };
    
    console.log("📤 [CASHFREE ORDER] Creating order:", {
      orderId,
      amount: orderRequest.order_amount,
      currency: orderRequest.order_currency,
      customerId: orderRequest.customer_details.customer_id,
      customerPhone: orderRequest.customer_details.customer_phone,
      customerEmail: orderRequest.customer_details.customer_email
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
    
    // Extract more details from Cashfree error
    let errorMessage = "Failed to create order";
    let statusCode = 500;
    
    if (error && typeof error === 'object') {
      const err = error as any;
      
      // Cashfree SDK errors often have response data
      if (err.response?.data) {
        console.error("Cashfree API Error Response:", err.response.data);
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        statusCode = err.response.status || statusCode;
      } else if (err.message) {
        console.error("Error message:", err.message);
        errorMessage = err.message;
      }
      
      if (err.stack) {
        console.error("Stack trace:", err.stack);
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: statusCode }
    );
  }
}
