import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

let isHealthy: boolean | null = null;

export async function checkSupabaseConnection(): Promise<boolean> {
  if (isHealthy !== null) return isHealthy;
  try {
    const { count, error } = await supabase
      .from('lok_sabha_projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[Supabase] Healthcheck failed:', error.message);
      isHealthy = false;
      return false;
    }
    isHealthy = true;
    return true;
  } catch (err) {
    console.warn('[Supabase] Healthcheck error:', err);
    isHealthy = false;
    return false;
  }
}
