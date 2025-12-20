// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import { log } from './logger'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Prisma Client instance with connection pooling
 * Configure connection pool via DATABASE_URL query params:
 * ?connection_limit=10&pool_timeout=20
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    log.query(e.query, e.duration);
  });
}

// Handle connection errors
prisma.$on('error' as never, (e: Error) => {
  log.error('Database error', e);
});

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
