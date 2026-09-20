import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sql = `
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
    v_kpis JSON;
    v_constituencies JSON;
    v_mps JSON;
    v_priority_queue JSON;
    v_assigned_state TEXT;
    v_assigned_district TEXT;
    v_user_role TEXT;
    clean_d TEXT;
    match_d TEXT;
BEGIN
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

    -- 1. KPIs
    EXECUTE format('
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
        )
        FROM %s
        WHERE (state = %L OR lower(state) = lower(%L))
          AND (district = %L OR district ILIKE %L)
    ', tbl, p_state, p_state, p_district, match_d) INTO v_kpis;

    -- 2. Constituencies
    IF p_house != 'Rajya Sabha' THEN
        EXECUTE format('
            SELECT COALESCE(json_agg(t), ''[]''::json)
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
                FROM %s
                WHERE (state = %L OR lower(state) = lower(%L))
                  AND (district = %L OR district ILIKE %L)
                GROUP BY constituency, mp_name
                ORDER BY total DESC
                LIMIT 25
            ) t
        ', tbl, p_state, p_state, p_district, match_d) INTO v_constituencies;
    ELSE
        v_constituencies := '[]'::json;
    END IF;

    -- 3. MPs
    EXECUTE format('
        SELECT COALESCE(json_agg(t), ''[]''::json)
        FROM (
            SELECT 
                COALESCE(mp_name, ''Unknown MP'') AS mp_name,
                COUNT(*)::INT AS total,
                COALESCE(SUM(sanction_amount), 0)::NUMERIC AS sanctioned,
                COALESCE(SUM(total_paid), 0)::NUMERIC AS disbursed,
                COUNT(*) FILTER (WHERE is_completed = TRUE)::INT AS completed,
                COUNT(*) FILTER (WHERE risk_level = ''HIGH'')::INT AS high_risk,
                ROUND(COALESCE(AVG(risk_score), 0))::NUMERIC AS avg_risk
            FROM %s
            WHERE (state = %L OR lower(state) = lower(%L))
              AND (district = %L OR district ILIKE %L)
            GROUP BY mp_name
            ORDER BY total DESC
            LIMIT 25
        ) t
    ', tbl, p_state, p_state, p_district, match_d) INTO v_mps;

    -- 4. Priority Queue (Top 50)
    EXECUTE format('
        SELECT COALESCE(json_agg(t), ''[]''::json)
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
            FROM %s
            WHERE (state = %L OR lower(state) = lower(%L))
              AND (district = %L OR district ILIKE %L)
            ORDER BY 
                CASE WHEN risk_level = ''HIGH'' THEN 1 WHEN risk_level = ''MEDIUM'' THEN 2 ELSE 3 END,
                risk_score DESC,
                sanction_amount DESC
            LIMIT 50
        ) t
    ', tbl, p_state, p_state, p_district, match_d) INTO v_priority_queue;

    RETURN json_build_object(
        'state', p_state,
        'district', p_district,
        'cleanDistrict', clean_d,
        'house', p_house,
        'kpis', v_kpis,
        'constituencies', v_constituencies,
        'mps', v_mps,
        'priorityQueue', v_priority_queue
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_district_officer_overview(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
`;

async function main() {
  console.log('Deploying ultra-fast get_district_officer_overview...');
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('SQL Deploy error:', error);
    process.exit(1);
  }
  console.log('Deployed successfully!');

  await new Promise(r => setTimeout(r, 2000));

  const start = Date.now();
  const { data, error: err2 } = await supabase.rpc('get_district_officer_overview', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });

  console.log(`Executed in ${Date.now() - start}ms! Error:`, err2);
  console.log('Varanasi KPIs:', data?.kpis);
  console.log('Constituencies:', data?.constituencies?.length);
  console.log('MPs:', data?.mps?.length);
  console.log('Queue:', data?.priorityQueue?.length);
}

main();
