import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { connect as __ensureConnect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import { getAdminFromRequest } from "@/middleware/adminAuth";

await __ensureConnect();

// GET - Get all disabled person registrations (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const persons = await DisabledPerson.find({})
      .sort({ createdAt: -1 })
      .select("-documents.additionalDocuments") // Exclude additional documents for list view
      .lean();

    return NextResponse.json({ success: true, persons }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch disabled persons:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
