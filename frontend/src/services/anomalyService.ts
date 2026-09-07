import { supabase } from './client';
import type { EnrichedProject, RiskLevel, WorkStatus } from '../types';
import { getRiskLevel } from '../utils/risk';
import { IsolationForest, extractFeatureVector } from '../utils/isolationForest';
import { formatCurrency } from '../utils';

export type AnomalyTab = 'pending' | 'stale' | 'cost' | 'disbursement' | 'vendor';

export interface AnomalyCounts {
  pending: number;
  stale: number;
  cost: number;
  disbursement: number;
  vendor: number;
}

export interface AnalysisSummary {
  projectsAnalyzed: number;
  indicatorsDetected: number;
  timestamp: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
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

    verificationStatus: 'New Alert',
    verificationHistory: [],
    whyAttention: whyAttention.length > 0 ? whyAttention : undefined,
    featureContributions: featureContributions.length > 0 ? featureContributions : undefined,
  };
}

export async function getCategoryMedians(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<Map<string, number>> {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data, error } = await supabase
    .from(tableName)
    .select('work_category, sanction_amount')
    .gt('sanction_amount', 0)
    .limit(1000);

  const medians = new Map<string, number>();
  if (error || !data) return medians;

  const byCat = new Map<string, number[]>();
  for (const row of data) {
    const cat = row.work_category || 'General';
    const amt = Number(row.sanction_amount);
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(amt);
  }

  byCat.forEach((amts, cat) => {
    amts.sort((a, b) => a - b);
    const mid = Math.floor(amts.length / 2);
    medians.set(cat, amts.length % 2 === 0 ? (amts[mid - 1] + amts[mid]) / 2 : amts[mid]);
  });

  return medians;
}

export async function getAnomalyCounts(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnomalyCounts> {
  const defaultCounts: AnomalyCounts = {
    pending: 0,
    stale: 0,
    cost: 0,
    disbursement: 0,
    vendor: 0,
  };

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
  } catch (rpcErr) {
    console.warn('[AnomalyService] RPC get_dataset_anomaly_counts failed, checking table:', rpcErr);
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
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      }
      return counts;
    }
  } catch (tblErr) {
    console.error('[AnomalyService] Table count check failed:', tblErr);
  }

  return defaultCounts;
}

export async function getAnomalyProjects(
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
      console.log(`[AnomalyService] No cached anomalies for ${house} / ${category}. Running initial analysis...`);
      await runHouseAnomalyAnalysis(house);

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
      console.error(`[AnomalyService] Error fetching ${category} projects:`, error);
      return [];
    }

    return (data || []).map(anomalyRowToEnrichedProject);
  } catch (err) {
    console.error(`[AnomalyService] Exception fetching ${category} projects:`, err);
    return [];
  }
}

