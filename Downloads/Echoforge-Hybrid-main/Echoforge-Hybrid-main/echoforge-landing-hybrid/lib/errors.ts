// @ts-nocheck
import { NextResponse } from 'next/server';
import { log } from './logger';

/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_REQUIRED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, 'INTERNAL_ERROR', details);
  }
}

/**
 * Error handler middleware
 * Converts errors to appropriate HTTP responses
 */
export function handleError(error: unknown): NextResponse {
  // Handle known AppError instances
  if (error instanceof AppError) {
    log.error(`[${error.code || 'ERROR'}] ${error.message}`, error, {
      statusCode: error.statusCode,
      details: error.details,
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    log.warn('Validation error', { error });
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: (error as { issues: unknown[] }).issues,
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    log.error('Unhandled error', error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        error: isDevelopment ? error.message : 'An unexpected error occurred',
        ...(isDevelopment && { stack: error.stack }),
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  log.error('Unknown error type', error);
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API routes
 * Catches errors and converts them to HTTP responses
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Try-catch wrapper that returns error instead of throwing
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: Error }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
