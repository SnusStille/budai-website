-- ===========================================================================
-- BudAI MIGRATION v3 — Playground history / memory (optional, future accounts)
-- Safe to re-run. Supabase → SQL Editor → Run.
--
-- NOTE: The public marketing Playground currently uses browser localStorage
-- for history + memory (no login). These tables are for when you add accounts.
-- Admin can still operate without them.
-- ===========================================================================

-- Optional: playground conversations (per anonymous device key or future user)
create table if not exists public.playground_conversations (
  id uuid primary key default gen_random_uuid(),
  device_key text not null,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists playground_conversations_device_idx
  on public.playground_conversations (device_key, updated_at desc);

create table if not exists public.playground_memory (
  id uuid primary key default gen_random_uuid(),
  device_key text not null,
  text text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index if not exists playground_memory_device_idx
  on public.playground_memory (device_key, created_at desc);

-- Playground usage events (for admin analytics)
create table if not exists public.playground_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'message',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists playground_events_created_idx
  on public.playground_events (created_at desc);

alter table public.playground_conversations enable row level security;
alter table public.playground_memory enable row level security;
alter table public.playground_events enable row level security;

-- Permissive anon policies for preview (tighten before scale / after auth)
drop policy if exists "pg_conv_all_anon" on public.playground_conversations;
create policy "pg_conv_all_anon"
  on public.playground_conversations for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "pg_mem_all_anon" on public.playground_memory;
create policy "pg_mem_all_anon"
  on public.playground_memory for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "pg_events_insert_anon" on public.playground_events;
create policy "pg_events_insert_anon"
  on public.playground_events for insert to anon, authenticated with check (true);

drop policy if exists "pg_events_select_anon" on public.playground_events;
create policy "pg_events_select_anon"
  on public.playground_events for select to anon, authenticated using (true);

comment on table public.playground_conversations is 'Optional server-side chat history (localStorage used on public demo today)';
comment on table public.playground_memory is 'Optional server-side memory facts';
comment on table public.playground_events is 'Playground usage events for admin analytics';
