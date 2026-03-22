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
const latestCaseUpdateByProfileCache = new Map();
const caseBySlugCache = new Map();

function getCaseLastUpdatedTime(caseItem) {
  const t = Date.parse(caseItem.lastUpdated ?? caseItem.dateAdded ?? '');
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

function buildLocaleCaches(locale = 'ar') {
  if (
    casesCache.has(locale) &&
    casesByProfileCache.has(locale) &&
    latestCaseUpdateByProfileCache.has(locale) &&
    caseBySlugCache.has(locale)
  ) {
    return;
  }

  const cases = Object.values(caseFiles)
    .map((fileModule) => {
      const data = fileModule.default ?? fileModule;
      return data[locale] ?? data[Object.keys(data)[0]];
    })
    .filter(Boolean);

  const byProfile = new Map();
  const latestUpdateByProfile = new Map();
  for (const c of cases) {
    const caseUpdatedAt = getCaseLastUpdatedTime(c);
    for (const p of c.profiles ?? []) {
      const username = p?.username;
      if (!username) continue;
      if (!byProfile.has(username)) byProfile.set(username, []);
      byProfile.get(username).push(c);
      latestUpdateByProfile.set(
        username,
        Math.max(latestUpdateByProfile.get(username) ?? Number.NEGATIVE_INFINITY, caseUpdatedAt),
      );
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

  const bySlug = new Map();
  for (const c of cases) {
    const slug = c?.slug;
    if (slug) {
      bySlug.set(slug, c);
    }
  }

  casesCache.set(locale, cases);
  casesByProfileCache.set(locale, byProfile);
  latestCaseUpdateByProfileCache.set(locale, latestUpdateByProfile);
  caseBySlugCache.set(locale, bySlug);
}

export function getCases(locale = 'ar') {
  buildLocaleCaches(locale);
  return casesCache.get(locale) ?? [];
}

export function getCase(slug, locale = 'ar') {
  buildLocaleCaches(locale);
  return caseBySlugCache.get(locale)?.get(slug) ?? null;
}

export function getCasesForProfile(username, locale = 'ar') {
  buildLocaleCaches(locale);
  return casesByProfileCache.get(locale)?.get(username) ?? [];
}

export function getCaseCountForProfile(username, locale = 'ar') {
  return getCasesForProfile(username, locale).length;
}

export function getLatestCaseUpdateForProfile(username, locale = 'ar') {
  buildLocaleCaches(locale);
  const t = latestCaseUpdateByProfileCache.get(locale)?.get(username);
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null;
}