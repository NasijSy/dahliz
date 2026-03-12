import { fail } from '@sveltejs/kit';

const MAX_URL_LENGTH = 2048;
const MAX_DESC_LENGTH = 500;

/** Strips HTML tags and control characters */
function sanitizeText(str = '') {
    return str
        .replace(/<[^>]*>/g, '')
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
        .trim()
        .slice(0, MAX_DESC_LENGTH);
}

/** @type {import('./$types').Actions} */
export const actions = {
    report: async ({ request, platform }) => {
        const data = await request.formData();
        const rawUrl = data.get('url')?.toString().trim() ?? '';
        const rawDescription = data.get('description')?.toString().trim() ?? '';

        if (!rawUrl) return fail(400, { error: 'الرابط مطلوب' });
        if (rawUrl.length > MAX_URL_LENGTH) return fail(400, { error: 'الرابط طويل جداً' });

        let parsedUrl;
        try {
            parsedUrl = new URL(rawUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return fail(400, { error: 'الرابط غير صالح، يجب أن يبدأ بـ http أو https' });
            }
        } catch {
            return fail(400, { error: 'الرابط غير صالح' });
        }

        const url = parsedUrl.toString();
        const description = sanitizeText(rawDescription);
        const submittedAt = new Date().toISOString();

        const db = platform?.env?.dahliz_reports;
        if (!db) {
            console.error('D1 database not available');
            return fail(500, { error: 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً' });
        }

        try {
            await db.prepare(
                `INSERT INTO reports (url, description, status, submitted_at)
                 VALUES (?, ?, 'pending', ?)`
            ).bind(url, description, submittedAt).run();
        } catch (err) {
            console.error('D1 insert failed:', err);
            return fail(500, { error: 'حدث خطأ أثناء الحفظ، يرجى المحاولة لاحقاً' });
        }

        return { success: true };
    }
};