-- ==============================================================================
-- STORED PROCEDURE UPGRADES FOR DISTRICT_OFFICER DATA SPECIFICATION
-- Enforces strict district scoping on:
-- 1. get_dashboard_kpis
-- 2. get_constituency_gis_metrics
-- 3. get_analytics_observatory
-- 4. get_dataset_anomaly_counts
-- 5. get_dataset_anomaly_projects
-- ==============================================================================

-- Drop all old signatures to prevent PostgREST signature conflicts
DROP FUNCTION IF EXISTS public.get_dashboard_kpis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_dashboard_kpis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_constituency_gis_metrics(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_constituency_gis_metrics(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_analytics_observatory(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_analytics_observatory(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_dataset_anomaly_counts(TEXT);
DROP FUNCTION IF EXISTS public.get_dataset_anomaly_counts(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_dataset_anomaly_projects(TEXT, TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.get_dataset_anomaly_projects(TEXT, TEXT, INT, INT, TEXT, TEXT);

-- 1. get_dashboard_kpis with district support and role auto-scoping
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
    clean_d TEXT;
BEGIN
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


-- 2. get_constituency_gis_metrics with district support and role auto-scoping
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
    clean_d TEXT;
BEGIN
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

    q := q || ' GROUP BY state, constituency ORDER BY state, constituency) t';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_constituency_gis_metrics(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;


-- 3. get_analytics_observatory with district support and role auto-scoping
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


-- 4. get_dataset_anomaly_counts with district and state support
CREATE OR REPLACE FUNCTION public.get_dataset_anomaly_counts(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tbl TEXT;
    result JSON;
    where_clause TEXT := ' WHERE 1=1';
    v_user_role TEXT;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    clean_d TEXT;
    q TEXT;
BEGIN
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

    q := 'SELECT json_build_object(
        ''pending'', COUNT(*) FILTER (WHERE (work_status = ''Sanction'' AND days_since_sanction > 365) OR is_recommended_only = TRUE OR is_sanctioned = FALSE)::INT,
        ''stale'', COUNT(*) FILTER (WHERE is_completed = FALSE AND days_since_sanction > 180 AND work_status IN (''Sanction'', ''Vendor Identification'', ''Physical Inspection''))::INT,
        ''cost'', COUNT(*) FILTER (WHERE sanction_amount > 2500000)::INT,
        ''disbursement'', COUNT(*) FILTER (WHERE total_paid > 0 AND work_status != ''Work Completed'' AND (total_paid / NULLIF(sanction_amount, 0)) > 0.8)::INT,
        ''vendor'', COUNT(*) FILTER (WHERE vendor_name IS NOT NULL)::INT
    ) FROM ' || tbl || where_clause;

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dataset_anomaly_counts(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;


-- 5. get_dataset_anomaly_projects with district and state support
CREATE OR REPLACE FUNCTION public.get_dataset_anomaly_projects(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_category TEXT DEFAULT 'stale',
    p_limit INT DEFAULT 25,
    p_offset INT DEFAULT 0,
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
    where_condition TEXT;
    v_user_role TEXT;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    clean_d TEXT;
    q TEXT;
BEGIN
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

    IF p_category = 'pending' THEN
        where_condition := '((work_status = ''Sanction'' AND days_since_sanction > 365) OR is_recommended_only = TRUE OR is_sanctioned = FALSE)';
    ELSIF p_category = 'stale' THEN
        where_condition := '(is_completed = FALSE AND days_since_sanction > 180 AND work_status IN (''Sanction'', ''Vendor Identification'', ''Physical Inspection''))';
    ELSIF p_category = 'cost' THEN
        where_condition := '(sanction_amount > 2500000)';
    ELSIF p_category = 'disbursement' THEN
        where_condition := '(total_paid > 0 AND work_status != ''Work Completed'' AND (total_paid / NULLIF(sanction_amount, 0)) > 0.8)';
    ELSIF p_category = 'vendor' THEN
        where_condition := '(vendor_name IS NOT NULL)';
    ELSE
        where_condition := '1=1';
    END IF;

    IF p_state IS NOT NULL AND p_state != '' THEN
        where_condition := where_condition || ' AND state = ' || quote_literal(p_state);
    END IF;
    IF p_district IS NOT NULL AND p_district != '' THEN
        clean_d := TRIM(split_part(p_district, '(', 1));
        where_condition := where_condition || ' AND (district = ' || quote_literal(p_district) || ' OR district ILIKE ' || quote_literal(clean_d || '%') || ')';
    END IF;

    q := 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (
        SELECT 
            work_id,
            house,
            ' || quote_literal(p_category) || ' AS category,
            work_description,
            work_category,
            state,
            district,
            constituency,
            sanction_amount,
            total_paid,
            work_status,
            days_since_sanction,
            disbursement_ratio,
            risk_score,
            risk_level,
            risk_factors,
            risk_explanation
        FROM ' || tbl || '
        WHERE ' || where_condition || '
        ORDER BY risk_score DESC, sanction_amount DESC NULLS LAST
        LIMIT ' || p_limit || ' OFFSET ' || p_offset || '
    ) t;';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dataset_anomaly_projects(TEXT, TEXT, INT, INT, TEXT, TEXT) TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
