import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Generate a secure API key
function generateApiKey(prefix: string = "ek_live"): string {
  const randomBytes = crypto.randomBytes(24);
  return `${prefix}_${randomBytes.toString("hex")}`;
}

// GET - List all API keys for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user's API keys from database
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true,
        status: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

// POST - Create new API key
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, environment = "production" } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "API key name is required" }, { status: 400 });
    }

    // Generate key with appropriate prefix
    const prefix = environment === "development" ? "ek_test" : "ek_live";
    const key = generateApiKey(prefix);

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: name.trim(),
        key,
        status: "active",
      },
      select: {
        id: true,
        name: true,
        key: true,
        status: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return NextResponse.json({ 
      apiKey,
      message: "API key created successfully. Store it securely - you won't be able to see it again!" 
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

// DELETE - Revoke API key
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 });
    }

    // Verify ownership and delete
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
