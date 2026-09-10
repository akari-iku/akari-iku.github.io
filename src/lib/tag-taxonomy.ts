/**
 * Canonical tag vocabulary and alias table.
 * Applied at the site boundary only (import script): source frontmatter and
 * the Zenn / dev.to exports keep their original tags untouched.
 *
 * Policy (.plan/tag-plan.md, settled 2026-09-05):
 * - Canonical tags are lowercase English, concatenated (Zenn-style: claudecode,
 *   promptengineering). Hyphens/dots only when the official product name has them.
 * - Japanese tags survive only as an untranslatable-word sanctuary: ポエム.
 * - Max 5 tags per article (authoring rule; the import script warns).
 * - New tags must be added to CANONICAL_TAGS (or aliased) before use.
 */

/** Alias -> canonical. Empty string means the tag is retired (dropped). */
const DROP = '';

export const TAG_ALIASES: Record<string, string> = {
  // AI / LLM
  生成ai: 'ai',
  machinelearning: 'ai', // too few articles to stand alone
  大規模言語モデル: 'llm', // localllm stays separate (local execution is its own axis)
  プロンプトエンジニアリング: 'promptengineering',
  prompt: 'promptengineering',
  aiagents: 'agents',
  エージェント: 'agents',

  // engineering concepts
  アーキテクチャ: 'architecture',
  設計: 'architecture',
  オープンソース: 'opensource',
  個人開発: 'sideproject',
  戦略: 'strategy',
  リスク管理: 'riskmanagement',
  品質管理: 'quality',
  レビュー: 'review',
  論文: 'papers',
  業務効率化: 'productivity',
  コスト削減: 'costreduction',
  tokenoptimization: 'tokenefficiency',

  // security / governance (two axes: security vs aigovernance)
  safety: 'security',
  governance: 'aigovernance',
  datasovereignty: 'aigovernance',
  techpolicy: 'aigovernance',
  ai規制: 'aigovernance',

  // diagramming (drawio / mermaid / plantuml stay as individual tools)
  diagrams: 'diagramming',
  作図ツール: 'diagramming',

  // notes (casual memo genre; ポエム stays separate as its own genre)
  備忘録: 'notes',
  tips: 'notes',
  discuss: 'notes',

  // retired tags
  技術選定: DROP, // applies to everything, articles reachable via ai/astro/typescript
  エンジニアリング: DROP, // zero information (every article qualifies)
  技術ブログ: DROP, // single use
};

/**
 * The canonical vocabulary. New article tags must come from this list;
 * register new words here (or in TAG_ALIASES) before using them.
 */
export const CANONICAL_TAGS = new Set<string>([
  // AI / LLM
  'ai',
  'llm',
  'localllm',
  'rag',
  'promptengineering',
  'agents',
  'aigovernance',
  'tokenefficiency',
  'dspy',
  'gemini',
  'llamacpp',
  'manus',
  'ollama',
  'qwen',
  // dev tools / platforms
  'claude',
  'claudecode',
  'akamai',
  'api',
  'astro',
  'aws',
  'base64',
  'cli',
  'cloudflare',
  'command',
  'dify',
  'gas',
  'github',
  'google',
  'json',
  'n8n',
  'npm',
  'opal',
  'python',
  'toon',
  'typescript',
  'vscode',
  'windows',
  'workers',
  // engineering concepts
  'architecture',
  'devops',
  'documentation',
  'opensource',
  'papers',
  'performance',
  'quality',
  'review',
  'riskmanagement',
  'security',
  'strategy',
  'translation',
  // web / making
  'diagramming',
  'drawio',
  'frontend',
  'mermaid',
  'nocode',
  'plantuml',
  'seo',
  'sideproject',
  'tutorial',
  'uiux',
  'webapp',
  'webdev',
  'zenn',
  // career / essay / work
  'career',
  'costreduction',
  'developers',
  'management',
  'notes',
  'product',
  'productivity',
  // untranslatable-word sanctuary (JA-only genre, no EN counterpart)
  'ポエム',
]);

/** Apply aliases, drop retired tags, and dedupe while keeping author order. */
export function canonicalizeTags(tags: string[]): string[] {
  const out: string[] = [];
  for (const tag of tags) {
    const canonical = TAG_ALIASES[tag] ?? tag;
    if (canonical === DROP) continue;
    if (!out.includes(canonical)) out.push(canonical);
  }
  return out;
}
