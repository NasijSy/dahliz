import { json } from '@sveltejs/kit';
import { getProfiles } from '$lib/loadProfiles.js';
import { getCases } from '$lib/loadCases.js';
import { DEFAULT_LOCALE } from '../locale.js';

export const prerender = true;

/**
 * GET /api/v1/stats.json
 *
 * Returns aggregate counts useful for dashboards and overview displays.
 */
export function GET() {
	const profiles = getProfiles(DEFAULT_LOCALE);
	const cases = getCases(DEFAULT_LOCALE);

	/** @type {Record<string, number>} */
	const profilesByClassification = {};
	/** @type {Record<string, number>} */
	const profilesByType = {};
	for (const p of profiles) {
		profilesByClassification[p.classification] =
			(profilesByClassification[p.classification] ?? 0) + 1;
		profilesByType[p.type] = (profilesByType[p.type] ?? 0) + 1;
	}

	/** @type {Record<string, number>} */
	const casesByType = {};
	for (const c of cases) {
		casesByType[c.type] = (casesByType[c.type] ?? 0) + 1;
	}

	return json(
		{
			data: {
				profiles: {
					total: profiles.length,
					byClassification: profilesByClassification,
					byType: profilesByType
				},
				cases: {
					total: cases.length,
					byType: casesByType
				}
			}
		},
		{
			headers: {
				// Stats change whenever content is updated — moderate cache.
				'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
			}
		}
	);
}
