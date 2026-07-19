/**
 * Build-time OGP image generation (1200x630).
 * Renders a miniature of the article databook hero: accent background,
 * black ink typography, breadcrumb + article number, vertical Latin label.
 * Fonts are subset-fetched from Google Fonts (only the glyphs we render).
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getCollection } from 'astro:content';
import { primaryTag, romajiLabel } from './tag-colors';

const INK = '#171717';
const WIDTH = 1200;
const HEIGHT = 630;

export interface OgProps {
  title: string;
  breadcrumb: string;
  accent: string;
  vertical: string;
  num?: string;
  date?: string;
}

/** getStaticPaths body shared by the ja/en OGP endpoints (mirrors blog/[slug]). */
export async function ogBlogPaths(lang: 'ja' | 'en') {
  const posts = (await getCollection('blog', (p) => p.data.lang === lang)).sort(
    (a, b) => a.data.date.valueOf() - b.data.date.valueOf(),
  );
  return posts.map((post, i) => ({
    params: { slug: post.id.replace(/^(ja|en)\//, '') },
    props: { post, num: i + 1 },
  }));
}

/* --- fonts ------------------------------------------------------------ */

// Legacy UA makes Google Fonts serve woff/TTF (satori cannot parse woff2).
const LEGACY_UA = 'Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0';
// Keep subset URLs comfortably under Google's ~8KB URL limit.
const SUBSET_CHUNK = 700;

async function fetchGoogleFont(spec: string, text: string): Promise<ArrayBuffer[]> {
  const chars = [...new Set(text)];
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += SUBSET_CHUNK) {
    chunks.push(chars.slice(i, i + SUBSET_CHUNK).join(''));
  }
  return Promise.all(
    chunks.map(async (chunk) => {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${spec}&text=${encodeURIComponent(chunk)}`;
      const css = await (await fetch(cssUrl, { headers: { 'User-Agent': LEGACY_UA } })).text();
      const url = css.match(/src:\s*url\((.+?)\)\s*format\('(?:woff|opentype|truetype)'\)/)?.[1];
      if (!url) throw new Error(`Google Fonts returned no woff/TTF for ${spec}`);
      return (await fetch(url)).arrayBuffer();
    }),
  );
}

// One subset per font per build, covering every string any OGP image renders.
let fontsPromise: Promise<
  { name: string; data: ArrayBuffer; weight: 700; style: 'normal' }[]
> | null = null;

async function loadFonts() {
  const posts = await getCollection('blog');
  const union =
    posts
      .map((p) => p.data.title + primaryTag(p.data.tags) + romajiLabel(p.data.tags))
      .join('') + 'akari.log Blog & Portfolio AKARI#0123456789-/ ';
  // Fallback order matters: title Latin -> Abril, JP -> Noto Serif JP.
  const [abril, serifJp, mono] = await Promise.all([
    fetchGoogleFont('Abril+Fatface', union),
    fetchGoogleFont('Noto+Serif+JP:wght@700', union),
    fetchGoogleFont('JetBrains+Mono:wght@700', union),
  ]);
  const font = (name: string, data: ArrayBuffer) => ({
    name,
    data,
    weight: 700 as const,
    style: 'normal' as const,
  });
  return [
    ...abril.map((d) => font('Abril Fatface', d)),
    ...serifJp.map((d) => font('Noto Serif JP', d)),
    ...mono.map((d) => font('JetBrains Mono', d)),
  ];
}

/* --- markup ----------------------------------------------------------- */

type Node = { type: string; props: Record<string, unknown> };

function el(style: Record<string, unknown>, children?: Node[] | string): Node {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function markup(p: OgProps): Node {
  const mono = {
    fontFamily: 'JetBrains Mono',
    fontWeight: 700,
    fontSize: 28,
  };
  return el(
    {
      width: '100%',
      height: '100%',
      background: p.accent,
      color: INK,
      border: `8px solid ${INK}`,
      padding: '52px 56px',
      position: 'relative',
    },
    [
      // vertical full-bleed label, same as the hero's writing-mode: vertical-rl
      el(
        {
          position: 'absolute',
          left: WIDTH - 90 - 550,
          top: HEIGHT / 2 - 90 - 60, // -60: page padding offset inside the border box
          width: 1100,
          height: 180,
          justifyContent: 'center',
          alignItems: 'center',
          transform: 'rotate(90deg)',
          fontFamily: 'Abril Fatface',
          fontSize: 170,
          whiteSpace: 'nowrap',
        },
        p.vertical,
      ),
      // content column, kept clear of the vertical-label lane on the right
      el({ flexDirection: 'column', width: 860, height: '100%' }, [
        el({ justifyContent: 'space-between', width: '100%', ...mono }, [
          el({}, p.breadcrumb),
          el({}, p.num ?? ''),
        ]),
        el(
          {
            display: 'block',
            marginTop: 36,
            fontFamily: 'Abril Fatface',
            fontWeight: 700,
            fontSize: p.title.length > 40 ? 50 : 60,
            lineHeight: 1.45,
            lineClamp: 3,
          },
          p.title,
        ),
        el(
          {
            marginTop: 'auto',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          },
          [
            el(
              { background: INK, color: '#ffffff', padding: '8px 20px', ...mono, fontSize: 26 },
              'akari.log',
            ),
            el({ ...mono, fontSize: 26 }, p.date ?? ''),
          ],
        ),
      ]),
    ],
  );
}

/* --- renderer ----------------------------------------------------------*/

export async function renderOgImage(p: OgProps): Promise<Uint8Array> {
  fontsPromise ??= loadFonts();
  const svg = await satori(markup(p) as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await fontsPromise,
  });
  return new Resvg(svg).render().asPng();
}

export function ogResponse(png: Uint8Array): Response {
  const body = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
  return new Response(body, { headers: { 'Content-Type': 'image/png' } });
}
