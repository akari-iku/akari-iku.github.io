---
title: 深夜に中指を立てたおじさんとあって、少し救われた話
description: 「Why Git Won?」
date: '2026-01-31'
tags:
  - github
  - ポエム
  - オープンソース
  - エンジニアリング
lang: ja
source: zenn
accent: '#00A0E9'
---

<!-- generated from articles/zenn/2026-01-31-git-github-history.md by scripts/import-articles.ts - do not edit -->

## はじめに：深夜に中指を立てたおじさんと会う

「Why Git Won?」

<a class="link-card" href="https://www.youtube.com/watch?v=Uq41qdjJ8Xs&amp;t=520s" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.youtube.com</span>
<span class="link-card-title">The Untold Story of Git</span>
</span>
</a>


初手から戦闘力を計るスカウターぶっ壊れるようなYouTubeのサムネで失礼します。
いや深夜に笑わすな。元気出たけど。

深夜に自分のキャリアの方向性の整理とか、GitHubの歴史が気になって調べていたら、AIがこのサムネをお出ししてきました。

ちなみに私は、今まで主業務をしながら開発をちょっとする、という感じの生き方をしてきました。
今でいうBizdev的なポジション。
エンジニアという名称を背負って働いてこなかったし、Biz8割Dev2割でした。体感の割合的に。
それが最近Biz6割Dev4割くらいになってきて、名称がやっとこさ「エンジニア」になりました。

だから、「エンジニアとは何か」みたいなのが気になるお年頃なのです。

話を戻して。
サムネの~~おじさ~~…おじさまは、Linuxの生みの親リーナス・トーバルズ氏。
カメラに向かって**中指を立てています**。

令和の日本ではコンプラ大炎上待ったなし。
いや、むしろ現代じゃなくても大議論大会待ったなしですね。

愉快すぎるだろ、こういうパンチ効いた人私好きだよ、結構。

ビジネスとしては、まああんまり褒められた光景ではないですが、これこそがエンジニアという生き物の本質なのかもなんて思った話です。

そして、この中指おじさんに出会って、私はちょっとだけ救われたのです。

今も学生時代も私は、なんやかんやGitHubで基本的にコード管理はしてます。（使える環境の場合は、だけども）そういや、GitHubが出る前のエンジニアたちってどうしてたんだ？と思い調べるか、これが事の流れというか、はじまりです。

---

## 地獄の時代――ロック制とカオスの2000年代初頭

### 当時の地獄：ツールはあったが「ロック制」だった

2000年代初頭、CVSやSubversion（SVN）といったツールはありましたが、今とは仕組みが決定的に違いました。

**早い者勝ちの「ロック」：**

誰かがファイルを編集している間、他の人はそのファイルを触れません。
**「〇〇さん、早くindex.jsのロック解除して！」** と叫ぶ声がオフィスに響いてたそうな。

Excelの「誰かが開いているので読み取り専用です」が、全ファイルで起きていたのが2000年代初頭です。

カオスすぎるし、めちゃくちゃ嫌すぎる。
この時代を生きてたエンジニアは、菩薩の精神でも宿ってないとやってられんって。

**オフライン不可：**

常に中央サーバーに繋いでいないと履歴が見られない。
電車の中やカフェでコードを書くのは至難の業。

現代のリモートでお仕事とかもだけど、ローカル環境でしか作業やれない界隈で現役で生き残ってるエンジニア、かっこよすぎるな…。
業界とかによっては、今も基本オンラインとかネット接続NGとかあるけども。

### 究極のアナログ管理法：メールとパッチ

Linuxカーネルのような巨大プロジェクトですら
当時は：
- **コードの修正内容をメールで送る**
- **リーダーが手作業で合体させる（マージ）**

今では考えられないほどアナログな手法で動いていたんですね。
今でもメールでタスク管理してるとかは聞くけど、多分私気が狂うよ。

---

## Gitの誕生――10日間で世界を変えた怒り

2005年、Linuxカーネル開発で使っていた「BitKeeper」が無料版を終了しました。

