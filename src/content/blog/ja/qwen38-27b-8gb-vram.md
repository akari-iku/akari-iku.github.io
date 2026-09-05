---
title: VRAM 8GBで27Bを1bitまで潰したら、8Bの4bitに完敗した
description: >-
  ローカルLLMを8GBに詰め込む実測記録。Unslothの1bit量子化でQwen3.8-27Bは確かに載って31
  tok/s出るが、同じ枠でqwen3:8bを4bitで使うほうが速く正確だった。日本語が無限ループする原因は量子化ではなくpresence_penaltyの欠落。Ollamaにはないと思い込んでいたが、Modelfileのドキュメント表に載っていないだけだった。
date: '2026-08-20'
tags:
  - ollama
  - llamacpp
  - llm
  - localllm
  - qwen
lang: ja
source: zenn
accent: '#E5007F'
---

<!-- generated from articles/old-zenn/2026-08-20-qwen38-27b-8gb-vram.md by scripts/import-articles.ts - do not edit -->

## はじめに

厳密なベンチマークではなく、8GBのカードで1bitを触ってみた記録です。

前回、VRAM 8GBのゲーミングPCでCloudflare OSを動かして、三目並べ1個に5ラウンドかかった話を書きました。


<a class="link-card" href="https://akari-iku.github.io/blog/cloudflare-os-local-llm/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/blog/cloudflare-os-local-llm.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">Cloudflare OSをVRAM 8GBのゲーミングPCで動かしたら、三目並べ1個に5ラウンドかかった話 | akari.log</span>
</span>
</a>


そのとき使っていたのが `qwen3:8b` です。健気で、いい子で、でもCloudflare WorkersにDenoをimportしてくる子でした。

そのあと、8月18日にUnslothがこれを流してきました。

> Qwen3.8-27B Unsloth GGUF is now the #2 trending model on Hugging Face with 2.7M downloads! 💗
>
> Unsloth also reached #3 trending on GitHub!
>
> Thanks so much for the love!
>
> （訳）Qwen3.8-27B Unsloth GGUF が Hugging Face でダウンロード数 270 万を記録し、#2 トレンドモデルに！ 💗 Unsloth も GitHub で #3 トレンドに到達！ 愛を込めてありがとう！


<blockquote class="tweet-card">
<p class="tweet-card-text">Qwen3.8-27B Unsloth GGUF is now the #2 trending model on Hugging Face with 2.7M downloads! 💗<br /><br />Unsloth also reached #3 trending on GitHub!<br /><br />Thanks so much for the love!<br /><br />Model: https://t.co/xIdNwm7CLQ<br />GitHub: https://t.co/aZWYAtakBP</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2089541444466090064" target="_blank" rel="noopener">2026-08-18 · x.com →</a></footer>
</blockquote>


270万DLで#2トレンド。
お、来たかって感じで見ていました。そんなに落とされているなら、8GBに載る量子化もあるんだろうな、と。

平日で仕事もあるので、週末に時間作って遊ぼうか、くらいの気持ちで2bitをラフに触り始めようとか思ってたくらいです。

のんびりできたのは2日弱です。

そこでちょっと目を離した隙に、1bit量子化が出ていました。ツイートは**同じ日の 0:47**、私が気づいたのは夕方です。

<blockquote class="tweet-card">
<p class="tweet-card-text">We’re releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.<br /><br />Unsloth Dynamic V3 outperforms others by &amp;gt;10% on Div-300, KLD &amp;amp; more benchmarks.<br /><br />We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.<br /><br />Blog: https://t.co/tHsBexyh2K<br />GGUF: https://t.co/xIdNwm7CLQ</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2090103470015828184" target="_blank" rel="noopener">2026-08-19 · x.com →</a></footer>
</blockquote>


早いよ。のんびり仕事しながらQwenを中心に愛でている人間からすると早すぎるよ。

そこから1bitを試す会になり、最後は比較用として前回の `qwen3:8b` まで引っ張り出すことになりました。

結果は、**同じ8GB枠なら 8B を4bitで使うほうが速くて正確**。潰すより素直にビットが高いほうを使えばいい、という当たり前の話ではあります。ただ差の大きさは測らないと分かりません。うるう年判定で、27B 1bitは700トークン悩んで書けず、8Bは43トークンで出しました。

この8Bが、さっきの健気な子です。

速度は 5.82 → 31.87 tok/s まで詰められました。
詰まったんですが、**速度より先に品質の壁が来ます**。犯人は量子化ビット数ではなく `presence_penalty` というパラメータ1個の欠落でした。私はこれをOllamaでは指定できないと読み違えたまま、検証を進めています。

「OllamaでラフにローカルLLMを触るぞ」の段階ではなくなる、ということですね。Ollamaで足りるならそれでいいし、そっちのほうが楽です。無茶を言い出したからllama.cppにまで手を出すかという沼に一歩入りそうになった話です。
llama.cppを使うを覚えるとOllmaに戻れなくなる気がしている…。

## 検証環境

前回と同じマシンです。
ゲーミング用に組んだもので、AI用に用意したものではありません。

| 項目 | 値 |
| --- | --- |
| OS | Windows 11 |
| GPU | RTX 5060 / VRAM 8151 MiB |
| RAM | 32 GB |
| Ollama | 0.32.14 |

## 今回の測り方

- 各課題1回ずつ。同じプロンプトを複数回投げて平均は取っていない
- seedは固定していない
- 8B側は `qwen3:8b` のOllama blobをそのまま渡した。量子化タイプは確認していない
- tok/s は `jq` で切り捨てている。8Bが3課題とも「47」なのはそのため
- llama-server はOllama同梱版。ビルド番号を控えていない
- サイズ表記が揃っていない。27B側はHuggingFaceの表示（6.19GB）、8B側は `ls -lh` のGiB（4.9G）。同じ `qwen3:8b` を `ollama list` は 5.2GB と出す

どれも1サンプルなので、順位が入れ替わらない程度の差しか見ていない。

## 8GBで動く、の8GBはVRAMのことではなかった

まずここで転びました。
Unslothのドキュメントにあるハードウェア要件表です。


<a class="link-card" href="https://unsloth.ai/docs/models/qwen3.8" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F2815821428-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FHpyELzcNe0topgVLGCZY%252Fsites%252Fsite_mXXTe%252Fsocialpreview%252FOeFDVbzp4cgwaId7PbvL%252Funsloth%2520docs%2520pic.png%3Falt%3Dmedia%26token%3Df34a6bcc-db15-449a-bc2d-e0e8f52fe953&amp;width=1200&amp;height=630&amp;sign=9a9d6aae5e35625d4a32adaf8cf74290&amp;sv=3" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">unsloth.ai</span>
<span class="link-card-title">Qwen3.8 - How to Run Locally | Unsloth Documentation</span>
</span>
</a>


| 1-bit | 2-bit | 3-bit | 4-bit | 6-bit | 8-bit | BF16 |
| --- | --- | --- | --- | --- | --- | --- |
| 7-8GB | 9-11GB | 12-14GB | 16-19GB | 23-26GB | 31GB | 56GB |

**この数値はVRAM単独ではなく RAM + VRAM の合計**です。表のヘッダーにそう書いてあります。ユニファイドメモリのMacも同じ枠で数える書き方なので、Unsloth側の前提としては筋が通っている。このページで名前が挙がっているランタイムも llama.cpp / vLLM / Unsloth Desktop で、**Ollamaは出てきません**（HuggingFaceのモデルページのほうには `ollama run` のコマンドがあります）。

ズレるのは、VRAM 8GBのカード1枚で読んだときです。「2bitなら9-11GBだから8GBカードでいけるだろう」は、この表が答えている問いとは別の問いでした。

