
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
  encrypted_password = '$2a$10$Jg1/I6hNmOcRdPl2zcxJVehx9M/RB3F9ZddlcSINE76YQQmkm77QK',
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
      '$2a$10$Jg1/I6hNmOcRdPl2zcxJVehx9M/RB3F9ZddlcSINE76YQQmkm77QK',
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
