import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AdminPayload = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
};

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get("admin-token")?.value || null;
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as AdminPayload;
    if (!decoded.isAdmin) return null;
    return decoded;
  } catch (error) {
    console.error("[ADMIN AUTH] Token verification failed:", error);
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): AdminPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyAdminToken(token);
}
