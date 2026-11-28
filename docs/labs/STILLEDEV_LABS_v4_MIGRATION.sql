-- =====================================================================
-- Stilledev Labs v4.0 — SQL Migration
-- Körs i Supabase SQL Editor. Säker (idempotent).
-- =====================================================================

-- 1. Lägg till nya statusvärden i labs_project_status-enumen
--    (Om värdet redan finns fångar vi duplicate_object-felet)
DO $$
BEGIN
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'awaiting_customer_confirmation'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'ready_for_review'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'needs_more_information'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'under_evaluation'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'quote_in_progress'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'consultation_in_progress'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_project_status ADD VALUE IF NOT EXISTS 'brief_submitted'; EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- 2. Nya kolumner på labs_projects (för sökning/filter i admin; källan är project_profile JSONB)
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS customer_role TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'unknown';
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS client_intent TEXT DEFAULT 'unknown';
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS budget_amount NUMERIC;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS budget_currency TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS budget_status TEXT DEFAULT 'unknown';
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS pricing_preference TEXT DEFAULT 'unknown';
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS desired_start TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS desired_completion TEXT;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS hard_deadline BOOLEAN;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE labs_projects ADD COLUMN IF NOT EXISTS brief_confirmed_at TIMESTAMPTZ;

-- 3. Index för admin-sökning
CREATE INDEX IF NOT EXISTS idx_labs_projects_customer_type ON labs_projects(customer_type);
CREATE INDEX IF NOT EXISTS idx_labs_projects_client_intent ON labs_projects(client_intent);
CREATE INDEX IF NOT EXISTS idx_labs_projects_submitted_at ON labs_projects(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_labs_projects_status_v2 ON labs_projects(status, updated_at DESC);

-- 4. GIN-index på project_profile JSONB för djupare sökning
CREATE INDEX IF NOT EXISTS idx_labs_conversations_profile_gin
  ON labs_conversations USING gin (project_profile);

-- 5. Lägg till brief_submitted i notification_kind-enumen
DO $$
BEGIN
  BEGIN ALTER TYPE labs_notification_kind ADD VALUE IF NOT EXISTS 'brief_submitted'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE labs_notification_kind ADD VALUE IF NOT EXISTS 'high_priority_lead'; EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;
