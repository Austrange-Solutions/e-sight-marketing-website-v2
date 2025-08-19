import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getAdminFromToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value || "";
    
    if (!token) {
      return null;
    }

    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    
    // Check if user is admin
    if (!decodedToken.isAdmin) {
      return null;
    }

    return decodedToken;
  } catch (error: any) {
    return null;
  }
};