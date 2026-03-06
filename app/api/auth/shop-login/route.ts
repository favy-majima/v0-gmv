import { NextResponse } from "next/server"
import type { ShopUser } from "@/lib/auth-types"

// 店舗認証情報（実際の運用では環境変数やデータベースで管理）
// 形式: { shopId: { password, shopName, buildingId, buildingName } }
const SHOP_CREDENTIALS: Record<string, { password: string; shopName: string; buildingId: string; buildingName: string }> = {
  // サンプルデータ - 実際の運用では環境変数から読み込むか、データベースで管理
  "281001": { password: "pass281001", shopName: "鮨TOKYO「鶴亀」浜松・小田原町店", buildingId: "B001", buildingName: "GMV館" },
  "281002": { password: "pass281002", shopName: "inu TOKYO店", buildingId: "B001", buildingName: "GMV館" },
  "281003": { password: "pass281003", shopName: "Ramen凪と天つなぐ", buildingId: "B001", buildingName: "GMV館" },
  "281004": { password: "pass281004", shopName: "焼肉DXサーロイン焼肉カルビテグ鯨理", buildingId: "B001", buildingName: "GMV館" },
  "281005": { password: "pass281005", shopName: "BIGGYおお!もうケーキ", buildingId: "B001", buildingName: "GMV館" },
  "281006": { password: "pass281006", shopName: "BLOOM TOKYOカッブドンとおじパフェへ", buildingId: "B001", buildingName: "GMV館" },
  "281007": { password: "pass281007", shopName: "Plus 汐留", buildingId: "B001", buildingName: "GMV館" },
  "281008": { password: "pass281008", shopName: "焼鳥おじしーレモンサワ酒場", buildingId: "B001", buildingName: "GMV館" },
  "281009": { password: "pass281009", shopName: "寿司居酒屋一番星汐留店", buildingId: "B001", buildingName: "GMV館" },
  "281010": { password: "pass281010", shopName: "サラリスン 汐留", buildingId: "B001", buildingName: "GMV館" },
}

// 環境変数から追加の店舗認証情報を読み込む
function getShopCredentials(): typeof SHOP_CREDENTIALS {
  const credentials = { ...SHOP_CREDENTIALS }
  
  // 環境変数 SHOP_CREDENTIALS_JSON から追加の認証情報を読み込む
  // 形式: [{"shopId":"S004","password":"pass","shopName":"店舗名","buildingId":"B001","buildingName":"ビル名"}]
  const envCredentials = process.env.SHOP_CREDENTIALS_JSON
  if (envCredentials) {
    try {
      const parsed = JSON.parse(envCredentials)
      for (const shop of parsed) {
        credentials[shop.shopId] = {
          password: shop.password,
          shopName: shop.shopName,
          buildingId: shop.buildingId,
          buildingName: shop.buildingName,
        }
      }
    } catch (e) {
      console.error("[v0] Failed to parse SHOP_CREDENTIALS_JSON:", e)
    }
  }
  
  return credentials
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopId, password } = body

    if (!shopId || !password) {
      return NextResponse.json(
        { error: "店舗IDとパスワードを入力してください" },
        { status: 400 }
      )
    }

    const credentials = getShopCredentials()
    const shopData = credentials[shopId]

    if (!shopData || shopData.password !== password) {
      return NextResponse.json(
        { error: "店舗IDまたはパスワードが正しくありません" },
        { status: 401 }
      )
    }

    // 店舗ユーザーセッションを作成
    const shopUser: ShopUser = {
      shopId,
      shopName: shopData.shopName,
      buildingId: shopData.buildingId,
      buildingName: shopData.buildingName,
      userType: "shop",
    }

    // Cookieにセッション情報を設定
    const sessionData = Buffer.from(JSON.stringify(shopUser)).toString("base64")
    const isProduction = process.env.NODE_ENV === "production"
    
    const response = NextResponse.json({ success: true, shopId, shopName: shopData.shopName })
    response.cookies.set("favy_shop_session", sessionData, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Shop login error:", error)
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    )
  }
}
