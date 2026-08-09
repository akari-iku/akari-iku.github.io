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
  machinelearning: ACCENT.magenta,
  大規模言語モデル: ACCENT.magenta,
  生成ai: ACCENT.magenta,
  promptengineering: ACCENT.magenta,
  プロンプトエンジニアリング: ACCENT.magenta,
  prompt: ACCENT.magenta,
  dspy: ACCENT.magenta,
  agents: ACCENT.magenta,
  aiagents: ACCENT.magenta,
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
  tokenoptimization: ACCENT.cyan,
  base64: ACCENT.cyan,
  architecture: ACCENT.cyan,
  アーキテクチャ: ACCENT.cyan,
  設計: ACCENT.cyan,
  技術選定: ACCENT.cyan,
  エンジニアリング: ACCENT.cyan,
  オープンソース: ACCENT.cyan,
  documentation: ACCENT.cyan,

  // web / making / visualizing -> green
  mermaid: ACCENT.green,
  plantuml: ACCENT.green,
  drawio: ACCENT.green,
  作図ツール: ACCENT.green,
  diagrams: ACCENT.green,
  webapp: ACCENT.green,
  astro: ACCENT.green,
  seo: ACCENT.green,
  個人開発: ACCENT.green,
  frontend: ACCENT.green,
  uiux: ACCENT.green,
  nocode: ACCENT.green,
  zenn: ACCENT.green,
  技術ブログ: ACCENT.green,
  tutorial: ACCENT.green,
  tips: ACCENT.green,
  レビュー: ACCENT.green,

  // career / essay / policy -> orange
  career: ACCENT.orange,
  ポエム: ACCENT.orange,
  備忘録: ACCENT.orange,
  discuss: ACCENT.orange,
  management: ACCENT.orange,
  業務効率化: ACCENT.orange,
  コスト削減: ACCENT.orange,
  costreduction: ACCENT.orange,
  techpolicy: ACCENT.orange,
  リスク管理: ACCENT.orange,
  品質管理: ACCENT.orange,

  // security -> red
  security: ACCENT.red,
  safety: ACCENT.red,
  ai規制: ACCENT.red,
  aigovernance: ACCENT.red,
  datasovereignty: ACCENT.red,
};

/** Security wins regardless of tag order (defence should stand out). */
const SECURITY_TAGS = new Set(
  Object.keys(TAG_COLORS).filter((t) => TAG_COLORS[t] === ACCENT.red),
);

/** Generic tags only decide the color when nothing more specific matched. */
const GENERIC_TAGS = new Set(['備忘録']);

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
  アーキテクチャ: 'ARCHI',
  作図ツール: 'DIAGRAM',
  備忘録: 'MEMO',
  ポエム: 'POEM',
  プロンプトエンジニアリング: 'PROMPT',
  大規模言語モデル: 'LLM',
  技術ブログ: 'BLOG',
  個人開発: 'INDIE',
  技術選定: 'SELECT',
  設計: 'DESIGN',
  論文: 'PAPER',
  生成ai: 'GENAI',
  ai規制: 'AI LAW',
  品質管理: 'QUALITY',
  リスク管理: 'RISK',
  業務効率化: 'KAIZEN',
  コスト削減: 'COST',
  エンジニアリング: 'ENGINEER',
  オープンソース: 'OSS',
  レビュー: 'REVIEW',
};

/** Short forms for long Latin tags. */
const LATIN_ABBREV: Record<string, string> = {
  architecture: 'ARCH',
  typescript: 'TS',
  claudecode: 'CLAUDE',
  promptengineering: 'PROMPT',
  machinelearning: 'ML',
  productivity: 'BOOST',
  tokenefficiency: 'TOKENS',
  tokenoptimization: 'TOKENS',
  documentation: 'DOCS',
  datasovereignty: 'DATA',
  aigovernance: 'AI GOV',
  costreduction: 'COST',
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
