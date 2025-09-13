import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";

// Force Node.js runtime to avoid Edge Runtime crypto issues
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userData.id).select("-password");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching user profile';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, phone, address } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      { username, phone, address },
      { new: true }
    ).select("-password");

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: updatedUser 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error updating profile';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}