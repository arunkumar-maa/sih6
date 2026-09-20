-- ==============================================================================
-- MPLADS SENTINEL — SEED STATE NODAL OFFICERS FOR ALL REAL DATASET STATES
-- Generated dynamically from distinct states in lok_sabha_projects & rajya_sabha_projects
-- Total States: 36
-- ==============================================================================

DO $$
DECLARE
    uid UUID;
    enc_pw TEXT;
BEGIN

    -- State Nodal Officer: Andaman And Nicobar Islands
    DELETE FROM auth.users WHERE email = 'andamanandnicobarislands.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Andaman And Nicobar Islands';

    uid := gen_random_uuid();
    enc_pw := crypt('AndamanAndNicobarIslands@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'andamanandnicobarislands.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'andamanandnicobarislands.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'andamanandnicobarislands.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Andaman And Nicobar Islands', 'STATE_NODAL_OFFICER', NULL, 'Andaman And Nicobar Islands', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Andhra Pradesh
    DELETE FROM auth.users WHERE email = 'andhrapradesh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Andhra Pradesh';

    uid := gen_random_uuid();
    enc_pw := crypt('AndhraPradesh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'andhrapradesh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'andhrapradesh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'andhrapradesh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Andhra Pradesh', 'STATE_NODAL_OFFICER', NULL, 'Andhra Pradesh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Arunachal Pradesh
    DELETE FROM auth.users WHERE email = 'arunachalpradesh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Arunachal Pradesh';

    uid := gen_random_uuid();
    enc_pw := crypt('ArunachalPradesh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'arunachalpradesh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'arunachalpradesh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'arunachalpradesh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Arunachal Pradesh', 'STATE_NODAL_OFFICER', NULL, 'Arunachal Pradesh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Assam
    DELETE FROM auth.users WHERE email = 'assam.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Assam';

    uid := gen_random_uuid();
    enc_pw := crypt('Assam@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'assam.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'assam.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'assam.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Assam', 'STATE_NODAL_OFFICER', NULL, 'Assam', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Bihar
    DELETE FROM auth.users WHERE email = 'bihar.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Bihar';

    uid := gen_random_uuid();
    enc_pw := crypt('Bihar@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bihar.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bihar.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bihar.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Bihar', 'STATE_NODAL_OFFICER', NULL, 'Bihar', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Chandigarh
    DELETE FROM auth.users WHERE email = 'chandigarh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Chandigarh';

    uid := gen_random_uuid();
    enc_pw := crypt('Chandigarh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandigarh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandigarh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandigarh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Chandigarh', 'STATE_NODAL_OFFICER', NULL, 'Chandigarh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Chhattisgarh
    DELETE FROM auth.users WHERE email = 'chhattisgarh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Chhattisgarh';

    uid := gen_random_uuid();
    enc_pw := crypt('Chhattisgarh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chhattisgarh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chhattisgarh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chhattisgarh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Chhattisgarh', 'STATE_NODAL_OFFICER', NULL, 'Chhattisgarh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Delhi
    DELETE FROM auth.users WHERE email = 'delhi.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Delhi';

    uid := gen_random_uuid();
    enc_pw := crypt('Delhi@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'delhi.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'delhi.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'delhi.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Delhi', 'STATE_NODAL_OFFICER', NULL, 'Delhi', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Goa
    DELETE FROM auth.users WHERE email = 'goa.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Goa';

    uid := gen_random_uuid();
    enc_pw := crypt('Goa@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'goa.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'goa.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'goa.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Goa', 'STATE_NODAL_OFFICER', NULL, 'Goa', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Gujarat
    DELETE FROM auth.users WHERE email = 'gujarat.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Gujarat';

    uid := gen_random_uuid();
    enc_pw := crypt('Gujarat@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gujarat.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gujarat.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gujarat.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Gujarat', 'STATE_NODAL_OFFICER', NULL, 'Gujarat', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Haryana
    DELETE FROM auth.users WHERE email = 'haryana.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Haryana';

    uid := gen_random_uuid();
    enc_pw := crypt('Haryana@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'haryana.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'haryana.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'haryana.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Haryana', 'STATE_NODAL_OFFICER', NULL, 'Haryana', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Himachal Pradesh
    DELETE FROM auth.users WHERE email = 'himachalpradesh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Himachal Pradesh';

    uid := gen_random_uuid();
    enc_pw := crypt('HimachalPradesh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'himachalpradesh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'himachalpradesh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'himachalpradesh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Himachal Pradesh', 'STATE_NODAL_OFFICER', NULL, 'Himachal Pradesh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Jammu And Kashmir
    DELETE FROM auth.users WHERE email = 'jammuandkashmir.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Jammu And Kashmir';

    uid := gen_random_uuid();
    enc_pw := crypt('JammuAndKashmir@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jammuandkashmir.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jammuandkashmir.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jammuandkashmir.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Jammu And Kashmir', 'STATE_NODAL_OFFICER', NULL, 'Jammu And Kashmir', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Jharkhand
    DELETE FROM auth.users WHERE email = 'jharkhand.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Jharkhand';

    uid := gen_random_uuid();
    enc_pw := crypt('Jharkhand@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jharkhand.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jharkhand.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jharkhand.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Jharkhand', 'STATE_NODAL_OFFICER', NULL, 'Jharkhand', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Karnataka
    DELETE FROM auth.users WHERE email = 'karnataka.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Karnataka';

    uid := gen_random_uuid();
    enc_pw := crypt('Karnataka@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'karnataka.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'karnataka.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'karnataka.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Karnataka', 'STATE_NODAL_OFFICER', NULL, 'Karnataka', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Kerala
    DELETE FROM auth.users WHERE email = 'kerala.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Kerala';

    uid := gen_random_uuid();
    enc_pw := crypt('Kerala@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kerala.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kerala.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kerala.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Kerala', 'STATE_NODAL_OFFICER', NULL, 'Kerala', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Ladakh
    DELETE FROM auth.users WHERE email = 'ladakh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Ladakh';

    uid := gen_random_uuid();
    enc_pw := crypt('Ladakh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ladakh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ladakh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ladakh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Ladakh', 'STATE_NODAL_OFFICER', NULL, 'Ladakh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Lakshadweep
    DELETE FROM auth.users WHERE email = 'lakshadweep.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Lakshadweep';

    uid := gen_random_uuid();
    enc_pw := crypt('Lakshadweep@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'lakshadweep.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'lakshadweep.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'lakshadweep.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Lakshadweep', 'STATE_NODAL_OFFICER', NULL, 'Lakshadweep', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Madhya Pradesh
    DELETE FROM auth.users WHERE email = 'madhyapradesh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Madhya Pradesh';

    uid := gen_random_uuid();
    enc_pw := crypt('MadhyaPradesh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'madhyapradesh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'madhyapradesh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'madhyapradesh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Madhya Pradesh', 'STATE_NODAL_OFFICER', NULL, 'Madhya Pradesh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Maharashtra
    DELETE FROM auth.users WHERE email = 'maharashtra.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Maharashtra';

    uid := gen_random_uuid();
    enc_pw := crypt('Maharashtra@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'maharashtra.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'maharashtra.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'maharashtra.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Maharashtra', 'STATE_NODAL_OFFICER', NULL, 'Maharashtra', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Manipur
    DELETE FROM auth.users WHERE email = 'manipur.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Manipur';

    uid := gen_random_uuid();
    enc_pw := crypt('Manipur@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'manipur.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'manipur.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'manipur.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Manipur', 'STATE_NODAL_OFFICER', NULL, 'Manipur', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Meghalaya
    DELETE FROM auth.users WHERE email = 'meghalaya.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Meghalaya';

    uid := gen_random_uuid();
    enc_pw := crypt('Meghalaya@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'meghalaya.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'meghalaya.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'meghalaya.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Meghalaya', 'STATE_NODAL_OFFICER', NULL, 'Meghalaya', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Mizoram
    DELETE FROM auth.users WHERE email = 'mizoram.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Mizoram';

    uid := gen_random_uuid();
    enc_pw := crypt('Mizoram@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'mizoram.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'mizoram.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'mizoram.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Mizoram', 'STATE_NODAL_OFFICER', NULL, 'Mizoram', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Nagaland
    DELETE FROM auth.users WHERE email = 'nagaland.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Nagaland';

    uid := gen_random_uuid();
    enc_pw := crypt('Nagaland@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'nagaland.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'nagaland.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'nagaland.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Nagaland', 'STATE_NODAL_OFFICER', NULL, 'Nagaland', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Odisha
    DELETE FROM auth.users WHERE email = 'odisha.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Odisha';

    uid := gen_random_uuid();
    enc_pw := crypt('Odisha@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'odisha.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'odisha.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'odisha.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Odisha', 'STATE_NODAL_OFFICER', NULL, 'Odisha', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Puducherry
    DELETE FROM auth.users WHERE email = 'puducherry.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Puducherry';

    uid := gen_random_uuid();
    enc_pw := crypt('Puducherry@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'puducherry.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'puducherry.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'puducherry.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Puducherry', 'STATE_NODAL_OFFICER', NULL, 'Puducherry', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Punjab
    DELETE FROM auth.users WHERE email = 'punjab.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Punjab';

    uid := gen_random_uuid();
    enc_pw := crypt('Punjab@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'punjab.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'punjab.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'punjab.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Punjab', 'STATE_NODAL_OFFICER', NULL, 'Punjab', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Rajasthan
    DELETE FROM auth.users WHERE email = 'rajasthan.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Rajasthan';

    uid := gen_random_uuid();
    enc_pw := crypt('Rajasthan@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'rajasthan.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'rajasthan.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'rajasthan.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Rajasthan', 'STATE_NODAL_OFFICER', NULL, 'Rajasthan', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Sikkim
    DELETE FROM auth.users WHERE email = 'sikkim.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Sikkim';

    uid := gen_random_uuid();
    enc_pw := crypt('Sikkim@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sikkim.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sikkim.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sikkim.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Sikkim', 'STATE_NODAL_OFFICER', NULL, 'Sikkim', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Tamil Nadu
    DELETE FROM auth.users WHERE email = 'tamilnadu.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Tamil Nadu';

    uid := gen_random_uuid();
    enc_pw := crypt('TamilNadu@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'tamilnadu.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'tamilnadu.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'tamilnadu.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Tamil Nadu', 'STATE_NODAL_OFFICER', NULL, 'Tamil Nadu', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Telangana
    DELETE FROM auth.users WHERE email = 'telangana.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Telangana';

    uid := gen_random_uuid();
    enc_pw := crypt('Telangana@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'telangana.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'telangana.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'telangana.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Telangana', 'STATE_NODAL_OFFICER', NULL, 'Telangana', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: The Dadra And Nagar Haveli And Daman And Diu
    DELETE FROM auth.users WHERE email = 'dadranagarhaveli.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'The Dadra And Nagar Haveli And Daman And Diu';

    uid := gen_random_uuid();
    enc_pw := crypt('DadraNagarHaveli@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dadranagarhaveli.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dadranagarhaveli.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dadranagarhaveli.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - The Dadra And Nagar Haveli And Daman And Diu', 'STATE_NODAL_OFFICER', NULL, 'The Dadra And Nagar Haveli And Daman And Diu', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Tripura
    DELETE FROM auth.users WHERE email = 'tripura.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Tripura';

    uid := gen_random_uuid();
    enc_pw := crypt('Tripura@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'tripura.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'tripura.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'tripura.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Tripura', 'STATE_NODAL_OFFICER', NULL, 'Tripura', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Uttar Pradesh
    DELETE FROM auth.users WHERE email = 'uttarpradesh.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Uttar Pradesh';

    uid := gen_random_uuid();
    enc_pw := crypt('UttarPradesh@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'uttarpradesh.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'uttarpradesh.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'uttarpradesh.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Uttar Pradesh', 'STATE_NODAL_OFFICER', NULL, 'Uttar Pradesh', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: Uttarakhand
    DELETE FROM auth.users WHERE email = 'uttarakhand.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'Uttarakhand';

    uid := gen_random_uuid();
    enc_pw := crypt('Uttarakhand@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'uttarakhand.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'uttarakhand.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'uttarakhand.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - Uttarakhand', 'STATE_NODAL_OFFICER', NULL, 'Uttarakhand', NULL, NULL, NULL, NULL, true, now(), now()
    );

    -- State Nodal Officer: West Bengal
    DELETE FROM auth.users WHERE email = 'westbengal.nodal@mplads-demo.local';
    DELETE FROM public.profiles WHERE role = 'STATE_NODAL_OFFICER' AND state = 'West Bengal';

    uid := gen_random_uuid();
    enc_pw := crypt('WestBengal@123', gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'westbengal.nodal@mplads-demo.local', enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'westbengal.nodal@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'westbengal.nodal@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, district, constituency, mp_name, agency_name, is_active, created_at, updated_at
    ) VALUES (
        uid, 'State Nodal Officer - West Bengal', 'STATE_NODAL_OFFICER', NULL, 'West Bengal', NULL, NULL, NULL, NULL, true, now(), now()
    );

END $$;
