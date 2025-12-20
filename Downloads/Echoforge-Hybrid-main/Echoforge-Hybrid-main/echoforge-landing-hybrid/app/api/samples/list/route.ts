import { NextResponse } from 'next/server'

export async function GET() {
  const samples = [
    { name: 'Financial (small)', file: '/samples/financial_small.csv' },
    { name: 'Network (mini)', file: '/samples/network_mini.csv' },
    { name: 'IoT Sensors (demo)', file: '/samples/iot_demo.csv' }
  ]
  return NextResponse.json({ samples, refreshedAt: new Date().toISOString() })
}
