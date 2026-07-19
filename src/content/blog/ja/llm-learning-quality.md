---
title: LLMは「トンデモ論文」も学習している - AI開発者が知っておくべき情報源の品質管理
description: >-
  「ClaudeとGeminiでミレニアム懸賞金問題を全て解決した」というプレスリリースがPRTIMESに掲載され、その後削除されるという事件がありました。リアルタイムでご存知の方もいるかもしれません。この事例は、LLM…
date: '2025-10-26'
tags:
  - ai
  - 品質管理
  - llm
  - プロンプトエンジニアリング
lang: ja
pair: llms-learn-from-pseudoscientific-papers-too-quality-control-
source: zenn
accent: '#E5007F'
---

<!-- generated from articles/zenn/2025-10-26-llm-learning-quality.md by scripts/import-articles.ts - do not edit -->

## はじめに

「ClaudeとGeminiでミレニアム懸賞金問題を全て解決した」というプレスリリースがPRTIMESに掲載され、その後削除されるという事件がありました。リアルタイムでご存知の方もいるかもしれません。この事例は、LLMを活用する開発者全員が知っておくべき重要な教訓を含んでいると思ったのでメモ兼学び備忘録で書いてます。

LLMの学習データに含まれる「ノイズ」の問題と、それに対する実践的な対策について書いてます。
LLM(学習済みデータ)を組み込んでいる以上頭に入れた設計が必要だよな、と。
日々開発で新技術で論文読んだりしている面々も多いと思うので、お互い気を付けようねというのも含めて。

## トンデモ論文投稿サイトの進化

### 学術プレプリントの世界

まず、学術論文の投稿サイトの状況を整理しましょう。

