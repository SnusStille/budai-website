-- ============================================================================
-- BudAI PRODUCT MIGRATION v4 — Auth profiles, conversations, memory, usage, media
-- Safe to re-run (IF NOT EXISTS). Supabase → SQL Editor → Run entire file.
-- Requires: Auth enabled (Email + Google). Storage bucket "budai-media" (public read optional).
-- ============================================================================

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  memory_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  image_url text,
  generated_image_url text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_convo_created_idx
  on public.messages (conversation_id, created_at asc);

create index if not exists messages_user_idx
  on public.messages (user_id, created_at desc);

-- Long-term memory (auto + user-visible)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  category text not null default 'general',
  source text not null default 'auto', -- auto | manual
  confidence real not null default 0.7,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_active_idx
  on public.memories (user_id, active, updated_at desc);

-- Daily usage counters (limits)
create table if not exists public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (timezone('utc', now())::date),
  messages int not null default 0,
  images int not null default 0,
  generations int not null default 0,
  primary key (user_id, day)
);

-- Optional guest fingerprint counters (best-effort, not security-critical)
create table if not exists public.usage_guest_daily (
  guest_key text not null,
  day date not null default (timezone('utc', now())::date),
  messages int not null default 0,
  images int not null default 0,
  generations int not null default 0,
  primary key (guest_key, day)
);

-- Platform events for admin (aggregate, no message bodies required)
create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_events_created_idx
  on public.platform_events (created_at desc);
create index if not exists platform_events_kind_idx
  on public.platform_events (kind, created_at desc);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

drop trigger if exists memories_updated_at on public.memories;
create trigger memories_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ========================= RLS =========================
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.usage_daily enable row level security;
alter table public.usage_guest_daily enable row level security;
alter table public.platform_events enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Conversations
drop policy if exists "conv_select_own" on public.conversations;
create policy "conv_select_own" on public.conversations
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "conv_insert_own" on public.conversations;
create policy "conv_insert_own" on public.conversations
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "conv_update_own" on public.conversations;
create policy "conv_update_own" on public.conversations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "conv_delete_own" on public.conversations;
create policy "conv_delete_own" on public.conversations
  for delete to authenticated using (auth.uid() = user_id);

-- Messages
drop policy if exists "msg_select_own" on public.messages;
create policy "msg_select_own" on public.messages
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "msg_insert_own" on public.messages;
create policy "msg_insert_own" on public.messages
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "msg_delete_own" on public.messages;
create policy "msg_delete_own" on public.messages
  for delete to authenticated using (auth.uid() = user_id);

-- Memories
drop policy if exists "mem_select_own" on public.memories;
create policy "mem_select_own" on public.memories
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "mem_insert_own" on public.memories;
create policy "mem_insert_own" on public.memories
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "mem_update_own" on public.memories;
create policy "mem_update_own" on public.memories
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "mem_delete_own" on public.memories;
create policy "mem_delete_own" on public.memories
  for delete to authenticated using (auth.uid() = user_id);

-- Usage daily (own rows)
drop policy if exists "usage_select_own" on public.usage_daily;
create policy "usage_select_own" on public.usage_daily
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "usage_upsert_own" on public.usage_daily;
create policy "usage_upsert_own" on public.usage_daily
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "usage_update_own" on public.usage_daily;
create policy "usage_update_own" on public.usage_daily
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Guest usage: allow anon insert/update/select by key (soft limit only)
drop policy if exists "guest_usage_all" on public.usage_guest_daily;
create policy "guest_usage_all" on public.usage_guest_daily
  for all to anon, authenticated using (true) with check (true);

-- Platform events: authenticated insert own; select none for users (admin uses service later)
drop policy if exists "pe_insert_auth" on public.platform_events;
create policy "pe_insert_auth" on public.platform_events
  for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists "pe_insert_anon" on public.platform_events;
create policy "pe_insert_anon" on public.platform_events
  for insert to anon with check (user_id is null);

-- Admin read via anon is intentionally NOT granted for messages/memories (privacy).
-- Waitlist admin remains separate; platform stats can use service role later.

comment on table public.conversations is 'BudAI user chat threads';
comment on table public.messages is 'BudAI messages; user_id denormalized for RLS';
comment on table public.memories is 'Long-term auto memory facts per user';
comment on table public.usage_daily is 'Per-user daily quota counters';
