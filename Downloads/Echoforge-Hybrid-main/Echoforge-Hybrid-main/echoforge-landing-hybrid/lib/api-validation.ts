// @ts-nocheck
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { log } from './logger';

/**
 * Common validation schemas for API endpoints
 */

// Analysis request schemas
export const analysisRequestSchema = z.object({
  data: z.array(z.array(z.number())).min(1, 'Data array cannot be empty'),
  models: z.array(z.string()).default(['isolation_forest']).optional(),
  sensitivity: z.number().min(0).max(1).default(0.1).optional(),
  expectedRate: z.number().min(0).max(1).default(0.05).optional(),
  fileName: z.string().optional(),
  analysisType: z.enum(['ANOMALY_DETECTION', 'CRYPTO_FRAUD', 'FORENSICS', 'PREDICTIVE']).default('ANOMALY_DETECTION').optional(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

// File upload schema
export const fileUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB max
  fileType: z.string(),
  data: z.string(), // base64 encoded or URL
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  cursor: z.string().optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;

// User ID schema
export const userIdSchema = z.object({
  userId: z.string().cuid(),
});

// Plan schema
export const planSchema = z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']);

// Role schema
export const roleSchema = z.enum(['READ_ONLY', 'MODERATOR', 'ADMIN', 'OWNER', 'USER', 'EMPLOYEE', 'MANAGER']);

// Marketplace schemas
export const marketplaceListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().default('usd'),
  assetUrl: z.string().url().optional(),
});

export const marketplacePurchaseSchema = z.object({
  listingId: z.string().cuid(),
  provider: z.enum(['stripe', 'flutterwave', 'crypto']),
});

// API Key schemas
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const apiKeyRevokeSchema = z.object({
  keyId: z.string().cuid(),
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Feedback schema
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'issue', 'praise', 'general']),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().min(1).max(5000),
  context: z.record(z.unknown()).optional(),
});

/**
 * Validation middleware helper
 * Validates request body against a Zod schema and returns error response if invalid
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Validation error', { errors: error.errors });
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    log.error('Unexpected validation error', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): { success: true; data: T } | { success: false; error: NextResponse } {
  const params: Record<string, unknown> = {};
  
  // Convert URLSearchParams or Record to plain object
  if (searchParams instanceof URLSearchParams) {
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  } else {
    for (const [key, value] of Object.entries(searchParams)) {
      params[key] = Array.isArray(value) ? value[0] : value;
    }
  }
  
  return validateRequest(schema, params);
}
