import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { REAL_DATASET_STATES, normalizeStateEmailPrefix, normalizeStatePasswordName } from './generate_state_nodal_seed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoAccountsPath = path.resolve(__dirname, '../../frontend/src/data/demoAccounts.json');
const existingAccounts = JSON.parse(fs.readFileSync(demoAccountsPath, 'utf8'));

// Filter out old STATE_NODAL_OFFICER entries
const nonStateAccounts = existingAccounts.filter(a => a.role !== 'STATE_NODAL_OFFICER');

// Build 36 State Nodal Officer accounts
const stateOfficerAccounts = REAL_DATASET_STATES.map(state => {
  const prefix = normalizeStateEmailPrefix(state);
  const pw = `${normalizeStatePasswordName(state)}@123`;
  return {
    role: 'STATE_NODAL_OFFICER',
    email: `${prefix}.nodal@mplads-demo.local`,
    passwordFormat: pw,
    name: `State Nodal Officer - ${state}`,
    scope: `State: ${state}`,
    state: state,
  };
});

// Insert state officers right after MOSPI_ADMIN
const adminAccount = nonStateAccounts.filter(a => a.role === 'MOSPI_ADMIN');
const otherAccounts = nonStateAccounts.filter(a => a.role !== 'MOSPI_ADMIN');

const updatedAccounts = [
  ...adminAccount,
  ...stateOfficerAccounts,
  ...otherAccounts,
];

fs.writeFileSync(demoAccountsPath, JSON.stringify(updatedAccounts, null, 2), 'utf8');
console.log(`Updated demoAccounts.json with ${stateOfficerAccounts.length} State Nodal Officers. Total accounts: ${updatedAccounts.length}`);
