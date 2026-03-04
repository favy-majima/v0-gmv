export interface StoreData {
  storeId: string
  storeName: string
  totalSales: number
  customers: number
  averagePerCustomer: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

// 商品データの型
export interface ProductData {
  productName: string
  quantity: number
  sales: number
  prepaidQuantity: number
  postpaidQuantity: number
  prepaidSales: number
  postpaidSales: number
}

// 商品組み合わせデータの型
export interface ProductCombination {
  products: string[]
  count: number
  totalSales: number
  prepaidCount: number
  postpaidCount: number
  prepaidSales: number
  postpaidSales: number
}

// 店舗詳細サマリーの型
export interface StoreDetailSummary {
  totalSales: number
  totalCustomers: number
  totalTables: number
  averagePerCustomer: number
  averagePerTable: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidTables: number
  postpaidTables: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
  prepaidAvgPerTable: number
  postpaidAvgPerTable: number
}

// 期間別店舗詳細の型
export interface StoreDetailPeriod {
  summary: StoreDetailSummary
  products: ProductData[]
  combinations: ProductCombination[]
}

// 店舗詳細データの型
export interface StoreDetailData {
  storeId: string
  storeName: string
  today: StoreDetailPeriod
  thisMonth: StoreDetailPeriod
  lastMonth: StoreDetailPeriod
  dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]>
  hourlyDataByDayOfWeek: Record<string, HourlyData[]>
  periodData: PeriodData[]
  weeklyData: WeeklyData[]
  monthlyData: MonthlyData[]
}

export interface DailyData {
  day: string
  customers: number
  averagePerCustomer: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

export interface DayOfWeekHistoryData {
  date: string
  customers: number
  averagePerCustomer: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

// 時間帯別データの型
export interface HourlyData {
  hour: string
  customers: number
  averagePerCustomer: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

export interface PeriodData {
  date: string
  sales: number
  customers: number
  averagePerCustomer: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

export interface MonthlyData {
  month: string
  sales: number
  customers: number
  averagePerCustomer: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

export interface WeeklyData {
  week: string
  sales: number
  customers: number
  averagePerCustomer: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
}

export interface SummaryData {
  totalSales: number
  totalCustomers: number
  averagePerCustomer: number
  averagePerTable: number
  prepaidSales: number
  postpaidSales: number
  prepaidCustomers: number
  postpaidCustomers: number
  prepaidAvgPerCustomer: number
  postpaidAvgPerCustomer: number
  prepaidAvgPerTable: number
  postpaidAvgPerTable: number
}

export interface PeriodSummary {
  summary: SummaryData
  stores: StoreData[]
}

export interface DashboardData {
  today: PeriodSummary
  thisMonth: PeriodSummary
  lastMonth: PeriodSummary
  dailyData: DailyData[]
  dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]>
  hourlyDataByDayOfWeek: Record<string, HourlyData[]>
  periodData: PeriodData[]
  weeklyData: WeeklyData[]
  monthlyData: MonthlyData[]
}

// 注文データの型（CSVの1行 = 商品1つ）
interface OrderRow {
  datetime: Date
  buildingId: string
  buildingName: string
  storeId: string
  storeName: string
  paymentId: string
  partySize: number // 人数
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  paymentType: "prepaid" | "postpaid"
}

// 集計済みトランザクションの型（決済単位）
interface Transaction {
  datetime: Date
  storeId: string
  storeName: string
  sales: number
  customers: number
  tables: number
  paymentType: "prepaid" | "postpaid"
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  let current = ""
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    const nextChar = csv[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされた引用符 ""
        current += '"'
        i++
      } else {
        // 引用符の開始/終了
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim())
      current = ""
    } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
      // 行の終わり（引用符の外）
      if (char === "\r") i++ // \r\n の場合
      row.push(current.trim())
      if (row.length > 1 || row[0] !== "") {
        rows.push(row)
      }
      row = []
      current = ""
    } else {
      current += char
    }
  }

  // 最後の行
  row.push(current.trim())
  if (row.length > 1 || row[0] !== "") {
    rows.push(row)
  }

