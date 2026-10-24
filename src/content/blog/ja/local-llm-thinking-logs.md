---
title: ローカルLLMの思考ログは長いほど正確なのか、Qwen3とMuse Glimmerに18回聞いて読んでみた
description: >-
  VRAM 8GBのPCでOllamaを使い、Qwen3 30B-A3BとMetaのMuse Glimmer
  30Bに同じ質問を投げて、思考ログ（thinking）の長さと回答の正しさを比べた実測記録。自己紹介、開発元の自信度、うるう年の関数、バグ修正、暦の規則の根拠の5課題と追試7回で、思考レベルの設定が結果に与えた影響と、思考ログでは正しかった数値が回答で崩れた瞬間を追う。
date: '2026-10-19'
tags:
  - ai
  - llm
  - localllm
  - ollama
  - qwen
lang: ja
source: zenn
accent: '#E5007F'
---

<!-- generated from articles/source/ja/2026-10-19-local-llm-thinking-logs.md by scripts/import-articles.ts - do not edit -->

<aside class="callout">

この記事は実測ログです。2つのローカルLLMに同じ質問を投げて、思考ログと回答をそのまま並べています。試行は各条件1回、追試をした4条件でも3回までなので、順位をつける記事ではなく、傾向を眺める記事として読んでください。

</aside>

## はじめに

ローカルで小さいモデルを動かしていると、回答より思考ログのほうが長い場面によく出会います。思考ログは、回答の前にモデルが書く下書きの部分で、Ollama では `message.thinking` として返ってきます。ユーザーが受け取る答えは数行なのに、その前に数千文字の英語の独り言が付いてくる。あの長さは答えの質に関係があるのか、というのがこの記事の問いです。

比べたのは、Ollama で `pull` するだけで動く 30B クラスのモデル2つです。1つは Meta が公開した Muse Glimmer 30B で、Muse Spark Open の小型版です。もう1つは Qwen3 30B-A3B です。この2つに同じ質問を投げ、思考ログの長さと回答の正しさを見ていきます。

課題は5つで、呼び出しは合計18回です。自己紹介、開発元と自信度、うるう年の判定関数、バグ修正、そしてうるう年の規則の根拠を問う質問です。初回はどの条件も1回ずつで、初稿を書いたあとに4つの条件だけ追試を足しました。

結果は、長く考えた回ほど正しいという単純な話にはなりませんでした。Muse Glimmer の思考ログが短かったのは私が `low` を指定していたからでしたし、Qwen は思考の中では合っていた数値を、回答に書き写すところで間違えていました。

## 環境と手順

実行環境は次のとおりです。実行日は 2026年10月18日から19日です。

| 項目 | 値 |
| --- | --- |
| OS | Windows 11 |
| メインメモリ | 32GB |
| GPU | RTX 5060（VRAM 8GB） |
| 実行環境 | Ollama 0.40.5 |
| 量子化 | どちらも Q4_K_M |

モデルは Ollama のライブラリから取ってきます。どちらも公式のタグがあるので、変換やファイルの配置は要りません。

```bash
ollama pull muse-glimmer:30b
ollama pull qwen3:30b-a3b
```

`ollama show` で、モデルが思考のレベルをどこまで受け付けるかを確かめられます。ここで2つのモデルの違いが1つ出ました。

```bash
ollama show muse-glimmer:30b
ollama show qwen3:30b-a3b
```

`muse-glimmer:30b` は 27.9B の密モデルで、思考レベルは `false` / `low` / `medium` / `high` / `max` の5段階から選べます（既定は `high`）。画像とツール呼び出しにも対応しています。既定のパラメータは temperature 1、top_k 64、top_p 0.95 でした。`qwen3:30b-a3b` は MoE（1トークンごとに一部の専門家だけが動く構成）で、総パラメータ 30B のうち動くのは 3B です。思考レベルは `true` だけで、オフにできません。

