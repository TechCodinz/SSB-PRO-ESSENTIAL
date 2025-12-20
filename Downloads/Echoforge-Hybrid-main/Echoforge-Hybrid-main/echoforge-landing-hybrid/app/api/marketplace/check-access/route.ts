import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Check if user has access to a model
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    const { modelId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    // Check for active license
    const license = await prisma.licenseKey.findFirst({
      where: {
        buyerId: user.id,
        status: "ACTIVE",
        listing: {
          title: {
            contains: modelId.toString()
          }
        }
      },
      include: {
        listing: true
      }
    });

    if (license) {
      return NextResponse.json({
        hasAccess: true,
        license: {
          key: license.key,
          issuedAt: license.issuedAt,
          modelName: license.listing.title
        }
      });
    }

    return NextResponse.json({ hasAccess: false });

  } catch (error) {
    console.error("Check access error:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}
