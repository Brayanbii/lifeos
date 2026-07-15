"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Search,
  CheckSquare,
  Target,
  Dumbbell,
  Wallet,
  ListTodo,
  ArrowRight,
  Command,
  X,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  category: string
  categoryLabel: string
  href: string
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  tareas: { label: "Tareas", color: "text-blue-500" },
  objetivos: { label: "Objetivos", color: "text-purple-500" },
  gym: { label: "Gym", color: "text-orange-500" },
  finanzas: { label: "Finanzas", color: "text-amber-500" },
  habitos: { label: "Hábitos", color: "text-emerald-500" },
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  tareas: <ListTodo className="h-4 w-4" />,
  objetivos: <Target className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  finanzas: <Wallet className="h-4 w-4" />,
  habitos: <CheckSquare className="h-4 w-4" />,
}

const KNOWN_HABITS: { id: string; name: string }[] = [
  { id: "skincare-am", name: "Skincare AM" },
  { id: "skincare-pm", name: "Skincare PM" },
  { id: "brushing", name: "Cepillado dental" },
  { id: "water", name: "Hidratación" },
  { id: "creatine", name: "Creatina" },
  { id: "nofap", name: "NF" },
  { id: "lectura", name: "Lectura" },
  { id: "meditation", name: "Meditación" },
  { id: "exercise", name: "Ejercicio" },
  { id: "no-sugar", name: "Sin azúcar" },
  { id: "sleep", name: "Sueño 7h+" },
]

const MAX_RESULTS = 8

