-- ============================================================================
-- BudAI — Complete All-in-One Supabase Schema (v1 through v9 consolidated)
-- Safe to re-run (100% idempotent). Paste into Supabase → SQL Editor → Run.
--
-- Includes:
--   1. Waitlist & Referrals (waitlist_users, waitlist_count, waitlist_status, waitlist_credit_referrer)
--   2. Admin Activity & Feedback Inbox (admin_events, feedback, platform_events)
--   3. Auth Profiles & OAuth Sync Trigger (profiles, handle_new_user)
--   4. Cloud Playground Threads, Messages & Long-Term Memory (conversations, messages, memories)
--   5. Daily Quota & Guest Rate-Limit Counters (usage_daily, usage_guest_daily)
--   6. Shared Read-Only Conversations (shared_conversations)
--   7. Legacy Preview Tables Locked Down (playground_conversations, playground_memory, playground_events)
--   8. Row-Level Security (RLS) Policies & Indexes across all tables
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. ENUMS & HELPER FUNCTIONS
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. WAITLIST & REFERRAL SYSTEM (waitlist_users)
-- ============================================================================
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
  referral_code text default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  referral_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive migrations for existing installations
alter table public.waitlist_users add column if not exists account_type waitlist_account_type not null default 'individual';
alter table public.waitlist_users alter column company drop not null;
alter table public.waitlist_users alter column industry drop not null;
alter table public.waitlist_users alter column employees drop not null;
alter table public.waitlist_users add column if not exists discount_code text default 'BUDAI-EARLY-10';
alter table public.waitlist_users add column if not exists notes text;
alter table public.waitlist_users add column if not exists source text default 'landing';
alter table public.waitlist_users add column if not exists updated_at timestamptz not null default now();
alter table public.waitlist_users add column if not exists priority int default 50;
alter table public.waitlist_users add column if not exists last_contacted_at timestamptz;
alter table public.waitlist_users add column if not exists tags text[] default '{}';
alter table public.waitlist_users add column if not exists referral_code text;
alter table public.waitlist_users add column if not exists referral_count integer not null default 0;

update public.waitlist_users
   set referral_code = substr(md5(random()::text || id::text), 1, 8)
 where referral_code is null;

alter table public.waitlist_users
  alter column referral_code set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);

create unique index if not exists waitlist_users_email_lower_idx on public.waitlist_users (lower(email));
create unique index if not exists waitlist_users_referral_code_key on public.waitlist_users (referral_code);
create index if not exists waitlist_users_status_idx on public.waitlist_users (access_status);
create index if not exists waitlist_users_created_idx on public.waitlist_users (created_at desc);
create index if not exists waitlist_users_priority_idx on public.waitlist_users (priority desc nulls last);

drop trigger if exists waitlist_users_set_updated_at on public.waitlist_users;
create trigger waitlist_users_set_updated_at
  before update on public.waitlist_users
  for each row execute function public.set_waitlist_updated_at();

create or replace function public.waitlist_credit_referrer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.notes is not null and new.notes like 'referral:%' then
    update public.waitlist_users
       set referral_count = referral_count + 1
     where referral_code = lower(trim(substr(new.notes, 10))) and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists waitlist_referral_trg on public.waitlist_users;
create trigger waitlist_referral_trg
  after insert on public.waitlist_users
  for each row execute function public.waitlist_credit_referrer();

create or replace function public.waitlist_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.waitlist_users;
$$;

revoke all on function public.waitlist_count() from public;
grant execute on function public.waitlist_count() to anon, authenticated;

create or replace function public.waitlist_status(p_email text)
returns table (pos integer, total integer, code text, referrals integer)
language sql
security definer
set search_path = public
stable
as $$
  with me as (
    select created_at, referral_count, referral_code
      from public.waitlist_users
     where lower(email) = lower(p_email)
     limit 1
  )
  select
    (1 + (select count(*) from public.waitlist_users w, me
           where (w.created_at - w.referral_count * interval '2 days')
               < (me.created_at - me.referral_count * interval '2 days')))::int,
    (select count(*) from public.waitlist_users)::int,
    me.referral_code,
    me.referral_count
  from me;
$$;

revoke all on function public.waitlist_status(text) from public;
grant execute on function public.waitlist_status(text) to anon, authenticated;

-- Lock down waitlist_users RLS: public can only insert valid pending rows; admin reads via service role
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'waitlist_users'
  loop
    execute format('drop policy %I on public.waitlist_users', p.policyname);
  end loop;
end $$;

alter table public.waitlist_users enable row level security;

create policy "waitlist_insert_public"
  on public.waitlist_users
  for insert
  to anon, authenticated
  with check (
    access_status = 'pending'
    and coalesce(referral_count, 0) = 0
    and char_length(email) between 5 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(coalesce(name, '')) <= 120
    and coalesce(priority, 50) between 0 and 100
  );

