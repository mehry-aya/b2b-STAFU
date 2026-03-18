import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { AuthPayload } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = request.cookies;
  const currency = cookieStore.get('NEXT_CURRENCY')?.value;

  // 1. Handle locale routing first
  const response = intlMiddleware(request);
  
  // Get the current locale from the path, or fallback to default
  const segments = pathname.split('/');
  const localeFromPath = segments[1];
  const locale = routing.locales.includes(localeFromPath as any) ? localeFromPath : routing.defaultLocale;

  // 0. Ensure currency cookie exists for SSR consistency on the current response
  if (!currency) {
    response.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
  }

  // Get the pathname without the locale prefix for auth logic
  const pathnameWithoutLocale = pathname.replace(/^\/(tr|en)/, '') || '/';

  const token = cookieStore.get('token')?.value;

  // 2. If trying to access protected routes and NOT logged in
  if (!token) {
    if (
      pathnameWithoutLocale.startsWith('/master') || 
      pathnameWithoutLocale.startsWith('/admin') || 
      pathnameWithoutLocale.startsWith('/dealer') ||
      pathnameWithoutLocale === '/'
    ) {
      const redirectResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      if (!currency) redirectResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
      return redirectResponse;
    }
    return response;
  }

  try {
    const payload = decodeJwt(token) as AuthPayload;
    const { role } = payload;

    // 3. If logged in and visiting login/register page
    if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    // 4. Route specific protections
    if (pathnameWithoutLocale.startsWith('/master') && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    if (pathnameWithoutLocale.startsWith('/admin') && role !== 'admin' && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    if (pathnameWithoutLocale.startsWith('/dealer') && role !== 'dealer') {
      return redirectToCorrectDashboard(role, request, locale, currency);
    }

    return response;
  } catch {
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
    // Next-intl paths
    '/', '/(tr|en)/:path*',
    
    // Original paths (for safety during transition or if accessed directly)
    '/master/:path*', '/admin/:path*', '/dealer/:path*', '/login', '/register'
  ],
};

