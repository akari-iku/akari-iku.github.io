import type { APIRoute } from 'astro';
import { ACCENT } from '../../lib/tag-colors';
import { ogResponse, renderOgImage } from '../../lib/og-image';

/** Default OGP image for non-article pages (top / about / career / lists). */
export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    title: 'akari.log',
    breadcrumb: 'Blog & Portfolio',
    accent: ACCENT.magenta,
    vertical: 'AKARI',
  });
  return ogResponse(png);
};
