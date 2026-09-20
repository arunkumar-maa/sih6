-- ==============================================================================
-- STORED PROCEDURE: get_auditor_kpis
-- High-speed server-side aggregation for Auditor / Verification Officer Desk
-- Computes real database totals for verification workflows in <30ms.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_auditor_kpis(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    tbl TEXT;
    q TEXT;
BEGIN
    IF p_house = 'Rajya Sabha' THEN
        tbl := 'public.rajya_sabha_projects';
    ELSE
        tbl := 'public.lok_sabha_projects';
    END IF;

    q := 'SELECT json_build_object(
        ''casesAwaitingReview'', COUNT(*) FILTER (WHERE verification_status = ''New Alert'' OR verification_status IS NULL)::INT,
        ''highRiskCases'', COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT,
        ''mediumRiskCases'', COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT,
        ''inspectionRequested'', COUNT(*) FILTER (WHERE verification_status = ''Inspection Requested'')::INT,
        ''underReview'', COUNT(*) FILTER (WHERE verification_status = ''Under Review'')::INT,
        ''verified'', COUNT(*) FILTER (WHERE verification_status = ''Verified'')::INT,
        ''needsFurtherInvestigation'', COUNT(*) FILTER (WHERE verification_status = ''Needs Further Investigation'')::INT,
        ''dismissed'', COUNT(*) FILTER (WHERE verification_status = ''Dismissed'')::INT,
        ''totalCases'', COUNT(*)::INT,
        ''totalSanctionAmount'', COALESCE(SUM(sanction_amount), 0)::NUMERIC
    ) FROM ' || tbl || ' WHERE 1=1';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_district IS NOT NULL AND p_district != '' THEN
        q := q || ' AND (district = ' || quote_literal(p_district) || 
                  ' OR split_part(district, ''('', 1) = split_part(' || quote_literal(p_district) || ', ''('', 1))';
    END IF;

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auditor_kpis(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
