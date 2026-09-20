import { supabase, getTableName } from './supabase.service.js';
import { getRiskLevel } from '../risk/riskEngine.js';
import { formatCrore } from '../utils/formatters.js';
import type { EnrichedProject, RiskLevel, WorkStatus } from '../types/index.js';

export type AnomalyTab = 'pending' | 'stale' | 'cost' | 'disbursement' | 'vendor';

export interface AnomalyCounts {
  pending: number;
  stale: number;
  cost: number;
  disbursement: number;
  vendor: number;
}

export function anomalyRowToEnrichedProject(row: any, category?: AnomalyTab): EnrichedProject {
  const projectScore = Number(row.risk_score || 0);
  const projectLevel = (row.risk_level as RiskLevel) || getRiskLevel(projectScore);

  const cat = category || (row.category as AnomalyTab) || 'stale';
  const days = Number(row.days_since_sanction) || 0;
  const sanctionAmt = Number(row.sanction_amount) || 0;
  const paidAmt = Number(row.total_paid) || 0;
  const ratio = Math.round(Number(row.disbursement_ratio || (sanctionAmt > 0 ? (paidAmt / sanctionAmt) * 100 : 0)));

  let factorId = row.factor_id;
  let factorLabel = row.factor_label;
  let factorDesc = row.factor_description;
  let factorScore = Number(row.factor_score || 0);
  let factorVal = row.factor_value;
  let whyAttention: string[] = Array.isArray(row.why_attention) ? row.why_attention : [];

  if (!factorId) {
    if (cat === 'pending') {
      factorId = 'pending_recommendation';
      factorLabel = 'Unsanctioned / Stalled Sanction';
      factorDesc = `Administrative sanction granted ${days} days ago without commencement of execution. Verification Recommended.`;
      factorScore = Math.min(95, Math.round(50 + (days / 730) * 45));
      factorVal = `${days} days stagnant`;
      whyAttention = [
        `Administrative sanction granted ${days} days ago without commencement`,
        `Current administrative status: "${row.work_status}"`,
        'Verification Recommended to assess project feasibility',
      ];
    } else if (cat === 'cost') {
      factorId = 'high_amount_anomaly';
      factorLabel = 'Cost Anomaly';
      factorDesc = `Sanction amount of ${formatCrore(sanctionAmt)} exceeds standard expenditure ceiling. Cross-audit Recommended.`;
      factorScore = Math.min(95, Math.round(50 + (sanctionAmt / 10000000) * 20));
      factorVal = formatCrore(sanctionAmt);
      whyAttention = [
        `High sanction allocation of ${formatCrore(sanctionAmt)} exceeding normal thresholds`,
        `Category: ${row.work_category || 'General'}`,
        'Physical milestone verification recommended',
      ];
    } else if (cat === 'disbursement') {
      factorId = 'disbursement_anomaly';
      factorLabel = 'Disbursement Pacing Discrepancy';
      factorDesc = `Disbursed ${formatCrore(paidAmt)} (${ratio}% of sanction) while status remains "${row.work_status}". Verification Recommended.`;
      factorScore = Math.min(95, Math.round(50 + Math.max(0, ratio - 80) * 2));
      factorVal = `${ratio}% disbursed`;
      whyAttention = [
        `${ratio}% of funds disbursed while implementation status is "${row.work_status}"`,
        `Total paid: ${formatCrore(paidAmt)} out of ${formatCrore(sanctionAmt)}`,
        'Cross-verification with physical site inspection recommended',
      ];
    } else {
      // stale
      factorId = 'stale_status';
      factorLabel = 'Stale Administrative Status';
      factorDesc = `Project in preliminary "${row.work_status}" phase for ${days} days without completion. Verification Recommended.`;
      factorScore = Math.min(90, Math.round(40 + (days / 365) * 40));
      factorVal = `${days} days in ${row.work_status}`;
      whyAttention = [
        `Project has remained in "${row.work_status}" phase for ${days} days`,
        'Execution progress verification recommended with IDA',
      ];
    }
  }

  const factor = {
    id: factorId,
    label: factorLabel,
    description: factorDesc,
    severity: (row.risk_level as RiskLevel) || projectLevel,
    score: factorScore,
    available: true,
    value: factorVal,
  };

  return {
    workId: row.work_id,
    srNo: '',
    workCategory: row.work_category || '',
    state: row.state || '',
    ida: '',
    district: row.district || '',
    mp: '',
    constituency: row.constituency || '',
    workDescription: row.work_description || row.work_category || '',
    financialYear: '',
    house: (row.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha',

    recommendedDate: null,
    sanctionDate: null,
    completionDate: null,
    expenditureDate: null,

    sanctionAmount: row.sanction_amount !== null ? Number(row.sanction_amount) : null,
    recommendedAmount: null,
    amountDisbursed: row.total_paid !== null ? Number(row.total_paid) : null,
    expenditureAmount: row.total_paid !== null ? Number(row.total_paid) : null,
    totalPaid: row.total_paid !== null ? Number(row.total_paid) : null,
    allocatedLimit: null,
    disbursementRatio: ratio,

    workStatus: (row.work_status as WorkStatus) || 'Unknown',
    paymentStatus: 'Payment In-Progress',
    isCompleted: row.work_status === 'Work Completed',
    isSanctioned: true,
    isRecommendedOnly: cat === 'pending',

    daysSinceSanction: row.days_since_sanction !== null ? Number(row.days_since_sanction) : null,
    daysSinceRecommendation: null,
    daysToComplete: null,
    vendorName: null,

    risk: {
      score: projectScore,
      level: projectLevel,
      factors: [factor],
      explanation: whyAttention.length > 0 ? whyAttention.join('. ') : factorDesc,
      factorsAvailable: 1,
      factorsTotal: 6,
    },
    whyAttention: whyAttention.length > 0 ? whyAttention : undefined,
  };
}

export async function fetchAnomalyCounts(
  house: 'Lok Sabha' | 'Rajya Sabha',
  state?: string,
  district?: string
): Promise<AnomalyCounts> {
  const defaultCounts: AnomalyCounts = { pending: 0, stale: 0, cost: 0, disbursement: 0, vendor: 0 };

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_dataset_anomaly_counts', {
      p_house: house,
      p_state: state || null,
      p_district: district || null,
    });
    if (!rpcError && rpcData) {
      return {
        pending: Number(rpcData.pending || 0),
        stale: Number(rpcData.stale || 0),
        cost: Number(rpcData.cost || 0),
        disbursement: Number(rpcData.disbursement || 0),
        vendor: Number(rpcData.vendor || 0),
      };
    }
  } catch (err) {
    console.warn('[AnomalyService] RPC get_dataset_anomaly_counts failed, checking table cache:', err);
  }

  try {
    let q = supabase
      .from('project_anomaly_results')
      .select('category')
      .eq('house', house);

    if (state) {
      q = q.eq('state', state);
    }
    if (district) {
      const cleanD = district.split('(')[0].trim();
      q = q.or(`district.eq.${district},district.ilike.${cleanD}%`);
    }

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      const counts = { ...defaultCounts };
      for (const row of data) {
        const cat = row.category as AnomalyTab;
        if (counts[cat] !== undefined) counts[cat]++;
      }
      return counts;
    }
  } catch (err) {
    console.error('[AnomalyService] Table count check failed:', err);
  }

  return defaultCounts;
}

