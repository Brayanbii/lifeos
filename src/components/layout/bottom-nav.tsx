"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Wallet,
  ListTodo,
} from "lucide-react"

const navItems = [
  { href: "/home", label: "Home", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: CheckSquare },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/finances", label: "Finanzas", icon: Wallet },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-[10px] font-medium min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
