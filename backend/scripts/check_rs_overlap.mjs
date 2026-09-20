import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const allocCsv = fs.readFileSync(path.resolve('../rajya_sabha_dataset/Allocated Limit for Honble MPs (2).csv'), 'utf8');
const lines = allocCsv.split('\n').map(l => l.trim()).filter(Boolean);

const rsMps = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Grand Total')) continue;
  const match = line.match(/^"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
  if (match) {
    rsMps.push({
      srNo: match[1],
      state: match[2],
      mp: match[3],
      cleanName: match[3].replace(/\s*\([^)]*\)/g, '').trim(),
      type: match[4]
    });
  }
}

async function checkOverlap() {
  const { data: dbMps, error } = await supabase
    .from('rajya_sabha_projects')
    .select('mp_name')
    .limit(1000);

  const dbMpSet = new Set((dbMps || []).map(r => r.mp_name));
  console.log('Sample db mp_names in rajya_sabha_projects (first 5):', Array.from(dbMpSet).slice(0, 5));

  let matches = 0;
  for (const r of rsMps) {
    if (dbMpSet.has(r.mp) || dbMpSet.has(r.cleanName)) {
      matches++;
    }
  }
  console.log(`Exact matches in first 1000 rows: ${matches}`);
}

checkOverlap();
