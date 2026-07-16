"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store/app-store"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Wallet,
  ListTodo,
  Target,
  BarChart3,
  User,
  Zap,
  Flame,
  Library,
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
  { href: "/operacion", label: "Operación", icon: Zap },
  { href: "/recomposicion", label: "Recomposición", icon: Flame },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full flex-col transition-transform duration-300 md:w-64 md:translate-x-0 glass-panel md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[2rem]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10 dark:border-white/5">
          <Link href="/home" className="flex items-center gap-3 font-bold text-lg" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-gradient-to-tr from-primary to-purple-500 text-white text-sm font-bold shadow-lg">
              L
            </div>
            <span className="text-foreground tracking-wide">LifeOS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 hover:bg-white/10 md:hidden transition-colors"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>
        </div>

        <nav className="flex-1 overflow-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <motion.div key={item.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-primary/10 border border-primary/20"
                      : "text-foreground/70 hover:bg-white/10 hover:text-foreground border border-transparent"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "")} />
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="px-4 py-2">
           <Separator className="bg-white/10" />
        </div>
        
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-xs font-medium shadow-inner backdrop-blur-md">
              U
            </div>
            <span className="truncate font-medium">Usuario</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
