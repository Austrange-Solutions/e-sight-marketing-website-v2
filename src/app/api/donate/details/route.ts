import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id");
    const orderId = searchParams.get("order_id");

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { success: false, message: "Payment ID and Order ID are required" },
        { status: 400 }
      );
    }

    const donation = await Donation.findOne({
      paymentId: paymentId,
      orderId: orderId,
      status: "completed",
    }).lean();

    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      donation: donation,
    });
  } catch (error) {
    console.error("Error fetching donation details:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch donation details" },
      { status: 500 }
    );
  }
}
