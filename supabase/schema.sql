-- LifeOS Database Schema for Supabase

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT 'bg-blue-500',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER DEFAULT 1,
  reminder_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  count INTEGER DEFAULT 0,
  note TEXT,
  UNIQUE(habit_id, date)
);

-- Gym - Exercises
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gym - Routines
CREATE TABLE IF NOT EXISTS public.gym_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gym_routine_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES public.gym_routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  weight NUMERIC(5,1),
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER DEFAULT 0
);

-- Gym - Sessions
CREATE TABLE IF NOT EXISTS public.gym_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.gym_routines(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gym_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.gym_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC(5,1) DEFAULT 0,
  notes TEXT
);

-- Gym - Body Measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,1),
  body_fat NUMERIC(4,1),
  muscle_mass NUMERIC(5,1),
  waist NUMERIC(5,1),
  chest NUMERIC(5,1),
  arms NUMERIC(5,1),
  legs NUMERIC(5,1),
  UNIQUE(user_id, date)
);

-- Finances
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'short_term' CHECK (type IN ('short_term', 'long_term')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  category TEXT DEFAULT 'Personal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies (each user sees only their own data)
CREATE POLICY "Users own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own habit_logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own exercises" ON public.exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own gym_routines" ON public.gym_routines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own gym_sessions" ON public.gym_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own gym_sets" ON public.gym_sets FOR ALL USING (EXISTS (SELECT 1 FROM public.gym_sessions WHERE id = gym_sets.session_id AND user_id = auth.uid()));
CREATE POLICY "Users own body_measurements" ON public.body_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own savings_goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_habits_user ON public.habits(user_id);
CREATE INDEX idx_habit_logs_date ON public.habit_logs(user_id, date);
CREATE INDEX idx_habit_logs_habit ON public.habit_logs(habit_id);
CREATE INDEX idx_gym_sessions_date ON public.gym_sessions(user_id, date);
CREATE INDEX idx_transactions_date ON public.transactions(user_id, date);
CREATE INDEX idx_transactions_type ON public.transactions(user_id, type);
CREATE INDEX idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX idx_goals_status ON public.goals(user_id, status);
CREATE INDEX idx_body_measurements_date ON public.body_measurements(user_id, date);
