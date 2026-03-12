import { getArticle } from '$lib/loadArticles.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const article = getArticle(params.slug, 'ar');
  if (!article) error(404, 'المقالة غير موجودة');
  return { article };
}