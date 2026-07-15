"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const SHORTCUTS: Record<string, string> = {
  "1": "/home",
  "2": "/habits",
  "3": "/gym",
  "4": "/finances",
  "5": "/tasks",
  "6": "/goals",
  "7": "/me",
  "8": "/stats",
}

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey && !e.metaKey) return

      if (e.key === "k" || e.key === "K") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("open-global-search"))
        return
      }

      const path = SHORTCUTS[e.key]
      if (path) {
        e.preventDefault()
        router.push(path)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])
}
