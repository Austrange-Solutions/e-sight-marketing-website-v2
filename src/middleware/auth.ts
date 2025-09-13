import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function getUserFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      console.log("🔍 No token found in cookies");
      return null;
    }

    console.log("🔍 Token found, attempting verification...");
    
    // Ensure we have the secret
    if (!process.env.TOKEN_SECRET) {
      console.error("❌ TOKEN_SECRET not found in environment variables");
      return null;
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    console.log("✅ Token verified successfully");
    return decoded as { id: string; email: string; username: string };
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return null;
  }
}