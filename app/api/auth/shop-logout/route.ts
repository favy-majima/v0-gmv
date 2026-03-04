import { NextResponse } from "next/server"
import { clearShopSession } from "@/lib/auth"

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
