import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (sessionCookie) {
      const session = JSON.parse(sessionCookie)
      return NextResponse.json(session)
    }
  } catch {
    // パースエラー時はデフォルトを返す
  }

  return NextResponse.json({
    user: null,
    isAuthenticated: false,
  })
}
