-- Fix Data Duplication and Accuracy SQL Script
-- 1. Deduplicate get_implementing_agency_kpis when viewing All Houses
CREATE OR REPLACE FUNCTION public.get_implementing_agency_kpis(p_agency_id uuid, p_house text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    v_agency_name TEXT;
    v_norm_agency_name TEXT;
    v_result JSONB;
BEGIN
    SELECT agency_name, normalized_agency_name 
    INTO v_agency_name, v_norm_agency_name
    FROM public.implementing_agency_profiles
    WHERE id = p_agency_id;

    IF v_agency_name IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Agency profile not found'
        );
    END IF;

    WITH assigned_ls AS (
        SELECT 
            p.work_id,
            'Lok Sabha' AS house,
            p.is_completed,
            p.days_since_sanction,
            p.verification_status,
            p.risk_level,
            COALESCE(p.sanction_amount, 0) AS sanction_amount,
            COALESCE(p.amount_disbursed, p.total_paid, 0) AS disbursed_amount,
            COALESCE(p.expenditure_amount, 0) AS expenditure_amount
        FROM public.implementing_agency_project_assignments a
        JOIN public.lok_sabha_projects p ON p.work_id = a.work_id AND a.house = 'Lok Sabha'
        WHERE a.agency_id = p_agency_id
          AND a.is_active = true
          AND (p_house IS NULL OR p_house = '' OR p_house = 'Lok Sabha')
    ),
    assigned_rs AS (
        SELECT 
            p.work_id,
            'Rajya Sabha' AS house,
            p.is_completed,
            p.days_since_sanction,
            p.verification_status,
            p.risk_level,
            COALESCE(p.sanction_amount, 0) AS sanction_amount,
            COALESCE(p.amount_disbursed, p.total_paid, 0) AS disbursed_amount,
            COALESCE(p.expenditure_amount, 0) AS expenditure_amount
        FROM public.implementing_agency_project_assignments a
        JOIN public.rajya_sabha_projects p ON p.work_id = a.work_id AND a.house = 'Rajya Sabha'
        WHERE a.agency_id = p_agency_id
          AND a.is_active = true
          AND (p_house IS NULL OR p_house = '' OR p_house = 'Rajya Sabha')
          AND (p_house = 'Rajya Sabha' OR p.work_id NOT IN (SELECT work_id FROM assigned_ls))
    ),
    all_assigned AS (
        SELECT * FROM assigned_ls
        UNION ALL
        SELECT * FROM assigned_rs
    ),
    recent_updates AS (
        SELECT DISTINCT ON (work_id, house)
            work_id,
            house,
            review_status,
            submitted_at
        FROM public.execution_updates
        WHERE agency_id = p_agency_id
        ORDER BY work_id, house, submitted_at DESC
    )
    SELECT jsonb_build_object(
        'agency_id', p_agency_id,
        'agency_name', v_agency_name,
        'house_filter', COALESCE(p_house, 'ALL'),
        'assigned_works', COUNT(*),
        'works_in_progress', COUNT(*) FILTER (WHERE NOT is_completed),
        'completed_works', COUNT(*) FILTER (WHERE is_completed),
        'pending_updates', COUNT(*) FILTER (
            WHERE NOT is_completed 
              AND (days_since_sanction > 180 OR days_since_sanction IS NULL)
              AND NOT EXISTS (
                  SELECT 1 FROM recent_updates ru 
                  WHERE ru.work_id = all_assigned.work_id 
                    AND ru.house = all_assigned.house 
                    AND ru.submitted_at >= (now() - INTERVAL '90 days')
              )
        ),
        'inspection_review_pending', COUNT(*) FILTER (
            WHERE verification_status = 'INSPECTION_SCHEDULED'
               OR EXISTS (
                   SELECT 1 FROM recent_updates ru 
                   WHERE ru.work_id = all_assigned.work_id 
                     AND ru.house = all_assigned.house 
                     AND ru.review_status IN ('SUBMITTED', 'UNDER REVIEW', 'NEEDS REVISION')
               )
        ),
        'high_attention_works', COUNT(*) FILTER (
            WHERE upper(risk_level) = 'HIGH'
               OR verification_status IN ('REJECTED', 'FLAGGED_FOR_REVIEW')
        ),
        'total_sanction_amount', COALESCE(SUM(sanction_amount), 0),
        'total_disbursed_amount', COALESCE(SUM(disbursed_amount), 0),
        'total_expenditure_amount', COALESCE(SUM(expenditure_amount), 0)
    ) INTO v_result
    FROM all_assigned;

    RETURN v_result;
END;
$function$;

-- 2. House-aware get_state_gis_metrics
CREATE OR REPLACE FUNCTION public.get_state_gis_metrics(
    p_state text DEFAULT NULL::text, 
    p_constituency text DEFAULT NULL::text, 
    p_mp text DEFAULT NULL::text, 
    p_risk text DEFAULT NULL::text, 
    p_status text DEFAULT NULL::text, 
    p_category text DEFAULT NULL::text, 
    p_tenure text DEFAULT NULL::text, 
    p_search text DEFAULT NULL::text,
    p_house text DEFAULT 'Lok Sabha'::text
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSON;
    tbl TEXT;
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

    IF p_house = 'Rajya Sabha' THEN
        tbl := 'public.rajya_sabha_projects';
    ELSE
        tbl := 'public.lok_sabha_projects';
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
        FROM ' || tbl || '
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
$function$;

-- 3. Deterministic pagination tie-breaker in get_dataset_anomaly_projects
CREATE OR REPLACE FUNCTION public.get_dataset_anomaly_projects(p_house text DEFAULT 'Lok Sabha'::text, p_category text DEFAULT 'stale'::text, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0, p_state text DEFAULT NULL::text, p_district text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
        ORDER BY risk_score DESC, sanction_amount DESC NULLS LAST, work_id ASC
        LIMIT ' || p_limit || ' OFFSET ' || p_offset || '
    ) t;';

    EXECUTE q INTO result;
    RETURN result;
END;
$function$;

-- 4. Canonical index on project_anomaly_results
CREATE UNIQUE INDEX IF NOT EXISTS idx_anomaly_results_canonical 
ON project_anomaly_results (house, work_id, category);
