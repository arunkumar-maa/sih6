import { create } from 'zustand';
import { supabase } from '../services/client';
import type { UserRole, UserProfile, DataScope } from '../types/auth';
import { ROLE_DASHBOARD_ROUTES } from '../types/auth';

function computeScope(profile: UserProfile): DataScope {
  switch (profile.role) {
    case 'MOSPI_ADMIN':
      return { scope: 'NATIONAL' };
    case 'STATE_NODAL_OFFICER':
      return { scope: 'STATE', state: profile.state || '' };
    case 'DISTRICT_OFFICER':
      return {
        scope: 'DISTRICT',
        district: profile.district || '',
        state: profile.state || undefined,
      };
    case 'IMPLEMENTING_AGENCY':
      return { scope: 'AGENCY', agency: profile.agency_name || '' };
    case 'MP':
      return {
        scope: 'MP',
        mpId: profile.mp_id || undefined,
        mpName: profile.mp_name || '',
        house: profile.house || 'Lok Sabha',
        constituency: profile.constituency || undefined,
        state: profile.state || undefined,
      };
    case 'AUDITOR':
      return { scope: 'AUTHORIZED_AUDIT_SCOPE' };
    default:
      return { scope: 'AUTHORIZED_AUDIT_SCOPE' };
  }
}

interface AuthState {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  scope: DataScope | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  scope: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  initAuth: async () => {
    try {
      set({ isLoading: true, authError: null });
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        set({
          user: null,
          session: null,
          profile: null,
          scope: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const session = sessionData.session;
      const user = session.user;

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single();

      if (profileError || !profile) {
        console.warn('[AuthStore] Profile not found or inactive:', profileError?.message);
        set({
          user: null,
          session: null,
          profile: null,
          scope: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const userProfile = profile as UserProfile;
      const userScope = computeScope(userProfile);

      set({
        user,
        session,
        profile: userProfile,
        scope: userScope,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('[AuthStore] initAuth exception:', err);
      set({
        user: null,
        session: null,
        profile: null,
        scope: null,
        isAuthenticated: false,
        isLoading: false,
        authError: err.message || 'Session verification error',
      });
    }
  },

  login: async (email: string, pass: string) => {
    try {
      set({ isLoading: true, authError: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error || !data?.session || !data?.user) {
        const errMsg = error?.message || 'Authentication failed: Invalid credentials';
        set({ isLoading: false, authError: errMsg });
        return { success: false, error: errMsg };
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .eq('is_active', true)
        .single();

      if (profileError || !profile) {
        const errMsg = 'User profile not found or account is deactivated.';
        set({ isLoading: false, authError: errMsg });
        await supabase.auth.signOut();
        return { success: false, error: errMsg };
      }

      const userProfile = profile as UserProfile;
      const userScope = computeScope(userProfile);
      const redirectUrl = ROLE_DASHBOARD_ROUTES[userProfile.role] || '/admin/dashboard';

      set({
        user: data.user,
        session: data.session,
        profile: userProfile,
        scope: userScope,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });

      return { success: true, redirectUrl };
    } catch (err: any) {
      const errMsg = err.message || 'Login failed';
      set({ isLoading: false, authError: errMsg });
      return { success: false, error: errMsg };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthStore] Error during signOut:', err);
    }
    set({
      user: null,
      session: null,
      profile: null,
      scope: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    });
  },
}));
