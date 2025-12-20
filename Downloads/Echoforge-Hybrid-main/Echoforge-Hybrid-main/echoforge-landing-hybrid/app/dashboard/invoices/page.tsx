"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/billing/invoices')
        if (res.status === 401) {
          window.location.href = '/login'
          return
        }
        const json = await res.json()
        setInvoices(json.invoices || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🧾 Invoices & Receipts</h1>
          <p className="text-white/60">View your subscription payments and download receipts</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="animate-pulse h-8 bg-white/10 rounded w-24" />
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧾</div>
              <p className="text-white/60 mb-4">No invoices yet</p>
              <Link href="/dashboard/billing" className="text-blue-400 hover:text-blue-300">Upgrade your plan →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60 border-b border-white/10">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Plan</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-right py-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5">
                      <td className="py-3">{new Date(inv.createdAt).toLocaleString()}</td>
                      <td className="py-3">{inv.plan}</td>
                      <td className="py-3">{(inv.amount/100).toFixed(2)} {String(inv.currency).toUpperCase()}</td>
                      <td className="py-3">{inv.status}</td>
                      <td className="py-3 text-right">
                        <a className="btn btn-ghost" href={`/api/billing/receipt?id=${inv.id}`} target="_blank" rel="noopener noreferrer">Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
