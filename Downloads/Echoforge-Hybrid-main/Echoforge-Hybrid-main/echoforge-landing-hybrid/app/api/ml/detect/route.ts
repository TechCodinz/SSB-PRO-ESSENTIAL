import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Proxy endpoint to your existing echoforge-api-hybrid FastAPI backend
 * This calls YOUR complete ML models!
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { data, method, sensitivity, expected_rate } = body

    // Call YOUR existing FastAPI backend
    const API_URL = process.env.ECHOFORGE_API_URL || 'http://localhost:8000'
    const API_KEY = process.env.ECHOFORGE_API_KEY || 'demo_key'

    const response = await fetch(`${API_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-echo-key': API_KEY
      },
      body: JSON.stringify({
        data,
        method: method || 'isolation_forest',
        sensitivity: sensitivity || 0.1,
        expected_rate: expected_rate || 0.1
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("ML detection error:", error)
    return NextResponse.json(
      { error: "Detection failed" },
      { status: 500 }
    )
  }
}
