"use client";
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function VendorSalesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => {
    const res = await fetch('/api/marketplace/vendor/sales')
    if (res.status === 401 || res.status === 403) { window.location.href = '/dashboard/marketplace/vendor'; return }
    const json = await res.json()
    setData(json)
    setLoading(false)
  })() }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📈 Vendor Sales</h1>
          <div className="flex gap-2">
            <a className="btn btn-ghost btn-sm" href="/api/marketplace/vendor/sales/export?format=csv">Export CSV</a>
            <a className="btn btn-ghost btn-sm" href="/api/marketplace/vendor/sales/export?format=pdf">Export PDF</a>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-white/60">Listings</div>
            <div className="text-3xl font-bold">{loading? '…' : data?.totals?.listings || 0}</div>
          </div>
          <div className="card">
            <div className="text-sm text-white/60">Orders</div>
            <div className="text-3xl font-bold">{loading? '…' : data?.totals?.orders || 0}</div>
          </div>
          <div className="card">
            <div className="text-sm text-white/60">Revenue</div>
            <div className="text-3xl font-bold text-green-400">{loading? '…' : `$${((data?.totals?.revenueCents||0)/100).toFixed(2)}`}</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Orders</h2>
            <div className="flex gap-2">
              <a className="btn btn-ghost btn-sm" href="/api/marketplace/vendor/sales/export?format=csv">Export CSV</a>
              <a className="btn btn-ghost btn-sm" href="/api/marketplace/vendor/sales/export?format=pdf">Export PDF</a>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
          ) : (
            <div className="space-y-3">
              {(data?.recentOrders||[]).map((o:any) => (
                <div key={o.id} className="bg-white/5 border border-white/10 rounded p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.listing?.title}</div>
                    <div className="text-white/60 text-sm">{new Date(o.createdAt).toLocaleString()} • ${(o.amountCents/100).toFixed(2)} • {o.buyer?.email}</div>
                  </div>
                  <div className="text-xs text-white/50">{o.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
