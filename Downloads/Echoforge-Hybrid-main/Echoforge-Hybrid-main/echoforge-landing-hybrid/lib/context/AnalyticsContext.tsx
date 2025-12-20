"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface AnalyticsMetrics {
  totalAnalyses: number;
  anomaliesFound: number;
  avgAccuracy: number;
  lastUpdated: Date;
}

interface AnalyticsContextType {
  metrics: AnalyticsMetrics;
  updateMetrics: (update: Partial<AnalyticsMetrics>) => void;
  incrementAnalyses: () => void;
  addAnomalies: (count: number, accuracy: number) => void;
  refreshMetrics: () => Promise<void>;
  isLoading: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalAnalyses: 0,
    anomaliesFound: 0,
    avgAccuracy: 0,
    lastUpdated: new Date(),
  });

  // Load metrics from API
  const refreshMetrics = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          totalAnalyses: data.stats?.totalAnalyses || 0,
          anomaliesFound: data.stats?.totalAnomalies || 0,
          avgAccuracy: data.stats?.avgAccuracy || 0,
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const updateMetrics = (update: Partial<AnalyticsMetrics>) => {
    setMetrics((prev) => ({
      ...prev,
      ...update,
      lastUpdated: new Date(),
    }));
  };

  const incrementAnalyses = () => {
    setMetrics((prev) => ({
      ...prev,
      totalAnalyses: prev.totalAnalyses + 1,
      lastUpdated: new Date(),
    }));
  };

  const addAnomalies = (count: number, accuracy: number) => {
    setMetrics((prev) => {
      const newTotal = prev.totalAnalyses + 1;
      const newAnomalies = prev.anomaliesFound + count;
      const newAvgAccuracy =
        prev.totalAnalyses === 0
          ? accuracy
          : (prev.avgAccuracy * prev.totalAnalyses + accuracy) / newTotal;

      return {
        totalAnalyses: newTotal,
        anomaliesFound: newAnomalies,
        avgAccuracy: Math.round(newAvgAccuracy * 100) / 100,
        lastUpdated: new Date(),
      };
    });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        metrics,
        updateMetrics,
        incrementAnalyses,
        addAnomalies,
        refreshMetrics,
        isLoading,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}
