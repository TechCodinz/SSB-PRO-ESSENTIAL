// @ts-nocheck
const DEFAULT_AUTH_SECRET = "dev-nextauth-secret-change-me-please-32chars";

/**
 * Get authentication secret for NextAuth
 * In production, NEXTAUTH_SECRET must be set as an environment variable
 * @throws Error if NEXTAUTH_SECRET is not set in production
 */
export const AUTH_SECRET = (() => {
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXTAUTH_SECRET must be set in production. ' +
        'Generate a secure secret with: openssl rand -base64 32'
      );
    }
    // Development fallback
    console.warn('⚠️  Using default auth secret. Set NEXTAUTH_SECRET in production!');
    return DEFAULT_AUTH_SECRET;
  }
  
  // Validate secret length (should be at least 32 characters)
  if (secret.length < 32) {
    throw new Error(
      'NEXTAUTH_SECRET must be at least 32 characters long. ' +
      'Generate a secure secret with: openssl rand -base64 32'
    );
  }
  
  return secret;
})();

export const getAuthSecret = () => AUTH_SECRET;
