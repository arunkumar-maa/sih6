import { supabase, getTableName } from './supabase.service.js';
import { rowToEnrichedProject } from './projects.service.js';
import type { UserProfile } from '../types/auth.js';
import type { EnrichedProject, ProjectFilters } from '../types/index.js';

/**
 * Normalizes an MP name for safe case-insensitive matching
 */
function cleanMpName(name?: string | null): string {
  if (!name) return '';
  return name
    .replace(/^hon'ble\s+mp\s+/i, '')
    .replace(/^mp\s+/i, '')
    .trim();
}

/**
 * Fetch aggregated dashboard metrics for an authenticated Lok Sabha MP
 */
export async function getMpDashboardData(profile: UserProfile) {
  const mpName = cleanMpName(profile.mp_name || profile.full_name);
  const constituency = profile.constituency;

  // Query projects for this Lok Sabha MP
  let query = supabase
    .from('lok_sabha_projects')
    .select('*')
    .order('risk_score', { ascending: false });

  if (mpName) {
    query = query.ilike('mp_name', `%${mpName}%`);
  } else if (constituency) {
    query = query.eq('constituency', constituency);
  }

  const { data: rows, error } = await query;
  if (error) {
    throw new Error(`Failed to load MP projects: ${error.message}`);
  }

  const projects: EnrichedProject[] = (rows || []).map(rowToEnrichedProject);

  const totalWorks = projects.length;
  const totalSanctionedAmount = projects.reduce((sum, p) => sum + (p.sanctionAmount || 0), 0);
  const totalDisbursedAmount = projects.reduce((sum, p) => sum + (p.totalPaid || p.amountDisbursed || 0), 0);
  const completedWorks = projects.filter(p => p.isCompleted).length;
  const ongoingWorks = projects.filter(p => !p.isCompleted).length;
  const attentionWorks = projects.filter(p => p.risk?.level === 'HIGH' || (p.risk?.score ?? 0) >= 50);
  const highAttentionWorks = attentionWorks.length;
  const avgCompletionRate = totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 0;
  const fundUtilization = totalSanctionedAmount > 0 
    ? Math.min(100, Math.round((totalDisbursedAmount / totalSanctionedAmount) * 100)) 
    : 0;

  return {
    metrics: {
      totalWorks,
      totalSanctionedAmount,
      totalDisbursedAmount,
      completedWorks,
      ongoingWorks,
      highAttentionWorks,
      avgCompletionRate,
      fundUtilization,
    },
    attentionWorks: attentionWorks.slice(0, 6),
    totalCount: totalWorks,
  };
}

/**
 * Fetch comprehensive profile dossier for an authenticated Lok Sabha MP
 */
export async function getMpProfileData(profile: UserProfile) {
  const mpName = cleanMpName(profile.mp_name || profile.full_name);
  const constituency = profile.constituency;

  // 1. Fetch allocated limit from master table if available
  let allocatedLimit = null;
  if (profile.mp_id) {
    const { data: masterRow } = await supabase
      .from('ls_mps_master')
      .select('allocated_amount')
      .eq('mp_id', profile.mp_id)
      .maybeSingle();
    if (masterRow?.allocated_amount) {
      allocatedLimit = Number(masterRow.allocated_amount);
    }
  }
  if (!allocatedLimit && constituency) {
    const { data: masterRow } = await supabase
      .from('ls_mps_master')
      .select('allocated_amount')
      .ilike('constituency', constituency.trim())
      .maybeSingle();
    if (masterRow?.allocated_amount) {
      allocatedLimit = Number(masterRow.allocated_amount);
    }
  }

  // 2. Query all projects belonging to this MP
  let query = supabase
    .from('lok_sabha_projects')
    .select('*')
    .order('sanction_date', { ascending: false, nullsFirst: false });

  if (mpName) {
    query = query.ilike('mp_name', `%${mpName}%`);
  } else if (constituency) {
    query = query.eq('constituency', constituency);
  }

  const { data: rows, error } = await query;
  if (error) {
    throw new Error(`Failed to load MP portfolio data: ${error.message}`);
  }

  const projects: EnrichedProject[] = (rows || []).map(rowToEnrichedProject);

  const totalWorks = projects.length;
  const totalSanctioned = projects.reduce((sum, p) => sum + (p.sanctionAmount || 0), 0);
  const totalDisbursed = projects.reduce((sum, p) => sum + (p.totalPaid || p.amountDisbursed || 0), 0);
  const completedCount = projects.filter(p => p.isCompleted).length;
  const ongoingCount = projects.filter(p => !p.isCompleted).length;
  const pendingCount = projects.filter(p => p.isRecommendedOnly).length;
  const avgProgress = totalWorks > 0 ? Math.round((completedCount / totalWorks) * 100) : 0;

  // Risk distribution
  const highRiskCount = projects.filter(p => p.risk?.level === 'HIGH' || (p.risk?.score ?? 0) >= 50).length;
  const mediumRiskCount = projects.filter(p => p.risk?.level === 'MEDIUM' || ((p.risk?.score ?? 0) >= 25 && (p.risk?.score ?? 0) < 50)).length;
  const lowRiskCount = projects.filter(p => p.risk?.level === 'LOW' && (p.risk?.score ?? 0) < 25).length;

  // Category breakdown
  const categoryMap = new Map<string, { category: string; count: number; sanctioned: number; completed: number; ongoing: number }>();
  for (const p of projects) {
    const cat = p.workCategory || 'General / Other';
    const entry = categoryMap.get(cat) || { category: cat, count: 0, sanctioned: 0, completed: 0, ongoing: 0 };
    entry.count += 1;
    entry.sanctioned += (p.sanctionAmount || 0);
    if (p.isCompleted) entry.completed += 1;
    else entry.ongoing += 1;
    categoryMap.set(cat, entry);
  }
  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.sanctioned - a.sanctioned);

  // District breakdown
  const districtMap = new Map<string, { district: string; count: number; sanctioned: number; disbursed: number; completed: number }>();
  for (const p of projects) {
    const dist = p.district || profile.district || constituency || 'Constituency Area';
    const entry = districtMap.get(dist) || { district: dist, count: 0, sanctioned: 0, disbursed: 0, completed: 0 };
    entry.count += 1;
    entry.sanctioned += (p.sanctionAmount || 0);
    entry.disbursed += (p.totalPaid || p.amountDisbursed || 0);
    if (p.isCompleted) entry.completed += 1;
    districtMap.set(dist, entry);
  }
  const districtBreakdown = Array.from(districtMap.values()).sort((a, b) => b.sanctioned - a.sanctioned);

  // Attention works with explanatory items
  const attentionItems = projects
    .filter(p => p.risk?.level === 'HIGH' || (p.risk?.score ?? 0) >= 40)
    .slice(0, 8)
    .map(p => ({
      workId: p.workId,
      workDescription: p.workDescription,
      riskScore: p.risk?.score ?? 0,
      riskLevel: p.risk?.level ?? 'LOW',
      sanctionAmount: p.sanctionAmount,
      totalPaid: p.totalPaid,
      factors: p.risk?.factors || [],
      explanation: p.risk?.explanation || 'Stalled milestone or fund expenditure discrepancy requiring administrative review.',
    }));

  // Financial Years active
  const fySet = new Set<string>();
  projects.forEach(p => {
    if (p.financialYear && p.financialYear !== 'Unknown') fySet.add(p.financialYear);
  });
  const financialYears = Array.from(fySet).sort().reverse();

  return {
    mpInfo: {
      fullName: profile.full_name,
      mpName: profile.mp_name || profile.full_name,
      party: 'Not specified', // purely dataset-driven
      constituency: profile.constituency || 'Constituency',
      state: profile.state || 'State',
      house: 'Lok Sabha',
      mpId: profile.mp_id || `ls_${profile.id}`,
      email: profile.email,
      photoUrl: profile.photo_url || null, // strictly null/blank if missing
      allocatedLimit,
      tenureYears: financialYears.length > 0 ? financialYears.join(', ') : '18th Lok Sabha',
    },
    portfolioSummary: {
      totalWorks,
      totalSanctioned,
      totalDisbursed,
      completedCount,
      ongoingCount,
      pendingCount,
      avgProgress,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    },
    categoryBreakdown,
    districtBreakdown,
    attentionItems,
    recentWorks: projects.slice(0, 10),
  };
}

