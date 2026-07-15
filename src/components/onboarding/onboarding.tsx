"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Check,
  Target,
  Sparkles,
  Dumbbell,
  Brain,
  Wallet,
} from "lucide-react"

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenido a LifeOS",
    subtitle: "Tu sistema operativo personal. Todo en un solo lugar.",
    emoji: "🚀",
    color: "from-primary to-blue-500",
  },
  {
    icon: Target,
    title: "Define tus hábitos",
    subtitle: "Registra skincare, agua, lectura y más con un solo toque desde el Home.",
    emoji: "✅",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Dumbbell,
    title: "Entrena con inteligencia",
    subtitle: "Rutinas Push/Pull/Legs automáticas según el día. Sobrecarga progresiva incluida.",
    emoji: "🏋️",
    color: "from-blue-400 to-indigo-600",
  },
  {
    icon: Wallet,
    title: "Controla tus finanzas",
    subtitle: "Registra ingresos y gastos al instante. Ciclo mensual desde el día 27.",
    emoji: "💰",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: Brain,
    title: "Todo listo",
    subtitle: "Tus datos se guardan en tu dispositivo. Sin cuentas, sin registros. Solo vos.",
    emoji: "🎯",
    color: "from-amber-400 to-amber-600",
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  function next() {
    if (isLast) {
      localStorage.setItem("lifeos_onboarded", "true")
      onComplete()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className={cn(
          "flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl mb-8",
          current.color
        )}>
          <span className="text-5xl">{current.emoji}</span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-3">{current.title}</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{current.subtitle}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-primary" : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!isLast && (
            <Button variant="ghost" className="flex-1 rounded-2xl h-12"
              onClick={() => { localStorage.setItem("lifeos_onboarded", "true"); onComplete() }}>
              Omitir
            </Button>
          )}
          <Button className={cn("rounded-2xl h-12 gap-2 font-semibold", isLast ? "w-full" : "flex-1")}
            onClick={next}>
            {isLast ? (
              <>Empezar <Check className="h-4 w-4" /></>
            ) : (
              <>Siguiente <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
