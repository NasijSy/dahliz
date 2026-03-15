import { getCaseCountForProfile } from './loadCases.js';

/**
 * Loads all profile JSON files from src/lib/data/profiles/
 * Each file is structured as { ar: { ...profileData } }
 * Returns an array of profiles for the given locale (default: 'ar')
 */

const profileFiles = import.meta.glob('./data/profiles/*.json', { eager: true });

/**
 * @param {string} key
 * @returns {string}
 */
function getUsernameFromProfileKey(key) {
  return key.replace('./data/profiles/', '').replace('.json', '');
}

/**
 * @param {any} fileModule
 * @param {string} key
 * @param {string} locale
 * @returns {any|null}
 */
function resolveProfileFromFile(fileModule, key, locale) {
  const data = fileModule.default ?? fileModule;
  const localized = data[locale] ?? data[Object.keys(data)[0]];
  if (!localized) return null;

  // Treat filename as canonical identity to avoid collisions when CMS auto-appends -1.
  return {
    ...localized,
    username: getUsernameFromProfileKey(key),
  };
}

/** @typedef {'cases' | 'dateAdded' | 'lastUpdated' | 'name'} SortKey */

/**
 * @param {any[]} profiles
 * @param {SortKey} sortBy
 * @returns {any[]}
 */
function sortProfiles(profiles, sortBy) {
  return [...profiles].sort((a, b) => {
    switch (sortBy) {
      case 'cases':
        return getCaseCountForProfile(b.username, 'ar') - getCaseCountForProfile(a.username, 'ar');
      case 'dateAdded':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'lastUpdated':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'name':
        return (a.name ?? '').localeCompare(b.name ?? '', 'ar');
      default:
        return 0;
    }
  });
}

/**
 * @param {string} locale
 * @param {SortKey} sortBy
 * @param {string|null} classification
 * @param {string[]} tags — filter profiles that have ALL of these tags
 * @returns {any[]}
 */
export function getProfiles(locale = 'ar', sortBy = 'cases', classification = null, tags = []) {
  const profiles = Object.entries(profileFiles)
    .map(([key, fileModule]) => resolveProfileFromFile(fileModule, key, locale))
    .filter(Boolean)
    .filter((p) => !classification || p.classification === classification)
    .filter((p) => tags.length === 0 || tags.every((t) => p.tags?.includes(t)));

  return sortProfiles(profiles, sortBy);
}

/**
 * @param {string} username
 * @param {string} locale
 * @returns {object|null}
 */
export function getProfile(username, locale = 'ar') {
  const key = `./data/profiles/${username}.json`;
  const fileModule = profileFiles[key];
  if (!fileModule) return null;
  return resolveProfileFromFile(fileModule, key, locale);
}