// @ts-nocheck
/**
 * Plan-related utility functions
 * Centralized plan feature checks and utilities
 */

import { PLAN_LIMITS, type PlanName } from './usage-limits'
import { PRICING } from '../config/pricing'

/**
 * Check if user can use advanced analytics
 * Available for PRO and ENTERPRISE plans
 */
export function canUseAdvancedAnalytics(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'advanced_analytics')
}

/**
 * Check if user can use API access
 * Available for STARTER, PRO, ENTERPRISE, and PAY_AS_YOU_GO plans
 */
export function canUseAPI(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'api_access')
}

/**
 * Check if user can use crypto fraud detection
 * Available for PRO and ENTERPRISE plans
 */
export function canUseCryptoFraudDetection(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'crypto_fraud')
}

/**
 * Check if user can use deepfake detection
 * Available for PRO and ENTERPRISE plans
 */
export function canUseDeepfakeDetection(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'deepfake_detection')
}

/**
 * Check if user can use custom models
 * Available for PRO and ENTERPRISE plans
 */
export function canUseCustomModels(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'custom_models')
}

/**
 * Check if user can use consensus detection
 * Available for PRO and ENTERPRISE plans
 */
export function canUseConsensusDetection(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'consensus_detection')
}

/**
 * Check if user can use explainable AI
 * Available for PRO and ENTERPRISE plans
 */
export function canUseExplainableAI(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'explainable_ai')
}

/**
 * Check if user can use webhook notifications
 * Available for STARTER, PRO, ENTERPRISE, and PAY_AS_YOU_GO plans
 */
export function canUseWebhooks(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'webhook_notifications')
}

/**
 * Check if user can use batch processing
 * Available for STARTER, PRO, ENTERPRISE, and PAY_AS_YOU_GO plans
 */
export function canUseBatchProcessing(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'batch_processing')
}

/**
 * Check if user can export data
 * Available for STARTER, PRO, ENTERPRISE, and PAY_AS_YOU_GO plans
 */
export function canExport(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'export')
}

/**
 * Check if user has priority support
 * Available for PRO and ENTERPRISE plans
 */
export function hasPrioritySupport(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'priority_support')
}

/**
 * Check if user has dedicated support
 * Available for ENTERPRISE plan only
 */
export function hasDedicatedSupport(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'dedicated_support')
}

/**
 * Check if user can use white label features
 * Available for ENTERPRISE plan only
 */
export function canUseWhiteLabel(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'white_label')
}

/**
 * Check if user can use custom integrations
 * Available for ENTERPRISE plan only
 */
export function canUseCustomIntegrations(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'custom_integrations')
}

/**
 * Check if user can use role management
 * Available for ENTERPRISE plan only
 */
export function canUseRoleManagement(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'role_management')
}

/**
 * Check if user can use audit logs
 * Available for ENTERPRISE plan only
 */
export function canUseAuditLogs(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'audit_logs')
}

/**
 * Check if user can use advanced security features
 * Available for ENTERPRISE plan only
 */
export function canUseAdvancedSecurity(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'advanced_security')
}

/**
 * Check if user can use custom deployment
 * Available for ENTERPRISE plan only
 */
export function canUseCustomDeployment(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'custom_deployment')
}

/**
 * Check if user can use multi-region features
 * Available for ENTERPRISE plan only
 */
export function canUseMultiRegion(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'multi_region')
}

/**
 * Check if user can use dedicated infrastructure
 * Available for ENTERPRISE plan only
 */
export function canUseDedicatedInfrastructure(plan: string): boolean {
  const planName = plan as PlanName
  return hasFeature(planName, 'dedicated_infrastructure')
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: string): string {
  const planName = plan as PlanName
  return PRICING.plans[planName]?.name || 'Unknown'
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: string): number {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.price || 0
}

/**
 * Check if plan has unlimited analyses
 */
export function hasUnlimitedAnalyses(plan: string): boolean {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.analysesPerDay === -1
}

/**
 * Check if plan has unlimited API calls
 */
export function hasUnlimitedAPICalls(plan: string): boolean {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.apiCallsPerMonth === -1
}

/**
 * Get maximum file size for plan
 */
export function getMaxFileSize(plan: string): number {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.maxFileSize || 0
}

/**
 * Get maximum team members for plan
 */
export function getMaxTeamMembers(plan: string): number {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.maxTeamMembers || 1
}

/**
 * Get data retention days for plan
 */
export function getDataRetentionDays(plan: string): number {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.dataRetentionDays || 7
}

/**
 * Get support level for plan
 */
export function getSupportLevel(plan: string): string {
  const planName = plan as PlanName
  return PLAN_LIMITS[planName]?.supportLevel || 'community'
}

/**
 * Check if feature is available for plan
 * Internal helper function
 */
function hasFeature(plan: PlanName, feature: string): boolean {
  return PLAN_LIMITS[plan]?.features.includes(feature as any) || false
}

/**
 * Get all available features for a plan
 */
export function getPlanFeatures(plan: string): string[] {
  const planName = plan as PlanName
  return [...(PLAN_LIMITS[planName]?.features || [])]
}

/**
 * Check if plan is enterprise level
 */
export function isEnterprisePlan(plan: string): boolean {
  return plan === 'ENTERPRISE'
}

/**
 * Check if plan is pro level or higher
 */
export function isProPlanOrHigher(plan: string): boolean {
  return ['PRO', 'ENTERPRISE'].includes(plan)
}

/**
 * Check if plan is starter level or higher
 */
export function isStarterPlanOrHigher(plan: string): boolean {
  return ['STARTER', 'PRO', 'ENTERPRISE', 'PAY_AS_YOU_GO'].includes(plan)
}

/**
 * Get plan tier (0 = FREE, 1 = STARTER, 2 = PRO, 3 = ENTERPRISE, 4 = PAY_AS_YOU_GO)
 */
export function getPlanTier(plan: string): number {
  const tiers: Record<string, number> = {
    'FREE': 0,
    'STARTER': 1,
    'PRO': 2,
    'ENTERPRISE': 3,
    'PAY_AS_YOU_GO': 4
  }
  return tiers[plan] || 0
}

/**
 * Compare two plans (returns 1 if plan1 > plan2, -1 if plan1 < plan2, 0 if equal)
 */
export function comparePlans(plan1: string, plan2: string): number {
  const tier1 = getPlanTier(plan1)
  const tier2 = getPlanTier(plan2)
  return tier1 - tier2
}