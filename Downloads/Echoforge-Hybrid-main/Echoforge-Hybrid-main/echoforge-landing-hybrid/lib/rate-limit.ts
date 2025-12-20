// @ts-nocheck
/**
 * Rate limiting utilities
 * For production, use Redis-based rate limiting (e.g., rate-limiter-flexible)
 * This is a simple in-memory implementation for development
 */

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory stores (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>();
const uploadRateLimitStore = new Map<string, RateLimitStore>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  for (const [key, value] of uploadRateLimitStore.entries()) {
    if (now > value.resetTime) {
      uploadRateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Check rate limit
 */
function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  store: Map<string, RateLimitStore>
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    reset: record.resetTime,
  };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  // Use user ID if available, otherwise use IP
  if (userId) {
    return `user:${userId}`;
  }
  
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Upload rate limiter (stricter limits)
 */
async function checkUploadLimit(identifier: string) {
  return checkRateLimit(identifier, 10, 60000, uploadRateLimitStore); // 10 uploads per minute
}

/**
 * API rate limiter (more lenient)
 */
export async function apiLimiter(identifier: string) {
  return checkRateLimit(identifier, 100, 60000, rateLimitStore); // 100 requests per minute
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  );
}

// Export for backward compatibility
export const uploadLimiter = {
  check: checkUploadLimit,
};

/**
 * Simple auth rate limiter (for registration/login)
 */
const simpleAuthRateLimitStore = new Map<string, RateLimitStore>();

async function checkSimpleAuthLimit(identifier: string) {
  return checkRateLimit(identifier, 5, 60000, simpleAuthRateLimitStore); // 5 requests per minute
}

export const simpleAuthLimiter = {
  check: checkSimpleAuthLimit,
};

/**
 * Get client identifier from Request (simpler version)
 */
export function getClientIdentifierSimple(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Simple rate limit response helper
 */
export function rateLimitResponseSimple(resetTime: number): NextResponse {
  return rateLimitResponse(resetTime);
}
