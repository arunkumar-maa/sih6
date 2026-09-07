-- ==============================================================================
-- MPLADS SENTINEL — DATABASE SCHEMA: RAJYA SABHA PROJECTS
-- Table: public.rajya_sabha_projects
-- Canonical storage for 79,219 official Rajya Sabha work records
-- Strictly isolated from Lok Sabha data. Zero cross-contamination.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rajya_sabha_projects (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL UNIQUE,
    sr_no TEXT,
    work_category TEXT,
    state TEXT,
    ida TEXT,
    district TEXT,
    mp_name TEXT,
    constituency TEXT,
    work_description TEXT,
    financial_year TEXT,
    house TEXT NOT NULL DEFAULT 'Rajya Sabha',
    recommended_date TIMESTAMPTZ,
    sanction_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    expenditure_date TIMESTAMPTZ,
    sanction_amount NUMERIC,
    recommended_amount NUMERIC,
    amount_disbursed NUMERIC,
    expenditure_amount NUMERIC,
    total_paid NUMERIC,
    allocated_limit NUMERIC,
    disbursement_ratio NUMERIC,
    work_status TEXT,
    payment_status TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    is_sanctioned BOOLEAN DEFAULT TRUE,
    is_recommended_only BOOLEAN DEFAULT FALSE,
    days_since_sanction INTEGER,
    days_since_recommendation INTEGER,
    days_to_complete INTEGER,
    vendor_name TEXT,
    risk_score NUMERIC DEFAULT 0,
    risk_level TEXT DEFAULT 'LOW',
    risk_factors JSONB DEFAULT '[]'::JSONB,
    risk_explanation TEXT,
    verification_status TEXT DEFAULT 'New Alert',
    verification_history JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rs_state ON public.rajya_sabha_projects(state);
CREATE INDEX IF NOT EXISTS idx_rs_district ON public.rajya_sabha_projects(district);
CREATE INDEX IF NOT EXISTS idx_rs_constituency ON public.rajya_sabha_projects(constituency);
CREATE INDEX IF NOT EXISTS idx_rs_mp ON public.rajya_sabha_projects(mp_name);
CREATE INDEX IF NOT EXISTS idx_rs_status ON public.rajya_sabha_projects(work_status);
CREATE INDEX IF NOT EXISTS idx_rs_fy ON public.rajya_sabha_projects(financial_year);
CREATE INDEX IF NOT EXISTS idx_rs_risk_level ON public.rajya_sabha_projects(risk_level);
CREATE INDEX IF NOT EXISTS idx_rs_risk_score ON public.rajya_sabha_projects(risk_score);
CREATE INDEX IF NOT EXISTS idx_rs_completed ON public.rajya_sabha_projects(is_completed);
CREATE INDEX IF NOT EXISTS idx_rs_sanction_amount ON public.rajya_sabha_projects(sanction_amount);
