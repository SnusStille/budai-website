-- ============================================================================
-- BudAI MIGRATION v8 — waitlist referrals + shared conversations
-- Run AFTER MIGRATION_v7_security.sql. Safe to re-run.
-- ============================================================================

-- 1. Referral columns
alter table public.waitlist_users add column if not exists referral_code text;
alter table public.waitlist_users add column if not exists referral_count integer not null default 0;
update public.waitlist_users set referral_code = substr(md5(random()::text || id::text), 1, 8) where referral_code is null;
alter table public.waitlist_users
  alter column referral_code set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);
create unique index if not exists waitlist_users_referral_code_key on public.waitlist_users (referral_code);

-- 2. Credit the referrer when someone signs up with "referral:<code>" in notes
create or replace function public.waitlist_credit_referrer()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.notes is not null and new.notes like 'referral:%' then
    update public.waitlist_users
       set referral_count = referral_count + 1
     where referral_code = lower(trim(substr(new.notes, 10))) and id <> new.id;
  end if;
  return new;
end $$;

drop trigger if exists waitlist_referral_trg on public.waitlist_users;
create trigger waitlist_referral_trg after insert on public.waitlist_users
  for each row execute function public.waitlist_credit_referrer();

-- 3. Insert policy: public can't set their own referral_count
drop policy if exists "waitlist_insert_public" on public.waitlist_users;
create policy "waitlist_insert_public"
  on public.waitlist_users for insert to anon, authenticated
  with check (
    access_status = 'pending'
    and coalesce(referral_count, 0) = 0
    and char_length(email) between 5 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(coalesce(name, '')) <= 120
    and coalesce(priority, 50) between 0 and 100
  );

-- 4. Position in line (each referral moves you up ~2 days)
create or replace function public.waitlist_status(p_email text)
returns table (pos integer, total integer, code text, referrals integer)
language sql security definer set search_path = public stable as $$
  with me as (
    select created_at, referral_count, referral_code
      from public.waitlist_users where lower(email) = lower(p_email) limit 1
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

-- 5. Shared conversations (read via server only; no public policies)
create table if not exists public.shared_conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  messages jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.shared_conversations enable row level security;
