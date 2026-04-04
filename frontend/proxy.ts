import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Define routes clearly
const PUBLIC_ROUTES = ['/auth/sign-in', 'auth/sign-up'];
const PROTECTED_ROUTES = ['/convert'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 🚫 1. Block unauthenticated users
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth/sign-in', request.url);
    
    // 🔥 Preserve redirect path (important in real apps)
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // 🚫 2. Block logged-in users from auth pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ✅ Allow request
  return NextResponse.next();
}