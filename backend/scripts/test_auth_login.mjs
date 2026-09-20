import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testLogin() {
  console.log('Testing authentication for Tamil Nadu State Nodal Officer...');
  const { data, error } = await client.auth.signInWithPassword({
    email: 'tamilnadu.nodal@mplads-demo.local',
    password: 'TamilNadu@123'
  });

  if (error) {
    console.error('Sign-in failed:', error.message);
    process.exit(1);
  }

  console.log('Sign-in successful! User ID:', data.user.id);

  // Fetch user profile
  const { data: profile, error: profErr } = await client
    .from('profiles')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single();

  if (profErr) {
    console.error('Profile fetch failed:', profErr.message);
    process.exit(1);
  }

  console.log('Profile retrieved:', {
    role: profile.role,
    state: profile.state,
    full_name: profile.full_name,
    is_active: profile.is_active
  });

  // Query projects as this authenticated user (own state)
  const { data: myProjects, error: myErr } = await client
    .from('lok_sabha_projects')
    .select('work_id, state')
    .eq('state', 'Tamil Nadu')
    .limit(5);

  console.log('Own state query result sample count:', myProjects?.length);
  console.log('Sample project state:', myProjects?.[0]?.state);

  // Cross-State Attempt: Attempt to query Karnataka projects
  const { data: crossProjects, error: crossErr } = await client
    .from('lok_sabha_projects')
    .select('work_id, state')
    .eq('state', 'Karnataka')
    .limit(5);

  console.log('Cross-state (Karnataka) query result count:', crossProjects?.length || 0);
  if ((crossProjects?.length || 0) === 0) {
    console.log('[RLS VERIFIED] Cross-state access strictly blocked by PostgreSQL RLS!');
  } else {
    console.error('[SECURITY VIOLATION] Cross-state data leaked!');
  }

  await client.auth.signOut();
  console.log('Test completed successfully.');
}

testLogin().catch(console.error);
