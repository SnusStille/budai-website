-- ============================================================================
-- Stilledev Labs — Project Consultant Database Schema
-- Isolated from BudAI core tables. Safe to run on existing installations.
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

-- ============================================================================
-- 2. LABS CONVERSATIONS
--    Anonymous sessions — no Supabase auth required.
--    session_id is stored as a secure httpOnly cookie on the client.
-- ============================================================================
create table if not exists public.labs_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  title text not null default 'New conversation',
  language text not null default 'sv' check (language in ('sv', 'en')),
  consent_given boolean not null default false,
  first_message_at timestamptz,
  last_message_at timestamptz,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists labs_conversations_session_idx on public.labs_conversations (session_id, updated_at desc);
create index if not exists labs_conversations_updated_idx on public.labs_conversations (updated_at desc);
create index if not exists labs_conversations_created_idx on public.labs_conversations (created_at desc);

create trigger if not exists labs_conversations_set_updated_at
  before update on public.labs_conversations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. LABS MESSAGES
-- ============================================================================
create table if not exists public.labs_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.labs_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  tokens_input integer,
  tokens_output integer,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists labs_messages_convo_created_idx on public.labs_messages (conversation_id, created_at asc);
create index if not exists labs_messages_created_idx on public.labs_messages (created_at desc);

-- ============================================================================
-- 4. LABS PROJECTS
--    Created when BudAI determines sufficient information has been gathered
--    and contact details have been provided.
-- ============================================================================
create table if not exists public.labs_projects (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.labs_conversations(id) on delete cascade,
  status labs_project_status not null default 'new_inquiry',
  -- Contact info
  contact_name text,
  contact_email text,
  contact_phone text,
  company text,
  preferred_contact text check (preferred_contact in ('email', 'phone', 'digital_meeting', null)),
  -- AI-generated project summary fields
  project_title text,
  customer_goal text,
  problem text,
  proposed_solution text,
  scope text,
  budget text,
  timeline text,
  risks text,
  next_steps text,
  ai_analysis jsonb default '{}'::jsonb,
  summary_generated_at timestamptz,
  contact_collected_at timestamptz,
  -- Admin fields
  admin_notes_count integer not null default 0,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists labs_projects_conversation_idx on public.labs_projects (conversation_id);
create index if not exists labs_projects_status_idx on public.labs_projects (status, updated_at desc);
create index if not exists labs_projects_created_idx on public.labs_projects (created_at desc);
create index if not exists labs_projects_unread_idx on public.labs_projects (is_read, created_at desc) where is_read = false;
create index if not exists labs_projects_email_idx on public.labs_projects (lower(contact_email));

create trigger if not exists labs_projects_set_updated_at
  before update on public.labs_projects
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. LABS ADMIN NOTES
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
-- 6. LABS NOTIFICATIONS (for Oliver)
-- ============================================================================
create table if not exists public.labs_notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.labs_projects(id) on delete cascade,
  kind text not null check (kind in ('new_conversation', 'contact_received', 'project_qualified', 'summary_ready')),
  title text not null,
  body text,
  is_read boolean not null default false,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists labs_notifications_unread_idx on public.labs_notifications (is_read, created_at desc) where is_read = false;
create index if not exists labs_notifications_created_idx on public.labs_notifications (created_at desc);

-- ============================================================================
-- 7. RLS: Labs tables are service-role only from the server.
--    No direct browser access. All reads/writes go through server API routes.
-- ============================================================================
alter table public.labs_conversations enable row level security;
alter table public.labs_messages enable row level security;
alter table public.labs_projects enable row level security;
alter table public.labs_notes enable row level security;
alter table public.labs_notifications enable row level security;

-- Remove any public grants; only service_role has access
revoke all on public.labs_conversations from public, anon, authenticated;
revoke all on public.labs_messages from public, anon, authenticated;
revoke all on public.labs_projects from public, anon, authenticated;
revoke all on public.labs_notes from public, anon, authenticated;
revoke all on public.labs_notifications from public, anon, authenticated;

grant all on public.labs_conversations to service_role;
grant all on public.labs_messages to service_role;
grant all on public.labs_projects to service_role;
grant all on public.labs_notes to service_role;
grant all on public.labs_notifications to service_role;

-- Grant usage on sequences (if any) to service_role
grant usage, select on all sequences in schema public to service_role;

-- ============================================================================
-- 8. Helper function: increment message count and last_message_at
-- ============================================================================
create or replace function public.labs_record_message(conv_id uuid, msg_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.labs_conversations
     set message_count = message_count + 1,
         last_message_at = now(),
         first_message_at = coalesce(first_message_at, now())
   where id = conv_id;
end;
$$;

revoke all on function public.labs_record_message(uuid, text) from public, anon, authenticated;
grant execute on function public.labs_record_message(uuid, text) to service_role;
