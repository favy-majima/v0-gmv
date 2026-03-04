import { NextResponse } from "next/server"
import { setShopSession } from "@/lib/auth"
import type { ShopUser } from "@/lib/auth-types"

// 店舗認証情報（実際の運用では環境変数やデータベースで管理）
// 形式: { shopId: { password, shopName, buildingId, buildingName } }
const SHOP_CREDENTIALS: Record<string, { password: string; shopName: string; buildingId: string; buildingName: string }> = {
  // サンプルデータ - 実際の運用では環境変数から読み込むか、データベースで管理
  "S001": { password: "shop001pass", shopName: "ラーメン太郎", buildingId: "B001", buildingName: "フードコート渋谷" },
  "S002": { password: "shop002pass", shopName: "カフェ花子", buildingId: "B001", buildingName: "フードコート渋谷" },
  "S003": { password: "shop003pass", shopName: "定食屋次郎", buildingId: "B001", buildingName: "フードコート渋谷" },
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

    await setShopSession(shopUser)

    return NextResponse.json({ success: true, shopId, shopName: shopData.shopName })
  } catch (error) {
    console.error("[v0] Shop login error:", error)
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    )
  }
}
