import { NextResponse } from 'next/server';

// Add any routes that should be protected here
const protectedRoutes = [
    '/create-post',
    '/settings',
    '/profile',
];

// Add routes that should only be accessible to non-authenticated users
const authRoutes = [
    '/login',
    '/signup',
];

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('accessToken')?.value;

    // Special case for profile pages - allow viewing other profiles
    if (path.startsWith('/profile/')) {
        // Only redirect to login if trying to access /profile without a username
        if (path === '/profile' && !token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Otherwise, allow access to profile pages
        return NextResponse.next();
    }

    // Handle protected routes
    if (protectedRoutes.some(route => path.startsWith(route))) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Handle auth routes (prevent authenticated users from accessing login/signup)
    if (authRoutes.includes(path) && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle admin routes
    if (path.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/users/me/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) throw new Error('Failed to verify staff status');

            const user = await response.json();
            if (!user.is_staff) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (error) {
            console.error('Staff verification error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/create-post',
        '/settings',
        '/profile/:path*',
        '/login',
        '/signup'
    ]
} 