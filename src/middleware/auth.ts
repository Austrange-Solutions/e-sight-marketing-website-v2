import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function getUserFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    return decoded as { id: string; email: string; username: string };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}