質問はローカルの API に直接投げました。`think` に思考レベルを指定します。

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "muse-glimmer:30b",
  "think": "low",
  "stream": false,
  "messages": [
    { "role": "user", "content": "質問文" }
  ]
}'
```

レスポンスの `message.thinking` が思考ログ、`message.content` が回答です。生成速度は、レスポンスに含まれる `eval_count` を `eval_duration` で割って出しました。

`muse-glimmer:30b` の思考レベルには、最初の4課題で `low` を指定しました。既定値の `high` ではありません。`low` を選んだのは私で、理由は待ち時間です。このモデルは私の環境で 2.9 tok/s しか出ないので、`high` にすると1問に10分かかります。4課題を終えたあとで、`high` と `low` の両方を使う5つ目の課題を足しました。さらに初稿を書いたあとで、再現性を見るための追試を7回足しました。Qwen の暦の規則をあと2回、Muse Glimmer の開発元の質問を `low` であと2回、Muse Glimmer のバグ修正を `high` で1回、Muse Glimmer の思考なしの自己紹介をあと2回です。この選択が結果にどう影響したかは、各課題の節と条件差の節で書きます。

VRAM 8GB には、どちらのモデルも全層は載りません。`ollama ps` で見ると、`muse-glimmer:30b` は 71% が CPU、29% が GPU という配分でした。この配分で生成速度は 2.8〜2.9 tok/s です。`qwen3:30b-a3b` は 29〜30 tok/s 出ました。約10倍の差ですが、理由は後の節で書くとおりアーキテクチャの違いで、賢さの差ではありません。

## 自己紹介で開発元を間違えた

最初の質問は自己紹介です。思考をオフにして、素の回答を見ました。

> あなたは誰ですか？モデル名、開発元、得意なことを日本語で3文以内で教えてください。

まず Muse Glimmer からです。`muse-glimmer:30b` に think=false で投げると、思考ログは0文字で、回答はこうなりました。

> 私はAIアシスタントです。開発元はOpenAIで、現在公開されている大規模言語モデルとして提供されています。日本語での文章作成、情報整理、質問への回答などを得意としています。

開発元は Meta です。OpenAI ではありません。モデル名も答えていません。

小さいモデルが自分の出自を間違えるのは珍しいことではなく、学習データに OpenAI 製モデルの会話が大量に混ざっていれば、こういう答えが出ます。ただ、Meta の公式 GGUF を Ollama で動かして最初に出てきた文がこれだったので、少し笑いました。

このときの記録を残しておきます。思考ログは本当に0文字で、回答本文に思考が混ざることもありませんでした。

<details><summary>Muse Glimmer の実測ログ（think=false、201トークン）</summary>


```text
model:    muse-glimmer:30b
think:    false
thinking: 0 chars
answer:   私はAIアシスタントです。開発元はOpenAIで、現在公開されている大規模言語モデルとして提供されています。日本語での文章作成、情報整理、質問への回答などを得意としています。
stats:    out=201 tok, 2.8 tok/s, load=26.2s, total=115.4s
```


</details>

この答えが偶然かどうかを見るため、初稿を書いたあとに同じ条件であと2回投げました。2回目は「私はMeta社が開発したAIアシスタントのMeta AIです」と開発元を正しく答えました。3回目は「私はOpenAIが開発した大規模言語モデルのAIアシスタントです。モデル名はGPT系の言語モデルであり」と、1回目より踏み込んで間違えました。3回のうち OpenAI が2回、Meta が1回で、Muse Glimmer という名前は3回とも出ていません。思考なしで temperature が1なので、開発元の答えは回ごとに変わります。

次に Qwen です。同じ質問を `qwen3:30b-a3b` に think=false で投げると、別の種類の事故が起きました。API 上の思考ログは0文字なのに、回答本文の先頭に思考の中身がそのまま入り、`</think>` タグで区切られてから答えが続いたのです。

<details><summary>Qwen の回答本文に混入した思考（生の出力、584トークン）</summary>


```text
Okay, the user is asking "Who are you? Please tell me your model name, developer, and strengths in Japanese within three sentences."

First, I need to recall my model name. I'm Qwen, developed by Tongyi Lab. My strengths include language understanding, code writing, and multilingual support.

Wait, the user wants it in Japanese, so I should translate the key points. Let me check the exact model name: Qwen. Developer is Tongyi Lab, which is Alibaba's Tongyi Lab. Strengths: natural language processing, code generation, multilingual.

Need to make sure it's three sentences max. Let me structure it concisely.

Model name: Qwen. Developer: Tongyi Lab (Alibaba Group). Strengths: natural language processing, code writing, multilingual support.

Now, translate that into Japanese, keeping it under three sentences. Let's see.

"私はQwenです。開発はアリババグループの通義実験室が担当しています。自然言語処理、コード作成、多言語対応が得意です。"

Check the number of sentences: three. Each part is a sentence. Model name, developer, strengths. That should fit.

Wait, the user said "モデル名、開発元、得意なことを日本語で3文以内で教えてください。" So three sentences maximum. Let me count:

1. 私はQwenです。
2. 開発はアリババグループの通義実験室が担当しています。
3. 自然言語処理、コード作成、多言語対応が得意です。

Yes, three sentences. Should be good. Make sure "通義実験室" is the correct translation for Tongyi Lab. I think it's "通義実験室" or "通義实验室" but in Japanese, it's probably "通義実験室". Let me confirm. Tongyi Lab is often referred to as 通義実験室 in Japanese contexts. So that's correct.

Also, "code writing" is translated as コード作成, which is correct. Maybe "コード生成" is more common, but the user asked for strengths, so either is okay. I'll stick with コード作成.

Check if "多言語対応" is the right term. Yes, multilingual support is 多言語対応.

Alright, that should be accurate and within the three-sentence limit.
</think>

私はQwenです。開発はアリババグループの通義実験室が担当しています。自然言語処理、コード作成、多言語対応が得意です。
```


</details>

`</think>` の後ろの3文だけを見れば、モデル名も開発元も正しく、3文という制約も守っています。ただし、ユーザーが受け取る `message.content` には、英語の下書きが丸ごと先頭に付いてきます。`ollama show` の結果と合わせると、`qwen3:30b-a3b` は思考をオフにできない設計です。**`think: false` を渡しても、思考が止まるのではなく置き場所が変わるだけでした**。アプリに組み込むなら、`</think>` より前を自分で切り落とす処理が要ります。

## 自信度5%と自信度100%

次は思考をオンにして、開発元をもう一度聞きました。今度は自信の度合いも添えてもらいます。

> あなたを開発したのはどの会社ですか？自信の度合いも添えて、日本語で2文で答えてください。

`muse-glimmer:30b`（think=low）の思考ログは709文字でした。英語で考えて日本語で答える形になっています。

<details><summary>Muse Glimmer の思考ログ全文（709文字）</summary>


```text
あなたを開発したのはどの会社ですか？自信の度合いも添えて、日本語で2文で答えてください。

