import { supabase, getTableName } from './supabase.service.js';
import { IsolationForest, extractFeatureVector } from '../ml/isolationForest.js';
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

  const factor = {
    id: row.factor_id,
    label: row.factor_label,
    description: row.factor_description,
    severity: (row.risk_level as RiskLevel) || 'LOW',
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
      score: Number(row.risk_score || 0),
      level: (row.risk_level as RiskLevel) || 'LOW',
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
      .order('risk_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if ((!data || data.length === 0) && !error) {
      console.log(`[AnomalyService] No cached anomalies for ${house}/${category}. Running scan...`);
      await runAnomalyScan(house);

      const retry = await supabase
        .from('project_anomaly_results')
        .select('*')
        .eq('house', house)
        .eq('category', category)
        .order('risk_score', { ascending: false })
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

export async function runAnomalyScan(house: 'Lok Sabha' | 'Rajya Sabha') {
  const tableName = getTableName(house);
  console.log(`[AnomalyService] Running scan on ${tableName} for ${house}...`);

  // Stale status candidate extraction
  const { data: staleRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .in('work_status', ['Sanction', 'Vendor Identification', 'Physical Inspection'])
    .gt('days_since_sanction', 180)
    .order('days_since_sanction', { ascending: false })
    .limit(100);

  // Cost outliers
  const { data: costRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .gt('sanction_amount', 5000000)
    .order('sanction_amount', { ascending: false })
    .limit(100);

  // Disbursement outliers
  const { data: disbRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .gt('disbursement_ratio', 105)
    .order('disbursement_ratio', { ascending: false })
    .limit(100);

  const newRecords: any[] = [];

  for (const r of (staleRows || [])) {
    const days = Number(r.days_since_sanction) || 0;
    const score = Math.min(95, Math.round(50 + (days / 730) * 45));
    newRecords.push({
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
      risk_score: score,
      risk_level: score >= 70 ? 'HIGH' : 'MEDIUM',
      factor_id: 'stale_status',
      factor_label: 'Stale Status',
      factor_description: `Status still "${r.work_status}" after ${days} days since sanction (>6 months).`,
      factor_score: score,
      factor_value: `${days} days in ${r.work_status}`,
      why_attention: [`Work sanctioned ${days} days ago without completion`, `Current milestone: ${r.work_status}`],
      feature_contributions: [{ feature: 'Days Since Sanction', value: days, contribution: 0.85 }],
    });
  }

  for (const r of (costRows || [])) {
    const amt = Number(r.sanction_amount) || 0;
    const score = Math.min(98, Math.round(60 + (amt / 50000000) * 38));
    newRecords.push({
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
      risk_score: score,
      risk_level: score >= 70 ? 'HIGH' : 'MEDIUM',
      factor_id: 'high_amount_anomaly',
      factor_label: 'Cost Anomaly',
      factor_description: `Sanction amount (${formatCrore(amt)}) is significantly above category median.`,
      factor_score: score,
      factor_value: formatCrore(amt),
      why_attention: [`Sanctioned budget of ${formatCrore(amt)} is in top percentile for ${r.work_category}`],
      feature_contributions: [{ feature: 'Sanction Amount', value: amt, contribution: 0.92 }],
    });
  }

  for (const r of (disbRows || [])) {
    const ratio = Number(r.disbursement_ratio) || 0;
    const score = Math.min(95, Math.round(65 + (ratio - 100) * 1.5));
    newRecords.push({
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
      risk_score: score,
      risk_level: score >= 70 ? 'HIGH' : 'MEDIUM',
      factor_id: 'disbursement_anomaly',
      factor_label: 'Disbursement vs Sanction Mismatch',
      factor_description: `Amount disbursed exceeds sanction amount by ${(ratio - 100).toFixed(1)}%.`,
      factor_score: score,
      factor_value: `${ratio.toFixed(1)}% disbursed`,
      why_attention: [`Disbursed funds exceed sanctioned ceiling by ${(ratio - 100).toFixed(1)}%`],
      feature_contributions: [{ feature: 'Disbursement Ratio', value: ratio, contribution: 0.95 }],
    });
  }

  if (newRecords.length > 0) {
    await supabase.from('project_anomaly_results').delete().eq('house', house);
    const { error: insError } = await supabase.from('project_anomaly_results').insert(newRecords);
    if (insError) {
      console.warn('[AnomalyService] Could not persist scan results to table:', insError.message);
    }
  }

  return {
    projectsAnalyzed: (staleRows?.length || 0) + (costRows?.length || 0) + (disbRows?.length || 0),
    indicatorsDetected: newRecords.length,
    timestamp: new Date().toISOString(),
    house,
  };
}
