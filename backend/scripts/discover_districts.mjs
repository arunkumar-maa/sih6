import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Discovering distinct State + District combinations from real dataset...');

  // 1. Fetch from lok_sabha_projects
  // Note: Supabase limits to 1000 rows by default without pagination, so let's fetch distinct or page through
  // Or check if we have an RPC or use paginated select
  let lsDistricts = new Map(); // key: "state:::district" -> { state, district, lsCount, rsCount }

  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  console.log('Querying lok_sabha_projects...');
  while (hasMore) {
    const { data, error } = await supabase
      .from('lok_sabha_projects')
      .select('state, district')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching LS projects:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const state = (row.state || '').trim();
      const district = (row.district || '').trim();
      if (!state || !district) continue;
      const key = `${state.toLowerCase()}:::${district.toLowerCase()}`;
      if (!lsDistricts.has(key)) {
        lsDistricts.set(key, { state, district, count: 1 });
      } else {
        lsDistricts.get(key).count++;
      }
    }

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`Scanned ${page * pageSize} LS records. Unique State+District combos: ${lsDistricts.size}`);

  // 2. Fetch from rajya_sabha_projects
  console.log('Querying rajya_sabha_projects...');
  page = 0;
  hasMore = true;
  let rsOnlyCount = 0;

  while (hasMore) {
    const { data, error } = await supabase
      .from('rajya_sabha_projects')
      .select('state, district')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching RS projects:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const state = (row.state || '').trim();
      const district = (row.district || '').trim();
      if (!state || !district) continue;
      const key = `${state.toLowerCase()}:::${district.toLowerCase()}`;
      if (!lsDistricts.has(key)) {
        lsDistricts.set(key, { state, district, count: 1, rsOnly: true });
        rsOnlyCount++;
      } else {
        lsDistricts.get(key).count++;
      }
    }

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`Total unique State + District combinations across LS & RS: ${lsDistricts.size} (RS only new: ${rsOnlyCount})`);

  // Count by state
  const stateCounts = {};
  for (const item of lsDistricts.values()) {
    stateCounts[item.state] = (stateCounts[item.state] || 0) + 1;
  }

  console.log('\nState-wise district counts:');
  const sortedStates = Object.keys(stateCounts).sort();
  for (const s of sortedStates) {
    console.log(`  ${s}: ${stateCounts[s]} districts`);
  }

  // Check current profiles with DISTRICT_OFFICER role
  const { data: existingProfiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, state, district, role')
    .eq('role', 'DISTRICT_OFFICER');

  if (!pErr) {
    console.log(`\nCurrently existing DISTRICT_OFFICER profiles in DB: ${existingProfiles?.length || 0}`);
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Sample existing profiles:', existingProfiles.slice(0, 5));
    }
  }
}

main();
