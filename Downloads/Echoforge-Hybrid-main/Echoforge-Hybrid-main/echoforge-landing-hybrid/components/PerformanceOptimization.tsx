"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

// Performance monitoring component
export default function PerformanceOptimization() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Monitor performance
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: loadTime / 1000
      }));

      // Monitor memory if available
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: memoryInfo.usedJSHeapSize / 1048576 // Convert to MB
        }));
      }
    }

    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const rafId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-50 text-xs"
    >
      <div className="font-bold text-white mb-2">⚡ Performance</div>
      <div className="space-y-1 text-white/80">
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {metrics.memory.toFixed(1)} MB</div>
        <div>Load: {metrics.loadTime.toFixed(2)}s</div>
      </div>
    </motion.div>
  );
}

// Custom hooks for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useState(Date.now())[0];

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
}

// Memoization utilities
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
