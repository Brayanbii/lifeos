"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Sun,
  Moon,
  Dumbbell,
  BookOpen,
  Coffee,
  Briefcase,
  Bike,
  Sparkles,
  Timer,
  Check,
  Clock,
  Brain,
  Heart,
  Shirt,
  ChefHat,
  Shield,
  ScrollText,
  X,
} from "lucide-react"

interface Block {
  id: string
  phase: number
  title: string
  time: string
  startHour: number
  startMin: number
  endHour: number
  endMin: number
  duration: string
  description: string
  icon: string
  tips: string[]
  category: "morning" | "work" | "gym" | "evening"
}

const PRINCIPLES = [
  { icon: Clock, title: "Regla del Minuto Exacto", desc: "Un horario no es una sugerencia, es un contrato de sangre." },
  { icon: Shirt, title: "Cero Fricción Matutina", desc: "Las decisiones consumen energía. Preparas todo la noche anterior." },
  { icon: Brain, title: "Renovación Intelectual", desc: "Un caballero no solo viste bien; tiene verbo afilado y mente profunda." },
]

const BLOCKS: Block[] = [
  {
    id: "shower", phase: 1, title: "El Choque de Realidad", time: "06:00 - 06:10",
    startHour: 6, startMin: 0, endHour: 6, endMin: 10, duration: "10 min",
    description: "Ducha fría/templada. Jabón, shampoo, lavado de rostro y cepillado.",
    icon: "🚿", tips: ["Agua fría activa la circulación", "No hay tiempo para pensar, solo ejecutar"],
    category: "morning"
  },
  {
    id: "dress", phase: 1, title: "La Armadura del Caballero", time: "06:10 - 06:18",
    startHour: 6, startMin: 10, endHour: 6, endMin: 18, duration: "8 min",
    description: "Vestir ropa preparada la noche anterior. Traje, zapatos, perfume.",
    icon: "👔", tips: ["Ropa lista desde anoche", "Te vistes para el éxito, no para la comodidad"],
    category: "morning"
  },
  {
    id: "skincare-am", phase: 1, title: "Blindaje y Skincare AM", time: "06:18 - 06:25",
    startHour: 6, startMin: 18, endHour: 6, endMin: 25, duration: "7 min",
    description: "Crema hidratante, protector solar, peinado impecable.",
    icon: "🧴", tips: ["Protector solar obligatorio para la moto", "Peinado impecable"],
    category: "morning"
  },
  {
    id: "breakfast", phase: 2, title: "Combustible de Campeones", time: "06:25 - 06:55",
    startHour: 6, startMin: 25, endHour: 6, endMin: 55, duration: "30 min",
    description: "Desayuno con proteína y carbohidratos reales. Mente presente, cero celular.",
    icon: "🍳", tips: ["Proteína + carbohidratos", "Sin celular durante la comida"],
    category: "morning"
  },
  {
    id: "inspect", phase: 2, title: "Inspección Final", time: "06:55 - 07:10",
    startHour: 6, startMin: 55, endHour: 7, endMin: 10, duration: "15 min",
    description: "Guardar almuerzo, equipo de moto, mente en modo laboral.",
    icon: "🏍️", tips: ["Almuerzo en la maleta", "Chaqueta, guantes, casco"],
    category: "morning"
  },
  {
    id: "commute-am", phase: 2, title: "Ruta y Posicionamiento", time: "07:10 - 07:30",
    startHour: 7, startMin: 10, endHour: 7, endMin: 30, duration: "20 min",
    description: "Viaje en moto. 07:30 exactas en el parqueadero. 30 min de margen.",
    icon: "🏍️", tips: ["Concentración total en la vía", "Llegar 30 min antes para prepararte"],
    category: "morning"
  },
  {
    id: "work", phase: 3, title: "El Practicante Rey", time: "08:00 - 17:30",
    startHour: 8, startMin: 0, endHour: 17, endMin: 30, duration: "9h 30min",
    description: "Jornada SENA. 100% enfoque. Hablar claro, mirar a los ojos, absorber conocimiento.",
    icon: "💼", tips: ["Primero en ofrecer soluciones", "Último en quejarse", "Mirar a los ojos al hablar"],
    category: "work"
  },
  {
    id: "commute-pm", phase: 4, title: "Retorno Estratégico", time: "17:30 - 18:00",
    startHour: 17, startMin: 30, endHour: 18, endMin: 0, duration: "30 min",
    description: "Viaje en moto a casa. Dejar atrás el estrés laboral.",
    icon: "🏍️", tips: ["Transición mental del trabajo a casa"],
    category: "gym"
  },
  {
    id: "pre-gym", phase: 4, title: "Recarga y Cambio", time: "18:00 - 18:20",
    startHour: 18, startMin: 0, endHour: 18, endMin: 20, duration: "20 min",
    description: "Guardar coca del almuerzo de mañana, snack pre-entreno (banano/café), ropa de gym.",
    icon: "🍌", tips: ["Banano o café para energía", "Preparar almuerzo de mañana ya"],
    category: "gym"
  },
  {
    id: "gym-transit", phase: 4, title: "Traslado al Templo", time: "18:20 - 18:30",
    startHour: 18, startMin: 20, endHour: 18, endMin: 30, duration: "10 min",
    description: "Camino al gimnasio.",
    icon: "🚶", tips: ["Enfoque mental en el entrenamiento"],
    category: "gym"
  },
  {
    id: "gym", phase: 4, title: "El Templo del Dolor", time: "18:30 - 19:50",
    startHour: 18, startMin: 30, endHour: 19, endMin: 50, duration: "1h 20min",
    description: "Entrenamiento brutal. Pesado, sin celular, sin charlas. Disciplina a través de la resistencia.",
    icon: "🏋️", tips: ["Sin celular en el gym", "Sin charlas de pasillo", "Levantar pesado, sudar, sufrir"],
    category: "gym"
  },
  {
    id: "gym-return", phase: 4, title: "Retirada del Guerrero", time: "19:50 - 20:00",
    startHour: 19, startMin: 50, endHour: 20, endMin: 0, duration: "10 min",
    description: "Regreso a casa con el deber cumplido.",
    icon: "🏠", tips: ["Satisfacción del trabajo hecho"],
    category: "gym"
  },
  {
    id: "dinner", phase: 5, title: "La Cena del Guerrero", time: "20:00 - 20:25",
    startHour: 20, startMin: 0, endHour: 20, endMin: 25, duration: "25 min",
    description: "Alimentación limpia para recuperar músculos.",
    icon: "🥩", tips: ["Proteína magra + vegetales", "Recuperación muscular"],
    category: "evening"
  },
  {
    id: "bible", phase: 5, title: "Conexión con el Creador", time: "20:25 - 20:45",
    startHour: 20, startMin: 25, endHour: 20, endMin: 45, duration: "20 min",
    description: "Biblia, lectura, meditación y oración. Ancla de paz mental.",
    icon: "📖", tips: ["Silencio total", "Agradecer el día", "Pedir fortaleza"],
    category: "evening"
  },
  {
    id: "youtube", phase: 6, title: "Desconexión Audiovisual", time: "20:45 - 21:15",
    startHour: 20, startMin: 45, endHour: 21, endMin: 15, duration: "30 min",
    description: "Un solo video largo en YouTube. Documental de historia, geopolítica o ciencia.",
    icon: "🎬", tips: ["Un solo video, no shorts", "Historia, ciencia o geopolítica", "Al terminar, bloquear pantalla"],
    category: "evening"
  },
  {
    id: "reading", phase: 6, title: "Bloque de Lectura de Hierro", time: "21:15 - 22:15",
    startHour: 21, startMin: 15, endHour: 22, endMin: 15, duration: "60 min",
    description: "Lectura profunda. Celular en otro cuarto. Desarrollo personal, WWII, geología, ficción steampunk.",
    icon: "📚", tips: ["Celular en otro cuarto", "Desarrollo personal", "WWII, Cámbrico, steampunk", "Un caballero se define por lo que lee"],
    category: "evening"
  },
  {
    id: "prep-night", phase: 7, title: "Alistamiento Estratégico", time: "22:15 - 22:20",
    startHour: 22, startMin: 15, endHour: 22, endMin: 20, duration: "5 min",
    description: "Dejar lista la ropa del día siguiente. Pantalón, camisa, medias, zapatos impecables.",
    icon: "👔", tips: ["Ropa lista garantiza los 8 min de la mañana"],
    category: "evening"
  },
  {
    id: "skincare-pm", phase: 7, title: "Skincare Nocturno y Cierre", time: "22:20 - 22:30",
    startHour: 22, startMin: 20, endHour: 22, endMin: 30, duration: "10 min",
    description: "Lavar rostro, crema nocturna, cepillado de dientes.",
    icon: "🌙", tips: ["Quitar polución del día", "Crema nocturna", "Cepillado final"],
    category: "evening"
  },
  {
    id: "sleep", phase: 7, title: "Desconexión Total", time: "22:30",
    startHour: 22, startMin: 30, endHour: 6, endMin: 0, duration: "7.5 horas",
    description: "Luces apagadas. Sueño profundo para reiniciar el sistema.",
    icon: "😴", tips: ["7.5 horas de sueño reparador"],
    category: "evening"
  },
]

