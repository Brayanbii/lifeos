"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Check,
  X,
  Trash2,
  BookOpen,
  Bookmark,
  Clock,
  TrendingUp,
  Star,
  Target,
  Edit3,
  Calendar,
  Library,
  ChevronRight,
  Coffee,
  Moon,
} from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: "reading" | "finished" | "paused" | "want"
  genre: string
  startedAt: string
  finishedAt?: string
  rating?: number
  notes?: string
}

const GENRES = [
  "Desarrollo Personal", "Historia", "Ficción", "Ciencia Ficción",
  "Geopolítica", "Filosofía", "Novela", "Ciencia", "Biografía",
  "Estrategia Militar", "Steampunk", "Fantasía", "Otro"
]

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  reading: { label: "Leyendo", color: "text-blue-500", bg: "bg-blue-500/10" },
  finished: { label: "Terminado", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  paused: { label: "Pausado", color: "text-amber-500", bg: "bg-amber-500/10" },
  want: { label: "Por leer", color: "text-purple-500", bg: "bg-purple-500/10" },
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function BibliotecaPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState("")
  const [editAuthor, setEditAuthor] = useState("")
  const [editTotalPages, setEditTotalPages] = useState("")
  const [editCurrentPage, setEditCurrentPage] = useState("0")
  const [editStatus, setEditStatus] = useState<Book["status"]>("reading")
  const [editGenre, setEditGenre] = useState("Desarrollo Personal")
  const [editNotes, setEditNotes] = useState("")
  const [editRating, setEditRating] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_books")
    if (saved) setBooks(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_books", JSON.stringify(books)) }, [books, mounted])

  const today = new Date().toISOString().split("T")[0]

  function addBook() {
    if (!editTitle.trim()) return
    const book: Book = {
      id: generateId(),
      title: editTitle.trim(),
      author: editAuthor.trim(),
      totalPages: parseInt(editTotalPages) || 0,
      currentPage: parseInt(editCurrentPage) || 0,
      status: editStatus,
      genre: editGenre,
      startedAt: today,
      notes: editNotes || undefined,
      rating: editRating || undefined,
    }
    setBooks((prev) => [book, ...prev])
    resetForm()
  }

  function updateBook() {
    if (!editingId || !editTitle.trim()) return
    setBooks((prev) => prev.map((b) =>
      b.id === editingId ? {
        ...b,
        title: editTitle.trim(),
        author: editAuthor.trim(),
        totalPages: parseInt(editTotalPages) || 0,
        currentPage: parseInt(editCurrentPage) || 0,
        status: editStatus,
        genre: editGenre,
        notes: editNotes || undefined,
        rating: editRating || undefined,
        ...(editStatus === "finished" && b.status !== "finished" ? { finishedAt: today } : {}),
      } : b
    ))
    resetForm()
  }

  function resetForm() {
    setEditTitle("")
    setEditAuthor("")
    setEditTotalPages("")
    setEditCurrentPage("0")
    setEditStatus("reading")
    setEditGenre("Desarrollo Personal")
    setEditNotes("")
    setEditRating(0)
    setShowAdd(false)
    setEditingId(null)
  }

  function editBook(book: Book) {
    setEditingId(book.id)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setEditTotalPages(String(book.totalPages))
    setEditCurrentPage(String(book.currentPage))
    setEditStatus(book.status)
    setEditGenre(book.genre)
    setEditNotes(book.notes || "")
    setEditRating(book.rating || 0)
    setShowAdd(true)
  }

  function deleteBook(id: string) { setBooks((prev) => prev.filter((b) => b.id !== id)) }

  function updatePage(bookId: string, page: number) {
    setBooks((prev) => prev.map((b) => {
      if (b.id !== bookId) return b
      const newPage = Math.max(0, Math.min(page, b.totalPages || 9999))
      const newStatus: Book["status"] = b.status === "want" ? "reading" : b.status
      return { ...b, currentPage: newPage, status: newStatus }
    }))
  }

  function quickUpdatePages(bookId: string, addPages: number) {
    setBooks((prev) => prev.map((b) => {
      if (b.id !== bookId) return b
      const newPage = Math.max(0, Math.min(b.currentPage + addPages, b.totalPages || 9999))
      return { ...b, currentPage: newPage }
    }))
  }

  const filtered = books.filter((b) => {
    if (activeFilter === "all") return true
    if (activeFilter === "reading") return b.status === "reading"
    if (activeFilter === "finished") return b.status === "finished"
    if (activeFilter === "want") return b.status === "want"
    return b.genre === activeFilter
  })

  const currentlyReading = books.filter((b) => b.status === "reading")
  const totalRead = books.filter((b) => b.status === "finished").length
  const totalPagesRead = books.filter((b) => b.status === "finished").reduce((s, b) => s + b.totalPages, 0)

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Biblioteca</h2>
          <p className="text-[13px] text-muted-foreground">
            {currentlyReading.length} leyendo · {totalRead} terminados · {totalPagesRead}p leídas
          </p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Libro
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Leyendo", value: currentlyReading.length, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Terminados", value: totalRead, icon: Check, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Páginas leídas", value: totalPagesRead, icon: Target, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={cn("rounded-2xl border p-3 text-center bg-gradient-to-b", s.bg, "border-transparent")}>
              <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "Todos" },
          { id: "reading", label: "Leyendo" },
          { id: "finished", label: "Terminados" },
          { id: "want", label: "Por leer" },
        ].map((f) => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={cn("flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap",
              activeFilter === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent")}>
            {f.label}
          </button>
        ))}
        <div className="w-px bg-border shrink-0 mx-1" />
        {GENRES.slice(0, 4).map((g) => (
          <button key={g} onClick={() => setActiveFilter(g)}
            className={cn("flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap",
              activeFilter === g ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent")}>
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Library className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-sm font-bold mb-1">Biblioteca vacía</h3>
          <p className="text-xs text-muted-foreground mb-4">Agrega tu primer libro para empezar el registro</p>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Agregar libro
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => {
            const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0
            const statusInfo = STATUS_LABELS[book.status]

            return (
              <div key={book.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all duration-200 group hover:shadow-sm",
                  book.status === "finished" ? "bg-emerald-500/5 border-emerald-500/15" :
                  book.status === "reading" ? "bg-card border-border/50" :
                  "bg-card border-border/50 opacity-70"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                    statusInfo.bg
                  )}>
                    📖
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold truncate">{book.title}</h3>
                    <p className="text-xs text-muted-foreground">{book.author || "Sin autor"}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded-md">{book.genre}</Badge>
                      <span className={statusInfo.color}>{statusInfo.label}</span>
                      {book.startedAt && <span>· {new Date(book.startedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => editBook(book)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteBook(book.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {book.totalPages > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Página {book.currentPage} de {book.totalPages}</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/60">
                      <div className={cn(
                        "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500",
                        progress >= 100 ? "from-emerald-400 to-emerald-500" : "from-primary to-blue-400"
                      )} style={{ width: `${progress}%` }} />
                    </div>

                    {book.status === "reading" && (
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={() => quickUpdatePages(book.id, -5)}
                          className="flex-1 rounded-lg border border-border/60 py-1.5 text-[10px] font-medium hover:bg-accent transition-colors">-5</button>
                        <Input
                          type="number"
                          value={book.currentPage}
                          onChange={(e) => updatePage(book.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center text-xs font-bold rounded-lg"
                        />
                        <button onClick={() => quickUpdatePages(book.id, 5)}
                          className="flex-1 rounded-lg border border-border/60 py-1.5 text-[10px] font-medium hover:bg-accent transition-colors">+5</button>
                        <button onClick={() => quickUpdatePages(book.id, 10)}
                          className="flex-1 rounded-lg border border-border/60 py-1.5 text-[10px] font-medium hover:bg-accent transition-colors">+10</button>
                      </div>
                    )}
                  </div>
                )}

                {book.rating && book.rating > 0 && (
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < book.rating! ? "text-amber-500 fill-amber-500" : "text-muted")} />
                    ))}
                  </div>
                )}

                {book.notes && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic line-clamp-2">"{book.notes}"</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={resetForm}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{editingId ? "Editar libro" : "Nuevo libro"}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-accent rounded-xl"><X className="h-4 w-4" /></button>
            </div>

            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título del libro" className="rounded-xl h-12 text-sm font-medium" autoFocus />
            <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)}
              placeholder="Autor" className="rounded-xl h-11 text-sm" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total páginas</label>
                <Input type="number" value={editTotalPages} onChange={(e) => setEditTotalPages(e.target.value)}
                  placeholder="300" className="rounded-xl h-11 mt-1.5 text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Página actual</label>
                <Input type="number" value={editCurrentPage} onChange={(e) => setEditCurrentPage(e.target.value)}
                  placeholder="0" className="rounded-xl h-11 mt-1.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { value: "reading" as const, label: "Leyendo", color: "border-blue-500 text-blue-500 bg-blue-500/10" },
                  { value: "want" as const, label: "Por leer", color: "border-purple-500 text-purple-500 bg-purple-500/10" },
                  { value: "finished" as const, label: "Terminado", color: "border-emerald-500 text-emerald-500 bg-emerald-500/10" },
                  { value: "paused" as const, label: "Pausado", color: "border-amber-500 text-amber-500 bg-amber-500/10" },
                ].map((s) => (
                  <button key={s.value} onClick={() => setEditStatus(s.value)}
                    className={cn("flex-1 rounded-xl py-2.5 text-[11px] font-semibold border transition-all",
                      editStatus === s.value ? `${s.color} border-2` : "border-border hover:bg-accent")}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Género</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {GENRES.map((g) => (
                  <button key={g} onClick={() => setEditGenre(g)}
                    className={cn("rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border",
                      editGenre === g ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notas</label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Citas, reflexiones..." className="rounded-xl h-11 mt-1.5 text-sm" />
            </div>

            {editStatus === "finished" && (
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Calificación</label>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setEditRating(n)}
                      className={cn("flex-1 h-10 rounded-xl flex items-center justify-center transition-all border",
                        editRating >= n ? "border-amber-500 bg-amber-500/10" : "border-border hover:bg-accent")}>
                      <Star className={cn("h-4 w-4", editRating >= n ? "text-amber-500 fill-amber-500" : "text-muted")} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full rounded-2xl h-12 font-semibold gap-2"
              onClick={editingId ? updateBook : addBook}>
              <Check className="h-4 w-4" /> {editingId ? "Guardar cambios" : "Agregar libro"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
