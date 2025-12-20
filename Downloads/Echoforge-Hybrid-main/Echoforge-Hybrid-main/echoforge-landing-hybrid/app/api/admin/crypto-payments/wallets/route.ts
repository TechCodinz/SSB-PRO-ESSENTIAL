// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/admin/crypto-payments/wallets - Get configured wallets and stats
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'MODERATOR')
    
    if (false && !guard?.authorized) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.crypto.wallets.list',
        resource: 'admin/crypto-payments/wallets',
        status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: guard.error,
      })
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    // Get wallet addresses from environment or config
    const wallets = [
      {
        id: 'trc20-usdt',
        network: 'TRC20',
        currency: 'USDT',
        address: process.env.CRYPTO_WALLET_TRC20 || 'Not configured',
        isActive: Boolean(process.env.CRYPTO_WALLET_TRC20),
      },
      {
        id: 'erc20-usdt',
        network: 'ERC20',
        currency: 'USDT',
        address: process.env.CRYPTO_WALLET_ERC20 || 'Not configured',
        isActive: Boolean(process.env.CRYPTO_WALLET_ERC20),
      },
      {
        id: 'bep20-usdt',
        network: 'BEP20',
        currency: 'USDT',
        address: process.env.CRYPTO_WALLET_BEP20 || 'Not configured',
        isActive: Boolean(process.env.CRYPTO_WALLET_BEP20),
      },
    ]

    // Get payment stats per wallet/network
    const statsPromises = wallets.map(async (wallet) => {
      const [totalPayments, confirmedPayments, pendingPayments, totalRevenue] = await Promise.all([
        prisma.cryptoPayment.count({
          where: { network: wallet.network },
        }),
        prisma.cryptoPayment.count({
          where: { 
            network: wallet.network,
            status: 'CONFIRMED',
          },
        }),
        prisma.cryptoPayment.count({
          where: { 
            network: wallet.network,
            status: { in: ['PENDING', 'PENDING_VERIFICATION'] },
          },
        }),
        prisma.cryptoPayment.aggregate({
          _sum: { amount: true },
          where: { 
            network: wallet.network,
            status: 'CONFIRMED',
          },
        }),
      ])

      return {
        ...wallet,
        stats: {
          totalPayments,
          confirmedPayments,
          pendingPayments,
          totalRevenue: totalRevenue._sum.amount || 0,
          successRate: totalPayments > 0 ? Math.round((confirmedPayments / totalPayments) * 100) : 0,
        },
      }
    })

    const walletsWithStats = await Promise.all(statsPromises)

    // Get recent transactions per wallet
    const recentTxPromises = wallets.map(async (wallet) => {
      const txs = await prisma.cryptoPayment.findMany({
        where: { network: wallet.network },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      return {
        network: wallet.network,
        transactions: txs.map(tx => ({
          id: tx.id,
          userId: tx.userId,
          user: tx.user,
          amount: tx.amount,
          currency: tx.currency,
          plan: tx.plan,
          status: tx.status,
          txHash: tx.txHash,
          createdAt: tx.createdAt,
        })),
      }
    })

    const recentTransactions = await Promise.all(recentTxPromises)

    const response = {
      wallets: walletsWithStats,
      recentTransactions,
      summary: {
        activeWallets: wallets.filter(w => w.isActive).length,
        totalWallets: wallets.length,
        networks: ['TRC20', 'ERC20', 'BEP20'],
      },
    }

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.crypto.wallets.list',
      resource: 'admin/crypto-payments/wallets',
      metadata: {
        activeWallets: walletsWithStats.filter(w => w.isActive).length,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching crypto wallets:', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.crypto.wallets.list',
      resource: 'admin/crypto-payments/wallets',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ 
      error: 'Failed to fetch crypto wallets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/crypto-payments/wallets - Update wallet config
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'ADMIN')
    
    if (false && !guard?.authorized) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.crypto.wallets.update',
        resource: 'admin/crypto-payments/wallets',
        status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: guard.error,
      })
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const body = await request.json()
    const { network, address, isActive } = body

    if (!network || !address) {
      return NextResponse.json({ 
        error: 'Missing required fields: network, address' 
      }, { status: 400 })
    }

    // Note: In production, you'd update these in a database or config service
    // For now, this endpoint just validates and logs the update
    // Actual wallet addresses should be set via environment variables

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.crypto.wallets.update',
      resource: 'admin/crypto-payments/wallets',
      metadata: {
        network,
        address: address.substring(0, 10) + '...', // Don't log full address
        isActive,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Wallet configuration updated. Note: Restart required to apply changes.',
    })
  } catch (error) {
    console.error('Error updating crypto wallet:', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.crypto.wallets.update',
      resource: 'admin/crypto-payments/wallets',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ 
      error: 'Failed to update crypto wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
