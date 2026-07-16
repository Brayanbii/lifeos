"use client"

import { useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export function useSupabaseSync() {
  const syncUp = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]

    try {
      const dailyData = localStorage.getItem("lifeos_daily")
      if (dailyData) {
        const data = JSON.parse(dailyData)
        await supabase.from("daily_logs").upsert({
          profile_id: "default",
          date: today,
          skincare_am: data.skincareAM || false,
          skincare_pm: data.skincarePM || false,
          creatine: data.creatine || false,
          no_fap: data.noFap || false,
          lectura: data.lectura || false,
          brushing: data.brushing || 0,
          water_ml: data.waterMl || 0,
        }, { onConflict: "profile_id,date" })
      }

      const meData = localStorage.getItem("lifeos_body_logs")
      if (meData) {
        const logs = JSON.parse(meData)
        const todayLog = logs.find((l: any) => l.date === today)
        if (todayLog) {
          await supabase.from("daily_logs").upsert({
            profile_id: "default",
            date: today,
            weight: todayLog.weight,
            mood: todayLog.mood,
            skincare_am: undefined,
            skincare_pm: undefined,
            creatine: undefined,
            no_fap: undefined,
            lectura: undefined,
            brushing: undefined,
            water_ml: undefined,
          }, { onConflict: "profile_id,date" })
        }
      }

      const txData = localStorage.getItem("lifeos_transactions")
      if (txData) {
        const tx = JSON.parse(txData)
        for (const t of tx.slice(0, 5)) {
          await supabase.from("transactions").upsert({
            id: t.id,
            profile_id: "default",
            type: t.type,
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.date,
          }, { onConflict: "id" })
        }
      }

      const tasksData = localStorage.getItem("lifeos_tasks")
      if (tasksData) {
        const tasks = JSON.parse(tasksData)
        for (const t of tasks.slice(0, 10)) {
          await supabase.from("tasks").upsert({
            id: t.id,
            profile_id: "default",
            title: t.title,
            description: t.description || "",
            category: t.category,
            priority: t.priority,
            status: t.status,
            due_date: t.dueDate || null,
            completed_at: t.completedAt || null,
            archived_at: t.archivedAt || null,
          }, { onConflict: "id" })
        }
      }

      const goalsData = localStorage.getItem("lifeos_goals")
      if (goalsData) {
        const goals = JSON.parse(goalsData)
        for (const g of goals.slice(0, 10)) {
          await supabase.from("goals").upsert({
            id: g.id,
            profile_id: "default",
            title: g.title,
            description: g.description || "",
            category: g.category,
            type: g.type,
            status: g.status,
            progress: g.progress,
            target_date: g.targetDate || null,
            completed_at: g.completedAt || null,
          }, { onConflict: "id" })
        }
      }

      const wlData = localStorage.getItem("lifeos_workout_log")
      if (wlData) {
        const wl = JSON.parse(wlData)
        for (const w of wl.slice(0, 5)) {
          await supabase.from("workout_logs").upsert({
            profile_id: "default",
            date: w.date,
            routine_day: w.routineDay,
            exercises_data: w.exercises || [],
            cardio_done: w.cardioDone || false,
          }, { onConflict: "profile_id,date" })
        }
      }

      const creditData = localStorage.getItem("lifeos_credit")
      if (creditData) {
        const cr = JSON.parse(creditData)
        for (const c of cr.slice(0, 10)) {
          await supabase.from("credit_spends").upsert({
            id: c.id,
            profile_id: "default",
            amount: c.amount,
            category: c.category,
            description: c.description,
            date: c.date,
          }, { onConflict: "id" })
        }
      }

      const booksData = localStorage.getItem("lifeos_books")
      if (booksData) {
        const books = JSON.parse(booksData)
        for (const b of books.slice(0, 20)) {
          await supabase.from("books").upsert({
            id: b.id,
            profile_id: "default",
            title: b.title,
            author: b.author || "",
            total_pages: b.totalPages || 0,
            current_page: b.currentPage || 0,
            status: b.status,
            genre: b.genre,
            started_at: b.startedAt || null,
            finished_at: b.finishedAt || null,
            rating: b.rating || 0,
            notes: b.notes || "",
          }, { onConflict: "id" })
        }
      }

      const opData = localStorage.getItem("lifeos_operacion_done")
      if (opData) {
        const op = JSON.parse(opData)
        const blocks = op.blocks || {}
        const today = new Date().toISOString().split("T")[0]
        await supabase.from("daily_logs").upsert({
          profile_id: "default",
          date: today,
          operacion_blocks: blocks,
        }, { onConflict: "profile_id,date" })
      }
    } catch (e) {
      console.log("Sync skipped (offline or error)")
    }
  }, [])

  const syncDown = useCallback(async () => {
    try {
      const { data: dl } = await supabase.from("daily_logs").select("*").eq("profile_id", "default").order("date", { ascending: false }).limit(1)
      if (dl?.[0]) {
        const today = new Date().toISOString().split("T")[0]
        localStorage.setItem("lifeos_daily", JSON.stringify({
          date: today,
          skincareAM: dl[0].skincare_am,
          skincarePM: dl[0].skincare_pm,
          creatine: dl[0].creatine,
          noFap: dl[0].no_fap,
          lectura: dl[0].lectura,
          brushing: dl[0].brushing || 0,
          waterMl: dl[0].water_ml || 0,
        }))
      }

      const { data: txs } = await supabase.from("transactions").select("*").eq("profile_id", "default").order("date", { ascending: false }).limit(50)
      if (txs) {
        localStorage.setItem("lifeos_transactions", JSON.stringify(txs.map((t: any) => ({
          id: t.id, type: t.type, amount: t.amount, category: t.category, description: t.description, date: t.date,
        }))))
      }

      const { data: tasks } = await supabase.from("tasks").select("*").eq("profile_id", "default").order("created_at", { ascending: false }).limit(50)
      if (tasks) {
        localStorage.setItem("lifeos_tasks", JSON.stringify(tasks.map((t: any) => ({
          id: t.id, title: t.title, description: t.description, category: t.category,
          priority: t.priority, status: t.status, dueDate: t.due_date,
          completedAt: t.completed_at, archivedAt: t.archived_at, createdAt: t.created_at,
        }))))
      }

      const { data: goals } = await supabase.from("goals").select("*").eq("profile_id", "default").order("created_at", { ascending: false }).limit(50)
      if (goals) {
        localStorage.setItem("lifeos_goals", JSON.stringify(goals.map((g: any) => ({
          id: g.id, title: g.title, description: g.description, category: g.category,
          type: g.type, status: g.status, progress: g.progress,
          targetDate: g.target_date, completedAt: g.completed_at, createdAt: g.created_at,
        }))))
      }

      const { data: wl } = await supabase.from("workout_logs").select("*").eq("profile_id", "default").order("date", { ascending: false }).limit(50)
      if (wl) {
        localStorage.setItem("lifeos_workout_log", JSON.stringify(wl.map((w: any) => ({
          date: w.date, routineDay: w.routine_day, exercises: w.exercises_data, cardioDone: w.cardio_done,
        }))))
      }

      const { data: cr } = await supabase.from("credit_spends").select("*").eq("profile_id", "default").order("date", { ascending: false }).limit(50)
      if (cr) {
        localStorage.setItem("lifeos_credit", JSON.stringify(cr.map((c: any) => ({
          id: c.id, amount: c.amount, category: c.category, description: c.description, date: c.date,
        }))))
      }

      const { data: bk } = await supabase.from("books").select("*").eq("profile_id", "default").order("created_at", { ascending: false }).limit(50)
      if (bk) {
        localStorage.setItem("lifeos_books", JSON.stringify(bk.map((b: any) => ({
          id: b.id, title: b.title, author: b.author, totalPages: b.total_pages, currentPage: b.current_page,
          status: b.status, genre: b.genre, startedAt: b.started_at, finishedAt: b.finished_at,
          rating: b.rating, notes: b.notes,
        }))))
      }
    } catch (e) {
      console.log("Down sync skipped")
    }
  }, [])

  useEffect(() => {
    syncDown()
  }, [syncDown])

  useEffect(() => {
    const interval = setInterval(syncUp, 15000)
    return () => clearInterval(interval)
  }, [syncUp])

  return { syncUp, syncDown }
}
