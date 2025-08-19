import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching user profile" },
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating profile" },
      { status: 500 }
    );
  }
}