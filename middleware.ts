// middleware.ts
// Next.js Middleware for Authentication and Route Protection
//
// This middleware runs on every request and:
// - Protects authenticated routes (dashboard, profile, etc.)
// - Redirects unauthenticated users to login
// - Redirects authenticated users away from auth pages
// - Handles session refresh

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth-server';

/**
 * Route Configuration
 * Define which routes require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/about',
  '/contact',
];

const authRoutes = ['/login', '/signup'];

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/communities',
  '/messages',
  '/notifications',
];

/**
 * Check if a path matches a route pattern
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true;

    // Prefix match (e.g., /dashboard/*)
    if (pathname.startsWith(route + '/')) return true;

    return false;
  });
}

/**
 * Middleware function
 * Runs on every request to protected routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/images/') ||
    pathname.includes('/public/')
  ) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isAuthenticated = !!session?.user;
    const isPublicRoute = matchesRoute(pathname, publicRoutes);
    const isAuthRoute = matchesRoute(pathname, authRoutes);
    const isProtectedRoute = matchesRoute(pathname, protectedRoutes);

    // Case 1: User is authenticated and trying to access auth pages
    // Redirect to dashboard
    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Case 2: User is not authenticated and trying to access protected routes
    // Redirect to login with callback URL
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Case 3: User is not authenticated and accessing public routes
    // Allow access
    if (!isAuthenticated && isPublicRoute) {
      return NextResponse.next();
    }

    // Case 4: User is authenticated and accessing protected or public routes
    // Allow access
    if (isAuthenticated) {
      // Add user info to headers for server components
      const response = NextResponse.next();
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-email', session.user.email || '');
      return response;
    }

    // Default: Allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);

    // On error, allow public routes and redirect protected routes to login
    const isProtectedRoute = matchesRoute(pathname, protectedRoutes);

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

/**
 * Middleware Configuration
 * Define which paths should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes - handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
