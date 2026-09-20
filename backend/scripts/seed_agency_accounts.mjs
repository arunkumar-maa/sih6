import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 45) || 'agency';
}

async function main() {
  console.log('Fetching all 754 agency profiles...');
  const { data: agencies, error } = await supabase
    .from('implementing_agency_profiles')
    .select('id, agency_name, normalized_agency_name, total_assigned_works')
    .order('total_assigned_works', { ascending: false });

  if (error || !agencies) {
    console.error('Error fetching agencies:', error);
    process.exit(1);
  }

  console.log(`Fetched ${agencies.length} agency master profiles.`);
  const encHash = bcrypt.hashSync('Agency@123', 10);

  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(agencies.length / BATCH_SIZE);

  console.log(`Creating auth.users, auth.identities, and public.profiles in ${totalBatches} batches...`);

  // To ensure unique emails even if two agencies slugify to the same prefix:
  const seenEmails = new Set();

  for (let b = 0; b < totalBatches; b++) {
    const batch = agencies.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    let sql = `DO $$
DECLARE
    uid UUID;
BEGIN
`;
    for (const a of batch) {
      let slug = slugify(a.normalized_agency_name);
      let email = `agency.${slug}@mplads-demo.local`;
      if (seenEmails.has(email)) {
        email = `agency.${slug}.${a.id.slice(0, 6)}@mplads-demo.local`;
      }
      seenEmails.add(email);

      const safeName = a.agency_name.replace(/'/g, "''");
      const agencyId = a.id;

      sql += `
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
    sql += `END $$;`;

    process.stdout.write(`Batch ${b + 1}/${totalBatches}... `);
    const start = Date.now();
    const { error: rpcErr } = await supabase.rpc('exec_sql', { query: sql });
    if (rpcErr) {
      console.log('FAILED');
      console.error(rpcErr);
      process.exit(1);
    } else {
      console.log(`OK (${Date.now() - start}ms)`);
    }
  }

  console.log('\nAll 754 agency accounts successfully seeded!');
  const { count: finalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'IMPLEMENTING_AGENCY');

  console.log(`Total IMPLEMENTING_AGENCY profiles in DB: ${finalCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
