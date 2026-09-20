DO $$
DECLARE
    uid UUID;
BEGIN

    DELETE FROM auth.users WHERE email = 'gajendrasinghshekhawat.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gajendrasinghshekhawat.rs@mplads-demo.local', '$2b$10$LJR5HrCpYLyXegeXYFrprexIuCVUV2f95uiMPl3udX.9fc5zFN3Se', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghshekhawat.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghshekhawat.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gajendra Singh Shekhawat (2024-2029)', 'MP', 'Rajya Sabha', 'Rajasthan', NULL, 'Gajendra Singh Shekhawat (2024-2029)', 'rs_gajendrasinghshekhawat_rajasthan', true
    );

    DELETE FROM auth.users WHERE email = 'ganapathyrajkumarp.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganapathyrajkumarp.rs@mplads-demo.local', '$2b$10$BaXojcAuEe8BpbkLdcotnuKUvYPIqQo6/v.VghUS.Q0NaE9xtsLqq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganapathyrajkumarp.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganapathyrajkumarp.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GANAPATHY RAJKUMAR P (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'GANAPATHY RAJKUMAR P (2024-2029)', 'rs_ganapathyrajkumarp_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'ganesanselvam.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganesanselvam.rs@mplads-demo.local', '$2b$10$8bj4EDjD4ZyGsKMFNCss5.3O9LCbkIq3ArQjo8YCyizdcAW66PckK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganesanselvam.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganesanselvam.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Ganesan Selvam (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'Ganesan Selvam (2024-2029)', 'rs_ganesanselvam_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'ganeshsingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganeshsingh.rs@mplads-demo.local', '$2b$10$VZ3cwOGMZ53wggtlTA2nduuRHZaMSjM1SKIVH1X8KPFNIMRnDixc2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganeshsingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganeshsingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Ganesh Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'Ganesh Singh (2024-2029)', 'rs_ganeshsingh_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'gauravgogoi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gauravgogoi.rs@mplads-demo.local', '$2b$10$MF8Z0EBhTj2gy0HAKKkYWu8yulbpxGz7dbKM1FrcbFuXtGJcxr3ou', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gauravgogoi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gauravgogoi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GAURAV GOGOI (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'GAURAV GOGOI (2024-2029)', 'rs_gauravgogoi_assam', true
    );

    DELETE FROM auth.users WHERE email = 'genibennagajithakor.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'genibennagajithakor.rs@mplads-demo.local', '$2b$10$4edslchuTvsPMOnXuhoLeOHXCL3VOGGfLMU9O1oDPPmLv.3sDuct6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'genibennagajithakor.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'genibennagajithakor.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GENIBEN NAGAJI THAKOR (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'GENIBEN NAGAJI THAKOR (2024-2029)', 'rs_genibennagajithakor_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'giridhariyadav.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'giridhariyadav.rs@mplads-demo.local', '$2b$10$jUdE3DZOVtCWq.lW0iOqZ.fCBBaq6dV49pVZ3XELgvTg00k.k3/tu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'giridhariyadav.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'giridhariyadav.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Giridhari Yadav (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'Giridhari Yadav (2024-2029)', 'rs_giridhariyadav_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'girirajsingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'girirajsingh.rs@mplads-demo.local', '$2b$10$4OU1fA6/RwLkcF..bnqYrO5k2seS2xhOFq.jxo9kc4pnJncAj7dbu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'girirajsingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'girirajsingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Giriraj Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'Giriraj Singh (2024-2029)', 'rs_girirajsingh_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'gmharishbalayogi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gmharishbalayogi.rs@mplads-demo.local', '$2b$10$arAZS9nkxfQ.5HM5X.0p2e/Mlp8DLaabvfGNw/aXQ7CRZS/345lDy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gmharishbalayogi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gmharishbalayogi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GM Harish Balayogi (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'GM Harish Balayogi (2024-2029)', 'rs_gmharishbalayogi_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'godamnagesh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'godamnagesh.rs@mplads-demo.local', '$2b$10$OPd.ZdE82bSnwuaFa0COqunieIRU1Qwmg1TjpqAJf/nTsz3dAbi66', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'godamnagesh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'godamnagesh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GODAM NAGESH (2024-2029)', 'MP', 'Rajya Sabha', 'Telangana', NULL, 'GODAM NAGESH (2024-2029)', 'rs_godamnagesh_telangana', true
    );

    DELETE FROM auth.users WHERE email = 'gopinathk.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gopinathk.rs@mplads-demo.local', '$2b$10$nbfcNtP3pJJ/3/Q19Uilf.2geH.ISnbOd04896mE55uXMhMmE7Dta', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gopinathk.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gopinathk.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GOPINATH K (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'GOPINATH K (2024-2029)', 'rs_gopinathk_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'govindmakthappakarjol.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'govindmakthappakarjol.rs@mplads-demo.local', '$2b$10$L/yAOit7P/DzKp2zWCATZeY1mIYO.w6eEoIGKohsVecdQvymwLwWu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'govindmakthappakarjol.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'govindmakthappakarjol.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GOVIND MAKTHAPPA KARJOL (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'GOVIND MAKTHAPPA KARJOL (2024-2029)', 'rs_govindmakthappakarjol_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'gummathanujarani.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gummathanujarani.rs@mplads-demo.local', '$2b$10$wLk9Z2f7qXTpEDmagFxtgeo4c4Ab02yNu6gLnm/c44YDTJZh40igS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gummathanujarani.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gummathanujarani.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gumma Thanuja Rani (2024-2029)', 'MP', 'Rajya Sabha', 'Andhra Pradesh', NULL, 'Gumma Thanuja Rani (2024-2029)', 'rs_gummathanujarani_andhrapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'gurmeetsinghmeethayer.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gurmeetsinghmeethayer.rs@mplads-demo.local', '$2b$10$NQTHVSjNOfMBTVJbY76FeuuNlofWqmb1wWphX5xyMZt6eAb04w0GW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gurmeetsinghmeethayer.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gurmeetsinghmeethayer.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GURMEET SINGH MEET HAYER (2024-2029)', 'MP', 'Rajya Sabha', 'Punjab', NULL, 'GURMEET SINGH MEET HAYER (2024-2029)', 'rs_gurmeetsinghmeethayer_punjab', true
    );

    DELETE FROM auth.users WHERE email = 'gyaneshwarpatil.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gyaneshwarpatil.rs@mplads-demo.local', '$2b$10$wKKjvTTBGWsp0sSlPaKvqOuGCXOHCLUadNRslXiEPb3m2eZFUQKPa', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gyaneshwarpatil.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gyaneshwarpatil.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gyaneshwar Patil (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'Gyaneshwar Patil (2024-2029)', 'rs_gyaneshwarpatil_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'hdkumaraswamy.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hdkumaraswamy.rs@mplads-demo.local', '$2b$10$Ot6nQ0HA.c4aQKAtF176WOp7W0icUnGY8mLKTS4q4/cSShN/vyeWe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hdkumaraswamy.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hdkumaraswamy.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP H.D. KUMARASWAMY (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'H.D. KUMARASWAMY (2024-2029)', 'rs_hdkumaraswamy_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'harendrasinghmalik.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'harendrasinghmalik.rs@mplads-demo.local', '$2b$10$J6YYVlaZOcDR5i9IINZinud0DbcE8C.bN6o8idCF6wiCkBPRSs2O.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'harendrasinghmalik.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'harendrasinghmalik.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP HARENDRA SINGH MALIK (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'HARENDRA SINGH MALIK (2024-2029)', 'rs_harendrasinghmalik_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'haribhaipatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'haribhaipatel.rs@mplads-demo.local', '$2b$10$BdJqedF15WUf87lNOmcCaukmWUAcCft0VNyQzsGjawnR.6ATwdqW2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'haribhaipatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'haribhaipatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP HARIBHAI PATEL (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'HARIBHAI PATEL (2024-2029)', 'rs_haribhaipatel_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'harshmalhotra.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'harshmalhotra.rs@mplads-demo.local', '$2b$10$yBuMFLbIkYeLLp8Y53ysQu0PnZ2vZHRxx5pvVtiP7UfnLmqQil8U.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'harshmalhotra.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'harshmalhotra.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Harsh Malhotra (2024-2029)', 'MP', 'Rajya Sabha', 'Delhi', NULL, 'Harsh Malhotra (2024-2029)', 'rs_harshmalhotra_delhi', true
    );

    DELETE FROM auth.users WHERE email = 'hasmukhbhaisomabhaipatel.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hasmukhbhaisomabhaipatel.rs@mplads-demo.local', '$2b$10$ODYDXzfRN/fbO5XaB6BQZuyljgz7YNMk26HdzpLpSktJtfuVAcrHe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hasmukhbhaisomabhaipatel.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hasmukhbhaisomabhaipatel.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Hasmukh Bhai Soma Bhai Patel (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Hasmukh Bhai Soma Bhai Patel (2024-2029)', 'rs_hasmukhbhaisomabhaipatel_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'imranmasood.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'imranmasood.rs@mplads-demo.local', '$2b$10$BIs.k.IB3UY1GvToTCxjUur3k3cE5RFMudfLjOZt1znTJTRONKBge', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'imranmasood.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'imranmasood.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP IMRAN MASOOD (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'IMRAN MASOOD (2024-2029)', 'rs_imranmasood_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'indrahangsubba.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'indrahangsubba.rs@mplads-demo.local', '$2b$10$2XrDxf9V9ziFTIVXghnywO2KsmGg49MHuJg63kMlQq4QLFATDSJce', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'indrahangsubba.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'indrahangsubba.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Indra Hang Subba (2024-2029)', 'MP', 'Rajya Sabha', 'Sikkim', NULL, 'Indra Hang Subba (2024-2029)', 'rs_indrahangsubba_sikkim', true
    );

    DELETE FROM auth.users WHERE email = 'iqrachoudhary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'iqrachoudhary.rs@mplads-demo.local', '$2b$10$q/8ThbAxNsaJGLLnH9whpucipp58ycxk47N/vu6yGkmJ2QRpEgCxC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'iqrachoudhary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'iqrachoudhary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP IQRA CHOUDHARY (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'IQRA CHOUDHARY (2024-2029)', 'rs_iqrachoudhary_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'ishakhanchoudhury.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ishakhanchoudhury.rs@mplads-demo.local', '$2b$10$yAxvRj3Iay7XW9YKu2sUiOR5OQ/uStSkXXG3a36ehOtRKGzxWFWqS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ishakhanchoudhury.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ishakhanchoudhury.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP ISHA KHAN CHOUDHURY (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'ISHA KHAN CHOUDHURY (2024-2029)', 'rs_ishakhanchoudhury_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'jagadishchandrabarmabasunia.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagadishchandrabarmabasunia.rs@mplads-demo.local', '$2b$10$L7MRgO4Zogx6kjwGkCRiHeeSkoG0PmK9y8xmbBhHpQx51BkB.Ug9O', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishchandrabarmabasunia.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishchandrabarmabasunia.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAGADISH CHANDRA BARMA BASUNIA (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'JAGADISH CHANDRA BARMA BASUNIA (2024-2029)', 'rs_jagadishchandrabarmabasunia_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'jagadishshettar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagadishshettar.rs@mplads-demo.local', '$2b$10$pMvAUiERBAVbWYMZodaHz.XDBECkqr/qD610CVVf/mWfLarthPMNi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishshettar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishshettar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAGADISH SHETTAR (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'JAGADISH SHETTAR (2024-2029)', 'rs_jagadishshettar_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'jagannathsarkar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagannathsarkar.rs@mplads-demo.local', '$2b$10$9Awbl6jU2mJtih309uKpv.TX7Z.wKBWvz9ZK2PYSVObaYF/DNL1wK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagannathsarkar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagannathsarkar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jagannath Sarkar (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Jagannath Sarkar (2024-2029)', 'rs_jagannathsarkar_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'jagdambikapal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagdambikapal.rs@mplads-demo.local', '$2b$10$1OeZQ8qjKfsqRcNxJWUX2Ooe.4hSyEeGwTCaIZX2N6sYvFDAP8kDq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagdambikapal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagdambikapal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jagdambika Pal (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Jagdambika Pal (2024-2029)', 'rs_jagdambikapal_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'jaiparkash.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jaiparkash.rs@mplads-demo.local', '$2b$10$lVZbSO000qDEdBNnR1pkvucgMzfjRsQmLMdZ/11sKKypzDFDrTLY.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jaiparkash.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jaiparkash.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAI PARKASH (2024-2029)', 'MP', 'Rajya Sabha', 'Haryana', NULL, 'JAI PARKASH (2024-2029)', 'rs_jaiparkash_haryana', true
    );

    DELETE FROM auth.users WHERE email = 'jaiprakash.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jaiprakash.rs@mplads-demo.local', '$2b$10$KWnuvVf.U0rP6EYKCgWps.MFRDaIuXayUKQ0.dpIDEBjgG.r81zam', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jaiprakash.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jaiprakash.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jai Prakash (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'Jai Prakash (2024-2029)', 'rs_jaiprakash_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'janardanmishra.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'janardanmishra.rs@mplads-demo.local', '$2b$10$1em4tB5JKQ/M.s4b0xyaBeTKu2.Ky2msIJWdebkkY29ZqNBhQVeTO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'janardanmishra.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'janardanmishra.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Janardan Mishra (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'Janardan Mishra (2024-2029)', 'rs_janardanmishra_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'jashubhaibhilubhairathva.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jashubhaibhilubhairathva.rs@mplads-demo.local', '$2b$10$fbpSqWD9a88SPzmgp5..YOM3qVYAbIFS06m7yS70S5UUILk2zclKW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jashubhaibhilubhairathva.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jashubhaibhilubhairathva.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JASHUBHAI BHILUBHAI RATHVA (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'JASHUBHAI BHILUBHAI RATHVA (2024-2029)', 'rs_jashubhaibhilubhairathva_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'jaswantsinhsumanbhaibhabhor.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jaswantsinhsumanbhaibhabhor.rs@mplads-demo.local', '$2b$10$/w6I9UyQld/c6ggyCfNmR.VOS/iG892hLSPRPoZfh/NM/sCLyKeFK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jaswantsinhsumanbhaibhabhor.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jaswantsinhsumanbhaibhabhor.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jaswantsinh Sumanbhai Bhabhor (2024-2029)', 'MP', 'Rajya Sabha', 'Gujarat', NULL, 'Jaswantsinh Sumanbhai Bhabhor (2024-2029)', 'rs_jaswantsinhsumanbhaibhabhor_gujarat', true
    );

    DELETE FROM auth.users WHERE email = 'jitanrammanjhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jitanrammanjhi.rs@mplads-demo.local', '$2b$10$8MnYXus2H7BG.vYJMdFPhO3/QXGdHmensB6KUvcSJN6DLunlHCFQy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jitanrammanjhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jitanrammanjhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JITAN RAM MANJHI (2024-2029)', 'MP', 'Rajya Sabha', 'Bihar', NULL, 'JITAN RAM MANJHI (2024-2029)', 'rs_jitanrammanjhi_bihar', true
    );

    DELETE FROM auth.users WHERE email = 'jitendrakumardohare.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jitendrakumardohare.rs@mplads-demo.local', '$2b$10$Rj1.CDvX4sq47Ai3KatHNu2QbNahcZvuU/34HKJvsgKsH5rW4zAyC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jitendrakumardohare.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jitendrakumardohare.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JITENDRA KUMAR DOHARE (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'JITENDRA KUMAR DOHARE (2024-2029)', 'rs_jitendrakumardohare_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'jitendrasingh.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jitendrasingh.rs@mplads-demo.local', '$2b$10$lxbnHBoVeVAxXZKwj.04YeZkboAAbpynhc1GfZj1tJ3.8BrVb3THO', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jitendrasingh.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jitendrasingh.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jitendra Singh (2024-2029)', 'MP', 'Rajya Sabha', 'Jammu And Kashmir', NULL, 'Jitendra Singh (2024-2029)', 'rs_jitendrasingh_jammuandkashmir', true
    );

    DELETE FROM auth.users WHERE email = 'jitinprasada.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jitinprasada.rs@mplads-demo.local', '$2b$10$mbPORlZbL9DLLcqpF2PSeOtVhmHrKjAreIRLEj3y6mdDe0Ym6K2NG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jitinprasada.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jitinprasada.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JITIN PRASADA (2024-2029)', 'MP', 'Rajya Sabha', 'Uttar Pradesh', NULL, 'JITIN PRASADA (2024-2029)', 'rs_jitinprasada_uttarpradesh', true
    );

    DELETE FROM auth.users WHERE email = 'jobamajhi.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jobamajhi.rs@mplads-demo.local', '$2b$10$QUmxCJUmDmgk.0MINZjoZ.6mmlc6PX1ak5eBuaz6Twb9aZ20kbk7a', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jobamajhi.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jobamajhi.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JOBA MAJHI (2024-2029)', 'MP', 'Rajya Sabha', 'Jharkhand', NULL, 'JOBA MAJHI (2024-2029)', 'rs_jobamajhi_jharkhand', true
    );

    DELETE FROM auth.users WHERE email = 'joyantabasumatary.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'joyantabasumatary.rs@mplads-demo.local', '$2b$10$JRkzFCsV9xHbEczcKO5Kbe5cEq04cB1JrArBjvrj76DdfwYdQd406', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'joyantabasumatary.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'joyantabasumatary.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JOYANTA BASUMATARY (2024-2029)', 'MP', 'Rajya Sabha', 'Assam', NULL, 'JOYANTA BASUMATARY (2024-2029)', 'rs_joyantabasumatary_assam', true
    );

    DELETE FROM auth.users WHERE email = 'junemaliah.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'junemaliah.rs@mplads-demo.local', '$2b$10$jg0VHgAs9DE1xmSLrJJmduZaoD09NJtOSnV29f5PNn8etk.sXISMy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'junemaliah.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'junemaliah.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JUNE MALIAH (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'JUNE MALIAH (2024-2029)', 'rs_junemaliah_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'jyotiradityamscindia.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jyotiradityamscindia.rs@mplads-demo.local', '$2b$10$fyutA4gT12DA8mbFiWP9TOfdIVku2ABScWKIKnoCuAUbTZLRkSzQW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jyotiradityamscindia.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jyotiradityamscindia.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JYOTIRADITYA M. SCINDIA (2024-2029)', 'MP', 'Rajya Sabha', 'Madhya Pradesh', NULL, 'JYOTIRADITYA M. SCINDIA (2024-2029)', 'rs_jyotiradityamscindia_madhyapradesh', true
    );

    DELETE FROM auth.users WHERE email = 'jyotsnacharandasmahant.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jyotsnacharandasmahant.rs@mplads-demo.local', '$2b$10$Vg8FDqg7jpCYrPq3CymLiOfsg4BUrymQMWH84Vc1814i1rfhODcQi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jyotsnacharandasmahant.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jyotsnacharandasmahant.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jyotsna Charandas Mahant  (2024-2029)', 'MP', 'Rajya Sabha', 'Chhattisgarh', NULL, 'Jyotsna Charandas Mahant  (2024-2029)', 'rs_jyotsnacharandasmahant_chhattisgarh', true
    );

    DELETE FROM auth.users WHERE email = 'keprakash.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'keprakash.rs@mplads-demo.local', '$2b$10$ChUqVFybZo8XkQx3C0RH/OU4pYRYbvSj4VCrDsvUL1MvbJBpGxaSu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'keprakash.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'keprakash.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP K E PRAKASH (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'K E PRAKASH (2024-2029)', 'rs_keprakash_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'kradhakrishnan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kradhakrishnan.rs@mplads-demo.local', '$2b$10$AN9cGRYpOWBXKL86DrcGsOIk8JW2EeZesHoxFdXVdZuCZODV2sxCq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kradhakrishnan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kradhakrishnan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP K RADHAKRISHNAN (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'K RADHAKRISHNAN (2024-2029)', 'rs_kradhakrishnan_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'ksubbarayan.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ksubbarayan.rs@mplads-demo.local', '$2b$10$GZaO0Br9JCKTFUpr102Mv.XmOvagblPUk5UGg.vIjf4v9vS7n5YiW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ksubbarayan.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ksubbarayan.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP K Subbarayan (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'K Subbarayan (2024-2029)', 'rs_ksubbarayan_tamilnadu', true
    );

    DELETE FROM auth.users WHERE email = 'kcvenugopal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kcvenugopal.rs@mplads-demo.local', '$2b$10$rBq7Or57dIJgfLV1SREyE.jUwpwyk/SqPa6EQMWLJHLt8ZvSg1H6O', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kcvenugopal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kcvenugopal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP K. C VENUGOPAL (2024-2029)', 'MP', 'Rajya Sabha', 'Kerala', NULL, 'K. C VENUGOPAL (2024-2029)', 'rs_kcvenugopal_kerala', true
    );

    DELETE FROM auth.users WHERE email = 'krajashekarbasavarajhitnal.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'krajashekarbasavarajhitnal.rs@mplads-demo.local', '$2b$10$CZxkguJfpPFx9/iDwrID6OsUAeoerE.y13o6lBXamklC5Brt4HvCu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'krajashekarbasavarajhitnal.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'krajashekarbasavarajhitnal.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP K. RAJASHEKAR BASAVARAJ HITNAL (2024-2029)', 'MP', 'Rajya Sabha', 'Karnataka', NULL, 'K. RAJASHEKAR BASAVARAJ HITNAL (2024-2029)', 'rs_krajashekarbasavarajhitnal_karnataka', true
    );

    DELETE FROM auth.users WHERE email = 'kadiyamkavya.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kadiyamkavya.rs@mplads-demo.local', '$2b$10$1CwOVTkQ2rK5kfWemATu3ebVSGCNxyY8Bje6dRRD0HuspcVChk36C', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kadiyamkavya.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kadiyamkavya.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP KADIYAM KAVYA (2024-2029)', 'MP', 'Rajya Sabha', 'Telangana', NULL, 'KADIYAM KAVYA (2024-2029)', 'rs_kadiyamkavya_telangana', true
    );

    DELETE FROM auth.users WHERE email = 'kakolighoshdastidar.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kakolighoshdastidar.rs@mplads-demo.local', '$2b$10$FEGj3qt7QgyLiQry6WGLBuIGTGZ2UThGVEyVWOTuFP4NkKeat7j5.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kakolighoshdastidar.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kakolighoshdastidar.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Kakoli Ghosh Dastidar  (2024-2029)', 'MP', 'Rajya Sabha', 'West Bengal', NULL, 'Kakoli Ghosh Dastidar  (2024-2029)', 'rs_kakolighoshdastidar_westbengal', true
    );

    DELETE FROM auth.users WHERE email = 'kalanidhiveeraswamy.rs@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'kalanidhiveeraswamy.rs@mplads-demo.local', '$2b$10$moyW3j/NmO3NXFFdI/Q.YO1Smfey1YhgTlyp7v.KnAatD6fnEY3va', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'kalanidhiveeraswamy.rs@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'kalanidhiveeraswamy.rs@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Kalanidhi Veeraswamy (2024-2029)', 'MP', 'Rajya Sabha', 'Tamil Nadu', NULL, 'Kalanidhi Veeraswamy (2024-2029)', 'rs_kalanidhiveeraswamy_tamilnadu', true
    );
END $$;
