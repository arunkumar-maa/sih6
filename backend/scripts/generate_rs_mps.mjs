import fs from 'fs';
import path from 'path';

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
      srNo: parseInt(match[1]) || i,
      state: match[2].trim(),
      name: rawName,
      cleanName,
      type: match[4].trim(),
      allocatedAmount: parseFloat(match[5].replace(/[₹,\s]/g, '')) || 0
    });
  }
}

console.log(`Parsed ${rsMps.length} Rajya Sabha MPs.`);
const tsCode = `// Official Rajya Sabha Members (from Allocated Limit for Hon'ble MPs)
export interface RajyaSabhaMP {
  srNo: number;
  state: string;
  name: string;
  cleanName: string;
  type: string;
  allocatedAmount: number;
}

export const RAJYA_SABHA_MPS: RajyaSabhaMP[] = ${JSON.stringify(rsMps, null, 2)};

export const RAJYA_SABHA_MP_NAMES: string[] = RAJYA_SABHA_MPS.map(m => m.name);

export function getRajyaSabhaMPsByState(state?: string): string[] {
  if (!state || state.trim() === '' || state === 'Please Select') {
    return RAJYA_SABHA_MP_NAMES;
  }
  const filtered = RAJYA_SABHA_MPS.filter(m => m.state.toLowerCase() === state.toLowerCase());
  return filtered.length > 0 ? filtered.map(m => m.name) : RAJYA_SABHA_MP_NAMES;
}
`;

fs.mkdirSync('../frontend/src/data', { recursive: true });
fs.mkdirSync('../backend/src/data', { recursive: true });
fs.writeFileSync('../frontend/src/data/rajyaSabhaMPs.ts', tsCode, 'utf8');
fs.writeFileSync('../backend/src/data/rajyaSabhaMPs.ts', tsCode, 'utf8');
console.log('Successfully generated frontend/src/data/rajyaSabhaMPs.ts and backend/src/data/rajyaSabhaMPs.ts');
