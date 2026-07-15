"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import {
  Plus,
  Check,
  X,
  Trash2,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Flag,
  ChevronRight,
  HeartPulse,
  Wallet,
  Briefcase,
  Sparkles,
  Dumbbell,
  BookOpen,
  Crosshair,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  type: "short" | "long"
  status: "active" | "completed" | "paused"
  progress: number
  targetDate: string
  createdAt: string
  completedAt?: string
}

const CATEGORIES: { name: string; icon: LucideIcon; color: string; bg: string; bar: string }[] = [
  { name: "Salud", icon: HeartPulse, color: "text-emerald-500", bg: "bg-emerald-500/10", bar: "from-emerald-400 to-emerald-600" },
  { name: "Finanzas", icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10", bar: "from-amber-400 to-amber-600" },
  { name: "Profesional", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10", bar: "from-blue-400 to-blue-600" },
  { name: "Personal", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", bar: "from-purple-400 to-purple-600" },
  { name: "Fitness", icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-500/10", bar: "from-orange-400 to-orange-600" },
  { name: "Educación", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10", bar: "from-indigo-400 to-indigo-600" },
  { name: "Otro", icon: Crosshair, color: "text-pink-500", bg: "bg-pink-500/10", bar: "from-pink-400 to-pink-600" },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "short" | "long">("all")
  const [showAdd, setShowAdd] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editCategory, setEditCategory] = useState("Personal")
  const [editType, setEditType] = useState<"short" | "long">("short")
  const [editTargetDate, setEditTargetDate] = useState("")
  const [editProgress, setEditProgress] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_goals")
    if (saved) setGoals(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_goals", JSON.stringify(goals)) }, [goals, mounted])

  const today = new Date().toISOString().split("T")[0]

  function addGoal() {
    if (!editTitle.trim()) return
    const goal: Goal = {
      id: generateId(),
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      type: editType,
      status: "active",
      progress: editProgress,
      targetDate: editTargetDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      createdAt: today,
    }
    setGoals((prev) => [goal, ...prev])
    setToastMsg("Objetivo creado")
    setTimeout(() => setToastMsg(null), 2000)
    resetForm()
  }

  function updateGoal(id: string) {
    if (!editTitle.trim()) return
    setGoals((prev) => prev.map((g) =>
      g.id === id ? { ...g, title: editTitle.trim(), description: editDesc.trim(), category: editCategory, type: editType, targetDate: editTargetDate, progress: editProgress } : g
    ))
    setToastMsg("Objetivo actualizado")
    setTimeout(() => setToastMsg(null), 2000)
    resetForm()
  }

  function resetForm() {
    setEditTitle("")
    setEditDesc("")
    setEditCategory("Personal")
    setEditType("short")
    setEditTargetDate("")
    setEditProgress(0)
    setShowAdd(false)
    setEditingGoal(null)
  }

  function toggleStatus(id: string) {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== id) return g
      if (g.status === "completed") return { ...g, status: "active" as const, completedAt: undefined, progress: Math.min(g.progress, 99) }
      return { ...g, status: "completed" as const, completedAt: today, progress: 100 }
    }))
  }

  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  function setProgress(id: string, value: number) {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== id) return g
      const newProgress = Math.max(0, Math.min(100, value))
      return {
        ...g,
        progress: newProgress,
        status: newProgress >= 100 ? "completed" as const : g.status === "completed" ? "active" as const : g.status,
        completedAt: newProgress >= 100 ? today : undefined,
      }
    }))
  }

  function editGoal(g: Goal) {
    setEditTitle(g.title)
    setEditDesc(g.description)
    setEditCategory(g.category)
    setEditType(g.type)
    setEditTargetDate(g.targetDate)
    setEditProgress(g.progress)
    setEditingGoal(g.id)
    setShowAdd(true)
  }

  const filtered = goals.filter((g) => {
    if (activeFilter === "active") return g.status === "active"
    if (activeFilter === "completed") return g.status === "completed"
    if (activeFilter === "short") return g.type === "short"
    if (activeFilter === "long") return g.type === "long"
    return true
  }).sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1
    if (a.status !== "completed" && b.status === "completed") return -1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const activeCount = goals.filter((g) => g.status === "active").length
  const completedCount = goals.filter((g) => g.status === "completed").length
  const avgProgress = activeCount > 0 ? Math.round(goals.filter((g) => g.status === "active").reduce((s, g) => s + g.progress, 0) / activeCount) : 0

  const quickPresets = [
    { title: "Correr 10K", category: "Fitness", type: "short" as const, targetDays: 90 },
    { title: "Ahorrar $5M", category: "Finanzas", type: "long" as const, targetDays: 180 },
    { title: "Leer 12 libros", category: "Personal", type: "short" as const, targetDays: 365 },
    { title: "Certificación", category: "Profesional", type: "long" as const, targetDays: 180 },
  ]

  return (
    <motion.div 
      className="space-y-8 overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1">Objetivos</h2>
          <p className="text-base text-muted-foreground mt-1">
            {activeCount} activos · {completedCount} cumplidos · {avgProgress}% prom
          </p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Activos", value: activeCount, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Cumplidos", value: completedCount, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Progreso", value: `${avgProgress}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center bg-gradient-to-b min-w-0", s.bg, "border-transparent")}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all" as const, label: "Todos" },
          { id: "active" as const, label: "Activos" },
          { id: "completed" as const, label: "Cumplidos" },
          { id: "short" as const, label: "Corto plazo" },
          { id: "long" as const, label: "Largo plazo" },
        ].map((f) => (
          <button key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              "flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap",
              activeFilter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Sin objetivos aún</p>
            <p className="text-xs text-muted-foreground mt-1">Define metas para darle dirección a tu vida</p>
          </div>
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
            {quickPresets.map((p) => (
              <button key={p.title}
                onClick={() => {
                  setEditTitle(p.title)
                  setEditCategory(p.category)
                  setEditType(p.type)
                  setEditTargetDate(new Date(Date.now() + p.targetDays * 86400000).toISOString().split("T")[0])
                  setShowAdd(true)
                }}
                className="rounded-2xl border border-border/60 p-3 text-left hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <p className="text-xs font-semibold">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.category} · {p.type === "short" ? "Corto" : "Largo"}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => {
            const cat = CATEGORIES.find((c) => c.name === goal.category) || CATEGORIES[6]
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date(today).getTime()) / 86400000)
            const isOverdue = daysLeft < 0 && goal.status === "active"
            const isCompleted = goal.status === "completed"

            return (
              <div key={goal.id}
                className={cn(
                  "rounded-2xl border p-5 transition-all duration-200 hover:shadow-sm",
                  isCompleted ? "bg-emerald-500/5 border-emerald-500/20" :
                  isOverdue ? "bg-red-500/5 border-red-500/20" :
                  "bg-card border-border/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn("text-base font-bold truncate", isCompleted && "text-emerald-600")}>{goal.title}</h3>
                      {isCompleted && <Trophy className="h-4 w-4 text-emerald-500" />}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className={cn("font-medium flex items-center gap-1", cat.color)}><cat.icon className="h-3.5 w-3.5" /> {goal.category}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded-md">
                        {goal.type === "short" ? "Corto plazo" : "Largo plazo"}
                      </Badge>
                      {!isCompleted && (
                        <span className={cn(isOverdue && "text-red-500 font-semibold")}>
                          {isOverdue ? `${Math.abs(daysLeft)}d vencido` : daysLeft === 0 ? "Hoy" : `${daysLeft}d restantes`}
                        </span>
                      )}
                      {isCompleted && goal.completedAt && (
                        <span className="text-emerald-500">Completado {new Date(goal.completedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => editGoal(goal)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm(goal.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className={cn("font-bold tabular-nums", isCompleted ? "text-emerald-500" : "text-foreground")}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
                        isCompleted ? "from-emerald-400 to-emerald-500" : cat.bar
                      )}
                      style={{ width: `${goal.progress}%` }}
                    />
                    {goal.progress > 0 && goal.progress < 100 && (
                      <div className="absolute inset-y-0 w-8 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                        style={{ left: `${goal.progress - 8}%` }} />
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {[25, 50, 75, 100].map((pct) => (
                    <button key={pct}
                      onClick={() => setProgress(goal.id, pct)}
                      className={cn(
                        "flex-1 rounded-xl py-1.5 text-[10px] font-semibold border transition-all",
                        goal.progress >= pct
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    onClick={() => toggleStatus(goal.id)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all border",
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : "border-border text-muted-foreground hover:bg-emerald-500/10 hover:border-emerald-500/30"
                    )}
                  >
                    {isCompleted ? "Reabrir" : "Cumplido"}
                  </button>
                </div>

                {!isCompleted && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(goal.targetDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => resetForm()}>
          <div className="w-full max-w-[calc(100vw-2rem)] max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{editingGoal ? "Editar objetivo" : "Nuevo objetivo"}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="¿Qué querés lograr?"
              className="rounded-xl h-12 text-sm font-medium"
              autoFocus
            />
            <Input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              className="rounded-xl h-11 text-sm"
            />

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categoría</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {CATEGORIES.map((c) => (
                  <button key={c.name}
                    onClick={() => setEditCategory(c.name)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border",
                      editCategory === c.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <c.icon className="h-4 w-4" /> {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { value: "short" as const, label: "Corto plazo", desc: "-3 meses" },
                  { value: "long" as const, label: "Largo plazo", desc: "+3 meses" },
                ].map((t) => (
                  <button key={t.value}
                    onClick={() => setEditType(t.value)}
                    className={cn(
                      "flex-1 rounded-xl py-3 text-xs font-semibold border transition-all",
                      editType === t.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <p>{t.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Progreso inicial</label>
              <div className="flex items-center gap-3 mt-1.5">
                <Input
                  type="range"
                  min="0" max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(parseInt(e.target.value))}
                  className="flex-1 h-2 accent-primary"
                />
                <span className="text-sm font-bold tabular-nums w-10 text-right">{editProgress}%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha objetivo</label>
              <Input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="rounded-xl h-11 mt-1.5 text-sm"
              />
            </div>

            <Button className="w-full rounded-2xl h-12 font-semibold gap-2"
              onClick={() => editingGoal ? updateGoal(editingGoal) : addGoal()}>
              <Check className="h-4 w-4" /> {editingGoal ? "Guardar cambios" : "Crear objetivo"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="¿Eliminar objetivo?"
        message="Este objetivo y su progreso se eliminarán permanentemente."
        onConfirm={() => {
          setGoals(prev => prev.filter(g => g.id !== deleteConfirm))
          setToastMsg("Objetivo eliminado")
          setTimeout(() => setToastMsg(null), 2000)
          setDeleteConfirm(null)
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}
    </motion.div>
  )
}
