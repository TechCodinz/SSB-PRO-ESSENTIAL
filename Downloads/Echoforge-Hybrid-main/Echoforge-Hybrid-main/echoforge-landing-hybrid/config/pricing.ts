/**
 * CENTRALIZED PRICING CONFIGURATION
 * 
 * ⚠️ CHANGE PRICES HERE - UPDATES EVERYWHERE AUTOMATICALLY!
 * 
 * Last Updated: 2025-01-20
 * Updated By: Peters Princewill
 */

export const PRICING = {
  // Monthly subscription plans
  plans: {
    FREE: {
      id: 'FREE',
      name: 'Free',
      price: 0,
      annual: 0,
      stripePriceId: null,
      // Features
      analysesPerDay: 3,
      analysesPerMonth: 90,
      apiCallsPerMonth: 0,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxTeamMembers: 1,
      dataRetentionDays: 7,
      supportLevel: 'community',
      features: [
        'basic_detection'
      ]
    },
    
    STARTER: {
      id: 'STARTER',
      name: 'Starter',
      price: 39,           // ← CHANGE HERE TO UPDATE EVERYWHERE
      annual: 390,         // ← Usually 10% discount (10 months price)
      stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
      // Features
      analysesPerDay: 50,
      analysesPerMonth: 1500,
      apiCallsPerMonth: 10000,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxTeamMembers: 3,
      dataRetentionDays: 30,
      supportLevel: 'email',
      features: [
        'basic_detection',
        'advanced_detection',
        'api_access',
        'export',
        'email_support',
        'batch_processing'
      ],
      popular: true
    },
    
    PRO: {
      id: 'PRO',
      name: 'Pro',
      price: 129,          // ← CHANGE HERE TO UPDATE EVERYWHERE
      annual: 1290,        // ← 10 months price
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
      // Features
      analysesPerDay: -1, // Unlimited
      analysesPerMonth: -1, // Unlimited
      apiCallsPerMonth: 100000,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxTeamMembers: 10,
      dataRetentionDays: 365,
      supportLevel: 'priority',
      features: [
        'basic_detection',
        'advanced_detection',
        'crypto_fraud',
        'deepfake_detection',
        'api_access',
        'export',
        'custom_models',
        'priority_support',
        'batch_processing',
        'webhook_notifications',
        'advanced_analytics',
        'consensus_detection',
        'explainable_ai'
      ]
    },
    
    ENTERPRISE: {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 1499,         // ← CHANGE HERE TO UPDATE EVERYWHERE
      annual: 14990,       // ← 10 months price
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
      // Features
      analysesPerDay: -1, // Unlimited
      analysesPerMonth: -1, // Unlimited
      apiCallsPerMonth: -1, // Unlimited
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      maxTeamMembers: -1, // Unlimited
      dataRetentionDays: -1, // Unlimited
      supportLevel: 'dedicated',
      features: [
        'everything_in_pro',
        'role_management',
        'audit_logs',
        'white_label',
        'custom_integrations',
        'dedicated_support',
        'sla',
        'advanced_security',
        'custom_deployment',
        'training_onboarding',
        'multi_region',
        'dedicated_infrastructure'
      ]
    },
    
    PAY_AS_YOU_GO: {
      id: 'PAY_AS_YOU_GO',
      name: 'Pay As You Go',
      price: 0,
      // Per-usage pricing
      pricePerAnalysis: 0.50,    // ← $0.50 per analysis
      pricePerApiCall: 0.01,     // ← $0.01 per API call
      pricePerGBStorage: 0.10,   // ← $0.10 per GB/month
      // Features
      analysesPerDay: -1,
      analysesPerMonth: -1,
      apiCallsPerMonth: -1,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxTeamMembers: 5,
      dataRetentionDays: 90,
      supportLevel: 'email',
      features: [
        'basic_detection',
        'advanced_detection',
        'api_access',
        'export',
        'email_support',
        'batch_processing',
        'webhook_notifications'
      ]
    }
  },
  
  // Add-ons (for future expansion)
  addons: {
    EXTRA_TEAM_MEMBER: {
      name: 'Additional Team Member',
      price: 10,  // ← $10/month per extra member
      perMonth: true
    },
    EXTRA_API_CALLS: {
      name: 'Extra 10K API Calls',
      price: 20,  // ← $20 for 10K extra calls
      perMonth: true,
      quantity: 10000
    },
    EXTRA_STORAGE: {
      name: 'Extra 10GB Storage',
      price: 5,   // ← $5/month per 10GB
      perMonth: true,
      quantity: 10 * 1024 * 1024 * 1024 // 10GB
    },
    PRIORITY_ONBOARDING: {
      name: 'Priority Onboarding & Training',
      price: 500, // ← One-time fee
      perMonth: false
    },
    CUSTOM_INTEGRATION: {
      name: 'Custom Integration Setup',
      price: 1000, // ← One-time fee
      perMonth: false
    }
  },
  
  // Discount codes (for marketing campaigns)
  discounts: {
    LAUNCH50: {
      code: 'LAUNCH50',
      percentage: 50,
      validUntil: '2025-02-28',
      description: 'Launch Special - 50% off first month'
    },
    ANNUAL20: {
      code: 'ANNUAL20',
      percentage: 20,
      validFor: 'annual',
      description: 'Annual Billing - 20% off'
    }
  }
}

/**
 * Get plan by ID
 */
export function getPlan(planId: keyof typeof PRICING.plans) {
  return PRICING.plans[planId]
}

/**
 * Calculate price with discount
 */
export function calculatePrice(
  planId: keyof typeof PRICING.plans,
  billing: 'monthly' | 'annual' = 'monthly',
  discountCode?: string
): number {
  const plan = PRICING.plans[planId]
  const annual = 'annual' in plan ? plan.annual : plan.price * 12
  let price = billing === 'annual' ? annual : plan.price
  
  // Apply discount if valid
  if (discountCode && PRICING.discounts[discountCode as keyof typeof PRICING.discounts]) {
    const discount = PRICING.discounts[discountCode as keyof typeof PRICING.discounts]
    price = price * (1 - discount.percentage / 100)
  }
  
  return price
}

/**
 * Get all plans for pricing page
 */
export function getAllPlans() {
  return Object.values(PRICING.plans)
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) return 'Free'
  if (price === -1) return 'Unlimited'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

export default PRICING
