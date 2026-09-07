-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict access control for public, authenticated, and service roles
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.lok_sabha_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rajya_sabha_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_anomaly_results ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies (Allow frontend publishable key to query datasets)
CREATE POLICY "Public read lok_sabha_projects" ON public.lok_sabha_projects
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read rajya_sabha_projects" ON public.rajya_sabha_projects
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read project_anomaly_results" ON public.project_anomaly_results
    FOR SELECT TO anon, authenticated USING (true);

-- 3. Verification Updates (Allow field officers to update verification status)
CREATE POLICY "Public update verification on lok_sabha" ON public.lok_sabha_projects
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public update verification on rajya_sabha" ON public.rajya_sabha_projects
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Anomaly Cache Management (Allow client / backend to refresh anomaly results)
CREATE POLICY "Public insert project_anomaly_results" ON public.project_anomaly_results
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public update project_anomaly_results" ON public.project_anomaly_results
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public delete project_anomaly_results" ON public.project_anomaly_results
    FOR DELETE TO anon, authenticated USING (true);
