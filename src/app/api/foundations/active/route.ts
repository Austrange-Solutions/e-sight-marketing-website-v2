import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Foundation from "@/models/Foundation";

// Public API - No authentication required
export const runtime = "nodejs";

// GET: Fetch all active foundations (for donation page)
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Fetch only active foundations, sorted by priority
    const foundations = await Foundation.find({ isActive: true })
      .sort({ priority: 1, createdAt: 1 })
      .select("-stats -createdAt -updatedAt -__v") // Exclude sensitive fields
      .lean();

    return NextResponse.json({
      success: true,
      foundations,
      count: foundations.length,
    });
  } catch (error: any) {
    console.error("Error fetching active foundations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch foundations" },
      { status: 500 }
    );
  }
}
