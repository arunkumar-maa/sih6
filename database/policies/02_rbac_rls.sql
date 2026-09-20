-- ==============================================================================
-- MPLADS SENTINEL — ROW LEVEL SECURITY (RLS) POLICIES FOR 6 CANONICAL ROLES
-- Roles: MOSPI_ADMIN, STATE_NODAL_OFFICER, DISTRICT_OFFICER,
--        IMPLEMENTING_AGENCY, MP, AUDITOR
-- ==============================================================================

-- 1. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE OR REPLACE FUNCTION public.is_mospi_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid() AND role = 'MOSPI_ADMIN'
    );
$$;

DROP POLICY IF EXISTS "Users can view own profile or admin view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin view all" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR public.is_mospi_admin()
    );

DROP POLICY IF EXISTS "Public read profiles for demo auth lookup" ON public.profiles;
CREATE POLICY "Public read profiles for demo auth lookup" ON public.profiles
    FOR SELECT TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON public.profiles;
CREATE POLICY "Allow authenticated users to update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- 3. Lok Sabha Projects Scoped Read Policy for Authenticated Users
DROP POLICY IF EXISTS "Role scoped read on lok_sabha_projects" ON public.lok_sabha_projects;
CREATE POLICY "Role scoped read on lok_sabha_projects" ON public.lok_sabha_projects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR')
                OR (p.role = 'STATE_NODAL_OFFICER' AND (p.state IS NULL OR p.state = '' OR p.state = lok_sabha_projects.state))
                OR (p.role = 'DISTRICT_OFFICER' AND (
                    (p.state IS NULL OR p.state = '' OR lower(p.state) = lower(lok_sabha_projects.state))
                    AND (
                        p.district IS NULL OR p.district = ''
                        OR lower(p.district) = lower(lok_sabha_projects.district)
                        OR lower(p.district) = lower(split_part(lok_sabha_projects.district, '(', 1))
                        OR lower(split_part(p.district, '(', 1)) = lower(split_part(lok_sabha_projects.district, '(', 1))
                        OR lok_sabha_projects.district ILIKE (split_part(p.district, '(', 1) || ' (%')
                        OR lok_sabha_projects.district ILIKE (split_part(p.district, '(', 1) || '(%')
                    )
                ))
                OR (p.role = 'IMPLEMENTING_AGENCY' AND (p.agency_name IS NULL OR lower(p.agency_name) = lower(lok_sabha_projects.ida) OR lower(p.agency_name) = lower(lok_sabha_projects.vendor_name)))
                OR (p.role = 'MP' AND p.house = 'Lok Sabha' AND (lower(p.mp_name) = lower(lok_sabha_projects.mp_name) OR lok_sabha_projects.mp_name ILIKE ('%' || p.mp_name || '%')))
            )
        )
    );

-- 4. Rajya Sabha Projects Scoped Read Policy for Authenticated Users
DROP POLICY IF EXISTS "Role scoped read on rajya_sabha_projects" ON public.rajya_sabha_projects;
CREATE POLICY "Role scoped read on rajya_sabha_projects" ON public.rajya_sabha_projects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR')
                OR (p.role = 'STATE_NODAL_OFFICER' AND (p.state IS NULL OR p.state = '' OR p.state = rajya_sabha_projects.state))
                OR (p.role = 'DISTRICT_OFFICER' AND (
                    (p.state IS NULL OR p.state = '' OR lower(p.state) = lower(rajya_sabha_projects.state))
                    AND (
                        p.district IS NULL OR p.district = ''
                        OR lower(p.district) = lower(rajya_sabha_projects.district)
                        OR lower(p.district) = lower(split_part(rajya_sabha_projects.district, '(', 1))
                        OR lower(split_part(p.district, '(', 1)) = lower(split_part(rajya_sabha_projects.district, '(', 1))
                        OR rajya_sabha_projects.district ILIKE (split_part(p.district, '(', 1) || ' (%')
                        OR rajya_sabha_projects.district ILIKE (split_part(p.district, '(', 1) || '(%')
                    )
                ))
                OR (p.role = 'IMPLEMENTING_AGENCY' AND (p.agency_name IS NULL OR lower(p.agency_name) = lower(rajya_sabha_projects.ida) OR lower(p.agency_name) = lower(rajya_sabha_projects.vendor_name)))
                OR (p.role = 'MP' AND p.house = 'Rajya Sabha' AND (lower(p.mp_name) = lower(rajya_sabha_projects.mp_name) OR rajya_sabha_projects.mp_name ILIKE ('%' || p.mp_name || '%')))
            )
        )
    );

-- 5. Anomaly Results Scoped Read Policy
DROP POLICY IF EXISTS "Role scoped read on project_anomaly_results" ON public.project_anomaly_results;
CREATE POLICY "Role scoped read on project_anomaly_results" ON public.project_anomaly_results
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid()
            AND p.is_active = true
            AND (
                p.role IN ('MOSPI_ADMIN', 'AUDITOR')
                OR (p.role = 'STATE_NODAL_OFFICER' AND (p.state IS NULL OR p.state = '' OR p.state = project_anomaly_results.state))
                OR (p.role = 'DISTRICT_OFFICER' AND (
                    (p.state IS NULL OR p.state = '' OR lower(p.state) = lower(project_anomaly_results.state))
                    AND (
                        p.district IS NULL OR p.district = ''
                        OR lower(p.district) = lower(project_anomaly_results.district)
                        OR lower(p.district) = lower(split_part(project_anomaly_results.district, '(', 1))
                        OR lower(split_part(p.district, '(', 1)) = lower(split_part(project_anomaly_results.district, '(', 1))
                        OR project_anomaly_results.district ILIKE (split_part(p.district, '(', 1) || ' (%')
                        OR project_anomaly_results.district ILIKE (split_part(p.district, '(', 1) || '(%')
                    )
                ))
                OR (p.role = 'MP' AND (p.constituency IS NULL OR p.constituency = project_anomaly_results.constituency) AND (p.state IS NULL OR p.state = project_anomaly_results.state))
            )
        )
    );
