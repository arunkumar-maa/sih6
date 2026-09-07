import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[SupabaseService] Warning: SUPABASE_URL or SUPABASE_KEY is missing. Requests may fail.');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function getTableName(house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha'): 'lok_sabha_projects' | 'rajya_sabha_projects' {
  return house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
}
