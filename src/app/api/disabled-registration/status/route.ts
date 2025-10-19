import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import mongoose from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (!email && !id) {
      return NextResponse.json(
        { error: "Please provide either email or registration ID" },
        { status: 400 }
      );
    }

    let person;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid registration ID format" },
          { status: 400 }
        );
      }
      person = await DisabledPerson.findById(id);
    } else if (email) {
      person = await DisabledPerson.findOne({ email: email.toLowerCase() });
    }

    if (!person) {
      return NextResponse.json(
        { error: "Registration not found. Please check your email or registration ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        registration: {
          _id: person._id,
          fullName: person.fullName,
          email: person.email,
          phone: person.phone,
          disabilityType: person.disabilityType,
          disabilityPercentage: person.disabilityPercentage,
          verificationStatus: person.verificationStatus,
          createdAt: person.createdAt,
          updatedAt: person.updatedAt,
          verifiedAt: person.verifiedAt,
          rejectionReason: person.rejectionReason,
          verificationHistory: person.verificationHistory,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Status check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
