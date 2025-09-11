import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;
    const errors: { field: string; message: string }[] = [];

    // Email validation
    if (!email || typeof email !== "string" || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address." });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        errors.push({ field: "email", message: "No account found with this email." });
      }
    }

    // Password validation
    if (!password || typeof password !== "string" || password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters." });
    }

    return NextResponse.json({
      isValid: errors.length === 0,
      errors,
    });
  } catch (error) {
    return NextResponse.json({ error: "Validation error." }, { status: 500 });
  }
}
