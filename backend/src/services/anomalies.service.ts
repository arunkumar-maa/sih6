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

export function anomalyRowToEnrichedProject(row: any): EnrichedProject {
  const whyAttention: string[] = Array.isArray(row.why_attention) ? row.why_attention : [];
  const featureContributions = Array.isArray(row.feature_contributions) ? row.feature_contributions : [];

  const projectScore = Number(row.risk_score || 0);
  const projectLevel = getRiskLevel(projectScore);

  const factor = {
    id: row.factor_id,
    label: row.factor_label,
    description: row.factor_description,
    severity: (row.risk_level as RiskLevel) || projectLevel,
    score: Number(row.factor_score || 0),
    available: true,
    value: row.factor_value,
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
    disbursementRatio: row.disbursement_ratio !== null ? Number(row.disbursement_ratio) : null,

    workStatus: (row.work_status as WorkStatus) || 'Unknown',
    paymentStatus: 'Payment In-Progress',
    isCompleted: row.work_status === 'Work Completed',
    isSanctioned: true,
    isRecommendedOnly: row.category === 'pending',

    daysSinceSanction: row.days_since_sanction !== null ? Number(row.days_since_sanction) : null,
    daysSinceRecommendation: null,
    daysToComplete: null,
    vendorName: null,

    risk: {
      score: projectScore,
      level: projectLevel,
      factors: [factor],
      explanation: whyAttention.length > 0 ? whyAttention.join('. ') : row.factor_description,
      factorsAvailable: 1,
      factorsTotal: 6,
    },
  };
}

export async function fetchAnomalyCounts(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnomalyCounts> {
  const defaultCounts: AnomalyCounts = { pending: 0, stale: 0, cost: 0, disbursement: 0, vendor: 0 };

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_dataset_anomaly_counts', {
      p_house: house,
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
    const { data, error } = await supabase
      .from('project_anomaly_results')
      .select('category')
      .eq('house', house);

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
  offset: number = 0
): Promise<EnrichedProject[]> {
  if (category === 'vendor') {
    return [];
  }

  try {
    let { data, error } = await supabase
      .from('project_anomaly_results')
      .select('*')
      .eq('house', house)
      .eq('category', category)
      .order('factor_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if ((!data || data.length === 0) && !error) {
      console.log(`[AnomalyService] No cached anomalies for ${house}/${category}. Running scan...`);
      await runAnomalyScan(house);

      const retry = await supabase
        .from('project_anomaly_results')
        .select('*')
        .eq('house', house)
        .eq('category', category)
        .order('factor_score', { ascending: false })
        .range(offset, offset + limit - 1);

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Failed to fetch anomalies: ${error.message}`);
    }

    return (data || []).map(anomalyRowToEnrichedProject);
  } catch (err) {
    console.error(`[AnomalyService] Error fetching ${category} projects:`, err);
    return [];
  }
}

export async function getCategoryMedians(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<Map<string, number>> {
  const tableName = getTableName(house);
  const { data } = await supabase
    .from(tableName)
    .select('work_category, sanction_amount')
    .gt('sanction_amount', 0)
    .limit(3000);

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
    .limit(100);

  // 2. Stale status (>180 days in early stages)
  const { data: staleRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .in('work_status', ['Vendor Identification', 'Physical Inspection'])
    .gt('days_since_sanction', 180)
    .order('days_since_sanction', { ascending: false })
    .limit(100);

  // 3. Cost outliers: compare against category median ratio >= 2.5
  const { data: topAmountRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('sanction_amount', 0)
    .order('sanction_amount', { ascending: false })
    .limit(300);

  const costCandidates = (topAmountRows || []).filter(r => {
    const amt = Number(r.sanction_amount || 0);
    const median = medians.get(r.work_category) || 250000;
    return median > 0 && (amt / median) >= 2.5;
  }).slice(0, 100);

  // 4. Disbursement outliers (>105% disbursement ratio)
  const { data: disbRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('disbursement_ratio', 105)
    .order('disbursement_ratio', { ascending: false })
    .limit(100);

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
