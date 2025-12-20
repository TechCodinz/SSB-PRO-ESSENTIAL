"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function ListingDetailPage({ params }: { params: { id: string }}) {
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState<'flutterwave'|'stripe'|'crypto'>('flutterwave')
  const [cryptoInfo, setCryptoInfo] = useState<any>(null)

  useEffect(() => { (async () => {
    const res = await fetch(`/api/marketplace/listings/${params.id}`)
    const json = await res.json()
    setListing(json.listing)
    setLoading(false)
  })() }, [params.id])

  const buy = async () => {
    const res = await fetch('/api/marketplace/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: params.id, provider }) })
    const json = await res.json()
    if (provider === 'crypto') {
      setCryptoInfo(json.crypto)
    } else if (json.url) {
      window.location.href = json.url
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse h-8 bg-white/10 rounded w-32" />
        ) : !listing ? (
          <div className="text-white/60">Listing not found.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 card">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="text-white/60 mb-4">Category: {listing.category}</div>
              <p className="text-white/80 mb-6">{listing.description}</p>
              <div className="h-48 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">🧠 Model Preview</div>
            </div>
            <div className="card">
              <div className="text-sm text-white/60 mb-1">Price</div>
              <div className="text-3xl font-bold text-blue-400 mb-4">${(listing.priceCents/100).toFixed(2)}</div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" value={provider} onChange={(e)=>setProvider(e.target.value as any)}>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="stripe">Stripe</option>
                  <option value="crypto">USDT (TRC20/ERC20/BEP20)</option>
                </select>
              </div>

              <button className="btn btn-primary w-full" onClick={buy}>Buy Now</button>

              {cryptoInfo && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                  <div className="font-bold mb-1">Crypto Payment</div>
                  <div>Reference: {cryptoInfo.reference}</div>
                  <div className="mt-2">Wallets:</div>
                  <ul className="text-white/70 text-xs">
                    <li>TRC20: {cryptoInfo.wallets.TRC20 || 'not set'}</li>
                    <li>ERC20: {cryptoInfo.wallets.ERC20 || 'not set'}</li>
                    <li>BEP20: {cryptoInfo.wallets.BEP20 || 'not set'}</li>
                  </ul>
                </div>
              )}

              <div className="mt-4 text-xs text-white/50">Admin approval is required for model deployment. You’ll receive a receipt and email after payment.</div>
            </div>
          </div>
        )}
        <div className="mt-6">
          <Link href="/dashboard/marketplace" className="btn btn-ghost">← Back to Marketplace</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
