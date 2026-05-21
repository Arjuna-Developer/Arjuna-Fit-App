-- ═══════════════════════════════════════════════════════
-- ArjunaFit — Payments + Community SQL
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── payments table ────────────────────────────────────
create table if not exists payments (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete set null,
  email               text not null,
  product_type        text not null,
  product_name        text,
  amount              numeric(10,2) not null,
  currency            text default 'USD',
  provider            text default 'hotmart',
  provider_payment_id text unique,       -- idempotency key
  provider_customer_id text,
  status              text default 'pending',
  payment_id          uuid,              -- self-reference for linked payments
  raw_payload_json    text,
  metadata_json       text,
  validated_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- status values: pending | approved | failed | refunded | cancelled | needs_review
create index if not exists payments_email_idx on payments(email);
create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists payments_provider_payment_id_idx on payments(provider_payment_id);

-- ── community_memberships table ───────────────────────
create table if not exists community_memberships (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade,
  email            text,
  community_id     text not null default 'free_arjunafit_community',
  community_name   text default 'Comunidad gratuita ArjunaFit',
  membership_type  text default 'free',
  status           text default 'active',
  joined_at        timestamptz default now(),
  source           text,                  -- 'payment_approved' | 'manual' | 'signup'
  created_at       timestamptz default now()
);

create unique index if not exists community_memberships_user_community_idx
  on community_memberships(user_id, community_id) where user_id is not null;

create unique index if not exists community_memberships_email_community_idx
  on community_memberships(email, community_id) where email is not null and user_id is null;

-- ── profiles additions ────────────────────────────────
alter table profiles add column if not exists paid_amount     numeric(10,2);
alter table profiles add column if not exists payment_id      uuid references payments(id);
alter table profiles add column if not exists activated_at    timestamptz;
alter table profiles add column if not exists account_status  text default 'active';
alter table profiles add column if not exists email           text;
-- account_status values: active | pending_password_setup

-- ── RLS policies ──────────────────────────────────────
alter table payments enable row level security;
alter table community_memberships enable row level security;

-- Users can read their own payments
create policy if not exists "payments_self_read"
  on payments for select
  using (auth.uid() = user_id);

-- Service role can write payments (webhook uses service key)
create policy if not exists "payments_service_write"
  on payments for all
  using (true)
  with check (true);

-- Users can read their own community memberships
create policy if not exists "community_self_read"
  on community_memberships for select
  using (auth.uid() = user_id);

-- Service role can write community memberships
create policy if not exists "community_service_write"
  on community_memberships for all
  using (true)
  with check (true);

-- ── Helper: get active membership ─────────────────────
create or replace view user_active_membership as
select
  cm.user_id,
  cm.community_id,
  cm.community_name,
  cm.membership_type,
  cm.status,
  cm.joined_at
from community_memberships cm
where cm.status = 'active';


-- ── payment_reconciliation_logs ─────────────────────────────────
create table if not exists payment_reconciliation_logs (
  id           uuid default gen_random_uuid() primary key,
  payment_id   uuid references payments(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  issue_type   text not null,  -- missing_user | invalid_amount | invalid_currency | invalid_product | duplicate_webhook | access_not_activated | community_not_assigned | needs_manual_review
  status       text default 'open',  -- open | resolved | ignored
  description  text,
  resolved_by  text,  -- admin identifier
  resolved_at  timestamptz,
  created_at   timestamptz default now()
);
create index if not exists reconciliation_status_idx on payment_reconciliation_logs(status);
create index if not exists reconciliation_payment_idx on payment_reconciliation_logs(payment_id);

-- View for admin: open issues with payment details
create or replace view v_payment_issues as
select
  rl.id,
  rl.issue_type,
  rl.status,
  rl.description,
  rl.created_at,
  p.email,
  p.product_type,
  p.product_name,
  p.amount,
  p.currency,
  p.status as payment_status,
  p.provider_payment_id
from payment_reconciliation_logs rl
left join payments p on p.id = rl.payment_id
where rl.status = 'open'
order by rl.created_at desc;

-- ── support_tickets ──────────────────────────────────────────────
create table if not exists support_tickets (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete set null,
  email               text,
  category            text not null,  -- no_puedo_entrar | no_puedo_registrarme | problema_pago | pague_sin_acceso | etc
  message             text not null,
  route               text,           -- page where issue occurred
  product_type        text,
  subscription_status text,
  access_level        text,
  payment_status      text,
  priority            text default 'medium',  -- low | medium | high | urgent
  status              text default 'open',    -- open | in_review | waiting_user | resolved | closed
  assigned_to         text,
  metadata_json       text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists tickets_status_idx   on support_tickets(status);
create index if not exists tickets_priority_idx on support_tickets(priority);
create index if not exists tickets_user_idx     on support_tickets(user_id);
create index if not exists tickets_cat_idx      on support_tickets(category);

-- ── support_ticket_notes (internal) ─────────────────────────────
create table if not exists support_ticket_notes (
  id           uuid default gen_random_uuid() primary key,
  ticket_id    uuid references support_tickets(id) on delete cascade,
  admin_user_id text not null,
  note         text not null,
  created_at   timestamptz default now()
);

-- RLS: users can only read their own tickets
alter table support_tickets enable row level security;
create policy if not exists "tickets_self_read" on support_tickets for select using (auth.uid() = user_id);
create policy if not exists "tickets_insert"    on support_tickets for insert with check (true);

-- Notes are admin-only (service key)
alter table support_ticket_notes enable row level security;
create policy if not exists "notes_service" on support_ticket_notes for all using (true);

-- ── app_events ────────────────────────────────────────────────────
create table if not exists app_events (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete set null,
  session_id    text,
  event_name    text not null,
  route         text,
  product_type  text,
  metadata_json text,
  app_version   text,
  created_at    timestamptz default now()
);
create index if not exists events_name_idx     on app_events(event_name);
create index if not exists events_user_idx     on app_events(user_id);
create index if not exists events_product_idx  on app_events(product_type);
create index if not exists events_created_idx  on app_events(created_at desc);

-- RLS: service role writes, users read own
alter table app_events enable row level security;
create policy if not exists "events_self_read" on app_events for select using (auth.uid() = user_id);
create policy if not exists "events_insert"    on app_events for insert with check (true);

-- ── client_errors ─────────────────────────────────────────────────
create table if not exists client_errors (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete set null,
  message     text not null,
  stack       text,
  route       text,
  component   text,
  app_version text,
  created_at  timestamptz default now()
);
alter table client_errors enable row level security;
create policy if not exists "errors_insert" on client_errors for insert with check (true);

-- ── Useful views for growth panel ─────────────────────────────────
create or replace view v_funnel_today as
select
  event_name,
  product_type,
  count(*) as event_count,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from app_events
where created_at >= current_date
group by event_name, product_type
order by event_count desc;

create or replace view v_trial_status as
select
  product_type,
  subscription_status,
  count(*) as users
from profiles
where product_type in ('challenge_glutes', 'challenge_belly')
group by product_type, subscription_status
order by product_type, users desc;

create or replace view v_payment_summary as
select
  product_type,
  status,
  currency,
  count(*) as count,
  sum(amount) as total_amount
from payments
group by product_type, status, currency
order by product_type, count desc;

-- ══════════════════════════════════════════════════════════════
-- CRM LIGERO — commercial_contacts + notas + touchpoints
-- ══════════════════════════════════════════════════════════════

create table if not exists commercial_contacts (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users(id) on delete set null,
  email             text,
  name              text,
  phone             text,
  product_interest  text default 'unknown',   -- challenge_glutes | challenge_belly | custom_muscle_gain | custom_fat_loss | unknown
  product_type      text,
  source            text,
  funnel_stage      text default 'landing_visitor',
  -- funnel_stage: landing_visitor | product_selected | signup_started | signup_completed |
  --   onboarding_completed | day1_activated | trial_day6 | trial_day7 | unlock_clicked |
  --   checkout_started | payment_pending | payment_approved | custom_intake_completed | support_requested
  intent_score      int default 0,
  status            text default 'new',  -- new|active|contacted|waiting_reply|won|lost|no_response|needs_support
  last_event_name   text,
  last_event_at     timestamptz,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  assigned_to       text,
  metadata_json     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create unique index if not exists cc_user_idx  on commercial_contacts(user_id) where user_id is not null;
create unique index if not exists cc_email_idx on commercial_contacts(email)   where email is not null and user_id is null;
create index if not exists cc_stage_idx  on commercial_contacts(funnel_stage);
create index if not exists cc_intent_idx on commercial_contacts(intent_score desc);
create index if not exists cc_status_idx on commercial_contacts(status);
create index if not exists cc_followup_idx on commercial_contacts(next_follow_up_at);

-- ── commercial_notes ─────────────────────────────────────────────
create table if not exists commercial_notes (
  id           uuid default gen_random_uuid() primary key,
  contact_id   uuid references commercial_contacts(id) on delete cascade,
  user_id      uuid,
  admin_user_id text,
  note         text not null,
  note_type    text default 'general',  -- follow_up|payment|objection|support|manual_activation|general
  created_at   timestamptz default now()
);

-- ── commercial_touchpoints ───────────────────────────────────────
create table if not exists commercial_touchpoints (
  id              uuid default gen_random_uuid() primary key,
  contact_id      uuid references commercial_contacts(id) on delete cascade,
  user_id         uuid,
  channel         text default 'in_app',  -- whatsapp|instagram_dm|email|phone|in_app|manual
  direction       text default 'outbound', -- outbound|inbound
  message_summary text,
  status          text default 'sent',    -- sent|replied|no_response|completed
  created_at      timestamptz default now(),
  created_by      text
);

-- ── commercial_objections ────────────────────────────────────────
create table if not exists commercial_objections (
  id             uuid default gen_random_uuid() primary key,
  contact_id     uuid references commercial_contacts(id) on delete cascade,
  objection_type text not null,  -- no_tengo_tiempo|no_tengo_gym|no_entiendo_prueba|me_parece_costoso|etc
  note           text,
  product_type   text,
  created_at     timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────────
alter table commercial_contacts   enable row level security;
alter table commercial_notes      enable row level security;
alter table commercial_touchpoints enable row level security;
alter table commercial_objections  enable row level security;

-- Service role only (admin operations via service key)
create policy if not exists "cc_service"  on commercial_contacts   for all using (true);
create policy if not exists "cn_service"  on commercial_notes      for all using (true);
create policy if not exists "ct_service"  on commercial_touchpoints for all using (true);
create policy if not exists "co_service"  on commercial_objections  for all using (true);

-- ── Intent score helper function ─────────────────────────────────
create or replace function intent_label(score int) returns text as $$
begin
  if score >= 30 then return 'Muy alta';
  elsif score >= 15 then return 'Alta';
  elsif score >= 6  then return 'Media';
  else return 'Baja';
  end if;
end;
$$ language plpgsql;

-- ── View: follow-ups today ────────────────────────────────────────
create or replace view v_followups_today as
select id, email, name, product_interest, funnel_stage, intent_score, status, next_follow_up_at
from commercial_contacts
where next_follow_up_at::date <= current_date and status not in ('won','lost')
order by intent_score desc;

-- ── View: high intent leads ───────────────────────────────────────
create or replace view v_high_intent_leads as
select id, email, name, product_interest, funnel_stage, intent_score, status, last_event_name, last_event_at
from commercial_contacts
where intent_score >= 15 and status not in ('won','lost')
order by intent_score desc, last_event_at desc;

-- ── nutrition_logs ────────────────────────────────────────────────
create table if not exists nutrition_logs (
  id                 uuid default gen_random_uuid() primary key,
  user_id            uuid references auth.users(id) on delete cascade,
  date               date not null default current_date,
  meal_type          text default 'otro',  -- desayuno|almuerzo|snack|cena|otro
  source_type        text default 'manual',-- photo|text|recipe|manual
  food_items_json    text,                 -- array of {name,cal,prot,carb,fat,qty,unit}
  total_calories     int default 0,
  total_protein      int default 0,
  total_carbs        int default 0,
  total_fat          int default 0,
  image_url          text,
  raw_input          text,
  confidence_score   numeric(3,2),
  notes              text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists nlogs_user_date_idx on nutrition_logs(user_id, date desc);
alter table nutrition_logs enable row level security;
create policy if not exists "nlogs_self" on nutrition_logs for all using (auth.uid() = user_id);

-- ── user_recipe_favorites ────────────────────────────────────────
create table if not exists user_recipe_favorites (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  recipe_id  text not null,
  created_at timestamptz default now(),
  unique (user_id, recipe_id)
);
alter table user_recipe_favorites enable row level security;
create policy if not exists "favorites_self" on user_recipe_favorites for all using (auth.uid() = user_id);

-- ── workout_logs ─────────────────────────────────────────────────
create table if not exists workout_logs (
  id                     uuid default gen_random_uuid() primary key,
  user_id                uuid references auth.users(id) on delete cascade,
  workout_id             text,
  product_type           text,
  challenge_type         text,
  date                   date default current_date,
  status                 text default 'started',  -- started | completed | abandoned
  started_at             timestamptz default now(),
  completed_at           timestamptz,
  total_duration_seconds int default 0,
  notes                  text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
create index if not exists wlogs_user_date on workout_logs(user_id, date desc);
alter table workout_logs enable row level security;
create policy if not exists "wlogs_self" on workout_logs for all using (auth.uid() = user_id);

-- ── set_logs ─────────────────────────────────────────────────────
create table if not exists set_logs (
  id               uuid default gen_random_uuid() primary key,
  workout_log_id   uuid references workout_logs(id) on delete cascade,
  exercise_id      text not null,
  set_number       int default 1,
  reps             int,
  weight           numeric(6,2),
  weight_unit      text default 'kg',
  perceived_effort int,  -- 1-10
  completed        boolean default true,
  created_at       timestamptz default now()
);
alter table set_logs enable row level security;
create policy if not exists "slogs_self" on set_logs for all using (
  auth.uid() = (select user_id from workout_logs where id = set_logs.workout_log_id)
);

-- ── beta_feedback ────────────────────────────────────────────────
create table if not exists beta_feedback (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete set null,
  email            text,
  product_type     text,
  rating_overall   int,   -- 1-5
  rating_clarity   int,
  rating_design    int,
  rating_nutrition int,
  rating_workout   int,
  rating_home      int,
  easiest_part     text,
  confusing_part   text,
  missing_feature  text,
  would_pay        text,  -- 'yes' | 'maybe' | 'no'
  would_recommend  int,   -- 1-5
  feedback_text    text,
  beta_group       text,  -- internal | external
  created_at       timestamptz default now()
);
alter table beta_feedback enable row level security;
create policy if not exists "beta_feedback_insert" on beta_feedback for insert with check (true);
create policy if not exists "beta_feedback_self"   on beta_feedback for select using (auth.uid() = user_id);

-- ── Admin profile setup ──────────────────────────────────────────
-- Add is_admin column to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- Grant admin to arjuna.desarrollador@gmail.com
-- Run AFTER the user has registered via Supabase Auth
-- (Never hardcode passwords - authentication is handled by Supabase Auth)
update profiles
set
  is_admin = true,
  role     = 'admin',
  name     = coalesce(name, 'Arjuna Desarrollador')
where email = 'arjuna.desarrollador@gmail.com';

-- RLS policy: allow admin to read all profiles
create policy if not exists "admin_read_all_profiles"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from profiles p2
      where p2.id = auth.uid() and p2.is_admin = true
    )
  );

-- Allow admin to read all payments
create policy if not exists "admin_read_payments"
  on payments for select
  using (
    auth.uid() in (
      select id from profiles where is_admin = true
    )
  );

-- Allow admin to read all support_tickets
create policy if not exists "admin_read_tickets"
  on support_tickets for select
  using (
    auth.uid() = user_id
    or auth.uid() in (select id from profiles where is_admin = true)
  );

-- Allow admin to update tickets
create policy if not exists "admin_update_tickets"
  on support_tickets for update
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow admin to read all app_events
create policy if not exists "admin_read_events"
  on app_events for select
  using (
    auth.uid() = user_id
    or auth.uid() in (select id from profiles where is_admin = true)
  );

-- Allow admin to read beta_feedback
create policy if not exists "admin_read_beta_feedback"
  on beta_feedback for select
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow admin to read commercial_contacts
create policy if not exists "admin_read_commercial"
  on commercial_contacts for select
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow admin to update commercial_contacts
create policy if not exists "admin_update_commercial"
  on commercial_contacts for update
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow admin to read community_memberships
create policy if not exists "admin_read_community"
  on community_memberships for select
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow admin to insert community_memberships (manual activation)
create policy if not exists "admin_insert_community"
  on community_memberships for insert
  with check (auth.uid() in (select id from profiles where is_admin = true));

-- ── admin_actions ────────────────────────────────────────────────
create table if not exists admin_actions (
  id               uuid default gen_random_uuid() primary key,
  admin_user_id    uuid references auth.users(id),
  target_user_id   uuid references auth.users(id),
  action_type      text not null,
  previous_status  text,
  new_status       text,
  product_type     text,
  metadata_json    jsonb default '{}',
  created_at       timestamptz default now()
);
alter table admin_actions enable row level security;
create policy if not exists "admin_actions_admin_only"
  on admin_actions for all
  using (auth.uid() in (select id from profiles where is_admin = true));

-- ════════════════════════════════════════════════════════════════
-- SPRINT: security-rls-production-v1
-- Comprehensive RLS policies + app_errors table
-- ════════════════════════════════════════════════════════════════

-- ── Helper function: is current user admin? ──────────────────────
create or replace function is_admin_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and (is_admin = true or role = 'admin')
  );
$$;

-- ── app_errors (internal error log) ─────────────────────────────
create table if not exists app_errors (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete set null,
  route         text,
  error_message text,
  error_stack   text,
  severity      text default 'error',  -- info | warning | error | critical
  metadata_json jsonb default '{}',
  created_at    timestamptz default now()
);
create index if not exists app_errors_created on app_errors(created_at desc);
alter table app_errors enable row level security;
-- Users can insert their own errors; admin can read all
create policy if not exists "app_errors_user_insert"
  on app_errors for insert with check (auth.uid() = user_id or user_id is null);
create policy if not exists "app_errors_admin_read"
  on app_errors for select using (is_admin_user());

-- ── profiles — tighten RLS ───────────────────────────────────────
-- Drop any permissive policy first, then recreate safely
drop policy if exists "profiles_self_read" on profiles;
drop policy if exists "profiles_self_update" on profiles;
drop policy if exists "admin_read_all_profiles" on profiles;
drop policy if exists "profiles_allow_all" on profiles;

-- User reads own profile; admin reads all
create policy "profiles_self_read"
  on profiles for select
  using (auth.uid() = id or is_admin_user());

-- User updates own profile; CANNOT change role/is_admin/subscription_status/access_level
create policy "profiles_self_update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- User inserts own profile (on signup trigger)
create policy if not exists "profiles_self_insert"
  on profiles for insert with check (auth.uid() = id);

-- ── payments — protect writes ────────────────────────────────────
drop policy if exists "admin_read_payments" on payments;
drop policy if exists "payments_user_read" on payments;

-- User reads own payments
create policy "payments_user_read"
  on payments for select
  using (auth.uid() = user_id or is_admin_user());

-- NOBODY can insert/update payments from frontend (only service role / webhook backend)
-- (No insert/update policy = blocked for anon + authenticated roles)

-- ── support_tickets ──────────────────────────────────────────────
drop policy if exists "admin_read_tickets" on support_tickets;
drop policy if exists "admin_update_tickets" on support_tickets;
drop policy if exists "ticket_user_select" on support_tickets;
drop policy if exists "ticket_user_insert" on support_tickets;

create policy "ticket_user_select"
  on support_tickets for select
  using (auth.uid() = user_id or is_admin_user());
create policy "ticket_user_insert"
  on support_tickets for insert
  with check (auth.uid() = user_id);
create policy "ticket_admin_update"
  on support_tickets for update
  using (is_admin_user());

-- ── support_ticket_notes — admin only ────────────────────────────
drop policy if exists "notes_admin" on support_ticket_notes;
create policy "notes_admin"
  on support_ticket_notes for all
  using (is_admin_user())
  with check (is_admin_user());

-- ── community_memberships ────────────────────────────────────────
drop policy if exists "community_self_read" on community_memberships;
drop policy if exists "admin_read_community" on community_memberships;
drop policy if exists "admin_insert_community" on community_memberships;

-- User reads their own; admin reads/writes all
create policy "community_user_read"
  on community_memberships for select
  using (auth.uid() = user_id or is_admin_user());
-- NO user self-insert — only admin/backend can assign community
create policy "community_admin_write"
  on community_memberships for insert
  with check (is_admin_user());
create policy "community_admin_update"
  on community_memberships for update
  using (is_admin_user());

-- ── admin_actions — admin only ────────────────────────────────────
drop policy if exists "admin_actions_admin_only" on admin_actions;
create policy "admin_actions_rw"
  on admin_actions for all
  using (is_admin_user())
  with check (is_admin_user());

-- ── commercial_contacts/notes — admin only ────────────────────────
drop policy if exists "admin_read_commercial" on commercial_contacts;
drop policy if exists "admin_update_commercial" on commercial_contacts;
create policy "commercial_contacts_admin"
  on commercial_contacts for all
  using (is_admin_user())
  with check (is_admin_user());
alter table commercial_notes enable row level security;
create policy if not exists "commercial_notes_admin"
  on commercial_notes for all
  using (is_admin_user())
  with check (is_admin_user());

-- ── beta_feedback — insert open, read admin ──────────────────────
drop policy if exists "beta_feedback_insert" on beta_feedback;
drop policy if exists "beta_feedback_self" on beta_feedback;
drop policy if exists "admin_read_beta_feedback" on beta_feedback;
create policy "beta_feedback_insert_open"
  on beta_feedback for insert with check (true);
create policy "beta_feedback_read"
  on beta_feedback for select
  using (auth.uid() = user_id or is_admin_user());

-- ── app_events — user inserts own, admin reads all ───────────────
drop policy if exists "events_user_insert" on app_events;
drop policy if exists "events_admin_read" on app_events;
drop policy if exists "admin_read_events" on app_events;
create policy "events_user_insert"
  on app_events for insert with check (auth.uid() = user_id or user_id is null);
create policy "events_admin_read"
  on app_events for select using (is_admin_user());
-- Users do NOT need to read all events — only admin does for analytics

-- ── nutrition_logs — user self ────────────────────────────────────
drop policy if exists "nutrition_self" on nutrition_logs;
create policy "nutrition_self"
  on nutrition_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- Admin read for analytics
create policy if not exists "nutrition_admin_read"
  on nutrition_logs for select using (is_admin_user());

-- ── workout_logs + set_logs ──────────────────────────────────────
drop policy if exists "wlogs_self" on workout_logs;
create policy "wlogs_self"
  on workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy if not exists "wlogs_admin_read"
  on workout_logs for select using (is_admin_user());

drop policy if exists "slogs_self" on set_logs;
create policy "slogs_self"
  on set_logs for all
  using (auth.uid() = (select user_id from workout_logs where id = set_logs.workout_log_id));

-- ── user_recipe_favorites — user self ───────────────────────────
drop policy if exists "favorites_self" on user_recipe_favorites;
create policy "favorites_self"
  on user_recipe_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Secure function: activate challenge (admin/service role only) ─
create or replace function admin_activate_challenge(
  p_target_user_id uuid,
  p_product_type    text
)
returns json
language plpgsql
security definer  -- runs as postgres, bypasses RLS
as $$
begin
  -- Verify caller is admin
  if not is_admin_user() then
    raise exception 'Unauthorized: admin only';
  end if;
  -- Activate profile
  update profiles set
    subscription_status = 'active',
    access_level        = 'full',
    paid_amount         = 32,
    currency            = 'USD',
    updated_at          = now()
  where id = p_target_user_id;
  -- Assign community
  insert into community_memberships (user_id, status, joined_at, assigned_by)
  values (p_target_user_id, 'active', now(), 'admin')
  on conflict (user_id) do update set status = 'active', joined_at = now();
  -- Log action
  insert into admin_actions (admin_user_id, target_user_id, action_type, new_status, product_type, metadata_json)
  values (auth.uid(), p_target_user_id, 'manual_activation', 'active', p_product_type, '{"amount":32,"currency":"USD"}');
  return json_build_object('success', true);
end;
$$;

-- ── Secure function: activate custom plan ────────────────────────
create or replace function admin_activate_plan(
  p_target_user_id uuid,
  p_product_type    text
)
returns json
language plpgsql
security definer
as $$
begin
  if not is_admin_user() then
    raise exception 'Unauthorized: admin only';
  end if;
  update profiles set
    subscription_status = 'active',
    access_level        = 'full',
    paid_amount         = 72,
    currency            = 'USD',
    updated_at          = now()
  where id = p_target_user_id;
  insert into community_memberships (user_id, status, joined_at, assigned_by)
  values (p_target_user_id, 'active', now(), 'admin')
  on conflict (user_id) do update set status = 'active', joined_at = now();
  insert into admin_actions (admin_user_id, target_user_id, action_type, new_status, product_type, metadata_json)
  values (auth.uid(), p_target_user_id, 'manual_activation', 'active', p_product_type, '{"amount":72,"currency":"USD","billing":"monthly"}');
  return json_build_object('success', true);
end;
$$;


-- ── user_nudges ──────────────────────────────────────────────────
create table if not exists user_nudges (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  nudge_type    text not null,
  title         text,
  message       text,
  cta_label     text,
  cta_route     text,
  status        text default 'pending', -- pending | shown | clicked | dismissed | expired
  priority      text default 'medium',
  shown_at      timestamptz,
  clicked_at    timestamptz,
  dismissed_at  timestamptz,
  expires_at    timestamptz,
  metadata_json jsonb default '{}',
  created_at    timestamptz default now()
);
create index if not exists user_nudges_user on user_nudges(user_id, created_at desc);
alter table user_nudges enable row level security;
create policy if not exists "nudges_self"
  on user_nudges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── daily_checkins ───────────────────────────────────────────────
create table if not exists daily_checkins (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references auth.users(id) on delete cascade,
  date                 date default current_date,
  mood                 text,               -- energized | normal | tired | no_mood | stressed | returning
  energy_level         int,                -- 1-5
  stress_level         int,
  motivation_level     int,
  notes                text,
  generated_day_mode   text,               -- high_energy | normal_day | low_energy | low_motivation | stressed | returning
  arju_message         text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  unique (user_id, date)
);
alter table daily_checkins enable row level security;
create policy if not exists "checkins_self"
  on daily_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
