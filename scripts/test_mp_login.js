import https from 'https';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

async function testLogin(email, password) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email, password });
    const req = https.request(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, user: json.user?.email, token: !!json.access_token, error: json.error_description || json.msg });
        } catch (e) {
          resolve({ status: res.statusCode, error: e.message });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

async function run() {
  const r1 = await testLogin('mp.puri@mplads-demo.local', 'Mplads@123');
  console.log('mp.puri@mplads-demo.local:', r1);

  const r2 = await testLogin('mp.machhlishahr@mplads-demo.local', 'Mplads@123');
  console.log('mp.machhlishahr@mplads-demo.local:', r2);

  const r3 = await testLogin('mp.varanasi@mplads-demo.local', 'Mplads@123');
  console.log('mp.varanasi@mplads-demo.local:', r3);
}

run();
