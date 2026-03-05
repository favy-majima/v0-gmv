"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DayOfWeekChart } from "@/components/dashboard/day-of-week-chart"
import { PeriodCharts } from "@/components/dashboard/period-charts"
import { PaymentFilterComponent, type PaymentFilter, getFilteredValue, getFilteredAverage } from "@/components/dashboard/payment-filter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StoreDetailData, StoreDetailPeriod } from "@/lib/spreadsheet"

type PeriodTab = "本日" | "今月" | "先月"
type ProductSortKey = "productName" | "quantity" | "sales"
type ComboSortKey = "count" | "totalSales" | "avgPrice"
type SortDirection = "asc" | "desc" | null

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number): string {
  return value.toLocaleString("ja-JP")
}

const INITIAL_DISPLAY_COUNT = 5
const LOAD_MORE_COUNT = 20

// 固定の店舗情報（後で認証と連携する）
const SHOP_ID = "281001"
const SHOP_NAME = "鮨TOKYO「鶴亀」浜松・小田原町店"

export default function ShopDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodTab>("本日")
  const [productsDisplayCount, setProductsDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [combinationsDisplayCount, setCombinationsDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [crossSellDisplayCount, setCrossSellDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<string>("")
  const [productSortKey, setProductSortKey] = useState<ProductSortKey | null>(null)
  const [productSortDirection, setProductSortDirection] = useState<SortDirection>(null)
  const [comboSortKey, setComboSortKey] = useState<ComboSortKey | null>(null)
  const [comboSortDirection, setComboSortDirection] = useState<SortDirection>(null)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>({ prepaid: true, postpaid: true })
  const periods: PeriodTab[] = ["本日", "今月", "先月"]

  // 店舗データを取得（固定のshopIdを使用）
  const { data: storeData, error, isLoading } = useSWR<StoreDetailData>(
    `/api/shop/${SHOP_ID}`,
    fetcher
  )

  // 選択された期間に応じたデータを取得
  const currentPeriodData = useMemo((): StoreDetailPeriod => {
    if (!storeData) {
      return {
        summary: { totalSales: 0, totalCustomers: 0, totalTables: 0, averagePerCustomer: 0, averagePerTable: 0, prepaidSales: 0, postpaidSales: 0, prepaidCustomers: 0, postpaidCustomers: 0, prepaidTables: 0, postpaidTables: 0, prepaidAvgPerCustomer: 0, postpaidAvgPerCustomer: 0, prepaidAvgPerTable: 0, postpaidAvgPerTable: 0 },
        products: [],
        combinations: [],
      }
    }
    switch (selectedPeriod) {
      case "本日":
        return storeData.today
      case "今月":
        return storeData.thisMonth
      case "先月":
        return storeData.lastMonth
      default:
        return storeData.today
    }
  }, [storeData, selectedPeriod])

  // ソート済み商品リスト
  const sortedProducts = useMemo(() => {
    if (!productSortKey || !productSortDirection) return currentPeriodData.products
    
    return [...currentPeriodData.products].sort((a, b) => {
      const aVal = a[productSortKey]
      const bVal = b[productSortKey]
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return productSortDirection === "asc" 
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja")
      }
      
      return productSortDirection === "asc" 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [currentPeriodData.products, productSortKey, productSortDirection])

  // ソート済み組み合わせリスト
  const sortedCombinations = useMemo(() => {
    if (!comboSortKey || !comboSortDirection) return currentPeriodData.combinations
    
    return [...currentPeriodData.combinations].sort((a, b) => {
      let aVal: number
      let bVal: number
      
      if (comboSortKey === "avgPrice") {
        aVal = a.count > 0 ? Math.round(a.totalSales / a.count) : 0
        bVal = b.count > 0 ? Math.round(b.totalSales / b.count) : 0
      } else {
        aVal = a[comboSortKey]
        bVal = b[comboSortKey]
      }
      
      return comboSortDirection === "asc" 
        ? aVal - bVal
        : bVal - aVal
    })
  }, [currentPeriodData.combinations, comboSortKey, comboSortDirection])

  // クロスセル分析：基準商品を含む組み合わせから、一緒に注文された商品を集計
  const crossSellData = useMemo(() => {
    if (!selectedBaseProduct) return { baseProductTables: 0, relatedProducts: [] }
    
    const combosWithBase = currentPeriodData.combinations.filter((combo) =>
      combo.products.includes(selectedBaseProduct)
    )
    
    const baseProductTables = combosWithBase.reduce((sum, combo) => {
      return sum + getFilteredValue(combo.count, combo.prepaidCount, combo.postpaidCount, paymentFilter)
    }, 0)
    
    const relatedMap = new Map<string, { count: number; sales: number }>()
    for (const combo of combosWithBase) {
      const comboCount = getFilteredValue(combo.count, combo.prepaidCount, combo.postpaidCount, paymentFilter)
      const comboSales = getFilteredValue(combo.totalSales, combo.prepaidSales, combo.postpaidSales, paymentFilter)
      for (const product of combo.products) {
        if (product === selectedBaseProduct) continue
        const existing = relatedMap.get(product) || { count: 0, sales: 0 }
        relatedMap.set(product, {
          count: existing.count + comboCount,
          sales: existing.sales + comboSales,
        })
      }
    }
    
    const relatedProducts = Array.from(relatedMap.entries())
      .map(([productName, data]) => ({
        productName,
        count: data.count,
        sales: data.sales,
        rate: baseProductTables > 0 ? (data.count / baseProductTables) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
    
    return { baseProductTables, relatedProducts }
  }, [currentPeriodData.combinations, selectedBaseProduct, paymentFilter])

  // 商品一覧（クロスセル分析の基準商品選択用）
  const productOptions = useMemo(() => {
    return currentPeriodData.products
      .map((p) => p.productName)
      .sort((a, b) => a.localeCompare(b, "ja"))
  }, [currentPeriodData.products])

  // 全商品のクロスセル力ランキング
  const crossSellRanking = useMemo(() => {
    const ranking: {
      productName: string
      tables: number
      relatedCount: number
      avgRelatedProducts: number
      topRelated: string[]
    }[] = []

    for (const product of currentPeriodData.products) {
      const productName = product.productName
      const combosWithProduct = currentPeriodData.combinations.filter((combo) =>
        combo.products.includes(productName)
      )
      
      if (combosWithProduct.length === 0) continue

      const tables = combosWithProduct.reduce((sum, combo) => {
        return sum + getFilteredValue(combo.count, combo.prepaidCount, combo.postpaidCount, paymentFilter)
      }, 0)

      const relatedMap = new Map<string, number>()
      let totalRelatedItems = 0
      for (const combo of combosWithProduct) {
        const comboCount = getFilteredValue(combo.count, combo.prepaidCount, combo.postpaidCount, paymentFilter)
        for (const p of combo.products) {
          if (p === productName) continue
          relatedMap.set(p, (relatedMap.get(p) || 0) + comboCount)
          totalRelatedItems += comboCount
        }
      }

      const avgRelatedProducts = tables > 0 ? totalRelatedItems / tables : 0

      const topRelated = Array.from(relatedMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)

      ranking.push({
        productName,
        tables,
        relatedCount: relatedMap.size,
        avgRelatedProducts,
        topRelated,
      })
    }

    return ranking.sort((a, b) => b.avgRelatedProducts - a.avgRelatedProducts)
  }, [currentPeriodData.products, currentPeriodData.combinations, paymentFilter])
  
  // 商品ソートハンドラー
  const handleProductSort = (key: ProductSortKey) => {
    if (productSortKey === key) {
      if (productSortDirection === "desc") {
        setProductSortDirection("asc")
      } else if (productSortDirection === "asc") {
        setProductSortKey(null)
        setProductSortDirection(null)
      } else {
        setProductSortDirection("desc")
      }
    } else {
      setProductSortKey(key)
      setProductSortDirection("desc")
    }
  }

  // 組み合わせソートハンドラー
  const handleComboSort = (key: ComboSortKey) => {
    if (comboSortKey === key) {
      if (comboSortDirection === "desc") {
        setComboSortDirection("asc")
      } else if (comboSortDirection === "asc") {
        setComboSortKey(null)
        setComboSortDirection(null)
      } else {
        setComboSortDirection("desc")
      }
    } else {
      setComboSortKey(key)
      setComboSortDirection("desc")
    }
  }

  // ソートアイコンコンポーネント
  const ProductSortIcon = ({ columnKey }: { columnKey: ProductSortKey }) => {
    if (productSortKey !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline" />
    }
    return productSortDirection === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />
  }

  const ComboSortIcon = ({ columnKey }: { columnKey: ComboSortKey }) => {
    if (comboSortKey !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline" />
    }
    return comboSortDirection === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />
  }

  if (isLoading) {
    return (
      <DashboardLayout userName={SHOP_NAME} shopName={SHOP_NAME}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !storeData) {
    return (
      <DashboardLayout userName={SHOP_NAME} shopName={SHOP_NAME}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-destructive">店舗データの取得に失敗しました</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={SHOP_NAME} shopName={SHOP_NAME}>
      <div className="p-4 lg:p-6">
        <div className="max-w-6xl space-y-4">
          {/* 店舗名 */}
          <h1 className="text-lg font-semibold text-foreground">
            {storeData.storeName}
          </h1>

          {/* 期間セレクター */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-3 sm:px-4 h-8 text-[13px] flex-1 sm:flex-none",
                    selectedPeriod === period
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                  )}
                >
                  {period}
                </Button>
              ))}
            </div>
            <PaymentFilterComponent filter={paymentFilter} onChange={setPaymentFilter} />
          </div>

          {/* サマリーカード */}
          {(() => {
            const showBreakdown = paymentFilter.prepaid && paymentFilter.postpaid
            const s = currentPeriodData.summary
            const totalSales = getFilteredValue(s.totalSales, s.prepaidSales, s.postpaidSales, paymentFilter)
            const totalCustomers = getFilteredValue(s.totalCustomers, s.prepaidCustomers, s.postpaidCustomers, paymentFilter)
            const totalTables = getFilteredValue(s.totalTables, s.prepaidTables, s.postpaidTables, paymentFilter)
            const avgPerCustomer = getFilteredAverage(s.averagePerCustomer, s.prepaidAvgPerCustomer, s.postpaidAvgPerCustomer, paymentFilter)
            const avgPerTable = getFilteredAverage(s.averagePerTable, s.prepaidAvgPerTable, s.postpaidAvgPerTable, paymentFilter)
            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">合計金額</div>
                    <div className="text-xl font-semibold text-foreground tracking-tight mb-3">
                      {formatCurrency(totalSales)}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">円</span>
                    </div>
                    {showBreakdown && (
                      <div className="flex gap-3 pt-2 border-t border-border/40">
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事前決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.prepaidSales)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事後決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.postpaidSales)}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">客数</div>
                    <div className="text-xl font-semibold text-foreground tracking-tight mb-3">
                      {formatCurrency(totalCustomers)}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">人</span>
                    </div>
                    {showBreakdown && (
                      <div className="flex gap-3 pt-2 border-t border-border/40">
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事前決済</div>
                          <div className="text-xs text-foreground">{formatCurrency(s.prepaidCustomers)}人</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事後決済</div>
                          <div className="text-xs text-foreground">{formatCurrency(s.postpaidCustomers)}人</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">テーブル数</div>
                    <div className="text-xl font-semibold text-foreground tracking-tight mb-3">
                      {formatCurrency(totalTables)}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">組</span>
                    </div>
                    {showBreakdown && (
                      <div className="flex gap-3 pt-2 border-t border-border/40">
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事前決済</div>
                          <div className="text-xs text-foreground">{formatCurrency(s.prepaidTables)}組</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事後決済</div>
                          <div className="text-xs text-foreground">{formatCurrency(s.postpaidTables)}組</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">客単価</div>
                    <div className="text-xl font-semibold text-foreground tracking-tight mb-3">
                      {formatCurrency(avgPerCustomer)}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">円</span>
                    </div>
                    {showBreakdown && (
                      <div className="flex gap-3 pt-2 border-t border-border/40">
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事前決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.prepaidAvgPerCustomer)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事後決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.postpaidAvgPerCustomer)}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">テーブル単価</div>
                    <div className="text-xl font-semibold text-foreground tracking-tight mb-3">
                      {formatCurrency(avgPerTable)}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">円</span>
                    </div>
                    {showBreakdown && (
                      <div className="flex gap-3 pt-2 border-t border-border/40">
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事前決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.prepaidAvgPerTable)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-muted-foreground mb-0.5">事後決済</div>
                          <div className="text-xs text-foreground">¥{formatCurrency(s.postpaidAvgPerTable)}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })()}

          {/* 商品別テーブル */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-medium">商品別 出数・売上</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 overflow-x-auto">
              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-[40px] sm:w-[50px] text-xs text-muted-foreground whitespace-nowrap">順位</TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        productSortKey === "productName" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleProductSort("productName")}
                    >
                      商品名
                      <ProductSortIcon columnKey="productName" />
                    </TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        productSortKey === "quantity" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleProductSort("quantity")}
                    >
                      出数
                      <ProductSortIcon columnKey="quantity" />
                    </TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        productSortKey === "sales" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleProductSort("sales")}
                    >
                      売上
                      <ProductSortIcon columnKey="sales" />
                    </TableHead>
                    <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">売上構成比</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.slice(0, productsDisplayCount).map((product, index) => {
                    const quantity = getFilteredValue(product.quantity, product.prepaidQuantity, product.postpaidQuantity, paymentFilter)
                    const sales = getFilteredValue(product.sales, product.prepaidSales, product.postpaidSales, paymentFilter)
                    const totalSalesFiltered = getFilteredValue(
                      currentPeriodData.summary.totalSales,
                      currentPeriodData.summary.prepaidSales,
                      currentPeriodData.summary.postpaidSales,
                      paymentFilter
                    )
                    const salesPercentage = totalSalesFiltered > 0
                      ? ((sales / totalSalesFiltered) * 100).toFixed(1)
                      : "0.0"
                    return (
                      <TableRow key={product.productName} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <TableCell className="text-[13px] text-muted-foreground py-2">{index + 1}</TableCell>
                        <TableCell className="text-[13px] max-w-[180px] sm:max-w-[300px] truncate py-2">
                          {product.productName}
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {formatCurrency(quantity)}
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {formatCurrency(sales)}円
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {salesPercentage}%
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {sortedProducts.length > productsDisplayCount && (
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-secondary border-border hover:bg-secondary/80"
                    onClick={() => setProductsDisplayCount(prev => prev + LOAD_MORE_COUNT)}
                  >
                    もっと表示する（残り{sortedProducts.length - productsDisplayCount}件）
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 商品組み合わせ分析 */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-medium">テーブル別 商品組み合わせ分析</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                1つのテーブルで注文された商品の組み合わせ
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 overflow-x-auto">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-[40px] sm:w-[50px] text-xs text-muted-foreground whitespace-nowrap">順位</TableHead>
                    <TableHead className="text-xs text-muted-foreground whitespace-nowrap">商品組み合わせ</TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        comboSortKey === "count" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleComboSort("count")}
                    >
                      テーブル数
                      <ComboSortIcon columnKey="count" />
                    </TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        comboSortKey === "totalSales" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleComboSort("totalSales")}
                    >
                      合計売上
                      <ComboSortIcon columnKey="totalSales" />
                    </TableHead>
                    <TableHead 
                      className={cn(
                        "text-xs text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                        comboSortKey === "avgPrice" ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => handleComboSort("avgPrice")}
                    >
                      平均単価
                      <ComboSortIcon columnKey="avgPrice" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCombinations.slice(0, combinationsDisplayCount).map((combo, index) => {
                    const count = getFilteredValue(combo.count, combo.prepaidCount, combo.postpaidCount, paymentFilter)
                    const totalSales = getFilteredValue(combo.totalSales, combo.prepaidSales, combo.postpaidSales, paymentFilter)
                    const avgPrice = count > 0 ? Math.round(totalSales / count) : 0
                    return (
                      <TableRow key={combo.products.join("+")} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <TableCell className="text-[13px] text-muted-foreground py-2">{index + 1}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-1 min-w-[150px]">
                            {combo.products.map((product, i) => (
                              <span
                                key={`${product}-${i}`}
                                className="inline-block px-1.5 py-0.5 text-[10px] sm:text-[11px] bg-secondary text-secondary-foreground rounded"
                              >
                                {product}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {formatCurrency(count)}組
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {formatCurrency(totalSales)}円
                        </TableCell>
                        <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                          {formatCurrency(avgPrice)}円
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {sortedCombinations.length > combinationsDisplayCount && (
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-secondary border-border hover:bg-secondary/80"
                    onClick={() => setCombinationsDisplayCount(prev => prev + LOAD_MORE_COUNT)}
                  >
                    もっと表示する（残り{sortedCombinations.length - combinationsDisplayCount}件）
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* クロスセル分析 */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-medium">クロスセル分析</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                特定の商品を注文したテーブルが、他に何を一緒に注文しているかを分析
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {/* クロスセル力ランキング */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">クロスセル力ランキング</h4>
                <p className="text-[11px] text-muted-foreground mb-3">
                  平均併売商品数が多い商品ほど、他の商品と一緒に注文されやすい
                </p>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="w-[40px] text-xs text-muted-foreground whitespace-nowrap">順位</TableHead>
                        <TableHead className="text-xs text-muted-foreground whitespace-nowrap">商品名</TableHead>
                        <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">テーブル数</TableHead>
                        <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">平均併売数</TableHead>
                        <TableHead className="text-xs text-muted-foreground whitespace-nowrap">よく一緒に注文される商品</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crossSellRanking.slice(0, 10).map((item, index) => (
                        <TableRow 
                          key={item.productName} 
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedBaseProduct(item.productName)}
                        >
                          <TableCell className="text-[13px] text-muted-foreground py-2">{index + 1}</TableCell>
                          <TableCell className="text-[13px] max-w-[150px] truncate py-2 font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                            {formatCurrency(item.tables)}組
                          </TableCell>
                          <TableCell className="text-[13px] text-right py-2 whitespace-nowrap font-medium text-primary">
                            {item.avgRelatedProducts.toFixed(1)}品
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap gap-1">
                              {item.topRelated.map((related, i) => (
                                <span
                                  key={`${related}-${i}`}
                                  className="inline-block px-1.5 py-0.5 text-[10px] bg-secondary text-secondary-foreground rounded"
                                >
                                  {related}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <label className="text-xs text-muted-foreground block mb-1.5">詳細を見る商品を選択（または上の表から行をクリック）</label>
                <Select value={selectedBaseProduct} onValueChange={setSelectedBaseProduct}>
                  <SelectTrigger className="w-full sm:w-[280px] h-9 text-[13px]">
                    <SelectValue placeholder="商品を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((product) => (
                      <SelectItem key={product} value={product} className="text-[13px]">
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBaseProduct && (
                <>
                  <div className="mb-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      「{selectedBaseProduct}」を注文したテーブル数
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(crossSellData.baseProductTables)}組
                    </div>
                  </div>

                  {crossSellData.relatedProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[480px]">
                        <TableHeader>
                          <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="w-[40px] sm:w-[50px] text-xs text-muted-foreground whitespace-nowrap">順位</TableHead>
                            <TableHead className="text-xs text-muted-foreground whitespace-nowrap">一緒に注文された商品</TableHead>
                            <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">注文回数</TableHead>
                            <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">併売率</TableHead>
                            <TableHead className="text-xs text-right text-muted-foreground whitespace-nowrap">関連売上</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {crossSellData.relatedProducts.slice(0, crossSellDisplayCount).map((item, index) => (
                            <TableRow key={item.productName} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <TableCell className="text-[13px] text-muted-foreground py-2">{index + 1}</TableCell>
                              <TableCell className="text-[13px] max-w-[180px] sm:max-w-[300px] truncate py-2">
                                {item.productName}
                              </TableCell>
                              <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                                {formatCurrency(item.count)}回
                              </TableCell>
                              <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                                {item.rate.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-[13px] text-right py-2 whitespace-nowrap">
                                {formatCurrency(item.sales)}円
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {crossSellData.relatedProducts.length > crossSellDisplayCount && (
                        <div className="mt-3 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-secondary border-border hover:bg-secondary/80"
                            onClick={() => setCrossSellDisplayCount(prev => prev + LOAD_MORE_COUNT)}
                          >
                            もっと表示する（残り{crossSellData.relatedProducts.length - crossSellDisplayCount}件）
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      この商品は他の商品と組み合わせて注文されていません
                    </div>
                  )}
                </>
              )}

              {!selectedBaseProduct && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  基準となる商品を選択すると、その商品と一緒に注文された商品のランキングが表示されます
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 曜日別・時間帯別チャート */}
          <section className="bg-card rounded-lg border border-border p-4">
            <DayOfWeekChart
              dayOfWeekHistory={storeData.dayOfWeekHistory}
              hourlyDataByDayOfWeek={storeData.hourlyDataByDayOfWeek}
              paymentFilter={paymentFilter}
            />
          </section>

          {/* 期間別チャート */}
          <section className="bg-card rounded-lg border border-border p-4">
            <PeriodCharts
              periodData={storeData.periodData}
              weeklyData={storeData.weeklyData}
              monthlyData={storeData.monthlyData}
              paymentFilter={paymentFilter}
            />
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
