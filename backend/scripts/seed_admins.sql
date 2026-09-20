-- ==============================================================================
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
