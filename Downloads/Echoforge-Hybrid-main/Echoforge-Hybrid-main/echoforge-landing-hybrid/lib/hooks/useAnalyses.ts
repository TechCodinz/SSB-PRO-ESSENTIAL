// @ts-nocheck
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAnalyses() {
  const { data, isLoading, error, mutate } = useSWR("/api/analyses", fetcher);
  return { analyses: data?.analyses || [], loading: isLoading, error, mutate };
}
