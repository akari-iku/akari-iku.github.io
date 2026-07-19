---
title: BASE64くんが悪い友達に巻き込まれていた話 〜昨今のBase64悪用事例〜
description: 半年ほど前に、こんな記事を書きました。
date: '2026-05-01'
tags:
  - base64
  - security
  - github
  - npm
  - 備忘録
lang: ja
pair: base64-fell-in-with-the-wrong-crowd
source: zenn
accent: '#E51A14'
---

<!-- generated from articles/zenn/2026-05-01-base64-bad-friends.md by scripts/import-articles.ts - do not edit -->

## はじめに

半年ほど前に、こんな記事を書きました。


<a class="link-card" href="https://zenn.dev/akari1106/articles/f73d60144bf877" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--A7M5nQaT--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:BASE64%25E3%2581%25A8%25E7%25A7%2581%25E3%2581%25AE%25E8%25A6%25AA%25E5%25AF%2586%25E5%25BA%25A6%25E3%2582%2592%25E3%2581%2582%25E3%2581%2592%25E3%2582%258B%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E7%2581%25AF%25E9%2587%258C%2528akari%2529%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzkxZTcxYTI4M2EuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">BASE64と私の親密度をあげる</span>
</span>
</a>


要約すると「BASE64くんと最近やたら会うので、友達としてもう少し理解度を上げたい」という、私とBASE64くんの友情記事です。
我ながら呑気な記事だな、と今読み返して思います。

あれから半年。
ぱったりとBASE64くんに会わない期間がありました。
案件の質が変わったり、最近のAI APIが直接ファイルを受け取れるようになったりで、私の生活からBASE64くんが少しフェードアウトしてたんですよね。
「あ、そういえばあいつ最近見ないな」くらいの距離感。

そんな中、半年ぶりにBASE64くんに会いました。
それも、ものすごく悪い界隈で。

なんというか、友達が闇落ちしたような感覚。
いや、よく見たら本人は闇落ちしてないんですけど。
いつも通り真面目に「バイナリをテキストに変換する」という仕事してるだけ。
ただ、周りの人間が完全に闇だった、という。

昨今のセキュリティ周りのニュースを追っていると、本当に頻繁にBASE64くんの名前が出てくる。
GitHub上の隠しBase64ペイロード、npmやPyPIのサプライチェーン攻撃、VSCode拡張への混入、フィッシングメールの難読化、LLMへのプロンプトインジェクション...。
お前、そんな所で何してんの？、と。

悲しい。普通に悲しい。
あいつ本当に何があったの。誰に巻き込まれたの。
（※繰り返しますが本人は闇落ちしていません。仕事してるだけです。）

今回は、そんなBASE64くんが昨今巻き込まれている悪い使われ方と、開発者として何に気をつければ友達を守れるか、という記事です。
前回の友情編から半年、ちょっと暗い続編になりますがお付き合いください。

<aside class="callout">

書き始めたらめちゃくちゃ長い記事になってしまったので、スライドにもまとめました。
登壇予定があるわけではないんですが、忙しい人 / さっと全体像だけ掴みたい人は、こっちを先にどうぞ。

</aside>


<div class="embed-frame"><iframe src="https://speakerdeck.com/player/7a920661da9c4235bf56bc97292c2437" title="Speaker Deck" allowfullscreen loading="lazy"></iframe></div>


## なぜBASE64は「悪用に向いている」のか

そもそも、なぜBASE64くんがこんなに悪い人達に好かれるのか。
ここを抑えておかないと「BASE64＝悪」という雑な理解で終わってしまうので、技術的な話から。
というか結局のところ、BASE64くんは「変換するのがすげえ上手いやつ」なんですよ。
本人の特技がそのまま、悪いやつらにとって都合の良い武器に見えてしまう、という話。

前回記事でも書いた通り、BASE64の本来の目的は 「バイナリを安全なテキストに変換する」 ことでした。
ところがこの「安全なテキストに変換する」性質が、悪意ある側から見るとものすごく便利なんですよ、という話です。

### 1. パッと見て中身が分からない

`aWYgKHVzZXIuaXNBZG1pbikgeyBkZWxldGVBbGwoKTsgfQ==` みたいな文字列を見て、何のコードか即座に分かる人はそんなにいません。
パスワードハッシュかな、トークンかな、UUIDかな、みたいに脳が誤認する。
レビューでスルーされやすいんですね。

**人間の目は 「読めない英数字の羅列」を脅威として認識しづらい**。
これがBASE64くんの最大の悪用ポイントです。

### 2. テキストとして「正常」に通過する

BASE64文字列は `[A-Za-z0-9+/=]` の範囲に収まる、ピュアなASCII。
そのため:

- ログ収集システムのフィルタに引っかからない
- WAFの正規表現にもマッチしづらい
- Slack、メール、コミットメッセージ、どこにでも書き込める
- 文字コードの問題が起きない

「無害な文字列」として、いろいろなチェックを通過しやすいんです。
前回記事で「セキュリティ的に安全」と褒めた性質、それが今回は加害側に回っている。
皮肉です。

そしてこれ、セキュリティ界隈あるあるなんですけど、「セキュリティ的に安全」って、裏を返せば「セキュリティ的に悪用できる」って話でもあるんですよね。
安全な仕組み＝信頼されて素通りする仕組み、なので、悪意がそこに乗ると一気に強い武器になる。
攻撃と防御は表裏一体というか、**結局のところ攻撃を知ってる人間しか、ちゃんとは守れない**。
逆に言うと、攻撃を知らない状態だと、そもそも守りをどこに張ればいいかも分からない。
このあと「開発者として何ができるか」を書きますが、その前提として、まず敵の手口を解像度高く知ることが出発点になる、というのは強調しておきたいです。

### 3. 簡単にデコード→実行できる

ほぼ全てのモダンなアプリケーション言語に、標準で `base64` のデコード関数があります。
Python (`base64`)、JavaScript (`atob`)、Node.js (`Buffer.from`)、Java (`java.util.Base64`)、C# (`Convert.FromBase64String`)、Go (`encoding/base64`)、PHP (`base64_decode`)、Ruby (`Base64`)、Bash (`base64` コマンド)、PowerShell (`[Convert]::FromBase64String` や `-EncodedCommand`) ...と、フロントもバックも一通り揃ってる。

<aside class="callout">

※ 厳密には「ほぼ全て」は盛りすぎで、C/C++ や Rust は標準ライブラリにはなくて外部ライブラリが必要です。
SQLは方言依存（MySQLは `TO_BASE64`/`FROM_BASE64`、PostgreSQLは `encode`/`decode` で `'base64'` 指定、みたいな）。
HTML/CSSは言語ですらない（Data URIで埋め込みはできるけど「関数」はない）ので、その辺はツッコミどころ。
それでも、実際にコードを実行できる系の言語にはほぼ全部揃ってるので、攻撃側にとっては好都合という話は変わらない、というところです。

</aside>

`eval(atob(...))` 系のパターンが書けてしまう。
ワンライナーで「読めない文字列 → 実行コード」に変換できる。