const PHASE_TITLES: Record<number, string> = {
  1: "FASE 1: Despliegue Matutino (06:00 - 07:30)",
  2: "FASE 1: Combustible y Despegue (06:25 - 07:30)",
  3: "FASE 1: El Practicante Rey (08:00 - 17:30)",
  4: "FASE 2: La Fragua del Cuerpo (17:30 - 20:00)",
  5: "FASE 3: Nutrición y Espíritu (20:00 - 20:45)",
  6: "FASE 3: Cultura e Intelecto (20:45 - 22:15)",
  7: "FASE 3: Preparación y Apagado (22:15 - 22:30)",
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  morning: { label: "Mañana", color: "text-amber-500", bg: "bg-amber-500/10", icon: Sun },
  work: { label: "Trabajo", color: "text-blue-500", bg: "bg-blue-500/10", icon: Briefcase },
  gym: { label: "Gym", color: "text-red-500", bg: "bg-red-500/10", icon: Dumbbell },
  evening: { label: "Noche", color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Moon },
}

function getNow(): { h: number; m: number } {
  const d = new Date()
  return { h: d.getHours(), m: d.getMinutes() }
}

function isBlockActive(block: Block, now: { h: number; m: number }): boolean {
  const start = block.startHour * 60 + block.startMin
  const end = block.endHour * 60 + block.endMin
  const current = now.h * 60 + now.m
  if (end < start) return current >= start || current < end
  return current >= start && current < end
}

