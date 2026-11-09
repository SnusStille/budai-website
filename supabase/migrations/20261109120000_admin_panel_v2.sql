-- ============================================================================
-- Stilledev / BudAI — Admin Panel 2.0 (v13)   NON-DESTRUCTIVE, idempotent.
-- Reuses: waitlist_users, feedback, admin_events, platform_events, profiles,
-- conversations, messages, memories, usage_daily, usage_guest_daily.
-- Adds: page_views, contact_submissions, contact_notes, site_settings,
-- site_announcements, site_content, admin_audit_logs, admin_notifications,
-- app_admins.  Apply AFTER schema.sql / MIGRATION_v12. Never drops data.
-- ============================================================================
create extension if not exists pgcrypto;

do $$ begin
  if not exists (select 1 from pg_type where typname='contact_status') then
    create type contact_status as enum ('new','in_progress','contacted','completed','archived');
  end if;
  if not exists (select 1 from pg_type where typname='app_admin_role') then
    create type app_admin_role as enum ('owner','admin','viewer');
  end if;
end $$;

-- ---------- privacy-preserving page views (no IP, no full UA, no fingerprint)
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 300),
  referrer_host text check (char_length(referrer_host) <= 200),
  country_code text check (char_length(country_code) <= 2),
  device_type text not null default 'unknown' check (device_type in ('desktop','mobile','tablet','bot','unknown')),
  browser_family text not null default 'unknown' check (char_length(browser_family) <= 40),
  session_hash text not null check (char_length(session_hash) between 16 and 128),
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_created_idx on public.page_views (path, created_at desc);
create index if not exists page_views_session_idx on public.page_views (session_hash, created_at desc);
alter table public.page_views enable row level security;
revoke all on table public.page_views from public, anon, authenticated;
grant select, insert, delete on table public.page_views to service_role;

-- ---------- contact CRM (the public /contact form writes here, service role only)
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text check (char_length(company) <= 160),
  subject text not null default 'General enquiry' check (char_length(subject) between 1 and 160),
  message text not null check (char_length(message) between 3 and 5000),
  status contact_status not null default 'new',
  is_read boolean not null default false,
  assigned_to text check (char_length(assigned_to) <= 120),
  source text not null default 'contact_form' check (char_length(source) <= 60),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_created_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx on public.contact_submissions (status, created_at desc);
create index if not exists contact_submissions_email_idx on public.contact_submissions (lower(email));
drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at before update on public.contact_submissions
  for each row execute function public.set_updated_at();
alter table public.contact_submissions enable row level security;
revoke all on table public.contact_submissions from public, anon, authenticated;
grant select, insert, update, delete on table public.contact_submissions to service_role;

create table if not exists public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.contact_submissions(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  author text not null default 'admin' check (char_length(author) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists contact_notes_submission_idx on public.contact_notes (submission_id, created_at desc);
alter table public.contact_notes enable row level security;
revoke all on table public.contact_notes from public, anon, authenticated;
grant select, insert, delete on table public.contact_notes to service_role;

-- ---------- site management (safe keys only; site renders defaults if absent)
create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_.-]{1,80}$'),
  value jsonb not null default '{}'::jsonb,
  updated_by text check (char_length(updated_by) <= 120),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
revoke all on table public.site_settings from public, anon, authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

create table if not exists public.site_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  body text check (char_length(body) <= 1000),
  href text check (char_length(href) <= 300),
  label text check (char_length(label) <= 60),
  tone text not null default 'info' check (tone in ('info','success','warning')),
  published boolean not null default false,
  starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index if not exists site_announcements_active_idx on public.site_announcements (published, starts_at, ends_at);
drop trigger if exists site_announcements_set_updated_at on public.site_announcements;
create trigger site_announcements_set_updated_at before update on public.site_announcements
  for each row execute function public.set_updated_at();
alter table public.site_announcements enable row level security;
revoke all on table public.site_announcements from public, anon, authenticated;
grant select, insert, update, delete on table public.site_announcements to service_role;

create table if not exists public.site_content (
  key text not null check (key ~ '^[a-z0-9_.-]{1,80}$'),
  locale text not null default 'en' check (locale in ('en','sv')),
  title text check (char_length(title) <= 200),
  body text check (char_length(body) <= 5000),
  updated_by text check (char_length(updated_by) <= 120),
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);
alter table public.site_content enable row level security;
revoke all on table public.site_content from public, anon, authenticated;
grant select, insert, update, delete on table public.site_content to service_role;

-- ---------- future Supabase-Auth admins (NEVER user_metadata based)
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role app_admin_role not null default 'viewer',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;
revoke all on table public.app_admins from public, anon, authenticated;
grant select, insert, update, delete on table public.app_admins to service_role;
create or replace function public.is_app_admin(check_role app_admin_role default 'viewer')
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.app_admins a where a.user_id = auth.uid() and a.is_active
    and case check_role when 'owner' then a.role='owner' when 'admin' then a.role in ('owner','admin') else true end);
$$;
revoke all on function public.is_app_admin(app_admin_role) from public;
grant execute on function public.is_app_admin(app_admin_role) to authenticated;

-- ---------- audit trail + notifications (no secrets/PII beyond what's needed)
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null default 'admin' check (char_length(actor) <= 120),
  action text not null check (char_length(action) between 1 and 80),
  target_type text check (char_length(target_type) <= 60),
  target_id text check (char_length(target_id) <= 120),
  details jsonb not null default '{}'::jsonb check (char_length(details::text) <= 4000),
  ip_hash text check (char_length(ip_hash) <= 128),
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs (action, created_at desc);
alter table public.admin_audit_logs enable row level security;
revoke all on table public.admin_audit_logs from public, anon, authenticated;
grant select, insert on table public.admin_audit_logs to service_role;

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'info' check (char_length(kind) <= 40),
  title text not null check (char_length(title) between 1 and 200),
  body text check (char_length(body) <= 1000),
  href text check (char_length(href) <= 200),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists admin_notifications_created_idx on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_unread_idx on public.admin_notifications (is_read, created_at desc);
alter table public.admin_notifications enable row level security;
revoke all on table public.admin_notifications from public, anon, authenticated;
grant select, insert, update on table public.admin_notifications to service_role;

-- Notify admins on new contact / waitlist rows (in-app only; email needs a provider)
create or replace function public.notify_admin_new_record() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_notifications(kind, title, body, href)
  values (tg_argv[0], tg_argv[1], left(coalesce(new.email,''),120), tg_argv[2]);
  return new;
end $$;
drop trigger if exists contact_notify_admin on public.contact_submissions;
create trigger contact_notify_admin after insert on public.contact_submissions
  for each row execute function public.notify_admin_new_record('contact','New contact message','admin:contact');
drop trigger if exists waitlist_notify_admin on public.waitlist_users;
create trigger waitlist_notify_admin after insert on public.waitlist_users
  for each row execute function public.notify_admin_new_record('waitlist','New waitlist registration','admin:waitlist');

-- ---------- reporting views (service-role reads; views inherit caller grants)
create or replace view public.analytics_daily as
  select date_trunc('day', created_at)::date as day, count(*)::int as views,
         count(distinct session_hash)::int as unique_sessions from public.page_views group by 1;
create or replace view public.analytics_top_pages as
  select path, count(*)::int as views, count(distinct session_hash)::int as unique_sessions,
         max(created_at) as last_seen from public.page_views group by path;
revoke all on public.analytics_daily, public.analytics_top_pages from public, anon, authenticated;
grant select on public.analytics_daily, public.analytics_top_pages to service_role;
