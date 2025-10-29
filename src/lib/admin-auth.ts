import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_COOKIE_NAME } from './constants';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function readAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
}

function hashSecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex');
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAdminSessionToken() {
  const password = readAdminPassword();
  return password ? hashSecret(password) : null;
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminSessionToken();
  if (!expected) {
    return false;
  }

  const candidate = hashSecret(password);

  return constantTimeEqual(candidate, expected);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie) {
    return false;
  }

  const expected = getAdminSessionToken();

  if (!expected) {
    return false;
  }

  try {
    return constantTimeEqual(sessionCookie.value, expected);
  } catch {
    return false;
  }
}

export async function establishAdminSession() {
  const token = getAdminSessionToken();

  if (!token) {
    throw new Error('ADMIN_PASSWORD is not configured. Set it before establishing a session.');
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
