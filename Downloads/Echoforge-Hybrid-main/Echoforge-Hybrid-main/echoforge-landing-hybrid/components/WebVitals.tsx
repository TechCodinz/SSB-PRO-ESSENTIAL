'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics endpoint
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      // Example: Send to your API
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/web-vitals', body);
      } else {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(console.error);
      }

      // Also log critical metrics
      if (metric.rating === 'poor') {
        console.warn(`[Web Vitals] Poor ${metric.name}:`, metric.value);
      }
    }
  });

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
        const timeToFirstByte = perfData.responseStart - perfData.requestStart;

        console.log('[Performance]', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
          timeToFirstByte: `${timeToFirstByte.toFixed(2)}ms`,
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
