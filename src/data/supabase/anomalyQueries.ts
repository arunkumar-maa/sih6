import { supabase } from './client';
import type { EnrichedProject, RiskLevel, WorkStatus } from '../types';
import { IsolationForest, extractFeatureVector } from '../../utils/isolationForest';
import { formatCurrency } from '../../utils';

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

export const RISK_THRESHOLDS = {
  HIGH: 55,
  MEDIUM: 25,
} as const;

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

/**
 * Maps raw anomaly record from Supabase table `project_anomaly_results`
 * to the application's `EnrichedProject` interface.
 */
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

    verificationStatus: 'New Alert',
    verificationHistory: [],
    // Custom explainability properties for UI consumption
    ...(whyAttention.length > 0 ? { whyAttention } : {}),
    ...(featureContributions.length > 0 ? { featureContributions } : {}),
  } as unknown as EnrichedProject;
}

/**
 * Fetch category medians for normalising costs
 */
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

/**
 * Get total dataset-wide counts for all 5 anomaly categories via Supabase RPC,
 * with fallback to counts from `project_anomaly_results`.
 */
export async function getAnomalyCounts(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnomalyCounts> {
  const defaultCounts: AnomalyCounts = {
    pending: 0,
    stale: 0,
    cost: 0,
    disbursement: 0,
    vendor: 0,
  };

  try {
    // 1. First attempt fast PostgreSQL RPC for full dataset counts
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
    console.warn('[AnomalyQueries] RPC get_dataset_anomaly_counts failed, checking table:', rpcErr);
  }

  // 2. Fallback: query from `project_anomaly_results` table
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
    console.error('[AnomalyQueries] Table count check failed:', tblErr);
  }

  return defaultCounts;
}

/**
 * Fetch top anomaly projects for a specific category
 */
export async function getAnomalyProjects(
  house: 'Lok Sabha' | 'Rajya Sabha',
  category: AnomalyTab,
  limit: number = 25,
  offset: number = 0
): Promise<EnrichedProject[]> {
  if (category === 'vendor') {
    // Vendor data is not available in the dataset per section 5E
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

    // If no records found, automatically run analysis on demand
    if ((!data || data.length === 0) && !error) {
      console.log(`[AnomalyQueries] No cached anomalies for ${house} / ${category}. Running initial analysis...`);
      await runHouseAnomalyAnalysis(house);

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
      console.error(`[AnomalyQueries] Error fetching ${category} projects:`, error);
      return [];
    }

    return (data || []).map(anomalyRowToEnrichedProject);
  } catch (err) {
    console.error(`[AnomalyQueries] Exception fetching ${category} projects:`, err);
    return [];
  }
}

/**
 * Run AI + Rule Engine + Isolation Forest anomaly analysis for the active house.
 * Analyzes projects directly from Supabase, scores them, and populates `project_anomaly_results`.
 */
