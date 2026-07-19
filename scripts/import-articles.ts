/**
 * Import articles from the local articles/ repository into src/content/blog/.
 * Source files are never modified. Output files are generated and committed.
 *
 * Conversion catalog: see .plan/plan.md (Zenn syntax + Dev.to Liquid Tags).
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { accentFor, hasColorMatch, romajiLabel } from '../src/lib/tag-colors.ts';

const SITE = 'https://akari-iku.github.io';

interface ImportConfig {
  articlesDir: string;
}

interface SourceArticle {
  file: string;
  date: string;
  slug: string;
}

const root = process.cwd();
const config: ImportConfig = JSON.parse(
  fs.readFileSync(path.join(root, 'import.config.json'), 'utf8'),
);
const jaToEn: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts', 'pairs.json'), 'utf8'),
);
const enToJa = Object.fromEntries(
  Object.entries(jaToEn).map(([ja, en]) => [en, ja]),
);

const FILE_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

/** og:title / og:image cache for link cards (committed; fetched once per URL). */
interface LinkMeta {
  title?: string;
  image?: string;
}
const META_PATH = path.join(root, 'scripts', 'link-meta.json');
const linkMeta: Record<string, LinkMeta | null> = fs.existsSync(META_PATH)
  ? JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
  : {};
const cardUrls = new Set<string>();

/** Tweet text cache for X status links (committed; fetched once per URL). */
interface TweetMeta {
  name: string;
  screenName: string;
  text: string;
  date: string;
}
const TWEET_META_PATH = path.join(root, 'scripts', 'tweet-meta.json');
const tweetMeta: Record<string, TweetMeta | null> = fs.existsSync(TWEET_META_PATH)
  ? JSON.parse(fs.readFileSync(TWEET_META_PATH, 'utf8'))
  : {};
const tweetUrls = new Set<string>();

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

async function fetchMeta(url: string): Promise<LinkMeta | null> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; akari.log link cards)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 300_000);
    const pick = (...res_: RegExp[]) => {
      for (const re of res_) {
        const m = html.match(re);
        if (m) return decodeEntities(m[1].trim());
      }
      return undefined;
    };
    const title = pick(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    );
    let image = pick(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image[^"']*["'][^>]+content=["']([^"']+)["']/i,
    );
    // some sites (arXiv) declare og:image as a relative path
    if (image) image = new URL(image, res.url || url).href;
    if (!title && !image) return null;
    return { title, image };
  } catch {
    return null;
  }
}

/** X syndication endpoint (the same unofficial API react-tweet relies on). */
async function fetchTweet(url: string): Promise<TweetMeta | null> {
  const id = url.match(/\/status\/(\d+)/)?.[1];
  if (!id) return null;
  try {
    const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
    const res = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=ja&token=${token}`,
      { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      user?: { name?: string; screen_name?: string };
      text?: string;
      created_at?: string;
    };
    if (!j.user?.screen_name || !j.text) return null;
    // the trailing t.co link is the media/self reference, not prose
    const text = j.text.replace(/\s*https:\/\/t\.co\/\w+\s*$/, '').trim();
    if (!text) return null; // media-only tweet: keep the regular link card
    return {
      name: j.user.name ?? j.user.screen_name,
      screenName: j.user.screen_name,
      text,
      date: (j.created_at ?? '').slice(0, 10),
    };
  } catch {
    return null;
  }
}

/** Read a source file with CRLF normalized and frontmatter parsed leniently. */
function readSource(file: string): { data: Record<string, unknown>; content: string } {
  const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  try {
    const parsed = matter(src);
    return { data: parsed.data, content: parsed.content };
  } catch {
    // Some backup files contain invalid YAML (e.g. unescaped quotes in title).
    // Sources must not be modified, so fall back to a line-based parser.
    const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) return { data: {}, content: src };
    const data: Record<string, unknown> = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      let value = kv[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        data[kv[1]] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        continue;
      }
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      data[kv[1]] = value;
    }
    return { data, content: m[2] };
  }
}

function listArticles(dir: string): SourceArticle[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name.match(FILE_RE))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ file: path.join(dir, m[0]), date: m[1], slug: m[2] }));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Fence-open line normalization shared by both sources. Returns lines to emit. */
function openFence(info: string): { lines: string[] } {
  let lang = info.trim();
  const extra: string[] = [];
  // ```diff js -> ```diff
  if (/^diff\s+\S+/.test(lang)) lang = 'diff';
  // ```js:filename.js -> filename label + ```js
  const named = lang.match(/^([A-Za-z0-9_+-]+):(.+)$/);
  if (named) {
    extra.push(`**\`${named[2].trim()}\`**`, '');
    lang = named[1];
  }
  return { lines: [...extra, '```' + lang] };
}

