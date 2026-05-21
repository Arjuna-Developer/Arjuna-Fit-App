-- ═══════════════════════════════════════════════════════
-- ArjunaFit — food_photo_logs table
-- Correr en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS food_photo_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  analyzed_at   timestamptz DEFAULT now(),
  image_size_kb integer,
  foods         jsonb,         -- array de alimentos detectados
  total_cal     integer,
  total_prot    numeric(6,1),
  total_carb    numeric(6,1),
  total_fat     numeric(6,1),
  confidence    numeric(4,2),
  raw_response  text,
  source        text DEFAULT 'gpt4o'
);

CREATE INDEX IF NOT EXISTS idx_food_photo_logs_user ON food_photo_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_photo_logs_date ON food_photo_logs(analyzed_at);

-- RLS: usuarios solo ven sus propios registros
ALTER TABLE food_photo_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_photos" ON food_photo_logs;
CREATE POLICY "own_photos" ON food_photo_logs
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- admin_actions table (si no existe)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_actions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid REFERENCES profiles(id),
  target_id   uuid REFERENCES profiles(id),
  action      text NOT NULL,
  reason      text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin  ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_id);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_only" ON admin_actions;
CREATE POLICY "admins_only" ON admin_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ═══════════════════════════════════════════════════════
-- nutrition_logs table (si no existe)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  name        text NOT NULL,
  calories    integer DEFAULT 0,
  protein     numeric(6,1) DEFAULT 0,
  carbs       numeric(6,1) DEFAULT 0,
  fat         numeric(6,1) DEFAULT 0,
  meal        text DEFAULT 'snack',
  source      text DEFAULT 'manual',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_nutrition" ON nutrition_logs;
CREATE POLICY "own_nutrition" ON nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- RPC admin_activate_challenge
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION admin_activate_challenge(
  target_user_id uuid,
  challenge_type text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT is_admin INTO caller_is_admin FROM profiles WHERE id = auth.uid();
  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Forbidden: caller is not admin';
  END IF;

  UPDATE profiles SET
    product_type        = challenge_type,
    subscription_status = 'active',
    access_level        = 'full',
    onboarding_completed = true,
    updated_at          = now()
  WHERE id = target_user_id;

  INSERT INTO admin_actions(admin_id, target_id, action, reason, created_at)
  VALUES (auth.uid(), target_user_id, 'activate_' || challenge_type, 'manual_admin', now());

  RETURN json_build_object('success', true, 'product', challenge_type, 'user_id', target_user_id);
END;
$$;

-- ═══════════════════════════════════════════════════════
-- RPC admin_activate_plan
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION admin_activate_plan(
  target_user_id uuid,
  plan_type text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT is_admin INTO caller_is_admin FROM profiles WHERE id = auth.uid();
  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Forbidden: caller is not admin';
  END IF;

  UPDATE profiles SET
    product_type        = plan_type,
    subscription_status = 'active',
    access_level        = 'full',
    onboarding_completed = true,
    updated_at          = now()
  WHERE id = target_user_id;

  INSERT INTO admin_actions(admin_id, target_id, action, reason, created_at)
  VALUES (auth.uid(), target_user_id, 'activate_' || plan_type, 'manual_admin', now());

  RETURN json_build_object('success', true, 'product', plan_type, 'user_id', target_user_id);
END;
$$;
