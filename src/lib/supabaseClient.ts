import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const supabasePublishableKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Verify .env.local configuration.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
