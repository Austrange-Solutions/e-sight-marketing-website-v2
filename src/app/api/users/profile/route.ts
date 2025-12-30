import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";
import { validateAndSanitize, sanitizePhone, validateAndSanitizeWithWordLimit } from "@/lib/validation/xss";

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

    // Validate and sanitize user inputs to prevent XSS
    let sanitizedUsername: string | undefined;
    let sanitizedPhone: string | undefined;
    let sanitizedAddress: string | undefined;

    try {
      if (username) {
        sanitizedUsername = validateAndSanitize(username, {
          fieldName: 'username',
          maxLength: 100,
          strict: false,
        });
      }
      
      if (phone) {
        sanitizedPhone = sanitizePhone(phone);
      }
      
      if (address) {
        sanitizedAddress = validateAndSanitizeWithWordLimit(address, {
          fieldName: 'address',
          maxWords: 150,
          strict: false,
        });
      }
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input detected' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      { 
        username: sanitizedUsername, 
        phone: sanitizedPhone, 
        address: sanitizedAddress 
      },
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