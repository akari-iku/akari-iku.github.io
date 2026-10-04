---
title: Cloudflare の判定モデル Clef を Workers AI で触ってみた
description: >-
  Cloudflare の判定モデル Clef / Clef-flash を Workers AI
  から呼び出し、日本語の判定、該当なしの扱い、用件が複数ある問い合わせ、画像を試した記録。判定の精度は、選択肢と質問の設計で大きく変わった。
date: '2026-10-04'
tags:
  - cloudflare
  - workers
  - llm
  - qwen
  - api
lang: ja
pair: clef-decision-models
source: zenn
accent: '#E5007F'
---

<!-- generated from articles/source/ja/2026-10-04-clef-decision-models.md by scripts/import-articles.ts - do not edit -->

## はじめに

Cloudflare が 2026年10月1日に、判定用のモデル「Clef」と「Clef-flash」を発表しました。
この記事は、2つのモデルを Workers AI から呼び出して、簡単な実験をした記録です。

公式の情報は次のページで確認できます。

- 発表記事: [Introducing Clef: our open-source decision models, and new RL fine-tuning platform](https://blog.cloudflare.com/clef-decision-models/)
- Workers AI のモデルページ: [Clef](https://developers.cloudflare.com/workers-ai/models/clef/) ・ [Clef-flash](https://developers.cloudflare.com/workers-ai/models/clef-flash/)
- Hugging Face: [Cloudflare/clef](https://huggingface.co/Cloudflare/clef) ・ [Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash)

前提は次のとおりです。

- 実験はすべて 2026年10月4日に Workers AI 上で行いました。
- 問い合わせ文と画像は、すべて架空のものです。
- 1つの実験あたりの件数は5件前後です。結果は傾向の確認であり、精度の評価ではありません。

## Clef とは

Clef は、文章や画像を読み、あらかじめ決めた選択肢の中から答えを選ぶモデルです。
Clef は文章を生成しません。
Clef は選択肢ごとの確率を返します。

| | Clef | Clef-flash |
| --- | --- | --- |
| モデルID | `@cf/cloudflare/clef` | `@cf/cloudflare/clef-flash` |
| ベースモデル | Qwen3.8-27B | Qwen3.5-9B |
| 料金（100万入力トークンあたり） | $0.24 | $0.09 |
| コンテキスト長 | 65,536 トークン | 65,536 トークン |
| 公式のレイテンシ（中央値） | 209.3 ms | 38.8 ms |

Clef の仕組みは次のとおりです。

1. ベースモデルが、入力全体を1回だけ読み込みます（prefill）。
2. ベースモデルの上に追加された小さな head が、各選択肢のスコアを並列で計算します。

ベースモデルの重みは凍結されています。
学習で更新したのは、head と LoRA だけです。

質問の形式は3種類あります。

| 形式 | 用途 | 返す値 |
| --- | --- | --- |
| `noul` | yes / no の質問 | yes の確率 |
| `choice` | 2〜255個の選択肢から1つを選ぶ質問 | 選んだ選択肢、選択肢ごとの確率、`confidence` |
| `score` | 2〜10段階で評価する質問 | 確率で重み付けした期待値、段階ごとの確率 |

## 呼び出し方

Workers AI の REST API に POST します。
API トークンは、Cloudflare のダッシュボードでテンプレート「Workers AI」を選んで作成します。

```bash
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/cloudflare/clef-flash \
  -H "Authorization: Bearer $CLOUDFLARE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @request.json
```

`request.json` の例です。
判定したい文章を `state` に入れ、質問を `questions` に入れます。

```json
{
  "model": "clef-flash",
  "state": "I ordered a blue mug last week, but a red one arrived. Can I exchange it?",
  "questions": {
    "is_complaint": {
      "type": "noul",
      "instructions": "Is the customer reporting a problem with their order?"
    },
    "topic": {
      "type": "choice",
      "instructions": "Which team should handle this message?",
      "criteria": {
        "shipping": "Delivery delays or tracking",
        "returns": "Returns, exchanges, or wrong items",
        "billing": "Payments, refunds, or invoices"
      }
    }
  }
}
```

レスポンスです。

```json
{
  "result": {
    "model": "clef-flash",
    "answers": {
      "is_complaint": { "type": "noul", "noul": 0.9266 },
      "topic": {
        "type": "choice",
        "choice": "returns",
        "probabilities": { "shipping": 0.0019, "returns": 0.9956, "billing": 0.0025 },
        "confidence": 0.9869
      }
    },
    "usage": { "input_tokens": 262, "output_tokens": 0 }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

API 仕様で気をつける点は次の3つです。

- Workers AI では、質問ごとの `instructions` が必須です。Hugging Face の model card では省略できると書かれています。
- 画像は最大4枚まで送れます。形式は PNG、JPEG、WebP のいずれかで、base64 で渡します。URL は指定できません。
- 出力トークン数は、レスポンスを確認した32回のリクエストですべて0でした。料金表にも、入力トークンあたりの金額だけが書かれています。

## 試したこと

EC サイトの問い合わせを、配送（shipping）・返品（returns）・請求（billing）の3つの担当に振り分ける、という場面を想定しました。
各節の折りたたみに、判定結果の全データを載せています。

<details><summary>共通で使った質問（choice）</summary>


英語版:

```json
{
  "type": "choice",
  "instructions": "Which team should handle this message?",
  "criteria": {
    "shipping": "Delivery delays or tracking",
    "returns": "Returns, exchanges, or wrong items",
    "billing": "Payments, refunds, or invoices"
  }
}
```

日本語版:

```json
{
  "type": "choice",
  "instructions": "このメッセージはどの担当チームが対応すべきですか。",
  "criteria": {
    "shipping": "配送の遅れや追跡",
    "returns": "返品、交換、注文と違う商品",
    "billing": "支払い、返金、請求書"
  }
}
```


</details>

### 日本語でも判定できるか

問い合わせ文5件を、次の3条件で送りました。

- 問い合わせ文も質問も英語
- 問い合わせ文は日本語、質問は英語
- 問い合わせ文も質問も日本語

Clef と Clef-flash の30回すべてで、想定どおりの担当が選ばれました。
入力トークン数は165〜183で、言語による差はほとんどありませんでした。

ただし、「返品した商品の返金がまだ口座に入っていない」という問い合わせでは、条件によって確信度が変わりました。
Clef-flash に英語の問い合わせ文を送ったときは、billing の確率が 0.777 でした。
日本語の問い合わせ文を送ったときは、billing の確率が 0.917〜0.949 でした。
英語の文と日本語の文は私が別々に書いたので、ニュアンスが完全には一致していません。
差の原因が文の書き方なのか、モデルの性質なのかは切り分けていません。

<details><summary>使った問い合わせ文</summary>


| # | 日本語 | 英語 | 想定 |
| --- | --- | --- | --- |
| 1 | 青いマグを注文したのに、赤いマグが届きました。交換できますか。 | I ordered a blue mug, but a red one arrived. Can I exchange it? | returns |
| 2 | 注文から10日たっても届きません。今どこにありますか。 | It's been 10 days since I ordered and it still hasn't arrived. Where is it? | shipping |
| 3 | 同じ注文の代金が2回引き落とされています。 | I was charged twice for the same order. | billing |
| 4 | サイズが合わなかったので返品したいです。送料はかかりますか。 | The size didn't fit, so I'd like to return it. Do I have to pay for shipping? | returns |
| 5 | 返品した商品の返金がまだ口座に入っていません。 | I returned an item, but the refund hasn't reached my account yet. | billing |

4と5は、2つの担当で迷うように作りました。


</details>

<details><summary>判定結果の全データ（Clef-flash）</summary>


条件の表記は「問い合わせ文の言語/質問の言語」です。

| # | 条件 | 選ばれた担当 | shipping | returns | billing | 入力トークン |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 英/英 | returns | 0.001 | 0.998 | 0.002 | 173 |
| 1 | 日/英 | returns | 0.001 | 0.997 | 0.002 | 174 |
| 1 | 日/日 | returns | 0.003 | 0.993 | 0.004 | 183 |
| 2 | 英/英 | shipping | 0.993 | 0.004 | 0.003 | 177 |
| 2 | 日/英 | shipping | 0.996 | 0.002 | 0.002 | 172 |
| 2 | 日/日 | shipping | 0.995 | 0.003 | 0.002 | 181 |
| 3 | 英/英 | billing | 0.015 | 0.043 | 0.942 | 165 |
| 3 | 日/英 | billing | 0.013 | 0.024 | 0.963 | 167 |
| 3 | 日/日 | billing | 0.012 | 0.024 | 0.964 | 176 |
| 4 | 英/英 | returns | 0.002 | 0.983 | 0.015 | 178 |
| 4 | 日/英 | returns | 0.002 | 0.977 | 0.021 | 170 |
| 4 | 日/日 | returns | 0.003 | 0.967 | 0.030 | 179 |
| 5 | 英/英 | billing | 0.016 | 0.207 | 0.777 | 171 |
| 5 | 日/英 | billing | 0.009 | 0.074 | 0.917 | 166 |
| 5 | 日/日 | billing | 0.008 | 0.043 | 0.949 | 175 |


</details>

<details><summary>判定結果の全データ（Clef）</summary>


入力トークン数は Clef-flash と同じでした。

| # | 条件 | 選ばれた担当 | shipping | returns | billing |
| --- | --- | --- | --- | --- | --- |
| 1 | 英/英 | returns | 0.002 | 0.997 | 0.002 |
| 1 | 日/英 | returns | 0.002 | 0.996 | 0.002 |
| 1 | 日/日 | returns | 0.002 | 0.995 | 0.003 |
| 2 | 英/英 | shipping | 0.993 | 0.003 | 0.004 |
| 2 | 日/英 | shipping | 0.993 | 0.003 | 0.004 |
| 2 | 日/日 | shipping | 0.992 | 0.004 | 0.004 |
| 3 | 英/英 | billing | 0.004 | 0.004 | 0.991 |
| 3 | 日/英 | billing | 0.005 | 0.005 | 0.990 |
| 3 | 日/日 | billing | 0.005 | 0.006 | 0.988 |
| 4 | 英/英 | returns | 0.004 | 0.989 | 0.007 |
| 4 | 日/英 | returns | 0.003 | 0.973 | 0.024 |
| 4 | 日/日 | returns | 0.004 | 0.983 | 0.013 |
| 5 | 英/英 | billing | 0.006 | 0.086 | 0.908 |
| 5 | 日/英 | billing | 0.004 | 0.029 | 0.967 |
| 5 | 日/日 | billing | 0.004 | 0.021 | 0.975 |


</details>

### 選択肢の順番で結果が変わるか

`criteria` に書く選択肢の順番を4通りに変えて送りました。
確率は、4回とも小数点以下4桁まで同じ値でした。

Hugging Face で公開されている推論コードでは、選択肢を option id の文字列順に並べ替えてからモデルに渡しています。
Workers AI でも同じ処理をしていると考えられます。
なお、時間を空けて同じ入力を送ったときも、小数点以下4桁の精度で同じ確率が返りました。

<details><summary>判定結果の全データ（Clef-flash）</summary>


問い合わせ文は、迷いやすい「I returned an item, but the refund hasn't reached my account yet.」を使いました。

| `criteria` の記述順 | billing | returns | shipping |
| --- | --- | --- | --- |
| shipping, returns, billing | 0.7772 | 0.2066 | 0.0162 |
| shipping, returns, billing（2回目） | 0.7772 | 0.2066 | 0.0162 |
| billing, returns, shipping | 0.7772 | 0.2066 | 0.0162 |
| returns, billing, shipping | 0.7772 | 0.2066 | 0.0162 |


</details>

### どの担当にも当てはまらない問い合わせ

「実店舗の営業時間」「求人への応募」「コーヒーの淹れ方」という、3つの担当のどれにも当てはまらない問い合わせを送りました。

| 問い合わせ | Clef-flash: `other` なし | Clef-flash: `other` あり |
| --- | --- | --- |
| 実店舗の営業時間 | returns 0.454 | other 0.961 |
| 求人への応募 | billing 0.595 | other 0.989 |
| コーヒーの淹れ方 | returns 0.415 | other 0.997 |

`other` という選択肢がない場合、Clef は既存の担当のどれかを返しました。
Clef は「該当なし」の選択肢を自動では用意しません。
`other` を選択肢に加えると、3件とも `other` に分類されました。
範囲内の問い合わせの判定は、`other` を加えてもほとんど変わりませんでした。

`other` がない場合、範囲外の問い合わせでは `confidence` が 0.02〜0.16 まで下がりました。
範囲内の問い合わせの `confidence` は 0.89 以上でした。
`confidence` にしきい値を設けても、範囲外を見分けられる可能性があります。

<details><summary>判定結果の全データ</summary>


問い合わせ文は日本語、質問は英語で送りました。
`other` の説明文は「Anything not covered by the options above」です。
範囲内の2件は、日本語の実験の1と3と同じ文です。

Clef-flash:

| 問い合わせ | `other` | 選ばれた担当 | billing | other | returns | shipping | confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 違う色のマグが届いた | なし | returns | 0.002 | - | 0.997 | 0.001 | 0.991 |
| 代金が2回引き落とされた | なし | billing | 0.963 | - | 0.024 | 0.013 | 0.891 |
| 実店舗の営業時間を教えてください。 | なし | returns | 0.432 | - | 0.454 | 0.114 | 0.109 |
| 御社の求人に応募したいのですが、どこから申し込めますか。 | なし | billing | 0.595 | - | 0.234 | 0.172 | 0.156 |
| コーヒーをおいしく淹れるコツはありますか。 | なし | returns | 0.327 | - | 0.415 | 0.258 | 0.019 |
| 違う色のマグが届いた | あり | returns | 0.002 | 0.002 | 0.996 | 0.001 | 0.989 |
| 代金が2回引き落とされた | あり | billing | 0.939 | 0.028 | 0.021 | 0.012 | 0.843 |
| 実店舗の営業時間を教えてください。 | あり | other | 0.021 | 0.961 | 0.012 | 0.006 | 0.899 |
| 御社の求人に応募したいのですが、どこから申し込めますか。 | あり | other | 0.006 | 0.989 | 0.003 | 0.002 | 0.971 |
| コーヒーをおいしく淹れるコツはありますか。 | あり | other | 0.001 | 0.997 | 0.001 | 0.001 | 0.991 |

Clef:

| 問い合わせ | `other` | 選ばれた担当 | billing | other | returns | shipping | confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 違う色のマグが届いた | なし | returns | 0.002 | - | 0.996 | 0.002 | 0.989 |
| 代金が2回引き落とされた | なし | billing | 0.990 | - | 0.005 | 0.005 | 0.970 |
| 実店舗の営業時間を教えてください。 | なし | billing | 0.462 | - | 0.335 | 0.203 | 0.050 |
| 御社の求人に応募したいのですが、どこから申し込めますか。 | なし | billing | 0.546 | - | 0.336 | 0.117 | 0.138 |
| コーヒーをおいしく淹れるコツはありますか。 | なし | billing | 0.459 | - | 0.284 | 0.257 | 0.036 |
| 違う色のマグが届いた | あり | returns | 0.002 | 0.003 | 0.994 | 0.002 | 0.983 |
| 代金が2回引き落とされた | あり | billing | 0.974 | 0.017 | 0.004 | 0.004 | 0.933 |
| 実店舗の営業時間を教えてください。 | あり | other | 0.005 | 0.987 | 0.004 | 0.004 | 0.966 |
| 御社の求人に応募したいのですが、どこから申し込めますか。 | あり | other | 0.005 | 0.989 | 0.004 | 0.003 | 0.970 |
| コーヒーをおいしく淹れるコツはありますか。 | あり | other | 0.005 | 0.986 | 0.005 | 0.004 | 0.963 |


</details>

### 1件の問い合わせに用件が複数ある場合

実際の問い合わせでは、1つのメッセージに複数の用件が書かれることがあります。
そこで、`choice` 1問で担当を選ばせる方法と、担当ごとに `noul` で「この担当への用件を含むか」を聞く方法を比べました。

表は `noul` の yes の確率です。

| 問い合わせ | Clef-flash | Clef |
| --- | --- | --- |
| 違う色のマグが届いた＋代金が2回引き落とされた | returns 0.923 / billing 0.756 | returns 0.961 / billing 0.952 |
| 注文が届かない＋請求書の宛名を変えたい | shipping 0.917 / billing 0.953 | shipping 0.972 / billing 0.963 |
| 1つ目が届かない＋2つ目が割れていた＋クーポンが適用されていない | returns 0.947 / billing 0.721 / shipping 0.181 | returns 0.965 / billing 0.674 / shipping 0.935 |

`choice` は確率の合計が1になるため、用件が2つあると確率が2つの担当に割れました。
片方の担当だけが選ばれる場合もありました。
`noul` は担当ごとに独立して確率を返すので、複数の用件を同時に判定できました。

ただし、用件が3つある問い合わせでは、Clef-flash が配送の用件を見落としました（0.181）。
Clef は同じ用件を 0.935 で判定しました。

<details><summary>判定結果の全データ</summary>


問い合わせ文は日本語、質問は英語です。
`choice` 1問と `noul` 3問を、1回のリクエストにまとめて送りました。
`noul` の質問文は「Does this message contain a request for the {担当} team ({担当の説明})?」です。

| # | 問い合わせ文 | 想定 |
| --- | --- | --- |
| 1 | 青いマグを注文したのに、赤いマグが届きました。交換できますか。 | returns |
| 2 | 青いマグを注文したのに、赤いマグが届きました。しかも代金が2回引き落とされています。 | returns + billing |
| 3 | 注文から10日たっても届きません。それと、請求書の宛名を会社名に変えてもらえますか。 | shipping + billing |
| 4 | 1つ目の荷物はまだ届いていません。2つ目は割れていたので返品したいです。あと、クーポンが適用されていない気がします。 | shipping + returns + billing |

Clef-flash:

| # | choice: billing | choice: returns | choice: shipping | noul: billing | noul: returns | noul: shipping |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.003 | 0.995 | 0.002 | 0.007 | 0.961 | 0.055 |
| 2 | 0.072 | 0.919 | 0.009 | 0.756 | 0.923 | 0.043 |
| 3 | 0.466 | 0.050 | 0.484 | 0.953 | 0.009 | 0.917 |
| 4 | 0.290 | 0.677 | 0.033 | 0.721 | 0.947 | 0.181 |

Clef:

| # | choice: billing | choice: returns | choice: shipping | noul: billing | noul: returns | noul: shipping |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.002 | 0.997 | 0.001 | 0.003 | 0.989 | 0.006 |
| 2 | 0.111 | 0.879 | 0.009 | 0.952 | 0.961 | 0.009 |
| 3 | 0.196 | 0.018 | 0.786 | 0.963 | 0.007 | 0.972 |
| 4 | 0.154 | 0.717 | 0.129 | 0.674 | 0.965 | 0.935 |


</details>

### 画像

マグカップのイラストを6枚作り、届いた商品の状態を判定させました。
問い合わせ文は「青いマグカップを注文しました。届いた商品の写真を添付します。」です。
手ぶれ風の画像は、ぼかし、二重写り、傾き、暗さ、ノイズを加えて作りました。

| 画像 | 想定 | Clef-flash | Clef |
| --- | --- | --- | --- |
| 青・きれい | 注文どおり | 注文どおり 0.899 | 注文どおり 0.951 |
| 青・手ぶれ | 注文どおり | 注文どおり 0.897 | 注文どおり 0.933 |
| 赤・きれい | 違う色 | 違う色 0.974 | 違う色 0.989 |
| 赤・手ぶれ | 違う色 | 違う色 0.972 | 違う色 0.989 |
| 割れ・きれい | 破損 | 注文どおり 0.873 | 破損 0.971 |
| 割れ・手ぶれ | 破損 | 注文どおり 0.795 | 破損 0.486（注文どおり 0.460） |

色の違いは、手ぶれがあっても両方のモデルで判定できました。
小さなひびや欠けは、Clef-flash がきれいな画像でも見落としました。
Clef も、手ぶれ風の画像では「破損」と「注文どおり」の確率がほぼ半々になりました。

使った画像は写真ではなくイラストで、手ぶれの強さも1段階だけです。
画像の判定精度については、画像を専門に扱う人の検証を参考にしてください。

<details><summary>判定結果の全データ</summary>


画像は 512×512 ピクセルの PNG です。
入力トークン数は、どの画像でも 456 でした。

使った質問です。

```json
{
  "type": "choice",
  "instructions": "Based on the photo, what is the condition of the delivered item compared with the order?",
  "criteria": {
    "as_ordered": "The item matches the order and is undamaged",
    "wrong_item": "A different item or a different color than ordered arrived",
    "damaged": "The item is broken, cracked, or damaged"
  }
}
```

Clef-flash:

| 画像 | 選ばれた状態 | as_ordered | damaged | wrong_item | confidence |
| --- | --- | --- | --- | --- | --- |
| 青・きれい | as_ordered | 0.899 | 0.028 | 0.073 | 0.722 |
| 青・手ぶれ | as_ordered | 0.897 | 0.054 | 0.049 | 0.714 |
| 赤・きれい | wrong_item | 0.013 | 0.013 | 0.974 | 0.923 |
| 赤・手ぶれ | wrong_item | 0.014 | 0.014 | 0.972 | 0.919 |
| 割れ・きれい | as_ordered | 0.873 | 0.033 | 0.095 | 0.658 |
| 割れ・手ぶれ | as_ordered | 0.795 | 0.135 | 0.070 | 0.483 |

Clef:

| 画像 | 選ばれた状態 | as_ordered | damaged | wrong_item | confidence |
| --- | --- | --- | --- | --- | --- |
| 青・きれい | as_ordered | 0.951 | 0.022 | 0.027 | 0.859 |
| 青・手ぶれ | as_ordered | 0.933 | 0.033 | 0.034 | 0.808 |
| 赤・きれい | wrong_item | 0.006 | 0.005 | 0.989 | 0.967 |
| 赤・手ぶれ | wrong_item | 0.005 | 0.005 | 0.989 | 0.968 |
| 割れ・きれい | damaged | 0.021 | 0.971 | 0.008 | 0.914 |
| 割れ・手ぶれ | damaged | 0.460 | 0.486 | 0.054 | 0.176 |


</details>

### Clef と Clef-flash の速さ

日本語の実験で送った15回の往復時間の中央値は、Clef-flash が166ミリ秒、Clef が406ミリ秒でした。
この往復時間には、日本から Cloudflare のサーバーまでの通信時間が含まれています。
2つのモデルの差は約240ミリ秒で、公式の中央値の差（約170ミリ秒）に近い値でした。

<details><summary>往復時間の全データ（ミリ秒）</summary>


日本語の実験の15回を、送った順に並べています。

| # | 条件 | Clef-flash | Clef |
| --- | --- | --- | --- |
| 1 | 英/英 | 688 | 664 |
| 1 | 日/英 | 542 | 415 |
| 1 | 日/日 | 166 | 528 |
| 2 | 英/英 | 143 | 517 |
| 2 | 日/英 | 128 | 454 |
| 2 | 日/日 | 125 | 397 |
| 3 | 英/英 | 177 | 815 |
| 3 | 日/英 | 166 | 499 |
| 3 | 日/日 | 327 | 380 |
| 4 | 英/英 | 541 | 375 |
| 4 | 日/英 | 141 | 240 |
| 4 | 日/日 | 137 | 373 |
| 5 | 英/英 | 134 | 290 |
| 5 | 日/英 | 144 | 316 |
| 5 | 日/日 | 558 | 406 |


</details>

## 良かった点

- 単純な振り分けであれば、Clef-flash でも短い時間で高い確率の判定が返りました。
- 確率が数値で返るので、しきい値を呼び出し側で決められます。
- 日本語の問い合わせ文でも、英語と同じ程度に判定できました。日本語にしても入力トークン数はほぼ増えませんでした。
- 1回のリクエストに複数の質問を入れられます。`noul` を担当の数だけ並べれば、複数の用件を1回で判定できます。
- 推論コードが Hugging Face で公開されています。ドキュメントに書かれていない入力の並び順や、長い入力の削り方を、コードを読んで確認できました。長い入力を実際に送って確かめる実験をしなくて済んだので、とても助かりました。

## 気になった点

Clef を使う場合、モデルの精度と同じくらい、利用者側の設計が結果を左右します。
私は Jev を試したときにも同じ印象を持ちました。
判定系のモデルに共通する性質だと考えています。

設計で検討が必要な点は次の4つです。

- **範囲外の入力:** Clef は必ず選択肢のどれかを返します。`other` を自分で選択肢に加えるか、`confidence` にしきい値を設ける必要があります。
- **用件が複数ある入力:** `choice` は1つしか選べません。複数の用件がありうる場合は、担当ごとの `noul` を使います。用件が多い場合、Clef-flash は見落とすことがありました。
- **長い入力:** 公開されている推論コードでは、入力が上限を超えると `state` の末尾が削られます。会話ログを古い順に入れると、上限を超えたときに直近の発言が消えます。Workers AI で同じ動きをするかは確認していません。
- **Clef と Clef-flash の使い分け:** 今回の範囲では、単純な分類は Clef-flash で十分でした。複数の用件や画像の細部を判定する場合は、Clef のほうが見落としが少なくなりました。使い分けの基準は、自分のデータで確かめる必要があります。

実際に導入する場合は、次の手順が必要になると思います。

1. 実際の問い合わせに近いデータに正解の担当を付けて、モデルの判定と比べます。用件が複数ある場合は、担当ごとの見落としの件数も数えます。
2. 運用を始めたあとは、担当者が振り分けを手で直した記録を集めます。その記録をもとに、選択肢の説明文やしきい値を見直します。

## 実装で注意する点

実験スクリプトは Claude Code に書いてもらいました。
この章は、Claude Code が実装中に引っかかった点と、仕様や推論コードを読んで注意した点をまとめたものです。
Clef を呼び出すコードを書くとき（AI に書かせるときも含む）の参考にしてください。

### 仕様の不明点は公開されている推論コードで確かめる

入力の並び順や、長い入力をどちらから削るかは、ブログにも model card にも書かれていませんでした。
Hugging Face のリポジトリには、推論コード（`joint_schema_model.py`）が公開されています。
Claude Code がこのコードを読んだ結果、次のことがわかりました。

- モデルへの入力は、system prompt、画像、`state`、質問と選択肢の順に並ぶ
- 入力が上限を超えると、`state` の末尾が削られる
- `choice` の選択肢は id の文字列順に並べ替えられる

選択肢が並べ替えられることがコードでわかっていたので、「選択肢の順番で結果が変わるか」の実験は、Workers AI でも同じかを確かめる1回だけで済みました。
以下の項目のうち、推論コードを根拠にしているものは、その旨を書いています。

### Workers AI と model card で仕様が違う

Hugging Face の model card と Workers AI の入力スキーマでは、仕様が一部違います。
Clef は発表されたばかりで、AI の学習データには仕様が含まれていません。
コードを書く前に、Workers AI の入力スキーマ（`schema-input.json`）を読む必要があります。

| 項目 | model card | Workers AI |
| --- | --- | --- |
| `instructions` | 省略可 | 質問ごとに必須 |
| 画像の渡し方 | PIL 画像 | base64 のみ（URL 不可） |
| 動画 | 対応 | 項目なし |
| 入力長の上限 | `max_length` の既定値 16,384 | 65,536 トークン |

URL でモデルを指定していても、リクエストの本文に `"model": "clef-flash"` が必要です。

### 画像は PNG / JPEG / WebP だけ

画像は、`{ "content_type": "image/png", "base64": "..." }` の形か、`data:image/png;base64,...` の形で渡します。
SVG は受け付けられません。
今回は SVG でイラストを作ったので、ヘッドレスモードの Chrome でスクリーンショットを撮り、PNG に変換してから送りました。

### 選択肢の id もモデルへの入力になる

推論コードでは、`choice` の選択肢は `{"description":"...","option_id":"returns"}` という JSON の文字列としてモデルに渡されます。
つまり、選択肢の id の文字列も、説明文と一緒にモデルが読みます。
id を `a` / `b` / `c` のような意味のない文字列にするより、`returns` のように意味のある英単語にするほうが安全だと考えられます。
この点は推論コードから読み取ったもので、id を変えて結果を比べる実験はしていません。

選択肢は id の文字列順に並べ替えられてからモデルに渡されます。
`criteria` に書いた順番は結果に影響しません。

### `state` にオブジェクトを渡すとキーが並べ替えられる

`state` には文字列のほか、オブジェクトや配列も渡せます。
推論コードでは、オブジェクトは `json.dumps(sort_keys=True, ensure_ascii=False)` で文字列に変換されます。
キーはアルファベット順に並べ替えられるので、キーの順番に意味を持たせることはできません。
`ensure_ascii=False` なので、日本語は `\u` 形式にエスケープされず、そのままの文字で入力されます。

### `state` は末尾から削られる

推論コードでは、入力が上限を超えると、`state` の末尾が削られます。
質問と選択肢は削られず、質問と選択肢だけで上限を超える場合はエラーになります。
会話ログを `state` に入れるときは、新しい発言を先頭に置くか、長さを事前に切り詰める必要があります。
Workers AI で同じ動きをするかは確認していません。

### 同じリクエストの質問は互いに影響しうる

推論コードの system prompt には「すべての項目を合わせて判断する（Decide every field jointly）」と書かれています。
1回のリクエストに複数の質問を入れると、質問同士の判定が影響し合う可能性があります。
質問ごとの精度を正確に比べたい場合は、質問を別々のリクエストに分けて送るほうが確実です。

### レスポンスの値の扱い

- 確率は小数点以下4桁に丸められて返ります。
- `usage.output_tokens` は、レスポンスを確認した32回のリクエストですべて0でした。
- `confidence` の計算方法は公開されていません。確率が均等に近いほど低い値になりますが、最大の確率とは別の値です。しきい値に使う場合は、自分のデータで値の分布を確かめる必要があります。
- `choice` は、どの選択肢にも当てはまらない入力でも、必ずどれかの選択肢を返します。

## まとめ

Clef は、文章や画像を決めた選択肢に振り分ける用途で、短い時間で確率付きの判定を返すモデルでした。
日本語の問い合わせ文でも、今回の範囲では英語と同じ程度に判定できました。
一方で、範囲外の入力や複数の用件を正しく扱えるかは、選択肢と質問の設計で決まります。
導入を考える場合は、自分のデータで正解付きの評価をしてから判断するのがよいと考えています。

## 参考文献

- 発表記事: https://blog.cloudflare.com/clef-decision-models/
- Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/ ・ https://developers.cloudflare.com/workers-ai/models/clef-flash/
- Hugging Face: https://huggingface.co/Cloudflare/clef ・ https://huggingface.co/Cloudflare/clef-flash
