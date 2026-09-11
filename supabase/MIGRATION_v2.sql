-- BudAI admin v2 extras (safe to re-run)
-- Run in Supabase → SQL Editor

alter table public.waitlist_users
  add column if not exists priority int default 50;

alter table public.waitlist_users
  add column if not exists last_contacted_at timestamptz;

alter table public.waitlist_users
  add column if not exists tags text[] default '{}';

create index if not exists waitlist_users_priority_idx
  on public.waitlist_users (priority desc nulls last);

create table if not exists public.admin_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'system',
  message text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_events_created_idx
  on public.admin_events (created_at desc);

alter table public.admin_events enable row level security;

drop policy if exists "admin_events_select_anon" on public.admin_events;
create policy "admin_events_select_anon"
  on public.admin_events for select to anon, authenticated using (true);

drop policy if exists "admin_events_insert_anon" on public.admin_events;
create policy "admin_events_insert_anon"
  on public.admin_events for insert to anon, authenticated with check (true);
