"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus, Check, X, Trash2, Scale, Calendar, TrendingUp, Activity, Edit3,
  Settings, Download, Palette, RotateCcw, Shield, Database, User,
  Sparkles, Bell, Moon, Sun, Heart, Zap, Gift, Coffee,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer,
} from "recharts"

interface BodyLog { id: string; date: string; weight: number; mood: string }
interface UserProfile {
  name: string
  age: string
  height: string
  location: string
  bio: string
}

const MOODS = [
  { emoji: "😄", label: "Genial", color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { emoji: "💪", label: "Motivado", color: "from-blue-400 to-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { emoji: "🏆", label: "Orgulloso", color: "from-amber-400 to-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { emoji: "🙂", label: "Bien", color: "from-teal-400 to-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  { emoji: "😐", label: "Normal", color: "from-gray-400 to-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30" },
  { emoji: "😕", label: "Desanimado", color: "from-orange-400 to-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { emoji: "😢", label: "Triste", color: "from-sky-400 to-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { emoji: "😤", label: "Frustrado", color: "from-red-400 to-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
]

const ACCENT_COLORS = [
  { name: "Azul", hex: "#3b82f6", hsl: "221 83% 53%" },
  { name: "Violeta", hex: "#8b5cf6", hsl: "262 83% 58%" },
  { name: "Esmeralda", hex: "#10b981", hsl: "160 84% 39%" },
  { name: "Rosa", hex: "#f43f5e", hsl: "350 89% 60%" },
  { name: "Ámbar", hex: "#f59e0b", hsl: "38 92% 50%" },
  { name: "Cian", hex: "#06b6d4", hsl: "189 94% 43%" },
  { name: "Naranja", hex: "#f97316", hsl: "25 95% 53%" },
  { name: "Fucsia", hex: "#ec4899", hsl: "330 81% 60%" },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function MePage() {
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([])
  const [mounted, setMounted] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [weightGoal, setWeightGoal] = useState(70)
  const [accentColor, setAccentColor] = useState("221 83% 53%")
  const [showAccentPicker, setShowAccentPicker] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({ name: "Brayan", age: "", height: "", location: "", bio: "" })
  const [editProfile, setEditProfile] = useState<UserProfile>({ name: "", age: "", height: "", location: "", bio: "" })

  const [editWeight, setEditWeight] = useState("")
  const [editMood, setEditMood] = useState("🙂")

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [])

  function loadData() {
    const bl = localStorage.getItem("lifeos_body_logs"); if (bl) setBodyLogs(JSON.parse(bl))
    const wg = localStorage.getItem("lifeos_weight_goal"); if (wg) setWeightGoal(parseFloat(wg))
    const ac = localStorage.getItem("lifeos_accent"); if (ac) { setAccentColor(ac); applyAccent(ac) }
    const pf = localStorage.getItem("lifeos_profile"); if (pf) setProfile(JSON.parse(pf))
  }

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_body_logs", JSON.stringify(bodyLogs)) }, [bodyLogs, mounted])
  useEffect(() => { if (mounted) localStorage.setItem("lifeos_weight_goal", String(weightGoal)) }, [weightGoal, mounted])
  useEffect(() => { if (mounted) localStorage.setItem("lifeos_profile", JSON.stringify(profile)) }, [profile, mounted])

  function applyAccent(hsl: string) {
    const [h, s, l] = hsl.split(" ")
    document.documentElement.style.setProperty("--primary", `${h} ${s} ${l}`)
    localStorage.setItem("lifeos_accent", hsl)
  }

  function changeAccent(hsl: string) {
    setAccentColor(hsl)
    applyAccent(hsl)
  }

  const today = new Date().toISOString().split("T")[0]

  function addBodyLog() {
    const weight = parseFloat(editWeight); if (!weight) return
    setBodyLogs((prev) => [{
      id: generateId(), date: today, weight, mood: editMood
    }, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    setEditWeight(""); setEditMood("🙂"); setShowAdd(false)
    showToast("Registro guardado")
  }

  function deleteBodyLog(id: string) {
    setBodyLogs((prev) => prev.filter((l) => l.id !== id))
    showToast("Registro eliminado")
    setDeleteConfirm(null)
  }

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2000) }

  function saveProfile() {
    setProfile(editProfile)
    setShowProfileEdit(false)
    showToast("Perfil actualizado")
  }

  function exportAllData() {
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("lifeos_")) data[key] = localStorage.getItem(key) || ""
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `lifeos_backup_${today}.json`; a.click()
    URL.revokeObjectURL(url)
    showToast("Backup descargado")
  }

  function importData() {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json"
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value as string))
          loadData()
          showToast("Datos restaurados")
        } catch { showToast("Error al importar") }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function clearAllData() {
    Object.keys(localStorage).filter((k) => k.startsWith("lifeos_")).forEach((k) => localStorage.removeItem(k))
    loadData(); setBodyLogs([]); setProfile({ name: "", age: "", height: "", location: "", bio: "" })
    showToast("Datos borrados")
  }

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

  const weekMoods = useMemo(() => {
    return bodyLogs.slice(0, 7).map((l) => ({
      date: new Date(l.date).toLocaleDateString("es-ES", { weekday: "short" }),
      emoji: l.mood,
      label: MOODS.find((m) => m.emoji === l.mood)?.label || "",
    })).reverse()
  }, [bodyLogs])

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    bodyLogs.forEach((l) => { counts[l.mood] = (counts[l.mood] || 0) + 1 })
    return MOODS.filter((m) => counts[m.emoji]).map((m) => ({
      ...m, count: counts[m.emoji], pct: Math.round((counts[m.emoji] / bodyLogs.length) * 100),
    })).sort((a, b) => b.count - a.count)
  }, [bodyLogs])

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Yo</h2>
          <p className="text-[13px] text-muted-foreground">Perfil y configuración</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2.5 hover:bg-accent rounded-xl transition-colors">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-background border-primary/10 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white text-2xl font-bold shadow-lg shadow-primary/20">
            {profile.name?.charAt(0) || "B"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold">{profile.name || "Sin nombre"}</h3>
            {profile.bio ? (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.bio}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5 italic">Sin biografía</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
              {profile.age && <span>{profile.age} años</span>}
              {profile.height && <span>· {profile.height} cm</span>}
              {profile.location && <span>· {profile.location}</span>}
            </div>
          </div>
          <button onClick={() => { setEditProfile({ ...profile }); setShowProfileEdit(true) }}
            className="p-2 hover:bg-accent rounded-xl shrink-0">
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="rounded-xl gap-1.5 shadow-sm flex-1" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Registrar peso
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl gap-1.5 flex-1" onClick={() => setShowAccentPicker(true)}>
          <Palette className="h-4 w-4" /> Tema
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Peso actual", value: latest ? `${latest.weight}kg` : "—", sub: "", icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Meta", value: `${weightGoal}kg`, sub: goalDiff === 0 ? "¡Logrado!" : goalDiff > 0 ? `-${goalDiff.toFixed(1)}kg` : `+${Math.abs(goalDiff).toFixed(1)}kg`, icon: Activity, color: goalDiff === 0 ? "text-emerald-500" : goalDiff > 0 ? "text-emerald-500" : "text-red-500", bg: goalDiff === 0 ? "bg-emerald-500/10" : goalDiff > 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
          { label: "Cambio", value: weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg` : "—", sub: weightChange < 0 ? "↓ Bajando" : weightChange > 0 ? "↑ Subiendo" : "Estable", icon: TrendingUp, color: weightChange < 0 ? "text-emerald-500" : weightChange > 0 ? "text-red-500" : "text-slate-400", bg: weightChange < 0 ? "bg-emerald-500/10" : weightChange > 0 ? "bg-red-500/10" : "bg-slate-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center bg-gradient-to-b", s.bg, "border-transparent")}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {sortedLogs.length >= 1 ? (
        <div className="rounded-2xl border bg-[#0a0f1a] dark:bg-[#0a0f1a] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">PESO · <span className="text-emerald-400">{weightGoal}kg meta</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white tabular-nums">{latest?.weight || chartData[0]?.weight}</span>
                  <span className="text-xs text-slate-400">kg</span>
                  {weightChange !== 0 && (
                    <Badge className={cn("text-[10px]", weightChange < 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                      {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">VARIACIÓN</p>
              <p className={cn("text-sm font-bold", weightChange < 0 ? "text-emerald-400" : weightChange > 0 ? "text-red-400" : "text-slate-400")}>
                {weightChange < 0 ? "↓" : weightChange > 0 ? "↑" : "→"} {Math.abs(weightChange).toFixed(1)} kg
              </p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeWidth={0.5} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
                <YAxis domain={[minWeight, maxWeight]} hide />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#tradeGrad)"
                  dot={{ r: 3, fill: "#10b981", stroke: "#0a0f1a", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                />
                <ReferenceLine y={weightGoal} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-slate-400">Peso</span></div>
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-3 bg-amber-500" style={{ borderTop: "1.5px dashed #f59e0b" }} /><span className="text-slate-400">Meta</span></div>
            </div>
            {chartData.length > 1 && (
              <span className="text-slate-500">
                {chartData[0]?.date} → {chartData[chartData.length - 1]?.date}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border/60">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 mx-auto mb-4">
            <Scale className="h-8 w-8 text-blue-500/40" />
          </div>
          <h3 className="text-sm font-bold mb-1">Sin registros de peso</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">Registra tu peso y cómo te sientes cada día</p>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Primer registro
          </Button>
        </div>
      )}

      {weekMoods.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-bold">Estado de ánimo · Última semana</span>
          </div>
          <div className="flex justify-between">
            {weekMoods.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all", MOODS.find((m) => m.emoji === d.emoji)?.bg || "bg-muted")}>
                  {d.emoji}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{d.date}</span>
              </div>
            ))}
          </div>
        </Card>
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
                <span className="text-xl w-8 text-center">{m.emoji}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.count}x · {m.pct}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${m.pct}%`, background: m.emoji === "😄" ? "linear-gradient(to right, #34d399, #10b981)" : m.emoji === "💪" ? "linear-gradient(to right, #60a5fa, #3b82f6)" : m.emoji === "🏆" ? "linear-gradient(to right, #fbbf24, #f59e0b)" : m.emoji === "🙂" ? "linear-gradient(to right, #2dd4bf, #14b8a6)" : m.emoji === "😐" ? "linear-gradient(to right, #9ca3af, #6b7280)" : m.emoji === "😕" ? "linear-gradient(to right, #fb923c, #f97316)" : m.emoji === "😢" ? "linear-gradient(to right, #38bdf8, #0ea5e9)" : "linear-gradient(to right, #f87171, #ef4444)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de peso</span>
        </div>
        {bodyLogs.slice(0, 12).map((log, i) => {
          const prev = bodyLogs[i + 1]; const diff = prev ? log.weight - prev.weight : 0
          return (
            <div key={log.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-3.5 group">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-lg", diff < 0 ? "bg-emerald-500/10" : diff > 0 ? "bg-red-500/10" : "bg-muted")}>
                  <Scale className={cn("h-4 w-4", diff < 0 ? "text-emerald-500" : diff > 0 ? "text-red-500" : "text-muted-foreground")} />
                </div>
                <div>
                  <div className="flex items-center gap-2"><p className="text-sm font-bold">{log.weight} kg</p><span className="text-lg">{log.mood}</span></div>
                  <p className="text-[10px] text-muted-foreground">{new Date(log.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {diff !== 0 && <span className={cn("text-[11px] font-semibold", diff < 0 ? "text-emerald-500" : "text-red-500")}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>}
                <button onClick={() => setDeleteConfirm(log.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Registro del día</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Peso (kg)</label>
              <div className="relative mt-1.5">
                <Input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} placeholder="78.5" className="rounded-2xl h-14 text-2xl font-bold text-center border-2" autoFocus />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">kg</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">¿Cómo te sientes?</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {MOODS.map((m) => (
                  <button key={m.emoji} onClick={() => setEditMood(m.emoji)}
                    className={cn("flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all duration-300", editMood === m.emoji ? `${m.bg} ${m.border} border-2 scale-105 shadow-sm` : "border border-border/50 hover:bg-accent")}>
                    <span className="text-3xl transition-transform duration-300" style={{ transform: editMood === m.emoji ? "scale(1.2)" : "scale(1)" }}>{m.emoji}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full rounded-2xl h-12 font-semibold gap-2" onClick={addBodyLog}><Check className="h-4 w-4" /> Guardar</Button>
          </div>
        </div>
      )}

      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowProfileEdit(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Editar perfil</h3>
              <button onClick={() => setShowProfileEdit(false)} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>
            <Input value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} placeholder="Nombre" className="rounded-xl h-11 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={editProfile.age} onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })} placeholder="Edad" className="rounded-xl h-11 text-sm" />
              <Input value={editProfile.height} onChange={(e) => setEditProfile({ ...editProfile, height: e.target.value })} placeholder="Altura (cm)" className="rounded-xl h-11 text-sm" />
            </div>
            <Input value={editProfile.location} onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })} placeholder="Ubicación" className="rounded-xl h-11 text-sm" />
            <Input value={editProfile.bio} onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })} placeholder="Biografía (una frase)" className="rounded-xl h-11 text-sm" />
            <Button className="w-full rounded-2xl h-12 font-semibold gap-2" onClick={saveProfile}><Check className="h-4 w-4" /> Guardar</Button>
          </div>
        </div>
      )}

      {showAccentPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAccentPicker(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Color de acento</h3>
              <button onClick={() => setShowAccentPicker(false)} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {ACCENT_COLORS.map((c) => (
                <button key={c.name} onClick={() => changeAccent(c.hsl)}
                  className="flex flex-col items-center gap-2 group">
                  <div className={cn("h-14 w-14 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                    accentColor === c.hsl ? "ring-2 ring-offset-2 ring-offset-background ring-white/80 scale-110" : "")}
                    style={{ background: c.hex }} />
                  <span className="text-[9px] font-medium text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Configuración</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-2">
              <button onClick={() => { setShowSettings(false); setShowAccentPicker(true) }}
                className="w-full flex items-center gap-3 rounded-2xl border p-4 hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10"><Palette className="h-5 w-5 text-purple-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">Color de acento</p><p className="text-[10px] text-muted-foreground">Personaliza el color principal</p></div>
              </button>

              <button onClick={() => { setShowSettings(false); setShowProfileEdit(true); setEditProfile({ ...profile }) }}
                className="w-full flex items-center gap-3 rounded-2xl border p-4 hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10"><User className="h-5 w-5 text-blue-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">Editar perfil</p><p className="text-[10px] text-muted-foreground">Nombre, edad, ubicación, bio</p></div>
              </button>

              <button onClick={() => { exportAllData(); setShowSettings(false) }}
                className="w-full flex items-center gap-3 rounded-2xl border p-4 hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10"><Download className="h-5 w-5 text-emerald-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">Exportar datos</p><p className="text-[10px] text-muted-foreground">Descarga un backup JSON</p></div>
              </button>

              <button onClick={() => { importData(); setShowSettings(false) }}
                className="w-full flex items-center gap-3 rounded-2xl border p-4 hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"><RotateCcw className="h-5 w-5 text-amber-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">Importar datos</p><p className="text-[10px] text-muted-foreground">Restaura un backup JSON</p></div>
              </button>

              <button onClick={() => { if (confirm("¿Borrar TODOS los datos? Esta acción no se puede deshacer.")) { clearAllData(); setShowSettings(false) } }}
                className="w-full flex items-center gap-3 rounded-2xl border border-red-500/20 p-4 hover:bg-red-500/5 transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><Trash2 className="h-5 w-5 text-red-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-red-500">Borrar todos los datos</p><p className="text-[10px] text-muted-foreground">Reinicia la app completamente</p></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteConfirm} title="¿Eliminar registro?" message="Este registro se eliminará permanentemente."
        onConfirm={() => deleteConfirm && deleteBodyLog(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
