-- ==============================================================================
-- STORED PROCEDURE: get_analytics_observatory
-- Unified server-side aggregation for Performance Observatory / Analytics
-- Computes macro KPIs, top district risk distributions, category distributions,
-- implementation status breakdown, and financial year trends with role auto-scoping.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_analytics_observatory(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT NULL,
    p_constituency TEXT DEFAULT NULL,
    p_mp TEXT DEFAULT NULL,
    p_risk TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_tenure TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    tbl TEXT;
    where_clause TEXT := ' WHERE 1=1';
    q TEXT;
    v_user_role TEXT;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    clean_d TEXT;
BEGIN
    SET LOCAL statement_timeout = '30s';

    SELECT role, state, district INTO v_user_role, v_assigned_state, v_assigned_district
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF v_user_role = 'STATE_NODAL_OFFICER' AND v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
        p_state := v_assigned_state;
    ELSIF v_user_role = 'DISTRICT_OFFICER' AND v_assigned_district IS NOT NULL AND v_assigned_district != '' THEN
        p_district := v_assigned_district;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
    END IF;

    IF p_house = 'Rajya Sabha' THEN
        tbl := 'public.rajya_sabha_projects';
    ELSE
        tbl := 'public.lok_sabha_projects';
    END IF;

    IF p_state IS NOT NULL AND p_state != '' THEN
        where_clause := where_clause || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_district IS NOT NULL AND p_district != '' THEN
        clean_d := TRIM(split_part(p_district, '(', 1));
        where_clause := where_clause || ' AND (district = ' || quote_literal(p_district) || ' OR district ILIKE ' || quote_literal(clean_d || '%') || ')';
    END IF;
    IF p_house != 'Rajya Sabha' AND p_constituency IS NOT NULL AND p_constituency != '' THEN
        where_clause := where_clause || ' AND constituency = ' || quote_literal(p_constituency);
    END IF;
    IF p_mp IS NOT NULL AND p_mp != '' THEN
        where_clause := where_clause || ' AND mp_name = ' || quote_literal(p_mp);
    END IF;
    IF p_risk IS NOT NULL AND p_risk != '' THEN
        where_clause := where_clause || ' AND risk_level = ' || quote_literal(p_risk);
    END IF;
    IF p_status IS NOT NULL AND p_status != '' THEN
        where_clause := where_clause || ' AND work_status = ' || quote_literal(p_status);
    END IF;
    IF p_category IS NOT NULL AND p_category != '' THEN
        where_clause := where_clause || ' AND work_category = ' || quote_literal(p_category);
    END IF;
    IF p_tenure = '18th Lok Sabha' THEN
        where_clause := where_clause || ' AND (financial_year >= ''2024-2025'' OR financial_year = ''Unknown'')';
    ELSIF p_tenure = '17th Lok Sabha' THEN
        where_clause := where_clause || ' AND (financial_year >= ''2019-2020'' AND financial_year <= ''2023-2024'')';
    END IF;
    IF p_search IS NOT NULL AND p_search != '' THEN
        where_clause := where_clause || ' AND (work_description ILIKE ' || quote_literal('%' || p_search || '%') ||
                                        ' OR work_id ILIKE ' || quote_literal('%' || p_search || '%') ||
                                        ' OR district ILIKE ' || quote_literal('%' || p_search || '%') ||
                                        ' OR mp_name ILIKE ' || quote_literal('%' || p_search || '%') || ')';
    END IF;

    q := 'WITH base AS MATERIALIZED (
        SELECT 
            district,
            work_category,
            work_status,
            financial_year,
            COALESCE(sanction_amount, 0) AS sanction_amount,
            COALESCE(total_paid, 0) AS total_paid,
            is_completed,
            is_recommended_only,
            risk_level,
            COALESCE(risk_score, 0) AS risk_score
        FROM ' || tbl || where_clause || '
    ),
    kpi_agg AS (
        SELECT 
            COUNT(*)::INT AS total,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS total_sanction,
            COALESCE(SUM(total_paid), 0)::NUMERIC AS total_disbursed,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk,
            COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT AS med_risk,
            COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT AS low_risk,
            COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
            COUNT(*) FILTER (WHERE is_recommended_only = TRUE)::INT AS pending_sanction
        FROM base
    ),
    district_agg AS (
        SELECT 
            COALESCE(district, ''Unknown'') AS district,
            COUNT(*)::INT AS total_projects,
            ROUND(COALESCE(AVG(risk_score), 0))::INT AS avg_risk,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk_count,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS total_sanctioned
        FROM base
        GROUP BY district
        ORDER BY high_risk_count DESC, total_projects DESC
        LIMIT 10
    ),
    cat_agg AS (
        SELECT 
            COALESCE(work_category, ''Other'') AS category,
            COUNT(*)::INT AS count,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS total_amount,
            ROUND(COALESCE(AVG(risk_score), 0))::INT AS avg_risk
        FROM base
        GROUP BY work_category
        ORDER BY count DESC
        LIMIT 8
    ),
    status_agg AS (
        SELECT 
            COALESCE(work_status, ''Unknown'') AS name,
            COUNT(*)::INT AS value
        FROM base
        GROUP BY work_status
        ORDER BY value DESC
        LIMIT 6
    ),
    fy_agg AS (
        SELECT 
            COALESCE(financial_year, ''Unknown'') AS fy,
            COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
            COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
            COUNT(*)::INT AS total_projects
        FROM base
        WHERE financial_year IS NOT NULL AND financial_year != '''' AND financial_year != ''Unknown''
        GROUP BY financial_year
        ORDER BY financial_year ASC
        LIMIT 10
    )
    SELECT json_build_object(
        ''kpis'', (SELECT row_to_json(k) FROM kpi_agg k),
        ''districtRisk'', (SELECT COALESCE(json_agg(row_to_json(d)), ''[]''::json) FROM district_agg d),
        ''categoryBreakdown'', (SELECT COALESCE(json_agg(row_to_json(c)), ''[]''::json) FROM cat_agg c),
        ''statusBreakdown'', (SELECT COALESCE(json_agg(row_to_json(s)), ''[]''::json) FROM status_agg s),
        ''financialYearTrends'', (SELECT COALESCE(json_agg(row_to_json(f)), ''[]''::json) FROM fy_agg f)
    );';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_analytics_observatory(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
