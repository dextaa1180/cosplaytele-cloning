import { NextResponse, type NextRequest } from 'next/server';

const adminRealm = 'Tunacosplay Admin';

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return new NextResponse('Admin authentication is not configured.', {
      status: 503,
    });
  }

  if (isAuthorized(request, username, password)) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required.', {
    headers: {
      'WWW-Authenticate': `Basic realm="${adminRealm}", charset="UTF-8"`,
    },
    status: 401,
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

function isAuthorized(
  request: NextRequest,
  username: string,
  password: string,
) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) {
    return false;
  }

  const credentials = decodeBasicAuth(authorization);
  if (!credentials) {
    return false;
  }

  return credentials.username === username && credentials.password === password;
}

function decodeBasicAuth(authorization: string) {
  try {
    const encodedCredentials = authorization.slice('Basic '.length);
    const decodedCredentials = atob(encodedCredentials);
    const separatorIndex = decodedCredentials.indexOf(':');

    if (separatorIndex < 0) {
      return null;
    }

    return {
      username: decodedCredentials.slice(0, separatorIndex),
      password: decodedCredentials.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}
