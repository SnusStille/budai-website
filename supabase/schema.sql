-- ============================================================================
-- BudAI — Supabase schema (launch + admin v2)
-- Safe to re-run (idempotent). Supabase → SQL Editor → Run.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'waitlist_access_status') then
    create type waitlist_access_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'waitlist_account_type') then
    create type waitlist_account_type as enum ('individual', 'company');
  end if;
end $$;

create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  account_type waitlist_account_type not null default 'individual',
  company text,
  industry text,
  employees text,
  interest text not null,
  access_status waitlist_access_status not null default 'pending',
  discount_code text default 'BUDAI-EARLY-10',
  notes text,
  source text default 'landing',
  priority int default 50 check (priority >= 0 and priority <= 100),
  last_contacted_at timestamptz,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrations for existing projects
alter table public.waitlist_users
  add column if not exists account_type waitlist_account_type not null default 'company';

alter table public.waitlist_users alter column company drop not null;
alter table public.waitlist_users alter column industry drop not null;
alter table public.waitlist_users alter column employees drop not null;

alter table public.waitlist_users
  add column if not exists discount_code text default 'BUDAI-EARLY-10';

alter table public.waitlist_users
  add column if not exists notes text;

alter table public.waitlist_users
  add column if not exists source text default 'landing';

alter table public.waitlist_users
  add column if not exists updated_at timestamptz not null default now();

alter table public.waitlist_users
  add column if not exists priority int default 50;

alter table public.waitlist_users
  add column if not exists last_contacted_at timestamptz;

alter table public.waitlist_users
  add column if not exists tags text[] default '{}';

-- Unique email (case-insensitive)
create unique index if not exists waitlist_users_email_lower_idx
  on public.waitlist_users (lower(email));

create index if not exists waitlist_users_status_idx
  on public.waitlist_users (access_status);

create index if not exists waitlist_users_created_idx
  on public.waitlist_users (created_at desc);

create index if not exists waitlist_users_priority_idx
  on public.waitlist_users (priority desc nulls last);

-- updated_at trigger
create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists waitlist_users_set_updated_at on public.waitlist_users;
create trigger waitlist_users_set_updated_at
  before update on public.waitlist_users
  for each row execute function public.set_waitlist_updated_at();

-- Admin activity log
create table if not exists public.admin_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'system',
  message text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_events_created_idx
  on public.admin_events (created_at desc);

-- RLS
alter table public.waitlist_users enable row level security;
alter table public.admin_events enable row level security;

drop policy if exists "waitlist_insert_anon" on public.waitlist_users;
create policy "waitlist_insert_anon"
  on public.waitlist_users
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "waitlist_select_anon" on public.waitlist_users;
create policy "waitlist_select_anon"
  on public.waitlist_users
  for select
  to anon, authenticated
  using (true);

drop policy if exists "waitlist_update_anon" on public.waitlist_users;
create policy "waitlist_update_anon"
  on public.waitlist_users
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "waitlist_delete_anon" on public.waitlist_users;
create policy "waitlist_delete_anon"
  on public.waitlist_users
  for delete
  to anon, authenticated
  using (true);

drop policy if exists "admin_events_select_anon" on public.admin_events;
create policy "admin_events_select_anon"
  on public.admin_events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_events_insert_anon" on public.admin_events;
create policy "admin_events_insert_anon"
  on public.admin_events
  for insert
  to anon, authenticated
  with check (true);

-- Note: tighten policies before scale (service role + server routes).

comment on table public.waitlist_users is 'BudAI waitlist + early-bird discount codes';
comment on column public.waitlist_users.discount_code is 'Founder early access code, default BUDAI-EARLY-10 (10% off)';
comment on column public.waitlist_users.priority is '0-100 invite priority for launch waves';
comment on table public.admin_events is 'Lightweight admin activity / audit trail';
