DO $$
DECLARE
    uid UUID;
BEGIN

    DELETE FROM auth.users WHERE email = 'malvindersinghkang.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'malvindersinghkang.rs@mplads-demo.local', '$2b$10$gW8QXBh3sLntIhp6NsDsnOO6bTgz.0Fxjde4rPjO3StXp/8gb3gNm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'malvindersinghkang.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'malvindersinghkang.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MALVINDER SINGH KANG (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'MALVINDER SINGH KANG (2024-2029)', 'rs_malvindersinghkang_punjab', true
    );

    DELETE FROM auth.users WHERE email = 'mania.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mania.rs@mplads-demo.local', '$2b$10$huphuKC6JGA1MmGYyH4StebrpQeCRGih6QhjAiJBv.XN5nQ9yDb92', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mania.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mania.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANI. A. (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'MANI. A. (2024-2029)', 'rs_mania_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'manickamtagoreb.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manickamtagoreb.rs@mplads-demo.local', '$2b$10$GEyAFRD2V9N8RdSY/sUHV.tdvLrUOwTxU/G9PB6.fDmYDhfd5LfIm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manickamtagoreb.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manickamtagoreb.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Manickam Tagore B (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'Manickam Tagore B (2024-2029)', 'rs_manickamtagoreb_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'manishjaiswal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manishjaiswal.rs@mplads-demo.local', '$2b$10$DM7dgaySC1ixII2SHNnnAeLUOO.YWUcBaKmyF6p/0GOaT0GHcQ3/a', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manishjaiswal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manishjaiswal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANISH JAISWAL (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'MANISH JAISWAL (2024-2029)', 'rs_manishjaiswal_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'manishtewari.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manishtewari.rs@mplads-demo.local', '$2b$10$Cs6MECkdA7sYRwM..P06XOGFV3v47KSYfL.LZfxYiN0VLs6JISXru', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manishtewari.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manishtewari.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANISH TEWARI (2024-2029)', 'MP', 'Rajya Sabha', 'Chandigarh', NULL, 'MANISH TEWARI (2024-2029)', 'rs_manishtewari_chandigarh', true
    );

    DELETE FROM auth.users WHERE email = 'manjusharma.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manjusharma.rs@mplads-demo.local', '$2b$10$A88kNw1GBACJzTOLTioD.ecfXotutwNKkvJ/IzXIkuk22iuUjBOUm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manjusharma.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manjusharma.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANJU SHARMA (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'MANJU SHARMA (2024-2029)', 'rs_manjusharma_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'mannalalrawat.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mannalalrawat.rs@mplads-demo.local', '$2b$10$6V3.lVQEYbD7yrJaAhcjhua5gNL96Y7KGzFRvvRP03r3MehV4swkK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mannalalrawat.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mannalalrawat.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANNA LAL RAWAT (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'MANNA LAL RAWAT (2024-2029)', 'rs_mannalalrawat_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'manoharlal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manoharlal.rs@mplads-demo.local', '$2b$10$jmOIc5CGXGOb8wNtCz.S.OPkah8JnObMb7rp1ZCVYHuIFFPdWFfoO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manoharlal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manoharlal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANOHAR LAL (2024-2029)', 'MP', 'Rajya Sabha', 'Haryana', NULL, 'MANOHAR LAL (2024-2029)', 'rs_manoharlal_haryana', true
    );

    DELETE FROM auth.users WHERE email = 'manojkumar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manojkumar.rs@mplads-demo.local', '$2b$10$qTZPMhhpOdxeXtEd3Gg8BOg1FFy4k5clb/rxCtoCwJh37V.jedZMC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manojkumar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manojkumar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANOJ KUMAR (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'MANOJ KUMAR (2024-2029)', 'rs_manojkumar_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'manojtigga.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manojtigga.rs@mplads-demo.local', '$2b$10$CLLRkRaUVfl6Q7onNec5v.rw/PYIFSmvvNvKc7xTwAV6TR765hO7i', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manojtigga.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manojtigga.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MANOJ TIGGA (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'MANOJ TIGGA (2024-2029)', 'rs_manojtigga_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'manojtiwari.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manojtiwari.rs@mplads-demo.local', '$2b$10$psiWnApnA7wzz6OS6ti3X.QVzWMTpaTsAAkoKz2Tx47ql0rO7BSTi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manojtiwari.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manojtiwari.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Manoj Tiwari (2024-2029)', 'MP', 'Rajya Sabha', 'Delhi', NULL, 'Manoj Tiwari (2024-2029)', 'rs_manojtiwari_delhi', true
    );

    DELETE FROM auth.users WHERE email = 'mansukhbhaidhanjibhaivasava.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mansukhbhaidhanjibhaivasava.rs@mplads-demo.local', '$2b$10$xK0ZLlnt7NTEE48qJEetJelonUzuQDWwYLhHvYe2iiLCEj04PVO.O', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mansukhbhaidhanjibhaivasava.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mansukhbhaidhanjibhaivasava.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Mansukhbhai Dhanjibhai Vasava (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Mansukhbhai Dhanjibhai Vasava (2024-2029)', 'rs_mansukhbhaidhanjibhaivasava_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'mianaltafahmad.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mianaltafahmad.rs@mplads-demo.local', '$2b$10$DtMksb6hbdR2hlaLhaEwRuF3sgBj3gX4cXL5ABcUpaik/HeqBnHJ6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mianaltafahmad.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mianaltafahmad.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MIAN ALTAF AHMAD (2024-2029)', 'MP', 'Rajya Sabha', 'Jammu And Kashmir', NULL, 'MIAN ALTAF AHMAD (2024-2029)', 'rs_mianaltafahmad_jammuandkashmir', true
    );

    DELETE FROM auth.users WHERE email = 'midhunreddy.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'midhunreddy.rs@mplads-demo.local', '$2b$10$6GFsG7VAYq2UsD.2i2n9KuJaiVpSByMAFiKfIcqfcyHznMJQSQiIC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'midhunreddy.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'midhunreddy.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Midhun Reddy (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'Midhun Reddy (2024-2029)', 'rs_midhunreddy_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'miteshrameshbhaibakabhaipatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'miteshrameshbhaibakabhaipatel.rs@mplads-demo.local', '$2b$10$x9LEOsmMcp1ecW8eyBtEde/IBE7VReG7ix6dbBcJCOzz4Qx1iCL1u', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'miteshrameshbhaibakabhaipatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'miteshrameshbhaibakabhaipatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Mitesh Rameshbhai Bakabhai Patel (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Mitesh Rameshbhai Bakabhai Patel (2024-2029)', 'rs_miteshrameshbhaibakabhaipatel_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'mohamedhaneefa.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mohamedhaneefa.rs@mplads-demo.local', '$2b$10$fyq0ZEOyGobZItG5MznVfegyoVqdWIn5/CSVjeZ4dzo0KPe8Ddfme', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mohamedhaneefa.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mohamedhaneefa.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Mohamed Haneefa (2024-2029)', 'MP', 'Rajya Sabha', 'Ladakh', NULL, 'Mohamed Haneefa (2024-2029)', 'rs_mohamedhaneefa_ladakh', true
    );

    DELETE FROM auth.users WHERE email = 'mohibbullah.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mohibbullah.rs@mplads-demo.local', '$2b$10$NYkFrvvvfce58zYWOnxGK.BJVpJzIEf.G0B1Idn4ewuJLQePoF4DC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mohibbullah.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mohibbullah.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MOHIBBULLAH (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'MOHIBBULLAH (2024-2029)', 'rs_mohibbullah_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'mohitepatildhairyasheelrajsinh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mohitepatildhairyasheelrajsinh.rs@mplads-demo.local', '$2b$10$JQvmaqqyryUzgFJoQg55ju/B5xiTRmf8A/Ym2ePHVookixl/LfDWG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mohitepatildhairyasheelrajsinh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mohitepatildhairyasheelrajsinh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MOHITE PATIL DHAIRYASHEEL RAJSINH (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'MOHITE PATIL DHAIRYASHEEL RAJSINH (2024-2029)', 'rs_mohitepatildhairyasheelrajsinh_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'mrgopaljeethakur.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mrgopaljeethakur.rs@mplads-demo.local', '$2b$10$EPYfuFBsIhGG07OTfumNfedrfm650u1ZBp0OlWwMEtB8JDDsu7CFi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mrgopaljeethakur.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mrgopaljeethakur.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Mr Gopal Jee Thakur (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'Mr Gopal Jee Thakur (2024-2029)', 'rs_mrgopaljeethakur_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'msmahuamoitra.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'msmahuamoitra.rs@mplads-demo.local', '$2b$10$J.FUMmZtBfJ2T59j29if8eAwLkIT9k6Hl.pMw9l1A8nsvfwgUwSLG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'msmahuamoitra.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'msmahuamoitra.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Ms Mahua Moitra (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Ms Mahua Moitra (2024-2029)', 'rs_msmahuamoitra_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'muhammedhamdullahsayeed.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'muhammedhamdullahsayeed.rs@mplads-demo.local', '$2b$10$KNaRqUoA1kIO9gEj/zsawO1A8152gbQ9Zd6wcZTNLHpvf2ycSnkVS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'muhammedhamdullahsayeed.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'muhammedhamdullahsayeed.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MUHAMMED HAMDULLAH SAYEED (2024-2029)', 'MP', 'Rajya Sabha', 'Lakshadweep', NULL, 'MUHAMMED HAMDULLAH SAYEED (2024-2029)', 'rs_muhammedhamdullahsayeed_lakshadweep', true
    );

    DELETE FROM auth.users WHERE email = 'mukeshrajput.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mukeshrajput.rs@mplads-demo.local', '$2b$10$ioDvB7eypI3qghUlgwCqPurtTNf5VePq7iORLan5dsVbNJg235QZa', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mukeshrajput.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mukeshrajput.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Mukesh Rajput (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Mukesh Rajput (2024-2029)', 'rs_mukeshrajput_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'mukeshkumarchandrakaantdalal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mukeshkumarchandrakaantdalal.rs@mplads-demo.local', '$2b$10$xSQgmxVcnnoKeAKoo4cvrurbd359pse/CA/4BShapn5u3yNFFxca6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mukeshkumarchandrakaantdalal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mukeshkumarchandrakaantdalal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MUKESHKUMAR CHANDRAKAANT DALAL (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'MUKESHKUMAR CHANDRAKAANT DALAL (2024-2029)', 'rs_mukeshkumarchandrakaantdalal_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'murarilalmeena.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'murarilalmeena.rs@mplads-demo.local', '$2b$10$.7hkqtq7Fl6gmYqsP1/ncuBwumnZ.FXhfb1CLXoBgfHjLv5JPyczC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'murarilalmeena.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'murarilalmeena.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MURARI LAL MEENA (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'MURARI LAL MEENA (2024-2029)', 'rs_murarilalmeena_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'murasolis.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'murasolis.rs@mplads-demo.local', '$2b$10$Qn1XLqfPTTVj.iABfoVV6OQwWl02nuu0Ta8D1maqA0qY5iIf1kfeq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'murasolis.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'murasolis.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MURASOLI S (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'MURASOLI S (2024-2029)', 'rs_murasolis_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'murlidharmohol.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'murlidharmohol.rs@mplads-demo.local', '$2b$10$KsZ4jHNiBz3xqjczEWuZZeXJ9mziVvijtcZXUSl5TuuZnXnXRgMY.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'murlidharmohol.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'murlidharmohol.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP MURLIDHAR MOHOL (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'MURLIDHAR MOHOL (2024-2029)', 'rs_murlidharmohol_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'nabacharanmajhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nabacharanmajhi.rs@mplads-demo.local', '$2b$10$T0P3n3uz5IAyGFi0Of4aVOKH6l6nxER6VrMjPg76iITqGQe39sf8S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nabacharanmajhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nabacharanmajhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NABA CHARAN MAJHI (2024-2029)', 'MP', 'Rajya Sabha', 'Odisha', NULL, 'NABA CHARAN MAJHI (2024-2029)', 'rs_nabacharanmajhi_odisha', true
    );

    DELETE FROM auth.users WHERE email = 'nalinsoren.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nalinsoren.rs@mplads-demo.local', '$2b$10$cvX8aJ07peoq1wLg6wurWujVWweJJH5ko06Genr70Mu6GbsdfB15i', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nalinsoren.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nalinsoren.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NALIN SOREN (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'NALIN SOREN (2024-2029)', 'rs_nalinsoren_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'narayandasahirwar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'narayandasahirwar.rs@mplads-demo.local', '$2b$10$DQywFxl1dV0kuF0JavS24OPpVRoNFye/.Yp96zOecFz//7p6dZXfS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'narayandasahirwar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'narayandasahirwar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NARAYAN DAS AHIRWAR (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'NARAYAN DAS AHIRWAR (2024-2029)', 'rs_narayandasahirwar_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'narayantaturane.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'narayantaturane.rs@mplads-demo.local', '$2b$10$degD/W5haEPdxus5I0CZcOhnKO1CbsAq69jUZUSN0mgVObsB6HsAe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'narayantaturane.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'narayantaturane.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NARAYAN TATU RANE (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'NARAYAN TATU RANE (2024-2029)', 'rs_narayantaturane_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'nareshchandrauttampatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nareshchandrauttampatel.rs@mplads-demo.local', '$2b$10$PhdJmIWPF.BK1Jg8P1EkT.byQTe.0rsfCK95gcOFCJgymG.i.Lspi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nareshchandrauttampatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nareshchandrauttampatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NARESH CHANDRA UTTAM PATEL (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'NARESH CHANDRA UTTAM PATEL (2024-2029)', 'rs_nareshchandrauttampatel_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'naveenjindal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'naveenjindal.rs@mplads-demo.local', '$2b$10$uvHya0GK5z4ASv9TukdgY.f33ItEiugvJe4War6hhLLLFwxuoQycS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'naveenjindal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'naveenjindal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NAVEEN JINDAL (2024-2029)', 'MP', 'Rajya Sabha', 'Haryana', NULL, 'NAVEEN JINDAL (2024-2029)', 'rs_naveenjindal_haryana', true
    );

    DELETE FROM auth.users WHERE email = 'neerajmaurya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'neerajmaurya.rs@mplads-demo.local', '$2b$10$mY/Cn1eNXiy0BwLXZX9hkOrJKmF7vWXUAK5xRVwfeS4aLVENftQhy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'neerajmaurya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'neerajmaurya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NEERAJ MAURYA (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'NEERAJ MAURYA (2024-2029)', 'rs_neerajmaurya_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'nileshdnyandevlanke.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nileshdnyandevlanke.rs@mplads-demo.local', '$2b$10$oACWcoqC2KKHidLFbS3mYey3JXyVt0TxF/ekSgBZUrzTYbqlbv.Y2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nileshdnyandevlanke.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nileshdnyandevlanke.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NILESH DNYANDEV LANKE (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'NILESH DNYANDEV LANKE (2024-2029)', 'rs_nileshdnyandevlanke_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'nimubenjayantibhaibambhaniya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nimubenjayantibhaibambhaniya.rs@mplads-demo.local', '$2b$10$Vgpe6NSH50IrqGhotqmK6OXgyzD4lWYYM0PDEFx3PHMcPZJGCp5aW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nimubenjayantibhaibambhaniya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nimubenjayantibhaibambhaniya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP NIMUBEN JAYANTIBHAI BAMBHANIYA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'NIMUBEN JAYANTIBHAI BAMBHANIYA (2024-2029)', 'rs_nimubenjayantibhaibambhaniya_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'nishikantdubey.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nishikantdubey.rs@mplads-demo.local', '$2b$10$kbujSQ24qPDJ9gT/E3tIOe7eO/KyxQzxxshY7JIoSyrD4KJB.97Ia', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nishikantdubey.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nishikantdubey.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Nishikant Dubey (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'Nishikant Dubey (2024-2029)', 'rs_nishikantdubey_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'nitinjairamgadkari.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nitinjairamgadkari.rs@mplads-demo.local', '$2b$10$MJ0cbyiYMkwgdzl7pHdeDeesw745t/YxvbdC2g0ZHLU5LKA6WMmlS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nitinjairamgadkari.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nitinjairamgadkari.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Nitin Jairam Gadkari (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Nitin Jairam Gadkari (2024-2029)', 'rs_nitinjairamgadkari_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'nityanandrai.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nityanandrai.rs@mplads-demo.local', '$2b$10$a.74GqhDgO3vascf.vunHu.8dYkoy1ck4I3pF/YK0QWHAaUfAHf0a', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nityanandrai.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nityanandrai.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Nityanand Rai (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'Nityanand Rai (2024-2029)', 'rs_nityanandrai_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'ombirla.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ombirla.rs@mplads-demo.local', '$2b$10$Gs1MbXOYWRKo.BpT27UoPeb6o9GQeXw5HlyT73.6cxVHov/6hDwt2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ombirla.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ombirla.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Om Birla (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Om Birla (2024-2029)', 'rs_ombirla_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'omprakashbhupalsinhaliaspawanrajenimbalkar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'omprakashbhupalsinhaliaspawanrajenimbalkar.rs@mplads-demo.local', '$2b$10$BEJDxsokEJKt3uSfGIu0LeL.N5IqiCm7N6YmHkWeMavPayDXuvM/K', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'omprakashbhupalsinhaliaspawanrajenimbalkar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'omprakashbhupalsinhaliaspawanrajenimbalkar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Omprakash Bhupalsinh Alias Pawan Rajenimbalkar (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Omprakash Bhupalsinh Alias Pawan Rajenimbalkar (2024-2029)', 'rs_omprakashbhupalsinhaliaspawanrajenimbalkar_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'pcmohan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'pcmohan.rs@mplads-demo.local', '$2b$10$Nvfdmu/zFL6SR2SU4VsBFeTNYmWyEEaOSr717cn43O.Slza57N6HK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'pcmohan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'pcmohan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP P C Mohan (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'P C Mohan (2024-2029)', 'rs_pcmohan_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'pankajchowdhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'pankajchowdhary.rs@mplads-demo.local', '$2b$10$brf5eZ2WN1fttsUty8r6oejt3AnvZLy5kt9B9P/CpUWb3i2NXAd2q', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'pankajchowdhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'pankajchowdhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Pankaj Chowdhary (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Pankaj Chowdhary (2024-2029)', 'rs_pankajchowdhary_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'parimalsuklabaidya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'parimalsuklabaidya.rs@mplads-demo.local', '$2b$10$SK96i/0kt57TuCv3taCXxuJf4nT5An5TJ8nMQ8XD36HgzzJ5/MsBq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'parimalsuklabaidya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'parimalsuklabaidya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PARIMAL SUKLABAIDYA (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'PARIMAL SUKLABAIDYA (2024-2029)', 'rs_parimalsuklabaidya_assam', true
    );

    DELETE FROM auth.users WHERE email = 'parshottambhairupala.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'parshottambhairupala.rs@mplads-demo.local', '$2b$10$XJyTD5j/g.3HjA.hyj3Esu1pgAWHcjN.1UgY5Q.49IPqaA/r4w36S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'parshottambhairupala.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'parshottambhairupala.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PARSHOTTAMBHAI RUPALA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'PARSHOTTAMBHAI RUPALA (2024-2029)', 'rs_parshottambhairupala_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'parthabhowmick.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'parthabhowmick.rs@mplads-demo.local', '$2b$10$yzrZI0b4uoKONcr7t/rAfuKY3XJciaqb2vdTItwZg4gTkiT8g2zCe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'parthabhowmick.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'parthabhowmick.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PARTHA BHOWMICK (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'PARTHA BHOWMICK (2024-2029)', 'rs_parthabhowmick_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'parvatagoudachandanagoudagaddigoudar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'parvatagoudachandanagoudagaddigoudar.rs@mplads-demo.local', '$2b$10$926YRXLwy7Xl542YlywTwOGYzOdQpD1s6X/Id9BO9jTbqTOHDN/Pq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'parvatagoudachandanagoudagaddigoudar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'parvatagoudachandanagoudagaddigoudar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Parvatagouda Chandanagouda Gaddigoudar (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'Parvatagouda Chandanagouda Gaddigoudar (2024-2029)', 'rs_parvatagoudachandanagoudagaddigoudar_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'patelumeshbhaibabubhai.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'patelumeshbhaibabubhai.rs@mplads-demo.local', '$2b$10$kFavIqnMTuwPm9I7EBRCxOpEM4.fCDA1DyJDsh.lfnXvjUiEZxtVy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'patelumeshbhaibabubhai.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'patelumeshbhaibabubhai.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PATEL UMESHBHAI BABUBHAI (2024-2029)', 'MP', 'Rajya Sabha', 'The Dadra And Nagar Haveli And Daman And Diu', NULL, 'PATEL UMESHBHAI BABUBHAI (2024-2029)', 'rs_patelumeshbhaibabubhai_thedadraandnagarhavelianddamananddiu', true
    );

    DELETE FROM auth.users WHERE email = 'pathanyusuf.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'pathanyusuf.rs@mplads-demo.local', '$2b$10$9HhNaiod4OYxtQtkGLG2gOZgyy5mOE0zABLuhNbJAKcLIks7ru1a2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'pathanyusuf.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'pathanyusuf.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PATHAN YUSUF (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'PATHAN YUSUF (2024-2029)', 'rs_pathanyusuf_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'phanibhusanchoudhury.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'phanibhusanchoudhury.rs@mplads-demo.local', '$2b$10$DxjixPRXs98loIxChUgFMeiyq6CQ9kIx7ZKgjejLHHUDUw0B8soYC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'phanibhusanchoudhury.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'phanibhusanchoudhury.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP PHANI BHUSAN CHOUDHURY (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'PHANI BHUSAN CHOUDHURY (2024-2029)', 'rs_phanibhusanchoudhury_assam', true
    );

    DELETE FROM auth.users WHERE email = 'piyushvedprakashgoyal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'piyushvedprakashgoyal.rs@mplads-demo.local', '$2b$10$jWph/YsHpvArsNiSVyST9.zT2SDZNxU9El2PLoSQ0uKwaReCgde.y', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'piyushvedprakashgoyal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'piyushvedprakashgoyal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Piyush Vedprakash Goyal (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'Piyush Vedprakash Goyal (2024-2029)', 'rs_piyushvedprakashgoyal_maharashtra', true
    );
END $$;
