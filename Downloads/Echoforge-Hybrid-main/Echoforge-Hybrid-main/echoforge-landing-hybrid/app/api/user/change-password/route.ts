import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found or invalid account" },
        { status: 404 }
      )
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    })

    console.log(`✅ Password changed successfully for user: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })

  } catch (error: any) {
    console.error("❌ Change password error:", error)
    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    )
  }
}
