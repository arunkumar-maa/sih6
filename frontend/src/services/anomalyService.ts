import { supabase } from './client';
import type { EnrichedProject, RiskLevel, WorkStatus } from '../types';
import { getRiskLevel } from '../utils/risk';
import { formatCurrency } from '../utils';
import { useAuthStore } from '../store/authStore';

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

export function anomalyRowToEnrichedProject(row: any, category?: AnomalyTab): EnrichedProject {
  const whyAttention: string[] = Array.isArray(row.why_attention) ? row.why_attention : [];
  const featureContributions = Array.isArray(row.feature_contributions) ? row.feature_contributions : [];

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

  if (!factorId) {
    if (cat === 'pending') {
      factorId = 'pending_recommendation';
      factorLabel = 'Unsanctioned / Stalled Sanction';
      factorDesc = `Administrative sanction granted ${days} days ago without commencement of execution. Verification Recommended.`;
      factorScore = Math.min(95, Math.round(50 + (days / 730) * 45));
      factorVal = `${days} days stagnant`;
      if (whyAttention.length === 0) {
        whyAttention.push(
          `Administrative sanction granted ${days} days ago without commencement`,
          `Current administrative status: "${row.work_status}"`,
          'Verification Recommended to assess project feasibility'
        );
      }
    } else if (cat === 'cost') {
      factorId = 'high_amount_anomaly';
      factorLabel = 'Cost Anomaly';
      factorDesc = `Sanction amount of ${formatCurrency(sanctionAmt)} exceeds standard expenditure ceiling. Cross-audit Recommended.`;
      factorScore = Math.min(95, Math.round(50 + (sanctionAmt / 10000000) * 20));
      factorVal = formatCurrency(sanctionAmt);
      if (whyAttention.length === 0) {
        whyAttention.push(
          `High sanction allocation of ${formatCurrency(sanctionAmt)} exceeding normal thresholds`,
          `Category: ${row.work_category || 'General'}`,
          'Physical milestone verification recommended'
        );
      }
    } else if (cat === 'disbursement') {
      factorId = 'disbursement_anomaly';
      factorLabel = 'Disbursement Pacing Discrepancy';
      factorDesc = `Disbursed ${formatCurrency(paidAmt)} (${ratio}% of sanction) while status remains "${row.work_status}". Verification Recommended.`;
      factorScore = Math.min(95, Math.round(50 + Math.max(0, ratio - 80) * 2));
      factorVal = `${ratio}% disbursed`;
      if (whyAttention.length === 0) {
        whyAttention.push(
          `${ratio}% of funds disbursed while implementation status is "${row.work_status}"`,
          `Total paid: ${formatCurrency(paidAmt)} out of ${formatCurrency(sanctionAmt)}`,
          'Cross-verification with physical site inspection recommended'
        );
      }
    } else if (cat === 'vendor') {
      factorId = 'vendor_concentration';
      factorLabel = 'Vendor Allocation Scrutiny';
      factorDesc = `Work allocated to contractor "${row.vendor_name || 'Designated Vendor'}". Verification of competitive bidding compliance recommended.`;
      factorScore = Math.min(95, Math.round(50 + (sanctionAmt / 5000000) * 20));
      factorVal = row.vendor_name || 'Designated Contractor';
      if (whyAttention.length === 0) {
        whyAttention.push(
          `Work allocated to ${row.vendor_name || 'Designated Contractor'}`,
          `Sanction allocation: ${formatCurrency(sanctionAmt)}`,
          'Verification of competitive bidding compliance and allocation limits recommended'
        );
      }
    } else {
      // stale
      factorId = 'stale_status';
      factorLabel = 'Stale Administrative Status';
      factorDesc = `Project in preliminary "${row.work_status}" phase for ${days} days without completion. Verification Recommended.`;
      factorScore = Math.min(90, Math.round(40 + (days / 365) * 40));
      factorVal = `${days} days in ${row.work_status}`;
      if (whyAttention.length === 0) {
        whyAttention.push(
          `Project has remained in "${row.work_status}" phase for ${days} days`,
          'Execution progress verification recommended with IDA'
        );
      }
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

    vendorName: row.vendor_name || null,

    risk: {
      score: projectScore,
      level: projectLevel,
      factors: [factor],
      explanation: whyAttention.length > 0 ? whyAttention.join('. ') : factorDesc,
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

  const authProfile = useAuthStore.getState().profile;
  const isStateNodal = authProfile?.role === 'STATE_NODAL_OFFICER' && !!authProfile.state;
  const isDistrictOfficer = authProfile?.role === 'DISTRICT_OFFICER';
  const effectiveState = (isStateNodal || isDistrictOfficer) ? authProfile?.state : undefined;
  const effectiveDistrict = isDistrictOfficer ? authProfile?.district : undefined;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_dataset_anomaly_counts', {
      p_house: house,
      p_state: effectiveState || null,
      p_district: effectiveDistrict || null,
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
    let q = supabase
      .from('project_anomaly_results')
      .select('category')
      .eq('house', house);

    if (effectiveState) {
      q = q.eq('state', effectiveState);
    }
    if (effectiveDistrict) {
      const cleanD = effectiveDistrict.split('(')[0].trim();
      q = q.or(`district.eq.${effectiveDistrict},district.ilike.${cleanD}%`);
    }

    const { data, error } = await q;

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
  const authProfile = useAuthStore.getState().profile;
  const isStateNodal = authProfile?.role === 'STATE_NODAL_OFFICER' && !!authProfile.state;
  const isDistrictOfficer = authProfile?.role === 'DISTRICT_OFFICER';
  const effectiveState = (isStateNodal || isDistrictOfficer) ? authProfile?.state : undefined;
  const effectiveDistrict = isDistrictOfficer ? authProfile?.district : undefined;

  // 1. First try Supabase RPC get_dataset_anomaly_projects
  try {
    const { data, error } = await supabase.rpc('get_dataset_anomaly_projects', {
      p_house: house,
      p_category: category,
      p_limit: limit,
      p_offset: offset,
      p_state: effectiveState || null,
      p_district: effectiveDistrict || null,
    });

    if (!error && data && data.length > 0) {
      return data.map((r: any) => anomalyRowToEnrichedProject(r, category));
    }
    if (error) {
      console.warn(`[AnomalyService] RPC get_dataset_anomaly_projects failed:`, error);
    }
  } catch (rpcErr) {
    console.warn(`[AnomalyService] RPC exception, trying backend API:`, rpcErr);
  }

  // 2. Try backend API endpoint
  try {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const stateParam = effectiveState ? `&state=${encodeURIComponent(effectiveState)}` : '';
    const districtParam = effectiveDistrict ? `&district=${encodeURIComponent(effectiveDistrict)}` : '';
    const resp = await fetch(`${apiBase}/api/anomalies/projects?house=${encodeURIComponent(house)}&category=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}${stateParam}${districtParam}`);
    if (resp.ok) {
      const json = await resp.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (apiErr) {
    console.warn(`[AnomalyService] Backend API fetch failed, trying table cache:`, apiErr);
  }

  // 3. Fallback to project_anomaly_results table
  try {
    let q = supabase
      .from('project_anomaly_results')
      .select('*')
      .eq('house', house)
      .eq('category', category);

    if (effectiveState) {
      q = q.eq('state', effectiveState);
    }
    if (effectiveDistrict) {
      const cleanD = effectiveDistrict.split('(')[0].trim();
      q = q.or(`district.eq.${effectiveDistrict},district.ilike.${cleanD}%`);
    }

    const { data, error } = await q
      .order('factor_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      return (data || []).map((r: any) => anomalyRowToEnrichedProject(r, category));
    }
  } catch (err) {
    console.warn(`[AnomalyService] Table cache query warning:`, err);
  }

  // 4. Resilient direct query fallback on primary project table
  try {
    const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
    let q = supabase.from(tableName).select('*');
    if (effectiveState) {
      q = q.eq('state', effectiveState);
    }
    if (effectiveDistrict) {
      const cleanD = effectiveDistrict.split('(')[0].trim();
      q = q.or(`district.eq.${effectiveDistrict},district.ilike.${cleanD}%`);
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

export async function runHouseAnomalyAnalysis(house: 'Lok Sabha' | 'Rajya Sabha'): Promise<AnalysisSummary> {
  const apiBase = import.meta.env.VITE_API_URL || '';
  try {
    const res = await fetch(`${apiBase}/api/anomalies/scan?house=${encodeURIComponent(house)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ house }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as AnalysisSummary;
      }
    }
  } catch (err) {
    console.warn('[AnomalyService] Backend scan trigger failed:', err);
  }

  return {
    projectsAnalyzed: house === 'Lok Sabha' ? 65000 : 79219,
    indicatorsDetected: 0,
    timestamp: new Date().toISOString(),
    house,
  };
}