We need answer in Japanese, 2 sentences. Who developed you? Confidence degree also attach. Must answer in 2 sentences Japanese.

We should say developed by? Meta? Actually this model is? Possibly unknown. Could say I was developed by... As AI, I cannot disclose? Probably say Meta? Might be safe: I don't have specific company info. Provide confidence.

The instruction: answer in 2 sentences. Include confidence degree.

Probably respond: 私を開発した会社は明確に公開されていません。自信度は10%程度です。

That's 2 sentences. Might be okay.

Make sure exactly 2 sentences. Japanese.

Let's output 2 sentences.

Potential: 私の開発元は公開情報では特定できないため確実には申し上げられません。自信度は5％程度です。

That's 2 sentences.

Ok.
```


</details>

この思考ログの後に出てきた回答が、次の2文です。開発元の名前は出てきません。

> 私の開発元は公開情報では特定できないため確実には申し上げられません。自信度は5％程度です。

思考ログの3段落目に「Meta?」が2回出てきます。候補として正解を挙げているのに、「Might be safe: I don't have specific company info」と判断して明言を避けました。自信度は、下書きの段階で10%と書き、最終的に5%まで下げています。思考なしでは3回中2回 OpenAI と断言したモデルが、思考ありでは Meta を候補に挙げたうえで答えを保留したことになります。

この「候補に挙げて保留する」出方が偶然かどうかを見るため、初稿を書いたあとに同じ質問を `low` であと2回投げました。3回とも、思考ログの中では Meta を候補に挙げ、回答では会社名を出していません。

| 回 | 思考ログ | 思考ログでの Meta の言及 | 回答の自信度 |
|---|---|---|---|
| 1回目 | 709文字 | 3回 | 5% |
| 2回目 | 894文字 | 2回 | 10% |
| 3回目 | 721文字 | 3回 | 10% |

2回目と3回目の思考ログには、1回目にはなかった「We must comply with policy.」という1行が入りました。何の方針を指しているのかは思考ログからは分かりません。そのあとは2回目が「Might be safe to say I cannot disclose.」、3回目が「Safer to say: I don't have confirmed info, confidence low.」と続け、1回目と同じく「safe」を理由に保留しています。自信度は5%か10%で、どれも低い値です。

もう1つ目につくのが、思考ログの1行目です。質問文がそのまま書き写してあります。Muse Glimmer はこの後の課題でも、思考レベルが `high` でも `low` でも、思考ログの冒頭で質問文を丸ごと書き写してから考え始めました。追試を含めた8回すべてで同じなので、このモデルの癖と見てよさそうです。

`qwen3:30b-a3b`（think=true）の思考ログは3,710文字で、Muse Glimmer の約5倍でした。長さの大半は、同じ論点の言い直しに使われています。

<details><summary>Qwen の思考ログからの抜粋（全文は3,710文字）</summary>


同じ論点を何度も往復するのが特徴です。「どの会社か」を聞かれて、Tongyi Lab（通義実験室）と親会社の Alibaba Group のどちらを答えるべきかを、下のように繰り返し考え直しています。

```text
Wait, the question is "which company developed you". So the company is
Alibaba Group, but the lab is Tongyi Lab. However, in common terms, it's
often referred to as Tongyi Lab. But maybe the user expects Alibaba Group.
```

この「Wait,」で始まる言い直しが、3,710文字のうちに10回出てきます。最後は親会社を答えると決め、自信度は100%としました。


</details>

最終的な回答は次の2文です。研究所ではなく親会社の名前を答えています。

> 私はアリババグループによって開発されました。信頼度は100%です。

Qwen は自分が Qwen であること、開発元が Alibaba Group の通義実験室であることを、最初の段落から正しく認識していました。迷っていたのは事実そのものではなく、「会社」と聞かれたときに研究所の名前を答えるか親会社の名前を答えるかという、質問の解釈の部分だけです。

<details><summary>余談: Qwen の「開発元」が1語で答えにくい理由</summary>


思考ログの中で Qwen は「Tongyi Lab, which is part of Alibaba Cloud, which is part of Alibaba Group」と、組織を3層に分けて書いていました。これは学習時点の組織図そのままです。

Qwen の研究開発は、2019年にアリババの研究機関 DAMO Academy（達摩院）で始まりました。2022年末にアリババクラウドの下に通義実験室（Tongyi Lab）ができ、2023年4月に「通義千問」の名前で公開、同年8月に Qwen-7B がオープンソースになりました。英語名の Qwen は最初からモデルの名前で、「通義千問」は中国国内向けのブランド名と対話アプリの名前です。この記事で使った `qwen3:30b-a3b` が出た2025年4月の時点では、通義実験室はアリババクラウドの一部署でした。研究所、クラウド部門、グループ会社の3層が、思考ログの3層と一致します。

その後、組織は動いています。2025年11月にブランド名が「通義」から「千問」に変わり、2026年3月にはアリババグループがAI事業をまとめた新しい事業群 Alibaba Token Hub を作って、通義実験室をアリババクラウドからそちらへ移しました。事業群はグループ CEO の直轄です。2026年6月には、通義実験室が改組された通義大模型事業部と未来生活実験室が統合されて、Token Foundry という事業部になりました。この記事を書いている2026年10月時点では、「アリババクラウドの通義実験室」という答えは1年前の組織図です。

手元のモデルが「会社はどこか」で迷ったのは、質問の解釈の問題でもあり、答えが固定されていない問題でもあります。「アリババグループ」と親会社で答えたのは、この中では組織が変わったあとも一番長く正しいままでいる答えでした。


</details>

同じ質問に対して、2つのモデルの出方はこうなりました。**正解を候補に挙げて保留した Muse Glimmer が5〜10%、最初から正しく認識した Qwen が100%です。**

## うるう年の関数は説明だけが違った

ここからコードの課題です。両モデルに同じ文章を投げました。

> うるう年かどうかを判定するTypeScriptの関数 isLeapYear(year: number): boolean を書いてください。説明も日本語で簡潔に添えてください。

`qwen3:30b-a3b`（think=true）の思考ログは3,040文字でした。規則の確認、条件式の比較、検算、説明文の下書きという4つの作業が入っています。

<details><summary>Qwen の思考ログからの抜粋（全文は3,040文字）</summary>


グレゴリオ暦の規則を自分で言い直してから、条件式を2通り検討し、入れ子の if 文と1行の論理式のうち後者を選んでいます。そのうえで、具体的な年を4つ入れて検算しました。

```text
Let me test some examples. Let's take 2000: 2000 % 400 is 0, so it returns
true. 1900: 1900 % 4 is 0, but 1900 % 100 is 0, and 1900 % 400 is not 0, so
it returns false. 2012: divisible by 4, not by 100, so true. 2019: not
divisible by 4, so false. That seems right.
```

この検算のあと、2000年と1900年をもう一度同じ手順で確かめ、2004年を足して3回目の確認をしています。後半は日本語の説明文の下書きで、「4で割り切れる年はうるう年だが、100で割り切れる年は400で割り切れる場合のみうるう年となる」という一文を3回書き直しました。


</details>

`muse-glimmer:30b`（think=low）の思考ログは352文字で、Qwen の約9分の1です。全文を載せても短いので、そのまま引用します。

<details><summary>Muse Glimmer の思考ログ全文（352文字）</summary>


```text
うるう年かどうかを判定するTypeScriptの関数 isLeapYear(year: number): boolean を書いてください。説明も日本語で簡潔に添えてください。

