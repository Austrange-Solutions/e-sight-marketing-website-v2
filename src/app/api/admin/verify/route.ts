import { NextRequest, NextResponse } from "next/server";
import { getAdminFromToken } from "@/middleware/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const adminData = getAdminFromToken(request);
    
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Admin verified",
      admin: adminData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}