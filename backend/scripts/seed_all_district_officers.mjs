import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function cleanDistrictName(districtRaw) {
  return districtRaw.split('(')[0].trim();
}

function normalizePasswordName(cleanName) {
  const words = cleanName.split(/[\s_-]+/).filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

async function getOrDiscoverDistricts() {
  const cacheFile = path.resolve('backend/scripts/real_districts_769.json');
  if (fs.existsSync(cacheFile)) {
    console.log(`Loading cached real districts from ${cacheFile}...`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  console.log('Discovering all real State + District combinations from Supabase...');
  const districtsMap = new Map();

  // 1. Scan lok_sabha_projects
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('lok_sabha_projects')
      .select('state, district')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const state = (row.state || '').trim();
      const district = (row.district || '').trim();
      if (!state || !district) continue;
      const key = `${state.toLowerCase()}:::${district.toLowerCase()}`;
      if (!districtsMap.has(key)) {
        districtsMap.set(key, { state, district });
      }
    }

    if (data.length < pageSize) hasMore = false;
    else page++;
  }

  // 2. Scan rajya_sabha_projects
  page = 0;
  hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from('rajya_sabha_projects')
      .select('state, district')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const state = (row.state || '').trim();
      const district = (row.district || '').trim();
      if (!state || !district) continue;
      const key = `${state.toLowerCase()}:::${district.toLowerCase()}`;
      if (!districtsMap.has(key)) {
        districtsMap.set(key, { state, district });
      }
    }

    if (data.length < pageSize) hasMore = false;
    else page++;
  }

  const items = Array.from(districtsMap.values()).sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.district.localeCompare(b.district);
  });

  fs.writeFileSync(cacheFile, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Saved ${items.length} real districts to cache.`);
  return items;
}

async function main() {
  const districts = await getOrDiscoverDistricts();
  console.log(`Total districts to seed: ${districts.length}`);

  const pwCache = new Map();
  function getHash(pw) {
    if (!pwCache.has(pw)) {
      pwCache.set(pw, bcrypt.hashSync(pw, 10));
    }
    return pwCache.get(pw);
  }

  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(districts.length / BATCH_SIZE);

  console.log(`\nBeginning fast seed in ${totalBatches} batches (pre-computed bcrypt)...`);

  for (let b = 0; b < totalBatches; b++) {
    const batchDistricts = districts.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    let sql = `DO $$
DECLARE
    uid UUID;
BEGIN
`;

    for (const item of batchDistricts) {
      const { state, district } = item;
      const cleanDist = cleanDistrictName(district);
      const stateClean = state.toLowerCase().replace(/[^a-z0-9]/g, '');
      const distClean = cleanDist.toLowerCase().replace(/[^a-z0-9]/g, '');

      let email;
      let password;
      let fullName;

      if (state.toLowerCase() === 'uttar pradesh' && cleanDist.toUpperCase() === 'VARANASI') {
        email = 'do.varanasi@mplads-demo.local';
        password = 'DistrictOfficerVaranasi@123';
        fullName = 'District Magistrate (Varanasi District)';
      } else {
        email = `${distClean}.${stateClean}.district@mplads-demo.local`;
        const pwName = normalizePasswordName(cleanDist) || 'District';
        password = `${pwName}@123`;
        fullName = `District Magistrate - ${cleanDist} (${state})`;
      }

      const encHash = getHash(password);
      const safeFullName = fullName.replace(/'/g, "''");
      const safeState = state.replace(/'/g, "''");
      const safeDistrict = district.replace(/'/g, "''");

      sql += `
    DELETE FROM auth.users WHERE email = '${email}';
    DELETE FROM public.profiles WHERE role = 'DISTRICT_OFFICER' AND lower(state) = lower('${safeState}') AND lower(district) = lower('${safeDistrict}');

    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        '${email}', '${encHash}', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', '${email}'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', '${email}'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, '${safeFullName}', 'DISTRICT_OFFICER', NULL, '${safeState}', '${safeDistrict}', NULL, NULL, NULL, true, now(), now()
    );
`;
    }

    sql += `
END $$;
`;

    process.stdout.write(`Batch ${b + 1}/${totalBatches}... `);
    const start = Date.now();
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.log('FAILED');
      console.error(error);
      process.exit(1);
    } else {
      console.log(`OK (${Date.now() - start}ms)`);
    }
  }

  console.log('\nAll 769 District Officers successfully seeded!');
  await supabase.rpc('exec_sql', { query: "NOTIFY pgrst, 'reload schema';" });

  const { count: doCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'DISTRICT_OFFICER');

  console.log(`\nVerification: Total DISTRICT_OFFICER profiles in DB: ${doCount}`);
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
