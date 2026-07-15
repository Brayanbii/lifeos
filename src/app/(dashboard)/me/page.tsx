"use client"

import { useState, useEffect, useMemo } from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ExportData } from "@/components/settings/export-data"
import { AccentPicker } from "@/components/settings/accent-picker"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Check,
  X,
  Trash2,
  Scale,
  Calendar,
  TrendingUp,
  Activity,
  Edit3,
  ArrowDown,
  Smile,
  Zap,
  Trophy,
  Meh,
  Frown,
  CloudRain,
  Flame,
  ThumbsUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

interface BodyLog {
  id: string
  date: string
  weight: number
  mood: string
}

const MOODS: { emoji: string; icon: LucideIcon; label: string; color: string; bg: string; border: string }[] = [
  { emoji: "😄", icon: Smile, label: "Genial", color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { emoji: "💪", icon: Zap, label: "Motivado", color: "from-blue-400 to-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { emoji: "🏆", icon: Trophy, label: "Orgulloso", color: "from-amber-400 to-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { emoji: "🙂", icon: ThumbsUp, label: "Bien", color: "from-teal-400 to-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  { emoji: "😐", icon: Meh, label: "Normal", color: "from-gray-400 to-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30" },
  { emoji: "😕", icon: Frown, label: "Desanimado", color: "from-orange-400 to-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { emoji: "😢", icon: CloudRain, label: "Triste", color: "from-sky-400 to-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { emoji: "😤", icon: Flame, label: "Frustrado", color: "from-red-400 to-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function MePage() {
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([])
  const [mounted, setMounted] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [weightGoal, setWeightGoal] = useState(70)

  const [editWeight, setEditWeight] = useState("")
  const [editMood, setEditMood] = useState("🙂")
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const bl = localStorage.getItem("lifeos_body_logs")
    const wg = localStorage.getItem("lifeos_weight_goal")
    if (bl) setBodyLogs(JSON.parse(bl))
    if (wg) setWeightGoal(parseFloat(wg))
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_body_logs", JSON.stringify(bodyLogs)) }, [bodyLogs, mounted])
  useEffect(() => { if (mounted) localStorage.setItem("lifeos_weight_goal", String(weightGoal)) }, [weightGoal, mounted])

  const today = new Date().toISOString().split("T")[0]

  function addBodyLog() {
    const weight = parseFloat(editWeight)
    if (!weight) return
    const log: BodyLog = { id: generateId(), date: today, weight, mood: editMood }
    setBodyLogs((prev) => [log, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    setEditWeight("")
    setEditMood("🙂")
    setShowAdd(false)
    setToastMsg("Registro guardado")
  }

  function deleteBodyLog(id: string) { setBodyLogs((prev) => prev.filter((l) => l.id !== id)) }

  const sortedLogs = [...bodyLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
  const chartData = sortedLogs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    weight: l.weight,
  }))

  const latest = bodyLogs[0]
  const first = sortedLogs[0]
  const weightChange = latest && first ? latest.weight - first.weight : 0
  const minWeight = sortedLogs.length > 0 ? Math.min(...sortedLogs.map((l) => l.weight), weightGoal) - 2 : 60
  const maxWeight = sortedLogs.length > 0 ? Math.max(...sortedLogs.map((l) => l.weight), weightGoal) + 2 : 90

  const goalDiff = latest ? latest.weight - weightGoal : 0
  const goalProgress = latest ? Math.min(100, Math.max(0, Math.round(((first?.weight || weightGoal) - latest.weight) / ((first?.weight || weightGoal) - weightGoal) * 100))) : 0

  const weekMoods = useMemo(() => {
    const last7 = bodyLogs.slice(0, 7)
    return last7.map((l) => ({
      date: new Date(l.date).toLocaleDateString("es-ES", { weekday: "short" }),
      emoji: l.mood,
      label: MOODS.find((m) => m.emoji === l.mood)?.label || "",
    })).reverse()
  }, [bodyLogs])

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    bodyLogs.forEach((l) => { counts[l.mood] = (counts[l.mood] || 0) + 1 })
    return MOODS.filter((m) => counts[m.emoji]).map((m) => ({
      ...m,
      count: counts[m.emoji],
      pct: Math.round((counts[m.emoji] / bodyLogs.length) * 100),
    })).sort((a, b) => b.count - a.count)
  }, [bodyLogs])

  return (
    <div 
      className="space-y-8 overflow-x-hidden"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1">Yo</h2>
          <p className="text-base text-muted-foreground mt-1">Tu registro personal</p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Registrar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Peso", value: latest ? `${latest.weight}kg` : "—", sub: weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg` : "—", icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Meta", value: `${weightGoal}kg`, sub: goalDiff === 0 ? "¡Logrado!" : goalDiff > 0 ? `Faltan ${goalDiff.toFixed(1)}kg` : `${Math.abs(goalDiff).toFixed(1)}kg pasado`, icon: Activity, color: goalDiff === 0 ? "text-emerald-500" : goalDiff > 0 ? "text-amber-500" : "text-red-500", bg: goalDiff === 0 ? "bg-emerald-500/10" : goalDiff > 0 ? "bg-amber-500/10" : "bg-red-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-4 text-center bg-gradient-to-b min-w-0", s.bg, "border-transparent")}>
              <Icon className={cn("h-5 w-5 mx-auto mb-1.5", s.color)} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              {s.label === "Meta" && (
                <button
                  onClick={() => {
                    const newGoal = prompt("Peso objetivo (kg):", String(weightGoal))
                    if (newGoal && !isNaN(parseFloat(newGoal))) setWeightGoal(parseFloat(newGoal))
                  }}
                  className="text-[9px] text-primary hover:underline mt-1 block mx-auto"
                >
                  Cambiar meta
                </button>
              )}
            </div>
          )
        })}
      </div>

      {sortedLogs.length > 1 ? (
        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold">Evolución de peso</span>
            <Badge variant="outline" className="text-[9px] ml-auto">Meta: {weightGoal}kg</Badge>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[minWeight, maxWeight]} hide />
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ r: 4, fill: "#3b82f6" }} />
                <ReferenceLine y={weightGoal} stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Peso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 rounded-full bg-emerald-500" style={{ borderTop: "2px dashed #10b981" }} />
              <span className="text-muted-foreground">Meta {weightGoal}kg</span>
            </div>
          </div>
        </Card>
      ) : bodyLogs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border/60">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 mx-auto mb-4">
            <Scale className="h-8 w-8 text-blue-500/40" />
          </div>
          <h3 className="text-sm font-bold mb-1">Sin registros de peso</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">Registra tu peso y cómo te sientes cada día para ver tu progreso</p>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Primer registro
          </Button>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground rounded-2xl border-2 border-dashed border-border/60">
          <p className="text-sm">Registra más datos para ver la gráfica</p>
        </div>
      )}

      {moodCounts.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold">Distribución de ánimo</span>
          </div>
          <div className="space-y-2">
            {moodCounts.slice(0, 5).map((m) => (
              <div key={m.emoji} className="flex items-center gap-3">
                <m.icon className="h-5 w-5 w-8 text-center" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.count}x · {m.pct}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${m.pct}%`, background: m.emoji === "😄" ? "linear-gradient(to right, #34d399, #10b981)" : m.emoji === "💪" ? "linear-gradient(to right, #60a5fa, #3b82f6)" : m.emoji === "🏆" ? "linear-gradient(to right, #fbbf24, #f59e0b)" : m.emoji === "🙂" ? "linear-gradient(to right, #2dd4bf, #14b8a6)" : m.emoji === "😐" ? "linear-gradient(to right, #9ca3af, #6b7280)" : m.emoji === "😕" ? "linear-gradient(to right, #fb923c, #f97316)" : m.emoji === "😢" ? "linear-gradient(to right, #38bdf8, #0ea5e9)" : "linear-gradient(to right, #f87171, #ef4444)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {weekMoods.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-bold">Últimos días</span>
          </div>
          <div className="flex justify-between">
            {weekMoods.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-0">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all",
                  MOODS.find((m) => m.emoji === d.emoji)?.bg || "bg-muted"
                )}>
                  {(() => { const MoodIcon = MOODS.find((m) => m.emoji === d.emoji)?.icon; return MoodIcon ? <MoodIcon className="h-6 w-6" /> : null })()}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{d.date}</span>
                <span className="text-[9px] text-muted-foreground/60">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial</span>
        </div>
        {bodyLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Sin registros en el historial</p>
          </div>
        ) : (
          bodyLogs.slice(0, 12).map((log, i) => {
            const prev = bodyLogs[i + 1]
            const diff = prev ? log.weight - prev.weight : 0
            const moodInfo = MOODS.find((m) => m.emoji === log.mood)
            return (
              <div key={log.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-3.5 group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-lg",
                    diff < 0 ? "bg-emerald-500/10" : diff > 0 ? "bg-red-500/10" : "bg-muted"
                  )}>
                    <Scale className={cn("h-4 w-4", diff < 0 ? "text-emerald-500" : diff > 0 ? "text-red-500" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{log.weight} kg</p>
                      <span className="text-lg">{log.mood}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {diff !== 0 && (
                    <span className={cn("text-[11px] font-semibold", diff < 0 ? "text-emerald-500" : "text-red-500")}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </span>
                  )}
                  <button onClick={() => setDeleteConfirm(log.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[calc(100vw-2rem)] max-w-sm rounded-[20px] bg-background p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Registro del día</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Peso (kg)</label>
              <div className="relative mt-1.5">
                <Input
                  type="number" step="0.1"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  placeholder="78.5"
                  className="rounded-2xl h-14 text-2xl font-bold text-center border-2"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">kg</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">¿Cómo te sientes hoy?</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {MOODS.map((m) => (
                  <button key={m.emoji}
                    onClick={() => setEditMood(m.emoji)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all duration-300",
                      editMood === m.emoji
                        ? `${m.bg} ${m.border} border-2 scale-105 shadow-sm`
                        : "border border-border/50 hover:bg-accent"
                    )}
                  >
                    <span className="text-3xl transition-transform duration-300"
                      style={{ transform: editMood === m.emoji ? "scale(1.2)" : "scale(1)" }}>
                      <m.icon className="h-6 w-6" />
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full rounded-2xl h-12 font-semibold gap-2" onClick={addBodyLog}>
              <Check className="h-4 w-4" /> Guardar registro
            </Button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Configuración</span>
        </div>
        <ExportData />
        <AccentPicker />
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="¿Eliminar registro?"
        message="Este registro de peso y ánimo se eliminará permanentemente."
        onConfirm={() => {
          setBodyLogs(prev => prev.filter(l => l.id !== deleteConfirm))
          setToastMsg("Registro eliminado")
          setTimeout(() => setToastMsg(null), 2000)
          setDeleteConfirm(null)
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
