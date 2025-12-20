// @ts-nocheck
import { z } from "zod";

type EnvConfig = {
  apiBaseUrl: string;
  apiKey?: string;
  isDefaultApi: boolean;
};

const fallbackApi = "https://api.echoforge.com";
const rawApi = (process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || process.env.ECHOFORGE_API_URL || "").trim();
const normalisedApi = rawApi.replace(/\/$/, "");

export const env: EnvConfig = {
  apiBaseUrl: normalisedApi || fallbackApi,
  apiKey: process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY,
  isDefaultApi: !normalisedApi,
};

export const getApiUrl = (path = "") => {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${normalisedPath}`;
};

/**
 * Environment Variable Validation for Production
 * Ensures all required env vars are set before deployment
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Stripe (Optional but recommended for payments)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // USDT Wallets (Optional but needed for crypto payments)
  USDT_TRC20_WALLET: z.string().optional(),
  USDT_ERC20_WALLET: z.string().optional(),
  USDT_BEP20_WALLET: z.string().optional(),
  
  // ML API (Optional - uses fallback if not set)
  ECHOFORGE_API_URL: z.string().url().optional(),
  ECHOFORGE_API_KEY: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * Call this at build time to ensure all required vars are set
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      
      // In development, show helpful message
      if (process.env.NODE_ENV === 'development') {
        console.log('\n💡 Create a .env.local file with required variables:')
        console.log('   Copy from .env.example and fill in your values')
      }
      
      throw new Error('Invalid environment variables')
    }
    throw error
  }
}

/**
 * Get validated environment variables
 * Safe to use throughout the app
 */
export function getEnv(): Partial<Env> {
  // In production, validate strictly
  if (process.env.NODE_ENV === 'production') {
    return validateEnv()
  }
  
  // In development, allow missing optional vars
  return process.env as Partial<Env>
}

/**
 * Check if production requirements are met
 */
export function checkProductionReadiness(): {
  ready: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Critical for production
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!process.env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  if (!process.env.NEXTAUTH_URL) missing.push('NEXTAUTH_URL')
  
  // Recommended for full functionality
  if (!process.env.STRIPE_SECRET_KEY) {
    warnings.push('STRIPE_SECRET_KEY not set - credit card payments will not work')
  }
  if (!process.env.USDT_TRC20_WALLET) {
    warnings.push('USDT wallets not set - crypto payments will show example addresses')
  }
  if (!process.env.ECHOFORGE_API_URL) {
    warnings.push('ECHOFORGE_API_URL not set - ML detection will use simulated results')
  }
  
  return {
    ready: missing.length === 0,
    missing,
    warnings
  }
}
