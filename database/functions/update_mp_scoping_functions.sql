-- ==============================================================================
-- STORED PROCEDURE UPGRADES FOR MP DATA SCOPING (LOK SABHA)
-- Enforces strict parliamentary constituency and state scoping on:
-- 1. get_dashboard_kpis
-- 2. get_constituency_gis_metrics
-- 3. get_state_gis_metrics
-- 4. get_analytics_observatory
-- Preserves existing scoping for MOSPI_ADMIN, STATE_NODAL_OFFICER, DISTRICT_OFFICER
-- ==============================================================================

-- 1. get_dashboard_kpis with MP scoping
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
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
    q TEXT;
    v_user_role TEXT;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    v_assigned_constituency TEXT;
    v_assigned_mp_name TEXT;
    clean_d TEXT;
BEGIN
    SELECT role, state, district, constituency, mp_name 
    INTO v_user_role, v_assigned_state, v_assigned_district, v_assigned_constituency, v_assigned_mp_name
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF v_user_role = 'STATE_NODAL_OFFICER' AND v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
        p_state := v_assigned_state;
    ELSIF v_user_role = 'DISTRICT_OFFICER' AND v_assigned_district IS NOT NULL AND v_assigned_district != '' THEN
        p_district := v_assigned_district;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
    ELSIF v_user_role = 'MP' THEN
        p_house := 'Lok Sabha';
        IF v_assigned_constituency IS NOT NULL AND v_assigned_constituency != '' THEN
            p_constituency := v_assigned_constituency;
        END IF;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
        IF v_assigned_mp_name IS NOT NULL AND v_assigned_mp_name != '' THEN
            p_mp := v_assigned_mp_name;
        END IF;
    END IF;

    IF p_house = 'Rajya Sabha' THEN
        tbl := 'public.rajya_sabha_projects';
    ELSE
        tbl := 'public.lok_sabha_projects';
    END IF;

    q := 'SELECT json_build_object(
        ''total'', COUNT(*)::INT,
        ''totalSanctionAmount'', COALESCE(SUM(sanction_amount), 0)::NUMERIC,
        ''totalDisbursed'', COALESCE(SUM(total_paid), 0)::NUMERIC,
        ''completed'', COUNT(*) FILTER (WHERE is_completed = TRUE)::INT,
        ''highRisk'', COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT,
        ''medRisk'', COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT,
        ''lowRisk'', COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT,
        ''pendingSanction'', COUNT(*) FILTER (WHERE is_recommended_only = TRUE)::INT,
        ''requiresVerification'', COUNT(*) FILTER (WHERE risk_level != ''LOW'' AND verification_status = ''New Alert'')::INT,
        ''avgRiskScore'', ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC
    ) FROM ' || tbl || ' WHERE 1=1';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_district IS NOT NULL AND p_district != '' THEN
        clean_d := TRIM(split_part(p_district, '(', 1));
        q := q || ' AND (district = ' || quote_literal(p_district) || ' OR district ILIKE ' || quote_literal(clean_d || '%') || ')';
    END IF;
    IF p_house != 'Rajya Sabha' AND p_constituency IS NOT NULL AND p_constituency != '' THEN
        q := q || ' AND constituency = ' || quote_literal(p_constituency);
    END IF;
    IF p_mp IS NOT NULL AND p_mp != '' THEN
        q := q || ' AND mp_name ILIKE ' || quote_literal('%' || p_mp || '%');
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
    ELSIF p_tenure IS NOT NULL AND p_tenure != '' AND p_tenure != 'All Tenures' AND p_tenure != 'Current Rajya Sabha' THEN
        q := q || ' AND financial_year = ' || quote_literal(p_tenure);
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

GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;


