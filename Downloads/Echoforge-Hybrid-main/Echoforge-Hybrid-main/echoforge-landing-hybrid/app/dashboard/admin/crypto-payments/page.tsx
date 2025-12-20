"use client";
import { useState, useEffect } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";

export default function AdminCryptoPaymentsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-001",
      customer: "TechCorp Inc",
      amount: 0.5,
      currency: "BTC",
      usdValue: 21500,
      status: "completed",
      date: "2024-01-15 14:30:00",
      hash: "0x1234...5678",
      fee: 0.001
    },
    {
      id: "TXN-002",
      customer: "DataSolutions",
      amount: 2.3,
      currency: "ETH",
      usdValue: 4600,
      status: "pending",
      date: "2024-01-15 13:45:00",
      hash: "0xabcd...efgh",
      fee: 0.005
    },
    {
      id: "TXN-003",
      customer: "Enterprise Corp",
      amount: 15.7,
      currency: "USDC",
      usdValue: 15700,
      status: "completed",
      date: "2024-01-15 12:20:00",
      hash: "0x9876...5432",
      fee: 0.1
    },
    {
      id: "TXN-004",
      customer: "StartupAI",
      amount: 0.8,
      currency: "BTC",
      usdValue: 34400,
      status: "failed",
      date: "2024-01-15 11:15:00",
      hash: "0x1111...2222",
      fee: 0.001
    }
  ]);

  const [wallets, setWallets] = useState([
    {
      id: 1,
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      currency: "BTC",
      balance: 2.5,
      usdValue: 107500,
      status: "active"
    },
    {
      id: 2,
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      currency: "ETH",
      balance: 12.3,
      usdValue: 24600,
      status: "active"
    },
    {
      id: 3,
      address: "0x8ba1f109551bD432803012645Hac136c",
      currency: "USDC",
      balance: 50000,
      usdValue: 50000,
      status: "active"
    }
  ]);

  const [stats, setStats] = useState({
    totalVolume: 0,
    totalTransactions: 0,
    successRate: 0,
    totalFees: 0
  });

  useEffect(() => {
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.usdValue, 0);
    const completedTxns = transactions.filter(tx => tx.status === 'completed').length;
    const successRate = (completedTxns / transactions.length) * 100;
    const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);

    setStats({
      totalVolume,
      totalTransactions: transactions.length,
      successRate,
      totalFees
    });
  }, [transactions]);

  const navigateTo = (href: string, eventName: string, meta: Record<string, unknown> = {}) => {
    trackEvent(eventName, { destination: href, ...meta });
    router.push(href);
  };

  const copyToClipboard = (value: string, message: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      toast.success(message);
    } else {
      toast.error("Clipboard unavailable in this environment");
    }
  };

  const handleSyncWallets = () => {
    trackEvent("admin_crypto_sync_wallets");
    toast.success("Wallet balances are being refreshed.");
  };

  const handleGenerateReport = () => {
    navigateTo("/dashboard/admin/crypto-payments/reports", "admin_crypto_generate_report");
  };

  const handleOpenSettings = () => {
    navigateTo("/dashboard/admin/system/maintenance", "admin_crypto_open_settings", { source: "crypto_payments" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/20";
      case "failed": return "text-red-400 bg-red-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "BTC": return "₿";
      case "ETH": return "Ξ";
      case "USDC": return "💵";
      default: return "💰";
    }
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="bg-[#0f1630] border-b border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">₿ Crypto Payments</h1>
                <p className="text-white/60">Monitor cryptocurrency transactions and wallet management</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/admin" className="btn btn-ghost">
                  ← Back to Admin
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={() => navigateTo("/dashboard/admin/crypto-payments/wallets", "admin_crypto_add_wallet")}
                >
                  + Add Wallet
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-green-400">${stats.totalVolume.toLocaleString()}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Transactions</div>
                <div className="text-2xl font-bold text-blue-400">{stats.totalTransactions}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-purple-400">{stats.successRate.toFixed(1)}%</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Fees</div>
                <div className="text-2xl font-bold text-orange-400">${stats.totalFees.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Wallet Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Wallet Management</h3>
                <div className="flex gap-2">
                  <button className="btn btn-ghost text-sm">🔄 Refresh</button>
                  <button className="btn btn-ghost text-sm">📊 Analytics</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet, index) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getCurrencyIcon(wallet.currency)}</div>
                        <div>
                          <h4 className="font-bold text-white">{wallet.currency}</h4>
                          <div className="text-xs text-white/60 font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        wallet.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-white/60">Balance</div>
                        <div className="text-2xl font-bold text-white">
                          {wallet.balance.toLocaleString()} {wallet.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">USD Value</div>
                        <div className="text-lg font-bold text-green-400">
                          ${wallet.usdValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        className="btn btn-primary text-sm flex-1"
                        onClick={() => navigateTo(`/dashboard/admin/crypto-payments/wallets?focus=${wallet.currency.toLowerCase()}`, "admin_crypto_view_wallet", { currency: wallet.currency })}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-ghost text-sm"
                        onClick={() => copyToClipboard(wallet.address, "Wallet address copied")}
                        aria-label="Copy wallet address"
                      >
                        📋
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Transaction History</h3>
                <div className="flex gap-2">
                  <button className="btn btn-ghost text-sm">📥 Export</button>
                  <button className="btn btn-ghost text-sm">🔍 Filter</button>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCurrencyIcon(tx.currency)}</div>
                      <div>
                        <div className="font-bold text-white">{tx.id}</div>
                        <div className="text-sm text-white/60">{tx.customer}</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-white">
                        {tx.amount} {tx.currency}
                      </div>
                      <div className="text-sm text-white/60">
                        ${tx.usdValue.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-white/60">{tx.date}</div>
                      <div className="text-xs text-white/40 font-mono">
                        {tx.hash.slice(0, 12)}...
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost text-sm"
                        onClick={() => navigateTo(`/dashboard/admin/crypto-payments/confirmations?txn=${tx.id}`, "admin_crypto_view_transaction", { transactionId: tx.id })}
                        aria-label="View transaction"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-ghost text-sm"
                        onClick={() => copyToClipboard(tx.hash, "Transaction hash copied")}
                        aria-label="Copy transaction hash"
                      >
                        📋
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Crypto Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Currency Distribution</h3>
                <div className="space-y-3">
                  {['BTC', 'ETH', 'USDC'].map((currency, index) => {
                    const currencyTxns = transactions.filter(tx => tx.currency === currency);
                    const volume = currencyTxns.reduce((sum, tx) => sum + tx.usdValue, 0);
                    const percentage = (volume / stats.totalVolume) * 100;
                    
                    return (
                      <div key={currency} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCurrencyIcon(currency)}</span>
                          <span className="text-white/80">{currency}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">${volume.toLocaleString()}</div>
                          <div className="text-xs text-white/60">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Transaction Status</h3>
                <div className="space-y-3">
                  {['completed', 'pending', 'failed'].map((status, index) => {
                    const statusTxns = transactions.filter(tx => tx.status === status);
                    const count = statusTxns.length;
                    const percentage = (count / transactions.length) * 100;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'completed' ? 'bg-green-400' :
                            status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-white/80 capitalize">{status}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{count}</div>
                          <div className="text-xs text-white/60">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <button
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 text-center"
                onClick={handleSyncWallets}
              >
                <div className="text-4xl mb-3">🔄</div>
                <div className="font-bold text-white mb-2">Sync Wallets</div>
                <div className="text-sm text-white/60">Update wallet balances</div>
              </button>

              <button
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 text-center"
                onClick={handleGenerateReport}
              >
                <div className="text-4xl mb-3">📊</div>
                <div className="font-bold text-white mb-2">Generate Report</div>
                <div className="text-sm text-white/60">Create crypto report</div>
              </button>

              <button
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 text-center"
                onClick={handleOpenSettings}
              >
                <div className="text-4xl mb-3">⚙️</div>
                <div className="font-bold text-white mb-2">Settings</div>
                <div className="text-sm text-white/60">Configure crypto settings</div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}