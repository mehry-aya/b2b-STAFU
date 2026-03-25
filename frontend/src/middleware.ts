import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthPayload } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return await jwtVerify(token, new TextEncoder().encode(secret));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = request.cookies;
  const currency = cookieStore.get('NEXT_CURRENCY')?.value;

  const response = intlMiddleware(request);

  const segments = pathname.split('/');
  const localeFromPath = segments[1];
  const locale = routing.locales.includes(localeFromPath as any) ? localeFromPath : routing.defaultLocale;

  if (!currency) {
    response.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
  }

  const pathnameWithoutLocale = pathname.replace(new RegExp(`^\\/(${routing.locales.join('|')})($|\\/)`), '/') || '/';
  const cleanPathname = pathnameWithoutLocale.replace(/\/+$/, '') || '/';

  const token = cookieStore.get('token')?.value;

  const isProtectedRoute =
    cleanPathname.startsWith('/master') ||
    cleanPathname.startsWith('/admin') ||
    cleanPathname.startsWith('/dealer') ||
    cleanPathname === '/';

  const isAuthPage = cleanPathname === '/login' || cleanPathname === '/register';

  if (!token) {
    if (isProtectedRoute) {
      const redirectResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      if (!currency) redirectResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
      return redirectResponse;
    }
    return response;
  }

  try {
    const { payload } = await verifyToken(token);
    const { role } = payload as unknown as AuthPayload;

    if (isAuthPage) {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    if (cleanPathname.startsWith('/master') && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    if (cleanPathname.startsWith('/admin') && role !== 'admin' && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    if (cleanPathname.startsWith('/dealer') && role !== 'dealer') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    return response;
  } catch {
    if (isAuthPage) {
      response.cookies.delete('token');
      return response;
    }

    const errorResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    errorResponse.cookies.delete('token');
    if (!currency) errorResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
    return errorResponse;
  }
}

function redirectToCorrectDashboard(role: string, request: NextRequest, locale: string, currency?: string) {
  let targetPath = `/${locale}/login`;
  if (role === 'master_admin') targetPath = `/${locale}/master/dashboard`;
  else if (role === 'admin') targetPath = `/${locale}/admin/dashboard`;
  else if (role === 'dealer') targetPath = `/${locale}/dealer/dashboard`;

  const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
  if (!currency) redirectResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
  return redirectResponse;
}

export const config = {
  matcher: [
    '/', '/(tr|en)/:path*',
    '/master/:path*', '/admin/:path*', '/dealer/:path*', '/login', '/register'
  ],
};