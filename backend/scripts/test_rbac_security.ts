import { supabase } from '../src/services/supabase.service.js';
import app from '../src/server.js';
import type { Server } from 'http';

interface TestResult {
  test: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function record(test: string, passed: boolean, detail: string) {
  results.push({ test, passed, detail });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark}: ${test} — ${detail}`);
}

async function runTests() {
  console.log('\n========================================');
  console.log('MPLADS SENTINEL — RBAC SECURITY TEST SUITE');
  console.log('========================================\n');

  const PORT = 4005;
  const server = app.listen(PORT);
  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    // ----------------------------------------------------
    // TEST 1: Login for All 6 Approved Roles
    // ----------------------------------------------------
    console.log('\n--- 1. AUTHENTICATION TESTS (ALL 6 CANONICAL ROLES) ---');

    const roleCredentials = [
      { role: 'MOSPI_ADMIN', email: 'admin@mplads-demo.local', pass: 'MospiAdmin@123' },
      { role: 'STATE_NODAL_OFFICER', email: 'sno.up@mplads-demo.local', pass: 'StateNodalUP@123' },
      { role: 'DISTRICT_OFFICER', email: 'do.varanasi@mplads-demo.local', pass: 'DistrictOfficerVaranasi@123' },
      { role: 'IMPLEMENTING_AGENCY', email: 'agency.pwd@mplads-demo.local', pass: 'AgencyPWD@123' },
      { role: 'MP (Lok Sabha)', email: 'priyasaroj.ls@mplads-demo.local', pass: 'PriyaSaroj@123' },
      { role: 'MP (Rajya Sabha)', email: 'priyasaroj.rs@mplads-demo.local', pass: 'PriyaSaroj@123' },
      { role: 'AUDITOR', email: 'auditor@mplads-demo.local', pass: 'AuditorMoSPI@123' },
    ];

    const tokens: Record<string, string> = {};

    for (const cred of roleCredentials) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.pass,
      });

      const success = !!data?.session?.access_token;
      if (success) {
        tokens[cred.role] = data.session.access_token;
      }
      record(
        `Auth: ${cred.role} login`,
        success,
        success ? `Token generated for ${cred.email}` : `Login failed: ${error?.message}`
      );
    }

    // ----------------------------------------------------
    // TEST 2: Verify Profiles via /api/auth/profile
    // ----------------------------------------------------
    console.log('\n--- 2. PROFILE RESOLUTION & DATA SCOPES ---');

    for (const [role, token] of Object.entries(tokens)) {
      const res = await fetch(`${baseUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const match = json.success && json.data?.profile && json.data?.scope;
      record(
        `Profile & Scope: ${role}`,
        match,
        match ? `Resolved role ${json.data.profile.role}, scope: ${JSON.stringify(json.data.scope)}` : `Profile fetch failed: ${JSON.stringify(json)}`
      );
    }

    // ----------------------------------------------------
    // TEST 3: Cross-MP Data Isolation Security Test
    // ----------------------------------------------------
    console.log('\n--- 3. CROSS-MP DATA ISOLATION TESTS ---');

    // Fetch Priya Saroj's own workId and Sambit Patra's workId
    const { data: priyaWorks } = await supabase
      .from('lok_sabha_projects')
      .select('work_id, mp_name')
      .ilike('mp_name', '%PRIYA SAROJ%')
      .limit(1);

    const { data: sambitWorks } = await supabase
      .from('lok_sabha_projects')
      .select('work_id, mp_name')
      .ilike('mp_name', '%SAMBIT PATRA%')
      .limit(1);

    const priyaWorkId = priyaWorks?.[0]?.work_id;
    const sambitWorkId = sambitWorks?.[0]?.work_id;

    console.log(`[Test] Priya Saroj Work ID: ${priyaWorkId}`);
    console.log(`[Test] Sambit Patra Work ID: ${sambitWorkId}`);

    const priyaToken = tokens['MP (Lok Sabha)'];

    // 3a. Priya Saroj requesting own project
    if (priyaWorkId) {
      const ownRes = await fetch(`${baseUrl}/api/projects/${encodeURIComponent(priyaWorkId)}?house=Lok%20Sabha`, {
        headers: { Authorization: `Bearer ${priyaToken}` },
      });
      const ownJson = await ownRes.json();
      record(
        'MP Access: Access own project',
        ownRes.status === 200 && ownJson.success,
        `Priya Saroj successfully viewed own project ${priyaWorkId}`
      );
    }

