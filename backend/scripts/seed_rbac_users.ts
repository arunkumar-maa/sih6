import { supabase } from '../src/services/supabase.service.js';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

export function normalizeMPName(rawName: string): string {
  // Remove parenthetical text like (2024-2029), (SC), (ST), etc.
  let cleaned = rawName.replace(/\([^)]*\)/g, '').trim();
  // Remove title prefixes like Shri, Smt, Dr, Adv, Prof
  cleaned = cleaned.replace(/^(shri|smt|dr\.?|adv\.?|prof\.?|sh\.)\s+/i, '').trim();
  // Replace punctuation and special characters with spaces
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  // Capitalize words (PascalCase)
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'HonbleMP';
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

export function generateMPEmail(normalizedName: string, house: 'Lok Sabha' | 'Rajya Sabha', disambiguator?: string): string {
  const base = normalizedName.toLowerCase();
  const houseTag = house === 'Lok Sabha' ? 'ls' : 'rs';
  if (disambiguator) {
    const cleanDisambig = disambiguator.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
    return `${base}.${cleanDisambig}.${houseTag}@mplads-demo.local`;
  }
  return `${base}.${houseTag}@mplads-demo.local`;
}

export interface MPAccountData {
  authUserId: string;
  fullName: string;
  email: string;
  password: string; // Format: <NormalizedMPName>@123
  role: 'MP';
  house: 'Lok Sabha' | 'Rajya Sabha';
  state: string;
  constituency?: string;
  mpName: string;
  mpId: string;
}

export async function extractAndGenerateSeedData() {
  console.log('[RBAC Seeder] Extracting MP identities from mp_identities_cache...');

  const { data: rows, error } = await supabase
    .from('mp_identities_cache')
    .select('*')
    .limit(2000);

  if (error) throw new Error(`Error querying mp_identities_cache: ${error.message}`);

  const lsRows = (rows || []).filter((r: any) => r.house === 'Lok Sabha');
  const rsRows = (rows || []).filter((r: any) => r.house === 'Rajya Sabha');

  // Distinct by (mp_name, state, constituency)
  const lsMap = new Map<string, { mpName: string; state: string; constituency: string }>();
  for (const row of lsRows) {
    const name = (row.mp_name || '').trim();
    if (!name) continue;
    const state = (row.state || '').trim();
    const constituency = (row.constituency || '').trim();
    const key = `${name.toLowerCase()}___${state.toLowerCase()}___${constituency.toLowerCase()}`;
    if (!lsMap.has(key)) {
      lsMap.set(key, { mpName: name, state, constituency });
    }
  }

  // Distinct by (mp_name, state)
  const rsMap = new Map<string, { mpName: string; state: string }>();
  for (const row of rsRows) {
    const name = (row.mp_name || '').trim();
    if (!name) continue;
    const state = (row.state || '').trim();
    const key = `${name.toLowerCase()}___${state.toLowerCase()}`;
    if (!rsMap.has(key)) {
      rsMap.set(key, { mpName: name, state });
    }
  }

  console.log(`[RBAC Seeder] Found ${lsMap.size} unique Lok Sabha MP contexts`);
  console.log(`[RBAC Seeder] Found ${rsMap.size} unique Rajya Sabha MP contexts`);

  const accounts: MPAccountData[] = [];
  const usedEmails = new Set<string>();

  // Process Lok Sabha MPs
  for (const [key, item] of lsMap.entries()) {
    const norm = normalizeMPName(item.mpName);
    let email = generateMPEmail(norm, 'Lok Sabha');
    if (usedEmails.has(email)) {
      email = generateMPEmail(norm, 'Lok Sabha', item.constituency || item.state);
    }
    usedEmails.add(email);

    const password = `${norm}@123`;
    const mpId = `ls_${norm.toLowerCase()}_${item.constituency.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    accounts.push({
      authUserId: '', // Generated in SQL
      fullName: `Hon'ble MP ${item.mpName}`,
      email,
      password,
      role: 'MP',
      house: 'Lok Sabha',
      state: item.state,
      constituency: item.constituency,
      mpName: item.mpName,
      mpId,
    });
  }

  // Process Rajya Sabha MPs
  for (const [key, item] of rsMap.entries()) {
    const norm = normalizeMPName(item.mpName);
    let email = generateMPEmail(norm, 'Rajya Sabha');
    if (usedEmails.has(email)) {
      email = generateMPEmail(norm, 'Rajya Sabha', item.state);
    }
    usedEmails.add(email);

    const password = `${norm}@123`;
    const mpId = `rs_${norm.toLowerCase()}_${item.state.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    accounts.push({
      authUserId: '', // Generated in SQL
      fullName: `Hon'ble MP ${item.mpName}`,
      email,
      password,
      role: 'MP',
      house: 'Rajya Sabha',
      state: item.state,
      mpName: item.mpName,
      mpId,
    });
  }

  return accounts;
}

