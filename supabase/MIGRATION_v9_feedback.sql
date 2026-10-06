-- BudAI MIGRATION v9: feedback inbox. Run in Supabase SQL Editor. Safe to re-run.
-- Written only by /api/feedback (service role). No public policies: read it in the Table Editor.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'other',
  message text not null,
  page text,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
