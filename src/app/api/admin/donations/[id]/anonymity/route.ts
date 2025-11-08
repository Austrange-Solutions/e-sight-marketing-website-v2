import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connect();

    const { id } = await params;
    const { isAnonymous } = await request.json();

    if (typeof isAnonymous !== "boolean") {
      return NextResponse.json(
        { error: "isAnonymous must be a boolean value" },
        { status: 400 }
      );
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      { isAnonymous },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Donation anonymity updated to ${isAnonymous ? "anonymous" : "public"}`,
      donation: {
        _id: donation._id,
        isAnonymous: donation.isAnonymous,
        donorName: donation.donorName,
      },
    });
  } catch (error: any) {
    console.error("Error updating donation anonymity:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update anonymity status" },
      { status: 500 }
    );
  }
}
