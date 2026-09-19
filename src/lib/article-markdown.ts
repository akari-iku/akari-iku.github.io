import type { CollectionEntry } from 'astro:content';

/**
 * Reconstruct clean Markdown from an imported article body:
 * the import step bakes link cards / tweet cards / embeds into HTML,
 * so turn those back into plain Markdown for copy & .md distribution.
 */
export function articleMarkdown(post: CollectionEntry<'blog'>, canonical: string): string {
  let md = post.body ?? '';
  md = md.replace(/<!-- generated from [^>]* -->\n*/g, '');
  // link cards → [title](url)
  md = md.replace(
    /<a class="link-card" href="([^"]+)"[^>]*>[\s\S]*?<span class="link-card-title">([\s\S]*?)<\/span>[\s\S]*?<\/a>/g,
    (_m, href: string, title: string) => `[${title.trim()}](${href})`
  );
  // tweet cards → blockquote with author + link
  md = md.replace(
    /<blockquote class="tweet-card">[\s\S]*?<p class="tweet-card-text">([\s\S]*?)<\/p>[\s\S]*?<span>([\s\S]*?)<\/span><a href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/blockquote>/g,
    (_m, text: string, author: string, href: string) => {
      const quoted = text
        .split(/<br\s*\/?>/)
        .map((line) => `> ${line.trim()}`.trimEnd())
        .join('\n');
      return `${quoted}\n>\n> — ${author.trim()} ${href}`;
    }
  );
  // embeds → bare url
  md = md.replace(/<div class="embed-frame"><iframe src="([^"]+)"[^>]*><\/iframe><\/div>/g, '$1');
  // callouts → keep the content, drop the wrapper
  md = md.replace(/<aside class="callout[^"]*">\n*/g, '').replace(/\n*<\/aside>/g, '');
  return `# ${post.data.title}\n\n${canonical}\n\n${md.trim()}\n`;
}
