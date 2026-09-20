import { supabase } from '../src/services/supabase.service.js';
import app from '../src/server.js';

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

async function runAuditorTestSuite() {
  console.log('\n======================================================');
  console.log('MPLADS SENTINEL — AUDITOR ROLE VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  const PORT = 4010;
  const server = app.listen(PORT);
  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    // -------------------------------------------------------------------------
    // 1. AUDITOR AUTHENTICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 1. AUDITOR AUTHENTICATION ---');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'auditor@mplads-demo.local',
      password: 'AuditorMoSPI@123',
    });

    const auditorToken = authData?.session?.access_token;
    record(
      'Auditor Sign In',
      !!auditorToken,
      auditorToken ? 'JWT access token acquired' : `Sign in failed: ${authError?.message}`
    );

    if (!auditorToken) {
      throw new Error('Aborting tests: Auditor login failed.');
    }

    // -------------------------------------------------------------------------
    // 2. AUDITOR PROFILE & SCOPE CHECK
    // -------------------------------------------------------------------------
    console.log('\n--- 2. PROFILE & SCOPE VERIFICATION ---');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    record(
      'Auditor Profile Role Check',
      profile?.role === 'AUDITOR',
      `Role in DB: "${profile?.role}" (Expected: AUDITOR)`
    );

    record(
      'Auditor Scope Check',
      profile?.state === null && profile?.district === null,
      `National Scrutiny Scope (state: ${profile?.state ?? 'null'}, district: ${profile?.district ?? 'null'})`
    );

    // -------------------------------------------------------------------------
    // 3. AUDITOR KPIS (REAL DATABASE TOTALS)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. AUDITOR KPIS ENDPOINT ---');
    const kpiResLS = await fetch(`${baseUrl}/api/auditor/kpis?house=Lok%20Sabha`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    const kpiJsonLS = await kpiResLS.json();

    const lsKpis = kpiJsonLS.data;
    record(
      'Lok Sabha Real KPIs Returned',
      kpiResLS.status === 200 && lsKpis && lsKpis.totalCases === 65000,
      `Total: ${lsKpis?.totalCases?.toLocaleString()} | Awaiting: ${lsKpis?.casesAwaitingReview?.toLocaleString()} | High Risk: ${lsKpis?.highRiskCases?.toLocaleString()} | Sanction Sum: ₹${(lsKpis?.totalSanctionAmount / 10000000).toFixed(2)} Cr`
    );

    const kpiResRS = await fetch(`${baseUrl}/api/auditor/kpis?house=Rajya%20Sabha`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    const kpiJsonRS = await kpiResRS.json();
    const rsKpis = kpiJsonRS.data;

    record(
      'Rajya Sabha Real KPIs Returned',
      kpiResRS.status === 200 && rsKpis && rsKpis.totalCases === 79219,
      `Total: ${rsKpis?.totalCases?.toLocaleString()} | Awaiting: ${rsKpis?.casesAwaitingReview?.toLocaleString()} | High Risk: ${rsKpis?.highRiskCases?.toLocaleString()}`
    );

    // -------------------------------------------------------------------------
    // 4. AUDITOR VERIFICATION QUEUE (SERVER PAGINATED)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. VERIFICATION QUEUE & PAGINATION ---');
    const queueRes = await fetch(`${baseUrl}/api/auditor/queue?house=Lok%20Sabha&page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    const queueJson = await queueRes.json();
    const queueData = queueJson.data;

    record(
      'Server-Side Paginated Queue',
      queueRes.status === 200 && queueData?.records?.length === 10 && queueData?.totalCount === 65000,
      `Received page 1 of ${queueData?.totalPages} (${queueData?.records?.length} items) from ${queueData?.totalCount?.toLocaleString()} total records`
    );

    const firstCase = queueData?.records?.[0];
    record(
      'Queue Record Schema Integrity',
      firstCase && firstCase.workId && firstCase.riskScore !== undefined && firstCase.anomalyType && firstCase.priority,
      `Work ID: ${firstCase?.workId} | Anomaly: ${firstCase?.anomalyType} | Risk: ${firstCase?.riskLevel} (${firstCase?.riskScore}) | Priority: ${firstCase?.priority}`
    );

    const targetWorkId = firstCase.workId;

    // -------------------------------------------------------------------------
    // 5. AUDITOR CASE FILE RETRIEVAL
    // -------------------------------------------------------------------------
    console.log('\n--- 5. CASE FILE RETRIEVAL ---');
    const caseRes = await fetch(`${baseUrl}/api/auditor/case/${encodeURIComponent(targetWorkId)}?house=Lok%20Sabha`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    const caseJson = await caseRes.json();
    const caseFile = caseJson.data;

    record(
      'Case File Retrieval',
      caseRes.status === 200 && caseFile?.project?.work_id === targetWorkId,
      `Loaded case dossier for ${targetWorkId}`
    );

    record(
      'Why Attention Explanations Present',
      Array.isArray(caseFile?.whyAttention) && caseFile.whyAttention.length > 0,
      `Triggered ${caseFile?.whyAttention?.length} anomaly explanation indicators`
    );

    record(
      'Case Timeline Generated',
      Array.isArray(caseFile?.timelineEvents) && caseFile.timelineEvents.length > 0,
      `${caseFile?.timelineEvents?.length} chronological events mapped`
    );

    // -------------------------------------------------------------------------
    // 6. VERIFICATION STATUS TRANSITION WORKFLOW
    // -------------------------------------------------------------------------
    console.log('\n--- 6. VERIFICATION TRANSITIONS & AUDIT LOGGING ---');

    // 6a: Transition to 'Under Review'
    const statusRes1 = await fetch(`${baseUrl}/api/auditor/case/${encodeURIComponent(targetWorkId)}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auditorToken}`,
      },
      body: JSON.stringify({
        house: 'Lok Sabha',
        status: 'Under Review',
        comment: 'Independent audit scrutiny initiated by Senior Audit Officer.',
      }),
    });
    const statusJson1 = await statusRes1.json();
    record(
      'Transition: New Alert → Under Review',
      statusRes1.status === 200 && statusJson1?.data?.newStatus === 'Under Review',
      `Status updated to "${statusJson1?.data?.newStatus}"`
    );

    // 6b: Request Inspection
    const inspectRes = await fetch(`${baseUrl}/api/auditor/case/${encodeURIComponent(targetWorkId)}/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auditorToken}`,
      },
      body: JSON.stringify({
        house: 'Lok Sabha',
        reason: 'Expenditure & Physical Progress Verification',
        priority: 'High',
        notes: 'Mandate site visit by district engineering squad to inspect boundary wall foundation.',
      }),
    });
    const inspectJson = await inspectRes.json();
    record(
      'Transition: Under Review → Inspection Requested',
      inspectRes.status === 200 && inspectJson?.data?.newStatus === 'Inspection Requested',
      `Status updated to "${inspectJson?.data?.newStatus}"`
    );

    // 6c: Add Review Note
    const noteRes = await fetch(`${baseUrl}/api/auditor/case/${encodeURIComponent(targetWorkId)}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auditorToken}`,
      },
      body: JSON.stringify({
        house: 'Lok Sabha',
        note: 'Inspection report and Measurement Book verification complete. Quantities reconciled.',
      }),
    });
    const noteJson = await noteRes.json();
    record(
      'Append Auditor Review Note',
      noteRes.status === 200 && noteJson.success,
      'Review note successfully appended to immutable case history'
    );

    // 6d: Transition to 'Verified'
    const statusRes2 = await fetch(`${baseUrl}/api/auditor/case/${encodeURIComponent(targetWorkId)}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auditorToken}`,
      },
      body: JSON.stringify({
        house: 'Lok Sabha',
        status: 'Verified',
        comment: 'Audit completed. Observations closed with verified clearance.',
      }),
    });
    const statusJson2 = await statusRes2.json();
    record(
      'Transition: Inspection Requested → Verified',
      statusRes2.status === 200 && statusJson2?.data?.newStatus === 'Verified',
      `Final finding committed: "${statusJson2?.data?.newStatus}"`
    );

    // -------------------------------------------------------------------------
    // 7. AUDIT TRAIL LOGGING INTEGRITY
    // -------------------------------------------------------------------------
    console.log('\n--- 7. AUDIT TRAIL VERIFICATION ---');
    const recentRes = await fetch(`${baseUrl}/api/auditor/recent-activity?house=Lok%20Sabha&limit=5`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    const recentJson = await recentRes.json();
    const recentEvents = recentJson.data;

    const matchedAudit = recentEvents?.find((e: any) => e.work_id === targetWorkId);
    record(
      'Audit Trail Event Logging',
      !!matchedAudit,
      matchedAudit ? `Found audit event: "${matchedAudit.action}" by "${matchedAudit.actor_name}"` : 'Failed to find audit trail record'
    );

    // -------------------------------------------------------------------------
    // 8. SECURITY & ROLE AUTHORIZATION ENFORCEMENT
    // -------------------------------------------------------------------------
    console.log('\n--- 8. SECURITY & AUTHORIZATION TESTS ---');

    // 8a: Unauthenticated access rejected
    const unauthRes = await fetch(`${baseUrl}/api/auditor/kpis`);
    record(
      'Security: Unauthenticated API Access Blocked',
      unauthRes.status === 401,
      `Status code ${unauthRes.status} (Expected: 401 Unauthorized)`
    );

    // 8b: Non-Auditor role access rejected
    const { data: doLogin } = await supabase.auth.signInWithPassword({
      email: 'do.varanasi@mplads-demo.local',
      password: 'DistrictOfficerVaranasi@123',
    });
    const doToken = doLogin?.session?.access_token;

    const doRes = await fetch(`${baseUrl}/api/auditor/kpis`, {
      headers: { Authorization: `Bearer ${doToken}` },
    });
    record(
      'Security: Non-Auditor Role (District Officer) Blocked from Auditor API',
      doRes.status === 403,
      `Status code ${doRes.status} (Expected: 403 Forbidden)`
    );

    // 8c: Re-login as Auditor to ensure clean session state
    await supabase.auth.signInWithPassword({
      email: 'auditor@mplads-demo.local',
      password: 'AuditorMoSPI@123',
    });

  } catch (err: any) {
    console.error('Test runner fatal error:', err);
  } finally {
    server.close();
  }

  // Summary Report
  console.log('\n========================================');
  console.log('AUDITOR TEST SUITE RESULTS SUMMARY');
  console.log('========================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuditorTestSuite();
