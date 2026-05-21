-- ═══════════════════════════════════════════════
-- ArjunaFit — meal_logs + progress_entries
-- Run in: Supabase SQL Editor
-- ═══════════════════════════════════════════════

create table if not exists public.meal_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  date          date not null,
  meal_type     text,
  name          text not null,
  calories      integer,
  protein_g     integer,
  carbs_g       integer,
  fat_g         integer,
  source        text default 'manual',
  metadata_json jsonb,
  created_at    timestamptz default now()
);
alter table public.meal_logs enable row level security;
create policy "users_own_meal_logs" on public.meal_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_meal_logs_user_date on public.meal_logs(user_id, date desc);

create table if not exists public.progress_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null,
  photo_url  text,
  weight     numeric(5,2),
  waist      numeric(5,2),
  hips       numeric(5,2),
  chest      numeric(5,2),
  leg        numeric(5,2),
  mood       text,
  note       text,
  created_at timestamptz default now(),
  unique (user_id, date)
);
alter table public.progress_entries enable row level security;
create policy "users_own_progress" on public.progress_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
