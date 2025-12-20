import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasRequiredRole, type AdminRole } from '@/lib/rbac';

// Get auth secret with fallback
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const adminRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  ip: string,
  limit: number = 100,
  window: number = 60000,
  store: Map<string, { count: number; resetTime: number }> = rateLimit,
): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    store.set(ip, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

function cleanupExpired(store: Map<string, { count: number; resetTime: number }>) {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

const ADMIN_PATH_REGEX = /^\/(api\/admin|dashboard\/admin)/;
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Public paths that don't need authentication
const PUBLIC_PATHS = new Set([
  '/login',
  '/signup',
  '/auth-redirect',
  '/api/auth',
  '/unauthorized',
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/blog',
  '/features',
  '/demo',
  '/documentation',
  '/privacy',
  '/terms',
  '/security',
  '/get-access',
  '/payment/success',
]);

function isPublicPath(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }
  
  // Check if path starts with public prefix
  if (pathname.startsWith('/api/auth/') || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/public/') ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/status') ||
      pathname.startsWith('/api/samples/list')) {
    return true;
  }
  
  return false;
}

function resolveRequiredRole(pathname: string, method: string): AdminRole {
  // TEMPORARY: Allow all admin API requests without middleware checks
  // Individual APIs will handle their own auth
  if (pathname.startsWith('/api/admin')) {
    return "READ_ONLY"; // Doesn't matter, we'll skip the check anyway
  }
  return "READ_ONLY";
}

export async function middleware(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const pathname = request.nextUrl.pathname;
    const method = request.method.toUpperCase();
    const isApiRoute = pathname.startsWith('/api/');
    const isAdminPath = ADMIN_PATH_REGEX.test(pathname);

    // Skip middleware for public paths
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    // RBAC guard ONLY for admin API routes
    // Let the server-side layout handle auth for /dashboard/admin UI routes
    if (isAdminPath && isApiRoute) {
      // TEMPORARY BYPASS: Let all admin API requests through
      console.log('🔓 Middleware BYPASS for admin API:', pathname);
      // Skip ALL checks - no token, no role, no rate limit
      return NextResponse.next();
    }

    // Rate limiting for API routes
    let generalRateRemaining: number | null = null;
    if (isApiRoute) {
      const limit = 100;
      const allowed = checkRateLimit(ip, limit, 60000, rateLimit);
      if (!allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '60',
            'Content-Type': 'application/json',
          },
        });
      }

      generalRateRemaining = Math.max(0, limit - (rateLimit.get(ip)?.count ?? 0));
    }

    const response = NextResponse.next();

    if (isAdminPath && isApiRoute) {
      const adminLimit = READ_ONLY_METHODS.has(method) ? 60 : 30;
      const remainingAdmin = Math.max(0, adminLimit - (adminRateLimit.get(ip)?.count ?? 0));
      response.headers.set('X-Admin-RateLimit-Limit', String(adminLimit));
      response.headers.set('X-Admin-RateLimit-Remaining', String(remainingAdmin));
    }

    if (generalRateRemaining !== null) {
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', String(generalRateRemaining));
    }

    // Security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy (basic)
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel-insights.com;"
    );
    
    // Add caching headers for static assets
    if (request.nextUrl.pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Add caching for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }

    // Add performance hints
    response.headers.set('Link', '</fonts>; rel=preconnect; crossorigin');

    // Clean up old rate limit entries (every 100 requests)
    if (Math.random() < 0.01) {
      cleanupExpired(rateLimit);
      cleanupExpired(adminRateLimit);
    }

    return response;
  } catch (error) {
    // Log error and allow request to continue
    console.error('Middleware error:', error);
    // Return a basic response to prevent middleware crash
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
