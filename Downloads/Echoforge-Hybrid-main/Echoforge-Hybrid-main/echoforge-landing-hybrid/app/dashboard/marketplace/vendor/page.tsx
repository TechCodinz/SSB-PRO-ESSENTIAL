"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function VendorOnboardingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { (async () => {
    const res = await fetch('/api/marketplace/vendor')
    if (res.status === 401) { window.location.href = '/login'; return }
    const json = await res.json()
    setProfile(json.profile)
    setDisplayName(json.profile?.displayName || '')
    setBio(json.profile?.bio || '')
  })() }, [])

  const submit = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/marketplace/vendor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName, bio }) })
      const json = await res.json()
      setProfile(json.profile)
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🛍️ Vendor Onboarding</h1>
          <p className="text-white/60">Create your vendor profile to list enterprise AI models</p>
        </div>

        <div className="card max-w-2xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea className="w-full px-4 py-3 rounded bg-white/10 border border-white/20" rows={4} value={bio} onChange={(e)=>setBio(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" disabled={loading} onClick={submit}>{loading? 'Saving...' : 'Save Profile'}</button>
            {profile && <span className={`px-3 py-1 rounded text-xs ${profile.status==='APPROVED'?'bg-green-500/20 text-green-300': profile.status==='REJECTED'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>{profile.status}</span>}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Link href="/dashboard/marketplace/listings/new" className="btn btn-ghost">+ Create Listing</Link>
          <Link href="/dashboard/marketplace/vendor/listings" className="btn btn-ghost">Manage Listings</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
