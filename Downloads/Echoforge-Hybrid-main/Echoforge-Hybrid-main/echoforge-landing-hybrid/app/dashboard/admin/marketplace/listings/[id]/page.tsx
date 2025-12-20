"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UltraPremiumAdminNavigation from '@/components/UltraPremiumAdminNavigation'

export default function AdminListingEditorPage({ params }: { params: { id: string }}) {
  const [listing, setListing] = useState<any>(null)
  const [assetUrl, setAssetUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => {
    const res = await fetch(`/api/marketplace/listings/${params.id}`)
    if (res.status === 404) { setListing(null); setLoading(false); return }
    const json = await res.json()
    setListing(json.listing)
    setAssetUrl(json.listing?.assetUrl || '')
    setLoading(false)
  })() }, [params.id])

  const save = async () => {
    await fetch(`/api/marketplace/listings/${params.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetUrl }) })
    window.location.reload()
  }

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">🧠 Listing Editor</h1>
        {loading ? (
          <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
        ) : !listing ? (
          <div className="text-white/60">Listing not found</div>
        ) : (
          <div className="card max-w-2xl">
            <div className="mb-4">
              <div className="text-sm text-white/60">Title</div>
              <div className="font-bold">{listing.title}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Asset URL</label>
              <input className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={assetUrl} onChange={(e)=>setAssetUrl(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary" onClick={save}>Save</button>
              <Link href="/dashboard/admin/marketplace" className="btn btn-ghost">Back</Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
