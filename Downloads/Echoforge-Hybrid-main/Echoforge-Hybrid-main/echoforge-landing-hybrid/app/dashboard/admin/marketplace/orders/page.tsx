"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UltraPremiumAdminNavigation from '@/components/UltraPremiumAdminNavigation';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/admin/marketplace/orders')
      if (!res.ok) {
        console.error('Failed to fetch orders:', res.status, res.statusText)
        setError(`Failed to load orders: ${res.status}`)
        setLoading(false)
        return
      }
      const json = await res.json()
      setOrders(json.orders || [])
      setError('')
      setLoading(false)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: string, status: 'SUCCEEDED'|'FAILED') => {
    try {
      const res = await fetch('/api/admin/marketplace/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(status === 'SUCCEEDED' ? 'Order marked as paid' : 'Order flagged as failed');
      load();
    } catch (error) {
      console.error(error);
      toast.error('Unable to update order status right now');
    }
  }

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📦 Marketplace Orders</h1>
              <p className="text-white/60">View and manage marketplace purchases</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/admin/marketplace" className="btn btn-ghost">
                ← Back
              </Link>
              <a className="btn btn-ghost btn-sm" href="/api/admin/marketplace/orders/export?format=csv">Export CSV</a>
              <a className="btn btn-ghost btn-sm" href="/api/admin/marketplace/orders/export?format=pdf">Export PDF</a>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4">
              {error}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            {loading ? (
              <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
            ) : orders.length === 0 ? (
              <div className="text-white/60 text-center py-8">No orders found.</div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60 border-b border-white/10">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Listing</th>
                    <th className="text-left py-3">Buyer</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Provider</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-right py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="py-3">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="py-3">{o.listing?.title}</td>
                      <td className="py-3">{o.buyer?.email}</td>
                      <td className="py-3">{(o.amountCents/100).toFixed(2)} {String(o.currency).toUpperCase()}</td>
                      <td className="py-3">{o.provider}</td>
                      <td className="py-3">{o.status}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button className="btn btn-primary btn-sm" onClick={()=>setStatus(o.id,'SUCCEEDED')}>Mark Paid</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setStatus(o.id,'FAILED')}>Fail</button>
                          <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin/marketplace/listings/${o.listingId}`}>View Listing</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
