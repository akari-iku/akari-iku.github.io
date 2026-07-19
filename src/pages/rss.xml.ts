import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', (p) => p.data.lang === 'ja')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'akari.log',
    description: 'akari.log — 灯里の技術記事フィード（日本語）',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id.replace(/^ja\//, '')}/`,
    })),
    customData: '<language>ja</language>',
  });
}
