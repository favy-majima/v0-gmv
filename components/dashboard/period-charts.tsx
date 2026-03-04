"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Tooltip,
  LabelList,
} from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MonthlyData, PeriodData, WeeklyData } from "@/lib/spreadsheet"
import { type PaymentFilter, getFilteredValue, getFilteredAverage } from "./payment-filter"

interface PeriodChartsProps {
  periodData: PeriodData[]
  weeklyData: WeeklyData[]
  monthlyData: MonthlyData[]
  paymentFilter?: PaymentFilter
}

type PeriodView = "日別" | "週別" | "月別"

// Chart colors from design tokens
const CHART_COLORS = {
  primary: "#0070f3",
  accent: "#00d4aa",
  grid: "#222222",
  axis: "#333333",
  text: "#888888",
  textDark: "#ededed",
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const labelMap: Record<string, string> = {
    sales: "売上",
    customers: "客数",
    averagePerCustomer: "客単価",
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {labelMap[entry.dataKey] || entry.dataKey}:{" "}
          {entry.dataKey === "customers"
            ? `${entry.value.toLocaleString()}人`
            : `¥${entry.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

export function PeriodCharts({ periodData, weeklyData, monthlyData, paymentFilter }: PeriodChartsProps) {
  const [periodView, setPeriodView] = useState<PeriodView>("週別")
  const filter = paymentFilter || { prepaid: true, postpaid: true }

  const periodViews: PeriodView[] = ["日別", "週別", "月別"]

  // Get chart data based on selected period view
  const getChartData = () => {
    if (periodView === "日別") {
      return periodData.map((d) => ({
        label: d.date,
        sales: getFilteredValue(d.sales, d.prepaidSales, d.postpaidSales, filter),
        customers: getFilteredValue(d.customers, d.prepaidCustomers, d.postpaidCustomers, filter),
        averagePerCustomer: getFilteredAverage(d.averagePerCustomer, d.prepaidAvgPerCustomer, d.postpaidAvgPerCustomer, filter),
      }))
    } else if (periodView === "月別") {
      return monthlyData.map((d) => ({
        label: d.month,
        sales: getFilteredValue(d.sales, d.prepaidSales, d.postpaidSales, filter),
        customers: getFilteredValue(d.customers, d.prepaidCustomers, d.postpaidCustomers, filter),
        averagePerCustomer: getFilteredAverage(d.averagePerCustomer, d.prepaidAvgPerCustomer, d.postpaidAvgPerCustomer, filter),
      }))
    } else {
      // 週別: 過去12週のデータを使用
      return weeklyData.map((d) => ({
        label: d.week,
        sales: getFilteredValue(d.sales, d.prepaidSales, d.postpaidSales, filter),
        customers: getFilteredValue(d.customers, d.prepaidCustomers, d.postpaidCustomers, filter),
        averagePerCustomer: getFilteredAverage(d.averagePerCustomer, d.prepaidAvgPerCustomer, d.postpaidAvgPerCustomer, filter),
      }))
    }
  }

  const chartData = getChartData()

  const getDescription = () => {
    switch (periodView) {
      case "日別":
        return "過去28日間の日別推移"
      case "週別":
        return "過去12週の週別推移"
      case "月別":
        return "過去12ヶ月の月別推移"
    }
  }

  return (
    <div className="space-y-6">
      {/* 期間切り替えボタン */}
      <div>
        <h2 className="text-base font-medium text-foreground">期間別分析</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">{getDescription()}</p>
        <div className="flex gap-2">
          {periodViews.map((view) => (
            <Button
              key={view}
              variant={periodView === view ? "default" : "outline"}
              onClick={() => setPeriodView(view)}
              className={cn(
                "px-3 sm:px-4 h-8 text-[12px] sm:text-[13px] flex-1 sm:flex-none",
                periodView === view
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
              )}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {/* 期間別 客数・客単価 */}
      <div>
        <h3 className="text-[13px] font-medium text-foreground mb-2">
          期間別 客数・客単価
        </h3>
        <div className="flex items-center gap-3 mb-2 text-[11px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
            <span className="text-muted-foreground">客数</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-accent rounded-sm" />
            <span className="text-muted-foreground">客単価</span>
          </div>
        </div>

        <div className="h-[180px] sm:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                interval={periodView === "日別" ? 4 : 0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickFormatter={(value) => `¥${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="customers"
                fill={CHART_COLORS.primary}
                radius={[3, 3, 0, 0]}
                name="客数"
              >
                <LabelList
                  dataKey="customers"
                  position="top"
                  formatter={(value: number) => `${value}人`}
                  style={{ fill: CHART_COLORS.textDark, fontSize: 9 }}
                />
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averagePerCustomer"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.accent, strokeWidth: 2, r: 3 }}
                name="客単価"
              >
                <LabelList
                  dataKey="averagePerCustomer"
                  position="top"
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                  style={{ fill: CHART_COLORS.accent, fontSize: 8 }}
                  offset={8}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 期間別 売上 */}
      <div>
        <h3 className="text-[13px] font-medium text-foreground mb-2">期間別 売上</h3>
        <div className="flex items-center gap-3 mb-2 text-[11px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
            <span className="text-muted-foreground">売上</span>
          </div>
        </div>

        <div className="h-[180px] sm:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                interval={periodView === "日別" ? 4 : 0}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickFormatter={(value) =>
                  periodView === "月別"
                    ? `¥${(value / 10000).toFixed(0)}万`
                    : `¥${value.toLocaleString()}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sales"
                fill={CHART_COLORS.primary}
                radius={[3, 3, 0, 0]}
                name="売上"
              >
                <LabelList
                  dataKey="sales"
                  position="top"
                  formatter={(value: number) =>
                    value >= 10000
                      ? `¥${(value / 10000).toFixed(1)}万`
                      : `¥${value.toLocaleString()}`
                  }
                  style={{ fill: CHART_COLORS.textDark, fontSize: 9 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
