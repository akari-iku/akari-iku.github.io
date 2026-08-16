---
title: Cloudflareの無料戦略をAWSもAkamaiも真似できない理由
description: >-
  前回「Cloudflareは通り道を支配している」と書いたら、じゃあAkamaiやAWSはなぜ同じビジネスモデルを取らないのかという質問をもらいました。答えはどこにも書いていないので、決算・買収履歴・独禁法に散らばったヒントを拾って、取りたくても取れない理由を組み立てます。
date: '2026-08-16'
tags:
  - cloudflare
  - aws
  - akamai
  - 戦略
  - アーキテクチャ
lang: ja
source: zenn
accent: '#00A0E9'
---

<!-- generated from articles/zenn/2026-08-16-cloudflare-free-strategy-moat.md by scripts/import-articles.ts - do not edit -->

## はじめに

前回、こういう記事を書きました。


<a class="link-card" href="https://akari-iku.github.io/blog/cloudflare-design-philosophy/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/blog/cloudflare-design-philosophy.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">Cloudflareは16年間ずっと同じことをしている。「通り道を支配する」という設計思想の話 | akari.log</span>
</span>
</a>


Cloudflareの16年間は全部ひとつの原理で説明できる、という話です。トラフィックの通り道に自分が立って、そこで全部処理する。CDNもDNSもWorkers（Cloudflareの拠点上でコードを動かす実行環境）もZero TrustもAIクローラー課金も、全部そこから出てきている、と。

ありがたいことにけっこう読まれまして、感想もいろいろもらいました。Akamaiの名前は何度か出てきたんですが、いちばんはっきり書いてくれていたのがこれです。

> ずっとCloudflareのビジネスモデルがいまいち理解できてなくて改めて調べるけど、やっぱりまだ理解しきれた感がなくて誰かさらなる解説が欲しい
> 特にAkamaiとかAWSとか他のCDN・クラウド事業者ではどうしておなじ戦略取りにくいのかとかその辺とか

いい質問すぎる。技術というよりビジネスとしての疑問で、前回の記事では意図的に触れなかった部分でもあります。1本に詰め込むと確実に破裂するので。

なので今回はそのおまけです。**なぜ他社は同じ戦略を取らないのか**。というより、**取りたくても取れないのか**。

## 答えは技術資料に書かれていない

「Cloudflareのビジネスモデルが理解しきれない」となるのは、たぶん探している場所の問題です。この問いの答えは技術ドキュメントの中に**書いていない**んですよ。アーキテクチャの解説をいくら読んでも、なぜAkamaiが同じことをしないのかは分かりません。ヒントが置いてあるのは、決算と、規制と、誰が議決権を握っているかの側です。

エンジニアが金の話を見ないわけじゃないんですよ。クラウド代もライセンスもベンダーロックインも普通に見ますし、最近のAPI代なんか毎日見てる人もいるかもしれない。ただそれは「自分がいくら払うか」の話であって、「他社がなぜその値付けをしているのか」まで追いに行く動機は、普段の業務や趣味開発だとなかなか湧かない。同じ金の話でも、観点が違います。

そっちを見ても「答え」は書いていません。企業は手の内を書かないので。書いたら競合が読むわけで、資料に載るのは結果と数字だけです。しかも決め手になる「やらなかったこと」は、どの資料にも載りません。何を検討して、何を見送ったか、わざわざ外に出す理由がないので。たまに創業者のブログやインタビューで断片が漏れるくらいです。

あるのはヒントだけ。数字と、買ったもの。そこから「買わなかったもの」と「なぜ買わなかったのか」を推測して、自分で組み立てるしかない。今回やるのはその組み立てです。技術の話はほぼ出てきません。

## 理由は全部「すでに持っているもの」の側にある

ネットワークやクラウドといったインフラ側の商売は、ざっくり**通り道**と**土地**に分かれます。通り道は、通信が通過する場所を押さえて商売する側。土地は、自分のところにデータと処理を置かせて商売する側です。

