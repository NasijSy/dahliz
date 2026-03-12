import { getArticles } from '$lib/loadArticles.js';

export function load() {
  const articles = getArticles('ar');
  return { articles };
}