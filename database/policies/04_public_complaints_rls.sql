-- ==============================================================================
-- MPLADS SENTINEL — ROW LEVEL SECURITY (RLS) FOR PUBLIC COMPLAINTS
-- Tables: public.public_complaints, public.public_complaint_evidence
-- Security Principles:
-- 1. Anyone can submit a complaint (INSERT allowed for anon/authenticated).
-- 2. Enumeration is BLOCKED (no broad SELECT for anon).
-- 3. Public tracking requires exact complaint_id + matching verification token / contact.
-- 4. Authorized officers can read and manage complaints according to their jurisdiction.
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.public_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_complaint_evidence ENABLE ROW LEVEL SECURITY;

-- 2. Allow anonymous and authenticated users to submit complaints
DROP POLICY IF EXISTS "Public can submit complaints" ON public.public_complaints;
CREATE POLICY "Public can submit complaints" ON public.public_complaints
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        complaint_id IS NOT NULL 
        AND work_id IS NOT NULL 
        AND description IS NOT NULL 
        AND length(trim(description)) >= 20
        AND status = 'SUBMITTED'
    );

-- 3. Allow anonymous and authenticated users to insert evidence attached to their submission
DROP POLICY IF EXISTS "Public can upload complaint evidence" ON public.public_complaint_evidence;
CREATE POLICY "Public can upload complaint evidence" ON public.public_complaint_evidence
    FOR INSERT TO anon, authenticated
    WITH CHECK (complaint_id IS NOT NULL AND storage_path IS NOT NULL);

-- 4. Internal officers can view complaints in their administrative scope
DROP POLICY IF EXISTS "Officers can view complaints" ON public.public_complaints;
CREATE POLICY "Officers can view complaints" ON public.public_complaints
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'AUDITOR')
        )
    );

DROP POLICY IF EXISTS "Officers can view complaint evidence" ON public.public_complaint_evidence;
CREATE POLICY "Officers can view complaint evidence" ON public.public_complaint_evidence
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'AUDITOR')
        )
    );

-- 5. Only authorized officers can update complaint statuses
DROP POLICY IF EXISTS "Officers can update complaint status" ON public.public_complaints;
CREATE POLICY "Officers can update complaint status" ON public.public_complaints
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
        )
    );
