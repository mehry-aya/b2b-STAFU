import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { AuthPayload } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const cookieStore = await request.cookies;
  const token = cookieStore.get('token')?.value;
  const { pathname } = request.nextUrl;
  const currency = cookieStore.get('NEXT_CURRENCY')?.value;

  let response = NextResponse.next();

  // 0. Ensure currency cookie exists for SSR consistency
  if (!currency) {
    response.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
  }

  // 1. If trying to access protected routes and NOT logged in
  if (!token) {
    if (pathname.startsWith('/master') || pathname.startsWith('/admin') || pathname.startsWith('/dealer')) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      if (!currency) redirectResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
      return redirectResponse;
    }
    return response;
  }

  try {
    const payload = decodeJwt(token) as AuthPayload;
    const { role } = payload;

    // 2. If logged in and visiting login/register page
    if (pathname === '/login' || pathname === '/register') {
      if (role === 'master_admin') return NextResponse.redirect(new URL('/master/dashboard', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'dealer') return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
    }

    // 3. Route specific protections
    if (pathname.startsWith('/master') && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request);
    }

    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'master_admin') {
      return redirectToCorrectDashboard(role, request);
    }

    if (pathname.startsWith('/dealer') && role !== 'dealer') {
      return redirectToCorrectDashboard(role, request);
    }

    return response;
  } catch {
    const errorResponse = NextResponse.redirect(new URL('/login', request.url));
    errorResponse.cookies.delete('token');
    if (!currency) errorResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
    return errorResponse;
  }
}

function redirectToCorrectDashboard(role: string, request: NextRequest, currency?: string) {
  let targetUrl = '/login';
  if (role === 'master_admin') targetUrl = '/master/dashboard';
  else if (role === 'admin') targetUrl = '/admin/dashboard';
  else if (role === 'dealer') targetUrl = '/dealer/dashboard';

  const redirectResponse = NextResponse.redirect(new URL(targetUrl, request.url));
  if (!currency) redirectResponse.cookies.set('NEXT_CURRENCY', 'TRY', { maxAge: 60 * 60 * 24 * 365 });
  return redirectResponse;
}

export const config = {
  matcher: ['/master/:path*', '/admin/:path*', '/dealer/:path*', '/login', '/register'],
};
