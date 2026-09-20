import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Fetching all implementing agency profiles from database...');

  // 1. Fetch agency profiles from public.profiles
  let allProfiles = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, agency_name, agency_id, email, is_active')
      .eq('role', 'IMPLEMENTING_AGENCY')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('agency_name', { ascending: true });

    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }

    allProfiles.push(...data);
    if (data.length < pageSize) hasMore = false;
    else page++;
  }

  // 2. Fetch total assigned works from implementing_agency_profiles
  const { data: agencyStats } = await supabase
    .from('implementing_agency_profiles')
    .select('id, agency_name, total_assigned_works');

  const statsMap = new Map();
  for (const s of agencyStats || []) {
    statsMap.set(s.id, s.total_assigned_works);
    if (s.agency_name) statsMap.set(s.agency_name, s.total_assigned_works);
  }

  console.log(`Retrieved ${allProfiles.length} agency accounts.`);

  let txtContent = `========================================================================================
MPLADS SENTINEL — IMPLEMENTING AGENCY CREDENTIALS DIRECTORY
Total Accounts: ${allProfiles.length}
Standard Password for all generated accounts: Agency@123
Default Demo Account Password: AgencyPWD@123 (or Agency@123)
Domain: @mplads-demo.local
Role: IMPLEMENTING_AGENCY
========================================================================================

`;

  let idx = 1;
  for (const p of allProfiles) {
    const agencyName = p.agency_name || p.full_name || 'Implementing Agency';
    const email = p.email || `agency.${p.id.slice(0, 8)}@mplads-demo.local`;
    const assignedWorks = statsMap.get(p.agency_id) || statsMap.get(p.agency_name) || 0;
    const password = email === 'agency.pwd@mplads-demo.local' ? 'AgencyPWD@123' : 'Agency@123';

    txtContent += `[${idx.toString().padStart(3, '0')}] ${agencyName}
  Username / Email : ${email}
  Password         : ${password}
  Assigned Works   : ${assignedWorks}
  Agency ID        : ${p.agency_id || p.id}
  Status           : ${p.is_active ? 'ACTIVE' : 'INACTIVE'}
----------------------------------------------------------------------------------------\n`;
    idx++;
  }

  // Write to workspace root
  const outputPath = path.resolve('..', 'agency_credentials.txt');
  fs.writeFileSync(outputPath, txtContent, 'utf-8');
  console.log(`Saved credentials directory to ${outputPath}`);

  // Also write inside backend and frontend for convenience
  fs.writeFileSync(path.resolve('agency_credentials.txt'), txtContent, 'utf-8');
}

main().catch(err => {
  console.error('Error exporting credentials:', err);
  process.exit(1);
});
