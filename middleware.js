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
    // Get the pathname of the request
    const path = request.nextUrl.pathname
    console.log('Middleware: Processing path:', path);

    // Check if it's an admin route
    if (path.startsWith('/admin')) {
        console.log('Middleware: Checking admin route access');

        // Get all cookies for debugging
        const cookies = request.cookies.getAll();
        console.log('Middleware: All cookies:', cookies);

        const token = request.cookies.get('accessToken')?.value;
        console.log('Middleware: Token found:', !!token);

        if (!token) {
            console.log('Middleware: No token found in cookies, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Use the environment variable for API URL
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            console.log('Middleware: Using API URL:', apiUrl);

            // Update the API endpoint to use the base URL without /api prefix
            const response = await fetch(`${apiUrl}/users/me/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Middleware: Staff verification failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error('Failed to verify staff status');
            }

            const user = await response.json();
            console.log('Middleware: User data:', user);

            if (!user.is_staff) {
                console.log('Middleware: User is not staff, redirecting to home');
                return NextResponse.redirect(new URL('/', request.url));
            }

            console.log('Middleware: Staff access granted');
        } catch (error) {
            console.error('Middleware: Staff verification error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
} 