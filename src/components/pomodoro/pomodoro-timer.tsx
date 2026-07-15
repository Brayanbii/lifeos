"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Timer, Minimize2, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5
const FOCUS_SECONDS = FOCUS_MINUTES * 60
const BREAK_SECONDS = BREAK_MINUTES * 60
const TOTAL_SESSIONS = 4
const STORAGE_KEY = "lifeos_pomodoro_sessions"
const STORAGE_DATE_KEY = "lifeos_pomodoro_date"

type TimerMode = "focus" | "break"

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}

function loadSessions(): number {
  if (typeof window === "undefined") return 0
  const storedDate = localStorage.getItem(STORAGE_DATE_KEY)
  const today = getTodayKey()
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_DATE_KEY, today)
    localStorage.setItem(STORAGE_KEY, "0")
    return 0
  }
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? parseInt(saved, 10) : 0
}

function saveSessions(count: number): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, String(count))
  localStorage.setItem(STORAGE_DATE_KEY, getTodayKey())
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

interface PomodoroTimerProps {
  className?: string
}

export function PomodoroTimer({ className }: PomodoroTimerProps) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    setCompletedSessions(loadSessions())
  }, [])

  const totalSeconds = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS
  const progress = 1 - secondsLeft / totalSeconds
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference * (1 - progress)

  const playAlert = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400])
      }
    } catch { /* noop */ }
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = "sine"
        gain2.gain.setValueAtTime(0.3, ctx.currentTime)
        osc2.frequency.setValueAtTime(1100, ctx.currentTime)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.2)
      }, 250)
    } catch { /* noop */ }
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const switchMode = useCallback(
    (nextMode: TimerMode, nextSeconds: number) => {
      stopTimer()
      setIsRunning(false)
      setMode(nextMode)
      setSecondsLeft(nextSeconds)
    },
    [stopTimer]
  )

  const onTick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        stopTimer()
        setIsRunning(false)
        playAlert()

        if (mode === "focus") {
          const newCount = completedSessions + 1
          setCompletedSessions(newCount)
          saveSessions(newCount)
          return 0
        } else {
          return 0
        }
      }
      return prev - 1
    })
  }, [mode, completedSessions, stopTimer, playAlert])

  const startTimer = useCallback(() => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(onTick, 1000)
  }, [onTick])

  const pauseTimer = useCallback(() => {
    stopTimer()
    setIsRunning(false)
  }, [stopTimer])

  const resetTimer = useCallback(() => {
    stopTimer()
    setIsRunning(false)
    setSecondsLeft(FOCUS_SECONDS)
    setMode("focus")
  }, [stopTimer])

  const handleStartBreak = useCallback(() => {
    switchMode("break", BREAK_SECONDS)
  }, [switchMode])

  const handleStartFocus = useCallback(() => {
    switchMode("focus", FOCUS_SECONDS)
  }, [switchMode])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={cn(
          "fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl",
          "bg-primary text-primary-foreground shadow-xl shadow-primary/30",
          "hover:scale-105 active:scale-95 transition-all",
          "md:bottom-20",
          isRunning && "animate-pulse",
          className
        )}
        title="Pomodoro Timer"
      >
        <Timer className="h-6 w-6" />
        {isRunning && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-background">
            {formatTime(secondsLeft)}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={cn(
          "relative w-full max-w-[360px] overflow-hidden rounded-[32px] glass-panel p-8",
          "animate-in zoom-in-95 duration-300",
          className
        )}
      >
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-4 right-4 flex items-center justify-center h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Minimize2 className="h-4 w-4 text-foreground" />
        </button>

        <div className="flex flex-col items-center gap-6">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full",
              mode === "focus"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            )}
          >
            {mode === "focus" ? "Enfoque" : "Descanso"}
          </span>

          <div className="relative flex items-center justify-center">
            <svg
              className="h-56 w-56 -rotate-90"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted-foreground/15"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  mode === "focus" ? "text-primary" : "text-emerald-500"
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center gap-1">
              <span className="text-5xl font-black tracking-tight tabular-nums text-foreground">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {mode === "focus" ? `${FOCUS_MINUTES} min` : `${BREAK_MINUTES} min`}
              </span>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground">
            Sesión {Math.min(completedSessions + 1, TOTAL_SESSIONS)} de {TOTAL_SESSIONS}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={resetTimer}
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="h-5 w-5 text-foreground" />
            </button>

            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <Pause className="h-7 w-7" />
              </button>
            ) : (
              <button
                onClick={secondsLeft <= 0 ? (mode === "focus" ? handleStartBreak : handleStartFocus) : startTimer}
                className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
              >
                {secondsLeft <= 0 ? (
                  <Maximize2 className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-0.5" />
                )}
              </button>
            )}

            <button
              onClick={handleStartBreak}
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
              title="Ir a descanso"
            >
              <span className="text-xs font-bold">{BREAK_MINUTES}m</span>
            </button>
          </div>

          {completedSessions > 0 && (
            <p className="text-xs text-muted-foreground">
              {completedSessions} de {TOTAL_SESSIONS} sesiones completadas hoy
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
