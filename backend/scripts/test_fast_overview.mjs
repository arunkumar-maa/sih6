import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFastOverview() {
  const sql = `
    CREATE INDEX IF NOT EXISTS idx_lsp_state_district ON public.lok_sabha_projects(state, district);
    CREATE INDEX IF NOT EXISTS idx_rsp_state_district ON public.rajya_sabha_projects(state, district);

    CREATE OR REPLACE FUNCTION public.get_district_officer_overview(
        p_house TEXT DEFAULT 'Lok Sabha',
        p_state TEXT DEFAULT NULL,
        p_district TEXT DEFAULT NULL
    )
    RETURNS JSON
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        result JSON;
        clean_d TEXT;
        kpis_json JSON;
        constituencies_json JSON;
        mps_json JSON;
        queue_json JSON;
    BEGIN
        clean_d := TRIM(split_part(COALESCE(p_district, ''), '(', 1));

        -- 1. Use single indexed temp table scan
        DROP TABLE IF EXISTS _temp_do_works;
        IF p_house = 'Rajya Sabha' THEN
            CREATE TEMP TABLE _temp_do_works ON COMMIT DROP AS
            SELECT * FROM public.rajya_sabha_projects
            WHERE (p_state IS NULL OR p_state = '' OR state = p_state OR lower(state) = lower(p_state))
              AND (clean_d = '' OR district = p_district OR district ILIKE clean_d || '%');
        ELSE
            CREATE TEMP TABLE _temp_do_works ON COMMIT DROP AS
            SELECT * FROM public.lok_sabha_projects
            WHERE (p_state IS NULL OR p_state = '' OR state = p_state OR lower(state) = lower(p_state))
              AND (clean_d = '' OR district = p_district OR district ILIKE clean_d || '%');
        END IF;

        -- 2. Compute KPIs from temp table in <1ms
        SELECT json_build_object(
            'total', COUNT(*)::INT,
            'totalSanctionAmount', COALESCE(SUM(sanction_amount), 0)::NUMERIC,
            'totalDisbursed', COALESCE(SUM(total_paid), 0)::NUMERIC,
            'completed', COUNT(*) FILTER (WHERE is_completed = TRUE)::INT,
            'highRisk', COUNT(*) FILTER (WHERE risk_level = 'HIGH')::INT,
            'medRisk', COUNT(*) FILTER (WHERE risk_level = 'MEDIUM')::INT,
            'lowRisk', COUNT(*) FILTER (WHERE risk_level = 'LOW')::INT,
            'pendingSanction', COUNT(*) FILTER (WHERE is_recommended_only = TRUE)::INT,
            'requiresVerification', COUNT(*) FILTER (WHERE risk_level != 'LOW' AND (verification_status = 'New Alert' OR verification_status IS NULL OR verification_status = ''))::INT,
            'staleCount', COUNT(*) FILTER (WHERE days_since_sanction > 365 AND is_completed = FALSE)::INT,
            'costAnomalies', COUNT(*) FILTER (WHERE risk_explanation ILIKE '%cost%' OR risk_explanation ILIKE '%outlier%')::INT,
            'disbAnomalies', COUNT(*) FILTER (WHERE disbursement_ratio > 1.0 OR risk_explanation ILIKE '%disburs%')::INT,
            'avgRiskScore', ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC
        ) FROM _temp_do_works
        INTO kpis_json;

        -- 3. Constituencies
        IF p_house = 'Rajya Sabha' THEN
            constituencies_json := '[]'::JSON;
        ELSE
            SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
            FROM (
                SELECT 
                    COALESCE(constituency, 'District Wide') AS constituency,
                    COALESCE(mp_name, 'Unknown MP') AS mp_name,
                    COUNT(*)::INT AS total,
                    COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
                    COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
                    COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
                    COUNT(*) FILTER (WHERE risk_level = 'HIGH')::INT AS high_risk,
                    ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC AS avg_risk
                FROM _temp_do_works
                GROUP BY constituency, mp_name
                ORDER BY total DESC
            ) c
            INTO constituencies_json;
        END IF;

        -- 4. MPs
        SELECT COALESCE(json_agg(row_to_json(m)), '[]'::json)
        FROM (
            SELECT 
                COALESCE(mp_name, 'Unknown MP') AS mp_name,
                COUNT(*)::INT AS total,
                COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
                COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
                COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
                COUNT(*) FILTER (WHERE risk_level = 'HIGH')::INT AS high_risk,
                ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC AS avg_risk
            FROM _temp_do_works
            GROUP BY mp_name
            ORDER BY total DESC
        ) m
        INTO mps_json;

        -- 5. Priority Queue
        SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json)
        FROM (
            SELECT 
                work_id,
                COALESCE(work_description, 'No description available') AS work_description,
                constituency,
                COALESCE(mp_name, 'Unknown MP') AS mp_name,
                COALESCE(sanction_amount, 0)::NUMERIC AS sanction_amount,
                COALESCE(total_paid, 0)::NUMERIC AS total_paid,
                COALESCE(disbursement_ratio, 0)::NUMERIC AS disbursement_ratio,
                COALESCE(risk_score, 0)::INT AS risk_score,
                COALESCE(risk_level, 'LOW') AS risk_level,
                COALESCE(risk_explanation, 'Standard monitoring') AS risk_explanation,
                COALESCE(days_since_sanction, 0)::INT AS days_since_sanction,
                COALESCE(work_status, 'Pending') AS work_status,
                COALESCE(verification_status, 'New Alert') AS verification_status,
                vendor_name
            FROM _temp_do_works
            ORDER BY 
                CASE 
                    WHEN verification_status = 'New Alert' THEN 0
                    WHEN verification_status = 'Under Review' THEN 1
                    WHEN verification_status = 'Inspection Requested' THEN 2
                    ELSE 3 
                END,
                risk_score DESC, 
                sanction_amount DESC
            LIMIT 50
        ) q
        INTO queue_json;

        -- Final response
        result := json_build_object(
            'state', COALESCE(p_state, ''),
            'district', COALESCE(p_district, ''),
            'cleanDistrict', clean_d,
            'house', p_house,
            'kpis', COALESCE(kpis_json, '{}'::JSON),
            'constituencies', COALESCE(constituencies_json, '[]'::JSON),
            'mps', COALESCE(mps_json, '[]'::JSON),
            'priorityQueue', COALESCE(queue_json, '[]'::JSON)
        );

        RETURN result;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.get_district_officer_overview(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `;

  console.log('Optimizing get_district_officer_overview function...');
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying optimization:', error);
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 2000));

  const start = Date.now();
  const { data, error: callErr } = await supabase.rpc('get_district_officer_overview', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });

  console.log(`Execution completed in ${Date.now() - start}ms! Error: ${callErr?.message || null}`);
  console.log(`Varanasi KPIs: Total = ${data?.kpis?.total}, High Risk = ${data?.kpis?.highRisk}, Queue = ${data?.priorityQueue?.length}`);
}

testFastOverview();
