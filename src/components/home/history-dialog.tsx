"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  Flame,
  Dumbbell,
  TrendingUp,
  X,
} from "lucide-react"

interface DayRecord {
  skincareAM: boolean
  skincarePM: boolean
  creatine: boolean
  noFap: boolean
  lectura: boolean
  brushing: number
  waterMl: number
}

interface HistoryData {
  [date: string]: DayRecord
}

const BRUSHING_GOAL = 3
const WATER_GOAL_ML = 4000

function getCompletedCount(day: DayRecord): number {
  return [
    day.skincareAM,
    day.skincarePM,
    day.creatine,
    day.noFap,
    day.lectura,
    day.brushing >= BRUSHING_GOAL,
    day.waterMl >= WATER_GOAL_ML,
  ].filter(Boolean).length
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const ITEMS = [
  { key: "skincareAM" as const, label: "Skincare AM", icon: "🧴", color: "bg-amber-500" },
  { key: "skincarePM" as const, label: "Skincare PM", icon: "🌙", color: "bg-indigo-500" },
  { key: "brushing" as const, label: "Cepillado", icon: "🪥", color: "bg-emerald-500", isCounter: true, goal: BRUSHING_GOAL },
  { key: "waterMl" as const, label: "Hidratación", icon: "💧", color: "bg-sky-500", isCounter: true, goal: WATER_GOAL_ML },
  { key: "creatine" as const, label: "Creatina", icon: "⚡", color: "bg-red-500" },
  { key: "noFap" as const, label: "NF", icon: "🧘", color: "bg-violet-500" },
  { key: "lectura" as const, label: "Lectura", icon: "📖", color: "bg-amber-500" },
]

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const [history, setHistory] = useState<HistoryData>({})
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_history")
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch {}
    }
  }, [open])

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const monthDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const days: { date: string; day: number; isCurrentMonth: boolean; record?: DayRecord }[] = []

    const startPad = firstDay.getDay()
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i)
      days.push({ date: d.toISOString().split("T")[0], day: d.getDate(), isCurrentMonth: false })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      days.push({ date: dateStr, day: i, isCurrentMonth: true, record: history[dateStr] })
    }

    return days
  }, [viewYear, viewMonth, history])

  const monthStats = useMemo(() => {
    const daysWithData = Object.keys(history).filter((d) => d.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`))
    const totalDays = daysWithData.length
    const perfectDays = daysWithData.filter((d) => getCompletedCount(history[d]) >= 6).length
    const totalWater = daysWithData.reduce((sum, d) => sum + (history[d]?.waterMl || 0), 0)
    const totalBrushing = daysWithData.reduce((sum, d) => sum + (history[d]?.brushing || 0), 0)
    return { totalDays, perfectDays, totalWater, totalBrushing }
  }, [viewYear, viewMonth, history])

  const yearStats = useMemo(() => {
    const daysWithData = Object.keys(history).filter((d) => d.startsWith(`${viewYear}`))
    const perfectDays = daysWithData.filter((d) => getCompletedCount(history[d]) >= 6).length
    const totalCompletions = daysWithData.reduce((sum, d) => sum + getCompletedCount(history[d]), 0)
    return { totalDays: daysWithData.length, perfectDays, totalCompletions }
  }, [viewYear, history])

  const selectedRecord = selectedDay ? history[selectedDay] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Historial
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
              else setViewMonth(viewMonth - 1)
            }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewYear(viewYear - 1)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                {viewYear - 1}
              </button>
              <span className="text-sm font-bold">{MONTHS[viewMonth]} {viewYear}</span>
              <button
                onClick={() => setViewYear(viewYear + 1)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                {viewYear + 1}
              </button>
            </div>

            <button onClick={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
              else setViewMonth(viewMonth + 1)
            }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Días activos</p>
              <p className="text-lg font-bold">{monthStats.totalDays}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Perfectos</p>
              <p className="text-lg font-bold text-emerald-500">{monthStats.perfectDays}</p>
            </div>
            <div className="rounded-xl bg-sky-500/5 border border-sky-500/10 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Agua total</p>
              <p className="text-lg font-bold text-sky-500">{(monthStats.totalWater / 1000).toFixed(0)}L</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
            {monthDays.map((day, i) => {
              const record = day.record
              const completed = record ? getCompletedCount(record) : 0
              const isToday = day.date === todayStr
              const isSelected = day.date === selectedDay

              return (
                <button
                  key={i}
                  onClick={() => day.isCurrentMonth && setSelectedDay(isSelected ? null : day.date)}
                  disabled={!day.isCurrentMonth}
                  className={cn(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs",
                    !day.isCurrentMonth && "opacity-0 pointer-events-none",
                    completed >= 6 && "bg-emerald-500/10 border border-emerald-500/20",
                    completed >= 4 && completed < 6 && "bg-emerald-500/5",
                    completed > 0 && completed < 4 && "bg-muted/50",
                    !record && "hover:bg-accent/50",
                    isToday && "ring-2 ring-primary/50 bg-primary/5",
                    isSelected && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isToday && "text-primary font-bold",
                    completed >= 6 && "text-emerald-600"
                  )}>{day.day}</span>
                  {record && (
                    <div className="flex gap-[1px]">
                      {Array.from({ length: 7 }, (_, i) => {
                        const itemsDone = [
                          record.skincareAM, record.skincarePM, record.creatine,
                          record.noFap, record.lectura,
                          record.brushing >= BRUSHING_GOAL, record.waterMl >= WATER_GOAL_ML,
                        ]
                        return (
                          <div key={i} className={cn(
                            "w-1 h-1 rounded-full",
                            itemsDone[i] ? ITEMS[i].color : "bg-muted/40"
                          )} />
                        )
                      })}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {selectedDay && selectedRecord && (
            <div className="rounded-2xl border bg-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("es-ES", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                </h4>
                <Badge variant={getCompletedCount(selectedRecord) >= 6 ? "success" : "secondary"} className="text-[10px]">
                  {getCompletedCount(selectedRecord)}/7
                </Badge>
              </div>

              <div className="space-y-2">
                {ITEMS.map((item) => {
                  let done = false
                  let detail = ""
                  if (item.key === "brushing") {
                    done = selectedRecord.brushing >= BRUSHING_GOAL
                    detail = `${selectedRecord.brushing}/${BRUSHING_GOAL}`
                  } else if (item.key === "waterMl") {
                    done = selectedRecord.waterMl >= WATER_GOAL_ML
                    detail = `${(selectedRecord.waterMl / 1000).toFixed(1)}L`
                  } else {
                    done = !!selectedRecord[item.key]
                  }

                  return (
                    <div key={item.key}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 transition-colors",
                        done ? "bg-emerald-500/10 border border-emerald-500/10" : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-base",
                          done ? item.color + " text-white" : "bg-muted"
                        )}>
                          {done ? <Check className="h-4 w-4" /> : item.icon}
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{detail}</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">Agua: {(selectedRecord.waterMl / 1000).toFixed(1)}L</span>
                <span className="text-[10px] text-muted-foreground">Cepillado: {selectedRecord.brushing}x</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4 space-y-2">
            <h4 className="text-xs font-bold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Resumen {viewYear}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Días registrados</p>
                <p className="text-lg font-bold">{yearStats.totalDays}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Días perfectos</p>
                <p className="text-lg font-bold text-emerald-500">{yearStats.perfectDays}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Total checks</p>
                <p className="text-lg font-bold text-primary">{yearStats.totalCompletions}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
