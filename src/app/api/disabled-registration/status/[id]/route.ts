import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import mongoose from "mongoose";
import { validateObjectId } from "@/lib/validation/objectId";

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing registration ID" },
        { status: 400 }
      );
    }

    try {
      validateObjectId(id);
    } catch (validationError) {
      return NextResponse.json(
        { error: "Invalid registration ID format" },
        { status: 400 }
      );
    }

    // Safe: ID is validated via validateObjectId() which ensures it's a valid MongoDB ObjectId
    const person = await DisabledPerson.findById(id).select(
      // nosemgrep: javascript.express.mongodb.express-mongo-nosqli
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
