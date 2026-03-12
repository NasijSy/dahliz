import { getProfile } from '$lib/loadProfiles.js';
import { getCase } from '$lib/loadCases.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const profile = getProfile(params.username, 'ar');
  if (!profile) throw error(404, 'Profile not found');

  // profile.cases is now an array of slug strings after migration
  const slugs = Array.isArray(profile.cases) ? profile.cases : [];

  // Resolve each slug → full case object, preserve profile-defined order
  const cases = slugs
    .map((slug) => getCase(slug, 'ar'))
    .filter(Boolean);

  // Keep profile raw (cases remain as slugs) — pass resolved cases separately
  return { profile, cases };
}