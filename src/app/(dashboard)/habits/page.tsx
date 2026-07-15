"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn, getCurrentWeekDays } from "@/lib/utils"
import {
  Plus,
  Flame,
  Trophy,
  TrendingUp,
  Check,
  Minus,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
  Star,
} from "lucide-react"

interface HabitData {
  id: string
  name: string
  icon: string
  color: string
  gradient: string
  streak: number
  bestStreak: number
  completionRate: number
  totalCompletions: number
  logs: Record<string, boolean>
  type: "check" | "counter"
  counterGoal?: number
  schedule?: string
  tip?: string
}

interface DailyData {
  date: string
  skincareAM: boolean
  skincarePM: boolean
  creatine: boolean
  noFap: boolean
  lectura: boolean
  brushing: number
  waterMl: number
}

const BRUSHING_GOAL = 3
const WATER_GOAL_ML = 4000

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [dailyData, setDailyData] = useState<DailyData>({
    date: "",
    skincareAM: false, skincarePM: false, creatine: false,
    noFap: false, lectura: false, brushing: 0, waterMl: 0,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const weekDays = getCurrentWeekDays()
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_daily")
    if (saved) {
      const data = JSON.parse(saved)
      setDailyData((prev) => ({ ...prev, ...data }))
    }
    initHabits()
  }, [])

  useEffect(() => {
    if (habits.length === 0 || !dailyData.date) return
    localStorage.setItem("lifeos_daily", JSON.stringify({ ...dailyData, date: today }))
    setHabits((prev) => prev.map((h) => {
      if (h.id === "skincare-am") return { ...h, logs: { ...h.logs, [today]: dailyData.skincareAM } }
      if (h.id === "skincare-pm") return { ...h, logs: { ...h.logs, [today]: dailyData.skincarePM } }
      if (h.id === "creatine") return { ...h, logs: { ...h.logs, [today]: dailyData.creatine } }
      if (h.id === "nofap") return { ...h, logs: { ...h.logs, [today]: dailyData.noFap } }
      if (h.id === "lectura") return { ...h, logs: { ...h.logs, [today]: dailyData.lectura } }
      if (h.id === "brushing") return { ...h, logs: { ...h.logs, [today]: dailyData.brushing >= BRUSHING_GOAL } }
      if (h.id === "water") return { ...h, logs: { ...h.logs, [today]: dailyData.waterMl >= WATER_GOAL_ML } }
      return h
    }))
  }, [dailyData])

  function initHabits() {
    setHabits([
      {
        id: "skincare-am", name: "Skincare AM", icon: "🧴", color: "bg-amber-500", gradient: "from-amber-500 to-orange-500",
        streak: 7, bestStreak: 14, completionRate: 85, totalCompletions: 142,
        logs: {}, type: "check", schedule: "6:00 - 9:00 AM", tip: "No olvides el protector solar SPF 50+"
      },
      {
        id: "skincare-pm", name: "Skincare PM", icon: "🌙", color: "bg-indigo-500", gradient: "from-indigo-500 to-violet-500",
        streak: 5, bestStreak: 10, completionRate: 70, totalCompletions: 98,
        logs: {}, type: "check", schedule: "8:00 - 11:00 PM", tip: "Doble limpieza + retinol en días alternos"
      },
      {
        id: "brushing", name: "Cepillado dental", icon: "🪥", color: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500",
        streak: 8, bestStreak: 20, completionRate: 90, totalCompletions: 245,
        logs: {}, type: "counter", counterGoal: BRUSHING_GOAL, schedule: "3 veces al día", tip: "2 minutos mínimo cada vez"
      },
      {
        id: "water", name: "Hidratación", icon: "💧", color: "bg-sky-500", gradient: "from-sky-500 to-cyan-500",
        streak: 5, bestStreak: 10, completionRate: 70, totalCompletions: 156,
        logs: {}, type: "counter", counterGoal: WATER_GOAL_ML, schedule: "4L diarios", tip: "Distribuye en 8 tomas de 500ml"
      },
      {
        id: "creatine", name: "Creatina", icon: "⚡", color: "bg-red-500", gradient: "from-red-500 to-rose-500",
        streak: 12, bestStreak: 30, completionRate: 90, totalCompletions: 198,
        logs: {}, type: "check", schedule: "Cualquier hora", tip: "5g diarios, no requiere carga"
      },
      {
        id: "nofap", name: "NF", icon: "🧘", color: "bg-violet-500", gradient: "from-violet-500 to-purple-500",
        streak: 14, bestStreak: 21, completionRate: 85, totalCompletions: 167,
        logs: {}, type: "check", schedule: "24/7", tip: "Un día a la vez. La disciplina es libertad."
      },
      {
        id: "lectura", name: "Lectura", icon: "📖", color: "bg-amber-500", gradient: "from-amber-500 to-yellow-500",
        streak: 12, bestStreak: 30, completionRate: 92, totalCompletions: 203,
        logs: {}, type: "check", schedule: "Preferiblemente noche", tip: "30 min mínimo. Mejor papel que pantalla."
      },
      {
        id: "meditation", name: "Meditación", icon: "🧘", color: "bg-violet-500", gradient: "from-violet-500 to-purple-500",
        streak: 7, bestStreak: 14, completionRate: 85, totalCompletions: 134,
        logs: {"2026-07-04":true,"2026-07-05":true,"2026-07-06":false,"2026-07-07":true,"2026-07-08":true,"2026-07-09":true,"2026-07-10":true}, type: "check", schedule: "Mañana", tip: "10-15 min de mindfulness"
      },
      {
        id: "exercise", name: "Ejercicio", icon: "🏋️", color: "bg-orange-500", gradient: "from-orange-500 to-red-500",
        streak: 21, bestStreak: 21, completionRate: 95, totalCompletions: 267,
        logs: {"2026-07-04":true,"2026-07-05":true,"2026-07-06":true,"2026-07-07":true,"2026-07-08":true,"2026-07-09":true,"2026-07-10":true}, type: "check", schedule: "5x semana", tip: "Push/Pull/Legs + cardio ligero"
      },
      {
        id: "no-sugar", name: "Sin azúcar", icon: "🚫", color: "bg-pink-500", gradient: "from-pink-500 to-rose-500",
        streak: 3, bestStreak: 15, completionRate: 55, totalCompletions: 89,
        logs: {"2026-07-04":false,"2026-07-05":false,"2026-07-06":true,"2026-07-07":false,"2026-07-08":true,"2026-07-09":false,"2026-07-10":true}, type: "check", schedule: "Todo el día", tip: "Revisa etiquetas, el azúcar está en todo"
      },
      {
        id: "sleep", name: "Sueño 7h+", icon: "😴", color: "bg-indigo-500", gradient: "from-indigo-500 to-blue-500",
        streak: 8, bestStreak: 20, completionRate: 78, totalCompletions: 156,
        logs: {"2026-07-04":true,"2026-07-05":true,"2026-07-06":false,"2026-07-07":true,"2026-07-08":true,"2026-07-09":true,"2026-07-10":true}, type: "check", schedule: "10PM - 6AM", tip: "Sin pantallas 30 min antes de dormir"
      },
    ])
  }

  function updateDaily(partial: Partial<DailyData>) { setDailyData((prev) => ({ ...prev, ...partial })) }
  function toggleCheck(id: string) {
    switch (id) {
      case "skincare-am": updateDaily({ skincareAM: !dailyData.skincareAM }); break
      case "skincare-pm": updateDaily({ skincarePM: !dailyData.skincarePM }); break
      case "creatine": updateDaily({ creatine: !dailyData.creatine }); break
      case "nofap": updateDaily({ noFap: !dailyData.noFap }); break
      case "lectura": updateDaily({ lectura: !dailyData.lectura }); break
    }
  }
  function incrementCounter(id: string) {
    if (id === "brushing") updateDaily({ brushing: dailyData.brushing + 1 })
    if (id === "water") updateDaily({ waterMl: dailyData.waterMl + 1000 })
  }
  function decrementCounter(id: string) {
    if (id === "brushing") updateDaily({ brushing: Math.max(0, dailyData.brushing - 1) })
    if (id === "water") updateDaily({ waterMl: Math.max(0, dailyData.waterMl - 1000) })
  }
  function toggleLog(id: string, date: string) {
    if (["skincare-am","skincare-pm","creatine","nofap","lectura","brushing","water"].includes(id)) return
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, logs: { ...h.logs, [date]: !h.logs[date] } } : h))
  }

  function isDone(h: HabitData): boolean {
    switch (h.id) {
      case "skincare-am": return dailyData.skincareAM
      case "skincare-pm": return dailyData.skincarePM
      case "creatine": return dailyData.creatine
      case "nofap": return dailyData.noFap
      case "lectura": return dailyData.lectura
      case "brushing": return dailyData.brushing >= BRUSHING_GOAL
      case "water": return dailyData.waterMl >= WATER_GOAL_ML
      default: return h.logs[today] ?? false
    }
  }

  const healthHabits = habits.filter((h) => ["skincare-am","skincare-pm","brushing","water","creatine","nofap","lectura"].includes(h.id))
  const classicHabits = habits.filter((h) => ["meditation","exercise","no-sugar","sleep"].includes(h.id))

  const totalToday = habits.filter((h) => isDone(h)).length
  const totalHabits = habits.length
  const todayProgress = Math.round((totalToday / totalHabits) * 100)

  const filtered = activeTab === "all" ? habits
    : activeTab === "health" ? healthHabits
    : activeTab === "classic" ? classicHabits
    : activeTab === "pending" ? habits.filter((h) => !isDone(h))
    : habits.filter((h) => isDone(h))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Hábitos</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {totalToday} de {totalHabits} completados · {todayProgress}%
          </p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Racha max", value: "21d", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Completados", value: "67%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Esta semana", value: "89%", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total logs", value: "1.2k", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center", s.bg, "border-transparent")}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-sm font-bold">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full p-1 h-11">
          <TabsTrigger value="all" className="flex-1 text-[11px]">Todos</TabsTrigger>
          <TabsTrigger value="health" className="flex-1 text-[11px]">Básicos</TabsTrigger>
          <TabsTrigger value="classic" className="flex-1 text-[11px]">Clásicos</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 text-[11px]">Pendientes</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-[11px]">Hechos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-blue-500 to-emerald-400 transition-all duration-1000 ease-out"
          style={{ width: `${todayProgress}%` }}
        />
        {todayProgress > 0 && todayProgress < 100 && (
          <div className="absolute inset-y-0 w-8 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ left: `${Math.max(0, todayProgress - 6)}%` }} />
        )}
      </div>

      <div className="space-y-4 mt-4">
        {filtered.map((habit) => {
          const done = isDone(habit)
          const isHealth = ["skincare-am","skincare-pm","brushing","water","creatine","nofap","lectura"].includes(habit.id)
          const isCounter = habit.type === "counter"
          const isBrushing = habit.id === "brushing"
          const isWater = habit.id === "water"
          const expanded = expandedId === habit.id

          return (
            <div key={habit.id}>
              <div
                onClick={() => setExpandedId(expanded ? null : habit.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
                  "hover:shadow-lg active:scale-[0.99]",
                  done
                    ? "bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-md shadow-emerald-500/5"
                    : "bg-card border-border/50 hover:border-border"
                )}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="relative">
                    {done && (
                      <div className={cn("absolute inset-0 rounded-2xl blur-lg opacity-30", habit.gradient.replace("from-", "bg-").replace(" to-", ""))} />
                    )}
                    <div
                      className={cn(
                        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 shadow-sm",
                        done
                          ? `bg-gradient-to-br ${habit.gradient} text-white shadow-lg`
                          : "bg-muted group-hover:scale-105"
                      )}
                    >
                      {done ? <Check className="h-7 w-7" /> : habit.icon}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={cn("text-base font-bold tracking-tight", done && "text-emerald-700 dark:text-emerald-400")}>
                        {habit.name}
                      </p>
                      {habit.streak >= 20 && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>

                    {isCounter ? (
                      <p className="text-xs text-muted-foreground">{habit.schedule}</p>
                    ) : (
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Flame className="h-3 w-3 text-orange-500" /> {habit.streak}d racha
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">{habit.completionRate}%</span> cumplimiento
                        </span>
                      </div>
                    )}
                  </div>

                  {isCounter ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => decrementCounter(habit.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 hover:bg-accent transition-all active:scale-90 disabled:opacity-30"
                        disabled={isBrushing ? dailyData.brushing === 0 : dailyData.waterMl === 0}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <button onClick={() => incrementCounter(habit.id)}
                        className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90",
                          done ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border border-border/60 hover:bg-accent")}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); isHealth ? toggleCheck(habit.id) : toggleLog(habit.id, today) }}
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 active:scale-90",
                        done
                          ? `bg-gradient-to-br ${habit.gradient} text-white shadow-md`
                          : "bg-muted hover:bg-accent"
                      )}
                    >
                      {done ? <Check className="h-5 w-5" /> : <span className="text-lg">{habit.icon}</span>}
                    </button>
                  )}
                </div>

                {isCounter && (
                  <div className="px-5 pb-4 space-y-2">
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
                      <div
                        className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                          done ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : isBrushing ? "bg-gradient-to-r from-emerald-300 to-emerald-500" : "bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400")}
                        style={{ width: `${isBrushing ? (dailyData.brushing / BRUSHING_GOAL) * 100 : Math.min((dailyData.waterMl / WATER_GOAL_ML) * 100, 100)}%` }} />
                      {((isBrushing && dailyData.brushing > 0 && dailyData.brushing < BRUSHING_GOAL) || (isWater && dailyData.waterMl > 0 && dailyData.waterMl < WATER_GOAL_ML)) && (
                        <div className="absolute inset-y-0 w-8 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                          style={{ left: `${(isBrushing ? (dailyData.brushing / BRUSHING_GOAL) * 100 : Math.min((dailyData.waterMl / WATER_GOAL_ML) * 100, 100)) - 8}%` }} />)}
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{isBrushing ? `${dailyData.brushing}/${BRUSHING_GOAL} cepillados` : `${(dailyData.waterMl / 1000).toFixed(1)}L de ${WATER_GOAL_ML / 1000}L`}</span>
                      <span className={cn("font-semibold", done ? "text-emerald-500" : "text-muted-foreground")}>{done ? "Completado" : `${Math.round(isBrushing ? (dailyData.brushing / BRUSHING_GOAL) * 100 : Math.min((dailyData.waterMl / WATER_GOAL_ML) * 100, 100))}%`}</span>
                    </div>
                  </div>
                )}

                {!isHealth && (
                  <div className="px-5 pb-4 flex gap-1">
                    {weekDays.map((day) => {
                      const d = habit.logs[day.date]
                      const isToday = day.date === today
                      return (
                        <button key={day.date} onClick={(e) => { e.stopPropagation(); toggleLog(habit.id, day.date) }}
                          className={cn("flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] transition-all",
                            isToday && "bg-primary/5 ring-1 ring-primary/30", d ? "font-semibold" : "text-muted-foreground")}>
                          <span>{day.day}</span>
                          <div className={cn("w-4 h-4 rounded-md transition-all duration-300", d ? `bg-gradient-to-br ${habit.gradient} shadow-sm` : "bg-muted/60")} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {expanded && (
                <div className="mx-3 -mt-1 rounded-b-2xl border border-t-0 border-border/40 bg-card/50 backdrop-blur-sm p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Racha</p>
                      <p className="text-lg font-bold text-orange-500">{habit.streak}d</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Récord</p>
                      <p className="text-lg font-bold text-amber-500">{habit.bestStreak}d</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                      <p className="text-lg font-bold text-blue-500">{habit.totalCompletions}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{habit.schedule}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{habit.tip}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Tasa de éxito</span>
                      <span className="font-semibold">{habit.completionRate}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                      <div className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", habit.gradient, "transition-all duration-700")}
                        style={{ width: `${habit.completionRate}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm font-medium">Nada por aquí</p>
          <p className="text-xs mt-1">Todos los hábitos están al día</p>
        </div>
      )}
    </div>
  )
}
