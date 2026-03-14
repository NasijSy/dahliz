import { json } from '@sveltejs/kit';

export const prerender = false;

/**
 * GET /api/v1
 *
 * Versioned API index. Lists available v1 endpoints.
 */
export function GET({ url }) {
  const base = url.origin;

  return json(
    {
      data: {
        version: 'v1',
        links: {
          self: `${base}/api/v1`,
          stats: `${base}/api/v1/stats.json`,
          profiles: `${base}/api/v1/profiles.json`,
          profileByUsername: `${base}/api/v1/profiles/{username}.json`,
          cases: `${base}/api/v1/cases.json`,
          caseBySlug: `${base}/api/v1/cases/{slug}.json`
        }
      }
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  );
}
