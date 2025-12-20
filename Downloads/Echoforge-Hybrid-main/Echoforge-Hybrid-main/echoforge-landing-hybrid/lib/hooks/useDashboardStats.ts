// @ts-nocheck
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDashboardStats() {
  const { data, isLoading, error } = useSWR("/api/user/stats", fetcher);
  return { stats: data, loading: isLoading, error };
}
