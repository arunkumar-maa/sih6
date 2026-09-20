import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runDistrictScopingTests() {
  console.log('================================================================');
  console.log('DISTRICT SCOPING VERIFICATION: ANALYTICS, GIS & ANOMALIES');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  // ── 1. DISTRICT ANALYTICS SCOPING ──────────────────────────────────────────
  console.log('--- 1. District Analytics Scoping ---');
  
  // District-scoped KPIs
  const { data: vKpis, error: vKpisErr } = await supabase.rpc('get_dashboard_kpis', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  assert('District KPIs RPC executes without error', !vKpisErr, vKpisErr?.message);
  assert('District KPIs return exactly 448 works for Varanasi', vKpis?.total === 448, `Found ${vKpis?.total}`);
  assert('District KPIs return ₹13.82 Cr for Varanasi', Math.round((vKpis?.totalSanctionAmount || 0) / 1e7 * 100) / 100 === 13.82, `₹${((vKpis?.totalSanctionAmount || 0) / 1e7).toFixed(2)} Cr`);

  // National KPIs (verify backward compatibility / MoSPI Admin unaffected)
  const { data: natKpis } = await supabase.rpc('get_dashboard_kpis', {
    p_house: 'Lok Sabha',
    p_state: null,
    p_district: null
  });
  assert('National KPIs remain unaffected for MoSPI Admin', natKpis?.total === 65000, `Found ${natKpis?.total} works`);

  // District Analytics Observatory
  const { data: vObs, error: vObsErr } = await supabase.rpc('get_analytics_observatory', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  assert('District Observatory RPC executes without error', !vObsErr, vObsErr?.message);
  const totalObsWorks = (vObs?.statusBreakdown || []).reduce((s, x) => s + (x.value || 0), 0);
  assert('District Observatory works match district total (448)', totalObsWorks === 448, `Found ${totalObsWorks}`);

  // ── 2. DISTRICT GIS MAPPING SCOPING ────────────────────────────────────────
  console.log('\n--- 2. District GIS Mapping Scoping ---');

  const { data: vGis, error: vGisErr } = await supabase.rpc('get_constituency_gis_metrics', {
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  assert('District GIS metrics RPC executes without error', !vGisErr, vGisErr?.message);
  assert('District GIS returns only constituencies in Varanasi', vGis && vGis.length > 0 && vGis.length <= 5, `Constituencies returned: ${vGis?.length}`);
  const gisTotalWorks = (vGis || []).reduce((s, r) => s + (r.total_works || 0), 0);
  assert('District GIS total works sum to district total (448)', gisTotalWorks === 448, `Sum: ${gisTotalWorks}`);

  // National GIS (verify backward compatibility)
  const { data: natGis } = await supabase.rpc('get_constituency_gis_metrics', {
    p_state: null,
    p_district: null
  });
  assert('National GIS metrics unaffected for MoSPI Admin', natGis && natGis.length > 400, `Constituencies: ${natGis?.length}`);

  // ── 3. DISTRICT ANOMALIES SCOPING ──────────────────────────────────────────
  console.log('\n--- 3. District Anomalies Scoping ---');

  // District Anomaly Counts
  const { data: vAnomCounts, error: vAnomCountsErr } = await supabase.rpc('get_dataset_anomaly_counts', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });
  assert('District Anomaly Counts RPC executes without error', !vAnomCountsErr, vAnomCountsErr?.message);
  assert('District Anomaly Counts are scoped to Varanasi', vAnomCounts?.stale === 11 && vAnomCounts?.cost === 3, JSON.stringify(vAnomCounts));

  // National Anomaly Counts
  const { data: natAnomCounts } = await supabase.rpc('get_dataset_anomaly_counts', {
    p_house: 'Lok Sabha',
    p_state: null,
    p_district: null
  });
  assert('National Anomaly Counts unaffected for MoSPI Admin', (natAnomCounts?.cost || 0) > 900, `Cost anomalies: ${natAnomCounts?.cost}`);

  // District Anomaly Projects
  const { data: vAnomProjects, error: vAnomProjectsErr } = await supabase.rpc('get_dataset_anomaly_projects', {
    p_house: 'Lok Sabha',
    p_category: 'cost',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI',
    p_limit: 10,
    p_offset: 0
  });
  assert('District Anomaly Projects RPC executes without error', !vAnomProjectsErr, vAnomProjectsErr?.message);
  assert('District Anomaly Projects return district projects only', vAnomProjects?.length === 3, `Found ${vAnomProjects?.length} cost anomaly projects`);
  const allInVaranasi = (vAnomProjects || []).every(p => p.district && p.district.includes('VARANASI'));
  assert('All returned anomaly projects belong to Varanasi', allInVaranasi);

  console.log('\n================================================================');
  console.log(`SCOPING VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runDistrictScopingTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
