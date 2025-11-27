import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Foundation from "@/models/Foundation";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all active foundations (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Fetch all active foundations, excluding 'general'
    const foundations = await Foundation.find({ 
      isActive: true,
      code: { $ne: 'general' } // Exclude general foundation
    })
      .select('foundationName displayName code logo description platformFeePercent foundationSharePercent companySharePercent priority')
      .sort({ priority: 1, foundationName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      foundations,
      count: foundations.length,
    });
  } catch (error) {
    console.error("Error fetching foundations:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch foundations" },
      { status: 500 }
    );
  }
}
