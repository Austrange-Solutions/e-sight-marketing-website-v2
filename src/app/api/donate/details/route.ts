import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find donation by orderId (works for both completed and pending)
    const donation = await Donation.findOne({
      orderId: orderId,
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
