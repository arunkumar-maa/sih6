DO $$
DECLARE
    uid UUID;
BEGIN

    DELETE FROM auth.users WHERE email = 'shivrajsinghchouhan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shivrajsinghchouhan.rs@mplads-demo.local', '$2b$10$oOr7Cbs/XNZ0qewyClv1vOTUimnkrK1Pk2NQdU/7/aSGjg43nIlbK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shivrajsinghchouhan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shivrajsinghchouhan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SHIVRAJ SINGH CHOUHAN (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'SHIVRAJ SINGH CHOUHAN (2024-2029)', 'rs_shivrajsinghchouhan_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'shobhakarandlaje.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shobhakarandlaje.rs@mplads-demo.local', '$2b$10$fDS9JRH36ILnXxvu0GUhKuVvK0QppZ.rob2mOcZNYE9fsgLdLCK3e', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shobhakarandlaje.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shobhakarandlaje.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SHOBHA KARANDLAJE (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'SHOBHA KARANDLAJE (2024-2029)', 'rs_shobhakarandlaje_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'shobhanabenmahendrasinhbaraiya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shobhanabenmahendrasinhbaraiya.rs@mplads-demo.local', '$2b$10$p1qXK8lbh5gWYrBWv/Q7/Oq7h5rpdidQgDc44cT.Xu0byWcnG8DWq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shobhanabenmahendrasinhbaraiya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shobhanabenmahendrasinhbaraiya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SHOBHANABEN MAHENDRASINH BARAIYA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'SHOBHANABEN MAHENDRASINH BARAIYA (2024-2029)', 'rs_shobhanabenmahendrasinhbaraiya_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'shreyasmpatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shreyasmpatel.rs@mplads-demo.local', '$2b$10$GivF5kzbFUOWFon1QbO9mObHl2/D.A.mvk0HA3Wsx6WEyD4hgntum', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shreyasmpatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shreyasmpatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SHREYAS. M. PATEL (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'SHREYAS. M. PATEL (2024-2029)', 'rs_shreyasmpatel_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'dharambirsingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dharambirsingh.rs@mplads-demo.local', '$2b$10$SODB8kUp9ri9L.VoxuobGeB4AI27a5sclaqbIFeHv22A0T4yNsT/C', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dharambirsingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dharambirsingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri  Dharambir Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Haryana', NULL, 'Shri  Dharambir Singh (2024-2029)', 'rs_dharambirsingh_haryana', true
    );

    DELETE FROM auth.users WHERE email = 'abhishekbanerjee.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'abhishekbanerjee.rs@mplads-demo.local', '$2b$10$74txz0PR9URVsvsI7hbRj.P4GR2y7DF9p0ooTwCfmP3kuftMzQHFu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'abhishekbanerjee.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'abhishekbanerjee.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Abhishek Banerjee (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Shri Abhishek Banerjee (2024-2029)', 'rs_abhishekbanerjee_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'amarsingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'amarsingh.rs@mplads-demo.local', '$2b$10$nFsXgh20/NUNPQ2c/Q82qO59z88siVWYh3/.k2VMCym3ntckeGPdC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'amarsingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'amarsingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Amar Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'Shri Amar Singh (2024-2029)', 'rs_amarsingh_punjab', true
    );

    DELETE FROM auth.users WHERE email = 'amitshah.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'amitshah.rs@mplads-demo.local', '$2b$10$5hSxzw6jNNuAo9ktCUD.5e7st1rAiBLl3z6MxM0tuTWp2oLEBliUK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'amitshah.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'amitshah.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Amit Shah (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Shri Amit Shah (2024-2029)', 'rs_amitshah_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'anilfirojiya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'anilfirojiya.rs@mplads-demo.local', '$2b$10$PjloIMeiZG2tvDHoYmtv2OIBhN6JRZMH7rU9ue2yRbPns1u2qfGNC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'anilfirojiya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'anilfirojiya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Anil Firojiya (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'Shri Anil Firojiya (2024-2029)', 'rs_anilfirojiya_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'arjunrammeghwal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'arjunrammeghwal.rs@mplads-demo.local', '$2b$10$VJKv03duzdOQ1Em/JgkNSu3X./9MkdDmz4BZwYXnv1mbg.Sx16UNW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'arjunrammeghwal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'arjunrammeghwal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Arjun Ram Meghwal (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Shri Arjun Ram Meghwal (2024-2029)', 'rs_arjunrammeghwal_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'arunkumarsagar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'arunkumarsagar.rs@mplads-demo.local', '$2b$10$Pgu24dI6DmNeUd4Fcai8sOH4mLjC.rQX/5jMg5X7wg9DeWsB.TG4u', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'arunkumarsagar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'arunkumarsagar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Arun Kumar Sagar  (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Shri Arun Kumar Sagar  (2024-2029)', 'rs_arunkumarsagar_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'byraghavendra.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'byraghavendra.rs@mplads-demo.local', '$2b$10$bAOSfMDtaNh4nvlrZQT3wOG4gLLGSUpluVxips44l3oyFO/PLkny6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'byraghavendra.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'byraghavendra.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri B Y Raghavendra  (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'Shri B Y Raghavendra  (2024-2029)', 'rs_byraghavendra_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'bennybehanan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bennybehanan.rs@mplads-demo.local', '$2b$10$9XFic5gRCa/P3sNWGzgc0OoQpXTmDoPhoxGZ.Am1hCd/gEZ1i9G/2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bennybehanan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bennybehanan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Benny Behanan (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri Benny Behanan (2024-2029)', 'rs_bennybehanan_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'bhartruharimahtab.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhartruharimahtab.rs@mplads-demo.local', '$2b$10$sPN6qaRSPBeUslHYBxAg7euwmwrQ8LiSoel3yXpJHxbVK2grjOCcS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhartruharimahtab.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhartruharimahtab.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Bhartruhari Mahtab (2024-2029)', 'MP', 'Rajya Sabha', 'Odisha', NULL, 'Shri Bhartruhari Mahtab (2024-2029)', 'rs_bhartruharimahtab_odisha', true
    );

    DELETE FROM auth.users WHERE email = 'chandraprakashchoudhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandraprakashchoudhary.rs@mplads-demo.local', '$2b$10$hZ/QbFRXvZe42eKsW1SlMOajVitRaK4FguFh82W5ywEfAatKZWIsi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandraprakashchoudhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandraprakashchoudhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Chandra Prakash Choudhary (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'Shri Chandra Prakash Choudhary (2024-2029)', 'rs_chandraprakashchoudhary_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'deepakadhikari.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'deepakadhikari.rs@mplads-demo.local', '$2b$10$OI3K5NWaKLJG99v3GoWhV.CrKSIjjjuHeO71pJJY0jbWj3PnOBmNG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'deepakadhikari.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'deepakadhikari.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Deepak (Dev) Adhikari  (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Shri Deepak (Dev) Adhikari  (2024-2029)', 'rs_deepakadhikari_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'gurjeetsinghaujla.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gurjeetsinghaujla.rs@mplads-demo.local', '$2b$10$0SvwdYPGuFCFBC90yPhT3eE5gex.DjbnECjhJuZf9FE/2PnExWnu.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gurjeetsinghaujla.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gurjeetsinghaujla.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Gurjeet Singh Aujla (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'Shri Gurjeet Singh Aujla (2024-2029)', 'rs_gurjeetsinghaujla_punjab', true
    );

    DELETE FROM auth.users WHERE email = 'hanumanbeniwal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hanumanbeniwal.rs@mplads-demo.local', '$2b$10$FhO6SuB3kVultrgZsYw7K.oU8F.B8axug9DG0DNig103yir7HOtCW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hanumanbeniwal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hanumanbeniwal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Hanuman Beniwal (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Shri Hanuman Beniwal (2024-2029)', 'rs_hanumanbeniwal_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'hibieden.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hibieden.rs@mplads-demo.local', '$2b$10$DLR0CZJLeWlEvNqvIPQw0.YbC8H7UmkoWv5LUqJZ4Z7NhpIf5UB7O', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hibieden.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hibieden.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Hibi Eden (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri Hibi Eden (2024-2029)', 'rs_hibieden_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'janardansinghsigriwal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'janardansinghsigriwal.rs@mplads-demo.local', '$2b$10$SUoMYhzkNYL/RwRnbXQGQedE8VCd8yzO1vZxZmoDwmK.Dcqmfqa82', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'janardansinghsigriwal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'janardansinghsigriwal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Janardan Singh Sigriwal  (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'Shri Janardan Singh Sigriwal  (2024-2029)', 'rs_janardansinghsigriwal_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'jualoram.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jualoram.rs@mplads-demo.local', '$2b$10$OQPIU/OJydlWZ3cE2VMUVuw.NRygTJUgjX0JugAT4WPT3TJokJfrq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jualoram.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jualoram.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Jual Oram (2024-2029)', 'MP', 'Rajya Sabha', 'Odisha', NULL, 'Shri Jual Oram (2024-2029)', 'rs_jualoram_odisha', true
    );

    DELETE FROM auth.users WHERE email = 'jugalkishoresharma.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jugalkishoresharma.rs@mplads-demo.local', '$2b$10$qgrouprB4DVCAQYOioFq2uMN9cMmKKpgeOeAPezikCYqqm..myG6y', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jugalkishoresharma.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jugalkishoresharma.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Jugal Kishore Sharma (2024-2029)', 'MP', 'Rajya Sabha', 'Jammu And Kashmir', NULL, 'Shri Jugal Kishore Sharma (2024-2029)', 'rs_jugalkishoresharma_jammuandkashmir', true
    );

    DELETE FROM auth.users WHERE email = 'jyotirmaysinghmahato.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jyotirmaysinghmahato.rs@mplads-demo.local', '$2b$10$VwPK4lTu/fEH4MkNl9MEyexLBjo96z8Sj2y0l09VnSxYTh1K4x5vm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jyotirmaysinghmahato.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jyotirmaysinghmahato.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Jyotirmay Singh Mahato  (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Shri Jyotirmay Singh Mahato  (2024-2029)', 'rs_jyotirmaysinghmahato_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'kartipchidambaram.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kartipchidambaram.rs@mplads-demo.local', '$2b$10$NcDuyOPwDm8J9VIjLDqI4.UqGPGDe1Bgg.ePMzwSEvAUmNlaLcUim', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kartipchidambaram.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kartipchidambaram.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Karti P Chidambaram  (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'Shri Karti P Chidambaram  (2024-2029)', 'rs_kartipchidambaram_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'kumbakudisudhakaran.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kumbakudisudhakaran.rs@mplads-demo.local', '$2b$10$IHMx/oPPgGskzZiBAmpzcusPLeXZmC5tc1d.MqWmyeYw7ry0VsBfW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kumbakudisudhakaran.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kumbakudisudhakaran.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Kumbakudi Sudhakaran (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri Kumbakudi Sudhakaran (2024-2029)', 'rs_kumbakudisudhakaran_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'lstejasvisurya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'lstejasvisurya.rs@mplads-demo.local', '$2b$10$hjrpZ4A1dXjC5x9hjWp5rucNYQ2zLw/gz6nz1l5bbyn8WgPO895Pi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'lstejasvisurya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'lstejasvisurya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri LS Tejasvi Surya  (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'Shri LS Tejasvi Surya  (2024-2029)', 'rs_lstejasvisurya_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'mkraghavan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mkraghavan.rs@mplads-demo.local', '$2b$10$7rS6FPnFvVTdeuL1/qYVX.ayn3.zIlcISEdGb2rGMB6kbY2BZRsRW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mkraghavan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mkraghavan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri M K Raghavan (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri M K Raghavan (2024-2029)', 'rs_mkraghavan_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'narendramodi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'narendramodi.rs@mplads-demo.local', '$2b$10$jbUuZQCSPeQt/kmb/tn7DeAUIfkmBXVE0dO5tTqNRlOpY.Co0HHAy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'narendramodi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'narendramodi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Narendra Modi (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Shri Narendra Modi (2024-2029)', 'rs_narendramodi_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'nkpremachandran.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nkpremachandran.rs@mplads-demo.local', '$2b$10$BrxJy8qLg7gGWRD/jDoTheufDKgWAdzaSt3WrHPAeHdqxLZM9uaFq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nkpremachandran.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nkpremachandran.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri NK Premachandran (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri NK Premachandran (2024-2029)', 'rs_nkpremachandran_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'ppchaudhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ppchaudhary.rs@mplads-demo.local', '$2b$10$MgRAPA6EI29Wv4QnqXF5JOWMymc1j7aqaeTRNs/WHTllbd.4Vw.Oe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ppchaudhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ppchaudhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri PP Chaudhary (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Shri PP Chaudhary (2024-2029)', 'rs_ppchaudhary_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'rajmohanunnithan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'rajmohanunnithan.rs@mplads-demo.local', '$2b$10$LnXGck36Gx6EzL3z5ronS.JelU2.EQ/DzR1DvncjnW64cpKHM0h1u', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'rajmohanunnithan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'rajmohanunnithan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Rajmohan Unnithan  (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri Rajmohan Unnithan  (2024-2029)', 'rs_rajmohanunnithan_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'sarbanandasonowal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sarbanandasonowal.rs@mplads-demo.local', '$2b$10$n02PxcXVBtmw3JCGKbI/JuhEdOWIA6TjZHivdwD6fN8VQodIY6zFe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sarbanandasonowal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sarbanandasonowal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Sarbananda Sonowal (18LS) (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'Shri Sarbananda Sonowal (18LS) (2024-2029)', 'rs_sarbanandasonowal_assam', true
    );

    DELETE FROM auth.users WHERE email = 'satishkumargautam.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'satishkumargautam.rs@mplads-demo.local', '$2b$10$I.mSbplhMvlbrXrB4L1PMOKZ344RhiJExJOfL.VeT9fbsWSclAKBq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'satishkumargautam.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'satishkumargautam.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Satish Kumar Gautam  (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Shri Satish Kumar Gautam  (2024-2029)', 'rs_satishkumargautam_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'shantanuthakur.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shantanuthakur.rs@mplads-demo.local', '$2b$10$HkB9AZoshC1lVjtkpiNaI.fGGKOd4hrTcM4vAzucOFjEHsJE7ZhY6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shantanuthakur.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shantanuthakur.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Shantanu Thakur  (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Shri Shantanu Thakur  (2024-2029)', 'rs_shantanuthakur_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'sudheergupta.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sudheergupta.rs@mplads-demo.local', '$2b$10$My0Ja4jlpqw69/XrZNBYteeNCCI7NNACXP7jRYp9TVkXmmH5TxUfq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sudheergupta.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sudheergupta.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Sudheer Gupta  (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'Shri Sudheer Gupta  (2024-2029)', 'rs_sudheergupta_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'sureshkodikunnil.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sureshkodikunnil.rs@mplads-demo.local', '$2b$10$fiUKfXMNJHVVUrpD8cGe4.1RmKtSnftnkgzqMQQkeUhvLVR4Ky/RK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sureshkodikunnil.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sureshkodikunnil.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Suresh Kodikunnil (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'Shri Suresh Kodikunnil (2024-2029)', 'rs_sureshkodikunnil_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'tapirgao.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'tapirgao.rs@mplads-demo.local', '$2b$10$5z///WGqAYIWBBto0noje.0boPFMpTo7TyjfRQ16vtVnoSN59auy.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'tapirgao.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'tapirgao.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri Tapir Gao (2024-2029)', 'MP', 'Rajya Sabha', 'Arunachal Pradesh', NULL, 'Shri Tapir Gao (2024-2029)', 'rs_tapirgao_arunachalpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'vijayakumarvasanth.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'vijayakumarvasanth.rs@mplads-demo.local', '$2b$10$W2B3FjZ0W/RdIoEnZ8u/Ke68dB1bWbLhuIJGWMgaQM5HCYuDDMsV.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'vijayakumarvasanth.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'vijayakumarvasanth.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shri vijayakumar Vasanth (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'Shri vijayakumar Vasanth (2024-2029)', 'rs_vijayakumarvasanth_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'shrikanteknathshinde.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shrikanteknathshinde.rs@mplads-demo.local', '$2b$10$LdzUkQ/8ExhYOJojfznnPuNprMeGod4i4CTNAULOD/I8P7AxMCaBq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shrikanteknathshinde.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shrikanteknathshinde.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shrikant Eknath Shinde (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Shrikant Eknath Shinde (2024-2029)', 'rs_shrikanteknathshinde_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'shrimantchhudayanrajepratapsinhamaharajbhonsle.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shrimantchhudayanrajepratapsinhamaharajbhonsle.rs@mplads-demo.local', '$2b$10$rm0.5ZxUDQrOYzonzcGxc.RqoE08ycqlr.uNjz1yEOF.OFdHxzhr2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shrimantchhudayanrajepratapsinhamaharajbhonsle.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shrimantchhudayanrajepratapsinhamaharajbhonsle.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SHRIMANT CHH UDAYANRAJE PRATAPSINHAMAHARAJ BHONSLE (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'SHRIMANT CHH UDAYANRAJE PRATAPSINHAMAHARAJ BHONSLE (2024-2029)', 'rs_shrimantchhudayanrajepratapsinhamaharajbhonsle_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'shripadyessonaik.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shripadyessonaik.rs@mplads-demo.local', '$2b$10$3qo9yYufvQfwQJynVh7TTOnWmkluaQlNno0aWRE/O6VJzB/nWZ6fK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shripadyessonaik.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shripadyessonaik.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shripad Yesso Naik (2024-2029)', 'MP', 'Rajya Sabha', 'Goa', NULL, 'Shripad Yesso Naik (2024-2029)', 'rs_shripadyessonaik_goa', true
    );

    DELETE FROM auth.users WHERE email = 'shrirangappabarne.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shrirangappabarne.rs@mplads-demo.local', '$2b$10$fj4NKv6Q9bOHWVqIHXtdvOerteB.25GMA9gLjRlPyu/6JCHrJDD8K', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shrirangappabarne.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shrirangappabarne.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shrirang Appa Barne (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Shrirang Appa Barne (2024-2029)', 'rs_shrirangappabarne_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'shyamkumar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'shyamkumar.rs@mplads-demo.local', '$2b$10$P1X9HiAMtqvlHTgb6MBJpevt7AYbVj5HfsmwTONMW8ZoKt5sS2fPi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'shyamkumar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'shyamkumar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Shyamkumar (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Shyamkumar (2024-2029)', 'rs_shyamkumar_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'sivanathkesineni.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sivanathkesineni.rs@mplads-demo.local', '$2b$10$dYfD2Qp5QaUnIQ05kVfcRezrd3TgVn3QQ1l.e7Ox0Sduv6RqvPZEO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sivanathkesineni.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sivanathkesineni.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Sivanath Kesineni (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'Sivanath Kesineni (2024-2029)', 'rs_sivanathkesineni_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'sknurulislam.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sknurulislam.rs@mplads-demo.local', '$2b$10$DbY/Cq.G9IClY.SC0kgEhezK8I1.qDh3j1T/sKiZ/eD1I.6nVM8oi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sknurulislam.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sknurulislam.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SK NURUL ISLAM (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'SK NURUL ISLAM (2024-2029)', 'rs_sknurulislam_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'smitaudaywagh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'smitaudaywagh.rs@mplads-demo.local', '$2b$10$U/SLEgEnoLTEaFUtU60mVu1Op7GoWOEInO22iBKaNFJvnxPSPOSHW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'smitaudaywagh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'smitaudaywagh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP SMITA UDAY WAGH (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'SMITA UDAY WAGH (2024-2029)', 'rs_smitaudaywagh_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'anupriyapatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'anupriyapatel.rs@mplads-demo.local', '$2b$10$NJMKM9o.4O90OLhL0gv3Jeb1mCmLOVpekrTyBC57c5vJZZX/6SFUC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'anupriyapatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'anupriyapatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Smt Anupriya Patel (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Smt Anupriya Patel (2024-2029)', 'rs_anupriyapatel_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'aparajitasarangi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'aparajitasarangi.rs@mplads-demo.local', '$2b$10$y3uUxaPMULtzeqQzD.x.f.UyrrG123V2ZF8f2nnlpBPyiWhqeJlQe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'aparajitasarangi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'aparajitasarangi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Smt Aparajita Sarangi (2024-2029)', 'MP', 'Rajya Sabha', 'Odisha', NULL, 'Smt Aparajita Sarangi (2024-2029)', 'rs_aparajitasarangi_odisha', true
    );

    DELETE FROM auth.users WHERE email = 'dimpleyadav.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dimpleyadav.rs@mplads-demo.local', '$2b$10$bThhQ619Ix16S.Qwvle6xe.xjp1Ur4Lrii0gx0A3jwtpljse7zPCC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dimpleyadav.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dimpleyadav.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Smt Dimple Yadav (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Smt Dimple Yadav (2024-2029)', 'rs_dimpleyadav_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'harsimratkaurbadal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'harsimratkaurbadal.rs@mplads-demo.local', '$2b$10$PWWNMM1WmKlsQ9yaOeubl.eSIFCWLxkwcgXLO31pP9wtdsrZIZyhm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'harsimratkaurbadal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'harsimratkaurbadal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Smt Harsimrat Kaur Badal (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'Smt Harsimrat Kaur Badal (2024-2029)', 'rs_harsimratkaurbadal_punjab', true
    );
END $$;
