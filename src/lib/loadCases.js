const caseFiles = import.meta.glob('./data/cases/*.json', { eager: true });

function parseDateToTime(value) {
  const t = Date.parse(value ?? '');
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function getProfileCaseSourceTime(caseItem, username) {
  const entry = caseItem.profiles?.find((p) => p?.username === username);
  const sourceDates = (entry?.source ?? [])
    .map((s) => parseDateToTime(s?.date))
    .filter((t) => Number.isFinite(t));

  if (sourceDates.length > 0) {
    return Math.min(...sourceDates);
  }

  return parseDateToTime(caseItem.dateAdded);
}

const casesCache = new Map();
const casesByProfileCache = new Map();

function buildLocaleCaches(locale = 'ar') {
  if (casesCache.has(locale) && casesByProfileCache.has(locale)) return;

  const cases = Object.values(caseFiles)
    .map((fileModule) => {
      const data = fileModule.default ?? fileModule;
      return data[locale] ?? data[Object.keys(data)[0]];
    })
    .filter(Boolean);

  const byProfile = new Map();
  for (const c of cases) {
    for (const p of c.profiles ?? []) {
      const username = p?.username;
      if (!username) continue;
      if (!byProfile.has(username)) byProfile.set(username, []);
      byProfile.get(username).push(c);
    }
  }

  for (const [username, profileCases] of byProfile) {
    profileCases.sort((a, b) => {
      const ta = getProfileCaseSourceTime(a, username);
      const tb = getProfileCaseSourceTime(b, username);
      if (ta !== tb) return ta - tb;

      return (a.slug ?? '').localeCompare(b.slug ?? '');
    });
  }

  casesCache.set(locale, cases);
  casesByProfileCache.set(locale, byProfile);
}

export function getCases(locale = 'ar') {
  buildLocaleCaches(locale);
  return casesCache.get(locale) ?? [];
}

export function getCase(slug, locale = 'ar') {
  const key = `./data/cases/${slug}.json`;
  const fileModule = caseFiles[key];
  if (!fileModule) return null;
  const data = fileModule.default ?? fileModule;
  return data[locale] ?? data[Object.keys(data)[0]] ?? null;
}

export function getCasesForProfile(username, locale = 'ar') {
  buildLocaleCaches(locale);
  return casesByProfileCache.get(locale)?.get(username) ?? [];
}

export function getCaseCountForProfile(username, locale = 'ar') {
  return getCasesForProfile(username, locale).length;
}