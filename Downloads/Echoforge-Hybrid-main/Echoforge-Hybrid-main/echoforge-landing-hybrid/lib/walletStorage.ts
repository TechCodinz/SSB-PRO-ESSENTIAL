// @ts-nocheck
const STORAGE_KEY = "echoforge.admin.wallets";

type Currency = "USDT" | "USDC" | "BTC" | "ETH";

export type StoredWallet = {
  id: string;
  currency: Currency;
  network: string;
  address: string;
  label?: string;
  balanceUsd?: number;
  isPrimary?: boolean;
};

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const isStoredWallet = (candidate: unknown): candidate is StoredWallet => {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const wallet = candidate as Record<string, unknown>;
  return (
    typeof wallet.id === "string" &&
    typeof wallet.currency === "string" &&
    typeof wallet.network === "string" &&
    typeof wallet.address === "string"
  );
};

const normalizeWallet = (wallet: StoredWallet): StoredWallet => ({
  ...wallet,
  address: wallet.address.trim(),
  label: wallet.label?.trim() || undefined,
  network: wallet.network.toUpperCase(),
});

const dedupeWallets = (wallets: StoredWallet[]): StoredWallet[] => {
  const byKey = new Map<string, StoredWallet>();

  for (const wallet of wallets) {
    const key = `${wallet.currency}:${wallet.network}`.toUpperCase();
    if (!byKey.has(key)) {
      byKey.set(key, wallet);
    }
  }

  return Array.from(byKey.values());
};

export const loadWallets = (): StoredWallet[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const sanitized = parsed.filter(isStoredWallet).map(normalizeWallet);
    return dedupeWallets(sanitized);
  } catch (error) {
    console.warn("Failed to load stored wallets", error);
    return [];
  }
};

export const saveWallets = (wallets: StoredWallet[]): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    const sanitized = dedupeWallets(wallets.map(normalizeWallet));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.warn("Failed to persist wallets", error);
  }
};

export const clearWallets = (): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear stored wallets", error);
  }
};

export const getPrimaryWallet = (): StoredWallet | null => {
  const wallets = loadWallets();
  if (wallets.length === 0) {
    return null;
  }
  return wallets.find((wallet) => wallet.isPrimary) ?? wallets[0];
};