/**
 * Handle a Zenn ::: container line (message / details / close marker).
 * Returns true when the line was consumed. Dev.to backups also contain these
 * (leftovers from cross-posting), so both converters share this.
 */
function handleContainer(
  line: string,
  stack: ('aside' | 'details')[],
  out: string[],
): boolean {
  const container = line.match(/^(:{3,})\s*(.*)$/);
  if (!container) return false;
  const rest = container[2].trim();
  if (rest.startsWith('message')) {
    const alert = /\balert\b/.test(rest);
    stack.push('aside');
    out.push(`<aside class="callout${alert ? ' callout-alert' : ''}">`, '');
  } else if (rest.startsWith('details')) {
    const title = rest.replace(/^details\s*/, '').trim() || 'details';
    stack.push('details');
    out.push(`<details><summary>${escapeHtml(title)}</summary>`, '');
  } else if (rest === '') {
    const kind = stack.pop();
    out.push('', kind === 'details' ? '</details>' : '</aside>');
  } else {
    out.push(line);
  }
  return true;
}

/**
 * A line consisting solely of one link becomes a link card
 * (Zenn's bare-URL auto-card / dev.to embed equivalent).
 */
function linkCard(line: string): string[] | null {
  const t = line.trim();
  let label = '';
  let url = '';
  const md = t.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
  const bare = t.match(/^<?(https?:\/\/[^\s>]+)>?$/);
  if (md) {
    label = md[1];
    url = md[2];
  } else if (bare) {
    url = bare[1];
    label = url;
  } else {
    return null;
  }
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  // X status links become static tweet quotes when the text could be fetched;
  // otherwise they fall through to the regular link card.
  if (/^https?:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/.test(url)) {
    tweetUrls.add(url);
    const tweet = tweetMeta[url];
    if (tweet) {
      const text = escapeHtml(tweet.text).replace(/\n/g, '<br />');
      return [
        '',
        `<blockquote class="tweet-card">`,
        `<p class="tweet-card-text">${text}</p>`,
        `<footer class="tweet-card-meta"><span>${escapeHtml(tweet.name)} @${escapeHtml(tweet.screenName)}</span><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${tweet.date} · x.com →</a></footer>`,
        `</blockquote>`,
        '',
      ];
    }
  }
  cardUrls.add(url);
  const meta = linkMeta[url];
  const title = meta?.title || label;
  const lines = ['', `<a class="link-card" href="${escapeHtml(url)}" target="_blank" rel="noopener">`];
  if (meta?.image) {
    lines.push(
      `<img class="link-card-thumb" src="${escapeHtml(meta.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`,
    );
  }
  lines.push(
    `<span class="link-card-body">`,
    `<span class="link-card-domain">${escapeHtml(domain)}</span>`,
    `<span class="link-card-title">${escapeHtml(title)}</span>`,
    `</span>`,
    `</a>`,
    '',
  );
  return lines;
}

