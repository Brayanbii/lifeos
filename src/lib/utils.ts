import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function getWeekDays(locale: string = "es-ES"): string[] {
  const base = new Date(Date.UTC(2024, 0, 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    return d.toLocaleDateString(locale, { weekday: "short" })
  })
}

export function getCurrentWeekDays(): { day: string; date: string }[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const days: { day: string; date: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + mondayOffset + i)
    days.push({
      day: d.toLocaleDateString("es-ES", { weekday: "short" }),
      date: d.toISOString().split("T")[0],
    })
  }
  return days
}

export function getMonthName(month: number): string {
  return new Date(2024, month, 1).toLocaleDateString("es-ES", { month: "long" })
}

export function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  return formatDate(dateStr)
}
