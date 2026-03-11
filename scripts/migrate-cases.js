/**
 * Migrates embedded cases in profile JSONs into standalone case JSONs.
 *
 * Slug resolution order (NO title-slugify fallback):
 *   1. Extract from mediaPath strings inside source/analysis items
 *   2. Match against the profile's actual case media folders on disk
 *      — if exactly one unclaimed folder remains, assign it
 *      — if multiple remain, report ❓ (ambiguous — needs manual mediaPath)
 *
 * Run quarantine-orphans.js FIRST so only valid folders remain on disk.
 *
 * Usage: node scripts/migrate-cases.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname      = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR   = path.join(__dirname, '../src/lib/data/profiles');
const CASES_DIR      = path.join(__dirname, '../src/lib/data/cases');
const MEDIA_DIR      = path.join(__dirname, '../static/media/profiles');
const CASES_MEDIA_DIR = path.join(__dirname, '../static/media/cases');
const DRY_RUN        = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract slug from mediaPath values inside source/analysis arrays.
 * @param {object} embeddedCase
 * @param {string} username
 * @returns {string|null}
 */
function extractSlugFromMediaPaths(embeddedCase, username) {
  const allItems = [
    ...(embeddedCase.source   ?? []),
    ...(embeddedCase.analysis ?? [])
  ];
  for (const item of allItems) {
    if (!item.mediaPath) continue;
    const match = item.mediaPath.match(
      new RegExp(`/media/profiles/${username}/cases/([^/]+)/`)
    );
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Return all case sub-folders on disk for a profile that haven't been
 * claimed by an earlier case in this same profile's loop.
 * @param {string} username
 * @param {Set<string>} claimed
 * @returns {string[]}
 */
function getUnclaimedDiskFolders(username, claimed) {
  const casesPath = path.join(MEDIA_DIR, username, 'cases');
  if (!fs.existsSync(casesPath)) return [];
  return fs
    .readdirSync(casesPath, { withFileTypes: true })
    .filter(e => e.isDirectory() && !claimed.has(e.name))
    .map(e => e.name);
}

/**
 * Copy every file from src case folder to dest case folder.
 * In a real migration we move; here we copy so source is preserved on
 * dry-run and we rename on the real run.
 */
function migrateMedia(username, caseSlug) {
  const src  = path.join(MEDIA_DIR, username, 'cases', caseSlug);
  const dest = path.join(CASES_MEDIA_DIR, caseSlug);

  if (!fs.existsSync(src)) return;
  if (!DRY_RUN) fs.mkdirSync(dest, { recursive: true });

  for (const file of fs.readdirSync(src)) {
    const srcFile  = path.join(src, file);
    const destFile = path.join(dest, file);

    if (fs.existsSync(destFile)) {
      console.log(`    ⚠️  Already exists, skipping: ${file}`);
      continue;
    }
    console.log(`    📁 ${path.relative(process.cwd(), srcFile)}`);
    console.log(`       → ${path.relative(process.cwd(), destFile)}`);
    if (!DRY_RUN) fs.renameSync(srcFile, destFile);
  }
}

/**
 * Rewrite all mediaPath values in source/analysis from the old profile-based
 * path to the new case-based path.
 */
function rewriteMediaPaths(items, username, caseSlug) {
  if (!items) return items;
  return items.map(item => {
    if (!item.mediaPath) return item;
    item.mediaPath = item.mediaPath
      .replace(
        `/media/profiles/${username}/cases/${caseSlug}/`,
        `/media/cases/${caseSlug}/`
      )
      // Catch malformed paths that are missing the slug folder
      .replace(
        `/media/profiles/${username}/cases/`,
        `/media/cases/${caseSlug}/`
      );
    return item;
  });
}

// ─── State ────────────────────────────────────────────────────────────────────

/** slug → merged case JSON object */
const caseMap        = new Map();
/** slug → Set<username> for shared-case reporting */
const caseProfileSet = new Map();

const warnings = [];

// ─── Main loop ────────────────────────────────────────────────────────────────

const profileFiles = fs
  .readdirSync(PROFILES_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

for (const file of profileFiles) {
  const profilePath = path.join(PROFILES_DIR, file);
  const raw         = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

  const locales     = Object.keys(raw);
  const firstLocale = locales[0];
  const profileData = raw[firstLocale];
  const username    = profileData.username ?? path.basename(file, '.json');
  const cases       = profileData.cases ?? [];

  console.log(`\n👤 ${username} (${cases.length} case${cases.length !== 1 ? 's' : ''})`);

  const updatedCaseRefs = [];
  /** Folders already assigned to a case for THIS profile in this run */
  const claimedFolders  = new Set();

  for (const embeddedCase of cases) {
    // ── 1. Slug from mediaPath (primary) ──────────────────────────────────
    let caseSlug   = extractSlugFromMediaPaths(embeddedCase, username);
    let slugSource = 'mediaPath';

    // ── 2. Slug from unclaimed disk folders (fallback) ────────────────────
    if (!caseSlug) {
      const unclaimed = getUnclaimedDiskFolders(username, claimedFolders);

      if (unclaimed.length === 1) {
        caseSlug   = unclaimed[0];
        slugSource = 'disk (only remaining folder)';
        console.log(`    ℹ️  Resolved by disk scan: ${caseSlug}`);
        warnings.push(
          `ℹ️  [${username}] "${embeddedCase.title}" — no mediaPath, resolved via disk scan → ${caseSlug}`
        );
      } else if (unclaimed.length === 0) {
        console.log(`    ❌ SKIP: "${embeddedCase.title}" — no unclaimed media folders left`);
        warnings.push(
          `❌  [${username}] "${embeddedCase.title}" — SKIPPED (no media folder found)`
        );
        continue;
      } else {
        // Ambiguous: multiple unclaimed folders
        console.log(`    ❓ SKIP: "${embeddedCase.title}" — ambiguous (${unclaimed.join(', ')})`);
        warnings.push(
          `❓  [${username}] "${embeddedCase.title}" — SKIPPED (ambiguous folders: ${unclaimed.join(', ')})\n` +
          `    Add a mediaPath to the case JSON to resolve.`
        );
        continue;
      }
    }

    claimedFolders.add(caseSlug);

    console.log(`  📌 "${embeddedCase.title}"`);
    console.log(`     slug: ${caseSlug}  [${slugSource}]`);

    // ── 3. Rewrite mediaPath strings ──────────────────────────────────────
    embeddedCase.source   = rewriteMediaPaths(embeddedCase.source,   username, caseSlug);
    embeddedCase.analysis = rewriteMediaPaths(embeddedCase.analysis, username, caseSlug);

    // ── 4. Move media files ───────────────────────────────────────────────
    migrateMedia(username, caseSlug);

    // ── 5. Build / merge case JSON ────────────────────────────────────────
    if (!caseMap.has(caseSlug)) {
      caseMap.set(caseSlug, {
        [firstLocale]: {
          slug:      caseSlug,
          title:     embeddedCase.title,
          dateAdded: embeddedCase.dateAdded,
          type:      embeddedCase.type,
          profiles:  []
        }
      });
      caseProfileSet.set(caseSlug, new Set());
    }

    const caseEntry      = caseMap.get(caseSlug);
    const profilesInCase = caseEntry[firstLocale].profiles;
    const alreadyAdded   = profilesInCase.some(p => p.username === username);

    if (alreadyAdded) {
      // Same profile appears twice with the same slug — merge evidence
      console.log(`    ♻️  Merging duplicate entry for "${username}" in case`);
      const existing    = profilesInCase.find(p => p.username === username);
      existing.source   = [...(existing.source   ?? []), ...(embeddedCase.source   ?? [])];
      existing.analysis = [...(existing.analysis ?? []), ...(embeddedCase.analysis ?? [])];
    } else {
      profilesInCase.push({
        username,
        description: embeddedCase.description ?? '',
        source:      embeddedCase.source   ?? [],
        analysis:    embeddedCase.analysis ?? []
      });
    }

    caseProfileSet.get(caseSlug).add(username);

    if (!updatedCaseRefs.includes(caseSlug)) updatedCaseRefs.push(caseSlug);
  }

  // ── Detect folders that were never claimed (orphan check post-quarantine) ──
  const stillUnclaimed = getUnclaimedDiskFolders(username, claimedFolders);
  if (stillUnclaimed.length > 0) {
    warnings.push(
      `🗂️  [${username}] Unclaimed media folders after processing: [${stillUnclaimed.join(', ')}]\n` +
      `    Run quarantine-orphans.js or add these cases to the profile JSON.`
    );
  }

  // ── Update profile JSON ────────────────────────────────────────────────────
  for (const locale of locales) {
    raw[locale].cases = updatedCaseRefs;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(profilePath, JSON.stringify(raw, null, 2), 'utf-8');
    console.log(`  ✅ Profile updated: ${file}`);
  } else {
    console.log(`  📝 Would update: ${file}`);
    console.log(`     cases → [${updatedCaseRefs.join(', ')}]`);
  }
}

// ─── Write case files ─────────────────────────────────────────────────────────

if (!DRY_RUN) {
  fs.mkdirSync(CASES_DIR,       { recursive: true });
  fs.mkdirSync(CASES_MEDIA_DIR, { recursive: true });
}

const sharedCases = [];

for (const [slug, caseData] of caseMap.entries()) {
  const profiles = [...caseProfileSet.get(slug)];
  const shared   = profiles.length > 1;
  if (shared) sharedCases.push({ slug, profiles });

  console.log(`\n📄 ${slug}${shared ? `  ♻️  [${profiles.join(', ')}]` : ''}`);

  const outPath = path.join(CASES_DIR, `${slug}.json`);
  if (!DRY_RUN) {
    fs.writeFileSync(outPath, JSON.stringify(caseData, null, 2), 'utf-8');
    console.log(`  ✅ Written: ${outPath}`);
  } else {
    console.log(`  📝 Would write: ${outPath}`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────────────');
console.log(`✅  Total cases migrated  : ${caseMap.size}`);
console.log(`♻️   Shared across profiles: ${sharedCases.length}`);
for (const { slug, profiles } of sharedCases) {
  console.log(`    • ${slug}: ${profiles.join(', ')}`);
}

if (warnings.length) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ${w}`);
}

console.log(
  DRY_RUN
    ? '\n🔍 DRY RUN complete — nothing was written.'
    : '\n🎉 Migration complete.'
);