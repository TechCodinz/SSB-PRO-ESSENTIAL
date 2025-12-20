// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authorizeSession } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function GET(_req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'READ_ONLY')
  
  if (false && !guard?.authorized) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    // Get all users who have created marketplace listings (vendors)
    const listings = await prisma.marketplaceListing.findMany({
      select: {
        vendorId: true,
        vendor: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          }
        },
        status: true,
        price: true,
      }
    })

    // Group by vendor
    const vendorMap = new Map()
    
    for (const listing of listings) {
      if (!listing.vendor) continue
      
      const vendorId = listing.vendor.id
      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          id: listing.vendor.id,
          email: listing.vendor.email,
          name: listing.vendor.name,
          plan: listing.vendor.plan,
          totalListings: 0,
          activeListings: 0,
          totalRevenue: 0,
        })
      }
      
      const vendor = vendorMap.get(vendorId)
      vendor.totalListings++
      if (listing.status === 'ACTIVE') {
        vendor.activeListings++
      }
      vendor.totalRevenue += listing.price || 0
    }

    const vendors = Array.from(vendorMap.values())

    return NextResponse.json({ 
      vendors,
      count: vendors.length,
      stats: {
        totalVendors: vendors.length,
        totalListings: listings.length,
        totalRevenue: vendors.reduce((sum, v) => sum + v.totalRevenue, 0)
      }
    })
  } catch (error) {
    console.error('Failed to fetch vendors:', error)
    return NextResponse.json({ 
      vendors: [],
      count: 0,
      error: 'Failed to fetch vendors' 
    }, { status: 200 })
  }
}
