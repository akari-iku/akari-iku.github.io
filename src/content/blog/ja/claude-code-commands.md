---
title: 情報の洪水に溺れかけたのでClaude Codeのコマンドを整理した、隠しコマンドもあるって何(2026/2)
description: Claude Codeには公式ドキュメントに載っていない機能や、知らないとまず使わないコマンドが結構あります。
date: '2026-02-12'
tags:
  - ai
  - cli
  - 備忘録
  - productivity
  - claude
lang: ja
pair: ive-organised-the-claude-code-commands-including-some-hidden
source: zenn
accent: '#E5007F'
---

<!-- generated from articles/zenn/2026-02-12-claude-code-commands.md by scripts/import-articles.ts - do not edit -->

## はじめに

Claude Codeには公式ドキュメントに載っていない機能や、知らないとまず使わないコマンドが結構あります。
というか多すぎて公式ドキュメント読み込むとか追うのマジで大変で、最近ひいひい言ってます。

この記事では、基本コマンドから最近追加された新機能、Agents運用の勘所まで、実際に使いながらあれやこれやと集めた情報をまとめました。
私が自分で整理しないとアカン…もうわからん、となったので。

それでもなんか漏れてるとか知らんとか全然ありそうでClaudeというかAnthropicに食らいつくだけでも必死や…。

最初はちまちま画像貼ってたんだけど、多すぎて苦しいってなったので、実行してみたいコマンドは各自自分のClaudeでやってください。（怠惰な人間でごめん）

<aside class="callout">

