/**
 * Moves orphaned media to a quarantine directory for manual review.
 *
 * Orphans detected:
 *   A) Profile media folders with no matching profile JSON
 *   B) Case media sub-folders with no matching case entry in the profile JSON
 *
 * Quarantine structure mirrors the original:
 *   static/media/_quarantine/profiles/<username>/           ← type A
 *   static/media/_quarantine/profiles/<username>/cases/<slug>/  ← type B
 *
 * Usage:
 *   node scripts/quarantine-orphans.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR   = path.join(__dirname, '../src/lib/data/profiles');
const MEDIA_DIR      = path.join(__dirname, '../static/media/profiles');
const QUARANTINE_DIR = path.join(__dirname, '../static/media/_quarantine/profiles');
const DRY_RUN        = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be moved\n');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively move a directory (rename within same volume, copy+delete across). */
function moveDir(src, dest) {
  if (DRY_RUN) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    fs.renameSync(src, dest);
  } catch {
    // Cross-device fallback
    copyDirSync(src, dest);
    fs.rmSync(src, { recursive: true, force: true });
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

function isDir(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/**
 * Read all case slugs currently embedded in a profile JSON.
 * Returns a Set of slug strings.
 * @param {string} profileFile  absolute path to the profile .json
 * @param {string} username
 * @returns {Set<string>}
 */
function getEmbeddedCaseSlugs(profileFile, username) {
  const raw = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));
  const firstLocale = Object.keys(raw)[0];
  const profileData = raw[firstLocale];
  const cases = profileData.cases ?? [];
  const slugs = new Set();

  for (const c of cases) {
    // cases may already be slug strings (post-migration) or embedded objects
    if (typeof c === 'string') {
      slugs.add(c);
      continue;
    }
    // Extract slug from any mediaPath in source/analysis
    const allItems = [...(c.source ?? []), ...(c.analysis ?? [])];
    for (const item of allItems) {
      if (!item.mediaPath) continue;
      const match = item.mediaPath.match(
        new RegExp(`/media/profiles/${username}/cases/([^/]+)/`)
      );
      if (match?.[1]) { slugs.add(match[1]); break; }
    }
  }
  return slugs;
}

// ─── Build known-profile set ──────────────────────────────────────────────────

const knownUsernames = new Set(
  fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.basename(f, '.json'))
);

// ─── Walk profile media directories ──────────────────────────────────────────

if (!isDir(MEDIA_DIR)) {
  console.error(`Media directory not found: ${MEDIA_DIR}`);
  process.exit(1);
}

const report = { orphanProfiles: [], orphanCases: [] };

for (const entry of fs.readdirSync(MEDIA_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const username = entry.name;
  const profileMediaPath = path.join(MEDIA_DIR, username);

  // ── Type A: entire profile folder has no JSON ──────────────────────────────
  if (!knownUsernames.has(username)) {
    const dest = path.join(QUARANTINE_DIR, username);
    console.log(`\n🚫 Orphaned PROFILE folder: ${username}`);
    console.log(`   src : ${path.relative(process.cwd(), profileMediaPath)}`);
    console.log(`   dest: ${path.relative(process.cwd(), dest)}`);

    if (!DRY_RUN && fs.existsSync(dest)) {
      console.log(`   ⚠️  Quarantine dest already exists — skipping to avoid overwrite`);
    } else {
      moveDir(profileMediaPath, dest);
      if (!DRY_RUN) console.log(`   ✅ Moved`);
    }

    report.orphanProfiles.push(username);
    continue;
  }

  // ── Type B: case sub-folder has no matching entry in profile JSON ──────────
  const casesMediaPath = path.join(profileMediaPath, 'cases');
  if (!isDir(casesMediaPath)) continue;

  const profileJsonPath = path.join(PROFILES_DIR, `${username}.json`);
  const knownSlugs = getEmbeddedCaseSlugs(profileJsonPath, username);

  for (const caseEntry of fs.readdirSync(casesMediaPath, { withFileTypes: true })) {
    if (!caseEntry.isDirectory()) continue;
    const caseSlug = caseEntry.name;

    if (!knownSlugs.has(caseSlug)) {
      const src  = path.join(casesMediaPath, caseSlug);
      const dest = path.join(QUARANTINE_DIR, username, 'cases', caseSlug);

      console.log(`\n📂 Orphaned CASE folder: ${username}/cases/${caseSlug}`);
      console.log(`   src : ${path.relative(process.cwd(), src)}`);
      console.log(`   dest: ${path.relative(process.cwd(), dest)}`);

      if (!DRY_RUN && fs.existsSync(dest)) {
        console.log(`   ⚠️  Quarantine dest already exists — skipping`);
      } else {
        moveDir(src, dest);
        if (!DRY_RUN) console.log(`   ✅ Moved`);
      }

      report.orphanCases.push(`${username}/cases/${caseSlug}`);
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────');
console.log(`🚫 Orphaned profile folders : ${report.orphanProfiles.length}`);
for (const u of report.orphanProfiles) console.log(`   • ${u}`);
console.log(`📂 Orphaned case folders    : ${report.orphanCases.length}`);
for (const c of report.orphanCases) console.log(`   • ${c}`);
console.log(
  DRY_RUN
    ? '\n🔍 DRY RUN complete — nothing was moved.'
    : `\n🗂️  All orphans quarantined to: ${path.relative(process.cwd(), QUARANTINE_DIR)}`
);