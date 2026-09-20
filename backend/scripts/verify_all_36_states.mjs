import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runVerification() {
  console.log('=== VERIFYING ALL 36 STATE NODAL OFFICERS & DATA INTEGRITY ===\n');

  // 1. Check profiles table
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, state, is_active')
    .eq('role', 'STATE_NODAL_OFFICER')
    .order('state', { ascending: true });

  if (profErr) {
    console.error('Error fetching profiles:', profErr);
    process.exit(1);
  }

  console.log(`Found ${profiles.length} State Nodal Officer profiles in public.profiles:`);
  
  const distinctStates = new Set();
  const inactiveOfficers = [];

  for (const p of profiles) {
    distinctStates.add(p.state);
    if (!p.is_active) inactiveOfficers.push(p);
  }

  console.log(`Distinct states covered: ${distinctStates.size} / 36`);
  console.log(`Active officers: ${profiles.length - inactiveOfficers.length} / ${profiles.length}`);

  if (distinctStates.size !== 36) {
    console.error(`ERROR: Expected 36 distinct states, got ${distinctStates.size}`);
  }

  // 2. Sample 6 diverse states across India for deep overview validation
  const sampleStates = [
    'Tamil Nadu',
    'Uttar Pradesh',
    'Maharashtra',
    'Assam',
    'Ladakh',
    'Lakshadweep'
  ];

  console.log('\nTesting get_state_nodal_overview RPC across sample states:');
  for (const st of sampleStates) {
    const { data: lsOverview, error: lsErr } = await supabase.rpc('get_state_nodal_overview', {
      p_house: 'Lok Sabha',
      p_state: st
    });

    if (lsErr) {
      console.error(`  [FAILED] ${st} (Lok Sabha):`, lsErr.message);
    } else {
      console.log(`  [OK] ${st} (Lok Sabha): Total Works = ${lsOverview.kpis.total}, Sanctioned = INR ${lsOverview.kpis.totalSanctionAmount}, High Risk = ${lsOverview.kpis.highRisk}, Districts = ${lsOverview.districts.length}`);
    }

    const { data: rsOverview, error: rsErr } = await supabase.rpc('get_state_nodal_overview', {
      p_house: 'Rajya Sabha',
      p_state: st
    });

    if (rsErr) {
      console.error(`  [FAILED] ${st} (Rajya Sabha):`, rsErr.message);
    } else {
      console.log(`  [OK] ${st} (Rajya Sabha): Total Works = ${rsOverview.kpis.total}, Sanctioned = INR ${rsOverview.kpis.totalSanctionAmount}, High Risk = ${rsOverview.kpis.highRisk}, MPs = ${rsOverview.mps.length}`);
    }
  }

  // 3. Verify no SYSTEM_ADMIN or unauthorized roles exist
  const { data: forbiddenRoles, error: fErr } = await supabase
    .from('profiles')
    .select('role')
    .in('role', ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'TECHNICAL_ADMIN']);

  if (!fErr && forbiddenRoles.length === 0) {
    console.log('\n[OK] SYSTEM_ADMIN, SUPER_ADMIN, and TECHNICAL_ADMIN do NOT exist.');
  } else {
    console.error('\n[VIOLATION] Found forbidden roles:', forbiddenRoles);
  }

  console.log('\n=== ALL 36 STATE NODAL OFFICERS PROGRAMMATIC VERIFICATION COMPLETE ===');
}

runVerification().catch(console.error);
