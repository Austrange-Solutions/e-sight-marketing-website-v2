import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import { sendDisabledRegistrationEmail } from "@/helpers/resendEmail";
import { disabledRegistrationSchema } from "@/lib/validations/disabled-registration";
import { z } from "zod";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Disabled registration request received");

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = disabledRegistrationSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

  // Normalize inputs for checks
  const normalizedEmail = validatedData.email ? String(validatedData.email).trim().toLowerCase() : undefined;
  const normalizedPhone = validatedData.phone ? String(validatedData.phone).replace(/[^0-9]/g, "") : undefined;
  const normalizedAadhar = (validatedData as any).aadharNumber ? String((validatedData as any).aadharNumber).replace(/[^0-9]/g, "") : undefined;

  // Check if email, phone or aadhar already exists
  const conflictQuery = [] as Record<string, unknown>[];
  if (normalizedEmail) conflictQuery.push({ email: normalizedEmail });
  if (normalizedPhone) conflictQuery.push({ phone: normalizedPhone });
  if (normalizedAadhar) conflictQuery.push({ aadharNumber: normalizedAadhar });

    if (conflictQuery.length > 0) {
      const existingPerson = await DisabledPerson.findOne({ $or: conflictQuery });
      if (existingPerson) {
        // Determine which field conflicts
        if (existingPerson.email === validatedData.email) {
          return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }
        if (existingPerson.phone === validatedData.phone) {
          return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
        }
        if ((existingPerson as any).aadharNumber && (existingPerson as any).aadharNumber === (validatedData as any).aadharNumber) {
          return NextResponse.json({ error: "Aadhaar number already registered" }, { status: 409 });
        }
        // Fallback
        return NextResponse.json({ error: "A record with similar details already exists" }, { status: 409 });
      }
    }

    // Create new disabled person record (explicit mapping to ensure fields are persisted)
    const newPerson = new DisabledPerson({
      fullName: validatedData.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      aadharNumber: normalizedAadhar || undefined,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,

      address: validatedData.address,
      addressLine2: validatedData.addressLine2,
      city: validatedData.city,
      state: validatedData.state,
      pincode: validatedData.pincode,

      disabilityType: validatedData.disabilityType,
      disabilityPercentage: validatedData.disabilityPercentage,
      disabilityDescription: validatedData.disabilityDescription,

      guardianName: validatedData.guardianName,
      guardianEmail: validatedData.guardianEmail,
      guardianPhone: validatedData.guardianPhone,

      documents: (validatedData as any).documents || {},

      verificationStatus: "pending",
      verificationHistory: [
        {
          status: "pending",
          updatedBy: "System",
          updatedAt: new Date(),
          comments: "Registration submitted",
        },
      ],
    });

    await newPerson.save();

    console.log("Disabled person registered successfully:", newPerson._id);

    // Send confirmation email
    try {
      await sendDisabledRegistrationEmail(
        validatedData.email,
        validatedData.fullName,
        newPerson._id.toString(),
        validatedData.guardianEmail
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully",
        registrationId: newPerson._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Disabled registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
