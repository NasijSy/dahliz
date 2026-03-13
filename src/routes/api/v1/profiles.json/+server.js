import { json } from '@sveltejs/kit';
import { getProfiles } from '$lib/loadProfiles.js';
import { getCaseCountForProfile } from '$lib/loadCases.js';
import { DEFAULT_LOCALE } from '../locale.js';

export const prerender = true;

/**
 * GET /api/v1/profiles.json
 *
 * Returns all profiles sorted by case count descending, each enriched with
 * a `caseCount` field.  Aggregate counts per classification are included in
 * `meta.byClassification`.
 *
 * Filtering (classification, tags) and alternative sort orders can be
 * applied client-side using the fields present in every profile object.
 */
export function GET() {
	const profiles = getProfiles(DEFAULT_LOCALE, 'cases').map((p) => ({
		username: p.username,
		name: p.name,
		type: p.type,
		classification: p.classification,
		caseCount: getCaseCountForProfile(p.username, DEFAULT_LOCALE),
		dateAdded: p.dateAdded ?? null,
		lastUpdated: p.lastUpdated ?? null,
		summary: p.summary ?? null,
		imagePath: p.imagePath ?? null,
		platformLinks: p.platformLinks ?? [],
		tags: p.tags ?? []
	}));

	/** @type {Record<string, number>} */
	const byClassification = {};
	for (const p of profiles) {
		byClassification[p.classification] = (byClassification[p.classification] ?? 0) + 1;
	}

	return json(
		{
			data: profiles,
			meta: {
				total: profiles.length,
				byClassification
			}
		},
		{
			headers: {
				// Cached at the edge for 1 hour; browsers revalidate after 5 minutes.
				'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
			}
		}
	);
}
