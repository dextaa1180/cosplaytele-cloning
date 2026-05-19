import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionMaxAgeSeconds,
  getAdminUsername,
  hasAdminAuthConfig,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!hasAdminAuthConfig()) {
    return Response.json(
      { error: 'Admin authentication is not configured.' },
      { status: 503 },
    );
  }

  const credentials = (await request.json().catch(() => null)) as {
    password?: string;
    username?: string;
  } | null;

  if (
    credentials?.username !== getAdminUsername() ||
    !(await verifyAdminPassword(credentials?.password ?? ''))
  ) {
    return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const session = await createAdminSession(credentials.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    httpOnly: true,
    maxAge: getAdminSessionMaxAgeSeconds(),
    name: ADMIN_SESSION_COOKIE,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    value: session,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: ADMIN_SESSION_COOKIE,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    value: '',
  });

  return response;
}