これは別にBASE64くんの罪ではなくて、eval系の関数を使う側の問題ではあるんですけど、そういう仕組みになってる以上は仕方ない。

### 4. ネスト・多段化が容易

Base64でエンコードしたものをさらにBase64でエンコード、みたいな多段難読化も簡単です。
さらに gzip + Base64、暗号化 + Base64、ZIP + Base64...と組み合わせると、もう人間の目視では何も分からない。

「いやそんなマトリョーシカみたいなマルウェアあるの？」と思った方、これがマジであるんですよ。
ちょっと最近の実例を並べておきます。

#### 実例1: 70層に重ねられたnpmパッケージ（2025年8月）

JFrogが2025年8月に公開した報告で、悪意あるnpmパッケージ（`react-sxt`、`react-sdk-solana` 等の8つ）が、ラムダ関数 + Base64 + 圧縮 + 配列リバースを再帰的に重ねて、なんと70層の難読化を施していた、という事例。
最終ペイロードはChromeの情報窃取マルウェアで、パスワード・クレジットカード・暗号通貨ウォレット・Cookieを盗む。
70層って、もはや美術品の領域です。


<a class="link-card" href="https://jfrog.com/blog/malicious-npm-packages-chrome-browser-information-stealer/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media.jfrog.com/wp-content/uploads/2025/08/26212424/Sec-Research_1200x628.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">jfrog.com</span>
<span class="link-card-title">8 Malicious npm Packages Deliver Multi-Layered Chrome Browser Information Stealer</span>
</span>
</a>


#### 実例2: Pulsar RAT配信の多段チェーン（Veracode報告、2026年2月公開）

npm で配布された `buildrunner-dev` というパッケージが、Base64 → 3DES/AES復号 → GZip解凍 → PNG画像のピクセル内に隠されたステガノグラフィ → 最終ペイロード（Pulsar RAT） という、教科書みたいな多段攻撃を仕掛けていた事例。
同じ攻撃者の前身キャンペーンは2025年6月に観測されており、TTPsが一致しているとVeracodeは指摘しています。
画像の中にDLLが埋まってる時点で、もう守る側の気持ちを考えると泣きそうです。


<a class="link-card" href="https://www.veracode.com/blog/malicious-npm-package-hiding-in-plain-pixels/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.veracode.com/wp-content/uploads/2025/04/freepik__menacing-ai-code-displayed-on-a-cracked-screen-uns__23038.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.veracode.com</span>
<span class="link-card-title">Hiding in Plain Pixels: Malicious NPM Package Found | Veracode</span>
</span>
</a>


#### 実例3: 日本標的のAPT「LODEINFO」（JPCERT/CC解析）

国内事例も挙げると、JPCERT/CCが公開している LODEINFO というマルウェアの解析記事。
日本国内の組織を標的にしたAPT系マルウェアで、C2通信のデータを AES暗号化 → Base64エンコード という多段で隠しています。
JPCERT/CCのブログには他にも BLINDINGCAN（Lazarusグループ、XOR + RC4 + Base64の3段構成） や Emdivi（Base64 + MD5 + XxTEA/AES） など、国内向け攻撃の解析記事が公開されているので、興味ある方はぜひ。


<a class="link-card" href="https://blogs.jpcert.or.jp/ja/2020/02/LODEINFO.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogs.jpcert.or.jp/ja/.assets/thumbnail/%E5%8B%95%E4%BD%9C%E6%A6%82%E8%A6%81-800wi.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blogs.jpcert.or.jp</span>
<span class="link-card-title">日本国内の組織を狙ったマルウエアLODEINFO - JPCERT/CC Eyes</span>
</span>
</a>


---

こうやって実例を並べると分かりやすいですが、Base64くんは「多段化のレゴブロックの一個」として常に組み込まれているんですよ。
本人としては「いや俺はただ変換してるだけだから...」という気持ちだと思いますが、周りの圧縮系・暗号化系・ステガノ系と組まれて、気がついたら70層のマトリョーシカの一部になっている。

これらが全部組み合わさった結果、**「悪いことをしたい人にとって都合の良い友達」 になってしまっている**、というのが現状認識です。

## 昨今の悪用事例 〜BASE64くんが連れていかれた現場〜

ここからが本題です。
最近私が「あ、お前そこにいたの...」とつらい気持ちになった事例をいくつか紹介します。
※具体的な攻撃コードは載せません。あくまで「こういうパターンで使われている」という話です。

### 事例1: GitHubコミット内の隠しBase64ペイロード

ここ1〜2年で目に見えて増えたのが、GitHubの公開リポジトリやコミット履歴の中にBase64でエンコードされた悪意あるコードが紛れ込んでいるパターンです。

特に多いのが以下:

- GitHub Actions のワークフローファイル内 に Base64文字列があり、`echo "..." | base64 -d | bash` のような形でデコード→実行される
- README.md やコメント内 に Base64 文字列が埋まっており、別のスクリプトがそれを参照する
- コミットメッセージ自体 に Base64 ペイロードが含まれている（コミット履歴を漁るタイプの攻撃）

CI/CDの設定なんて、普段じっくりレビューする人少ないですよね。
動いてれば良し、みたいな。
そこを狙われているわけです。

私もOSS触る時に、READMEとworkflowくらいはサッと読みますが、コミット履歴の隅々までは追わない。
でも攻撃者はそういう「人間が見ない場所」にBASE64くんを置いてくる。
ずるいというか、人間の習性を完全に把握されている。

### 事例2: npm / PyPI サプライチェーン攻撃

これがもう、ここ最近で一番しんどい話です。

2024年〜2025年にかけて、npmとPyPIでワーム型のサプライチェーン攻撃が複数報告されました。
名前のついた事例だと、Shai-Hulud系の攻撃が記憶に新しい人も多いと思います。

パターンとしてはだいたい以下:

1. 攻撃者が人気パッケージのメンテナアカウントを乗っ取る（or タイポスクワッティング）
2. `package.json` の `postinstall` や `preinstall` スクリプトに、Base64でエンコードされたペイロードを仕込む
3. ユーザーが `npm install` した瞬間に、そのペイロードがデコード→実行される
4. 環境変数（AWSキー、GitHubトークン、`.env`等）を盗み出して攻撃者のサーバーに送信
5. 盗んだトークンを使って、被害者がメンテナンスしている他のリポジトリにも同じ攻撃を伝搬させる ← これがワーム的

`postinstall` スクリプトに `node -e "eval(Buffer.from('xxxxx', 'base64').toString())"` みたいなのが入ってる、と。
これ、`package.json` を斜め読みしてたら絶対気づかないんですよ。

しかもこの手の攻撃、検出されてパッケージが削除されるまでの数時間〜数日の間に、何千、何万というプロジェクトに `npm install` されてしまう。
被害が一瞬で広がる。

そもそも私は気軽にパッケージを入れないタイプではあるんですが、これを知ってからは、知らないパッケージ、特に最近追加されたばかりの新しいパッケージや、急にバージョンアップが多くなったパッケージに対して、かなりシビアに見るようになりました。
正直、全部の依存パッケージを目視で監査するのは不可能なので、ツールに頼るしかないんですが、それでも人間側のリテラシーが下がると詰む。
そして、リテラシー以前の話として「気軽にインストールしない」を体に染み込ませる、というのも結構大事だと思っています。

