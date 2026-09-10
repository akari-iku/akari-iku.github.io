/**
 * Tag -> accent color mapping for article cards / heroes / OGP.
 * The first tag of an article (author's ordering) that appears here wins.
 * Categories: AI/LLM=magenta, dev tools=cyan, web/making=green,
 * career/essay=orange, security=red. Fallback: magenta.
 */
export const ACCENT = {
  magenta: '#E5007F',
  cyan: '#00A0E9',
  green: '#00B06B',
  orange: '#FF6B00',
  red: '#E51A14',
  yellow: '#FFD400',
} as const;

const TAG_COLORS: Record<string, string> = {
  // AI / LLM core -> magenta
  ai: ACCENT.magenta,
  llm: ACCENT.magenta,
  rag: ACCENT.magenta,
  promptengineering: ACCENT.magenta,
  dspy: ACCENT.magenta,
  agents: ACCENT.magenta,
  manus: ACCENT.magenta,
  gemini: ACCENT.magenta,

  // dev tools / engineering -> cyan
  google: ACCENT.cyan,
  opal: ACCENT.cyan,
  claude: ACCENT.cyan,
  claudecode: ACCENT.cyan,
  cli: ACCENT.cyan,
  vscode: ACCENT.cyan,
  windows: ACCENT.cyan,
  github: ACCENT.cyan,
  npm: ACCENT.cyan,
  gas: ACCENT.cyan,
  n8n: ACCENT.cyan,
  dify: ACCENT.cyan,
  command: ACCENT.cyan,
  devops: ACCENT.cyan,
  api: ACCENT.cyan,
  python: ACCENT.cyan,
  typescript: ACCENT.cyan,
  json: ACCENT.cyan,
  toon: ACCENT.cyan,
  tokenefficiency: ACCENT.cyan,
  base64: ACCENT.cyan,
  architecture: ACCENT.cyan,
  opensource: ACCENT.cyan,
  documentation: ACCENT.cyan,

  // web / making / visualizing -> green
  mermaid: ACCENT.green,
  plantuml: ACCENT.green,
  drawio: ACCENT.green,
  diagramming: ACCENT.green,
  webapp: ACCENT.green,
  astro: ACCENT.green,
  seo: ACCENT.green,
  sideproject: ACCENT.green,
  frontend: ACCENT.green,
  uiux: ACCENT.green,
  nocode: ACCENT.green,
  zenn: ACCENT.green,
  tutorial: ACCENT.green,
  review: ACCENT.green,

  // career / essay / work -> orange
  career: ACCENT.orange,
  ポエム: ACCENT.orange,
  notes: ACCENT.orange,
  management: ACCENT.orange,
  productivity: ACCENT.orange,
  costreduction: ACCENT.orange,
  riskmanagement: ACCENT.orange,
  quality: ACCENT.orange,

  // security / governance -> red
  security: ACCENT.red,
  aigovernance: ACCENT.red,
};

/** Security wins regardless of tag order (defence should stand out). */
const SECURITY_TAGS = new Set(
  Object.keys(TAG_COLORS).filter((t) => TAG_COLORS[t] === ACCENT.red),
);

/** Generic tags only decide the color when nothing more specific matched. */
const GENERIC_TAGS = new Set(['notes']);

function decide(tags: string[]): { color: string; tag: string } | undefined {
  const sec = tags.find((t) => SECURITY_TAGS.has(t));
  if (sec) return { color: ACCENT.red, tag: sec };
  for (const t of tags) {
    if (!GENERIC_TAGS.has(t) && TAG_COLORS[t]) return { color: TAG_COLORS[t], tag: t };
  }
  for (const t of tags) {
    if (TAG_COLORS[t]) return { color: TAG_COLORS[t], tag: t };
  }
  return undefined;
}

export function accentFor(tags: string[]): string {
  return decide(tags)?.color ?? ACCENT.magenta;
}

/** Whether any tag decided the color (the import script warns on silent fallback). */
export function hasColorMatch(tags: string[]): boolean {
  return decide(tags) !== undefined;
}

export function primaryTag(tags: string[]): string {
  return decide(tags)?.tag ?? tags[0] ?? 'blog';
}

/**
 * Latin display labels for the vertical hero text (always English,
 * max ~8 chars so the full-bleed clipping never eats most of the word).
 */
const ROMAJI_LABELS: Record<string, string> = {
  ポエム: 'POEM',
};

/** Short forms for long Latin tags. */
const LATIN_ABBREV: Record<string, string> = {
  architecture: 'ARCH',
  typescript: 'TS',
  claudecode: 'CLAUDE',
  promptengineering: 'PROMPT',
  productivity: 'BOOST',
  tokenefficiency: 'TOKENS',
  documentation: 'DOCS',
  aigovernance: 'AI GOV',
  costreduction: 'COST',
  diagramming: 'DIAGRAM',
  sideproject: 'INDIE',
  opensource: 'OSS',
  riskmanagement: 'RISK',
};

/** Uppercase Latin label for the vertical hero text. */
export function romajiLabel(tags: string[]): string {
  const tag = primaryTag(tags);
  const jp = ROMAJI_LABELS[tag];
  if (jp) return jp;
  if (/^[\x20-\x7e]+$/.test(tag)) {
    const abbr = LATIN_ABBREV[tag];
    if (abbr) return abbr;
    const upper = tag.toUpperCase();
    return upper.length > 8 ? upper.slice(0, 8) : upper;
  }
  return 'LOG';
}
