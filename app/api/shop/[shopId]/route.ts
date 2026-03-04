import { NextResponse } from "next/server"
import type { StoreDetailData, PeriodData, WeeklyData, MonthlyData, DayOfWeekHistoryData, HourlyData } from "@/lib/spreadsheet"

// ダミー店舗データ
const DUMMY_STORES: Record<string, { name: string; totalSales: number; customers: number }> = {
  "281001": { name: "鮨TOKYO「鶴亀」浜松・小田原町店", totalSales: 1850000, customers: 420 },
  "281002": { name: "inu TOKYO店", totalSales: 1250000, customers: 380 },
  "281003": { name: "Ramen凪と天つなぐ", totalSales: 980000, customers: 520 },
  "281004": { name: "焼肉DXサーロイン焼肉カルビテグ鯨理", totalSales: 2150000, customers: 310 },
  "281005": { name: "BIGGYおお!もうケーキ", totalSales: 650000, customers: 480 },
  "281006": { name: "BLOOM TOKYOカッブドンとおじパフェへ", totalSales: 780000, customers: 350 },
  "281007": { name: "Plus 汐留", totalSales: 1120000, customers: 290 },
  "281008": { name: "焼鳥おじしーレモンサワ酒場", totalSales: 920000, customers: 410 },
  "281009": { name: "寿司居酒屋一番星汐留店", totalSales: 1680000, customers: 360 },
  "281010": { name: "サラリスン 汐留", totalSales: 540000, customers: 620 },
}

