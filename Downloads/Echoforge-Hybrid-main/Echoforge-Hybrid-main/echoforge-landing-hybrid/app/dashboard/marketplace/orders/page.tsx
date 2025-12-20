"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => {
    const res = await fetch('/api/marketplace/orders')
    if (res.status === 401) { window.location.href = '/login'; return }
    const json = await res.json()
    setOrders(json.orders || [])
    setLoading(false)
  })() }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🧾 My Orders</h1>
          <p className="text-white/60">Purchased marketplace items</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
          ) : orders.length === 0 ? (
            <div className="text-white/60">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-white/5 border border-white/10 rounded p-4 flex items-start justify-between">
                  <div>
                    <div className="font-bold">{o.listing?.title}</div>
                    <div className="text-white/60 text-sm">{new Date(o.createdAt).toLocaleString()} • ${(o.amountCents/100).toFixed(2)} {String(o.currency).toUpperCase()} • {o.status}</div>
                    {o.license?.key && (
                      <div className="mt-1 text-xs text-white/70">License: <span className="font-mono bg-black/30 px-2 py-1 rounded">{o.license.key}</span></div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {o.status === 'SUCCEEDED' && (
                      <>
                        {o.listing?.assetUrl && (
                          <a href={o.listing.assetUrl} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">Download</a>
                        )}
                        {o.license?.key && (
                          <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(o.license.key)}>Copy License</button>
                        )}
                      </>
                    )}
                    <Link href={`/dashboard/marketplace/listings/${o.listingId}`} className="btn btn-ghost btn-sm">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
