"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Wallet, LayoutGrid } from "lucide-react"
import type { SummaryData } from "@/lib/spreadsheet"
import { type PaymentFilter, getFilteredValue, getFilteredAverage } from "./payment-filter"

interface SummaryCardProps {
  title: string
  value: string
  prepaid: string
  postpaid: string
  icon: React.ReactNode
  accentColor: string
  showBreakdown: boolean
}

function SummaryCard({ title, value, prepaid, postpaid, icon, accentColor, showBreakdown }: SummaryCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className={`p-1 sm:p-1.5 rounded ${accentColor}`}>
            {icon}
          </div>
          <span className="text-[11px] sm:text-xs text-muted-foreground">{title}</span>
        </div>
        <div className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mb-2 sm:mb-3">{value}</div>
        {showBreakdown && (
          <div className="flex gap-2 sm:gap-3 pt-2 border-t border-border/40">
            <div className="flex-1">
              <div className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5">事前決済</div>
              <div className="text-[11px] sm:text-xs text-foreground">{prepaid}</div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5">事後決済</div>
              <div className="text-[11px] sm:text-xs text-foreground">{postpaid}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SummaryCardsProps {
  data: SummaryData
  paymentFilter?: PaymentFilter
}

export function SummaryCards({ data, paymentFilter }: SummaryCardsProps) {
  const filter = paymentFilter || { prepaid: true, postpaid: true }
  const showBreakdown = filter.prepaid && filter.postpaid

  const totalSales = getFilteredValue(data.totalSales, data.prepaidSales, data.postpaidSales, filter)
  const totalCustomers = getFilteredValue(data.totalCustomers, data.prepaidCustomers, data.postpaidCustomers, filter)
  const avgPerCustomer = getFilteredAverage(data.averagePerCustomer, data.prepaidAvgPerCustomer, data.postpaidAvgPerCustomer, filter)
  const avgPerTable = getFilteredAverage(data.averagePerTable, data.prepaidAvgPerTable, data.postpaidAvgPerTable, filter)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <SummaryCard
        title="合計金額"
        value={`¥${totalSales.toLocaleString()}`}
        prepaid={`¥${data.prepaidSales.toLocaleString()}`}
        postpaid={`¥${data.postpaidSales.toLocaleString()}`}
        icon={<TrendingUp className="h-3.5 w-3.5 text-primary" />}
        accentColor="bg-primary/10"
        showBreakdown={showBreakdown}
      />
      <SummaryCard
        title="客数"
        value={`${totalCustomers.toLocaleString()}人`}
        prepaid={`${data.prepaidCustomers.toLocaleString()}人`}
        postpaid={`${data.postpaidCustomers.toLocaleString()}人`}
        icon={<Users className="h-3.5 w-3.5 text-accent" />}
        accentColor="bg-accent/10"
        showBreakdown={showBreakdown}
      />
      <SummaryCard
        title="客単価"
        value={`¥${avgPerCustomer.toLocaleString()}`}
        prepaid={`¥${data.prepaidAvgPerCustomer.toLocaleString()}`}
        postpaid={`¥${data.postpaidAvgPerCustomer.toLocaleString()}`}
        icon={<Wallet className="h-3.5 w-3.5 text-chart-3" />}
        accentColor="bg-chart-3/10"
        showBreakdown={showBreakdown}
      />
      <SummaryCard
        title="テーブル単価"
        value={`¥${avgPerTable.toLocaleString()}`}
        prepaid={`¥${data.prepaidAvgPerTable.toLocaleString()}`}
        postpaid={`¥${data.postpaidAvgPerTable.toLocaleString()}`}
        icon={<LayoutGrid className="h-3.5 w-3.5 text-chart-4" />}
        accentColor="bg-chart-4/10"
        showBreakdown={showBreakdown}
      />
    </div>
  )
}
