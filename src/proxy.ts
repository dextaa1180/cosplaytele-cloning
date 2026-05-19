import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_API_BASE_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  hasAdminAuthConfig,
  verifyAdminSession,
} from '@/lib/admin-auth';

const legacyAdminPaths = ['/admin', '/api/admin'];
const publicSessionPath = `${ADMIN_API_BASE_PATH}/session`;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (legacyAdminPaths.some((path) => isPathOrChild(pathname, path))) {
    return new NextResponse('Not found.', { status: 404 });
  }

  if (isPathOrChild(pathname, publicSessionPath)) {
    return NextResponse.next();
  }

  if (!hasAdminAuthConfig()) {
    return new NextResponse('Admin authentication is not configured.', {
      status: 503,
    });
  }

  const isAuthenticated = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isPathOrChild(pathname, ADMIN_API_BASE_PATH)) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set('next', pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/tuna-console/:path*',
    '/api/tuna-console/:path*',
  ],
};

function isPathOrChild(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}
