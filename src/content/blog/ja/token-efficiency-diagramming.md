---
title: 【検証】LLM時代に最適な作図ツールをトークン効率で考える
description: >-
  ドキュメントに図を描く時、みんな正直どれ使ってる！？ Mermaid？ PlantUML？ それとも結局 draw.ioを起動してる？
  なあ、正直に言ってくれ！教えてくれ！！
date: '2025-10-22'
tags:
  - mermaid
  - plantuml
  - llm
  - drawio
  - 作図ツール
lang: ja
pair: analyzing-the-best-diagramming-tools-for-the-llm-age-based-o
source: zenn
accent: '#00B06B'
---

<!-- generated from articles/zenn/2025-10-22-token-efficiency-diagramming.md by scripts/import-articles.ts - do not edit -->

## みんな何使ってる！？LLM時代の作図ツール戦争

### 僕らの共通のフラストレーション

ドキュメントに図を描く時、みんな正直どれ使ってる！？ Mermaid？ PlantUML？ それとも結局 draw.ioを起動してる？ **なあ、正直に言ってくれ！教えてくれ！！**
あ、使い分けつつやってる、そっか…。
で、話は終わりません。エンジニア(仮)たるもの。わからんけど、そういう気持ち大事なのかなって。

開発者が抱える共通の課題は、常に **「手軽さ」**と**「表現の自由度」** のトレードオフです。
良い楽をしたい、ですよね…。

- **Mermaid.js:** 手軽さは神。GitHubやZennでも使える。でも、複雑になると線がクロスする問題、ノード配置の自由度の低さにイライラしないでしょうか？私の気が短いだけですかね。
- **draw.io (XML):** 機能は最強。理想の図が描ける。でも、Gitに入れたら差分が地獄。何より起動が重い…。PCのスペックとかも多少はあると思いますが、そもそもの既存ファイルの場合、ものによっては、普通にトイレ行って戻って来てもまだ開くの頑張ってる…とかないです？

実際、Zennコミュニティでも、Mermaidで長い図表を書いた際に「テキストの折り返しやノードの位置調整ができない」といった、**レイアウトの限界**に関するお話が上がっています。

<a class="link-card" href="https://zenn.dev/yuki_2021/articles/5368532831f6ab" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--AG7DZzA---/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:%25E9%2595%25B7%25E3%2581%2599%25E3%2581%258E%25E3%2582%258BMermaid%25E3%2581%25AE%25E5%259B%25B3%25E8%25A1%25A8%25E3%2582%2592%25E4%25BF%25AE%25E6%25AD%25A3%25E3%2581%2599%25E3%2582%258B%25E6%2596%25B9%25E6%25B3%2595%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E3%2582%2586%25E3%2581%258D%25E3%2581%25AB%25E3%2583%25BC%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzBjMjM1Zjc1OWEuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">長すぎるMermaidの図表を修正する方法</span>
</span>
</a>