function gatherResults(query: string): SearchResult[] {
  const q = query.toLowerCase()
  const items: SearchResult[] = []

  try {
    const raw = localStorage.getItem("lifeos_tasks")
    if (raw) {
      const tasks = JSON.parse(raw)
      if (Array.isArray(tasks)) {
        for (const t of tasks) {
          if (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
            items.push({
              id: `task-${t.id}`,
              title: t.title,
              subtitle: t.category || t.description,
              category: "tareas",
              categoryLabel: "Tareas",
              href: "/tasks",
            })
          }
        }
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem("lifeos_goals")
    if (raw) {
      const goals = JSON.parse(raw)
      if (Array.isArray(goals)) {
        for (const g of goals) {
          if (g.title?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
            items.push({
              id: `goal-${g.id}`,
              title: g.title,
              subtitle: g.category || g.description,
              category: "objetivos",
              categoryLabel: "Objetivos",
              href: "/goals",
            })
          }
        }
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem("lifeos_routines")
    if (raw) {
      const routines = JSON.parse(raw)
      if (Array.isArray(routines)) {
        for (const r of routines) {
          if (r.name?.toLowerCase().includes(q) || r.focus?.toLowerCase().includes(q)) {
            items.push({
              id: `routine-${r.name || crypto.randomUUID()}`,
              title: r.name,
              subtitle: r.focus || "",
              category: "gym",
              categoryLabel: "Gym",
              href: "/gym",
            })
          }
          if (Array.isArray(r.exercises)) {
            for (const ex of r.exercises) {
              if (ex.name?.toLowerCase().includes(q) || ex.muscleGroup?.toLowerCase().includes(q)) {
                items.push({
                  id: `exercise-${ex.id || crypto.randomUUID()}`,
                  title: ex.name,
                  subtitle: `${ex.muscleGroup || ""} \u00B7 ${r.name || ""}`,
                  category: "gym",
                  categoryLabel: "Gym",
                  href: "/gym",
                })
              }
            }
          }
        }
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem("lifeos_transactions")
    if (raw) {
      const transactions = JSON.parse(raw)
      if (Array.isArray(transactions)) {
        for (const tx of transactions) {
          if (tx.description?.toLowerCase().includes(q) || tx.category?.toLowerCase().includes(q)) {
            const typeLabel = tx.type === "income" ? "Ingreso" : "Gasto"
            items.push({
              id: `tx-${tx.id}`,
              title: tx.description || tx.category,
              subtitle: `${typeLabel} \u00B7 ${tx.category || ""}`,
              category: "finanzas",
              categoryLabel: "Finanzas",
              href: "/finances",
            })
          }
        }
      }
    }
  } catch {}

  for (const habit of KNOWN_HABITS) {
    if (habit.name.toLowerCase().includes(q)) {
      items.push({
        id: `habit-${habit.id}`,
        title: habit.name,
        category: "habitos",
        categoryLabel: "Hábitos",
        href: "/habits",
      })
    }
  }

  return items.slice(0, MAX_RESULTS)
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const results = useMemo(() => (query.trim() ? gatherResults(query) : []), [query])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const item of results) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [results])

  const flatResults = useMemo(() => Object.values(grouped).flat(), [grouped])

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape" && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = "hidden"
    } else {
      setQuery("")
      setSelectedIndex(0)
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      setOpen(false)
      router.push(result.href)
    },
    [router]
  )

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector(`[data-result-index="${selectedIndex}"]`)
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(flatResults.length, 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + flatResults.length) % Math.max(flatResults.length, 1))
      } else if (e.key === "Enter" && flatResults[selectedIndex]) {
        e.preventDefault()
        navigateToResult(flatResults[selectedIndex])
      }
    },
    [flatResults, selectedIndex, navigateToResult]
  )

  if (!mounted) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
        aria-label="Abrir búsqueda global"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Buscar...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-[12%] -translate-x-1/2 w-full max-w-lg px-4"
            >
              <div
                className="rounded-2xl border border-white/[0.12] bg-background/85 backdrop-blur-2xl shadow-2xl shadow-black/25 overflow-hidden ring-1 ring-white/[0.06]"
                onKeyDown={handleKeyDown}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
                  <Search className="h-4.5 w-4.5 text-muted-foreground/60 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar tareas, objetivos, hábitos, ejercicios..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 text-foreground"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <kbd className="pointer-events-none hidden sm:inline-flex h-6 select-none items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-2 font-mono text-[10px] font-medium text-muted-foreground/60">
                    ESC
                  </kbd>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                    aria-label="Cerrar búsqueda"
                  >
                    <X className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                </div>

                <div ref={listRef} className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
                  {query.trim() && flatResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground/70">Sin resultados para &ldquo;{query}&rdquo;</p>
                      <p className="text-xs text-muted-foreground/40 mt-1">Intenta con otros términos</p>
                    </div>
                  )}

                  {query.trim() &&
                    Object.entries(grouped).map(([category, items]) => {
                      const meta = CATEGORY_META[category]
                      const icon = CATEGORY_ICON[category]
                      return (
                        <div key={category} className="mb-1">
                          <div className="flex items-center gap-2 px-3 py-1.5">
                            <span className={cn("flex-shrink-0", meta?.color)}>{icon}</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                              {meta?.label || category}
                            </span>
                          </div>
                          {items.map((item) => {
                            const idx = flatResults.indexOf(item)
                            const isSelected = idx === selectedIndex
                            return (
                              <motion.button
                                key={item.id}
                                data-result-index={idx}
                                onClick={() => navigateToResult(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                  isSelected
                                    ? "bg-primary/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                    : "hover:bg-white/[0.04]"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
                                    isSelected ? "bg-primary/15" : "bg-white/[0.04]"
                                  )}
                                >
                                  <span className={isSelected ? "text-primary" : "text-muted-foreground/60"}>
                                    {icon}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  {item.subtitle && (
                                    <p className="text-[11px] text-muted-foreground/60 truncate">{item.subtitle}</p>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                                    isSelected
                                      ? "bg-primary/15 text-primary border-primary/20"
                                      : "bg-white/[0.04] text-muted-foreground/60 border-white/[0.06]"
                                  )}
                                >
                                  {item.categoryLabel}
                                </span>
                                <ArrowRight
                                  className={cn(
                                    "h-4 w-4 flex-shrink-0 transition-opacity",
                                    isSelected ? "text-primary opacity-100" : "opacity-0"
                                  )}
                                />
                              </motion.button>
                            )
                          })}
                        </div>
                      )
                    })}

                  {!query.trim() && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4">
                        <Search className="h-7 w-7 text-muted-foreground/25" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground/70">Busca lo que necesites</p>
                      <p className="text-xs text-muted-foreground/40 mt-1 max-w-[260px]">
                        Tareas, objetivos, rutinas, ejercicios, hábitos y transacciones
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <kbd className="inline-flex h-6 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 font-mono text-[10px] font-medium text-muted-foreground/60">
                          <Command className="h-3 w-3" />K
                        </kbd>
                        <span className="text-xs text-muted-foreground/40">para abrir desde cualquier lugar</span>
                      </div>
                    </div>
                  )}
                </div>

                {flatResults.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                      <span className="flex items-center gap-1">
                        <kbd className="inline-flex h-5 items-center rounded px-1 font-mono bg-white/[0.04] border border-white/[0.06]">
                          ↑↓
                        </kbd>
                        Navegar
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="inline-flex h-5 items-center rounded px-1 font-mono bg-white/[0.04] border border-white/[0.06]">
                          ↵
                        </kbd>
                        Ir
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="inline-flex h-5 items-center rounded px-1 font-mono bg-white/[0.04] border border-white/[0.06]">
                          Esc
                        </kbd>
                        Cerrar
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40">
                      {flatResults.length} resultado{flatResults.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </>
  )
}
