"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dumbbell,
  Flame,
  Brain,
  Droplets,
  Footprints,
  Zap,
  Timer,
  Ban,
  AlertTriangle,
  Apple,
  Egg,
  Beef,
  ChevronRight,
  TrendingDown,
  Target,
  Music,
  BookOpen,
  X,
} from "lucide-react"

const MACROS = [
  { label: "Proteína", grams: 170, kcal: 680, pct: 34, color: "from-red-500 to-rose-500", icon: Beef, desc: "Prioridad absoluta. Construcción muscular.", foods: "Pollo, carne magra, huevos" },
  { label: "Carbohidratos", grams: 180, kcal: 720, pct: 36, color: "from-amber-500 to-orange-500", icon: Apple, desc: "Gasolina para entrenar pesado.", foods: "Arroz, papa, avena. Cero refinados" },
  { label: "Grasas", grams: 60, kcal: 540, pct: 27, color: "from-yellow-500 to-amber-500", icon: Egg, desc: "Vitales para testosterona y hormonas.", foods: "Aguacate, huevos, aceite de oliva" },
]

const WEEK_SCHEDULE = [
  { day: "Lunes", focus: "EMPUJE", muscles: "Pecho, Hombros, Tríceps", cardio: "25 min Caminadora Inclinada" },
  { day: "Martes", focus: "TRACCIÓN", muscles: "Espalda, Bíceps, Deltoides Posterior", cardio: "25 min Caminadora Inclinada" },
  { day: "Miércoles", focus: "PIERNA", muscles: "Cuádriceps, Femorales, Pantorrillas", cardio: "25 min Caminadora Inclinada" },
  { day: "Jueves", focus: "EMPUJE", muscles: "Pecho, Hombros, Tríceps", cardio: "25 min Caminadora Inclinada" },
  { day: "Viernes", focus: "TRACCIÓN", muscles: "Espalda, Bíceps, Deltoides Posterior", cardio: "25 min Caminadora Inclinada" },
  { day: "Sábado", focus: "PIERNA", muscles: "Cuádriceps, Femorales, Pantorrillas", cardio: "25 min Caminadora Inclinada" },
  { day: "Domingo", focus: "DESCANSO", muscles: "Estiramientos, Caminata", cardio: "Recuperación Muscular Total", isRest: true },
]

const GOLDEN_RULES = [
  { icon: Timer, title: "Regla del Cronómetro", desc: "Descansos estrictos de 60-90s entre series. Si descansas 3 min, pierdes intensidad." },
  { icon: Ban, title: "Modo Avión", desc: "Prohibido responder mensajes o redes. Solo música y medir tiempos." },
  { icon: TrendingDown, title: "Sobrecarga Progresiva", desc: "Cada semana: +1 repetición o +peso. El cuerpo debe sufrir más." },
]

const CARDIO_TIPS = [
  { label: "Inclinación", value: "10% - 12%" },
  { label: "Velocidad", value: "4.5 - 5.0 km/h" },
  { label: "Duración", value: "25 minutos" },
  { label: "Prohibido", value: "Sostenerse de pasamanos" },
]

interface RecomposicionPageProps {
  onClose?: () => void
}

export default function RecomposicionPage({ onClose }: RecomposicionPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>("goal")

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Recomposición</h2>
          <p className="text-[13px] text-muted-foreground">Fase 2 · 6 Meses · Disciplina de Acero</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-red-500/10 via-red-500/5 to-background border-red-500/20 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-2xl">🧬</div>
          <div>
            <h3 className="text-sm font-bold">La verdad sobre "tonificar"</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              La tonificación <strong>no existe</strong> como proceso biológico. Es el resultado de tener 
              <strong> grasa corporal baja + masa muscular suficiente</strong>. 
              Si solo bajas de peso sin músculo, quedas flácido. 
              En 6 meses: perder <strong>15-18 kg de grasa</strong> manteniendo músculo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Peso objetivo", value: "74-77 kg", sub: "Recomposición", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Grasa objetivo", value: "12-15%", sub: "Corporal", icon: TrendingDown, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Calorías día", value: "2000 kcal", sub: "Déficit -800", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Agua diaria", value: "3.8L", sub: "Hidratación", icon: Droplets, color: "text-sky-500", bg: "bg-sky-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3.5 text-center bg-gradient-to-b", s.bg, "border-transparent")}>
              <Icon className={cn("h-5 w-5 mx-auto mb-1.5", s.color)} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="h-1 w-1 rounded-full bg-red-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Macronutrientes · 2000 kcal</span>
        </div>
        <div className="space-y-2">
          {MACROS.map((m) => {
            const Icon = m.icon
            const barPct = m.pct
            return (
              <div key={m.label} className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", m.color, "text-white")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{m.grams}g</p>
                    <p className="text-[10px] text-muted-foreground">{m.kcal} kcal</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{m.pct}% del total</span>
                    <span>{m.foods}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", m.color, "transition-all duration-700")}
                      style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-sky-500/10 to-sky-500/5 border-sky-500/20 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
            <Droplets className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Hidratación de Guerrero</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-sky-500 text-lg">3.8 Litros</strong> de agua al día. Repartidos desde la mañana hasta tu entrenamiento.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="h-1 w-1 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estrategia de Cardio</span>
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-lg">🔥</div>
            <div>
              <p className="text-sm font-bold">La Ciencia del Cardio Post-Pesas</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Al hacer pesas primero, agotas el glucógeno. En la caminadora, 
                tu cuerpo usa <strong>grasa corporal como combustible desde el minuto uno</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CARDIO_TIPS.map((t) => (
              <div key={t.label} className="rounded-xl bg-emerald-500/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{t.label}</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">{t.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-background/50 p-3 flex items-start gap-2">
            <Music className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-purple-500">Blindaje Mental:</strong> Sin celular. 
              Banda sonora de Yellowstone, rock 80s/90s, o audiolibro WWII para cultivar la mente mientras el cuerpo sufre.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3">
            <Footprints className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-amber-500">Meta base:</strong> 10,000 pasos diarios forzando movimiento espontáneo (NEAT).
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="h-1 w-1 rounded-full bg-purple-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horario Semanal PPL</span>
        </div>
        <div className="space-y-1.5">
          {WEEK_SCHEDULE.map((day) => (
            <div key={day.day}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5",
                day.isRest ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border/50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                day.isRest ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
              )}>
                {day.day.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {day.focus}
                  {day.isRest && " ACTIVO"}
                </p>
                <p className="text-[10px] text-muted-foreground">{day.muscles}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant={day.isRest ? "secondary" : "outline"} className="text-[9px]">
                  {day.cardio}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="h-1 w-1 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reglas de Oro en el Templo</span>
        </div>
        <div className="space-y-2">
          {GOLDEN_RULES.map((rule, i) => {
            const Icon = rule.icon
            return (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">{rule.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rule.desc}</p>
                </div>
                <span className="text-lg font-bold text-amber-500/20">{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl">🛡️</div>
          <div>
            <h3 className="text-sm font-bold">El Fin de Semana</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <strong className="text-red-500">Donde mueren los cobardes.</strong> De nada sirve ser un soldado 
              de lunes a viernes si el sábado destruyes tu déficit. Se mantienen horarios de comida y control de porciones.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3">
          <Ban className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-600">CERO alcohol en estos 6 meses. Frena la quema de grasa y destruye tu testosterona.</p>
        </div>
      </div>
    </div>
  )
}
