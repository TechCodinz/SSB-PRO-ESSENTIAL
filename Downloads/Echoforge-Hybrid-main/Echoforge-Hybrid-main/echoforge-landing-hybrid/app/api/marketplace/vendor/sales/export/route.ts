import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import PDFDocument from 'pdfkit'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: (session.user as any).id } })
  if (!vendor || vendor.status !== 'APPROVED') return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const format = (searchParams.get('format') || 'csv').toLowerCase()
  const from = searchParams.get('from') ? new Date(String(searchParams.get('from'))) : undefined
  const to = searchParams.get('to') ? new Date(String(searchParams.get('to'))) : undefined

  const listings = await prisma.marketplaceListing.findMany({ where: { vendorId: (session.user as any).id } })
  const ids = listings.map(l => l.id)
  const orders = await prisma.marketplaceOrder.findMany({ where: { listingId: { in: ids }, createdAt: { gte: from, lte: to } }, orderBy: { createdAt: 'desc' }, include: { listing: { select: { title: true } }, buyer: { select: { email: true } }, license: true } })

  if (format === 'csv') {
    const header = ['Date','Listing','Buyer','Amount','Currency','Provider','Status','License'].join(',')
    const rows = orders.map(o => [
      o.createdAt.toISOString(),
      (o.listing as any)?.title || '',
      (o.buyer as any)?.email || '',
      (o.amountCents/100).toFixed(2),
      String(o.currency).toUpperCase(),
      o.provider,
      o.status,
      o.license?.key || ''
    ].join(','))
    const csv = [header, ...rows].join('\n')
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="vendor-sales.csv"' } })
  }

  const doc = new PDFDocument({ size: 'A4', margin: 32 })
  const chunks: any[] = []
  doc.on('data', (c)=>chunks.push(c))
  const done = new Promise<Buffer>((resolve)=> doc.on('end', ()=> resolve(Buffer.concat(chunks))))

  doc.fontSize(16).text('Vendor Sales Report', { align: 'center' })
  doc.moveDown()
  orders.forEach(o => {
    doc.fontSize(10).text(`${o.createdAt.toISOString()} | ${(o.listing as any)?.title || ''} | ${(o.buyer as any)?.email || ''} | ${(o.amountCents/100).toFixed(2)} ${String(o.currency).toUpperCase()} | ${o.provider} | ${o.status} | ${o.license?.key || ''}`)
  })
  doc.end()
  const pdf = await done
  return new NextResponse(pdf, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="vendor-sales.pdf"' } })
}
