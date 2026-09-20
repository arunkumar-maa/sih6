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
    const rawName = match[3].trim();
    const cleanName = rawName.replace(/\s*\(\d{4}-\d{2,4}\)/g, '').trim();
    rsMps.push({
      sr_no: parseInt(match[1]) || i,
      state: match[2].trim(),
      mp_name: rawName,
      clean_name: cleanName,
      mp_type: match[4].trim(),
      allocated_amount: parseFloat(match[5].replace(/[₹,\s]/g, '')) || 0
    });
  }
}

console.log(`Inserting ${rsMps.length} Rajya Sabha MPs into Supabase...`);
const { error } = await supabase.from('rajya_sabha_mps').upsert(rsMps, { onConflict: 'sr_no' });

if (error) {
  console.error('Error inserting RS MPs:', error);
  process.exit(1);
}

const { count, error: countErr } = await supabase.from('rajya_sabha_mps').select('*', { count: 'exact', head: true });
console.log(`Successfully verified ${count} Rajya Sabha MPs in database!`);
