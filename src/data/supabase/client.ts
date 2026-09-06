import { supabase } from '../../lib/supabaseClient';

export { supabase };

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
