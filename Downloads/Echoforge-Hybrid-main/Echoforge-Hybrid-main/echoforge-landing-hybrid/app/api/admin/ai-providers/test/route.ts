import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { callAI, type AIMessage } from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = String((session.user as any)?.role ?? "").toUpperCase();
    if (!hasRequiredRole(role, "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    const testMessages: AIMessage[] = [
      {
        role: "system",
        content: "You are a test assistant. Respond briefly to confirm you are working.",
      },
      {
        role: "user",
        content: "Say 'AI provider is working' if you can read this.",
      },
    ];

    const response = await callAI(testMessages, provider as any);

    return NextResponse.json({
      success: true,
      response: response.content,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.tokensUsed,
      latency: response.latency,
    });
  } catch (error) {
    console.error("AI provider test error:", error);
    return NextResponse.json(
      {
        error: "Provider test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
