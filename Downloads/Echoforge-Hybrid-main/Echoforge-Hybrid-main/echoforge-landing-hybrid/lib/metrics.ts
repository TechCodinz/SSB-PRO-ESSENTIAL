// @ts-nocheck
type MetricLabels = Record<string, string | number | boolean | null | undefined>;

const counters = new Map<string, number>();
const histograms = new Map<string, number[]>();

const METRICS_ENABLED = process.env.METRICS_ENABLED !== "false";
const METRICS_DEBUG = process.env.METRICS_DEBUG === "true";

function serializeLabels(labels?: MetricLabels): string {
  if (!labels) return "";
  const normalized = Object.entries(labels)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .sort()
    .join(",");
  return normalized ? `{${normalized}}` : "";
}

function stashCounterSample(name: string, value: number, labels?: MetricLabels) {
  const key = `${name}${serializeLabels(labels)}`;
  counters.set(key, (counters.get(key) ?? 0) + value);
}

function stashHistogramSample(name: string, value: number, labels?: MetricLabels) {
  const key = `${name}${serializeLabels(labels)}`;
  const existing = histograms.get(key) ?? [];
  existing.push(value);
  histograms.set(key, existing);
}

function debugLog(message: string, details?: unknown) {
  if (!METRICS_DEBUG) return;
  const payload = details ? { details } : undefined;
  console.info(`[metrics] ${message}`, payload);
}

export function incrementCounter(
  name: string,
  value = 1,
  labels?: MetricLabels,
) {
  if (!METRICS_ENABLED) return;
  stashCounterSample(name, value, labels);
  debugLog(`counter incremented: ${name}`, { value, labels });
}

export function observeDuration(
  name: string,
  milliseconds: number,
  labels?: MetricLabels,
) {
  if (!METRICS_ENABLED) return;
  stashHistogramSample(name, milliseconds, labels);
  debugLog(`histogram observed: ${name}`, { milliseconds, labels });
}

export function gaugeSet(name: string, value: number, labels?: MetricLabels) {
  if (!METRICS_ENABLED) return;
  // Gauges overwrite existing value.
  const key = `${name}${serializeLabels(labels)}`;
  counters.set(key, value);
  debugLog(`gauge set: ${name}`, { value, labels });
}

export function resetMetrics() {
  counters.clear();
  histograms.clear();
}

export function getMetricsSnapshot(): string {
  const lines: string[] = [];

  for (const [key, value] of counters.entries()) {
    lines.push(`# TYPE ${key.split("{")[0]} counter`);
    lines.push(`${key} ${value}`);
  }

  for (const [key, values] of histograms.entries()) {
    const count = values.length;
    const sum = values.reduce((acc, item) => acc + item, 0);
    lines.push(`# TYPE ${key.split("{")[0]} histogram`);
    lines.push(`${key}_count ${count}`);
    lines.push(`${key}_sum ${sum}`);
  }

  return lines.join("\n");
}

export function metricsEnabled() {
  return METRICS_ENABLED;
}