AWSは土地です。「うちの敷地に置いてね」で全部が組み立っている。通信にも当然投資していますが、それは敷地までの足回りであって、通り道そのものが商品というわけではありません。というかこれ、比喩ですらないんですよね。リージョン（地域）、アベイラビリティゾーン（区域）と、AWS自身が土地の言葉を使っている。

そしてAWSを使うときは、必ず「どのリージョンに置くか」を選びます。Cloudflareを使うときに、その選択はありません。置く商売は場所を聞いてくるけど、通す商売は聞いてこない。貸倉庫と宅配便の違いに近いです。倉庫に払っているのは場所代で、宅配に払っているのは運賃。

CDNもクラウドも、数えだしたらキリがありません。なので取れない理由の種類がそれぞれ違う3社に絞って、Cloudflareと並べます。この区別で、どこで稼いでいるかを並べるとこうなります。

| | どこで稼いでいるか | 通り道をタダにできるか |
| --- | --- | --- |
| Akamai | 元は配信の従量課金。今はセキュリティが売上の5割超 | **できない**。通した量がそのまま売上だったので |
| AWS | 敷地に置いてもらう料金（計算・保管）と、データを外に出すときの通信料 | **やる意味がない**。通り道は商品ではないし、外に出す通信料は大きな収益源 |
| Google | 道具は揃っているが、ほとんどがGoogle Cloudに紐づく | **やらせてもらえない**。持ちすぎていて、独禁法の視線が先に来る |
| Cloudflare | 契約プラン。通した量では課金しない | **できる**。売上が通した量に紐づいていないので |

技術力の差が一個も出てこないんですよね。全部、**その会社がすでに何を持っていたか**で決まっている。そして持っているほど動けない。Cloudflareだけは話が別で、2009年創業、タダにして困る既存事業をまだ持っていなかった。一番自由だったのが、一番遅く来た会社だった、という。

AWSの行だけ「できない」ではなく「やる意味がない」にしてあります。AWSが通り道をタダで開放しても、たぶん痛くはないんですよ。そこで稼いでいるわけじゃないので。かといって得も大きくない。敷地に置いてもらう商売なので、道が無料になっても置く理由が増えるわけではない。

**やってもやらなくても同じなら、やらない。** 禁じられているわけでも損をするわけでもなく、たぶん動機が薄いだけ。そして外から見ると、できないのか、やらないのか、区別はつかない。

で、Cloudflareの側です。通る量が増えても売上は直接には増えません。増えるのはコストのほう。普通ならこれで終わりですが、回収経路が別にあります。

### 無料枠が、回線の交渉力になっている

Cloudflareは膨大なトラフィックを持っているので、ISP側から見ると「繋がせてほしい」相手なんですよね。だからピアリング（相互接続）を無料で結べる。普通の会社にとって無料ユーザーは純粋なコストで、増えれば増えるほど痛い。Cloudflareの場合、それがそのまま回線の交渉材料に変わる。

実際、粗利率は7割台です。売上から原価を引いて、どれだけ残るかの割合ですね。自前でネットワークを持っている会社としては、かなり高い部類。ただ、最近きれいな話ばかりでもなくて。2026年4〜6月期は71.8%（GAAPベース。会社が併記している調整後の数字だと73.1%）で、前年同期の74.9%から下がっています。会社の説明は「トラフィック構成の変化と、ネットワーク費用の原価への配分が増えたこと」。

**通す量が増えること自体は、ちゃんとコストとして跳ね返ってくる**。タダで通すほど得、という単純な話ではないわけです。

そしてもうひとつ。通ったトラフィックそのものが、怪しい通信を見つける材料になります。Cloudflareの創業者は、会社を作る前にProject Honey Pot（2004年）というものをやっていました。参加者が自分のサイトに罠を仕掛けて、迷惑メール業者の動きを持ち寄る、共同観測の仕組みです。無料で参加してもらって、集まったデータのほうに価値がある、という形ですね。

