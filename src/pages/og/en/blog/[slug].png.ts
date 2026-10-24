import type { APIRoute, InferGetStaticPropsType } from 'astro';
import { primaryTag, romajiLabel } from '../../../../lib/tag-colors';
import { ogBlogPaths, ogResponse, renderOgImage } from '../../../../lib/og-image';

export async function getStaticPaths() {
  return ogBlogPaths('en');
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props }) => {
  const { post } = props;
  const png = await renderOgImage({
    title: post.data.title,
    breadcrumb: `Blog / ${primaryTag(post.data.tags)}`,
    accent: post.data.accent,
    vertical: romajiLabel(post.data.tags),
    date: post.data.date.toISOString().slice(0, 10),
  });
  return ogResponse(png);
};
