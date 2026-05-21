-- ═══════════════════════════════════════════════
-- ArjunaFit — custom_recipes table
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS custom_recipes (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  name                  text not null,
  ingredients_text      text,
  servings              numeric default 1,
  total_calories        numeric default 0,
  total_protein_g       numeric default 0,
  total_carbs_g         numeric default 0,
  total_fat_g           numeric default 0,
  per_serving_calories  numeric default 0,
  per_serving_protein_g numeric default 0,
  per_serving_carbs_g   numeric default 0,
  per_serving_fat_g     numeric default 0,
  source                text default 'custom_recipe_ai',
  confidence            text default 'medium',
  metadata_json         jsonb,
  created_at            timestamptz default now()
);

-- RLS
ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_recipes" ON custom_recipes;
CREATE POLICY "users_own_recipes" ON custom_recipes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
