import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRS() {
  console.log('Testing RS query directly...');
  const start = Date.now();
  const { data, error } = await supabase.rpc('get_district_officer_overview', {
    p_house: 'Rajya Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log('Result in', Date.now() - start, 'ms:', error || data?.kpis);
}

testRS();
