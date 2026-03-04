"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, ChevronRight, Menu, X } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { StoreData } from "@/lib/spreadsheet"

interface AppSidebarProps {
  stores: StoreData[]
  buildingName?: string
}

export function AppSidebar({ stores, buildingName = "ダッシュボード" }: AppSidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar, setOpen, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [storesOpen, setStoresOpen] = useState(true)

  const handleStoreIconClick = () => {
    if (isCollapsed) {
      setOpen(true)
      setStoresOpen(true)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center h-10">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="flex items-center justify-center w-full h-full hover:bg-sidebar-accent rounded transition-colors"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">メニューを開く</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-[13px] font-medium text-sidebar-foreground">{buildingName}</span>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-sidebar-accent rounded transition-colors"
              >
                {isMobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild isActive={pathname === "/"}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>全体サマリー</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">全体サマリー</TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>

              <Collapsible open={storesOpen} onOpenChange={setStoresOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton onClick={handleStoreIconClick}>
                          <Store className="h-4 w-4" />
                          <span>店舗一覧</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">店舗一覧</TooltipContent>
                    )}
                  </Tooltip>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {stores.map((store) => (
                        <SidebarMenuSubItem key={store.storeId}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === `/shop/${store.storeId}`}
                          >
                            <Link href={`/shop/${store.storeId}`}>
                              <span className="truncate">{store.storeName}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
