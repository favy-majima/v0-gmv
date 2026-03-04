import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuthorizationUrl, OAUTH_CONFIG } from "@/lib/auth"

export async function GET() {
  // CSRF対策用のstateを生成
  const state = crypto.randomUUID()

  // stateをCookieに保存（コールバック時に検証）
  const cookieStore = await cookies()
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10分
    path: "/",
  })

  // 認可URLにリダイレクト
  const authUrl = getAuthorizationUrl(state)
  return NextResponse.redirect(authUrl)
}