export async function fetchAnomalyProjects(
  house: 'Lok Sabha' | 'Rajya Sabha',
  category: AnomalyTab,
  limit: number = 25,
  offset: number = 0,
  state?: string,
  district?: string
): Promise<EnrichedProject[]> {
  // 1. Try Supabase RPC get_dataset_anomaly_projects
  try {
    const { data, error } = await supabase.rpc('get_dataset_anomaly_projects', {
      p_house: house,
      p_category: category,
      p_limit: limit,
      p_offset: offset,
      p_state: state || null,
      p_district: district || null,
    });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((r: any) => anomalyRowToEnrichedProject(r, category));
    }
  } catch (rpcErr) {
    console.warn(`[AnomalyService] RPC get_dataset_anomaly_projects exception:`, rpcErr);
  }

  // 2. Try project_anomaly_results cache table
  try {
    let q = supabase
      .from('project_anomaly_results')
      .select('*')
      .eq('house', house)
      .eq('category', category);

    if (state) {
      q = q.eq('state', state);
    }
    if (district) {
      const cleanD = district.split('(')[0].trim();
      q = q.or(`district.eq.${district},district.ilike.${cleanD}%`);
    }

    const { data, error } = await q
      .order('factor_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      return data.map((r: any) => anomalyRowToEnrichedProject(r, category));
    }
  } catch (err) {
    console.warn(`[AnomalyService] Table cache fetch error for ${category}:`, err);
  }

  // 3. Resilient database fallback: query primary project table directly using exact anomaly criteria
  try {
    const tbl = getTableName(house);
    let q = supabase.from(tbl).select('*');

    if (state) {
      q = q.eq('state', state);
    }

    if (category === 'pending') {
      q = q.or('and(work_status.eq.Sanction,days_since_sanction.gt.365),is_recommended_only.eq.true,is_sanctioned.eq.false');
    } else if (category === 'stale') {
      q = q.eq('is_completed', false).gt('days_since_sanction', 180).in('work_status', ['Sanction', 'Vendor Identification', 'Physical Inspection']);
    } else if (category === 'cost') {
      q = q.gt('sanction_amount', 2500000);
    } else if (category === 'disbursement') {
      q = q.gt('total_paid', 0).neq('work_status', 'Work Completed').gt('disbursement_ratio', 80);
    } else if (category === 'vendor') {
      q = q.not('vendor_name', 'is', null);
    }

    const { data: directRows, error: directErr } = await q
      .order('risk_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!directErr && directRows && directRows.length > 0) {
      return directRows.map((r: any) => anomalyRowToEnrichedProject(r, category));
    }
  } catch (directExc) {
    console.error(`[AnomalyService] Direct table fallback failed:`, directExc);
  }

  return [];
}