-- 2. get_constituency_gis_metrics with MP scoping
CREATE OR REPLACE FUNCTION public.get_constituency_gis_metrics(
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
    q TEXT;
    v_user_role TEXT;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    v_assigned_constituency TEXT;
    v_assigned_mp_name TEXT;
    clean_d TEXT;
BEGIN
    SELECT role, state, district, constituency, mp_name 
    INTO v_user_role, v_assigned_state, v_assigned_district, v_assigned_constituency, v_assigned_mp_name
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF v_user_role = 'STATE_NODAL_OFFICER' AND v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
        p_state := v_assigned_state;
    ELSIF v_user_role = 'DISTRICT_OFFICER' AND v_assigned_district IS NOT NULL AND v_assigned_district != '' THEN
        p_district := v_assigned_district;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
    ELSIF v_user_role = 'MP' THEN
        IF v_assigned_constituency IS NOT NULL AND v_assigned_constituency != '' THEN
            p_constituency := v_assigned_constituency;
        END IF;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
        IF v_assigned_mp_name IS NOT NULL AND v_assigned_mp_name != '' THEN
            p_mp := v_assigned_mp_name;
        END IF;
    END IF;

    q := 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (
        SELECT 
            state,
            constituency,
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
        FROM public.lok_sabha_projects
        WHERE constituency IS NOT NULL AND constituency != ''''';

    IF p_state IS NOT NULL AND p_state != '' THEN
        q := q || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_district IS NOT NULL AND p_district != '' THEN
        clean_d := TRIM(split_part(p_district, '(', 1));
        q := q || ' AND (district = ' || quote_literal(p_district) || ' OR district ILIKE ' || quote_literal(clean_d || '%') || ')';
    END IF;
    IF p_constituency IS NOT NULL AND p_constituency != '' THEN
        q := q || ' AND constituency = ' || quote_literal(p_constituency);
    END IF;
    IF p_mp IS NOT NULL AND p_mp != '' THEN
        q := q || ' AND mp_name ILIKE ' || quote_literal('%' || p_mp || '%');
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
    ELSIF p_tenure IS NOT NULL AND p_tenure != '' AND p_tenure != 'All Tenures' THEN
        q := q || ' AND financial_year = ' || quote_literal(p_tenure);
    END IF;
    IF p_search IS NOT NULL AND p_search != '' THEN
        q := q || ' AND (work_description ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR work_id ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR constituency ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR district ILIKE ' || quote_literal('%' || p_search || '%') ||
                  ' OR mp_name ILIKE ' || quote_literal('%' || p_search || '%') || ')';
    END IF;

    q := q || ' GROUP BY state, constituency ORDER BY state, constituency) t';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_constituency_gis_metrics(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;


-- 3. get_state_gis_metrics with MP & State scoping
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
    v_user_role TEXT;
    v_assigned_state TEXT;
BEGIN
    SELECT role, state INTO v_user_role, v_assigned_state
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF (v_user_role = 'STATE_NODAL_OFFICER' OR v_user_role = 'MP') AND v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
        p_state := v_assigned_state;
    END IF;

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
        q := q || ' AND mp_name ILIKE ' || quote_literal('%' || p_mp || '%');
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


-- 4. get_analytics_observatory with MP scoping
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
    v_assigned_constituency TEXT;
    v_assigned_mp_name TEXT;
    clean_d TEXT;
BEGIN
    SELECT role, state, district, constituency, mp_name 
    INTO v_user_role, v_assigned_state, v_assigned_district, v_assigned_constituency, v_assigned_mp_name
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF v_user_role = 'STATE_NODAL_OFFICER' AND v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
        p_state := v_assigned_state;
    ELSIF v_user_role = 'DISTRICT_OFFICER' AND v_assigned_district IS NOT NULL AND v_assigned_district != '' THEN
        p_district := v_assigned_district;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
    ELSIF v_user_role = 'MP' THEN
        p_house := 'Lok Sabha';
        IF v_assigned_constituency IS NOT NULL AND v_assigned_constituency != '' THEN
            p_constituency := v_assigned_constituency;
        END IF;
        IF v_assigned_state IS NOT NULL AND v_assigned_state != '' THEN
            p_state := v_assigned_state;
        END IF;
        IF v_assigned_mp_name IS NOT NULL AND v_assigned_mp_name != '' THEN
            p_mp := v_assigned_mp_name;
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
        where_clause := where_clause || ' AND mp_name ILIKE ' || quote_literal('%' || p_mp || '%');
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

    q := 'WITH base AS (
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
    dist_agg AS (
        SELECT 
            district,
            COUNT(*)::INT AS total,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high,
            COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT AS med,
            COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT AS low
        FROM base
        WHERE district IS NOT NULL AND district != ''''
        GROUP BY district
        ORDER BY total DESC
        LIMIT 100
    ),
    cat_agg AS (
        SELECT 
            work_category AS category,
            COUNT(*)::INT AS total,
            COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high,
            COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT AS med,
            COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT AS low
        FROM base
        WHERE work_category IS NOT NULL AND work_category != ''''
        GROUP BY work_category
        ORDER BY total DESC
        LIMIT 30
    ),
    status_agg AS (
        SELECT 
            work_status AS name,
            COUNT(*)::INT AS value,
            ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM base), 0) * 100, 1)::NUMERIC AS percentage
        FROM base
        WHERE work_status IS NOT NULL AND work_status != ''''
        GROUP BY work_status
        ORDER BY value DESC
    ),
    fy_agg AS (
        SELECT 
            financial_year AS fy,
            ROUND(COALESCE(SUM(sanction_amount), 0) / 10000000.0, 2)::NUMERIC AS sanctioned,
            ROUND(COALESCE(SUM(total_paid), 0) / 10000000.0, 2)::NUMERIC AS disbursed,
            COUNT(*)::INT AS total_projects
        FROM base
        WHERE financial_year IS NOT NULL AND financial_year != '''' AND financial_year != ''Unknown''
        GROUP BY financial_year
        ORDER BY financial_year ASC
    )
    SELECT json_build_object(
        ''kpis'', (SELECT row_to_json(k) FROM kpi_agg k),
        ''districtRisk'', COALESCE((SELECT json_agg(row_to_json(d)) FROM dist_agg d), ''[]''::json),
        ''categoryRisk'', COALESCE((SELECT json_agg(row_to_json(c)) FROM cat_agg c), ''[]''::json),
        ''statusBreakdown'', COALESCE((SELECT json_agg(row_to_json(s)) FROM status_agg s), ''[]''::json),
        ''fyTrend'', COALESCE((SELECT json_agg(row_to_json(f)) FROM fy_agg f), ''[]''::json)
    )';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_analytics_observatory(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
