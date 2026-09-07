-- ==============================================================================
-- MPLADS SENTINEL — DATABASE SCHEMA: PROJECT ANOMALY RESULTS
-- Table: public.project_anomaly_results
-- Derived intelligence cache storing Isolation Forest & Rule Engine anomaly signals
-- Never modifies or overwrites raw project data in lok_sabha_projects / rajya_sabha_projects.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.project_anomaly_results (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  house TEXT NOT NULL,
  category TEXT NOT NULL,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  factor_score NUMERIC NOT NULL DEFAULT 0,
  factor_id TEXT NOT NULL,
  factor_label TEXT NOT NULL,
  factor_description TEXT NOT NULL,
  factor_value TEXT,
  why_attention JSONB DEFAULT '[]'::JSONB,
  feature_contributions JSONB DEFAULT '[]'::JSONB,
  work_description TEXT,
  work_category TEXT,
  state TEXT,
  district TEXT,
  constituency TEXT,
  sanction_amount NUMERIC,
  total_paid NUMERIC,
  work_status TEXT,
  days_since_sanction INTEGER,
  disbursement_ratio NUMERIC,
  isolation_forest_score NUMERIC DEFAULT 0,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_par_house_cat ON public.project_anomaly_results(house, category);
CREATE INDEX IF NOT EXISTS idx_par_house_risk ON public.project_anomaly_results(house, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_par_work_id ON public.project_anomaly_results(work_id);
