DO $$
DECLARE
    uid UUID;
BEGIN

    DELETE FROM auth.users WHERE email = 'bansuriswaraj.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bansuriswaraj.rs@mplads-demo.local', '$2b$10$ekHClJ2dcc94WcfznMXL9.Bj9qYTXfEXkamzaU9AsQWz14PHEZt3C', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bansuriswaraj.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bansuriswaraj.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bansuri Swaraj (2024-2029)', 'MP', 'Rajya Sabha', 'Delhi', NULL, 'Bansuri Swaraj (2024-2029)', 'rs_bansuriswaraj_delhi', true
    );

    DELETE FROM auth.users WHERE email = 'bapihaldar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bapihaldar.rs@mplads-demo.local', '$2b$10$.YmvQJJ1zMWwz123VPEvfOyD.tJOVN3DgCNgAq/2LxMSGoOzRKlJe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bapihaldar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bapihaldar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BAPI HALDAR (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'BAPI HALDAR (2024-2029)', 'rs_bapihaldar_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'basavarajbommai.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'basavarajbommai.rs@mplads-demo.local', '$2b$10$GvRLWWe14y.uvSxSB389geAQpcv7p3eX4OCqr2XqAxLeID7jQEmiO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'basavarajbommai.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'basavarajbommai.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BASAVARAJ BOMMAI (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'BASAVARAJ BOMMAI (2024-2029)', 'rs_basavarajbommai_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'bastipatinagarajupanchalingala.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bastipatinagarajupanchalingala.rs@mplads-demo.local', '$2b$10$5Eq5rBKRW.swg3dwiT7c5.JGBBCdiriG73COstqZW./dixrz3ec9C', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bastipatinagarajupanchalingala.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bastipatinagarajupanchalingala.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BASTIPATI NAGARAJU PANCHALINGALA (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'BASTIPATI NAGARAJU PANCHALINGALA (2024-2029)', 'rs_bastipatinagarajupanchalingala_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'bhagirathchaudhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhagirathchaudhary.rs@mplads-demo.local', '$2b$10$kGHroiUr3UEosQNGS4rPZe7XWiNhx4klvNKGt.dEBXt3teYKtH4.6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhagirathchaudhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhagirathchaudhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bhagirath Chaudhary (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Bhagirath Chaudhary (2024-2029)', 'rs_bhagirathchaudhary_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'bhajanlaljatav.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhajanlaljatav.rs@mplads-demo.local', '$2b$10$/q2r9T8Zvmv6W0St0vgFfe0lUMaf3K6638dIO0UQNPolS0Xtp/qpK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhajanlaljatav.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhajanlaljatav.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHAJAN LAL JATAV (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'BHAJAN LAL JATAV (2024-2029)', 'rs_bhajanlaljatav_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'bharatsinghkushwah.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bharatsinghkushwah.rs@mplads-demo.local', '$2b$10$5KtDy4am4gsYzZoqQBkLUOaCkuPB/noihQVLXZHUjb0Zk.MVIOWnG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bharatsinghkushwah.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bharatsinghkushwah.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHARAT SINGH KUSHWAH (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'BHARAT SINGH KUSHWAH (2024-2029)', 'rs_bharatsinghkushwah_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'bharatbhaimanubhaisutariya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bharatbhaimanubhaisutariya.rs@mplads-demo.local', '$2b$10$zrVhtqc89bwsY/TcVnOvJeUXpe7zu5D1NXezdLNnByCKzn2eG20XK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bharatbhaimanubhaisutariya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bharatbhaimanubhaisutariya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHARATBHAI MANUBHAI SUTARIYA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'BHARATBHAI MANUBHAI SUTARIYA (2024-2029)', 'rs_bharatbhaimanubhaisutariya_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'bharatsinhjishankarjidabhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bharatsinhjishankarjidabhi.rs@mplads-demo.local', '$2b$10$iTxKc74aAhq5ZAfNTALC7.qGciaKLk5qQ6kNJShNEfZj30JnOk7f6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bharatsinhjishankarjidabhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bharatsinhjishankarjidabhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bharatsinhji Shankarji Dabhi (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Bharatsinhji Shankarji Dabhi (2024-2029)', 'rs_bharatsinhjishankarjidabhi_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'bhartipardhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhartipardhi.rs@mplads-demo.local', '$2b$10$2DekX0bjLwBxylwDslo8jecv7287XA6fQuUZIA.HaSkOufHPMlWKS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhartipardhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhartipardhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHARTI PARDHI (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'BHARTI PARDHI (2024-2029)', 'rs_bhartipardhi_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'bhaskarmurlidharbhagare.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhaskarmurlidharbhagare.rs@mplads-demo.local', '$2b$10$P/d8OaIYNrjdda9ztbbXwui5UXRd4Ikqpqo/Nijwq.jWjIijwScXq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhaskarmurlidharbhagare.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhaskarmurlidharbhagare.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHASKAR MURLIDHAR BHAGARE (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'BHASKAR MURLIDHAR BHAGARE (2024-2029)', 'rs_bhaskarmurlidharbhagare_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'bhausahebrajaramwakchaure.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhausahebrajaramwakchaure.rs@mplads-demo.local', '$2b$10$uDFFy7aTvpAHbdg6m/pda.N2beGqxkFzyAzsWrnl5VFvPRwOBDQIO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhausahebrajaramwakchaure.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhausahebrajaramwakchaure.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHAUSAHEB RAJARAM WAKCHAURE (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'BHAUSAHEB RAJARAM WAKCHAURE (2024-2029)', 'rs_bhausahebrajaramwakchaure_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'bhojrajnag.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhojrajnag.rs@mplads-demo.local', '$2b$10$aqp0MRO9pNSHKLJ13eiwwuw.AbOAtihGtIkfpxZ.4PGNyjAQnX/iK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhojrajnag.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhojrajnag.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHOJRAJ NAG (2024-2029)', 'MP', 'Rajya Sabha', 'Chhattisgarh', NULL, 'BHOJRAJ NAG (2024-2029)', 'rs_bhojrajnag_chhattisgarh', true
    );

    DELETE FROM auth.users WHERE email = 'bholasingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bholasingh.rs@mplads-demo.local', '$2b$10$Cc9Wb4nUsuTXMSyUEua3IeJmjUCEsJ3cd2RRPKrpuncWRFteJlL9G', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bholasingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bholasingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bhola Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Bhola Singh (2024-2029)', 'rs_bholasingh_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'bhumaresandipanraoasaram.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhumaresandipanraoasaram.rs@mplads-demo.local', '$2b$10$6Uv6tLhz8Yw5V9YyzuL0mueYHnNeMtlHupEzW3BC/0nkky2ET/f5S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhumaresandipanraoasaram.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhumaresandipanraoasaram.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHUMARE SANDIPANRAO ASARAM (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'BHUMARE SANDIPANRAO ASARAM (2024-2029)', 'rs_bhumaresandipanraoasaram_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'bhupathirajusrinivasavarma.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhupathirajusrinivasavarma.rs@mplads-demo.local', '$2b$10$VzQEq/C6vcRuS3mLHTtTxOMop6fb86Yv4iBXvHY.uQGEbW2x.zmCS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhupathirajusrinivasavarma.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhupathirajusrinivasavarma.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bhupathiraju Srinivasa varma (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'Bhupathiraju Srinivasa varma (2024-2029)', 'rs_bhupathirajusrinivasavarma_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'bhupenderyadav.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bhupenderyadav.rs@mplads-demo.local', '$2b$10$AA0DdDHhHc9Y0soXuEo0Zuxgoz7odzoyDsIOwnspFV.7rf4E264bC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bhupenderyadav.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bhupenderyadav.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BHUPENDER YADAV (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'BHUPENDER YADAV (2024-2029)', 'rs_bhupenderyadav_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'bibhuprasadtarai.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bibhuprasadtarai.rs@mplads-demo.local', '$2b$10$0ERqgbYeTN3SeMrE84DpgO9E/CK4ALvyrIV3v9C8r.9iiI0J1O87S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bibhuprasadtarai.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bibhuprasadtarai.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BIBHU PRASAD TARAI (2024-2029)', 'MP', 'Rajya Sabha', 'Odisha', NULL, 'BIBHU PRASAD TARAI (2024-2029)', 'rs_bibhuprasadtarai_odisha', true
    );

    DELETE FROM auth.users WHERE email = 'bidyutbaranmahato.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bidyutbaranmahato.rs@mplads-demo.local', '$2b$10$/Sg7vkhKQ95MLTGyjdsebeLac/Wuzc5sWpamkvPzEWm.vfY7TezmG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bidyutbaranmahato.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bidyutbaranmahato.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Bidyut Baran Mahato (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'Bidyut Baran Mahato (2024-2029)', 'rs_bidyutbaranmahato_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'bijulikalitamedhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bijulikalitamedhi.rs@mplads-demo.local', '$2b$10$cx3l1gahBmRYhkuECSBI3utsu9jaI5BucCNWfl5/VDoKJqFb6Sur6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bijulikalitamedhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bijulikalitamedhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BIJULI KALITA MEDHI (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'BIJULI KALITA MEDHI (2024-2029)', 'rs_bijulikalitamedhi_assam', true
    );

    DELETE FROM auth.users WHERE email = 'biplabkumardeb.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'biplabkumardeb.rs@mplads-demo.local', '$2b$10$wfsvmTgiHtwDXnJ3Lm3RKusU7/jvGrZg0ZexfrsEef3Dj9s5ur4za', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'biplabkumardeb.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'biplabkumardeb.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BIPLAB KUMAR DEB (2024-2029)', 'MP', 'Rajya Sabha', 'Tripura', NULL, 'BIPLAB KUMAR DEB (2024-2029)', 'rs_biplabkumardeb_tripura', true
    );

    DELETE FROM auth.users WHERE email = 'bishnupadaray.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'bishnupadaray.rs@mplads-demo.local', '$2b$10$IxLijYTox0Mgoc4CpbSKWu57FA.y7MZsxwecrNVc689ALq.jjq7K6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'bishnupadaray.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'bishnupadaray.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BISHNU PADA RAY (2024-2029)', 'MP', 'Rajya Sabha', 'Andaman And Nicobar Islands', NULL, 'BISHNU PADA RAY (2024-2029)', 'rs_bishnupadaray_andamanandnicobarislands', true
    );

    DELETE FROM auth.users WHERE email = 'brijendrasinghola.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'brijendrasinghola.rs@mplads-demo.local', '$2b$10$MH4nrM5hweaS/hTNNtWTDOMxxdM253AkiRLkdPWbF7bJkNiRGU6/q', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'brijendrasinghola.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'brijendrasinghola.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BRIJENDRA SINGH OLA (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'BRIJENDRA SINGH OLA (2024-2029)', 'rs_brijendrasinghola_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'brijmohanagrawal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'brijmohanagrawal.rs@mplads-demo.local', '$2b$10$CxzwEFZpTbuXzFNS/57jHO8qp93UwVTg2eqgkICg2/VojHDdaGx.2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'brijmohanagrawal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'brijmohanagrawal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BRIJMOHAN AGRAWAL (2024-2029)', 'MP', 'Rajya Sabha', 'Chhattisgarh', NULL, 'BRIJMOHAN AGRAWAL (2024-2029)', 'rs_brijmohanagrawal_chhattisgarh', true
    );

    DELETE FROM auth.users WHERE email = 'buntyviveksahu.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'buntyviveksahu.rs@mplads-demo.local', '$2b$10$7DtH.JDDqac4NfwTBB9sD.8mQbKcM684rB11c84i2Lk5TqHootsny', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'buntyviveksahu.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'buntyviveksahu.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP BUNTY VIVEK SAHU (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'BUNTY VIVEK SAHU (2024-2029)', 'rs_buntyviveksahu_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'crpatil.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'crpatil.rs@mplads-demo.local', '$2b$10$H.OR136e3ZYJ85Q2NL6vqO7iV3lcKIKokwqmJ706V0Yv7bIeuWHp2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'crpatil.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'crpatil.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP C R Patil (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'C R Patil (2024-2029)', 'rs_crpatil_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'cmramesh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'cmramesh.rs@mplads-demo.local', '$2b$10$xwe0BZJv1wg/HU5N0E4Sj.MU1mfrcTQ4FFQbl1auvNjbO9J8ytZVC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'cmramesh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'cmramesh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP C.M.RAMESH (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'C.M.RAMESH (2024-2029)', 'rs_cmramesh_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'captainbrijeshchowta.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'captainbrijeshchowta.rs@mplads-demo.local', '$2b$10$D3T5yW9Gxzehajhs/pPatuENdqB0ZZWo.Iar4nHLlTlKpEEqrotB6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'captainbrijeshchowta.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'captainbrijeshchowta.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CAPTAIN BRIJESH CHOWTA (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'CAPTAIN BRIJESH CHOWTA (2024-2029)', 'rs_captainbrijeshchowta_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'captainviriatofernandes.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'captainviriatofernandes.rs@mplads-demo.local', '$2b$10$544Yb8iA2EGnxTaVrerF6ORwSnonP96009kh5pKO4OrajWrqRZjiS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'captainviriatofernandes.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'captainviriatofernandes.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CAPTAIN VIRIATO FERNANDES (2024-2029)', 'MP', 'Rajya Sabha', 'Goa', NULL, 'CAPTAIN VIRIATO FERNANDES (2024-2029)', 'rs_captainviriatofernandes_goa', true
    );

    DELETE FROM auth.users WHERE email = 'chamalakirankumarreddy.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chamalakirankumarreddy.rs@mplads-demo.local', '$2b$10$EERNi99uSW.OUETGUmvI7OUF8dbSIDNPwcTkniMu0p8iUBU7SKCGq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chamalakirankumarreddy.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chamalakirankumarreddy.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHAMALA KIRAN KUMAR REDDY (2024-2029)', 'MP', 'Rajya Sabha', 'Telangana', NULL, 'CHAMALA KIRAN KUMAR REDDY (2024-2029)', 'rs_chamalakirankumarreddy_telangana', true
    );

    DELETE FROM auth.users WHERE email = 'chandanchauhan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandanchauhan.rs@mplads-demo.local', '$2b$10$LW.HZkrgUE3ZML9OPZ/P6OhfO0xLWj/hyrzbnJmHaqX/bYgPfqsO.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandanchauhan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandanchauhan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHANDAN CHAUHAN (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'CHANDAN CHAUHAN (2024-2029)', 'rs_chandanchauhan_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'chandraprakashjoshi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandraprakashjoshi.rs@mplads-demo.local', '$2b$10$zc.jbIcXpjZwPbl7DQiViuCk6Q.fxxL7HdsCuyabhgAaab4LK1et.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandraprakashjoshi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandraprakashjoshi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Chandra Prakash Joshi (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Chandra Prakash Joshi (2024-2029)', 'rs_chandraprakashjoshi_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'chandrashekhar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandrashekhar.rs@mplads-demo.local', '$2b$10$c/GkehFGKJHKJ2tzDAII1.xZEOY83CoTA8.5BMuwIAhbj3/nZ6iqK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandrashekhar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandrashekhar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHANDRA SHEKHAR (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'CHANDRA SHEKHAR (2024-2029)', 'rs_chandrashekhar_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'chandubhaichhaganbhaishihora.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chandubhaichhaganbhaishihora.rs@mplads-demo.local', '$2b$10$PlyREy34skPdqFGotrMB..k2YO5XzRbNnBkHLWEc4e04DF8HANOwm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chandubhaichhaganbhaishihora.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chandubhaichhaganbhaishihora.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHANDUBHAI CHHAGANBHAI SHIHORA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'CHANDUBHAI CHHAGANBHAI SHIHORA (2024-2029)', 'rs_chandubhaichhaganbhaishihora_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'charanjitsinghchanni.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'charanjitsinghchanni.rs@mplads-demo.local', '$2b$10$pFVqssKOFUqHh1Zb8Xk6..Eh9M21qASzMO4roLcsv/wuDlI0aZbNG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'charanjitsinghchanni.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'charanjitsinghchanni.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHARANJIT SINGH CHANNI (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'CHARANJIT SINGH CHANNI (2024-2029)', 'rs_charanjitsinghchanni_punjab', true
    );

    DELETE FROM auth.users WHERE email = 'chhatrapalsinghgangwar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chhatrapalsinghgangwar.rs@mplads-demo.local', '$2b$10$sQw6hgdw.6yt95aAXB6bDuAwAq4aANpFyQr5rTdNUwUdiv/efvxSW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chhatrapalsinghgangwar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chhatrapalsinghgangwar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHHATRA PAL SINGH GANGWAR (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'CHHATRA PAL SINGH GANGWAR (2024-2029)', 'rs_chhatrapalsinghgangwar_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'chhatrapatishahushahaji.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chhatrapatishahushahaji.rs@mplads-demo.local', '$2b$10$6BkAlzSGh1Hq.FfQnYg5he/NznD9UmwKJaUR3OofWBL5Q3ifVoZYC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chhatrapatishahushahaji.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chhatrapatishahushahaji.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHHATRAPATI SHAHU SHAHAJI (2024-2029)', 'MP', 'Rajya Sabha', 'Maharashtra', NULL, 'CHHATRAPATI SHAHU SHAHAJI (2024-2029)', 'rs_chhatrapatishahushahaji_maharashtra', true
    );

    DELETE FROM auth.users WHERE email = 'chhotelal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chhotelal.rs@mplads-demo.local', '$2b$10$j9a7UEFmGi3t1LhFoMZZvepOSEexuqtaf3AfGZ5Lg92uXmDaRS7JK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chhotelal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chhotelal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHHOTELAL (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'CHHOTELAL (2024-2029)', 'rs_chhotelal_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'chintamanimaharaj.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chintamanimaharaj.rs@mplads-demo.local', '$2b$10$6WEyBFb0wctDkvWY9WKzJOopBJ.oU6ESngS3CenyO89V/4BkU.YCq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chintamanimaharaj.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chintamanimaharaj.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHINTAMANI MAHARAJ (2024-2029)', 'MP', 'Rajya Sabha', 'Chhattisgarh', NULL, 'CHINTAMANI MAHARAJ (2024-2029)', 'rs_chintamanimaharaj_chhattisgarh', true
    );

    DELETE FROM auth.users WHERE email = 'chiragpaswan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'chiragpaswan.rs@mplads-demo.local', '$2b$10$0CfiU80w7hzGhS4R.IiOfuNDqeNT3Es8MKgCs5WgCQOVmyIINRzNu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'chiragpaswan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'chiragpaswan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CHIRAG PASWAN (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'CHIRAG PASWAN (2024-2029)', 'rs_chiragpaswan_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'cnannadurai.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'cnannadurai.rs@mplads-demo.local', '$2b$10$g644qY0p5CWackgQAv82luEAQLoKvbFyMl8MK8S55FQAhZiTAvgiC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'cnannadurai.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'cnannadurai.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP CN Annadurai (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'CN Annadurai (2024-2029)', 'rs_cnannadurai_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'dmkathiranand.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dmkathiranand.rs@mplads-demo.local', '$2b$10$V4kdUS.hehUl9.6O9kBkKewM7qsbJTvF9loolJW.nGjP1RfX3L.CS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dmkathiranand.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dmkathiranand.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP D M Kathir Anand (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'D M Kathir Anand (2024-2029)', 'rs_dmkathiranand_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'dravikumar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dravikumar.rs@mplads-demo.local', '$2b$10$rLBgplQsGNUt3EcL8tO/F.Vgl0X.WS2U6j9c5l0zi7zXnkIGcJBhm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dravikumar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dravikumar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP D Ravikumar  (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'D Ravikumar  (2024-2029)', 'rs_dravikumar_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'daggubatipurandeshwari.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'daggubatipurandeshwari.rs@mplads-demo.local', '$2b$10$WSNq/zoRiwxp5DdibirAmeTTBQ589BgeByKV8JiGnmFRvfb7TMuNu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'daggubatipurandeshwari.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'daggubatipurandeshwari.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Daggubati Purandeshwari (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'Daggubati Purandeshwari (2024-2029)', 'rs_daggubatipurandeshwari_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'daggumallaprasadarao.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'daggumallaprasadarao.rs@mplads-demo.local', '$2b$10$5IJdG3dy8j.LJOhNR8dWze44o0Vtb4Op3c6fnLOP5xRvvLxomPA8S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'daggumallaprasadarao.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'daggumallaprasadarao.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DAGGUMALLA PRASADA RAO (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'DAGGUMALLA PRASADA RAO (2024-2029)', 'rs_daggumallaprasadarao_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'damodaragarwal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'damodaragarwal.rs@mplads-demo.local', '$2b$10$AxP4waVPm708ApUkMteYcOStiqV9Dr.d4SipnhYCH7bmyLD8Fi6Y2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'damodaragarwal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'damodaragarwal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DAMODAR AGARWAL (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'DAMODAR AGARWAL (2024-2029)', 'rs_damodaragarwal_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'darogaprasadsaroj.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'darogaprasadsaroj.rs@mplads-demo.local', '$2b$10$ozjS22jUmwploF.SgwZJneHPPZVLYwmX0MhWm9pdIgSZe1JhNVrrO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'darogaprasadsaroj.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'darogaprasadsaroj.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DAROGA PRASAD SAROJ (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'DAROGA PRASAD SAROJ (2024-2029)', 'rs_darogaprasadsaroj_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'darshansinghchoudhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'darshansinghchoudhary.rs@mplads-demo.local', '$2b$10$XjKnLw7YFsSa0sIRhJXxHOh40Zct0eqs1A4KSxcSGDZZM4ADOKlYG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'darshansinghchoudhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'darshansinghchoudhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DARSHAN SINGH CHOUDHARY (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'DARSHAN SINGH CHOUDHARY (2024-2029)', 'rs_darshansinghchoudhary_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'deependersinghhooda.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'deependersinghhooda.rs@mplads-demo.local', '$2b$10$02FrtfQukahdITLTBRN7pOUGsQbD9jX9dAorH7ssXI9K0QQXXRsPq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'deependersinghhooda.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'deependersinghhooda.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DEEPENDER SINGH HOODA (2024-2029)', 'MP', 'Rajya Sabha', 'Haryana', NULL, 'DEEPENDER SINGH HOODA (2024-2029)', 'rs_deependersinghhooda_haryana', true
    );

    DELETE FROM auth.users WHERE email = 'devendraaliasbholesingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'devendraaliasbholesingh.rs@mplads-demo.local', '$2b$10$YHGZNrCItd35LxvtBXb3weXBTBMX7XYvkmnPqoxH14hPeGxMYfTjG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'devendraaliasbholesingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'devendraaliasbholesingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Devendra Alias Bhole Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Devendra Alias Bhole Singh (2024-2029)', 'rs_devendraaliasbholesingh_uttarpradesh', true
    );
END $$;