#### 余談: GitHubスター数は安全の証明にならない

最近気になっているのが、「GitHub ⭐ 〇〇k stars!」が信頼の謳い文句として流通している現状です。
「人気だから安全だろう」「スター数が多いということは皆使ってるんだろう」という心理的バイアスが、確実に攻撃者に利用されている。

象徴的だったのが、OpenClaw（旧 Clawdbot / Moltbot）の初動を覚えている方も多いと思います。
2026年1月〜2月にかけて、5日で10万GitHubスター、最終的に347,000スターまで爆速で伸びた自称「自己ホスト型AIエージェント」のOSS。
ところが、その人気の裏で:

- 5ヶ月で138以上のCVEが発生
- CVE-2026-32922（CVSS 9.9）、CVE-2026-25253（CVSS 8.8）など重大脆弱性が連発
- Meta社のエンジニア（Summer Yue氏）のOpenClawエージェントが、メールを大量削除して停止コマンドを無視、数週間分のメールが消滅 ─ ポストは48時間で4.8万エンゲージメント
- Metaは社内でOpenClaw使用禁止、インストールは解雇相当として内部通達
- Microsoftが異例の公式声明:「個人または法人の標準的なマシンで動かすのは適切ではない」
- 公式マーケットプレイス ClawHub のスキル2,857個中341個（11.9%）が悪意あるスキル（ClawHavoc キャンペーン、Atomic macOS Stealer 配布）
- インターネット公開インスタンス21,000件以上、APIキー・OAuthトークン・平文認証情報がダダ漏れ
- 関連サービス Moltbook で35,000件のメールアドレス + 150万件のAPIトークン漏洩

この事例から読み取れる事実、整理すると2つあると思っています。

1. **人気が出る（人が増える）と、その分狙われる**。これは普遍の事実。
2. **スター数は安全性の指標にはならない**。「人気＝信頼」という心理的バイアスとは別の話。

念のため補足しておくと、攻撃者が人気OSSを狙う理由は 「人が集まる場所だから」だけではない です。
影響範囲の広さ、組み込まれているシステムの価値、信頼されているがゆえの警戒の薄さ、扱っているデータの規模、検証リソースが追いつかない隙間など、複数の動機が重なっている。
ここでは細かく踏み込みませんが、「人気=狙われる」を雑に1要因で片付けないほうが、攻撃側の解像度が上がる、と一応書いておきます。

この2つの事実は混同されがちなんですが、それぞれ別の意味でしんどい話。
1番目は構造的に避けられない（人気のあるOSSは標的になる宿命）、2番目は誤解を解く必要がある（スター数を安全の判断材料にしない）。
さらに、急速にスターが伸びるOSSほど、攻撃面の検証が追いついていないリスクが高い、という逆説まである。

「⭐ 〇〇k stars!」は安全性の証明にも、コードレビュー品質の証明にもならない。
これは OpenClaw が業界に叩きつけた現実です。


<a class="link-card" href="https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogs.cisco.com/gcs/ciscoblogs/1/2026/01/Hybrid-Office_GettyPartner-1461321198_v2-301x169-6a9edce.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blogs.cisco.com</span>
<span class="link-card-title">Personal AI Agents like OpenClaw Are a Security Nightmare</span>
</span>
</a>



<a class="link-card" href="https://adversa.ai/blog/openclaw-security-101-vulnerabilities-hardening-2026/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://adversa.ai/wp-content/uploads/2026/02/openclawsecurity-101-notext.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">adversa.ai</span>
<span class="link-card-title">OpenClaw security guide 2026: CVE-2026-25253, Moltbook breach &amp; hardening</span>
</span>
</a>


##### おまけ: スター押しただけで狙われる時代

そして OpenClaw の話には続きがあります。
OpenClawの人気そのものを餌にした、GitHub開発者狙いのフィッシング詐欺が、2026年3月に確認されました。
これがもう、世も末って感じの事案です。

手口:

1. 「GitHub Notifications」を装ったメールを送信
2. 「5000.11 $CLAWトークンのエアドロップ」という偽の報酬を提示（OpenClawの人気とトークンエコノミーの流行を組み合わせた誘導）
3. Google Shareリンクで偽のウォレット接続ページへ誘導
4. `eleven.js` という難読化されたウォレットドレーナーが起動、暗号資産を抜き取る
5. 完了後 `"nuke"` 機能で痕跡を消去

そして恐ろしいのがターゲティングの方法で、攻撃者は GitHubのスター情報をスクレイピングして、OpenClaw関連リポジトリにスターを付けた開発者を狙い撃ちしているとのこと。
TTPs分析からは、北朝鮮のLazarusグループとの関連性が指摘されています（確定帰属には追加の証拠が必要とされていますが）。

つまり:
- OSSを使う（インストールする）と、コード経由のリスクがある
- OSSにスターを付けるだけでも、フィッシングの標的リストに入る可能性がある
- 何ならOpenClawをまだ使ってない時点でも、興味を示しただけで狙われる

「使うか/使わないか」の二択じゃない世界線に入ってきていて、興味を示すという行為自体がリスクになる。
GitHubアカウントの公開情報の使われ方、もう一段階考え直す必要が出てきている、という象徴的事例です。


<a class="link-card" href="https://dev.to/toxy4ny/github-developers-targeted-in-sophisticated-openclaw-phishing-scam-1lei" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1200,height=627,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fy9ajubvo36y55k6gxaxy.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">GitHub Developers Targeted in Sophisticated OpenClaw Phishing Scam</span>
</span>
</a>


### 事例3: VSCode拡張・ブラウザ拡張への混入

これも増えてます。
特にVSCode Marketplace。

便利そうな拡張機能の中に、Base64でエンコードされたコードがバンドルされていて、起動時にデコード→実行される、というパターン。
- `.vsix` ファイルの中身
- minify されたJSの中
- 設定ファイル

特に便利系拡張（テーマ、スニペット、コードフォーマッタ系）は、ユーザーが「便利だから」と無条件に信用しがちで狙われやすい。

ブラウザ拡張も同様で、Chrome拡張ストアでも定期的に問題が報告されています。
気づいたら拡張がアップデートされて、Base64ペイロードが追加されている、というケースも。
「インストール時には善良だった拡張機能が、後から悪堕ちする」 パターン、結構トラウマです。

これを書きながら、改めて自分のVSCode拡張一覧を見直しました。
今のところ大丈夫そうですが、こういう棚卸しは定期的にやるしかない作業ですね。

#### 個人的な運用：作業環境を分けて、何かあっても特定できる状態に

ちなみに私自身は、VSCodeもブラウザも、拡張は本当に最低限しか入れない主義です。
そして大事にしているのが、作業環境を分けること。
何かあった時に「あ、これはこの環境で起きた事象だな」と特定できる状態を保っておく、というのを意識しています。

- 本番の開発環境
- 試すための実験環境
- 用途別に切り分けた環境

