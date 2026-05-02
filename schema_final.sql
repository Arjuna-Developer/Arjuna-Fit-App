-- ══════════════════════════════════════════════════
-- ArjunaFit — Schema Final (ejecutar completo)
-- ══════════════════════════════════════════════════

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre          TEXT,
  genero          TEXT,
  entorno         TEXT,
  objetivo        TEXT,
  peso            NUMERIC(5,2),
  altura          NUMERIC(5,2),
  edad            INT,
  actividad       TEXT,
  role            TEXT DEFAULT 'user',
  tmb             NUMERIC(8,2),
  tdee            NUMERIC(8,2),
  calorias_objetivo NUMERIC(8,2),
  proteina_g      NUMERIC(6,2),
  carbs_g         NUMERIC(6,2),
  grasas_g        NUMERIC(6,2),
  imc             NUMERIC(5,2),
  nivel_entrenamiento TEXT,
  series_efectivas INT,
  descanso_segundos INT,
  food_restrictions TEXT[] DEFAULT '{}',
  injuries        TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso (días completados)
CREATE TABLE IF NOT EXISTS progress (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_num   INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_num)
);

-- Tabla de fotos de progreso
CREATE TABLE IF NOT EXISTS progress_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_num    INT NOT NULL,
  photo_url   TEXT NOT NULL,
  peso_semana NUMERIC(5,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de series de entrenamiento
CREATE TABLE IF NOT EXISTS workout_sets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_num       INT NOT NULL,
  week_num      INT NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_idx  INT NOT NULL,
  set_type      TEXT NOT NULL,
  set_num       INT NOT NULL,
  kg            NUMERIC(5,2),
  reps_done     INT,
  seconds       INT,
  rpe           INT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progresión semanal por ejercicio
CREATE TABLE IF NOT EXISTS exercise_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_num        INT NOT NULL,
  exercise_name   TEXT NOT NULL,
  max_kg          NUMERIC(5,2),
  avg_kg          NUMERIC(5,2),
  total_volume    NUMERIC(8,2),
  completed_sets  INT DEFAULT 0,
  all_reps_done   BOOLEAN DEFAULT FALSE,
  ready_to_up     BOOLEAN DEFAULT FALSE,
  suggested_kg    NUMERIC(5,2),
  UNIQUE(user_id, week_num, exercise_name)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;

-- Policies (DROP IF EXISTS para evitar conflictos)
DROP POLICY IF EXISTS "own_profile" ON profiles;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_view_all" ON profiles;
CREATE POLICY "admin_view_all" ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "own_progress" ON progress;
CREATE POLICY "own_progress" ON progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_photos" ON progress_photos;
CREATE POLICY "own_photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_photos" ON progress_photos;
CREATE POLICY "admin_photos" ON progress_photos FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "sets_own" ON workout_sets;
CREATE POLICY "sets_own" ON workout_sets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "exprog_own" ON exercise_progress;
CREATE POLICY "exprog_own" ON exercise_progress FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_day ON workout_sets(user_id, day_num);
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise ON workout_sets(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_exprog_user_week ON exercise_progress(user_id, week_num);

-- Trigger updated_at en profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "photos_insert" ON storage.objects;
CREATE POLICY "photos_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "photos_select" ON storage.objects;
CREATE POLICY "photos_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'progress-photos');

-- Admin role setup (cambia el email)
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'arjuna.desarrollador@gmail.com');
