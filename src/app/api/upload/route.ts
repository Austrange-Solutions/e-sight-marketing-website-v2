import { NextRequest, NextResponse } from "next/server";

// Redirect to the UI page instead of showing JSON
export async function GET(req: NextRequest) {
    return NextResponse.redirect(new URL('/upload-hub', req.url));
}

// Redirect POST requests to the proper upload endpoint
export async function POST(req: NextRequest) {
    return NextResponse.redirect(new URL('/api/aws/upload', req.url));
}