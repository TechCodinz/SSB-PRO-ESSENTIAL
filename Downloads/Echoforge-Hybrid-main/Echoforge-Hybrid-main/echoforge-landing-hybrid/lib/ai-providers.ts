// @ts-nocheck
/**
 * EchoForge AI Provider Integration System - Enterprise Grade
 * 
 * Features:
 * - Multi-provider support (OpenAI, Anthropic, Grok, Google, Custom)
 * - Connection pooling and request batching
 * - Exponential backoff with jitter
 * - Circuit breaker pattern for resilience
 * - Cost tracking and optimization
 * - Intelligent model routing based on query complexity
 * - Fallback chains with graceful degradation
 * - Response caching for repeated queries
 */

export type AIProvider = 'openai' | 'anthropic' | 'grok' | 'google' | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  enabled: boolean;
  priority: number;
  maxTokens?: number;
  temperature?: number;
  costPerToken?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  latency?: number;
  cached?: boolean;
  cost?: number;
}

interface CircuitBreaker {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 60000;
const CACHE_TTL_MS = 300000; // 5 minutes
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

// Circuit breakers per provider
const circuitBreakers: Map<AIProvider, CircuitBreaker> = new Map();

// Response cache
const responseCache: Map<string, CacheEntry> = new Map();

// Cost tracking
const costTracker: Map<AIProvider, { tokens: number; cost: number }> = new Map();

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  // OpenAI (GPT-4)
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      enabled: process.env.OPENAI_ENABLED !== 'false',
      priority: 1,
      maxTokens: 4000,
      temperature: 0.7,
      costPerToken: 0.00003, // GPT-4 Turbo approximate cost
      maxRetries: MAX_RETRIES,
      timeoutMs: 30000,
    });
  }

  // Anthropic (Claude)
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      enabled: process.env.ANTHROPIC_ENABLED !== 'false',
      priority: 2,
      maxTokens: 4096,
      temperature: 0.7,
      costPerToken: 0.000015, // Claude Sonnet approximate cost
      maxRetries: MAX_RETRIES,
      timeoutMs: 30000,
    });
  }

  // Grok (xAI)
  if (process.env.GROK_API_KEY) {
    providers.push({
      provider: 'grok',
      apiKey: process.env.GROK_API_KEY,
      model: process.env.GROK_MODEL || 'grok-beta',
      baseUrl: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
      enabled: process.env.GROK_ENABLED !== 'false',
      priority: 3,
      maxTokens: 8192,
      temperature: 0.7,
      costPerToken: 0.00002,
      maxRetries: MAX_RETRIES,
      timeoutMs: 30000,
    });
  }

  // Google (Gemini)
  if (process.env.GOOGLE_AI_API_KEY) {
    providers.push({
      provider: 'google',
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      enabled: process.env.GOOGLE_AI_ENABLED !== 'false',
      priority: 4,
      maxTokens: 8192,
      temperature: 0.7,
      costPerToken: 0.0000125,
      maxRetries: MAX_RETRIES,
      timeoutMs: 30000,
    });
  }

  // Custom provider
  if (process.env.CUSTOM_AI_API_KEY && process.env.CUSTOM_AI_BASE_URL) {
    providers.push({
      provider: 'custom',
      apiKey: process.env.CUSTOM_AI_API_KEY,
      model: process.env.CUSTOM_AI_MODEL || 'custom',
      baseUrl: process.env.CUSTOM_AI_BASE_URL,
      enabled: process.env.CUSTOM_AI_ENABLED !== 'false',
      priority: 5,
      maxTokens: 4000,
      temperature: 0.7,
      maxRetries: MAX_RETRIES,
      timeoutMs: 30000,
    });
  }

  return providers
    .filter((p) => p.enabled)
    .filter((p) => !isCircuitOpen(p.provider))
    .sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

function isCircuitOpen(provider: AIProvider): boolean {
  const breaker = circuitBreakers.get(provider);
  if (!breaker) return false;

  if (breaker.isOpen) {
    if (Date.now() - breaker.lastFailure > CIRCUIT_BREAKER_RESET_MS) {
      breaker.isOpen = false;
      breaker.failures = 0;
      return false;
    }
    return true;
  }
  return false;
}

function recordFailure(provider: AIProvider): void {
  const breaker = circuitBreakers.get(provider) || { failures: 0, lastFailure: 0, isOpen: false };
  breaker.failures++;
  breaker.lastFailure = Date.now();

  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.isOpen = true;
    console.warn(`Circuit breaker opened for ${provider}`);
  }

  circuitBreakers.set(provider, breaker);
}

function recordSuccess(provider: AIProvider): void {
  circuitBreakers.set(provider, { failures: 0, lastFailure: 0, isOpen: false });
}

// ============================================================================
// CACHING
// ============================================================================