その並びで見ると、無料枠を集客だけの施策と読むのは狭い気がします。通ってもらうこと自体に意味がある、と考えたほうが自然に見える。とはいえ20年近く前の別プロジェクトからの類推なので、こちらの読みとして受け取ってください。

### では儲けはどこにあるのか

Cloudflareの売上の大半は、年間の支払額が大きい企業顧客から来ています。無料枠でも個人向けプランでもなく、その先。決算のたびに必ず出てくる指標が2つあります。

- 年10万ドル以上払う顧客が何社に増えたか
- 既存顧客が前年比でどれだけ増額したか

2026年4〜6月期でいうと、前者が**4,698社（前年比+27%）**、後者が**120%**。既存顧客が去年より2割多く払っている、という意味です。

まず顧客数のほう。無料で入口を開けて、有料に上がる層が出て、その先に営業がつく企業契約がある。しかも大きいのが、個人で使った人が転職先や自社に持ち込む経路です。個人で触って良かったものを、職場で「これ入れませんか」と持ちかけた経験のある人、けっこういると思います。エンジニアに浸透しきっているGitHubと同じ形ですね。個人でも組織でも無料で使えて、権限管理やSSO、監査ログみたいな「会社として必要になるもの」から課金が始まる。だから開発者向けの発信にあれだけ力を入れるわけです。

もう片方の増額率のほうは、単純に売るものが増え続けているからですね。Cloudflareはどの拠点のサーバーでも全製品が動くので、新製品を足すときの追加原価がほぼゼロ。他社が新しい層を足すときは、ハードやリージョンの調達から始まります。製品投入の速さにも出ているはずですが、最近のリリースの増え方が全部これで説明できるかというと、たぶん違います。そこは後半で。

## 買収履歴は戦略の告白

言っていることは編集できます。ミッションもビジョンも、後からいくらでも書き直せる。でも**金を出した先は編集できない**。なので買収履歴を見ます。ここは取り繕えないので。

| 企業 | 買ったもの | 向いている方向 |
| --- | --- | --- |
| Akamai | **Linode**（レンタルサーバー会社。2022年、約9億ドル）<br>**Guardicore**（社内ネットワークを細かく仕切って侵入を止める製品。2021年、約6億ドル）<br>**Noname Security**（APIの防御。2024年、約4.5億ドル） | 自分で土地を持つ。あるいは顧客の環境の**中**へ |
| Cloudflare | **S2 Systems**（ブラウザを手元で動かさず隔離する技術）<br>**Area 1**（メールの経路上で不正なメールを止める）<br>**BastionZero**（社内システムへの安全な接続）<br>**Baselime**と**PartyKit**（Workers周りの開発ツール） | すでにある通り道の**上**へ |
| Google | **Mandiant**（侵入されたあとの調査と脅威情報）<br>**Wiz**（クラウド環境の設定不備を洗い出す） | クラウド顧客に売る製品 |

Akamaiは、路上から降りて顧客の敷地の中に入っていく方向に金を使っています。「通り道の上だけで戦い続けるより、顧客の環境に入っていくほうが伸びる」という判断だったのだと思います。

Cloudflareは、一件も「新しいビジネスモデル」を買っていません。全部、すでにある通り道の上で動かす部品です。データセンター事業者もクラウドも買っていない。Akamaiが顧客の敷地に入っていったのに対して、Cloudflareは道の上から一歩も出ていません。

そしてGoogleは、経路を押さえるための買収を一切していない。材料はかなり揃っているのに、買っているのはMandiantもWizもクラウド顧客に売るセキュリティ製品です。ついでに言うと売ってもいて、2023年、ドメイン登録の事業をSquarespaceへ手放しました。約1,000万ドメイン、約1億8,000万ドル。ドメイン登録って、経路のいちばん手前なんですよ。名前を引くところから全部が始まるので。Cloudflareはそこを自前で持っていて、Googleはそこから降りた。

