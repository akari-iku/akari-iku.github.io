import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', (p) => p.data.lang === 'en')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'akari.log (EN)',
    description: 'akari.log — English articles feed',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/en/blog/${p.id.replace(/^en\//, '')}/`,
    })),
    customData: '<language>en</language>',
  });
}
