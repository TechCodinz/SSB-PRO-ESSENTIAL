"use client"

import { useState } from "react"
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation"
import Link from "next/link"
import useSWR from "swr"
import axios from "axios"
import toast from "react-hot-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CryptoPaymentConfirmationsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')
  const { data, error, mutate } = useSWR(
    `/api/admin/crypto-payments?status=${filter}`,
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds
  )

  const [processing, setProcessing] = useState<string | null>(null)

  const payments = data?.payments || []
  const stats = data?.stats || { totalVolume: 0, totalTransactions: 0, pending: 0, confirmed: 0, rejected: 0 }

  const handleConfirm = async (paymentId: string) => {
    if (!confirm('Confirm this payment? User will be upgraded immediately.')) {
      return
    }

    try {
      setProcessing(paymentId)
      const { data } = await axios.post('/api/admin/crypto-payments', {
        paymentId,
        action: 'confirm'
      })
      
      toast.success(data.message || 'Payment confirmed!')
      mutate() // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm payment')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (paymentId: string) => {
    if (!confirm('Reject this payment? This cannot be undone.')) {
      return
    }

    try {
      setProcessing(paymentId)
      await axios.post('/api/admin/crypto-payments', {
        paymentId,
        action: 'reject'
      })
      
      toast.success('Payment rejected')
      mutate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject payment')
    } finally {
      setProcessing(null)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const openBlockchainExplorer = (network: string, txHash: string) => {
    const explorers: Record<string, string> = {
      TRC20: `https://tronscan.org/#/transaction/${txHash}`,
      ERC20: `https://etherscan.io/tx/${txHash}`,
      BEP20: `https://bscscan.com/tx/${txHash}`
    }
    
    const url = explorers[network]
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('Unknown network')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400'
      case 'PENDING_VERIFICATION': return 'bg-yellow-500/20 text-yellow-400'
      case 'REJECTED': return 'bg-red-500/20 text-red-400'
      case 'PENDING': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">💳 Payment Confirmations</h1>
              <p className="text-white/60">Review and confirm crypto payments</p>
            </div>
            <Link href="/dashboard/admin/crypto-payments" className="btn btn-ghost">
              ← Back
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-white/60 mb-1">Total Volume</div>
              <div className="text-2xl font-bold text-green-400">${stats.totalVolume.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4">
              <div className="text-sm text-white/60 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-sm text-white/60 mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4">
              <div className="text-sm text-white/60 mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {(['pending', 'verified', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading */}
          {!data && !error && (
            <div className="text-center py-12">
              <div className="text-white/50">Loading payments...</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <p className="text-red-400">Failed to load payments</p>
              <button onClick={() => mutate()} className="mt-4 btn btn-primary">
                Retry
              </button>
            </div>
          )}

          {/* Payments List */}
          {data && payments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/50">No {filter} payments</div>
            </div>
          )}

          {data && payments.length > 0 && (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{payment.user?.name || payment.user?.email}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">{payment.user?.email}</p>
                      <p className="text-white/40 text-sm font-mono">User ID: {payment.userId}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">${payment.amount}</div>
                      <div className="text-sm text-white/60">{payment.currency} · {payment.network}</div>
                      <div className="text-xs text-blue-400 mt-1">{payment.plan} Plan</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-white/50 mb-1">Wallet Address</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono truncate">{payment.walletAddress}</span>
                        <button
                          onClick={() => copyToClipboard(payment.walletAddress, 'Wallet address')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">Payment Reference</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{payment.paymentReference}</span>
                        <button
                          onClick={() => copyToClipboard(payment.paymentReference, 'Reference')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {payment.txHash && (
                    <div className="mb-4">
                      <div className="text-xs text-white/50 mb-1">Transaction Hash</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono truncate flex-1">{payment.txHash}</span>
                        <button
                          onClick={() => copyToClipboard(payment.txHash, 'TX Hash')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => openBlockchainExplorer(payment.network, payment.txHash)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          🔍 View on Explorer
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-white/50">Created</div>
                      <div>{new Date(payment.createdAt).toLocaleString()}</div>
                    </div>
                    {payment.submittedAt && (
                      <div>
                        <div className="text-white/50">Submitted</div>
                        <div>{new Date(payment.submittedAt).toLocaleString()}</div>
                      </div>
                    )}
                    {payment.verifiedAt && (
                      <div>
                        <div className="text-white/50">Verified</div>
                        <div>{new Date(payment.verifiedAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {payment.status === 'PENDING_VERIFICATION' && (
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleConfirm(payment.id)}
                        disabled={processing === payment.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {processing === payment.id ? 'Processing...' : '✅ Confirm & Upgrade User'}
                      </button>
                      <button
                        onClick={() => handleReject(payment.id)}
                        disabled={processing === payment.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {processing === payment.id ? 'Processing...' : '❌ Reject Payment'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