**買ったものと同じくらい、売ったものも戦略を語る**、という話です。

## 独禁法という「取りたくても取れない」

他社が取れない理由には、法律の側面もあります。しかもけっこう決定的な。

競争法（日本でいう独占禁止法。市場の競争が壊れないように企業の行動を縛る法律です）の考え方として、**同じ行動でも、挑戦者がやると競争促進、大きすぎる会社がやると排除行為**になります。特にGoogleは、これでめちゃくちゃ怒られてきた実績がある側です。

- Cloudflareの「無料で無制限DDoS防御」は、まだ小さい側だった頃に始めたので、健全な競争として扱われた
- AWSが同じものをクラウドにタダで付けたら、「本業の強さを使って隣の市場も押さえにきた」と見なされる

後者は1990年代のブラウザ戦争（MicrosoftがWindowsにInternet Explorerを標準で抱き合わせて、独禁法で訴えられたやつ）と同じ形です。前例がある分、当局の反応も早い。ちなみに今のCloudflareを小さい側と呼ぶのは、さすがに無理があります。この理屈は、そのうち自分にも向いてくるはずです。

しかもAWSは、この「外に出すときの通信料」そのものを規制当局に突かれている最中です。egress課金と呼ばれるやつですね。ここ数年で一気に進みました。

- EUのデータ法（Data Act）により、2027年1月12日からegress課金は禁止。それ以前も実費を超える請求はできない扱いです
- 英国のCMAは2025年に「クラウド市場の競争が機能していない」と結論。2026年3月にAWSとMicrosoftから改善の約束を取り付けています
- 欧州委員会は2025年にegress課金の業界調査を開始。AWSとAzureを「特に厳しいルールを適用する対象」に指定するかの審査にも入りました

AWS側も「月100GBの無料枠があるので9割以上の顧客はegressを払っていない」と反論していて、実際に条件はかなり緩めてきています。そこにCloudflare R2の egress ゼロがある。狙いがどこにあったかは書かれていませんが、結果として、規制に押されて下げる側と、最初からゼロで出してきた側という構図になりました。片方は譲歩で、片方は設計です。

**大企業ほど「無料で配って位置を取る」がやりづらい。規模が武器にならず、足枷になる領域です。**

しかもこれは一社の話ではありません。2027年にegress課金が禁止されれば、そこを売りにしていた各社の差も、その分だけ平らになります。設計を自社の都合だけで決められる時代ではなくなってきている、ということでもあります。

### Googleという空の玉座

Googleは道具がかなり揃っています。世界有数の自社バックボーン、8.8.8.8（Googleが運用している誰でも使えるDNS）、Chrome。ただ、さっきのドメイン売却もそうですが、残っている道具もほとんどがGoogle Cloudに紐づいています。誰のサイトの前にでもタダで立つ、という形にはなっていない。

そして仮にやろうとしても、政治的に出せません。検索でも広告でも当局と争っている最中に「あなたの通信の通り道にも立ちます。ちなみにブラウザと検索もうちです」は、どう考えても通らない。

玉座はある。座れる人もいる。でも座ると即座に撃たれるので、誰も座らない。

### 持っていないから、中立だと言える

そしてもうひとつ。通り道になるには、通す相手全員から「こいつは自分の場所を奪いに来ない」と思われている必要があります。

- AWSは、自社クラウドと競合する相手に対して中立だと言いにくい
- Googleは、自社広告と競合する相手に対して中立だと言いにくい
- Cloudflareは**競合する土地を持っていない**ので、そこを疑われにくい

持たないという選択には、当然そのぶんの取りこぼしがあります。土地を持っていれば取れたはずの売上を、ずっと見送っているわけなので。中立でいることは、タダではない。

