/**
 * MP Photo Upload Script
 * 
 * 1. Reads all 6 Excel files from mp.image/
 * 2. Extracts embedded images with MP name context
 * 3. Matches names to existing profiles (role='MP', Lok Sabha only)
 * 4. Creates Supabase Storage bucket 'mp-photos' if needed
 * 5. Uploads images to Supabase Storage
 * 6. Updates ONLY photo_url in profiles table for matched MPs
 * 
 * Rules: No duplicate records, no data mutation, only photo_url updated
 */
const ExcelJS = require('../scripts/node_modules/exceljs');
const https = require('https');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

// We need service role key for storage operations - read from env
// Try multiple locations
let SUPABASE_SERVICE_KEY = '';
const envPaths = [
  path.join(__dirname, '..', 'backend', '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', 'frontend', '.env'),
];
for (const ep of envPaths) {
  if (fs.existsSync(ep)) {
    const content = fs.readFileSync(ep, 'utf8');
    const match = content.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
    const match2 = content.match(/SERVICE_ROLE_KEY=([^\r\n]+)/);
    if (match) { SUPABASE_SERVICE_KEY = match[1].trim(); break; }
    if (match2) { SUPABASE_SERVICE_KEY = match2[1].trim(); break; }
  }
}

if (!SUPABASE_SERVICE_KEY) {
  // Use anon key as fallback for reading, but storage will need service role
  console.warn('WARNING: No SUPABASE_SERVICE_ROLE_KEY found. Will use anon key (storage upload may fail).');
  SUPABASE_SERVICE_KEY = SUPABASE_ANON_KEY;
}

const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'mp.image');
const CLEAN_DIR = path.join(ROOT, 'scripts', 'mp_photos');

if (!fs.existsSync(CLEAN_DIR)) fs.mkdirSync(CLEAN_DIR, { recursive: true });

const files = [
  'list of cand.xlsx',
  'list of cand2.xlsx',
  'list of cand3.xlsx',
  'list of cand4.xlsx',
  'list of cand5.xlsx',
  'list of cand6.xlsx',
];

// ── Helper: HTTP request ──────────────────────────────────────────────────────
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Supabase REST helpers ─────────────────────────────────────────────────────
async function supabaseQuery(path, opts = {}) {
  const url = new URL(SUPABASE_URL + '/rest/v1' + path);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      url.searchParams.set(k, v);
    }
  }
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: opts.method || 'GET',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...opts.headers,
    },
  };
  const body = opts.body ? Buffer.from(JSON.stringify(opts.body)) : undefined;
  if (body) options.headers['Content-Length'] = body.length;
  const res = await httpRequest(options, body);
  try { return { status: res.status, data: JSON.parse(res.body.toString()) }; }
  catch { return { status: res.status, data: res.body.toString() }; }
}

async function supabaseStorageUpload(bucket, objectPath, fileBuffer, contentType) {
  const urlPath = `/storage/v1/object/${bucket}/${objectPath}`;
  const options = {
    hostname: new URL(SUPABASE_URL).hostname,
    path: urlPath,
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length,
      'x-upsert': 'true',
    },
  };
  return httpRequest(options, fileBuffer);
}

async function createBucket(name) {
  const options = {
    hostname: new URL(SUPABASE_URL).hostname,
    path: '/storage/v1/bucket',
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
  };
  const body = Buffer.from(JSON.stringify({ id: name, name: name, public: true }));
  options.headers['Content-Length'] = body.length;
  const res = await httpRequest(options, body);
  return { status: res.status, body: res.body.toString() };
}

// ── Text helpers ──────────────────────────────────────────────────────────────
function getCellText(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (typeof cell.value === 'string') return cell.value.trim();
  if (typeof cell.value === 'number') return String(cell.value);
  if (cell.value && typeof cell.value === 'object') {
    if (Array.isArray(cell.value.richText)) {
      return cell.value.richText.map(r => r.text || '').join('').trim();
    }
    if (cell.value.result !== undefined) return String(cell.value.result).trim();
  }
  return String(cell.value || '').trim();
}

