const tagFiles = import.meta.glob('./data/tags/*.json', { eager: true });

/**
 * @returns {{ slug: string, label: string }[]}
 */
export function getTags() {
  return Object.values(tagFiles)
    .map((mod) => mod.default ?? mod)
    .filter(Boolean);
}

/**
 * @param {string} slug
 * @returns {{ slug: string, label: string } | null}
 */
export function getTag(slug) {
  return getTags().find((t) => t.slug === slug) ?? null;
}