import { json } from '@sveltejs/kit';
import { getCases } from '$lib/loadCases.js';
import { getProfile } from '$lib/loadProfiles.js';

export const prerender = true;

/**
 * GET /api/v1/cases.json
 *
 * Returns all cases.  Each entry includes a lightweight `profiles` array
 * with the username and classification of every involved profile so that
 * clients can filter by classification without an extra request.
 *
 * `meta.byType` contains the total count per case type across the full
 * dataset regardless of any client-side filtering.
 *
 * Filtering by case type can be applied client-side using the `type` field.
 */
export function GET() {
	const allCases = getCases();

	const cases = allCases.map((c) => {
		const profiles = (c.profiles ?? []).map((p) => {
			const profileData = getProfile(p.username);
			return {
				username: p.username,
				classification: profileData?.classification ?? null
			};
		});

		return {
			slug: c.slug,
			title: c.title,
			dateAdded: c.dateAdded ?? null,
			type: c.type,
			profileCount: profiles.length,
			profiles
		};
	});

	/** @type {Record<string, number>} */
	const byType = {};
	for (const c of allCases) {
		byType[c.type] = (byType[c.type] ?? 0) + 1;
	}

	return json(
		{
			data: cases,
			meta: {
				total: allCases.length,
				byType
			}
		},
		{
			headers: {
				'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
			}
		}
	);
}
