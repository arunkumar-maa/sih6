-- Batch 2
DO $$
DECLARE
    uid UUID;
    enc_pw TEXT;
BEGIN

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
