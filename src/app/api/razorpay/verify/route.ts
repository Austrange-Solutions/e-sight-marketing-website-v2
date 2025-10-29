import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { connect as __ensureConnect } from "@/dbConfig/dbConfig";

await __ensureConnect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Verify payment signature
    const body_string = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string.toString())
      .digest("hex");

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured" },
        { status: 400 }
      );
    }

    // Here you can save the payment details to your database
    // For example: create order record, update checkout status, etc.
    
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
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
