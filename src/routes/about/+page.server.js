import { marked } from 'marked';
import rawContent from '$lib/data/about.md?raw';

export function load() {
  const content = marked(rawContent);
  return { content };
}