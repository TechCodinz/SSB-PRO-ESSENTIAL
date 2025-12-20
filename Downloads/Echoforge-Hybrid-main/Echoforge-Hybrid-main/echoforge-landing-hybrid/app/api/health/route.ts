import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { log } from "@/lib/logger"

/**
 * Health check endpoint
 * Returns API status and connectivity
 * Verifies database connectivity and backend API availability
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbAvailable = false;
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
      dbAvailable = true;
    } catch (dbError) {
      dbStatus = 'unhealthy';
      dbAvailable = false;
      log.error("Database health check failed", dbError);
    }

    // Check backend API connectivity
    const API_URL = process.env.ECHOFORGE_API_URL || process.env.ML_API_URL || 'http://localhost:8000'
    let backendStatus = 'unknown'
    let backendAvailable = false

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${API_URL}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      backendStatus = response.ok ? 'healthy' : 'error'
      backendAvailable = response.ok
    } catch (error) {
      backendStatus = 'offline'
      backendAvailable = false
      if (error instanceof Error && error.name !== 'AbortError') {
        log.warn("Backend API health check failed", { error: error.message });
      }
    }

    const overallStatus = dbAvailable ? 'healthy' : 'degraded';
    const duration = Date.now() - startTime;

    log.info("Health check completed", { 
      status: overallStatus, 
      dbStatus, 
      backendStatus,
      duration 
    });

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      responseTime: `${duration}ms`,
      services: {
        nextjs: 'healthy',
        database: {
          status: dbStatus,
          available: dbAvailable,
          configured: !!process.env.DATABASE_URL
        },
        backend_api: {
          status: backendStatus,
          available: backendAvailable,
          url: API_URL
        }
      },
      features: {
        authentication: !!process.env.NEXTAUTH_SECRET,
        payments_stripe: !!process.env.STRIPE_SECRET_KEY,
        payments_crypto: !!(process.env.USDT_TRC20_WALLET || process.env.USDT_ERC20_WALLET),
        ml_api: backendAvailable
      }
    }, {
      status: dbAvailable ? 200 : 503 // Service unavailable if DB is down
    })
  } catch (error) {
    log.error("Health check error", error);
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
