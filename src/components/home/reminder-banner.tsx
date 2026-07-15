"use client"

import { Bell } from "lucide-react"

const reminders = [
  "No olvides tomar agua 💧",
  "¿Ya hiciste tu skincare? 🧴",
  "Recuerda tu creatina ⚡",
  "Hora de leer 📖",
  "¡Mantén la disciplina! 🧘",
]

export function ReminderBanner() {
  const idx = new Date().getDate() % reminders.length

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 border-amber-500/15 p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <Bell className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Recordatorio</p>
          <p className="text-sm font-semibold truncate">{reminders[idx]}</p>
        </div>
      </div>
    </div>
  )
}
