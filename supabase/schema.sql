-- ============================================================================
-- BudAI — Supabase schema
-- ============================================================================
-- This is the complete schema for everything the codebase currently talks to
-- (lib/data.ts -> table "waitlist_users"). It is written to be safe to run
-- on a fresh project: every statement is idempotent (IF NOT EXISTS / OR
-- REPLACE), so re-running this file won't destroy existing data.
--
-- How to apply: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- ============================================================================

-- Enum for access_status. Matches types/index.ts exactly:
--   "pending" | "approved" | "rejected"
do $$
begin
  if not exists (select 1 from pg_type where typname = 'waitlist_access_status') then
    create type waitlist_access_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- ============================================================================
-- Table: waitlist_users
-- ============================================================================
create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  industry text not null,
  employees text not null,
  interest text not null,
  access_status waitlist_access_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One waitlist entry per email address.
create unique index if not exists waitlist_users_email_key
  on public.waitlist_users (lower(email));

-- Used by: getWaitlistUsers() -> .order("created_at", { ascending: false })
create index if not exists waitlist_users_created_at_idx
  on public.waitlist_users (created_at desc);

-- Used by: UserTable status filter (pending / approved / rejected)
create index if not exists waitlist_users_access_status_idx
  on public.waitlist_users (access_status);

-- Keep updated_at current on every UPDATE (e.g. updateUserStatus()).
create or replace function public.set_updated_at()
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
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- IMPORTANT — read this before applying in production:
--
-- The current admin dashboard (app/admin/page.tsx) calls getWaitlistUsers(),
-- updateUserStatus() and deleteUser() directly from the browser using the
-- PUBLIC anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY), gated only by a
-- client-side password check. That password check is cosmetic — anyone who
-- opens devtools can read the anon key out of the JS bundle and call
-- Supabase directly, bypassing the admin login entirely.
--
-- To keep the site working exactly as it does today, the policies below
-- allow the anon role to do everything the current code needs (insert for
-- the public signup form, select/update/delete for the admin dashboard).
-- That means: RLS is enabled and the table is no longer wide open by
-- default, but the admin actions are still only as secure as "don't share
-- the anon key" — which isn't real security.
--
-- Before a real production launch, the admin read/write calls in
-- lib/data.ts should move behind server-side API routes (Next.js route
-- handlers) that use the SUPABASE_SERVICE_ROLE_KEY (server-only env var,
-- never exposed to the browser), with the anon role restricted to INSERT
-- only. That is a real code change to lib/data.ts + a new API route, not
-- just a SQL change, so it hasn't been made automatically here — flagging
-- it so it doesn't get missed before release.

alter table public.waitlist_users enable row level security;

-- Public signup form: anyone can submit a waitlist entry.
drop policy if exists "waitlist_users_public_insert" on public.waitlist_users;
create policy "waitlist_users_public_insert"
  on public.waitlist_users
  for insert
  to anon, authenticated
  with check (true);

-- Admin dashboard (current implementation): read access.
drop policy if exists "waitlist_users_read" on public.waitlist_users;
create policy "waitlist_users_read"
  on public.waitlist_users
  for select
  to anon, authenticated
  using (true);

-- Admin dashboard (current implementation): approve / reject.
drop policy if exists "waitlist_users_update" on public.waitlist_users;
create policy "waitlist_users_update"
  on public.waitlist_users
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Admin dashboard (current implementation): delete.
drop policy if exists "waitlist_users_delete" on public.waitlist_users;
create policy "waitlist_users_delete"
  on public.waitlist_users
  for delete
  to anon, authenticated
  using (true);

-- ============================================================================
-- Realtime (optional)
-- ============================================================================
-- Uncomment if you want the admin dashboard to update live without a manual
-- refresh (would need a small code change to subscribe via
-- supabase.channel(...) — not currently used by lib/data.ts):
--
-- alter publication supabase_realtime add table public.waitlist_users;