  return rows
}

function parseDate(dateStr: string): Date | null {
  // 様々な日付形式に対応（タイムゾーンずれを防止するためyear/month/dayを手動パース）
  // "2025/02/01 12:30", "2025-02-01 12:30", "2025/02/01", "2025-02-01"
  const normalized = dateStr.trim().replace(/-/g, "/")
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const hours = match[4] ? Number(match[4]) : 0
  const minutes = match[5] ? Number(match[5]) : 0
  return new Date(year, month, day, hours, minutes)
}

function getDayOfWeek(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"]
  return days[date.getDay()]
}

function formatMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}/${month}`
}

function formatDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

export async function fetchSpreadsheetData(
  csvUrl: string
): Promise<DashboardData> {
  try {
    // リダイレクトを手動追従
    let response = await fetch(csvUrl, { redirect: "manual" })
    if (response.status === 307 || response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get("location")
      if (redirectUrl) {
        response = await fetch(redirectUrl)
      }
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }
    const csv = await response.text()
    const rows = parseCSV(csv)

    // ヘッダー行をスキップして注文データをパース
    // CSV列: オーダー日時, 館ID, 館名, 店舗ID, 店舗名, 決済ID, 人数, 商品名, 数量, 単価, 合計金額, 決済種別
    const dataRows = rows.slice(1)
    const orderRows: OrderRow[] = []

    for (const row of dataRows) {
      if (row.length >= 12 && row[0]) {
        const datetime = parseDate(row[0])
        if (datetime) {
          const paymentTypeRaw = row[11]?.trim().toLowerCase() || ""
          const paymentType: "prepaid" | "postpaid" =
            paymentTypeRaw === "事前" ||
            paymentTypeRaw === "事前決済" ||
            paymentTypeRaw === "prepaid"
              ? "prepaid"
              : "postpaid"

          orderRows.push({
            datetime,
            buildingId: row[1],
            buildingName: row[2],
            storeId: row[3],
            storeName: row[4],
            paymentId: row[5],
            partySize: Number(row[6]) || 1,
            productName: row[7],
            quantity: Number(row[8]) || 1,
            unitPrice: Number(row[9]) || 0,
            totalPrice: Number(row[10]) || 0,
            paymentType,
          })
        }
      }
    }

    // 決済ID + 日付でグルーピングしてトランザクションに変換
    // （同じ決済IDでも別日なら別テーブルとして扱う）
    const paymentMap = new Map<string, {
      datetime: Date
      storeId: string
      storeName: string
      sales: number
      partySize: number
      paymentType: "prepaid" | "postpaid"
    }>()

    for (const order of orderRows) {
      const dateKey = `${order.datetime.getFullYear()}-${order.datetime.getMonth()}-${order.datetime.getDate()}`
      const groupKey = `${order.paymentId}_${dateKey}`
      const existing = paymentMap.get(groupKey)
      if (existing) {
        // 同じ決済ID+日付の場合、売上を加算し、人数は最大値を保持
        existing.sales += order.totalPrice
        existing.partySize = Math.max(existing.partySize, order.partySize)
      } else {
        // 新しい決済ID+日付
        paymentMap.set(groupKey, {
          datetime: order.datetime,
          storeId: order.storeId,
          storeName: order.storeName,
          sales: order.totalPrice,
          partySize: order.partySize,
          paymentType: order.paymentType,
        })
      }
    }

    // トランザクションデータに変換
    const transactions: Transaction[] = Array.from(paymentMap.entries()).map(
      ([, data]) => ({
        datetime: data.datetime,
        storeId: data.storeId,
        storeName: data.storeName,
        sales: data.sales,
        customers: data.partySize, // 人数 = 客数
        tables: 1, // 1決済 = 1テーブル
        paymentType: data.paymentType,
      })
    )

    // 店舗別集計（storeIdをキーに）
    const storeMap = new Map<
      string,
      { storeId: string; storeName: string; sales: number; customers: number; tables: number }
    >()
    for (const tx of transactions) {
      const existing = storeMap.get(tx.storeId) || {
        storeId: tx.storeId,
        storeName: tx.storeName,
        sales: 0,
        customers: 0,
        tables: 0,
      }
      storeMap.set(tx.storeId, {
        storeId: tx.storeId,
        storeName: tx.storeName,
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
        tables: existing.tables + tx.tables,
      })
    }

    const stores: StoreData[] = Array.from(storeMap.values())
      .map((data) => ({
        storeId: data.storeId,
        storeName: data.storeName,
        totalSales: data.sales,
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }))
      .sort((a, b) => b.totalSales - a.totalSales)

    // 曜日別集計
    const dayMap = new Map<string, { sales: number; customers: number }>()
    const dayOrder = ["月", "火", "水", "木", "金", "土", "日"]
    for (const day of dayOrder) {
      dayMap.set(day, { sales: 0, customers: 0 })
    }

    for (const tx of transactions) {
      const day = getDayOfWeek(tx.datetime)
      const existing = dayMap.get(day)!
      dayMap.set(day, {
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
      })
    }

    const dailyData: DailyData[] = dayOrder.map((day) => {
      const data = dayMap.get(day)!
      return {
        day,
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }
    })

    // 曜日別の過去12週分のデータ
    const dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]> = {}
    for (const day of dayOrder) {
      dayOfWeekHistory[day] = []
    }

    // 日付ごとに集計（曜日別履歴用）
    const dateHistoryMap = new Map<string, { day: string; sales: number; customers: number; date: Date }>()
    for (const tx of transactions) {
      const dateKey = tx.datetime.toISOString().split("T")[0]
      const day = getDayOfWeek(tx.datetime)
      const existing = dateHistoryMap.get(dateKey) || { day, sales: 0, customers: 0, date: tx.datetime }
      dateHistoryMap.set(dateKey, {
        day,
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
        date: tx.datetime,
      })
    }

    // 曜日ごとにグループ化して直近12週分を取得
    const sortedDates = Array.from(dateHistoryMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))

    for (const [, data] of sortedDates) {
      const historyItem: DayOfWeekHistoryData = {
        date: formatDate(data.date),
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }
      dayOfWeekHistory[data.day].push(historyItem)
    }

    // 各曜日の直近12週分のみ保持
    for (const day of dayOrder) {
      dayOfWeekHistory[day] = dayOfWeekHistory[day].slice(-12)
    }

    // 日別集計（期間別推移用）
    const dateMap = new Map<string, { sales: number; customers: number }>()
    for (const tx of transactions) {
      const dateKey = tx.datetime.toISOString().split("T")[0]
      const existing = dateMap.get(dateKey) || { sales: 0, customers: 0 }
      dateMap.set(dateKey, {
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
      })
    }

    const periodData: PeriodData[] = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-28) // 直近28日
      .map(([dateKey, data]) => ({
        date: formatDate(new Date(dateKey)),
        sales: data.sales,
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }))

    // 週別集計（過去12週）
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 月曜日を週の開始とする
      d.setDate(diff)
      d.setHours(0, 0, 0, 0)
      return d
    }

    const formatWeekLabel = (weekStart: Date): string => {
      const month = weekStart.getMonth() + 1
      const day = weekStart.getDate()
      return `${month}/${day}~`
    }

    const weekMap = new Map<string, { sales: number; customers: number; weekStart: Date }>()
    for (const tx of transactions) {
      const weekStart = getWeekStart(tx.datetime)
      const weekKey = weekStart.toISOString().split("T")[0]
      const existing = weekMap.get(weekKey) || { sales: 0, customers: 0, weekStart }
      weekMap.set(weekKey, {
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
        weekStart,
      })
    }

    const weeklyData: WeeklyData[] = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // 直近12週
      .map(([, data]) => ({
        week: formatWeekLabel(data.weekStart),
        sales: data.sales,
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }))

    // 月別集計（過去12ヶ月）
    const monthMap = new Map<string, { sales: number; customers: number }>()
    for (const tx of transactions) {
      const month = formatMonth(tx.datetime)
      const existing = monthMap.get(month) || { sales: 0, customers: 0 }
      monthMap.set(month, {
        sales: existing.sales + tx.sales,
        customers: existing.customers + tx.customers,
      })
    }

    const monthlyData: MonthlyData[] = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // 直近12ヶ月
      .map(([month, data]) => ({
        month,
        sales: data.sales,
        customers: data.customers,
        averagePerCustomer:
          data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
      }))

    // 期間ごとのサマリーと店舗データを計算する関数
    const calculatePeriodData = (filteredTx: Transaction[]): PeriodSummary => {
      const totalSales = filteredTx.reduce((sum, tx) => sum + tx.sales, 0)
      const totalCustomers = filteredTx.reduce((sum, tx) => sum + tx.customers, 0)
      const totalTables = filteredTx.reduce((sum, tx) => sum + tx.tables, 0)
      const averagePerCustomer = totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0
      const averagePerTable = totalTables > 0 ? Math.round(totalSales / totalTables) : 0

      const prepaidTx = filteredTx.filter((tx) => tx.paymentType === "prepaid")
      const postpaidTx = filteredTx.filter((tx) => tx.paymentType === "postpaid")

      const prepaidSales = prepaidTx.reduce((sum, tx) => sum + tx.sales, 0)
      const postpaidSales = postpaidTx.reduce((sum, tx) => sum + tx.sales, 0)
      const prepaidCustomers = prepaidTx.reduce((sum, tx) => sum + tx.customers, 0)
      const postpaidCustomers = postpaidTx.reduce((sum, tx) => sum + tx.customers, 0)
      const prepaidTables = prepaidTx.reduce((sum, tx) => sum + tx.tables, 0)
      const postpaidTables = postpaidTx.reduce((sum, tx) => sum + tx.tables, 0)

      // 店舗別集計
      const storeMap = new Map<string, { storeId: string; storeName: string; sales: number; customers: number; prepaidSales: number; postpaidSales: number; prepaidCustomers: number; postpaidCustomers: number }>()
      for (const tx of filteredTx) {
        const existing = storeMap.get(tx.storeId) || { storeId: tx.storeId, storeName: tx.storeName, sales: 0, customers: 0, prepaidSales: 0, postpaidSales: 0, prepaidCustomers: 0, postpaidCustomers: 0 }
        const isPrepaid = tx.paymentType === "prepaid"
        storeMap.set(tx.storeId, {
          storeId: tx.storeId,
          storeName: tx.storeName,
          sales: existing.sales + tx.sales,
          customers: existing.customers + tx.customers,
          prepaidSales: existing.prepaidSales + (isPrepaid ? tx.sales : 0),
          postpaidSales: existing.postpaidSales + (isPrepaid ? 0 : tx.sales),
          prepaidCustomers: existing.prepaidCustomers + (isPrepaid ? tx.customers : 0),
          postpaidCustomers: existing.postpaidCustomers + (isPrepaid ? 0 : tx.customers),
        })
      }

      const periodStores: StoreData[] = Array.from(storeMap.values())
        .map((data) => ({
          storeId: data.storeId,
          storeName: data.storeName,
          totalSales: data.sales,
          customers: data.customers,
          averagePerCustomer: data.customers > 0 ? Math.round(data.sales / data.customers) : 0,
          prepaidSales: data.prepaidSales,
          postpaidSales: data.postpaidSales,
          prepaidCustomers: data.prepaidCustomers,
          postpaidCustomers: data.postpaidCustomers,
          prepaidAvgPerCustomer: data.prepaidCustomers > 0 ? Math.round(data.prepaidSales / data.prepaidCustomers) : 0,
          postpaidAvgPerCustomer: data.postpaidCustomers > 0 ? Math.round(data.postpaidSales / data.postpaidCustomers) : 0,
        }))
        .sort((a, b) => b.totalSales - a.totalSales)

      return {
        summary: {
          totalSales,
          totalCustomers,
          averagePerCustomer,
          averagePerTable,
          prepaidSales,
          postpaidSales,
          prepaidCustomers,
          postpaidCustomers,
          prepaidAvgPerCustomer: prepaidCustomers > 0 ? Math.round(prepaidSales / prepaidCustomers) : 0,
          postpaidAvgPerCustomer: postpaidCustomers > 0 ? Math.round(postpaidSales / postpaidCustomers) : 0,
          prepaidAvgPerTable: prepaidTables > 0 ? Math.round(prepaidSales / prepaidTables) : 0,
          postpaidAvgPerTable: postpaidTables > 0 ? Math.round(postpaidSales / postpaidTables) : 0,
        },
        stores: periodStores,
      }
    }

    // 本日のデータ
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTx = transactions.filter((tx) => {
      const txDate = new Date(tx.datetime)
      txDate.setHours(0, 0, 0, 0)
      return txDate.getTime() === today.getTime()
    })

    // 今月のデータ
    const thisMonthStr = formatMonth(today)
    const thisMonthTx = transactions.filter((tx) => formatMonth(tx.datetime) === thisMonthStr)

    // 先月のデータ
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthStr = formatMonth(lastMonth)
    const lastMonthTx = transactions.filter((tx) => formatMonth(tx.datetime) === lastMonthStr)

    return {
      today: calculatePeriodData(todayTx),
      thisMonth: calculatePeriodData(thisMonthTx),
      lastMonth: calculatePeriodData(lastMonthTx),
      dailyData,
      dayOfWeekHistory,
      periodData,
      weeklyData,
      monthlyData,
    }
  } catch (error) {
    console.error("Failed to fetch spreadsheet data:", error)
    throw error
  }
}

// デフォルトの店舗データを生成するヘルパー関数
function createStoreData(storeId: string, storeName: string, totalSales: number, customers: number): StoreData {
  const prepaidRatio = 0.6
  const prepaidSales = Math.round(totalSales * prepaidRatio)
  const postpaidSales = totalSales - prepaidSales
  const prepaidCustomers = Math.round(customers * prepaidRatio)
  const postpaidCustomers = customers - prepaidCustomers
  return {
    storeId,
    storeName,
    totalSales,
    customers,
    averagePerCustomer: customers > 0 ? Math.round(totalSales / customers) : 0,
    prepaidSales,
    postpaidSales,
    prepaidCustomers,
    postpaidCustomers,
    prepaidAvgPerCustomer: prepaidCustomers > 0 ? Math.round(prepaidSales / prepaidCustomers) : 0,
    postpaidAvgPerCustomer: postpaidCustomers > 0 ? Math.round(postpaidSales / postpaidCustomers) : 0,
  }
}

// デフォルトの店舗データ
const defaultStores: StoreData[] = [
  createStoreData("281001", "鮨TOKYO「鶴亀」浜松・小田原町店", 9056170, 1478),
  createStoreData("281002", "inu TOKYO店", 7124473, 1326),
  createStoreData("281003", "Ramen凪と天つなぐ", 5323835, 1182),
  createStoreData("281004", "焼肉DXサーロイン焼肉カルビテグ鯨理", 5196220, 1247),
  createStoreData("281005", "BIGGYおお!もうケーキ", 4065164, 1305),
  createStoreData("281006", "BLOOM TOKYOカッブドンとおじパフェへ", 663900, 834),
  createStoreData("281007", "Plus 汐留", 615700, 134),
  createStoreData("281008", "焼鳥おじしーレモンサワ酒場", 607384, 186),
  createStoreData("281009", "寿司居酒屋一番星汐留店", 533178, 542),
  createStoreData("281010", "サラリスン 汐留", 547160, 317),
  createStoreData("281011", "coffee mafia 汐留", 285670, 242),
  createStoreData("281012", "だしや _mocofu_", 326846, 249),
  createStoreData("281013", "レアールパスタキッチン", 84720, 70),
  createStoreData("281014", "クラフトビール&BAR 汐留「100種のクラフトビール飲み放題」", 46400, 615),
]

// デフォルトデータ（スプレッドシートURL未設定時用）
export function getDefaultData(): DashboardData {
  // 本日のデータ（期間別分析の最終日 2/5 のデータと整合）
  const todaySummary: SummaryData = {
    totalSales: 165000,
    totalCustomers: 38,
    averagePerCustomer: 4342,
    averagePerTable: 13750,
    prepaidSales: 99000,
    postpaidSales: 66000,
    prepaidCustomers: 23,
    postpaidCustomers: 15,
    prepaidAvgPerCustomer: 4304,
    postpaidAvgPerCustomer: 4400,
    prepaidAvgPerTable: 14143,
    postpaidAvgPerTable: 13200,
  }

  // 今月のデータ（月別分析の 2026/02 と整合）
  const thisMonthSummary: SummaryData = {
    totalSales: 5850000,
    totalCustomers: 1345,
    averagePerCustomer: 4349,
    averagePerTable: 13045,
    prepaidSales: 3510000,
    postpaidSales: 2340000,
    prepaidCustomers: 807,
    postpaidCustomers: 538,
    prepaidAvgPerCustomer: 4349,
    postpaidAvgPerCustomer: 4349,
    prepaidAvgPerTable: 13115,
    postpaidAvgPerTable: 12947,
  }

  // 先月のデータ（月別分析の 2026/01 と整合）
  const lastMonthSummary: SummaryData = {
    totalSales: 6250000,
    totalCustomers: 1435,
    averagePerCustomer: 4355,
    averagePerTable: 13021,
    prepaidSales: 3750000,
    postpaidSales: 2500000,
    prepaidCustomers: 861,
    postpaidCustomers: 574,
    prepaidAvgPerCustomer: 4356,
    postpaidAvgPerCustomer: 4355,
    prepaidAvgPerTable: 13021,
    postpaidAvgPerTable: 13021,
  }

  // 事前決済/事後決済の内訳を追加するヘルパー（比率60%:40%）
  const addPaymentBreakdown = <T extends { customers: number; averagePerCustomer: number }>(
    data: Omit<T, 'prepaidCustomers' | 'postpaidCustomers' | 'prepaidAvgPerCustomer' | 'postpaidAvgPerCustomer'>
  ): T => {
    const prepaidCustomers = Math.round(data.customers * 0.6)
    const postpaidCustomers = data.customers - prepaidCustomers
    return {
      ...data,
      prepaidCustomers,
      postpaidCustomers,
      prepaidAvgPerCustomer: Math.round(data.averagePerCustomer * 0.98),
      postpaidAvgPerCustomer: Math.round(data.averagePerCustomer * 1.03),
    } as T
  }

  const addSalesPaymentBreakdown = <T extends { sales: number; customers: number; averagePerCustomer: number }>(
    data: Omit<T, 'prepaidSales' | 'postpaidSales' | 'prepaidCustomers' | 'postpaidCustomers' | 'prepaidAvgPerCustomer' | 'postpaidAvgPerCustomer'>
  ): T => {
    const prepaidSales = Math.round(data.sales * 0.6)
    const postpaidSales = data.sales - prepaidSales
    const prepaidCustomers = Math.round(data.customers * 0.6)
    const postpaidCustomers = data.customers - prepaidCustomers
    return {
      ...data,
      prepaidSales,
      postpaidSales,
      prepaidCustomers,
      postpaidCustomers,
      prepaidAvgPerCustomer: prepaidCustomers > 0 ? Math.round(prepaidSales / prepaidCustomers) : 0,
      postpaidAvgPerCustomer: postpaidCustomers > 0 ? Math.round(postpaidSales / postpaidCustomers) : 0,
    } as T
  }

  // 店舗データをスケーリングするヘルパー
  const scaleStoreData = (store: StoreData, multiplier: number): StoreData => {
    const totalSales = Math.round(store.totalSales * multiplier)
    const customers = Math.round(store.customers * multiplier)
    const prepaidSales = Math.round(store.prepaidSales * multiplier)
    const postpaidSales = totalSales - prepaidSales
    const prepaidCustomers = Math.round(store.prepaidCustomers * multiplier)
    const postpaidCustomers = customers - prepaidCustomers
    return {
      ...store,
      totalSales,
      customers,
      averagePerCustomer: customers > 0 ? Math.round(totalSales / customers) : 0,
      prepaidSales,
      postpaidSales,
      prepaidCustomers,
      postpaidCustomers,
      prepaidAvgPerCustomer: prepaidCustomers > 0 ? Math.round(prepaidSales / prepaidCustomers) : 0,
      postpaidAvgPerCustomer: postpaidCustomers > 0 ? Math.round(postpaidSales / postpaidCustomers) : 0,
    }
  }

  // 本日の店舗データ（期間別分析の最終日と整合）
  const todayStores: StoreData[] = defaultStores.map((store, index) => 
    scaleStoreData(store, (1 / 30) * (1 + (index % 3) * 0.1))
  )

  // 今月の店舗データ
  const thisMonthStores: StoreData[] = defaultStores.map((store, index) => 
    scaleStoreData(store, (1 / 12) * (1 + (index % 4) * 0.05))
  )

  // 先月の店舗データ
  const lastMonthStores: StoreData[] = defaultStores.map((store, index) => 
    scaleStoreData(store, (1 / 12) * (1 + (index % 5) * 0.03))
  )

  return {
    today: { summary: todaySummary, stores: todayStores },
    thisMonth: { summary: thisMonthSummary, stores: thisMonthStores },
    lastMonth: { summary: lastMonthSummary, stores: lastMonthStores },
    dailyData: [
      { day: "月", customers: 450, averagePerCustomer: 4200 },
      { day: "火", customers: 380, averagePerCustomer: 4100 },
      { day: "水", customers: 420, averagePerCustomer: 4300 },
      { day: "木", customers: 390, averagePerCustomer: 4000 },
      { day: "金", customers: 520, averagePerCustomer: 4800 },
      { day: "土", customers: 680, averagePerCustomer: 5200 },
      { day: "日", customers: 590, averagePerCustomer: 4900 },
    ].map(d => addPaymentBreakdown<DailyData>(d)),
    dayOfWeekHistory: Object.fromEntries(
      Object.entries({
        "月": [
          { date: "11/11", customers: 42, averagePerCustomer: 4180 },
          { date: "11/18", customers: 45, averagePerCustomer: 4220 },
          { date: "11/25", customers: 40, averagePerCustomer: 4150 },
          { date: "12/2", customers: 48, averagePerCustomer: 4280 },
          { date: "12/9", customers: 44, averagePerCustomer: 4200 },
          { date: "12/16", customers: 46, averagePerCustomer: 4250 },
          { date: "12/23", customers: 52, averagePerCustomer: 4320 },
          { date: "12/30", customers: 38, averagePerCustomer: 4100 },
          { date: "1/6", customers: 43, averagePerCustomer: 4190 },
          { date: "1/13", customers: 47, averagePerCustomer: 4260 },
          { date: "1/20", customers: 49, averagePerCustomer: 4300 },
          { date: "1/27", customers: 46, averagePerCustomer: 4240 },
        ],
        "火": [
          { date: "11/12", customers: 38, averagePerCustomer: 4050 },
          { date: "11/19", customers: 36, averagePerCustomer: 4020 },
          { date: "11/26", customers: 35, averagePerCustomer: 4000 },
          { date: "12/3", customers: 40, averagePerCustomer: 4120 },
          { date: "12/10", customers: 37, averagePerCustomer: 4080 },
          { date: "12/17", customers: 39, averagePerCustomer: 4100 },
          { date: "12/24", customers: 42, averagePerCustomer: 4180 },
          { date: "12/31", customers: 32, averagePerCustomer: 3950 },
          { date: "1/7", customers: 36, averagePerCustomer: 4060 },
          { date: "1/14", customers: 38, averagePerCustomer: 4100 },
          { date: "1/21", customers: 40, averagePerCustomer: 4150 },
          { date: "1/28", customers: 37, averagePerCustomer: 4090 },
        ],
        "水": [
          { date: "11/13", customers: 40, averagePerCustomer: 4250 },
          { date: "11/20", customers: 42, averagePerCustomer: 4280 },
          { date: "11/27", customers: 38, averagePerCustomer: 4200 },
          { date: "12/4", customers: 45, averagePerCustomer: 4350 },
          { date: "12/11", customers: 41, averagePerCustomer: 4280 },
          { date: "12/18", customers: 43, averagePerCustomer: 4320 },
          { date: "12/25", customers: 48, averagePerCustomer: 4400 },
          { date: "1/1", customers: 35, averagePerCustomer: 4150 },
          { date: "1/8", customers: 39, averagePerCustomer: 4240 },
          { date: "1/15", customers: 42, averagePerCustomer: 4300 },
          { date: "1/22", customers: 44, averagePerCustomer: 4350 },
          { date: "1/29", customers: 41, averagePerCustomer: 4290 },
        ],
        "木": [
          { date: "11/14", customers: 37, averagePerCustomer: 3950 },
          { date: "11/21", customers: 39, averagePerCustomer: 4000 },
          { date: "11/28", customers: 36, averagePerCustomer: 3920 },
          { date: "12/5", customers: 42, averagePerCustomer: 4080 },
          { date: "12/12", customers: 38, averagePerCustomer: 4000 },
          { date: "12/19", customers: 40, averagePerCustomer: 4050 },
          { date: "12/26", customers: 45, averagePerCustomer: 4150 },
          { date: "1/2", customers: 33, averagePerCustomer: 3880 },
          { date: "1/9", customers: 37, averagePerCustomer: 3980 },
          { date: "1/16", customers: 39, averagePerCustomer: 4020 },
          { date: "1/23", customers: 41, averagePerCustomer: 4080 },
          { date: "1/30", customers: 38, averagePerCustomer: 4000 },
        ],
        "金": [
          { date: "11/15", customers: 50, averagePerCustomer: 4750 },
          { date: "11/22", customers: 52, averagePerCustomer: 4820 },
          { date: "11/29", customers: 48, averagePerCustomer: 4680 },
          { date: "12/6", customers: 55, averagePerCustomer: 4900 },
          { date: "12/13", customers: 51, averagePerCustomer: 4800 },
          { date: "12/20", customers: 53, averagePerCustomer: 4850 },
          { date: "12/27", customers: 58, averagePerCustomer: 4980 },
          { date: "1/3", customers: 45, averagePerCustomer: 4600 },
          { date: "1/10", customers: 49, averagePerCustomer: 4720 },
          { date: "1/17", customers: 52, averagePerCustomer: 4820 },
          { date: "1/24", customers: 54, averagePerCustomer: 4880 },
          { date: "1/31", customers: 51, averagePerCustomer: 4800 },
        ],
        "土": [
          { date: "11/16", customers: 65, averagePerCustomer: 5150 },
          { date: "11/23", customers: 68, averagePerCustomer: 5220 },
          { date: "11/30", customers: 62, averagePerCustomer: 5080 },
          { date: "12/7", customers: 72, averagePerCustomer: 5320 },
          { date: "12/14", customers: 67, averagePerCustomer: 5200 },
          { date: "12/21", customers: 70, averagePerCustomer: 5280 },
          { date: "12/28", customers: 75, averagePerCustomer: 5400 },
          { date: "1/4", customers: 58, averagePerCustomer: 5000 },
          { date: "1/11", customers: 64, averagePerCustomer: 5120 },
          { date: "1/18", customers: 68, averagePerCustomer: 5220 },
          { date: "1/25", customers: 71, averagePerCustomer: 5300 },
          { date: "2/1", customers: 68, averagePerCustomer: 5220 },
        ],
        "日": [
          { date: "11/17", customers: 56, averagePerCustomer: 4850 },
          { date: "11/24", customers: 59, averagePerCustomer: 4920 },
          { date: "12/1", customers: 54, averagePerCustomer: 4780 },
          { date: "12/8", customers: 62, averagePerCustomer: 5000 },
          { date: "12/15", customers: 58, averagePerCustomer: 4900 },
          { date: "12/22", customers: 60, averagePerCustomer: 4950 },
          { date: "12/29", customers: 65, averagePerCustomer: 5080 },
          { date: "1/5", customers: 50, averagePerCustomer: 4700 },
          { date: "1/12", customers: 55, averagePerCustomer: 4820 },
          { date: "1/19", customers: 58, averagePerCustomer: 4900 },
          { date: "1/26", customers: 61, averagePerCustomer: 4980 },
          { date: "2/2", customers: 59, averagePerCustomer: 4920 },
        ],
      }).map(([day, data]) => [day, data.map(d => addPaymentBreakdown<DayOfWeekHistoryData>(d))])
    ),
    hourlyDataByDayOfWeek: Object.fromEntries(
      Object.entries({
        "月": [
          { hour: "10時", customers: 3, averagePerCustomer: 3800 },
          { hour: "11時", customers: 8, averagePerCustomer: 4000 },
          { hour: "12時", customers: 18, averagePerCustomer: 4200 },
          { hour: "13時", customers: 15, averagePerCustomer: 4100 },
          { hour: "14時", customers: 7, averagePerCustomer: 4000 },
          { hour: "15時", customers: 4, averagePerCustomer: 3900 },
          { hour: "16時", customers: 5, averagePerCustomer: 4000 },
          { hour: "17時", customers: 9, averagePerCustomer: 4300 },
          { hour: "18時", customers: 14, averagePerCustomer: 4500 },
          { hour: "19時", customers: 19, averagePerCustomer: 4800 },
          { hour: "20時", customers: 16, averagePerCustomer: 4600 },
          { hour: "21時", customers: 11, averagePerCustomer: 4400 },
          { hour: "22時", customers: 6, averagePerCustomer: 4200 },
          { hour: "23時", customers: 3, averagePerCustomer: 4000 },
        ],
        "火": [
          { hour: "10時", customers: 2, averagePerCustomer: 3700 },
          { hour: "11時", customers: 7, averagePerCustomer: 3900 },
          { hour: "12時", customers: 16, averagePerCustomer: 4100 },
          { hour: "13時", customers: 13, averagePerCustomer: 4000 },
          { hour: "14時", customers: 6, averagePerCustomer: 3900 },
          { hour: "15時", customers: 3, averagePerCustomer: 3800 },
          { hour: "16時", customers: 4, averagePerCustomer: 3900 },
          { hour: "17時", customers: 8, averagePerCustomer: 4200 },
          { hour: "18時", customers: 12, averagePerCustomer: 4400 },
          { hour: "19時", customers: 17, averagePerCustomer: 4600 },
          { hour: "20時", customers: 14, averagePerCustomer: 4500 },
          { hour: "21時", customers: 10, averagePerCustomer: 4300 },
          { hour: "22時", customers: 5, averagePerCustomer: 4100 },
          { hour: "23時", customers: 2, averagePerCustomer: 3900 },
        ],
        "水": [
          { hour: "10時", customers: 3, averagePerCustomer: 3900 },
          { hour: "11時", customers: 8, averagePerCustomer: 4100 },
          { hour: "12時", customers: 17, averagePerCustomer: 4300 },
          { hour: "13時", customers: 14, averagePerCustomer: 4200 },
          { hour: "14時", customers: 7, averagePerCustomer: 4100 },
          { hour: "15時", customers: 4, averagePerCustomer: 4000 },
          { hour: "16時", customers: 5, averagePerCustomer: 4100 },
          { hour: "17時", customers: 9, averagePerCustomer: 4400 },
          { hour: "18時", customers: 13, averagePerCustomer: 4600 },
          { hour: "19時", customers: 18, averagePerCustomer: 4900 },
          { hour: "20時", customers: 15, averagePerCustomer: 4700 },
          { hour: "21時", customers: 11, averagePerCustomer: 4500 },
          { hour: "22時", customers: 6, averagePerCustomer: 4300 },
          { hour: "23時", customers: 3, averagePerCustomer: 4100 },
        ],
        "木": [
          { hour: "10時", customers: 2, averagePerCustomer: 3600 },
          { hour: "11時", customers: 7, averagePerCustomer: 3800 },
          { hour: "12時", customers: 15, averagePerCustomer: 4000 },
          { hour: "13時", customers: 12, averagePerCustomer: 3900 },
          { hour: "14時", customers: 6, averagePerCustomer: 3800 },
          { hour: "15時", customers: 3, averagePerCustomer: 3700 },
          { hour: "16時", customers: 4, averagePerCustomer: 3800 },
          { hour: "17時", customers: 8, averagePerCustomer: 4100 },
          { hour: "18時", customers: 11, averagePerCustomer: 4300 },
          { hour: "19時", customers: 16, averagePerCustomer: 4500 },
          { hour: "20時", customers: 13, averagePerCustomer: 4400 },
          { hour: "21時", customers: 9, averagePerCustomer: 4200 },
          { hour: "22時", customers: 5, averagePerCustomer: 4000 },
          { hour: "23時", customers: 2, averagePerCustomer: 3800 },
        ],
        "金": [
          { hour: "10時", customers: 4, averagePerCustomer: 4200 },
          { hour: "11時", customers: 10, averagePerCustomer: 4400 },
          { hour: "12時", customers: 22, averagePerCustomer: 4800 },
          { hour: "13時", customers: 18, averagePerCustomer: 4600 },
          { hour: "14時", customers: 9, averagePerCustomer: 4400 },
          { hour: "15時", customers: 5, averagePerCustomer: 4300 },
          { hour: "16時", customers: 7, averagePerCustomer: 4400 },
          { hour: "17時", customers: 12, averagePerCustomer: 4800 },
          { hour: "18時", customers: 18, averagePerCustomer: 5200 },
          { hour: "19時", customers: 25, averagePerCustomer: 5500 },
          { hour: "20時", customers: 21, averagePerCustomer: 5300 },
          { hour: "21時", customers: 15, averagePerCustomer: 5000 },
          { hour: "22時", customers: 9, averagePerCustomer: 4700 },
          { hour: "23時", customers: 5, averagePerCustomer: 4400 },
        ],
        "土": [
          { hour: "10時", customers: 6, averagePerCustomer: 4500 },
          { hour: "11時", customers: 14, averagePerCustomer: 4800 },
          { hour: "12時", customers: 28, averagePerCustomer: 5200 },
          { hour: "13時", customers: 24, averagePerCustomer: 5000 },
          { hour: "14時", customers: 12, averagePerCustomer: 4800 },
          { hour: "15時", customers: 8, averagePerCustomer: 4600 },
          { hour: "16時", customers: 10, averagePerCustomer: 4700 },
          { hour: "17時", customers: 16, averagePerCustomer: 5100 },
          { hour: "18時", customers: 22, averagePerCustomer: 5500 },
          { hour: "19時", customers: 30, averagePerCustomer: 5800 },
          { hour: "20時", customers: 26, averagePerCustomer: 5600 },
          { hour: "21時", customers: 18, averagePerCustomer: 5300 },
          { hour: "22時", customers: 11, averagePerCustomer: 5000 },
          { hour: "23時", customers: 6, averagePerCustomer: 4700 },
        ],
        "日": [
          { hour: "10時", customers: 5, averagePerCustomer: 4300 },
          { hour: "11時", customers: 12, averagePerCustomer: 4600 },
          { hour: "12時", customers: 25, averagePerCustomer: 5000 },
          { hour: "13時", customers: 21, averagePerCustomer: 4800 },
          { hour: "14時", customers: 11, averagePerCustomer: 4600 },
          { hour: "15時", customers: 7, averagePerCustomer: 4400 },
          { hour: "16時", customers: 8, averagePerCustomer: 4500 },
          { hour: "17時", customers: 13, averagePerCustomer: 4900 },
          { hour: "18時", customers: 18, averagePerCustomer: 5200 },
          { hour: "19時", customers: 24, averagePerCustomer: 5500 },
          { hour: "20時", customers: 20, averagePerCustomer: 5300 },
          { hour: "21時", customers: 14, averagePerCustomer: 5000 },
          { hour: "22時", customers: 8, averagePerCustomer: 4700 },
          { hour: "23時", customers: 4, averagePerCustomer: 4400 },
        ],
      }).map(([day, data]) => [day, data.map(d => addPaymentBreakdown<HourlyData>(d))])
    ),
    periodData: [
      { date: "1/9", sales: 180000, customers: 42, averagePerCustomer: 4286 },
      { date: "1/10", sales: 165000, customers: 38, averagePerCustomer: 4342 },
      { date: "1/11", sales: 192000, customers: 45, averagePerCustomer: 4267 },
      { date: "1/12", sales: 210000, customers: 52, averagePerCustomer: 4038 },
      { date: "1/13", sales: 245000, customers: 58, averagePerCustomer: 4224 },
      { date: "1/14", sales: 178000, customers: 41, averagePerCustomer: 4341 },
      { date: "1/15", sales: 156000, customers: 36, averagePerCustomer: 4333 },
      { date: "1/16", sales: 188000, customers: 44, averagePerCustomer: 4273 },
      { date: "1/17", sales: 172000, customers: 40, averagePerCustomer: 4300 },
      { date: "1/18", sales: 198000, customers: 46, averagePerCustomer: 4304 },
      { date: "1/19", sales: 215000, customers: 50, averagePerCustomer: 4300 },
      { date: "1/20", sales: 252000, customers: 59, averagePerCustomer: 4271 },
      { date: "1/21", sales: 185000, customers: 43, averagePerCustomer: 4302 },
      { date: "1/22", sales: 162000, customers: 38, averagePerCustomer: 4263 },
      { date: "1/23", sales: 175000, customers: 41, averagePerCustomer: 4268 },
      { date: "1/24", sales: 169000, customers: 39, averagePerCustomer: 4333 },
      { date: "1/25", sales: 195000, customers: 45, averagePerCustomer: 4333 },
      { date: "1/26", sales: 208000, customers: 48, averagePerCustomer: 4333 },
      { date: "1/27", sales: 248000, customers: 57, averagePerCustomer: 4351 },
      { date: "1/28", sales: 182000, customers: 42, averagePerCustomer: 4333 },
      { date: "1/29", sales: 158000, customers: 37, averagePerCustomer: 4270 },
      { date: "1/30", sales: 183000, customers: 43, averagePerCustomer: 4256 },
      { date: "1/31", sales: 176000, customers: 41, averagePerCustomer: 4293 },
      { date: "2/1", sales: 199000, customers: 46, averagePerCustomer: 4326 },
      { date: "2/2", sales: 212000, customers: 49, averagePerCustomer: 4327 },
      { date: "2/3", sales: 255000, customers: 59, averagePerCustomer: 4322 },
      { date: "2/4", sales: 188000, customers: 44, averagePerCustomer: 4273 },
      { date: "2/5", sales: 165000, customers: 38, averagePerCustomer: 4342 },
    ].map(d => addSalesPaymentBreakdown<PeriodData>(d)),
    weeklyData: [
      { week: "11/11~", sales: 1250000, customers: 290, averagePerCustomer: 4310 },
      { week: "11/18~", sales: 1320000, customers: 305, averagePerCustomer: 4328 },
      { week: "11/25~", sales: 1180000, customers: 275, averagePerCustomer: 4291 },
      { week: "12/2~", sales: 1450000, customers: 335, averagePerCustomer: 4328 },
      { week: "12/9~", sales: 1380000, customers: 320, averagePerCustomer: 4313 },
      { week: "12/16~", sales: 1520000, customers: 350, averagePerCustomer: 4343 },
      { week: "12/23~", sales: 1680000, customers: 385, averagePerCustomer: 4364 },
      { week: "12/30~", sales: 1420000, customers: 330, averagePerCustomer: 4303 },
      { week: "1/6~", sales: 1350000, customers: 315, averagePerCustomer: 4286 },
      { week: "1/13~", sales: 1480000, customers: 345, averagePerCustomer: 4290 },
      { week: "1/20~", sales: 1550000, customers: 360, averagePerCustomer: 4306 },
      { week: "1/27~", sales: 1620000, customers: 375, averagePerCustomer: 4320 },
    ].map(d => addSalesPaymentBreakdown<WeeklyData>(d)),
    monthlyData: [
      { month: "2025/03", sales: 4850000, customers: 1125, averagePerCustomer: 4311 },
      { month: "2025/04", sales: 5120000, customers: 1185, averagePerCustomer: 4320 },
      { month: "2025/05", sales: 4980000, customers: 1155, averagePerCustomer: 4312 },
      { month: "2025/06", sales: 5350000, customers: 1235, averagePerCustomer: 4332 },
      { month: "2025/07", sales: 5680000, customers: 1310, averagePerCustomer: 4336 },
      { month: "2025/08", sales: 5420000, customers: 1250, averagePerCustomer: 4336 },
      { month: "2025/09", sales: 5890000, customers: 1355, averagePerCustomer: 4347 },
      { month: "2025/10", sales: 6120000, customers: 1405, averagePerCustomer: 4356 },
      { month: "2025/11", sales: 6540000, customers: 1495, averagePerCustomer: 4374 },
      { month: "2025/12", sales: 5980000, customers: 1375, averagePerCustomer: 4349 },
      { month: "2026/01", sales: 6250000, customers: 1435, averagePerCustomer: 4355 },
      { month: "2026/02", sales: 5850000, customers: 1345, averagePerCustomer: 4349 },
    ].map(d => addSalesPaymentBreakdown<MonthlyData>(d)),
  }
}

// 店舗詳細データを取得する関数
export async function fetchStoreDetailData(
  csvUrl: string,
  storeId: string
): Promise<StoreDetailData | null> {
  try {
    // リダイレクトを手動追従
    let response = await fetch(csvUrl, { redirect: "manual" })
    if (response.status === 307 || response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get("location")
      if (redirectUrl) {
        response = await fetch(redirectUrl)
      }
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }
    const csv = await response.text()
    const rows = parseCSV(csv)

    // ヘッダー行をスキップして注文データをパース
    const dataRows = rows.slice(1)
    const orderRows: OrderRow[] = []

    for (const row of dataRows) {
      if (row.length >= 12 && row[0]) {
        const datetime = parseDate(row[0])
        if (datetime) {
          const paymentTypeRaw = row[11]?.trim().toLowerCase() || ""
          const paymentType: "prepaid" | "postpaid" =
            paymentTypeRaw === "事前" ||
            paymentTypeRaw === "事前決済" ||
            paymentTypeRaw === "prepaid"
              ? "prepaid"
              : "postpaid"

          orderRows.push({
            datetime,
            buildingId: row[1],
            buildingName: row[2],
            storeId: row[3],
            storeName: row[4],
            paymentId: row[5],
            partySize: Number(row[6]) || 1,
            productName: row[7],
            quantity: Number(row[8]) || 1,
            unitPrice: Number(row[9]) || 0,
            totalPrice: Number(row[10]) || 0,
            paymentType,
          })
        }
      }
    }

    // 指定店舗のデータのみフィルタ
    const storeOrders = orderRows.filter((order) => order.storeId === storeId)
    if (storeOrders.length === 0) {
      return null
    }

    const storeName = storeOrders[0].storeName

    // 決済ID + 日付でグルーピング
    const paymentMap = new Map<string, {
      paymentId: string
      sales: number
      partySize: number
      products: string[]
    }>()

    for (const order of storeOrders) {
      const dateKey = `${order.datetime.getFullYear()}-${order.datetime.getMonth()}-${order.datetime.getDate()}`
      const groupKey = `${order.paymentId}_${dateKey}`
      const existing = paymentMap.get(groupKey)
      if (existing) {
        existing.sales += order.totalPrice
        existing.partySize = Math.max(existing.partySize, order.partySize)
        existing.products.push(order.productName)
      } else {
        paymentMap.set(groupKey, {
          paymentId: order.paymentId,
          sales: order.totalPrice,
          partySize: order.partySize,
          products: [order.productName],
        })
      }
    }

    // サマリー計算
    const totalSales = Array.from(paymentMap.values()).reduce((sum, p) => sum + p.sales, 0)
    const totalCustomers = Array.from(paymentMap.values()).reduce((sum, p) => sum + p.partySize, 0)
    const totalTables = paymentMap.size

    // 商品別集計
    const productMap = new Map<string, { quantity: number; sales: number }>()
    for (const order of storeOrders) {
      const existing = productMap.get(order.productName) || { quantity: 0, sales: 0 }
      productMap.set(order.productName, {
        quantity: existing.quantity + order.quantity,
        sales: existing.sales + order.totalPrice,
      })
    }

    const products: ProductData[] = Array.from(productMap.entries())
      .map(([productName, data]) => ({
        productName,
        quantity: data.quantity,
        sales: data.sales,
      }))
      .sort((a, b) => b.quantity - a.quantity)

    // 商品組み合わせ分析（テーブル単位）
    const combinationMap = new Map<string, { products: string[]; count: number; totalSales: number }>()
    for (const payment of paymentMap.values()) {
      // 商品名をソートしてキー化（順序を無視）
      const sortedProducts = [...new Set(payment.products)].sort()
      const key = sortedProducts.join(" + ")
      const existing = combinationMap.get(key) || { products: sortedProducts, count: 0, totalSales: 0 }
      combinationMap.set(key, {
        products: sortedProducts,
        count: existing.count + 1,
        totalSales: existing.totalSales + payment.sales,
      })
    }

    const combinations: ProductCombination[] = Array.from(combinationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // 上位20件

    return {
      storeId,
      storeName,
      summary: {
        totalSales,
        totalCustomers,
        totalTables,
        averagePerCustomer: totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0,
        averagePerTable: totalTables > 0 ? Math.round(totalSales / totalTables) : 0,
      },
      products,
      combinations,
    }
  } catch (error) {
    console.error("Failed to fetch store detail data:", error)
    throw error
  }
}

// 店舗別のデフォルト商品データ
// 商品データと組み合わせデータに事前決済/事後決済の内訳を追加するヘルパー
function createProductData(productName: string, quantity: number, sales: number): ProductData {
  const prepaidQuantity = Math.round(quantity * 0.6)
  const postpaidQuantity = quantity - prepaidQuantity
  const prepaidSales = Math.round(sales * 0.6)
  const postpaidSales = sales - prepaidSales
  return { productName, quantity, sales, prepaidQuantity, postpaidQuantity, prepaidSales, postpaidSales }
}

function createCombinationData(products: string[], count: number, totalSales: number): ProductCombination {
  const prepaidCount = Math.round(count * 0.6)
  const postpaidCount = count - prepaidCount
  const prepaidSales = Math.round(totalSales * 0.6)
  const postpaidSales = totalSales - prepaidSales
  return { products, count, totalSales, prepaidCount, postpaidCount, prepaidSales, postpaidSales }
}

// 商品データの簡易型（内訳なし）
type SimpleProductData = { productName: string; quantity: number; sales: number }
type SimpleCombinationData = { products: string[]; count: number; totalSales: number }

const storeProductsMap: Record<string, { products: SimpleProductData[]; combinations: SimpleCombinationData[] }> = {
  "281001": { // 鮨TOKYO
  products: [
      { productName: "特上寿司盛り合わせ", quantity: 320, sales: 1920000 },
      { productName: "おまかせコース", quantity: 180, sales: 1620000 },
      { productName: "日本酒 獺祭", quantity: 450, sales: 675000 },
      { productName: "生ビール", quantity: 380, sales: 228000 },
      { productName: "海鮮丼", quantity: 250, sales: 500000 },
      { productName: "中トロ", quantity: 220, sales: 440000 },
      { productName: "大トロ", quantity: 180, sales: 540000 },
      { productName: "ウニ軍艦", quantity: 160, sales: 320000 },
      { productName: "いくら軍艦", quantity: 150, sales: 225000 },
      { productName: "サーモン", quantity: 280, sales: 280000 },
      { productName: "えんがわ", quantity: 120, sales: 144000 },
      { productName: "あなご", quantity: 100, sales: 150000 },
      { productName: "たまご", quantity: 200, sales: 100000 },
      { productName: "お味噌汁", quantity: 350, sales: 105000 },
      { productName: "茶碗蒸し", quantity: 180, sales: 126000 },
    ],
    combinations: [
      { products: ["おまかせコース", "日本酒 獺祭"], count: 85, totalSales: 935000 },
      { products: ["特上寿司盛り合わせ", "生ビール"], count: 72, totalSales: 475200 },
      { products: ["海鮮丼", "生ビール"], count: 45, totalSales: 117000 },
      { products: ["中トロ", "大トロ", "ウニ軍艦"], count: 38, totalSales: 494000 },
      { products: ["サーモン", "いくら軍艦", "生ビール"], count: 32, totalSales: 256000 },
      { products: ["おまかせコース", "茶碗蒸し", "お味噌汁"], count: 28, totalSales: 280000 },
      { products: ["海鮮丼", "お味噌汁"], count: 25, totalSales: 62500 },
      { products: ["特上寿司盛り合わせ", "日本酒 獺祭", "茶碗蒸し"], count: 22, totalSales: 330000 },
    ],
  },
  "281002": { // inu TOKYO店
    products: [
      { productName: "A5和牛ステーキ", quantity: 280, sales: 1960000 },
      { productName: "黒毛和牛焼肉セット", quantity: 220, sales: 1100000 },
      { productName: "赤ワイン グラス", quantity: 520, sales: 416000 },
      { productName: "シーザーサラダ", quantity: 180, sales: 162000 },
      { productName: "デザートプレート", quantity: 150, sales: 135000 },
      { productName: "白ワイン グラス", quantity: 320, sales: 256000 },
      { productName: "前菜盛り合わせ", quantity: 200, sales: 240000 },
      { productName: "リブロースステーキ", quantity: 150, sales: 900000 },
      { productName: "ハンバーグ", quantity: 180, sales: 324000 },
      { productName: "パスタランチ", quantity: 220, sales: 264000 },
      { productName: "本日のスープ", quantity: 280, sales: 112000 },
      { productName: "ガーリックライス", quantity: 160, sales: 96000 },
    ],
    combinations: [
      { products: ["A5和牛ステーキ", "赤ワイン グラス"], count: 95, totalSales: 760000 },
      { products: ["黒毛和牛焼肉セット", "シーザーサラダ", "赤ワイン グラス"], count: 68, totalSales: 476000 },
      { products: ["デザートプレート"], count: 42, totalSales: 37800 },
      { products: ["A5和牛ステーキ", "前菜盛り合わせ", "白ワイン グラス"], count: 35, totalSales: 385000 },
      { products: ["リブロースステーキ", "ガーリックライス", "赤ワイン グラス"], count: 28, totalSales: 280000 },
      { products: ["ハンバーグ", "本日のスープ", "サラダ"], count: 25, totalSales: 125000 },
      { products: ["パスタランチ", "本日のスープ"], count: 22, totalSales: 88000 },
    ],
  },
  "281003": { // Ramen凪と天つなぐ
    products: [
      { productName: "特製濃厚ラーメン", quantity: 580, sales: 696000 },
      { productName: "煮卵トッピング", quantity: 420, sales: 63000 },
      { productName: "チャーシュー増し", quantity: 380, sales: 114000 },
      { productName: "替え玉", quantity: 350, sales: 52500 },
      { productName: "餃子セット", quantity: 290, sales: 145000 },
      { productName: "つけ麺", quantity: 320, sales: 416000 },
      { productName: "辛味噌ラーメン", quantity: 280, sales: 336000 },
      { productName: "塩ラーメン", quantity: 250, sales: 275000 },
      { productName: "ライス", quantity: 400, sales: 60000 },
      { productName: "メンマトッピング", quantity: 180, sales: 27000 },
      { productName: "のりトッピング", quantity: 150, sales: 15000 },
      { productName: "ビール", quantity: 220, sales: 110000 },
    ],
    combinations: [
      { products: ["特製濃厚ラーメン", "煮卵トッピング", "チャーシュー増し"], count: 180, totalSales: 270000 },
      { products: ["特製濃厚ラーメン", "餃子セット"], count: 145, totalSales: 246500 },
      { products: ["特製濃厚ラーメン", "替え玉"], count: 120, totalSales: 162000 },
      { products: ["つけ麺", "煮卵トッピング"], count: 85, totalSales: 144500 },
      { products: ["辛味噌ラーメン", "ライス"], count: 72, totalSales: 100800 },
      { products: ["特製濃厚ラーメン", "ビール"], count: 65, totalSales: 110500 },
      { products: ["塩ラーメン", "餃子セット", "ビール"], count: 45, totalSales: 94500 },
    ],
  },
  "281004": { // 焼肉DX
    products: [
      { productName: "カルビ盛り合わせ", quantity: 420, sales: 840000 },
      { productName: "タン塩", quantity: 380, sales: 570000 },
      { productName: "ハラミ", quantity: 350, sales: 455000 },
      { productName: "冷麺", quantity: 220, sales: 198000 },
      { productName: "ビビンバ", quantity: 180, sales: 144000 },
      { productName: "上カルビ", quantity: 280, sales: 560000 },
      { productName: "ホルモン盛り", quantity: 200, sales: 240000 },
      { productName: "サムギョプサル", quantity: 180, sales: 270000 },
      { productName: "キムチ盛り合わせ", quantity: 320, sales: 128000 },
      { productName: "ナムル盛り合わせ", quantity: 280, sales: 112000 },
      { productName: "韓国のり", quantity: 250, sales: 75000 },
      { productName: "マッコリ", quantity: 180, sales: 108000 },
      { productName: "チャミスル", quantity: 150, sales: 75000 },
    ],
    combinations: [
      { products: ["カルビ盛り合わせ", "タン塩", "ハラミ"], count: 125, totalSales: 468750 },
      { products: ["カルビ盛り合わせ", "冷麺"], count: 85, totalSales: 195500 },
      { products: ["タン塩", "ビビンバ"], count: 62, totalSales: 111600 },
      { products: ["上カルビ", "ホルモン盛り", "マッコリ"], count: 55, totalSales: 165000 },
      { products: ["サムギョプサル", "キムチ盛り合わせ", "チャミスル"], count: 48, totalSales: 115200 },
      { products: ["カルビ盛り合わせ", "ナムル盛り合わせ", "韓国のり"], count: 42, totalSales: 121800 },
    ],
  },
  "281005": { // BIGGY
    products: [
      { productName: "ショートケーキ", quantity: 380, sales: 228000 },
      { productName: "チョコレートケーキ", quantity: 320, sales: 224000 },
      { productName: "季節のフルーツタルト", quantity: 280, sales: 252000 },
      { productName: "コーヒー", quantity: 520, sales: 260000 },
      { productName: "紅茶", quantity: 380, sales: 171000 },
      { productName: "チーズケーキ", quantity: 250, sales: 175000 },
      { productName: "モンブラン", quantity: 220, sales: 176000 },
      { productName: "ティラミス", quantity: 200, sales: 160000 },
      { productName: "カフェラテ", quantity: 350, sales: 175000 },
      { productName: "カプチーノ", quantity: 280, sales: 140000 },
      { productName: "ホットチョコレート", quantity: 150, sales: 90000 },
      { productName: "アイスクリーム", quantity: 320, sales: 160000 },
    ],
    combinations: [
      { products: ["ショートケーキ", "コーヒー"], count: 145, totalSales: 116000 },
      { products: ["チョコレートケーキ", "紅茶"], count: 98, totalSales: 83300 },
      { products: ["季節のフルーツタルト", "コーヒー"], count: 72, totalSales: 82800 },
      { products: ["チーズケーキ", "カフェラテ"], count: 65, totalSales: 58500 },
      { products: ["モンブラン", "紅茶"], count: 55, totalSales: 49500 },
      { products: ["ティラミス", "カプチーノ"], count: 48, totalSales: 43200 },
      { products: ["アイスクリーム", "ホットチョコレート"], count: 35, totalSales: 31500 },
    ],
  },
}

// 期間別データを生成するヘルパー関数
function createPeriodData(
  baseSales: number,
  baseCustomers: number,
  multiplier: number,
  storeProducts: { products: SimpleProductData[]; combinations: SimpleCombinationData[] }
  ): StoreDetailPeriod {
  const totalSales = Math.round(baseSales * multiplier)
  const totalCustomers = Math.round(baseCustomers * multiplier)
  const totalTables = Math.round(totalCustomers / 2.5)
  
  // 事前決済と事後決済の比率（約60%:40%）
  const prepaidRatio = 0.6
  const prepaidSales = Math.round(totalSales * prepaidRatio)
  const postpaidSales = totalSales - prepaidSales
  const prepaidCustomers = Math.round(totalCustomers * prepaidRatio)
  const postpaidCustomers = totalCustomers - prepaidCustomers
  const prepaidTables = Math.round(totalTables * prepaidRatio)
  const postpaidTables = totalTables - prepaidTables
  
  return {
  summary: {
  totalSales,
  totalCustomers,
  totalTables,
  averagePerCustomer: totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0,
  averagePerTable: totalTables > 0 ? Math.round(totalSales / totalTables) : 0,
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
  },
  products: storeProducts.products.map(p => {
    const quantity = Math.round(p.quantity * multiplier)
    const sales = Math.round(p.sales * multiplier)
    const prepaidQuantity = Math.round(quantity * 0.6)
    const postpaidQuantity = quantity - prepaidQuantity
    const prepaidSales = Math.round(sales * 0.6)
    const postpaidSales = sales - prepaidSales
    return {
      productName: p.productName,
      quantity,
      sales,
      prepaidQuantity,
      postpaidQuantity,
      prepaidSales,
      postpaidSales,
    }
  }),
  combinations: storeProducts.combinations.map(c => {
    const count = Math.round(c.count * multiplier)
    const totalSales = Math.round(c.totalSales * multiplier)
    const prepaidCount = Math.round(count * 0.6)
    const postpaidCount = count - prepaidCount
    const prepaidSales = Math.round(totalSales * 0.6)
    const postpaidSales = totalSales - prepaidSales
    return {
      products: c.products,
      count,
      totalSales,
      prepaidCount,
      postpaidCount,
      prepaidSales,
      postpaidSales,
    }
  }),
  }
  }

// デフォルト店舗詳細データ
export function getDefaultStoreDetailData(storeId: string): StoreDetailData {
  // defaultStoresから該当店舗を検索
  const store = defaultStores.find(s => s.storeId === storeId)
  const storeName = store?.storeName || "サンプル店舗"
  const totalSales = store?.totalSales || 1250000
  const totalCustomers = store?.customers || 320
  
  // 店舗別の商品データがあれば使用、なければデフォルト
  const storeProducts = storeProductsMap[storeId] || {
    products: [
      { productName: "ランチセット", quantity: 180, sales: Math.round(totalSales * 0.25) },
      { productName: "ディナーコース", quantity: 85, sales: Math.round(totalSales * 0.35) },
      { productName: "生ビール", quantity: 420, sales: Math.round(totalSales * 0.15) },
      { productName: "ハイボール", quantity: 280, sales: Math.round(totalSales * 0.12) },
      { productName: "デザート盛り合わせ", quantity: 95, sales: Math.round(totalSales * 0.08) },
    ],
    combinations: [
      { products: ["ランチセット", "生ビール"], count: 45, totalSales: Math.round(totalSales * 0.08) },
      { products: ["ディナーコース", "生ビール", "デザート盛り合わせ"], count: 32, totalSales: Math.round(totalSales * 0.15) },
      { products: ["ランチセット"], count: 28, totalSales: Math.round(totalSales * 0.04) },
      { products: ["生ビール", "ハイボール"], count: 22, totalSales: Math.round(totalSales * 0.03) },
    ],
  }

  // 店舗用の曜日別データを生成（曜日ごとにグループ化）
  const baseDailyCustomers = Math.round(totalCustomers / 30)
  const baseAvgPerCustomer = totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0
  const dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]> = {
    "月": [],
    "火": [],
    "水": [],
    "木": [],
    "金": [],
    "土": [],
    "日": [],
  }
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
  const dayKeys = ["日", "月", "火", "水", "木", "金", "土"]
  
  for (let week = 11; week >= 0; week--) {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date()
      date.setDate(date.getDate() - (week * 7 + (6 - dayIndex)))
      const dayOfWeek = date.getDay()
      const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : dayOfWeek === 5 ? 1.2 : 1.0
      const randomFactor = 0.8 + Math.random() * 0.4
      const dayKey = dayKeys[dayOfWeek]
      
      dayOfWeekHistory[dayKey].push({
        date: `${date.getMonth() + 1}/${date.getDate()}(${dayNames[dayOfWeek]})`,
        customers: Math.round(baseDailyCustomers * multiplier * randomFactor),
        averagePerCustomer: Math.round(baseAvgPerCustomer * (0.9 + Math.random() * 0.2)),
      })
    }
  }

  // 店舗用の日別データを生成（過去28日）
  const periodData: PeriodData[] = []
  for (let i = 27; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0
    const randomFactor = 0.8 + Math.random() * 0.4
    const dailySales = Math.round((totalSales / 30) * multiplier * randomFactor)
    const dailyCustomers = Math.round(baseDailyCustomers * multiplier * randomFactor)
    
    periodData.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      sales: dailySales,
      customers: dailyCustomers,
      averagePerCustomer: dailyCustomers > 0 ? Math.round(dailySales / dailyCustomers) : 0,
    })
  }

  // 店舗用の週別データを生成（過去12週）
  const weeklyData: WeeklyData[] = []
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay() + 1))
    const randomFactor = 0.85 + Math.random() * 0.3
    const weeklySales = Math.round((totalSales / 4) * randomFactor)
    const weeklyCustomers = Math.round((totalCustomers / 4) * randomFactor)
    
    weeklyData.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}週`,
      sales: weeklySales,
      customers: weeklyCustomers,
      averagePerCustomer: weeklyCustomers > 0 ? Math.round(weeklySales / weeklyCustomers) : 0,
    })
  }

  // 店舗用の月別データを生成（過去12ヶ月）
  const monthlyData: MonthlyData[] = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - i)
    const randomFactor = 0.85 + Math.random() * 0.3
    const monthlySales = Math.round(totalSales * randomFactor)
    const monthlyCustomers = Math.round(totalCustomers * randomFactor)
    
    monthlyData.push({
      month: `${monthDate.getFullYear()}/${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
      sales: monthlySales,
      customers: monthlyCustomers,
      averagePerCustomer: monthlyCustomers > 0 ? Math.round(monthlySales / monthlyCustomers) : 0,
    })
  }

  // 店舗用の曜日ごとの時間帯別データを生成（10時〜23時）
  const hourlyDataByDayOfWeek: Record<string, HourlyData[]> = {
    "月": [],
    "火": [],
    "水": [],
    "木": [],
    "金": [],
    "土": [],
    "日": [],
  }
  const hourlyMultipliers: Record<number, number> = {
    10: 0.3,  // 朝は少なめ
    11: 0.6,
    12: 1.5,  // ランチピーク
    13: 1.3,
    14: 0.7,
    15: 0.4,
    16: 0.5,
    17: 0.8,
    18: 1.2,
    19: 1.6,  // ディナーピーク
    20: 1.4,
    21: 1.0,
    22: 0.6,
    23: 0.3,
  }
  // 曜日ごとの傾向（平日/週末で異なる）
  const dayMultipliers: Record<string, number> = {
    "月": 0.9,
    "火": 0.95,
    "水": 1.0,
    "木": 1.0,
    "金": 1.2,
    "土": 1.4,
    "日": 1.3,
  }
  
  for (const dayKey of Object.keys(hourlyDataByDayOfWeek)) {
    const dayMult = dayMultipliers[dayKey] || 1.0
    for (let hour = 10; hour <= 23; hour++) {
      const multiplier = hourlyMultipliers[hour] || 1.0
      const randomFactor = 0.85 + Math.random() * 0.3
      const hourlyCustomers = Math.round(baseDailyCustomers * multiplier * dayMult * randomFactor * 0.15)
      const hourlySales = Math.round((totalSales / 30) * multiplier * dayMult * randomFactor * 0.15)
      
      hourlyDataByDayOfWeek[dayKey].push({
        hour: `${hour}時`,
        customers: Math.max(1, hourlyCustomers),
        averagePerCustomer: hourlyCustomers > 0 ? Math.round(hourlySales / hourlyCustomers) : baseAvgPerCustomer,
      })
    }
  }

  return {
    storeId,
    storeName,
    today: createPeriodData(totalSales, totalCustomers, 0.03, storeProducts), // 本日は月間の約3%
    thisMonth: createPeriodData(totalSales, totalCustomers, 1, storeProducts), // 今月は基準値
    lastMonth: createPeriodData(totalSales, totalCustomers, 1.05, storeProducts), // 先月は今月より5%多い
    dayOfWeekHistory,
    hourlyDataByDayOfWeek,
    periodData,
    weeklyData,
    monthlyData,
  }
}