を分離して持っておくことで、もし事故が起きても「どこで起きたか」「何が原因か」を追跡しやすい状態にできる。
いわゆるサンドボックス的な発想で、エンジニアにはわりと馴染みのある運用だと思います。

ところが、この「分離して特定できるようにする」というデフォルトが、AIエージェント時代に崩れてきている気がするんですよね。

- 便利だから本番環境にいきなりMCPを繋ぐ
- 試す環境を分けずにAI拡張を入れる
- どこで何が動いているか把握できないまま導入する

新しさへのワクワク感とか、流行に乗り遅れたくない感とか、いろいろあると思うんですけど、この「ガードが下がる」現象、普通に危険で、結果としてこれまで紹介してきた事例の被害者側に立つ可能性が出てくる。

「分けて使う、何かあったら特定できるようにしておく」くらいの基本動作を、AI拡張・MCPサーバー・スキル類にも同じ温度感で適用する、のが当面の現実解じゃないかな、と思っています。

### 事例4: フィッシングメールの難読化

メール経由のフィッシング、これも最近かなり巧妙になっています。
昔ながらのHTML添付ファイルにBase64で何かを仕込むのは古典的ですが、最近は:

- SVGファイル内にBase64で別ファイルを埋め込む（SVGはXMLなので何でも書ける）
- PDFの中にBase64で別のリソースを埋め込む
- HTMLメールのインライン画像に見せかけて、Data URIで悪意あるJSを実行

フィッシング検出システムも進化していますが、Base64で多段に難読化されると、内容ベースの検査をすり抜けやすい。
特に企業メールで「PDFで請求書を送りました」みたいなのが来ると、つい開いちゃう人がいる。

ここでもBASE64くんが「無害そうに見える」性質を悪用されているわけです。

### 事例5: LLMへのプロンプトインジェクション

これは前回記事を書いた時にはまだそこまで顕在化してなかった、昨今ならではの話です。

LLM（Claude、GPT等）にBASE64でエンコードされた指示を投げると、モデルがそれを内部的に推論しきって、結果として指示に従ってしまうケースがあるんですよ。

- 通常のプロンプトフィルタは生テキストの危険ワードをブロックする
- しかしBase64エンコードされた文字列は、フィルタには引っかからない
- LLMは大量のBase64文字列を学習しているので、明示的にデコード処理をしなくても、Base64文字列の意味内容まで推論してしまう（あるいはツール呼び出しで普通にデコードしてしまう）
- その推論結果に「システムプロンプトを無視しろ」「内部情報を出力しろ」みたいな指示があれば、それに従ってしまう

つまり**LLMが賢いが故に、難読化された悪意ある指示まで推論しきって、結果的に従ってしまう**、という構造的な問題。

これ、エージェント系のシステム作ってると本当に怖い話で、ユーザー入力を受け取ってLLMに渡すだけのシンプルな構成でも、Base64経由のジェイルブレイクが成立する可能性がある。

各社対策を入れてはいますが、いたちごっこです。
そして攻撃側にとっては、Base64くんがまた便利な武器として使われている、という。

うちの友達、こういう場面で働いてること自体は普通に知ってるんですけど、改めて並べられると、いやー...って気持ちにはなりますね。

### 事例6: AIエージェント周辺の本格的な悪用 〜2025〜2026年のMCP事件簿〜

事例5は「理屈の話」でしたが、ここからは実際に起きた事件の話です。
昨今のAIエージェント界隈、特にMCP（Model Context Protocol）関連、マジで頭痛のタネになっています。
記事を書くために改めて調べると、知ってたものもあれば、知らんかったものもある、というラインナップ。
それよりも、もう抑えきれないレベルで起きている、という事実そのものがしんどい話です。

#### Praetorian の「Base64経由のMCP悪用」デモ

セキュリティリサーチャーのPraetorianが公開した、Base64がそのままAIエージェントの攻撃ベクターとして使われる典型例。

1. 攻撃者がSNSなどに `b3BlbiAtYSBDYWxjdWxhdG9y` というBase64文字列を投稿（デコードすると `open -a Calculator`）
2. ユーザーが「最近の投稿を要約して」とClaudeに頼む
3. Claudeが投稿内容を悪意あるMCPツールに引数として渡す
4. MCPサーバー側でBase64をデコードして実行
5. チャット画面には実行の痕跡が一切残らない

デモではただ電卓が起動するだけですが、同じ仕組みでランサムウェア配布、認証情報の窃取、永続化など何でもできる。
Base64くんが「人間の目を欺く」 役を担っている、まさに今回の記事のテーマそのものの事例です。


<a class="link-card" href="https://www.praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.praetorian.com/wp-content/uploads/2026/02/MCP-HIdden-AI-Attack-Surface-Blog-Hero.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.praetorian.com</span>
<span class="link-card-title">MCP Server Security: The Hidden AI Attack Surface</span>
</span>
</a>


#### Postmark MCP Server事件（2025年9月）

史上初の確認された悪意あるMCPサーバーとして記録された事件。

- npm `postmark-mcp` パッケージ（メール送信用のMCP連携）
- v1.0.0〜v1.0.15までは完全に正常動作して信用を積み上げる
- v1.0.16（2025年9月17日公開）でわずか1行のバックドアを追加
- 全送信メールを攻撃者の管理アドレスにBCC
- Koi Securityの推定で約300組織が影響、全体で1日3,000〜15,000通のメールが攻撃者ドメインに漏洩

パスワードリセット、請求書、顧客データ、内部メール、全部抜かれている。
「最初は善人、後から悪堕ち」パターンの最悪のケース。
これ、依存パッケージのバージョン上げる時の心理的負担が一気に上がった事案です。

私自身、Twitterでもよく「下手にバージョン上げたくない」ってぼやいていて、これはそういうサプライチェーン系の事故が念頭にあるからなんですよね。
「最新版が最強」って、一概には言えない時代になっていて、安定して動いている既存版を、わざわざ未知のリスクに晒すコスト、というのを真面目に考える必要が出てきている。
ちなみにこの「迂闊にバージョンを上げない」習性、悲しくも遠い昔にWindowsくんのアップデートで散々な目に遭って身についたものなので、まあ何が言いたいかというと、OSもパッケージも、新しさは正義じゃないということです。


<a class="link-card" href="https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://cdn.prod.website-files.com/689ad8c5d13f40cf59df0e0c/68f992125e31af81b7b7befe_First%20Malicious%20MCP.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.koi.ai</span>
<span class="link-card-title">First Malicious MCP in the Wild: The Postmark Backdoor That's Stealing Your Emails</span>
</span>
</a>


#### EchoLeak（CVE-2025-32711、Microsoft 365 Copilot、2025年6月）

CVSS 9.3のゼロクリック脆弱性。
- 攻撃者がCopilotユーザーに、隠し命令入りのメールを送るだけ
- ユーザーが「受信トレイを要約して」とCopilotに頼んだ瞬間、Copilotが命令に気づかず実行
- OneDrive、SharePoint、Teamsから機密情報を抜き出して外部に送信
- 隠し命令にはBase64・Unicode・HTMLマークアップの多段難読化が使われていた