/** Convert Zenn-specific syntax (::: containers, @[embed], fences). */
function convertZennBody(body: string): string {
  const out: string[] = [];
  const stack: ('aside' | 'details')[] = [];
  let inCode = false;

  for (const line of body.split('\n')) {
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        out.push(...openFence(fence[1]).lines);
      } else {
        inCode = false;
        out.push('```');
      }
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }
    if (handleContainer(line, stack, out)) continue;
    // @[speakerdeck](id) -> player iframe
    const sd = line.trim().match(/^@\[speakerdeck\]\(([A-Za-z0-9]+)\)$/);
    if (sd) {
      out.push(
        '',
        `<div class="embed-frame"><iframe src="https://speakerdeck.com/player/${sd[1]}" title="Speaker Deck" allowfullscreen loading="lazy"></iframe></div>`,
        '',
      );
      continue;
    }
    // @[card](url), @[tweet](url) etc. -> plain links
    const converted = line.replace(/@\[[a-z]+\]\((\S+?)\)/g, '[$1]($1)');
    const card = linkCard(converted);
    if (card) {
      out.push(...card);
      continue;
    }
    out.push(converted);
  }
  return out.join('\n');
}

/** Convert a single line's Dev.to Liquid Tags to markdown links. */
function convertLiquidInline(line: string): string {
  return line
    .replace(/\{%\s*katex\s+inline\s*%\}(.*?)\{%\s*endkatex\s*%\}/g, (_, x) => `$${x.trim()}$`)
    .replace(/\{%\s*cta\s+(\S+)\s*%\}(.*?)\{%\s*endcta\s*%\}/g, '[$2]($1)')
    .replace(/\{%\s*youtube\s+(\S+)\s*%\}/g, '[YouTube video](https://www.youtube.com/watch?v=$1)')
    .replace(/\{%\s*github\s+(\S+)\s*%\}/g, '[github.com/$1](https://github.com/$1)')
    .replace(/\{%\s*twitter\s+(\S+)\s*%\}/g, '[Post on X](https://x.com/i/status/$1)')
    .replace(/\{%\s*(?:embed|link|gist|codepen|codesandbox|stackblitz)\s+(\S+)\s*%\}/g, '[$1]($1)');
}

/** Convert Dev.to article body (Liquid Tags, manual ToC, anchors, fences). */
function convertDevBody(body: string): string {
  const out: string[] = [];
  const stack: ('aside' | 'details')[] = [];
  let inCode = false;
  let inKatex = false;
  let skippingToc = false;

  for (const rawLine of body.split('\n')) {
    let line = rawLine;

    const fence = line.match(/^```(.*)$/);
    if (fence) {
      skippingToc = false;
      if (!inCode) {
        inCode = true;
        out.push(...openFence(fence[1]).lines);
      } else {
        inCode = false;
        out.push('```');
      }
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }

    // Manual "Table of Contents" section: drop heading + list until next heading.
    if (/^#{2,}\s+table of contents/i.test(line.trim())) {
      skippingToc = true;
      continue;
    }
    if (skippingToc) {
      if (/^#{1,6}\s/.test(line)) {
        skippingToc = false; // fall through: this heading is real content
      } else {
        continue;
      }
    }

    // Block KaTeX
    if (/^\{%\s*katex\s*%\}\s*$/.test(line.trim())) {
      inKatex = true;
      out.push('$$');
      continue;
    }
    if (inKatex && /^\{%\s*endkatex\s*%\}\s*$/.test(line.trim())) {
      inKatex = false;
      out.push('$$');
      continue;
    }
    if (inKatex) {
      out.push(line);
      continue;
    }

    // {% speakerdeck id %} -> player iframe
    const sdl = line.trim().match(/^\{%\s*speakerdeck\s+([A-Za-z0-9]+)\s*%\}$/);
    if (sdl) {
      out.push(
        '',
        `<div class="embed-frame"><iframe src="https://speakerdeck.com/player/${sdl[1]}" title="Speaker Deck" allowfullscreen loading="lazy"></iframe></div>`,
        '',
      );
      continue;
    }

    // details / spoiler / collapsible blocks
    const detailsOpen = line.match(/^\{%\s*(?:details|spoiler|collapsible)\s+(.*?)\s*%\}\s*$/);
    if (detailsOpen) {
      out.push(`<details><summary>${escapeHtml(detailsOpen[1] || 'details')}</summary>`, '');
      continue;
    }
    if (/^\{%\s*end(?:details|spoiler|collapsible)\s*%\}\s*$/.test(line.trim())) {
      out.push('', '</details>');
      continue;
    }

    if (handleContainer(line, stack, out)) continue;

    // dev.to heading anchors like <a name="x"></a>
    line = line.replace(/<a\s+name="[^"]*">\s*<\/a>/g, '').trimEnd();
    const converted = convertLiquidInline(line);
    const card = linkCard(converted);
    if (card) {
      out.push(...card);
      continue;
    }
    out.push(converted);
  }
  return out.join('\n');
}