export async function runHouseAnomalyAnalysis(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnalysisSummary> {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  console.log(`[AnomalyQueries] Starting anomaly analysis for ${house} on ${tableName}...`);

  const medians = await getCategoryMedians(house);

  // 1. Fetch Candidate Batches Server-side from Supabase
  // Batch A: Stale status (>180 days in early status)
  const { data: staleRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .in('work_status', ['Sanction', 'Vendor Identification', 'Physical Inspection'])
    .gt('days_since_sanction', 180)
    .order('days_since_sanction', { ascending: false })
    .limit(100);

  // Batch B: Cost anomalies (sanction amount > 25L or high)
  const { data: costRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .gt('sanction_amount', 2500000)
    .order('sanction_amount', { ascending: false })
    .limit(100);

  // Batch C: Disbursement Issues (high paid, work not completed)
  const { data: disbRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .gt('total_paid', 0)
    .neq('work_status', 'Work Completed')
    .order('total_paid', { ascending: false })
    .limit(100);

  // Batch D: Stalled Sanction / Unsanctioned works (Status is Sanction, >365 days)
  const { data: pendingRows } = await supabase
    .from(tableName)
    .select('work_id, work_description, work_category, state, district, constituency, sanction_amount, total_paid, work_status, days_since_sanction, disbursement_ratio')
    .eq('work_status', 'Sanction')
    .gt('days_since_sanction', 365)
    .order('days_since_sanction', { ascending: false })
    .limit(100);

  // Combine and deduplicate candidate feature pool for Isolation Forest fitting
  const allCandidateRows = [
    ...(staleRows || []),
    ...(costRows || []),
    ...(disbRows || []),
    ...(pendingRows || []),
  ];

  const uniqueCandidatesMap = new Map<string, any>();
  for (const r of allCandidateRows) {
    if (!uniqueCandidatesMap.has(r.work_id)) {
      uniqueCandidatesMap.set(r.work_id, r);
    }
  }

  const featureVectors = Array.from(uniqueCandidatesMap.values()).map(r => {
    const catMedian = medians.get(r.work_category) || 250000;
    return extractFeatureVector(
      r.work_id,
      r.sanction_amount,
      r.total_paid,
      r.work_status,
      r.days_since_sanction,
      catMedian
    );
  });

  // Fit Isolation Forest model
  const iforest = new IsolationForest(40, 128);
  iforest.fit(featureVectors);

  const anomalyInserts: any[] = [];
  const processedWorkIds = new Set<string>();

  // ── 1. Process Unsanctioned / Stalled Sanctions ─────────────────────────
  for (const r of (pendingRows || [])) {
    const id = `${house}_pending_${r.work_id}`;
    if (processedWorkIds.has(id)) continue;
    processedWorkIds.add(id);

    const fv = extractFeatureVector(r.work_id, r.sanction_amount, r.total_paid, r.work_status, r.days_since_sanction);
    const mlResult = iforest.predict(fv);

    const days = r.days_since_sanction || 0;
    const factorScore = Math.min(95, Math.round(50 + (days / 730) * 40));
    const riskScore = Math.min(98, Math.round(factorScore * 0.7 + mlResult.anomalyScore * 0.3));

    const whyAttention = [
      `Work remained in administrative "${r.work_status}" status for ${days} days without commencing execution`,
      `Zero physical progress or vendor identification reported since sanction`,
      `Sanctioned limit: ${formatCurrency(r.sanction_amount || 0)} allocated but inactive`,
      `ML isolation anomaly score: ${mlResult.anomalyScore}/100`,
    ];

    const featureContributions = [
      { name: 'Stalled Sanction Duration', points: Math.round(riskScore * 0.5) },
      { name: 'Zero Execution Progress', points: Math.round(riskScore * 0.3) },
      { name: 'Isolation Forest Signal', points: Math.round(riskScore * 0.2) },
    ];

    anomalyInserts.push({
      id,
      work_id: r.work_id,
      house,
      category: 'pending',
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      factor_score: factorScore,
      factor_id: 'pending_recommendation',
      factor_label: 'Unsanctioned / Stalled Sanction',
      factor_description: `Administrative sanction granted ${days} days ago, but work has not commenced vendor identification or execution.`,
      factor_value: `${days} days stagnant`,
      why_attention: whyAttention,
      feature_contributions: featureContributions,
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: r.disbursement_ratio,
      isolation_forest_score: mlResult.anomalyScore,
      analyzed_at: new Date().toISOString(),
    });
  }

  // ── 2. Process Stale Status ─────────────────────────────────────────────
  for (const r of (staleRows || [])) {
    const id = `${house}_stale_${r.work_id}`;
    if (processedWorkIds.has(id)) continue;
    processedWorkIds.add(id);

    const fv = extractFeatureVector(r.work_id, r.sanction_amount, r.total_paid, r.work_status, r.days_since_sanction);
    const mlResult = iforest.predict(fv);

    const days = r.days_since_sanction || 0;
    const factorScore = Math.min(90, Math.round(40 + (days / 600) * 45));
    const riskScore = Math.min(95, Math.round(factorScore * 0.75 + mlResult.anomalyScore * 0.25));

    const whyAttention = [
      `Status is still "${r.work_status}" after ${days} days since sanction (>6 months)`,
      `Project has not achieved completion within expected timeline`,
      `Sanctioned amount: ${formatCurrency(r.sanction_amount || 0)}`,
      `ML isolation anomaly score: ${mlResult.anomalyScore}/100`,
    ];

    const featureContributions = [
      { name: 'Timeline Delay', points: Math.round(riskScore * 0.55) },
      { name: 'Uncompleted Status', points: Math.round(riskScore * 0.25) },
      { name: 'Isolation Forest Signal', points: Math.round(riskScore * 0.2) },
    ];

    anomalyInserts.push({
      id,
      work_id: r.work_id,
      house,
      category: 'stale',
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      factor_score: factorScore,
      factor_id: 'stale_status',
      factor_label: 'Stale Status',
      factor_description: `Status has remained "${r.work_status}" for ${days} days since sanction without completion.`,
      factor_value: `${days} days since sanction`,
      why_attention: whyAttention,
      feature_contributions: featureContributions,
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: r.disbursement_ratio,
      isolation_forest_score: mlResult.anomalyScore,
      analyzed_at: new Date().toISOString(),
    });
  }

  // ── 3. Process Cost Anomalies ───────────────────────────────────────────
  for (const r of (costRows || [])) {
    const id = `${house}_cost_${r.work_id}`;
    if (processedWorkIds.has(id)) continue;
    processedWorkIds.add(id);

    const catMedian = medians.get(r.work_category) || 250000;
    const fv = extractFeatureVector(r.work_id, r.sanction_amount, r.total_paid, r.work_status, r.days_since_sanction, catMedian);
    const mlResult = iforest.predict(fv);

    const ratio = (r.sanction_amount || 0) / catMedian;
    const factorScore = Math.min(95, Math.round(45 + Math.min(50, (ratio - 1) * 15)));
    const riskScore = Math.min(96, Math.round(factorScore * 0.65 + mlResult.anomalyScore * 0.35));

    const whyAttention = [
      `Sanction amount (${formatCurrency(r.sanction_amount || 0)}) is ${ratio.toFixed(1)}x category median (${formatCurrency(catMedian)})`,
      `Significantly higher cost than peer works in category "${r.work_category}"`,
      `Total disbursed so far: ${formatCurrency(r.total_paid || 0)}`,
      `ML isolation anomaly score: ${mlResult.anomalyScore}/100`,
    ];

    const featureContributions = [
      { name: 'Cost Anomaly', points: Math.round(riskScore * 0.5) },
      { name: 'Category Baseline Outlier', points: Math.round(riskScore * 0.3) },
      { name: 'Isolation Forest Signal', points: Math.round(riskScore * 0.2) },
    ];

    anomalyInserts.push({
      id,
      work_id: r.work_id,
      house,
      category: 'cost',
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      factor_score: factorScore,
      factor_id: 'high_amount_anomaly',
      factor_label: 'Cost Anomaly',
      factor_description: `Sanction amount (${formatCurrency(r.sanction_amount || 0)}) is ${ratio.toFixed(1)}x higher than the category median (${formatCurrency(catMedian)}).`,
      factor_value: `${ratio.toFixed(1)}x category median`,
      why_attention: whyAttention,
      feature_contributions: featureContributions,
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: r.disbursement_ratio,
      isolation_forest_score: mlResult.anomalyScore,
      analyzed_at: new Date().toISOString(),
    });
  }

  // ── 4. Process Disbursement Issues ──────────────────────────────────────
  for (const r of (disbRows || [])) {
    const id = `${house}_disbursement_${r.work_id}`;
    if (processedWorkIds.has(id)) continue;
    processedWorkIds.add(id);

    const fv = extractFeatureVector(r.work_id, r.sanction_amount, r.total_paid, r.work_status, r.days_since_sanction);
    const mlResult = iforest.predict(fv);

    const disbRatio = fv.disbursementRatio;
    const mismatch = fv.progressMismatch;
    const factorScore = Math.min(95, Math.round(35 + (disbRatio > 90 ? 40 : 20) + (mismatch > 20 ? 15 : 0)));
    const riskScore = Math.min(94, Math.round(factorScore * 0.7 + mlResult.anomalyScore * 0.3));

    const whyAttention = [
      `Disbursed ${disbRatio.toFixed(1)}% of funds (${formatCurrency(r.total_paid || 0)}) while status is "${r.work_status}"`,
      `Financial progress (${disbRatio.toFixed(0)}%) is substantially ahead of reported physical completion (~${fv.physicalProgress}%)`,
      `Physical/financial progress mismatch: ${mismatch.toFixed(1)} percentage points`,
      `ML isolation anomaly score: ${mlResult.anomalyScore}/100`,
    ];

    const featureContributions = [
      { name: 'Progress Mismatch', points: Math.round(riskScore * 0.45) },
      { name: 'Disbursement Ratio', points: Math.round(riskScore * 0.35) },
      { name: 'Isolation Forest Signal', points: Math.round(riskScore * 0.2) },
    ];

    anomalyInserts.push({
      id,
      work_id: r.work_id,
      house,
      category: 'disbursement',
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      factor_score: factorScore,
      factor_id: 'disbursement_anomaly',
      factor_label: 'Disbursement vs Progress Mismatch',
      factor_description: `High financial disbursement (${disbRatio.toFixed(1)}%) relative to physical progress stage ("${r.work_status}").`,
      factor_value: `${disbRatio.toFixed(1)}% disbursed`,
      why_attention: whyAttention,
      feature_contributions: featureContributions,
      work_description: r.work_description,
      work_category: r.work_category,
      state: r.state,
      district: r.district,
      constituency: r.constituency,
      sanction_amount: r.sanction_amount,
      total_paid: r.total_paid,
      work_status: r.work_status,
      days_since_sanction: r.days_since_sanction,
      disbursement_ratio: r.disbursement_ratio,
      isolation_forest_score: mlResult.anomalyScore,
      analyzed_at: new Date().toISOString(),
    });
  }

  // ── Upsert into Supabase `project_anomaly_results` ─────────────────────
  if (anomalyInserts.length > 0) {
    // Delete previous analysis for this house to keep clean state
    await supabase.from('project_anomaly_results').delete().eq('house', house);

    // Upsert in batches of 50
    for (let i = 0; i < anomalyInserts.length; i += 50) {
      const chunk = anomalyInserts.slice(i, i + 50);
      const { error: insertError } = await supabase
        .from('project_anomaly_results')
        .upsert(chunk, { onConflict: 'id' });

      if (insertError) {
        console.error('[AnomalyQueries] Batch insert error:', insertError);
      }
    }
  }

  const summary: AnalysisSummary = {
    projectsAnalyzed: uniqueCandidatesMap.size,
    indicatorsDetected: anomalyInserts.length,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    house,
  };

  console.log(`[AnomalyQueries] Analysis completed: ${summary.projectsAnalyzed} analyzed, ${summary.indicatorsDetected} indicators detected.`);
  return summary;
}
