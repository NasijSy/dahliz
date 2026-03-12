import { getProfiles } from '$lib/loadProfiles.js';
import { getArticles } from '$lib/loadArticles.js';

export function load() {
  const profiles = getProfiles('ar', 'cases');
  const articles = getArticles('ar').slice(0, 3);
  return { profiles, articles };
}