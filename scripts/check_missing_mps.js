import fs from 'fs';
import https from 'https';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

function fetchProfiles() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles?role=eq.MP&house=eq.Lok%20Sabha&select=id,full_name,mp_name,constituency,state,email,photo_url&limit=1000`);
    const req = https.get(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

function parseCsvLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else curr += ch;
  }
  result.push(curr.trim());
  return result;
}

async function main() {
  const existingProfiles = await fetchProfiles();
  console.log('Existing profiles count:', existingProfiles.length);

  const content = fs.readFileSync('lok_sabha_dataset/Allocated Limit for Honble MPs.csv', 'utf-8');
  const lines = content.split(/\r?\n/);
  const csvMps = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = parseCsvLine(line);
    if (parts.length < 5) continue;
    const srNo = parts[0];
    if (srNo === 'Grand Total' || isNaN(parseInt(srNo, 10))) continue;
    csvMps.push({
      srNo: parseInt(srNo, 10),
      state: parts[1],
      mpName: parts[2],
      constituency: parts[3],
      allocated: parseFloat(parts[4].replace(/,/g, '')) || 0
    });
  }
  console.log('CSV MPs count:', csvMps.length);

  const existingByMpName = new Map();
  const existingByConst = new Map();
  for (const p of existingProfiles) {
    if (p.mp_name) existingByMpName.set(p.mp_name.trim().toLowerCase(), p);
    if (p.constituency) existingByConst.set(p.constituency.trim().toLowerCase(), p);
  }

  const missing = [];
  const matched = [];

  for (const m of csvMps) {
    const nameMatch = existingByMpName.get(m.mpName.trim().toLowerCase());
    const constMatch = existingByConst.get(m.constituency.trim().toLowerCase());
    if (nameMatch || constMatch) {
      matched.push({ csv: m, profile: nameMatch || constMatch });
    } else {
      missing.push(m);
    }
  }

  console.log(`Matched: ${matched.length}, Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing MPs:');
    console.log(JSON.stringify(missing, null, 2));
  }
}

main().catch(console.error);
