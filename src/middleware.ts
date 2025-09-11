import { NextRequest, NextResponse } from 'next/server';
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Protect admin dashboard and other admin pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin-token')?.value;
    if (!token) {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}