// @ts-nocheck
import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required and optional environment variables
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Configuration
  ECHOFORGE_API_URL: z.string().url().optional(),
  ML_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_ECHOFORGE_API_URL: z.string().url().optional(),
  ECHOFORGE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ECHOFORGE_API_KEY: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  STRIPE_STARTER_PRICE_ID: z.string().startsWith('price_').optional(),
  STRIPE_PRO_PRICE_ID: z.string().startsWith('price_').optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().startsWith('price_').optional(),
  
  // Crypto Payments
  USDT_TRC20_WALLET: z.string().optional(),
  USDT_ERC20_WALLET: z.string().startsWith('0x').optional(),
  USDT_BEP20_WALLET: z.string().startsWith('0x').optional(),
  
  // Flutterwave
  FLW_SECRET_KEY: z.string().optional(),
  FLW_PUBLIC_KEY: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM: z.string().email().optional(),
  
  // Default Accounts (optional, but validated if provided)
  DEFAULT_ADMIN_EMAIL: z.string().email().optional(),
  DEFAULT_ADMIN_PASSWORD: z.string().min(12, 'Password must be at least 12 characters').optional(),
  DEFAULT_ADMIN_NAME: z.string().optional(),
  DEFAULT_DEMO_EMAIL: z.string().email().optional(),
  DEFAULT_DEMO_PASSWORD: z.string().min(12, 'Password must be at least 12 characters').optional(),
  DEFAULT_DEMO_NAME: z.string().optional(),
  
  // Security
  ENFORCE_ADMIN_MFA: z.string().transform(val => val === 'true').optional(),
  ENABLE_MFA_PLACEHOLDER: z.string().transform(val => val !== 'false').optional(),
  
  // SSO Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_TENANT_ID: z.string().optional(),
  
  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_ENABLED: z.string().transform(val => val !== 'false').optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  ANTHROPIC_ENABLED: z.string().transform(val => val !== 'false').optional(),
  GROK_API_KEY: z.string().optional(),
  GROK_MODEL: z.string().optional(),
  GROK_BASE_URL: z.string().url().optional(),
  GROK_ENABLED: z.string().transform(val => val !== 'false').optional(),
  CUSTOM_AI_API_KEY: z.string().optional(),
  CUSTOM_AI_BASE_URL: z.string().url().optional(),
  CUSTOM_AI_MODEL: z.string().optional(),
  CUSTOM_AI_ENABLED: z.string().transform(val => val !== 'false').optional(),
  
  // Metrics
  METRICS_ENABLED: z.string().transform(val => val === 'true').optional(),
  METRICS_DEBUG: z.string().transform(val => val === 'true').optional(),
  METRICS_PUSH_URL: z.string().url().optional(),
  METRICS_API_KEY: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws error if required variables are missing or invalid
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\n` +
        'Please check your .env file and ensure all required variables are set correctly.'
      );
    }
    throw error;
  }
}

// Validate on module load (only in production or when explicitly enabled)
const shouldValidate = process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true';

let validatedEnv: Env | null = null;

if (shouldValidate) {
  try {
    validatedEnv = validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail fast in production
    }
  }
}

/**
 * Get validated environment variable
 * Returns validated env or falls back to process.env if validation is disabled
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }
  // In development, return a partial validation
  return process.env as unknown as Env;
}

/**
 * Type-safe environment variable accessor
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    const value = process.env[prop];
    if (shouldValidate && validatedEnv) {
      return validatedEnv[prop as keyof Env];
    }
    return value;
  },
});

// Export type for use in other files
export type { Env };
