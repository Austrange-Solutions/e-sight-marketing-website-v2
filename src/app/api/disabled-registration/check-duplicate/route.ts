import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawEmail = searchParams.get("email");
  const phone = searchParams.get("phone");
  const aadhar = searchParams.get("aadhar");
  const email = rawEmail ? rawEmail.trim().toLowerCase() : null;

    if (!email && !phone && !aadhar) {
      return NextResponse.json(
        { error: "Please provide email or phone" },
        { status: 400 }
      );
    }

    let existingPerson;

    // Check across all registrations (pending/verified) to prevent duplicates during registration
    if (email) {
      existingPerson = await DisabledPerson.findOne({ email });
    } else if (phone) {
      const cleanedPhone = phone?.replace(/[^0-9]/g, "");
      existingPerson = await DisabledPerson.findOne({ phone: cleanedPhone });
    } else if (aadhar) {
      // aadhar number stored as a string field 'aadharNumber' in the document
      const cleanedAadhar = aadhar?.replace(/[^0-9]/g, "");
      existingPerson = await DisabledPerson.findOne({ aadharNumber: cleanedAadhar });
    }

    // Determine which field matched
    let matchedField: string | null = null;
    if (existingPerson) {
      if (email && existingPerson.email === email.toLowerCase()) matchedField = "email";
      else if (phone && existingPerson.phone === phone) matchedField = "phone";
      else if (aadhar && (existingPerson as any).aadharNumber === aadhar) matchedField = "aadhar";
    }

    return NextResponse.json({
      exists: !!existingPerson,
      field: matchedField,
    });
  } catch (error: unknown) {
    console.error("Duplicate check error:", error);
    return NextResponse.json({ error: "Failed to check duplicate" }, { status: 500 });
  }
}
