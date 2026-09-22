import http from 'http';
import https from 'https';
import app from '../dist/server.js';

const PORT = 4099;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING PUBLIC PORTAL & COMPLAINT SECURITY TESTS');
  console.log('====================================================');

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Public KPIs
    const kpiRes = await request('GET', '/api/public/kpis');
    assert('GET /api/public/kpis returns 200 and valid counts', kpiRes.status === 200 && kpiRes.body.data.totalWorks > 0);

    // 2. Public Meta
    const metaRes = await request('GET', '/api/public/meta');
    assert('GET /api/public/meta returns public dataset transparency metadata', metaRes.status === 200 && metaRes.body.data.house === 'Lok Sabha');

    // 3. Public MP Directory
    const mpsRes = await request('GET', '/api/public/mps?page=1&pageSize=5');
    assert('GET /api/public/mps returns paginated real Lok Sabha MPs', mpsRes.status === 200 && mpsRes.body.data.mps.length === 5);
    const sampleMp = mpsRes.body.data.mps[0];
    assert('MP directory card has safe fields and no private contact details', sampleMp.name && sampleMp.constituency && sampleMp.party === 'Not specified' && !sampleMp.phone);

    // 4. Public MP Profile
    const mpProfRes = await request('GET', `/api/public/mps/${sampleMp.mpId}`);
    assert('GET /api/public/mps/:mpId returns public portfolio metrics and no internal notes', mpProfRes.status === 200 && mpProfRes.body.data.portfolioSummary.totalWorks >= 0);

    // 5. Public Projects Explorer
    const projRes = await request('GET', '/api/public/projects?page=1&pageSize=5');
    assert('GET /api/public/projects returns server-side paginated projects', projRes.status === 200 && projRes.body.data.projects.length === 5);
    const validWork = projRes.body.data.projects[0];

    // 6. Public Project Detail
    const projDetailRes = await request('GET', `/api/public/projects/${encodeURIComponent(validWork.workId)}`);
    assert('GET /api/public/projects/:workId returns safe financial & execution details', projDetailRes.status === 200 && projDetailRes.body.data.financials.sanctionAmount >= 0);
    assert('Public project detail exposes NO internal officer notes or auditor evidence', !projDetailRes.body.data.internalNotes && !projDetailRes.body.data.officerNotes);

    // 7. Complaint Security: Reject invalid/nonexistent workId
    const fakeCmp = await request('POST', '/api/public/complaints', {
      workId: 'NONEXISTENT_WORK_12345',
      complaintCategory: 'Project Not Progressing',
      description: 'This is a test description of at least twenty characters.',
    });
    assert('Complaint API rejects nonexistent Project Work ID with 400', fakeCmp.status === 400);

    // 8. Complaint Security: Reject empty or short description
    const shortDesc = await request('POST', '/api/public/complaints', {
      workId: validWork.workId,
      complaintCategory: 'Project Not Progressing',
      description: 'Short',
    });
    assert('Complaint API rejects short description (<20 chars) with 400', shortDesc.status === 400);

    // 9. Complaint Security: Reject invalid category
    const badCat = await request('POST', '/api/public/complaints', {
      workId: validWork.workId,
      complaintCategory: 'Fraud Confirmed By User',
      description: 'This is a test description of at least twenty characters.',
    });
    assert('Complaint API rejects non-whitelisted/accusatory category with 400', badCat.status === 400);

    // 10. Complaint Submission: Valid submission succeeds
    const validSubmit = await request('POST', '/api/public/complaints', {
      workId: validWork.workId,
      complaintCategory: 'Project Not Progressing',
      description: 'Physical work on this community hall has stopped for over 6 months without explanation.',
      complainantName: 'Citizen Tester <script>alert("xss")</script>',
      complainantMobile: '9876543210',
      complainantEmail: 'citizen.tester@example.com',
      locationLandmark: 'Near Gandhi Chowk',
    });
    assert('Valid complaint submission succeeds with 201', validSubmit.status === 201);
    const { complaintId, verificationToken } = validSubmit.body.data;
    assert('Complaint ID follows format MPLADS-CMP-XXXXXX', complaintId && complaintId.startsWith('MPLADS-CMP-'));
    assert('Tracking verification token is generated and returned', Boolean(verificationToken));

    // 11. Complaint Tracking: Valid verification succeeds
    const trackSuccess = await request('POST', '/api/public/complaints/track', {
      complaintId,
      verificationValue: '9876543210',
    });
    assert('Tracking complaint with matching mobile succeeds with 200', trackSuccess.status === 200);
    assert('Tracking response returns public safe fields only (no complainant name/phone leaked)', 
      trackSuccess.body.data.status === 'SUBMITTED' && 
      trackSuccess.body.data.complaintId === complaintId &&
      !trackSuccess.body.data.complainantName &&
      !trackSuccess.body.data.complainantMobile
    );

    // 12. Complaint Tracking: Token verification succeeds
    const trackTokenSuccess = await request('POST', '/api/public/complaints/track', {
      complaintId,
      verificationValue: verificationToken,
    });
    assert('Tracking complaint with matching token succeeds with 200', trackTokenSuccess.status === 200);

    // 13. Complaint Tracking Security: Enumeration / incorrect verification rejected
    const trackUnauthorized = await request('POST', '/api/public/complaints/track', {
      complaintId,
      verificationValue: '9999999999',
    });
    assert('Tracking complaint with wrong verification value is blocked with 403', trackUnauthorized.status === 403);

    // 14. Protected routes remain blocked for unauthenticated requests
    const auditorBlocked = await request('GET', '/api/auditor/kpis');
    assert('Protected auditor API rejects unauthenticated caller with 401/403', auditorBlocked.status === 401 || auditorBlocked.status === 403);

    const agencyBlocked = await request('GET', '/api/implementing-agency/projects');
    assert('Protected implementing agency API rejects unauthenticated caller with 401/403', agencyBlocked.status === 401 || agencyBlocked.status === 403);

    console.log('====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } finally {
    server.close();
  }

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
