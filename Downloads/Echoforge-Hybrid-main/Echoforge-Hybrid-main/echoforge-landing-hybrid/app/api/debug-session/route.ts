import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Debug endpoint to check current session data
 * Useful for troubleshooting login issues
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false,
        message: "No session found" 
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: (session.user as any)?.id,
        email: session.user?.email,
        name: session.user?.name,
        role: (session.user as any)?.role,
        plan: (session.user as any)?.plan,
      },
      sessionData: session,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get session",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
