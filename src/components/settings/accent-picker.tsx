"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface AccentColor {
  name: string
  hex: string
  hsl: string
}

function hexToHsl(hex: string): string {
  let r = 0
  let g = 0
  let b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16)
    g = parseInt(hex.substring(3, 5), 16)
    b = parseInt(hex.substring(5, 7), 16)
  }

  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  const hue = Math.round(h * 360)
  const sat = Math.round(s * 100)
  const light = Math.round(l * 100)

  return `${hue} ${sat}% ${light}%`
}

const ACCENT_COLORS: AccentColor[] = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#06b6d4",
  "#f97316",
  "#ec4899",
].map((hex) => ({
  name: hex,
  hex,
  hsl: hexToHsl(hex),
}))

const STORAGE_KEY = "lifeos_accent"

export function AccentPicker() {
  const [selected, setSelected] = useState(ACCENT_COLORS[0].hex)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const valid = ACCENT_COLORS.find((c) => c.hex === saved)
      if (valid) setSelected(valid.hex)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const color = ACCENT_COLORS.find((c) => c.hex === selected)
    if (color) {
      document.documentElement.style.setProperty("--primary", color.hsl)
    }
  }, [selected, mounted])

  const handleSelect = (hex: string) => {
    setSelected(hex)
    localStorage.setItem(STORAGE_KEY, hex)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {ACCENT_COLORS.map((color) => {
        const isSelected = selected === color.hex
        return (
          <button
            key={color.hex}
            onClick={() => handleSelect(color.hex)}
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg shadow-primary/25"
                : "hover:scale-105 hover:shadow-md"
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={`Color de acento ${color.name}`}
          >
            {isSelected && (
              <Check
                className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                strokeWidth={3}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
