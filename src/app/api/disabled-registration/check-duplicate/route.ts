import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Please provide email or phone" },
        { status: 400 }
      );
    }

    let existingPerson;

    if (email) {
      existingPerson = await DisabledPerson.findOne({ email: email.toLowerCase() });
    } else if (phone) {
      existingPerson = await DisabledPerson.findOne({ phone });
    }

    return NextResponse.json({
      exists: !!existingPerson,
      field: email ? "email" : "phone",
    });
  } catch (error: unknown) {
    console.error("Duplicate check error:", error);
    return NextResponse.json({ error: "Failed to check duplicate" }, { status: 500 });
  }
}