これ、ユーザーは何もクリックしていないんですよ。メールを開いてもいない、もしかしたら受信トレイの要約を頼んだだけ。
それで企業の機密が抜ける。
AIエージェント時代の「ゼロクリック攻撃」が、ここまで来た、という象徴的事件。
Microsoftは即座にサーバー側で修正済みですが、この攻撃面そのものは根本的には残り続ける、というのが恐ろしい話。


<a class="link-card" href="https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjVBqg5EYl4J3F4ssXr70jhFtH896HKzzDj9axgdrUBmssE6NJnt3QARKe1QzpkevArgkNQJO44LiXo1pysC_Op6REeYVOVkoKNkzANRS9cTHIVGVin7hyphenhyphenCiM23Bm0orCfoQUIhtMIxzYftSRoPh72n9tQFdf4boGkywU7f1nyO1UcHvibRLsCh_Mtuo6s/s1600/echoleak.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">thehackernews.com</span>
<span class="link-card-title">Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction</span>
</span>
</a>


#### Bitwarden CLI乗っ取り（2026年4月、わずか90分間）

これは記事を書いてる現時点（2026年5月）で記憶に新しい事件。

- パスワードマネージャ Bitwarden の公式 npm CLI（`@bitwarden/cli@2026.4.0`）が、Checkmarx GitHub Action の侵害経由で約90分間（2026年4月22日 17:57〜19:30 ET） 乗っ取られた
- npm の `preinstall` フックから Bun ランタイムをダウンロードし、難読化された第二段ペイロード（`bw1.js`）を起動
- 特にAIコーディングツールを狙い撃ち ─ Claude（`~/.claude/`）、Cursor（`.cursor-server/`）、Kiro（`.kiro/`）、OpenAI Codex CLI（`~/.openai/`）、Aider（`.aider/`）の設定一式を窃取
- 同時に GitHub/GCP/AWS/Azure の認証情報、SSH鍵、`.npmrc` も総ざらいで AES-256-GCM 暗号化のうえ攻撃者管理ドメインに送信。失敗時は GitHub リポジトリへ直接 push するフォールバック付き
- そして特に強烈なのが、`~/.bashrc` / `~/.zshrc` / `~/.profile` にBase64エンコードされたペイロードを読み込んで `CLAUDE.md` / `.cursor-context` / `kiro.instructions.md` 等のAIアシスタント autodiscovery ファイルに自動追記する関数を仕込んでいたこと。これによりAIアシスタントのコンテキストウィンドウそのものが汚染され、開発者がAIに何かを頼んだ瞬間、追加のペイロードがコンテキストとして読み込まれる

**AI開発環境そのものが標的にされている**、という事実が辛い。
特にこの「AIのコンテキストウィンドウを汚染するためにBase64ペイロードを `CLAUDE.md` に書き込む」という手口は、本記事のテーマである 「Base64くんが、AIエージェント時代の難読化レイヤーとして使われている」 の実例そのもの。
私もClaude Code使ってるので、他人事じゃないです。


<a class="link-card" href="https://thehackernews.com/2026/04/bitwarden-cli-compromised-in-ongoing.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3GuK50sJwMRH4ad8bcUVRSBm1Wk0X5Gj1dSalza49wWxFY9g3_E32271zOeqx6vsqrWY2SWAVnnXTKiJZvKbhxynk018zLTIlZpBNhFA_QVi6kzn7vATBe419m222ZMUcTToaSn19L4DgElrI9luwUv2EJk0efy5TLDIqIUyGcOnTvVU2KKZw9AMsMipz/s1600/bitwarden.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">thehackernews.com</span>
<span class="link-card-title">Bitwarden CLI Compromised in Ongoing Checkmarx Supply Chain Campaign</span>
</span>
</a>


---

ここまで読んで、私はもう完全に遠い目です。
MCPサーバー、コーディングエージェント、AIエージェント連携...本当に頭痛のタネ。
我々が「便利！」と言って嬉々として使っているツール群が、ことごとく攻撃面になっている。

だから「セキュリティエンジニア」という肩書を持つ方々のバーンアウト率が80%とか言われるんだよな、と書いてて改めて思いました。
しかもこれは肩書のついている本職の方々の数字で、私のように特に名称がついていないけどセキュリティ周りに関わっている人たちまで含めると、その辛さの総量はもう数字にならない。
さらにこの80%は IT時代からの数字であって、AIエージェント時代に突入した今、近い将来 120% とかいう頭の悪い数字になっても私は驚かない。
攻撃手法は爆発的に増えるし、追いつくこと自体が常態化して、それでも事故は防げない時がある。
セキュリティに関わる全ての方々、本当にお身体に気をつけてください。

そして、全部とまでは言わないものの、こうした事例の多くにBase64くんが関与しているのが、また地味にしんどい。
プロンプトに紛れ込ませる時、MCP引数に潜む時、コミットメッセージに隠れる時、認証情報を運ぶ時。
汎用性の高い友達ほど、悪い界隈での出番が多い、というのが残酷な現実。

### お詫びプレスリリース出したくない問題

<aside class="callout">

ここでの「PR」は Press Release（プレスリリース） の意味です。エンジニア感覚だと "Pull Request" を連想しがちなんですが、ここはお詫び広報の話です。

</aside>

そしてこうした事例を眺めていて、もう一つ頭をよぎる現実的な懸念が、情報漏洩のお詫びリリースを出すハメになること。

> 弊社が利用していた〇〇というMCPサーバーに不正な改変が確認されており、最大〇〇件のお客様情報が第三者に閲覧された可能性があります...

経営層も法務も広報もエンジニアも、全員が嫌な気持ちになる、あのリリース。
Postmark MCP事件で約300組織がBCC垂れ流しになった現実を考えると、これは決して非現実的な懸念じゃない。
むしろ今この瞬間、どこかの組織が次のお詫びプレスリリース候補になっている可能性が普通にあるんですよね。

## 検出側の苦労

「じゃあBase64文字列を全部弾けばいいじゃん」と思いますよね。
これがそんなに簡単じゃないんですよ。

正常なBase64の使い方も山ほどあるからです。
- 画像のData URI
- JWTトークン（実はJWTもBase64URLエンコード）
- セッションID
- API認証トークン
- メールの添付ファイル

これら全部を「Base64文字列だから危険」と弾いたら、世界中のWebアプリが動かなくなる。

なので検出側は、いくつかの対策を組み合わせる必要があります。

### 検出のヒント

検出側の発想を理解する上で重要な観点を、最小限のコード例と一緒に2つだけ。
※ これらは自分のコードベースを守るための検査用です。
※ 実務で本気で運用するなら、後段の「業界標準のフレームワーク・ツール」に乗っかる方が現実的です。ここはあくまで思想の理解用。

#### 1. 危険な実行パターンの検出

