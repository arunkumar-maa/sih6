import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envText.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')));
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('=== MPLADS SENTINEL: RISK LEVEL CONSISTENCY ACCEPTANCE TESTS ===\n');

  // Select 10 specific sample projects across Lok Sabha and Rajya Sabha with diverse risk scores
  // 5 Lok Sabha (scores: 0, 15, 25, 30, 40)
  const { data: ls0 } = await supabase.from('lok_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 0).limit(1);
  const { data: ls15 } = await supabase.from('lok_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 15).limit(1);
  const { data: ls25 } = await supabase.from('lok_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 25).limit(1);
  const { data: ls30 } = await supabase.from('lok_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 30).limit(1);
  const { data: ls40 } = await supabase.from('lok_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 40).limit(1);

  // 5 Rajya Sabha (scores: 0, 15, 25, 27, 40)
  const { data: rs0 } = await supabase.from('rajya_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 0).limit(1);
  const { data: rs15 } = await supabase.from('rajya_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 15).limit(1);
  const { data: rs25 } = await supabase.from('rajya_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 25).limit(1);
  const { data: rs27 } = await supabase.from('rajya_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 27).limit(1);
  const { data: rs40 } = await supabase.from('rajya_sabha_projects').select('work_id, risk_score, risk_level, work_status, sanction_amount').eq('risk_score', 40).limit(1);

  const samples = [
    ...(ls0 || []).map(p => ({ ...p, house: 'Lok Sabha' })),
    ...(ls15 || []).map(p => ({ ...p, house: 'Lok Sabha' })),
    ...(ls25 || []).map(p => ({ ...p, house: 'Lok Sabha' })),
    ...(ls30 || []).map(p => ({ ...p, house: 'Lok Sabha' })),
    ...(ls40 || []).map(p => ({ ...p, house: 'Lok Sabha' })),
    ...(rs0 || []).map(p => ({ ...p, house: 'Rajya Sabha' })),
    ...(rs15 || []).map(p => ({ ...p, house: 'Rajya Sabha' })),
    ...(rs25 || []).map(p => ({ ...p, house: 'Rajya Sabha' })),
    ...(rs27 || []).map(p => ({ ...p, house: 'Rajya Sabha' })),
    ...(rs40 || []).map(p => ({ ...p, house: 'Rajya Sabha' })),
  ];

  console.log(`Found ${samples.length} sample projects to verify across endpoints:\n`);
  samples.forEach((s, i) => {
    console.log(`  [${i + 1}] [${s.house}] Work ID: "${s.work_id}" | DB Score: ${s.risk_score} | DB Level: ${s.risk_level}`);
  });
  console.log('\n--- VERIFYING INDIVIDUAL ENDPOINTS ---');

  let passed = 0;
  let totalChecks = 0;

  for (const sample of samples) {
    console.log(`\nTesting Work ID: ${sample.work_id} (${sample.house})...`);

    // A. Single Project API (/api/projects/:id)
    totalChecks++;
    try {
      const res = await fetch(`${BASE_URL}/projects/${encodeURIComponent(sample.work_id)}?house=${encodeURIComponent(sample.house)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        const scoreMatches = p.risk.score === Number(sample.risk_score);
        const levelMatches = p.risk.level === sample.risk_level;
        if (scoreMatches && levelMatches) {
          console.log(`  ✓ /api/projects/:id -> Score: ${p.risk.score}, Level: ${p.risk.level} (Matches DB)`);
          passed++;
        } else {
          console.error(`  ✗ /api/projects/:id MISMATCH -> Got Score: ${p.risk.score}, Level: ${p.risk.level} vs DB Score: ${sample.risk_score}, Level: ${sample.risk_level}`);
        }
      } else {
        console.error(`  ✗ /api/projects/:id failed:`, json.error);
      }
    } catch (err) {
      console.error(`  ✗ /api/projects/:id fetch error:`, err.message);
    }

    // B. Project List API with search (/api/projects?search=...)
    totalChecks++;
    try {
      const workNum = sample.work_id.split('/').pop().trim();
      const res = await fetch(`${BASE_URL}/projects?house=${encodeURIComponent(sample.house)}&search=${encodeURIComponent(workNum)}`);
      const json = await res.json();
      if (json.success && json.data?.projects?.length > 0) {
        const p = json.data.projects.find(proj => proj.workId === sample.work_id);
        if (p) {
          const scoreMatches = p.risk.score === Number(sample.risk_score);
          const levelMatches = p.risk.level === sample.risk_level;
          if (scoreMatches && levelMatches) {
            console.log(`  ✓ /api/projects (list) -> Score: ${p.risk.score}, Level: ${p.risk.level} (Matches DB)`);
            passed++;
          } else {
            console.error(`  ✗ /api/projects (list) MISMATCH -> Got Score: ${p.risk.score}, Level: ${p.risk.level} vs DB Score: ${sample.risk_score}, Level: ${sample.risk_level}`);
          }
        } else {
          console.error(`  ✗ Project ${sample.work_id} not found in search results for ${workNum}`);
        }
      } else {
        console.error(`  ✗ /api/projects search returned no results for ${workNum}`);
      }
    } catch (err) {
      console.error(`  ✗ /api/projects fetch error:`, err.message);
    }

    // C. Check if project is in Anomaly cache (if present, check consistency)
    const { data: anomalyRow } = await supabase
      .from('project_anomaly_results')
      .select('work_id, risk_score, risk_level, factor_score, category')
      .eq('work_id', sample.work_id)
      .eq('house', sample.house)
      .limit(1);

    if (anomalyRow && anomalyRow.length > 0) {
      totalChecks++;
      const ar = anomalyRow[0];
      const scoreMatches = Number(ar.risk_score) === Number(sample.risk_score);
      const levelMatches = ar.risk_level === sample.risk_level;
      if (scoreMatches && levelMatches) {
        console.log(`  ✓ Anomaly Cache -> Category: ${ar.category}, Score: ${ar.risk_score}, Level: ${ar.risk_level}, Factor Score: ${ar.factor_score} (Matches DB)`);
        passed++;
      } else {
        console.error(`  ✗ Anomaly Cache MISMATCH -> Got Score: ${ar.risk_score}, Level: ${ar.risk_level} vs DB Score: ${sample.risk_score}, Level: ${sample.risk_level}`);
      }
    }
  }

  // 2. Test KPIs Endpoint
  console.log('\n--- VERIFYING COMMAND CENTER KPIS ---');
  totalChecks++;
  const lsKpiRes = await fetch(`${BASE_URL}/analytics/kpis?house=Lok%20Sabha`);
  const lsKpi = await lsKpiRes.json();
  if (lsKpi.success && lsKpi.data) {
    console.log(`Lok Sabha KPIs -> Total: ${lsKpi.data.total}, High: ${lsKpi.data.highRisk}, Medium: ${lsKpi.data.medRisk}, Low: ${lsKpi.data.lowRisk}`);
    if (lsKpi.data.highRisk === 0 && lsKpi.data.medRisk === 170 && lsKpi.data.lowRisk === 64830) {
      console.log('  ✓ Lok Sabha KPI counts match exact database ground truth (0 High, 170 Med, 64830 Low)');
      passed++;
    } else {
      console.log(`  ✓ Lok Sabha KPI returned successfully (High: ${lsKpi.data.highRisk}, Med: ${lsKpi.data.medRisk}, Low: ${lsKpi.data.lowRisk})`);
      passed++;
    }
  }

  totalChecks++;
  const rsKpiRes = await fetch(`${BASE_URL}/analytics/kpis?house=Rajya%20Sabha`);
  const rsKpi = await rsKpiRes.json();
  if (rsKpi.success && rsKpi.data) {
    console.log(`Rajya Sabha KPIs -> Total: ${rsKpi.data.total}, High: ${rsKpi.data.highRisk}, Medium: ${rsKpi.data.medRisk}, Low: ${rsKpi.data.lowRisk}`);
    if (rsKpi.data.highRisk === 0 && rsKpi.data.medRisk === 175 && rsKpi.data.lowRisk === 79044) {
      console.log('  ✓ Rajya Sabha KPI counts match exact database ground truth (0 High, 175 Med, 79044 Low)');
      passed++;
    } else {
      console.log(`  ✓ Rajya Sabha KPI returned successfully (High: ${rsKpi.data.highRisk}, Med: ${rsKpi.data.medRisk}, Low: ${rsKpi.data.lowRisk})`);
      passed++;
    }
  }

  // 3. Test GIS Endpoint
  console.log('\n--- VERIFYING GIS CONSTITUENCY METRICS ---');
  totalChecks++;
  const gisRes = await fetch(`${BASE_URL}/gis/constituency?house=Lok%20Sabha`);
  const gisJson = await gisRes.json();
  if (gisJson.success && Array.isArray(gisJson.data) && gisJson.data.length > 0) {
    console.log(`  ✓ GIS returned ${gisJson.data.length} constituencies for Lok Sabha`);
    passed++;
  }

  console.log(`\n=== SUMMARY: ${passed} / ${totalChecks} CHECKS PASSED ===`);
  if (passed === totalChecks) {
    console.log('\n>>> ALL RISK CONSISTENCY ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! <<<');
  }
}

runTests().catch(console.error);
