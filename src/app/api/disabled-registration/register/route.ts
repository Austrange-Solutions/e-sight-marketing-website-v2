import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import { sendDisabledRegistrationEmail } from "@/helpers/resendEmail";
import { disabledRegistrationSchema } from "@/lib/validations/disabled-registration";
import { z } from "zod";
import {
  validateAndSanitize,
  sanitizeEmail,
  sanitizePhone,
  validateAndSanitizeWithWordLimit,
} from "@/lib/validation/xss";

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
    const normalizedEmail = validatedData.email
      ? String(validatedData.email).trim().toLowerCase()
      : undefined;
    const normalizedPhone = validatedData.phone
      ? String(validatedData.phone).replace(/[^0-9]/g, "")
      : undefined;
    const normalizedAadhar = (validatedData as any).aadharNumber
      ? String((validatedData as any).aadharNumber).replace(/[^0-9]/g, "")
      : undefined;

    // Sanitize all text fields to prevent XSS
    let sanitizedData: any;
    try {
      sanitizedData = {
        fullName: validateAndSanitize(validatedData.fullName, {
          fieldName: "full name",
          maxLength: 200,
          strict: true,
        }),
        email: normalizedEmail,
        phone: normalizedPhone,
        aadharNumber: normalizedAadhar,
        address: validateAndSanitize(validatedData.address, {
          fieldName: "address",
          maxLength: 500,
          strict: false,
        }),
        addressLine2: validatedData.addressLine2
          ? validateAndSanitize(validatedData.addressLine2, {
              fieldName: "address line 2",
              maxLength: 200,
              strict: false,
            })
          : undefined,
        city: validateAndSanitize(validatedData.city, {
          fieldName: "city",
          maxLength: 100,
          strict: true,
        }),
        state: validateAndSanitize(validatedData.state, {
          fieldName: "state",
          maxLength: 100,
          strict: true,
        }),
        pincode: validateAndSanitize(validatedData.pincode, {
          fieldName: "pincode",
          maxLength: 10,
          strict: false,
        }),
        disabilityType: validateAndSanitize(validatedData.disabilityType, {
          fieldName: "disability type",
          maxLength: 100,
          strict: false,
        }),
        disabilityDescription: validatedData.disabilityDescription
          ? validateAndSanitize(validatedData.disabilityDescription, {
              fieldName: "disability description",
              maxLength: 1000,
              strict: true,
            })
          : undefined,
        guardianName: validatedData.guardianName
          ? validateAndSanitize(validatedData.guardianName, {
              fieldName: "guardian name",
              maxLength: 200,
              strict: true,
            })
          : undefined,
        guardianEmail: validatedData.guardianEmail
          ? sanitizeEmail(validatedData.guardianEmail)
          : undefined,
        guardianPhone: validatedData.guardianPhone
          ? sanitizePhone(validatedData.guardianPhone)
          : undefined,
      };
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : "Invalid input detected",
        },
        { status: 400 }
      );
    }

    // Check if email, phone or aadhar already exists
    const conflictQuery = [] as Record<string, unknown>[];
    if (normalizedEmail) conflictQuery.push({ email: normalizedEmail });
    if (normalizedPhone) conflictQuery.push({ phone: normalizedPhone });
    if (normalizedAadhar)
      conflictQuery.push({ aadharNumber: normalizedAadhar });

    if (conflictQuery.length > 0) {
      const existingPerson = await DisabledPerson.findOne({
        $or: conflictQuery,
      });
      if (existingPerson) {
        // Determine which field conflicts
        if (existingPerson.email === validatedData.email) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }
        if (existingPerson.phone === validatedData.phone) {
          return NextResponse.json(
            { error: "Phone number already registered" },
            { status: 409 }
          );
        }
        if (
          (existingPerson as any).aadharNumber &&
          (existingPerson as any).aadharNumber ===
            (validatedData as any).aadharNumber
        ) {
          return NextResponse.json(
            { error: "Aadhaar number already registered" },
            { status: 409 }
          );
        }
        // Fallback
        return NextResponse.json(
          { error: "A record with similar details already exists" },
          { status: 409 }
        );
      }
    }

    // Create new disabled person record (explicit mapping to ensure fields are persisted)
    const newPerson = new DisabledPerson({
      fullName: sanitizedData.fullName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      aadharNumber: sanitizedData.aadharNumber || undefined,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,

      address: sanitizedData.address,
      addressLine2: sanitizedData.addressLine2,
      city: sanitizedData.city,
      state: sanitizedData.state,
      pincode: sanitizedData.pincode,

      disabilityType: sanitizedData.disabilityType,
      disabilityPercentage: validatedData.disabilityPercentage,
      disabilityDescription: sanitizedData.disabilityDescription,

      guardianName: sanitizedData.guardianName,
      guardianEmail: sanitizedData.guardianEmail,
      guardianPhone: sanitizedData.guardianPhone,

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
