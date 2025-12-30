import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { sanitizeEmail, validateAndSanitize } from "@/lib/validation/xss";

connect();
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, code } = reqBody; // Just expect 'code' for consistency

    console.log("Verification attempt:", { email, code });

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    let sanitizedEmail: string;
    let sanitizedCode: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
      sanitizedCode = validateAndSanitize(String(code).trim(), {
        fieldName: "verification code",
        maxLength: 100,
        strict: true,
      });
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : "Invalid email or code format",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: sanitizedEmail,
      verifyCode: sanitizedCode,
      verifyCodeExpiry: { $gt: Date.now() },
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid code, expired code, or email already verified" },
        { status: 400 }
      );
    }

    // Update user
    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" }, // Generic message
      { status: 500 }
    );
  }
}
