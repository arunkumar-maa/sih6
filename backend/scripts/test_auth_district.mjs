import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const sql = "UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE p.auth_user_id = u.id AND p.role = 'DISTRICT_OFFICER';";
  await supabase.rpc('exec_sql', { query: sql });

  const { data: sample } = await supabase.from('profiles').select('id, full_name, email, state, district').eq('role', 'DISTRICT_OFFICER').limit(3);
  console.log('Sample updated profiles:', sample);

  // Test full auth login with Supabase client
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email: 'do.varanasi@mplads-demo.local',
    password: 'DistrictOfficerVaranasi@123'
  });

  if (authErr) {
    console.error('Login error:', authErr);
  } else {
    console.log('Login OK! User ID:', authData.user.id);
    const { data: myProfile, error: pErr } = await client.from('profiles').select('*').eq('auth_user_id', authData.user.id).single();
    console.log('User Profile fetched with auth token:', myProfile?.full_name, '| Role:', myProfile?.role, '| District:', myProfile?.district);
  }
}

main();
