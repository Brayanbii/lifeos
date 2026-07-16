"use client"

import { Menu, RotateCw } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { usePathname } from "next/navigation"

const titles: Record<string, string> = {
  "/home": "Home",
  "/habits": "Hábitos",
  "/gym": "Gym",
  "/finances": "Finanzas",
  "/tasks": "Tareas",
  "/goals": "Objetivos",
  "/stats": "Estadísticas",
  "/me": "Yo",
  "/operacion": "Operación",
  "/recomposicion": "Recomposición",
}

export function Header() {
  const { setSidebarOpen } = useAppStore()
  const pathname = usePathname()
  const title = titles[pathname] || "LifeOS"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-md px-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full p-1.5 hover:bg-accent md:hidden flex-shrink-0"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-1.5 hover:bg-accent md:hidden flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
      </div>
    </header>
  )
}
