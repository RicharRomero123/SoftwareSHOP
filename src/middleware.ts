import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from './types'; // Asegúrate de que la ruta a tus tipos sea correcta

interface UserCookie {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
}

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user');
    let user: UserCookie | null = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie.value);
        } catch (e) {
            console.error('Error parsing user cookie in middleware:', e);
            // Si la cookie está corrupta, la eliminamos y redirigimos al login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('user');
            response.cookies.delete('jwtToken');
            return response;
        }
    }

    const { pathname } = request.nextUrl;

    // Si el usuario está logueado
    if (user) {
        // Si es ADMIN y trata de ir al dashboard de cliente, redirigir a su panel
        if (user.rol === 'ADMIN' && pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/admin/usuarios', request.url));
        }
        // Si es CLIENTE y trata de ir al panel de admin, redirigir a su dashboard
        if (user.rol === 'CLIENTE' && pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Si un usuario logueado (de cualquier rol) intenta ir al login o registro,
        // lo redirigimos a su panel correspondiente.
        if (pathname === '/login' || pathname === '/register') {
            const redirectUrl = user.rol === 'ADMIN' ? '/admin/usuarios' : '/dashboard';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
    } 
    // Si el usuario NO está logueado
    else {
        // Y trata de acceder a una ruta protegida, lo mandamos al login
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    
    // Para todas las demás rutas (como la landing page '/'), permite el acceso.
    return NextResponse.next();
}

export const config = {
    // El matcher ahora incluye las rutas de admin
    matcher: ['/', '/login', '/register', '/dashboard/:path*', '/admin/:path*'],
};