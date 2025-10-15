import { NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await dbConnect();

    // Get top 10 donors (non-anonymous, completed donations only)
    const donors = await Donation.find({
      status: "completed",
      isAnonymous: false,
    })
      .sort({ amount: -1, createdAt: -1 })
      .limit(10)
      .select("donorName amount sticksEquivalent createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      donors: donors,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
