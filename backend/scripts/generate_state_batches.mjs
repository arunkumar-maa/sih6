import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { REAL_DATASET_STATES, normalizeStateEmailPrefix, normalizeStatePasswordName } from './generate_state_nodal_seed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateBatch(states, batchNum) {
  let sql = `-- Batch ${batchNum}\nDO $$\nDECLARE\n    uid UUID;\n    enc_pw TEXT;\nBEGIN\n`;
  for (const state of states) {
    const emailPrefix = normalizeStateEmailPrefix(state);
    const email = `${emailPrefix}.nodal@mplads-demo.local`;
    const password = `${normalizeStatePasswordName(state)}@123`;
    const fullName = `State Nodal Officer - ${state}`;
    const safeFullName = fullName.replace(/'/g, "''");
    const safeState = state.replace(/'/g, "''");

    sql += `
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
  sql += `\nEND $$;\n`;
  return sql;
}

const b1 = generateBatch(REAL_DATASET_STATES.slice(0, 18), 1);
const b2 = generateBatch(REAL_DATASET_STATES.slice(18), 2);

fs.writeFileSync(path.join(__dirname, 'seed_state_nodal_batch1.sql'), b1, 'utf8');
fs.writeFileSync(path.join(__dirname, 'seed_state_nodal_batch2.sql'), b2, 'utf8');
console.log('Generated batch 1 (18 states) and batch 2 (18 states).');
