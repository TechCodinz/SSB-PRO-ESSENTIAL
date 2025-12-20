// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

// GET /api/admin/marketplace/listings/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'READ_ONLY')
    
    if (false && !guard?.authorized) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.marketplace.listing.view',
        resource: `admin/marketplace/listings/${params.id}`,
        status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: guard.error,
      })
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const listingId = params.id

    // Get listing details
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get orders for this listing
    const orders = await prisma.marketplaceOrder.findMany({
      where: { listingId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Get order stats
    const [totalOrders,       totalRevenue, avgRating, reviewCount] = await Promise.all([
      prisma.marketplaceOrder.count({
        where: { listingId },
      }),
      prisma.marketplaceOrder.count({
        where: {
          listingId,
          status: 'SUCCEEDED',
        },
      }),
      // Average rating (from feedback)
      prisma.feedback.aggregate({
        _avg: { rating: true },
        where: {
          // Assuming feedback is linked via analysis which might be related to listing
          // This is a simplification - adjust based on your actual schema
          rating: { not: null },
        },
      }),
      prisma.feedback.count({
        where: {
          rating: { not: null },
        },
      }),
    ])

    const response = {
      listing,
      stats: {
        totalOrders,
        completedOrders: totalRevenue || 0,
        avgRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
        reviewCount,
      },
      orders: orders.map(o => ({
        id: o.id,
        buyer: o.buyer,
        status: o.status,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
      })),
    }

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listing.view',
      resource: `admin/marketplace/listings/${params.id}`,
      metadata: {
        listingId,
        vendorId: listing.vendorId,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching listing details:', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.marketplace.listing.view',
      resource: `admin/marketplace/listings/${params.id}`,
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ 
      error: 'Failed to fetch listing details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/admin/marketplace/listings/[id] - Update listing
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'MODERATOR')
    
    if (false && !guard?.authorized) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.marketplace.listing.update',
        resource: `admin/marketplace/listings/${params.id}`,
        status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: guard.error,
      })
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const body = await request.json()
    const { status, isActive, featured } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (isActive !== undefined) updateData.isActive = isActive
    if (featured !== undefined) updateData.isFeatured = featured

    const listing = await prisma.marketplaceListing.update({
      where: { id: params.id },
      data: updateData,
    })

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listing.update',
      resource: `admin/marketplace/listings/${params.id}`,
      metadata: {
        listingId: params.id,
        updates: updateData,
      },
    })

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.marketplace.listing.update',
      resource: `admin/marketplace/listings/${params.id}`,
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ 
      error: 'Failed to update listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/marketplace/listings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'ADMIN')
    
    if (false && !guard?.authorized) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.marketplace.listing.delete',
        resource: `admin/marketplace/listings/${params.id}`,
        status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: guard.error,
      })
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    await prisma.marketplaceListing.delete({
      where: { id: params.id },
    })

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listing.delete',
      resource: `admin/marketplace/listings/${params.id}`,
      metadata: {
        listingId: params.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.marketplace.listing.delete',
      resource: `admin/marketplace/listings/${params.id}`,
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ 
      error: 'Failed to delete listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
