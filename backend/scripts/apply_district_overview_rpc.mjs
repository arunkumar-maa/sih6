import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  let sqlPath = path.resolve('database/functions/get_district_officer_overview.sql');
  if (!fs.existsSync(sqlPath)) {
    sqlPath = path.resolve('../database/functions/get_district_officer_overview.sql');
  }
  const sql = fs.readFileSync(sqlPath, 'utf8') + `\nNOTIFY pgrst, 'reload schema';`;

  console.log('Applying get_district_officer_overview SQL to Supabase...');
  const { error: applyErr } = await supabase.rpc('exec_sql', { query: sql });
  if (applyErr) {
    console.error('Failed to apply SQL:', applyErr);
    process.exit(1);
  }
  console.log('Successfully applied get_district_officer_overview function!');

  console.log('Waiting 2 seconds for schema reload...');
  await new Promise(r => setTimeout(r, 2000));

  // Test across multiple sample districts
  const samples = [
    { state: 'Uttar Pradesh', district: 'VARANASI' },
    { state: 'Tamil Nadu', district: 'Madurai' },
    { state: 'Bihar', district: 'Patna' }
  ];

  for (const s of samples) {
    console.log(`\nTesting ${s.district}, ${s.state}:`);
    const { data, error } = await supabase.rpc('get_district_officer_overview', {
      p_house: 'Lok Sabha',
      p_state: s.state,
      p_district: s.district
    });

    if (error) {
      console.error(`  [ERROR]:`, error.message);
    } else {
      console.log(`  [SUCCESS]`);
      console.log(`  Total Works: ${data.kpis.total}`);
      console.log(`  Sanctioned: INR ${(data.kpis.totalSanctionAmount / 1e7).toFixed(2)} Cr`);
      console.log(`  Disbursed: INR ${(data.kpis.totalDisbursed / 1e7).toFixed(2)} Cr`);
      console.log(`  High Risk: ${data.kpis.highRisk}`);
      console.log(`  Cost Anomalies: ${data.kpis.costAnomalies}`);
      console.log(`  Constituencies: ${data.constituencies.length}`);
      console.log(`  MPs: ${data.mps.length}`);
      console.log(`  Priority Queue items: ${data.priorityQueue.length}`);
    }
  }
}

main();
