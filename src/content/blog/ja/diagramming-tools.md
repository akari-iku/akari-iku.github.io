---
title: システム構成図・シーケンス図、結局どれ使う？人気ツールとエンジニアのリアルな使い分け徹底解説
description: システム構成図やシーケンス図を描くとき、「どのツールを使えばいいの？」 と悩んでいませんか？
date: '2025-11-04'
tags:
  - plantuml
  - drawio
  - 業務効率化
  - mermaid
  - 作図ツール
lang: ja
pair: a-cynics-guidethe-paradox-of-selecting-diagramming-tools-whi
source: zenn
accent: '#00B06B'
---

<!-- generated from articles/zenn/2025-11-04-diagramming-tools.md by scripts/import-articles.ts - do not edit -->

システム構成図やシーケンス図を描くとき、**「どのツールを使えばいいの？」** と悩んでいませんか？

draw.io、PlantUML、Mermaid、FigJam...選択肢が多すぎて、結局いつも同じツールに逃げてしまう。でも本当にそれでいいのか不安。

この記事では、**実際のエンジニアたちが使っているツール**と、その**選び方**を徹底的にまとめました。

▼ガッシーさんのツイート

<blockquote class="tweet-card">
<p class="tweet-card-text">みんなこういうの何で作ってる？</p>
<footer class="tweet-card-meta"><span>ガッシー｜Repsona @GussieTech</span><a href="https://x.com/GussieTech/status/1984195601471594908" target="_blank" rel="noopener">2025-10-31 · x.com →</a></footer>
</blockquote>


に集まった情報を参考に記載させてもらっています。デザイナー、プログラマー、エンジニア、経営層と様々な方がリアクションされていたので、みんな悩んでいるんだな…わかるぞ…と思い、しれっとまとめさせてもらいました。私も個人的にめっちゃ悩んでいたので。問題があれば削除しますのでご安心ください。

---

## 人気の図形描画・作図ツール徹底比較

### 1. draw.io (diagrams.net) - **最多回答の万能ツール**

完全無料で高機能、幅広い用途に対応できる**万能ツール**です。

<a class="link-card" href="https://www.drawio.com/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.drawio.com</span>
<span class="link-card-title">Security-first diagramming for teams | draw.io</span>
</span>
</a>



#### メリット
* **完全無料で使える**
* デスクトップ版とブラウザ版がある
* AWS、Firebase等の**アイコンライブラリが豊富**
* VSCodeプラグインで`drawio.png`形式で編集可能
* **直感的なGUI操作**
* システム構成図、E-R図など**汎用的な図表全般**に対応

#### デメリット
* 直線が微妙にカクッとなることがある
* 会社によってはインストールやオンライン利用に制約がある場合も（業務利用で環境構築が必要な場合、経費が発生することも）
* **Git差分管理がしにくい**（XMLが冗長）
* 起動が重い（既存ファイルがものによっては開くのに時間がかかる）

#### 主な用途
* **システム構成図**
* **E-R図**
* 汎用的な図表全般

#### 実際の声と雑感
「考えながら書くときはdraw.io」「上手く作れないときはdraw.io」という声が多数。**困ったときの最終手段**として活躍。やはり大体これ使えると何とかなる場面は多めです。

---

### 2. PlantUML - **コードベース派に人気**

テキストで図を記述する**コードベースツール**。Javaベース。PlantUML Web Serverでliveエディタも利用可能です。


<a class="link-card" href="https://plantuml.com/ja/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://plantuml.com/og-index" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">plantuml.com</span>
<span class="link-card-title">シンプルなテキストファイルで UML が書ける、オープンソースのツール</span>
</span>
</a>



#### メリット
* **Git管理がしやすい**（テキストベース）
* AIに読ませやすい・生成させやすい
* ロジックを間違わない安心感
* VSCodeやGitHub Copilotと相性が良い
* UML図全般をカバーできる
* **厳密なUML**（クラス図、コンポーネント図など）に対応

#### デメリット
* Javaベース（慣れが必要）
* **位置関係が大崩れする**可能性がある
* 情報量が増えると配置調整にキレそうになる
* Mermaidより構文が複雑

#### Tips
* `[hidden]`線を使って見えない位置で固定できる
* AIに説明してPlantUML図を出させて手動修正→AIに読ませる、を繰り返すと効率的

#### 主な用途
* **シーケンス図（最多）**
* E-R図（ERD）
* 単純な構成図
* 厳密なUML図

#### 実際の声と雑感
「plantでいけるときはそっち、無理臭ければdrawio」「頭の中で設計完了済みで線引くのが面倒なときはPlantUML」。役職や部門が絡むシーケンス図を書く場合、**スイムレーンが使える**ので個人的にも便利でした。

---

### 3. Mermaid - **AIとの親和性が高い**

GitHubのMarkdownや**Zenn**に埋め込み可能なテキストベースツール。JavaScriptベース。最近はAIでの生成精度も向上しています。ライブエディターもあります。


