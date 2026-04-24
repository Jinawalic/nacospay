import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isStudentPath = pathname.startsWith('/dashboard');

  // Check for admin session
  if (isAdminPath) {
    const adminSession = request.cookies.get('nacos_admin_session');
    if (!adminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check for student session
  if (isStudentPath) {
    const studentSession = request.cookies.get('nacos_student_session');
    if (!studentSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
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
