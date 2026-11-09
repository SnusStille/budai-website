-- Admin Panel 2.1 (v14) — feedback triage. NON-DESTRUCTIVE, idempotent. Apply AFTER v13.
alter table public.feedback add column if not exists status text not null default 'new';
alter table public.feedback add column if not exists is_read boolean not null default false;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='feedback_status_valid') then
    alter table public.feedback add constraint feedback_status_valid check (status in ('new','in_progress','resolved','archived'));
  end if;
end $$;
create index if not exists feedback_status_idx on public.feedback (status, created_at desc);
-- grants unchanged: feedback stays service-role-only (RLS on, no anon/authenticated grants).
