"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type PaymentFilter = {
  prepaid: boolean
  postpaid: boolean
}

interface PaymentFilterProps {
  filter: PaymentFilter
  onChange: (filter: PaymentFilter) => void
}

export function PaymentFilterComponent({ filter, onChange }: PaymentFilterProps) {
  const handlePrepaidChange = (checked: boolean) => {
    // 少なくとも1つはチェックされている状態を維持
    if (!checked && !filter.postpaid) return
    onChange({ ...filter, prepaid: checked })
  }

  const handlePostpaidChange = (checked: boolean) => {
    // 少なくとも1つはチェックされている状態を維持
    if (!checked && !filter.prepaid) return
    onChange({ ...filter, postpaid: checked })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Checkbox
          id="prepaid"
          checked={filter.prepaid}
          onCheckedChange={handlePrepaidChange}
          className="h-3.5 w-3.5"
        />
        <Label htmlFor="prepaid" className="text-xs text-muted-foreground cursor-pointer">
          事前決済
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Checkbox
          id="postpaid"
          checked={filter.postpaid}
          onCheckedChange={handlePostpaidChange}
          className="h-3.5 w-3.5"
        />
        <Label htmlFor="postpaid" className="text-xs text-muted-foreground cursor-pointer">
          事後決済
        </Label>
      </div>
    </div>
  )
}

// フィルターを適用してデータを取得するユーティリティ関数
export function getFilteredValue(
  total: number,
  prepaid: number,
  postpaid: number,
  filter: PaymentFilter
): number {
  if (filter.prepaid && filter.postpaid) {
    return total
  } else if (filter.prepaid) {
    return prepaid
  } else if (filter.postpaid) {
    return postpaid
  }
  return total
}

// 客単価など計算が必要な値用
export function getFilteredAverage(
  totalAvg: number,
  prepaidAvg: number,
  postpaidAvg: number,
  filter: PaymentFilter
): number {
  if (filter.prepaid && filter.postpaid) {
    return totalAvg
  } else if (filter.prepaid) {
    return prepaidAvg
  } else if (filter.postpaid) {
    return postpaidAvg
  }
  return totalAvg
}
