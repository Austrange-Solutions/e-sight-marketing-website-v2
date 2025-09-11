import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.verifyCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }
    if (Date.now() > user.verifyCodeExpiry) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }
    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();
    return NextResponse.json({ message: "Email verified successfully", success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
