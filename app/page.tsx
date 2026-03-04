"use client"

import { useState } from "react"
import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { StoreTable } from "@/components/dashboard/store-table"
import { DayOfWeekChart } from "@/components/dashboard/day-of-week-chart"
import { PeriodCharts } from "@/components/dashboard/period-charts"
import { PaymentFilterComponent, type PaymentFilter } from "@/components/dashboard/payment-filter"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DashboardData } from "@/lib/spreadsheet"
import type { Session } from "@/lib/auth-types"

type PeriodTab = "本日" | "今月" | "先月"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodTab>("本日")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>({ prepaid: true, postpaid: true })
  const periods: PeriodTab[] = ["本日", "今月", "先月"]

  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher
  )

  const { data: session } = useSWR<Session>("/api/auth/session", fetcher)

  const userName = session?.user?.name
  const buildingName = session?.user?.buildingName || "ダッシュボード"

  // 全店舗リストを取得（今月のデータから）
  const stores = data?.thisMonth?.stores || []

  if (isLoading) {
    return (
      <DashboardLayout stores={[]} userName={userName} buildingName={buildingName}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout stores={[]} userName={userName} buildingName={buildingName}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-destructive">データの取得に失敗しました</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // 選択された期間に応じたデータを取得
  const getPeriodData = () => {
    switch (selectedPeriod) {
      case "本日":
        return data.today
      case "今月":
        return data.thisMonth
      case "先月":
        return data.lastMonth
      default:
        return data.today
    }
  }

  const currentPeriodData = getPeriodData()

  return (
    <DashboardLayout stores={stores} userName={userName} buildingName={buildingName}>
      <div className="p-4 lg:p-6">
        <div className="max-w-6xl space-y-5">
          {/* ブロック1: 期間別サマリー */}
          <section className="bg-card rounded-lg border border-border p-4">
            <h1 className="text-base font-medium text-foreground mb-3">
              全体サマリー
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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

            <SummaryCards data={currentPeriodData.summary} paymentFilter={paymentFilter} />

            <div className="mt-4">
              <StoreTable stores={currentPeriodData.stores} paymentFilter={paymentFilter} />
            </div>
          </section>

          {/* ブロック2: 曜日別・時間帯別 */}
          <section className="bg-card rounded-lg border border-border p-4">
            <DayOfWeekChart 
              dayOfWeekHistory={data.dayOfWeekHistory}
              hourlyDataByDayOfWeek={data.hourlyDataByDayOfWeek}
              paymentFilter={paymentFilter}
            />
          </section>

          {/* ブロック3: 期間別チャート */}
          <section className="bg-card rounded-lg border border-border p-4">
            <PeriodCharts
              periodData={data.periodData}
              weeklyData={data.weeklyData}
              monthlyData={data.monthlyData}
              paymentFilter={paymentFilter}
            />
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
