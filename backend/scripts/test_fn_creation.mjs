import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const sql = `
    CREATE OR REPLACE FUNCTION public.test_fn(val text)
    RETURNS text
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
    SELECT 'hello ' || val;
    $$;
    GRANT EXECUTE ON FUNCTION public.test_fn(text) TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `;

  const { error: err1 } = await supabase.rpc('exec_sql', { query: sql });
  console.log('exec_sql error:', err1);

  await new Promise(r => setTimeout(r, 2000));

  const { data, error: err2 } = await supabase.rpc('test_fn', { val: 'world' });
  console.log('test_fn result:', data, err2);
}

test();
