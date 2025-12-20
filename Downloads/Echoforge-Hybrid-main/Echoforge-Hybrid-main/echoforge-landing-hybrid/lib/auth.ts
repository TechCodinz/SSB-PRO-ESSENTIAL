// @ts-nocheck
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Plan } from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import {
  normalizeAdminRole,
  ROLE_PRIORITY,
} from "./rbac"

// Get auth secret directly to avoid module import issues
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-secret-change-me-in-production"

type AppUserRole = "READ_ONLY" | "MODERATOR" | "ADMIN" | "OWNER" | "USER" | "EMPLOYEE" | "MANAGER";

const MFA_PLACEHOLDER_MIN_ROLE = "MODERATOR" as const
const ENFORCE_ADMIN_MFA = process.env.ENFORCE_ADMIN_MFA === "true"
const ENABLE_MFA_PLACEHOLDER = process.env.ENABLE_MFA_PLACEHOLDER !== "false"

function shouldRequireMfa(role?: string | null) {
  const normalized = normalizeAdminRole(role)
  if (!normalized) {
    return false
  }
  return ROLE_PRIORITY[normalized] >= ROLE_PRIORITY[MFA_PLACEHOLDER_MIN_ROLE]
}

function logMfaPlaceholder(email: string, providedToken?: string | null) {
  if (!ENABLE_MFA_PLACEHOLDER) {
    return
  }
  console.info(
    `[security][mfa-placeholder] Pending MFA verification for ${email}. tokenProvided=${Boolean(
      providedToken,
    )}`,
  )
}

type FallbackAccount = {
  email: string
  password: string
  name: string
  role: AppUserRole
  plan: Plan
}

/**
 * Production-Safe Default Accounts
 * 
 * SECURITY: In production mode, accounts are ONLY created if:
 * 1. Passwords are provided via environment variables
 * 2. Passwords meet minimum security requirements (12+ chars)
 * 3. Passwords contain complexity requirements
 * 
 * In development, fallback passwords are allowed but logged as warnings.
 */
const DEFAULT_ACCOUNTS: FallbackAccount[] = (() => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL ?? "admin@echoforge.com").toLowerCase();
  const demoEmail = (process.env.DEFAULT_DEMO_EMAIL ?? "demo@echoforge.com").toLowerCase();

  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const demoPassword = process.env.DEFAULT_DEMO_PASSWORD;

  // Password strength validation
  const isStrongPassword = (password: string | undefined): boolean => {
    if (!password || password.length < 12) return false;
    // Require at least: 1 uppercase, 1 lowercase, 1 number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUppercase && hasLowercase && hasNumber;
  };

  const accounts: FallbackAccount[] = [];

  if (isProduction) {
    // PRODUCTION: Strict security enforcement
    if (adminPassword && isStrongPassword(adminPassword)) {
      accounts.push({
        email: adminEmail,
        password: adminPassword,
        name: process.env.DEFAULT_ADMIN_NAME ?? "Admin User",
        role: "ADMIN",
        plan: Plan.ENTERPRISE,
      });
    } else if (adminPassword) {
      console.error('[SECURITY] DEFAULT_ADMIN_PASSWORD provided but does not meet strength requirements (12+ chars, upper/lower/number)');
    }

    if (demoPassword && isStrongPassword(demoPassword)) {
      accounts.push({
        email: demoEmail,
        password: demoPassword,
        name: process.env.DEFAULT_DEMO_NAME ?? "Demo User",
        role: "USER",
        plan: Plan.PRO,
      });
    } else if (demoPassword) {
      console.error('[SECURITY] DEFAULT_DEMO_PASSWORD provided but does not meet strength requirements');
    }

    if (accounts.length === 0) {
      console.warn('[AUTH] No default accounts configured. Users must register or be seeded via database.');
    }
  } else if (isDevelopment) {
    // DEVELOPMENT: Allow fallbacks but log warnings
    if (!adminPassword) {
      console.warn('[DEV-SECURITY] Using fallback admin password. Set DEFAULT_ADMIN_PASSWORD in production!');
    }
    accounts.push({
      email: adminEmail,
      password: adminPassword || 'DevAdmin2024!', // Stronger dev fallback
      name: process.env.DEFAULT_ADMIN_NAME ?? "Admin User",
      role: "ADMIN",
      plan: Plan.ENTERPRISE,
    });

    if (!demoPassword) {
      console.warn('[DEV-SECURITY] Using fallback demo password. Set DEFAULT_DEMO_PASSWORD in production!');
    }
    accounts.push({
      email: demoEmail,
      password: demoPassword || 'DevDemo2024!', // Stronger dev fallback
      name: process.env.DEFAULT_DEMO_NAME ?? "Demo User",
      role: "USER",
      plan: Plan.PRO,
    });
  }
  // In other environments (test, etc.), no accounts are auto-created

  return accounts;
})();

