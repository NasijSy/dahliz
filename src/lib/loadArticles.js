import { Marked } from 'marked';

const markedInstance = new Marked();

const articleFiles = import.meta.glob('./data/articles/*.json', { eager: true });
const articleTypeFiles = import.meta.glob('./data/article-types/*.json', { eager: true });

function getArticleTypes() {
  return Object.values(articleTypeFiles)
    .map((mod) => mod.default ?? mod)
    .filter(Boolean);
}

export function getArticles(locale = 'ar') {
  const types = getArticleTypes();

  return Object.entries(articleFiles)
    .map(([path, mod]) => {
      const raw = mod.default ?? mod;
      
      // The CMS stores the entire article under the locale key: { "ar": { ...fields } }
      const article = { ...(raw[locale] ?? raw) };

      // Fallback: use filename as slug if slug field is missing
      if (!article.slug) {
        const filename = path.split('/').pop();
        article.slug = filename?.replace('.json', '') || '';
      }

      const typeObj = types.find(t => t.slug === article.type);
      article.typeLabel = typeObj ? typeObj.label : article.type;

      if (article.body) {
        const result = markedInstance.parse(article.body, { async: false });
        article.body = result;
      }

      return article;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
}

export function getArticle(slug, locale = 'ar') {
  return getArticles(locale).find(a => a.slug === slug) ?? null;
}