export async function runHouseAnomalyAnalysis(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnalysisSummary> {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  console.log(`[AnomalyService] Starting anomaly analysis for ${house} on ${tableName}...`);

  const medians = await getCategoryMedians(house);

  const { data: staleRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .in('work_status', ['Sanction', 'Vendor Identification', 'Physical Inspection'])
    .gt('days_since_sanction', 180)
    .order('days_since_sanction', { ascending: false })
    .limit(100);

  const { data: costRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('sanction_amount', 5000000)
    .order('sanction_amount', { ascending: false })
    .limit(100);

  const { data: disbRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio, risk_score, risk_level')
    .gt('disbursement_ratio', 105)
    .order('disbursement_ratio', { ascending: false })
    .limit(100);

  const allCandidateRows = [
    ...(staleRows || []),
    ...(costRows || []),
    ...(disbRows || []),
  ];

  const candidateMap = new Map<string, any>();
  for (const row of allCandidateRows) {
    if (!candidateMap.has(row.work_id)) {
      candidateMap.set(row.work_id, row);
    }
  }
  const uniqueCandidates = Array.from(candidateMap.values());

  const featureVectors = uniqueCandidates.map(c =>
    extractFeatureVector(
      c.work_id,
      Number(c.sanction_amount),
      Number(c.total_paid),
      c.work_status,
      Number(c.days_since_sanction),
      medians.get(c.work_category) || 250000
    )
  );

  const iforest = new IsolationForest(50, 64);
  iforest.fit(featureVectors);
  const iforestResults = featureVectors.map(fv => iforest.predict(fv));
  const iforestMap = new Map(iforestResults.map(r => [r.workId, r]));

  const newRecords: any[] = [];
  const processedKeys = new Set<string>();

  for (const row of (staleRows || [])) {
    const id = `${house}_stale_${row.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const ifResult = iforestMap.get(row.work_id);
    const days = Number(row.days_since_sanction) || 0;
    const ruleScore = days > 365 ? 65 : 40;
    const mlScore = ifResult?.anomalyScore || 50;
    const factorScore = Math.min(95, Math.round(0.6 * ruleScore + 0.4 * mlScore));
    const realScore = Number(row.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: row.work_id,
      house,
      category: 'stale',
      work_description: row.work_description || row.work_category,
      work_category: row.work_category,
      state: row.state,
      district: row.district,
      constituency: row.constituency,
      sanction_amount: row.sanction_amount,
      total_paid: row.total_paid,
      work_status: row.work_status,
      days_since_sanction: days,
      disbursement_ratio: row.disbursement_ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'stale_status',
      factor_label: 'Stale Status Indicator',
      factor_description: `Status still "${row.work_status}" after ${days} days since sanction (>6 months). Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${days} days in ${row.work_status}`,
      why_attention: [
        `Work sanctioned ${days} days ago without completion`,
        `Current milestone: ${row.work_status}`,
        'Timeline delay detected — Verification Recommended',
        ...(ifResult?.contributions.map(c => `${c.name}: ${c.detail}`) || []),
      ],
      feature_contributions: ifResult?.contributions || [],
      analyzed_at: new Date().toISOString(),
    });
  }

  for (const row of (costRows || [])) {
    const id = `${house}_cost_${row.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const ifResult = iforestMap.get(row.work_id);
    const amt = Number(row.sanction_amount) || 0;
    const median = medians.get(row.work_category) || 250000;
    const ratio = median > 0 ? amt / median : 1;
    const ruleScore = ratio >= 5.0 ? 75 : 45;
    const mlScore = ifResult?.anomalyScore || 55;
    const factorScore = Math.min(98, Math.round(0.65 * ruleScore + 0.35 * mlScore));
    const realScore = Number(row.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: row.work_id,
      house,
      category: 'cost',
      work_description: row.work_description || row.work_category,
      work_category: row.work_category,
      state: row.state,
      district: row.district,
      constituency: row.constituency,
      sanction_amount: amt,
      total_paid: row.total_paid,
      work_status: row.work_status,
      days_since_sanction: row.days_since_sanction,
      disbursement_ratio: row.disbursement_ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'high_amount_anomaly',
      factor_label: 'Cost Anomaly Indicator',
      factor_description: `Sanction amount (${formatCurrency(amt)}) is ${ratio.toFixed(1)}x category median (${formatCurrency(median)}). Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${ratio.toFixed(1)}x median (${formatCurrency(amt)})`,
      why_attention: [
        `Sanctioned cost ${formatCurrency(amt)} is ${ratio.toFixed(1)}x median for ${row.work_category}`,
        'High budget variance — cost justification review recommended',
        ...(ifResult?.contributions.map(c => `${c.name}: ${c.detail}`) || []),
      ],
      feature_contributions: ifResult?.contributions || [],
      analyzed_at: new Date().toISOString(),
    });
  }

  for (const row of (disbRows || [])) {
    const id = `${house}_disbursement_${row.work_id}`;
    if (processedKeys.has(id)) continue;
    processedKeys.add(id);

    const ifResult = iforestMap.get(row.work_id);
    const ratio = Number(row.disbursement_ratio) || 0;
    const ruleScore = ratio > 110 ? 80 : 45;
    const mlScore = ifResult?.anomalyScore || 60;
    const factorScore = Math.min(95, Math.round(0.6 * ruleScore + 0.4 * mlScore));
    const realScore = Number(row.risk_score || 0);
    const realLevel = getRiskLevel(realScore);

    newRecords.push({
      id,
      work_id: row.work_id,
      house,
      category: 'disbursement',
      work_description: row.work_description || row.work_category,
      work_category: row.work_category,
      state: row.state,
      district: row.district,
      constituency: row.constituency,
      sanction_amount: row.sanction_amount,
      total_paid: row.total_paid,
      work_status: row.work_status,
      days_since_sanction: row.days_since_sanction,
      disbursement_ratio: ratio,
      risk_score: realScore,
      risk_level: realLevel,
      factor_id: 'disbursement_anomaly',
      factor_label: 'Disbursement Variance Indicator',
      factor_description: `Amount disbursed (${ratio.toFixed(1)}%) exceeds sanctioned budget. Verification Recommended.`,
      factor_score: factorScore,
      factor_value: `${ratio.toFixed(1)}% disbursed`,
      why_attention: [
        `Disbursed funds exceed sanctioned ceiling by ${(ratio - 100).toFixed(1)}%`,
        'Accounting cross-verification with implementing agency recommended',
        ...(ifResult?.contributions.map(c => `${c.name}: ${c.detail}`) || []),
      ],
      feature_contributions: ifResult?.contributions || [],
      analyzed_at: new Date().toISOString(),
    });
  }

  if (newRecords.length > 0) {
    try {
      await supabase
        .from('project_anomaly_results')
        .delete()
        .eq('house', house);

      const batchSize = 100;
      for (let i = 0; i < newRecords.length; i += batchSize) {
        const batch = newRecords.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('project_anomaly_results')
          .insert(batch);

        if (insertError) {
          console.warn('[AnomalyService] Batch insert warning:', insertError.message);
        }
      }
    } catch (persistErr) {
      console.warn('[AnomalyService] Could not persist anomaly results to Supabase table:', persistErr);
    }
  }

  return {
    projectsAnalyzed: uniqueCandidates.length,
    indicatorsDetected: newRecords.length,
    timestamp: new Date().toISOString(),
    house,
  };
}
