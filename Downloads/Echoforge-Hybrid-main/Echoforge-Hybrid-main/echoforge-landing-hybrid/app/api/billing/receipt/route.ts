import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import PDFDocument from 'pdfkit'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('id')
  if (!paymentId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId: (session.user as any).id } })
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: any[] = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))))

  // Header
  doc.fontSize(18).text('EchoForge Receipt', { align: 'right' })
  doc.fontSize(10).text(new Date(payment.createdAt).toLocaleString(), { align: 'right' })
  doc.moveDown()

  // Billing to
  doc.fontSize(12).text('Billed To:')
  doc.text((session.user as any).email || '');
  doc.moveDown()

  // Details
  doc.text(`Payment ID: ${payment.id}`)
  doc.text(`Plan: ${payment.plan}`)
  doc.text(`Amount: ${(payment.amount).toFixed(2)} ${String(payment.currency).toUpperCase()}`)
  doc.text(`Status: ${payment.status}`)
  doc.moveDown()
  doc.text('Thank you for your business!', { align: 'center' })

  doc.end()
  const pdfBuffer = await done
  return new NextResponse(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf' } })
}
