import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connect as __ensureConnect } from "@/dbConfig/dbConfig";

await __ensureConnect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, userDetails } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: userDetails?.userId || "guest",
        name: userDetails?.name || "",
        email: userDetails?.email || "",
        phone: userDetails?.phone || "",
      },
    });

    // Only allow order creation if status is 'created'
    if (order.status !== 'created') {
      return NextResponse.json(
        { error: 'Order not created. Payment status is not created.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}