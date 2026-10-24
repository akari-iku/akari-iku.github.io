import { getCollection } from 'astro:content';
import { CATEGORY_KEYS, type CategoryKey } from './categories';

export interface TagCount {
  tag: string;
  count: number;
  /** Category of most posts carrying the tag (ties: earlier in CATEGORY_KEYS). */
  category: CategoryKey;
}

export interface TagGroup {
  key: CategoryKey;
  tags: TagCount[];
}

function majorityCategory(perCategory: Map<CategoryKey, number>): CategoryKey {
  let best: CategoryKey = CATEGORY_KEYS[0];
  let bestCount = -1;
  for (const key of CATEGORY_KEYS) {
    const n = perCategory.get(key) ?? 0;
    if (n > bestCount) {
      best = key;
      bestCount = n;
    }
  }
  return best;
}

/** All tags for a language, most-used first (ties: alphabetical). */
export async function tagCounts(lang: 'ja' | 'en'): Promise<TagCount[]> {
  const posts = await getCollection('blog', (p) => p.data.lang === lang);
  const byTag = new Map<string, Map<CategoryKey, number>>();
  for (const p of posts) {
    for (const t of p.data.tags) {
      const perCategory = byTag.get(t) ?? new Map<CategoryKey, number>();
      perCategory.set(p.data.category, (perCategory.get(p.data.category) ?? 0) + 1);
      byTag.set(t, perCategory);
    }
  }
  return [...byTag.entries()]
    .map(([tag, perCategory]) => ({
      tag,
      count: [...perCategory.values()].reduce((a, b) => a + b, 0),
      category: majorityCategory(perCategory),
    }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Tags split by category in CATEGORY_KEYS order; empty groups are skipped. */
export function groupByCategory(tags: TagCount[]): TagGroup[] {
  return CATEGORY_KEYS.map((key) => ({
    key,
    tags: tags.filter((t) => t.category === key),
  })).filter((g) => g.tags.length > 0);
}
