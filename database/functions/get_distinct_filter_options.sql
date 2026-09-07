-- ==============================================================================
-- STORED PROCEDURE: get_distinct_filter_options
-- High-speed server-side aggregation for official filter dropdowns
-- Retrieves distinct States, Constituencies, and MPs without downloading project rows.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_distinct_filter_options(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT NULL
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

    q := 'WITH base AS (SELECT * FROM ' || tbl || ' WHERE 1=1';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
    END IF;

    q := q || ') SELECT json_build_object(
        ''states'', (SELECT COALESCE(json_agg(s), ''[]''::json) FROM (SELECT DISTINCT state AS s FROM base WHERE state IS NOT NULL AND state != '''' ORDER BY s) sub1),
        ''constituencies'', (SELECT COALESCE(json_agg(c), ''[]''::json) FROM (SELECT DISTINCT constituency AS c FROM base WHERE constituency IS NOT NULL AND constituency != '''' ORDER BY c) sub2),
        ''mps'', (SELECT COALESCE(json_agg(m), ''[]''::json) FROM (SELECT DISTINCT mp_name AS m FROM base WHERE mp_name IS NOT NULL AND mp_name != '''' ORDER BY m) sub3)
    )';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_distinct_filter_options(TEXT, TEXT) TO anon, authenticated, service_role;
