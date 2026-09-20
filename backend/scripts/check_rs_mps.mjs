import fs from 'fs';

import path from 'path';

const allocCsv = fs.readFileSync(path.resolve('../rajya_sabha_dataset/Allocated Limit for Honble MPs (2).csv'), 'utf8');
const lines = allocCsv.split('\n').map(l => l.trim()).filter(Boolean);

const rsAllocMps = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Grand Total')) continue;
  // Format: "Sr. No.","State","Hon'ble Members of Parliament","Elected/Nominated","Allocated AMOUNT ( ₹ )"
  const match = line.match(/^"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
  if (match) {
    rsAllocMps.push({
      srNo: match[1],
      state: match[2],
      mp: match[3],
      type: match[4],
      allocated: match[5]
    });
  }
}

console.log('Total Rajya Sabha MPs in Allocated Limit file:', rsAllocMps.length);
console.log('\nFirst 5 Rajya Sabha MPs:');
console.log(rsAllocMps.slice(0, 5));

console.log('\nLast 5 Rajya Sabha MPs:');
console.log(rsAllocMps.slice(-5));

// Check unique states
const states = new Set(rsAllocMps.map(m => m.state).filter(Boolean));
console.log('\nStates represented in RS MPs file:', Array.from(states).sort());
