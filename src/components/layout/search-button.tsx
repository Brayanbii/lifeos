"use client"

import { Search } from "lucide-react"

export function SearchButton() {
  return (
    <button
      onClick={() => {}}
      className="flex items-center gap-1.5 rounded-full bg-muted/50 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors min-h-[36px]"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Buscar...</span>
    </button>
  )
}
