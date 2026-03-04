"use client"

import type { ReactNode } from "react"
import { ShopHeader } from "./shop-header"

interface ShopLayoutProps {
  children: ReactNode
  shopName: string
}

export function ShopLayout({ children, shopName }: ShopLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full">
      <ShopHeader shopName={shopName} />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