function normalizeName(name) {
  // Remove titles, extra spaces, normalize to searchable form
  return name
    .replace(/Shri|Smt\.|Dr\.|Shrimati|Km\.|Adv\.?|Captain|Col\./gi, '')
    .replace(/\n/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function nameMatchScore(extractedName, dbMpName) {
  const norm1 = normalizeName(extractedName);
  const norm2 = dbMpName.toUpperCase().replace(/\s+/g, ' ').trim();

  if (norm1 === norm2) return 100;

  // Check if all words in extracted name appear in db name
  const words1 = norm1.split(' ').filter(w => w.length > 2);
  const words2 = norm2.split(' ').filter(w => w.length > 2);

  let matchCount = 0;
  for (const w of words1) {
    if (words2.some(w2 => w2.includes(w) || w.includes(w2))) matchCount++;
  }

  if (words1.length === 0) return 0;
  return Math.round((matchCount / words1.length) * 100);
}

function findBestMatch(extractedName, mpProfiles) {
  let bestScore = 0;
  let bestMatch = null;

  for (const mp of mpProfiles) {
    const score = nameMatchScore(extractedName, mp.mp_name || mp.full_name || '');
    if (score > bestScore) {
      bestScore = score;
      bestMatch = mp;
    }
  }

  return { match: bestMatch, score: bestScore };
}

// ── Extract images from a file ────────────────────────────────────────────────
async function extractImages(filename) {
  const filePath = path.join(IMAGE_DIR, filename);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  const images = ws.getImages();

  // Build row->text map
  const rowData = {};
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const texts = [];
    row.eachCell({ includeEmpty: false }, (cell) => {
      const t = getCellText(cell);
      if (t && t.length > 1) texts.push(t);
    });
    rowData[r] = texts;
  }

  const results = [];

  for (const img of images) {
    const nativeRow = img.range?.tl?.nativeRow;
    if (nativeRow === undefined || nativeRow === null) continue;
    const rowNum = nativeRow + 1;

    // Search for MP name in surrounding rows
    let candidateName = '';
    for (let dr = 0; dr <= 5; dr++) {
      const texts = rowData[rowNum + dr] || [];
      for (const t of texts) {
        // Must look like a real person name (not just numbers/junk)
        const cleaned = t.replace(/\n.*$/s, '').trim(); // first line only
        if (cleaned.length > 4 &&
            !cleaned.match(/^\d+$/) &&
            !cleaned.toLowerCase().includes('lok sabha') &&
            !cleaned.toLowerCase().includes('list of members') &&
            !cleaned.toLowerCase().includes('home /') &&
            !cleaned.toLowerCase().includes('statistical') &&
            !cleaned.toLowerCase().includes('entries found') &&
            !cleaned.toLowerCase().includes('national informatics') &&
            !cleaned.toLowerCase().includes('privacy policy') &&
            !cleaned.toLowerCase().includes('sitting') &&
            !cleaned.match(/^[A-Z]\s+[A-Z]\s+[A-Z]/) && // alphabet nav
            cleaned.match(/[a-zA-Z]{3,}/) // has letters
        ) {
          candidateName = cleaned;
          break;
        }
      }
      if (candidateName) break;
    }

    if (!candidateName || candidateName.length < 4) continue;

    const imageData = wb.model.media.find(m => m.index === img.imageId);
    if (!imageData || !imageData.buffer) continue;

    results.push({
      name: candidateName,
      buffer: Buffer.from(imageData.buffer),
      ext: imageData.extension || 'jpeg',
      sourceFile: filename,
      row: rowNum,
    });
  }

  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== MPLADS Sentinel: MP Photo Upload ===\n');

  // 1. Fetch all MP Lok Sabha profiles from Supabase
  console.log('1. Fetching MP profiles from Supabase...');
  const res = await supabaseQuery('/profiles', {
    params: {
      role: 'eq.MP',
      house: 'eq.Lok Sabha',
      select: 'id,full_name,mp_name,constituency,state,photo_url',
    },
  });

  if (res.status !== 200 || !Array.isArray(res.data)) {
    console.error('Failed to fetch profiles:', res.status, res.data);
    process.exit(1);
  }

  const mpProfiles = res.data;
  console.log(`   Found ${mpProfiles.length} MP Lok Sabha profiles\n`);

  // 2. Create storage bucket
  console.log('2. Creating storage bucket "mp-photos"...');
  const bucketRes = await createBucket('mp-photos');
  if (bucketRes.status === 200 || bucketRes.status === 201) {
    console.log('   Bucket created successfully');
  } else {
    console.log(`   Bucket response: ${bucketRes.status} - ${bucketRes.body}`);
    console.log('   (Bucket may already exist, continuing...)');
  }

  // 3. Extract all images from all Excel files
  console.log('\n3. Extracting images from Excel files...');
  const allExtracted = [];
  for (const file of files) {
    try {
      const imgs = await extractImages(file);
      console.log(`   ${file}: ${imgs.length} images extracted`);
      allExtracted.push(...imgs);
    } catch (e) {
      console.error(`   Error in ${file}:`, e.message);
    }
  }
  console.log(`   Total extracted: ${allExtracted.length}\n`);

  // 4. Deduplicate: one best image per MP
  console.log('4. Matching images to MP profiles...');

  const matched = new Map(); // mp id -> {mp, image, score}
  const unmatched = [];

  for (const img of allExtracted) {
    const { match, score } = findBestMatch(img.name, mpProfiles);
    if (!match || score < 60) {
      unmatched.push({ name: img.name, score, sourceFile: img.sourceFile });
      continue;
    }

    const existing = matched.get(match.id);
    if (!existing || score > existing.score) {
      matched.set(match.id, { mp: match, image: img, score });
    }
  }

  console.log(`   Matched: ${matched.size} unique MPs`);
  console.log(`   Unmatched: ${unmatched.length} images\n`);

  // 5. Upload and update
  console.log('5. Uploading photos and updating database...\n');

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const [mpId, { mp, image, score }] of matched) {
    const contentType = image.ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `${mpId}.${image.ext}`;

    process.stdout.write(`   Uploading: ${mp.mp_name || mp.full_name}... `);

    // Upload to storage
    const uploadRes = await supabaseStorageUpload('mp-photos', fileName, image.buffer, contentType);
    
    if (uploadRes.status !== 200 && uploadRes.status !== 201) {
      console.log(`UPLOAD FAILED (${uploadRes.status})`);
      failCount++;
      results.push({ mp: mp.mp_name, id: mpId, status: 'UPLOAD_FAILED', uploadStatus: uploadRes.status });
      continue;
    }

    // Build public URL
    const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/mp-photos/${fileName}`;

    // Update only photo_url in profiles
    const updateRes = await supabaseQuery(`/profiles?id=eq.${mpId}`, {
      method: 'PATCH',
      body: { photo_url: photoUrl },
      prefer: 'return=minimal',
    });

    if (updateRes.status === 204 || updateRes.status === 200) {
      console.log(`OK (score=${score})`);
      successCount++;
      results.push({
        mp: mp.mp_name || mp.full_name,
        id: mpId,
        constituency: mp.constituency,
        state: mp.state,
        imageFile: image.sourceFile,
        photoUrl,
        matchScore: score,
        status: 'SUCCESS',
      });
    } else {
      console.log(`DB UPDATE FAILED (${updateRes.status})`);
      failCount++;
      results.push({ mp: mp.mp_name, id: mpId, status: 'DB_FAILED', updateStatus: updateRes.status });
    }
  }

  // 6. Save report
  const reportPath = path.join(CLEAN_DIR, '_upload_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ 
    timestamp: new Date().toISOString(),
    summary: { total: matched.size, success: successCount, failed: failCount, unmatched: unmatched.length },
    results,
    unmatched: unmatched.slice(0, 50),
  }, null, 2));

  console.log('\n=== SUMMARY ===');
  console.log(`Total matched MPs: ${matched.size}`);
  console.log(`Successfully uploaded & updated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Unmatched images: ${unmatched.length}`);
  console.log(`\nReport saved: ${reportPath}`);

  if (successCount > 0) {
    console.log('\n✅ Successful assignments:');
    results.filter(r => r.status === 'SUCCESS').forEach((r, i) => {
      console.log(`  ${i+1}. ${r.mp} (${r.constituency}, ${r.state})`);
      console.log(`     ID: ${r.id}`);
      console.log(`     URL: ${r.photoUrl}`);
      console.log(`     Source: ${r.imageFile} (match score: ${r.matchScore}%)`);
    });
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});