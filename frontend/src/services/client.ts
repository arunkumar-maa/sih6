import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || 'https://thwixsmvuydalebgkbqj.supabase.co';

// Supabase JS client requires the anon JWT key, not the publishable key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lok_sabha_projects')
      .select('work_id', { count: 'exact', head: true });

    if (error) {
      console.warn('[Supabase] Healthcheck failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Healthcheck error:', err);
    return false;
  }
}
