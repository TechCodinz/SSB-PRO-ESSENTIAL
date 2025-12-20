/**
 * Pay As You Go Pricing System
 * Enterprise-level precision using micro-tokens (6 decimal places)
 * 
 * 1 TOKEN = 1,000,000 MICRO-TOKENS
 * This allows for precise pricing down to $0.000001 per operation
 */

// Micro-token precision (6 decimal places)
export const MICRO_TOKEN_PRECISION = 1_000_000n;

/**
 * Per-Operation Token Costs (in micro-tokens)
 * Designed for cost-effective pay-per-use
 */
export const TOKEN_COSTS = {
  // Analysis operations
  ANALYSIS_SMALL: 100_000n,      // 0.1 tokens - Up to 1,000 rows
  ANALYSIS_MEDIUM: 500_000n,     // 0.5 tokens - Up to 10,000 rows
  ANALYSIS_LARGE: 2_000_000n,    // 2.0 tokens - Up to 100,000 rows
  ANALYSIS_XLARGE: 10_000_000n,  // 10.0 tokens - 100,000+ rows
  
  // API operations
  API_CALL: 50_000n,             // 0.05 tokens per API call
  
  // Advanced features
  CRYPTO_FRAUD_SCAN: 1_000_000n, // 1.0 token per scan
  FORENSIC_ANALYSIS: 5_000_000n, // 5.0 tokens per forensic analysis
  PREDICTIVE_MODEL: 3_000_000n,  // 3.0 tokens per predictive model run
  
  // Storage & retention
  STORAGE_GB_MONTH: 100_000n,    // 0.1 tokens per GB per month
} as const;

/**
 * Token Purchase Packages (in USD)
 * Better value for larger purchases
 */
export const TOKEN_PACKAGES = {
  STARTER_10: {
    tokens: 10n * MICRO_TOKEN_PRECISION,
    priceUSD: 5,
    perTokenCost: 0.50,
    savingsPercent: 0,
  },
  VALUE_50: {
    tokens: 50n * MICRO_TOKEN_PRECISION,
    priceUSD: 20,
    perTokenCost: 0.40,
    savingsPercent: 20,
  },
  POPULAR_200: {
    tokens: 200n * MICRO_TOKEN_PRECISION,
    priceUSD: 70,
    perTokenCost: 0.35,
    savingsPercent: 30,
  },
  PREMIUM_500: {
    tokens: 500n * MICRO_TOKEN_PRECISION,
    priceUSD: 150,
    perTokenCost: 0.30,
    savingsPercent: 40,
  },
  ENTERPRISE_2000: {
    tokens: 2000n * MICRO_TOKEN_PRECISION,
    priceUSD: 500,
    perTokenCost: 0.25,
    savingsPercent: 50,
  },
} as const;

/**
 * Calculate analysis cost based on data size
 */
export function calculateAnalysisCost(dataPoints: number): bigint {
  if (dataPoints <= 1000) return TOKEN_COSTS.ANALYSIS_SMALL;
  if (dataPoints <= 10000) return TOKEN_COSTS.ANALYSIS_MEDIUM;
  if (dataPoints <= 100000) return TOKEN_COSTS.ANALYSIS_LARGE;
  return TOKEN_COSTS.ANALYSIS_XLARGE;
}

/**
 * Convert tokens to micro-tokens
 */
export function tokensToMicro(tokens: number): bigint {
  return BigInt(Math.floor(tokens * Number(MICRO_TOKEN_PRECISION)));
}

/**
 * Convert micro-tokens to tokens (with precision)
 */
export function microToTokens(microTokens: bigint): number {
  return Number(microTokens) / Number(MICRO_TOKEN_PRECISION);
}

/**
 * Format tokens for display (e.g., "1,234.567890 tokens")
 */
export function formatTokens(microTokens: bigint): string {
  const tokens = microToTokens(microTokens);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(tokens);
}

/**
 * Check if user has sufficient balance
 */
export function hasSufficientBalance(
  userBalanceMicro: bigint,
  requiredMicro: bigint
): boolean {
  return userBalanceMicro >= requiredMicro;
}

/**
 * Calculate cost in USD for a given number of tokens
 */
export function calculateUSDCost(microTokens: bigint): number {
  const tokens = microToTokens(microTokens);
  // Base rate: $0.50 per token (can be adjusted)
  const BASE_RATE = 0.50;
  return tokens * BASE_RATE;
}

/**
 * Estimate monthly cost for a given usage pattern
 */
export function estimateMonthlyCost(params: {
  analysesPerDay: number;
  avgDataPoints: number;
  apiCallsPerDay: number;
}): {
  totalTokensMicro: bigint;
  totalUSD: number;
  breakdown: {
    analyses: { tokens: bigint; usd: number };
    apiCalls: { tokens: bigint; usd: number };
  };
} {
  const daysInMonth = 30;
  
  // Analysis costs
  const costPerAnalysis = calculateAnalysisCost(params.avgDataPoints);
  const analysisTokens = costPerAnalysis * BigInt(params.analysesPerDay * daysInMonth);
  
  // API call costs
  const apiTokens = TOKEN_COSTS.API_CALL * BigInt(params.apiCallsPerDay * daysInMonth);
  
  // Total
  const totalTokensMicro = analysisTokens + apiTokens;
  const totalUSD = calculateUSDCost(totalTokensMicro);
  
  return {
    totalTokensMicro,
    totalUSD,
    breakdown: {
      analyses: {
        tokens: analysisTokens,
        usd: calculateUSDCost(analysisTokens),
      },
      apiCalls: {
        tokens: apiTokens,
        usd: calculateUSDCost(apiTokens),
      },
    },
  };
}
