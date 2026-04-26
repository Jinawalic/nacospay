import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isStudentPath = pathname.startsWith('/dashboard');

  // Check for admin session
  if (isAdminPath) {
    const adminSession = request.cookies.get('nacos_admin_session');
    if (!adminSession) {
      // Redirect unauthenticated admin to Admin Login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check for student session
  if (isStudentPath) {
    const studentSession = request.cookies.get('nacos_student_session');
    if (!studentSession) {
      // Redirect unauthenticated student to homepage as requested
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();

  // Add headers to prevent caching for protected routes (prevents back-button access after logout)
  if (isAdminPath || isStudentPath) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Config to match all relevant paths
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
};
