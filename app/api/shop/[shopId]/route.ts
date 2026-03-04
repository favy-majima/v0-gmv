import { NextResponse } from "next/server"
import { getDefaultStoreDetailData } from "@/lib/spreadsheet"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params
  // 一時的にダミーデータを返す
  return NextResponse.json(getDefaultStoreDetailData(shopId))
}
