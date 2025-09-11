import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
    }

    // Check if password is correct
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Create token data
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "2h", // Session lasts 2 hours
    });

    console.log("[ADMIN LOGIN] Token generated:", token);

    const response = NextResponse.json({
      message: "Admin login successful",
      success: true,
    });

    response.cookies.set("admin-token", token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 2, // 2 hours in seconds
    });

    console.log("[ADMIN LOGIN] Cookie set:", response.cookies.get("admin-token"));

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}