私もMermaidは好きですが、特有のあの **「線のクロス」** がマジで嫌で、何度も他のツールに迷走しつつ生きてます。
「線のクロス」って何を言ってるんだってなるかもなので、、、
▼線のクロスサンプル画像
![](https://storage.googleapis.com/zenn-user-upload/8c81dd8e6449-20251022.png)

こういうのです。意図的に複雑にしていますし、まあって感じなんですけどね。
コードで反映にしようかなって最初コードで書いてたんですけど、私へのダメージがありましたので、画像で失礼します。
でもこうならざるを得ないって結構あるあるなんじゃないかなあ、書き方の工夫で補える部分もあるとは思いますが全体図とか、アーキテクチャが複雑になると避けにくいよなあ、と。

### LLMに「優しい」図の言語を考えたい

しかし、まあ昨今のAIというかLLMを考えて少し立ち止まる。
**この時代、本当に見るべきは「見た目の美しさ」とか「人間都合の使い勝手が良い」だけじゃないよな**と。

作図ツールは、もはや**人間が手で描くためのもの**だけでなくなってますし。**AI（LLM）に指示して生成・編集させるためのインターフェース**にもなってるんだよな、と。
AIワークフロー組んでやってもらう、とかも出来るでしょうし(これまだ実験してないけど多分出来るでしょっていう)

この視点に立つと、ツールの良し悪しを決める基準が変わります。大事なのは**見栄えの良さ**
よりも、**LLMにとっての『優しさ』、すなわち『効率性』** への意識も必要だよな、改めてと思った次第です。これからの時代考えるとどうしてもね。

本記事では、このLLM時代にどんだけ優秀なものが出ても選定基準の1つである**トークン効率**というデータで、最適な作図ツールを探っていくことにします。

---

## 1. AI時代のコストとトークン効率

### 1-1. JSON/XMLの「冗長性」がLLMの敵である

なぜ、直感的に使いやすいExcalidraw（JSON）やdraw.io（XML）は、LLM時代に不利なのか？をまず考える。

結論から言えば、その**冗長性**です。
人間にとっては直感的なGUI操作でも、裏側のデータは非常に複雑で、無駄な情報が多い。リッチになるとそうなるのもわかる。

- **XML（draw.ioなど）:** 図の見た目に関係ないメタデータが膨大。LLMがこれを解釈・編集するのは効率が悪すぎます。やれなくはないんですけどね、全然。
- **JSON（Excalidrawなど）:** 要素の位置、サイズ、スタイルといった詳細な情報が大量に定義され、**トークンを爆食い**します。

### 1-2. データで見てみる作図形式別「推定トークン消費量」

単純なシーケンス図を各形式で表現した場合の推定トークン数を比較しました。これはそのまま**AI処理のコストと速度に直結**しますしね。

| ツール（データ形式） | 推定トークン数 | LLM親和性 |
| :--- | :--- | :--- |
| **Mermaid.js** (Markdown-like) | **50** | 🥇 最高 |
| **PlantUML** (Markdown-like) | **80** | 🥈 高い |
| **Excalidraw** (JSON) | 500 | ❌ 低い |
| **draw.io** (XML) | 1200 | ❌ 最低 |

あくまでも単純なシーケンス図での比較なので、トークン数は推定ってところですが結構露骨です。

**わかること:**
XML/JSONはMarkdown-like形式に比べ、最大$24$倍以上のトークンを消費します。この圧倒的な効率差が、LLM時代の作図ツールの優劣を決定づけます。

実際、今年の頭のLLM研究の発表においても、Knowledge Graph（MermaidやPlantUMLのような構造化）を活用したRAG（検索拡張生成）システムは、従来のテキストベースのRAGに比べて**トークン使用量を大幅に削減（例：80%減）できる**ことが示されています。


<a class="link-card" href="https://aclanthology.org/2025.genaik-1.6/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://aclanthology.org/thumb/2025.genaik-1.6.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">aclanthology.org</span>
<span class="link-card-title">GraphRAG: Leveraging Graph-Based Efficiency to Minimize Hallucinations in LLM-Driven RAG for Finance Data</span>
</span>
</a>


この研究は、**「情報を構造化された簡潔な形式でLLMに与える」**ことが、どれだけ**効率とコスト改善**に寄与するかを裏付けています。

---

## 2. 「効率」 vs. 「表現力」

### 2-1. LLM親和性 vs. 表現の自由度

結局、作図ツールは **「LLM親和性（効率）」** と **「表現の自由度（見た目の美しさ）」** の厳しい二者択一を迫られます。

> ![](https://storage.googleapis.com/zenn-user-upload/472a39f3f305-20251022.png)

- **Mermaid/PlantUML（テキストベース）:** **生成の容易さ**や**トークン効率**で高得点。
- **Excalidraw/draw.io（構造化データ）:** **表現の自由度**では圧倒的。

両者のテキストベースツールにも違いがありますので、一概にこれが最強で安牌だとはならないことは理解しています。MermaidはJavaScriptベースでウェブブラウザでの利用が容易ですが、PlantUMLはUML図全般をカバーし、より複雑な図表を作成可能ですし。

<a class="link-card" href="https://ones.com/ja/blog/knowledge/mermaid-plantuml-comparison/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://ones.com/ja/blog/wp-content/uploads/2025/04/JA-Blog.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">ones.com</span>
<span class="link-card-title">MermaidとPlantUMLの対比：図表作成ツールの王者対決！どちらが開発効率を上げるか</span>
</span>
</a>


つまり、 **「迅速な情報共有が必要な場合はMermaidが、詳細なUML図が必要な場合はPlantUMLが適している」** という使い分けがZenn内でも言及されています。

<a class="link-card" href="https://zenn.dev/manase/scraps/415300a7a0631f" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://static.zenn.studio/user-upload/avatar/e02c9a9f0e.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">Mermaid記法とPlantUMLを比較する、どちらを採用すべきか？</span>
</span>
</a>

というか、GitHub上で、プレビュー・共有ができるので、Mermaid記法に軍配が上がりそう。ってのめっちゃわかります。私もそう思う。だがしかし、でもでもだってをしてしまう私もいる。

### 2-2. Mermaidの「線のクロス問題」はトレードオフ

私が最も個人的に不満に思っていたMermaidの欠点（線のクロス問題）を再評価します。
Mermaidのレイアウトの自由度が低いのは、Mermaidが　**自動配置エンジン**を採用しているから。

- **メリット:** 人間もLLMも、ノード間の関係性（エッジ）だけを記述すれば、自動で整頓してくれる。
- **デメリット:** 人間が理想とする「線がクロスしない」などの細かい意図を反映しにくい。

**結論:** Mermaidは、LLMにとって最も理解しやすい 「構造」を優先するために「見た目の美しさ」の一部を意図的に放棄しています。線のクロスは、**AIによる効率的なドキュメント管理**という大きなメリットと引き換えに、受け入れるべき**最小のトレードオフ**なのかな、というのが個人的な落としどころです。
技術者同士だと、見慣れたもんだけど、顧客資料への理解の為で、全体図欲しいとか言われることもあるのでそうなると、いけるか…いけるのか？！って定期的に思います。
対非エンジニアだと大体「うわ」とかのリアクションが新鮮まであります。
「システムってこんなに複雑なんだね～」とか柔らかい感想？をくれる非エンジニアのえらい人は、優しさを感じます、勝手に。
そのままの柔らかい人でいてくれ…と思ったり。

---

## 3. LLM時代における作図ツールの最終結論

まとめると、LLM時代に最適な作図ツールは、目的によって明確に使い分ける、にはなってしまう。
適材適所のいつものですね。

| ランク | ツール | 推奨用途 | LLM/Git連携 | 妥協点 |
| :--- | :--- | :--- | :--- | :--- |
| **ベスト** | **Mermaid.js** | ドキュメント、README、Wikiなど**AIによる自動更新**が最優先の場面。 | **最高**（軽量、Zenn/GitHubネイティブ） | 線のクロス、ノード配置の制限 |
| **次点** | **PlantUML** | 厳密な**UML（クラス図、コンポーネント図など）** が必要な場面。 | **高い**（テキストベース） | Mermaidより構文が複雑 |
| **視覚重視** | **Excalidraw/draw.io** | ブレスト、UIモック、**視覚的な訴求力**が最優先の場面。 | **最低**（JSON/XMLが冗長） | AI生成/編集、Git差分管理に不向き |

今後、AIが生成するコードやドキュメントの中で、Mermaidのような **トークン効率が良く、構造が単純な「図の言語」** が標準化していくのは必然です。というか多分そうなる。かもしれない、の域を出ませんが。世迷言かもしれないです。
各主流のAI達(ChatGPT、Gemini、Claude)に「それぞれの記法で出力してほしい」のような指示してもそこそこの打率のものを返してくれます。やっぱり完全に毎回OK!っていうものは出してくれませんが。
時折生成を頑張ってくれている間に重くて固まってるとか、それこそ書きたいものによって色々あったりしますけど。
LLMモデルの学習元の開示は基本されないので断定は出来ませんが、基本的にはやれている事を確認済みなので、めっちゃ自分で書くのは嫌だなって感じの複雑なやつはベースとして作ってもらって微修正しよ、くらいのは全然もう出来ますし最近そういう使い方をしてます。
※複雑アーキテクチャ系はしんどいのは変わらなかったけど！！

今からAIにとっての優しいデータ形式に慣れておくこと、知っておくことは良いのかもな、と思います。
あなたのプロジェクトで最適なパレットを選ぶ際の参考になれば幸いです。
