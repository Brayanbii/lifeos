"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Plus,
  Check,
  X,
  Trash2,
  Calendar,
  Flag,
  Search,
  Archive,
  Undo2,
  Clock,
  Target,
  History,
  Briefcase,
  User,
  HeartPulse,
  Dumbbell,
  Wallet,
  BookOpen,
  Home,
  Pin,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed" | "archived"
  dueDate: string
  createdAt: string
  completedAt?: string
  archivedAt?: string
}

const CATEGORIES: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Trabajo", icon: Briefcase, color: "bg-blue-500" },
  { name: "Personal", icon: User, color: "bg-purple-500" },
  { name: "Salud", icon: HeartPulse, color: "bg-emerald-500" },
  { name: "Gym", icon: Dumbbell, color: "bg-orange-500" },
  { name: "Finanzas", icon: Wallet, color: "bg-amber-500" },
  { name: "Estudio", icon: BookOpen, color: "bg-indigo-500" },
  { name: "Hogar", icon: Home, color: "bg-pink-500" },
  { name: "Otro", icon: Pin, color: "bg-gray-500" },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "today" | string>("all")
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [lastArchive, setLastArchive] = useState("")
  const [archivedCount, setArchivedCount] = useState(0)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editCategory, setEditCategory] = useState("Personal")
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium")
  const [editDueDate, setEditDueDate] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_tasks")
    const lastArchiveSaved = localStorage.getItem("lifeos_tasks_last_archive")
    if (saved) setTasks(JSON.parse(saved))
    if (lastArchiveSaved) setLastArchive(lastArchiveSaved)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const today = new Date().toISOString().split("T")[0]

    if (lastArchive !== today) {
      const now = new Date()
      if (now.getHours() >= 4) {
        let count = 0
        setTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.status === "completed" && t.completedAt && t.completedAt !== today) {
              count++
              return { ...t, status: "archived" as const, archivedAt: today }
            }
            return t
          })
          localStorage.setItem("lifeos_tasks", JSON.stringify(updated))
          return updated
        })
        if (count > 0) {
          setArchivedCount((prev) => prev + count)
          setTimeout(() => setArchivedCount(0), 5000)
        }
        setLastArchive(today)
        localStorage.setItem("lifeos_tasks_last_archive", today)
      }
    }
  }, [mounted, lastArchive])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_tasks", JSON.stringify(tasks)) }, [tasks, mounted])

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  function addTask() {
    if (!editTitle.trim()) return
    const task: Task = {
      id: generateId(),
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      priority: editPriority,
      status: "pending",
      dueDate: editDueDate || tomorrow,
      createdAt: today,
    }
    setTasks((prev) => [task, ...prev])
    setEditTitle("")
    setEditDesc("")
    setEditCategory("Personal")
    setEditPriority("medium")
    setEditDueDate("")
    setShowAdd(false)
    setToastMsg("Tarea creada")
    setTimeout(() => setToastMsg(null), 2000)
  }

  function toggleStatus(id: string) {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      if (t.status === "completed") return { ...t, status: "pending" as const, completedAt: undefined }
      if (t.status === "archived") return { ...t, status: "pending" as const, completedAt: undefined, archivedAt: undefined }
      return { ...t, status: "completed" as const, completedAt: today }
    }))
  }

  function unarchiveTask(id: string) {
    setTasks((prev) => prev.map((t) =>
      t.id === id ? { ...t, status: "pending" as const, archivedAt: undefined, completedAt: undefined } : t
    ))
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function deleteAllArchived() {
    setTasks((prev) => prev.filter((t) => t.status !== "archived"))
  }

  function quickAdd(priority: "low" | "medium" | "high") {
    setEditPriority(priority)
    setEditDueDate(priority === "high" ? today : tomorrow)
    setShowAdd(true)
  }

  const filtered = tasks.filter((t) => {
    if (activeFilter === "all") return t.status !== "archived"
    if (activeFilter === "pending") return t.status !== "completed" && t.status !== "archived"
    if (activeFilter === "today") return t.dueDate === today && t.status !== "completed" && t.status !== "archived"
    if (activeFilter === "completed") return t.status === "completed"
    if (activeFilter === "archived") return t.status === "archived"
    if (CATEGORIES.some((c) => c.name === activeFilter)) return t.category === activeFilter && t.status !== "archived"
    return t.status !== "archived"
  }).filter((t) => {
    if (!searchQuery) return true
    return t.title.toLowerCase().includes(searchQuery.toLowerCase())
  }).sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1
    if (a.status !== "completed" && b.status === "completed") return -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length
  const todayCount = tasks.filter((t) => t.dueDate === today && t.status !== "completed" && t.status !== "archived").length
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const archivedTotal = tasks.filter((t) => t.status === "archived").length

  return (
    <motion.div 
      className="space-y-8 overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1">Tareas</h2>
          <p className="text-base text-muted-foreground mt-1">
            {pendingCount} pendientes · {todayCount} hoy · {completedCount} hechas
          </p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Nueva
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-2xl h-12 text-sm bg-muted/40 border-transparent focus:bg-background"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "Todas", count: tasks.filter((t) => t.status !== "archived").length },
          { id: "today", label: "Hoy", count: todayCount },
          { id: "pending", label: "Pendientes", count: pendingCount },
          { id: "completed", label: "Hechas", count: completedCount },
          { id: "archived", label: "Archivadas", count: archivedTotal, icon: Archive },
        ].map((f) => (
          <button key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              "flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap flex items-center gap-1.5",
              activeFilter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {f.icon && <f.icon className="h-3 w-3" />}
            {f.label} · {f.count}
          </button>
        ))}
        <div className="w-px bg-border shrink-0 mx-1" />
        {CATEGORIES.slice(0, 4).map((c) => (
          <button key={c.name}
            onClick={() => setActiveFilter(c.name)}
            className={cn(
              "flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap flex items-center gap-1.5",
              activeFilter === c.name
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <c.icon className="h-3.5 w-3.5" /> {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Alta prioridad", action: () => quickAdd("high"), icon: Flag, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "Media", action: () => quickAdd("medium"), icon: Flag, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Baja", action: () => quickAdd("low"), icon: Flag, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        ].map((btn) => {
          const Icon = btn.icon
          return (
            <button key={btn.label}
              onClick={btn.action}
              className={cn("rounded-2xl border p-3.5 text-center transition-all hover:shadow-sm active:scale-[0.97] min-w-0", btn.bg, btn.border)}
            >
              <Icon className={cn("h-5 w-5 mx-auto mb-1.5", btn.color)} />
              <p className="text-xs font-semibold">{btn.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Crear tarea</p>
            </button>
          )
        })}
      </div>

      {activeFilter === "archived" && archivedTotal > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-muted/30 border border-border/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Archive className="h-4 w-4" />
            <span>{archivedTotal} tareas archivadas</span>
          </div>
          <Button size="sm" variant="ghost" className="text-[10px] h-7 rounded-lg text-red-500 hover:text-red-600"
            onClick={deleteAllArchived}>
            <Trash2 className="h-3 w-3 mr-1" /> Vaciar
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {activeFilter === "archived" ? "Sin tareas archivadas" :
               activeFilter === "completed" ? "Nada completado aún" :
               "Sin tareas"}
            </p>
            <p className="text-xs mt-1">
              {activeFilter === "archived" ? "Las tareas completadas se archivan cada noche" :
               "Toca un botón de prioridad para crear una"}
            </p>
          </div>
        ) : (
          filtered.map((task) => {
            const cat = CATEGORIES.find((c) => c.name === task.category)
            const isOverdue = task.dueDate < today && task.status !== "completed" && task.status !== "archived"
            const isToday = task.dueDate === today
            const isArchived = task.status === "archived"

            return (
              <div key={task.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all duration-200 group hover:shadow-sm",
                  task.status === "completed" && "bg-emerald-500/5 border-emerald-500/15",
                  isArchived && "bg-muted/30 border-border/30 opacity-80",
                  isOverdue && "border-red-500/20 bg-red-500/5",
                  task.status !== "completed" && !isArchived && !isOverdue && "bg-card border-border/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all mt-0.5",
                      task.status === "completed" || isArchived
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}
                  >
                    {(task.status === "completed" || isArchived) && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        (task.status === "completed" || isArchived) && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {!isArchived && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] h-4 px-1.5 rounded-md",
                            task.priority === "high" ? "border-red-500/30 text-red-500" :
                            task.priority === "medium" ? "border-amber-500/30 text-amber-500" :
                            "border-blue-500/30 text-blue-500"
                          )}
                        >
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      {cat && (
                        <span className="flex items-center gap-1">
                          <cat.icon className="h-4 w-4" /> {cat.name}
                        </span>
                      )}
                      {isArchived ? (
                        <span className="flex items-center gap-1">
                          <Archive className="h-3 w-3" />
                          {task.archivedAt ? new Date(task.archivedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "Archivada"}
                        </span>
                      ) : task.status === "completed" ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium">
                          <Check className="h-3 w-3" />
                          Completada {task.completedAt === today ? "hoy" : new Date(task.completedAt || "").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                      ) : (
                        <span className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-500 font-semibold",
                          isToday && !isOverdue && "text-amber-500 font-semibold"
                        )}>
                          <Calendar className="h-3 w-3" />
                          {task.dueDate === today ? "Hoy" :
                           task.dueDate === tomorrow ? "Mañana" :
                           isOverdue ? `Vencida ${new Date(task.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}` :
                           new Date(task.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isArchived ? (
                      <button
                        onClick={() => unarchiveTask(task.id)}
                        className="p-1.5 hover:bg-accent rounded-lg transition-all"
                        title="Recuperar"
                      >
                        <Undo2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => setDeleteConfirm(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {archivedCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 rounded-2xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2">
          <Archive className="h-4 w-4" />
          {archivedCount} tareas archivadas
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[calc(100vw-2rem)] max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Nueva tarea</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="¿Qué necesitas hacer?"
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
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridad</label>
                <div className="flex gap-2 mt-1.5">
                  {[
                    { value: "high" as const, label: "Alta", color: "border-red-500 text-red-500 bg-red-500/10" },
                    { value: "medium" as const, label: "Media", color: "border-amber-500 text-amber-500 bg-amber-500/10" },
                    { value: "low" as const, label: "Baja", color: "border-blue-500 text-blue-500 bg-blue-500/10" },
                  ].map((p) => (
                    <button key={p.value}
                      onClick={() => setEditPriority(p.value)}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-xs font-semibold border transition-all flex items-center justify-center gap-1.5",
                        editPriority === p.value
                          ? `${p.color} border-2`
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha límite</label>
                <div className="flex gap-2 mt-1.5">
                  {[
                    { value: today, label: "Hoy" },
                    { value: tomorrow, label: "Mañana" },
                    { value: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], label: "7 días" },
                  ].map((d) => (
                    <button key={d.value}
                      onClick={() => setEditDueDate(d.value)}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-xs font-semibold border transition-all",
                        editDueDate === d.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="rounded-xl h-11 mt-2 text-sm"
                />
              </div>
            </div>

            <Button className="w-full rounded-2xl h-12 font-semibold gap-2" onClick={addTask}>
              <Plus className="h-4 w-4" /> Crear tarea
            </Button>
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="¿Eliminar tarea?"
        message="Esta tarea se eliminará permanentemente."
        onConfirm={() => {
          setTasks(prev => prev.filter(t => t.id !== deleteConfirm))
          setToastMsg("Tarea eliminada")
          setTimeout(() => setToastMsg(null), 2000)
          setDeleteConfirm(null)
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  )
}
