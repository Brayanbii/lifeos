"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileDown, Database } from "lucide-react"

const STORAGE_KEYS = [
  { key: "lifeos_daily", label: "Hábitos diarios" },
  { key: "lifeos_history", label: "Historial de hábitos" },
  { key: "lifeos_transactions", label: "Transacciones financieras" },
  { key: "lifeos_tasks", label: "Tareas" },
  { key: "lifeos_goals", label: "Objetivos" },
  { key: "lifeos_workout_log", label: "Registro de entrenamiento" },
  { key: "lifeos_body_logs", label: "Registro corporal" },
  { key: "lifeos_weight_goal", label: "Meta de peso" },
  { key: "lifeos_routines", label: "Rutinas de gym" },
  { key: "lifeos_credit", label: "Gastos de crédito" },
  { key: "lifeos_onboarded", label: "Estado de onboarding" },
]

function getValueForCsv(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Si" : "No"
  if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""')
  return String(value).replace(/"/g, '""')
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = getValueForCsv(value)
    }
  }
  return result
}

function generateCsv(): string {
  const sections: string[] = []

  for (const { key, label } of STORAGE_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) continue

    sections.push(`# ${label}`)

    try {
      const data = JSON.parse(raw)

      if (Array.isArray(data)) {
        if (data.length === 0) {
          sections.push("(sin datos)")
          sections.push("")
          continue
        }

        const allKeys = new Set<string>()
        const flatRows: Record<string, string>[] = []

        for (const item of data) {
          if (typeof item === "object" && item !== null) {
            const flat = flattenObject(item as Record<string, unknown>)
            Object.keys(flat).forEach((k) => allKeys.add(k))
            flatRows.push(flat)
          } else {
            flatRows.push({ valor: getValueForCsv(item) })
            allKeys.add("valor")
          }
        }

        const headers = Array.from(allKeys)
        sections.push(headers.map((h) => `"${h}"`).join(","))

        for (const row of flatRows) {
          sections.push(headers.map((h) => `"${row[h] ?? ""}"`).join(","))
        }
      } else if (typeof data === "object" && data !== null) {
        const flat = flattenObject(data)
        const headers = Object.keys(flat)
        sections.push(headers.map((h) => `"${h}"`).join(","))
        sections.push(headers.map((h) => `"${flat[h]}"`).join(","))
      } else {
        sections.push(`"Valor","${getValueForCsv(data)}"`)
      }
    } catch {
      sections.push(`"Valor","${raw.replace(/"/g, '""')}"`)
    }

    sections.push("")
  }

  return sections.join("\n")
}

export function ExportData() {
  const [open, setOpen] = useState(false)

  const handleExport = () => {
    const csv = generateCsv()
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lifeos_data_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base font-medium">
          <Download className="h-5 w-5 text-primary" />
          Exportar todos los datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 rounded-t-[2rem]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Exportar datos
          </DialogTitle>
          <DialogDescription className="text-sm pt-1.5">
            Descarga todos tus datos de LifeOS en un archivo CSV organizado por secciones.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Formato CSV</p>
                <p className="text-xs text-muted-foreground">Compatible con Excel, Google Sheets y más</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Secciones incluidas:</p>
              <div className="grid grid-cols-2 gap-1">
                {STORAGE_KEYS.map(({ label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="w-full"
            size="default"
          >
            <Download className="h-5 w-5" />
            Exportar todos los datos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
