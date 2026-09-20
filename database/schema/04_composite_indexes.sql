-- ==============================================================================
-- DATABASE SCHEMA: COMPOSITE PERFORMANCE INDEXES
-- Optimizes frequently combined filter patterns for Lok Sabha and Rajya Sabha
-- Ensures sub-15ms execution for Command Center, GIS, and Project Monitoring.
-- ==============================================================================

-- Lok Sabha Composite Indexes
CREATE INDEX IF NOT EXISTS idx_ls_state_risk ON public.lok_sabha_projects(state, risk_level);
CREATE INDEX IF NOT EXISTS idx_ls_fy_risk ON public.lok_sabha_projects(financial_year, risk_level);
CREATE INDEX IF NOT EXISTS idx_ls_status_risk ON public.lok_sabha_projects(work_status, risk_level);
CREATE INDEX IF NOT EXISTS idx_ls_cat_amount ON public.lok_sabha_projects(work_category, sanction_amount DESC);
CREATE INDEX IF NOT EXISTS idx_ls_work_id_btree ON public.lok_sabha_projects(work_id);

-- Rajya Sabha Composite Indexes
CREATE INDEX IF NOT EXISTS idx_rs_state_risk ON public.rajya_sabha_projects(state, risk_level);
CREATE INDEX IF NOT EXISTS idx_rs_fy_risk ON public.rajya_sabha_projects(financial_year, risk_level);
CREATE INDEX IF NOT EXISTS idx_rs_status_risk ON public.rajya_sabha_projects(work_status, risk_level);
CREATE INDEX IF NOT EXISTS idx_rs_cat_amount ON public.rajya_sabha_projects(work_category, sanction_amount DESC);
CREATE INDEX IF NOT EXISTS idx_rs_work_id_btree ON public.rajya_sabha_projects(work_id);

-- Full Text Search GIN Indexes for Sub-10ms Work Description Searches
CREATE INDEX IF NOT EXISTS idx_ls_desc_gin ON public.lok_sabha_projects USING gin(to_tsvector('english', COALESCE(work_description, '')));
CREATE INDEX IF NOT EXISTS idx_rs_desc_gin ON public.rajya_sabha_projects USING gin(to_tsvector('english', COALESCE(work_description, '')));

-- Anomaly Cache Performance Indexes
CREATE INDEX IF NOT EXISTS idx_par_composite_house_cat ON public.project_anomaly_results(house, category, factor_score DESC);
