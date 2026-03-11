/**
 * 1. Renames `source[].mediaPath` in all case JSONs to include the profile
 *    username as a prefix on the filename — skips if already present.
 *    Does NOT touch `analysis[].mediaPath`.
 *
 * 2. After updating, checks whether the referenced file actually exists
 *    under static/ and reports any missing files.
 *
 * Usage:
 *   node scripts/prefix-source-mediapaths.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const CASES_DIR  = path.join(__dirname, '../src/lib/data/cases');
const STATIC_DIR = path.join(__dirname, '../static');
const DRY_RUN    = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {{ caseSlug: string, username: string, path: string }[]} */
const missingFiles  = [];
/** @type {{ from: string, to: string }[]} */
const renamedPaths  = [];

let totalCasesUpdated = 0;

// ─── Process each case JSON ───────────────────────────────────────────────────

const caseFiles = fs
  .readdirSync(CASES_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

for (const file of caseFiles) {
  const casePath = path.join(CASES_DIR, file);
  const raw      = JSON.parse(fs.readFileSync(casePath, 'utf-8'));
  let   dirty    = false;

  for (const locale of Object.keys(raw)) {
    const caseData = raw[locale];
    const slug     = caseData.slug ?? path.basename(file, '.json');

    for (const profileEntry of caseData.profiles ?? []) {
      const username = profileEntry.username;

      // ── source only ────────────────────────────────────────────────────────
      for (const item of profileEntry.source ?? []) {
        if (!item.mediaPath) continue;

        const dir      = path.dirname(item.mediaPath);   // /media/cases/<slug>
        const filename = path.basename(item.mediaPath);  // e.g. source.jpg

        // Skip if username already present anywhere in the filename
        if (filename.includes(username)) {
          // Still check existence even if no rename needed
          const absPath = path.join(STATIC_DIR, item.mediaPath);
          if (!fs.existsSync(absPath)) {
            missingFiles.push({ caseSlug: slug, username, path: item.mediaPath });
          }
          continue;
        }

        // Build new filename: <username>-<original-filename>
        const newFilename = `${username}-${filename}`;
        const newMediaPath = `${dir}/${newFilename}`;

        console.log(`  ✏️  [${slug}] @${username}`);
        console.log(`       ${item.mediaPath}`);
        console.log(`    →  ${newMediaPath}`);

        renamedPaths.push({ from: item.mediaPath, to: newMediaPath });
        item.mediaPath = newMediaPath;
        dirty = true;

        // Check existence of the NEW path
        const absNewPath = path.join(STATIC_DIR, newMediaPath);
        if (!fs.existsSync(absNewPath)) {
          // Maybe the old (unprefixed) file still exists — note both
          const absOldPath = path.join(STATIC_DIR, `${dir}/${filename}`);
          if (fs.existsSync(absOldPath)) {
            missingFiles.push({
              caseSlug:  slug,
              username,
              path:      newMediaPath,
              note:      `old unprefixed file exists at ${dir}/${filename} — rename it`
            });
          } else {
            missingFiles.push({ caseSlug: slug, username, path: newMediaPath });
          }
        }
      }

      // ── analysis — existence check only, no renaming ──────────────────────
      for (const item of profileEntry.analysis ?? []) {
        if (!item.mediaPath) continue;
        const absPath = path.join(STATIC_DIR, item.mediaPath);
        if (!fs.existsSync(absPath)) {
          missingFiles.push({
            caseSlug:  slug,
            username,
            path:      item.mediaPath,
            note:      'analysis (not renamed)'
          });
        }
      }
    }
  }

  if (dirty) {
    totalCasesUpdated++;
    if (!DRY_RUN) {
      fs.writeFileSync(casePath, JSON.stringify(raw, null, 2) + '\n', 'utf-8');
      console.log(`  ✅ Saved: ${file}\n`);
    } else {
      console.log(`  📝 Would save: ${file}\n`);
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────────────');
console.log(`✏️   Source paths renamed  : ${renamedPaths.length}`);
console.log(`📄  Case files updated    : ${totalCasesUpdated}`);

if (missingFiles.length === 0) {
  console.log('\n✅  All referenced media files exist on disk.');
} else {
  console.log(`\n❌  Missing media files (${missingFiles.length}) — add these manually:\n`);
  for (const m of missingFiles) {
    const note = m.note ? `  ⚠️  ${m.note}` : '';
    console.log(`  [${m.caseSlug}] @${m.username}`);
    console.log(`    static${m.path}${note}`);
  }
}

if (DRY_RUN) console.log('\n🔍 DRY RUN complete — nothing was written.');