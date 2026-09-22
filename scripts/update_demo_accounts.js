import fs from 'fs';

// 1. Read existing demoAccounts.json
const existing = JSON.parse(fs.readFileSync('frontend/src/data/demoAccounts.json', 'utf-8'));

// Keep all non-MP accounts (Admins, State Nodal, District, Implementing Agency, Auditor)
const nonMpAccounts = existing.filter(a => a.role !== 'MP');

// Keep any Rajya Sabha demo accounts if any
const rsMpAccounts = existing.filter(a => a.role === 'MP' && a.house === 'Rajya Sabha');

// 2. Read all 543 Lok Sabha MPs from CSV
function slugifyConstituency(name) {
  return name
    .toLowerCase()
    .replace(/\s*\((?:sc|st)\)\s*/gi, '')
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
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

const content = fs.readFileSync('lok_sabha_dataset/Allocated Limit for Honble MPs.csv', 'utf-8');
const lines = content.split(/\r?\n/);
const seenSlugs = new Set();
const lsMpAccounts = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = parseCsvLine(line);
  if (parts.length < 5) continue;
  const srNo = parts[0];
  if (srNo === 'Grand Total' || isNaN(parseInt(srNo, 10))) continue;
  const state = parts[1];
  const mpName = parts[2];
  const constituency = parts[3];

  let slug = slugifyConstituency(constituency);
  if (seenSlugs.has(slug)) {
    const stateSlug = slugifyConstituency(state);
    slug = `${slug}_${stateSlug}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}_${srNo}`;
    }
  }
  seenSlugs.add(slug);

  const email = `mp.${slug}@mplads-demo.local`;

  lsMpAccounts.push({
    role: 'MP',
    email,
    passwordFormat: 'Mplads@123',
    name: `Hon'ble MP ${mpName}`,
    scope: `Lok Sabha · ${constituency} (${state})`,
    house: 'Lok Sabha',
    state,
    constituency,
    mpName
  });
}

const finalAccounts = [...nonMpAccounts, ...lsMpAccounts, ...rsMpAccounts];

fs.writeFileSync('frontend/src/data/demoAccounts.json', JSON.stringify(finalAccounts, null, 2));
fs.writeFileSync('backend/src/data/demoAccounts.json', JSON.stringify(finalAccounts, null, 2));

console.log(`Updated demoAccounts.json: Total accounts = ${finalAccounts.length} (Lok Sabha MPs: ${lsMpAccounts.length})`);
