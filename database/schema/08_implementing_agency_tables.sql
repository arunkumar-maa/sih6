-- ==============================================================================
-- MPLADS SENTINEL — DATABASE SCHEMA: IMPLEMENTING AGENCY
-- Tables:
--   1. public.implementing_agency_profiles
--   2. public.implementing_agency_project_assignments
--   3. public.execution_updates
--   4. public.execution_evidence
-- ==============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Implementing Agency Master Profiles (100% real dataset derived)
CREATE TABLE IF NOT EXISTS public.implementing_agency_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name TEXT NOT NULL,
    normalized_agency_name TEXT NOT NULL UNIQUE,
    agency_code TEXT,
    state TEXT,
    district TEXT,
    total_assigned_works INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iap_norm_name ON public.implementing_agency_profiles(normalized_agency_name);
CREATE INDEX IF NOT EXISTS idx_iap_active ON public.implementing_agency_profiles(is_active);

-- 3. Project-to-Agency Assignment Mapping (Assignment-Based Security Layer)
CREATE TABLE IF NOT EXISTS public.implementing_agency_project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.implementing_agency_profiles(id) ON DELETE CASCADE,
    work_id TEXT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_agency_project_assignment UNIQUE (agency_id, work_id, house)
);

CREATE INDEX IF NOT EXISTS idx_ia_pa_agency_id ON public.implementing_agency_project_assignments(agency_id);
CREATE INDEX IF NOT EXISTS idx_ia_pa_work_house ON public.implementing_agency_project_assignments(work_id, house);
CREATE INDEX IF NOT EXISTS idx_ia_pa_active ON public.implementing_agency_project_assignments(is_active);

-- 4. Append-Only Execution Updates (Full audit history of ground progress)
CREATE TABLE IF NOT EXISTS public.execution_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id TEXT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
    agency_id UUID NOT NULL REFERENCES public.implementing_agency_profiles(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    previous_progress NUMERIC DEFAULT 0,
    physical_progress NUMERIC NOT NULL CHECK (physical_progress >= 0 AND physical_progress <= 100),
    milestone_status TEXT NOT NULL,
    update_date DATE NOT NULL,
    remarks TEXT NOT NULL,
    delay_reason TEXT,
    expected_completion_date DATE,
    review_status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (
        review_status IN ('DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'ACCEPTED', 'NEEDS REVISION')
    ),
    reviewer_remarks TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eu_work_id ON public.execution_updates(work_id, house);
CREATE INDEX IF NOT EXISTS idx_eu_agency_id ON public.execution_updates(agency_id);
CREATE INDEX IF NOT EXISTS idx_eu_submitted_at ON public.execution_updates(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_eu_review_status ON public.execution_updates(review_status);

-- 5. Execution Evidence & Documents (Photos, inspection certificates, completion proofs)
CREATE TABLE IF NOT EXISTS public.execution_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id TEXT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
    agency_id UUID NOT NULL REFERENCES public.implementing_agency_profiles(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    description TEXT,
    execution_update_id UUID REFERENCES public.execution_updates(id) ON DELETE SET NULL,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ee_work_id ON public.execution_evidence(work_id, house);
CREATE INDEX IF NOT EXISTS idx_ee_agency_id ON public.execution_evidence(agency_id);
CREATE INDEX IF NOT EXISTS idx_ee_created_at ON public.execution_evidence(created_at DESC);

-- 6. Add agency_id to public.profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'agency_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN agency_id UUID REFERENCES public.implementing_agency_profiles(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);
    END IF;
END $$;
