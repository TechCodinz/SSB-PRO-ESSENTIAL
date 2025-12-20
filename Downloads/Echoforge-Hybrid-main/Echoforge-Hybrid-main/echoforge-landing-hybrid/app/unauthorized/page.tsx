"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!session) {
      router.push("/login?callbackUrl=/dashboard/admin");
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-300">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-700">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-100">Access Denied</h1>
        <p className="text-sm text-slate-400">
          You don't have the required permissions to access this area.
        </p>
        {session && (
          <p className="text-xs text-slate-500">
            Your role: {(session.user as any)?.role || "NONE"}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            Back to Dashboard
          </Link>
          {session && (
            <Link
              href="/dashboard/admin"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Try Admin Console
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
