import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { orderId } = body;

    // Validation
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch payment details from Cashfree
    const response = await cashfree.PGOrderFetchPayments(orderId);
    
    if (!response || !response.data || response.data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No payment found for this order" },
        { status: 404 }
      );
    }

    // Get the latest payment
    const payment = response.data[0];

    // Check payment status
    if (payment.payment_status !== "SUCCESS") {
      // Update donation status to failed
      await Donation.findOneAndUpdate(
        { orderId },
        {
          status: "failed",
          paymentId: payment.cf_payment_id,
        }
      );

      return NextResponse.json(
        { success: false, message: `Payment status: ${payment.payment_status}` },
        { status: 400 }
      );
    }

    // Find and update donation
    const donation = await Donation.findOneAndUpdate(
      { orderId },
      {
        paymentId: payment.cf_payment_id,
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
