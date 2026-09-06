import fs from 'fs';
import Papa from 'papaparse';
import { differenceInDays } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('=== MPLADS SENTINEL: SUPABASE DATA MIGRATION ===');
console.log('Target URL:', SUPABASE_URL);

// ─── Helpers (mirroring src/data/processor.ts and parser.ts) ───────────────────

function parseAmount(val) {
  if (val === null || val === undefined || val === '' || val === 'NA') return null;
  const str = String(val).replace(/[₹,\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NA' || dateStr === 'N/A' || dateStr.trim() === '') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

function extractCleanWorkId(workId) {
  if (!workId) return '';
  const match = workId.match(/^((?:WS|NA)\/[^/]+\/\d{4}-\d{4}\/\d+)/);
  if (match) return match[1];
  const dashIdx = workId.indexOf('-');
  if (dashIdx > 10) return workId.slice(0, dashIdx);
  return workId;
}

function extractWorkCategory(workId, rawCategory) {
  if (rawCategory && rawCategory !== 'Normal/Others') return rawCategory;
  const dashIdx = workId.indexOf('-');
  if (dashIdx !== -1 && dashIdx < workId.length - 1) {
    return workId.slice(dashIdx + 1).trim();
  }
  return rawCategory || 'Unknown';
}

function extractFinancialYear(workId) {
  const match = workId.match(/(\d{4}-\d{4})/);
  return match ? match[1] : 'Unknown';
}

function normalizeWorkStatus(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('completed')) return 'Work Completed';
  if (s.includes('in progress') || s.includes('inprogress')) return 'Work In Progress';
  if (s.includes('physical')) return 'Physical Inspection';
  if (s.includes('vendor')) return 'Vendor Identification';
  if (s.includes('sanction')) return 'Sanction';
  return 'Unknown';
}

function normalizePaymentStatus(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('completed')) return 'Payment Completed';
  if (s.includes('progress')) return 'Payment In-Progress';
  return 'Unknown';
}

function daysSince(d) {
  if (!d) return null;
  return differenceInDays(new Date(), d);
}

function extractDistrict(ida) {
  if (!ida) return 'Unknown';
  let clean = ida.replace(/^(IDA|DC|DM|Collector|District Collector)\s*[-:]?\s*/i, '').trim();
  clean = clean.replace(/\s+(District|Office|Collectorate|Collector)$/i, '').trim();
  return clean || 'Unknown';
}

// ─── Risk Scoring Engine ───────────────────────────────────────────────────────

function buildCategoryMedians(projects) {
  const byCat = {};
  for (const p of projects) {
    if (p.sanctionAmount && p.sanctionAmount > 0) {
      if (!byCat[p.workCategory]) byCat[p.workCategory] = [];
      byCat[p.workCategory].push(p.sanctionAmount);
    }
  }
  const medians = {};
  for (const [cat, vals] of Object.entries(byCat)) {
    vals.sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    medians[cat] = vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  }
  return medians;
}

function buildVendorCounts(projects) {
  const counts = {};
  for (const p of projects) {
    if (p.vendorName) {
      const k = p.vendorName.trim().toUpperCase();
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts;
}

function calculateRiskScore(project, categoryMedians, vendorCounts) {
  const factors = [];
  let availableCount = 0;

  // Factor 1: Progress vs Expenditure Mismatch
  if (project.sanctionAmount !== null && project.sanctionAmount > 0 && project.totalPaid !== null) {
    availableCount++;
    const ratio = (project.totalPaid / project.sanctionAmount) * 100;
    if (ratio > 110 && !project.isCompleted) {
      factors.push({
        id: 'EXPENDITURE_OVERRUN',
        label: 'Disbursement Exceeds Sanction',
        description: `Disbursed amount is ${ratio.toFixed(0)}% of sanctioned amount while incomplete`,
        severity: 'HIGH',
        score: 35,
        available: true,
        value: `${ratio.toFixed(0)}%`,
      });
    } else if (ratio > 80 && project.workStatus === 'Sanction') {
      factors.push({
        id: 'EARLY_HIGH_DISBURSEMENT',
        label: 'High Disbursement in Early Stage',
        description: `${ratio.toFixed(0)}% disbursed while work is still in Sanction stage`,
        severity: 'MEDIUM',
        score: 20,
        available: true,
        value: `${ratio.toFixed(0)}%`,
      });
    }
  }

  // Factor 2: Prolonged Inactivity
  if (project.daysSinceSanction !== null && !project.isCompleted) {
    availableCount++;
    if (project.daysSinceSanction > 730) {
      factors.push({
        id: 'EXTREME_DELAY',
        label: 'Prolonged Work Inactivity',
        description: `Over ${Math.floor(project.daysSinceSanction / 365)} years since sanction with work incomplete`,
        severity: 'HIGH',
        score: 30,
        available: true,
        value: `${project.daysSinceSanction} days`,
      });
    } else if (project.daysSinceSanction > 365) {
      factors.push({
        id: 'MODERATE_DELAY',
        label: 'Work Inactivity > 1 Year',
        description: `${project.daysSinceSanction} days elapsed since sanction`,
        severity: 'MEDIUM',
        score: 15,
        available: true,
        value: `${project.daysSinceSanction} days`,
      });
    }
  }

  // Factor 3: Cost Outlier
  const median = categoryMedians[project.workCategory];
  if (median && project.sanctionAmount !== null && project.sanctionAmount > 0) {
    availableCount++;
    const ratio = project.sanctionAmount / median;
    if (ratio >= 3.0) {
      factors.push({
        id: 'COST_ANOMALY_HIGH',
        label: 'Sanction Cost Outlier',
        description: `Sanctioned amount is ${ratio.toFixed(1)}x the category median`,
        severity: 'HIGH',
        score: 25,
        available: true,
        value: `${ratio.toFixed(1)}x median`,
      });
    } else if (ratio >= 2.0) {
      factors.push({
        id: 'COST_ANOMALY_MODERATE',
        label: 'Elevated Sanction Cost',
        description: `Sanctioned amount is ${ratio.toFixed(1)}x the category median`,
        severity: 'MEDIUM',
        score: 12,
        available: true,
        value: `${ratio.toFixed(1)}x median`,
      });
    }
  }

  // Factor 4: Vendor Concentration
  if (project.vendorName) {
    availableCount++;
    const vendorCount = vendorCounts[project.vendorName.trim().toUpperCase()] || 0;
    if (vendorCount >= 15) {
      factors.push({
        id: 'VENDOR_CONCENTRATION_HIGH',
        label: 'High Vendor Concentration',
        description: `Vendor assigned to ${vendorCount} works in dataset`,
        severity: 'HIGH',
        score: 20,
        available: true,
        value: `${vendorCount} works`,
      });
    } else if (vendorCount >= 8) {
      factors.push({
        id: 'VENDOR_CONCENTRATION_MODERATE',
        label: 'Moderate Vendor Concentration',
        description: `Vendor assigned to ${vendorCount} works in dataset`,
        severity: 'MEDIUM',
        score: 10,
        available: true,
        value: `${vendorCount} works`,
      });
    }
  }

  // Factor 5: Fast Completion (< 7 days)
  if (project.daysToComplete !== null) {
    availableCount++;
    if (project.daysToComplete < 7 && project.daysToComplete >= 0) {
      factors.push({
        id: 'RAPID_COMPLETION',
        label: 'Unusually Rapid Completion',
        description: `Completed in only ${project.daysToComplete} days from sanction`,
        severity: 'MEDIUM',
        score: 15,
        available: true,
        value: `${project.daysToComplete} days`,
      });
    }
  }

  const rawScore = factors.reduce((sum, f) => sum + f.score, 0);
  const score = Math.min(100, Math.max(0, rawScore));
  let level = 'LOW';
  if (score >= 55) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  const explanation = factors.length === 0
    ? 'Standard operational parameters. No elevated risk indicators identified.'
    : `Elevated attention advised: ${factors.map(f => f.label).join('; ')}.`;

  return {
    score,
    level,
    factors,
    explanation,
    factorsAvailable: availableCount,
    factorsTotal: 5,
  };
}

// ─── Process Dataset Files ─────────────────────────────────────────────────────

function loadAndProcess(dir, suffix, houseName) {
  console.log(`\nReading ${houseName} CSVs from ${dir}...`);
  const sancRaw = fs.readFileSync(`${dir}/Works Sanctioned${suffix}.csv`, 'utf8');
  const sanc = Papa.parse(sancRaw, { header: true, skipEmptyLines: true }).data
    .filter(r => !Object.values(r)[0]?.toLowerCase().includes('grand total'));

  const recRaw = fs.readFileSync(`${dir}/Works Recommended${suffix}.csv`, 'utf8');
  const rec = Papa.parse(recRaw, { header: true, skipEmptyLines: true }).data
    .filter(r => !Object.values(r)[0]?.toLowerCase().includes('grand total'));

  const compRaw = fs.readFileSync(`${dir}/Works Completed${suffix}.csv`, 'utf8');
  const comp = Papa.parse(compRaw, { header: true, skipEmptyLines: true }).data
    .filter(r => !Object.values(r)[0]?.toLowerCase().includes('grand total'));

  const expRaw = fs.readFileSync(`${dir}/Expenditure on Completed and On-going Works as on Date${suffix}.csv`, 'utf8');
  const exp = Papa.parse(expRaw, { header: true, skipEmptyLines: true }).data
    .filter(r => !Object.values(r)[0]?.toLowerCase().includes('grand total'));

  const allocRaw = fs.readFileSync(`${dir}/Allocated Limit for Honble MPs${suffix}.csv`, 'utf8');
  const alloc = Papa.parse(allocRaw, { header: true, skipEmptyLines: true }).data
    .filter(r => !Object.values(r)[0]?.toLowerCase().includes('grand total'));

  console.log(`Raw records: Sanctioned=${sanc.length}, Recommended=${rec.length}, Completed=${comp.length}, Expenditure=${exp.length}`);

  const compByWorkId = new Map();
  for (const c of comp) {
    const rawId = c['Work'] || c['workId'] || c['WORK'];
    const id = extractCleanWorkId(rawId);
    if (id) compByWorkId.set(id, c);
  }

  const expByWorkId = new Map();
  for (const e of exp) {
    const rawId = e['Work'] || e['Work ID'] || e['workId'];
    const id = (rawId || '').trim();
    if (id) expByWorkId.set(id, e);
  }

  const allocByMP = new Map();
  for (const a of alloc) {
    const mp = (a["Hon'ble Members of Parliaments"] || a["Hon'ble Members of Parliament"] || a['MP'] || '').trim().toUpperCase();
    const amt = parseAmount(a['Allocated AMOUNT ( ₹ )'] || a['Allocated Amount']);
    if (mp) allocByMP.set(mp, amt);
  }

  const projects = [];
  const sanctionedIds = new Set();

  for (const s of sanc) {
    const rawWork = s['Work'] || s['workId'] || s['WORK'];
    const cleanId = extractCleanWorkId(rawWork);
    if (!cleanId) continue;
    sanctionedIds.add(cleanId);

    const compEntry = compByWorkId.get(cleanId);
    const expEntry = expByWorkId.get(cleanId);

    const sanctionDate = parseDate(s['Sanction Date'] || s['sanctionDate']);
    const recDate = parseDate(s['Recommended date'] || s['recommendedDate']);
    const compDate = compEntry ? parseDate(compEntry['Completion Date'] || compEntry['completionDate']) : null;
    const expDate = expEntry ? parseDate(expEntry['Expenditure Date'] || expEntry['expenditureDate']) : null;

    const sanctionAmount = parseAmount(s['Sanction Amount ( ₹ )'] || s['Sanction Amount']);
    const amountDisbursed = compEntry ? parseAmount(compEntry['Amount Disbursed ( ₹ )'] || compEntry['amountDisbursed']) : null;
    const expAmt = expEntry ? parseAmount(expEntry['Fund Disbursed Amount ( ₹ )'] || expEntry['fundDisbursedAmount']) : null;
    const totalPaid = amountDisbursed !== null ? amountDisbursed : (expAmt !== null ? expAmt : null);

    const disbursementRatio = (totalPaid !== null && sanctionAmount && sanctionAmount > 0)
      ? (totalPaid / sanctionAmount) * 100
      : null;

    const rawIda = s['IDA'] || s['ida'] || '';
    const district = extractDistrict(rawIda);
    const fy = extractFinancialYear(rawWork);
    const rawCategory = s['Work category'] || s['Work Category'] || s['workCategory'] || '';
    const workCategory = extractWorkCategory(rawWork, rawCategory);
    const workStatus = normalizeWorkStatus(s['Work Status'] || s['workStatus'] || '');
    const isCompleted = workStatus === 'Work Completed' || compDate !== null;
    const mp = s["Hon'ble Members of Parliament"] || s['MP'] || '';
    const mpKey = mp.trim().toUpperCase();

    projects.push({
      workId: cleanId,
      srNo: s['Sr. No.'] || s['srNo'] || '',
      workCategory,
      state: s['State'] || s['state'] || '',
      ida: rawIda,
      district,
      mp,
      constituency: s['Constituency'] || s['constituency'] || '',
      workDescription: s['Work description'] || s['Work Description'] || s['workDescription'] || '',
      financialYear: fy,
      house: houseName,

      recommendedDate: recDate,
      sanctionDate,
      completionDate: compDate,
      expenditureDate: expDate,

      sanctionAmount,
      recommendedAmount: null,
      amountDisbursed,
      expenditureAmount: expAmt,
      totalPaid,
      allocatedLimit: allocByMP.get(mpKey) ?? null,
      disbursementRatio,

      workStatus,
      paymentStatus: expEntry ? normalizePaymentStatus(expEntry['Payment Status']) : 'Unknown',
      isCompleted,
      isSanctioned: true,
      isRecommendedOnly: false,

      daysSinceSanction: daysSince(sanctionDate),
      daysSinceRecommendation: daysSince(recDate),
      daysToComplete: (sanctionDate && compDate) ? differenceInDays(compDate, sanctionDate) : null,
      vendorName: expEntry ? (expEntry['Vendor Name'] || null) : null,

      risk: null,
      verificationStatus: 'New Alert',
      verificationHistory: [],
    });
  }

  // Recommended only (never sanctioned)
  for (const r of rec) {
    const rawWork = r['WORK'] || r['Work'] || r['workId'];
    const cleanId = extractCleanWorkId(rawWork);
    if (!cleanId || cleanId.startsWith('NA') || sanctionedIds.has(cleanId)) continue;
    const sDate = r['Sanction Date'] || r['sanctionDate'];
    if (sDate && sDate !== 'NA' && sDate !== '') continue;

    const recDate = parseDate(r['Recommended date'] || r['recommendedDate']);
    const rawIda = r['IDA'] || r['ida'] || '';
    const district = extractDistrict(rawIda);
    const fy = extractFinancialYear(rawWork);
    const rawCategory = r['Work category'] || r['Work Category'] || '';
    const workCategory = extractWorkCategory(rawWork, rawCategory);
    const mp = r["Hon'ble Members of Parliament"] || r['MP'] || '';
    const mpKey = mp.trim().toUpperCase();

    projects.push({
      workId: cleanId,
      srNo: r['Sr. No.'] || '',
      workCategory,
      state: r['State'] || '',
      ida: rawIda,
      district,
      mp,
      constituency: r['Constituency'] || '',
      workDescription: r['Work description'] || '',
      financialYear: fy,
      house: houseName,

      recommendedDate: recDate,
      sanctionDate: null,
      completionDate: null,
      expenditureDate: null,

      sanctionAmount: null,
      recommendedAmount: parseAmount(r['RECOMMENDED AMOUNT   ( ₹ )'] || r['Recommended Amount']),
      amountDisbursed: null,
      expenditureAmount: null,
      totalPaid: null,
      allocatedLimit: allocByMP.get(mpKey) ?? null,
      disbursementRatio: null,

      workStatus: 'Unknown',
      paymentStatus: 'Unknown',
      isCompleted: false,
      isSanctioned: false,
      isRecommendedOnly: true,

      daysSinceSanction: null,
      daysSinceRecommendation: daysSince(recDate),
      daysToComplete: null,
      vendorName: null,

      risk: null,
      verificationStatus: 'New Alert',
      verificationHistory: [],
    });
  }

  // Compute AI Risk Scores
  console.log(`Computing risk engine across ${projects.length} ${houseName} projects...`);
  const categoryMedians = buildCategoryMedians(projects);
  const vendorCounts = buildVendorCounts(projects);

  for (const p of projects) {
    p.risk = calculateRiskScore(p, categoryMedians, vendorCounts);
  }

  console.log(`Finished processing: ${projects.length} enriched projects`);
  return projects;
}

// ─── Supabase Batch Uploader ───────────────────────────────────────────────────

async function uploadInBatches(tableName, projects) {
  console.log(`\nUploading ${projects.length} records to table '${tableName}'...`);
  const BATCH_SIZE = 1000;
  let inserted = 0;

  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const chunk = projects.slice(i, i + BATCH_SIZE);
    const rows = chunk.map(p => ({
      id: p.workId,
      work_id: p.workId,
      sr_no: p.srNo,
      work_category: p.workCategory,
      state: p.state,
      ida: p.ida,
      district: p.district,
      mp_name: p.mp,
      constituency: p.constituency,
      work_description: p.workDescription,
      financial_year: p.financialYear,
      house: p.house,

      recommended_date: p.recommendedDate ? p.recommendedDate.toISOString() : null,
      sanction_date: p.sanctionDate ? p.sanctionDate.toISOString() : null,
      completion_date: p.completionDate ? p.completionDate.toISOString() : null,
      expenditure_date: p.expenditureDate ? p.expenditureDate.toISOString() : null,

      sanction_amount: p.sanctionAmount,
      recommended_amount: p.recommendedAmount,
      amount_disbursed: p.amountDisbursed,
      expenditure_amount: p.expenditureAmount,
      total_paid: p.totalPaid,
      allocated_limit: p.allocatedLimit,
      disbursement_ratio: p.disbursementRatio,

      work_status: p.workStatus,
      payment_status: p.paymentStatus,
      is_completed: p.isCompleted,
      is_sanctioned: p.isSanctioned,
      is_recommended_only: p.isRecommendedOnly,

      days_since_sanction: p.daysSinceSanction,
      days_since_recommendation: p.daysSinceRecommendation,
      days_to_complete: p.daysToComplete,
      vendor_name: p.vendorName,

      risk_score: p.risk?.score ?? 0,
      risk_level: p.risk?.level ?? 'LOW',
      risk_factors: p.risk?.factors ?? [],
      risk_explanation: p.risk?.explanation ?? '',

      verification_status: p.verificationStatus ?? 'New Alert',
      verification_history: p.verificationHistory ?? [],
    }));

    const { error } = await supabase.from(tableName).upsert(rows, { onConflict: 'work_id' });
    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
      throw error;
    }
    inserted += rows.length;
    process.stdout.write(`\rProgress: ${inserted}/${projects.length} rows inserted into ${tableName}...`);
  }
  console.log(`\nSuccessfully uploaded ${inserted} records into ${tableName}!`);
}

// ─── Main Execution ───────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  // 1. Lok Sabha
  const lsProjects = loadAndProcess('./lok_sabha_dataset', '', 'Lok Sabha');
  await uploadInBatches('lok_sabha_projects', lsProjects);

  // 2. Rajya Sabha
  const rsProjects = loadAndProcess('./rajya_sabha_dataset', ' (2)', 'Rajya Sabha');
  await uploadInBatches('rajya_sabha_projects', rsProjects);

  // 3. Verification
  console.log('\nVerifying record counts directly in Supabase...');
  const { count: lsCount, error: lsErr } = await supabase
    .from('lok_sabha_projects')
    .select('*', { count: 'exact', head: true });

  const { count: rsCount, error: rsErr } = await supabase
    .from('rajya_sabha_projects')
    .select('*', { count: 'exact', head: true });

  if (lsErr) console.error('Lok Sabha count error:', lsErr);
  if (rsErr) console.error('Rajya Sabha count error:', rsErr);

  console.log('\n=== MIGRATION VERIFICATION REPORT ===');
  console.log(`Lok Sabha source records:   ${lsProjects.length}`);
  console.log(`Lok Sabha Supabase records: ${lsCount}`);
  console.log(`Rajya Sabha source records:   ${rsProjects.length}`);
  console.log(`Rajya Sabha Supabase records: ${rsCount}`);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nMigration completed in ${totalTime}s`);

  if (lsCount !== lsProjects.length || rsCount !== rsProjects.length) {
    console.error('ERROR: Record counts do not match exactly! Please investigate.');
    process.exit(1);
  } else {
    console.log('SUCCESS: All record counts match 100% with zero data loss!');
  }
}

main().catch(err => {
  console.error('Migration failed with error:', err);
  process.exit(1);
});
