/**
 * Better MP image extractor using direct XML parsing of the xlsx.
 * xlsx files are zip archives - we unzip and read the sheet XML + media directly.
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const ExcelJS = require('../scripts/node_modules/exceljs');

const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'mp.image');
const OUT_DIR = path.join(ROOT, 'scripts', 'extracted_mp_images');
const CLEAN_DIR = path.join(ROOT, 'scripts', 'mp_photos');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(CLEAN_DIR)) fs.mkdirSync(CLEAN_DIR, { recursive: true });

const files = [
  'list of cand.xlsx',
  'list of cand2.xlsx',
  'list of cand3.xlsx',
  'list of cand4.xlsx',
  'list of cand5.xlsx',
  'list of cand6.xlsx',
];

// Helper: get text from cell (handles rich text)
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

function isJunkText(t) {
  if (!t || t.length < 2) return true;
  if (t.toLowerCase().includes('lok sabha')) return true;
  if (t.toLowerCase().includes('list of members')) return true;
  if (t.toLowerCase().includes('home /')) return true;
  if (t.toLowerCase().includes('national informatics')) return true;
  if (t.toLowerCase().includes('privacy policy')) return true;
  if (t.toLowerCase().includes('statistical information')) return true;
  if (t.toLowerCase().includes('vacant constituencies')) return true;
  if (/^[A-Z\s]+$/.test(t) && t.includes('      ')) return true; // alphabet row
  if (/^\d+ entries found$/.test(t)) return true;
  if (/^[FJK\s]+$/.test(t)) return true;
  return false;
}

function isMpName(t) {
  if (!t || t.length < 4) return false;
  // MP names: "Sharma, Shri Ram" or "KUMAR, SHRI AMIT" etc.
  // Look for: comma + Shri/Smt/Dr, or typical name patterns
  if (/,\s*(Shri|Smt\.|Dr\.|Shrimati|Km\.)/i.test(t)) return true;
  if (/^[A-Z][a-z]+,\s+[A-Z]/.test(t)) return true;
  // Or plain name with capital letters
  if (/^[A-Z][A-Za-z\s\.\-']+$/.test(t) && t.length > 5 && !isJunkText(t)) return true;
  return false;
}

async function processFile(filename) {
  const filePath = path.join(IMAGE_DIR, filename);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const ws = wb.worksheets[0];
  const images = ws.getImages();

  // Build comprehensive row->text mapping
  // Scan ALL columns for each row
  const rowData = {};
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const colTexts = {};
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      const t = getCellText(cell);
      if (t) colTexts[col] = t;
    });
    rowData[r] = colTexts;
  }

  // Find which column typically contains MP names
  // Look for rows where col has text matching MP name pattern
  const nameColScores = {};
  for (let r = 5; r <= ws.rowCount; r++) {
    const cols = rowData[r];
    if (!cols) continue;
    for (const [col, text] of Object.entries(cols)) {
      if (isMpName(text)) {
        nameColScores[col] = (nameColScores[col] || 0) + 1;
      }
    }
  }

  const sortedCols = Object.entries(nameColScores).sort((a, b) => b[1] - a[1]);
  const nameCol = sortedCols.length > 0 ? Number(sortedCols[0][0]) : null;
  console.log(`\n[${filename}] Name column detected: col ${nameCol} (score: ${sortedCols[0]?.[1]})`);

  // Also find serial number column (usually col 2 or 3, contains numbers like 1, 2, 3...)
  const srColScores = {};
  for (let r = 5; r <= ws.rowCount; r++) {
    const cols = rowData[r];
    if (!cols) continue;
    for (const [col, text] of Object.entries(cols)) {
      if (/^\d+$/.test(text.trim()) && Number(text) > 0 && Number(text) < 600) {
        srColScores[col] = (srColScores[col] || 0) + 1;
      }
    }
  }
  const srColSorted = Object.entries(srColScores).sort((a, b) => b[1] - a[1]);
  const srCol = srColSorted.length > 0 ? Number(srColSorted[0][0]) : null;
  console.log(`Serial number column: col ${srCol}`);

  const results = [];
  const fileBase = path.basename(filename, '.xlsx');

  for (const img of images) {
    const nativeRow = img.range?.tl?.nativeRow;
    if (nativeRow === undefined || nativeRow === null) continue;
    const rowNum = nativeRow + 1;

    // Look for MP name in same row or next few rows
    let mpName = '';
    let srNo = '';
    for (let dr = 0; dr <= 4; dr++) {
      const row = rowData[rowNum + dr];
      if (!row) continue;

      // Try name column first
      if (nameCol && row[nameCol] && isMpName(row[nameCol])) {
        mpName = row[nameCol];
      }

      // If no dedicated name col, scan all cols
      if (!mpName) {
        for (const [col, text] of Object.entries(row)) {
          if (isMpName(text)) {
            mpName = text;
            break;
          }
        }
      }

      // Get serial number
      if (srCol && row[srCol] && /^\d+$/.test(row[srCol].trim())) {
        srNo = row[srCol].trim();
      }

      if (mpName) break;
    }

    // Skip if no valid MP name found
    if (!mpName || isJunkText(mpName)) {
      continue;
    }

    const imageData = wb.model.media.find(m => m.index === img.imageId);
    if (!imageData || !imageData.buffer) continue;

    const ext = imageData.extension || 'jpeg';
    const safeName = mpName.replace(/[^a-zA-Z0-9\s,\.]/g, '').trim()
      .replace(/\s+/g, '_').replace(/,/g, '').substring(0, 60);
    const srPrefix = srNo ? `sr${srNo}_` : '';
    const outName = `${fileBase}_${srPrefix}${safeName}.${ext}`;
    const outPath = path.join(OUT_DIR, outName);
    const cleanPath = path.join(CLEAN_DIR, outName);

    fs.writeFileSync(outPath, Buffer.from(imageData.buffer));
    fs.writeFileSync(cleanPath, Buffer.from(imageData.buffer));

    results.push({
      sourceFile: filename,
      row: rowNum,
      srNo: srNo || null,
      mpName: mpName,
      imageFile: outName,
    });
    console.log(`  sr${srNo || '?'} | "${mpName}" -> ${outName}`);
  }

  return results;
}

async function main() {
  console.log('=== MP Image Extractor ===');
  console.log('Clean photos will be saved to:', CLEAN_DIR);

  const allResults = [];

  for (const file of files) {
    try {
      const r = await processFile(file);
      allResults.push(...r);
    } catch (e) {
      console.error(`Error in ${file}:`, e.message);
    }
  }

  console.log(`\n\n============================`);
  console.log(`Total MP images extracted: ${allResults.length}`);

  const mappingPath = path.join(CLEAN_DIR, '_mp_image_mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(allResults, null, 2));
  console.log(`\nMapping saved: ${mappingPath}`);

  // Print unique MP names found
  const uniqueMPs = [...new Set(allResults.map(r => r.mpName))];
  console.log(`\nUnique MPs with images: ${uniqueMPs.length}`);
  uniqueMPs.slice(0, 30).forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
  if (uniqueMPs.length > 30) console.log(`  ... and ${uniqueMPs.length - 30} more`);
}

main().catch(console.error);
