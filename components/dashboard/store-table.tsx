"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { StoreData } from "@/lib/spreadsheet"
import { type PaymentFilter, getFilteredValue, getFilteredAverage } from "./payment-filter"

interface StoreTableProps {
  stores: StoreData[]
  paymentFilter?: PaymentFilter
}

type SortKey = "storeName" | "totalSales" | "customers" | "averagePerCustomer"
type SortDirection = "asc" | "desc" | null

export function StoreTable({ stores, paymentFilter }: StoreTableProps) {
  const filter = paymentFilter || { prepaid: true, postpaid: true }
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "desc") {
        setSortDirection("asc")
      } else if (sortDirection === "asc") {
        setSortKey(null)
        setSortDirection(null)
      } else {
        setSortDirection("desc")
      }
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const sortedStores = useMemo(() => {
    if (!sortKey || !sortDirection) return stores
    
    return [...stores].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja")
      }
      
      return sortDirection === "asc" 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [stores, sortKey, sortDirection])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-x-auto">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead 
              className={cn(
                "text-muted-foreground text-xs font-medium cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                sortKey === "storeName" && "text-foreground"
              )}
              onClick={() => handleSort("storeName")}
            >
              店舗名
              <SortIcon columnKey="storeName" />
            </TableHead>
            <TableHead 
              className={cn(
                "text-muted-foreground text-xs font-medium text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                sortKey === "totalSales" && "text-foreground"
              )}
              onClick={() => handleSort("totalSales")}
            >
              合計金額
              <SortIcon columnKey="totalSales" />
            </TableHead>
            <TableHead 
              className={cn(
                "text-muted-foreground text-xs font-medium text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                sortKey === "customers" && "text-foreground"
              )}
              onClick={() => handleSort("customers")}
            >
              客数
              <SortIcon columnKey="customers" />
            </TableHead>
            <TableHead 
              className={cn(
                "text-muted-foreground text-xs font-medium text-right cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
                sortKey === "averagePerCustomer" && "text-foreground"
              )}
              onClick={() => handleSort("averagePerCustomer")}
            >
              客単価
              <SortIcon columnKey="averagePerCustomer" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStores.map((store, index) => {
            const sales = getFilteredValue(store.totalSales, store.prepaidSales, store.postpaidSales, filter)
            const customers = getFilteredValue(store.customers, store.prepaidCustomers, store.postpaidCustomers, filter)
            const avgPerCustomer = getFilteredAverage(store.averagePerCustomer, store.prepaidAvgPerCustomer, store.postpaidAvgPerCustomer, filter)
            return (
              <TableRow
                key={store.storeId || index}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <TableCell className="text-foreground text-[13px] max-w-[200px] sm:max-w-[280px] truncate py-2.5">
                  {store.storeName}
                </TableCell>
                <TableCell className="text-foreground text-[13px] text-right py-2.5 whitespace-nowrap">
                  ¥{sales.toLocaleString()}
                </TableCell>
                <TableCell className="text-foreground text-[13px] text-right py-2.5 whitespace-nowrap">
                  {customers.toLocaleString()}
                </TableCell>
                <TableCell className="text-foreground text-[13px] text-right py-2.5 whitespace-nowrap">
                  ¥{avgPerCustomer.toLocaleString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
