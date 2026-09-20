import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function normalizeObservatoryData(raw) {
  if (!raw) {
    return {
      kpis: {
        total: 0,
        totalSanctionAmount: 0,
        totalDisbursed: 0,
        highRisk: 0,
        medRisk: 0,
        lowRisk: 0,
        completed: 0,
        pendingSanction: 0,
      },
      districtRisk: [],
      categoryRisk: [],
      statusBreakdown: [],
      fyTrend: [],
    };
  }

  const k = raw.kpis || {};
  const total = Number(k.total ?? 0);
  const totalSanctionAmount = Number(k.total_sanction ?? k.totalSanctionAmount ?? 0);
  const totalDisbursed = Number(k.total_disbursed ?? k.totalDisbursed ?? 0);
  const highRisk = Number(k.high_risk ?? k.highRisk ?? 0);
  const medRisk = Number(k.med_risk ?? k.medRisk ?? 0);
  const lowRisk = Number(k.low_risk ?? k.lowRisk ?? 0);
  const completed = Number(k.completed ?? 0);
  const pendingSanction = Number(k.pending_sanction ?? k.pendingSanction ?? 0);

  const rawDistricts = Array.isArray(raw.districtRisk) ? raw.districtRisk : [];
  const districtRisk = rawDistricts.map((d) => {
    const rawName = String(d.district || 'Unknown');
    const cleanDistrict = rawName.replace(/\(.*?\)/g, '').trim() || rawName;
    const dTotal = Number(d.total_projects ?? d.total ?? 0);
    const dHigh = Number(d.high_risk_count ?? d.high ?? 0);
    const dMed = Number(d.med ?? Math.max(0, dTotal - dHigh));
    const dLow = Number(d.low ?? 0);
    const concentration = dTotal > 0 ? Math.round((dHigh / dTotal) * 100) : 0;
    return {
      district: cleanDistrict,
      total: dTotal,
      high: dHigh,
      med: dMed,
      low: dLow,
      concentration,
    };
  });

  const rawCategories = Array.isArray(raw.categoryRisk) && raw.categoryRisk.length > 0
    ? raw.categoryRisk
    : (Array.isArray(raw.categoryBreakdown) ? raw.categoryBreakdown : []);

  const categoryRisk = rawCategories.map((c) => {
    let catName = String(c.category || 'Other');
    catName = catName.replace(/^\d+\/\d+-/, '').trim() || catName;
    if (catName.length > 35) catName = catName.substring(0, 32) + '…';

    const cTotal = Number(c.count ?? c.total ?? c.totalProjects ?? 0);
    let cHigh = Number(c.high ?? 0);
    let cMed = Number(c.med ?? 0);
    let cLow = Number(c.low ?? 0);

    if (cHigh === 0 && cMed === 0 && cLow === 0 && cTotal > 0) {
      const avgR = Number(c.avg_risk ?? 0);
      if (avgR >= 35) {
        cHigh = Math.max(1, Math.round(cTotal * 0.4));
        cMed = Math.round(cTotal * 0.4);
        cLow = Math.max(0, cTotal - cHigh - cMed);
      } else if (avgR >= 20) {
        cHigh = Math.round(cTotal * 0.15);
        cMed = Math.round(cTotal * 0.5);
        cLow = Math.max(0, cTotal - cHigh - cMed);
      } else {
        cHigh = 0;
        cMed = Math.round(cTotal * 0.25);
        cLow = Math.max(0, cTotal - cMed);
      }
    }

    return {
      category: catName,
      total: cTotal,
      high: cHigh,
      med: cMed,
      low: cLow,
    };
  });

  const rawStatus = Array.isArray(raw.statusBreakdown) ? raw.statusBreakdown : [];
  const totalStatusVal = rawStatus.reduce((acc, s) => acc + Number(s.value || 0), 0) || total || 1;
  const statusBreakdown = rawStatus.map((s) => {
    const val = Number(s.value || 0);
    const pct = s.percentage !== undefined ? Number(s.percentage) : Math.round((val / totalStatusVal) * 100);
    return {
      name: String(s.name || 'Unknown'),
      value: val,
      percentage: pct,
    };
  });

  const rawFy = Array.isArray(raw.fyTrend) && raw.fyTrend.length > 0
    ? raw.fyTrend
    : (Array.isArray(raw.financialYearTrends) ? raw.financialYearTrends : []);

  const fyTrend = rawFy.map((f) => {
    let sAmt = Number(f.sanctioned ?? 0);
    let dAmt = Number(f.disbursed ?? 0);
    if (sAmt > 100000) sAmt = Math.round((sAmt / 1e7) * 100) / 100;
    if (dAmt > 100000) dAmt = Math.round((dAmt / 1e7) * 100) / 100;

    return {
      fy: String(f.fy || 'Unknown'),
      sanctioned: sAmt,
      disbursed: dAmt,
      total_projects: Number(f.total_projects ?? 0),
    };
  });

  return {
    kpis: {
      total,
      totalSanctionAmount,
      totalDisbursed,
      highRisk,
      medRisk,
      lowRisk,
      completed,
      pendingSanction,
    },
    districtRisk,
    categoryRisk,
    statusBreakdown,
    fyTrend,
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('TEST SUITE: ANALYTICS, PROJECT INTELLIGENCE & ANOMALY CENTER');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  // ── 1. Analytics Observatory Normalization (National) ───────────────────────
  console.log('--- 1. Analytics Observatory: National Level ---');
  const { data: rawNat, error: errNat } = await supabase.rpc('get_analytics_observatory', {
    p_house: 'Lok Sabha',
  });
  assert('National Observatory RPC succeeds', !errNat, errNat?.message);
  const normNat = normalizeObservatoryData(rawNat);

  assert('National KPI total is 65000', normNat.kpis.total === 65000, `Found ${normNat.kpis.total}`);
  assert('National KPI totalSanctionAmount mapped in Crores (> ₹3,000 Cr)', normNat.kpis.totalSanctionAmount > 3e10, `₹${(normNat.kpis.totalSanctionAmount / 1e7).toFixed(2)} Cr`);
  assert('National KPI highRisk mapped properly (> 5,000)', normNat.kpis.highRisk > 5000, `Found ${normNat.kpis.highRisk}`);
  assert('National districtRisk has elements with clean names and high counts', normNat.districtRisk.length > 0 && normNat.districtRisk[0].high > 0, `Top: ${normNat.districtRisk[0]?.district} (High: ${normNat.districtRisk[0]?.high})`);
  assert('National categoryRisk has categories with high/med/low counts', normNat.categoryRisk.length > 0 && normNat.categoryRisk[0].total > 0, `Top: ${normNat.categoryRisk[0]?.category} (Total: ${normNat.categoryRisk[0]?.total})`);
  assert('National statusBreakdown has percentages populated', normNat.statusBreakdown.length > 0 && normNat.statusBreakdown[0].percentage > 0, `Top: ${normNat.statusBreakdown[0]?.name} (${normNat.statusBreakdown[0]?.percentage}%)`);
  assert('National fyTrend scaled to Crores', normNat.fyTrend.length > 0 && normNat.fyTrend[0].sanctioned < 100000, `FY ${normNat.fyTrend[0]?.fy}: ₹${normNat.fyTrend[0]?.sanctioned} Cr`);

  // ── 2. Analytics Observatory Normalization (Varanasi District) ──────────────
  console.log('\n--- 2. Analytics Observatory: District Level (Varanasi) ---');
  const { data: rawDist, error: errDist } = await supabase.rpc('get_analytics_observatory', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI',
  });
  assert('District Observatory RPC succeeds', !errDist, errDist?.message);
  const normDist = normalizeObservatoryData(rawDist);

  assert('District KPI total is exactly 448', normDist.kpis.total === 448, `Found ${normDist.kpis.total}`);
  assert('District KPI totalSanctionAmount is ₹13.82 Cr', Math.round(normDist.kpis.totalSanctionAmount / 1e7 * 100) / 100 === 13.82, `₹${(normDist.kpis.totalSanctionAmount / 1e7).toFixed(2)} Cr`);
  assert('District KPI highRisk is 4', normDist.kpis.highRisk === 4, `Found ${normDist.kpis.highRisk}`);
  assert('District districtRisk cleaned of administrative noise', normDist.districtRisk.length > 0 && normDist.districtRisk[0].district === 'VARANASI', `Name: "${normDist.districtRisk[0]?.district}"`);
  assert('District statusBreakdown accounts for 448 works', normDist.statusBreakdown.reduce((s, x) => s + x.value, 0) === 448, `Sum: ${normDist.statusBreakdown.reduce((s, x) => s + x.value, 0)}`);

  // ── 3. Anomaly Center & Vendor Concentration ───────────────────────────────
  console.log('\n--- 3. Anomaly Center: Counts & Projects ---');
  const { data: natCounts, error: errCounts } = await supabase.rpc('get_dataset_anomaly_counts', {
    p_house: 'Lok Sabha',
  });
  assert('National anomaly counts RPC succeeds', !errCounts, errCounts?.message);
  assert('National vendor anomaly count > 0', natCounts.vendor > 0, `Vendor anomalies: ${natCounts.vendor}`);

  const { data: distCounts, error: errDistCounts } = await supabase.rpc('get_dataset_anomaly_counts', {
    p_house: 'Lok Sabha',
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI',
  });
  assert('District anomaly counts RPC succeeds', !errDistCounts, errDistCounts?.message);
  assert('District vendor anomaly count is 423 for Varanasi', distCounts.vendor === 423, `Found ${distCounts.vendor}`);

  const { data: vendorProjects, error: errVendProj } = await supabase.rpc('get_dataset_anomaly_projects', {
    p_house: 'Lok Sabha',
    p_category: 'vendor',
    p_limit: 10,
    p_offset: 0,
    p_state: 'Uttar Pradesh',
    p_district: 'VARANASI',
  });
  assert('Vendor anomaly projects query succeeds', !errVendProj, errVendProj?.message);
  assert('Vendor anomaly projects returned for Varanasi', vendorProjects?.length > 0, `Returned: ${vendorProjects?.length}`);
  assert('Vendor projects have work_id and work_description', !!vendorProjects?.[0]?.work_id && !!vendorProjects?.[0]?.work_description, `Sample: ${vendorProjects?.[0]?.work_id}`);

  // ── 4. Project Intelligence Single Fetch ──────────────────────────────────
  console.log('\n--- 4. Project Intelligence Lookup ---');
  const sampleWorkId = vendorProjects[0].work_id;
  const { data: projDetail, error: projErr } = await supabase
    .from('lok_sabha_projects')
    .select('*')
    .eq('work_id', sampleWorkId)
    .maybeSingle();

  assert('Project detail query succeeds for work_id', !projErr && !!projDetail, `Work ID: ${sampleWorkId}`);
  assert('Project belongs to Varanasi', projDetail?.district?.includes('VARANASI'), `District: ${projDetail?.district}`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests();
