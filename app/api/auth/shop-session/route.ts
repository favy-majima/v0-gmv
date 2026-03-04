import { NextResponse } from "next/server"
import { getShopSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getShopSession()
    return NextResponse.json(session)
  } catch (error) {
    console.error("[v0] Shop session error:", error)
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 200 }
    )
  }
}