export async function getCategoryMedians(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<Map<string, number>> {
  const tableName = getTableName(house);
  const { data } = await supabase
    .from(tableName)
    .select('work_category, sanction_amount')
    .gt('sanction_amount', 0)
    .limit(10000);

  const byCat = new Map<string, number[]>();
  for (const r of (data || [])) {
    if (r.work_category && r.sanction_amount) {
      const arr = byCat.get(r.work_category) || [];
      arr.push(Number(r.sanction_amount));
      byCat.set(r.work_category, arr);
    }
  }

  const medians = new Map<string, number>();
  byCat.forEach((amounts, cat) => {
    const sorted = [...amounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medians.set(cat, sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]);
  });
  return medians;
}

export async function runAnomalyScan(house: 'Lok Sabha' | 'Rajya Sabha') {
  const tableName = getTableName(house);
  console.log(`[AnomalyService] Running scan on ${tableName} for ${house}...`);

  const medians = await getCategoryMedians(house);

  // 1. Pending/Stalled sanctions (>365 days in Sanction status)
  const { data: pendingRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .eq('work_status', 'Sanction')
    .gt('days_since_sanction', 365)
    .order('days_since_sanction', { ascending: false })
    .limit(1000);

  // 2. Stale status (>180 days in early stages)
  const { data: staleRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .in('work_status', ['Vendor Identification', 'Physical Inspection'])
    .gt('days_since_sanction', 180)
    .order('days_since_sanction', { ascending: false })
    .limit(1000);

  // 3. Cost outliers: compare against category median ratio >= 2.5
  const { data: topAmountRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('sanction_amount', 0)
    .order('sanction_amount', { ascending: false })
    .limit(2000);

  const costCandidates = (topAmountRows || []).filter(r => {
    const amt = Number(r.sanction_amount || 0);
    const median = medians.get(r.work_category) || 250000;
    return median > 0 && (amt / median) >= 2.5;
  }).slice(0, 1000);

  // 4. Disbursement outliers (>105% disbursement ratio)
  const { data: disbRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('disbursement_ratio', 105)
    .order('disbursement_ratio', { ascending: false })
    .limit(1000);

  const newRecords: any[] = [];
  const processedKeys = new Set<string>();

  for (const r of (pendingRows || [])) {
    const id = `${house}_pending_${r.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const days = Number(r.days_since_sanction) || 0;
    const factorScore = Math.min(95, Math.round(50 + (days / 730) * 45));
    const realScore = Number(r.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: r.work_id,
      house,
      category: 'pending',
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: days,
      disbursement_ratio: r.disbursement_ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'pending_recommendation',
      factor_label: 'Unsanctioned / Stalled Sanction',
      factor_description: `Administrative sanction granted ${days} days ago, but work has not commenced execution. Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${days} days stagnant`,
      why_attention: [
        `Work sanctioned ${days} days ago without commencement of execution`,
        `Current administrative status: "${r.work_status}"`,
        'Verification Recommended to assess project feasibility',
      ],
      feature_contributions: [{ feature: 'Stagnant Duration', value: days, contribution: 0.85 }],
      analyzed_at: new Date().toISOString(),
    });
  }

  for (const r of (staleRows || [])) {
    const id = `${house}_stale_${r.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const days = Number(r.days_since_sanction) || 0;
    const factorScore = Math.min(95, Math.round(50 + (days / 730) * 45));
    const realScore = Number(r.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: r.work_id,
      house,
      category: 'stale',
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: days,
      disbursement_ratio: r.disbursement_ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'stale_status',
      factor_label: 'Stale Status Indicator',
      factor_description: `Status still "${r.work_status}" after ${days} days since sanction (>6 months). Requires Attention.`,
      factor_score: factorScore,
      factor_value: `${days} days in ${r.work_status}`,
      why_attention: [
        `Work sanctioned ${days} days ago without reaching completion`,
        `Current milestone: ${r.work_status}`,
        'Timeline delay detected — Verification Recommended',
      ],
      feature_contributions: [{ feature: 'Days Since Sanction', value: days, contribution: 0.85 }],
      analyzed_at: new Date().toISOString(),
    });
  }

  for (const r of costCandidates) {
    const id = `${house}_cost_${r.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const amt = Number(r.sanction_amount) || 0;
    const median = medians.get(r.work_category) || 250000;
    const ratio = median > 0 ? amt / median : 1;
    const factorScore = Math.min(98, Math.round(45 + Math.min(50, (ratio - 1) * 15)));
    const realScore = Number(r.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: r.work_id,
      house,
      category: 'cost',
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: amt,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: r.disbursement_ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'high_amount_anomaly',
      factor_label: 'Cost Anomaly Indicator',
      factor_description: `Sanction amount (${formatCrore(amt)}) is ${ratio.toFixed(1)}x category median (${formatCrore(median)}). Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${ratio.toFixed(1)}x median (${formatCrore(amt)})`,
      why_attention: [
        `Sanctioned budget of ${formatCrore(amt)} is ${ratio.toFixed(1)}x higher than category median`,
        `Work category: ${r.work_category}`,
        'High budget variance — cost justification review recommended',
      ],
      feature_contributions: [{ feature: 'Budget Variance Ratio', value: ratio, contribution: 0.92 }],
      analyzed_at: new Date().toISOString(),
    });
  }

  for (const r of (disbRows || [])) {
    const id = `${house}_disbursement_${r.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const ratio = Number(r.disbursement_ratio) || 0;
    const factorScore = Math.min(95, Math.round(65 + (ratio - 100) * 1.5));
    const realScore = Number(r.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: r.work_id,
      house,
      category: 'disbursement',
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'disbursement_anomaly',
      factor_label: 'Disbursement Variance Indicator',
      factor_description: `Disbursed amount exceeds sanction ceiling by ${(ratio - 100).toFixed(1)}%. Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${ratio.toFixed(1)}% disbursed`,
      why_attention: [
        `Disbursed funds exceed sanctioned allocation by ${(ratio - 100).toFixed(1)}%`,
        'Accounting cross-verification with implementing agency recommended',
      ],
      feature_contributions: [{ feature: 'Disbursement Ratio', value: ratio, contribution: 0.95 }],
      analyzed_at: new Date().toISOString(),
    });
  }

  if (newRecords.length > 0) {
    await supabase.from('project_anomaly_results').delete().eq('house', house);
    const batchSize = 50;
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      const { error: insError } = await supabase.from('project_anomaly_results').insert(batch);
      if (insError) {
        console.warn('[AnomalyService] Could not persist scan results to table:', insError.message);
      }
    }
  }

  return {
    projectsAnalyzed: (pendingRows?.length || 0) + (staleRows?.length || 0) + costCandidates.length + (disbRows?.length || 0),
    indicatorsDetected: newRecords.length,
    timestamp: new Date().toISOString(),
    house,
  };
}