/**
 * Fetch server-side paginated and filtered project list strictly scoped to authenticated MP
 */
export async function getMpProjects(profile: UserProfile, filters: any) {
  const mpName = cleanMpName(profile.mp_name || profile.full_name);
  const constituency = profile.constituency;

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(250, Math.max(1, Number(filters.pageSize) || 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('lok_sabha_projects')
    .select('*', { count: 'exact' });

  // 1. Mandatory MP Scope
  if (mpName) {
    query = query.ilike('mp_name', `%${mpName}%`);
  } else if (constituency) {
    query = query.eq('constituency', constituency);
  }

  // 2. Dynamic MP filters
  if (filters.district) {
    query = query.eq('district', filters.district);
  }
  if (filters.category || filters.workCategory) {
    query = query.eq('work_category', filters.category || filters.workCategory);
  }
  if (filters.financialYear) {
    query = query.eq('financial_year', filters.financialYear);
  }
  if (filters.status) {
    query = query.eq('work_status', filters.status);
  }
  if (filters.riskLevel) {
    query = query.eq('risk_level', filters.riskLevel);
  }
  if (filters.search) {
    const s = filters.search.trim();
    query = query.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,work_category.ilike.%${s}%`);
  }

  // Sorting
  const sortBy = filters.sortBy || filters.sortField || 'sanction_amount';
  const sortDir = (filters.sortOrder || filters.sortDir) === 'asc';

  if (sortBy === 'risk' || sortBy === 'risk_score') {
    query = query.order('risk_score', { ascending: sortDir });
  } else if (sortBy === 'sanction_amount') {
    query = query.order('sanction_amount', { ascending: sortDir, nullsFirst: false });
  } else if (sortBy === 'total_paid') {
    query = query.order('total_paid', { ascending: sortDir, nullsFirst: false });
  } else {
    query = query.order('sanction_date', { ascending: sortDir, nullsFirst: false });
  }

  query = query.order('work_id', { ascending: true });
  query = query.range(from, to);

  const { data: rows, count, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch MP projects: ${error.message}`);
  }

  const projects = (rows || []).map(rowToEnrichedProject);

  return {
    projects,
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
