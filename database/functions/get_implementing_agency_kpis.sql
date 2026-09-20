-- ==============================================================================
-- MPLADS SENTINEL — STORED FUNCTION: GET IMPLEMENTING AGENCY KPIS
-- Function: public.get_implementing_agency_kpis
-- Computes real dataset-derived KPIs exclusively for the specified agency.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_implementing_agency_kpis(
    p_agency_id UUID,
    p_house TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_agency_name TEXT;
    v_norm_agency_name TEXT;
    v_result JSONB;
BEGIN
    -- Verify agency exists
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

    -- Aggregate assigned works across Lok Sabha & Rajya Sabha
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
$$;
