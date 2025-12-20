import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { simpleAuthLimiter, getClientIdentifierSimple, rateLimitResponseSimple } from "@/lib/rate-limit"

export async function POST(req: Request) {
  // Rate limiting for registration
  const identifier = getClientIdentifierSimple(req)
  const rateLimit = await simpleAuthLimiter.check(identifier)
  
  if (!rateLimit.success) {
    return rateLimitResponseSimple(rateLimit.reset)
  }
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        plan: "FREE",
        role: "USER"
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