function isBlockPast(block: Block, now: { h: number; m: number }): boolean {
  const end = block.endHour * 60 + block.endMin
  const current = now.h * 60 + now.m
  if (end < block.startHour * 60 + block.startMin) return current >= end && current < 24 * 60
  return current >= end
}

function getBlockProgress(block: Block, now: { h: number; m: number }): number {
  if (!isBlockActive(block, now)) return isBlockPast(block, now) ? 100 : 0
  const start = block.startHour * 60 + block.startMin
  let end = block.endHour * 60 + block.endMin
  if (end < start) end += 24 * 60
  const current = now.h * 60 + now.m
  const adjustedCurrent = current < start ? current + 24 * 60 : current
  return Math.min(100, Math.round(((adjustedCurrent - start) / (end - start)) * 100))
}

export default function OperacionPage() {
  const [now, setNow] = useState(getNow())
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [showPrinciples, setShowPrinciples] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("lifeos_operacion_done")
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toISOString().split("T")[0]
      if (data.date === today) setCompleted(data.blocks || {})
    }
    const interval = setInterval(() => setNow(getNow()), 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lifeos_operacion_done", JSON.stringify({ date: today, blocks: completed }))
  }, [completed, mounted])

  function toggleBlock(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = BLOCKS.filter((b) => completed[b.id]).length
  const totalBlocks = BLOCKS.filter((b) => b.category !== "work").length
  const progress = Math.round((completedCount / (totalBlocks || 1)) * 100)

  const currentBlock = BLOCKS.find((b) => isBlockActive(b, now))

  const grouped = useMemo(() => {
    const groups: Record<number, Block[]> = {}
    BLOCKS.forEach((b) => {
      if (!groups[b.phase]) groups[b.phase] = []
      groups[b.phase].push(b)
    })
    return Object.entries(groups).map(([phase, blocks]) => ({
      phase: parseInt(phase),
      title: PHASE_TITLES[parseInt(phase)] || "",
      blocks,
    }))
  }, [])

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Operación</h2>
          <p className="text-[13px] text-muted-foreground">Brayan 2.0 · Disciplina Inquebrantable</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setShowPrinciples(!showPrinciples)}>
          <ScrollText className="h-4 w-4" />
          Principios
        </Button>
      </div>

      {showPrinciples && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {currentBlock && (
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-5 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Ahora</span>
            </div>
            <Badge variant="outline" className="text-[10px]">{currentBlock.time}</Badge>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
              {currentBlock.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold">{currentBlock.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentBlock.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentBlock.tips.map((tip) => (
                  <span key={tip} className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{tip}</span>
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Progreso del bloque</span>
                  <span>{getBlockProgress(currentBlock, now)}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-[2000ms] ease-linear"
                    style={{ width: `${getBlockProgress(currentBlock, now)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent border-primary/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Progreso del día</span>
          <span className="text-sm font-bold">{progress}%</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{completedCount} de {totalBlocks} bloques completados</p>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.phase} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{group.title}</span>
            </div>

            {group.blocks.map((block) => {
              const active = isBlockActive(block, now)
              const past = isBlockPast(block, now)
              const done = completed[block.id]
              const isWork = block.category === "work"
              const cat = CATEGORY_LABELS[block.category]

              return (
                <button
                  key={block.id}
                  onClick={() => !isWork && toggleBlock(block.id)}
                  disabled={isWork}
                  className={cn(
                    "relative w-full rounded-2xl border p-4 text-left transition-all duration-300",
                    isWork && "cursor-default",
                    active && !done ? "border-primary/40 bg-primary/5 shadow-md shadow-primary/5" :
                    done ? "border-emerald-500/30 bg-emerald-500/5" :
                    past && !done ? "border-red-500/20 bg-red-500/5" :
                    "border-border/50 bg-card hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-all",
                      done ? "bg-emerald-500 text-white shadow-sm" :
                      active ? "bg-primary text-white shadow-sm" :
                      past && !done ? "bg-red-500/10" :
                      "bg-muted"
                    )}>
                      {done ? <Check className="h-5 w-5" /> : block.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-semibold",
                          done && "text-emerald-600 line-through",
                          past && !done && "text-red-600"
                        )}>
                          {block.title}
                        </p>
                        {active && !done && (
                          <div className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{block.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground">{block.time}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{block.duration}</span>
                        {!isWork && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className={cn(
                              "text-[10px] font-semibold",
                              done ? "text-emerald-500" : past && !done ? "text-red-500" : "text-muted-foreground"
                            )}>
                              {done ? "Completado" : past && !done ? "Pendiente" : "Pendiente"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      done ? "bg-emerald-500 border-emerald-500" :
                      active ? "border-primary" :
                      "border-muted-foreground/20"
                    )}>
                      {done && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>

                  {active && !done && (
                    <div className="mt-3">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-[2000ms] ease-linear"
                          style={{ width: `${getBlockProgress(block, now)}%` }} />
                      </div>
                    </div>
                  )}

                  {!isWork && block.tips.length > 0 && done && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/30">
                      {block.tips.map((tip) => (
                        <span key={tip} className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-medium">{tip}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
