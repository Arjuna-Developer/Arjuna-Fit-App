
-- ════════════════════════════════════════════════════════════════
-- ArjunaFit — Tablas faltantes detectadas en auditoría
-- Ejecutar en Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- ── day_logs (cierre del día) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS day_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date             date DEFAULT CURRENT_DATE,
  meals_count      int  DEFAULT 0,
  workout_done     boolean DEFAULT false,
  day_closed       boolean DEFAULT false,
  closing_note     text,
  tomorrow_intent  text,
  mood             text,
  arju_summary     text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_logs_self" ON day_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── progress (progreso general) ───────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  challenge_day     int  DEFAULT 1,
  total_workouts    int  DEFAULT 0,
  total_meals       int  DEFAULT 0,
  total_days_closed int  DEFAULT 0,
  current_streak    int  DEFAULT 0,
  best_streak       int  DEFAULT 0,
  last_active_date  date,
  updated_at        timestamptz DEFAULT now()
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_self" ON progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_admin" ON progress FOR SELECT USING (is_admin_user());

-- ── personal_records (PRs de fuerza) ──────────────────────────
CREATE TABLE IF NOT EXISTS personal_records (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  weight      numeric(6,2),
  reps        int,
  weight_unit text DEFAULT 'kg',
  achieved_at date DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_self" ON personal_records FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── exercise_progress (historial por ejercicio) ───────────────
CREATE TABLE IF NOT EXISTS exercise_progress (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  date        date DEFAULT CURRENT_DATE,
  sets_done   int  DEFAULT 0,
  best_weight numeric(6,2),
  best_reps   int,
  notes       text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ep_self" ON exercise_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── workout_sets (alias de set_logs, por compatibilidad) ──────
-- Algunas páginas usan 'workout_sets' en vez de 'set_logs'
CREATE TABLE IF NOT EXISTS workout_sets (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_log_id   uuid REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id      text NOT NULL,
  set_number       int  DEFAULT 1,
  reps             int,
  weight           numeric(6,2),
  weight_unit      text DEFAULT 'kg',
  perceived_effort int,
  completed        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_self" ON workout_sets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── ai_conversations (historial coach Arju) ───────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mode          text DEFAULT 'daily_coach',
  user_message  text,
  arju_message  text,
  context_json  jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_conv_self" ON ai_conversations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