<a class="link-card" href="https://mermaid.js.org/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://mermaid.js.org/mermaid-logo-horizontal.svg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">mermaid.js.org</span>
<span class="link-card-title">Mermaid</span>
</span>
</a>


因みにライブエディタ―もある。

<a class="link-card" href="https://mermaid.live/edit#" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">mermaid.live</span>
<span class="link-card-title">Online FlowChart &amp; Diagrams Editor - Mermaid Live Editor</span>
</span>
</a>


#### メリット
* **Markdownで扱える**
* **AIに読ませやすい**（ChatGPT等のAIに投げやすい）
* Git管理しやすい
* Obsidianで使える
* **GitHub/Zennでネイティブ表示**
* **トークン効率が最高**（詳細は後述）

#### デメリット
* **位置関係の細かい指定が難しい**
* 複雑な図には不向き
* 線のクロス問題（自動配置エンジンの制約）

#### 主な用途
* **シーケンス図**
* **フローチャート**
* シンプルな構成図
* AIで生成・編集する図

#### 実際の声と雑感
「できる限りMermaid形式で作ってます！（AIに読ませるため）」。今後の**AI時代**を考えると、取り扱えるならコスパも良いのでおすすめです。

---

### 4. その他の人気ツール

| ツール名 | 特徴 | メリット | デメリット | 主な声と雑感 |
| :--- | :--- | :--- | :--- | :--- |
| **FigJam / Figma** | チームコラボレーションに強いホワイトボード系 | **リアルタイム共同編集が強力**、デザインツールとしての完成度が高い | 動作が重い、会社での利用制約がある場合も | 企業・フリーランス勢に人気。デザイナー組と意思疎通が図りやすい。 |
| **Miro** | ホワイトボード系、FigJamと似た立ち位置 | チームでの共同作業に最適、ブレストやワークショップに強い、テンプレートが豊富 | **有料プランが必要**な場面が多い、システム構成図には若干オーバースペック | オンラインホワイトボード、タスク管理も一緒にできるため、作図ツール以外の用途でも利用される。 |
| **Visio** | Microsoft製の図作成ツール | **企業での利用が多い**、Microsoft製品との親和性が高い、汎用性 | **有料**（Office契約が必要）、学習コストがやや高い | 日本企業での利用が多い。Office製品のプランと価格の組み合わせが複雑。 |

---

## 用途別の専門ツールと使い分け

### シーケンス図に強いツール

* **PlantUML**：**最多回答**。コードベースで記述しやすく、Git管理に最適。
* **Mermaid**：次点。GitHub/Zennでプレビュー・共有ができるため軍配が上がる声も。
* **Swagger**：API仕様書と併用するケースで使われる。API開発が多い組織で有効。

### E-R図に強いツール

* **draw.io**：視覚的に作りやすい。直感的な操作がわかりやすい。
* **PlantUML**：Git管理しやすいが、画面の情報量が増えてくると**配置調整が大変**になりがち。

### システム構成図に強いツール

* **draw.io**：**最多**。アイコンライブラリが豊富で視覚的に作りやすい。
* **icepanel.io**：システム構成図専用の特化ツール。開発アクション完了後の設計マージなどユニークな機能を持つ。

---

## ユニークなツールたち

| ツール名 | 特徴 | 実際の声・雑感 |
| :--- | :--- | :--- |
| **Excalidraw** | 手書き風の図が作れるツール。シンプルで使いやすい。 | ユーザ登録なしで速攻で使える。「とりあえず書き」には良さそう。 |
| **Eraser.io** | AI連携機能を持つ図作成ツール。 | Amazon、Microsoft、VISAなどが利用。**Markdownメモ機能**が好評。 |
| **Obsidian Canvas / Obsidian Mermaid** | ナレッジベースツールObsidianの機能。 | ナレッジベースと統合可能。Mermaid記法が使える。 |
| **Graphviz** | コードベースのグラフ生成ツール（dot言語）。 | プログラマティックに図を生成可能。大規模グラフに対応。使いこなすには修行が必要かも。 |
| **TikZ** | LaTeX用の図作成パッケージ。 | 学術論文やドキュメントに最適。R言語やPythonで画像出力が可能。 |
| **EdrawMax** | AI図作成機能付きのオールインワン・ドローイングソフトウェア。 | 15日間無料体験あり。継続利用可能な無料版は商用利用不可、透かしが入るなどの制限あり。 |
| **Svelte自作コンポーネント** | 完全カスタマイズの自作ツール。 | 完全自分好みにカスタマイズ可能。自力のあるエンジニア向け。 |
| **Xiaomi標準搭載メモアプリ** | スマホでサクッと書けるマインドマップ機能。 | 標準搭載なのはさすが。 |
| **Lucidchart** | AI需要にこたえたテンプレートが豊富。 | アメリカ中心サービスのため、日本語表示に一部癖がある場合も。 |

