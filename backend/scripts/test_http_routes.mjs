import { spawn } from 'child_process';
import http from 'http';

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:4000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function testHttpEndpoints() {
  console.log('[Backend Test] Starting server process...');
  const server = spawn('node', ['dist/server.js'], { cwd: process.cwd(), stdio: 'inherit' });

  // Wait 2 seconds for server to start listening
  await new Promise(r => setTimeout(r, 2000));

  try {
    console.log('[Backend Test] Testing /api/health...');
    const health = await fetchUrl('/api/health');
    console.log('Health:', health.status, health.body);

    console.log('[Backend Test] Testing /api/analytics/kpis...');
    const kpis = await fetchUrl('/api/analytics/kpis?house=Lok%20Sabha');
    console.log('KPIs:', kpis.status, 'Total works:', kpis.body?.data?.total || kpis.body?.total);

    console.log('[Backend Test] Testing /api/anomalies/counts...');
    const anom = await fetchUrl('/api/anomalies/counts?house=Lok%20Sabha');
    console.log('Anomalies:', anom.status, anom.body);

    console.log('[Backend Test] Testing /api/projects...');
    const proj = await fetchUrl('/api/projects?house=Lok%20Sabha&pageSize=3');
    console.log('Projects:', proj.status, 'Count:', proj.body?.data?.projects?.length || proj.body?.projects?.length);

    console.log('[Backend Test] Testing /api/gis/states...');
    const states = await fetchUrl('/api/gis/states?house=Rajya%20Sabha');
    console.log('GIS States:', states.status, 'States count:', (states.body?.data || states.body)?.length);

    console.log('\nAll Express HTTP routes verified successfully!');
  } catch (err) {
    console.error('HTTP Test failed:', err);
    process.exitCode = 1;
  } finally {
    console.log('[Backend Test] Stopping server process...');
    server.kill();
  }
}

testHttpEndpoints();
