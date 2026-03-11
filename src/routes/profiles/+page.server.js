import { getProfiles } from '$lib/loadProfiles.js';

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const sortBy = url.searchParams.get('sortBy') ?? 'cases';
  const profiles = getProfiles('ar', sortBy);
  return { profiles, sortBy };
}