import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { AuthPayload } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle locale routing first
  const response = intlMiddleware(request);
  
  // Get the current locale from the path, or fallback to default
  const segments = pathname.split('/');
  const localeFromPath = segments[1];
  const locale = routing.locales.includes(localeFromPath as any) ? localeFromPath : routing.defaultLocale;

  // Get the pathname without the locale prefix for auth logic
  const pathnameWithoutLocale = pathname.replace(/^\/(tr|en)/, '') || '/';

  const cookieStore = await request.cookies;
  const token = cookieStore.get('token')?.value;

  // 2. If trying to access protected routes and NOT logged in
  if (!token) {
    if (
      pathnameWithoutLocale.startsWith('/master') || 
      pathnameWithoutLocale.startsWith('/admin') || 
      pathnameWithoutLocale.startsWith('/dealer') ||
      pathnameWithoutLocale === '/'
    ) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    return response;
  }

  try {
    const payload = decodeJwt(token) as AuthPayload;
    const { role } = payload;

    // 3. If logged in and visiting login/register page
    if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register') {
      if (role === 'master_admin') return NextResponse.redirect(new URL(`/${locale}/master/dashboard`, request.url));
      if (role === 'admin') return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
      if (role === 'dealer') return NextResponse.redirect(new URL(`/${locale}/dealer/dashboard`, request.url));
    }

    // 4. Route specific protections
    if (pathnameWithoutLocale.startsWith('/master') && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale);
    }

    if (pathnameWithoutLocale.startsWith('/admin') && role !== 'admin' && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request, locale);
    }

    if (pathnameWithoutLocale.startsWith('/dealer') && role !== 'dealer') {
      return redirectToCorrectDashboard(role, request, locale);
    }

    return response;
  } catch {
    const errorResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    errorResponse.cookies.delete('token');
    return errorResponse;
  }
}

function redirectToCorrectDashboard(role: string, request: NextRequest, locale: string) {
  if (role === 'master_admin') return NextResponse.redirect(new URL(`/${locale}/master/dashboard`, request.url));
  if (role === 'admin') return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
  if (role === 'dealer') return NextResponse.redirect(new URL(`/${locale}/dealer/dashboard`, request.url));
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}

export const config = {
  matcher: [
    // Next-intl paths
    '/', '/(tr|en)/:path*',
    
    // Original paths (for safety during transition or if accessed directly)
    '/master/:path*', '/admin/:path*', '/dealer/:path*', '/login', '/register'
  ],
};
