import { getCollection } from 'astro:content';

export interface TagCount {
  tag: string;
  count: number;
}

/** All tags for a language, most-used first (ties: alphabetical). */
export async function tagCounts(lang: 'ja' | 'en'): Promise<TagCount[]> {
  const posts = await getCollection('blog', (p) => p.data.lang === lang);
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
