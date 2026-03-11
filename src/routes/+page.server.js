import { getProfiles } from '$lib/loadProfiles.js';

export function load() {
  const profiles = getProfiles('ar', 'cases');
  return { profiles };
}