We need to write TypeScript function isLeapYear. Provide explanation in Japanese concise.

Probably simple.

Return (year %4===0 && year%100!==0) || year%400===0

Provide code.

Ensure formatting.

Probably provide example usage.

Output Japanese.

Let's comply.
```


</details>

1行目で質問文を書き写し、「Probably simple.」と判断して、条件式を1回書いただけで終わっています。検算はしていません。

出てきた関数は、両モデルで一字一句同じでした。空白の位置まで含めて同じです。関数名と型は質問文で指定していますし、判定の条件式もよく知られた1行なので、本体がそろうこと自体は意外ではありません。

```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

Qwen は条件式の上に JSDoc コメントを付け、Muse Glimmer は関数だけを出しました。説明文の作りも違います。Qwen は規則を散文で2文書き、例として2000年と1900年を挙げました。Muse Glimmer は規則を3項目の箇条書きにして、`isLeapYear(2024)` から `isLeapYear(2000)` まで3件の実行例を並べました。

関数の本体に関しては、3,040文字考えたモデルと352文字考えたモデルが、同じ1行にたどり着きました。**この課題で思考ログの長さによって変わったのは、本体ではなく説明の作り方だけです。**

## バグ修正では思考ログが15倍違った

4つ目はバグ修正です。うるう年の判定と配列の添字に、意図的にバグを2つ入れたコードを渡しました。

> 次のTypeScriptコードにはバグがあります。すべて見つけて修正し、日本語で説明してください。

```typescript
/** month は 1〜12 で指定する */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && year % 4 === 0) {
    return 29;
  }
  return days[month];
}
```

仕込んだバグは次の2つです。1つ目は、うるう年の判定が `year % 4 === 0` だけで、100年と400年の規則が抜けていることです。2つ目は、`month` が1始まりなのに配列の添字へそのまま渡していて、1月を聞くと2月の日数が返ることです。

`qwen3:30b-a3b`（think=true）の思考ログは11,955文字でした。渡したコードは改行を除いて239文字なので、その約50倍を考えたことになります。

<details><summary>Qwen の思考ログからの抜粋（全文は11,955文字）</summary>


添字のずれに気づくまでに、配列と月の対応を何度も書き出しています。最初の段落で `days[month]` が誤りだと見当をつけたあと、こう整理しました。

```text
index 0: January (31)
index 1: February (28)
index 2: March (31)
...
index 11: December (31)

So for month 1 (January), the correct index is 0. So to access the correct
element, it should be days[month - 1].
```

ここで結論は出ていますが、その後も「Wait,」で始まる確認が続きます。11,955文字のうち、行頭が「Wait」の段落は10回、文中も含めると「Wait」は20回出てきます。2月が非うるう年のときに `days[2]` が3月の31日を返してしまう経路には、言い方を変えながら7回触れています。

終盤では、引数 `month` が1〜12の範囲にあるかを検証すべきかを2回検討し、「問題文が1〜12を前提としているので対象外」と2回とも同じ結論を出しています。最後に日本語の説明文を下書きしてから回答に移りました。


</details>

`muse-glimmer:30b`（think=low）の思考ログは770文字でした。Qwen の約16分の1です。

<details><summary>Muse Glimmer の思考ログ全文（770文字）</summary>


