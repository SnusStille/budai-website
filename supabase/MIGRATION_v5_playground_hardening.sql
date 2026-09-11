-- ============================================================================
-- BudAI MIGRATION v5 — Playground hardening (safe, additive)
-- Run AFTER MIGRATION_v4_product.sql if not already applied.
-- No destructive drops. Safe to re-run.
-- ============================================================================

-- Ensure conversations have pinned (may already exist from v4)
alter table public.conversations
  add column if not exists pinned boolean not null default false;

-- Soft title length safety (optional check via trigger not required)
-- Index for sidebar list performance
create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create index if not exists conversations_user_pinned_idx
  on public.conversations (user_id, pinned desc, updated_at desc)
  where archived = false;

-- Messages client_id in meta is already jsonb — no schema change.
-- Faster memory list
create index if not exists memories_user_active_updated_idx
  on public.memories (user_id, active, updated_at desc);

-- Profiles: ensure memory_enabled exists
alter table public.profiles
  add column if not exists memory_enabled boolean not null default true;

-- Allow authenticated users to upsert own profile (OAuth first login race)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

comment on column public.profiles.memory_enabled is 'When false, server skips [[MEMORY:]] persistence';
