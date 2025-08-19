import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";

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

    const user = await User.findOne({
      email,
      verifyCode: code,
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