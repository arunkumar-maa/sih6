import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const sql = `
    CREATE OR REPLACE FUNCTION public.test_match_district(p_state TEXT, p_district TEXT)
    RETURNS INT
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      clean_d TEXT;
      cnt INT;
    BEGIN
      clean_d := TRIM(split_part(p_district, '(', 1));
      SELECT COUNT(*)::INT INTO cnt
      FROM lok_sabha_projects
      WHERE lower(state) = lower(p_state)
        AND (
          lower(district) = lower(p_district)
          OR lower(district) = lower(clean_d)
          OR lower(split_part(district, '(', 1)) = lower(clean_d)
          OR district ILIKE clean_d || ' (%'
          OR district ILIKE clean_d || '(%'
        );
      RETURN cnt;
    END;
    $$;
    GRANT EXECUTE ON FUNCTION public.test_match_district(TEXT, TEXT) TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `;

  await supabase.rpc('exec_sql', { query: sql });
  await new Promise(r => setTimeout(r, 2000));

  const testCases = [
    { state: 'Uttar Pradesh', district: 'VARANASI' },
    { state: 'Uttar Pradesh', district: 'VARANASI(DISTRICT MAGISTRAE VARANASI_IDA)' },
    { state: 'Tamil Nadu', district: 'Madurai' },
    { state: 'Tamil Nadu', district: 'MADURAI(DISTRICT COLLECTOR MADURAI_IDA)' },
    { state: 'Bihar', district: 'Patna' }
  ];

  for (const tc of testCases) {
    const { data, error } = await supabase.rpc('test_match_district', {
      p_state: tc.state,
      p_district: tc.district
    });
    console.log(`Matching [${tc.state} | ${tc.district}]: result = ${data}, err = ${error?.message || null}`);
  }
}

run();