function findFallbackAccount(email: string): FallbackAccount | undefined {
  const normalized = email.toLowerCase()
  return DEFAULT_ACCOUNTS.find((account) => account.email === normalized)
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      mfaToken: { label: "One-Time Code", type: "text", optional: true },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials")
      }

      try {
        const normalizedEmail = credentials.email.trim().toLowerCase()

        const fallbackAccount = findFallbackAccount(normalizedEmail)

        let user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            plan: true,
          }
        })

        if (!user && fallbackAccount) {
          try {
            user = await prisma.user.create({
              data: {
                email: fallbackAccount.email,
                password: await bcrypt.hash(fallbackAccount.password, 10),
                name: fallbackAccount.name,
                role: fallbackAccount.role,
                plan: fallbackAccount.plan,
              },
            })
          } catch (createError) {
            // Handle race condition where the user was seeded elsewhere
            user = await prisma.user.findUnique({
              where: { email: normalizedEmail },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                plan: true,
              }
            })
          }
        }

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        let passwordMatches = await bcrypt.compare(
          credentials.password,
          user.password,
        )

        if (!passwordMatches && fallbackAccount && credentials.password === fallbackAccount.password) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              password: await bcrypt.hash(fallbackAccount.password, 10),
              role: fallbackAccount.role,
              plan: fallbackAccount.plan,
            },
          })
          passwordMatches = true
        }

        if (fallbackAccount && (!user.role || !user.plan)) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: fallbackAccount.role,
              plan: fallbackAccount.plan,
            },
          })
        }

        if (!passwordMatches) {
          throw new Error("Invalid credentials")
        }

        const requiresMfa = shouldRequireMfa(user.role)
        if (requiresMfa) {
          if (ENFORCE_ADMIN_MFA && !credentials.mfaToken) {
            throw new Error("MFA token required for administrative accounts")
          }
          logMfaPlaceholder(user.email, credentials.mfaToken)
        }

        // Ensure role is properly set - use fallback account role if user role is missing
        const normalizedRole = (user.role || fallbackAccount?.role || "USER") as AppUserRole;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          plan: user.plan || 'FREE',
          mfaRequired: requiresMfa,
          ssoProvider: null,
        } as any
      } catch (error) {
        // Error logging handled by NextAuth
        // Re-throw the original error message if it's a specific error
        if (error instanceof Error && error.message !== "Authentication failed - Please contact support") {
          throw error;
        }
        throw new Error("Authentication failed - Please check your email and password")
      }
    },
  }),
]

// SSO provider placeholders - fully active once the environment variables are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  )
}

if (
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_TENANT_ID
) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.plan = user.plan
        token.mfaRequired = (user as any).mfaRequired ?? false
        token.ssoProvider = account?.provider ?? null
      }
      // Refresh role on update
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, plan: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.plan = dbUser.plan
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          plan: token.plan,
          mfaRequired: token.mfaRequired ?? false,
          ssoProvider: token.ssoProvider ?? null,
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Always allow explicit URLs to pass through
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`
    }
  },
  secret: AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
