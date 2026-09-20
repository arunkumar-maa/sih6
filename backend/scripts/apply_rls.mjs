import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const sql = fs.readFileSync('database/policies/02_rbac_rls.sql', 'utf8') + "\nNOTIFY pgrst, 'reload schema';";
  console.log('Applying 02_rbac_rls.sql...');
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying RLS:', error);
    process.exit(1);
  }
  console.log('Successfully updated and applied RLS policies to Supabase!');
}

main();