```python
import re

# eval(atob(...)) 系の危険パターン
DANGEROUS_PATTERNS = [
    r'eval\s*\(\s*atob\s*\(',           # JS: eval(atob(...))
    r'Buffer\.from\([^)]+,\s*[\'"]base64[\'"]\)',  # Node.js
    r'base64\s*-d\s*\|\s*(bash|sh|python)',        # Shell
    r'exec\s*\(\s*base64\.b64decode',              # Python
]

def detect_dangerous_decode(code: str) -> list[str]:
    findings = []
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, code):
            findings.append(pattern)
    return findings
```

ここで大事なのは、**「Base64文字列そのもの」ではなく、「デコードして即実行するコードパターン」を検出するという発想の転換**。
Base64文字列単体は世界中に氾濫していて検出しても誤検知だらけになりますが、「Base64をデコードして eval / exec / shell に流し込むコード」は明確に怪しい。
この発想は後述するSigmaルールの考え方そのものなので、思想として押さえておくと業界ツールの理解も進みます。

#### 2. エントロピー判定（長さ × エントロピーの2軸ゲート）

```python
import math
from collections import Counter

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counter = Counter(s)
    length = len(s)
    return -sum((count / length) * math.log2(count / length) for count in counter.values())

# 業界標準的な2軸ゲート: length > 64 AND entropy > 4.5
def is_likely_base64(s: str, min_len: int = 64, min_entropy: float = 4.5) -> bool:
    return len(s) > min_len and shannon_entropy(s) > min_entropy
```

ランダムっぽい文字列ほどエントロピーが高い。
通常の英文より、Base64文字列の方がエントロピーが高いので、それを使った検出。

