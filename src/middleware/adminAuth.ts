import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getAdminFromToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value || "";
    
    if (!token) {
      return null;
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as { isAdmin: boolean, id: string, username: string, email: string };
    
    // Check if user is admin
    if (!decodedToken.isAdmin) {
      return null;
    }

    return decodedToken;
  } catch {
    return null;
  }
};