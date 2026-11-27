-- ============================================================================
-- STILLEDEV LABS — COMPLETE DATABASE SETUP
-- ============================================================================
-- Idempotent migration. Safe to run multiple times.
-- Isolated from BudAI core tables. All labs_* tables use service_role only.
--
-- Run this in Supabase SQL Editor before deploying.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. ENUMS
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'labs_project_status') then
    create type labs_project_status as enum (
      'new_inquiry',
      'conversation_active',
      'needs_review',
      'qualified',
      'meeting_requested',
      'quote_sent',
      'accepted',
      'declined',
      'completed'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'labs_notification_kind') then
    create type labs_notification_kind as enum (
      'new_conversation',
      'contact_received',
      'project_qualified',
      'summary_ready',
      'high_priority_lead',
      'follow_up_needed'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'labs_project_category') then
    create type labs_project_category as enum (
      'website',
      'web_application',
      'mobile_app',
      'ai_service',
      'automation',
      'ecommerce',
      'booking_system',
      'saas_platform',
      'integration',
      'consulting',
      'other',
      'unknown'
    );
  end if;
end $$;

-- ============================================================================
-- 2. Helper function (set_updated_at) — safe, idempotent
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================================
-- 3. LABS CONVERSATIONS
--    Anonymous sessions via httpOnly session cookie (no account needed).
-- ============================================================================
create table if not exists public.labs_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  title text not null default 'New conversation',
  language text not null default 'sv' check (language in ('sv', 'en')),
  consent_given boolean not null default false,
  -- Project category (auto-detected by AI)
  project_category labs_project_category default 'unknown',
  -- Dynamic conversation state (updated by AI each turn)
  project_profile jsonb default '{}'::jsonb,
  -- Internally assessed priority score (0-100), computed by AI
  priority_score integer check (priority_score between 0 and 100),
  priority_strengths text[] default '{}',
  priority_concerns text[] default '{}',
  priority_recommendation text,
  priority_scored_at timestamptz,
  -- Metadata
  first_message_at timestamptz,
  last_message_at timestamptz,
  message_count integer not null default 0,
  turn_count integer not null default 0,
  last_assistant_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive columns for existing installations
alter table public.labs_conversations add column if not exists project_category labs_project_category default 'unknown';
alter table public.labs_conversations add column if not exists project_profile jsonb default '{}'::jsonb;
alter table public.labs_conversations add column if not exists priority_score integer check (priority_score between 0 and 100);
alter table public.labs_conversations add column if not exists priority_strengths text[] default '{}';
alter table public.labs_conversations add column if not exists priority_concerns text[] default '{}';
alter table public.labs_conversations add column if not exists priority_recommendation text;
alter table public.labs_conversations add column if not exists priority_scored_at timestamptz;
alter table public.labs_conversations add column if not exists turn_count integer not null default 0;
alter table public.labs_conversations add column if not exists last_assistant_message_at timestamptz;

create index if not exists labs_conversations_session_idx on public.labs_conversations (session_id, updated_at desc);
create index if not exists labs_conversations_updated_idx on public.labs_conversations (updated_at desc);
create index if not exists labs_conversations_created_idx on public.labs_conversations (created_at desc);
create index if not exists labs_conversations_priority_idx on public.labs_conversations (priority_score desc nulls last) where priority_score is not null;
create index if not exists labs_conversations_category_idx on public.labs_conversations (project_category) where project_category is not null and project_category != 'unknown';

drop trigger if exists labs_conversations_set_updated_at on public.labs_conversations;
create trigger labs_conversations_set_updated_at
  before update on public.labs_conversations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. LABS MESSAGES
-- ============================================================================
create table if not exists public.labs_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.labs_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  tokens_input integer,
  tokens_output integer,
  model text,
  -- AI-updated profile delta emitted alongside this message (for assistant turns)
  profile_delta jsonb,
  created_at timestamptz not null default now()
);

alter table public.labs_messages add column if not exists profile_delta jsonb;

create index if not exists labs_messages_convo_created_idx on public.labs_messages (conversation_id, created_at asc);
create index if not exists labs_messages_created_idx on public.labs_messages (created_at desc);

