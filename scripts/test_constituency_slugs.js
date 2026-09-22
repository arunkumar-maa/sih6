import fs from 'fs';

function slugifyConstituency(name) {
  return name
    .toLowerCase()
    .replace(/\s*\((?:sc|st)\)\s*/gi, '') // remove (SC) / (ST) suffixes
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
const constituencies = new Map();
const duplicates = [];

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
  // If duplicate slug across different states (e.g. Aurangabad in Bihar vs Maharashtra)
  if (constituencies.has(slug)) {
    const existing = constituencies.get(slug);
    // append state abbreviation or state slug
    const stateSlug = state.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    slug = `${slug}_${stateSlug}`;
    duplicates.push({ original: constituency, state, collidedWith: existing });
  }

  const email = `mp.${slug}@mplads-demo.local`;
  constituencies.set(slug, { srNo, state, mpName, constituency, slug, email });
}

console.log('Total constituencies processed:', constituencies.size);
console.log('Duplicates handled:', duplicates);
console.log('Sample 10 emails:');
const sample = Array.from(constituencies.values()).slice(0, 10);
sample.forEach(s => console.log(`${s.constituency} (${s.state}) => ${s.email}`));
