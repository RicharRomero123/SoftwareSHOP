// my-client-app/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user');
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie.value);
        } catch (e) {
            console.error('Error parsing user cookie in middleware:', e);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('user');
            return response;
        }
    }

    const isClient = user?.rol === 'CLIENTE';
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isRegisterPage = request.nextUrl.pathname === '/register';
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isRootPage = request.nextUrl.pathname === '/';

    // If user is logged in (as CLIENTE) and tries to access login/register, redirect to dashboard
    if ((isLoginPage || isRegisterPage || isRootPage) && user && isClient) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user tries to access dashboard routes and is not a CLIENTE or not logged in, redirect to login
    if (isDashboardRoute) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (!isClient) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('user');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/register', '/dashboard/:path*'],
};