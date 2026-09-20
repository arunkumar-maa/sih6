-- ==============================================================================
-- MPLADS SENTINEL — ROW LEVEL SECURITY POLICIES FOR IMPLEMENTING AGENCY
-- Tables:
--   1. public.implementing_agency_profiles
--   2. public.implementing_agency_project_assignments
--   3. public.execution_updates
--   4. public.execution_evidence
--   5. Updates to public.audit_trail
-- ==============================================================================

-- 1. implementing_agency_profiles RLS
ALTER TABLE public.implementing_agency_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read implementing_agency_profiles for authenticated" ON public.implementing_agency_profiles;
CREATE POLICY "Read implementing_agency_profiles for authenticated" ON public.implementing_agency_profiles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Public read implementing_agency_profiles for demo" ON public.implementing_agency_profiles;
CREATE POLICY "Public read implementing_agency_profiles for demo" ON public.implementing_agency_profiles
    FOR SELECT TO anon
    USING (true);

-- 2. implementing_agency_project_assignments RLS
ALTER TABLE public.implementing_agency_project_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scoped read on project_assignments" ON public.implementing_agency_project_assignments;
CREATE POLICY "Scoped read on project_assignments" ON public.implementing_agency_project_assignments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY' 
                    AND (
                        p.agency_id = implementing_agency_project_assignments.agency_id
                        OR lower(p.agency_name) = lower((
                            SELECT iap.agency_name 
                            FROM public.implementing_agency_profiles iap 
                            WHERE iap.id = implementing_agency_project_assignments.agency_id
                        ))
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Public read project_assignments for demo" ON public.implementing_agency_project_assignments;
CREATE POLICY "Public read project_assignments for demo" ON public.implementing_agency_project_assignments
    FOR SELECT TO anon
    USING (true);

-- 3. execution_updates RLS
ALTER TABLE public.execution_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scoped read on execution_updates" ON public.execution_updates;
CREATE POLICY "Scoped read on execution_updates" ON public.execution_updates
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY' 
                    AND (
                        p.agency_id = execution_updates.agency_id
                        OR lower(p.agency_name) = lower(execution_updates.agency_name)
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Scoped insert on execution_updates" ON public.execution_updates;
CREATE POLICY "Scoped insert on execution_updates" ON public.execution_updates
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'DISTRICT_OFFICER')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY'
                    -- Agency cannot mark own submission directly as ACCEPTED
                    AND execution_updates.review_status != 'ACCEPTED'
                    AND EXISTS (
                        SELECT 1 FROM public.implementing_agency_project_assignments a
                        WHERE a.work_id = execution_updates.work_id
                          AND a.house = execution_updates.house
                          AND (a.agency_id = p.agency_id OR a.agency_id = execution_updates.agency_id)
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Scoped update on execution_updates" ON public.execution_updates;
CREATE POLICY "Scoped update on execution_updates" ON public.execution_updates
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                -- Reviewers can update review status & remarks
                p.role IN ('MOSPI_ADMIN', 'DISTRICT_OFFICER', 'STATE_NODAL_OFFICER', 'AUDITOR')
                -- Implementing Agency can only edit own DRAFT or NEEDS REVISION submissions
                OR (
                    p.role = 'IMPLEMENTING_AGENCY'
                    AND (p.agency_id = execution_updates.agency_id OR lower(p.agency_name) = lower(execution_updates.agency_name))
                    AND execution_updates.review_status IN ('DRAFT', 'NEEDS REVISION')
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'DISTRICT_OFFICER', 'STATE_NODAL_OFFICER', 'AUDITOR')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY'
                    -- Implementing Agency can never self-approve to ACCEPTED
                    AND execution_updates.review_status != 'ACCEPTED'
                )
            )
        )
    );

-- 4. execution_evidence RLS
ALTER TABLE public.execution_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scoped read on execution_evidence" ON public.execution_evidence;
CREATE POLICY "Scoped read on execution_evidence" ON public.execution_evidence
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY' 
                    AND (
                        p.agency_id = execution_evidence.agency_id
                        OR EXISTS (
                            SELECT 1 FROM public.implementing_agency_project_assignments a
                            WHERE a.work_id = execution_evidence.work_id
                              AND a.house = execution_evidence.house
                              AND (a.agency_id = p.agency_id OR lower(p.agency_name) = lower((
                                  SELECT iap.agency_name FROM public.implementing_agency_profiles iap WHERE iap.id = a.agency_id
                              )))
                        )
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Scoped insert on execution_evidence" ON public.execution_evidence;
CREATE POLICY "Scoped insert on execution_evidence" ON public.execution_evidence
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER')
                OR (
                    p.role = 'IMPLEMENTING_AGENCY'
                    AND EXISTS (
                        SELECT 1 FROM public.implementing_agency_project_assignments a
                        WHERE a.work_id = execution_evidence.work_id
                          AND a.house = execution_evidence.house
                          AND (a.agency_id = p.agency_id OR a.agency_id = execution_evidence.agency_id)
                    )
                )
            )
        )
    );

-- 5. Extend audit_trail policies for IMPLEMENTING_AGENCY
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
                OR (
                    p.role = 'IMPLEMENTING_AGENCY'
                    AND EXISTS (
                        SELECT 1 FROM public.implementing_agency_project_assignments a
                        WHERE a.work_id = audit_trail.work_id
                          AND a.house = audit_trail.house
                          AND (a.agency_id = p.agency_id OR lower(p.agency_name) = lower((
                              SELECT iap.agency_name FROM public.implementing_agency_profiles iap WHERE iap.id = a.agency_id
                          )))
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Authorized users can insert audit_trail" ON public.audit_trail;
CREATE POLICY "Authorized users can insert audit_trail" ON public.audit_trail
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND p.role IN ('MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'IMPLEMENTING_AGENCY')
        )
    );

-- Grant privileges
GRANT ALL ON public.implementing_agency_profiles TO service_role;
GRANT ALL ON public.implementing_agency_project_assignments TO service_role;
GRANT ALL ON public.execution_updates TO service_role;
GRANT ALL ON public.execution_evidence TO service_role;

GRANT SELECT ON public.implementing_agency_profiles TO authenticated, anon;
GRANT SELECT ON public.implementing_agency_project_assignments TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.execution_updates TO authenticated;
GRANT SELECT, INSERT ON public.execution_evidence TO authenticated;
