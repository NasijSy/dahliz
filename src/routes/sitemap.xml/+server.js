import { getProfiles } from '$lib/loadProfiles';
import { getCases } from '$lib/loadCases';
import { getArticles } from '$lib/loadArticles';

const BASE_URL = 'https://dahliz.nasij.org';

/** @param {string} url */
function url(url, priority = '0.7', changefreq = 'weekly') {
    return `
    <url>
        <loc>${BASE_URL}${url}</loc>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
}

export async function GET() {
    const profiles = getProfiles();
    const cases = getCases();
    const articles = getArticles();

    const staticPages = [
        url('/', '1.0', 'daily'),
        url('/profiles', '0.9', 'daily'),
        url('/articles', '0.8', 'weekly'),
        url('/about', '0.5', 'monthly'),
        url('/contribute', '0.5', 'monthly'),
    ];

    const profilePages = profiles.map((p) =>
        url(`/profile/${p.username}`, '0.8', 'weekly')
    );

    const casePages = cases.map((c) =>
        url(`/case/${c.slug}`, '0.7', 'weekly')
    );

    const articlePages = articles.map((a) => {
        const lastmod = a.datePublished
            ? `\n        <lastmod>${new Date(a.datePublished).toISOString().split('T')[0]}</lastmod>`
            : '';
        return `
    <url>
        <loc>${BASE_URL}/articles/${a.slug}</loc>${lastmod}
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${[...staticPages, ...profilePages, ...casePages, ...articlePages].join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=3600'
        }
    });
}