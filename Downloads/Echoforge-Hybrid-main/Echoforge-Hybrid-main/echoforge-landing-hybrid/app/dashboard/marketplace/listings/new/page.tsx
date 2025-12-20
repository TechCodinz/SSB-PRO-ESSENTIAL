"use client";
import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function NewListingPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('anomaly')
  const [priceCents, setPriceCents] = useState(29900)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/marketplace/listings/new', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, category, priceCents }) })
      const json = await res.json()
      if (json.listing?.id) {
        window.location.href = `/dashboard/marketplace/listings/${json.listing.id}`
      }
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">+ Create Listing</h1>
          <p className="text-white/60">Submit your AI model for admin approval</p>
        </div>

        <div className="card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" value={category} onChange={(e)=>setCategory(e.target.value)}>
                {['anomaly','deepfake','fraud','crypto','iot','security'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" rows={5} value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price (USD)</label>
              <input type="number" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" value={priceCents/100} onChange={(e)=>setPriceCents(Math.round(Number(e.target.value||0)*100))} />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary" disabled={loading} onClick={submit}>{loading? 'Submitting...' : 'Submit for Approval'}</button>
            <Link className="btn btn-ghost" href="/dashboard/marketplace">Cancel</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
