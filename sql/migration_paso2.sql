-- ══════════════════════════════════════════════════
-- ArjunaFit — Migración Paso 2
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════

-- ── Campos nuevos en profiles ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_current INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_max INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_workout_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-Q3';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_reto TEXT; -- 'gluteos' | 'abdomen'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workout_day_num INT DEFAULT 0; -- día actual del reto (1-24)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onesignal_id TEXT;

-- ── Tabla: day_logs (registro diario) ──────────────
CREATE TABLE IF NOT EXISTS day_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Nutrición
  calorias_consumidas NUMERIC(8,2) DEFAULT 0,
  proteina_consumida  NUMERIC(6,2) DEFAULT 0,
  carbs_consumidos    NUMERIC(6,2) DEFAULT 0,
  grasas_consumidas   NUMERIC(6,2) DEFAULT 0,
  agua_ml             INT DEFAULT 0,
  -- Bienestar
  estado_animo        INT CHECK (estado_animo BETWEEN 1 AND 5),
  energia             INT CHECK (energia BETWEEN 1 AND 5),
  horas_sueno         NUMERIC(3,1),
  notas               TEXT,
  -- Entrenamiento
  workout_completed   BOOLEAN DEFAULT FALSE,
  workout_duration    INT, -- segundos
  volumen_total       NUMERIC(10,2) DEFAULT 0, -- kg * reps
  -- Metadatos
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ── Tabla: ai_conversations ────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content    TEXT NOT NULL,
  context    JSONB,
  tokens     INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla: personal_records ────────────────────────
CREATE TABLE IF NOT EXISTS personal_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  record_type   TEXT NOT NULL CHECK (record_type IN ('max_kg', 'max_volume', 'max_reps')),
  value         NUMERIC(10,2) NOT NULL,
  prev_value    NUMERIC(10,2),
  week_num      INT,
  day_num       INT,
  achieved_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla: notifications_config ───────────────────
CREATE TABLE IF NOT EXISTS notifications_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  workout_enabled BOOLEAN DEFAULT TRUE,
  workout_time    TIME DEFAULT '07:00:00',
  meal_enabled    BOOLEAN DEFAULT FALSE,
  meal_times      TEXT[] DEFAULT '{"08:00","13:00","19:00"}',
  streak_enabled  BOOLEAN DEFAULT TRUE,
  reengagement    BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla: ai_skills (admin panel) ────────────────
CREATE TABLE IF NOT EXISTS ai_skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name    TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  examples_good TEXT[] DEFAULT '{}',
  examples_bad  TEXT[] DEFAULT '{}',
  updated_by    UUID REFERENCES auth.users(id),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────
ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_skills ENABLE ROW LEVEL SECURITY;

-- Policies day_logs
DROP POLICY IF EXISTS "own_day_logs" ON day_logs;
CREATE POLICY "own_day_logs" ON day_logs FOR ALL USING (auth.uid() = user_id);

-- Policies ai_conversations
DROP POLICY IF EXISTS "own_conversations" ON ai_conversations;
CREATE POLICY "own_conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- Policies personal_records
DROP POLICY IF EXISTS "own_prs" ON personal_records;
CREATE POLICY "own_prs" ON personal_records FOR ALL USING (auth.uid() = user_id);

-- Policies notifications_config
DROP POLICY IF EXISTS "own_notifications" ON notifications_config;
CREATE POLICY "own_notifications" ON notifications_config FOR ALL USING (auth.uid() = user_id);

-- Policies ai_skills (solo admin)
DROP POLICY IF EXISTS "admin_skills" ON ai_skills;
CREATE POLICY "admin_skills" ON ai_skills FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── Índices ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_day_logs_user_date ON day_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prs_user_exercise ON personal_records(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_prs_user_date ON personal_records(user_id, achieved_at DESC);

-- ── Triggers updated_at ────────────────────────────
DROP TRIGGER IF EXISTS day_logs_updated_at ON day_logs;
CREATE TRIGGER day_logs_updated_at BEFORE UPDATE ON day_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Skill inicial: Coach Principal ────────────────
INSERT INTO ai_skills (skill_name, display_name, system_prompt, active)
VALUES (
  'coach_principal',
  'Coach Principal',
  'Eres Arjuna, coach de fitness y nutrición de ArjunaFit LATAM. Estilo: calmado, premium, directo, humano. Nunca genérico. Siempre usas el contexto real del usuario. Respuestas cortas (2-3 oraciones máx). Sin motivación tóxica. Sin obsesión con calorías. Español colombiano/LATAM. Tono cálido pero profesional. Enfoque: transformación sostenible.',
  TRUE
) ON CONFLICT (skill_name) DO NOTHING;

INSERT INTO ai_skills (skill_name, display_name, system_prompt, active)
VALUES (
  'nutricion_latam',
  'Nutrición LATAM',
  'Especialista en nutrición para mujeres LATAM. Das consejos prácticos con alimentos locales (arroz, fríjoles, plátano, aguacate, pollo, etc). No obsesión con macros exactos. Enfoque en hábitos reales y sostenibles. Recetas simples, económicas, deliciosas. Sin dietas restrictivas ni conteo obsesivo.',
  TRUE
) ON CONFLICT (skill_name) DO NOTHING;

-- ── Insertar notificaciones default para usuarios existentes ──
INSERT INTO notifications_config (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notifications_config)
ON CONFLICT DO NOTHING;

-- ── Log final ─────────────────────────────────────
DO $$ BEGIN
  RAISE NOTICE '✅ Migración Paso 2 completada: day_logs, ai_conversations, personal_records, notifications_config, ai_skills';
END $$;
