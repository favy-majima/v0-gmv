import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { User, Session, ShopUser, ShopSession } from "./auth-types"

// アプリURLを正規化（余分なスペースや末尾スラッシュを除去）
const normalizeUrl = (url: string): string => {
  return url.trim().replace(/\/+$/, "")
}

const APP_URL = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")

// OAuth設定
const OAUTH_CONFIG = {
  authorizationUrl: "https://business.favy.jp/oauth/authorize",
  tokenUrl: "https://business.favy.jp/oauth/token",
  userInfoUrl: "https://business.favy.jp/api/me", // 後で変更可能
  clientId: process.env.OAUTH_CLIENT_ID || "",
  clientSecret: process.env.OAUTH_CLIENT_SECRET || "",
  redirectUri: `${APP_URL}/api/auth/callback`,
}

export type { User, Session, ShopUser, ShopSession }

// セッションCookie名
const SESSION_COOKIE = "favy_session"
const SHOP_SESSION_COOKIE = "favy_shop_session"

// セッションを取得
export async function getSession(): Promise<Session> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return { user: null, isAuthenticated: false }
  }

  try {
    const user = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    )
    return { user, isAuthenticated: true }
  } catch {
    return { user: null, isAuthenticated: false }
  }
}

// セッションを設定
export async function setSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = Buffer.from(JSON.stringify(user)).toString("base64")

  cookieStore.set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: "/",
  })
}

// セッションを削除
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// 認可URLを生成
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: "code",
    state,
  })

  return `${OAUTH_CONFIG.authorizationUrl}?${params.toString()}`
}

// アクセストークンを取得
export async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string; token_type: string; expires_in?: number }> {
  console.log("[v0] Token exchange request:", {
    tokenUrl: OAUTH_CONFIG.tokenUrl,
    clientId: OAUTH_CONFIG.clientId ? "present" : "missing",
    clientSecret: OAUTH_CONFIG.clientSecret ? "present" : "missing",
    redirectUri: OAUTH_CONFIG.redirectUri,
  })

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
    }),
  })

  console.log("[v0] Token response status:", response.status)

  if (!response.ok) {
    const error = await response.text()
    console.error("[v0] Token exchange error:", error)
    throw new Error(`Token exchange failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log("[v0] Token data keys:", Object.keys(data))
  return data
}

// ユーザー情報を取得
export async function fetchUserInfo(accessToken: string): Promise<User> {
  const response = await fetch(OAUTH_CONFIG.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user info")
  }

  const data = await response.json()

  // APIレスポンス形式に応じて調整が必要
  return {
    id: data.id?.toString() || data.sub || "",
    name: data.name || data.username || "",
    email: data.email || "",
    accessToken,
  }
}

// 認証が必要なページで使用
export async function requireAuth(): Promise<User> {
  const session = await getSession()

  if (!session.isAuthenticated || !session.user) {
    redirect("/login")
  }

  return session.user
}

// 店舗セッションを取得
export async function getShopSession(): Promise<ShopSession> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SHOP_SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return { user: null, isAuthenticated: false }
  }

  try {
    const user = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    )
    return { user, isAuthenticated: true }
  } catch {
    return { user: null, isAuthenticated: false }
  }
}

// 店舗セッションを設定
export async function setShopSession(user: ShopUser): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = Buffer.from(JSON.stringify(user)).toString("base64")

  cookieStore.set(SHOP_SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: "/",
  })
}

// 店舗セッションを削除
export async function clearShopSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SHOP_SESSION_COOKIE)
}

// 店舗認証が必要なページで使用
export async function requireShopAuth(): Promise<ShopUser> {
  const session = await getShopSession()

  if (!session.isAuthenticated || !session.user) {
    redirect("/shop-login")
  }

  return session.user
}

export { OAUTH_CONFIG }
