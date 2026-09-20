// Generate bulk SQL update for MP photo_urls
const r = require('../scripts/mp_photos/_upload_report.json');
const fs = require('fs');
const path = require('path');

const successful = r.results.filter(x => x.status === 'SUCCESS');
console.log('Successful count:', successful.length);

// Build individual UPDATE statements (safer for MCP tool)
const statements = successful.map(x => {
  const safeUrl = x.photoUrl.replace(/'/g, "''");
  return `UPDATE public.profiles SET photo_url = '${safeUrl}', updated_at = now() WHERE id = '${x.id}' AND role = 'MP';`;
});

const sql = statements.join('\n');
const outPath = path.join(__dirname, '..', 'scripts', 'mp_photos', '_update.sql');
fs.writeFileSync(outPath, sql);
console.log('SQL written to:', outPath);
console.log('Total statements:', statements.length);
console.log('First statement:', statements[0]);
