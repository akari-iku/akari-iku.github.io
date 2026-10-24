/**
 * Related-post ranking (policy: .plan/category-plan.md Q5).
 *
 * score(A, B) = Σ idf(t) over shared non-genre tags
 *             + 2.0 if either body links to the other
 *             + 0.5 if both share a category
 * Ties go to the post closest in publish date. Zero-score candidates are
 * never ranked; the list is padded only with same-category posts.
 */
import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

/**
 * Genre tags describe the form of a post, not its topic, so they never count.
 * ポエム is kept: it doubles as the essay category, and essays relate to each other.
 */
const GENRE_TAGS = new Set(['notes', 'review', 'papers', 'tutorial']);
const LINK_WEIGHT = 2.0;
const CATEGORY_WEIGHT = 0.5;

const slugOf = (p: Post) => p.id.replace(/^(ja|en)\//, '');

/** True if the body of `from` links to `to` (`/blog/<slug>/` also covers `/en/blog/<slug>/`). */
const linksTo = (from: Post, to: Post) => (from.body ?? '').includes(`/blog/${slugOf(to)}/`);

const topicTags = (p: Post) => p.data.tags.filter((t) => !GENRE_TAGS.has(t));

/** idf(t) = ln(N / df(t)) over every post of the language, the current one included. */
function idfTable(posts: Post[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const p of posts) {
    for (const t of new Set(topicTags(p))) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, n] of df) idf.set(t, Math.log(posts.length / n));
  return idf;
}

export function relatedPosts(post: Post, candidates: Post[], limit = 3): Post[] {
  const idf = idfTable([post, ...candidates]);
  const ownTags = new Set(topicTags(post));
  const time = post.data.date.valueOf();

  const score = (other: Post) => {
    let s = 0;
    for (const t of new Set(topicTags(other))) {
      if (ownTags.has(t)) s += idf.get(t) ?? 0;
    }
    if (linksTo(post, other) || linksTo(other, post)) s += LINK_WEIGHT;
    if (other.data.category === post.data.category) s += CATEGORY_WEIGHT;
    return s;
  };

  const ranked = candidates
    .map((p) => ({ p, score: score(p), gap: Math.abs(p.data.date.valueOf() - time) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.gap - b.gap)
    .slice(0, limit)
    .map((x) => x.p);
  if (ranked.length >= limit) return ranked;

  // Pad with the newest same-category posts; never with unrelated ones.
  const padding = candidates
    .filter((p) => p.data.category === post.data.category && !ranked.includes(p))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return [...ranked, ...padding].slice(0, limit);
}
