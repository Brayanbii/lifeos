"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  Flame,
  CalendarDays,
  Dumbbell,
  Wallet,
  Target,
  ArrowUpRight,
  CheckSquare,
  Activity,
  Trophy,
  Zap,
  Clock,
  Star,
  Sparkles,
  Timer,
  TrendingDown,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
} from "recharts"

function getToday() { return new Date().toISOString().split("T")[0] }
function getMonthDays() {
  const now = new Date()
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    days.push(d.toISOString().split("T")[0])
  }
  return days
}

export default function StatsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [dailyData, setDailyData] = useState<any>({})
  const [history, setHistory] = useState<Record<string, any>>({})
  const [transactions, setTransactions] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [workoutLog, setWorkoutLog] = useState<any[]>([])
  const [routines, setRoutines] = useState<any[]>([])

  useEffect(() => {
    const dd = localStorage.getItem("lifeos_daily")
    const h = localStorage.getItem("lifeos_history")
    const tx = localStorage.getItem("lifeos_transactions")
    const tk = localStorage.getItem("lifeos_tasks")
    const gl = localStorage.getItem("lifeos_goals")
    const wl = localStorage.getItem("lifeos_workout_log")

    if (dd) setDailyData(JSON.parse(dd))
    if (h) setHistory(JSON.parse(h))
    if (tx) setTransactions(JSON.parse(tx))
    if (tk) setTasks(JSON.parse(tk))
    if (gl) setGoals(JSON.parse(gl))
    if (wl) setWorkoutLog(JSON.parse(wl))
    const rt = localStorage.getItem("lifeos_routines")
    if (rt) setRoutines(JSON.parse(rt))
    setMounted(true)
  }, [])

  const today = getToday()

  const todayChecks = useMemo(() => {
    if (!dailyData || !dailyData.date) return 0
    return [
      dailyData.skincareAM, dailyData.skincarePM, dailyData.creatine,
      dailyData.noFap, dailyData.lectura,
      (dailyData.brushing || 0) >= 3, (dailyData.waterMl || 0) >= 4000,
    ].filter(Boolean).length
  }, [dailyData])

  const historyDays = useMemo(() => Object.keys(history).length, [history])
  const perfectDays = useMemo(() =>
    Object.values(history).filter((d: any) => {
      const checks = [d.skincareAM, d.skincarePM, d.creatine, d.noFap, d.lectura, (d.brushing || 0) >= 3, (d.waterMl || 0) >= 4000]
      return checks.filter(Boolean).length >= 6
    }).length, [history])

  const weekDays = useMemo(() => getMonthDays(), [])
  const weekData = useMemo(() => weekDays.map((date) => {
    const day = history[date]
    if (!day) return { day: new Date(date).toLocaleDateString("es-ES", { weekday: "short" }), checks: 0, water: 0 }
    const checks = [day.skincareAM, day.skincarePM, day.creatine, day.noFap, day.lectura, (day.brushing || 0) >= 3, (day.waterMl || 0) >= 4000].filter(Boolean).length
    return {
      day: new Date(date).toLocaleDateString("es-ES", { weekday: "short" }),
      checks,
      water: Math.round((day.waterMl || 0) / 1000 * 10) / 10,
    }
  }), [weekDays, history])

  const currentStreak = useMemo(() => {
    const dates = Object.keys(history).sort().reverse()
    let streak = 0
    const todayDate = new Date(today)
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(todayDate)
      expected.setDate(expected.getDate() - i)
      if (dates.includes(expected.toISOString().split("T")[0])) streak++
      else break
    }
    return streak
  }, [history, today])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthTx = useMemo(() => transactions.filter((t: any) => t.date?.startsWith(thisMonth)), [transactions, thisMonth])
  const monthIncome = useMemo(() => monthTx.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + (t.amount || 0), 0), [monthTx])
  const monthExpenses = useMemo(() => monthTx.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0), [monthTx])

  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === "completed").length,
    pending: tasks.filter((t: any) => t.status !== "completed" && t.status !== "archived").length,
    archived: tasks.filter((t: any) => t.status === "archived").length,
  }), [tasks])

  const goalStats = useMemo(() => ({
    total: goals.length,
    active: goals.filter((g: any) => g.status === "active").length,
    completed: goals.filter((g: any) => g.status === "completed").length,
    avgProgress: goals.filter((g: any) => g.status === "active").length > 0
      ? Math.round(goals.filter((g: any) => g.status === "active").reduce((s: number, g: any) => s + (g.progress || 0), 0) / goals.filter((g: any) => g.status === "active").length)
      : 0,
  }), [goals])

  const gymStats = useMemo(() => {
    const all = workoutLog
    const thisWeek = all.filter((w: any) => {
      const d = new Date(w.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return d >= weekAgo
    })
    const thisMonthLogs = all.filter((w: any) => w.date?.startsWith(thisMonth))

    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split("T")[0]
      const dayLog = all.find((w: any) => w.date === dateStr)
      const dayName = d.toLocaleDateString("es-ES", { weekday: "short" })
      const sets = dayLog?.exercises?.reduce((s: number, e: any) => s + (e.sets?.length || 0), 0) || 0
      const totalVol = dayLog?.exercises?.reduce((s: number, e: any) => s + (e.sets || []).reduce((ss: number, set: any) => ss + (set.reps || 0) * (set.weight || 0), 0), 0) || 0
      return { day: dayName, sets, volume: Math.round(totalVol / 100) * 100, trained: !!dayLog }
    })

    const exercisePRs: { name: string; volume: number; date: string }[] = []
    all.forEach((entry: any) => {
      entry.exercises?.forEach((ex: any, i: number) => {
        const vol = (ex.sets || []).reduce((s: number, set: any) => s + (set.reps || 0) * (set.weight || 0), 0)
        const existing = exercisePRs.find((p) => p.name === ex.exerciseId)
        if (!existing || vol > existing.volume) {
          if (existing) Object.assign(existing, { volume: vol, date: entry.date })
          else exercisePRs.push({ name: ex.exerciseId, volume: vol, date: entry.date })
        }
      })
    })

    const routineLabels = ["Push", "Pull", "Legs"]
    const routineCounts = routineLabels.map((label, i) => ({
      name: label,
      sessions: all.filter((w: any) => w.routineDay === i).length,
      color: i === 0 ? "#3b82f6" : i === 1 ? "#8b5cf6" : "#10b981",
    }))

    return {
      totalSessions: all.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonthLogs.length,
      totalSets: all.reduce((s: number, w: any) => s + (w.exercises || []).reduce((ss: number, e: any) => ss + (e.sets?.length || 0), 0), 0),
      weekData,
      exercisePRs,
      routineCounts,
    }
  }, [workoutLog, thisMonth])

  const habitBreakdown = useMemo(() => {
    const items = [
      { name: "Skincare AM", key: "skincareAM", color: "#f59e0b" },
      { name: "Skincare PM", key: "skincarePM", color: "#6366f1" },
      { name: "Creatina", key: "creatine", color: "#ef4444" },
      { name: "NF", key: "noFap", color: "#8b5cf6" },
      { name: "Lectura", key: "lectura", color: "#f59e0b" },
      { name: "Cepillado", key: "brushing", color: "#10b981", goal: 3 },
      { name: "Agua", key: "waterMl", color: "#3b82f6", goal: 4000 },
    ]
    return items.map((item) => {
      const totalDays = Object.keys(history).length || 1
      const done = Object.values(history).filter((d: any) => {
        if (item.key === "brushing") return (d.brushing || 0) >= 3
        if (item.key === "waterMl") return (d.waterMl || 0) >= 4000
        return !!d[item.key]
      }).length
      return { ...item, rate: Math.round((done / totalDays) * 100), total: done }
    })
  }, [history])

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)

  return (
    <motion.div 
      className="space-y-8 overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight mt-1">Estadísticas</h2>
        <p className="text-base text-muted-foreground mt-1">Tu progreso en un solo lugar</p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { label: "Racha", value: `${currentStreak}d`, sub: "días seguidos", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Días registro", value: historyDays, sub: "totales", icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Perfectos", value: perfectDays, sub: "6+ checks", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Hoy", value: `${todayChecks}/7`, sub: "checks", icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center bg-gradient-to-b min-w-0", s.bg, "border-transparent")}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { label: "Ingresos", value: formatCOP(monthIncome), icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
          { label: "Gastos", value: formatCOP(monthExpenses), icon: TrendingUp, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/10" },
          { label: "Tareas", value: `${taskStats.completed}/${taskStats.total}`, icon: CheckSquare, color: "text-purple-500", bg: "bg-purple-500/5", border: "border-purple-500/10" },
          { label: "Gym", value: `${gymStats.totalSessions} sesiones`, icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center min-w-0", s.bg, s.border)}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-sm font-bold">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1 text-[11px]">General</TabsTrigger>
          <TabsTrigger value="habits" className="flex-1 text-[11px]">Hábitos</TabsTrigger>
          <TabsTrigger value="gym" className="flex-1 text-[11px]">Gym</TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 text-[11px]">Finanzas</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
        <div className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">Actividad semanal</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Bar dataKey="checks" fill="url(#checksGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="checksGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/5 border-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold">Objetivos</span>
              </div>
              <p className="text-2xl font-bold">{goalStats.completed}/{goalStats.total}</p>
              <p className="text-[10px] text-muted-foreground">cumplidos</p>
              <div className="flex gap-1 mt-2">
                {goals.filter((g: any) => g.status === "active").slice(0, 3).map((g: any) => (
                  <div key={g.id} className="flex-1 rounded-lg bg-background/50 p-1.5 text-center">
                    <p className="text-[9px] font-semibold truncate">{g.title}</p>
                    <p className="text-[11px] font-bold text-emerald-500">{g.progress || 0}%</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/5 border-purple-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold">Tareas</span>
              </div>
              <p className="text-2xl font-bold">{taskStats.completed}/{taskStats.total}</p>
              <p className="text-[10px] text-muted-foreground">completadas</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-purple-500/20">
                  <div className="h-full rounded-full bg-purple-500 transition-all"
                    style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-purple-500">
                  {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "habits" && (
        <div className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">Tasa de cumplimiento por hábito</span>
            </div>
            <div className="space-y-3">
              {habitBreakdown.map((h) => (
                <div key={h.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{h.name}</span>
                    <span className="text-muted-foreground">{h.total}/{historyDays}d · {h.rate}%</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${h.rate}%`, backgroundColor: h.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-bold">Hidratación semanal (Litros)</span>
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} fill="url(#waterGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "gym" && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { label: "Sesiones", value: gymStats.totalSessions, sub: "totales", icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Esta semana", value: gymStats.thisWeek, sub: "sesiones", icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Este mes", value: gymStats.thisMonth, sub: "sesiones", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Total sets", value: gymStats.totalSets, sub: "histórico", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className={cn("rounded-2xl border p-3 text-center bg-gradient-to-b min-w-0", s.bg, "border-transparent")}>
                  <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                </div>
              )
            })}
          </div>

          <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold">Volumen semanal (kg totales)</span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gymStats.weekData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                    {gymStats.weekData.map((entry: any, index: number) => (
                      <rect key={index} fill={entry.trained ? "url(#volGrad)" : "hsl(var(--muted))"} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold">Distribución por rutina</span>
            </div>
            <div className="space-y-3">
              {gymStats.routineCounts.map((r: any) => {
                const maxSessions = Math.max(...gymStats.routineCounts.map((x: any) => x.sessions), 1)
                const pct = Math.round((r.sessions / maxSessions) * 100)
                return (
                  <div key={r.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        {r.name}
                      </span>
                      <span className="text-muted-foreground">{r.sessions} sesiones</span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {gymStats.exercisePRs.length > 0 && (
            <Card className="bg-gradient-to-br from-red-500/5 to-transparent border-red-500/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold">Top ejercicios por volumen</span>
              </div>
              <div className="space-y-2">
                {gymStats.exercisePRs
                  .sort((a: any, b: any) => b.volume - a.volume)
                  .slice(0, 5)
                  .map((pr: any, i: number) => {
                    const allExercises = routines.flatMap((r: any) => r.exercises || [])
                    const exName = allExercises.find((e: any) => e.id === pr.name)?.name || pr.name
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-background/50 p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-[10px] font-bold text-red-500">
                            {i + 1}
                          </div>
                          <span className="text-xs font-medium truncate">{exName}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold">{new Intl.NumberFormat("es-CO").format(pr.volume)} kg</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(pr.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "finance" && (
        <div className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-bold">Balance mensual</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {new Date().toLocaleDateString("es-ES", { month: "long" })}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                <ArrowUpRight className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-lg font-bold text-emerald-500">{formatCOP(monthIncome)}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-500/10">
                <TrendingUp className="h-4 w-4 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="text-lg font-bold text-red-500">{formatCOP(monthExpenses)}</p>
              </div>
            </div>
            <div className="text-center mt-3 p-3 rounded-xl bg-primary/10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className={cn("text-xl font-extrabold", monthIncome - monthExpenses >= 0 ? "text-emerald-500" : "text-red-500")}>
                {formatCOP(monthIncome - monthExpenses)}
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold">Metas financieras</span>
            </div>
            <div className="space-y-3">
              {goals.filter((g: any) => g.category === "Finanzas" && g.status === "active").slice(0, 3).map((g: any) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{g.title}</span>
                    <span className="font-semibold">{g.progress || 0}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                      style={{ width: `${g.progress || 0}%` }} />
                  </div>
                </div>
              ))}
              {goals.filter((g: any) => g.category === "Finanzas" && g.status === "active").length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Sin metas financieras activas</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
