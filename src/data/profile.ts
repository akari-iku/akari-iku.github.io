/**
 * Profile / career data for About and Career pages.
 * Public-granularity only: no real name, no company names.
 * Source of truth for the tanaoroshi lives outside the repo (.plan/, gitignored).
 */

export interface Fact {
  label: string;
  value: string;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface CareerEntry {
  period: string;
  /** Main verb first; the verbs are parallel threads, not chapters. */
  verbs: string[];
  /** English era titles are adaptations, not translations (see voice guide). */
  verbsEn: string[];
  summary: string;
  summaryEn: string;
  details: string[];
  detailsEn: string[];
  tags: string[];
  current?: boolean;
}

export const profile = {
  name: '灯里',
  romaji: 'akari',
  /** The six verbs — the actual catch copy of this profile. */
  verbs: ['見つける', '翻訳する', '設計する', '止める', '立てる', '届ける'],
  verbsEn: ['Detect', 'Translate', 'Design', 'Guard', 'Build', 'Deliver'],
  role: '組織がAIとテクノロジーを安全に・適切に・効果的に使えるようにする、全体設計の人。',
  roleEn:
    'The architect who helps organisations use AI and technology safely, properly, and effectively.',
  bio: 'デジタルマーケティング、CRM、セキュリティ運用、新規事業開発を経て、現在は AI/DX 領域で事業推進を支援しています。技術のことは日本語と英語の両方で発信中。訳しているのは言語の間だけではなく、職種と職種の間も。',
  /** Paragraphs. British spelling, no em dashes (voice guide). */
  bioEn: [
    'Greetings from the island nation of Japan.',
    "My route here wandered through digital marketing, CRM, security operations, and new-business development. These days I help organisations get their AI and DX initiatives moving. I write about all of it, in two languages. Languages aren't the only thing I translate between: most days it's professions.",
    'My job title has a population of one (the company and I are still negotiating what it means).',
  ],
  facts: [
    { label: '拠点', value: '日本 / 東京近郊' },
    { label: '名義', value: 'AIエンジニア（実務はもう少し広い）' },
    {
      label: '領域',
      value: 'BI / AI / DX / AX — 分析から変革まで',
    },
    { label: '発信', value: 'Zenn（日本語）/ Dev.to（英語）' },
  ] satisfies Fact[],
  factsEn: [
    { label: 'Base', value: 'Japan (Greater Tokyo)' },
    { label: 'Title', value: 'AI engineer (the work runs wider)' },
    { label: 'Fields', value: 'BI / AI / DX / AX: from analytics to transformation' },
    { label: 'Writing', value: 'Zenn (Japanese) / Dev.to (English)' },
  ] satisfies Fact[],
  links: [
    { label: 'GitHub', url: 'https://github.com/akari-iku' },
    { label: 'Zenn', url: 'https://zenn.dev/akari1106' },
    { label: 'Dev.to', url: 'https://dev.to/akari_iku' },
    { label: 'X', url: 'https://x.com/akari_iku' },
  ] satisfies ProfileLink[],
};

/** Newest first. Verb titles come from the tanaoroshi framework. */
export const career: CareerEntry[] = [
  {
    period: '2025 —',
    verbs: ['全部同時にやる'],
    verbsEn: ['All of it, at once'],
    summary: 'AI導入の全体設計・セキュリティ・ガバナンス・研修設計。',
    summaryEn: 'End-to-end AI adoption: architecture, security, governance, and training design.',
    details: [
      '現在のメインは AI 研修 — 研修設計から分析まで',
      '技術的実現性と事業採算性の両面評価で経営判断を支援',
      'AIチャットボットのワークフロー設計・デモ開発',
      '非エンジニアにも届くAI学習資料の企画・制作',
      'Claude Code の組織活用に向けた依存パッケージのサプライチェーン対策（導入スクリプト・環境/実行チェック・Windows環境トラブルシュート）',
    ],
    detailsEn: [
      'AI training is the current main thread, from programme design through to analysis',
      'Supporting management decisions with dual assessments: technical feasibility and business viability',
      'Workflow design and demo development for AI chatbots',
      'Planning and producing AI learning materials that actually reach non-engineers',
      'Supply-chain hardening for organisational Claude Code adoption (install scripts, environment and runtime checks, Windows troubleshooting)',
    ],
    tags: ['ai', 'security', 'governance', 'enablement'],
    current: true,
  },
  {
    period: '2024 — 2025',
    verbs: ['変革する', '守る'],
    verbsEn: ['Transform', 'Guard'],
    summary:
      'MA設計・運用とISMSの体系知識が統合され、技術実装と経営判断の両方に足が乗った時代。',
    summaryEn:
      'The era when marketing-automation practice and ISMS systems knowledge finally merged, leaving me standing on both technical implementation and management judgement.',
    details: [
      'Salesforce Sales Cloud の導入・運用設計を担当（要件定義から単独で）',
      'RAG基盤構築、プロンプト設計の体系化（論理圧縮+自然言語のハイブリッド）',
      'AIガバナンス設計。不適切な技術投資2件を未然に防止',
    ],
    detailsEn: [
      'Introduced Salesforce Sales Cloud and designed its day-to-day operation (from requirements, solo)',
      'Built RAG infrastructure; systematised prompt design (a hybrid of logical compression and natural language)',
      'Designed AI governance; stopped two ill-advised technology investments before they happened',
    ],
    tags: ['salesforce', 'isms', 'rag', 'ai-governance'],
  },
  {
    period: '2020 — 2024',
    verbs: ['回す'],
    verbsEn: ['Run'],
    summary:
      '月間最大1,000万規模の広告運用と分析。作ったものを数字で測って改善するサイクルの身体化。',
    summaryEn:
      'Ad operations and analytics at up to ¥10 million a month. This is where "measure what you build, then improve it" stopped being theory and became muscle memory.',
    details: [
      '官公庁・教育機関を含む大規模案件のハンドリング',
      'Tableau・専門ツールでの分析と戦略提案',
      'レポーティング効率化テンプレートの作成と現場展開',
    ],
    detailsEn: [
      'Handled large accounts, including government and education',
      'Analysis and strategy proposals with Tableau and specialised tools',
      'Created reporting-efficiency templates and rolled them out to the front line',
    ],
    tags: ['ads', 'tableau', 'bi'],
  },
  {
    period: '2019 — 2020',
    verbs: ['守る'],
    verbsEn: ['Guard'],
    summary:
      '金融機関向けシステムのセキュリティ運用。リスク検知と緊急対応の原体験。',
    summaryEn:
      'Security operations for financial-sector systems. My formative experience of risk detection and emergency response.',
    details: ['不正アクセス対策・データ監視・ログ収集'],
    detailsEn: ['Intrusion countermeasures, data monitoring, log collection'],
    tags: ['security', 'finance', 'linux'],
  },
  {
    period: '2017 — 2019',
    verbs: ['仕組み化する', '作る'],
    verbsEn: ['Systematise', 'Make'],
    summary: '自分が学んだことを、他人が使える形に変換する能力の開花。',
    summaryEn:
      'When I discovered I could convert what I had learned into something other people could actually use.',
    details: [
      '業務効率化ツールを独力開発',
      '社内wikiをエンジン選定から運用まで立ち上げ',
      '新人研修カリキュラムの作成・講師（育成対象30人以上）',
    ],
    detailsEn: [
      'Built an efficiency tool solo',
      'Launched the company wiki, from engine selection to day-to-day operations',
      'Designed and taught the new-hire training curriculum (30+ trainees)',
    ],
    tags: ['html/js', 'wiki', 'training'],
  },
  {
    period: '2016 — 2017',
    verbs: ['作る'],
    verbsEn: ['Make'],
    summary: 'ゼロからのWebサイト制作。何もないところに構造を立てる原体験。',
    summaryEn:
      'Building websites from zero. My first experience of raising structure where there was none.',
    details: ['SEO・Webディレクション、WordPressでのサイト新規構築'],
    detailsEn: ['SEO, web direction, and new site builds on WordPress'],
    tags: ['wordpress', 'seo', 'webdesign'],
  },
  {
    period: '2013 — 2015',
    verbs: ['学ぶ'],
    verbsEn: ['Learn'],
    summary: '千歳科学技術大学で情報工学を学ぶ。家庭の都合で中退 — ここが技術の原点。',
    summaryEn:
      'Studied information engineering at Chitose Institute of Science and Technology; left before graduating, for family reasons. This is where the origin story starts.',
    details: [
      'Eclipse / C / Objective-C / Java / Unity — プログラミングの基礎基本はここで',
      '3年前期で中退。進む予定だった研究室は教育系 — この伏線は後の新人研修づくりと AI 学習資料で回収される',
      '※ 在学した学科は改組され、大学は公立化した。母校は名前が二回変わったが、学んだことは変わらない',
    ],
    detailsEn: [
      'Eclipse, C, Objective-C, Java, Unity: the fundamentals were laid here',
      'Left in the first half of my third year, just before joining an education-focused lab. That plot thread gets picked up later (see: training curricula and AI learning materials)',
      'The department has since been reorganised and the university went public: my alma mater has renamed itself twice, which I choose not to take personally',
    ],
    tags: ['c', 'java', 'unity'],
  },
];

export interface SkillGroup {
  label: string;
  labelEn: string;
  note?: string;
  noteEn?: string;
  items: string[];
  /** Only when the English chips differ from `items`. */
  itemsEn?: string[];
}

// No per-group hedging notes: the "hand of cards" caption on the Skills
// section carries that framing for every group at once.
export const skillGroups: SkillGroup[] = [
  {
    label: 'AI / エージェント',
    labelEn: 'AI / Agents',
    items: ['ChatGPT / GPTs', 'Claude / Claude Code', 'Gemini', 'Copilot Studio', 'Dify'],
  },
  {
    label: 'セキュリティ / ガバナンス',
    labelEn: 'Security / Governance',
    items: ['ISMS (ISO/IEC 27001)', 'AIガバナンス', 'ライセンス最適化'],
    itemsEn: ['ISMS (ISO/IEC 27001)', 'AI governance', 'Licence optimisation'],
  },
  {
    label: 'BI / データ',
    labelEn: 'BI / Data',
    items: ['Tableau', 'Looker Studio', 'Power BI', 'GA4'],
  },
  {
    label: 'CRM / マーケティング',
    labelEn: 'CRM / Marketing',
    note: 'オンラインもオフラインも',
    noteEn: 'online and offline alike',
    items: [
      'Salesforce MA / SFA',
      'SEO / AEO',
      '広告運用: Google / Yahoo! / Bing / Meta / LINE',
      'オフラインマーケ（紙媒体 / PR配信）',
    ],
    itemsEn: [
      'Salesforce MA / SFA',
      'SEO / AEO',
      'Ad ops: Google / Yahoo! / Bing / Meta / LINE',
      'Offline marketing (print / press releases)',
    ],
  },
  {
    label: '開発',
    labelEn: 'Development',
    items: [
      'HTML / CSS',
      'JavaScript',
      'GAS',
      'Python',
      'PHP',
      'Linux',
      'C / Objective-C / Java（大学時代）',
      'Unity / C#（大学〜趣味で継続）',
    ],
    itemsEn: [
      'HTML / CSS',
      'JavaScript',
      'GAS',
      'Python',
      'PHP',
      'Linux',
      'C / Objective-C / Java (university era)',
      'Unity / C# (from university into hobby)',
    ],
  },
  {
    label: 'デザイン / 3DCG',
    labelEn: 'Design / 3DCG',
    items: ['Illustrator / Photoshop', 'Blender', 'Metasequoia', '印刷・映像の現場知識'],
    itemsEn: [
      'Illustrator / Photoshop',
      'Blender',
      'Metasequoia',
      'Hands-on knowledge of print and video production',
    ],
  },
];

// Numbers rot (views/likes drift the moment they're written down), so
// highlights carry only evergreen facts.
export const highlights: Fact[] = [
  { label: 'Talk', value: '「TECH BATON in 東京」（Findy主催、2026-04）に登壇' },
];

export const highlightsEn: Fact[] = [
  { label: 'Talk', value: 'Speaker at TECH BATON in Tokyo (hosted by Findy, April 2026)' },
];