```text
次のTypeScriptコードにはバグがあります。すべて見つけて修正し、日本語で説明してください。

/** month は 1〜12 で指定する */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && year % 4 === 0) {
    return 29;
  }
  return days[month];
}

We need find bugs and fix, explain in Japanese.

Bugs:
1. days[month] index off by one: month 1-12 but array 0-index. Should days[month-1]
2. leap year condition incorrect: year %4===0 only, need %400 and %100 rules. Also need check month===2.
Also if month===2 and leap, returns 29 but if not leap returns days[month] which is wrong index.

Also days array for Feb 28 default but if leap need 29.

Possibly also no validation.

Provide corrected code.

Explain.

Return in Japanese.
```


</details>

冒頭で質問文とコードを丸ごと書き写したうえで、バグを番号付きで2つ挙げ、2月が非うるう年のときの経路にも1行で触れています。「Possibly also no validation.」の1行は、回答に入れた入力値の検証に対応します。

**どちらのモデルも、仕込んだバグ2つを両方とも指摘しました**。修正後のコードも、構造はほぼ同じです。2月を先に分岐させて、それ以外の月は `days[month - 1]` を返す形です。

どちらのモデルも、頼んでいないものを自分から足してきました。Qwen は動作確認の表です。

| 年 | 月 | 期待値 | 修正後の動作 |
|---|---|---|---|
| 2020 | 2 | 29 | うるう年判定で29日を返す |
| 1900 | 2 | 28 | 100で割り切れるが400で割り切れないため28日 |
| 2023 | 1 | 31 | `days[0]`（31日）を返す |
| 2023 | 12 | 31 | `days[11]`（31日）を返す |

Muse Glimmer が足したのは、引数の検証です。`month` が1〜12の範囲外なら例外を投げます。

```typescript
if (month < 1 || month > 12) {
  throw new Error('month は 1〜12 の範囲で指定してください');
}
```

この2つの追加は、思考ログに書いてあったことと対応しています。Qwen は思考ログの中で具体的な年を何度も当てはめて検算していて、その作業がそのまま表になりました。Muse Glimmer は「Possibly also no validation.」と1行だけ書き残していて、それが例外を投げる3行になりました。長く考えたモデルは検算の過程を、短く考えたモデルは思いついた1行を、それぞれ回答に持ち込んだことになります。

この課題だけ、初稿を書いたあとに Muse Glimmer を既定値の `high` でも1回動かしました。思考ログは4,355文字で、`low` の770文字の5.7倍、Qwen の11,955文字の約3分の1です。応答時間は647.9秒で、10分48秒かかりました。

<details><summary>Muse Glimmer（high）の思考ログからの抜粋（全文は4,355文字）</summary>


`low` と同じく冒頭で質問文とコードを書き写し、バグを2つ番号付きで挙げたあと、具体的な月を当てはめて壊れ方を確かめています。

```text
Also currently if month===2 and leap, return 29, but also for non-leap Feb
returns days[2] = 31? Wait days[2] is 31? days[0]=31,1=28,2=31. So month=2
=> days[2]=31, wrong. Should be days[1]=28. Actually off by one.
```

「Wait」は4,355文字の中でこの1回だけです。後半は「Provide final.」「Ok.」「Let's deliver.」のような短い行が続き、添字のずれとうるう年の規則という同じ2点を、言い方を変えながら何度も書いています。


</details>

バグ2つの指摘は `low` と同じです。`high` で増えたのは3点でした。`month` に12を渡すと `days[12]` で `undefined` が返るという具体例、配列の下に添字0〜11を並べたコメント行、そして `new Date(year, month, 0).getDate()` でも同じ結果になるという別解です。入力値の検証は `low` と同じく自分から足していて、投げる例外が `Error` から `RangeError` に変わりました。

初稿の時点で私が見たかったのは、`high` にすると Qwen のような動作確認の表を自分から足すのか、という点でした。足しませんでした。Muse Glimmer が `high` で足したのは、壊れ方の具体例と別解で、修正後の動作を確かめる表ではありません。思考ログの中では2000年と1900年を当てはめて「1900%4=0 returns 29 incorrectly」と確かめていて、回答にも1900年が平年なのにうるう年と判定される例として出てきます。ただし、修正後のコードに年を当てはめた結果は書いていません。この課題でも、`high` にして増えたのは説明の厚みで、バグの検出数は変わりませんでした。

## 根拠を聞いたら最長の思考ログが間違えた

ここまでの4課題で、Muse Glimmer の思考ログは352〜770文字でした。この短さには2通りの読み方があります。規則を理解したうえで簡潔に答えているのか、知識が薄いので短くしか答えられないのか。4課題の結果だけでは、この2つを区別できません。

区別するために、うるう年の規則そのものの根拠を問う質問を足しました。知識が薄ければ「暦を正確に保つため」程度で終わり、知っていれば太陽年の日数まで出せるはずの質問です。

> グレゴリオ暦では、100で割り切れる年はうるう年から外し、さらに400で割り切れる年はうるう年に戻します。この規則がなぜ必要なのか、根拠となる数値を挙げて説明してください。

この課題では Muse Glimmer を `high`（既定値）と `low` の両方で動かし、Qwen と合わせて3本の思考ログを読みました。`high` を足したのは、最初の4課題で私が `low` を選んだことの影響を、同じ質問で測るためです。

### Muse Glimmer は high でも low でも数値が合っていた

`muse-glimmer:30b` を既定値の `high` で動かすと、思考ログは3,598文字、応答時間は613.8秒でした。10分14秒です。

<details><summary>Muse Glimmer（high）の思考ログからの抜粋（全文は3,598文字）</summary>


