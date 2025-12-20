import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@echoforge.com' },
    update: {},
    create: {
      email: 'demo@echoforge.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo User',
      role: 'USER',
      plan: 'PRO',
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@echoforge.com' },
    update: {},
    create: {
      email: 'admin@echoforge.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create some sample analyses
  await prisma.analysis.create({
    data: {
      userId: demoUser.id,
      type: 'ANOMALY_DETECTION',
      status: 'COMPLETED',
      fileName: 'sample_data.csv',
      fileSize: 52428,
      dataPoints: 1000,
      anomaliesFound: 15,
      accuracy: 0.95,
      processingTime: 1234,
    },
  })

  console.log('✅ Sample analysis created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
