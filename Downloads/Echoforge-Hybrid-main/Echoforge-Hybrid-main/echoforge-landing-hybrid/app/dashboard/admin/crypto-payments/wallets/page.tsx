"use client";

import { useEffect, useMemo, useState } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { loadWallets, saveWallets, StoredWallet } from "@/lib/walletStorage";

type Wallet = {
  id: string;
  currency: "USDT" | "BTC" | "ETH" | "USDC";
  network: string;
  address: string;
  label: string;
  balanceUsd: number;
  isPrimary?: boolean;
};

const CURRENCY_OPTIONS: Array<Wallet["currency"]> = ["USDT", "USDC", "BTC", "ETH"];

const NETWORK_OPTIONS: Record<Wallet["currency"], string[]> = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  USDC: ["ERC20", "SOL", "POLYGON"],
  BTC: ["Bitcoin"],
  ETH: ["Mainnet"],
};

const INITIAL_WALLETS: Wallet[] = [
  {
    id: "wallet-trc20",
    currency: "USDT",
    network: "TRC20",
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    label: "Primary USDT (TRON)",
    balanceUsd: 45678,
    isPrimary: true,
  },
  {
    id: "wallet-erc20",
    currency: "USDT",
    network: "ERC20",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    label: "Enterprise Ethereum",
    balanceUsd: 34567,
  },
  {
    id: "wallet-btc",
    currency: "BTC",
    network: "Bitcoin",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwfla9d",
    label: "Cold Storage BTC",
    balanceUsd: 89012,
  },
];

export default function CryptoWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [form, setForm] = useState({
    currency: "USDT" as Wallet["currency"],
    network: NETWORK_OPTIONS["USDT"][0],
    address: "",
    label: "",
  });

  useEffect(() => {
    const stored = loadWallets();
    if (stored.length > 0) {
      setWallets(stored as Wallet[]);
    } else {
      saveWallets(INITIAL_WALLETS as StoredWallet[]);
    }
  }, []);

  useEffect(() => {
    saveWallets(wallets as StoredWallet[]);
  }, [wallets]);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balanceUsd, 0),
    [wallets]
  );

  const handleAddWallet = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedAddress = form.address.trim();
    const trimmedLabel = form.label.trim();

    if (trimmedAddress.length < 12) {
      toast.error("Wallet address looks too short");
      return;
    }

    const exists = wallets.some(
      (wallet) =>
        wallet.address.toLowerCase() === trimmedAddress.toLowerCase() ||
        (wallet.currency === form.currency && wallet.network === form.network)
    );

    if (exists) {
      toast.error("Wallet for this network already exists or address is duplicated");
      return;
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      currency: form.currency,
      network: form.network,
      address: trimmedAddress,
      label: trimmedLabel || `${form.currency} ${form.network}`,
      balanceUsd: 0,
    };

    setWallets((prev) => [newWallet, ...prev]);
    setForm({
      currency: form.currency,
      network: NETWORK_OPTIONS[form.currency][0],
      address: "",
      label: "",
    });
    toast.success("Wallet added successfully");
    trackEvent("admin_wallet_added", {
      currency: newWallet.currency,
      network: newWallet.network,
    });
  };

  const handleRemoveWallet = (id: string) => {
    setWallets((prev) => prev.filter((wallet) => wallet.id !== id));
    toast.success("Wallet removed");
    trackEvent("admin_wallet_removed", { walletId: id });
  };

  const copyToClipboard = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      toast.success("Wallet address copied to clipboard");
    } else {
      toast.error("Clipboard unavailable in this environment");
    }
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">👛 Crypto Wallet Management</h1>
              <p className="text-white/60 text-sm">
                Configure the wallets your customers will use for USDT / crypto payments. Primary wallets appear first during checkout.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total Balance</p>
              <p className="text-2xl font-semibold text-green-400">${totalBalance.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Add Wallet Form */}
          <motion.form
            onSubmit={handleAddWallet}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-[repeat(5,minmax(0,1fr))]"
          >
            <div className="md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const currency = e.target.value as Wallet["currency"];
                  setForm({
                    currency,
                    network: NETWORK_OPTIONS[currency][0],
                    address: "",
                    label: "",
                  });
                }}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">Network</label>
              <select
                value={form.network}
                onChange={(e) => setForm((prev) => ({ ...prev, network: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {NETWORK_OPTIONS[form.currency].map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">Wallet Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Paste wallet address"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">Label</label>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Internal label"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-5 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:to-purple-700"
              >
                ➕ Add Wallet
              </button>
            </div>
          </motion.form>

          {/* Wallet List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid gap-4"
          >
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-500/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {wallet.currency === "BTC" ? "₿" : wallet.currency === "ETH" ? "Ξ" : "💰"}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {wallet.label}
                          {wallet.isPrimary && (
                            <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-300">
                              Primary
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-white/50">
                          {wallet.currency} • {wallet.network}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wallet.address)}
                      className="mt-3 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono text-white/80 hover:bg-white/10"
                    >
                      {wallet.address}
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-green-400">
                      ${wallet.balanceUsd.toLocaleString()}
                    </div>
                    <div className="mt-3 flex gap-2 justify-end">
                      {!wallet.isPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            setWallets((prev) =>
                              prev.map((entry) => ({
                                ...entry,
                                isPrimary: entry.id === wallet.id,
                              }))
                            );
                            toast.success("Wallet marked as primary");
                          }}
                          className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveWallet(wallet.id)}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {wallets.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
                No wallets configured yet. Add at least one wallet address to enable crypto payments.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
