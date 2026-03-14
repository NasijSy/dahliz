import { json } from '@sveltejs/kit';

export const prerender = false;

/**
 * GET /api
 *
 * API root index. Returns discoverable links and default version metadata.
 */
export function GET({ url }) {
  const base = url.origin;

  return json(
    {
      data: {
        name: 'Dahliz API',
        defaultVersion: 'v1',
        versions: ['v1'],
        links: {
          self: `${base}/api`,
          v1: `${base}/api/v1`
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
