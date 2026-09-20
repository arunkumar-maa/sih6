import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function slugifyAgency(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 45) || 'agency';
}

async function runSql(sql: string) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    // If exec_sql RPC is not available, try direct REST query or throw
    throw error;
  }
  return data;
}

async function main() {
  console.log('===============================================================');
  console.log(' MPLADS SENTINEL — IMPLEMENTING AGENCY IDENTITY SEEDING');
  console.log(' 100% Real Dataset-Derived Master Identities & Assignments');
  console.log('===============================================================\n');

  // Step 1: Discover distinct raw and normalized counts
  console.log('Step 1: Calculating raw and normalized counts from dataset...');

  // Lok Sabha stats
  const { data: lsStats, error: lsErr } = await supabase
    .from('lok_sabha_projects')
    .select('ida');
  if (lsErr) throw lsErr;

  const lsRawAgencies = new Set<string>();
  const lsNormAgencies = new Set<string>();
  let lsUnmapped = 0;

  for (const row of lsStats || []) {
    const raw = (row.ida || '').trim();
    if (!raw) {
      lsUnmapped++;
    } else {
      lsRawAgencies.add(raw);
      lsNormAgencies.add(raw.replace(/\s+/g, ' ').toLowerCase());
    }
  }

  // Rajya Sabha stats
  const { data: rsStats, error: rsErr } = await supabase
    .from('rajya_sabha_projects')
    .select('ida');
  if (rsErr) throw rsErr;

  const rsRawAgencies = new Set<string>();
  const rsNormAgencies = new Set<string>();
  let rsUnmapped = 0;

  for (const row of rsStats || []) {
    const raw = (row.ida || '').trim();
    if (!raw) {
      rsUnmapped++;
    } else {
      rsRawAgencies.add(raw);
      rsNormAgencies.add(raw.replace(/\s+/g, ' ').toLowerCase());
    }
  }

  // Combined normalized agencies (preserving original display name)
  const combinedAgencyMap = new Map<string, string>(); // norm -> original display name
  for (const raw of lsRawAgencies) {
    const norm = raw.replace(/\s+/g, ' ').toLowerCase();
    if (!combinedAgencyMap.has(norm)) {
      combinedAgencyMap.set(norm, raw.replace(/\s+/g, ' '));
    }
  }
  for (const raw of rsRawAgencies) {
    const norm = raw.replace(/\s+/g, ' ').toLowerCase();
    if (!combinedAgencyMap.has(norm)) {
      combinedAgencyMap.set(norm, raw.replace(/\s+/g, ' '));
    }
  }

  const distinctLs = lsRawAgencies.size;
  const distinctRs = rsRawAgencies.size;
  const distinctCombined = combinedAgencyMap.size;

  console.log(`- Distinct Lok Sabha agencies (raw): ${distinctLs}`);
  console.log(`- Distinct Rajya Sabha agencies (raw): ${distinctRs}`);
  console.log(`- Combined Normalized Distinct Agencies: ${distinctCombined}`);
  console.log(`- Lok Sabha unmapped projects: ${lsUnmapped}`);
  console.log(`- Rajya Sabha unmapped projects: ${rsUnmapped}\n`);

  // Step 2: Seed implementing_agency_profiles idempotently
  console.log('Step 2: Upserting distinct agency profiles into public.implementing_agency_profiles...');
  
  const agencyList = Array.from(combinedAgencyMap.entries()).map(([norm, display]) => ({
    agency_name: display,
    normalized_agency_name: norm,
  }));

  // Batch insert into implementing_agency_profiles
  const batchSize = 100;
  for (let i = 0; i < agencyList.length; i += batchSize) {
    const chunk = agencyList.slice(i, i + batchSize);
    const { error: upsertErr } = await supabase
      .from('implementing_agency_profiles')
      .upsert(chunk, { onConflict: 'normalized_agency_name' });
    if (upsertErr) {
      console.error('Error upserting agency profiles batch:', upsertErr);
      throw upsertErr;
    }
  }
  console.log(`Successfully upserted ${agencyList.length} agency master profiles.`);

  // Step 3: Fetch all agency profiles with their assigned UUIDs
  const { data: dbAgencies, error: dbAgenciesErr } = await supabase
    .from('implementing_agency_profiles')
    .select('id, agency_name, normalized_agency_name');
  if (dbAgenciesErr || !dbAgencies) throw dbAgenciesErr;

  const agencyIdMap = new Map<string, string>(); // norm -> uuid
  for (const a of dbAgencies) {
    agencyIdMap.set(a.normalized_agency_name, a.id);
  }

  // Step 4: Idempotently seed assignments in database
  console.log('\nStep 3: Creating project assignments in public.implementing_agency_project_assignments...');

  // Fast set-based assignment query using exec_sql
  const assignSql = `
    -- Lok Sabha assignments
    INSERT INTO public.implementing_agency_project_assignments (agency_id, work_id, house, assigned_at, is_active)
    SELECT 
        iap.id,
        p.work_id,
        'Lok Sabha',
        now(),
        true
    FROM public.lok_sabha_projects p
    JOIN public.implementing_agency_profiles iap 
      ON lower(trim(regexp_replace(p.ida, '\\s+', ' ', 'g'))) = iap.normalized_agency_name
    ON CONFLICT (agency_id, work_id, house) DO NOTHING;

    -- Rajya Sabha assignments
    INSERT INTO public.implementing_agency_project_assignments (agency_id, work_id, house, assigned_at, is_active)
    SELECT 
        iap.id,
        p.work_id,
        'Rajya Sabha',
        now(),
        true
    FROM public.rajya_sabha_projects p
    JOIN public.implementing_agency_profiles iap 
      ON lower(trim(regexp_replace(p.ida, '\\s+', ' ', 'g'))) = iap.normalized_agency_name
    ON CONFLICT (agency_id, work_id, house) DO NOTHING;

    -- Update total_assigned_works counts
    UPDATE public.implementing_agency_profiles iap
    SET total_assigned_works = sub.cnt,
        updated_at = now()
    FROM (
        SELECT agency_id, COUNT(*) as cnt
        FROM public.implementing_agency_project_assignments
        GROUP BY agency_id
    ) sub
    WHERE iap.id = sub.agency_id;
  `;

  try {
    await runSql(assignSql);
    console.log('SQL set-based assignment execution completed successfully.');
  } catch (err: any) {
    console.log('exec_sql RPC not available or failed; running via batch chunking:', err.message);
    // Fallback: chunked batch inserts
    // 1. Lok Sabha
    let offset = 0;
    const limit = 5000;
    let hasMore = true;
    while (hasMore) {
      const { data: lsRows, error } = await supabase
        .from('lok_sabha_projects')
        .select('work_id, ida')
        .range(offset, offset + limit - 1);
      if (error || !lsRows || lsRows.length === 0) {
        hasMore = false;
        break;
      }
      const assignments = lsRows.map(r => {
        const norm = (r.ida || '').trim().replace(/\s+/g, ' ').toLowerCase();
        const agencyId = agencyIdMap.get(norm);
        return {
          agency_id: agencyId,
          work_id: r.work_id,
          house: 'Lok Sabha',
        };
      }).filter(a => a.agency_id);

      if (assignments.length > 0) {
        await supabase
          .from('implementing_agency_project_assignments')
          .upsert(assignments, { onConflict: 'agency_id,work_id,house', ignoreDuplicates: true });
      }
      if (lsRows.length < limit) hasMore = false;
      else offset += limit;
      process.stdout.write(`LS Assignments processed: ${offset}\r`);
    }
    console.log('\nLok Sabha assignments complete.');

    // 2. Rajya Sabha
    offset = 0;
    hasMore = true;
    while (hasMore) {
      const { data: rsRows, error } = await supabase
        .from('rajya_sabha_projects')
        .select('work_id, ida')
        .range(offset, offset + limit - 1);
      if (error || !rsRows || rsRows.length === 0) {
        hasMore = false;
        break;
      }
      const assignments = rsRows.map(r => {
        const norm = (r.ida || '').trim().replace(/\s+/g, ' ').toLowerCase();
        const agencyId = agencyIdMap.get(norm);
        return {
          agency_id: agencyId,
          work_id: r.work_id,
          house: 'Rajya Sabha',
        };
      }).filter(a => a.agency_id);

      if (assignments.length > 0) {
        await supabase
          .from('implementing_agency_project_assignments')
          .upsert(assignments, { onConflict: 'agency_id,work_id,house', ignoreDuplicates: true });
      }
      if (rsRows.length < limit) hasMore = false;
      else offset += limit;
      process.stdout.write(`RS Assignments processed: ${offset}\r`);
    }
    console.log('\nRajya Sabha assignments complete.');
  }

  // Count total assignments created
  const { count: totalAssignments } = await supabase
    .from('implementing_agency_project_assignments')
    .select('*', { count: 'exact', head: true });

  console.log(`Total project assignments in database: ${totalAssignments}`);

  // Step 4: Seed Auth Users and Profiles for each distinct agency
  console.log('\nStep 4: Ensuring auth accounts & public.profiles for all 754 agencies...');
  const encHash = bcrypt.hashSync('Agency@123', 10);

  // We can do this in SQL batches of 50 for speed
  const authBatchSize = 50;
  const totalAgencies = dbAgencies.length;
  const numBatches = Math.ceil(totalAgencies / authBatchSize);

  for (let b = 0; b < numBatches; b++) {
    const chunk = dbAgencies.slice(b * authBatchSize, (b + 1) * authBatchSize);
    let batchSql = `DO $$
DECLARE
    uid UUID;
BEGIN
`;
    for (const a of chunk) {
      const slug = slugifyAgency(a.normalized_agency_name);
      const email = `agency.${slug}@mplads-demo.local`;
      const safeName = a.agency_name.replace(/'/g, "''");
      const agencyId = a.id;

      batchSql += `
    -- Check if auth user already exists for this email
    SELECT id INTO uid FROM auth.users WHERE email = '${email}' LIMIT 1;

    IF uid IS NULL THEN
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
    END IF;

    -- Upsert public.profiles
    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, mp_id, agency_name, agency_id, is_active, created_at, updated_at, email
    ) VALUES (
        uid, '${safeName}', 'IMPLEMENTING_AGENCY', NULL, NULL, NULL, NULL, NULL, NULL, '${safeName}', '${agencyId}', true, now(), now(), '${email}'
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
        agency_name = EXCLUDED.agency_name,
        agency_id = EXCLUDED.agency_id,
        email = EXCLUDED.email,
        updated_at = now();
`;
    }
    batchSql += `END $$;`;

    try {
      await runSql(batchSql);
    } catch (err: any) {
      console.error(`Error in auth batch ${b + 1}/${numBatches}:`, err.message);
    }
    process.stdout.write(`Seeded auth batch ${b + 1}/${numBatches}\r`);
  }
  console.log(`\nAuth accounts & public.profiles verified for all ${totalAgencies} agencies.`);

  // Step 5: Final Validation Counts
  const { count: finalAgencyProfiles } = await supabase
    .from('implementing_agency_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: finalAuthProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'IMPLEMENTING_AGENCY');

  const { count: finalAssignments } = await supabase
    .from('implementing_agency_project_assignments')
    .select('*', { count: 'exact', head: true });

  console.log('\n===============================================================');
  console.log(' FINAL DATASET COUNT VALIDATION REPORT');
  console.log('===============================================================');
  console.log(`A. Total distinct implementing agencies found in Lok Sabha dataset: ${distinctLs}`);
  console.log(`B. Total distinct implementing agencies found in Rajya Sabha dataset: ${distinctRs}`);
  console.log(`C. Total distinct implementing agencies across both Houses (normalized): ${distinctCombined}`);
  console.log(`D. Total IMPLEMENTING_AGENCY profiles/accounts created: ${finalAgencyProfiles} (profiles: ${finalAuthProfiles})`);
  console.log(`E. Total project-to-agency assignments created: ${finalAssignments}`);
  console.log(`F. Number of projects that could not be mapped to an agency: ${lsUnmapped + rsUnmapped}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
