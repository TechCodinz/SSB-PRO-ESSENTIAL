import { DefaultSession } from "next-auth"

type AppUserRole = "READ_ONLY" | "MODERATOR" | "ADMIN" | "OWNER" | "USER" | "EMPLOYEE" | "MANAGER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: AppUserRole
      plan: string
      mfaRequired?: boolean
      ssoProvider?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: AppUserRole
    plan: string
    mfaRequired?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: AppUserRole
    plan: string
    mfaRequired?: boolean
    ssoProvider?: string | null
  }
}