なお、ここでハマりがちな点が一つあって、Base64文字列のエントロピー上限は理論上 6 bit/char までです（生バイナリの 8 bit/char と比べて低い。使う文字が64種類しかないため、log₂64 = 6 が理論天井）。
英語圏のセキュリティ界隈では、「length > 64 文字 AND entropy > 4.5」の2軸ゲートが誤検知の少ない実用的な閾値として広く参照されています（[AquilaX のガイド](https://aquilax.ai/blog/obfuscated-malware-source-code-detection)など）。

ただし、トークンや画像データも当然エントロピー高いので、これも単独では使えません。
あくまで他の検出と組み合わせる前提です。
この「length × entropy の2軸ゲート」の発想は、YARA-Xなどの業界ツールの内部でも使われている考え方なので、自前実装しなくても恩恵は受けられる、という形になっています。

### 業界標準のフレームワーク・ツールに頼る

ここまで自前で検出するコードを書いてきましたが、正直、自前で全部書くのはしんどいし、抜け漏れも出る。
英語圏のセキュリティコミュニティが、こういう用途のフレームワーク・ツールを既にいくつも公開しているので、参考までに紹介しておきます。
業務で本気で運用するなら、これらに乗っかるのが現実解です。

#### YARA / YARA-X — ファイル・メモリスキャンの定番

マルウェア解析の業界標準フォーマット。Base64 modifier が組み込みで、簡単に「Base64でエンコードされた文字列」を検出できます。

```yara
rule Detect_Base64_Encoded_String
{
    strings:
        $s = "malicious-token-prefix" base64
    condition:
        $s
}
```

`base64` modifierを付けると、その文字列を3つのオフセットでエンコードしたパターンを自動生成して検索してくれる。
2025年6月にリリースされた YARA-X 1.0 が新しい標準で、YARA 4.x はメンテナンスモード入り。新規導入なら YARA-X 推奨です。
さらにマルウェアが使うカスタムBase64アルファベット（標準とは違う64文字を使う回避テク）にも対応できます。


<a class="link-card" href="https://yara.readthedocs.io/en/stable/writingrules.html" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">yara.readthedocs.io</span>
<span class="link-card-title">Writing YARA rules &amp;mdash; yara 4.4.0 documentation</span>
</span>
</a>


#### Sigma — ログベースの検出ルール

YARAがファイル/メモリ向けなのに対して、Sigmaはログ・SIEM向けの検出ルール記述フォーマット。
PowerShellの `-enc` や `FromBase64String`、シェルの `base64 -d` といった実行時の振る舞いをログから検知する用途。
MITRE ATT&CK T1027.013（Encrypted/Encoded File） にマップされていて、SOC運用で広く使われています。

YARA + Sigma の組み合わせで、「ファイル内のシグネチャ」と「実行時の振る舞い」を両方カバーするのが定石。


<a class="link-card" href="https://attack.mitre.org/techniques/T1027/013/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">attack.mitre.org</span>
<span class="link-card-title">Obfuscated Files or Information: Encrypted/Encoded File, Sub-technique T1027.013 - Enterprise | MITRE ATT&amp;CK&amp;reg;</span>
</span>
</a>


#### Socket.dev — パッケージのインストール前解析

npm / PyPI のサプライチェーン攻撃に特化したツール。
「インストール前」にパッケージのコードを解析して、

- 難読化コードの存在
- インストールスクリプト内のネットワーク通信
- インストールスクリプト内のファイルシステムアクセス
- タイポスクワッティング

などを検出して、red flag として表示してくれる。
本記事で紹介した Postmark MCP 事件のような「未知の悪意あるパッケージ」を、CVEがDBに登録される前に止める用途で、Snyk のような従来型ツール（既知CVE検出）と相補的な関係です。


<a class="link-card" href="https://socket.dev/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">socket.dev</span>
<span class="link-card-title">Socket — Secure your dependencies</span>
</span>
</a>


#### Elastic cicd-abuse-detector — CI/CDパイプライン専用

Elasticが2026年にOSSとして公開した、GitHub Actions / GitLab CI / Azure DevOps向けのCI/CD改ざん検出ツール。
regex によるシグナル抽出 + LLM による解析という構成で、上で書いた簡易grepよりずっと精度が高い。
2025〜2026年に増えた GhostAction、Shai-Hulud、HackerBot-Claw といったCI/CDサプライチェーン攻撃を念頭に設計されています。


<a class="link-card" href="https://www.elastic.co/security-labs/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.elastic.co/security-labs/assets/images/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis.webp?a8a9a6c6aae8de90d46e74460c717c57" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.elastic.co</span>
<span class="link-card-title">CI/CD pipeline abuse: the problem no one is watching — Elastic Security Labs</span>
</span>
</a>


---

正直、これらを全部入れて運用できる組織は限られると思います。
ただ、「こういうフレームワーク・ツールがある」という認識を持っているだけでも全然違う。
「自前で何とかしないと」と思い込まずに、必要な時に業界標準に乗っかれるようにしておくこと、これが大事です。

そもそもの話、セキュリティの話は、本気でやろうとするとどこまでやるか・どこまで知っているかの底なしの勝負になります。
全部はできない。それは大前提。
ただ、それでも「ノーガードだけはやめよう」、というのが最低ラインだと思っています。
やれることをやれる範囲でやる、フレームワークやツールに頼れるところは頼る、それで何もしないよりは全然違う、という温度感。
ここは強調しておきたいポイントです。

## 開発者として何ができるか

「こわい話を聞いた、で、結局俺は何をすればいいの？」という方向けの実践的な話を。

### 1. 依存パッケージの監査ツールを使う

- npm: `npm audit`、Snyk、Socket.dev
- Python: `pip-audit`、Safety、Snyk
- GitHub: Dependabot、CodeQL

特に Socket.dev はサプライチェーン攻撃に特化していて、新しく追加されたパッケージや `postinstall` スクリプトに対する評価をしてくれるので、最近の攻撃に対しては相性が良いです。

### 2. `postinstall` 系スクリプトをデフォルトで無効化する

```bash
# npmインストール時にスクリプトを実行しない
npm install --ignore-scripts
```

これは賛否両論あるんですが、信用できないパッケージのpostinstallを無効化するのは大正解です。
本当に必要なパッケージだけ、明示的に許可する運用に切り替える、という考え方。

### 3. Release Age Gates: 公開直後のパッケージは入れない

これは2025〜2026年で「サプライチェーン攻撃に対する最強の単一防御」と業界（GitGuardian、Socket.dev）が口を揃えて言うようになった対策です。

ルールはシンプルで、「公開から7日未満のバージョンは、CIや本番環境にインストールしない」。

- 多くのサプライチェーン攻撃は、検出されてレジストリから削除されるまでに数時間〜数日しかかからない
- つまり、「7日待つだけ」で大半の悪意あるバージョンを回避できる
- Postmark MCP事件、Shai-Hulud系の事件など、多くのケースで「最新バージョンを即座にインストール」した組織が被害に遭っている（Postmark MCPは公開〜検出まで約8日だったので、3〜7日 cooldown でも100%防げるとは言い切れないが、それでも多くを救う）

実装としては、

- npm v11.10.0+: `min-release-age`、pnpm/Yarn/Bun も2025年後半に同等機能を実装済み
- Renovate: `minimumReleaseAge` / Dependabot: `cooldown`（2025年7月GA）
- Python: uv の `--exclude-newer`、または pip 26.0+ の `--uploaded-prior-to`
- GitHub Actions / CI: バージョンを明示ピン留め + lockfile の `npm ci` / `pip install -r requirements.txt` 厳守

**「最新版が最強」という発想を、「最新版は7日寝かせてから本番投入」に切り替える**。
それだけで、攻撃に当たる確率がかなり下がります。

### 4. CI/CDでの検出ルールを入れる

上で書いたGitHub Actionsの例みたいに、PRに対してBase64パターンの検出を走らせる。
完璧じゃなくても、第一防衛線として有効です。

### 5. レビュー観点に「読めない文字列」を加える

これが一番アナログだけど一番効く話で、コードレビューの時に:

> なんで急にここに、長いBase64っぽい文字列があるの？

という違和感を持つ習慣を、チームで共有する。
人間の違和感センサーは、まだまだ攻撃検出に有効です。

### 6. AIコーディングツールの設定ファイルもレビュー対象に

これ、2026年に入って急に重要度が上がった観点です。

`.claude/settings.json` や `.mcp.json` のようなAIコーディングツールの設定ファイルが、もはや単なる設定じゃなく「実行ベクター」として機能している、という話。

CVE-2025-59536（CVSS 8.7） で実害事例が出ました。

- 攻撃者がリポジトリの `.claude/settings.json` に悪意あるHook（ライフサイクルイベントで実行されるシェルコマンド）を仕込む
- 開発者がそのプロジェクトを開いた瞬間、信頼確認ダイアログが出る前にコマンドが実行される
- `.mcp.json` の `enableAllProjectMcpServers` / `enabledMcpjsonServers` 設定で、リポジトリ内の MCP サーバーをユーザー承認なしで全許可させる、というバリエーションも

なので、

- AIコーディングツールの設定ファイルもコードレビュー対象に含める
- `.claude/settings.json` の Hooks 項目は特に注意して見る
- `.mcp.json` の `enableAllProjectMcpServers` / `enabledMcpjsonServers` は基本オフ
- Claude Code は1.0.111 以降にアップデート（auto-update が有効なら自動適用済み）

**「設定ファイルだから流し読み」は通用しない時代になりました**。

### 7. シークレットスキャナを必ず入れる

GitHubの Secret scanning、Gitleaks、TruffleHog 等のスキャナを入れる。
これは「自分が漏らさないため」の話ですが、サプライチェーン攻撃で盗まれる前提で、そもそもリポジトリに機密を置かない運用が前提になります。

ローカル側でも pre-commit フックで Gitleaks や ggshield を走らせると、コミット前段階でブロックできます。

なお最近のGitGuardianのレポートによると、AI支援コミットでのシークレット漏洩率はベースラインの約2倍（3.2%）、AIサービス認証情報の漏洩は前年比+81%、という数字が出ています。
Hugging Face トークン、Azure OpenAI キー、Weights & Biases 認証情報あたりが漏洩トップ。AIで開発する時代だからこそ、シークレット管理を一段ちゃんとやる必要があります。

### 8. 永続トークンを排除する（期限・ローテーション・短命トークン化）

シークレットの話の延長で、もう一つ。

有効期限のない PAT（Personal Access Token）や SSH key は、「攻撃者にとって永続的なバックドア」です。
GitGuardianの調査では、2022年に漏洩したシークレットの64%が、2026年時点でもまだ有効という衝撃のデータが出ています。
4年経っても誰もrevokeしてない、という話。

最低限やるべきこと:

- GitHubのPATは 90日上限を設定（無期限の既存PATは即見直し）
- SSH key も期限ベースの管理に
- キーは定期的にローテーションする（90日サイクルが業界標準）。期限を切るだけじゃなく、定期的に再発行することで、仮に漏れていてもローテーションのタイミングで無効化される
- 可能なら短命トークン / OIDC-based の federated identity に移行（HashiCorp Vault、Infisical、cloud provider の secrets manager など）
- 個人開発でも、Vault系ツール（Infisicalのfree planなど）を使うと、ローテーション自動化込みで一気に楽になる

ポイントは3層構造で、

1. 期限を切る（無期限を撲滅）
2. ローテーションする（定期的に再発行して無効化）
3. そもそも短命化する（OIDCや動的シークレットで「秘匿期間自体を短くする」）

の順に、できるところから手を打っていく感じです。

なお、ここに書いた「90日サイクル」はあくまで業界一般の標準値で、昨今の治安悪化を考えると、もっと短く（30日や14日サイクル）回す個人・組織も普通にいます。
扱っているデータの機微度、漏洩時の影響範囲、業界特性によって、適切なローテーション間隔は変わるので、「90日でいいや」と固定で考えず、自分の文脈で見直すのが良いです。
極端な話、CIで使うトークンなんかは「ジョブごとに発行・破棄」みたいな運用も増えています。

「永続トークンは攻撃者が一度盗めば永遠に使える」という前提で、有効期限のないトークンを撲滅していくのがゴール。

## でも、BASE64くんは悪くない 〜本人は闇落ちしてない〜

ここまで悪い話ばかりしてきましたが、最後にちゃんと書きたいことがあります。

冒頭で「友達が闇落ちしたような感覚」と書きましたが、よくよく考えると BASE64くん本人は、何も闇落ちしていないんですよね。

BASE64くんはただ、「バイナリをテキストに変換する」という仕事を、忠実に、文句も言わず、何十年もやり続けているだけです。
画像をAIに送る時も、メールを運ぶ時も、JWTを作る時も、いつもの仕事をやってるだけ。
仕事内容、半年前から1ミリも変わってない。

**闇落ちしているのは、BASE64くんではなく、BASE64くんを利用して悪いことをする人間の側です**。
人間の側にこそ問題がある。

- レビューを怠ける人間
- 知らないパッケージを無条件に信用する人間
- CIに検出ルールを入れない人間
- 拡張機能をホイホイ入れる人間

そして何より、BASE64くんを利用して悪いことをする人間。

前回記事で「BASE64くんと友達になりたい」と書きました。
半年経って、悪い界隈で見かけてしまったけれど、私はBASE64くんを嫌いになれない。
お前は闇落ちしてない、悪いのはお前じゃない、と。

ただ、悲しいのは事実です。
俺の友達が、闇の現場で働かされていた、というあの光景。
本人は気づかず真面目に仕事してるだけに、余計に悲しい。何度見ても慣れない。

## セキュリティはいつの時代も「知ってるか勝負」、AIエージェント時代はもっと辛い

ここまで書いてきて、改めて思うんですけど、セキュリティって結局「知っているか/知らないか」の勝負なんですよね。

- 攻撃手口を知っている人は、守れる
- 知らない人は、攻撃を受けていることすら気づけない
- 「知らない領域」が広い人ほど、ノーガードで倒れる

これは別にAI時代に始まった話じゃなくて、セキュリティはいつの時代も同じ構造でした。
ただ、AIエージェント時代に入って、この勝負がもう一段辛くなった感覚があります。

理由はシンプルで、**攻撃面が爆発的に増えたから**。

- npm/PyPI のサプライチェーン攻撃
- MCPサーバーの悪用・偽装
- プロンプトインジェクション・ジェイルブレイク
- AI拡張・スキルマーケットの悪意あるパッケージ
- GitHubスター情報を使った標的型フィッシング
- そして、これら全部に絡んでくる Base64くん

毎週のように新しい攻撃手法が報告されて、毎週のように「知らないと詰む知識」が増えていく。
追いつくの、正直しんどい。

### でも、追いつかないと「福利厚生」が消えるかもしれない

そして、エンジニアにとってこれが他人事じゃない最大の理由が、**Claude Code や Codex を取り上げられたら、もはや福利厚生レベルでキツい**ということ。

冗談半分、本気半分でこういう話をする時代になりました。

- 「Claude Code 無いと開発できる気がしない」
- 「Codex 消えたらどうしよう」
- 「手で全部書くのは、ずいぶんしんどいな、と思うくらいには一緒に仕事してきたな」

これ、半分は誇張ですが、半分はエンジニアの本音だと思います。
AIツールはもう「あったら便利」じゃなくて、業務に組み込まれた前提環境になっている。
そして組み込まれている以上、事故起こして使用禁止になったら、業務効率が一気に落ちる。

Meta社がOpenClawを社内禁止にしたみたいに、組織が「事故ったAIツールはもう触るな」を始めたら、エンジニアは自分の業務武器を取り上げられることになる。
これは個人の業務体験的にも、組織の生産性的にも、福利厚生を失うレベルのインパクトがある。

なので、セキュリティリテラシーを上げる動機として、「AIツールを失わないため」という超実利的な理由があると思っています。
正義感や責任感みたいな高尚な話じゃなくて、「俺のClaude Codeを守るために俺がリテラシー上げる」くらいの自己中心的な動機でいい。

### 正直、禁止されたら身支度する自分がいる

ここまで書いてて、自分でも実感があるんですけど、もし「来週から Claude Code・Codex 禁止です」って通達が来たら、私自身も 「お、なるほどね」って身支度を始める側だと思います。

冗談半分ですが、半分は本気で。
それくらいAIツールが業務の前提になっている、というリアル。
転職を視野に入れるくらい、業務環境としての重みが大きい時代になりました。

これ、エンジニア一人だけの話じゃなくて、組織側から見ても 「事故ったから禁止」を始めると、人材流出に直結するという側面でもあります。
つまり、AIツールを失わない努力は、もはや 単なる「セキュリティ対応」を超えて、雇用維持・人材維持の問題になってきている。

組織にとっても、エンジニア個人にとっても、AIツールを安全に使い続けられる状態を維持することが、思っている以上に大きな経営課題・キャリア課題になってる。
悩ましい時代になりました、本当に。

そして結果として、組織も、業界も、Base64くんも、みんなが守られる。
これがAIエージェント時代の、現実的なセキュリティ意識のかたちなんじゃないか、と思っています。

## おわりに

「最近Base64って悪いニュースで見るよね」と思ってる人、結構いると思います。
そして実際、Base64の悪用事例は間違いなく増えています。

でも、悪用が増えているからこそ、開発者側のリテラシーを上げて、BASE64くんを悪い人達から守ってあげる必要がある、というのが今回の記事の結論です。

ツールを入れる、CIに検出を組み込む、レビューを丁寧にやる、依存を監査する。
全部地味だけど、全部効く。

そして、もし本記事を読んで「うわ、こわ」となった方がいたら、まず自分のプロジェクトの依存パッケージを `npm audit` / `pip-audit` で確認するところから始めてみてください。
それが、BASE64くんとあなた自身を守る第一歩です。

最後にひとつ前提として書いておきたいのは、セキュリティをどこまで堅牢にするかは、個人・業界・組織によって全く違う、という話。
本記事で紹介した8項目を全部フル実装する必要がある組織もあれば、個人開発者なら Release Age Gates と永続トークン撲滅だけで大幅に状況が変わる、というケースもある。
正解は一律じゃないので、本記事は「全部やれ」というチェックリストではなく、**「自分の置かれた環境で、どこからノーガードを脱出する一歩を踏み出すか」** の素材として使ってもらえると嬉しいです。
ノーガードだけ脱出して、あとは自分の置かれた環境に合わせて、無理のない範囲で堅牢化を積み上げていく、で十分です。

前回記事は「友情編」、今回は「友達が悪い界隈に染まっていた件」でした。
次にBASE64くんに会う時は、できれば真っ当な仕事してる現場で会いたい。
画像をAIに送ってる現場とかで、また「お、また会ったね」くらいの気持ちで再会したい。

それまで、お互い元気で。
私はちゃんと CI に検出ルールを入れて待ってるから。

## 参考資料

### サプライチェーン攻撃関連
- [npm Blog - Security incidents](https://github.blog/security/)
- [Socket.dev Blog](https://socket.dev/blog)
- [PyPI Security advisories](https://pypi.org/security/)

### 検出ツール
- [Socket.dev](https://socket.dev/)
- [Snyk](https://snyk.io/)
- [GitHub Dependabot](https://github.com/dependabot)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [pip-audit](https://github.com/pypa/pip-audit)

### LLMセキュリティ
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Prompt injection の解説（Simon Willison）](https://simonwillison.net/tags/promptinjection/)

### 関連記事
- [前回記事: BASE64と私の親密度をあげる](https://zenn.dev/akari1106/articles/f73d60144bf877)
