"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FileText,
  Copy,
  CheckSquare,
  Droplets,
  Dumbbell,
  Wallet,
  Target,
  Trophy,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react"

interface WeeklyReportProps {
  history: Record<string, any>
  workoutLog: any[]
  tasks: any[]
  goals: any[]
  transactions: any[]
}

export default function WeeklyReport({ history, workoutLog, tasks, goals, transactions }: WeeklyReportProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const weekDates: string[] = []
  const d = new Date(sevenDaysAgo)
  while (d <= today) {
    weekDates.push(formatDate(d))
    d.setDate(d.getDate() + 1)
  }

  const weekHistory = weekDates.map((date) => history[date]).filter(Boolean)

  const stats = useMemo(() => {
    const getChecks = (day: any) =>
      [day.skincareAM, day.skincarePM, day.creatine, day.noFap, day.lectura, (day.brushing || 0) >= 3, (day.waterMl || 0) >= 4000].filter(Boolean).length

    const habitsCompleted = weekHistory.reduce((s: number, d: any) => s + getChecks(d), 0)
    const totalWater = weekHistory.reduce((s: number, d: any) => s + (d.waterMl || 0), 0)

    const gymSessions = workoutLog.filter((w: any) => {
      const wd = new Date(w.date)
      return wd >= sevenDaysAgo && wd <= today
    }).length

    const weekExpenses = transactions.filter((t: any) => {
      if (t.type !== "expense") return false
      const td = new Date(t.date)
      return td >= sevenDaysAgo && td <= today
    }).reduce((s: number, t: any) => s + (t.amount || 0), 0)

    const tasksDone = tasks.filter((t: any) => {
      if (t.status !== "completed" || !t.completedAt) return false
      const td = new Date(t.completedAt)
      return td >= sevenDaysAgo && td <= today
    }).length

    const goalsProgressed = goals.filter((g: any) => {
      if (g.status !== "active" && g.status !== "completed") return false
      if (g.completedAt) {
        const gd = new Date(g.completedAt)
        return gd >= sevenDaysAgo && gd <= today
      }
      return (g.progress || 0) > 0
    }).length

    const daysWithData = weekHistory.length
    const maxPossibleHabits = daysWithData * 7
    const habitScore = maxPossibleHabits > 0 ? Math.round((habitsCompleted / maxPossibleHabits) * 100) : 0
    const waterScore = daysWithData > 0 ? Math.round((weekHistory.filter((d: any) => (d.waterMl || 0) >= 4000).length / daysWithData) * 100) : 0
    const gymScore = gymSessions >= 3 ? 100 : gymSessions >= 2 ? 70 : gymSessions >= 1 ? 40 : 0
    const taskScore = tasksDone >= 5 ? 100 : Math.round((tasksDone / 5) * 100)

    const productivityScore = Math.round((habitScore * 0.35 + waterScore * 0.2 + gymScore * 0.25 + taskScore * 0.2))

    return {
      habitsCompleted,
      totalWater,
      gymSessions,
      weekExpenses,
      tasksDone,
      goalsProgressed,
      daysWithData,
      productivityScore,
      habitScore,
      waterScore,
      gymScore,
      taskScore,
    }
  }, [weekHistory, workoutLog, tasks, goals, transactions, sevenDaysAgo, today])

  const formatCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)

  const dateRangeLabel = `${sevenDaysAgo.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - ${today.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`

  const shareText = [
    `📊 Resumen Semanal · LifeOS`,
    `${dateRangeLabel}`,
    ``,
    `✅ Hábitos: ${stats.habitsCompleted} checks`,
    `💧 Hidratación: ${(stats.totalWater / 1000).toFixed(1)}L`,
    `🏋️ Gym: ${stats.gymSessions} sesiones`,
    `💰 Gastos: ${formatCOP(stats.weekExpenses)}`,
    `📋 Tareas: ${stats.tasksDone} completadas`,
    `🎯 Objetivos: ${stats.goalsProgressed} activos/completados`,
    ``,
    `⚡ Productividad: ${stats.productivityScore}%`,
  ].join("\n")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = shareText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const statCards = [
    { label: "Hábitos", value: `${stats.habitsCompleted}`, sub: "checks", icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Hidratación", value: `${(stats.totalWater / 1000).toFixed(1)}L`, sub: "total", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Gym", value: `${stats.gymSessions}`, sub: "sesiones", icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Gastos", value: formatCOP(stats.weekExpenses), sub: "semanal", icon: Wallet, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Tareas", value: `${stats.tasksDone}`, sub: "completadas", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Objetivos", value: `${stats.goalsProgressed}`, sub: "activos", icon: Target, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 rounded-xl">
          <FileText className="h-3.5 w-3.5" />
          Ver reporte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-extrabold">Resumen Semanal</span>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-xs text-muted-foreground">{dateRangeLabel}</p>

        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 text-center mt-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Productividad</p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span
              className={cn(
                "text-4xl font-extrabold",
                stats.productivityScore >= 80 ? "text-emerald-400" : stats.productivityScore >= 50 ? "text-amber-400" : "text-red-400"
              )}
            >
              {stats.productivityScore}%
            </span>
          </div>
          <div className="relative h-2 w-full max-w-[200px] mx-auto mt-3 overflow-hidden rounded-full bg-secondary/60">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                stats.productivityScore >= 80
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : stats.productivityScore >= 50
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-red-400 to-red-500"
              )}
              style={{ width: `${stats.productivityScore}%` }}
            />
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Trophy
                key={star}
                className={cn(
                  "h-3 w-3",
                  stats.productivityScore >= star * 20 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label} className={cn("bg-gradient-to-br border p-4", card.bg, card.border)}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", card.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", card.color)} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-[9px] text-muted-foreground">{card.sub}</p>
              </Card>
            )
          })}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold">Desglose de puntuación</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Hábitos", score: stats.habitScore, weight: "35%", color: "bg-blue-500" },
              { label: "Hidratación", score: stats.waterScore, weight: "20%", color: "bg-cyan-500" },
              { label: "Gym", score: stats.gymScore, weight: "25%", color: "bg-emerald-500" },
              { label: "Tareas", score: stats.taskScore, weight: "20%", color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20">{item.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary/60 overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", item.color)} style={{ width: `${item.score}%` }} />
                </div>
                <span className="text-[10px] font-semibold w-8 text-right">{item.score}%</span>
                <span className="text-[9px] text-muted-foreground w-6">{item.weight}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCopy}
          variant={copied ? "secondary" : "default"}
          size="sm"
          className="w-full gap-2 rounded-xl"
        >
          {copied ? (
            <>
              <CheckSquare className="h-4 w-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Compartir
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
