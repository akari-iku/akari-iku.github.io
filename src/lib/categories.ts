/**
 * Article categories: one per article, fixed vocabulary of seven
 * (six coloured topics plus the uncoloured essay bin).
 * The category alone decides the accent colour, the card badge, the hero
 * breadcrumb and the vertical hero text. Tags no longer decide colour.
 *
 * Assignment lives in scripts/categories.json (slug -> key), applied by the
 * import script; an unregistered slug falls back to guessCategory(tags) with
 * a WARN. Policy: .plan/category-plan.md (settled 2026-10-24).
 */
import { ACCENT } from './tag-colors';

export const CATEGORY_KEYS = [
  'ai',
  'localllm',
  'infra',
  'tools',
  'web',
  'security',
  'essay',
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export interface Category {
  key: CategoryKey;
  /** Display label per site language. */
  label: { ja: string; en: string };
  /** Uppercase Latin text for the vertical hero / OGP label (<= 8 chars). */
  vertical: string;
  color: string;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  ai: { key: 'ai', label: { ja: 'AI', en: 'AI' }, vertical: 'AI', color: ACCENT.magenta },
  localllm: {
    key: 'localllm',
    label: { ja: 'ローカルLLM', en: 'Local LLM' },
    vertical: 'LOCAL',
    color: ACCENT.yellow,
  },
  infra: {
    key: 'infra',
    label: { ja: 'Cloudflare・インフラ', en: 'Infra' },
    vertical: 'INFRA',
    color: ACCENT.orange,
  },
  tools: {
    key: 'tools',
    label: { ja: 'ツール', en: 'Tools' },
    vertical: 'TOOLS',
    color: ACCENT.cyan,
  },
  web: { key: 'web', label: { ja: '開発', en: 'Dev' }, vertical: 'DEV', color: ACCENT.green },
  security: {
    key: 'security',
    label: { ja: 'セキュリティ', en: 'Security' },
    vertical: 'SECURITY',
    color: ACCENT.red,
  },
  essay: { key: 'essay', label: { ja: 'ポエム', en: 'Essay' }, vertical: 'POEM', color: ACCENT.paper },
};

export function isCategoryKey(value: unknown): value is CategoryKey {
  return typeof value === 'string' && (CATEGORY_KEYS as readonly string[]).includes(value);
}

export function categoryLabel(key: CategoryKey, lang: 'ja' | 'en'): string {
  return CATEGORIES[key].label[lang];
}

/**
 * Tag -> category hint, used only as the fallback for slugs missing from
 * categories.json. Security tags win regardless of order; generic AI tags
 * (ai / llm) decide only when nothing more specific matched.
 */
const TAG_CATEGORY: Record<string, CategoryKey> = {
  // security / governance
  security: 'security',
  aigovernance: 'security',
  riskmanagement: 'security',
  // local execution
  localllm: 'localllm',
  ollama: 'localllm',
  llamacpp: 'localllm',
  qwen: 'localllm',
  // Cloudflare / platforms
  cloudflare: 'infra',
  workers: 'infra',
  aws: 'infra',
  akamai: 'infra',
  strategy: 'infra',
  // dev tools
  claude: 'tools',
  claudecode: 'tools',
  cli: 'tools',
  command: 'tools',
  vscode: 'tools',
  windows: 'tools',
  github: 'tools',
  npm: 'tools',
  gas: 'tools',
  python: 'tools',
  base64: 'tools',
  google: 'tools',
  opal: 'tools',
  n8n: 'tools',
  dify: 'tools',
  nocode: 'tools',
  devops: 'tools',
  api: 'tools',
  // web / making
  astro: 'web',
  typescript: 'web',
  frontend: 'web',
  webdev: 'web',
  webapp: 'web',
  seo: 'web',
  sideproject: 'web',
  uiux: 'web',
  zenn: 'web',
  mermaid: 'web',
  plantuml: 'web',
  drawio: 'web',
  diagramming: 'web',
  // essays (genre tag doubles as the category hint)
  ポエム: 'essay',
  // AI general
  rag: 'ai',
  promptengineering: 'ai',
  agents: 'ai',
  dspy: 'ai',
  gemini: 'ai',
  manus: 'ai',
  tokenefficiency: 'ai',
  toon: 'ai',
  json: 'ai',
  ai: 'ai',
  llm: 'ai',
};

const GENERIC_TAGS = new Set(['ai', 'llm']);

/** Best-effort category from tags, for slugs not yet registered in categories.json. */
export function guessCategory(tags: string[]): CategoryKey {
  if (tags.some((t) => TAG_CATEGORY[t] === 'security')) return 'security';
  for (const t of tags) {
    if (!GENERIC_TAGS.has(t) && TAG_CATEGORY[t]) return TAG_CATEGORY[t];
  }
  for (const t of tags) {
    if (TAG_CATEGORY[t]) return TAG_CATEGORY[t];
  }
  return 'ai';
}
