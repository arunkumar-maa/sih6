-- ==============================================================================
-- STORED PROCEDURE: get_district_officer_overview
-- Ultra-high-performance server-side aggregation for District Officer Dashboard
-- Returns district-locked KPIs, constituency breakdown, MP representation, 
-- and priority inspection queue in <50ms.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_district_officer_overview(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_state TEXT DEFAULT 'Uttar Pradesh',
    p_district TEXT DEFAULT 'VARANASI'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tbl TEXT;
    result JSON;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    v_user_role TEXT;
    clean_d TEXT;
    match_d TEXT;
    q TEXT;
BEGIN
    SET LOCAL statement_timeout = '30s';

    SELECT role, state, district INTO v_user_role, v_assigned_state, v_assigned_district
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid();

    IF v_user_role = 'DISTRICT_OFFICER' AND v_assigned_district IS NOT NULL AND v_assigned_district != '' THEN
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

    clean_d := TRIM(split_part(COALESCE(p_district, ''), '(', 1));
    match_d := clean_d || '%';

    -- Ultra-fast Single CTE: scans table ONCE and runs all 4 aggregations on the small filtered set
    q := 'WITH base AS MATERIALIZED (
        SELECT 
            work_id,
            work_description,
            constituency,
            mp_name,
            sanction_amount,
            total_paid,
            disbursement_ratio,
            risk_score,
            risk_level,
            risk_explanation,
            days_since_sanction,
            work_status,
            verification_status,
            vendor_name,
            is_completed,
            is_recommended_only
        FROM ' || tbl || '
        WHERE (state = ' || quote_literal(p_state) || ' OR state ILIKE ' || quote_literal(p_state) || ')
          AND (district = ' || quote_literal(p_district) || ' OR district LIKE ' || quote_literal(match_d) || ' OR district ILIKE ' || quote_literal(match_d) || ')
    ),
    kpi_res AS (
        SELECT json_build_object(
            ''total'', COUNT(*)::INT,
            ''totalSanctionAmount'', COALESCE(SUM(sanction_amount), 0)::NUMERIC,
            ''totalDisbursed'', COALESCE(SUM(total_paid), 0)::NUMERIC,
            ''completed'', COUNT(*) FILTER (WHERE is_completed = TRUE)::INT,
            ''highRisk'', COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT,
            ''medRisk'', COUNT(*) FILTER (WHERE risk_level = ''MEDIUM'')::INT,
            ''lowRisk'', COUNT(*) FILTER (WHERE risk_level = ''LOW'')::INT,
            ''pendingSanction'', COUNT(*) FILTER (WHERE is_recommended_only = TRUE)::INT,
            ''requiresVerification'', COUNT(*) FILTER (WHERE verification_status = ''New Alert'' OR verification_status = ''Under Review'' OR verification_status IS NULL)::INT,
            ''staleCount'', COUNT(*) FILTER (WHERE days_since_sanction > 365 AND is_completed = FALSE)::INT,
            ''costAnomalies'', COUNT(*) FILTER (WHERE sanction_amount > 2500000)::INT,
            ''disbAnomalies'', COUNT(*) FILTER (WHERE disbursement_ratio > 0.8 AND is_completed = FALSE)::INT,
            ''avgRiskScore'', ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC
        ) AS kpis
        FROM base
    ),
    constituencies_res AS (
        SELECT COALESCE(json_agg(t), ''[]''::json) AS constituencies
        FROM (
            SELECT 
                COALESCE(constituency, ''District Wide'') AS constituency,
                COALESCE(mp_name, ''Unknown MP'') AS mp_name,
                COUNT(*)::INT AS total,
                COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
                COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
                COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
                COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk,
                ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC AS avg_risk
            FROM base
            GROUP BY constituency, mp_name
            ORDER BY total DESC
            LIMIT 25
        ) t
    ),
    mps_res AS (
        SELECT COALESCE(json_agg(t), ''[]''::json) AS mps
        FROM (
            SELECT 
                COALESCE(mp_name, ''Unknown MP'') AS mp_name,
                COUNT(*)::INT AS total,
                COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
                COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
                COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
                COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk,
                ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC AS avg_risk
            FROM base
            GROUP BY mp_name
            ORDER BY total DESC
            LIMIT 25
        ) t
    ),
    queue_res AS (
        SELECT COALESCE(json_agg(t), ''[]''::json) AS priority_queue
        FROM (
            SELECT 
                work_id,
                COALESCE(work_description, ''No description available'') AS work_description,
                constituency,
                COALESCE(mp_name, ''Unknown MP'') AS mp_name,
                COALESCE(sanction_amount, 0)::NUMERIC AS sanction_amount,
                COALESCE(total_paid, 0)::NUMERIC AS total_paid,
                COALESCE(disbursement_ratio, 0)::NUMERIC AS disbursement_ratio,
                COALESCE(risk_score, 0)::INT AS risk_score,
                COALESCE(risk_level, ''LOW'') AS risk_level,
                COALESCE(risk_explanation, ''Standard monitoring'') AS risk_explanation,
                COALESCE(days_since_sanction, 0)::INT AS days_since_sanction,
                COALESCE(work_status, ''Pending'') AS work_status,
                COALESCE(verification_status, ''New Alert'') AS verification_status,
                vendor_name
            FROM base
            ORDER BY 
                CASE WHEN risk_level = ''HIGH'' THEN 1 WHEN risk_level = ''MEDIUM'' THEN 2 ELSE 3 END,
                risk_score DESC,
                sanction_amount DESC
            LIMIT 50
        ) t
    )
    SELECT json_build_object(
        ''state'', ' || quote_literal(p_state) || ',
        ''district'', ' || quote_literal(p_district) || ',
        ''cleanDistrict'', ' || quote_literal(clean_d) || ',
        ''house'', ' || quote_literal(p_house) || ',
        ''kpis'', (SELECT kpis FROM kpi_res),
        ''constituencies'', (SELECT constituencies FROM constituencies_res),
        ''mps'', (SELECT mps FROM mps_res),
        ''priorityQueue'', (SELECT priority_queue FROM queue_res)
    );';

    EXECUTE q INTO result;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_district_officer_overview(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
