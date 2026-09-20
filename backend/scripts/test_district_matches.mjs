import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const testCases = [
    { state: 'Uttar Pradesh', district: 'VARANASI' },
    { state: 'Uttar Pradesh', district: 'VARANASI(DISTRICT MAGISTRAE VARANASI_IDA)' },
    { state: 'Tamil Nadu', district: 'Madurai' },
    { state: 'Tamil Nadu', district: 'MADURAI(DISTRICT COLLECTOR MADURAI_IDA)' },
    { state: 'Bihar', district: 'Patna' }
  ];

  for (const tc of testCases) {
    const { count, error } = await supabase
      .from('lok_sabha_projects')
      .select('*', { count: 'exact', head: true })
      .eq('state', tc.state)
      .or(`district.eq.${tc.district},district.ilike.${tc.district.split('(')[0]}(%`);

    console.log(`Matched [${tc.state} | ${tc.district}]: count = ${count}, error = ${error?.message || null}`);
  }
}

run();
