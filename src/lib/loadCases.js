const caseFiles = import.meta.glob('./data/cases/*.json', { eager: true });

/**
 * @param {string} locale
 * @returns {any[]}
 */
export function getCases(locale = 'ar') {
  return Object.values(caseFiles)
    .map((mod) => {
      const data = mod.default ?? mod;
      return data[locale] ?? data[Object.keys(data)[0]];
    })
    .filter(Boolean);
}

/**
 * @param {string} slug
 * @param {string} locale
 * @returns {object|null}
 */
export function getCase(slug, locale = 'ar') {
  const key = `./data/cases/${slug}.json`;
  const mod = caseFiles[key];
  if (!mod) return null;
  const data = mod.default ?? mod;
  return data[locale] ?? data[Object.keys(data)[0]] ?? null;
}

/**
 * Get all cases for a specific profile username
 * @param {string} username
 * @param {string} locale
 * @returns {any[]}
 */
export function getCasesForProfile(username, locale = 'ar') {
  return getCases(locale).filter((c) =>
    c.profiles?.some((p) => p.username === username)
  );
}