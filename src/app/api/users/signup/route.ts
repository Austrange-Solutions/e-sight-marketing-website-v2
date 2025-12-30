import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/resendEmail";
import {
  validateAndSanitize,
  sanitizeEmail,
  sanitizePhone,
} from "@/lib/validation/xss";

export async function POST(request: NextRequest) {
  await connect();
  try {
    const bodySchema = z.object({
      username: z.string().min(3, "Username must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().optional(),
    });

    const reqBody = await request.json();
    const parseResult = bodySchema.safeParse(reqBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.issues
            .map((e: { message: string }) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }
    const { username, email, password, phone } = parseResult.data;

    // Validate and sanitize inputs to prevent XSS
    let sanitizedUsername: string;
    let sanitizedEmail: string;
    let sanitizedPhone: string | undefined;

    try {
      sanitizedUsername = validateAndSanitize(username, {
        fieldName: "username",
        maxLength: 100,
        strict: false,
      });

      sanitizedEmail = sanitizeEmail(email);

      if (phone) {
        sanitizedPhone = sanitizePhone(phone);
      }
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

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email: sanitizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if user already exists with username
    const existingUserByUsername = await User.findOne({
      username: sanitizedUsername,
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 400 }
      );
    }

    // Check if user already exists with phone (if phone is provided)
    if (sanitizedPhone) {
      const existingUserByPhone = await User.findOne({ phone: sanitizedPhone });
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: "User with this phone number already exists" },
          { status: 400 }
        );
      }
    }

    //hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      phone: sanitizedPhone || undefined,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to user
    savedUser.verifyCode = code;
    savedUser.verifyCodeExpiry = Date.now() + 3600000; // 1 hour
    await savedUser.save();

    // Send email using Resend
    try {
      const { sendVerificationEmail } = await import("@/helpers/resendEmail");
      await sendVerificationEmail(
        sanitizedEmail,
        "Verify your email",
        code // just the code, not HTML
      );
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    // Redirect to login page after successful signup and email
    return NextResponse.json({
      message: "User created successfully. Verification email sent.",
      success: true,
      redirect: "/login",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
