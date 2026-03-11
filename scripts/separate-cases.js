import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const profilesDir = join(__dirname, '../src/lib/data/profiles');
const casesDir = join(__dirname, '../src/lib/data/cases');

const files = readdirSync(profilesDir).filter(f => f.endsWith('.json'));

let totalCases = 0;
let totalProfiles = 0;

for (const file of files) {
  const filePath = join(profilesDir, file);
  const raw = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);

  for (const locale of Object.keys(json)) {
    const profile = json[locale];
    const username = profile.username;
    const cases = profile.cases ?? [];

    if (!username) {
      console.warn(`⚠ Skipping ${file} [${locale}] — no username found`);
      continue;
    }

    if (cases.length === 0) {
      console.log(`— ${file} [${locale}]: no cases to extract`);
      continue;
    }

    const profileCasesDir = join(casesDir, username);
    if (!existsSync(profileCasesDir)) {
      mkdirSync(profileCasesDir, { recursive: true });
      console.log(`📁 Created directory: cases/${username}/`);
    }

    for (const c of cases) {
      // Generate slug from title if no slug field exists
      const slug = c.slug ?? slugify(c.title ?? `case-${Date.now()}`);

      const caseFilePath = join(profileCasesDir, `${slug}.json`);

      // Build the case file with same i18n structure as profiles
      const caseJson = {
        [locale]: {
          slug,
          profile: username,
          ...c,
        },
      };

      // If file already exists (another locale), merge into it
      if (existsSync(caseFilePath)) {
        const existing = JSON.parse(readFileSync(caseFilePath, 'utf-8'));
        existing[locale] = caseJson[locale];
        writeFileSync(caseFilePath, JSON.stringify(existing, null, 2) + '\n');
      } else {
        writeFileSync(caseFilePath, JSON.stringify(caseJson, null, 2) + '\n');
      }

      console.log(`✓ Wrote cases/${username}/${slug}.json`);
      totalCases++;
    }

    // Remove cases from profile
    delete profile.cases;
    totalProfiles++;
  }

  // Write updated profile back (without cases)
  writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log(`✓ Updated profile: ${file}`);
}

console.log(`\n✅ Done. Extracted ${totalCases} cases from ${totalProfiles} profile locales.`);

/**
 * Convert Arabic or English text to a URL-safe slug
 * Falls back to a transliteration-friendly approach
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    // Arabic: remove diacritics
    .replace(/[\u064B-\u065F]/g, '')
    // Replace spaces and separators with hyphens
    .replace(/[\s_\/\\]+/g, '-')
    // Remove anything that's not alphanumeric, Arabic, or hyphens
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    || `case-${Date.now()}`;
}