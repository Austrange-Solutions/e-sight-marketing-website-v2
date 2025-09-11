import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export function requireAdminDashboard(req: NextRequest) {
  const admin = getAdminFromRequest(req);

  if (!admin) {
    console.log("[ADMIN MIDDLEWARE] Unauthorized, redirecting to login");
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  console.log("[ADMIN MIDDLEWARE] Verified admin:", admin.email);
  return NextResponse.next();
}
