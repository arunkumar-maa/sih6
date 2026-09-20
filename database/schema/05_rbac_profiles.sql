-- ==============================================================================
-- MPLADS SENTINEL — ROLE-BASED ACCESS CONTROL (RBAC) SCHEMA
-- Canonical Roles: MOSPI_ADMIN, STATE_NODAL_OFFICER, DISTRICT_OFFICER,
--                  IMPLEMENTING_AGENCY, MP, AUDITOR
-- ==============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop legacy unused profiles table if present and create canonical profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'MOSPI_ADMIN',
        'STATE_NODAL_OFFICER',
        'DISTRICT_OFFICER',
        'IMPLEMENTING_AGENCY',
        'MP',
        'AUDITOR'
    )),
    house TEXT CHECK (house IN ('Lok Sabha', 'Rajya Sabha') OR house IS NULL),
    state TEXT,
    district TEXT,
    constituency TEXT,
    mp_name TEXT,
    mp_id TEXT,
    agency_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profiles_auth_user UNIQUE (auth_user_id)
);

-- 3. Indexes for high-performance role & scope queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_mp_name ON public.profiles(mp_name);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_house ON public.profiles(house);

-- 4. Helper function to fetch current logged-in user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles AS $$
    SELECT * FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
