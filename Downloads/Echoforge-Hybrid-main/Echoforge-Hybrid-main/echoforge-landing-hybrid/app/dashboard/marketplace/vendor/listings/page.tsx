"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function VendorListingsManagePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetch('/api/marketplace/vendor/listings')
    if (res.status === 401) { window.location.href = '/login'; return }
    const json = await res.json()
    setListings(json.listings || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧩 My Listings</h1>
            <p className="text-white/60">Create, edit and manage your marketplace listings</p>
          </div>
          <Link href="/dashboard/marketplace/listings/new" className="btn btn-primary">+ New Listing</Link>
        </div>

        <div className="card">
          {loading ? (
            <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
          ) : listings.length === 0 ? (
            <div className="text-white/60">No listings yet.</div>
          ) : (
            <div className="space-y-3">
              {listings.map((l)=> (
                <div key={l.id} className="bg-white/5 border border-white/10 rounded p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{l.title}</div>
                    <div className="text-white/60 text-sm">${(l.priceCents/100).toFixed(2)} • {l.category} • {l.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link className="btn btn-primary btn-sm" href={`/dashboard/marketplace/vendor/listings/${l.id}`}>Edit</Link>
                    <Link className="btn btn-ghost btn-sm" href={`/dashboard/marketplace/listings/${l.id}`}>View</Link>
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
