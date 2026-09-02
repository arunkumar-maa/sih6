// CSV Parser for MPLADS datasets
// Handles all 6 provided CSV files with column normalization and type coercion

import Papa from 'papaparse';
import type {
  RawSanctionedWork,
  RawRecommendedWork,
  RawCompletedWork,
  RawExpenditure,
  RawAllocatedLimit,
  RawCalamity,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function parseAmount(val: unknown): number | null {
  if (val === null || val === undefined || val === '' || val === 'NA') return null;
  const str = String(val).replace(/[₹,\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseDate(val: unknown): string {
  if (!val || val === 'NA' || val === 'N/A' || val === '') return '';
  return String(val).trim();
}

function parseCSV(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data.filter(row => {
    // Skip grand total rows
    const firstVal = Object.values(row)[0];
    return firstVal !== 'Grand Total' && firstVal !== '';
  });
}

// Extract work ID from the full Work string
// e.g. "WS/MP394/2025-2026/136038-Construction of community centers..."
// returns "WS/MP394/2025-2026/136038"
export function extractWorkId(workStr: string): string {
  if (!workStr) return '';
  const match = workStr.match(/^((?:WS|NA)\/[^-\s]+\/[^-\s]+\/\d+|WS\/[^-\s]+\/\d+|NA-[^,]+)/);
  if (match) return match[1];
  // Handle "NA-Category name" format
  if (workStr.startsWith('NA-')) return workStr.split(',')[0].trim();
  return workStr.split('-')[0].trim();
}

export function extractCategory(workStr: string): string {
  if (!workStr) return 'Unknown';
  const dashIdx = workStr.indexOf('-');
  if (dashIdx === -1) return workStr;
  return workStr.slice(dashIdx + 1).trim();
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

export function parseSanctionedWorks(csvText: string): RawSanctionedWork[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => {
    const workFullStr = row['Work'] || row['work'] || '';
    return {
      srNo: row['Sr. No.'] || '',
      workCategory: row['Work category'] || row['Work Category'] || '',
      workId: workFullStr,
      state: row['State'] || '',
      ida: row['IDA'] || '',
      mp: row["Hon'ble Members of Parliament"] || row['MP'] || '',
      constituency: row['Constituency'] || '',
      workDescription: row['Work description'] || row['Work Description'] || '',
      recommendedDate: parseDate(row['Recommended date'] || row['Recommended Date']),
      sanctionDate: parseDate(row['Sanction Date']),
      sanctionAmount: parseAmount(row['Sanction Amount ( ₹ )'] || row['Sanction Amount']),
      workStatus: row['Work Status'] || 'Unknown',
    };
  });
}

export function parseRecommendedWorks(csvText: string): RawRecommendedWork[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => {
    const workFullStr = row['WORK'] || row['Work'] || '';
    return {
      srNo: row['Sr. No.'] || '',
      workCategory: row['Work category'] || row['Work Category'] || '',
      workId: workFullStr,
      state: row['State'] || '',
      ida: row['IDA'] || '',
      mp: row["Hon'ble Members of Parliament"] || '',
      constituency: row['Constituency'] || '',
      workDescription: row['Work description'] || row['Work Description'] || '',
      recommendedDate: parseDate(row['Recommended date'] || row['Recommended Date']),
      recommendedAmount: parseAmount(row['RECOMMENDED AMOUNT   ( ₹ )'] || row['Recommended Amount']),
      sanctionDate: parseDate(row['Sanction Date']),
    };
  });
}

export function parseCompletedWorks(csvText: string): RawCompletedWork[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => {
    const workFullStr = row['Work'] || '';
    return {
      srNo: row['Sr. No.'] || '',
      workCategory: row['Work Category'] || '',
      workId: workFullStr,
      state: row['State'] || '',
      ida: row['IDA'] || '',
      workDescription: row['Work Description'] || '',
      mp: row["Hon'ble Members of Parliament"] || '',
      constituency: row['Constituency'] || '',
      image: row['Image'] || '',
      completionDate: parseDate(row['Completion Date']),
      amountDisbursed: parseAmount(row['Amount Disbursed ( ₹ )'] || row['Amount Disbursed']),
    };
  });
}

export function parseExpenditure(csvText: string): RawExpenditure[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => {
    return {
      srNo: row['Sr. No.'] || '',
      state: row['State'] || '',
      workCategory: row['Work'] || '',
      workId: row['Work ID'] || '',
      ida: row['IDA'] || '',
      mp: row["Hon'ble Members of Parliament"] || '',
      constituency: row['Constituency'] || '',
      expenditureDate: parseDate(row['Expenditure Date']),
      vendorName: row['Vendor Name'] || '',
      paymentStatus: row['Payment Status'] || '',
      fundDisbursedAmount: parseAmount(row['Fund Disbursed Amount ( ₹ )'] || row['Fund Disbursed Amount']),
    };
  });
}

export function parseAllocatedLimit(csvText: string): RawAllocatedLimit[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => ({
    srNo: row['Sr. No.'] || '',
    state: row['State'] || '',
    mp: row["Hon'ble Members of Parliaments"] || row["Hon'ble Members of Parliament"] || '',
    constituency: row['Constituency'] || '',
    allocatedAmount: parseAmount(row['Allocated AMOUNT ( ₹ )'] || row['Allocated Amount']),
  }));
}

export function parseCalamity(csvText: string): RawCalamity[] {
  const rows = parseCSV(csvText);
  return rows.map((row) => ({
    srNo: row['Sr. No.'] || '',
    calamityType: row['Calamity Type'] || '',
    calamityName: row['Calamity Name'] || '',
    mp: row["Hon'ble Members of Parliament"] || '',
    dateOfConsent: parseDate(row['Date of Consent']),
    consentAmount: parseAmount(row['Consent Amount ( ₹ )'] || row['Consent Amount']),
  }));
}
