/**
 * Execute bulk SQL updates via Supabase REST API (bypasses RLS using service role)
 * Since we don't have service key, we'll generate CASE SQL and print it for MCP execution
 */
const fs = require('fs');
const path = require('path');

const r = require('../scripts/mp_photos/_upload_report.json');
const successful = r.results.filter(x => x.status === 'SUCCESS');

// Generate batch CASE UPDATE SQL in chunks of 50
const chunkSize = 50;
const chunks = [];
for (let i = 0; i < successful.length; i += chunkSize) {
  chunks.push(successful.slice(i, i + chunkSize));
}

const sqls = chunks.map((chunk, idx) => {
  const cases = chunk.map(x => {
    const url = x.photoUrl.replace(/'/g, "''");
    return `  WHEN '${x.id}' THEN '${url}'`;
  }).join('\n');
  const ids = chunk.map(x => `'${x.id}'`).join(', ');
  return `-- Batch ${idx + 1}/${chunks.length}\nUPDATE public.profiles\nSET photo_url = CASE id\n${cases}\n  ELSE photo_url\nEND,\nupdated_at = now()\nWHERE id IN (${ids})\n  AND role = 'MP';`;
});

// Write each batch to a separate file
sqls.forEach((sql, i) => {
  const outPath = path.join(__dirname, '..', 'scripts', 'mp_photos', `_batch${i+1}.sql`);
  fs.writeFileSync(outPath, sql);
});

// Also write combined
const combined = sqls.join('\n\n');
fs.writeFileSync(path.join(__dirname, '..', 'scripts', 'mp_photos', '_all_batches.sql'), combined);

console.log(`Generated ${chunks.length} batches`);
console.log('Batch 1 preview:');
console.log(sqls[0].substring(0, 800));
