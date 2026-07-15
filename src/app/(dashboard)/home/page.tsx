"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HistoryDialog } from "@/components/home/history-dialog"
import { Progress } from "@/components/ui/progress"
import {
  Dumbbell,
  Wallet,
  ListTodo,
  Flame,
  TrendingUp,
  CheckSquare,
  Sun,
  Moon,
  Sparkles,
  Droplets,
  Zap,
  Check,
  Plus,
  Minus,
  CalendarDays,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function getDayPeriod() {
  const hour = new Date().getHours()
  if (hour < 12) return "am" as const
  if (hour < 18) return "pm" as const
  return "night" as const
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "Buenos días", emoji: "☀️" }
  if (hour < 18) return { text: "Buenas tardes", emoji: "🌤️" }
  return { text: "Buenas noches", emoji: "🌙" }
}

const WATER_GOAL = 4000
const BRUSHING_GOAL = 3

export default function HomePage() {
  const [skincareAM, setSkincareAM] = useState(false)
  const [skincarePM, setSkincarePM] = useState(false)
  const [creatine, setCreatine] = useState(false)
  const [noFap, setNoFap] = useState(false)
  const [lectura, setLectura] = useState(false)
  const [brushing, setBrushing] = useState(0)
  const [waterMl, setWaterMl] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [tapFeedback, setTapFeedback] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_daily")
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toISOString().split("T")[0]
      if (data.date === today) {
        setSkincareAM(data.skincareAM ?? false)
        setSkincarePM(data.skincarePM ?? false)
        setCreatine(data.creatine ?? false)
        setNoFap(data.noFap ?? false)
        setLectura(data.lectura ?? false)
        setBrushing(data.brushing ?? 0)
        setWaterMl(data.waterMl ?? 0)
      }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lifeos_daily", JSON.stringify({
      date: today,
      skincareAM,
      skincarePM,
      creatine,
      noFap,
      lectura,
      brushing,
      waterMl,
    }))
  }, [skincareAM, skincarePM, creatine, noFap, lectura, brushing, waterMl, mounted])

  useEffect(() => {
    if (!mounted) return
    const today = new Date().toISOString().split("T")[0]
    const historyRaw = localStorage.getItem("lifeos_history")
    const history = historyRaw ? JSON.parse(historyRaw) : {}
    history[today] = { skincareAM, skincarePM, creatine, noFap, lectura, brushing, waterMl }
    localStorage.setItem("lifeos_history", JSON.stringify(history))
  }, [skincareAM, skincarePM, creatine, noFap, lectura, brushing, waterMl])

  function triggerFeedback(id: string) {
    setTapFeedback(id)
    setTimeout(() => setTapFeedback(null), 400)
  }

  const greeting = getGreeting()
  const period = getDayPeriod()
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const waterProgress = Math.min((waterMl / WATER_GOAL) * 100, 100)
  const waterGlasses = Math.round((waterMl / WATER_GOAL) * 8)

  const completedCount = [
    skincareAM,
    skincarePM,
    creatine,
    noFap,
    lectura,
    brushing >= BRUSHING_GOAL,
    waterMl >= WATER_GOAL,
  ].filter(Boolean).length

  const totalItems = 7
  const percent = Math.round((completedCount / totalItems) * 100)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground capitalize tracking-tight">{today}</p>
          <h2 className="text-[26px] font-bold tracking-tight flex items-center gap-2">
            {greeting.text} <span className="text-2xl">{greeting.emoji}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-muted/50 hover:bg-muted px-3 py-1.5 transition-colors"
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Historial</span>
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5">
            <div className="relative">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <div className="absolute inset-0 animate-ping opacity-0" />
            </div>
            <span className="text-xs font-semibold text-amber-600">Día 187</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-[1px]">
        <div className="rounded-2xl bg-background p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm bg-primary text-primary-foreground">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Checklist diario</p>
                <p className="text-xs text-muted-foreground">
                  {percent === 100 ? "Todo listo" : `${totalItems - completedCount} pendientes`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tabular-nums">{percent}%</span>
              <p className="text-[10px] text-muted-foreground">{completedCount}/{totalItems}</p>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-blue-500 to-blue-400 transition-all duration-1000 ease-out"
              style={{ width: `${percent}%` }}
            />
            {percent > 0 && percent < 100 && (
              <div
                className="absolute inset-y-0 w-10 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
                style={{ left: `${Math.max(0, percent - 8)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checklist</span>
        </div>

        <div className="space-y-2">
          {period === "am" && (
            <button
              onClick={() => { setSkincareAM(!skincareAM); triggerFeedback("skincare-am") }}
              className={cn(
                "group relative flex w-full items-center gap-4 rounded-[18px] p-[1px] text-left transition-all duration-500",
                "hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.985]",
                tapFeedback === "skincare-am" && "scale-[0.97]",
                skincareAM
                  ? "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-orange-400/30 shadow-md shadow-amber-500/10"
                  : "bg-gradient-to-br from-transparent to-transparent hover:from-amber-500/5 hover:to-orange-500/5"
              )}
            >
              <div className={cn(
                "relative flex w-full items-center gap-4 rounded-[17px] p-4",
                skincareAM
                  ? "bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 backdrop-blur-sm"
                  : "bg-card"
              )}>
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-xl blur-xl transition-all duration-500",
                    skincareAM ? "bg-amber-400/40 scale-100" : "bg-amber-400/0 scale-75"
                  )} />
                  <div
                    className={cn(
                      "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                      skincareAM
                        ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/30"
                        : "bg-amber-500/10 group-hover:bg-amber-500/20"
                    )}
                  >
                    {skincareAM ? (
                      <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                    ) : (
                      <span className="text-xl">🧴</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-semibold tracking-tight transition-all duration-300",
                    skincareAM && "text-amber-700 dark:text-amber-300"
                  )}>
                    Skincare AM
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">
                    Limpiador · Sérum · Hidratante · SPF
                  </p>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all duration-500",
                  skincareAM
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                )}>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                    skincareAM ? "bg-amber-500" : "bg-amber-500 animate-pulse"
                  )} />
                  {skincareAM ? "Hecho" : "Ahora"}
                </div>
              </div>
            </button>
          )}

          {(period === "pm" || period === "night") && (
            <button
              onClick={() => { setSkincarePM(!skincarePM); triggerFeedback("skincare-pm") }}
              className={cn(
                "group relative flex w-full items-center gap-4 rounded-[18px] p-[1px] text-left transition-all duration-500",
                "hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.985]",
                tapFeedback === "skincare-pm" && "scale-[0.97]",
                skincarePM
                  ? "bg-gradient-to-br from-indigo-400/30 via-violet-500/20 to-purple-400/30 shadow-md shadow-indigo-500/10"
                  : "bg-gradient-to-br from-transparent to-transparent hover:from-indigo-500/5 hover:to-violet-500/5"
              )}
            >
              <div className={cn(
                "relative flex w-full items-center gap-4 rounded-[17px] p-4",
                skincarePM
                  ? "bg-gradient-to-br from-indigo-500/10 via-violet-400/5 to-purple-500/10 backdrop-blur-sm"
                  : "bg-card"
              )}>
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-xl blur-xl transition-all duration-500",
                    skincarePM ? "bg-indigo-400/40 scale-100" : "bg-indigo-400/0 scale-75"
                  )} />
                  <div
                    className={cn(
                      "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                      skincarePM
                        ? "bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-indigo-500/10 group-hover:bg-indigo-500/20"
                    )}
                  >
                    {skincarePM ? (
                      <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                    ) : (
                      <span className="text-xl">🌙</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-semibold tracking-tight transition-all duration-300",
                    skincarePM && "text-indigo-700 dark:text-indigo-300"
                  )}>
                    Skincare PM
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">
                    Doble limpieza · Sérum · Retinol · Crema
                  </p>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all duration-500",
                  skincarePM
                    ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20"
                )}>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                    skincarePM ? "bg-indigo-500" : "bg-indigo-500 animate-pulse"
                  )} />
                  {skincarePM ? "Hecho" : "Ahora"}
                </div>
              </div>
            </button>
          )}

          <div
            className={cn(
              "rounded-2xl border transition-all duration-200",
              brushing >= BRUSHING_GOAL
                ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-sm"
                : "bg-card border-border/60"
            )}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                    brushing >= BRUSHING_GOAL
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-500/25"
                      : "bg-emerald-500/10"
                  )}
                >
                  {brushing >= BRUSHING_GOAL ? <Check className="h-6 w-6" /> : <span className="text-xl">🪥</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold transition-colors", brushing >= BRUSHING_GOAL && "text-emerald-700 dark:text-emerald-400")}>
                    Cepillado
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {brushing}/{BRUSHING_GOAL} veces
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setBrushing(Math.max(0, brushing - 1)) }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 hover:bg-accent transition-all active:scale-90 disabled:opacity-30"
                    disabled={brushing === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setBrushing(brushing + 1); triggerFeedback("brushing") }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-90",
                      tapFeedback === "brushing" && "scale-75",
                      brushing >= BRUSHING_GOAL
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                        : "border border-border/60 hover:bg-accent"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/80">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                      brushing >= BRUSHING_GOAL
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-emerald-300 to-emerald-500"
                    )}
                    style={{ width: `${(brushing / BRUSHING_GOAL) * 100}%` }}
                  />
                  {brushing > 0 && brushing < BRUSHING_GOAL && (
                    <div
                      className="absolute inset-y-0 w-6 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      style={{ left: `${(brushing / BRUSHING_GOAL) * 100 - 8}%` }}
                    />
                  )}
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: BRUSHING_GOAL }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-1.5 rounded-full transition-all duration-500",
                        i < brushing
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              {brushing >= BRUSHING_GOAL && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  Completado
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border transition-all duration-200",
              waterMl >= WATER_GOAL
                ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-blue-500/20 shadow-sm"
                : "bg-card border-border/60"
            )}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                    waterMl >= WATER_GOAL
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-blue-500/25"
                      : "bg-blue-500/10"
                  )}
                >
                  {waterMl >= WATER_GOAL ? <Check className="h-6 w-6" /> : <span className="text-xl">💧</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold transition-colors", waterMl >= WATER_GOAL && "text-blue-700 dark:text-blue-400")}>
                    Hidratación
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(waterMl / 1000).toFixed(1)}L de {WATER_GOAL / 1000}L
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWaterMl(Math.max(0, waterMl - 500))}
                    className="flex h-8 items-center gap-1 rounded-lg border border-border/60 px-2 text-[11px] font-medium hover:bg-accent transition-all active:scale-90 disabled:opacity-30"
                    disabled={waterMl === 0}
                  >
                    <Minus className="h-3 w-3" /> ½L
                  </button>
                  <button
                    onClick={() => { setWaterMl(waterMl + 1000); triggerFeedback("water") }}
                    className={cn(
                      "flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium transition-all active:scale-90",
                      tapFeedback === "water" && "scale-75",
                      waterMl >= WATER_GOAL
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                        : "border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                    )}
                  >
                    <Plus className="h-3 w-3" /> 1L
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/80">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-1000",
                      waterMl >= WATER_GOAL
                        ? "bg-gradient-to-r from-emerald-400 via-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400"
                    )}
                    style={{ width: `${waterProgress}%` }}
                  />
                  {waterMl > 0 && waterMl < WATER_GOAL && (
                    <div
                      className="absolute inset-y-0 w-8 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      style={{ left: `${waterProgress - 5}%` }}
                    />
                  )}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }, (_, i) => {
                    const segmentGoal = WATER_GOAL / 8
                    const filled = waterMl >= (i + 1) * segmentGoal
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className={cn(
                            "h-1.5 w-full rounded-full transition-all duration-500",
                            filled
                              ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                              : "bg-muted"
                          )}
                        />
                        <span className="text-[9px] text-muted-foreground/60">
                          {(i + 1) * 0.5}L
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {waterMl >= WATER_GOAL && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  Meta alcanzada
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { setCreatine(!creatine); triggerFeedback("creatine") }}
            className={cn(
              "group relative flex w-full items-center gap-4 rounded-[18px] p-[1px] text-left transition-all duration-500",
              "hover:shadow-lg hover:shadow-red-500/5 active:scale-[0.985]",
              tapFeedback === "creatine" && "scale-[0.97]",
              creatine
                ? "bg-gradient-to-br from-red-400/30 via-rose-500/20 to-pink-400/30 shadow-md shadow-red-500/10"
                : "bg-gradient-to-br from-transparent to-transparent hover:from-red-500/5 hover:to-rose-500/5"
            )}
          >
            <div className={cn(
              "relative flex w-full items-center gap-4 rounded-[17px] p-4",
              creatine
                ? "bg-gradient-to-br from-red-500/10 via-rose-400/5 to-pink-500/10 backdrop-blur-sm"
                : "bg-card"
            )}>
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-xl blur-xl transition-all duration-500",
                  creatine ? "bg-red-400/40 scale-100" : "bg-red-400/0 scale-75"
                )} />
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                    creatine
                      ? "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-red-500/10 group-hover:bg-red-500/20"
                  )}
                >
                  {creatine ? (
                    <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <span className="text-xl">⚡</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-semibold tracking-tight transition-all duration-300",
                  creatine && "text-red-700 dark:text-red-300"
                )}>
                  Creatina
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">
                  5g diarios
                </p>
              </div>
              {creatine && (
                <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-[10px] font-semibold text-red-700 dark:text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Hecho
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => { setNoFap(!noFap); triggerFeedback("nofap") }}
            className={cn(
              "group relative flex w-full items-center gap-4 rounded-[18px] p-[1px] text-left transition-all duration-500",
              "hover:shadow-lg hover:shadow-violet-500/5 active:scale-[0.985]",
              tapFeedback === "nofap" && "scale-[0.97]",
              noFap
                ? "bg-gradient-to-br from-violet-400/30 via-purple-500/20 to-fuchsia-400/30 shadow-md shadow-violet-500/10"
                : "bg-gradient-to-br from-transparent to-transparent hover:from-violet-500/5 hover:to-purple-500/5"
            )}
          >
            <div className={cn(
              "relative flex w-full items-center gap-4 rounded-[17px] p-4",
              noFap
                ? "bg-gradient-to-br from-violet-500/10 via-purple-400/5 to-fuchsia-500/10 backdrop-blur-sm"
                : "bg-card"
            )}>
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-xl blur-xl transition-all duration-500",
                  noFap ? "bg-violet-400/40 scale-100" : "bg-violet-400/0 scale-75"
                )} />
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                    noFap
                      ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-lg shadow-violet-500/30"
                      : "bg-violet-500/10 group-hover:bg-violet-500/20"
                  )}
                >
                  {noFap ? (
                    <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <span className="text-xl">🧘</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-semibold tracking-tight transition-all duration-300",
                  noFap && "text-violet-700 dark:text-violet-300"
                )}>
                  NF
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">
                  Disciplina diaria
                </p>
              </div>
              {noFap && (
                <div className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Hecho
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => { setLectura(!lectura); triggerFeedback("lectura") }}
            className={cn(
              "group relative flex w-full items-center gap-4 rounded-[18px] p-[1px] text-left transition-all duration-500",
              "hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.985]",
              tapFeedback === "lectura" && "scale-[0.97]",
              lectura
                ? "bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-orange-400/30 shadow-md shadow-amber-500/10"
                : "bg-gradient-to-br from-transparent to-transparent hover:from-amber-500/5 hover:to-yellow-500/5"
            )}
          >
            <div className={cn(
              "relative flex w-full items-center gap-4 rounded-[17px] p-4",
              lectura
                ? "bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-orange-500/10 backdrop-blur-sm"
                : "bg-card"
            )}>
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-xl blur-xl transition-all duration-500",
                  lectura ? "bg-amber-400/40 scale-100" : "bg-amber-400/0 scale-75"
                )} />
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                    lectura
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                      : "bg-amber-500/10 group-hover:bg-amber-500/20"
                  )}
                >
                  {lectura ? (
                    <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <span className="text-xl">📖</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-semibold tracking-tight transition-all duration-300",
                  lectura && "text-amber-700 dark:text-amber-300"
                )}>
                  Lectura
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">
                  30 minutos mínimo
                </p>
              </div>
              {lectura && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Hecho
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acceso rápido</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/habits", icon: "✅", label: "Hábitos", sub: "Versión pro", gradient: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-500/20", iconBg: "bg-emerald-500/10" },
            { href: "/finances", icon: "💰", label: "Finanzas", sub: "Registrar gasto", gradient: "from-purple-500/10 to-violet-500/5", border: "border-purple-500/20", iconBg: "bg-purple-500/10" },
            { href: "/gym", icon: "🏋️", label: "Gym", sub: "Iniciar rutina", gradient: "from-blue-500/10 to-sky-500/5", border: "border-blue-500/20", iconBg: "bg-blue-500/10" },
            { href: "/tasks", icon: "📋", label: "Tareas", sub: "Ver pendientes", gradient: "from-amber-500/10 to-orange-500/5", border: "border-amber-500/20", iconBg: "bg-amber-500/10" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative rounded-2xl border transition-all duration-200 hover:shadow-md active:scale-[0.97] cursor-pointer",
                  "bg-gradient-to-br p-4",
                  item.gradient,
                  item.border
                )}
              >
                <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg mb-2 transition-transform group-hover:scale-110", item.iconBg)}>
                  {item.icon}
                </div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Gym", value: "45 min", sub: "Hoy", icon: Dumbbell, gradient: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/15", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
            { label: "Finanzas", value: "$0", sub: "Gastos", icon: Wallet, gradient: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/15", iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
            { label: "Tareas", value: "3", sub: "Pendientes", icon: ListTodo, gradient: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/15", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={`/${stat.label.toLowerCase() === "gym" ? "gym" : stat.label.toLowerCase() === "finanzas" ? "finances" : "tasks"}`}>
                <div className={cn(
                  "rounded-2xl border p-3.5 text-center transition-all duration-200 hover:shadow-md active:scale-[0.97] cursor-pointer",
                  "bg-gradient-to-b",
                  stat.gradient,
                  stat.border
                )}>
                  <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg mb-2 transition-transform hover:scale-110", stat.iconBg)}>
                    <Icon className={cn("h-4 w-4", stat.iconColor)} />
                  </div>
                  <p className="text-base font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="rounded-[18px] bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/15 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Gym Streak</p>
              <p className="text-[11px] text-muted-foreground">Últimos 30 días</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">0d racha</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">0/30</p>
            </div>
          </div>
        </div>

        <div className="flex gap-[2px]">
          {Array.from({ length: 30 }, (_, i) => {
            const dayIndex = 29 - i
            const isGymDay = false
            const isToday = i === 29
            const isCurrentStreak = i >= 23

            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-300",
                  isGymDay
                    ? isToday
                      ? "bg-blue-500 h-10 -mt-0.5 shadow-[0_0_10px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/50"
                      : isCurrentStreak
                      ? "bg-gradient-to-b from-blue-500 to-indigo-500 h-8 shadow-[0_0_6px_rgba(99,102,241,0.3)]"
                      : "bg-blue-500/60 h-7"
                    : "bg-muted/50 h-7"
                )}
              />
            )
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
          <span>30d atrás</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-sm bg-blue-500/60" />
              <span>Gym</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-sm bg-muted/50" />
              <span>Descanso</span>
            </div>
          </div>
          <span>Hoy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/15 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="text-xs font-semibold">Rachas</span>
          </div>
          <div className="flex items-center justify-center py-3">
            <span className="text-xs text-muted-foreground">Sin datos aún</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/15 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="text-xs font-semibold">Semana</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {[0, 0, 0, 0, 0, 0, 0].map((val, i) => {
              const maxVal = 7
              const days = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]
              const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-sm transition-all",
                      isToday ? "bg-blue-500 shadow-sm shadow-blue-500/30" : "bg-blue-500/40"
                    )}
                    style={{ height: `${(val / maxVal) * 100}%` }}
                  />
                  <span className={cn("text-[9px]", isToday ? "text-blue-500 font-semibold" : "text-muted-foreground")}>
                    {days[i]}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Empieza hoy
          </p>
        </div>
      </div>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  )
}