-- ============================================================================
-- 3. ADMIN EVENTS, PLATFORM EVENTS & FEEDBACK INBOX
-- ============================================================================
create table if not exists public.admin_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'system',
  message text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_events_created_idx on public.admin_events (created_at desc);
alter table public.admin_events enable row level security;

drop policy if exists "admin_events_select_anon" on public.admin_events;
create policy "admin_events_select_anon"
  on public.admin_events for select to anon, authenticated using (true);

drop policy if exists "admin_events_insert_anon" on public.admin_events;
create policy "admin_events_insert_anon"
  on public.admin_events for insert to anon, authenticated with check (true);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_events_created_idx on public.platform_events (created_at desc);
create index if not exists platform_events_kind_idx on public.platform_events (kind, created_at desc);
alter table public.platform_events enable row level security;

drop policy if exists "pe_insert_auth" on public.platform_events;
create policy "pe_insert_auth" on public.platform_events
  for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists "pe_insert_anon" on public.platform_events;
create policy "pe_insert_anon" on public.platform_events
  for insert to anon with check (user_id is null);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'other',
  message text not null,
  page text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_idx on public.feedback (created_at desc);
alter table public.feedback enable row level security;

-- ============================================================================
-- 4. AUTH PROFILES (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  memory_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists memory_enabled boolean not null default true;
create index if not exists profiles_email_idx on public.profiles (email);

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

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- ============================================================================
-- 5. CONVERSATIONS, MESSAGES & LONG-TERM MEMORY
-- ============================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations add column if not exists pinned boolean not null default false;
alter table public.conversations add column if not exists archived boolean not null default false;

create index if not exists conversations_user_updated_idx on public.conversations (user_id, updated_at desc);
create index if not exists conversations_user_pinned_idx on public.conversations (user_id, pinned desc, updated_at desc) where archived = false;
create index if not exists conversations_updated_global_idx on public.conversations (updated_at desc);

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;

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

create index if not exists messages_convo_created_idx on public.messages (conversation_id, created_at asc);
create index if not exists messages_user_idx on public.messages (user_id, created_at desc);
create index if not exists messages_created_global_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

drop policy if exists "msg_select_own" on public.messages;
create policy "msg_select_own" on public.messages
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "msg_insert_own" on public.messages;
create policy "msg_insert_own" on public.messages
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "msg_delete_own" on public.messages;
create policy "msg_delete_own" on public.messages
  for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  category text not null default 'general',
  source text not null default 'auto',
  confidence real not null default 0.7,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_active_idx on public.memories (user_id, active, updated_at desc);
create index if not exists memories_user_active_updated_idx on public.memories (user_id, active, updated_at desc);

drop trigger if exists memories_updated_at on public.memories;
create trigger memories_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

alter table public.memories enable row level security;

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

-- ============================================================================
-- 6. DAILY QUOTA & GUEST RATE-LIMIT COUNTERS
-- ============================================================================
create table if not exists public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (timezone('utc', now())::date),
  messages int not null default 0,
  images int not null default 0,
  generations int not null default 0,
  primary key (user_id, day)
);

alter table public.usage_daily enable row level security;

drop policy if exists "usage_select_own" on public.usage_daily;
create policy "usage_select_own" on public.usage_daily
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "usage_upsert_own" on public.usage_daily;
create policy "usage_upsert_own" on public.usage_daily
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "usage_update_own" on public.usage_daily;
create policy "usage_update_own" on public.usage_daily
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.usage_guest_daily (
  guest_key text not null,
  day date not null default (timezone('utc', now())::date),
  messages int not null default 0,
  images int not null default 0,
  generations int not null default 0,
  primary key (guest_key, day)
);

alter table public.usage_guest_daily enable row level security;

drop policy if exists "guest_usage_all" on public.usage_guest_daily;
create policy "guest_usage_all" on public.usage_guest_daily
  for all to anon, authenticated using (true) with check (true);

-- ============================================================================
-- 7. SHARED CONVERSATIONS & LEGACY TABLE LOCKDOWN
-- ============================================================================
create table if not exists public.shared_conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  messages jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shared_conversations enable row level security;

create table if not exists public.playground_conversations (
  id uuid primary key default gen_random_uuid(),
  device_key text not null,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.playground_memory (
  id uuid primary key default gen_random_uuid(),
  device_key text not null,
  text text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.playground_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'message',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.playground_conversations enable row level security;
alter table public.playground_memory enable row level security;
alter table public.playground_events enable row level security;

do $$
declare p record;
begin
  for p in select tablename, policyname from pg_policies
           where schemaname = 'public'
             and tablename in ('playground_conversations', 'playground_memory', 'playground_events')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;
