import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME } from '@/lib/constants';

const ADMIN_PATH = '/admin';
const encoder = new TextEncoder();

type AuthReason = 'required' | 'expired' | 'missing';

async function hashSecret(secret: string) {
  const data = encoder.encode(secret);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function redirectToLogin(request: NextRequest, reason: AuthReason) {
  const url = request.nextUrl.clone();
  url.pathname = ADMIN_PATH;
  url.searchParams.set('auth', reason);

  const currentPath = request.nextUrl.pathname;
  if (currentPath !== ADMIN_PATH) {
    const nextValue = `${currentPath}${request.nextUrl.search}`;
    url.searchParams.set('next', nextValue);
  } else if (request.nextUrl.searchParams.has('next')) {
    url.searchParams.set('next', request.nextUrl.searchParams.get('next') ?? '');
  }

  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_PATH)) {
    return NextResponse.next();
  }

  const authReasonParam = searchParams.get('auth');
  const isLoginView =
    pathname === ADMIN_PATH &&
    (authReasonParam === 'required' ||
      authReasonParam === 'expired' ||
      authReasonParam === 'missing');

  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!configuredPassword) {
    if (isLoginView && authReasonParam === 'missing') {
      return NextResponse.next();
    }

    const response = redirectToLogin(request, 'missing');
    if (request.cookies.has(ADMIN_COOKIE_NAME)) {
      response.cookies.delete(ADMIN_COOKIE_NAME);
    }
    return response;
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return isLoginView ? NextResponse.next() : redirectToLogin(request, 'required');
  }

  const expectedToken = await hashSecret(configuredPassword);
  const valid = safeEqual(sessionCookie, expectedToken);

  if (valid) {
    return NextResponse.next();
  }

  const response = redirectToLogin(request, 'expired');
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