この記事の情報は2026年2月時点のものです。
Claude Codeは活発に開発されているため、最新情報は[公式ドキュメント](https://code.claude.com/docs/)をご確認ください。
あと公式以外にも開発陣がしれっとあるぜ、とかリリースノートに書いてないけどあるよ、とかしてくるのでみんなTwitterフォローしておいた方がいいぞ、本当に。

</aside>

## 基本コマンド15選

よく使うコマンドを一覧にしました。なんだ基本中の基本やんけみたいなのもある。

| コマンド | 説明 | 使い方例 | Tips/ベストプラクティス/メモ |
|---------|------|---------|----------------------|
| `/rewind` | 会話やコードの変更を巻き戻す | `Esc+Esc`でメニュー表示。コードだけor会話だけを選択して巻き戻し | 自動チェックポイント（毎回のプロンプトで保存）があるので、実験的な編集に便利。長セッションでトークン節約。初心者は「コードだけ巻き戻し」を多用して安全に試そう |
| `/insights` | 使用パターンを分析したHTMLレポート生成 | `/insights`でレポートを`~/.claude/usage-data/report.html`に保存 | 最近の機能で、コーディング習慣を「ロースト」されるくらい詳細に分析。レポートからSkillsやHooksの提案が出てくるので、ワークフローを最適化。月1回実行推奨。これマジで神。自分の開発スタイルだとこうすると良いのね、って改善していける。 |
| `/help` | 利用可能なコマンド一覧を表示 | `/help` | 初心者必須。隠し機能を探す起点に。尚めっちゃ怒涛の量出てくる。情報量で殴ってくる。 |
| `/context` | コンテキスト使用量を表示（トークン消費の視覚化） | `/context` | 長会話でトークンオーバーを防ぐ。`/compact`と組み合わせて出力短く。コンテキストで割と私が殴っちゃうからちょっとずつ使ってAIと私（人間）が良い感じになるように頑張っている |
| `/compact` | レスポンスを簡潔モードに切り替え | `/compact`または`/compact focus on errors` | トークン節約に。エラー重視の指定でデバッグ効率化 |
| `/init` | 新プロジェクト初期化（CLAUDE.md作成など） | `/init` | プロジェクト開始時に。カスタムテンプレートと組み合わせ |
| `/usage` | プラン使用量・レート制限状態を表示 | `/usage` | サブスクリプションプラン利用者向け。無料プランでの制限監視に。あんまり無料プランで使ってる人見かけないけど |
| `/clear` | 会話をクリア | `/clear` | コンテキストリセットで新タスク開始。一旦クリアしとくか、で割と使う |
| `/agents` | サブエージェント管理 | `/agents` | 複雑タスクで並列処理。話題のやつ。トークン消し飛んだ。今だと割とまだ富豪向け感ある |
| `/install-github-app` | GitHubアプリインストール（PRレビュー自動化） | `/install-github-app` | CI/CDワークフローに統合。PRコメント自動化で生産性アップ。最近やってまだプライベートでしか試してないけど良さげ。会社組織利用は個人的には人間性なくなりそうでまだやってない |
| `/cost` | トークン使用統計を表示 | `/cost` | セッション中のコスト把握に。`/usage`がプラン全体なのに対し、こちらはセッション単位。Claudeちゃんは総じてやや他と比べると賢い故に爆食いするから見るようにしている |
| `/export` | 現在の会話をファイルやクリップボードに出力 | `/export conversation.md` | 有用なやりとりを保存・共有したいときに。あんまないけど知っておくと良いなって感じ |
| `/review` | コードレビュー依頼 | `/review` | 私がカスのコードでは？疑心暗鬼するので。PR前にセルフレビュー。私が不安民なのでめっちゃする。最近は別モデルにさせることを検討しつつもClaudeCodeにもさせる |
| `/pr_comments` | PRコメント表示。 | `/pr_comments` | GitHub連携必須。確認したい。もう前記事でも書いたけどGithubと一生一緒みたいになってきた |
| `/doctor` | 環境診断（依存関係や設定問題検知） | `/doctor` | 人間の健康診断と一緒。トラブルシューティングの最初に |

## 良さげ機能

### /rewind - タイムトラベルデバッグ

`/rewind`は最近強化された機能で、会話とコードを別々に巻き戻せる。
私がすぐ余計ないらん事言うから長いセッションになりがちなので助かる。いつも負担かけてごめんClaude。

**特徴:**
- 自動チェックポイント（毎回のプロンプトで自動保存）
- `Esc+Esc`でメニュー表示
- コードだけ / 会話だけ を選択して巻き戻し可能

**活用例:**
```bash
# 実験的なリファクタリングを試す
→ うまくいかなかった
→ Esc+Esc → 「コードだけ巻き戻し」
→ 会話履歴は保持したまま、コードだけ元に戻る
```

**Tips:**
- 並行セッション（複数ターミナル）で使ってバージョニング
- 長セッションでトークン節約にも有効（これが個人的にありがたい）

**参考:**
- [Checkpointing公式ドキュメント](https://code.claude.com/docs/en/checkpointing)

### /insights - コーディング習慣を分析

過去1ヶ月の使用履歴を読み込んで、HTMLレポートにまとめてくれる。
めちゃ細かい。諸藩の事情でプライベートすぎるのとポロリがありすぎるので貼れないんですが、ぜひ一回頼むからやってくれださい。
最強のClaude環境に一緒になろうね、と優しい気持ちと反面この子が優秀すぎて怖いとなってくる。

**生成内容:**
- コマンド使用頻度
- よく使うパターン
- カスタムコマンドの推奨
- Skillsの提案

**使い方:**
```bash
/insights
# ~/.claude/usage-data/report.html に出力される
```

**Tips:**
- 月1回実行して、ワークフローを見直す
- レポートからSkillsやHooksの提案が出てくる
- コーディング習慣を「ロースト」されるくらい詳細

<aside class="callout">

より詳しい仕組みについては、こちらの記事が参考になります。
英語だけど神まとめ。ありがたきまとめ。

<a class="link-card" href="https://www.zolkos.com/2026/02/04/deep-dive-how-claude-codes-insights-command-works.html" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.zolkos.com</span>
<span class="link-card-title">Deep Dive: How Claude Code's insights Command Works</span>
</span>
</a>


</aside>

## 隠しコマンド・便利機能

### Plan Mode (Shift+Tab) - 大規模タスクの成功率を上げる

いきなりコードを書かせず、まず読み取り専用でコードベースを分析させてから実装方針を決められます。
これは割と基本とされているけど、一応。いいから計画を練ろ、って公式も言ってる。
個人的に習慣づけをしたいのあるのと小心者心配性の要素もあるので、割とすぐPlanする。

**起動方法:**
- `Shift+Tab`を押してモードを切り替え（Normal → Auto-Accept → Plan をサイクル）
- または「Let's plan this first.」と指示。プラン練るよ、でもいける。
- `/plan`コマンドでも直接入れる

<aside class="callout callout-alert">

**Windows版の注意:** Claude Code v2.1.3以降、Windows環境では`Shift+Tab`でPlan Modeが表示されないバグが報告されています（[Issue #17344](https://github.com/anthropics/claude-code/issues/17344)）。その場合は`/plan`コマンドを使ってください。あとはもうClaudeCodeにプラン練るよって言えば良い。

</aside>

**活用例:**
```bash
# 大規模なリファクタリングやアーキテクチャ変更の前に
Shift+Tab でPlan Modeに切り替え
→ 読み取り専用でコードベースを分析
→ 実装戦略をレポート化
→ 承認後に実装開始
```

**メリット:**
- 一発成功率が大幅に向上
- 無駄なトークン消費を削減
- 複雑なタスクの見通しが立つ

### /statusline - コンテキスト使用量を常時監視

リアルタイムでコンテキスト使用量を表示します。
コンパクトするためにちまちま。あんまりありすぎるとLLMの都合上、ポンコツになっちゃうので。
よく使うために、人間側でやれる事として。

```bash
/statusline
```

**活用例:**
- トークン監視
- `/compact`との組み合わせでトークンオーバー防止

### /resume - セッションを再開

過去の会話をロードして続きから再開できます。

```bash
# 最新セッションを再開
claude --resume

# セッションピッカーで選択
/resume

# 特定セッションをID/名前で再開
claude --resume auth-refactor
```

**便利な使い方:**
- 前日の作業を続ける
- 複数プロジェクトを切り替える

<aside class="callout">

**過去の日付のセッションを探したい場合：** ビルトインの日付検索コマンドはありませんが、セッションデータは`~/.claude/projects/`以下に保存されているので、自然言語で「2024年12月のセッションを探して」と頼めば探してくれます。よく使うなら`~/.claude/commands/history.md`にカスタムコマンドとして自作するのもアリです。日付指定で遡るということは稀な気がしますが、何月ごろに会話した気がする…みたいなのはある…と思う。

</aside>

### 起動オプション: -p モード

説明なしでコードだけ生成する高速モード。
つよつよムキムキなエンジニアはこっちのが良いのかなって最近思ってる。
私はよわよわなので、めっちゃPlanするし、めっちゃClaudeCodeに話しかける。

```bash
# printモードで起動（非インタラクティブ）
claude -p "explain this function"

# パイプと組み合わせ
cat logs.txt | claude -p "explain"
```

**適した用途:**
- スクリプトからの自動化
- クイックな質問
- CI/CDパイプラインとの統合

## キーボードショートカット

覚えておくと操作が速くなるショートカット一覧です。
私がWindows民なので、Macユーザーの方は適宜Commandキー等に読み替えてください。
最近ショトカがカニバリズムを起こしたので自前環境とここは相談しつつで。

| ショートカット | 機能 | 備考 |
|--------------|------|------|
| `Esc` (1回) | 生成停止 | 暴走したらすぐ止められる |
| `Esc` (2回) | `/rewind`メニュー表示 | コードや会話の巻き戻し・要約 |
| `Shift+Tab` | モード切替 | Normal → Auto-Accept → Plan をサイクル |
| `Ctrl+G` | エディタを開く | Multi-line入力時に便利 |
| `Ctrl+T` | タスクリスト表示切替 | 進捗確認に |
| `Ctrl+R` | コマンド履歴検索 | 過去の入力をインタラクティブに検索 |
| `Ctrl+V` | 画像ペースト | Macでも`Cmd+V`ではなく`Ctrl+V` |
| `Alt+P` (Win/Linux) | モデル切替 | プロンプト入力中にモデルを変更 |

**Tips:**
- 声入力（Mac: `fn+fn`）と`Esc`の組み合わせでハンズフリー操作できるらしい。Anthropicの中の人が言ってました。ずる…。
- `/terminal-setup`を一度実行すると`Shift+Enter`でマルチライン入力が可能に

## Agents（大混乱しないために）

Agentsは便利な反面、増やしすぎると情報量で死にます。
あとどこまでAIに任せるか、とかもあって、個人的にまだちょっと任せるのはな…という顔している要素もあるので様子見ながらやってます。
Anthropicも認識していて、改善が進んでいます。
人間とAIの両方に優しいの塩梅を模索するのはみんな一緒だね。

### /agents - サブエージェント管理の基本

複数のサブエージェントを使ってタスクを分担できます。

```bash
/agents
# メニューが表示される

# カスタムエージェントを作成
"Spawn researcher agent for docs"
```

**個人的な今のところのベストプラクティス:**
1. **最初は小規模から**: 2-3 agentsで始める（増やすと情報量で死ぬのとまだちょっと怖い）
2. **並行は3-5個以内**: それ以上は混乱の元（楽しいけど）
3. **タスクブリーフを詳細に**: WHY/HOWを明確に指定
4. **tmuxでセッション管理**: 複数エージェントを整理

大量管理のオーケストレーション系で資本で殴れる人は、バズったおしおさんのやつとか見ると
なんとなくサブエージェントの概念とかはわかると思います（普通におもろい記事）


<a class="link-card" href="https://zenn.dev/shio_shoppaize/articles/5fee11d03a11a1" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--nHca18lH--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:Claude%2520Code%25E3%2581%25A7%25E3%2580%258CAI%25E9%2583%25A8%25E4%25B8%258B10%25E4%25BA%25BA%25E3%2580%258D%25E3%2582%2592%25E4%25BD%259C%25E3%2581%25A3%25E3%2581%259F%25E3%2582%2589%25E3%2580%2581%25E5%258B%259D%25E6%2589%258B%25E3%2581%25AB%25E3%2583%2590%25E3%2582%25B0%25E7%259B%25B4%25E3%2581%2597%25E3%2581%25A6%25E3%2580%258C%25E9%2581%2595%25E5%258F%258D%25E3%2581%25AF%25E5%2588%2587%25E8%2585%25B9%25E3%2580%258D%25E3%2583%25AB%25E3%2583%25BC%25E3%2583%25AB%25E3%2582%2592%25E8%25BF%25BD%25E5%258A%25A0%25E3%2581%2597%25E3%2581%25A6%25E3%2581%258D%25E3%2581%25A6%25E3%2580%2581%25E3%2582%25AA%25E3%2583%25AC%25E3%2581%25AF%25E9%2581%25A9...%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E3%2581%258A%25E3%2581%2597%25E3%2581%258A%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyL2E2NjUxYjFhMDUuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">Claude Codeで「AI部下10人」を作ったら、勝手にバグ直して「違反は切腹」ルールを追加してきて、オレは適当にしゃべるだけになった</span>
</span>
</a>



### Agent Teams - 自律協調モード（Research Preview）

<aside class="callout callout-alert">

Agent Teamsは**実験的機能**です。使用するには環境変数`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`の設定が必要です。

</aside>

チームモードでは、リードエージェントが複数のチームメイトに作業を委譲し、自律的に協調します。
ｽﾝって解散するのがちょっと面白かった。仕事人感ある。
馴れ合いもなしね、君らねって感じ。
settings.jsonからいけます。

```settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Delegate Mode:**
- `Shift+Tab`のサイクルに「Delegate Mode」が追加される
- リードエージェントはコーディネーションのみ（コード編集不可）
- タスク管理、チームメイトとのコミュニケーション、レビューに専念

**特徴:**
- チームメイト間でタスクリストを共有
- ダイレクトメッセージで相互連携
- サブエージェントとは異なり、完全に独立したClaude Codeインスタンスとして動作

### サブエージェント

メインエージェントから専用のサブエージェントを起動して、特定タスクを委譲できます。
これでモデル選定ミスると全員Opusとかでめっちゃ溶ける。富豪になりたくなった。
基本は、司令塔をOpusで他の子はSonnetみたいなのとかやる事にあわせて調整がいる。

```bash
# CLIフラグでカスタムサブエージェントを定義
claude --agents '{"reviewer":{"description":"Reviews code","prompt":"You are a code reviewer"}}'
```

**活用例:**
- テスト専用エージェント
- ドキュメント生成専用
- コードレビュー専用

**サブエージェントとAgent Teamsの違い:**

| 項目 | サブエージェント | Agent Teams |
|-----|----------------|-------------|
| 独立性 | 親セッション内で動作 | 完全に独立したインスタンス |
| 通信 | 結果を親に返すのみ | チームメイト間で直接メッセージ |
| 安定性 | 安定版 | Research Preview（実験的） |

### /tasks - タスクリスト管理

セッションを閉じても消えないタスクリスト。v2.1.16（2026年1月）で追加されました。
人間のうっかりでタスクを閉じても消えない。
夜な夜なClaudeCodeと戯れててセッション閉じるアホやった事ある。ありがたい。

```bash
# タスクリストの表示切替
Ctrl+T

# 自然言語でタスク作成
「認証機能を追加して。依存関係ごとにタスクに分解して」
```

**特徴:**
- `~/.claude/tasks/`にファイルとして永続保存
- セッションを跨いでも継続
- 複数セッション間でタスクリストを共有可能（`CLAUDE_CODE_TASK_LIST_ID`環境変数）
- コンテキスト圧縮後も保持される

**メリット:**
- 複雑プロジェクトで忘却防止
- 従来のTODOリストの進化版

### 混乱回避Tips
基本やんけもあるけど、整理したいから書いておく。

**混乱回避のベストプラクティス:**
1. **`/compact`でコンテキスト要約**
   ```bash
   /compact エラーハンドリング部分を重点的に保持して
   ```

2. **CLAUDE.mdにチームルール記述**
   - エージェント間の一貫性を保つ
   - 役割分担を明確化

3. **MCP Tool Searchでツール遅延ロード**
   - コンテキスト節約
   - 必要なツールだけロード

4. **Syntax highlighting**
   - `/theme`コマンドでテーマ変更可能
   - レビューしやすさが向上

## Output Styles

`/output-style`でClaude Codeの出力スタイルを変更できます。
色々なスタイルがある。結構遊び心とかモチベでココをいじってる人多く見かける印象。いいよね。わかる。

### 主なスタイル

| スタイル | 特徴 | 適した用途 |
|---------|------|----------|
| **Default** | 簡潔でスピード重視、コードのみ | 作業効率重視 |
| **Explanatory** | 設計判断やトレードオフを解説しながら作業 | コードの意図を理解したい時 |
| **Learning** | 変更理由を説明、ユーザーに小さいコードを書かせる | 新技術の学習 |

### 設定方法

```bash
# 出力スタイルを変更
/output-style

# 未ドキュメント機能：出力モードのセットアップ
@agent-output-mode-setup
# → Concise, Educational, Code Reviewer, Rapid Prototyping の
#    4つのカスタムモードが ~/.claude/output-modes/ に生成される
```

### カスタマイズ

`/config`コマンドでSettings画面を開き、各種設定を変更できます。

**Tips:**
- Agentsにも出力スタイルを適用可能
- カスタム出力スタイルの作成も可能

## AskUserQuestion - インタラクティブな質問機能

Claudeが判断に迷ったとき、選択肢付きで質問してくる機能です。
私が優しくない指示した時に出てくる、すまん…って思いながらもありがたく選択する事もありつつ結局なんかotherで好きに喋ってる事の方が多い。

**特徴:**

- Agents統合で使い勝手が向上
- ファイル削除などの権限確認にも使われる
- 曖昧な指示を具体化するのに役立つ

**例:**
```bash
"Implement feature X"
→ 不明点が出たら自動ポップアップ
→ CLIで番号入力して選択
```

### Auto-Accept Mode

`Shift+Tab`でAuto-Accept Modeに切り替えると、権限確認を自動承認します。
これ微妙にまだ怖くてぽちぽち面倒くさいけど、基本ぽちぽちとAutoを使い分けてる気がする。

**注意:**
- セキュリティに注意して使用
- `--dangerously-skip-permissions`との違い：Auto-Acceptはセッション中に切り替え可能

## プロンプト最適化テクニック

プロンプトの書き方で出力の質が変わります。もはやこれは、書かなくても良い気もしたけど。
一応で、使えるパターンをいくつか紹介します。

### セルフレビュー

```bash
"Grill me on changes"
```

コードレビューを厳しくしてもらえます。
ちなみに英語圏のスラングで「尋問する」になるからあんまり「人間向けには」使わない方が良い表現という雑学。

### 深い思考

```bash
"Ultra think"
```

より深く考えてから回答してもらえます。
割と昔からChatGPTとかでも使われてたやつね。

### タスク分解

```bash
"Step by step"
```

複雑なタスクを段階的に進めます。
あと割とお勉強の時とかで、これで説明してくれーって甘えたこと言ってる。

### ハルシネーション対策

保守モードで慎重な回答を促します。

```bash
"Be conservative and verify before making changes"
```
それでもLLMだからハルシネは、まだする。
それで良いんや、その方が人間側も厳しく見ような、って思うからねってデカい心になる。

## カスタムスラッシュコマンド

繰り返しのタスクをコマンド一発で済ませられます。
個人的にはここがClaude Codeの一番おいしいところだと思います。
このプロンプト管理とかからおさらばできるやん、ってのが一番うれしい。
ありがとう、Anthropicポイントは色々あるけど、個人的にSkillもだけどやっぱカスタムで色々出来るのは嬉しいよ。

### 基本的な作り方

**グローバルコマンド:**
```bash
~/.claude/commands/unit-test.md
```

**プロジェクトレベル:**
```bash
.claude/commands/deploy.md
```

### 良い使い方例

**`/unit-test` - テスト自動生成**
```markdown
# unit-test.md
Generate comprehensive unit tests for $ARGUMENTS.
Include edge cases and error handling.
```

**`/fix-bugs` - バグ修正自動化**
```markdown
# fix-bugs.md
Analyze $ARGUMENTS for bugs and fix them.
Explain what was wrong and how you fixed it.
```

**`/deploy` - デプロイワークフロー**
```markdown
# deploy.md
1. Run tests
2. Build production bundle
3. Deploy to $ARGUMENTS environment
4. Verify deployment
```

### 引数の活用

```bash
# $ARGUMENTS で引数を受け取る（$0, $1 でも可）
/unit-test src/utils.js
```

### Skillsへのアップグレード

カスタムコマンドをSkillsにアップグレードすると：
- サブファイル（参考ドキュメント）追加可能
- より複雑なワークフローが構築できる
- `disable-model-invocation: true`でユーザーが明示的に呼び出した時だけ動作

### セッション引き継ぎのTips

コンテキストが溢れそうなとき、あるいは長期プロジェクトで次のセッションに確実に引き継ぎたいとき。いくつかやり方があります。
まだちょっとどれが一番自分のスタイルに来るかは模索してるところある。
Skillするか否かも微妙だな、ラインのとかね。

**方法1: /export で会話を保存**
```bash
/export handover.md
# 現在の会話がファイルに出力される
# 次のセッションで「handover.mdを読んで続きを」と指示
```

**方法2: カスタムコマンドとして自作**

海外コミュニティでは「handover」コマンドを自作して、セッションの要約を構造化して保存するパターンが広まりつつあったり。

```markdown
# ~/.claude/commands/handover.md
現在のセッションの引き継ぎドキュメントを作成してください：
- 行った作業の要約
- 決定事項
- 未完了のタスク
- 陥った落とし穴と学んだ教訓
HANDOVER.md として保存してください。
```

**方法3: /teleport でWebセッションに移動**
```bash
# ローカルからclaude.aiのWebセッションに送る
& タスクの説明

# Webセッションをローカルに引き戻す
/teleport
```

**メモリ機能との使い分け:**

| 項目 | メモリ（CLAUDE.md） | /export + カスタムコマンド |
|-----|-------------------|-------------------------|
| 動作 | 自動的に参照される | 明示的に保存・読み込み |
| 保存形式 | CLAUDE.mdファイル | 任意のファイル |
| 適した用途 | プロジェクト共通のルール・コンテキスト | 特定セッションの引き継ぎ |

### 良さげかもポイントとか

1. **繰り返しタスクをコマンド化**
   - 例: Gitコミット、テスト実行、ビルド

2. **`/insights`で提案されたものを自作**
   - 使用パターンに基づいて最適化

3. **プロジェクトレベルとグローバルで使い分け**
   - プロジェクト固有 → `.claude/commands/`
   - 汎用的 → `~/.claude/commands/`

**参考:**
- [Skills公式ドキュメント](https://code.claude.com/docs/en/skills)

## 隠し機能・高度な使い方

### Artifacts - インタラクティブなコード生成

Claude（webとデスクトップ）の機能ですが、Claude Codeで拡張されています。
というか本来なんだよな、Claude Codeのっていう。
この辺すみ分けというか、エンジニアと非エンジニアのすみ分けかなあ。

**web-artifacts-builderスキル:**
- HTML/JS/CSSをファイルとして生成
- ライブ編集可能
- 「予算計算機作成」などのインタラクティブなツールに

```bash
"Create a budget calculator with live updates"
→ web-artifacts-builderスキルが動作
→ HTML/JS/CSSファイルが生成される
```

### Checkpointing

`/rewind`で活用できる自動バックアップ機能。
これマジ助かるやつね。やっぱセーブポイントは欲しいのよ

**特徴:**
- コードと会話の両方を巻き戻せる
- 自動でチェックポイント作成
- セーフティネットとして機能

**参考:**
- [Checkpointing公式ドキュメント](https://code.claude.com/docs/en/checkpointing)

### ! for Shell Injection

スキル内でライブデータを取得できます。
地味だけどありがたいやつ。

```bash
# 例: GitHub PRの差分をライブ取得
!gh pr diff

# 例: 現在のGit状態を確認
!git status
```

**活用例:**
- ライブデータの取得
- 外部ツールとの連携
- 動的な情報の反映

### Context Management

#### Auto-Compact（自動コンテキスト圧縮）

コンテキストウィンドウの約95%まで使うと、自動で会話を要約・圧縮してくれます（auto-compact）。
必要な情報は残したまま、セッションをそのまま続けられます。
web版もあるよ、私は割と定期的にこれが出るから「ご、ごめん…会話長くて……」ってなってる。

```bash
# 手動でコンパクト化（保持したい情報を指示できる）
/compact エラーハンドリングのパターンは保持して

# 現在のコンテキスト使用量を確認
/context
```

**Tips:**
- v2.0.64以降、コンパクト化は瞬時に完了（ClaudeCodeの方は割と早い気がする。webの方は頑張ってくれてる感じがある）
- 手動`/compact`では保持したい情報を指示文で指定可能
- 長セッションでも自動的に管理されるため、基本はお任せでOK

#### MAX_THINKING_TOKENS

思考トークンを拡張して推論能力を向上。
財布とトレードオフ。さもあり。

```bash
MAX_THINKING_TOKENS=10000
```

**トレードオフ:**
- 推論能力↑
- コスト↑

**使い分け:**
- 複雑な問題: 高めに設定
- 単純なタスク: デフォルトで十分

## まとめ

### まず覚えるべき3つ

1. **`/help`** - すべての起点
2. **`Esc+Esc`（/rewind）** - セーフティネット
3. **`/context`** - トークン監視

### シーン別おすすめコマンド

**デバッグ・修正:**
- `/doctor` → 環境診断
- `Esc` → 暴走停止
- `/rewind` → 元に戻す

**大規模タスク:**
- `Shift+Tab`（Plan Mode） → 計画立案
- `/agents` → タスク分担
- `/tasks` → 永続管理（`Ctrl+T`で表示切替）

**トークン節約:**
- `/compact [指示]` → 手動要約（auto-compactもあり）
- `/context` → 使用量確認
- `/clear` → リセット

**学習:**
- `/output-style` → Learningモードに切り替え
- "Grill me on changes" → 厳しいレビュー
- "Step by step" → 段階的説明

**効率化:**
- カスタムスラッシュコマンド作成
- `/insights`で月1レビュー

**チーム開発:**
- `/export` + カスタムhandoverコマンド → 引き継ぎ
- Agent Teams → 協調作業（実験的機能）
- CLAUDE.md → ルール共有

### トークン管理のあれこれ

1. **定期的に`/context`で確認**
2. **長くなったらauto-compactにお任せ（手動は`/compact`）**
3. **タスク切り替え時は`/clear`**
4. **`/rewind`で無駄な会話を削除**
5. **`/export`で保存してから新セッション開始**

### Agents運用の鉄則

1. **2-3個から始める**
2. **CLAUDE.mdでルール明確化**
3. **並行は最大5個まで**
4. **`/statusline`で常時監視**
5. **混乱したら`/compact`**

## おわりに

Claude Codeは更新が速いので、この記事の内容もいずれ古くなります。
というかマジで速すぎる。仕事してたり寝てる間に変わってて笑うレベル。
公式ドキュメントも合わせて確認してください。

`/insights`を月1で回すと、自分では気づかないクセや改善ポイントが見えてきます。
まずはそこから試してみてください。マジでこれ良い。

## 参考リンク

- [Claude Code 公式ドキュメント](https://code.claude.com/docs/)
- [Interactive Mode 公式ドキュメント](https://code.claude.com/docs/en/interactive-mode)
- [CLI Reference 公式ドキュメント](https://code.claude.com/docs/en/cli-reference)
- [Checkpointing 公式ドキュメント](https://code.claude.com/docs/en/checkpointing)
- [Agent Teams 公式ドキュメント](https://code.claude.com/docs/en/agent-teams)
- [Deep Dive: How Claude Code's /insights Command Works](https://www.zolkos.com/2026/02/04/deep-dive-how-claude-codes-insights-command-works.html)