---

## 業務環境での現実：PowerPoint / Excel派

エンジニアの**理想と現実のギャップ**として、Officeツールを使う声も多数ありました。

### PowerPoint派の意見
* **非エンジニアの上長への説明・承認に必須**。
* 実質タダ（Office導入済み）、デスクトップアプリで軽快。
* 素早くページコピーして試行錯誤できる。
* 会社の**セキュリティポリシー**で専用ツールが使えない。
* ベクトル描画ツールとして扱うと非常に便利。

> 「日本の場合、非エンジニアの上長にプレゼンして承認得ないと始まらないので、専用ツール使うより、結局パワポとかエクセルの方が汎用性高いという結論に至りますね」

### Excel派の意見
* ツール縛りや環境により、**Excelを使わざるを得ない**場合も...（本音）

結局、多くの企業でOffice製品が導入されており、ドキュメント管理や承認フェーズを考えると、**汎用性の高さ**からOfficeツールが選ばれがちなのは「あるある」です。

---

## エンジニアのリアルな使い分けパターン

多くのエンジニアは、状況に応じて柔軟にツールを使い分けています。

| パターン | 使い分けの基準 | 採用ツール |
| :--- | :--- | :--- |
| **思考プロセス** | 考えながら書く vs 設計完了済み | draw.io (試行錯誤) vs PlantUML (線引き省略) |
| **ケースバイケース** | AI連携 vs 自由な配置 | Mermaid (AI連携/コスパ) vs draw.io (配置調整) |
| **対象読者** | 技術者 vs 顧客・非エンジニア | Mermaid/PlantUML (Git管理) vs draw.io/PowerPoint (視覚的) |
| **用途別** | 構成図 vs シーケンス図 vs E-R図 | draw.io vs Mermaid/Swagger vs PlantUML/draw.io |
| **環境制約** | 理想 vs 現実 | Mermaid (理想) vs draw.io (配置要求/環境制約) |
| **VSCode統合** | 開発環境一か所完結 | VSCodeプラグインのdraw.io |
| **時代の変遷** | 昔 vs 今 | OmniGraffle/Visio vs draw.io |

---

## 今後の話：AI時代における最適解

作図ツールは、もはや人間が手で描くためのものだけでなく、**AI（LLM）に指示して生成・編集させるためのインターフェース**にもなりつつあります。

コスパの話は以下でも一回やってるので気になる人はこちらも良ければ。


<a class="link-card" href="https://zenn.dev/akari1106/articles/18c0d7f205f8a7" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--4WraQnqq--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:%25E3%2580%2590%25E6%25A4%259C%25E8%25A8%25BC%25E3%2580%2591LLM%25E6%2599%2582%25E4%25BB%25A3%25E3%2581%25AB%25E6%259C%2580%25E9%2581%25A9%25E3%2581%25AA%25E4%25BD%259C%25E5%259B%25B3%25E3%2583%2584%25E3%2583%25BC%25E3%2583%25AB%25E3%2582%2592%25E3%2583%2588%25E3%2583%25BC%25E3%2582%25AF%25E3%2583%25B3%25E5%258A%25B9%25E7%258E%2587%25E3%2581%25A7%25E8%2580%2583%25E3%2581%2588%25E3%2582%258B%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E7%2581%25AF%25E9%2587%258C%2528akari%2529%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzkxZTcxYTI4M2EuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">【検証】LLM時代に最適な作図ツールをトークン効率で考える</span>
</span>
</a>



### LLM時代を見据えた最終結論

**結論：ひとつには絞れない**

考慮すべき要素が多すぎるため、**銀の弾丸は存在しません**。

* 描きやすさ（慣れ）
* 同僚・チームの環境
* 会社のルール・セキュリティポリシー
* **AIとの相性（トークン効率）**
* 図の規模・複雑さ
* 用途（内部ドキュメント vs 顧客向け資料）
* Git管理の必要性
* 非エンジニアへの説明の有無

---

### とはいえ、この2つは押さえておきたい

| ツール | 理由 |
| :--- | :--- |
| **draw.io** | **万能で汎用性が高い**。無料で高機能、学習コストも低く、困ったときの最終手段として機能する。 |
| **Mermaid** | **LLM時代の最適解**。トークン効率が圧倒的（**draw.ioの1/24**という検証結果も）。AI生成・編集、GitHub/Zennでの表示、Git差分管理に優れ、**AIワークフローとの親和性が高い**。 |

今後、AIが生成するコードやドキュメントの中で、Mermaidのようなトークン効率が良く、構造が単純な「**図の言語**」が標準化していく可能性は高いです。

今からAIにとって優しいデータ形式に慣れておくことは、きっとあなたの武器になるはずです。

あなたのプロジェクトで最適なパレットを選ぶ際の参考になれば幸いです。