    // 3b. Priya Saroj attempting to access Sambit Patra's project (MUST BE 403)
    if (sambitWorkId) {
      const leakRes = await fetch(`${baseUrl}/api/projects/${encodeURIComponent(sambitWorkId)}?house=Lok%20Sabha`, {
        headers: { Authorization: `Bearer ${priyaToken}` },
      });
      const leakJson = await leakRes.json();
      const blocked = leakRes.status === 403;
      record(
        'Security: MP cross-project leakage blocked',
        blocked,
        blocked
          ? `Correctly received 403 Forbidden: "${leakJson.message}"`
          : `SECURITY VULNERABILITY: HTTP status was ${leakRes.status}`
      );
    }

    // 3c. Priya Saroj attempting to query projects with ?mpName=SAMBIT PATRA (MUST BE 403)
    const filterLeakRes = await fetch(`${baseUrl}/api/projects?house=Lok%20Sabha&mpName=SAMBIT%20PATRA`, {
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    const filterLeakJson = await filterLeakRes.json();
    const filterBlocked = filterLeakRes.status === 403;
    record(
      'Security: MP querying another MP filter blocked',
      filterBlocked,
      filterBlocked
        ? `Correctly received 403 Forbidden: "${filterLeakJson.message}"`
        : `SECURITY VULNERABILITY: HTTP status was ${filterLeakRes.status}`
    );

    // ----------------------------------------------------
    // TEST 4: District Officer Cross-District Isolation
    // ----------------------------------------------------
    console.log('\n--- 4. DISTRICT OFFICER CROSS-DISTRICT ISOLATION ---');
    const doToken = tokens['DISTRICT_OFFICER'];

    // Query another district (e.g. LUCKNOW or JAUNPUR)
    const doLeakRes = await fetch(`${baseUrl}/api/projects?district=LUCKNOW`, {
      headers: { Authorization: `Bearer ${doToken}` },
    });
    const doLeakJson = await doLeakRes.json();
    const doBlocked = doLeakRes.status === 403;
    record(
      'Security: District Officer requesting other district blocked',
      doBlocked,
      doBlocked
        ? `Correctly received 403 Forbidden: "${doLeakJson.message}"`
        : `Expected 403, got ${doLeakRes.status}`
    );

    // ----------------------------------------------------
    // TEST 5: State Officer Cross-State Isolation
    // ----------------------------------------------------
    console.log('\n--- 5. STATE OFFICER CROSS-STATE ISOLATION ---');
    const snoToken = tokens['STATE_NODAL_OFFICER'];

    // Query another state (e.g. Maharashtra)
    const snoLeakRes = await fetch(`${baseUrl}/api/projects?state=Maharashtra`, {
      headers: { Authorization: `Bearer ${snoToken}` },
    });
    const snoLeakJson = await snoLeakRes.json();
    const snoBlocked = snoLeakRes.status === 403;
    record(
      'Security: State Nodal Officer requesting other state blocked',
      snoBlocked,
      snoBlocked
        ? `Correctly received 403 Forbidden: "${snoLeakJson.message}"`
        : `Expected 403, got ${snoLeakRes.status}`
    );

    // ----------------------------------------------------
    // TEST 6: House Isolation (Lok Sabha vs Rajya Sabha)
    // ----------------------------------------------------
    console.log('\n--- 6. HOUSE ISOLATION FOR MPS ---');
    const rsToken = tokens['MP (Rajya Sabha)'];

    // Rajya Sabha MP projects should be scoped to Rajya Sabha
    const rsProjectRes = await fetch(`${baseUrl}/api/projects`, {
      headers: { Authorization: `Bearer ${rsToken}` },
    });
    const rsProjectJson = await rsProjectRes.json();
    const rsProjects = rsProjectJson.data?.projects || [];
    const allRS = rsProjects.every((p: any) => p.house === 'Rajya Sabha');
    record(
      'House Isolation: Rajya Sabha MP projects only from Rajya Sabha',
      rsProjects.length > 0 && allRS,
      `Returned ${rsProjects.length} projects, all verified house = Rajya Sabha`
    );

  } finally {
    server.close();
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n========================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${results.filter(r => r.passed).length}`);
  console.log(`FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`RESULT: ${allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! 🎯' : 'SOME TESTS FAILED! ❌'}`);
  console.log('========================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('[Test Suite Exception]:', err);
  process.exit(1);
});
