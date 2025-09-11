import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const adminData = getAdminFromRequest(req);

    if (!adminData) {
      console.log("[ADMIN VERIFY] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Admin verified",
      admin: adminData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
