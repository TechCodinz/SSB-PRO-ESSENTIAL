import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type MarketplaceSummary = {
  id: string;
  title: string;
  category: string;
  priceCents: number;
  currency: string;
  purchasesCount: number;
  downloads: number;
  rating: number | null;
};

export async function GET() {
  try {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAnalyses,
      anomaliesSum,
      avgAccuracyAgg,
      avgProcessingAgg,
      activeInvestigations,
      failedAnalyses,
      analysesLast24h,
      recentAnalyses,
      topListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.analysis.count(),
      prisma.analysis.aggregate({
        _sum: { anomaliesFound: true },
      }),
      prisma.analysis.aggregate({
        where: { status: "COMPLETED" },
        _avg: { accuracy: true },
      }),
      prisma.analysis.aggregate({
        where: { status: "COMPLETED", processingTime: { not: null } },
        _avg: { processingTime: true },
      }),
      prisma.analysis.count({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.analysis.count({
        where: { status: "FAILED" },
      }),
      prisma.analysis.findMany({
        where: { status: "COMPLETED", createdAt: { gte: since24h } },
        select: { anomaliesFound: true, processingTime: true },
      }),
      prisma.analysis.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          type: true,
          status: true,
          anomaliesFound: true,
          processingTime: true,
          createdAt: true,
        },
      }),
      prisma.marketplaceListing.findMany({
        where: { status: "APPROVED" },
        orderBy: [{ purchasesCount: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: {
          id: true,
          title: true,
          category: true,
          priceCents: true,
          currency: true,
          purchasesCount: true,
          downloads: true,
          rating: true,
        },
      }),
    ]);

    const anomaliesTotal = anomaliesSum._sum.anomaliesFound ?? 0;
    const anomalies24h = analysesLast24h.reduce(
      (sum, item) => sum + (item.anomaliesFound ?? 0),
      0,
    );
    const avgProcessingMs = avgProcessingAgg._avg.processingTime ?? 0;
    const avgAccuracy = avgAccuracyAgg._avg.accuracy ?? 0;

    const uptimePercent =
      totalAnalyses === 0
        ? 100
        : Number(
            (
              ((totalAnalyses - failedAnalyses) / Math.max(totalAnalyses, 1)) *
              100
            ).toFixed(2),
          );

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalAnalyses,
        totalAnomalies: anomaliesTotal,
        anomaliesLast24h: anomalies24h,
        activeInvestigations,
        avgProcessingMs: Math.round(avgProcessingMs),
        avgAccuracy,
        uptimePercent,
      },
      recentAnalyses: recentAnalyses.map((analysis) => ({
        id: analysis.id,
        type: analysis.type,
        status: analysis.status,
        anomaliesFound: analysis.anomaliesFound ?? 0,
        processingTime: analysis.processingTime,
        createdAt: analysis.createdAt,
      })),
      marketplace: {
        topListings: (topListings as MarketplaceSummary[]).map((listing) => ({
          id: listing.id,
          title: listing.title,
          category: listing.category,
          price: listing.priceCents / 100,
          currency: listing.currency,
          purchasesCount: listing.purchasesCount,
          downloads: listing.downloads,
          rating: listing.rating,
        })),
      },
      updatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[public/overview] error", error);
    return NextResponse.json(
      { error: "Unable to load platform overview" },
      { status: 500 },
    );
  }
}
