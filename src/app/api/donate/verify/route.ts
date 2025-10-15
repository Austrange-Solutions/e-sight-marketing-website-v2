import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Update donation status to failed
      if (donationId) {
        await Donation.findByIdAndUpdate(donationId, {
          status: "failed",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });
      }

      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find and update donation
    const donation = await Donation.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "completed",
      },
      { new: true }
    );

    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Donation record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      donation: {
        id: donation._id,
        amount: donation.amount,
        sticksEquivalent: donation.sticksEquivalent,
        donorName: donation.donorName,
        email: donation.email,
        paymentId: donation.paymentId,
        createdAt: donation.createdAt,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
