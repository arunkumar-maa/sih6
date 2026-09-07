-- ==============================================================================
-- STORED PROCEDURE: get_state_gis_metrics
-- Aggregates metrics across the 37 States & Union Territories for Rajya Sabha
-- Returns pre-aggregated rows for high-performance GeoJSON choropleth rendering.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_state_gis_metrics(
    p_risk TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL
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
            COUNT(*) AS total_works,
            COALESCE(SUM(sanction_amount), 0) AS total_sanctioned,
            COALESCE(SUM(total_paid), 0) AS total_disbursed,
            COUNT(*) FILTER (WHERE is_completed = TRUE) AS completed_works,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'') AS high_risk_count,
            COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'') AS medium_risk_count,
            COUNT(*) FILTER (WHERE risk_level = ''LOW'') AS low_risk_count,
            ROUND(COALESCE(AVG(risk_score), 0), 1) AS avg_risk_score
        FROM public.rajya_sabha_projects
        WHERE state IS NOT NULL AND state != ''''';

    IF p_risk IS NOT NULL AND p_risk != '' THEN
        q := q || ' AND risk_level = ' || quote_literal(p_risk);
    END IF;
    IF p_status IS NOT NULL AND p_status != '' THEN
        q := q || ' AND work_status = ' || quote_literal(p_status);
    END IF;
    IF p_category IS NOT NULL AND p_category != '' THEN
        q := q || ' AND work_category = ' || quote_literal(p_category);
    END IF;

    q := q || ' GROUP BY state ORDER BY state) t';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_state_gis_metrics(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
