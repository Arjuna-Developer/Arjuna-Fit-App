-- ═══════════════════════════════════════════════
-- ArjunaFit — daily_closures table
-- Run in: Supabase SQL Editor
-- ═══════════════════════════════════════════════

create table if not exists public.daily_closures (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  date          date not null,
  mood          text,
  selected_wins text[],
  tomorrow_focus text,
  workout_status text default 'pending',
  meals_logged  integer default 0,
  recipes_added integer default 0,
  restaurant_meals_logged integer default 0,
  coach_used    boolean default false,
  progress_logged boolean default false,
  arju_reflection text,
  metadata_json jsonb,
  created_at    timestamptz default now(),
  unique (user_id, date)
);

-- Row Level Security
alter table public.daily_closures enable row level security;

create policy "users_own_closures"
  on public.daily_closures
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admin_read_all_closures"
  on public.daily_closures
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index for fast daily lookups
create index if not exists idx_daily_closures_user_date
  on public.daily_closures (user_id, date desc);
