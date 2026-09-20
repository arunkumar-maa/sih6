import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ewwhGR_eBDSRa0qXXJmw_Q_9G0jQWYW';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
  console.log('================================================================');
  console.log('MPLADS SENTINEL — PRODUCTION SMOKE TEST & DATA INTEGRITY VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  // TEST 1: Dashboard KPIs (Lok Sabha)
  try {
    const { data: lsKpis, error: err1 } = await supabase.rpc('get_dashboard_kpis', {
      p_house: 'Lok Sabha'
    });
    assert('Lok Sabha KPIs RPC succeeds without error', !err1, err1 ? err1.message : '');
    assert('Lok Sabha total works count is 65,000', lsKpis?.total === 65000, `Found ${lsKpis?.total}`);
    assert('Lok Sabha sanctioned amount > 0', lsKpis?.totalSanctionAmount > 0, `₹${(lsKpis?.totalSanctionAmount / 1e7).toFixed(1)} Cr`);
    assert('Lok Sabha high risk works > 0', lsKpis?.highRisk === 6046, `Found ${lsKpis?.highRisk}`);
    assert('Lok Sabha medium risk works > 0', lsKpis?.medRisk === 32481, `Found ${lsKpis?.medRisk}`);
    assert('Lok Sabha low risk works > 0', lsKpis?.lowRisk === 26473, `Found ${lsKpis?.lowRisk}`);
  } catch (e) {
    assert('Lok Sabha KPIs RPC threw', false, e.message);
  }

  // TEST 2: Dashboard KPIs (Rajya Sabha)
  try {
    const { data: rsKpis, error: err2 } = await supabase.rpc('get_dashboard_kpis', {
      p_house: 'Rajya Sabha'
    });
    assert('Rajya Sabha KPIs RPC succeeds without error', !err2, err2 ? err2.message : '');
    assert('Rajya Sabha total works count is 79,219', rsKpis?.total === 79219, `Found ${rsKpis?.total}`);
    assert('Rajya Sabha sanctioned amount > 0', rsKpis?.totalSanctionAmount > 0, `₹${(rsKpis?.totalSanctionAmount / 1e7).toFixed(1)} Cr`);
    assert('Rajya Sabha high risk works > 0', rsKpis?.highRisk === 647, `Found ${rsKpis?.highRisk}`);
    assert('Rajya Sabha medium risk works > 0', rsKpis?.medRisk === 16251, `Found ${rsKpis?.medRisk}`);
    assert('Rajya Sabha low risk works > 0', rsKpis?.lowRisk === 62321, `Found ${rsKpis?.lowRisk}`);
  } catch (e) {
    assert('Rajya Sabha KPIs RPC threw', false, e.message);
  }

  // TEST 3: Analytics Observatory (Lok Sabha)
  try {
    const { data: obsLs, error: err3 } = await supabase.rpc('get_analytics_observatory', {
      p_house: 'Lok Sabha'
    });
    assert('Analytics Observatory Lok Sabha succeeds', !err3, err3 ? err3.message : '');
    assert('Observatory contains macro KPIs', obsLs?.kpis?.total === 65000, `Macro works: ${obsLs?.kpis?.total}`);
    assert('Observatory contains top districts', Array.isArray(obsLs?.districtRisk) && obsLs.districtRisk.length > 0, `${obsLs?.districtRisk?.length} districts`);
    assert('Observatory contains category breakdown', Array.isArray(obsLs?.categoryRisk) && obsLs.categoryRisk.length > 0, `${obsLs?.categoryRisk?.length} categories`);
    assert('Observatory contains status breakdown', Array.isArray(obsLs?.statusBreakdown) && obsLs.statusBreakdown.length > 0, `${obsLs?.statusBreakdown?.length} statuses`);
    assert('Observatory contains financial year trends', Array.isArray(obsLs?.fyTrend) && obsLs.fyTrend.length > 0, `${obsLs?.fyTrend?.length} FYs`);
  } catch (e) {
    assert('Analytics Observatory LS threw', false, e.message);
  }

  // TEST 4: Analytics Observatory (Rajya Sabha)
  try {
    const { data: obsRs, error: err4 } = await supabase.rpc('get_analytics_observatory', {
      p_house: 'Rajya Sabha'
    });
    assert('Analytics Observatory Rajya Sabha succeeds', !err4, err4 ? err4.message : '');
    assert('Observatory contains RS macro KPIs', obsRs?.kpis?.total === 79219, `Macro works: ${obsRs?.kpis?.total}`);
    assert('Observatory contains RS top districts', Array.isArray(obsRs?.districtRisk) && obsRs.districtRisk.length > 0, `${obsRs?.districtRisk?.length} districts`);
    assert('Observatory contains RS category breakdown', Array.isArray(obsRs?.categoryRisk) && obsRs.categoryRisk.length > 0, `${obsRs?.categoryRisk?.length} categories`);
  } catch (e) {
    assert('Analytics Observatory RS threw', false, e.message);
  }

  // TEST 5: Anomaly Counts & Server-side Paginated Projects
  try {
    const { data: anomCounts, error: err5 } = await supabase.rpc('get_dataset_anomaly_counts', {
      p_house: 'Lok Sabha'
    });
    assert('Dataset anomaly counts RPC succeeds', !err5, err5 ? err5.message : '');
    assert('Pending anomaly count > 0', anomCounts?.pending > 0, `Pending: ${anomCounts?.pending}`);
    assert('Stale anomaly count > 0', anomCounts?.stale > 0, `Stale: ${anomCounts?.stale}`);
    assert('Cost anomaly count > 0', anomCounts?.cost > 0, `Cost: ${anomCounts?.cost}`);

    const { data: anomProjects, error: err6 } = await supabase.rpc('get_dataset_anomaly_projects', {
      p_house: 'Lok Sabha',
      p_category: 'stale',
      p_limit: 10,
      p_offset: 0
    });
    assert('Server-side paginated anomaly projects succeeds', !err6, err6 ? err6.message : '');
    assert('Returns requested batch of 10 anomaly projects', Array.isArray(anomProjects) && anomProjects.length === 10, `Got ${anomProjects?.length}`);
    const sample = anomProjects?.[0];
    assert('Anomaly project has work_id and risk_score', !!sample?.work_id && sample?.risk_score !== undefined, `${sample?.work_id}, score: ${sample?.risk_score}`);
    assert('Anomaly project has explainable risk factors', Array.isArray(sample?.risk_factors) && sample.risk_factors.length > 0, `${sample?.risk_factors?.[0]?.label}`);
  } catch (e) {
    assert('Anomaly RPCs threw', false, e.message);
  }

  // TEST 6: Constituency GIS Metrics (Lok Sabha)
  try {
    const { data: constGis, error: err7 } = await supabase.rpc('get_constituency_gis_metrics', {});
    assert('Constituency GIS metrics RPC succeeds', !err7, err7 ? err7.message : '');
    assert('Returns all active Lok Sabha constituencies', Array.isArray(constGis) && constGis.length >= 500, `Got ${constGis?.length} constituencies`);
    const cSample = constGis?.[0];
    assert('Constituency metric has dual amount aliases', 
      cSample?.sanctioned_amount !== undefined && cSample?.total_sanctioned !== undefined &&
      cSample?.disbursed_amount !== undefined && cSample?.total_disbursed !== undefined,
      `Sanctioned: ₹${cSample?.sanctioned_amount}, Disbursed: ₹${cSample?.disbursed_amount}`
    );
  } catch (e) {
    assert('Constituency GIS threw', false, e.message);
  }

  // TEST 7: State GIS Metrics (Rajya Sabha)
  try {
    const { data: stateGis, error: err8 } = await supabase.rpc('get_state_gis_metrics', {});
    assert('State GIS metrics RPC succeeds', !err8, err8 ? err8.message : '');
    assert('Returns all 36 States/UTs', Array.isArray(stateGis) && stateGis.length === 36, `Got ${stateGis?.length} states`);
    const sSample = stateGis?.[0];
    assert('State metric has dual amount aliases and high risk count',
      sSample?.sanctioned_amount !== undefined && sSample?.total_sanctioned !== undefined &&
      sSample?.high_risk_count !== undefined,
      `${sSample?.state}: ${sSample?.total_works} works, ₹${sSample?.sanctioned_amount}`
    );
  } catch (e) {
    assert('State GIS threw', false, e.message);
  }

  // TEST 8: Direct Project Table Retrieval & Filter Isolation
  try {
    // Lok Sabha high risk query
    const { data: lsHighRisk, error: err9 } = await supabase
      .from('lok_sabha_projects')
      .select('work_id, mp_name, constituency, state, sanction_amount, risk_score, risk_level')
      .eq('risk_level', 'HIGH')
      .order('risk_score', { ascending: false })
      .limit(5);
    assert('Direct Lok Sabha high risk query succeeds', !err9 && lsHighRisk?.length === 5, `Got 5 top risk works`);
    assert('LS works have constituency', !!lsHighRisk?.[0]?.constituency, `Constituency: ${lsHighRisk?.[0]?.constituency}`);

    // Rajya Sabha high risk query
    const { data: rsHighRisk, error: err10 } = await supabase
      .from('rajya_sabha_projects')
      .select('work_id, mp_name, state, sanction_amount, risk_score, risk_level')
      .eq('risk_level', 'HIGH')
      .order('risk_score', { ascending: false })
      .limit(5);
    assert('Direct Rajya Sabha high risk query succeeds', !err10 && rsHighRisk?.length === 5, `Got 5 top RS risk works`);
  } catch (e) {
    assert('Direct query threw', false, e.message);
  }

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
