import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    const callback = encodeURIComponent("/dashboard/admin");
    redirect(`/login?callbackUrl=${callback}`);
  }

  const role = String((session?.user as { role?: string } | undefined)?.role || '').toUpperCase();
  const adminRoles = ['ADMIN', 'OWNER', 'MODERATOR', 'READ_ONLY', 'SUPERADMIN', 'SUPER_ADMIN'];
  const isAdmin = adminRoles.includes(role);

  console.log('🔍 Admin Layout Check:', {
    email: session.user.email,
    role,
    isAdmin,
    timestamp: new Date().toISOString()
  });

  if (!isAdmin) {
    console.warn('❌ Non-admin user attempted admin access:', { email: session.user.email, role });
    redirect("/dashboard");
  }

  console.log('✅ Admin access granted:', { email: session.user.email, role });
  return <>{children}</>;
}