function generateDummyStoreData(shopId: string): StoreDetailData {
  const store = DUMMY_STORES[shopId] || { name: "サンプル店舗", totalSales: 1000000, customers: 300 }
  const { name: storeName, totalSales, customers: totalCustomers } = store
  
  const avgPerCustomer = totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0
  const totalTables = Math.round(totalCustomers * 0.7)
  const avgPerTable = totalTables > 0 ? Math.round(totalSales / totalTables) : 0
  
  // 前払い・後払いの分割（60:40の比率）
  const prepaidRatio = 0.6
  const prepaidSales = Math.round(totalSales * prepaidRatio)
  const postpaidSales = totalSales - prepaidSales
  const prepaidCustomers = Math.round(totalCustomers * prepaidRatio)
  const postpaidCustomers = totalCustomers - prepaidCustomers
  const prepaidTables = Math.round(totalTables * prepaidRatio)
  const postpaidTables = totalTables - prepaidTables
  
  const summary = {
    totalSales,
    totalCustomers,
    totalTables,
    averagePerCustomer: avgPerCustomer,
    averagePerTable: avgPerTable,
    prepaidSales,
    postpaidSales,
    prepaidCustomers,
    postpaidCustomers,
    prepaidTables,
    postpaidTables,
    prepaidAvgPerCustomer: prepaidCustomers > 0 ? Math.round(prepaidSales / prepaidCustomers) : 0,
    postpaidAvgPerCustomer: postpaidCustomers > 0 ? Math.round(postpaidSales / postpaidCustomers) : 0,
    prepaidAvgPerTable: prepaidTables > 0 ? Math.round(prepaidSales / prepaidTables) : 0,
    postpaidAvgPerTable: postpaidTables > 0 ? Math.round(postpaidSales / postpaidTables) : 0,
  }
  
  const products = [
    { productName: "ランチセット", quantity: 180, sales: Math.round(totalSales * 0.25), prepaidQuantity: 108, postpaidQuantity: 72, prepaidSales: Math.round(totalSales * 0.15), postpaidSales: Math.round(totalSales * 0.10) },
    { productName: "ディナーコース", quantity: 85, sales: Math.round(totalSales * 0.35), prepaidQuantity: 51, postpaidQuantity: 34, prepaidSales: Math.round(totalSales * 0.21), postpaidSales: Math.round(totalSales * 0.14) },
    { productName: "生ビール", quantity: 420, sales: Math.round(totalSales * 0.15), prepaidQuantity: 252, postpaidQuantity: 168, prepaidSales: Math.round(totalSales * 0.09), postpaidSales: Math.round(totalSales * 0.06) },
    { productName: "ハイボール", quantity: 280, sales: Math.round(totalSales * 0.12), prepaidQuantity: 168, postpaidQuantity: 112, prepaidSales: Math.round(totalSales * 0.072), postpaidSales: Math.round(totalSales * 0.048) },
    { productName: "デザート盛り合わせ", quantity: 95, sales: Math.round(totalSales * 0.08), prepaidQuantity: 57, postpaidQuantity: 38, prepaidSales: Math.round(totalSales * 0.048), postpaidSales: Math.round(totalSales * 0.032) },
  ]
  
  const combinations = [
    { products: ["ランチセット", "生ビール"], count: 45, totalSales: Math.round(totalSales * 0.08), prepaidCount: 27, postpaidCount: 18, prepaidSales: Math.round(totalSales * 0.048), postpaidSales: Math.round(totalSales * 0.032) },
    { products: ["ディナーコース", "生ビール", "デザート盛り合わせ"], count: 32, totalSales: Math.round(totalSales * 0.15), prepaidCount: 19, postpaidCount: 13, prepaidSales: Math.round(totalSales * 0.09), postpaidSales: Math.round(totalSales * 0.06) },
    { products: ["ランチセット"], count: 28, totalSales: Math.round(totalSales * 0.04), prepaidCount: 17, postpaidCount: 11, prepaidSales: Math.round(totalSales * 0.024), postpaidSales: Math.round(totalSales * 0.016) },
    { products: ["生ビール", "ハイボール"], count: 22, totalSales: Math.round(totalSales * 0.03), prepaidCount: 13, postpaidCount: 9, prepaidSales: Math.round(totalSales * 0.018), postpaidSales: Math.round(totalSales * 0.012) },
  ]
  
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
  const dayMultipliers: Record<string, number> = { "月": 0.8, "火": 0.85, "水": 0.9, "木": 0.95, "金": 1.2, "土": 1.3, "日": 1.1 }

  // 曜日別データ（12週分）
  const dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]> = {
    "月": [], "火": [], "水": [], "木": [], "金": [], "土": [], "日": []
  }
  
  for (let i = 0; i < 84; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = dayNames[date.getDay()]
    const multiplier = dayMultipliers[dayName]
    const dailyCustomers = Math.round((totalCustomers / 30) * multiplier * (0.8 + Math.random() * 0.4))
    const dailySales = Math.round(dailyCustomers * avgPerCustomer * (0.9 + Math.random() * 0.2))
    const prepaidDailyCustomers = Math.round(dailyCustomers * prepaidRatio)
    const postpaidDailyCustomers = dailyCustomers - prepaidDailyCustomers
    
    dayOfWeekHistory[dayName].push({
      date: date.toISOString().split("T")[0],
      customers: dailyCustomers,
      averagePerCustomer: dailyCustomers > 0 ? Math.round(dailySales / dailyCustomers) : 0,
      prepaidCustomers: prepaidDailyCustomers,
      postpaidCustomers: postpaidDailyCustomers,
      prepaidAvgPerCustomer: prepaidDailyCustomers > 0 ? Math.round((dailySales * prepaidRatio) / prepaidDailyCustomers) : 0,
      postpaidAvgPerCustomer: postpaidDailyCustomers > 0 ? Math.round((dailySales * (1 - prepaidRatio)) / postpaidDailyCustomers) : 0,
    })
  }
  
  // 時間帯別データ（各曜日）
  const hourlyDataByDayOfWeek: Record<string, HourlyData[]> = {}
  const hours = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]
  const hourMultipliers = [0.5, 1.2, 1.0, 0.4, 0.3, 0.4, 0.8, 1.3, 1.4, 1.2, 0.8]
  
  for (const day of Object.keys(dayMultipliers)) {
    hourlyDataByDayOfWeek[day] = hours.map((hour, idx) => {
      const baseCustomers = Math.round((totalCustomers / 30 / 11) * dayMultipliers[day] * hourMultipliers[idx])
      const prepaidHourlyCustomers = Math.round(baseCustomers * prepaidRatio)
      const postpaidHourlyCustomers = baseCustomers - prepaidHourlyCustomers
      return {
        hour,
        customers: baseCustomers,
        averagePerCustomer: avgPerCustomer,
        prepaidCustomers: prepaidHourlyCustomers,
        postpaidCustomers: postpaidHourlyCustomers,
        prepaidAvgPerCustomer: Math.round(avgPerCustomer * 1.1),
        postpaidAvgPerCustomer: Math.round(avgPerCustomer * 0.9),
      }
    })
  }
  
  // 日別データ（28日分）
  const periodData: PeriodData[] = []
  for (let i = 27; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = dayNames[date.getDay()]
    const multiplier = dayMultipliers[dayName]
    const dailySales = Math.round((totalSales / 30) * multiplier * (0.8 + Math.random() * 0.4))
    const dailyCustomers = Math.round((totalCustomers / 30) * multiplier * (0.8 + Math.random() * 0.4))
    const prepaidDailySales = Math.round(dailySales * prepaidRatio)
    const postpaidDailySales = dailySales - prepaidDailySales
    const prepaidDailyCustomers = Math.round(dailyCustomers * prepaidRatio)
    const postpaidDailyCustomers = dailyCustomers - prepaidDailyCustomers
    
    periodData.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      sales: dailySales,
      customers: dailyCustomers,
      averagePerCustomer: dailyCustomers > 0 ? Math.round(dailySales / dailyCustomers) : 0,
      prepaidSales: prepaidDailySales,
      postpaidSales: postpaidDailySales,
      prepaidCustomers: prepaidDailyCustomers,
      postpaidCustomers: postpaidDailyCustomers,
      prepaidAvgPerCustomer: prepaidDailyCustomers > 0 ? Math.round(prepaidDailySales / prepaidDailyCustomers) : 0,
      postpaidAvgPerCustomer: postpaidDailyCustomers > 0 ? Math.round(postpaidDailySales / postpaidDailyCustomers) : 0,
    })
  }
  
  // 週別データ（12週分）
  const weeklyData: WeeklyData[] = []
  for (let i = 11; i >= 0; i--) {
    const weekSales = Math.round((totalSales / 4) * (0.85 + Math.random() * 0.3))
    const weekCustomers = Math.round((totalCustomers / 4) * (0.85 + Math.random() * 0.3))
    const prepaidWeekSales = Math.round(weekSales * prepaidRatio)
    const postpaidWeekSales = weekSales - prepaidWeekSales
    const prepaidWeekCustomers = Math.round(weekCustomers * prepaidRatio)
    const postpaidWeekCustomers = weekCustomers - prepaidWeekCustomers
    
    weeklyData.push({
      week: `${12 - i}週前`,
      sales: weekSales,
      customers: weekCustomers,
      averagePerCustomer: weekCustomers > 0 ? Math.round(weekSales / weekCustomers) : 0,
      prepaidSales: prepaidWeekSales,
      postpaidSales: postpaidWeekSales,
      prepaidCustomers: prepaidWeekCustomers,
      postpaidCustomers: postpaidWeekCustomers,
      prepaidAvgPerCustomer: prepaidWeekCustomers > 0 ? Math.round(prepaidWeekSales / prepaidWeekCustomers) : 0,
      postpaidAvgPerCustomer: postpaidWeekCustomers > 0 ? Math.round(postpaidWeekSales / postpaidWeekCustomers) : 0,
    })
  }
  // 最新を「今週」に
  weeklyData[weeklyData.length - 1].week = "今週"
  
  // 月別データ（12ヶ月分）
  const monthlyData: MonthlyData[] = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthSales = Math.round(totalSales * (0.85 + Math.random() * 0.3))
    const monthCustomers = Math.round(totalCustomers * (0.85 + Math.random() * 0.3))
    const prepaidMonthSales = Math.round(monthSales * prepaidRatio)
    const postpaidMonthSales = monthSales - prepaidMonthSales
    const prepaidMonthCustomers = Math.round(monthCustomers * prepaidRatio)
    const postpaidMonthCustomers = monthCustomers - prepaidMonthCustomers
    
    monthlyData.push({
      month: `${date.getMonth() + 1}月`,
      sales: monthSales,
      customers: monthCustomers,
      averagePerCustomer: monthCustomers > 0 ? Math.round(monthSales / monthCustomers) : 0,
      prepaidSales: prepaidMonthSales,
      postpaidSales: postpaidMonthSales,
      prepaidCustomers: prepaidMonthCustomers,
      postpaidCustomers: postpaidMonthCustomers,
      prepaidAvgPerCustomer: prepaidMonthCustomers > 0 ? Math.round(prepaidMonthSales / prepaidMonthCustomers) : 0,
      postpaidAvgPerCustomer: postpaidMonthCustomers > 0 ? Math.round(postpaidMonthSales / postpaidMonthCustomers) : 0,
    })
  }
  
  const generatePeriodData = (multiplier: number) => ({
    summary: {
      ...summary,
      totalSales: Math.round(summary.totalSales * multiplier),
      totalCustomers: Math.round(summary.totalCustomers * multiplier),
      totalTables: Math.round(summary.totalTables * multiplier),
      prepaidSales: Math.round(summary.prepaidSales * multiplier),
      postpaidSales: Math.round(summary.postpaidSales * multiplier),
      prepaidCustomers: Math.round(summary.prepaidCustomers * multiplier),
      postpaidCustomers: Math.round(summary.postpaidCustomers * multiplier),
      prepaidTables: Math.round(summary.prepaidTables * multiplier),
      postpaidTables: Math.round(summary.postpaidTables * multiplier),
    },
    products: products.map(p => ({
      ...p,
      quantity: Math.round(p.quantity * multiplier),
      sales: Math.round(p.sales * multiplier),
      prepaidQuantity: Math.round(p.prepaidQuantity * multiplier),
      postpaidQuantity: Math.round(p.postpaidQuantity * multiplier),
      prepaidSales: Math.round(p.prepaidSales * multiplier),
      postpaidSales: Math.round(p.postpaidSales * multiplier),
    })),
    combinations: combinations.map(c => ({
      ...c,
      count: Math.round(c.count * multiplier),
      totalSales: Math.round(c.totalSales * multiplier),
      prepaidCount: Math.round(c.prepaidCount * multiplier),
      postpaidCount: Math.round(c.postpaidCount * multiplier),
      prepaidSales: Math.round(c.prepaidSales * multiplier),
      postpaidSales: Math.round(c.postpaidSales * multiplier),
    })),
  })
  
  return {
    storeId: shopId,
    storeName,
    today: generatePeriodData(1 / 30),
    thisMonth: generatePeriodData(1),
    lastMonth: generatePeriodData(0.95),
    dayOfWeekHistory,
    hourlyDataByDayOfWeek,
    periodData,
    weeklyData,
    monthlyData,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params
  return NextResponse.json(generateDummyStoreData(shopId))
}
