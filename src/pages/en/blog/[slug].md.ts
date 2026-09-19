import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { articleMarkdown } from '../../../lib/article-markdown';

export async function getStaticPaths() {
  const posts = await getCollection('blog', (p) => p.data.lang === 'en');
  return posts.map((post) => ({
    params: { slug: post.id.replace(/^en\//, '') },
    props: { post },
  }));
}

export const GET: APIRoute<{ post: CollectionEntry<'blog'> }> = ({ props, params, site }) => {
  const canonical = new URL(`/en/blog/${params.slug}/`, site).href;
  return new Response(articleMarkdown(props.post, canonical), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