-- ============================================================================
-- 5. LABS PROJECTS
--    Created/updated when AI determines sufficient information exists.
-- ============================================================================
create table if not exists public.labs_projects (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.labs_conversations(id) on delete cascade,
  status labs_project_status not null default 'new_inquiry',
  starred boolean not null default false,
  -- Contact info
  contact_name text,
  contact_email text,
  contact_phone text,
  company text,
  preferred_contact text check (preferred_contact in ('email', 'phone', 'digital_meeting')),
  -- AI-generated project summary fields
  project_title text,
  project_category labs_project_category default 'unknown',
  customer_goal text,
  target_audience text,
  problem text,
  proposed_solution text,
  scope_mvp text,
  scope_future text,
  key_features text[] default '{}',
  technical_requirements text[] default '{}',
  technical_complexity text check (technical_complexity in ('low','medium','high','very_high', null)),
  budget text,
  budget_assessment text, -- AI's assessment of budget realism
  timeline text,
  timeline_assessment text, -- AI's assessment of timeline realism
  business_risks text[] default '{}',
  technical_risks text[] default '{}',
  opportunities text[] default '{}',
  competition text,
  existing_solutions text,
  next_steps text,
  recommended_mvp text,
  -- Structured AI analysis (full structured profile snapshot)
  project_profile jsonb default '{}'::jsonb,
  priority_score integer check (priority_score between 0 and 100),
  priority_strengths text[] default '{}',
  priority_concerns text[] default '{}',
  priority_recommendation text,
  summary_generated_at timestamptz,
  contact_collected_at timestamptz,
  last_summary_update_at timestamptz,
  -- Admin fields
  admin_notes_count integer not null default 0,
  is_read boolean not null default false,
  admin_assignee text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive columns
alter table public.labs_projects add column if not exists starred boolean not null default false;
alter table public.labs_projects add column if not exists project_category labs_project_category default 'unknown';
alter table public.labs_projects add column if not exists target_audience text;
alter table public.labs_projects add column if not exists scope_mvp text;
alter table public.labs_projects add column if not exists scope_future text;
alter table public.labs_projects add column if not exists key_features text[] default '{}';
alter table public.labs_projects add column if not exists technical_requirements text[] default '{}';
alter table public.labs_projects add column if not exists technical_complexity text check (technical_complexity in ('low','medium','high','very_high', null));
alter table public.labs_projects add column if not exists budget_assessment text;
alter table public.labs_projects add column if not exists timeline_assessment text;
alter table public.labs_projects add column if not exists business_risks text[] default '{}';
alter table public.labs_projects add column if not exists technical_risks text[] default '{}';
alter table public.labs_projects add column if not exists opportunities text[] default '{}';
alter table public.labs_projects add column if not exists competition text;
alter table public.labs_projects add column if not exists existing_solutions text;
alter table public.labs_projects add column if not exists recommended_mvp text;
alter table public.labs_projects add column if not exists project_profile jsonb default '{}'::jsonb;
alter table public.labs_projects add column if not exists priority_score integer check (priority_score between 0 and 100);
alter table public.labs_projects add column if not exists priority_strengths text[] default '{}';
alter table public.labs_projects add column if not exists priority_concerns text[] default '{}';
alter table public.labs_projects add column if not exists priority_recommendation text;
alter table public.labs_projects add column if not exists last_summary_update_at timestamptz;
alter table public.labs_projects add column if not exists admin_assignee text;

create index if not exists labs_projects_conversation_idx on public.labs_projects (conversation_id);
create index if not exists labs_projects_status_idx on public.labs_projects (status, updated_at desc);
create index if not exists labs_projects_created_idx on public.labs_projects (created_at desc);
create index if not exists labs_projects_updated_idx on public.labs_projects (updated_at desc);
create index if not exists labs_projects_unread_idx on public.labs_projects (is_read, created_at desc) where is_read = false;
create index if not exists labs_projects_email_idx on public.labs_projects (lower(contact_email));
create index if not exists labs_projects_priority_idx on public.labs_projects (priority_score desc nulls last);
create index if not exists labs_projects_starred_idx on public.labs_projects (starred, updated_at desc) where starred = true;
create index if not exists labs_projects_category_idx on public.labs_projects (project_category);
create index if not exists labs_projects_contact_collected_idx on public.labs_projects (contact_collected_at desc) where contact_collected_at is not null;

drop trigger if exists labs_projects_set_updated_at on public.labs_projects;
create trigger labs_projects_set_updated_at
  before update on public.labs_projects
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. LABS ADMIN NOTES
-- ============================================================================
create table if not exists public.labs_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.labs_projects(id) on delete cascade,
  body text not null,
  author text default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists labs_notes_project_idx on public.labs_notes (project_id, created_at desc);

-- ============================================================================
-- 7. LABS NOTIFICATIONS (for Oliver)
-- ============================================================================
create table if not exists public.labs_notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.labs_projects(id) on delete cascade,
  conversation_id uuid references public.labs_conversations(id) on delete cascade,
  kind labs_notification_kind not null default 'new_conversation',
  title text not null,
  body text,
  meta jsonb default '{}'::jsonb,
  is_read boolean not null default false,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Additive columns
alter table public.labs_notifications add column if not exists conversation_id uuid references public.labs_conversations(id) on delete cascade;
alter table public.labs_notifications add column if not exists meta jsonb default '{}'::jsonb;
-- Migrate kind column to enum if it was text previously
do $$
begin
  -- Only attempt if the column exists and is text (pre-enum state)
  -- If it's already the enum type, this is a no-op
  perform 1;
exception when others then null;
end $$;

create index if not exists labs_notifications_unread_idx on public.labs_notifications (is_read, created_at desc) where is_read = false;
create index if not exists labs_notifications_created_idx on public.labs_notifications (created_at desc);
create index if not exists labs_notifications_project_idx on public.labs_notifications (project_id);

-- ============================================================================
-- 8. LABS PROFILE SNAPSHOTS (point-in-time snapshots of project_profile)
--    Stored every ~5 turns so Oliver can see how understanding evolved.
-- ============================================================================
create table if not exists public.labs_profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.labs_conversations(id) on delete cascade,
  project_profile jsonb not null default '{}'::jsonb,
  turn_number integer not null,
  summary_text text,
  created_at timestamptz not null default now()
);

