import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim().replace(/\/+$/, "")
  
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${appUrl}/login?error=${error}`)
    }

    if (!code) {
      return NextResponse.redirect(`${appUrl}/login?error=missing_params`)
    }

    // トークン交換
    const tokenUrl = "https://business.favy.jp/oauth/token"
    const clientId = process.env.OAUTH_CLIENT_ID || ""
    const clientSecret = process.env.OAUTH_CLIENT_SECRET || ""
    const redirectUri = `${appUrl}/api/auth/callback`

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=token_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // ユーザー情報を取得（館IDを含む）
    let user = {
      id: "",
      name: "ユーザー",
      email: "",
      buildingId: "",
      buildingName: "",
    }

    try {
      const userInfoUrl = "https://business.favy.jp/api/me"
      const userResponse = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (userResponse.ok) {
        const userInfo = await userResponse.json()
        user = {
          id: userInfo.id?.toString() || "",
          name: userInfo.name || userInfo.display_name || "ユーザー",
          email: userInfo.email || "",
          buildingId: userInfo.building_id?.toString() || userInfo.facility_id?.toString() || "",
          buildingName: userInfo.building_name || userInfo.facility_name || "",
        }
      }
    } catch {
      // ユーザー情報取得失敗時はデフォルト値で続行
    }

    // セッションをCookieに保存
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify({
      user: {
        ...user,
        accessToken,
      },
      isAuthenticated: true,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.redirect(appUrl)
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
  }
}
