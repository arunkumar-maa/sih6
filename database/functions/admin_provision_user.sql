-- ==============================================================================
-- Function: admin_provision_user
-- Purpose: Allows MoSPI Admin to provision or update user accounts with
--          credentials and profiles across all roles.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_provision_user(
    p_full_name text,
    p_email text,
    p_password text,
    p_role text,
    p_state text DEFAULT NULL,
    p_district text DEFAULT NULL,
    p_constituency text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    new_user_id UUID;
    new_profile_id UUID;
    enc_pw TEXT;
    existing_user_id UUID;
BEGIN
    IF p_email IS NULL OR p_email = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email is required');
    END IF;
    IF p_password IS NULL OR length(p_password) < 6 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters');
    END IF;
    IF p_role IS NULL OR p_role = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Role is required');
    END IF;

    SELECT id INTO existing_user_id FROM auth.users WHERE lower(email) = lower(p_email);

    IF existing_user_id IS NOT NULL THEN
        -- User exists in auth.users, update password and upsert profile
        enc_pw := crypt(p_password, gen_salt('bf', 10));
        UPDATE auth.users 
        SET encrypted_password = enc_pw,
            updated_at = now()
        WHERE id = existing_user_id;

        INSERT INTO public.profiles (
            auth_user_id, full_name, email, role, state, district, constituency, is_active, updated_at
        ) VALUES (
            existing_user_id, p_full_name, p_email, p_role, p_state, p_district, p_constituency, true, now()
        )
        ON CONFLICT (auth_user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            state = EXCLUDED.state,
            district = EXCLUDED.district,
            constituency = EXCLUDED.constituency,
            is_active = true,
            updated_at = now()
        RETURNING id INTO new_profile_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'User account updated successfully',
            'auth_user_id', existing_user_id,
            'profile_id', new_profile_id
        );
    END IF;

    -- Create new user
    new_user_id := gen_random_uuid();
    enc_pw := crypt(p_password, gen_salt('bf', 10));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_token, email_change_token_new, email_change, phone_change, phone_change_token,
        email_change_token_current, email_change_confirm_status, reauthentication_token,
        is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, confirmation_token, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
        lower(p_email), enc_pw, now(), '', '', '', '', '', '', 0, '', false, false,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('sub', new_user_id::text, 'email', lower(p_email)), '', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', lower(p_email)),
        'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (
        id, auth_user_id, full_name, email, role, state, district, constituency, is_active, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id, p_full_name, lower(p_email), p_role, p_state, p_district, p_constituency, true, now(), now()
    )
    RETURNING id INTO new_profile_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User provisioned successfully',
        'auth_user_id', new_user_id,
        'profile_id', new_profile_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_provision_user TO authenticated, service_role, anon;