export function generateSQLScript(accounts: MPAccountData[]): string {
  let sql = `-- ==============================================================================
-- AUTOMATED MP DEMO ACCOUNTS & ADMINISTRATIVE PROFILES SEED
-- Generated strictly from real dataset identities
-- ==============================================================================

DO $$
DECLARE
    new_user_id UUID;
    enc_pw TEXT;
BEGIN
    -- 1. MOSPI ADMIN
    DELETE FROM auth.users WHERE email = 'admin@mplads-demo.local';
    new_user_id := gen_random_uuid();
    enc_pw := crypt('MospiAdmin@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        'admin@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', 'admin@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', 'admin@mplads-demo.local'),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active
    ) VALUES (
        new_user_id, 'Dr. Rajesh Kumar (MoSPI Admin)', 'MOSPI_ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, true
    );

    -- 2. STATE NODAL OFFICER (Uttar Pradesh)
    DELETE FROM auth.users WHERE email = 'sno.up@mplads-demo.local';
    new_user_id := gen_random_uuid();
    enc_pw := crypt('StateNodalUP@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        'sno.up@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', 'sno.up@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', 'sno.up@mplads-demo.local'),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active
    ) VALUES (
        new_user_id, 'Shri R. P. Verma (State Nodal Officer - Uttar Pradesh)', 'STATE_NODAL_OFFICER', NULL, 'Uttar Pradesh', NULL, NULL, NULL, NULL, true
    );

    -- 3. DISTRICT OFFICER (Varanasi)
    DELETE FROM auth.users WHERE email = 'do.varanasi@mplads-demo.local';
    new_user_id := gen_random_uuid();
    enc_pw := crypt('DistrictOfficerVaranasi@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        'do.varanasi@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', 'do.varanasi@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', 'do.varanasi@mplads-demo.local'),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active
    ) VALUES (
        new_user_id, 'District Magistrate (Varanasi District)', 'DISTRICT_OFFICER', NULL, 'Uttar Pradesh', 'VARANASI', NULL, NULL, NULL, true
    );

    -- 4. IMPLEMENTING AGENCY (DRDA)
    DELETE FROM auth.users WHERE email = 'agency.pwd@mplads-demo.local';
    new_user_id := gen_random_uuid();
    enc_pw := crypt('AgencyPWD@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        'agency.pwd@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', 'agency.pwd@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', 'agency.pwd@mplads-demo.local'),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active
    ) VALUES (
        new_user_id, 'Executive Engineer (DRDA / PWD)', 'IMPLEMENTING_AGENCY', NULL, 'Uttar Pradesh', 'VARANASI', NULL, NULL, 'DRDA', true
    );

    -- 5. AUDITOR
    DELETE FROM auth.users WHERE email = 'auditor@mplads-demo.local';
    new_user_id := gen_random_uuid();
    enc_pw := crypt('AuditorMoSPI@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        'auditor@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', 'auditor@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', 'auditor@mplads-demo.local'),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active
    ) VALUES (
        new_user_id, 'Senior Audit Officer (Audit & Verification Desk)', 'AUDITOR', NULL, NULL, NULL, NULL, NULL, NULL, true
    );
END $$;
`;

  return sql;
}

// Cache computed bcrypt hashes to avoid re-hashing identical passwords
const hashCache = new Map<string, string>();

function getHash(password: string): string {
  if (hashCache.has(password)) return hashCache.get(password)!;
  // Use standard $2a$ salt with cost 10
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  hashCache.set(password, hash);
  return hash;
}

