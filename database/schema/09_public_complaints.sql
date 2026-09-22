-- ==============================================================================
-- MPLADS SENTINEL — DATABASE SCHEMA: PUBLIC COMPLAINTS & GRIEVANCES
-- Table: public.public_complaints, public.complaint_events, public.public_complaint_evidence
-- Strict House Isolation: Lok Sabha public citizen monitoring
-- Privacy: Citizen contact details are strictly restricted from public enumeration.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.public_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL UNIQUE,
    work_id TEXT NOT NULL,
    house TEXT NOT NULL DEFAULT 'Lok Sabha' CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
    district TEXT,
    state TEXT,
    constituency TEXT,
    work_description TEXT,
    mp_name TEXT,
    complaint_category TEXT NOT NULL CHECK (
        complaint_category IN (
            'Project Not Progressing',
            'Work Quality Concern',
            'Work Not Found at Location',
            'Financial / Expenditure Concern',
            'Project Information Mismatch',
            'Completion Status Concern',
            'Other'
        )
    ),
    description TEXT NOT NULL,
    complainant_name TEXT,
    complainant_mobile TEXT,
    complainant_email TEXT,
    location_landmark TEXT,
    verification_token TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    public_response TEXT DEFAULT 'Complaint registered and awaiting administrative review by the competent district authority.',
    internal_notes TEXT,
    assigned_officer TEXT,
    assigned_agency TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pc_complaint_id ON public.public_complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_pc_work_id ON public.public_complaints(work_id);
CREATE INDEX IF NOT EXISTS idx_pc_status ON public.public_complaints(status);
CREATE INDEX IF NOT EXISTS idx_pc_district ON public.public_complaints(district);
CREATE INDEX IF NOT EXISTS idx_pc_state ON public.public_complaints(state);
CREATE INDEX IF NOT EXISTS idx_pc_submitted_at ON public.public_complaints(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_token ON public.public_complaints(verification_token);

-- Timeline & Audit Events Table
CREATE TABLE IF NOT EXISTS public.complaint_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL REFERENCES public.public_complaints(complaint_id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    remarks TEXT,
    public_safe BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ce_complaint_id ON public.complaint_events(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ce_created_at ON public.complaint_events(created_at ASC);

-- Evidence / Attachment Table
CREATE TABLE IF NOT EXISTS public.public_complaint_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL REFERENCES public.public_complaints(complaint_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    description TEXT,
    uploaded_by TEXT DEFAULT 'CITIZEN',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pce_complaint_id ON public.public_complaint_evidence(complaint_id);
