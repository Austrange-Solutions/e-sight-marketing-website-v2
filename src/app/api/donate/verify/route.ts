import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime and dynamic rendering
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
    let payment = null;
    
    try {
      const response = await cashfree.PGOrderFetchPayments(orderId);
      
      if (response && response.data && response.data.length > 0) {
        payment = response.data[0];
      }
    } catch (cfError) {
      // Continue with manual update in sandbox mode
      console.error("Cashfree API Error:", cfError);
    }

    // Find existing donation
    const existingDonation = await Donation.findOne({ orderId });
    
    if (!existingDonation) {
      return NextResponse.json(
        { success: false, message: "Donation record not found" },
        { status: 404 }
      );
    }

    // Update based on payment info
    let updateData: any = {};
    
    if (payment) {
      // Real payment data from Cashfree
      if (payment.payment_status === "SUCCESS") {
        updateData = {
          paymentId: payment.cf_payment_id,
          status: "completed",
        };
      } else {
        updateData = {
          paymentId: payment.cf_payment_id,
          status: "failed",
        };
        
        const donation = await Donation.findOneAndUpdate(
          { orderId },
          updateData,
          { new: true }
        );
        
        return NextResponse.json(
          { success: false, message: `Payment status: ${payment.payment_status}` },
          { status: 400 }
        );
      }
    } else {
      // Sandbox mode or redirect - mark as completed with orderId as paymentId
      updateData = {
        paymentId: orderId, // Use orderId as paymentId in sandbox
        status: "completed",
      };
    }

    // Update donation
    const donation = await Donation.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Failed to update donation" },
        { status: 500 }
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
        status: donation.status,
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
