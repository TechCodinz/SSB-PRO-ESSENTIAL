import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (!['MANAGER', 'ADMIN'].includes(role)) redirect('/dashboard')
  return <>{children}</>
}
