import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        company: true,
        phone: true,
        analysesCount: true,
        apiCallsCount: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, company, phone } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(company && { company }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
