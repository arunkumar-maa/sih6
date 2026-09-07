import type { VerificationStatus, VerificationEvent } from '../types';

const KEY = 'mplads-verification-overrides-v1';

export interface VerificationOverride {
  status: VerificationStatus;
  history: VerificationEvent[];
}

export function loadVerificationOverrides(): Record<string, VerificationOverride> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); }
  catch { return {}; }
}

export function saveVerificationOverride(workId: string, override: VerificationOverride) {
  const all = loadVerificationOverrides();
  all[workId] = override;
  try { localStorage.setItem(KEY, JSON.stringify(all)); }
  catch (e) { console.warn('Could not persist verification override', e); }
}
