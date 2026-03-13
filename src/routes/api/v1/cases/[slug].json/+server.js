import { json, error } from '@sveltejs/kit';
import { getCases, getCase } from '$lib/loadCases.js';
import { getProfile } from '$lib/loadProfiles.js';
import { DEFAULT_LOCALE } from '../../locale.js';

export const prerender = true;

/** Pre-render one entry per case slug. */
export function entries() {
	return getCases(DEFAULT_LOCALE).map((c) => ({ slug: c.slug }));
}

/**
 * GET /api/v1/cases/:slug.json
 *
 * Returns full case data including all profile involvements (sources + analysis).
 */
export function GET({ params }) {
	const caseData = getCase(params.slug, DEFAULT_LOCALE);
	if (!caseData) throw error(404, { message: 'Case not found' });

	const profiles = (caseData.profiles ?? []).map((p) => {
		const profileData = getProfile(p.username, DEFAULT_LOCALE);
		return {
			username: p.username,
			name: profileData?.name ?? null,
			classification: profileData?.classification ?? null,
			imagePath: profileData?.imagePath ?? null,
			description: p.description ?? null,
			source: p.source ?? [],
			analysis: p.analysis ?? []
		};
	});

	return json(
		{
			data: {
				slug: caseData.slug,
				title: caseData.title,
				dateAdded: caseData.dateAdded ?? null,
				type: caseData.type,
				profileCount: profiles.length,
				profiles
			}
		},
		{
			headers: {
				'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800'
			}
		}
	);
}