/** Extract a plain-text description candidate from the first real paragraph. */
function extractDescription(body: string): string {
  let inCode = false;
  for (const raw of body.split('\n')) {
    if (/^```/.test(raw)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const t = raw.trim();
    if (!t) continue;
    if (/^(#|>|:::|@\[|!\[|\||<|[-*]\s|\d+\.\s|\{%)/.test(t)) continue;
    const plain = t
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/\*([^*]*)\*/g, '$1')
      .trim();
    if (plain.length < 12) continue;
    return plain.length > 110 ? plain.slice(0, 109) + '…' : plain;
  }
  return '';
}

function normalizeTags(raw: unknown): string[] {
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(',')
      : [];
  return arr
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => t.length > 0);
}

function writePost(
  outDir: string,
  slug: string,
  data: Record<string, unknown>,
  body: string,
  sourceRel: string,
): void {
  fs.mkdirSync(outDir, { recursive: true });
  const banner = `<!-- generated from articles/${sourceRel} by scripts/import-articles.ts - do not edit -->\n\n`;
  const content = matter.stringify('\n' + banner + body.trim() + '\n', data);
  fs.writeFileSync(path.join(outDir, `${slug}.md`), content, 'utf8');
}

/**
 * Dev.to-ready copy of an en article: original body (Liquid Tags intact,
 * dev.to renders them natively) + canonical_url pointing back at the site.
 * Output is gitignored; paste it into the dev.to editor as-is.
 */
function writeDevtoExport(
  slug: string,
  data: Record<string, unknown>,
  content: string,
): void {
  const outDir = path.join(root, 'exports', 'devto');
  fs.mkdirSync(outDir, { recursive: true });
  // lineWidth: -1 keeps every value on one line (dev.to's parser dislikes folded scalars)
  const out = matter.stringify(
    content,
    { ...data, canonical_url: `${SITE}/en/blog/${slug}/` },
    { lineWidth: -1 } as Parameters<typeof matter.stringify>[2],
  );
  fs.writeFileSync(path.join(outDir, `${slug}.md`), out, 'utf8');
}

function run(): void {
  const zennDir = path.join(config.articlesDir, 'zenn');
  const devDir = path.join(config.articlesDir, 'dev');
  const outJa = path.join(root, 'src', 'content', 'blog', 'ja');
  const outEn = path.join(root, 'src', 'content', 'blog', 'en');
  const descriptions: Record<string, string> = {};
  const accentFallback: string[] = [];
  const labelFallback: string[] = [];
  const trackTagGaps = (id: string, tags: string[]): void => {
    if (!hasColorMatch(tags)) accentFallback.push(`${id} [${tags.join(', ')}]`);
    else if (romajiLabel(tags) === 'LOG') labelFallback.push(`${id} [${tags.join(', ')}]`);
  };

  const zenn = listArticles(zennDir);
  const jaAccent: Record<string, string> = {};
  for (const a of zenn) {
    const raw = readSource(a.file);
    const description = extractDescription(raw.content);
    descriptions[`ja/${a.slug}`] = description;
    const tags = normalizeTags(raw.data.topics);
    trackTagGaps(`ja/${a.slug}`, tags);
    jaAccent[a.slug] = accentFor(tags);
    writePost(
      outJa,
      a.slug,
      {
        title: raw.data.title ?? a.slug,
        description,
        date: a.date,
        tags,
        lang: 'ja',
        ...(jaToEn[a.slug] ? { pair: jaToEn[a.slug] } : {}),
        source: 'zenn',
        accent: jaAccent[a.slug],
      },
      convertZennBody(raw.content),
      `zenn/${path.basename(a.file)}`,
    );
  }

  const dev = listArticles(devDir);
  for (const a of dev) {
    const raw = readSource(a.file);
    const description =
      typeof raw.data.description === 'string' && raw.data.description.trim()
        ? raw.data.description.trim()
        : extractDescription(raw.content);
    const tags = normalizeTags(raw.data.tags);
    trackTagGaps(`en/${a.slug}`, tags);
    const pairJa = enToJa[a.slug];
    writeDevtoExport(a.slug, raw.data, raw.content);
    writePost(
      outEn,
      a.slug,
      {
        title: raw.data.title ?? a.slug,
        description,
        date: a.date,
        tags,
        lang: 'en',
        ...(pairJa ? { pair: pairJa } : {}),
        source: 'dev',
        // paired articles share the ja article's color (card = article identity)
        accent: (pairJa && jaAccent[pairJa]) || accentFor(tags),
      },
      convertDevBody(raw.content),
      `dev/${path.basename(a.file)}`,
    );
  }

  fs.writeFileSync(
    path.join(root, '.plan', 'descriptions-review.md'),
    '# Zenn記事のdescription案（本文冒頭から自動抽出、要レビュー）\n\n' +
      Object.entries(descriptions)
        .map(([k, v]) => `- **${k}**: ${v || '（抽出できず、要手動）'}`)
        .join('\n') +
      '\n',
    'utf8',
  );

  console.log(`imported: ja=${zenn.length}, en=${dev.length}`);
  console.log(`devto exports (canonical_url embedded): exports/devto/ (${dev.length} files)`);
  const unpairedJa = zenn.filter((a) => !jaToEn[a.slug]).map((a) => a.slug);
  const unpairedEn = dev.filter((a) => !enToJa[a.slug]).map((a) => a.slug);
  console.log(`unpaired ja: ${unpairedJa.join(', ') || '(none)'}`);
  console.log(`unpaired en: ${unpairedEn.join(', ') || '(none)'}`);
  if (accentFallback.length > 0) {
    console.log('WARN accent fallback to magenta - consider adding a tag to TAG_COLORS:');
    for (const w of accentFallback) console.log(`  ${w}`);
  }
  if (labelFallback.length > 0) {
    console.log('WARN vertical label fallback to "LOG" - consider adding to ROMAJI_LABELS:');
    for (const w of labelFallback) console.log(`  ${w}`);
  }
}

async function main(): Promise<void> {
  run();
  const missingTweets = [...tweetUrls].filter((u) => !(u in tweetMeta));
  if (missingTweets.length > 0) {
    console.log(`fetching tweets: ${missingTweets.length} urls...`);
    for (const u of missingTweets) tweetMeta[u] = await fetchTweet(u);
    fs.writeFileSync(TWEET_META_PATH, JSON.stringify(tweetMeta, null, 2), 'utf8');
  }
  const missing = [...cardUrls].filter((u) => !(u in linkMeta));
  if (missing.length > 0) {
    console.log(`fetching link metadata: ${missing.length} urls...`);
    const queue = [...missing];
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        while (queue.length > 0) {
          const u = queue.shift()!;
          linkMeta[u] = await fetchMeta(u);
        }
      }),
    );
    fs.writeFileSync(META_PATH, JSON.stringify(linkMeta, null, 2), 'utf8');
  }
  if (missingTweets.length > 0 || missing.length > 0) {
    run(); // second pass: regenerate with fetched data
  }
}

main();
