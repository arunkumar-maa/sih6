-- ==============================================================================
-- STORED PROCEDURE: get_state_gis_metrics
-- Aggregates metrics across the 36 States & Union Territories for Rajya Sabha
-- Returns pre-aggregated rows for high-performance GeoJSON choropleth rendering.
-- Supports all 8 canonical filter parameters and dual output aliases.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_state_gis_metrics(
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
    q TEXT;
BEGIN
    q := 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (
        SELECT 
            state,
            COUNT(*)::INT AS total_works,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS total_sanctioned,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned_amount,
            COALESCE(SUM(total_paid), 0)::NUMERIC AS total_disbursed,
            COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed_amount,
            COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed_works,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk_count,
            COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT AS medium_risk_count,
            COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT AS low_risk_count,
            ROUND(COALESCE(AVG(risk_score), 0), 1)::NUMERIC AS avg_risk_score
        FROM public.rajya_sabha_projects
        WHERE state IS NOT NULL AND state != ''''';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
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
    IF p_tenure IS NOT NULL AND p_tenure != '' AND p_tenure != 'All Tenures' THEN
        q := q || ' AND financial_year = ' || quote_literal(p_tenure);
    END IF;
    IF p_search IS NOT NULL AND p_search != '' THEN
        q := q || ' AND (work_description ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR work_id ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR district ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR mp_name ILIKE ' || quote_literal('%' || p_search || '%') || ')';
    END IF;

    q := q || ' GROUP BY state ORDER BY state) t';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_state_gis_metrics(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
