import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("🧪 [TEST] Runtime check endpoint called");
    console.log("🔧 [TEST] Runtime environment:", {
      runtime: process.env.NEXT_RUNTIME || 'nodejs',
      hasJWT: !!jwt,
      hasCrypto: typeof crypto !== 'undefined',
      nodeVersion: process.version
    });

    // Test JWT functionality
    const testToken = jwt.sign({ test: true }, 'test-secret');
    const decoded = jwt.verify(testToken, 'test-secret');
    
    return NextResponse.json({
      success: true,
      message: "Runtime test successful",
      runtime: process.env.NEXT_RUNTIME || 'nodejs',
      jwtWorks: !!decoded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ [TEST] Runtime test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      runtime: process.env.NEXT_RUNTIME || 'nodejs'
    }, { status: 500 });
  }
}