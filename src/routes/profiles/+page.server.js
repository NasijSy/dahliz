import { getProfiles } from '$lib/loadProfiles.js';
import { getTags } from '$lib/loadTags.js';
import { getCaseCountForProfile } from '$lib/loadCases.js';

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeSearchValue(value) {
  return String(value ?? '').toLowerCase();
}

/**
 * @param {any} profile
 * @param {string} query
 * @returns {boolean}
 */
function profileMatchesSearch(profile, query) {
  const q = normalizeSearchValue(query).trim();

  if (!q) {
    return true;
  }

  const candidates = [profile.name, profile.username];

  if (Array.isArray(profile.platformLinks)) {
    for (const link of profile.platformLinks) {
      candidates.push(link?.platform, link?.alias, link?.url);
    }
  }

  return candidates.some((value) => normalizeSearchValue(value).includes(q));
}

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const sortBy = url.searchParams.get('sortBy') ?? 'cases';
  const classification = url.searchParams.get('classification') ?? null;
  const profileType = url.searchParams.get('type') ?? null;
  const search = url.searchParams.get('search')?.trim() ?? '';
  const tags = url.searchParams.getAll('tag');
  const profiles = getProfiles('ar', sortBy, classification, tags)
    .filter((p) => getCaseCountForProfile(p.username) > 0)
    .filter((p) => !profileType || p.type === profileType)
    .filter((p) => profileMatchesSearch(p, search));
  const allTags = getTags();
  return { profiles, sortBy, classification, profileType, search, tags, allTags };
}