import { json, error } from '@sveltejs/kit';
import { getProfiles, getProfile } from '$lib/loadProfiles.js';
import { getCasesForProfile } from '$lib/loadCases.js';

export const prerender = true;

/** Pre-render one entry per username so the static site includes every profile. */
export function entries() {
	return getProfiles().map((p) => ({ username: p.username }));
}

/**
 * GET /api/v1/profiles/:username.json
 *
 * Returns full profile data plus a lightweight list of every associated case.
 */
export function GET({ params }) {
	const profile = getProfile(params.username);
	if (!profile) throw error(404, { message: 'Profile not found' });

	const cases = getCasesForProfile(params.username).map((c) => ({
		slug: c.slug,
		title: c.title,
		dateAdded: c.dateAdded ?? null,
		type: c.type
	}));

	return json(
		{
			data: {
				username: profile.username,
				name: profile.name,
				type: profile.type,
				classification: profile.classification,
				caseCount: cases.length,
				dateAdded: profile.dateAdded ?? null,
				lastUpdated: profile.lastUpdated ?? null,
				summary: profile.summary ?? null,
				imagePath: profile.imagePath ?? null,
				platformLinks: profile.platformLinks ?? [],
				tags: profile.tags ?? [],
				cases
			}
		},
		{
			headers: {
				// Individual profiles are less volatile — cache longer at the edge.
				'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800'
			}
		}
	);
}
