import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import mongoose from "mongoose";

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid registration ID" },
        { status: 400 }
      );
    }

    const person = await DisabledPerson.findById(id).select(
      "fullName email phone verificationStatus verificationHistory createdAt updatedAt verifiedAt rejectionReason"
    );

    if (!person) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          registrationId: person._id,
          fullName: person.fullName,
          email: person.email,
          phone: person.phone,
          status: person.verificationStatus,
          submittedAt: person.createdAt,
          updatedAt: person.updatedAt,
          verifiedAt: person.verifiedAt,
          rejectionReason: person.rejectionReason,
          statusHistory: person.verificationHistory,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Status check error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