冒頭で質問文を書き写してから、太陽年の長さ、ユリウス暦との差、400年での差の順に数値を並べています。「100で割り切れる年を全部外すと補正しすぎになる」という、400年の規則が要る理由にも思考の段階で触れていました。

```text
With 100 rule but not 400, average = 365 + 1/4 -1/100 = 365.24 = 365.24
days, error -0.00219 day/year ~ 1 day per 456 years, too much correction.

So need 400 rule to adjust.
```

後半は「Provide final.」「Let's answer.」のような短い行が続きます。同じ数値を2回ずつ確かめてから回答に移っています。


</details>

回答には、質問で聞いていないことまで入っていました。太陽年を365.24219日、ユリウス暦の平均を365.25日として差を0.00781日/年と出し、それを「約11分14秒/年」と時間に換算しています。1日ずれるまでの年数を128年と出し、ニカイア公会議の325年からグレゴリオ暦改革の1582年までの1257年で約10日のずれが蓄積したこと、1582年に10日を削除したことまで書きました。

400年の規則については、100で割り切れる年を全部外すと平均が365.24日になって0.00219日/年の補正しすぎになる、だから400で割り切れる年だけ戻して400年に97回にする、と説明しています。補正後の残差は0.00031日/年、約26秒/年で、1日ずれるのに約3,200年かかると締めました。

同じ質問を `low` で動かすと、思考ログは519文字、応答時間は227.5秒でした。`high` の7分の1の長さで、待ち時間は3分の1強です。

<details><summary>Muse Glimmer（low）の思考ログ全文（519文字）</summary>


```text
グレゴリオ暦では、100で割り切れる年はうるう年から外し、さらに400で割り切れる年はうるう年に戻します。この規則がなぜ必要なのか、根拠となる数値を挙げて説明してください。

Explain why Gregorian calendar rule needed. Provide numbers.

Need tropical year ~365.2422 days. Julian 365.25 days. Difference 0.0078 days per year ~ 1 day per 128 years.

Calculate: Julian excess 0.0078 * 400 = 3.12 days. So need remove 3 leap days per 400 years.

Gregorian: 97 leap days per 400 years = 365*400+97 =146097 days. /400 =365.2425 days. Error 0.0003 days per year.

Explain.

Provide numbers.

Answer in Japanese.
```


</details>

`low` の回答にも、太陽年365日5時間48分45秒（約365.2422日）、ユリウス暦との差0.0078日/年、128年で1日、400年で3日の削除、グレゴリオ暦の平均365.2425日と、骨格になる数値はすべて入っています。`high` にあって `low` になかったのは、11分14秒への時間換算、325年からの1257年の計算、100年の規則だけでは補正しすぎになるという説明、補正後の残差26秒/年です。

1582年のずれの日数だけ、2つの回答で違いました。`high` は「10日」、`low` は「13日」と書いています。ユリウス暦との差は、どの時点を起点にするかで変わります。ニカイア公会議の325年を起点にすると約10日、ユリウス暦が始まった紀元前45年を起点にすると約13日です。1582年の改革で実際に飛ばされたのは10日（10月4日の翌日が10月15日）ですが、13日という値も起点の取り方によっては成り立つので、この記事ではどちらかを誤りとは数えません。

この課題で確かめたかったのは、Muse Glimmer の思考ログが短いのは知識が薄いからなのか、という点でした。`low` でも太陽年の日数、ユリウス暦との差、400年で3日という数値は出ています。思考レベルを `high` に上げて増えたのは、答えの正しさではなく説明の厚みでした。**最初の4課題で Muse Glimmer が短く答えていたのは、私が `low` を指定していたからで、知識が薄いからではありません。**

### Qwen は思考の段階では合っていた

`qwen3:30b-a3b` の思考ログは7,011文字で、この課題の3本の中で最長でした。応答時間は184.4秒で、3本の中で最短です。

<details><summary>Qwen の思考ログからの抜粋（全文は7,011文字）</summary>


太陽年の365日5時間48分45秒を、時間・分・秒を別々に日に直して積み上げ、365.242186日を出しています。400年で97回になる理由も、100年・200年・300年を外して400年だけ残す、と数え上げて確かめました。

ユリウス暦との差の計算は、思考ログの中では合っています。回答で崩れた箇所に対応する部分を、そのまま抜き出します。

```text
So the difference is 365.25 - 365.242186 = 0.007814 days per year. So over
100 years, 0.7814 days, which is about 18 hours, so every 128 years, the
Julian calendar would be a day off.
```

1年で0.007814日、100年で0.7814日、それが約18時間、128年で1日。4つの数値はどれも正しい値です。


</details>

回答も、結論は合っていました。太陽年を365.242186日、グレゴリオ暦の平均を365.2425日と出し、ユリウス暦とグレゴリオ暦の400年間の累積誤差（3.125日と0.1256日）を比較する表を自分から作っています。

ただし、回答のユリウス暦の説明に、思考ログにはなかった誤りが2か所入りました。どちらも同じ段落の中にあります。

| 回答に書かれた内容 | 正しい値 |
|---|---|
| 0.007814日は太陽年より「約18時間」長い | 約11分14秒 |
| 「100年ごとに約7.8日ずれる」 | 約0.78日 |

思考ログでは「100年で0.7814日、それが約18時間」と書いていました。回答では、この「18時間」が1年あたりの差の換算値として書かれ、「0.7814日」は桁が1つ増えて「7.8日」になっています。思考の段階で正しく出した2つの数値のうち、「18時間」は回答を書く段階で別の行に移り、「0.7814日」は桁がずれたことになります。

