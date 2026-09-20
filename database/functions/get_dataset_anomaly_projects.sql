-- ==============================================================================
-- STORED PROCEDURE: get_dataset_anomaly_projects
-- Server-side paginated retrieval of real anomaly projects
-- Directly queries lok_sabha_projects or rajya_sabha_projects using the exact
-- canonical criteria from get_dataset_anomaly_counts to ensure 100% data consistency.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_dataset_anomaly_projects(
    p_house TEXT DEFAULT 'Lok Sabha',
    p_category TEXT DEFAULT 'stale',
    p_limit INT DEFAULT 25,
    p_offset INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    tbl TEXT;
    where_condition TEXT;
    q TEXT;
BEGIN
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

GRANT EXECUTE ON FUNCTION public.get_dataset_anomaly_projects(TEXT, TEXT, INT, INT) TO anon, authenticated, service_role;
