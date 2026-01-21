import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Skip middleware for API routes to avoid Edge Runtime issues
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // if (pathname === "/ciel-video") return NextResponse.redirect("https://youtube.com/shorts/uREbbhqztMs?feature=share", 307)

  // Handle donate subdomain
  const subdomain = hostname.split('.')[0];
  if (subdomain === 'donate' || hostname.startsWith('donate.')) {
    const url = req.nextUrl.clone();
    
    // Root of donate subdomain shows donate page
    if (url.pathname === '/') {
      url.pathname = '/donate';
      return NextResponse.rewrite(url);
    }
    
    // Success page
    if (url.pathname === '/success') {
      url.pathname = '/donate/success';
      return NextResponse.rewrite(url);
    }
    
    // Any other paths under donate subdomain
    if (!url.pathname.startsWith('/donate') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/assets')) {
      url.pathname = `/donate${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}