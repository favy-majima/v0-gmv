"use client"

import Image from "next/image"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  userName?: string
  shopName?: string
}

export function Header({ userName = "ゲスト", shopName }: HeaderProps) {
  return (
    <header className="h-12 border-b border-border bg-background flex items-center justify-between px-3 sm:px-4 relative z-50">
      <div className="flex items-center gap-2">
        <Image
          src="https://startup-db.com/company-service/company/4170/%E3%83%AD%E3%82%B3%E3%82%99%E8%B5%A4%E9%80%8F%E9%81%8E.png/medium.png?1537938905"
          alt="favy"
          width={64}
          height={24}
          priority
          className="object-contain"
          style={{ width: 'auto', height: 'auto' }}
        />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase hidden sm:inline">Mobile Order</span>
        {shopName && (
          <>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <span className="text-[13px] font-medium text-foreground hidden sm:inline">{shopName}</span>
          </>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-secondary rounded transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[13px] text-foreground">{userName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <a
              href="/api/auth/shop-logout"
              className="flex items-center gap-2 cursor-pointer text-[13px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              ログアウト
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
