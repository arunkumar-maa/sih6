import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Deploying district scoping stored procedures to Supabase...');
  const sql = fs.readFileSync(path.resolve('database/functions/update_district_scoping_functions.sql'), 'utf8');

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Failed to deploy functions:', error);
    process.exit(1);
  }
  console.log('All 5 stored procedures deployed successfully!');

  // Test 1: get_dashboard_kpis with district
  console.log('\n--- Testing get_dashboard_kpis with Varanasi ---');
  const { data: kpis, error: kpiErr } = await supabase.rpc('get_dashboard_kpis', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log('KPIs for Varanasi:', kpis, kpiErr);

  // Test 2: get_dataset_anomaly_counts with district
  console.log('\n--- Testing get_dataset_anomaly_counts with Varanasi ---');
  const { data: counts, error: cntErr } = await supabase.rpc('get_dataset_anomaly_counts', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log('Anomaly Counts for Varanasi:', counts, cntErr);

  // Test 3: get_dataset_anomaly_projects with district
  console.log('\n--- Testing get_dataset_anomaly_projects with Varanasi ---');
  const { data: projs, error: prjErr } = await supabase.rpc('get_dataset_anomaly_projects', {
    p_house: 'Lok Sabha',
    p_category: 'stale',
    p_limit: 5,
    p_offset: 0,
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log(`Anomaly Projects for Varanasi: ${projs?.length} items`, prjErr);
  if (projs?.length > 0) {
    console.log('Sample item district:', projs[0].district, 'state:', projs[0].state);
  }

  // Test 4: get_constituency_gis_metrics with district
  console.log('\n--- Testing get_constituency_gis_metrics with Varanasi ---');
  const { data: gis, error: gisErr } = await supabase.rpc('get_constituency_gis_metrics', {
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log(`GIS Constituencies for Varanasi: ${gis?.length} items`, gisErr);
  if (gis?.length > 0) {
    console.log('Constituencies:', gis.map(g => `${g.constituency} (${g.total_works} works)`));
  }

  // Test 5: get_analytics_observatory with district
  console.log('\n--- Testing get_analytics_observatory with Varanasi ---');
  const { data: obs, error: obsErr } = await supabase.rpc('get_analytics_observatory', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  console.log('Observatory for Varanasi - KPIs:', obs?.kpis, obsErr);
}

main().catch(console.error);