create index if not exists labs_snapshots_convo_turn_idx on public.labs_profile_snapshots (conversation_id, turn_number);

-- ============================================================================
-- 9. ROW LEVEL SECURITY
--    All labs tables are service-role ONLY. No direct browser access.
-- ============================================================================
alter table public.labs_conversations enable row level security;
alter table public.labs_messages enable row level security;
alter table public.labs_projects enable row level security;
alter table public.labs_notes enable row level security;
alter table public.labs_notifications enable row level security;
alter table public.labs_profile_snapshots enable row level security;

-- Revoke all public/anon/authenticated access
revoke all on public.labs_conversations from public, anon, authenticated;
revoke all on public.labs_messages from public, anon, authenticated;
revoke all on public.labs_projects from public, anon, authenticated;
revoke all on public.labs_notes from public, anon, authenticated;
revoke all on public.labs_notifications from public, anon, authenticated;
revoke all on public.labs_profile_snapshots from public, anon, authenticated;

-- Grant full access to service_role
grant all on public.labs_conversations to service_role;
grant all on public.labs_messages to service_role;
grant all on public.labs_projects to service_role;
grant all on public.labs_notes to service_role;
grant all on public.labs_notifications to service_role;
grant all on public.labs_profile_snapshots to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ============================================================================
-- 10. HELPER FUNCTION: labs_record_message
-- ============================================================================
create or replace function public.labs_record_message(conv_id uuid, msg_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  select message_count into current_count from public.labs_conversations where id = conv_id;
  update public.labs_conversations
     set message_count = coalesce(current_count, 0) + 1,
         last_message_at = now(),
         first_message_at = coalesce(first_message_at, now()),
         last_assistant_message_at = case when msg_role = 'assistant' then now() else last_assistant_message_at end,
         turn_count = case when msg_role = 'user' then coalesce(turn_count, 0) + 1 else turn_count end
   where id = conv_id;
end;
$$;

revoke all on function public.labs_record_message(uuid, text) from public, anon, authenticated;
grant execute on function public.labs_record_message(uuid, text) to service_role;

-- ============================================================================
-- 11. HELPER FUNCTION: labs_get_conversation_context
--     Returns a compact summary for AI context building.
-- ============================================================================
create or replace function public.labs_get_context(p_conversation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  conv record;
  recent_msgs jsonb;
  result jsonb;
begin
  select * into conv from public.labs_conversations where id = p_conversation_id;
  if conv is null then return '{}'::jsonb; end if;

  select coalesce(jsonb_agg(m order by m.created_at), '[]'::jsonb) into recent_msgs
  from (
    select jsonb_build_object('role', role, 'content', left(content, 1500)) as m
    from public.labs_messages
    where conversation_id = p_conversation_id
    order by created_at asc
    limit 20
  ) sub;

  result := jsonb_build_object(
    'conversation_id', conv.id,
    'language', conv.language,
    'title', conv.title,
    'message_count', conv.message_count,
    'turn_count', coalesce(conv.turn_count, 0),
    'project_category', coalesce(conv.project_category::text, 'unknown'),
    'priority_score', conv.priority_score,
    'project_profile', coalesce(conv.project_profile, '{}'::jsonb),
    'recent_messages', recent_msgs
  );
  return result;
end;
$$;

revoke all on function public.labs_get_context(uuid) from public, anon, authenticated;
grant execute on function public.labs_get_context(uuid) to service_role;

-- ============================================================================
-- DONE. Verify with:
--   SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'labs_%';
-- ============================================================================
