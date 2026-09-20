import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runVerification() {
  console.log('================================================================');
  console.log('MPLADS SENTINEL — DISTRICT OFFICER ROLE VERIFICATION SUITE');
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

  // 1. Total District Officers Count in DB
  const { count: doCount, error: countErr } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'DISTRICT_OFFICER');

  assert('District Officers profile count in DB >= 768', !countErr && (doCount || 0) >= 768, `Found ${doCount} district officers`);

  // 2. Distinct States with District Officers
  const { data: doStates } = await supabase
    .from('profiles')
    .select('state')
    .eq('role', 'DISTRICT_OFFICER');

  const uniqueStates = new Set((doStates || []).map(d => d.state).filter(Boolean));
  assert('District Officers cover all 36 States and State-UTs', uniqueStates.size === 36, `Covered ${uniqueStates.size} states/UTs`);

  // 3. Test Authentication for Diverse Sample District Officers
  const sampleLogins = [
    { name: 'Varanasi (UP)', email: 'do.varanasi@mplads-demo.local', pw: 'DistrictOfficerVaranasi@123', state: 'Uttar Pradesh', dist: 'VARANASI' },
    { name: 'Madurai (TN)', email: 'madurai.tamilnadu.district@mplads-demo.local', pw: 'Madurai@123', state: 'Tamil Nadu', dist: 'MADURAI' },
    { name: 'Patna (Bihar)', email: 'patna.bihar.district@mplads-demo.local', pw: 'Patna@123', state: 'Bihar', dist: 'PATNA' },
    { name: 'Pune (Maharashtra)', email: 'pune.maharashtra.district@mplads-demo.local', pw: 'Pune@123', state: 'Maharashtra', dist: 'PUNE' },
    { name: 'Kamrup Metro (Assam)', email: 'kamrupmetro.assam.district@mplads-demo.local', pw: 'KamrupMetro@123', state: 'Assam', dist: 'KAMRUP METRO' }
  ];

  for (const s of sampleLogins) {
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
      email: s.email,
      password: s.pw
    });

    assert(`Auth login succeeds for ${s.name}`, !authErr && !!authData?.user, authErr?.message);

    if (authData?.user) {
      const { data: myProf } = await authClient.from('profiles').select('*').eq('auth_user_id', authData.user.id).single();
      assert(`Profile role is DISTRICT_OFFICER for ${s.name}`, myProf?.role === 'DISTRICT_OFFICER');
      assert(`Profile state matches for ${s.name}`, myProf?.state === s.state);
    }
  }

  // 4. Test RPC get_district_officer_overview
  const { data: doOverview, error: rpcErr } = await supabase.rpc('get_district_officer_overview', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });

  assert('get_district_officer_overview RPC executes cleanly', !rpcErr, rpcErr?.message);
  assert('Varanasi has 448 Lok Sabha works', doOverview?.kpis?.total === 448, `Found ${doOverview?.kpis?.total}`);
  assert('Varanasi has sanctioned amount > 0', doOverview?.kpis?.totalSanctionAmount > 0, `₹${(doOverview?.kpis?.totalSanctionAmount / 1e7).toFixed(2)} Cr`);
  assert('Priority Queue returned with items', (doOverview?.priorityQueue?.length || 0) > 0, `${doOverview?.priorityQueue?.length} items`);
  assert('Constituencies breakdown returned', (doOverview?.constituencies?.length || 0) > 0, `${doOverview?.constituencies?.length} constituencies`);

  // 5. Test Rajya Sabha support for get_district_officer_overview
  const { data: rsOverview, error: rsErr } = await supabase.rpc('get_district_officer_overview', {
    p_house: 'Rajya Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI'
  });

  assert('get_district_officer_overview supports Rajya Sabha', !rsErr && (rsOverview?.kpis?.total || 0) >= 0, rsErr?.message);

  // 6. Test RLS Security Isolation (Varanasi DO cannot view Bihar projects)
  const varanasiClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await varanasiClient.auth.signInWithPassword({
    email: 'do.varanasi@mplads-demo.local',
    password: 'DistrictOfficerVaranasi@123'
  });

  const { count: biharCount } = await varanasiClient
    .from('lok_sabha_projects')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'Bihar');

  assert('Varanasi DO cannot read projects in Bihar (RLS enforced)', biharCount === 0, `Bihar rows visible: ${biharCount}`);

  const { count: ownCount } = await varanasiClient
    .from('lok_sabha_projects')
    .select('*', { count: 'exact', head: true });

  assert('Varanasi DO reads own district projects under RLS', ownCount === 448, `Own rows visible: ${ownCount}`);

  // 7. Test Non-existence of forbidden roles
  const { data: forbiddenRoles } = await supabase
    .from('profiles')
    .select('role')
    .in('role', ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'TECHNICAL_ADMIN']);

  assert('SYSTEM_ADMIN, SUPER_ADMIN, TECHNICAL_ADMIN do NOT exist', !forbiddenRoles || forbiddenRoles.length === 0);

  // 8. Test Existing MOSPI_ADMIN & STATE_NODAL_OFFICER roles are intact
  const { count: mospiCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'MOSPI_ADMIN');

  assert('MOSPI_ADMIN accounts intact', (mospiCount || 0) > 0, `Count: ${mospiCount}`);

  const { count: snoCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'STATE_NODAL_OFFICER');

  assert('STATE_NODAL_OFFICER accounts intact (36 states)', snoCount === 36, `Count: ${snoCount}`);

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runVerification().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
