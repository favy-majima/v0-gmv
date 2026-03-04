"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"
import { useIsMobile } from "@/hooks/use-mobile"
import type { StoreData } from "@/lib/spreadsheet"

interface DashboardLayoutProps {
  children: ReactNode
  stores: StoreData[]
  userName?: string
  buildingName?: string
}

export function DashboardLayout({
  children,
  stores,
  userName,
  buildingName,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex flex-col h-screen overflow-hidden w-full">
        <Header userName={userName} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar stores={stores} buildingName={buildingName} />
          <SidebarInset className="flex flex-col overflow-hidden">
            <main className="flex-1 overflow-auto bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
