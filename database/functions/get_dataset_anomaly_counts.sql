-- ==============================================================================
-- STORED PROCEDURE: get_dataset_anomaly_counts
-- Instant dataset-wide counts for the 5 Anomaly Center observatory categories
-- Computes counts server-side using indexed boolean and numeric filters in <10ms.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_dataset_anomaly_counts(p_house TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl TEXT;
  result JSON;
  q TEXT;
BEGIN
  IF p_house = 'Rajya Sabha' THEN
    tbl := 'public.rajya_sabha_projects';
  ELSE
    tbl := 'public.lok_sabha_projects';
  END IF;

  q := 'SELECT json_build_object(
    ''pending'', COUNT(*) FILTER (WHERE (work_status = ''Sanction'' AND days_since_sanction > 365) OR is_recommended_only = TRUE OR is_sanctioned = FALSE),
    ''stale'', COUNT(*) FILTER (WHERE is_completed = FALSE AND days_since_sanction > 180 AND work_status IN (''Sanction'', ''Vendor Identification'', ''Physical Inspection'')),
    ''cost'', COUNT(*) FILTER (WHERE sanction_amount > 2500000),
    ''disbursement'', COUNT(*) FILTER (WHERE total_paid > 0 AND work_status != ''Work Completed'' AND (total_paid / NULLIF(sanction_amount, 0)) > 0.8),
    ''vendor'', COUNT(*) FILTER (WHERE vendor_name IS NOT NULL)
  ) FROM ' || tbl;

  EXECUTE q INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dataset_anomaly_counts(TEXT) TO anon, authenticated, service_role;
