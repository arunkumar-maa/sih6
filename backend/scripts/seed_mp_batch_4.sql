DO $$
DECLARE
    uid UUID;
BEGIN

    DELETE FROM auth.users WHERE email = 'prabhamallikarjun.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'prabhamallikarjun.ls@mplads-demo.local', '$2b$10$NaRBwwsICsQi0/aPEYec3e2NakhRtim9ZlbPGj5WGXIw9Qhm1AWEC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'prabhamallikarjun.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'prabhamallikarjun.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. PRABHA MALLIKARJUN', 'MP', 'Lok Sabha', 'Karnataka', 'DAVANAGERE', 'DR. PRABHA MALLIKARJUN', 'ls_prabhamallikarjun_davanagere', true
    );

    DELETE FROM auth.users WHERE email = 'prashantyadaoraopadole.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'prashantyadaoraopadole.ls@mplads-demo.local', '$2b$10$itbGhFl9pShJcB10CtVt.u90epYSzx7BlA4pjfg2AY.C/2K7.t3S6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'prashantyadaoraopadole.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'prashantyadaoraopadole.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. PRASHANT YADAORAO PADOLE', 'MP', 'Lok Sabha', 'Maharashtra', 'BHANDARA-GONDIYA', 'DR. PRASHANT YADAORAO PADOLE', 'ls_prashantyadaoraopadole_bhandaragondiya', true
    );

    DELETE FROM auth.users WHERE email = 'rajkumarchabbewal.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'rajkumarchabbewal.ls@mplads-demo.local', '$2b$10$CFs53JNycJOLf6aemrmYceOjPtZ6k/kvv30QEsoxRgnV/uWhLcD.y', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'rajkumarchabbewal.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'rajkumarchabbewal.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. RAJ KUMAR CHABBEWAL', 'MP', 'Lok Sabha', 'Punjab', 'HOSHIARPUR(SC)', 'DR. RAJ KUMAR CHABBEWAL', 'ls_rajkumarchabbewal_hoshiarpursc', true
    );

    DELETE FROM auth.users WHERE email = 'rajeshmishra.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'rajeshmishra.ls@mplads-demo.local', '$2b$10$yb0HKi8YVaop.Z4PtFJAnO75ivjB7z3Gjml2nNxHdLFZDYIgQyMRy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'rajeshmishra.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'rajeshmishra.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. RAJESH MISHRA', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'SIDHI', 'DR. RAJESH MISHRA', 'ls_rajeshmishra_sidhi', true
    );

    DELETE FROM auth.users WHERE email = 'spsingh.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'spsingh.ls@mplads-demo.local', '$2b$10$Ip07QLIohNH/U2opOssX8e9dvhBtbplg/emMFmyVjSHartLRvncP2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'spsingh.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'spsingh.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. S P SINGH', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'PRATAPGARH', 'DR. S P SINGH', 'ls_spsingh_pratapgarh', true
    );

    DELETE FROM auth.users WHERE email = 'sharmilasarkar.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'sharmilasarkar.ls@mplads-demo.local', '$2b$10$mzkbVkDQFED3SuxYgfkp9exu/BgYLC/sTpkFdwesXYthynwflxZuu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'sharmilasarkar.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'sharmilasarkar.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR. SHARMILA SARKAR', 'MP', 'Lok Sabha', 'West Bengal', 'BARDHAMAN PURBA(SC)', 'DR. SHARMILA SARKAR', 'ls_sharmilasarkar_bardhamanpurbasc', true
    );

    DELETE FROM auth.users WHERE email = 'drksudhakar.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'drksudhakar.ls@mplads-demo.local', '$2b$10$VJCfXx5eVGJK7nLVU5hPA.DJF63U603kpm8Y0Zt/Z28ZHgDVR8/Hq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'drksudhakar.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'drksudhakar.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR.K.SUDHAKAR', 'MP', 'Lok Sabha', 'Karnataka', 'CHIKBALLAPUR', 'DR.K.SUDHAKAR', 'ls_drksudhakar_chikballapur', true
    );

    DELETE FROM auth.users WHERE email = 'drmalluravi.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'drmalluravi.ls@mplads-demo.local', '$2b$10$kxEfMlWcJwTyCxPG4L.E9O4ukxWPKGx0Fw5Y6CFg93iTAJAPmmLUe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'drmalluravi.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'drmalluravi.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DR.MALLU RAVI', 'MP', 'Lok Sabha', 'Telangana', 'NAGARKURNOOL(SC)', 'DR.MALLU RAVI', 'ls_drmalluravi_nagarkurnoolsc', true
    );

    DELETE FROM auth.users WHERE email = 'dulumahato.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dulumahato.ls@mplads-demo.local', '$2b$10$59Tq/GxwjvbHvFrHlpxPnOaX8fH8GDAUEOW/T7FSDW25i9OxLKJZi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dulumahato.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dulumahato.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DULU MAHATO', 'MP', 'Lok Sabha', 'Jharkhand', 'DHANBAD', 'DULU MAHATO', 'ls_dulumahato_dhanbad', true
    );

    DELETE FROM auth.users WHERE email = 'duraivaiko.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'duraivaiko.ls@mplads-demo.local', '$2b$10$mSZSrdMkAi8vtOkKn7flSu2ZF.UHHfBOuaSqXPtaKzGPmOfJ3.d9y', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'duraivaiko.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'duraivaiko.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP DURAI VAIKO', 'MP', 'Lok Sabha', 'Tamil Nadu', 'TIRUCHIRAPPALLI', 'DURAI VAIKO', 'ls_duraivaiko_tiruchirappalli', true
    );

    DELETE FROM auth.users WHERE email = 'durgadasuikey.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'durgadasuikey.ls@mplads-demo.local', '$2b$10$W65v.jwY.GMlxQqjRxhnJ.tjpwUPJPsOfh.eEz02kqAzOkK0.jKTC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'durgadasuikey.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'durgadasuikey.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Durga Das Uikey', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'BETUL(ST)', 'Durga Das Uikey', 'ls_durgadasuikey_betulst', true
    );

    DELETE FROM auth.users WHERE email = 'dushyantsingh.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'dushyantsingh.ls@mplads-demo.local', '$2b$10$N5Rf8OAxr6kDVsTUQxff9OBxCe6KoIeUYLoCR8ioJBE5U0X9QpZWG', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'dushyantsingh.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'dushyantsingh.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Dushyant Singh', 'MP', 'Lok Sabha', 'Rajasthan', 'JHALAWAR-BARAN', 'Dushyant Singh', 'ls_dushyantsingh_jhalawarbaran', true
    );

    DELETE FROM auth.users WHERE email = 'etukaram.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'etukaram.ls@mplads-demo.local', '$2b$10$vscAOrfHT1xkfqaXs/vz0OQrup4XAAmhukiQ0FM93r8FuAH62vpke', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'etukaram.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'etukaram.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP E. TUKARAM', 'MP', 'Lok Sabha', 'Karnataka', 'BELLARY(ST)', 'E. TUKARAM', 'ls_etukaram_bellaryst', true
    );

    DELETE FROM auth.users WHERE email = 'etmohammedbasheer.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'etmohammedbasheer.ls@mplads-demo.local', '$2b$10$Fh/.JwskoKOn6.Hl.nkpe.Ws66.4qVa7fxIkgAtphsE1/tjoGvcFm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'etmohammedbasheer.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'etmohammedbasheer.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP E.T. MOHAMMED BASHEER', 'MP', 'Lok Sabha', 'Kerala', 'MALAPPURAM', 'E.T. MOHAMMED BASHEER', 'ls_etmohammedbasheer_malappuram', true
    );

    DELETE FROM auth.users WHERE email = 'eatalarajender.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'eatalarajender.ls@mplads-demo.local', '$2b$10$T5t9n8U5KE0KXI0D4w5TJePMB5CBAhjIg4emLt4Zmx6UsDznrG2/G', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'eatalarajender.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'eatalarajender.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP EATALA RAJENDER', 'MP', 'Lok Sabha', 'Telangana', 'MALKAJGIRI', 'EATALA RAJENDER', 'ls_eatalarajender_malkajgiri', true
    );

    DELETE FROM auth.users WHERE email = 'eswarasamyk.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'eswarasamyk.ls@mplads-demo.local', '$2b$10$RwxRmjG.Kp6UEIp9805iKOyoOZnF6QRl39nAOVip/qdmX3SDZwqaq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'eswarasamyk.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'eswarasamyk.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP ESWARASAMY K', 'MP', 'Lok Sabha', 'Tamil Nadu', 'POLLACHI', 'ESWARASAMY K', 'ls_eswarasamyk_pollachi', true
    );

    DELETE FROM auth.users WHERE email = 'faggansinghkulaste.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'faggansinghkulaste.ls@mplads-demo.local', '$2b$10$34TqSqQIIptAnb71sL/I3u/hOK.Xcdo.p5TpNjhXqWbHbt9s/223S', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'faggansinghkulaste.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'faggansinghkulaste.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Faggan Singh Kulaste', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'MANDLA(ST)', 'Faggan Singh Kulaste', 'ls_faggansinghkulaste_mandlast', true
    );

    DELETE FROM auth.users WHERE email = 'gkumarnaik.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gkumarnaik.ls@mplads-demo.local', '$2b$10$9ycbAV.MNFY9XOSzRNiF4eQwddd5StFpfq3cAOgBzpByEA8IqWzDa', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gkumarnaik.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gkumarnaik.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP G. KUMAR NAIK', 'MP', 'Lok Sabha', 'Karnataka', 'RAICHUR(ST)', 'G. KUMAR NAIK', 'ls_gkumarnaik_raichurst', true
    );

    DELETE FROM auth.users WHERE email = 'gaikwadvarshaeknath.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gaikwadvarshaeknath.ls@mplads-demo.local', '$2b$10$Yk4I/rzQxK6VHgFTrUEXm.8BeEYAbG86QqzthNClvDjfjwcwsRFJm', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gaikwadvarshaeknath.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gaikwadvarshaeknath.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GAIKWAD VARSHA EKNATH', 'MP', 'Lok Sabha', 'Maharashtra', 'MUMBAI NORTH-CENTRAL', 'GAIKWAD VARSHA EKNATH', 'ls_gaikwadvarshaeknath_mumbainorthcentral', true
    );

    DELETE FROM auth.users WHERE email = 'gajendrasinghpatel.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gajendrasinghpatel.ls@mplads-demo.local', '$2b$10$eZ95atCr7bsLGmNgNlLNp.bRu8LpG.dZhXyjr/ksU9QRemLCjUn2i', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghpatel.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghpatel.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gajendra Singh Patel', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'KHARGONE(ST)', 'Gajendra Singh Patel', 'ls_gajendrasinghpatel_khargonest', true
    );

    DELETE FROM auth.users WHERE email = 'gajendrasinghshekhawat.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gajendrasinghshekhawat.ls@mplads-demo.local', '$2b$10$LJR5HrCpYLyXegeXYFrprexIuCVUV2f95uiMPl3udX.9fc5zFN3Se', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghshekhawat.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gajendrasinghshekhawat.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gajendra Singh Shekhawat', 'MP', 'Lok Sabha', 'Rajasthan', 'JODHPUR', 'Gajendra Singh Shekhawat', 'ls_gajendrasinghshekhawat_jodhpur', true
    );

    DELETE FROM auth.users WHERE email = 'ganapathyrajkumarp.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganapathyrajkumarp.ls@mplads-demo.local', '$2b$10$BaXojcAuEe8BpbkLdcotnuKUvYPIqQo6/v.VghUS.Q0NaE9xtsLqq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganapathyrajkumarp.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganapathyrajkumarp.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GANAPATHY RAJKUMAR P', 'MP', 'Lok Sabha', 'Tamil Nadu', 'COIMBATORE', 'GANAPATHY RAJKUMAR P', 'ls_ganapathyrajkumarp_coimbatore', true
    );

    DELETE FROM auth.users WHERE email = 'ganesanselvam.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganesanselvam.ls@mplads-demo.local', '$2b$10$8bj4EDjD4ZyGsKMFNCss5.3O9LCbkIq3ArQjo8YCyizdcAW66PckK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganesanselvam.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganesanselvam.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Ganesan Selvam', 'MP', 'Lok Sabha', 'Tamil Nadu', 'KANCHEEPURAM(SC)', 'Ganesan Selvam', 'ls_ganesanselvam_kancheepuramsc', true
    );

    DELETE FROM auth.users WHERE email = 'ganeshsingh.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ganeshsingh.ls@mplads-demo.local', '$2b$10$VZ3cwOGMZ53wggtlTA2nduuRHZaMSjM1SKIVH1X8KPFNIMRnDixc2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ganeshsingh.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ganeshsingh.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Ganesh Singh', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'SATNA', 'Ganesh Singh', 'ls_ganeshsingh_satna', true
    );

    DELETE FROM auth.users WHERE email = 'gauravgogoi.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gauravgogoi.ls@mplads-demo.local', '$2b$10$MF8Z0EBhTj2gy0HAKKkYWu8yulbpxGz7dbKM1FrcbFuXtGJcxr3ou', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gauravgogoi.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gauravgogoi.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GAURAV GOGOI', 'MP', 'Lok Sabha', 'Assam', 'JORHAT', 'GAURAV GOGOI', 'ls_gauravgogoi_jorhat', true
    );

    DELETE FROM auth.users WHERE email = 'genibennagajithakor.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'genibennagajithakor.ls@mplads-demo.local', '$2b$10$4edslchuTvsPMOnXuhoLeOHXCL3VOGGfLMU9O1oDPPmLv.3sDuct6', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'genibennagajithakor.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'genibennagajithakor.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GENIBEN NAGAJI THAKOR', 'MP', 'Lok Sabha', 'Gujarat', 'BANASKANTHA', 'GENIBEN NAGAJI THAKOR', 'ls_genibennagajithakor_banaskantha', true
    );

    DELETE FROM auth.users WHERE email = 'giridhariyadav.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'giridhariyadav.ls@mplads-demo.local', '$2b$10$jUdE3DZOVtCWq.lW0iOqZ.fCBBaq6dV49pVZ3XELgvTg00k.k3/tu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'giridhariyadav.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'giridhariyadav.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Giridhari Yadav', 'MP', 'Lok Sabha', 'Bihar', 'BANKA', 'Giridhari Yadav', 'ls_giridhariyadav_banka', true
    );

    DELETE FROM auth.users WHERE email = 'girirajsingh.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'girirajsingh.ls@mplads-demo.local', '$2b$10$4OU1fA6/RwLkcF..bnqYrO5k2seS2xhOFq.jxo9kc4pnJncAj7dbu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'girirajsingh.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'girirajsingh.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Giriraj Singh', 'MP', 'Lok Sabha', 'Bihar', 'BEGUSARAI', 'Giriraj Singh', 'ls_girirajsingh_begusarai', true
    );

    DELETE FROM auth.users WHERE email = 'gmharishbalayogi.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gmharishbalayogi.ls@mplads-demo.local', '$2b$10$arAZS9nkxfQ.5HM5X.0p2e/Mlp8DLaabvfGNw/aXQ7CRZS/345lDy', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gmharishbalayogi.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gmharishbalayogi.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GM Harish Balayogi', 'MP', 'Lok Sabha', 'Andhra Pradesh', 'AMALAPURAM(SC)', 'GM Harish Balayogi', 'ls_gmharishbalayogi_amalapuramsc', true
    );

    DELETE FROM auth.users WHERE email = 'godamnagesh.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'godamnagesh.ls@mplads-demo.local', '$2b$10$OPd.ZdE82bSnwuaFa0COqunieIRU1Qwmg1TjpqAJf/nTsz3dAbi66', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'godamnagesh.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'godamnagesh.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GODAM NAGESH', 'MP', 'Lok Sabha', 'Telangana', 'ADILABAD(ST)', 'GODAM NAGESH', 'ls_godamnagesh_adilabadst', true
    );

    DELETE FROM auth.users WHERE email = 'gopinathk.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gopinathk.ls@mplads-demo.local', '$2b$10$nbfcNtP3pJJ/3/Q19Uilf.2geH.ISnbOd04896mE55uXMhMmE7Dta', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gopinathk.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gopinathk.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GOPINATH K', 'MP', 'Lok Sabha', 'Tamil Nadu', 'KRISHNAGIRI', 'GOPINATH K', 'ls_gopinathk_krishnagiri', true
    );

    DELETE FROM auth.users WHERE email = 'govindmakthappakarjol.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'govindmakthappakarjol.ls@mplads-demo.local', '$2b$10$L/yAOit7P/DzKp2zWCATZeY1mIYO.w6eEoIGKohsVecdQvymwLwWu', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'govindmakthappakarjol.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'govindmakthappakarjol.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GOVIND MAKTHAPPA KARJOL', 'MP', 'Lok Sabha', 'Karnataka', 'CHITRADURGA(SC)', 'GOVIND MAKTHAPPA KARJOL', 'ls_govindmakthappakarjol_chitradurgasc', true
    );

    DELETE FROM auth.users WHERE email = 'gummathanujarani.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gummathanujarani.ls@mplads-demo.local', '$2b$10$wLk9Z2f7qXTpEDmagFxtgeo4c4Ab02yNu6gLnm/c44YDTJZh40igS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gummathanujarani.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gummathanujarani.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gumma Thanuja Rani', 'MP', 'Lok Sabha', 'Andhra Pradesh', 'ARAKU(ST)', 'Gumma Thanuja Rani', 'ls_gummathanujarani_arakust', true
    );

    DELETE FROM auth.users WHERE email = 'gurmeetsinghmeethayer.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gurmeetsinghmeethayer.ls@mplads-demo.local', '$2b$10$NQTHVSjNOfMBTVJbY76FeuuNlofWqmb1wWphX5xyMZt6eAb04w0GW', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gurmeetsinghmeethayer.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gurmeetsinghmeethayer.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP GURMEET SINGH MEET HAYER', 'MP', 'Lok Sabha', 'Punjab', 'SANGRUR', 'GURMEET SINGH MEET HAYER', 'ls_gurmeetsinghmeethayer_sangrur', true
    );

    DELETE FROM auth.users WHERE email = 'gyaneshwarpatil.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'gyaneshwarpatil.ls@mplads-demo.local', '$2b$10$wKKjvTTBGWsp0sSlPaKvqOuGCXOHCLUadNRslXiEPb3m2eZFUQKPa', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'gyaneshwarpatil.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'gyaneshwarpatil.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Gyaneshwar Patil', 'MP', 'Lok Sabha', 'Madhya Pradesh', 'KHANDWA', 'Gyaneshwar Patil', 'ls_gyaneshwarpatil_khandwa', true
    );

    DELETE FROM auth.users WHERE email = 'hdkumaraswamy.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hdkumaraswamy.ls@mplads-demo.local', '$2b$10$Ot6nQ0HA.c4aQKAtF176WOp7W0icUnGY8mLKTS4q4/cSShN/vyeWe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hdkumaraswamy.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hdkumaraswamy.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP H.D. KUMARASWAMY', 'MP', 'Lok Sabha', 'Karnataka', 'MANDYA', 'H.D. KUMARASWAMY', 'ls_hdkumaraswamy_mandya', true
    );

    DELETE FROM auth.users WHERE email = 'harendrasinghmalik.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'harendrasinghmalik.ls@mplads-demo.local', '$2b$10$J6YYVlaZOcDR5i9IINZinud0DbcE8C.bN6o8idCF6wiCkBPRSs2O.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'harendrasinghmalik.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'harendrasinghmalik.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP HARENDRA SINGH MALIK', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'MUZAFFARNAGAR', 'HARENDRA SINGH MALIK', 'ls_harendrasinghmalik_muzaffarnagar', true
    );

    DELETE FROM auth.users WHERE email = 'haribhaipatel.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'haribhaipatel.ls@mplads-demo.local', '$2b$10$BdJqedF15WUf87lNOmcCaukmWUAcCft0VNyQzsGjawnR.6ATwdqW2', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'haribhaipatel.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'haribhaipatel.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP HARIBHAI PATEL', 'MP', 'Lok Sabha', 'Gujarat', 'MAHESANA', 'HARIBHAI PATEL', 'ls_haribhaipatel_mahesana', true
    );

    DELETE FROM auth.users WHERE email = 'harshmalhotra.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'harshmalhotra.ls@mplads-demo.local', '$2b$10$yBuMFLbIkYeLLp8Y53ysQu0PnZ2vZHRxx5pvVtiP7UfnLmqQil8U.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'harshmalhotra.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'harshmalhotra.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Harsh Malhotra', 'MP', 'Lok Sabha', 'Delhi', 'EAST DELHI', 'Harsh Malhotra', 'ls_harshmalhotra_eastdelhi', true
    );

    DELETE FROM auth.users WHERE email = 'hasmukhbhaisomabhaipatel.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'hasmukhbhaisomabhaipatel.ls@mplads-demo.local', '$2b$10$ODYDXzfRN/fbO5XaB6BQZuyljgz7YNMk26HdzpLpSktJtfuVAcrHe', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'hasmukhbhaisomabhaipatel.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'hasmukhbhaisomabhaipatel.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Hasmukh Bhai Soma Bhai Patel', 'MP', 'Lok Sabha', 'Gujarat', 'AHMEDABAD EAST', 'Hasmukh Bhai Soma Bhai Patel', 'ls_hasmukhbhaisomabhaipatel_ahmedabadeast', true
    );

    DELETE FROM auth.users WHERE email = 'imranmasood.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'imranmasood.ls@mplads-demo.local', '$2b$10$BIs.k.IB3UY1GvToTCxjUur3k3cE5RFMudfLjOZt1znTJTRONKBge', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'imranmasood.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'imranmasood.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP IMRAN MASOOD', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'SAHARANPUR', 'IMRAN MASOOD', 'ls_imranmasood_saharanpur', true
    );

    DELETE FROM auth.users WHERE email = 'indrahangsubba.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'indrahangsubba.ls@mplads-demo.local', '$2b$10$2XrDxf9V9ziFTIVXghnywO2KsmGg49MHuJg63kMlQq4QLFATDSJce', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'indrahangsubba.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'indrahangsubba.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Indra Hang Subba', 'MP', 'Lok Sabha', 'Sikkim', 'SIKKIM', 'Indra Hang Subba', 'ls_indrahangsubba_sikkim', true
    );

    DELETE FROM auth.users WHERE email = 'iqrachoudhary.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'iqrachoudhary.ls@mplads-demo.local', '$2b$10$q/8ThbAxNsaJGLLnH9whpucipp58ycxk47N/vu6yGkmJ2QRpEgCxC', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'iqrachoudhary.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'iqrachoudhary.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP IQRA CHOUDHARY', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'KAIRANA', 'IQRA CHOUDHARY', 'ls_iqrachoudhary_kairana', true
    );

    DELETE FROM auth.users WHERE email = 'ishakhanchoudhury.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'ishakhanchoudhury.ls@mplads-demo.local', '$2b$10$yAxvRj3Iay7XW9YKu2sUiOR5OQ/uStSkXXG3a36ehOtRKGzxWFWqS', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'ishakhanchoudhury.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'ishakhanchoudhury.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP ISHA KHAN CHOUDHURY', 'MP', 'Lok Sabha', 'West Bengal', 'MALDAHA DAKSHIN', 'ISHA KHAN CHOUDHURY', 'ls_ishakhanchoudhury_maldahadakshin', true
    );

    DELETE FROM auth.users WHERE email = 'jagadishchandrabarmabasunia.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagadishchandrabarmabasunia.ls@mplads-demo.local', '$2b$10$L7MRgO4Zogx6kjwGkCRiHeeSkoG0PmK9y8xmbBhHpQx51BkB.Ug9O', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishchandrabarmabasunia.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishchandrabarmabasunia.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAGADISH CHANDRA BARMA BASUNIA', 'MP', 'Lok Sabha', 'West Bengal', 'COOCHBEHAR(SC)', 'JAGADISH CHANDRA BARMA BASUNIA', 'ls_jagadishchandrabarmabasunia_coochbeharsc', true
    );

    DELETE FROM auth.users WHERE email = 'jagadishshettar.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagadishshettar.ls@mplads-demo.local', '$2b$10$pMvAUiERBAVbWYMZodaHz.XDBECkqr/qD610CVVf/mWfLarthPMNi', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishshettar.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagadishshettar.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAGADISH SHETTAR', 'MP', 'Lok Sabha', 'Karnataka', 'BELGAUM', 'JAGADISH SHETTAR', 'ls_jagadishshettar_belgaum', true
    );

    DELETE FROM auth.users WHERE email = 'jagannathsarkar.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagannathsarkar.ls@mplads-demo.local', '$2b$10$9Awbl6jU2mJtih309uKpv.TX7Z.wKBWvz9ZK2PYSVObaYF/DNL1wK', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagannathsarkar.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagannathsarkar.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jagannath Sarkar', 'MP', 'Lok Sabha', 'West Bengal', 'RANAGHAT(SC)', 'Jagannath Sarkar', 'ls_jagannathsarkar_ranaghatsc', true
    );

    DELETE FROM auth.users WHERE email = 'jagdambikapal.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jagdambikapal.ls@mplads-demo.local', '$2b$10$1OeZQ8qjKfsqRcNxJWUX2Ooe.4hSyEeGwTCaIZX2N6sYvFDAP8kDq', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jagdambikapal.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jagdambikapal.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jagdambika Pal', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'DOMARIYAGANJ', 'Jagdambika Pal', 'ls_jagdambikapal_domariyaganj', true
    );

    DELETE FROM auth.users WHERE email = 'jaiparkash.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jaiparkash.ls@mplads-demo.local', '$2b$10$lVZbSO000qDEdBNnR1pkvucgMzfjRsQmLMdZ/11sKKypzDFDrTLY.', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jaiparkash.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jaiparkash.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP JAI PARKASH', 'MP', 'Lok Sabha', 'Haryana', 'HISAR', 'JAI PARKASH', 'ls_jaiparkash_hisar', true
    );

    DELETE FROM auth.users WHERE email = 'jaiprakash.ls@mplads-demo.local';
    uid := gen_random_uuid();

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'jaiprakash.ls@mplads-demo.local', '$2b$10$KWnuvVf.U0rP6EYKCgWps.MFRDaIuXayUKQ0.dpIDEBjgG.r81zam', now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', uid::text, 'email', 'jaiprakash.ls@mplads-demo.local'), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', 'jaiprakash.ls@mplads-demo.local'),
        'email', uid::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        auth_user_id, full_name, role, house, state, constituency, mp_name, mp_id, is_active
    ) VALUES (
        uid, 'Hon''ble MP Jai Prakash', 'MP', 'Lok Sabha', 'Uttar Pradesh', 'HARDOI (SC)', 'Jai Prakash', 'ls_jaiprakash_hardoisc', true
    );
END $$;