**[arXiv](https://arxiv.org/)** - 正統な学術プレプリントサーバー
- 査読前論文を公開するプラットフォーム
- 物理学、数学、CS分野で広く利用
- 投稿には一定の基準があり、完全に自由ではない
- 時折のトンデモ論文もある(野獣先輩の画像使ったのとか。査読通るんだ…と思った)


<a class="link-card" href="https://arxiv.org/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">arXiv.org e-Print archive</span>
</span>
</a>


**[viXra](https://vixra.org/)** - "Alternative archive"
- 名前がarXivの逆順（ar**Xiv** → vi**Xra**）
- arXivにリジェクトされた論文向け
- ほぼ無審査で投稿可能
- トンデモ論文の温床として知られる
- 意外と歴史が古く2009年からある(？！)


<a class="link-card" href="https://vixra.org/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="http://vixra.org/vicons/icon.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">vixra.org</span>
<span class="link-card-title">viXra.org open e-Print archive</span>
</span>
</a>


### AI時代の新展開

そして2020年代、AI論文生成時代に対応した派生サイトが登場します。

**ai.viXra** - AI生成論文専用
- viXraの派生サイト
- AI生成論文に特化

**rxiVerse** - もう一つのAI論文サイト
- こちらもAI生成論文向け

トンデモ科学界隈が「AI対応」を果たし、専用インフラを整備している状況は、ある意味で示唆的です。
AI黎明期故の自由と混沌故に生まれた子達だと思います。

## 事例研究: ミレニアム問題「解決」事件

### 何が起きたのか

2025年8月、PRTIMESで以下のような発表がされました。

- **主張**: ClaudeとGeminiを使ってミレニアム懸賞金問題を全て解決
- **賞金**: 総額10.2億円（1.5億円×6問+コラッチ予想1.2億円）を3人で山分け予定
- **結果**: プレスリリースが削除される

削除された記事は[Internet Archiveに残っています](https://web.archive.org/web/20250808050953/https://prtimes.jp/main/html/rd/p/000000002.000113283.html)。

### なぜこれが問題なのか

**そもそもミレニアム懸賞金問題とは**
- Clay数学研究所が2000年に提示した7つの超難問
- 賞金は1問あたり100万ドル
- 現在までに解決されたのは1問のみ（ポアンカレ予想：数学の位相幾何学（トポロジー）における定理の一つ）
- 残り6問は数十年〜100年以上未解決

**LLMでは解決できない理由**
- 数学的厳密性の検証ができない
- 「それっぽい証明」は生成できるが、正しさは保証されない
- 実際の検証には専門家による数年がかりのレビューが必要

### この事件が示すこと

1. **PR TIMESさんのような「まとも」なプラットフォームでも検証が甘い**
   1. 1.正確に言うと、PR TIMESさんは「場の提供」をしている所なので、なんも悪くない。むしろPR TIMESさんからは査読を通っていない学術論文なので非公開にさせてほしいという電話連絡が投稿者にあったらしく、AIとの研究成果が当たり前になる時代を見越してPR公開の新規約提案をする事になったらしいので、これは良いことではあるのかな、とは思います。完全な悪ではないと個人的には思います。多分ね。PR TIMESさんはすごく誠実な対応をしてくれたと思います。担当者も事実確認した時ビックリしたと思います……(ご苦労様です、本当に。そしてありがとうございます、この場で感謝)
1. **LLMの出力を過信する危険性**
   1. 単純にLLM開発最前組(R&Dや組織で開発している組やそもそものLLM研究組)は、あんまり心配していませんが、改めて既存のLLMモデルを利用している以上「学習済みデータ」にどんなものが含まれているかの危険性がより顕著になったと思います。
2. **専門家レビューの省略は大惨事を招く**
   1. これも変わらず、専門領域に限らず本当に改めて知識をしっかり持ってる人を頼る事の重要性だと思います。色々な領域で使える、使う以上やはり人間の正しく知識を持った人の監修は大切です…。己の身の安全の為にもね…。
3. **メディアリテラシーの重要性**
   1. PR TIMESさんの対応が誠実で迅速で本当に良かったですが、乗せるメディアによってはそれこそAIで判定とかもあると思いますので、今後企業側もですが、こういったPRサイトさん系でも対応が必要なのかな、と未来への苦労が垣間見えます。乗せる側もですが、管理側もリテラシーの底上げは必要なのかな、と。(実体験故に知ってますが、メディア管理側としての1つの例で某大き目転職サイトで採用管理してる企業さんが試験的にAI導入して、採用候補者さんの辞退とかに自動返答でAI使ってる形跡がありましたが設定ミスってるとか普通に見かけました。LLM使った管理って難しいから責めではないです、管理運用設定の難しさだと認識してます、個人として学びに変換済みです、悪しからず)

## LLMは何を学習しているのか

### 学習データの実態

LLMの学習データには「公開されているテキスト」が広く含まれています。つまり：

```
◎ 正統な学術論文 (arXiv、査読済み学術誌)
◎ 教科書、公式ドキュメント
△ Wikipedia、Stack Overflow
△ SNSの投稿(有益なのもあるので)
× トンデモ論文 (viXra等)
× 個人ブログの誤情報
```

問題は、LLMはデフォルトだと**これらを区別できない**ことです。
ChatGPTとかは結構平気でWikipediaを情報ソースにしてきます。
殴ってやろうかと思ったけど、まあ私が制御しなかったのも悪いね、そうだね、でもやめてね、ってなった。
日本と世界ではWikipediaの立ち位置はちょっと違うので、一概にこれも否定がしにくい、、、というのもあるけど、やめてくれ～って個人的には思います。
ちょっと界隈は違いますが、**[アサクリ・弥助の炎上事件](https://synodos.jp/opinion/international/29244/)** とかもあるので、Wikipediaソースは本当に辞めて欲しい。

<aside class="callout">

**アサクリ・弥助事件とは**
2024年、ゲーム『アサシンクリード シャドウズ』で弥助が主人公に選ばれたことをきっかけに発覚した、Wikipedia改竄を含むグローバルですごい燃え方をした事件です。

**事件の概要:**
- 著者（トーマス・ロックリー氏）が2015年頃から自身のアカウント「鳥取トム」で弥助のWikipedia（英語版）を編集
- 自分の著作を引用元として、史実を大幅に脚色した内容を「事実」として記載
- この改竄されたWikipediaを根拠に、映画、TV番組、記事などが制作され世界中に拡散
- 「弥助は優秀な侍だった」「日本語ペラペラだった」など、史料に基づかない情報が定着
- アサクリ炎上後、Wikipedia改竄が発覚し、著者はSNSアカウントを削除して逃亡

**問題の本質:**
一個人がWikipediaを長期間にわたって編集し続けることで、メディアや学術界すら騙し、誤った歴史認識を世界中に広めることができてしまった事例です。

参考: [SYNODOS - アサクリ・弥助炎上事件](https://synodos.jp/opinion/international/29244/) / [ITmedia - 炎上が収まらない「アサクリ問題」](https://www.itmedia.co.jp/news/articles/2407/28/news054.html) / [4Gamer - 弥助問題を考える](https://www.4gamer.net/games/656/G065622/20240726069/)

</aside>


### LLMの特性と危険性

**1. 形式的な模倣能力が高い**
- 論文形式の文章を生成するのは得意
- 数式、引用、専門用語を適切に配置できる
- 見た目は「完璧な論文」

**2. 内容の真偽判断が弱い**
- 正統な証明とトンデモな「証明風の何か」を区別できない
- 論理の飛躍を検出できない
- 自信満々に間違ったことを書く

**3. トンデモ論法も学習済み**
- 既存理論の誤解
- 論理の飛躍
- 願望的推論
- これらのパターンも学習データに含まれている

## 実践: 情報源の品質管理

### 悪い例: 脳死Deep Research

Reddit、SNSはリアルタイムでの発表とかを追いたい時は良いけど、基本的にはってので。

```markdown
❌ NG例

プロンプト: 「ミレニアム問題について調べて詳しく教えて」

問題点:
- LLMが勝手にWeb検索
- viXra、個人ブログ、Reddit、SNSも平等に参照
- トンデモ情報と正統な情報が混在
- 出典の信頼性が不明
```

### 良い例: 情報源を明示的に制限

```markdown
✅ Good例

プロンプト:
「ミレニアム問題について、arXiv.orgとClay数学研究所の
公式サイトのみを参照して調べてください。
他のサイトは参照しないでください。
引用元のURLを必ず明記してください。」

利点:
- 信頼できる情報源のみ使用
- 出典が明確
- 検証可能
```

### 分野別: 個人的に信頼できる情報源リスト(よく使うやつ)

**医学・生物学**
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) - 米国国立医学図書館
- [PubMed Central](https://www.ncbi.nlm.nih.gov/pmc/) - フルテキスト論文
- [Cochrane Library](https://www.cochranelibrary.com/) - 系統的レビュー
- 各国の医学会公式サイト

**数学・物理・計算機科学**
- [arXiv](https://arxiv.org/) - プレプリントサーバー
- 査読済み学術誌の公式サイト（IEEE、ACM等）
- 大学の公式講義資料
- [Clay Mathematics Institute](https://www.claymath.org/) - ミレニアム問題の公式サイト

**工学・技術**
- 公式ドキュメント（GitHub、製品公式サイト）
-  [IEEE Xplore](https://ieeexplore.ieee.org/Xplore/home.jsp)　- 米国電気電子学会およびその他のパートナー出版社によって発行された資料。人類社会の有益な技術革新に貢献する世界最大の専門家組織で、世界160ヵ国以上、40万人を超える会員なので普通におもろいです。最近好きなのでちょっと宣伝。
- 企業の技術ブログ（公式のみ）

**明確に避けるべき情報源**
- viXra（言うまでもなく）
- 未検証の個人ブログ
- まとめサイト、キュレーションメディア
- SNSの投稿（一次情報源でない限り）
- 内容農場（content farm）サイト

## 実装レベルでの対策(使う時)

### 1. プロンプトで情報源を制限

```python
# 基本パターン
prompt = """
あなたは医学論文を要約するアシスタントです。
以下のルールに従ってください:

- PubMed (pubmed.ncbi.nlm.nih.gov) のみから情報を取得
- 他のサイトは参照しない
- 引用元のPMID（論文ID）を必ず明記
- 不確実な情報は「確認できませんでした」と回答

質問: {user_query}
"""
```

### 2. 検索クエリでドメインを指定

```python
# Web検索を使う場合
search_query = f'site:arxiv.org "{topic}"'
search_query = f'site:pubmed.ncbi.nlm.nih.gov "{medical_term}"'
search_query = f'site:github.com "{library_name}" official documentation'
```

### 3. RAGシステムでの品質管理
gemとかの場合は、もう直接書いて指定でもいいかも。

```python
# 許可リスト方式
ALLOWED_DOMAINS = [
    'arxiv.org',
    'pubmed.ncbi.nlm.nih.gov',
    'github.com',  # 公式リポジトリのみ
    # ... 信頼できるドメインのみ
]

def is_valid_source(url: str) -> bool:
    """URLが信頼できる情報源かチェック"""
    from urllib.parse import urlparse
    domain = urlparse(url).netloc
    return any(allowed in domain for allowed in ALLOWED_DOMAINS)

# 検索結果のフィルタリング
valid_results = [
    result for result in search_results
    if is_valid_source(result['url'])
]
```

### 4. 出典の必須化

```python
prompt = """
必ず以下の形式で回答してください:

【回答】
...

【出典】
1. [論文タイトル](URL) - 著者名, 発行年
2. ...

出典が見つからない場合は「信頼できる出典が見つかりませんでした」と回答してください。
"""
```

### 5. バリデーション層(妥当性確認)の追加

```python
def validate_response(response: str, sources: list) -> bool:
    """
    LLM出力の妥当性チェック
    """
    checks = []

    # 出典確認
    checks.append(len(sources) > 0)

    # ドメイン確認
    checks.append(all(is_valid_source(s['url']) for s in sources))

    # 極端な主張がないか（キーワードベース）
    dangerous_phrases = ['完全に解決', '100%証明', '絶対に']
    checks.append(not any(phrase in response for phrase in dangerous_phrases))

    return all(checks)
```

## LLM開発者への教訓

### 1. Garbage In, Garbage Out の法則

```
低品質な情報源 + 強力なLLM = 説得力のあるゴミ
```

LLMは入力の質を向上させることはできません。むしろ、説得力のある形式で包装してしまうため、より危険です。本当に使う側の技量でかなり差が出るな、と思います。
良い意味で使う人に知能を合わせてくれる、と言えば聞こえがいいんですけどね。

### 2. 検証プロセスは省略できない

```
LLM出力 → 人間の専門的検証 → 公開
         ↑
         ここを飛ばすと大惨事。とてもまずい。怖い。
```
業界特化とかだと本当に怖いな、と思ったな、と。

### 3. 「AIが言った」は免罪符にならない

- 最終的な責任は人間（開発者・利用者）にある
- LLMは道具であり、出力の正しさを保証しない
- 専門分野では必ず専門家レビューを

改めて本当にここ意識から外したくないな、って思いました。
常々頭の隅にはあるけど、熱中してやってるとね、つい「最高のもの出来たのでは！」ってなりがちなのでね。

### 4. 用途に応じた情報源設計

```python
# 例: 医療アプリの場合
class MedicalLLMWrapper:
    ALLOWED_SOURCES = ['pubmed.ncbi.nlm.nih.gov', ...]

    def query(self, question: str) -> str:
        # 情報源を制限したプロンプト
        prompt = self._build_prompt_with_source_restriction(question)
        response = llm.generate(prompt)

        # バリデーション(妥当性確認というか適切な誘導)
        if not self._validate_medical_response(response):
            return "信頼できる医学的根拠が見つかりませんでした。医師にご相談ください。"

        return response + "\n\n※この情報は医学的助言ではありません"
```

### 5. 透明性の確保

ユーザーに対して明示すべきこと：
- どの情報源を使用しているか
- LLMの限界（特に専門分野）
- 検証プロセスの有無
- 最終確認の必要性

生成AI周りで散々言われている透明性ですが、確保しようねっていう。

## チェックリスト: LLMシステムのリリース前に

```markdown
□ 使用する情報源を明示的に定義しているか
□ 情報源の品質を担保する仕組みがあるか
□ 出典を明記させる設計になっているか
□ 専門家レビューが必要な領域を特定しているか
□ バリデーション層を実装しているか
□ エラーハンドリング（情報が見つからない場合）があるか
□ ユーザーに限界を明示しているか
□ 誤情報のリスクを評価したか
```

## まとめ

LLMは強力なツールですが、**学習データの質を超えることはできません**。特に専門的な分野では：

1. **情報源を明示的に制限する** - プロンプトやシステム設計で
2. **出典を必須化する** - 検証可能性の確保
3. **専門家レビューを省略しない** - 特に重要な用途(医療系とか化学系とか工業系とか電気系とかは特にですかね、やらかすと人間の生存に関わってくる系)での利活用
4. **透明性を確保する** - ユーザーに限界を伝える
5. **継続的な品質管理** - 出力のモニタリングと改善

「Deep Research」は便利ですが、情報源の質を制御しないと「Deep Garbage Collection」になります。

ミレニアム問題事件は、決して他人事ではありません。同じような失敗は、情報源の品質管理を怠れば誰にでも起こり得るな、って話です。
昨今特に「Deep Research」を使う事も増えましたし。事実便利ですしね。組み込むとかも結構増えたのでは？と思います。

LLMを活用する全ての開発者が、この教訓を心に留めておくといいな～と思った話です。
膨大な情報を学習している故にこういうプロンプトもやれるのは良いことであり、怖い部分でもあるな、と。
▼「数式×論理構造」でプロンプトを圧縮する話

<a class="link-card" href="https://zenn.dev/akari1106/articles/8326ade3b0a2db" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--GtAylk0k--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:API%25E3%2582%25B3%25E3%2582%25B9%25E3%2583%2588%25E3%2581%258C%25E6%25B0%2597%25E3%2581%25AB%25E3%2581%25AA%25E3%2582%258B%25E3%2581%25AE%25E3%2581%25A7%25E3%2580%2581%25E3%2583%2588%25E3%2583%25BC%25E3%2582%25AF%25E3%2583%25B3%25E3%2582%2592%25E3%2581%25AA%25E3%2582%2593%25E3%2581%25A8%25E3%2581%258B%25E3%2581%2597%25E3%2581%259F%25E3%2581%2584%25E3%2580%2582%25E3%2580%258C%25E6%2595%25B0%25E5%25BC%258F%25C3%2597%25E8%25AB%2596%25E7%2590%2586%25E6%25A7%258B%25E9%2580%25A0%25E3%2580%258D%25E3%2581%25A7%25E3%2583%2597%25E3%2583%25AD%25E3%2583%25B3%25E3%2583%2597%25E3%2583%2588%25E3%2582%2592%25E5%259C%25A7%25E7%25B8%25AE%25E3%2581%2599%25E3%2582%258B%25E8%25A9%25B1%25E3%2581%25A8%25E3%2581%259D%25E3%2581%25AE%25E9%2599%2590%25E7%2595%258C%25E3%2581%25A8%25E3%2581%258B%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E7%2581%25AF%25E9%2587%258C%2528akari%2529%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzkxZTcxYTI4M2EuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">APIコストが気になるので、トークンをなんとかしたい。「数式×論理構造」でプロンプトを圧縮する話とその限界とか</span>
</span>
</a>


それ以上にやはり「既存の学習モデルのLLM」という前提な以上、この認識は総じて改めて教訓として覚えておきたいと思いました。

## 参考リンク

- [arXiv.org](https://arxiv.org/) - 学術プレプリントサーバー
- [viXra.org](https://vixra.org/) - Alternative archive
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) - 医学論文データベース
- [Clay Mathematics Institute - Millennium Problems](https://www.claymath.org/millennium-problems/) - ミレニアム懸賞金問題の公式サイト
- [削除されたPRTIMES記事（Internet Archive）](https://web.archive.org/web/20250808050953/https://prtimes.jp/main/html/rd/p/000000002.000113283.html)

---
