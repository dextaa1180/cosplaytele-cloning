export const ADMIN_DASHBOARD_PATH = '/tuna-console';
export const ADMIN_LOGIN_PATH = '/tuna-signin';
export const ADMIN_API_BASE_PATH = '/api/tuna-console';
export const ADMIN_SESSION_COOKIE = 'tunacosplay_admin_session';

const sessionMaxAgeSeconds = 60 * 60 * 12;

interface AdminSessionPayload {
  exp: number;
  username: string;
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin';
}

export function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || '';
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || '';
}

export function hasAdminAuthConfig() {
  return Boolean(getAdminPasswordHash() && getAdminSessionSecret());
}

export function getAdminSessionMaxAgeSeconds() {
  return sessionMaxAgeSeconds;
}

export async function verifyAdminPassword(password: string) {
  const expectedHash = getAdminPasswordHash();
  if (!expectedHash) {
    return false;
  }

  const actualHash = await sha256Hex(password);
  return timingSafeEqual(actualHash, expectedHash);
}

export async function createAdminSession(username: string) {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error('Admin session secret is not configured.');
  }

  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
    username,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacHex(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(session: string | undefined) {
  const secret = getAdminSessionSecret();
  if (!session || !secret) {
    return false;
  }

  const [encodedPayload, signature] = session.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await hmacHex(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;
    return payload.username === getAdminUsername() && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return bytesToHex(new Uint8Array(digest));
}

async function hmacHex(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );

  return bytesToHex(new Uint8Array(signature));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function base64UrlEncode(value: string) {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const paddedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (paddedValue.length % 4)) % 4);
  return atob(`${paddedValue}${padding}`);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}