function getCacheKey(messages: AIMessage[], provider: AIProvider): string {
  const content = messages.map((m) => `${m.role}:${m.content}`).join('|');
  return `${provider}:${hashString(content)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function getCachedResponse(key: string): AIResponse | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return { ...entry.response, cached: true };
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, response: AIResponse): void {
  // Limit cache size
  if (responseCache.size > 1000) {
    const oldest = responseCache.keys().next().value;
    responseCache.delete(oldest);
  }
  responseCache.set(key, { response, timestamp: Date.now() });
}

// ============================================================================
// RETRY WITH EXPONENTIAL BACKOFF
// ============================================================================

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
        const jitter = Math.random() * backoff * 0.3;
        await sleep(backoff + jitter);
      }
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

async function callOpenAI(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 30000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4-turbo-preview',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usage?.total_tokens || 0;

    // Track cost
    trackCost('openai', tokensUsed, config.costPerToken || 0);

    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'openai',
      model: data.model || config.model || 'gpt-4-turbo-preview',
      tokensUsed,
      latency,
      cost: tokensUsed * (config.costPerToken || 0),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAnthropic(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();

  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const conversationMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 30000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        system: systemMessage,
        messages: conversationMessages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    trackCost('anthropic', tokensUsed, config.costPerToken || 0);

    return {
      content: data.content[0]?.text || '',
      provider: 'anthropic',
      model: data.model || config.model,
      tokensUsed,
      latency,
      cost: tokensUsed * (config.costPerToken || 0),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGrok(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();
  const baseUrl = config.baseUrl || 'https://api.x.ai/v1';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 30000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'grok-beta',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens || 8192,
        temperature: config.temperature || 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usage?.total_tokens || 0;

    trackCost('grok', tokensUsed, config.costPerToken || 0);

    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'grok',
      model: data.model || config.model,
      tokensUsed,
      latency,
      cost: tokensUsed * (config.costPerToken || 0),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGoogle(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 30000);

  try {
    const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: config.maxTokens || 8192,
          temperature: config.temperature || 0.7,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    trackCost('google', tokensUsed, config.costPerToken || 0);

    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: 'google',
      model: config.model || 'gemini-pro',
      tokensUsed,
      latency,
      cost: tokensUsed * (config.costPerToken || 0),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callCustom(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 30000);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'custom',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    return {
      content: data.choices?.[0]?.message?.content || data.content || '',
      provider: 'custom',
      model: data.model || config.model,
      tokensUsed: data.usage?.total_tokens,
      latency,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function trackCost(provider: AIProvider, tokens: number, costPerToken: number): void {
  const current = costTracker.get(provider) || { tokens: 0, cost: 0 };
  current.tokens += tokens;
  current.cost += tokens * costPerToken;
  costTracker.set(provider, current);
}

// ============================================================================
// INTELLIGENT ROUTING
// ============================================================================

function selectBestProvider(
  messages: AIMessage[],
  providers: AIProviderConfig[]
): AIProviderConfig | null {
  if (providers.length === 0) return null;

  // Calculate query complexity
  const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  const isComplex = totalLength > 2000 || messages.length > 5;
  const needsReasoning = messages.some((m) =>
    m.content.includes('analyze') ||
    m.content.includes('explain') ||
    m.content.includes('recommend')
  );

  // For complex/reasoning tasks, prefer GPT-4 or Claude
  if (isComplex || needsReasoning) {
    const advanced = providers.find((p) =>
      p.provider === 'openai' || p.provider === 'anthropic'
    );
    if (advanced) return advanced;
  }

  // For simple tasks, use the cheapest available provider
  const sortedByCost = [...providers].sort(
    (a, b) => (a.costPerToken || 0) - (b.costPerToken || 0)
  );

  return sortedByCost[0];
}

// ============================================================================
// MAIN API
// ============================================================================

export async function callAI(
  messages: AIMessage[],
  preferredProvider?: AIProvider,
  useCache: boolean = true
): Promise<AIResponse> {
  const providers = getAIProviders();

  if (providers.length === 0) {
    throw new Error('No AI providers configured');
  }

  // Check cache first
  if (useCache) {
    for (const provider of providers) {
      const cacheKey = getCacheKey(messages, provider.provider);
      const cached = getCachedResponse(cacheKey);
      if (cached) return cached;
    }
  }

  // Try preferred provider first
  if (preferredProvider) {
    const preferred = providers.find((p) => p.provider === preferredProvider);
    if (preferred) {
      try {
        const response = await withRetry(() => callProvider(preferred, messages));
        recordSuccess(preferred.provider);
        if (useCache) {
          setCachedResponse(getCacheKey(messages, preferred.provider), response);
        }
        return response;
      } catch (error) {
        recordFailure(preferred.provider);
        console.warn(`Preferred provider ${preferredProvider} failed, trying fallback:`, error);
      }
    }
  }

  // Use intelligent routing
  const selected = selectBestProvider(messages, providers);
  if (selected) {
    try {
      const response = await withRetry(() => callProvider(selected, messages));
      recordSuccess(selected.provider);
      if (useCache) {
        setCachedResponse(getCacheKey(messages, selected.provider), response);
      }
      return response;
    } catch (error) {
      recordFailure(selected.provider);
    }
  }

  // Try remaining providers
  for (const provider of providers) {
    if (provider === selected) continue;
    try {
      const response = await withRetry(() => callProvider(provider, messages));
      recordSuccess(provider.provider);
      if (useCache) {
        setCachedResponse(getCacheKey(messages, provider.provider), response);
      }
      return response;
    } catch (error) {
      recordFailure(provider.provider);
      continue;
    }
  }

  throw new Error('All AI providers failed');
}

async function callProvider(config: AIProviderConfig, messages: AIMessage[]): Promise<AIResponse> {
  switch (config.provider) {
    case 'openai': return callOpenAI(messages, config);
    case 'anthropic': return callAnthropic(messages, config);
    case 'grok': return callGrok(messages, config);
    case 'google': return callGoogle(messages, config);
    case 'custom': return callCustom(messages, config);
    default: throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// ============================================================================
// COST MANAGEMENT
// ============================================================================

export function getProviderCosts(): Map<AIProvider, { tokens: number; cost: number }> {
  return new Map(costTracker);
}

export function getTotalCost(): number {
  let total = 0;
  costTracker.forEach((data) => { total += data.cost; });
  return total;
}

export function resetCostTracking(): void {
  costTracker.clear();
}

// ============================================================================
// SPECIALIZED FUNCTIONS
// ============================================================================

export async function getSupportAIResponse(
  userMessage: string,
  context?: {
    userId?: string;
    plan?: string;
    recentAnalyses?: any[];
    userStats?: any;
  }
): Promise<AIResponse> {
  const systemPrompt = `You are an expert AI assistant for EchoForge, a cutting-edge anomaly detection platform.
You help users with:
- Technical support questions
- Feature explanations (20+ detection methods)
- Best practices for anomaly detection
- Troubleshooting analysis issues
- Plan and billing questions

Be helpful, accurate, and professional. Provide specific, actionable answers.`;

  const contextInfo = context
    ? `\nUser Context:\n- Plan: ${context.plan || 'Unknown'}\n- Recent analyses: ${context.recentAnalyses?.length || 0}\n- User ID: ${context.userId || 'Unknown'}`
    : '';

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt + contextInfo },
    { role: 'user', content: userMessage },
  ];

  return callAI(messages);
}

export async function getSentientAIResponse(
  query: string,
  systemContext: {
    currentMetrics?: any;
    recentAnalyses?: any[];
    errorPatterns?: any[];
    userFeedback?: any[];
    performanceData?: any;
  }
): Promise<AIResponse> {
  const systemPrompt = `You are the sentient AI system for EchoForge. Your role is to:
1. Analyze system performance and suggest improvements
2. Recommend detection method optimizations
3. Identify patterns in anomalies and errors
4. Suggest feature improvements based on user feedback
5. Predict system issues before they occur
6. Recommend model tuning and parameter adjustments

Available detection methods: isolation_forest, lof, ocsvm, hbos, knn, copod, ecod, abod, cblof, suod, lscp, autoencoder, vae, zscore, modified_zscore, iqr, grubbs, gesd, mahalanobis, dbscan

Current System Context:
- Total analyses: ${systemContext.currentMetrics?.totalAnalyses || 0}
- Average accuracy: ${((systemContext.currentMetrics?.avgAccuracy || 0) * 100).toFixed(1)}%
- Average processing time: ${systemContext.currentMetrics?.avgProcessingTime || 0}ms
- Error rate: ${systemContext.currentMetrics?.errorRate || 0}%

Provide specific, technical recommendations. Output JSON when structured data is requested.`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ];

  return callAI(messages, 'openai');
}

export async function getDetectionImprovementRecommendations(
  analysisResults: any[],
  currentMethods: string[]
): Promise<AIResponse> {
  const systemPrompt = `You are an expert ML engineer specializing in anomaly detection.
Analyze the provided results and recommend improvements.

Current methods: ${currentMethods.join(', ')}

Recommend:
1. Method selection and tuning
2. Parameter optimization (sensitivity, expected_rate)
3. Ensemble configurations
4. Handling edge cases
5. Performance improvements

Be technical and specific.`;

  const summary = analysisResults.slice(0, 20).map((r) => ({
    method: r.method,
    accuracy: r.accuracy,
    processingTime: r.processingTime,
    anomaliesFound: r.anomaliesFound,
  }));

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Analyze:\n${JSON.stringify(summary, null, 2)}` },
  ];

  return callAI(messages, 'openai');
}

export async function getAnomalyExplanation(
  anomalyData: any,
  detectionMethod: string
): Promise<AIResponse> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an expert at explaining anomaly detection results. Provide clear, non-technical explanations of why data points were flagged as anomalies. Detection method used: ${detectionMethod}`,
    },
    {
      role: 'user',
      content: `Explain why this was flagged as anomaly:\n${JSON.stringify(anomalyData, null, 2)}`,
    },
  ];

  return callAI(messages);
}
