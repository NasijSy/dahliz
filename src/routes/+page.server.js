import { getProfiles } from '$lib/loadProfiles.js';
import { getArticles } from '$lib/loadArticles.js';
import { getCaseCountForProfile } from '$lib/loadCases.js';

export function load() {
  const profiles = getProfiles('ar', 'cases').filter((p) => getCaseCountForProfile(p.username) > 0);
  const articles = getArticles('ar').slice(0, 3);
  return { profiles, articles };
}