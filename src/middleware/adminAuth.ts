import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function getAdminFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("admin-token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { 
      id: string; 
      email: string; 
      username: string; 
      isAdmin: boolean; 
    };

    // Verify that the token belongs to an admin
    if (!decoded.isAdmin) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Admin token verification failed:", error);
    return null;
  }
}
