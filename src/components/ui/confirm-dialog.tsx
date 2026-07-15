"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}>
      <div className="w-full max-w-xs rounded-[20px] bg-background p-6 space-y-4 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mx-auto">
          <Trash2 className="h-7 w-7 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 gap-1.5" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