### リーナスの怒り

リーナス：「既存のツールに満足できない。もっと速くて分散型のツールが必要だ」

そして**わずか10日間で原型を作り上げました。**

これエンジニア要素持ちのいつものパターンです：

1. 既存ツールがクソ → 腹が立つ
2. 「俺がなんとかする」→ 勢いで作る
3. 作ってる最中は楽しい（こともある）
4. 結果、世界を変える

Gitはこうして、**怒りから始まり、楽しさで完成しました。**

多分特有のアドレナリン出てたろうなって思います。
業務効率改善だのツール作るのだの、ワークフロー構築するだの、アーキテクチャ考えるぞ～とかの時の心理割とこれ。なんとかするぞ、うおおおでやってる気がするという内省。

---

## GitHubの誕生――週末プロジェクトが世界を変えた

**2007年10月19日**
Chris Wanstrath、Tom Preston-Werner、PJ Hyettの3人が、週末のプロジェクトとして開発を開始しました。

彼らの動機：
「Gitは最高だけど、操作が難しい。もっと簡単にコードを共有し、協力し合える **『SNSのような場所』** が必要だ」

**2008年4月10日**
GitHub.com正式ローンチ。最初のオフィスはサンフランシスコのカフェでした。

▼**参考**
- [GitHub - Wikipedia](https://en.wikipedia.org/wiki/GitHub)
- [How this 33-year-old college dropout co-founded GitHub, which just sold to Microsoft for $7.5 billion - CNBC](https://www.cnbc.com/2018/06/04/chris-wanstrath-co-founded-github-which-microsoft-bought-for-billions.html)

### Pull Requestという革命

- 他人のコードを「フォーク（コピー）」
- 修正して「取り込んで！」とリクエスト
- オープンソースコミュニティに革命を起こしました

**爆発的な成長：**
- **2011年：** ユーザー数100万人突破
- **2012年：** Andreessen Horowitzから1億ドルの出資

なんだかんだ、2007年生まれなんて実はめちゃくちゃ若いな、なんて思ってしまいました。
まだ可愛い盛りの青年ラインとかじゃん。

### オクトキャット誕生秘話：理想と現実のぶつかり合い

GitHubのマスコット「オクトキャット」。

実は：
- 創業者が有料画像サイトで見つけたイラストを買い取った
- 最初は「**Octopuss**」という名前で商標登録しようとした
- 色々あって（商標のゴタゴタ）今の「**Octocat**」に落ち着いた

深い意味は後付け。

**「好きで作った週末プロジェクト」が本気でビジネスになる時、現実とぶつかる。**
商標登録で躓く人間臭さが、なんとも愛おしいです。
商標取ってリリースしないと、後がややこしくなりがち。

**「好きでやってる奴らには敵わん」の精神がここにあります。**

---

## リーナスの中指と10年越しの勝利

2012年、フィンランドでの講演で事件は起きました。

質問者が「NVIDIAのLinux用ドライバについてどう思うか？」と聞いたとき、リーナスは答えました。
記事の最初のサムネはこれ。中々公共の電波で一応は、会社の名義で呼んでもらっているはずなんですけどね。
コンプラ周り担当している人は、頭抱えたけど「リーナスだからまあ…起きてしまったし仕方ないか」と悟った気がする。

- 「NVIDIAは私たちが取り組んできた中で**最悪の企業だ**」
- **「Fuck You, NVIDIA!」**
- カメラに向かって中指

理由：NVIDIAがオープンソースドライバを提供せず、Linuxコミュニティに協力的でなかったから。

▼**参考**
- [Linux開発者リーナス・トーバルズ氏がNVIDIAに対し中指を突き立てFワード発言 - GIGAZINE](https://gigazine.net/news/20120618-linus-nvidia-f-word/)
- [Linus Torvalds Calls NVIDIA The Worst Company Ever - Phoronix](https://www.phoronix.com/news/MTEyMTc)
- [Linus Torvalds to Nvidia: "F**K You!" - SiliconANGLE](https://siliconangle.com/2012/06/16/linus-torvalds-to-nvidia-fk-you/)

**そして2022年。**
NVIDIAはついにLinux向けオープンソースドライバをリリースしました。

**10年越しで、リーナスの中指が勝ったのです。**
ちなみに右手中指の指輪には、直感力・行動力・魔除け（邪気払い）の意味があり、仕事での成功や厄除け、迷いを断ち切りたい時、強力なパワーを発揮するお守りとして効果的とされるとか。
ちょっとしたスピリチュアルな話。

また、金運アップや、確実な判断力を高めたい場合にも適した位置なそうな。
とはいえ、俺らはまあ気軽にこの指を人にはそうそう向けられん。
心の中ではトミーガンを振り回しててもね。

---

## Microsoftの買収。敵が守護者になった日

**2018年、Microsoftが75億ドルでGitHubを買収しました。**

実はMicrosoft、過去に**任天堂にも買収を持ちかけて門前払い**されています。

2000年1月、MicrosoftのKevin Bachus（当時third-party relations director）が任天堂に買収を持ちかけたときの証言：

> 「彼らはただ笑い転げていた。1時間ずっと誰かに笑われ続けることを想像してみてほしい。あのミーティングはまさにそんな感じだった」

京都、やはりそういう所ある。

さらにMicrosoftは諦めず、「任天堂のハードウェアはクソだから、俺たちがハードを作る。任天堂はマリオとかのソフトだけ作ればいい」という提案もしたそうです。

これはちょっとまあ提案が下手くそというか、任天堂という組織への当たり方が良くないね。
まあ結果これも断られました。
結構な米帝様プレイ、と言ったところだ。

▼**参考**
- [Microsoft tried to buy Nintendo, but got laughed out of the room - Engadget](https://www.engadget.com/microsoft-wanted-to-buy-nintendo-145746874.html)
- [Microsoft Tried to Buy Nintendo Before Releasing the First Xbox - ComicBook.com](https://comicbook.com/gaming/news/microsoft-tried-to-buy-nintendo-before-first-xbox/)

当時のMicrosoftは：
- 「オープンソースは癌」と公言
- Linuxを敵視
- 「支配」と「独占」のイメージ

確かに大きな組織ですし、利益を追うものとしては色々あるが、ブランドを鼻にかけちゃ得たい結果も得られない。
そんなMicrosoftがGithubを買収するという話は、開発者コミュニティは「終わった」と大騒ぎしました。
当時の私もボヤいた気がする。

▼**参考**
- [Ballmer: 'Linux is a cancer' - The Register](https://www.theregister.com/2001/06/02/ballmer_linux_is_a_cancer/)（2001年6月1日、Chicago Sun-Timesインタビューより）
- [Microsoft president admits the company was on 'the wrong side of history' with open source - PC Gamer](https://www.pcgamer.com/microsoft-president-admits-the-company-was-on-the-wrong-side-of-history-with-open-source/)

### MicrosoftがGitHubで成功した「異常なまでの慎重さ」

Microsoftは、かつて**オープンソースを癌（がん）** とまで呼んで敵対していた過去があります。

しかし、2020年にはMicrosoftのBrad Smith社長が「Microsoftは、オープンソースが世紀の初めに爆発的に広がったとき、歴史の誤った側にいた。これは私個人についても言える」と認めました。
資本じゃ買えないものもある、という失敗と学びを得た、というと綺麗ですかね。

だからこそ、GitHubを買収する時は**嫌われないことに全力を注ぎました。**

**成功の鍵：**

**1. 「独立性」の死守**
- 「**Microsoft GitHub**」という名前にしなかった
- CEOも独立して運営させた
- 理由：独立性の維持、既存ユーザーの信頼を守る

Microsoftの十八番「Microsoft 〇〇」にしなかったのは、当時の荒れ具合と既存ユーザーに残ってもらうための戦略だったのかもしれません。

**2. 「奪う」のではなく「与える」**
- 普通、買収したら元を取るために有料化
- Microsoftは逆に**無料枠を広げる**
- エンジニアが一番喜ぶプレゼントを最初に持ってきた

**3. 「ドッグフーディング」（自分で使う）**
- Microsoft自身が、自社の最も大事な資産（Windowsのソースコードなど）をGitHubに移した
- **俺たちも同じ船に乗るよ**という姿勢
- これが最大の信頼獲得に繋がったのかもしれません

**この数年間は、IT業界でも屈指の「大成功した買収劇」と言われています。**
かつての「オープンソースの敵」というイメージを、見事に払拭しました。

▼**参考**
- [Microsoft $7.5 billion acquisition of GitHub](https://www.mergersight.com/post/microsoft-7-5-billion-acquisition-of-github)
- [How GitHub Democratized Coding and Found a New Home at Microsoft](https://nira.com/github-history/)

**対照的な失敗例：オープンソース買収の地獄**

同じような買収劇でも、やり方を間違えるとコミュニティは一瞬で崩壊します。
ようはそこにいる「使う人間」がいなくなる、というサービスとしての本末転倒、というやつ。

**MySQL（Oracle買収）の悲劇：**

2010年、OracleがSun Microsystemsを買収し、その一部としてMySQLも手に入れました。しかし、オープンソースコミュニティは激怒。「Oracleは自社の商用データベースを守るために、MySQLを殺すつもりだ」という疑念が広がりました。

結果：MySQL創始者のMichael "Monty" Wideniusを含む開発者たちが次々と離脱。MySQLをフォークして**MariaDB**を作りました。今やMariaDBは、Wikipedia、Google、RedHatなど多くの企業で採用され、MySQLの代替として成長しています。

**Dockerの苦悩：**

コンテナ技術を一般化させたDockerは、圧倒的なコミュニティ支持を得ていました。しかし、マネタイズに苦戦。無料ユーザーは多いのに、課金ユーザーが増えない。焦った経営陣が方針を二転三転させ、コミュニティとの信頼関係が揺らぎました。

結果：一部の開発者がKubernetesなど他のエコシステムへ比重を移し、Dockerの「絶対的な中心」という立ち位置は薄れました。もちろん、Dockerは今もエンタープライズで現役ですし、技術としては健在です。ただ、「コミュニティの熱狂」という意味では、ピーク時ほどの勢いは失われました。

コミュニティ系サービスというか、人が集まって作っていく、使っていくITに限らず、サービス全般に言えます。
人を手放すような事は、利益を出しずらく本当に個人開発や道楽に近いものじゃなければいつかは終焉が来る。
先日のZennもですが、特に開発力のある人を集めるコミュニティは結構やり方ミスると「俺が作る」が出来る人たちが多い故に終焉への一歩を踏みがちです。


<a class="link-card" href="https://zenn.dev/akari1106/articles/993e42b4430f36" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--ArWI8tJu--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:Zenn%25E3%2581%25AE%25E8%2587%25AA%25E5%258B%2595%25E7%25BF%25BB%25E8%25A8%25B3%25E6%25A9%259F%25E8%2583%25BD%25E3%2581%258B%25E3%2582%2589%25E5%25AD%25A6%25E3%2581%25B6%25E3%2583%2597%25E3%2583%25AD%25E3%2583%2580%25E3%2582%25AF%25E3%2583%2588%25E9%2596%258B%25E7%2599%25BA%25E3%2581%25AE%25E9%259B%25A3%25E3%2581%2597%25E3%2581%2595%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E7%2581%25AF%25E9%2587%258C%2528akari%2529%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzkxZTcxYTI4M2EuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">Zennの自動翻訳機能から学ぶプロダクト開発の難しさ</span>
</span>
</a>



**Microsoftの勝因：インフラを抑える戦略**

対照的に、MicrosoftはGitHubを「殺さず」「独立させ」「インフラとして育てた」のです。

GitHubは今や、世界中の開発者が「当たり前に使う」インフラです。個人の趣味プロジェクトから、Fortune 500企業の基幹システムまで、すべてがGitHub上で動いています。
なんなら今のAIと一緒に開発が出来る時代になったので、非エンジニア層や、今までプログラミングなどはしなかった層の流入もあります。

つまり、Microsoftは「GitHubというインフラを支配する者」になったのです。

インフラを抑えれば：
- エンジニアの動向がすべて見える（どの技術がトレンドか、誰が優秀か）
- AI開発に必要な良質なコードデータが手に入る
- 企業がGitHubに依存すればするほど、Enterpriseプランへの移行圧力が高まる
- Azure、Copilot、VS Codeなど、自社製品へのオンボーディングが自然にできる

Microsoftは「GitHubという秘密基地を壊さない」という選択をしました。

### Microsoftの「下心（戦略）」：したたかすぎるWin-Win

Microsoftは、GitHub単体での黒字化以上に、**もっと大きな戦略**を持っています。

**GitHubはどうやって稼いでいるのか？**

これが気になるよね。ビジネスとして、サービスとしてどうやって成り立ってるのかね？と。

**現在の主な収益源：**

1. **GitHub Enterprise（法人向け）** → 最大の収益源
   - 企業：「GitHubが潰れたら開発止まる。お金払ってサポート受けよう」
   - 1ユーザー月額数ドル × 数千人規模

2. **GitHub Copilot（AI開発支援）** → 急成長中
   - 個人：月額10ドル
   - 法人：1ユーザー月額19ドル〜
   - 「月1,500円で爆速になれるなら安い」と課金者続出

3. **Marketplace / Sponsors** → エコシステム構築

**Microsoftの本当の狙い：**

| 戦略 | 内容 |
|---|---|
| **Azure誘導** | GitHubで書いたコードを、そのままAzureへ簡単公開 |
| **開発データの宝庫** | 世界中の良質なコードでAI学習 → Copilot爆誕がめちゃくちゃ早かった |
| **若手の青田買い** | 学生がGitHubを使い倒す → 大人になってもGithub |
| **企業の標準化** | みんな使ってるから、企業も導入せざるを得ない |

**結論：無料ユーザーは「広告塔兼テストプレイヤー」**

無料ユーザーが多ければ多いほど、そのプラットフォームは「標準」になります。

みんながGitHubを使っているから、企業もGitHubを導入せざるを得ない。

つまり、**私たちが無料で使えば使うほど、GitHubの企業価値が上がっていく**という、実に見事なビジネスモデルです。一種の芸術的な美しさすら感じる。あんまり個人としては好きではないけれど。
ビジネスモデルとしては、非常に美しいな、と。

「タダほど高いものはない」と言いますが、GitHubの場合は：

**「タダで使わせて、企業のインフラとして君臨する」**

**「支配」じゃなくて「支援」。でも、したたかに儲ける。**

---

## エンジニアという生き物の多様性

GitHubの歴史を辿ると、色々な「エンジニアの生き方」が見えてきます。

### リーナス：素直すぎる誠実なエンジニア

- 中指立てて主張する
- 技術の正しさで10年後に勝つ
- 2025年の発言：「AIは過剰宣伝だが、ツールとしては信じている」
- 「10年後にロボットに殺されたら私の負け（笑）」

**北欧メタル理論：フィンランドという土地**

リーナスのこの生き方。
実は、彼の出身地フィンランド（北欧）という土地に根ざしているのかもしれません。

俗説ではありますが、「北欧メタル理論」というものがあります。

> 「北欧は日照時間が少なく、外で遊ぶ時間が少ないから、地下にこもってギターの練習ばかりしている」などと、まことしやかに言われてましたが本当だったんですね（笑）。それから北欧の人は、「クラフトマンシップ」が高いというか、職人気質の人が多い、という話。

長い冬、閉鎖的な環境、豊かな社会の静けさ。
そんな北欧特有の背景が、メロディアスで叙情的、時には暗く激しい音楽性を生み出すと言われています。

これ、メタルだけじゃなくて、エンジニアリングにも当てはまる気がしませんか？

地下にこもって何かに没頭する。職人気質で、細部まで徹底的にこだわる。
そして、静かな怒りを内に秘めながら、美しいものを作り上げる。

リーナスが10日間でGitを作り上げた集中力。
NVIDIAに中指を立てながらも、10年後に技術で勝つという執念。

これはまさに、「北欧的クラフトマンシップ」なのかもしれません。

▼**参考**
- [北欧メタルはなぜ生まれた？ フィンランドのフォークメタルバンド、コルピクラーニに訊く - FIKA](https://fika.cinra.net/article/201710-korpiklaani)

### Dario Amodei（Anthropic CEO）：真剣な責任者

- 100ページ超のエッセイでAIリスクを徹底分析
- 「人類の技術的思春期」という表現
- Constitutional AI（AIの憲法）を真剣に設計

最近の怒涛のポエムという名のビジネス寄りの発信。


<blockquote class="tweet-card">
<p class="tweet-card-text">The Adolescence of Technology: an essay on the risks posed by powerful AI to national security, economies and democracy—and how we can defend against them:</p>
<footer class="tweet-card-meta"><span>Dario Amodei @DarioAmodei</span><a href="https://x.com/DarioAmodei/status/2015833046327402527" target="_blank" rel="noopener">2026-01-26 · x.com →</a></footer>
</blockquote>


彼もまた面白い人間で、2019年にMicrosoftとOpenAIが行った事業に関する方向性の違いによりOpenAIを去ったりしてます。妹さんと一緒に。
Microsoft、学んだって言ったけど、やっぱ根っこがちょっと…かもしれない……。

**どちらも正しいと思う：**
- リーナス = 実装者（手を動かす人）
- Dario = 開発者の責任（作る側の覚悟）

---

## 結び：リーナスの法則――楽しいから手を動かす

「リーナスの法則」という考え方があります。その原点でもある表現が良かったな、というので結びです。

> 「生存（お金）のためでも、社会生活（承認）のためでもなく、**楽しい（興味）から手を動かす**」

Gitも、Linuxも、誰かに頼まれたわけじゃありません。
「既存のツールがクソだから、面白そうだから、作っちゃった」。

GitHubが愛される理由も同じかな。

- 「みんなで好きで楽しくやってる」場所
- 「作ったからみてみて！」という純粋さ
- 「好きでやってるやつらには敵わん」の精神

深夜に出会った中指おじさんは、私にこう教えてくれました。

エンジニアという生き物は、怒りから始まり、楽しさで完成させる。
パンクな姿勢で主張しながら、健やかに技術の正しさで勝つ。

パンクとメタルは違うけど、どちらにも共通するのは「健やかに自分らしく生きる」という姿勢。

**自分の信念を曲げない。主流に媚びない。でも結果的に正しいものを作る。**

もしかしたら、これこそがエンジニアリングの本質なのかもしれません。

そのためには？
まあ一生勉強だよね、ってのはそれはそう。

深夜に自分の作った可愛いエージェントを、技術無理解な人間の畑に置いていかざるを得なくて転職した事を思い出して、深夜にわんわん泣いてた私もちょっとだけ救われた、そんな話。

Kiitos paljon Linus.

【追記】
テストコードを汚物呼ばわりしたことや「Gitコミット時にクソみたいなリンクをつけるな」というメッセージを送信したことが2025年の去年話題になってたけど、コンクラーベするぞ！は引退に備えて中心人物の移行手順は大事だけど、ユーモアありすぎるだろ。
好きになっちゃった。外部だからわやわや言えることかもだけど。


<a class="link-card" href="https://gigazine.net/news/20260129-linux-conclave-linus-torvalds/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://i.gzn.jp/img/2026/01/29/linux-conclave-linus-torvalds/00.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">gigazine.net</span>
<span class="link-card-title">リーナス・トーバルズの後任を決める緊急時対応計画をLinuxカーネル開発コミュニティが策定、ファイル名は「コンクラーベ」</span>
</span>
</a>
