import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Example: Log the request URL
  console.log('Request URL:', req.url);

  // Continue to the next middleware or route handler
  return NextResponse.next();
}