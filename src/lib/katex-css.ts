import { version } from 'katex/package.json';

// served from the same CDN as mermaid; version pinned to the installed package
export const KATEX_CSS_HREF = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.min.css`;

// display ($$...$$) or inline ($...$) math; false positives only cost an extra stylesheet
export function hasMath(body: string | undefined): boolean {
  return /\$\$[\s\S]+?\$\$|(?<!\\)\$[^\s$][^$\n]*\$/.test(body ?? '');
}
