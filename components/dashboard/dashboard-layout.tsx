"use client"

import type { ReactNode } from "react"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  userName?: string
  shopName?: string
}

export function DashboardLayout({
  children,
  userName,
  shopName,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full">
      <Header userName={userName} shopName={shopName} />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
