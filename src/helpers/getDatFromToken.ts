import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value || '';
    if (!token) {
      throw new Error("Token not found");
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    return decodedToken.id; // userId stored in JWT payload
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    throw new Error(errorMessage);
  }
};