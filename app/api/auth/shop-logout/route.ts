import { NextResponse } from "next/server"
import { clearShopSession } from "@/lib/auth"

export async function GET() {
  try {
    await clearShopSession()
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("[v0] Shop logout error:", error)
    return NextResponse.redirect(new URL("/login?error=logout_failed", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
  }
}

export async function POST() {
  try {
    await clearShopSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Shop logout error:", error)
    return NextResponse.json(
      { error: "ログアウトに失敗しました" },
      { status: 500 }
    )
  }
}