// Function to generate batch SQL for MP accounts
export function generateMPBatchSQL(accounts: MPAccountData[], batchIndex: number): string {
  let sql = `DO $$\nDECLARE\n    uid UUID;\nBEGIN\n`;
  for (const acc of accounts) {
    const escEmail = acc.email.replace(/'/g, "''");
    const encPw = getHash(acc.password).replace(/'/g, "''");
    const escFull = acc.fullName.replace(/'/g, "''");
    const escState = (acc.state || '').replace(/'/g, "''");
    const escConst = (acc.constituency || '').replace(/'/g, "''");
    const escMPName = acc.mpName.replace(/'/g, "''");
    const escMPId = acc.mpId.replace(/'/g, "''");

    sql += `
    DELETE FROM auth.users WHERE email = '${escEmail}';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        '${escEmail}', '${encPw}', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', '${escEmail}'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', '${escEmail}'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, '${escFull}', 'MP', '${acc.house}', '${escState}', ${acc.constituency ? `'${escConst}'` : 'NULL'}, '${escMPName}', '${escMPId}', true
    );
`;
  }
  sql += `END $$;\n`;
  return sql;
}

async function main() {
  const accounts = await extractAndGenerateSeedData();
  const lsAccounts = accounts.filter(a => a.house === 'Lok Sabha');
  const rsAccounts = accounts.filter(a => a.house === 'Rajya Sabha');

  console.log(`\n========================================`);
  console.log(`TOTAL MP IDENTITIES EXTRACTED: ${accounts.length}`);
  console.log(`- Lok Sabha MP Accounts: ${lsAccounts.length}`);
  console.log(`- Rajya Sabha MP Accounts: ${rsAccounts.length}`);
  console.log(`========================================\n`);

  // Save metadata JSON for quick demo reference in backend/frontend
  const demoMetaPath = path.resolve(process.cwd(), 'src/data/demoAccounts.json');
  const safeAccounts = [
    {
      role: 'MOSPI_ADMIN',
      email: 'admin@mplads-demo.local',
      passwordFormat: 'MospiAdmin@123',
      name: 'Dr. Rajesh Kumar (MoSPI Admin)',
      scope: 'National Command Center',
      house: 'National (Lok Sabha & Rajya Sabha)',
    },
    {
      role: 'STATE_NODAL_OFFICER',
      email: 'sno.up@mplads-demo.local',
      passwordFormat: 'StateNodalUP@123',
      name: 'Shri R. P. Verma (State Nodal Officer - Uttar Pradesh)',
      scope: 'State: Uttar Pradesh',
      state: 'Uttar Pradesh',
    },
    {
      role: 'DISTRICT_OFFICER',
      email: 'do.varanasi@mplads-demo.local',
      passwordFormat: 'DistrictOfficerVaranasi@123',
      name: 'District Magistrate (Varanasi District)',
      scope: 'District: VARANASI (Uttar Pradesh)',
      state: 'Uttar Pradesh',
      district: 'VARANASI',
    },
    {
      role: 'IMPLEMENTING_AGENCY',
      email: 'agency.pwd@mplads-demo.local',
      passwordFormat: 'AgencyPWD@123',
      name: 'Executive Engineer (DRDA / PWD)',
      scope: 'Agency: DRDA',
      agency: 'DRDA',
    },
    {
      role: 'AUDITOR',
      email: 'auditor@mplads-demo.local',
      passwordFormat: 'AuditorMoSPI@123',
      name: 'Senior Audit Officer (Audit & Verification Desk)',
      scope: 'Authorized Audit Scope',
    },
    // Include top 10 Lok Sabha sample MPs
    ...lsAccounts.slice(0, 10).map(a => ({
      role: 'MP' as const,
      email: a.email,
      passwordFormat: a.password,
      name: a.fullName,
      scope: `Lok Sabha · ${a.constituency} (${a.state})`,
      house: a.house,
      state: a.state,
      constituency: a.constituency,
      mpName: a.mpName,
    })),
    // Include top 10 Rajya Sabha sample MPs
    ...rsAccounts.slice(0, 10).map(a => ({
      role: 'MP' as const,
      email: a.email,
      passwordFormat: a.password,
      name: a.fullName,
      scope: `Rajya Sabha · ${a.state}`,
      house: a.house,
      state: a.state,
      mpName: a.mpName,
    })),
  ];

  fs.mkdirSync(path.dirname(demoMetaPath), { recursive: true });
  fs.writeFileSync(demoMetaPath, JSON.stringify(safeAccounts, null, 2));
  console.log(`[RBAC Seeder] Saved demo accounts metadata to ${demoMetaPath}`);

  // Write SQL scripts
  const adminSql = generateSQLScript(accounts);
  fs.writeFileSync(path.resolve(process.cwd(), 'scripts/seed_admins.sql'), adminSql);
  console.log(`[RBAC Seeder] Written admin seed SQL.`);

  // Write MP batches (e.g. 50 accounts per batch)
  const batchSize = 50;
  const totalBatches = Math.ceil(accounts.length / batchSize);
  console.log(`[RBAC Seeder] Generating ${totalBatches} MP account SQL batches...`);

  for (let i = 0; i < totalBatches; i++) {
    const chunk = accounts.slice(i * batchSize, (i + 1) * batchSize);
    const chunkSql = generateMPBatchSQL(chunk, i);
    fs.writeFileSync(path.resolve(process.cwd(), `scripts/seed_mp_batch_${i + 1}.sql`), chunkSql);
  }

  console.log(`[RBAC Seeder] All SQL seed files generated successfully.`);
}

if (process.argv[1] && process.argv[1].endsWith('seed_rbac_users.ts')) {
  main().catch(err => {
    console.error('[RBAC Seeder Error]:', err);
    process.exit(1);
  });
}