この構図は、もっと身近なところにもあります。ユーザーからすると「それくらいやってくれよ」と思う機能が、いつまでも出てこない。技術的には難しくなさそうなのに。動かない理由が技術の外にあることは普通にあるんですよ。売上の柱を壊すとか、中立が疑われるとか、規制で目をつけられるとか。しかもその理由は、たいてい公表されません。

## 赤字であることが答え合わせになる

Cloudflareは、GAAP（米国の会計基準）ベースの営業利益ではずっと赤字を出してきました。決算で公式に出す数字がこれです。「調整後利益」みたいな独自指標を併記する企業もありますが、そういう味付けをしていない素の数値、くらいに思ってください。

ただ、中身を見ると話が変わります。

- 粗利率は7割台。通り道を持つこと自体は、ちゃんと儲かっている
- それでも赤字になるのは、稼いだ分を売るための費用と研究開発に回しているから。従業員に配る株式も、会計上は費用として乗ります
- 手元に残る現金（フリーキャッシュフロー）は黒字です。2026年4〜6月期で約5,600万ドル、前年同期比+69%

会計の赤字と、現金が減ることは別の話なんですよね。「稼げていない」のではなく、**稼いだ分を、通り道を広げることと売るものを増やすことに回してきた**わけです。ここを区別しないと数字を読み間違えます。

### 会計は「通り道を持っていること」を計上できない

無料枠のユーザーは、財務諸表上は費用としてしか現れません。売上ゼロ、コストだけ。でも実態は、怪しい通信を見つける材料であり、有料に上がってくる層の母集団でもある。

**貸借対照表には「世界のトラフィックの何割が自分を通っているか」という行がない。**

だからこのやり方をしている会社は、どうしても紙の上では実態より悪く見えます。そしてAkamaiのほうはGAAPで黒字なんですよね。道を降りた会社が黒字で、道を持ち続けている会社が赤字。短期の損益計算書だけ見て判断すると、確実に読み間違えるやつです。ただ、この対比はきれいすぎる書き方でもあります。Akamai側の中身は後半でまとめて見ます。

### そんな赤字を、株主がよく許したなという話

で、当然こう思いますよね。株主が黙ってないだろ、と。普通は黙ってません。上場企業が何年も営業赤字を続けると、三ヶ月ごとに「いつ黒字にするんだ」と詰められます。それに耐えられず、途中で方針を曲げる会社のほうが多い。

Cloudflareが耐えられたのは、創業陣が議決権を握っているからです。株の種類が分かれていて、創業陣の持ち分は1株あたりの投票権が重い。だから株数で負けても、決議では負けない。**二種株式構造**といいます。ここは掘ると長いので、気になる人はこの名前で調べてください。

