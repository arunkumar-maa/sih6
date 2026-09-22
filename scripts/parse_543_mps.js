import fs from 'fs';

const content = fs.readFileSync('lok_sabha_dataset/Allocated Limit for Honble MPs.csv', 'utf-8');
const lines = content.split(/\r?\n/);

function parseCsvLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += ch;
    }
  }
  result.push(curr.trim());
  return result;
}

const mps = [];
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
  const allocated = parseFloat(parts[4].replace(/,/g, '')) || 0;
  mps.push({
    srNo: parseInt(srNo, 10),
    state,
    mpName,
    constituency,
    allocated
  });
}

console.log('Total parsed MPs:', mps.length);
console.log('First 3:', mps.slice(0, 3));
console.log('Last 3:', mps.slice(-3));
