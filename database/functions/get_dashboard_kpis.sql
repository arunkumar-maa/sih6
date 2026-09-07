-- ==============================================================================
-- STORED PROCEDURE: get_dashboard_kpis
-- High-speed server-side aggregation for Command Center KPIs
-- Computes counts, financial sums, risk distribution, and completion rates in <50ms.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT NULL,
    p_constituency TEXT DEFAULT NULL,
    p_mp TEXT DEFAULT NULL,
    p_risk TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_tenure TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL
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
        ''total'', COUNT(*),
        ''totalSanctionAmount'', COALESCE(SUM(sanction_amount), 0),
        ''totalDisbursed'', COALESCE(SUM(total_paid), 0),
        ''completed'', COUNT(*) FILTER (WHERE is_completed = TRUE),
        ''highRisk'', COUNT(*) FILTER (WHERE risk_level = ''HIGH''),
        ''medRisk'', COUNT(*) FILTER (WHERE risk_level = ''MEDIUM''),
        ''lowRisk'', COUNT(*) FILTER (WHERE risk_level = ''LOW''),
        ''pendingSanction'', COUNT(*) FILTER (WHERE is_recommended_only = TRUE),
        ''requiresVerification'', COUNT(*) FILTER (WHERE risk_level != ''LOW'' AND verification_status = ''New Alert''),
        ''avgRiskScore'', ROUND(COALESCE(AVG(risk_score), 0))
    ) FROM ' || tbl || ' WHERE 1=1';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_constituency IS NOT NULL AND p_constituency != '' THEN
        q := q || ' AND constituency = ' || quote_literal(p_constituency);
    END IF;
    IF p_mp IS NOT NULL AND p_mp != '' THEN
        q := q || ' AND mp_name = ' || quote_literal(p_mp);
    END IF;
    IF p_risk IS NOT NULL AND p_risk != '' THEN
        q := q || ' AND risk_level = ' || quote_literal(p_risk);
    END IF;
    IF p_status IS NOT NULL AND p_status != '' THEN
        q := q || ' AND work_status = ' || quote_literal(p_status);
    END IF;
    IF p_category IS NOT NULL AND p_category != '' THEN
        q := q || ' AND work_category = ' || quote_literal(p_category);
    END IF;
    IF p_tenure = '18th Lok Sabha' THEN
        q := q || ' AND (financial_year >= ''2024-2025'' OR financial_year = ''Unknown'')';
    ELSIF p_tenure = '17th Lok Sabha' THEN
        q := q || ' AND (financial_year >= ''2019-2020'' AND financial_year <= ''2023-2024'')';
    END IF;
    IF p_search IS NOT NULL AND p_search != '' THEN
        q := q || ' AND (work_description ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR work_id ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR constituency ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR district ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR mp_name ILIKE ' || quote_literal('%' || p_search || '%') || ')';
    END IF;

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
