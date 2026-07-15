"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SearchButton } from "@/components/layout/search-button"
import { GlobalSearch } from "@/components/search/global-search"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useKeyboardShortcuts()
  useSupabaseSync()

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <div className="flex items-center justify-end px-4 pt-2 md:px-6">
          <SearchButton />
        </div>
        <GlobalSearch />
        <main className="flex-1 p-4 pb-16 md:p-6 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