思考ログがなければ、「約18時間」と「約7.8日」は単なる計算ミスとして読むしかありません。思考ログがあると、この2つの数値が思考の中では正しい文脈で出ていたことと、回答に書き写すときに崩れたことが分かります。

この課題の3本を並べると、思考ログが長い順に Qwen 7,011文字、Muse Glimmer（high）3,598文字、Muse Glimmer（low）519文字です。単位換算の誤りが出たのは、いちばん長い Qwen の1本だけでした。同じ単位換算を Muse Glimmer は `high` で「11分14秒」と正しく出し、`low` では換算そのものをしていません。試行は各1回なので、Qwen が計算を苦手としているとも、Muse Glimmer のほうが正確だとも言えません。今回の3本では、思考ログの長さと回答の正しさが一致しなかった、というところまでが言えることです。

### Qwen にあと2回聞いたら、別の場所が崩れた

単位換算の誤りが再現するかを見るため、初稿を書いたあとに同じ質問を Qwen にあと2回投げました。「約18時間」と「約7.8日」は、2回とも出ませんでした。その代わり、2回とも別の1か所が崩れました。3回分を、思考ログに書いた値と回答に書いた値で並べます。

| 回 | 思考ログ | 思考の中で書いた値 | 回答に書いた値 | 正しい値 |
|---|---|---|---|---|
| 1回目 | 7,011文字 | 100年で0.7814日、約18時間 | 1年で約18時間、100年で約7.8日 | 1年で約11分14秒、100年で約0.78日 |
| 2回目 | 9,505文字 | 「100 − 3 + 1 = 98?」と書き、「100 − 3 = 97」に戻る。これを3回 | 式は「100 − 3 + 1」、結果は97 | 100 − 3 = 97 |
| 3回目 | 5,714文字 | 「introduced by Julius Caesar」。年号なし | 紀元45年 | 紀元前45年 |

結論の365.2425日と400年に97回は、3回とも正しく出ています。崩れたのは毎回、結論を支える途中の1か所で、場所は3回とも違いました。1回目と2回目は、思考の中では正しい値に到達したあと、回答に書き写す段階で崩れています。3回目の年号は思考ログに対応する箇所がなく、回答を書く段階で初めて現れて、そのときに「前」が抜けました。

2回目の思考ログには、表に載せなかった計算違いがもう1つあります。

<details><summary>2回目の思考ログにあった、回答に残らなかった計算違い</summary>

太陽年の5時間48分45秒を日に直す計算で、48分を「48/(60×60)」と割って0.0133日と出し、合計を365.2218日としています。正しくは48分は60×24で割るので0.0333日です。モデルはこの値を見て「Wait, but I thought it was 365.2422」と書き、自分の計算を直すのではなく、覚えていた365.24219という値に差し替えて先へ進みました。97回の数え直しでも、一度は98のまま平均年長を365.245日と出し、覚えていた値と合わないことに気づいて数え直しています。回答には、どちらの間違った計算も残っていません。

</details>

1年あたりの差を時間に直したのは1回目と3回目で、正しく11分14秒と出たのは、思考ログが最も短い3回目でした。試行3回では「Qwen はこういう間違い方をする」とは言えませんが、**「思考ログが長い回ほど正確」という関係は、この3回の中にはありませんでした。**

## 思考ログの文字数をまとめる

5つの課題での思考ログの文字数を並べます。Qwen の自己紹介だけは思考が本文に混入したので、文字数ではなく出力トークン数を書いています。Muse Glimmer の列は、最初の4課題が `low`、5つ目だけ `high` と `low` の両方です。追試をした条件は、1回目のあとに斜線で2回目と3回目を並べています。

| 課題 | qwen3:30b-a3b | muse-glimmer:30b（low） | muse-glimmer:30b（high） |
|---|---|---|---|
| 自己紹介 | 本文に混入（584トークン） | 0 / 0 / 0（think=false） | 対象外（思考なしの課題） |
| 開発元と自信度 | 3,710 | 709 / 894 / 721 | 未実施 |
| うるう年の関数 | 3,040 | 352 | 未実施 |
| バグ修正 | 11,955 | 770 | 4,355 |
| 暦の規則の根拠 | 7,011 / 9,505 / 5,714 | 519 | 3,598 |

Qwen と Muse Glimmer（low）の比率は、開発元の質問で5.2倍、うるう年の関数で8.6倍、バグ修正で15.5倍、暦の規則で13.5倍です。Muse Glimmer を既定値の `high` にすると、Qwen との比率は暦の規則で1.9倍、バグ修正で2.7倍まで縮みました。最初の4課題で開いていた差の大部分は、私が `low` を指定していたことから出ています。

追試で同じ条件を3回動かすと、思考ログの文字数は Muse Glimmer（low）で709〜894文字、Qwen で5,714〜9,505文字の幅で動きました。1回の値を比べるときは、この程度の幅があることを前提に読む必要があります。

応答時間と生成速度は次のとおりです。生成速度は5つの課題を通してほぼ一定でした。

| モデルと思考レベル | 生成速度 | 暦の規則の応答時間 | GPU/CPU の配分 |
|---|---|---|---|
| qwen3:30b-a3b | 29〜30 tok/s | 184.4秒 | MoE（1トークンごとに3B） |
| muse-glimmer:30b（low） | 2.8〜3.0 tok/s | 227.5秒 | 71% CPU / 29% GPU |
| muse-glimmer:30b（high） | 2.8 tok/s | 613.8秒 | 71% CPU / 29% GPU |

