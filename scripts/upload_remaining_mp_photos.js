/**
 * Upload all remaining MP photos from the 6 Excel files to Supabase Storage
 * and update public.profiles.photo_url.
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const ExcelJS = require(path.join(__dirname, 'node_modules', 'exceljs'));

const SUPABASE_URL = 'https://thwixsmvuydalebgkbqj.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2l4c212dXlkYWxlYmdrYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzk0NzAsImV4cCI6MjA5OTY1NTQ3MH0.CPT_auIOz0C9vzYIUnLGaXXkbJGaOWvK45GN7TBfdwQ';

const files = [
  'list of cand.xlsx',
  'list of cand2.xlsx',
  'list of cand3.xlsx',
  'list of cand4.xlsx',
  'list of cand5.xlsx',
  'list of cand6.xlsx'
];

const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'mp.image');
const OUT_DIR = path.join(ROOT, 'scripts', 'mp_photos');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const dbMps = require(path.join(__dirname, 'mp_profiles.json'));
const lsMps = dbMps.filter(m => m.house === 'Lok Sabha');

function norm(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/shri|smt\.|smt|dr\.|dr|shrimati|km\.|adv\.|adv|captain|col\.|chhatrapati|chh\./gi, '')
    .replace(/\(sc\)|\(st\)/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cellStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val.richText) return val.richText.map(r => r.text || '').join('');
  return String(val);
}

function matchScore(nameA, nameB) {
  const na = norm(nameA);
  const nb = norm(nameB);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  
  const wordsA = na.split(' ').filter(w => w.length > 2);
  const wordsB = nb.split(' ').filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  let matches = 0;
  for (const wa of wordsA) {
    if (wordsB.some(wb => wb === wa || wb.includes(wa) || wa.includes(wb))) {
      matches++;
    }
  }
  return Math.round((matches / Math.max(wordsA.length, wordsB.length)) * 100);
}

function uploadToStorage(bucket, fileName, buffer, contentType) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'thwixsmvuydalebgkbqj.supabase.co',
      path: `/storage/v1/object/${bucket}/${fileName}`,
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'x-upsert': 'true'
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// Explicit manual overrides for edge cases
const manualOverrides = {
  'Agrawal, Shri 4 Damodar': '9e83936f-8597-42f4-9650-6b0121de57fe', // DAMODAR AGARWAL
  'A, Shri Mani': '420e3c68-3ca3-4dd5-b44f-f2a0e0f69d1f', // MANI. A.
  'A, Shri Raja': '942777eb-aea7-4b55-84d4-0acbbaf24718', // Andimuthu Raja
  'Chandolia, Shri Yogender': '7d232dfe-cf7f-4565-955d-711fb7a33573', // Yogendra Chandoliya
  'Baa Iu, Shri T R': '269729bf-af05-4ef4-bc65-511ecea23f3e', // Thalikkottai Rajuthevar Baalu
  'Bhonsle, Chh.': 'e4a5944b-4be0-4840-b506-baed78f43189', // SHRIMANT CHH UDAYANRAJE PRATAPSINHAMAHARAJ BHONSLE
  'Bhupathiraju, Shri Srinivasa Varma': '3721e0ce-48ca-42b0-a4cf-b8ce6cc896da', // Srinivasa Varma
  'Barve, Shri Shyamkumar Dau fat': '1c30c1db-7388-4405-80cf-d838b4838c97', // Shyamkumar (Ramtek)
  'Chhotefal, Shri': 'e02c682c-c451-4764-a7bc-ddb90c853d37', // CHHOTELAL (Robertsganj)
  'Jagathratchakan, Shri Dr. S': 'ecec78fe-ffd0-45ca-97a9-bba9b696ff90', // S. Jagathrakshakan
  'J indaI, Shi Naveen': '4b76adde-86fd-4963-9d43-98c62f33dcc3', // NAVEEN JINDAL
  'Shinde, Dr. Shrikant Eknath': 'fd9285a3-bd19-4241-a0a5-0438c5d3bd7f', // Shrikant Eknath Shinde
  'Patel, Shri Dhaval 302 Laxman bhai': '27eef2e8-4f74-48a5-924c-f6c96e649383', // DHAVAL LAXMANBHAI PATEL
  'Patel, Shri Madhya 303 Gajendra Singh': '0f074d25-daea-4099-a71d-4e515e8d1441', // Gajendra Singh Patel
  'Patel, Shri 304 Haribhai': '3f58badc-4904-4e44-bf7f-caf014461bd3', // HARIBHAI PATEL
  'Patel, Shri 308 Praveen': 'aca0cd5d-7bcd-49fd-89f8-a57ed5b63ffd', // PRAVEEN PATEL
  'Patel, Shri Shreyas 309 M': 'dde28eb9-6551-4ac1-a54b-4b658cbe9ba4', // SHREYAS. M. PATEL
  'Patil, Shri Chandrakant Raghunath': '010ec6a8-20eb-4eb4-b9ba-fafe901c0cf9', // C R Patil
};

async function processAll() {
  console.log('=== Processing all 6 files for complete MP image extraction ===\n');

  const finalMatches = new Map(); // mpId -> { mp, buffer, ext, file, row, name }

  for (const f of files) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(IMAGE_DIR, f));
    const ws = wb.worksheets[0];
    const images = ws.getImages();

    for (const img of images) {
      const tl = img.range?.tl;
      if (!tl || tl.nativeRow === undefined) continue;
      const r = tl.nativeRow + 1;
      if (r < 4 || r > ws.rowCount - 2) continue;

      const media = wb.model.media.find(m => m.index === img.imageId);
      if (!media || !media.buffer || media.buffer.length < 500) continue;

      // Extract row text
      let rowTexts = [];
      let fullRow = '';
      for (let dr of [0, -1, 1]) {
        const row = ws.getRow(r + dr);
        row.eachCell((cell) => {
          const s = cellStr(cell.value).trim().replace(/\s+/g, ' ');
          if (s) {
            rowTexts.push(s);
            fullRow += ' ' + s;
          }
        });
      }

      if (fullRow.includes('entries found') || fullRow.includes('Rows per page')) continue;

      // Check manual overrides first
      let matchedMp = null;
      for (const [overrideKey, mpId] of Object.entries(manualOverrides)) {
        if (fullRow.includes(overrideKey) || overrideKey.split(' ').every(w => fullRow.includes(w))) {
          matchedMp = dbMps.find(m => m.id === mpId);
          if (matchedMp) break;
        }
      }

      // Check constituency matching
      if (!matchedMp) {
        for (const mp of lsMps) {
          if (!mp.constituency) continue;
          const normConst = norm(mp.constituency);
          if (normConst.length >= 4 && fullRow.toLowerCase().includes(normConst)) {
            const mpNameWords = norm(mp.mp_name).split(' ').filter(w => w.length > 2);
            const hits = mpNameWords.filter(w => fullRow.toLowerCase().includes(w)).length;
            if (hits > 0) {
              matchedMp = mp;
              break;
            }
          }
        }
      }

      // Check name matching
      if (!matchedMp) {
        let bestScore = 0;
        for (const mp of lsMps) {
          const s1 = matchScore(fullRow, mp.mp_name);
          const s2 = matchScore(fullRow, mp.full_name);
          const s = Math.max(s1, s2);
          if (s > bestScore && s >= 55) {
            bestScore = s;
            matchedMp = mp;
          }
        }
      }

      if (matchedMp) {
        if (!finalMatches.has(matchedMp.id)) {
          finalMatches.set(matchedMp.id, {
            mp: matchedMp,
            buffer: Buffer.from(media.buffer),
            ext: media.extension || 'png',
            file: f,
            row: r
          });
        }
      }
    }
  }

  console.log(`Matched total unique MPs across all 6 files: ${finalMatches.size}`);

  // Find which ones need upload or DB update
  const toUpload = [];
  for (const [mpId, item] of finalMatches.entries()) {
    toUpload.push(item);
  }

  console.log(`Starting upload and SQL generation for ${toUpload.length} MPs...`);

  let uploadSuccess = 0;
  let uploadFail = 0;
  const sqlUpdates = [];

  for (const item of toUpload) {
    const mpId = item.mp.id;
    const ext = item.ext === 'jpeg' ? 'jpeg' : 'png';
    const fileName = `${mpId}.${ext}`;
    const contentType = ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/mp-photos/${fileName}`;

    try {
      const res = await uploadToStorage('mp-photos', fileName, item.buffer, contentType);
      if (res.status === 200 || res.status === 201) {
        uploadSuccess++;
      } else {
        console.warn(`Upload warning for ${item.mp.mp_name} (${res.status}): ${res.body}`);
      }
      sqlUpdates.push({ id: mpId, url: publicUrl, name: item.mp.mp_name });
    } catch (e) {
      uploadFail++;
      console.error(`Upload error for ${item.mp.mp_name}:`, e.message);
    }
  }

  console.log(`Upload complete: ${uploadSuccess} succeeded, ${uploadFail} failed.`);

  // Write SQL in chunks of 50
  const chunkSize = 50;
  const chunkFiles = [];
  for (let i = 0; i < sqlUpdates.length; i += chunkSize) {
    const chunk = sqlUpdates.slice(i, i + chunkSize);
    const cases = chunk.map(x => `  WHEN '${x.id}' THEN '${x.url.replace(/'/g, "''")}'`).join('\n');
    const ids = chunk.map(x => `'${x.id}'`).join(', ');
    const sql = `-- Batch ${(i / chunkSize) + 1}\nUPDATE public.profiles\nSET photo_url = CASE id\n${cases}\n  ELSE photo_url\nEND,\nupdated_at = now()\nWHERE id IN (${ids})\n  AND role = 'MP';`;
    const fPath = path.join(OUT_DIR, `_full_batch_${(i / chunkSize) + 1}.sql`);
    fs.writeFileSync(fPath, sql);
    chunkFiles.push(fPath);
  }

  console.log(`Generated ${chunkFiles.length} batch SQL files in ${OUT_DIR}`);
}

processAll().catch(console.error);
