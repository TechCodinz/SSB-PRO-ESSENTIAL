import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { env } from "@/lib/env"
import { hasRequiredRole } from "@/lib/rbac"

/**
 * System status endpoint for admin monitoring
 * Shows API health, database connectivity, and system stats
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Public status (limited info)
    const publicStatus = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    }

    // Return limited info for non-admin users
    if (!session?.user || !hasRequiredRole(session.user.role, 'MODERATOR')) {
      return NextResponse.json(publicStatus)
    }

    // Admin-only detailed status
    let dbStatus = 'unknown'
    let userCount = 0
    let analysisCount = 0

    try {
      // Test database connectivity
      userCount = await prisma.user.count()
      analysisCount = await prisma.analysis.count()
      dbStatus = 'healthy'
    } catch (error) {
      dbStatus = 'error'
    }

    // Check backend API
    const API_URL = env.apiBaseUrl
    let backendStatus = 'unknown'
    
    try {
      const response = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(3000)
      })
      backendStatus = response.ok ? 'healthy' : 'error'
    } catch {
      backendStatus = 'offline'
    }

    const detailedStatus = {
      ...publicStatus,
      services: {
        database: dbStatus,
        backend_api: backendStatus,
        authentication: 'healthy',
        payments: 'healthy'
      },
      stats: {
        total_users: userCount,
        total_analyses: analysisCount,
        backend_url: API_URL
      },
      environment: {
        node_env: process.env.NODE_ENV,
        database_configured: !!process.env.DATABASE_URL,
        stripe_configured: !!process.env.STRIPE_SECRET_KEY,
        crypto_configured: !!(process.env.USDT_TRC20_WALLET || process.env.USDT_ERC20_WALLET),
        ml_api_configured: !env.isDefaultApi
      }
    }

    return NextResponse.json(detailedStatus)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
