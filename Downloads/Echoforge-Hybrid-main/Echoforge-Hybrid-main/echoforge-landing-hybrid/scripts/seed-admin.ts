// @ts-nocheck
/**
 * Seed Admin User for Production
 * Run this once after deployment to create initial admin
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@echoforge.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@echoforge.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      emailVerified: new Date()
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12)
  
  const demo = await prisma.user.create({
    data: {
      email: 'demo@echoforge.com',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
      plan: 'PRO',
      emailVerified: new Date()
    }
  })

  console.log('✅ Demo user created:', demo.email)

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@echoforge.com / admin123')
  console.log('Demo: demo@echoforge.com / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