そして実際に断った記録もあります。2014年の[Universal SSL](https://blog.cloudflare.com/introducing-universal-ssl/)、全顧客に無料でHTTPSを配ったやつですね。あれは短期の売上を捨てる判断で、取締役会が全員で支持したと創業者が書いています。数字が悪く見えることを、承知のうえでやったわけです。

**思想だけあっても株主に負けたら曲がる。ブレない会社の裏には、ブレさせない仕組みがある。**

ただ、仕組みだけで全員一致にはならないはずです。議決権で押し切れる立場であっても、押し切った決議と、全員が支持した決議は別物なので。そこは資料に出てこない部分ですが、中でそれなりの説得があったんだろうな、とは思います。条件が揃っていても、動かすのは結局人なので。

### ただし、その赤字はもう終わろうとしている

一定期間の赤字を受け入れる判断は、毎年通し続けるのは相当な労力のはずですし、無期限に続けられるものでもない。実際、Cloudflareは遅くとも2028年にはGAAPで黒字化すると公言していて、しかも前倒しで進んでいると言っています。

2026年4〜6月期のGAAP営業損失は約2億600万ドル。数字だけ見ると大きいんですが、うち約1億5,100万ドルは一度きりのリストラ費用です。「AI前提の運営体制に移す」という名目で、人員削減も含まれています。それを除けば5,500万ドル程度まで縮む。

つまり今は、**投資を厚くしてきた局面から、回収の局面へ移ろうとしている**ところです。受け入れていた赤字に、自分から区切りをつけにいっている。位置は十分に取れたという判断なのか、市場の空気が変わったからなのかは、外からは分かりません。

最近のリリース攻勢もたぶん同じ流れです。この会社の伸ばし方は通り道の上でやれることを増やしていくことなので、黒字化を急ぐならそこを厚くするのが手っ取り早い。しかも追加原価はほぼゼロでした。人を減らしながら製品を増やす、という絵は一応繋がります。会社がそう説明しているわけではないので、並べてみるとそう見える、という程度の話ですが。

リリースを出し続けていること自体は昔から変わっていないのに、狙いのほうが入れ替わっています。赤字期は陣地を広げるため、今は黒字化を早めるため。動きが同じでも、理由は同じとは限らない、という。

## Akamaiは別のやり方で伸びている

Cloudflareを語るとき、比較対象としてAkamaiが出てくることが多いです。この記事でもそうしてきました。ただ数字を見ると、Akamaiはかなり難しいことをやり切っている会社です。

- **収益の柱が入れ替わっている**。2026年4〜6月期はセキュリティ売上が6億400万ドルで、全体11億ドルの**55%**。配信の会社ではなく、もうセキュリティの会社です。20年以上やってきた会社の事業転換としては、かなり難度が高い
- **Linodeの賭けも当たっている**。クラウド基盤の売上は**前年比39%増**。年初からの複数年契約が28億ドル積み上がっています。会社の柱として育っている事業です
- ISPの網の奥深くに入り込んだ配置は、Cloudflareには作れない資産。大規模ライブ配信のような領域では今も強い

さっき「AkamaiはGAAPで黒字」と書いた件も、中身を見ておきます。直近のAkamaiは営業利益率が7%まで落ちています（前年同期は15%）。クラウド基盤への投資と株式報酬の増加が理由です。黒字は黒字ですが、余裕のある黒字ではない。

どちらも今、それぞれのやり方のコストを払っている最中です。

そして何より、始めた時点の条件が違います。Cloudflareの側に既存事業がなかったという話は前に書きましたが、Akamaiの側から見ると、1998年創業ですでに成熟した顧客基盤と株主を抱えていた会社が、あとから同じことをやりますとは言えない、ということでもあります。市場も従業員も、その設計になっていない。若いうちにしか取れない選択肢だった、という話です。

**制約が違えば、最適解も違う**。それだけだと思います。

この記事はCloudflareの動き方を軸に組み立てていますが、**そのやり方がGAAPの黒字として出てくるのはこれから**です。その意味では、まだ答え合わせの済んでいない賭けでもあります。

## やらない判断が一貫していることが、思想の証明になる

前回の記事にも「やらない判断をしている」と書きました。今回いろいろ掘って分かったのは、その理由がここまできれいに揃うということです。普通の会社の「やらない」はリソース配分の話なんですよ。やりたいけど今は手が足りない、時期じゃない。だから状況が変われば揺れるし、毎回会議が要る。

Cloudflareのは違って、答えが原理から出ています。

- 総合クラウドをやるかどうか。自分が土地を持てば中立が疑われるので、そこで終わり
- 自社モデルを出すかどうか。通す側と通される側を兼ねることになるので、そこで終わり

検討する必要すらない。

**選択肢を減らしたことが、そのまま意思決定の速度にもなっている**わけです。断るのに判断コストがかからないから、やることに全部の時間を使える。その原理が長持ちしているのは、ミッションが製品ではなく立ち位置で書かれているからだと思います。"help build a better Internet"。「最高のCDNになる」だとCDNの時代が終わった瞬間に失効しますが、「手伝う」は技術が変わっても失効しない。謙虚な言い回しに見えて、賞味期限のない書き方でもある。

論証として強いのもここです。やったことの一覧は、後から意味を貼り付けられるんですよね。成功した製品を並べて「一貫した戦略でした」と言うのは誰でもできる。でもやらなかったことが全部同じ理由で説明できるなら、それは後付けでは作れません。

- Linode的な買収をしなかった
- 自分で土地を持つクラウドに行かなかった
- 自社モデルを出さなかった
- 帯域従量課金に寄せなかった

理由が全部「一本道から外れるから」の一言で片付く。バラバラの理由が必要だったら、それは思想ではなく、その都度の判断だったということです。

しかも、断り続けるほうが大変なんですよ。値上げしろ、自社製品を優遇しろ、隣の美味しい商売も取れ。どれも四半期単位では正しくて、どれも中立を壊す。位置を取るのは一回の賭けですが、保つほうは何年も断り続けることになる。

**思想の存在は、やったことではなく、やらなかったことの一貫性で証明される。**

## おわりに

冒頭の質問への答えを並べ直すと、こうなります。

- **どこで稼いでいるかが、できることを決めている**。通した量で稼ぐ会社は、通す量をタダにできない
- **買収と売却が戦略を語っている**。Akamaiは顧客の敷地へ、Cloudflareは通り道の上だけ、Googleは経路のいちばん手前から降りた
- **独禁法が「取りたくても取れない」を作っている**。同じ行動でも、大きすぎる会社がやると排除行為になる

取れた側の条件は、こうです。

- **持っていないから中立だと言える**。競合する土地がないぶん、疑われずに済んでいる
- **赤字の見え方に騙されない**。会計は、通り道を持っていることを資産として書けない
- **やらなかったことの一貫性が、思想の証明になっている**

技術としては再現できるんですよ。CDNもWAFもエッジで動く実行環境も、同じ機能を持つ会社は他にもあります。取れないのは機能ではなく位置のほうで、しかも当時と同じ入口はもう使えません。2009年はDDoS防御が高額な大企業向け商品だったから「無料で無制限」が通用しましたが、今は比較対象がすでに無料なので。

なので、この記事で言いたいのはCloudflareを真似するとか「通り道を取りにいこうぜ」ではありません。こっちです。

- 自分は今どの位置に立っているのか
- その位置だから**できること**は何か
- その位置だから**やってはいけないこと**は何か

**戦略は賢さではなく、構造の問題**。正解を知っているかどうかではなく、やらない判断を続けられる側にいるかどうかです。

もっとも、これは公開情報から組み立てた推測です。しかもCloudflareは今、黒字化に向けて舵を切りはじめていて、この記事で挙げた条件のうち「まだ小さい側」はもう成り立っていません。そのへんは、また数年後に答え合わせをしましょう。

## 参考文献

**決算（2026年8月時点）**

- Cloudflare Announces Second Quarter 2026 Financial Results

<a class="link-card" href="https://www.cloudflare.com/press/press-releases/2026/cloudflare-announces-second-quarter-2026-financial-results/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://cf-assets.www.cloudflare.com/dzlvafdwdttg/53qCYhQbir5WtIU0VDWESo/5b0a0e044a5352bc0f43e122815779c8/unnamed-3.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.cloudflare.com</span>
<span class="link-card-title">Cloudflare Announces Second Quarter 2026 Financial Results</span>
</span>
</a>

- Akamai Reports Second Quarter 2026 Financial Results

<a class="link-card" href="https://www.akamai.com/newsroom/press-release/akamai-reports-second-quarter-2026-financial-results" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.akamai.com/content/dam/site/en/images/logo/akamai-logo-og-default.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.akamai.com</span>
<span class="link-card-title">Akamai Reports Second Quarter 2026 Financial Results | Akamai</span>
</span>
</a>

- Akamai Reports First Quarter 2026 Financial Results

<a class="link-card" href="https://www.ir.akamai.com/news-releases/news-release-details/akamai-reports-first-quarter-2026-financial-results" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.ir.akamai.com</span>
<span class="link-card-title">Akamai Reports First Quarter 2026 Financial Results | Akamai Technologies Inc.</span>
</span>
</a>


**買収**

- Akamai Completes Acquisition of Linode

<a class="link-card" href="https://www.akamai.com/newsroom/press-release/akamai-completes-acquisition-of-linode" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.akamai.com/content/dam/site/en/images/logo/akamai-logo-og-default.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.akamai.com</span>
<span class="link-card-title">Akamai Technologies Completes Acquisition of Linode to Provide Businesses with a Developer-friendly and Massively Distributed Platform to Build, Run and Secure Applications | Akamai</span>
</span>
</a>

- Akamai to Acquire Guardicore

<a class="link-card" href="https://www.akamai.com/newsroom/press-release/akamai-to-acquire-guardicore-to-extend-its-zero-trust-solutions-to-help-stop-ransomware1" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.akamai.com/content/dam/site/en/images/logo/akamai-logo-og-default.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.akamai.com</span>
<span class="link-card-title">Press Releases | Akamai</span>
</span>
</a>

- Akamai Completes Acquisition of API Security Company Noname

<a class="link-card" href="https://www.akamai.com/newsroom/press-release/akamai-completes-acquisition-of-api-security-company-noname" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.akamai.com/content/dam/site/en/images/logo/akamai-logo-og-default.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.akamai.com</span>
<span class="link-card-title">Akamai Completes Acquisition of API Security Company Noname | Akamai</span>
</span>
</a>

- Squarespace Completes Acquisition of Google Domains Assets（2023年9月）

<a class="link-card" href="https://www.squarespace.com/press-releases/2023/9/7/squarespace-completes-acquisition-of-google-domains-assets" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://static1.squarespace.com/static/5134cbefe4b0c6fb04df8065/t/598b5bbb49fc2bfd47b9ca30/1502305217045/final_asset-press-and-media-banner.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.squarespace.com</span>
<span class="link-card-title">Squarespace Completes Acquisition of Google Domains Assets &amp;mdash; Squarespace</span>
</span>
</a>


**規制**

- CMA Cloud Services Market Investigation, Appendix N: Egress fees

<a class="link-card" href="https://assets.publishing.service.gov.uk/media/67976be7419bdbc8514fde5d/.Appendix_N.pdf" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">assets.publishing.service.gov.uk</span>
<span class="link-card-title">https://assets.publishing.service.gov.uk/media/67976be7419bdbc8514fde5d/.Appendix_N.pdf</span>
</span>
</a>

- EU Data Act と egress 課金の扱い

<a class="link-card" href="https://cloudandclear.uk/cloud-exit-cost-audit-eu-data-act/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">cloudandclear.uk</span>
<span class="link-card-title">https://cloudandclear.uk/cloud-exit-cost-audit-eu-data-act/</span>
</span>
</a>


**Cloudflare 公式ブログ**

- Introducing Universal SSL（2014年。全顧客への無料HTTPS提供）

<a class="link-card" href="https://blog.cloudflare.com/introducing-universal-ssl/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blog.cloudflare.com/_emdash/api/media/file/01KW458ARBD57JTXNRGNM0YCTN.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blog.cloudflare.com</span>
<span class="link-card-title">Introducing Universal SSL</span>
</span>
</a>

- Cloudflare 2025 Annual Founders' Letter（ミッションの "help" について）

<a class="link-card" href="https://blog.cloudflare.com/cloudflare-2025-annual-founders-letter/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blog.cloudflare.com/_emdash/api/media/file/01KW44JR1C38ZPP5Y9W5WKK7XB.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blog.cloudflare.com</span>
<span class="link-card-title">Cloudflare’s 2025 Annual Founders’ Letter</span>
</span>
</a>


**その他**

- Cloudflare Investor Relations（四半期決算・年次報告）
- 各社の年次報告書（10-K）