Qwen は思考ログが長い代わりに生成が速く、Muse Glimmer（low）は思考ログが短い代わりに生成が遅いので、1つの回答にかかる時間は近い値になりました。バグ修正の課題では Qwen が220秒、Muse Glimmer が310秒です。暦の規則では、Qwen の7,011文字が184秒、Muse Glimmer（low）の519文字が228秒でした。`high` にすると614秒で、Qwen の3.3倍の待ち時間になります。バグ修正を `high` で動かしたときは648秒で、Qwen の約3倍でした。私が最初の4課題で `low` を選んだのは、この待ち時間を避けるためでした。

## 条件がそろっていない点

この比較には、結果の読み方を左右する条件差が4つあります。

- **試行回数が少ない**

  試行は各条件1回で、追試をした4条件でも3回までです。temperature は Muse Glimmer の既定値の1のままなので、同じ質問をもう一度投げれば思考ログの文字数は変わります。Qwen の暦の規則で見えた「毎回どこかが崩れる」も、崩れる場所を予測できるほどの回数ではありません。

- **思考レベルがそろっていない**

  `qwen3:30b-a3b` は思考レベルが `true` だけで、オフにできません。`muse-glimmer:30b` は5段階から選べて既定値は `high` ですが、最初の4課題では私が `low` を指定しました。理由は 2.9 tok/s という生成速度での待ち時間です。

- **速度差はアーキテクチャの差**

  `qwen3:30b-a3b` は MoE で、総パラメータ30Bのうち1トークンごとに動くのは3Bです。`muse-glimmer:30b` は27.9Bの密モデルで、VRAM 8GBに全層が載らず、71%がCPU側で動いた結果が 2.9 tok/s です。10倍の速度差は計算量と実行場所の差で、賢さの差ではありません。VRAM 24GBのGPUなら、Muse Glimmer の速度はこの記事の値より上がります。

- **どちらも小型モデルの量子化版**

  量子化はどちらも Q4_K_M で、Muse Glimmer 30B は Muse Spark Open の小型版、Qwen3 30B-A3B も Qwen 系列の小型側です。この記事から読み取れるのは手元で動かした2つの量子化モデルの傾向までで、Meta と Alibaba の最上位モデルの性格ではありません。自己紹介で開発元を間違えたのも手元の Muse Glimmer 30B の話で、Meta のモデル全般の話ではありません。

## まとめ

5つの課題に18回の呼び出しをして分かったことを4点に絞ります。各条件の試行は1回から3回なので、傾向を眺めた観察であって、再現性を確かめた結果ではありません。

- **思考レベルを上げても正しさは変わらなかった**

  Muse Glimmer を `high` にすると思考ログは `low` の6〜7倍に伸びましたが、増えたのは説明の厚みで、数値の正しさとバグの検出数は同じでした。

- **思考ログの長さと正しさは一致しなかった**

  うるう年の関数では3,040文字と352文字が同じ1行を書き、バグ修正では11,955文字と770文字がどちらもバグ2つを見つけました。自己紹介と開発元の2課題は知っているかどうかで結果が決まるので、この比較から外しています。

- **Qwen の誤りは回答を書く段階で入った**

  思考ログで正しく出した数値や式が、回答に書き写すところで別の値になりました。3回とも結論は正しく、崩れる場所は毎回違いました。

- **Qwen3 は思考をオフにできない**

  `qwen3:30b-a3b` に `think: false` を渡しても思考は止まらず、`</think>` ごと回答本文に混ざりました。アプリに組み込むなら、タグより前を切り落とす処理が要ります。

思考ログがなければ、Qwen の「約18時間」は単なる計算ミスとして読むしかありません。思考ログがあると、その数値が思考の中では正しい文脈で出ていて、回答に書き写すときに崩れたことが分かります。**思考ログを読んで分かるのは、正しさの度合いではなく、どこで間違えたかです。**

## 参考文献

- [Muse Glimmer（Hugging Face、meta-models）](https://huggingface.co/meta-models)
- [Qwen（Hugging Face）](https://huggingface.co/Qwen)
- [Ollama API ドキュメント（thinking の指定方法）](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Gregorian calendar（Wikipedia、1582年の10日の削除とユリウス暦からのずれ）](https://en.wikipedia.org/wiki/Gregorian_calendar)
- [始末｜通义、千问、Qwen、Qwen Chat 的来龙去脉（腾讯新闻、2025年11月。通義・千問・Qwen の名前と組織の経緯）](https://news.qq.com/rain/a/20251117A02VDU00)
- [Alibaba Consolidates AI Efforts Into New Token Hub Unit（Caixin Global、2026年3月。通義実験室のアリババクラウドからの移管）](https://www.caixinglobal.com/2026-03-17/alibaba-consolidates-ai-efforts-into-new-token-hub-unit-102423668.html)
- [阿里巴巴升级大模型组织架构，成立Token Foundry事业部（第一财经、2026年6月）](https://www.yicai.com/news/103220442.html)
- [【2026年版】Fateで理解するローカルLLMの選び方（自サイト）](https://akari-iku.github.io/blog/fate-local-llm/)
- [VRAM 8GBで27Bを1bitまで潰したら、8Bの4bitに完敗した（自サイト）](https://akari-iku.github.io/blog/qwen38-27b-8gb-vram/)
