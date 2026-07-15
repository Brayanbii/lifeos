"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-bottom pb-6 px-4 pointer-events-none">
      <div className="glass-panel rounded-full flex h-16 items-center justify-around px-3 pointer-events-auto mx-auto max-w-md shadow-2xl shadow-black/50" style={{ touchAction: "manipulation" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] rounded-full transition-colors text-[10px] font-medium",
                isActive
                  ? "text-primary"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.9 }}>
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all relative z-10",
                    isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
