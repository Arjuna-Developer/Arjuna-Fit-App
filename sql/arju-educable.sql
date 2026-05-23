-- ArjunaFit — Arju Educable
-- Ejecutar en Supabase SQL Editor

-- 1. MEMORIA ENTRE SESIONES
CREATE TABLE IF NOT EXISTS arju_memory (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user','assistant')),
  content    text NOT NULL,
  mode       text DEFAULT 'daily_coach',
  session_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE arju_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arju_memory_self" ON arju_memory;
CREATE POLICY "arju_memory_self" ON arju_memory
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_arju_memory_user ON arju_memory(user_id, created_at DESC);

-- 2. FEEDBACK LOOP
CREATE TABLE IF NOT EXISTS arju_feedback (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_id    uuid REFERENCES arju_memory(id) ON DELETE SET NULL,
  rating       smallint CHECK (rating IN (1, -1)),
  comment      text,
  mode         text,
  user_message text,
  arju_reply   text,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE arju_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arju_feedback_self" ON arju_feedback;
CREATE POLICY "arju_feedback_self" ON arju_feedback
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. RAG KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS arju_knowledge (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title    text NOT NULL,
  content  text NOT NULL,
  tags     text[],
  active   boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE arju_knowledge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arju_knowledge_read" ON arju_knowledge;
CREATE POLICY "arju_knowledge_read" ON arju_knowledge FOR SELECT USING (true);

-- 4. FINE-TUNING DATASET
CREATE TABLE IF NOT EXISTS arju_training (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message text NOT NULL,
  ideal_reply  text NOT NULL,
  mode         text DEFAULT 'daily_coach',
  source       text DEFAULT 'manual',
  approved     boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE arju_training ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arju_training_admin" ON arju_training;
CREATE POLICY "arju_training_admin" ON arju_training
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. SEED knowledge base
INSERT INTO arju_knowledge (category, title, content, tags) VALUES
('nutricion', 'Proteina para gluteos', 'Para crecer gluteos necesitas 1.6-2.2g proteina por kg de peso. Fuentes colombianas: pechuga de pollo (31g/100g), atun (25g/100g), huevo (13g/100g), carne magra, frijoles con queso.', ARRAY['proteina','gluteos','colombia']),
('nutricion', 'Comida colombiana saludable', 'Colombia tiene grandes opciones fitness: sopa de lentejas, sancocho de pollo, arepas con huevo, aguacate hass, frijol rojo (9g prot/100g cocido). La bandeja paisa sin chicharron es alta en proteina.', ARRAY['colombia','comida','proteina']),
('entrenamiento', 'Progresion de gluteos', 'La progresion debe ser semanal. Semanas 1-2: tecnica. Semanas 3-4: +2.5kg. Semanas 5-6: mas repeticiones. Ejercicios clave: hip thrust, sentadilla bulgara, peso muerto rumano. Descanso 48h obligatorio.', ARRAY['gluteos','progresion','entrenamiento']),
('motivacion', 'Dias sin ganas', 'Tener dias sin motivacion es normal. La diferencia entre las que logran su objetivo y las que no es actuar aunque no tengan ganas. 5 minutos activan el sistema dopaminergico. Empieza pequeño.', ARRAY['motivacion','habito','constancia']),
('nutricion', 'Deficit para pancita', 'Para bajar grasa abdominal: deficit de 300-500 kcal/dia. No menos para no perder musculo. Proteina primero (sacia), carbos despues. Evitar: ultraprocesados, alcohol, exceso de sodio.', ARRAY['pancita','deficit','grasa'])
ON CONFLICT DO NOTHING;
