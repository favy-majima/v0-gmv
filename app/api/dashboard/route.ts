import { NextResponse } from "next/server"
import { getDefaultData } from "@/lib/spreadsheet"

export async function GET() {
  // 一時的にダミーデータを返す
  return NextResponse.json(getDefaultData())
}
