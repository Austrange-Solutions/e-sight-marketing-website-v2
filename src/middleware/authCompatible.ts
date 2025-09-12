import { NextRequest } from "next/server";

// Edge-compatible JWT verification using Web Crypto API
export async function getUserFromTokenEdge(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) return null;

    // For Edge Runtime, we need to use a simpler approach
    // You can implement Web Crypto API based JWT verification here
    // For now, let's return null to avoid crypto issues
    console.warn("Edge runtime detected - JWT verification not available");
    return null;
  } catch (error) {
    console.error("Edge token verification failed:", error);
    return null;
  }
}

// Node.js compatible JWT verification (original implementation)
export async function getUserFromTokenNode(req: NextRequest) {
  try {
    const jwt = require("jsonwebtoken");
    const token = req.cookies.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    return decoded as { id: string; email: string; username: string };
  } catch (error) {
    console.error("Node token verification failed:", error);
    return null;
  }
}

// Auto-detect runtime and use appropriate method
export async function getUserFromToken(req: NextRequest) {
  // Check if we're in Edge Runtime
  if (typeof EdgeRuntime !== 'undefined') {
    return getUserFromTokenEdge(req);
  }
  
  // Default to Node.js implementation
  return getUserFromTokenNode(req);
}