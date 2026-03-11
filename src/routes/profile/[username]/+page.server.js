import { getProfile } from '$lib/loadProfiles.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const profile = getProfile(params.username, 'ar');
  if (!profile) throw error(404, 'Profile not found');
  return { profile };
}