-- ==============================================================================
-- MPLADS SENTINEL — DATABASE SCHEMA: AUDIT TRAIL
-- Table: public.audit_trail
-- Canonical immutable ledger of all verification, inspection, and review decisions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id TEXT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    comment TEXT,
    reason TEXT,
    priority TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes for instant filtering & ordering
CREATE INDEX IF NOT EXISTS idx_audit_trail_work_id ON public.audit_trail(work_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_house ON public.audit_trail(house);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON public.audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_role ON public.audit_trail(actor_role);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);

-- Enable RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Select policy: AUDITOR and MOSPI_ADMIN have full view; scoped officers can view audit trails
DROP POLICY IF EXISTS "Role scoped read on audit_trail" ON public.audit_trail;
CREATE POLICY "Role scoped read on audit_trail" ON public.audit_trail
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
            )
        )
    );

-- Allow public read for demo/testing lookup if needed
DROP POLICY IF EXISTS "Public read audit_trail for demo" ON public.audit_trail;
CREATE POLICY "Public read audit_trail for demo" ON public.audit_trail
    FOR SELECT TO anon
    USING (true);

-- Insert policy: Authorized officers and auditors can append audit entries
DROP POLICY IF EXISTS "Authorized users can insert audit_trail" ON public.audit_trail;
CREATE POLICY "Authorized users can insert audit_trail" ON public.audit_trail
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
        )
    );

-- Allow service_role full access
GRANT ALL ON public.audit_trail TO service_role;
GRANT SELECT, INSERT ON public.audit_trail TO authenticated, anon;
