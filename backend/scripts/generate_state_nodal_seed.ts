import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all 36 distinct real dataset states confirmed from lok_sabha_projects and rajya_sabha_projects
export const REAL_DATASET_STATES = [
  'Andaman And Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu And Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'The Dadra And Nagar Haveli And Daman And Diu',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function normalizeStateEmailPrefix(stateName: string): string {
  let clean = stateName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'thedadraandnagarhavelianddamananddiu') {
    clean = 'dadranagarhaveli';
  }
  return clean;
}

export function normalizeStatePasswordName(stateName: string): string {
  let words = stateName.split(/\s+/).filter(Boolean);
  if (stateName === 'The Dadra And Nagar Haveli And Daman And Diu') {
    words = ['Dadra', 'Nagar', 'Haveli'];
  }
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

export function generateStateNodalSeedSQL(): string {
  let sql = `-- ==============================================================================
-- MPLADS SENTINEL — SEED STATE NODAL OFFICERS FOR ALL REAL DATASET STATES
-- Generated dynamically from distinct states in lok_sabha_projects & rajya_sabha_projects
-- Total States: ${REAL_DATASET_STATES.length}
-- ==============================================================================

DO $$
DECLARE
    uid UUID;
    enc_pw TEXT;
BEGIN
`;

  for (const state of REAL_DATASET_STATES) {
    const emailPrefix = normalizeStateEmailPrefix(state);
    const email = `${emailPrefix}.nodal@mplads-demo.local`;
    const password = `${normalizeStatePasswordName(state)}@123`;
    const fullName = `State Nodal Officer - ${state}`;
    const safeFullName = fullName.replace(/'/g, "''");
    const safeState = state.replace(/'/g, "''");

    sql += `
    -- State Nodal Officer: ${state}
    DELETE FROM auth.users WHERE email = '${email}';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = '${safeState}';

    uid := gen_random_uuid();
    enc_pw := crypt('${password}', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        '${email}', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
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
        uid, '${safeFullName}', 'STATE_NODAL_OFFICER', NULL, '${safeState}', NULL, NULL, NULL, NULL, true, now(), now()
    );
`;
  }

  sql += `
END $$;
`;

  return sql;
}

const sql = generateStateNodalSeedSQL();
fs.writeFileSync(path.join(__dirname, 'seed_state_nodal_officers.sql'), sql, 'utf8');
console.log('Successfully generated seed_state_nodal_officers.sql for 36 states.');
