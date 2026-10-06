-- ============================================================================
-- BudAI MIGRATION v7 — lock down waitlist + legacy tables
-- Run in Supabase SQL Editor. Safe to re-run.
--
-- Before: anyone with the public anon key could READ the whole waitlist
-- (names, emails, companies). After: the public can only INSERT a valid
-- 'pending' row. Admin reads/edits go through /api/admin/waitlist
-- (service role, protected by ADMIN_PASSWORD).
-- ============================================================================

-- 1. Remove every existing policy on waitlist_users, then re-add insert only.
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
  on public.waitlist_users for insert to anon, authenticated
  with check (
    access_status = 'pending'
    and char_length(email) between 5 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(coalesce(name, '')) <= 120
    and coalesce(priority, 50) between 0 and 100
  );

-- 2. Public signup counter without exposing rows.
create or replace function public.waitlist_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$ select count(*)::int from public.waitlist_users $$;

revoke all on function public.waitlist_count() from public;
grant execute on function public.waitlist_count() to anon, authenticated;

-- 3. Legacy playground_* tables are unused by the app: remove open policies.
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
