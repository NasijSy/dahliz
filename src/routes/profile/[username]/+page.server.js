import { getProfile } from '$lib/loadProfiles.js';
import { getCasesForProfile } from '$lib/loadCases.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const profile = getProfile(params.username, 'ar');
  if (!profile) throw error(404, 'Profile not found');

  const cases = getCasesForProfile(params.username, 'ar');
  return { profile, cases };
}