"use client"

import { useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Tooltip,
  LabelList,
} from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DayOfWeekHistoryData, HourlyData } from "@/lib/spreadsheet"
import { type PaymentFilter, getFilteredValue, getFilteredAverage } from "./payment-filter"

interface DayOfWeekChartProps {
  dayOfWeekHistory: Record<string, DayOfWeekHistoryData[]>
  hourlyDataByDayOfWeek?: Record<string, HourlyData[]>
  paymentFilter?: PaymentFilter
}

type DayOfWeek = "月" | "火" | "水" | "木" | "金" | "土" | "日"
type ChartMode = "history" | "hourly"

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

export function DayOfWeekChart({ dayOfWeekHistory, hourlyDataByDayOfWeek, paymentFilter }: DayOfWeekChartProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("月")
  const [chartMode, setChartMode] = useState<ChartMode>("history")
  const filter = paymentFilter || { prepaid: true, postpaid: true }

  const days: DayOfWeek[] = ["月", "火", "水", "木", "金", "土", "日"]

  const historyChartData = dayOfWeekHistory[selectedDay]?.map((d) => ({
    date: d.date,
    customers: getFilteredValue(d.customers, d.prepaidCustomers, d.postpaidCustomers, filter),
    averagePerCustomer: getFilteredAverage(d.averagePerCustomer, d.prepaidAvgPerCustomer, d.postpaidAvgPerCustomer, filter),
  })) || []

  const hourlyChartData = hourlyDataByDayOfWeek?.[selectedDay]?.map((d) => ({
    hour: d.hour,
    customers: getFilteredValue(d.customers, d.prepaidCustomers, d.postpaidCustomers, filter),
    averagePerCustomer: getFilteredAverage(d.averagePerCustomer, d.prepaidAvgPerCustomer, d.postpaidAvgPerCustomer, filter),
  })) || []

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-medium text-foreground">
          曜日別 客数・客単価
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {chartMode === "history" 
            ? `過去12週の${selectedDay}曜日データ`
            : `${selectedDay}曜日の時間帯別データ`
          }
        </p>
      </div>

      {/* 曜日選択ボタン */}
      <div className="flex gap-1.5 sm:gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "px-3 sm:px-4 h-8 sm:h-9 text-[12px] sm:text-[13px] min-w-[44px] sm:min-w-[60px] flex-shrink-0",
              selectedDay === day
                ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            )}
          >
            {day}
          </Button>
        ))}
      </div>

      {/* モード切り替えタブ（時間帯データがある場合のみ） */}
      {hourlyDataByDayOfWeek && (
        <div className="flex gap-1.5 mb-3">
          <Button
            variant={chartMode === "history" ? "default" : "outline"}
            onClick={() => setChartMode("history")}
            size="sm"
            className={cn(
              "h-7 px-3 text-xs",
              chartMode === "history"
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            )}
          >
            推移
          </Button>
          <Button
            variant={chartMode === "hourly" ? "default" : "outline"}
            onClick={() => setChartMode("hourly")}
            size="sm"
            className={cn(
              "h-7 px-3 text-xs",
              chartMode === "hourly"
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            )}
          >
            時間帯別
          </Button>
        </div>
      )}

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

      <div className="h-[200px] sm:h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartMode === "history" ? historyChartData : hourlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey={chartMode === "history" ? "date" : "hour"}
              tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
              axisLine={{ stroke: CHART_COLORS.axis }}
              tickFormatter={(value) => `${value}`}
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
                style={{ fill: CHART_COLORS.accent, fontSize: 9 }}
                offset={8}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
