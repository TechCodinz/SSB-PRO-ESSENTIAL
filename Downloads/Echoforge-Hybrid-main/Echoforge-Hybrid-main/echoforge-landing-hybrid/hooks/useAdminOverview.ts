import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
};

export function useAdminOverview() {
  return useSWR("/api/admin/dashboard/overview", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });
}
