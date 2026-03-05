import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { AuthPayload } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const cookieStore = await request.cookies;
  const token = cookieStore.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access protected routes and NOT logged in
  if (!token) {
    if (pathname.startsWith('/master') || pathname.startsWith('/admin') || pathname.startsWith('/dealer')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
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

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

function redirectToCorrectDashboard(role: string, request: NextRequest) {
  if (role === 'master_admin') return NextResponse.redirect(new URL('/master/dashboard', request.url));
  if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  if (role === 'dealer') return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/master/:path*', '/admin/:path*', '/dealer/:path*', '/login', '/register'],
};
