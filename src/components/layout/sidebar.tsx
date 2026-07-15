"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store/app-store"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Wallet,
  ListTodo,
  Target,
  BarChart3,
  User,
  X,
} from "lucide-react"

const navItems = [
  { href: "/home", label: "Home", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: CheckSquare },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/finances", label: "Finanzas", icon: Wallet },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
  { href: "/goals", label: "Objetivos", icon: Target },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/me", label: "Yo", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <Link href="/home" className="flex items-center gap-2 font-bold text-lg" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              L
            </div>
            <span>LifeOS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator />
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              U
            </div>
            <span className="truncate">Usuario</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
