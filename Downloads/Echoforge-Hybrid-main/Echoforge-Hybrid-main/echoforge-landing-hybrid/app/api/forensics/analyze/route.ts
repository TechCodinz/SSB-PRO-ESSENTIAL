import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Deepfake detection - calls YOUR real_deepfake_detection.py!
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'comprehensive'

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 })
    }

    // Call YOUR existing deepfake detection API
    const API_URL = process.env.ECHOFORGE_API_URL || 'http://localhost:8000'
    const API_KEY = process.env.ECHOFORGE_API_KEY || 'demo_key'

    // Prepare file for API
    const apiFormData = new FormData()
    apiFormData.append('file', file)
    apiFormData.append('mode', mode)

    const response = await fetch(`${API_URL}/api/v1/forensics/deepfake`, {
      method: 'POST',
      headers: {
        'x-echo-key': API_KEY
      },
      body: apiFormData
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { 
          error: "Deepfake detection API unavailable",
          message: "The detection service is currently unavailable. Please ensure the echoforge-api-hybrid service is running and configured.",
          status: response.status,
          details: errorText
        },
        { status: 503 }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error("Forensic analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    )
  }
}
