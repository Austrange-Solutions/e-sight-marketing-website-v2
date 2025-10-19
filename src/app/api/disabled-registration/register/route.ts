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

    // Check if email or phone already exists
    const existingPerson = await DisabledPerson.findOne({
      $or: [{ email: validatedData.email }, { phone: validatedData.phone }],
    });

    if (existingPerson) {
      return NextResponse.json(
        {
          error: existingPerson.email === validatedData.email
            ? "Email already registered"
            : "Phone number already registered",
        },
        { status: 409 }
      );
    }

    // Create new disabled person record
    const newPerson = new DisabledPerson({
      ...validatedData,
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
      await sendDisabledRegistrationEmail(validatedData.email, validatedData.fullName, newPerson._id.toString());
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
