// @ts-nocheck
type AnalyticsPayload = Record<string, unknown> & { event?: string; timestamp?: number };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const trackEvent = (event: string, payload: AnalyticsPayload = {}) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, timestamp: Date.now(), ...payload });
};

export const trackCta = (name: string, meta: AnalyticsPayload = {}) =>
  trackEvent("cta_click", { name, ...meta });

export const trackNavigation = (destination: string, meta: AnalyticsPayload = {}) =>
  trackEvent("nav_click", { destination, ...meta });
