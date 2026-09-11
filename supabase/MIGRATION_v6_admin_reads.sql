-- ============================================================================
-- BudAI MIGRATION v6 — Admin conversation inspection (additive, safe)
-- Run in Supabase SQL Editor after v4/v5.
--
-- Admin UI reads conversations via server route + SUPABASE_SERVICE_ROLE_KEY.
-- Service role bypasses RLS — no extra "admin role" table required.
-- This migration only adds helpful indexes + optional comments.
-- Does NOT weaken user RLS. Normal users still only see own rows.
-- ============================================================================

create index if not exists conversations_updated_global_idx
  on public.conversations (updated_at desc);

create index if not exists messages_created_global_idx
  on public.messages (created_at desc);

create index if not exists profiles_email_idx
  on public.profiles (email);

comment on table public.conversations is
  'BudAI threads. Users: RLS own rows. Admin: service-role server route only.';

comment on table public.messages is
  'BudAI messages. Never grant broad SELECT to anon/authenticated beyond own user_id.';

-- Sanity: ensure RLS still on
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.memories enable row level security;
