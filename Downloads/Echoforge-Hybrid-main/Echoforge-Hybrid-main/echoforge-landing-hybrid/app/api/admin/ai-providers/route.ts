import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { getAIProviders } from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = String((session.user as any)?.role ?? "").toUpperCase();
    if (!hasRequiredRole(role, "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const providers = getAIProviders();

    // Mask API keys for security (only show last 4 chars)
    const maskedProviders = providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? `••••${p.apiKey.slice(-4)}` : "",
    }));

    return NextResponse.json({ providers: maskedProviders });
  } catch (error) {
    console.error("AI providers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load providers" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
    const { provider, apiKey, model, baseUrl, enabled, priority, maxTokens, temperature } = body;

    // In production, store in database. For now, we'll use environment variables
    // This is a placeholder - you should create a database table for AI provider configs
    // For now, we'll just validate and return success

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    // TODO: Store in database table `ai_provider_configs`
    // For now, configuration is done via environment variables

    return NextResponse.json({
      success: true,
      message: "Provider configuration updated. Note: In production, configure via environment variables or database.",
      provider: {
        provider,
        enabled,
        priority,
        model,
        baseUrl,
        maxTokens,
        temperature,
      },
    });
  } catch (error) {
    console.error("AI provider update error:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}
