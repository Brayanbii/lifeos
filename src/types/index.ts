export type Theme = "light" | "dark"

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  icon: string
  color: string
  frequency: "daily" | "weekly" | "monthly"
  target_count: number
  reminder_time?: string
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
  count: number
  note?: string
}

export interface GymRoutine {
  id: string
  user_id: string
  name: string
  description?: string
  exercises: GymRoutineExercise[]
  created_at: string
}

export interface GymRoutineExercise {
  exercise_id: string
  sets: number
  reps: number
  weight?: number
  rest_seconds?: number
  order_index: number
}

export interface Exercise {
  id: string
  user_id: string
  name: string
  muscle_group: string
  description?: string
  created_at: string
}

export interface GymSession {
  id: string
  user_id: string
  routine_id?: string
  date: string
  duration_minutes: number
  notes?: string
  created_at: string
}

export interface GymSet {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  reps: number
  weight: number
  notes?: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  date: string
  weight?: number
  body_fat?: number
  muscle_mass?: number
  waist?: number
  chest?: number
  arms?: number
  legs?: number
}

export interface FinancialTransaction {
  id: string
  user_id: string
  type: "income" | "expense"
  amount: number
  category: string
  description?: string
  date: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  month: string
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
  created_at: string
}

export interface TaskItem {
  id: string
  user_id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  due_date?: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  type: "short_term" | "long_term"
  status: "active" | "completed" | "abandoned"
  progress: number
  target_date?: string
  created_at: string
}
