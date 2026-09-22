import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setSimplePassword() {
  const newPw = 'Konaseema@123';
  const hash = bcrypt.hashSync(newPw, 10);
  const email = 'drbrambedkarkonaseema.andhrapradesh.district@mplads-demo.local';
  
  const sql = `
    UPDATE auth.users 
    SET encrypted_password = '${hash}'
    WHERE email = '${email}';
  `;
  
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  console.log('Update result error:', error);
  
  const { data, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password: newPw
  });
  
  console.log('Login test with Konaseema@123:', !loginErr ? 'SUCCESS (User ID: ' + data.user.id + ')' : loginErr.message);

  // Also test profile fetch
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', data?.user?.id)
    .single();

  console.log('Profile loaded:', {
    name: profile?.full_name,
    role: profile?.role,
    state: profile?.state,
    district: profile?.district
  });
}

setSimplePassword();
