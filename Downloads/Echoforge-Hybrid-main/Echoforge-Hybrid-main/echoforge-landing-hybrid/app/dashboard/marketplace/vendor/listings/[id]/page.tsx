"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function EditVendorListingPage({ params }: { params: { id: string }}) {
  const [listing, setListing] = useState<any>(null)
  const [form, setForm] = useState<any>({ title: '', description: '', category: '', priceCents: 0, currency: 'usd' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { (async () => {
    const res = await fetch(`/api/marketplace/vendor/listings/${params.id}`)
    if (res.status === 401) { window.location.href = '/login'; return }
    const json = await res.json()
    setListing(json.listing)
    setForm({ title: json.listing.title, description: json.listing.description, category: json.listing.category, priceCents: json.listing.priceCents, currency: json.listing.currency })
  })() }, [params.id])

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`/api/marketplace/listings/${params.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      window.location.href = '/dashboard/marketplace/vendor/listings'
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">✏️ Edit Listing</h1>
          <p className="text-white/60">Update details. Admin review may be required.</p>
        </div>

        {!listing ? (
          <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
        ) : (
          <div className="card max-w-2xl space-y-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-2">Description</label>
              <textarea className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" rows={5} value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Category</label>
                <input className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2">Price (USD)</label>
                <input type="number" className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={(form.priceCents/100).toFixed(2)} onChange={(e)=>setForm({ ...form, priceCents: Math.round(parseFloat(e.target.value||'0')*100) })} />
              </div>
              <div>
                <label className="block text-sm mb-2">Currency</label>
                <input className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={form.currency} onChange={(e)=>setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving? 'Saving...' : 'Save Changes'}</button>
              <Link className="btn btn-ghost" href="/dashboard/marketplace/vendor/listings">Cancel</Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
