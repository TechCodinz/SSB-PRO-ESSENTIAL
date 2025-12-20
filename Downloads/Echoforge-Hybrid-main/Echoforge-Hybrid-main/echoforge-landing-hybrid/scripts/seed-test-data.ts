// @ts-nocheck
/**
 * Test Data Generation Script
 * 
 * Generates realistic data for testing:
 * - Users with different plans
 * - Analyses with various statuses
 * - Crypto payments (pending/confirmed)
 * - API keys
 * 
 * Usage:
 *   npx tsx scripts/seed-test-data.ts
 *   
 * Or with custom count:
 *   npx tsx scripts/seed-test-data.ts --users 50 --analyses 200
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Configuration
const config = {
  users: parseInt(process.env.SEED_USERS || '25'),
  analysesPerUser: parseInt(process.env.SEED_ANALYSES || '10'),
  cryptoPayments: parseInt(process.env.SEED_PAYMENTS || '15'),
}

// Sample data
const names = [
  'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Williams', 
  'Michael Brown', 'Emily Davis', 'James Wilson', 'Jessica Taylor',
  'Daniel Martinez', 'Lisa Anderson', 'Robert Thomas', 'Jennifer Lee',
  'William Moore', 'Linda Jackson', 'Richard White', 'Barbara Harris',
  'Joseph Martin', 'Susan Thompson', 'Thomas Garcia', 'Nancy Robinson'
]

const companies = [
  'TechCorp', 'DataSolutions', 'AI Ventures', 'CloudScale', 'SecureNet',
  'FinanceHub', 'AnalyticsPro', 'CyberShield', 'SmartData', 'InnovateAI'
]

const fileNames = [
  'financial_data.csv', 'network_logs.csv', 'user_activity.json',
  'transaction_history.xlsx', 'sensor_readings.csv', 'api_logs.json',
  'sales_data.csv', 'security_events.xlsx', 'iot_telemetry.csv'
]

const plans = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as const
const analysisTypes = ['ANOMALY_DETECTION', 'CRYPTO_FRAUD', 'FORENSICS', 'PREDICTIVE'] as const
const cryptoNetworks = ['TRC20', 'ERC20', 'BEP20'] as const

// Helper functions
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateTxHash(): string {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing test data...')
  
  // Delete in order to avoid foreign key constraints
  await prisma.cryptoPayment.deleteMany({})
  await prisma.analysis.deleteMany({})
  await prisma.apiKey.deleteMany({})
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@test.com'
      }
    }
  })
  
  console.log('✅ Existing data cleared')
}

async function createUsers() {
  console.log(`👥 Creating ${config.users} test users...`)
  
  const password = await hash('Test123!', 12)
  const users = []
  
  for (let i = 0; i < config.users; i++) {
    const name = randomElement(names)
    const email = `user${i + 1}@test.com`
    const plan = randomElement(plans)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        plan,
        emailVerified: Math.random() > 0.3 ? new Date() : null,
        analysesCount: randomInt(0, 100),
        createdAt: randomDate(new Date(2024, 0, 1), new Date())
      }
    })
    
    users.push(user)
  }
  
  console.log(`✅ Created ${users.length} users`)
  return users
}

async function createAnalyses(users: any[]) {
  console.log(`📊 Creating analyses for users...`)
  
  let totalCreated = 0
  
  for (const user of users) {
    const count = randomInt(1, config.analysesPerUser)
    
    for (let i = 0; i < count; i++) {
      const createdAt = randomDate(
        user.createdAt,
        new Date()
      )
      
      const anomaliesFound = randomInt(0, 50)
      const accuracy = 0.8 + Math.random() * 0.19 // 80-99%
      const processingTime = randomInt(500, 5000)
      
      const status = Math.random() > 0.1 ? 'COMPLETED' : 
                     Math.random() > 0.5 ? 'PROCESSING' : 'FAILED'
      
      await prisma.analysis.create({
        data: {
          userId: user.id,
          type: randomElement(analysisTypes),
          status,
          fileName: randomElement(fileNames),
          dataPoints: randomInt(100, 10000),
          anomaliesFound: status === 'COMPLETED' ? anomaliesFound : null,
          accuracy: status === 'COMPLETED' ? accuracy : null,
          processingTime: status === 'COMPLETED' ? processingTime : null,
          createdAt,
          completedAt: status === 'COMPLETED' ? 
            new Date(createdAt.getTime() + processingTime) : null,
          results: status === 'COMPLETED' ? {
            config: {
              models: ['isolation_forest', 'lof'],
              sensitivity: 0.1,
              expectedRate: 0.05
            },
            anomalyIndices: Array.from({length: anomaliesFound}, (_, i) => i),
            scores: Array.from({length: 100}, () => Math.random()),
            modelResults: {
              isolation_forest: {
                accuracy: 0.95,
                anomalies: anomaliesFound
              }
            }
          } : null
        }
      })
      
      totalCreated++
    }
  }
  
  console.log(`✅ Created ${totalCreated} analyses`)
}

async function createCryptoPayments(users: any[]) {
  console.log(`💳 Creating ${config.cryptoPayments} crypto payments...`)
  
  const planPrices = {
    STARTER: 39,
    PRO: 129,
    ENTERPRISE: 1499
  }
  
  for (let i = 0; i < config.cryptoPayments; i++) {
    const user = randomElement(users.filter(u => u.plan === 'FREE'))
    const plan = randomElement(['STARTER', 'PRO', 'ENTERPRISE'] as const)
    const network = randomElement(cryptoNetworks)
    const amount = planPrices[plan]
    
    const createdAt = randomDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    )
    
    const statusRandom = Math.random()
    const status = statusRandom > 0.6 ? 'PENDING_VERIFICATION' :
                   statusRandom > 0.4 ? 'CONFIRMED' : 
                   statusRandom > 0.2 ? 'REJECTED' : 'PENDING'
    
    await prisma.cryptoPayment.create({
      data: {
        userId: user.id,
        plan,
        amount,
        currency: 'USDT',
        network,
        walletAddress: `T${Array.from({length: 33}, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          .charAt(Math.floor(Math.random() * 62))
        ).join('')}`,
        paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        txHash: status === 'CONFIRMED' || status === 'REJECTED' || status === 'PENDING_VERIFICATION' ? generateTxHash() : null,
        status: status as any,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 60 * 60 * 1000),
        submittedAt: status !== 'PENDING' ? 
          new Date(createdAt.getTime() + randomInt(60000, 600000)) : null,
        verifiedAt: status === 'CONFIRMED' || status === 'REJECTED' ?
          new Date(createdAt.getTime() + randomInt(600000, 3600000)) : null,
        verifiedBy: status === 'CONFIRMED' || status === 'REJECTED' ?
          'admin-user-id' : null
      }
    })
  }
  
  console.log(`✅ Created ${config.cryptoPayments} crypto payments`)
}

async function createAPIKeys(users: any[]) {
  console.log(`🔑 Creating API keys for some users...`)
  
  let totalCreated = 0
  
  for (const user of users) {
    if (user.plan !== 'FREE' && Math.random() > 0.5) {
      const keyCount = randomInt(1, 3)
      
      for (let i = 0; i < keyCount; i++) {
        const keyType = Math.random() > 0.5 ? 'live' : 'test'
        const key = `ek_${keyType}_` + Array.from({length: 32}, () => 
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          .charAt(Math.floor(Math.random() * 62))
        ).join('')
        
        await prisma.apiKey.create({
          data: {
            userId: user.id,
            name: `${randomElement(companies)} ${keyType === 'live' ? 'Production' : 'Testing'} Key`,
            key,
            status: Math.random() > 0.1 ? 'active' : 'revoked',
            lastUsedAt: Math.random() > 0.3 ?
              randomDate(user.createdAt, new Date()) : null,
            createdAt: randomDate(user.createdAt, new Date())
          }
        })
        
        totalCreated++
      }
    }
  }
  
  console.log(`✅ Created ${totalCreated} API keys`)
}

async function createAdminUser() {
  console.log(`👑 Creating admin user...`)
  
  const password = await hash('Admin123!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password,
      plan: 'ENTERPRISE',
      role: 'ADMIN',
      emailVerified: new Date(),
      analysesCount: 0,
      createdAt: new Date(2024, 0, 1)
    }
  })
  
  console.log(`✅ Created admin user: admin@test.com / Admin123!`)
  return admin
}

async function printSummary() {
  console.log('\n📊 Database Summary:')
  console.log('='.repeat(50))
  
  const userCount = await prisma.user.count()
  const analysisCount = await prisma.analysis.count()
  const paymentCount = await prisma.cryptoPayment.count()
  const apiKeyCount = await prisma.apiKey.count()
  
  console.log(`Users:           ${userCount}`)
  console.log(`Analyses:        ${analysisCount}`)
  console.log(`Crypto Payments: ${paymentCount}`)
  console.log(`API Keys:        ${apiKeyCount}`)
  
  const planDistribution = await prisma.user.groupBy({
    by: ['plan'],
    _count: true
  })
  
  console.log('\nPlan Distribution:')
  planDistribution.forEach(p => {
    console.log(`  ${p.plan}: ${p._count}`)
  })
  
  const paymentStatuses = await prisma.cryptoPayment.groupBy({
    by: ['status'],
    _count: true
  })
  
  console.log('\nPayment Statuses:')
  paymentStatuses.forEach(p => {
    console.log(`  ${p.status}: ${p._count}`)
  })
  
  console.log('='.repeat(50))
}

async function main() {
  console.log('🌱 Seeding test data...\n')
  
  try {
    await clearExistingData()
    const admin = await createAdminUser()
    const users = await createUsers()
    await createAnalyses(users)
    await createCryptoPayments(users)
    await createAPIKeys(users)
    await printSummary()
    
    console.log('\n✅ Test data seeding complete!')
    console.log('\n🔑 Login Credentials:')
    console.log('   Admin: admin@test.com / Admin123!')
    console.log('   Users: user1@test.com to user25@test.com / Test123!')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
