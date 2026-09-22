import fs from 'fs';

function slugifyConstituency(name) {
  return name
    .toLowerCase()
    .replace(/\s*\((?:sc|st)\)\s*/gi, '') // remove (SC) / (ST) suffixes
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
}

function parseCsvLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else curr += ch;
  }
  result.push(curr.trim());
  return result;
}

const content = fs.readFileSync('lok_sabha_dataset/Allocated Limit for Honble MPs.csv', 'utf-8');
const lines = content.split(/\r?\n/);
const mps = [];
const seenSlugs = new Set();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = parseCsvLine(line);
  if (parts.length < 5) continue;
  const srNo = parts[0];
  if (srNo === 'Grand Total' || isNaN(parseInt(srNo, 10))) continue;
  const state = parts[1].replace(/'/g, "''");
  const mpName = parts[2].replace(/'/g, "''");
  const constituency = parts[3].replace(/'/g, "''");
  const allocated = parseFloat(parts[4].replace(/,/g, '')) || 0;

  let slug = slugifyConstituency(parts[3]);
  if (seenSlugs.has(slug)) {
    const stateSlug = slugifyConstituency(parts[1]);
    slug = `${slug}_${stateSlug}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}_${srNo}`;
    }
  }
  seenSlugs.add(slug);

  const email = `mp.${slug}@mplads-demo.local`;
  const mpId = `ls_${slug}`;

  mps.push({
    srNo: parseInt(srNo, 10),
    state,
    mpName,
    constituency,
    allocated,
    slug,
    email,
    mpId
  });
}

console.log(`Loaded ${mps.length} Lok Sabha MPs.`);

// Standard bcrypt password hash for 'Mplads@123':
const passwordHash = '$2a$10$Jg1/I6hNmOcRdPl2zcxJVehx9M/RB3F9ZddlcSINE76YQQmkm77QK';

// Step 1: Create master table SQL
const step1Sql = `
CREATE TABLE IF NOT EXISTS public.ls_mps_master (
  sr_no INT PRIMARY KEY,
  state TEXT NOT NULL,
  mp_name TEXT NOT NULL,
  constituency TEXT NOT NULL,
  allocated_amount NUMERIC,
  slug TEXT NOT NULL,
  email TEXT NOT NULL,
  mp_id TEXT NOT NULL
);
`;
fs.writeFileSync('scripts/sync_step1.sql', step1Sql);

// Step 2: Batched inserts into master table (chunks of 100)
const chunkSize = 100;
const insertBatches = [];
for (let i = 0; i < mps.length; i += chunkSize) {
  const chunk = mps.slice(i, i + chunkSize);
  const rows = chunk.map(m => `(${m.srNo}, '${m.state}', '${m.mpName}', '${m.constituency}', ${m.allocated}, '${m.slug}', '${m.email}', '${m.mpId}')`).join(',\n');
  const sql = `
INSERT INTO public.ls_mps_master (sr_no, state, mp_name, constituency, allocated_amount, slug, email, mp_id)
VALUES
${rows}
ON CONFLICT (sr_no) DO UPDATE SET
  state = EXCLUDED.state,
  mp_name = EXCLUDED.mp_name,
  constituency = EXCLUDED.constituency,
  allocated_amount = EXCLUDED.allocated_amount,
  slug = EXCLUDED.slug,
  email = EXCLUDED.email,
  mp_id = EXCLUDED.mp_id;
`;
  insertBatches.push(sql);
}

// Step 3: Profile sync & auth update
const step3Sql = `
-- 1. Update existing profiles to use constituency-based email and mp_id
UPDATE public.profiles p
SET 
  email = m.email,
  mp_id = m.mp_id,
  constituency = COALESCE(p.constituency, m.constituency),
  updated_at = now()
FROM public.ls_mps_master m
WHERE p.role = 'MP' 
  AND p.house = 'Lok Sabha'
  AND (
    LOWER(TRIM(p.mp_name)) = LOWER(TRIM(m.mp_name))
    OR LOWER(TRIM(p.constituency)) = LOWER(TRIM(m.constituency))
  );

-- 2. Update auth.users email and password for existing profiles
UPDATE auth.users u
SET 
  email = p.email,
  encrypted_password = '${passwordHash}',
  updated_at = now()
FROM public.profiles p
WHERE p.auth_user_id = u.id
  AND p.role = 'MP'
  AND p.house = 'Lok Sabha'
  AND p.email LIKE 'mp.%@mplads-demo.local';

-- 3. Insert any missing Lok Sabha MPs from the 543 list
DO $$
DECLARE
  r RECORD;
  new_auth_id UUID;
  new_prof_id UUID;
BEGIN
  FOR r IN 
    SELECT m.* 
    FROM public.ls_mps_master m
    LEFT JOIN public.profiles p 
      ON p.role = 'MP' 
      AND p.house = 'Lok Sabha'
      AND (
        LOWER(TRIM(p.mp_name)) = LOWER(TRIM(m.mp_name))
        OR LOWER(TRIM(p.constituency)) = LOWER(TRIM(m.constituency))
      )
    WHERE p.id IS NULL
  LOOP
    new_auth_id := gen_random_uuid();
    new_prof_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      new_auth_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      r.email,
      '${passwordHash}',
      now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('role', 'MP', 'house', 'Lok Sabha', 'constituency', r.constituency, 'name', r.mp_name),
      now(),
      now()
    );

    -- Insert into public.profiles with photo_url = NULL (blank)
    INSERT INTO public.profiles (
      id,
      auth_user_id,
      full_name,
      role,
      house,
      state,
      constituency,
      mp_name,
      mp_id,
      email,
      photo_url,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      new_prof_id,
      new_auth_id,
      'Hon''ble MP ' || r.mp_name,
      'MP',
      'Lok Sabha',
      r.state,
      r.constituency,
      r.mp_name,
      r.mp_id,
      r.email,
      NULL,
      true,
      now(),
      now()
    );
  END LOOP;
END $$;
`;
fs.writeFileSync('scripts/sync_step3.sql', step3Sql);

// Save insert batches
insertBatches.forEach((batch, idx) => {
  fs.writeFileSync(`scripts/sync_step2_batch${idx + 1}.sql`, batch);
});

console.log(`Generated Step 1, Step 2 (${insertBatches.length} batches), and Step 3 SQL files.`);
