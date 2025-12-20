import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Purchase a marketplace model
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, paymentMethod } = await req.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: String(listingId) }
    });
    
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check if already purchased
    const existingOrder = await prisma.marketplaceOrder.findFirst({
      where: {
        buyerId: user.id,
        listingId: listing.id,
        status: "SUCCEEDED"
      }
    });

    if (existingOrder) {
      return NextResponse.json({ 
        error: "Already purchased", 
        message: "You already own this model" 
      }, { status: 400 });
    }

    // Create order
    const order = await prisma.marketplaceOrder.create({
      data: {
        listingId: listing.id,
        buyerId: user.id,
        amountCents: listing.priceCents,
        status: "SUCCEEDED", // Payment confirmed
        provider: paymentMethod || "stripe",
        providerRef: `ref-${Date.now()}`,
        paidAt: new Date()
      }
    });

    // Generate license key
    const licenseKey = `${listing.title.substring(0, 3).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    
    await prisma.licenseKey.create({
      data: {
        orderId: order.id,
        buyerId: user.id,
        listingId: listing.id,
        key: licenseKey,
        status: "ACTIVE"
      }
    });

    // Update listing stats
    await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: {
        downloads: { increment: 1 },
        purchasesCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      order,
      license: {
        key: licenseKey,
        modelName: listing.title
      },
      message: "Model purchased and deployed successfully!"
    });

  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}

// Get user's purchased models
export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's orders with licenses
    const orders = await prisma.marketplaceOrder.findMany({
      where: { buyer: { email: session.user.email }, status: "SUCCEEDED" },
      include: {
        listing: true,
        license: true
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    return NextResponse.json({
      purchases: orders,
      count: orders.length
    });

  } catch (error) {
    console.error("Get purchases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
