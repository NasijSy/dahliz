import { getProfiles } from '$lib/loadProfiles.js';
import { getTags } from '$lib/loadTags.js';

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const sortBy = url.searchParams.get('sortBy') ?? 'cases';
  const classification = url.searchParams.get('classification') ?? null;
  const tags = url.searchParams.getAll('tag');
  const profiles = getProfiles('ar', sortBy, classification, tags);
  const allTags = getTags();
  return { profiles, sortBy, classification, tags, allTags };
}