"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Trash2,
  Timer,
  Check,
  X,
  Trophy,
  TrendingUp,
  Flame,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Dumbbell,
  Footprints,
  Zap,
  Edit3,
} from "lucide-react"

interface ExerciseSet {
  reps: number
  weight: number
}

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  sets: ExerciseSet[]
}

interface RoutineDay {
  name: string
  shortName: string
  focus: string
  emoji: string
  exercises: Exercise[]
}

interface WorkoutLogEntry {
  date: string
  routineDay: number
  exercises: { exerciseId: string; sets: ExerciseSet[] }[]
  cardioDone: boolean
}

const DEFAULT_ROUTINES: RoutineDay[] = [
  { name: "Empuje (Push)", shortName: "Push", focus: "Pecho, Hombros, Tríceps", emoji: "💪", exercises: [] },
  { name: "Tirón (Pull)", shortName: "Pull", focus: "Espalda, Bíceps", emoji: "🔙", exercises: [] },
  { name: "Pierna (Legs)", shortName: "Legs", focus: "Cuádriceps, Femoral, Glúteos, Pantorrillas", emoji: "🦵", exercises: [] },
]

const ROUTINE_SCHEDULE: { day: number; routineIndex: number; label: string }[] = [
  { day: 1, routineIndex: 0, label: "Push" },
  { day: 2, routineIndex: 1, label: "Pull" },
  { day: 3, routineIndex: 2, label: "Legs" },
  { day: 4, routineIndex: 0, label: "Push 2" },
  { day: 5, routineIndex: 1, label: "Pull 2" },
  { day: 6, routineIndex: 2, label: "Legs 2" },
  { day: 0, routineIndex: -1, label: "Descanso" },
]

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function GymPage() {
  const [routines, setRoutines] = useState<RoutineDay[]>(DEFAULT_ROUTINES)
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogEntry[]>([])
  const [mounted, setMounted] = useState(false)

  const [todaySets, setTodaySets] = useState<Record<string, ExerciseSet[]>>({})
  const [cardioActive, setCardioActive] = useState(false)
  const [cardioTimer, setCardioTimer] = useState(25 * 60)
  const [cardioRunning, setCardioRunning] = useState(false)
  const cardioRef = useRef<NodeJS.Timeout | null>(null)

  const [restTimers, setRestTimers] = useState<Record<string, number>>({})
  const [restRunning, setRestRunning] = useState<Record<string, boolean>>({})
  const restRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const [showAddExercise, setShowAddExercise] = useState(false)
  const [newExName, setNewExName] = useState("")
  const [newExMuscle, setNewExMuscle] = useState("")
  const [newExSets, setNewExSets] = useState("3")

  const [prFlash, setPrFlash] = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const today = new Date()
  const dayOfWeek = today.getDay()
  const todaySchedule = ROUTINE_SCHEDULE.find((s) => s.day === dayOfWeek)!
  const todayRoutine = todaySchedule.routineIndex >= 0 ? routines[todaySchedule.routineIndex] : null
  const todayStr = today.toISOString().split("T")[0]

  useEffect(() => {
    const savedRoutines = localStorage.getItem("lifeos_routines")
    const savedLog = localStorage.getItem("lifeos_workout_log")
    const savedSets = localStorage.getItem(`lifeos_sets_${todayStr}`)
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines))
    if (savedLog) setWorkoutLog(JSON.parse(savedLog))
    if (savedSets) setTodaySets(JSON.parse(savedSets))
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_routines", JSON.stringify(routines)) }, [routines, mounted])
  useEffect(() => { if (mounted) localStorage.setItem("lifeos_workout_log", JSON.stringify(workoutLog)) }, [workoutLog, mounted])
  useEffect(() => { if (mounted) localStorage.setItem(`lifeos_sets_${todayStr}`, JSON.stringify(todaySets)) }, [todaySets, mounted])

  useEffect(() => {
    if (cardioRunning && cardioTimer > 0) {
      cardioRef.current = setInterval(() => setCardioTimer((t) => t - 1), 1000)
    } else if (cardioTimer === 0 && cardioRunning) {
      setCardioRunning(false)
      if (cardioRef.current) clearInterval(cardioRef.current)
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([500, 200, 500])
    }
    return () => { if (cardioRef.current) clearInterval(cardioRef.current) }
  }, [cardioRunning, cardioTimer])

  useEffect(() => {
    Object.entries(restRunning).forEach(([id, running]) => {
      if (running && (restTimers[id] || 0) > 0) {
        restRefs.current[id] = setInterval(() => {
          setRestTimers((prev) => {
            const newVal = (prev[id] || 0) - 1
            if (newVal <= 0) {
              setRestRunning((r) => ({ ...r, [id]: false }))
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(300)
            }
            return { ...prev, [id]: newVal }
          })
        }, 1000)
      }
    })
    return () => { Object.values(restRefs.current).forEach(clearInterval) }
  }, [restRunning])

  function getPreviousWeekSets(exerciseId: string, routineIdx: number): ExerciseSet[] | null {
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const prevEntry = workoutLog.find((e) => e.date <= oneWeekAgo.toISOString().split("T")[0] && e.routineDay === routineIdx)
    if (!prevEntry) return null
    const exLog = prevEntry.exercises.find((e) => e.exerciseId === exerciseId)
    return exLog?.sets || null
  }

  function getBestSets(exerciseId: string): ExerciseSet[] | null {
    let best: ExerciseSet[] | null = null
    let bestWeight = 0
    workoutLog.forEach((entry) => {
      const exLog = entry.exercises.find((e) => e.exerciseId === exerciseId)
      if (exLog) {
        const totalWeight = exLog.sets.reduce((s, set) => s + set.reps * set.weight, 0)
        if (totalWeight > bestWeight) { best = exLog.sets; bestWeight = totalWeight }
      }
    })
    return best
  }

  function updateSet(exerciseId: string, setIdx: number, field: "reps" | "weight", value: number) {
    setTodaySets((prev) => {
      const currentSets = prev[exerciseId] || routines[todaySchedule.routineIndex]?.exercises.find((e) => e.id === exerciseId)?.sets || [{ reps: 10, weight: 0 }]
      const newSets = [...currentSets]
      if (!newSets[setIdx]) newSets[setIdx] = { reps: 10, weight: 0 }
      newSets[setIdx] = { ...newSets[setIdx], [field]: value }
      return { ...prev, [exerciseId]: newSets }
    })
  }

  function checkPR(exerciseId: string) {
    const currentSets = todaySets[exerciseId]
    if (!currentSets) return
    const prevSets = getPreviousWeekSets(exerciseId, todaySchedule.routineIndex)
    if (!prevSets) return

    const currentTotal = currentSets.reduce((s, set) => s + set.reps * set.weight, 0)
    const prevTotal = prevSets.reduce((s, set) => s + set.reps * set.weight, 0)

    if (currentTotal > prevTotal) {
      setPrFlash((prev) => ({ ...prev, [exerciseId]: true }))
      setTimeout(() => setPrFlash((p) => ({ ...p, [exerciseId]: false })), 2500)
    }
  }

  function saveWorkout() {
    if (!todayRoutine) return
    const exercises = todayRoutine.exercises.map((ex) => ({
      exerciseId: ex.id,
      sets: todaySets[ex.id] || ex.sets,
    }))
    setWorkoutLog((prev) => [...prev.filter((e) => e.date !== todayStr), { date: todayStr, routineDay: todaySchedule.routineIndex, exercises, cardioDone: cardioActive && cardioTimer <= 0 }])
  }

  function startRestTimer(exerciseId: string) {
    setRestTimers((prev) => ({ ...prev, [exerciseId]: 90 }))
    setRestRunning((prev) => ({ ...prev, [exerciseId]: true }))
  }

  function stopRestTimer(exerciseId: string) {
    setRestRunning((prev) => ({ ...prev, [exerciseId]: false }))
    if (restRefs.current[exerciseId]) clearInterval(restRefs.current[exerciseId])
  }

  function addExercise() {
    if (!newExName || !todayRoutine) return
    const idx = todaySchedule.routineIndex
    const updated = [...routines]
    updated[idx] = {
      ...updated[idx],
      exercises: [...updated[idx].exercises, {
        id: generateId(),
        name: newExName,
        muscleGroup: newExMuscle || "General",
        sets: Array.from({ length: parseInt(newExSets) || 3 }, () => ({ reps: 10, weight: 0 })),
      }]
    }
    setRoutines(updated)
    setNewExName("")
    setNewExMuscle("")
    setNewExSets("3")
    setShowAddExercise(false)
    setToastMsg(`${newExName} agregado a ${todayRoutine?.shortName}`)
    setTimeout(() => setToastMsg(null), 2000)
  }

  function confirmDeleteExercise(exerciseId: string) {
    setDeleteConfirm(exerciseId)
  }

  function executeDeleteExercise() {
    if (!deleteConfirm || !todayRoutine) return
    const name = todayRoutine.exercises.find((e) => e.id === deleteConfirm)?.name || "Ejercicio"
    const idx = todaySchedule.routineIndex
    const updated = [...routines]
    updated[idx] = { ...updated[idx], exercises: updated[idx].exercises.filter((e) => e.id !== deleteConfirm) }
    setRoutines(updated)
    setToastMsg(`${name} eliminado`)
    setTimeout(() => setToastMsg(null), 2000)
    setDeleteConfirm(null)
  }

  function addSetToExercise(exerciseId: string) {
    if (!todayRoutine) return
    const idx = todaySchedule.routineIndex
    const updated = [...routines]
    updated[idx] = {
      ...updated[idx],
      exercises: updated[idx].exercises.map((e) =>
        e.id === exerciseId ? { ...e, sets: [...e.sets, { reps: 10, weight: e.sets[e.sets.length - 1]?.weight || 0 }] } : e
      )
    }
    setRoutines(updated)
  }

  function removeSetFromExercise(exerciseId: string) {
    if (!todayRoutine) return
    const idx = todaySchedule.routineIndex
    const updated = [...routines]
    updated[idx] = {
      ...updated[idx],
      exercises: updated[idx].exercises.map((e) =>
        e.id === exerciseId && e.sets.length > 1 ? { ...e, sets: e.sets.slice(0, -1) } : e
      )
    }
    setRoutines(updated)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  const isRestDay = todaySchedule.routineIndex === -1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight">Gym</h2>
          <p className="text-[13px] text-muted-foreground">{WEEKDAYS[dayOfWeek]}</p>
        </div>
      </div>

      <div className="rounded-[20px] border bg-gradient-to-br from-primary/5 via-primary/3 to-background p-5 border-primary/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {isRestDay ? "Día de descanso" : todaySchedule.label}
            </p>
            <h3 className="text-xl font-extrabold mt-0.5">
              {isRestDay ? "Recuperación activa" : todayRoutine?.name}
            </h3>
            {!isRestDay && (
              <p className="text-xs text-muted-foreground mt-1">{todayRoutine?.focus}</p>
            )}
          </div>
          <div className="text-4xl">{isRestDay ? "🧘" : todayRoutine?.emoji}</div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROUTINE_SCHEDULE.filter((s) => s.routineIndex >= 0).map((s) => (
            <div key={s.day}
              className={cn(
                "flex-shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-semibold border transition-all",
                s.day === dayOfWeek
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {WEEKDAYS[s.day].slice(0, 3)} · {s.label}
            </div>
          ))}
          <div className={cn(
            "flex-shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-semibold border transition-all",
            dayOfWeek === 0 ? "bg-emerald-500 text-white border-emerald-500" : "border-border text-muted-foreground"
          )}>
            Dom · Off
          </div>
        </div>
      </div>

      {isRestDay ? (
        <div className="rounded-[20px] border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/15 p-8 text-center space-y-4">
          <span className="text-5xl">🧘</span>
          <div>
            <h3 className="text-lg font-bold">Descanso activo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Caminata ligera, estiramientos, foam rolling. Prepara tus comidas, planifica la semana.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {["Caminar 30 min", "Estiramientos 15 min", "Foam rolling", "Preparar comidas", "Planificar semana", "Dormir 8h+"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-xl p-2.5">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <span className="text-sm font-bold">Ejercicios</span>
              {todayRoutine && todayRoutine.exercises.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">{todayRoutine.exercises.length}</Badge>
              )}
            </div>
            {todayRoutine && todayRoutine.exercises.length > 0 && (
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="rounded-xl h-8 text-[11px] gap-1"
                  onClick={saveWorkout}>
                  <Check className="h-3.5 w-3.5" /> Guardar
                </Button>
                <Button size="sm" variant="ghost" className="rounded-xl h-8 text-[11px] gap-1"
                  onClick={() => setShowAddExercise(true)}>
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </Button>
              </div>
            )}
          </div>

          {todayRoutine && todayRoutine.exercises.length === 0 ? (
            <button
              onClick={() => setShowAddExercise(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 p-8 text-center transition-all group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-semibold">Agregar tu primer ejercicio</p>
              <p className="text-xs text-muted-foreground mt-1">
                Toca aquí para empezar a armar tu rutina de {todayRoutine?.shortName}
              </p>
            </button>
          ) : (
            <div className="space-y-4">
              {(() => {
                const sections = [
                  { label: "Pecho / Hombros / Tríceps", muscles: ["Pecho / Hombros / Tríceps"] },
                  { label: "Espalda / Bíceps", muscles: ["Espalda / Bíceps"] },
                  { label: "Pierna", muscles: ["Pierna"] },
                ]

                return sections.map((section) => {
                  const sectionExercises = todayRoutine?.exercises.filter((e) => section.muscles.includes(e.muscleGroup)) || []
                  if (sectionExercises.length === 0) return null

                  return (
                    <div key={section.label} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</span>
                        <span className="text-[10px] text-muted-foreground/50">{sectionExercises.length}</span>
                      </div>
                      {sectionExercises.map((exercise) => (
                        <ExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          currentSets={todaySets[exercise.id] || exercise.sets}
                          prevSets={getPreviousWeekSets(exercise.id, todaySchedule.routineIndex)}
                          bestSets={getBestSets(exercise.id)}
                          isPR={prFlash[exercise.id] || false}
                          restTime={restTimers[exercise.id] || 0}
                          isResting={restRunning[exercise.id] || false}
                          onUpdateSet={(setIdx, field, value) => updateSet(exercise.id, setIdx, field, value)}
                          onCheckPR={() => checkPR(exercise.id)}
                          onStartRest={() => startRestTimer(exercise.id)}
                          onStopRest={() => stopRestTimer(exercise.id)}
                          onAddSet={() => addSetToExercise(exercise.id)}
                          onRemoveSet={() => removeSetFromExercise(exercise.id)}
                          onDelete={() => confirmDeleteExercise(exercise.id)}
                        />
                      ))}
                    </div>
                  )
                })
              })()}

              <button
                onClick={() => setShowAddExercise(true)}
                className="w-full rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 p-3 text-center transition-all group"
              >
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Agregar ejercicio
                </span>
              </button>
            </div>
          )}

          <div className="rounded-[20px] border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
                  cardioActive ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30" : "bg-emerald-500/10"
                )}>
                  <Footprints className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-bold">Cardio LISS</p>
                  <p className="text-xs text-muted-foreground">Caminadora · 12% inclinación · 4.5 km/h</p>
                </div>
              </div>
              <button
                onClick={() => { setCardioActive(!cardioActive); if (cardioActive) { setCardioRunning(false); setCardioTimer(25 * 60) } }}
                className={cn(
                  "relative h-9 w-16 rounded-full transition-all duration-300",
                  cardioActive ? "bg-emerald-500" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300",
                  cardioActive ? "left-[30px]" : "left-0.5"
                )} />
              </button>
            </div>

            {cardioActive && (
              <div className="space-y-4 animate-in slide-in-from-top-3 duration-300">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tiempo restante</p>
                  <p className="text-6xl font-extrabold tabular-nums text-emerald-600 tracking-tight">{formatTime(cardioTimer)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">de 25:00</p>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-500/20 mt-4">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${((25 * 60 - cardioTimer) / (25 * 60)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  {!cardioRunning ? (
                    <Button className="flex-1 rounded-2xl h-12 text-sm gap-2 font-semibold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      onClick={() => setCardioRunning(true)}>
                      <Play className="h-5 w-5" /> Iniciar
                    </Button>
                  ) : (
                    <Button className="flex-1 rounded-2xl h-12 text-sm gap-2 font-semibold" variant="outline"
                      onClick={() => setCardioRunning(false)}>
                      <Pause className="h-5 w-5" /> Pausar
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-2xl h-12 w-12"
                    onClick={() => { setCardioTimer(25 * 60); setCardioRunning(false) }}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showAddExercise && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAddExercise(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Nuevo ejercicio</h3>
              <button onClick={() => setShowAddExercise(false)} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre del ejercicio</label>
                <Input value={newExName} onChange={(e) => setNewExName(e.target.value)}
                  placeholder="Press banca, Sentadilla, etc."
                  className="rounded-xl h-12 mt-1.5 text-sm font-medium" autoFocus />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Grupo muscular</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["Pecho / Hombros / Tríceps", "Espalda / Bíceps", "Pierna"].map((m) => (
                    <button key={m}
                      onClick={() => setNewExMuscle(m)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border",
                        newExMuscle === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      )}
                    >{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Series iniciales</label>
                <div className="flex gap-2 mt-1.5">
                  {[2, 3, 4, 5].map((n) => (
                    <button key={n}
                      onClick={() => setNewExSets(String(n))}
                      className={cn(
                        "h-11 w-14 rounded-xl text-sm font-bold border transition-all",
                        newExSets === String(n)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full rounded-2xl h-12 font-semibold gap-2" onClick={addExercise}>
              <Plus className="h-4 w-4" /> Agregar a {todayRoutine?.shortName}
            </Button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-xs rounded-[20px] bg-background p-6 space-y-4 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mx-auto">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold">¿Eliminar ejercicio?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Se borrará &quot;{todayRoutine?.exercises.find((e) => e.id === deleteConfirm)?.name}&quot; de tu rutina de {todayRoutine?.shortName}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl h-11"
                onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 gap-1.5"
                onClick={executeDeleteExercise}>
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
    </svg>
  )
}

function ExerciseCard({
  exercise, currentSets, prevSets, bestSets, isPR, restTime, isResting,
  onUpdateSet, onCheckPR, onStartRest, onStopRest, onAddSet, onRemoveSet, onDelete,
}: {
  exercise: Exercise
  currentSets: ExerciseSet[]
  prevSets: ExerciseSet[] | null
  bestSets: ExerciseSet[] | null
  isPR: boolean
  restTime: number
  isResting: boolean
  onUpdateSet: (setIdx: number, field: "reps" | "weight", value: number) => void
  onCheckPR: () => void
  onStartRest: () => void
  onStopRest: () => void
  onAddSet: () => void
  onRemoveSet: () => void
  onDelete: () => void
}) {
  const currentTotal = currentSets.reduce((s, set) => s + set.reps * set.weight, 0)
  const prevTotal = prevSets?.reduce((s, set) => s + set.reps * set.weight, 0) || 0
  const improvement = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all duration-300",
      isPR ? "border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 shadow-lg shadow-amber-500/10" : "border-border/50 bg-card"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold">{exercise.name}</h4>
            {isPR && (
              <Badge className="bg-amber-500 text-white text-[9px] gap-1 animate-bounce">
                <Trophy className="h-3 w-3" /> PR
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] h-4 rounded-md">{exercise.muscleGroup}</Badge>
            {prevSets && improvement > 0 && (
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +{improvement}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRemoveSet} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
          <button onClick={onAddSet} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {prevSets && (
        <div className="mb-3 rounded-xl bg-muted/40 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Semana anterior</p>
          <div className="flex gap-1.5">
            {prevSets.map((set, i) => (
              <div key={i} className="flex-1 text-center bg-background/60 rounded-lg py-1.5">
                <div className="text-[11px] font-bold">{set.reps}</div>
                <div className="text-[10px] text-muted-foreground">{set.weight > 0 ? `${set.weight}kg` : "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bestSets && (
        <div className="mb-3 rounded-xl bg-amber-500/5 border border-amber-500/10 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" /> Récord personal
          </p>
          <div className="flex gap-1.5">
            {bestSets.map((set, i) => (
              <div key={i} className="flex-1 text-center bg-background/60 rounded-lg py-1.5">
                <div className="text-[11px] font-bold">{set.reps}</div>
                <div className="text-[10px] text-muted-foreground">{set.weight > 0 ? `${set.weight}kg` : "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-1.5">
          {currentSets.map((set, i) => (
            <div key={i} className="flex-1 space-y-1">
              <div className="text-center text-[9px] text-muted-foreground font-semibold">S{i + 1}</div>
              <Input type="number" value={set.reps || ""}
                onChange={(e) => onUpdateSet(i, "reps", parseInt(e.target.value) || 0)}
                placeholder="Reps" className="h-9 text-center text-xs font-bold rounded-lg" />
              <Input type="number" value={set.weight || ""}
                onChange={(e) => onUpdateSet(i, "weight", parseInt(e.target.value) || 0)}
                placeholder="kg" className="h-9 text-center text-xs rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 rounded-xl h-8 text-[11px] gap-1" onClick={onCheckPR}>
          <TrendingUp className="h-3.5 w-3.5" /> Verificar PR
        </Button>
        {isResting ? (
          <Button size="sm" variant="default" className="rounded-xl h-8 text-[11px] gap-1 bg-amber-500 hover:bg-amber-600" onClick={onStopRest}>
            <Pause className="h-3.5 w-3.5" /> {formatTime(restTime)}
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-xl h-8 text-[11px] gap-1" onClick={onStartRest}>
            <Timer className="h-3.5 w-3.5" /> 90s
          </Button>
        )}
      </div>

      {isResting && (
        <div className="mt-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-center animate-in zoom-in-95 duration-200">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Descanso</p>
          <p className="text-5xl font-extrabold tabular-nums text-amber-600 tracking-tight">{formatTime(restTime)}</p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-amber-500/20 mt-3">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-linear"
              style={{ width: `${((restTime) / 90) * 100}%` }}
            />
          </div>
          <Button size="sm" variant="outline" className="mt-3 rounded-xl gap-1.5" onClick={onStopRest}>
            <Pause className="h-3.5 w-3.5" /> Finalizar descanso
          </Button>
        </div>
      )}
    </div>
  )
}
