-- BudAI MIGRATION v11: structured message ratings (audit point D3).
-- Run in Supabase SQL Editor after v10. Safe to re-run.
-- The Playground's thumbs up/down is sent to /api/feedback only when the
-- visitor has accepted optional data collection; otherwise it stays local.
-- Written only by /api/feedback (service role). No public policies or grants.

alter table public.feedback add column if not exists rating text;
alter table public.feedback add column if not exists message_id text;
alter table public.feedback add column if not exists model text;
alter table public.feedback add column if not exists lang text;

alter table public.feedback drop constraint if exists feedback_rating_valid;
alter table public.feedback add constraint feedback_rating_valid
  check (rating is null or rating in ('up', 'down'));

alter table public.feedback drop constraint if exists feedback_rating_fields_bounded;
alter table public.feedback add constraint feedback_rating_fields_bounded
  check (
    char_length(coalesce(message_id, '')) <= 80
    and char_length(coalesce(model, '')) <= 40
    and (lang is null or lang in ('en', 'sv'))
  );