実ファイルサイズはこうです（unsloth/Qwen3.8-27B-GGUF）。

| 量子化 | サイズ |
| --- | --- |
| UD-IQ2_XXS | 7.27 GB |
| UD-IQ2_S | 8.37 GB |
| UD-Q2_K_XL | 9.83 GB（Unsloth推奨の最小品質ライン） |
| UD-Q3_K_XL | 13.1 GB |

VRAM 8151 MiB に「重みだけなら」収まるのは UD-IQ2_XXS だけ。Unslothが推奨している最小品質ラインは 9.83GB なので、その一段下を選ぶことになります。始まる前から旗色が悪い。
VLAMというかメモリ系に極振った1台が欲しいですね、早く。

## Ollamaは qwen3.8 を素直に飲み込んだ

新しいアーキテクチャなのでランナー側が対応していないかもと心配していたんですが、杞憂でした。

- Ollama公式ライブラリに `qwen3.8:27b`（18GB, 256K context）が存在する → ランナーが `qwen3.8` アーキテクチャを認識できる
- Unsloth GGUFの `hf.co/` プルも正常に通った
- mmproj（vision projector）問題は発生しなかった

3つ目が地味にありがたいところです。Qwen3.6世代では、mmproj付きGGUFをOllamaに入れると `families` が `['qwen35moe', 'clip']` になってロードに失敗するissueが複数報告されていました（[#14730](https://github.com/ollama/ollama/issues/14730)）。Qwen3.8 + Ollama 0.32.14 の組み合わせでは踏まずに済みました。

```bash
ollama pull hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS
# → 8.2 GB でダウンロード完了、そのまま推論できた
```

## Ollamaで詰められるところまで詰める

何もしない状態のベースラインがこれです。

```text
SIZE       9.0 GB
PROCESSOR  40%/60% CPU/GPU
CONTEXT    16384
eval rate  5.82 tokens/s
```

4割がCPUに残っています。ここから削っていきます。

### アプリを全部落としても555MiBしか空かない

「Chromeとか落とせるもの一旦落とすか」と考えて、実際に測りました。

| 状態 | VRAM使用 | 空き |
| --- | --- | --- |
| モデルをロード中 | 6891 MiB | 1006 MiB |
| モデルを降ろした状態 | **555 MiB** | 7342 MiB |

Discord・VS Code・EdgeWebView・Windowsシェル系を全部合わせて555MiBです。しかも explorer.exe やシェル系は落とせないので、実際に稼げるのは300〜400MB程度。モデル側は1.7GB足りていないので、焼け石に水でした。
本当にWindowsの個人的な嫌いなところです。
Linuxに帰るのが本当に最適すぎるが本当に多すぎる。
普段の個人用途だとWindowsが最適なのでしませんが。

前回この構成で「デスクトップ常駐で1.1GB持っていかれる」と書いたんですが、今回はもっと少ない。前回はChromeでタブを開きながら作業していたので、その差だと思います。いずれにせよ、削って稼げる桁ではない。

手を入れるべきは設定側です。行きましょう。

### 速度に出るのはKVキャッシュのほうで、コンテキスト長ではない

KVキャッシュをq8_0に量子化します。

```text
SIZE       8.5 GB   （-500MB）
PROCESSOR  39%/61% CPU/GPU
CONTEXT    16384
eval rate  6.21 tokens/s   （+7%）
```

コンテキスト長を維持したまま500MB削減。アプリを全部落として稼げる量の倍以上です。

次にコンテキスト長を 16384 → 4096 に落としました（Modelfile経由）。

```text
SIZE       8.1 GB
PROCESSOR  33%/67% CPU/GPU
CONTEXT    4096
eval rate  6.30 tokens/s（4029トークン生成）
```

**num_ctx を削っても速度はほぼ変わりませんでした**（6.21 → 6.30 tok/s）。VRAM使用量は8.5→8.1GBに減って、CPU比率も39%→33%に下がったのに、速度に反映されない。なぜここまで動かないのかは切り分けていません。**VRAMが空いた分がそのまま速度になるわけではない**、という事実だけ置いておきます。

なお計測の途中で一度 8.19 tok/s という数字が出たんですが、**これは9トークンしか生成していないサンプルで無効**という認識です。9トークンだと1トークンごとのばらつきがそのまま比率に出るので、数字が暴れます。最低でも数百トークンは生成させないと比較になりません。

危うくそのまま「+30%出た」と書くところでした。
セルフまさかり案件です。

## llama.cppに移したら+48%

Ollama側での詰めが頭打ちになったので、llama.cppに移しました。結果、**同じモデル・同じVRAM使用量で 6.30 → 9.35 tok/s**。

```text
gen_per_s   9.35 tokens/s
VRAM        7779 MiB / 8151 MiB
条件        -c 4096 -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja
```

### llama-server は Ollama に同梱されている

移行にあたって別途インストールする必要はありません。
**Ollamaに完全な機能を持つ `llama-server.exe` が同梱されています**。

```text
%LOCALAPPDATA%\Programs\Ollama\lib\ollama\llama-server.exe
```

フォーク版で機能が削られているのは懸念だったのですが、`-ot`（テンソル単位のデバイス割り当て）や `-ncmoe`（MoEのexpert層だけCPUへ）まで揃ったフル機能版でした。
良かった、あとWindowsに入れたらなんか欠けてるわ、とか未対応とかも結構あるので。

GGUFの再ダウンロードも要りません。
Ollamaがダウンロード済みのblobをそのまま `-m` に渡せます。

```bash
ollama show --modelfile <model> | grep FROM
# → %USERPROFILE%\.ollama\models\blobs\sha256-e792d8fb3142...  （本体）
#   %USERPROFILE%\.ollama\models\blobs\sha256-83ee4f4f205f...  （mmproj）
```

### Ollamaにない3つのオプション

Ollama側では手が出せなかったのがこのあたりです。

- **`-ctk` / `-ctv` を分けられる**：OllamaはKとVを一括指定（`OLLAMA_KV_CACHE_TYPE`）しかできません。llama.cppなら `-ctk q8_0 -ctv q4_0` と分けられる。今回はKをq8に残して、Vだけq4に落としています。Vのほうが精度への影響が小さいと聞いてそうしたんですが、自分で比較はしていません
- **`-ngl` を手動指定できる**：Ollamaの自動判定は安全マージンを取ります。ギリギリまで載せたいときはこれが要る
- **`-ot`（--override-tensor）**：テンソル単位で「attentionはGPU、FFNはCPU」のような配置ができます。層まるごと単位のオフロードより細かく詰められる。Ollamaにはこの概念自体がありません

ただし今回実際に使ったのは上の2つで、**`-ot` は結局触っていません**。+48% がどれによるものかも切り分けていないので、「Ollamaでは選べない設定に手が届いた」という以上のことは言えません。

3つとも「VRAMが足りているなら要らない」ものです。
足りていないから要る。

全部、自分の環境の話です。書いてて苦しいですが、まあ無いものはない。

## Ollama と llama.cpp をどう使い分けるか

これは「乗り換え」の話ではありません。`llama-server.exe` はOllamaのインストールに同梱されているので、両方が最初から手元にある。普段はOllama、詰まったら同じフォルダの中の逃げ道を使う、で成立します。

### 機能の差

| 項目 | Ollama | llama-server |
| --- | --- | --- |
| KVキャッシュ量子化 | K/V**一括**指定（`OLLAMA_KV_CACHE_TYPE`） | **K/V個別**（`-ctk` / `-ctv`） |
| `presence_penalty` | あり（Modelfileのドキュメント表には未記載） | あり |
| GPU層数 | `num_gpu` で手動指定可 | `-ngl` で手動 |
| テンソル単位の配置 | 概念自体がない | `-ot`（attentionはGPU、FFNはCPU等） |
| MoEのexpert層をCPUへ | なし | `-ncmoe` |
| チャットテンプレート | 独自形式に変換 | `--jinja` でGGUF内蔵をそのまま使用 |
| thinking制御 | `think`（bool または low/medium/high/max） | `chat_template_kwargs` |
| 設定の渡し方 | 環境変数（**反映されない罠がある**） | コマンドライン引数（確実） |

### 運用面はOllamaが上

機能差だけ見るとllama.cppの圧勝に見えるんですが、日々触る部分はOllamaのほうが明確に快適です。
というかまあ楽です。

- **`ollama ps` が優秀。** GPU/CPU配分・コンテキスト長・モデルサイズが1コマンドで出ます。今回の検証はほぼこれで進めました。llama-server側は起動ログを漁ることになる
- **モデル管理。** `ollama pull hf.co/...` でHuggingFaceから直接落とせて、blobも管理してくれる。llama-serverはGGUFのパスを自分で管理することになります
- **自動アンロード。** 5分でVRAMを解放する。llama-serverは明示的に落とすまで常駐します
- **モデル切り替え。** リクエストごとにモデルを指定できる。llama-serverは1プロセス1モデル

`ollama ps` が無かったら、今回の検証は倍の時間がかかっていたと思います。

### どちらを使うかの判断

| 状況 | 使うもの |
| --- | --- |
| 身の丈のモデルを普通に使う（8B 4bitなど） | **Ollamaで十分** |
| VRAMギリギリまで詰めたい | llama-server（`-ngl` / `-ot`） |
| 生成が繰り返しで止まらない | **Ollamaで足りる**（`presence_penalty` は両方にある） |
| KVキャッシュをもう一段削りたい | llama-server（`-ctv` だけq4に） |
| チャットテンプレートを疑うとき | llama-server（`--jinja`） |

今回llama.cppが必要になったのは、27Bを1bitまで潰すという無茶をしたからです。後で出てくる8B 4bitは3課題とも `finish: stop` で、一度も打ち切りになっていません。身の丈のモデルを使う限り、Ollamaのままで困りません。

## ハマりどころ

### setx だけでは Ollama に環境変数が届かない

これに一番時間を取られました。

```bash
setx OLLAMA_FLASH_ATTENTION 1
setx OLLAMA_KV_CACHE_TYPE q8_0
```

を実行してOllamaを再起動しても、**設定が反映されません**。`ollama ps` のSIZEが変わらないので気づきました。

- `setx` はUser環境変数に書き込み、`WM_SETTINGCHANGE` をブロードキャストする
- しかし既に起動しているプロセスの環境ブロックは更新されない
- Ollamaトレイアプリを別プロセス（シェル、cmd等）経由で起動すると、その親が持つ古い環境を継承してしまう

厄介なのは、User環境変数自体は正しく保存されていることです。

```powershell
[Environment]::GetEnvironmentVariable('OLLAMA_FLASH_ATTENTION','User')  # → 1
[Environment]::GetEnvironmentVariable('OLLAMA_KV_CACHE_TYPE','User')    # → q8_0
```

保存されているのに効かない。確認しても異常が見つからないので、疑う先が設定から外れていきます。

解決策は、明示的に環境変数を持たせて起動することです。

```powershell
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe"
```

反映されたかは `ollama ps` のSIZEで判断できます（9.0GB → 8.5GB）。

### OLLAMA_CONTEXT_LENGTH をグローバルで下げてはいけない

前回記事の教訓と正面衝突する部分です。

- Ollamaのデフォルトコンテキスト長は4096（VRAM 23GiB未満の場合）
- 短いとシステムプロンプトがエラーも警告もなく静かに切り捨てられる
- 前回はこれを踏んだので `OLLAMA_CONTEXT_LENGTH=16384` をグローバル設定していた

今回VRAMを空けたいからといってこれを4096に戻すと、エージェント用途で同じ地雷を踏み直します。あの症状、モデルが徐々に馬鹿になっていくだけで何も言ってくれないので、二度は付き合いたくない。

**グローバル環境変数ではなくModelfileでモデル単位に持たせるのが正解**でした。
これ私が前回は「環境変数とかいじりな」って人間のよろしくないクエリを投げたのが悪かったなと反省。
ちゃんと指示してやらないとだよね、そうだよね、という自戒です。
Garbage In, Garbage Outさせた人間が悪い、ごめん。

```dockerfile
FROM hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS

PARAMETER num_ctx 4096
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER top_k 20
PARAMETER min_p 0.0
```

```bash
ollama create qwen38-8g -f Modelfile
```

これで「重い27Bは4096、エージェント用途のモデルは16384」を共存させられます。

### Windowsでは nvidia-smi のプロセス別VRAMが取れない

```bash
nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv
```

プロセス一覧は出るのに `used_gpu_memory` が全て `[N/A]` になります。WDDMドライバモデルの制約で、Windowsではプロセス単位の使用量が取得できません。

なので上の「555MiB」も、モデルをロード/アンロードして全体値の差分を引き算して出しています。原始的ですが、これしかない。
まあもっと言えばWindows環境からの脱却あたりが現実解かもしれない。

### 同梱の llama-server はそのままだとGPUを認識しない

```text
warning: no usable GPU found, --gpu-layers option will be ignored
```

`-ngl 99` を指定しても無視され、VRAMが602MiBしか使われずCPU実行になっていました。

原因は、**CUDAバックエンドのDLLが実行ファイルと同じディレクトリにない**ことです。llama.cppはバックエンドDLLを実行ファイルと同じ場所から探すんですが、Ollamaはこう配置しています。

```text
lib\ollama\llama-server.exe
lib\ollama\cuda_v12\ggml-cuda.dll
lib\ollama\cuda_v13\ggml-cuda.dll   ← Blackwell(RTX 50xx)はこっち
lib\ollama\vulkan\
lib\ollama\rocm_v7_1\
```

`cuda_v13` には `cublas64_13.dll` などの依存DLLも入っているので、PATHにそのディレクトリを追加した上で `GGML_BACKEND_PATH` でDLLを名指しする必要があります。

```powershell
$cuda = "$base\cuda_v13"
$env:PATH = "$cuda;$base;$env:PATH"
$env:GGML_BACKEND_PATH = "$cuda\ggml-cuda.dll"
& "$base\llama-server.exe" -m $model -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja
```

これでVRAM使用が 602MiB → 7779MiB になりました。

### PowerShellの日本語コメントで param() が丸ごと壊れる

```text
代入式が無効です。
+     [int]$Ngl = 99,
```

`param()` ブロックが丸ごとパースエラーになりました。原因はスクリプトの構文ではなく**文字コード**です。BOMなしUTF-8で書いた日本語コメントを Windows PowerShell 5.1 が cp932 として読み、行が壊れて後続の `param()` まで巻き込んでいた。

エラーメッセージが指している行には、何の問題もありません。PowerShellスクリプトのコメントは英語で書くか、BOM付きUTF-8で保存しましょう。
最早Powershellに関しては日常くらいの受け止め方をしているのでこれくらいで動じていたら、Windowsとはつきあってられませんからね。

## 作業中に1bitが降ってきた

2bitを回してふむふむしていた8月20日、ちょっと目を離した隙にこれが流れていました。投稿は0:47です。

> We're releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.
>
> Unsloth Dynamic V3 outperforms others by >10% on Div-300, KLD & more benchmarks.
>
> We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.
>
> （訳）新しいQwen3.8-27B GGUFsをリリースしました。精度が10%向上しています。Unsloth Dynamic V3は、Div-300、KLD、およびその他のベンチマークで10%以上優れています。また、77%の精度を維持する1ビット量子化もリリースしました。8GB RAMで実行可能です。


<blockquote class="tweet-card">
<p class="tweet-card-text">We’re releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.<br /><br />Unsloth Dynamic V3 outperforms others by &amp;gt;10% on Div-300, KLD &amp;amp; more benchmarks.<br /><br />We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.<br /><br />Blog: https://t.co/tHsBexyh2K<br />GGUF: https://t.co/xIdNwm7CLQ</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2090103470015828184" target="_blank" rel="noopener">2026-08-19 · x.com →</a></footer>
</blockquote>


1ビット？！

HuggingFaceのコレクションを見に行ったら「6時間前に更新」と出ていました。のんびり遊ぶ会が、そのまま1bitを試す会に切り替わります。

そして「8GB RAMで実行可能」。**8GBという数字が指していたのは、2bitではなく1bitのほう**でした。冒頭の要件表でも 1-bit が「7-8GB」、2-bit は「9-11GB」です。

とはいえ、着手した時点でHuggingFaceに並んでいた最小は UD-IQ2_XXS の 7.27GB で、1bitのファイルはまだありません。2bitを選んだのはそれが下限だったからで、**選択肢のほうが後から増えた**という話です。

ここで2bitに戻らず1bitに突っ込んだのには理由があります。
高ビット量子化の検証も、VRAM富豪の計測も、DGX Sparkや帯域の潤沢なマシンでの実測も、そういう環境を持っている人がやってくれます。
Twitterでものすごく見ますしね。
**8GBのカードで1bitを触る機会は、こういうときにしか来ない。**ですし、そもまあそこそこ真面目に1bit探検する人もそういなさそうだし折角です。

なお精度の数字は出典によって食い違います。ツイートは77%、公式ドキュメントは約72%（UD-IQ1_S）。どちらもトップ1%精度の保持率ですが、根拠となるベンチマークが明示されていないので、ここは話半分で見ておきます。この数字については後でもう一度触ります。

| 量子化 | サイズ | 8GB VRAMに収まるか |
| --- | --- | --- |
| UD-IQ1_S | **6.19 GB** | **完全に載る** |
| UD-IQ1_M | 6.73 GB | ほぼ載る |
| UD-IQ2_XXS | 7.27 GB | 載らない（33%がCPUに残る） |

1bitにして初めて**CPUオフロードがゼロ**になりました。

```text
VRAM        6974 MiB / 8151 MiB（空き923MiB）
gen_per_s   30.47 tokens/s
prompt/s    95.0 tokens/s（2bit時は0.92だった）
```

prompt処理が 0.92 → 95.0 と**100倍**になっているのが、全層GPU常駐の何よりの証拠です。
生成側が3倍なのに対して、プロンプト処理はCPUに残っているかどうかで桁が変わる。
数字見た時、ものすごくびっくりした。

速度の話はここで解決しました。ここからが本題です。

## 犯人は量子化ビット数ではなく presence_penalty だった

速度を詰めている最中、ずっと悩まされていた問題があります。「200字程度で」と指示したのに4000トークン以上生成して止まらない。2bitのせいだと思っていました。

### 症状：日本語が無限ループする

2bit（UD-IQ2_XXS）に「日本の四季について200字程度で」と投げた、実際の出力です。

```text
**春**
日本では、春は桜が咲き、桜が満開し、桜の季節となる。春は桜が咲き、桜が満開し、桜の季節となる。
春は桜が咲き、桜が満開し、桜の季節となる。（以下同じ文が9回）

**夏**
夏は暑く、夏は暑く、夏は暑く、夏は暑く、夏は暑く、（以下18回）
```

1bitでも同じことが思考段階で起きます。
こちらはさらに露骨で、**夏にも秋にも桜が咲く**。
綺麗ですね。

```text
**夏 (Summer):**
- Cherry blossoms (桜) bloom
**秋 (Autumn):**
- Cherry blossoms (桜) bloom
```

日本の四季も日本語も、崩壊。わかりやすいですね。

### presence_penalty 1.5 と thinking無効化で止まる

Unslothの推奨パラメータには `presence_penalty=1.5` という高い値が明記されています。これを入れた瞬間に直りました。

| 条件 | 結果 |
| --- | --- |
| 2bit, penaltyなし | 日本語本文が4029トークンループ（`finish: length`） |
| 1bit, penaltyなし | 思考がループ（夏にも秋にも桜が咲く）、2500トークン打ち切り |
| 1bit, penalty 1.5 + thinking有 | 281トークンで停止するが、**思考だけで終わり回答に到達しない** |
| **1bit, penalty 1.5 + thinking無効** | **90トークンで正常終了（`finish: stop`）** |

thinkingも切る必要があります。Unslothの推奨値がそもそもInstruct（非thinking）モード向けの数字なので、筋は通っている。

```json
{
  "temperature": 0.7, "top_p": 0.8, "top_k": 20, "min_p": 0.0,
  "presence_penalty": 1.5,
  "chat_template_kwargs": {"enable_thinking": false}
}
```

出力もまともになりました。

```text
春：新芽が伸びて、桜が満開の季節。温かくはじいて、空気が柔らかくなる。
夏：暑く、熱い季節。雨や雷、緑の季節でもある。
秋：落葉が舞う季節。赤色と橙色の景色。涼しくなって、収穫の季節。
冬：雪の季節。静けさの中で、自然と人が休む季節。
```

「温かくはじいて」が壊れているし、「200字程度」に対して各30〜40字しかない。それでも季節ごとに内容は正しく分かれています。桜は春にしか咲いていない。
表現の一種としては、温かくはじいて、も変ではないのかもとも思わなくもないですがね。
何がはじいているのかわかりませんが。

ここで私は「`presence_penalty` は Ollama にない」と判断しました。Modelfileのドキュメントにある「Valid Parameters and Values」の表に、この名前がないからです。載っているのは `repeat_penalty` と `repeat_last_n` だけ。

間違いでした。

記事を書きながらソースを確認したら、`api/types.go` にこうあります。

```go
RepeatPenalty    float32 `json:"repeat_penalty,omitempty"`
PresencePenalty  float32 `json:"presence_penalty,omitempty"`
FrequencyPenalty float32 `json:"frequency_penalty,omitempty"`
```

Modelfileのパラメータ検証は `FormatParams` がこの構造体のjsonタグをリフレクションで舐めているだけなので、表に載っていなくても `PARAMETER presence_penalty 1.5` は通ります。`/api/chat` の `options` にも、OpenAI互換エンドポイントにも渡せる。`docs/api.md` のほうには例まで載っていました。値まで 1.5 です。

**Modelfileの表にだけ抜けている。** 私はModelfileで詰めていたので、その表を見て「ない」と決めました。

なので llama.cpp に移った理由として残るのは、速度の +48% だけです。品質のほうは、Ollamaのままでも手が届いていた。

ただし「指定できる」ことと、llama-server と同じ結果になることは別です。そこは測っていません。

## 公式の推奨パラメータを後から読んだ

検証を終えてから[Qwen公式のモデルカード](https://huggingface.co/Qwen/Qwen3.8-27B)と[Unslothのドキュメント](https://unsloth.ai/docs/models/qwen3.8)を確認しました。両者で完全に一致しています。

| | Thinking | Instruct（non-thinking） |
| --- | --- | --- |
| temperature | **1.0** | 0.7 |
| top_p | **0.95** | 0.80 |
| top_k | 20 | 20 |
| min_p | 0.0 | 0.0 |
| **presence_penalty** | **0.0** | **1.5** |
| repetition_penalty | 1.0 | 1.0 |

先に読んでおくべきでした。

ただ、この順番だったから見えたものもあります。先に `presence_penalty 1.5` を知っていたら、2bitの「夏は暑く」×18回を見ていません。あれを実際に見たから量子化ビット数以外を疑ったわけで、最初から推奨値で走らせていたら「1bitだから壊れているんだな」で片付けていたと思います。

まずまあ読む方から始めるには寄せておいて方が良かった気がする。
人間側の有限の時間的な意味で、ですが。

### thinkingは公式推奨の条件で測っていない

上の表と突き合わせると、thinkingモードの計測は推奨とは別の条件で走らせていたことになります。

- thinkingモードの `presence_penalty` は 0.0 が推奨。今回は1.5で回した
- thinkingモードの temperature は 1.0、top_p は 0.95 が推奨。今回は終始 0.7 / 0.80（Instruct用の値）だった

もっともこれは推奨を守り損ねたというより、**繰り返しを抑えるためにppを上げた状態で、thinkingがどうなるかを見たかった**からです。「pp1.5 + thinking有効」で281トークン停止・回答に到達しなかったのは、その条件での挙動として読んでください。thinkingモード本来の性能を測ったものではありません。

というか推奨から外れたことしかしていない気がします。
VRAM弱いPCなのでね。

一方、最終的に採用した「thinking無効 + presence_penalty 1.5 + temperature 0.7 + top_p 0.80」は公式のInstructモード推奨と完全に一致しています。そちらの結果（正常な日本語出力、以降のコード生成の検証、8Bとの比較）は条件として問題ないかな、と。

### 公式も「言語混在」を警告している

Qwen公式のモデルカードにこう書いてあります。

> presence_penalty を 0〜2 の間で調整すると endless repetition を減らせる。
> ただし高い値を使うと **language mixing**（言語混在）と、わずかな性能低下を招くことがある

**今回見た「日本語で聞いたのに英語で思考し続ける」現象そのもの**でした。偶然踏んだ地雷ではなく、既知の副作用です。
使う側がある程度英語が堪能なら英語で聞いても良いと思います。
Qwenの育ちを考えると中国語や普通话というか、簡体字での方が良さそうな気持ちは少しあります。
入力というか使う側のスペックは相応に求められそうですが。
英語はまだしも簡体字のピンイン入力は、個人的に付き合いが短い言語なので、まだまだ脳みその負荷がすごいです。

`presence_penalty` は特効薬ではなく、繰り返しの出やすさを調整するつまみです。上げれば言語混在が出る。どこに置くかを決めるだけで、タダで直るものではありません。
実際に使うなら調整しながらになるでしょうね。

### reasoning_effort という選択肢があった

Unslothのドキュメントに、思考の量を制御するオプションの記述がありました。

```bash
--chat-template-kwargs '{"reasoning_effort":"medium"}'
```

> Windows PowerShellでは、ダブルクォートをエスケープする必要がある

今回は使っていません。つまり思考が伸び続ける問題に対して、`presence_penalty` を上げる以外の手がもう一つあったことになります。`reasoning_effort` を下げれば、言語混在の副作用なしに思考量を抑えられた可能性がある。

しかも Ollama の `think` は `"low"` / `"medium"` / `"high"` / `"max"` を取れます。思考量を絞る手は、移行しなくても最初からありました。

ついでに公式が挙げている仕様も置いておきます。

| 項目 | 値 |
| --- | --- |
| 層数 | 64 |
| hidden size | 5120 |
| コンテキスト長 | 262,144（YaRNで最大1,000,000まで拡張可） |
| 推奨出力長（thinking） | 262,144 tokens |
| 推奨出力長（最終応答） | 131,072 tokens |

**推奨出力長が13万トークン**なのに対して、今回の検証は `max_tokens 700` で打ち切っています。「コードのみ」と指示した5行のタスクで700トークン使い切る時点で異常ではあるんですが、公式想定からするとかなり厳しい条件だったことは記録しておきます。

## コード生成の実力を全部走らせて確かめた

ここからは1bit（UD-IQ1_S）+ presence_penalty 1.5 + thinking無効で統一しています。出てきたコードは全部実際に実行しました。

### 分岐が1つならやれる

「リストから重複を除いて順序を保持する関数」。penaltyの値を変えて2回投げました。

```python
# presence_penalty 1.5（53 tok）
def dedupe(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
```

```python
# presence_penalty 0.3（20 tok）
def dedupe(lst):
    return list(dict.fromkeys(lst))
```

どちらも正しい。0.3の方は `dict` が挿入順を保持する性質を使った書き方で、こちらのほうが短くて読みやすいくらいです。

「penaltyを上げるとコードの反復構造が壊れるのでは」と疑っていたんですが、そうはなりませんでした。同じ変数名を繰り返し使うのがコードの本質なので、繰り返しにペナルティをかけたら壊れる気がしますよね。壊れない。

### 完走したコードが一番タチが悪い

「イテラブルをn個ずつに分割するジェネレータ。最後の塊はn未満でも返す」。3つ投げたうち唯一きれいに完走したのがこれです。

```python
def chunked(iterable, n):
    def gen():
        try:
            while True:
                buf = [next(iterable) for _ in range(n)]
                yield from (buf,)
        except StopIteration:
            pass
    return gen()
```

一見それらしい。
実際に走らせるとこうなります。

```text
list入力     → TypeError: 'list' object is not an iterator
iterator入力 → [[1, 2, 3], [4, 5, 6]]        ← 最後の [7] が消えている
```

バグは2つ。`iter()` を通していないので普通のリストで即死するのと、リスト内包表記の途中で `StopIteration` が起きると `buf` ごと捨てられるので、**「最後の塊はn未満でも返す」という要件そのものを満たしていない**こと。

`yield from (buf,)` が `yield buf` と同じ、という無駄な回りくどさも付いています。

構文は正しく、レビューでも見逃しやすく、テストを書いて初めて落ちる。

### 700トークン悩んで書けなかった2問

うるう年判定と二分探索です。どちらも700トークン打ち切りで未完成でした。

まずうるう年。5行で書けるタスクなのに、初手がこれです。

```python
def is_leap_year(year):
    return year % 4 == 0 and not isinstance(year, int)
```

`isinstance` に何の意味もありません。ここからが面白いところで、モデル自身は間違いに気づきます。

```text
Wait, that's wrong. Let me think again.
...
Correct logic:
- if year % 4 != 0: False
- if year % 100 != 0: True (divisible by 4 but not 100)
- else False
```

**言葉での論理は完全に正しい。**
ところがコードに落とすとこうなります。

```python
def is_leap_year(year):
    return year % 4 == 0 and not (year % 100 == 0) if year % 4 == 0 else False
```

そして「No that's wrong」「I'm overcomplicating」と3回自覚しながら、**3回とも同じ誤ったコードを書いて**700トークンを使い切りました。

なお `400` というトークン自体は出力中に3回出現しています。「うるう年の例外規則を知らない」のではなく、知っているのにコードにできない。

二分探索のほうは、思考の途中にこれがありました。

```text
target が小さい場合は右へ、大きい場合は左へ移動する
```

反対です。ソート済み配列でtargetが小さければ左（lo側）に寄せる。二分探索は方向判断そのものが本質なので、ここが壊れると完成しません。
指示する場合はタスクによって、何を依頼するのか、というのの線引きが必要という感じですね。

## 壊れ方の5パターン

4課題を並べて見えてきた壊れ方です。

1. **自己修正ループ** — 間違いを検出する能力は残っているのに、修正先が毎回同じ場所に戻る。「wrong」と自覚しながら同じコードを繰り返してトークンを使い切る
2. **推論とコード生成が別々に劣化する** — 自然言語で条件を正しく述べられるのに、コードに変換する段階で崩れる。思考が合っているぶん誤りに気づきにくい
3. **対称的な概念の取り違え** — 左右・大小・前後。量子化で確率が拮抗すると区別がつかなくなる
4. **コード量ではなく分岐の深さで壊れる**

   | タスク | 分岐 | 結果 |
   | --- | --- | --- |
   | dedupe | 1段 | 完璧（20〜53 tok） |
   | chunked | 1段+例外 | 完走するが2箇所バグ（64 tok） |
   | is_leap_year | 3段の入れ子 | 700 tok打ち切り・未完成 |
   | binary_search | 3分岐+方向判断 | 700 tok打ち切り・未完成 |

   うるう年判定は dedupe より短いコードで済むのに失敗します。難易度ではなく入れ子の深さ

5. **詰まると指示を捨てる** — thinkingを無効化してあるのに、行き詰まると本文中で独り言を始める。「コードのみ」という指示は短いタスクでは守られ、詰まった瞬間に無視される


## 速度は5.5倍まで詰まった

一連のチューニングの結果です。

| 構成 | tok/s |
| --- | --- |
| Ollama デフォルト（2bit, KV f16, ctx 16384） | 5.82 |
| Ollama + KV q8_0 | 6.21 |
| Ollama + KV q8_0 + num_ctx 4096 | 6.30 |
| llama.cpp 2bit（-ctk q8_0 -ctv q4_0） | 9.35 |
| **llama.cpp 1bit（全層GPU常駐）** | **30.47** |
| llama.cpp 1bit + thinking無効 | **31.87** |

大きかった順は、1bit化（全層GPU常駐）> llama.cppへの移行 > KVキャッシュ量子化 >>> アプリを落とす。

31.87 tok/s。実用速度です。ここで終わっていれば「8GBで27Bが動いた」という気持ちのいい記事になっていました。
まあ個人的には用途もありますが速度はそこそこで速すぎてもな、というのが最近思うことがあるくらいです。

## 同じ8GBなら 8B 4bit のほうが速くて正確だった

ここまでの結論は「1bitは分岐1段までなら使える」でした。でも、そもそもの前提を疑う必要があります。**同じVRAM枠を、27Bを1bitに潰して使うのと、8Bを4bitで素直に使うのと、どちらが得なのか。**

前回の `qwen3:8b`（4.9GB）を、まったく同じ条件で走らせました。llama.cpp / `-c 4096 -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja` / presence_penalty 1.5 / thinking無効。

| 課題 | 27B 1bit（6.19GB） | 8B 4bit（4.9GB） |
| --- | --- | --- |
| うるう年 | 700tok打ち切り・**未完成** | **43tok・完璧** |
| 二分探索 | 700tok打ち切り・**未完成** | **89tok・完璧** |
| chunked | 64tok・**2箇所バグ** | 34tok・制限1つ |
| 速度 | 31.87 tok/s | **47 tok/s** |
| VRAM | 6974 MiB | 5722 MiB |

速く、小さく、正確。27Bが700トークン悩んで書けなかったうるう年判定を、8Bは43トークンで出しました。

```python
# 8B 4bit、一発目
def is_leap_year(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
```

```python
# 8B 4bit、二分探索も一発。左右の判断も正しい
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

前回Denoをimportしてきた子と同じモデルです。規約の内面化は苦手でも、教科書に載っているアルゴリズムはちゃんと書ける。

### 決定的な差は「失敗の出方」

chunkedはどちらも不完全でした。8Bの実装はこうです。

```python
# 8B 4bit：len() を使っているのでイテレータは渡せない
def chunked(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i+n]
```

両方を実際に走らせた結果がこれ。

```text
期待値: [[1, 2, 3], [4, 5, 6], [7]]

[27B 1bit]
  ERR  list:     TypeError: 'list' object is not an iterator
  NG   iterator: [[1, 2, 3], [4, 5, 6]]      ← 例外を出さずに [7] を握りつぶす

[8B 4bit]
  OK   list:     [[1, 2, 3], [4, 5, 6], [7]]
  ERR  iterator: TypeError: object of type 'list_iterator' has no len()
```

**今回の3課題では、8Bは「動く」か「明示的に落ちる」かのどちらかでした。** 27B 1bit のほうには、例外を出さずに要素を捨てるケースがある。

これが hooks や harness の効率を決めます。検証ループが機能する前提は「失敗が検出可能な形で出ること」で、`TypeError` はテストを1本走らせれば捕まります。一方 `[[1,2,3],[4,5,6]]` は例外が出ないので、期待値と厳密に突き合わせるテストがない限り素通りします。

### ループを回すコストの計算

| | 1試行あたり | 結果 |
| --- | --- | --- |
| 27B 1bit | 700tok ÷ 31.87 tok/s = **22秒** | リトライしても未完成（同じ誤りに戻る） |
| 8B 4bit | 43tok ÷ 47 tok/s = **1秒** | 一発正解 |

22倍の時間をかけて、正解に辿り着かない。

しかも27B側は自己修正ループで「wrong」と3回自覚して3回同じコードを書いています。外から「テストが落ちた」と伝えても、戻る先が同じなら収束しません。検証ループが意味を持つのは「たまに間違えるモデル」で、同じところに戻るモデルには試行回数が増えるだけです。
だからループを書けと各所で話題ですが、上手いループって結構書くのも作るのも難しいと個人的に思ってます。
フロンティアモデルだろうが、ローカルLLMのかよわい1ビットの子だろうが。

## 壊れたのは生成能力で、評価と補完は残っている

1bitの壊れ方を見ていて気づいたことがあります。**間違いに気づく能力が最後まで残っている。**

うるう年で「Wait, that's wrong」「I'm overcomplicating」と3回自分にダメ出しして、それでも正しいコードに辿り着けなかった。生成能力が先に壊れて、自己評価能力の方が頑健に残っているんですよね。

だとすれば「書かせる」のではなく「選ばせる・埋めさせる」なら動くのではないか。3通り試しました。

### 正解を提示して検算させる → できる

うるう年の実装を3つ並べて選ばせました。自分では書けなかった式について、こう答えます。

```text
Option A: 100 would be considered a leap year, but 100 is NOT a leap year
          under Gregorian calendar rules. So this is WRONG.

1900: True and (False or False) = False  ✓
2000: True and (False or True)  = True   ✓
2008: True and (True or ...)    = True   ✓
Wait, that's exactly what B says.
```

**境界値を自分で選び、3つとも手計算で正しく検証しています。** 1900が400で割り切れないことまで正確。自分では700トークン悩んで書けなかった式を、提示されれば検算できる。

### 誤りを提示して欠陥を特定させる → できない

次に、**自分が3回書いた誤答**を単独で提示して「正しいか」と聞きました。

```python
def is_leap_year(year):
    return year % 4 == 0 and not (year % 100 == 0) if year % 4 == 0 else False
```

判定自体は当たります。「いいえ、この実装は**誤っています**」。しかし理由が全部外れている。

```text
1. **文法構文が不正**: ... Python の文法として無効です
   → 嘘。三項演算子として有効なPython

2. 反例: year = 1900 → False を返します
   しかし、1900年は うるう年ではありません（実際は False が正解です）
   → 反例になっていない。しかも自分で矛盾を書いている
```

このコードが実際に誤るのは2000年（`True and not True` → False を返す）ですが、出力中に `2000` は一度も出てきませんでした。代わりに**存在しない文法エラーをでっち上げています**。

「何かおかしい」というシグナルは残っているのに、「どこが、なぜ」は失われている。**1bitにコードレビューを任せるのは避けたほうがよさそうです。**
この1件では、存在しないバグを自信満々に報告してきました。
まあ、させることはないでしょうが、させるとこういう感じになってしまうという。

### スケルトンを埋めさせる → 完璧にできる

条件をコメントで与えて、穴だけ開けました。

```python
def is_leap_year(year):
    # 条件1: 4で割り切れない年は、うるう年ではない
    # 条件2: 100で割り切れる年は、うるう年ではない
    # 条件3: ただし400で割り切れる年は、うるう年である
    return  # TODO: 条件1〜3をすべて満たす1つの式を書く
```

108トークン、正常終了、一発でこれを出しました。

```python
return (year % 4 == 0 and not (year % 100 == 0) or (year % 400 == 0))
```

標準形とは形が違いますが、`and` が `or` より優先されるので論理的に等価です。`calendar.isleap` と突き合わせて全数チェックしました。

```text
1〜4000年の全数チェック → 不一致: 0
```

**ゼロから書かせると700トークン悩んで失敗した同じモデルが、穴を開けたら108トークンで完璧に埋めた。**

### 渡し方で結果が変わる

| 渡し方 | 結果 |
| --- | --- |
| ゼロから生成させる | 700tok悩んで未完成 |
| 正解を検算させる | ◯ 境界値を自分で選んで全部正しく計算 |
| 誤りの欠陥を特定させる | ✗ 判定は当たるが理由が全部でっち上げ |
| **スケルトンを埋めさせる** | **◎ 108tokで完全正解（全数チェック通過）** |

前回記事の5ラウンド目「完全な実装例を渡すと正確に写経した」の理由が、ここで説明できます。あれは制約設計の勝利であると同時に、壊れているのは生成能力であって評価と補完の能力は生きている、という性質を突いていた。

1bitで通ることと通らないことの境目は、この3つでした。

- **書かせるより、埋めさせる。** 型定義・関数シグネチャ・条件のコメントまで用意して、式だけ書かせれば通る
- **レビューはできない。** 欠陥の特定ができず、存在しない問題を報告してくる
- **候補から選ばせるのは通る。** 正解が選択肢に含まれていれば検算できる

弱いモデルほど「渡すもの」と「渡し方」の設計がものを言います。今回は `presence_penalty` というパラメータ1つで無限ループが正常な日本語になった。フロンティアモデルは雑に渡しても汲んでくれるので、この差が見えにくいだけなんですよね。

渡し方の設計そのものは前に書いています。


<a class="link-card" href="https://akari-iku.github.io/blog/multi-model-handoff/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/blog/multi-model-handoff.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">複数モデルで開発するなら、受け渡し方法も設計しておくといい | akari.log</span>
</span>
</a>


言っていることは同じです。今回はそれを1bitまで振り切ったらどうなるのか、が純粋に見たかった。

## なぜ「77%精度保持」なのに使えないのか

ここまで散々な結果を並べましたが、**Unslothの主張が誇大広告だったわけではありません**。6.19GBで実際に載るし、31 tok/s出るし、「8GB RAMで実行可能」は事実そのものです。精度の数字も、おそらく嘘ではない。測っているものが違うだけだと思います。

Unslothが挙げているベンチマークはこの2つ。

- **Divergence-300 @32** — 未見データ300サンプルで、BF16との**32トークン**追跡を比較
- **KL Divergence** — 出力分布がBF16とどれだけ一致するか

どちらも「正しい文脈が与えられた状態で、次に来るトークンの分布がBF16と一致するか」を見ています。これは今回の実験でいえば**評価能力に近い側**で、そちらは実際に頑健でした。1900/2000/2008を自分で選んで全部正しく計算できたのだから、分布の一致度が72〜77%残っているというのは納得がいきます。

問題は、追跡が32トークンで終わることです。

実用は自己回帰で、一度ズレたらそこから先はズレた文脈の上に積み上がる。うるう年は700トークン悩んで完成しなかったし、2bitの日本語は4029トークンループした。**32トークンの時点では、まだ破綻が見えません。**

| 測っているもの | 実際に使う能力 |
| --- | --- |
| 正しい文脈での次トークン分布 | 自分が出した文脈の上での連続生成 |
| 32トークンの追跡 | 数百〜数千トークンの一貫性 |
| ズレの**瞬間値** | ズレの**累積** |

つまり「77%精度保持」と「使い物にならない」は矛盾しません。**短距離走の記録でマラソンの完走を予測している**ようなもので、今回見えた「評価は頑健、生成が壊れる」という非対称が、そのままベンチマークと実用の乖離になっている。

これはUnslothに限った話ではありません。量子化モデルの数字を見るときは、**それが何トークン分を測ったものか**を確認しておいたほうがいいと思います。長い生成を見る指標もあるので、全部が短距離というわけではありません。

## 1bitに書かせるのではなく、1bitを通してみる

ここまで並べると「1bitは使えない」という話に見えますが、結論としてはちょっと雑だと思っています。わざわざ1bitに実装を任せる場面は、まあ無い。使い道が生成の側にないだけです。

今日いちばん助かったのは、1bitの壊れ方が露骨だったことでした。「文法エラーです」（嘘）、「反例は1900年です」（反例になっていない）。堂々と外してくれるので、どこが足りていないかが見える。フロンティアモデルは曖昧な指示でも汲んでしまうので、こうはなりません。

だとすると、順番を入れ替えられます。**仕様を書いたら、まず1bitに通す。**

- 通れば、指示が具体的だったということ
- 通らなければ、モデルではなく**仕様のほうが曖昧すぎる証拠**

うるう年がまさにそれでした。「うるう年判定を書いて」では700トークン悩んで失敗し、条件を3行のコメントにして穴を開けたら108トークンで全数チェックを通っている。差はモデル側ではなく、渡した仕様の解像度のほうにありました。

前回記事の「完全なスケルトンを渡したら完走した」は、5回失敗したあとの後始末として書きました。同じものを、書き始める前の検査に回せます。

やっていることは、プロンプトを「高校生にも分かるように」書き直すのと同じですね。一時期よくやった、SonnetやHaikuなどの下位モデルに通るかどうかで指示の粗さを測るやつです。

前回こうも書きました。

> 「弱いモデルで通る設計は、強いモデルでも通る。逆は成り立たない」という非対称があります。

これが成り立つなら、1bitで通った仕様は上のモデルでも通るはずです。チェスのポーンみたいな使い方ですね。盤上でいちばん弱い駒ですが、置く場所を選べば仕事をする。

## 閉域環境に持ち込むなら

今回の知見がまとめて活きるのは、**ネットワークが無く、持ち込めるPCも決まっている現場**だと思います。8GB VRAMのノートしかない、外部への通信もできない、という条件で何ができるか。
ぽんぽん良いスペックのPCやスパコンって稟議やら承認やら通すの本当に大変ですからね…。
メーカー系だと多少やりやすいのかな…と思ったけど、個人界隈もいたりするのでそれが現状なのかな。

### 持ち物リスト

- **モデルは 8B 4bit（4.9GB）。** 8GB VRAMに全層載って47 tok/s、うるう年も二分探索も一発正解。27Bを1bitに潰したものより、速く・小さく・正確
- **GGUFファイルを直接持ち込む。** オフラインでは `ollama pull` が使えません。Ollamaのblobは拡張子なしのハッシュ名で取り回しが悪いので、HuggingFaceから落としたGGUFをそのまま運ぶ
- **ランタイムはOllamaで足りる。** 詰めたくなったら同じインストーラーに `llama-server` が同梱されているので、追加バイナリの持ち込み申請をせずに一段深く行ける

### 閉域で詰むのは「調べられない」ことではない

**Ollamaだけでも止まります。** `presence_penalty` も `think` も渡せるので、今回見た無限ループ（「夏は暑く」×18回）は Ollama の枠内で対処できる。持ち込む物が少ないぶん、こっちのほうが筋が良さそうです。

閉域で問題になるのは、パラメータの名前をどこで確認するかのほうでした。私はドキュメントの表を見て「ない」と判断しています。ネットがあれば `api.md` もソースも読めますが、そこまで辿る発想がなければ結論は同じになる。持ち込むべきは「調べ方」ではなく、**確認済みのパラメータ一式**です。

ここが閉域特有の厄介さで、本質は「調べられない」ことではなく**「モノを増やせない」**ことなんですよね。スマホがあれば検索はできる。テザリングもできる。問題は、調べた結果「llama.cppを別途入れよう」となっても、ダウンロードして持ち込めないことです。

| 詰まりどころ | 現地で復旧できるか |
| --- | --- |
| `no usable GPU found` → `GGML_BACKEND_PATH` を設定 | **できる**（環境変数を手で打つだけ） |
| ランタイムを追加インストールしたい | **できない**（持ち込み時点で確定） |

つまり現地で役に立つのは「調べ方」ではなく、**持ち物リスト**のほうになります。

### 起動スクリプト

現地でスマホを見ながら `$env:GGML_BACKEND_PATH` を手打ちするのは避けたいので、スクリプトごと持ち込みます。これ1本でCUDAバックエンドの読み込みからKVキャッシュ設定まで済みます。

**`start-llama.ps1`**

```powershell
param(
    [Parameter(Mandatory=$true)][string]$Model,
    [int]$Ngl = 99,
    [int]$Ctx = 4096,
    [string]$Ctk = "q8_0",
    [string]$Ctv = "q4_0",
    [int]$Port = 18080
)

# Comments must be ASCII: Windows PowerShell 5.1 reads BOM-less UTF-8 as cp932
# and a broken comment line takes the whole param() block down with it.
$base = "$env:LOCALAPPDATA\Programs\Ollama\lib\ollama"
$cuda = "$base\cuda_v13"   # cuda_v12 for older GPUs

$env:PATH = "$cuda;$base;$env:PATH"
$env:GGML_BACKEND_PATH = "$cuda\ggml-cuda.dll"

& "$base\llama-server.exe" `
    -m $Model `
    -c $Ctx `
    -ngl $Ngl `
    -fa on `
    -ctk $Ctk `
    -ctv $Ctv `
    --jinja `
    --host 127.0.0.1 `
    --port $Port
```

```powershell
.\start-llama.ps1 -Model "C:\models\Qwen3-8B-Q4_K_M.gguf"
```

リクエスト側は、`presence_penalty` と thinking無効化を忘れないこと。これを外すと日本語が無限ループします。

```json
{
  "messages": [{"role": "user", "content": "..."}],
  "temperature": 0.7, "top_p": 0.8, "top_k": 20, "min_p": 0.0,
  "presence_penalty": 1.5,
  "chat_template_kwargs": {"enable_thinking": false}
}
```

## まとめ

- **同じ8GBなら、27Bを1bitに潰すより 8B を4bitで使うほうが速くて正確。** 速度47 vs 31.87 tok/s、サイズ4.9 vs 6.19GB、うるう年と二分探索は8Bが一発で、27B 1bitはどちらも未完成。ローカルLLMを8GBで実用にする道はあるが、それは「デカいモデルを圧縮する」側ではなく「身の丈のモデルを素直に使う」側にある
- **速度より先に品質の壁が来る。** そして品質問題の主因は量子化ビット数ではなく `presence_penalty` の欠落だった。Ollamaでは指定できないと思い込んだが、Modelfileのドキュメント表に載っていないだけで、実際には指定できる
- **1bitの使い道は「生成」ではなく「補完」と「検査」。** ゼロから書かせると失敗するが、スケルトンを渡せば全数チェックを通るコードを108トークンで出す。実用範囲は「分岐が1つのユーティリティ関数」まで。それより筋がいいのは、**仕様を1bitに通してみて、通らなければ仕様のほうを直す**という使い方
- 速度は 5.82 → 31.87 tok/s（5.5倍）まで詰まった。決め手は 1bit化（全層GPU常駐）で、次が llama.cppへの移行、その次がKVキャッシュ量子化
- 型で落とせる範囲には境界がある。`iter()` 忘れのような型の不整合はTypeScriptなら捕まるが、chunkedの「最後の塊が消える」は型が通る。**hooksで縛るなら `tsc --noEmit` だけでなくテスト実行まで必要**
- 分析・要約のような**検証しにくいタスクには向かない**。「夏にも秋にも桜が咲く」と書くモデルなので、間違いが検出されないまま成果物に混ざる。実行して確かめられる領域（＝コード）なら、リスクを機械で管理できる

実用の話はここまで。ここから先は感想戦です。

## おわりに

前回、`qwen3:8b` のことを「健気に頑張ってくれるのが可愛い」と書きました。Denoをimportしてきて、エラーを見せたら自分で直さずに一般論の解説を始めた、あの子です。

その健気な子が今回、6.19GBの巨人を43トークンで沈めました。うるう年判定です。27B側は700トークン使って「Wait, that's wrong」と3回自覚しながら、3回とも同じ誤ったコードを書いて力尽きた。

もう「いい子なんですけどね」とは言えないですね。普通に強い。

面白かったのは、1bitの壊れ方が前回と同じ形をしていたことです。前回のCORS無限ループは「エージェントに詰まりを伝える手段がない」というハーネス側の問題として書きました。でも今回、ループも何もない、プロンプト1発の状態で、モデル単体が同じことをやっている。「間違っている」と気づく能力は残っているのに、戻る先が毎回同じ場所なんですよ。

だとすると、あれはハーネスだけの問題ではなかった。停止条件を足しても、戻る先が同じなら回数が減るだけです。

今回のthinking有効時の計測は、公式推奨の条件ではありません。繰り返しを抑えるためにppを1.5まで上げた状態で、thinkingがどう振る舞うかを見ていたからです。`reasoning_effort` も試していない。なので言えるのは「1bitはこう壊れる」ではなく、「この条件で1bitはこう壊れた」までです。

それでも、8Bとの比較のほうは条件を揃えてあるので、あの結果は動きません。

こういう機会でもないと1bitは触らないので、触れたこと自体はよかったです。触った結論が「触らなくていい」だったのは、まあ、そういうこともある。

8GBという枠に対して、私はずっと「モデルをどこまで小さくできるか」を考えていました。2bit、1bit、KVキャッシュ、コンテキスト長。全部モデル側を削る話です。

実際にいちばん大きかったのは、`presence_penalty` を 1.5 にすることと、関数の中身を空にして渡すことでした。**どちらもモデルを1バイトも小さくしていない。**

<details><summary>使ったコマンド一覧</summary>


```bash
# モデル取得
ollama pull hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS

# GPU/CPU配分とコンテキスト長を確認（これが一番重要な診断コマンド）
ollama ps

# VRAM実測
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv

# モデルを降ろす（ベースライン測定用）
ollama stop <model>

# 速度計測
echo "プロンプト" | ollama run --verbose <model>

# Modelfileからモデル作成
ollama create qwen38-8g -f Modelfile

# 対話セッション内で一時的にコンテキスト長を変える
>>> /set parameter num_ctx 4096
```


</details>
