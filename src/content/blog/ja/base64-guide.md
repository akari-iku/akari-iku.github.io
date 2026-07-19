---
title: BASE64と私の親密度をあげる
description: 最近個人の趣味のゆる開発でも仕事開発でも本当に「BASE64」に出会う。
date: '2025-11-15'
tags:
  - python
  - gas
  - 備忘録
  - base64
  - dify
lang: ja
pair: increase-my-familiarity-with-base64
source: zenn
accent: '#00A0E9'
---

<!-- generated from articles/zenn/2025-11-15-base64-guide.md by scripts/import-articles.ts - do not edit -->

## はじめに
最近個人の趣味のゆる開発でも仕事開発でも本当に「BASE64」に出会う。
本当にたまたまなのかもしれないけど、数か月振りに別案件でも会うみたいな感じです。
もうなんか自分の友達以上に出会う頻度です。
エンコード、デコード、どっちもなんか「あ、また会ったね」みたいなレベルで会う。
この一年での「会ったねシリーズ」は以下です。多分まだ年内増えるかもです。

- Claude APIに画像を送る → BASE64
- Stable Diffusion APIを叩く → BASE64
- Difyでファイルを扱う → BASE64
- メールデータをLLMに解析させる → BASE64

なんとか自分の力で対応や実装は出来るから仕事や開発に影響はない。
ないんだけど、なんでこいつ毎回俺の隣に座るんだ..？みたいになってます。
マッチングアプリで私とBASE64の脅威のマッチ率とかなんですかね、って感じです。
だがしかし恋ではない。友情は流石にあるかもしれません。

そう思いながらも、気づけば何度も同じような処理を書いたり実装したりな気がします。
というか流石に覚えた。**俺、お前のこともう少し理解したいよ…**、と。
今回は、そんな**逃れられないBASE64との付き合い方**を、歴史的背景から実践的な話までまとめて、BASE64くんの事、理解解像度をいっちょ上げるか、という話です。

## なぜBASE64は今も使われ続けるのか

### メール時代の遺産
そもそも君いつからいるんですか。お生まれは？というやつですね。
BASE64の歴史は1990年代にさかのぼります。
当時のメールシステム（SMTP）は**7ビットのASCIIテキスト**しか扱えませんでした。
※ASCII = 英数字と記号だけの文字コード。日本語も画像も送れない時代だった。

しかし、画像や添付ファイルといったバイナリデータをメールで送りたいというニーズがあった。
現代のメールやチャットサービス、SNSでは当たり前のように画像や動画が添付できますしね。

そこで考案されたのが**BASE64エンコード**です。
バイナリデータを「安全なテキスト」に変換することで、テキストベースのシステムでも運べるようにしたのです。
意外にも歴史単位で見ると最近なんだな、と思います。
歴史も好きなので、気軽に百年単位や一世紀単位という言葉に触れる都合上最近と感じるだけかもしれません。

**RFC 2045（MIME - Multipurpose Internet Mail Extensions）** で標準化され、以降インターネットの標準技術として定着しました。

### なぜ令和の今も必要なのか？

「それは昔の話でしょ？今は違うんじゃない？令和も早い事にもう結構経ちましたよ？」
そう思いたいところですが、実は**インターネットの根幹がテキストベースで設計されている**という事実は変わっていません。
ビットの世界だからそうだよね、って感じではあるんですけど、だからこそもう少しスタイリッシュにならんか、とも考えるんですけども。

#### 1. JSONとの相性問題

現代のREST APIの標準フォーマットは**JSON**です。
JSON先輩ってやっぱ強い。とはいえ、JSONは、2001年頃にDouglas Crockfordによって考案され、2006年にRFC 4627として正式に標準化されたので、比較的JSON先輩も若い部類なのですが。
正式名称は、JavaScript Object Notationで、ウェブアプリケーションでサーバーとクライアント間のデータ転送に広く使われているので、昨今のAI開発周りのRAG周りではよくお世話になってます。
しかしJSON仕様上、バイナリデータを直接入れることはできません。

```json
{
  "image": "ここにバイナリは入れられないヨ！"
}
```

そのため、画像などのバイナリデータをAPIで送る際は、BASE64でテキスト化する必要があります。

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

#### 2. テキストベースプロトコルの制約

HTTP、SMTP、その他多くの通信プロトコルは、基本的にテキストベースで設計されています。
バイナリデータを安全に運ぶには「テキスト化」が必要なのです。
テキスト化、というよりかはPC間での相互言語で受け渡しをしやすくしている、の方がピンとくるかもですね。

#### 3. 後方互換性という名の呪縛

既存の膨大なシステムが全てBASE64前提で動いています。
今さら変更するコストが膨大すぎて、変えられないのが現実です。
これ直近システム切り替える云々の話でも出たんですけど、本当にまあコストも時間もかかるし今更変えなくていいよね、っていう。
特にインターネットそもそもの基盤にもうなってるものを今更ひっくり返すのは確かにナンセンスか、と私も納得はしてます。

#### 4. セキュリティ的な安全性

BASE64エンコードされたデータは「ただの文字列」として扱えるため、特殊文字によるインジェクション攻撃などを防ぎやすくなります。
この点はとてもえらい。いつだって戸締りはもちろんですが、鍵はかけておきたいし。
セキュリティはいつだって堅牢でありたい。

### AI開発における必然性

特にAI開発では、この問題が顕著です。
最近私と彼(BASE64)が出会う理由はこれかな、と。

- **API通信 = JSON = テキストのみ**
- **画像・音声・動画 = バイナリデータ**

この2つを橋渡しするのが**BASE64**なのです。

OpenAI、Anthropic、Google、その他ほぼ全てのAI APIが画像入力にBASE64を採用しているのは、こうした構造的な理由があります。

## AI開発での具体的なユースケース

ここからは、実際のAI開発でBASE64がどう使われるかを見ていきます。

### ケース1: APIに画像を送る

最も頻出するパターンです。
Claude、GPT、Geminiなど、画像を扱うAIはほぼ全てBASE64形式を要求します。

**やりたいこと**: ローカルの画像ファイルをAIに解析させる

```python
import base64
import requests

# 画像をBASE64エンコード
with open("image.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# APIリクエスト
# 注: モデル名は最新のものを使用してください。一応記事書いている段階での最新のですが見るタイミングによっては古いはずなので！
# 最新モデルはAnthropicのドキュメントを参照: https://docs.anthropic.com/
response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "x-api-key": "YOUR_API_KEY",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    json={
        "model": "claude-3-opus-20240229",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": "この画像について説明してください"
                    }
                ]
            }
        ]
    }
)
```

### ケース2: メールデータをLLMに解析させる

一斉メール送信サービス系の受信したメールやGmailから取得したメールデータは
送信元のサービスにもよりますが、しばしば**マルチパート形式**（HTML + テキストの混在）になっています。

**問題点**: マルチパート形式をそのままLLMに投げても、構造が複雑すぎて正しく解釈できない

**解決策**: BASE64エンコードして「ただのテキストデータ」として扱える形にする

```python
import base64
import json

# マルチパート形式のメールデータ
email_content = """
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset="UTF-8"

プレーンテキスト版

--boundary123
Content-Type: text/html; charset="UTF-8"

<html><body>HTML版</body></html>
--boundary123--
"""

# BASE64エンコード
encoded_email = base64.b64encode(email_content.encode('utf-8')).decode('utf-8')

# JSONに格納してChatGPTに送信
payload = {
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": f"以下のBASE64エンコードされたメールを解析してください:\n{encoded_email}"
        }
    ]
}
```

### ケース3: DifyでData URI形式を活用

DifyなどのノーコードAIプラットフォームでは、ファイルを**Data URI形式**で扱うことがあります。

**やりたいこと**: MarkdownコンテンツをHTMLファイルとして出力

```python
import base64

html_content = """
<!DOCTYPE html>
<html>
<head><title>Generated Content</title></head>
<body>
<h1>AIが生成したコンテンツ</h1>
<p>本文...</p>
</body>
</html>
"""

# Data URI形式に変換
encoded = base64.b64encode(html_content.encode('utf-8')).decode('utf-8')
data_uri = f"data:text/html;base64,{encoded}"

# この文字列をDifyのワークフローで扱える
print(data_uri)
```

**なぜData URIにしたの？**
システムの都合上、ファイルとして扱いやすく、埋め込みやすい形式だからです。
まあ、プラグインやツールなどを利用できる場合は、それらで解決もできます。
というか、その方が美しいというね。とはいえ、色々な都合でこれらの拡張パーツが入れられないも往々にしてあるよね、という。

### ケース4: キャンバスから画像を保存

JavaScriptでHTML Canvasを使った描画アプリを作る場合も、BASE64が登場します。

```javascript
// Canvasから画像を取得
const canvas = document.getElementById('myCanvas');
const dataURL = canvas.toDataURL('image/png'); // ←BASE64形式！

// data:image/png;base64,iVBORw0KGgo... という形式。さっきも見たね。

// サーバーに送信する場合は、プレフィックスを除去
const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');

fetch('/api/save-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64Data })
});
```

## 実装パターン集（コピペで使える）
コピペで使えるとは書いているけど、最近はもうAIとのバイブコーディングかもですが。

### Python編

```python
import base64

# ファイル → BASE64
def file_to_base64(file_path):
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

# BASE64 → ファイル
def base64_to_file(base64_string, output_path):
    with open(output_path, "wb") as f:
        f.write(base64.b64decode(base64_string))

# 文字列 → BASE64
def string_to_base64(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')

# BASE64 → 文字列
def base64_to_string(base64_string):
    return base64.b64decode(base64_string).decode('utf-8')

# URLセーフなBASE64（+/を-_に置換）
def url_safe_base64_encode(data):
    return base64.urlsafe_b64encode(data).decode('utf-8')
```

### JavaScript編

```javascript
// ファイル → BASE64（ブラウザ）
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 使用例
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const base64 = await fileToBase64(e.target.files[0]);
  console.log(base64);
});

// 文字列 → BASE64
function stringToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// BASE64 → 文字列
function base64ToString(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

// Node.js環境
const fs = require('fs');

function fileToBase64Node(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}
```

### Google Apps Script編（Google Drive連携）

ローカル環境でPythonが使えない場合や、Google Driveでファイル管理している場合は、GASも選択肢になります。
というかポジショニングによっては、プログラミング環境がないとかエディタがメモ帳しかなくて泣いたことあるので…。
でも会社のGoogleアカウントがあるのでGASはOK!とかいうのがあった。
メール変換のソースコードは下記ですが、魔改造は結構出来る余地があるはず。
そして、変換前の前後のフォルダ指定をしているのはプログラミングとかITとかそういうのものすごい疎い人でも使えるようにってのがあった名残……。

```javascript
function convertEmlToBase64() {
  // 変換前フォルダのID（Drive URLから取得）
  const inputFolder = DriveApp.getFolderById('INPUT_FOLDER_ID');
  // 変換後フォルダのID
  const outputFolder = DriveApp.getFolderById('OUTPUT_FOLDER_ID');

  const files = inputFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    // .emlファイルのみ処理
    if (file.getName().endsWith('.eml')) {
      // ファイル内容を取得
      const emlContent = file.getBlob().getBytes();

      // BASE64エンコード
      const base64String = Utilities.base64Encode(emlContent);

      // 出力ファイル名を生成
      const outputFileName = file.getName().replace('.eml', '_base64.txt');

      // 変換後フォルダに保存
      outputFolder.createFile(outputFileName, base64String, MimeType.PLAIN_TEXT);

      Logger.log(`変換完了: ${outputFileName}`);
    }
  }

  Logger.log('全ての変換が完了しました');
}
```

**使い方**:
1. Google Driveに「変換前」「変換後」フォルダを作成
2. フォルダのIDをコードに設定
3. Apps Scriptエディタでスクリプトを保存
4. .emlファイルを「変換前」フォルダにアップロード
5. スクリプトを手動実行
6. 「変換後」フォルダにBASE64テキストファイルが出力される

**実際の使用例**:
大規模系一斉送信のMAツールから受信したメールを.emlとしてダウンロードし、GASで一括変換してからChatGPTに投げ込む、というワークフローで活用できます。

**NOTE**: 最近のChatGPTやClaudeは.emlファイルを直接読める可能性があります。まずは直接アップロードを試してみて、ダメならBASE64変換を検討しましょう。この方法は「当時は必要だったが、今は不要かもしれない」典型例です。
年々モデルが賢くなってはいるが、やはりテキスト化はしておいた方が制度が良いとかはあるやもです。

## ハマりがちな罠と対処法

### 1. 改行コードの扱い

BASE64文字列には改行が含まれることがあります。
APIによっては改行を含むBASE64を受け付けない場合があります。
これでめちゃくちゃ過去、変な沼り方したので備忘録です。

**NG例**:
```
iVBORw0KGgoAAAANSUhEUgAAAAUA
AAAFCAYAAACNbyblAAAAHElEQVQI
12P4//8/w38GIAXDIBKE0DHxgljN
```

**OK例（改行なし）**:
```
iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljN
```

**対処法**:
```python
# Pythonの場合、改行を削除
base64_string = base64_string.replace('\n', '').replace('\r', '')

# または、encode時に改行なしで生成
base64.b64encode(data).decode('utf-8')  # これなら改行は入らない
```

### 2. Data URIのプレフィックス

`data:image/png;base64,` というプレフィックスが付いている場合と付いていない場合があります。

**ケースバイケースで対応が必要**:
- ブラウザで直接表示する場合 → プレフィックス**必要**
- APIに送る場合 → プレフィックス**不要**なことが多い

```python
# プレフィックスを除去
if base64_string.startswith('data:'):
    base64_string = base64_string.split(',')[1]

# プレフィックスを追加
data_uri = f"data:image/png;base64,{base64_string}"
```

### 3. MIMEタイプの指定

画像の種類に応じて正しいMIMEタイプを指定しないと、正しく表示・処理されません。

- PNG: `image/png`
- JPEG: `image/jpeg`
- GIF: `image/gif`
- WebP: `image/webp`
- PDF: `application/pdf`
- テキスト: `text/plain`
- HTML: `text/html`

### 4. サイズ制限

BASE64エンコードすると、元のデータより**約33%サイズが増加**します。
これビックリした。素で「なんか変な異常な増え方した？！」って怖かったくらい。

**なぜ増えるのか**: BASE64は3バイトのバイナリデータを4文字のテキストに変換するため、必然的にサイズが増えます。
- 元データ: 3バイト = 24ビット
- BASE64: 4文字（各文字は8ビットで保存） = 32ビット使用
- つまり、24ビットの情報を32ビットで表現するため、約33%（正確には4/3倍）増加する

**計算式**: `BASE64サイズ ≈ 元のサイズ × 4/3`

APIには画像サイズ制限があることが多いので注意が必要です。
使い方とかによって結構バラバラです。

**主要AIサービスの制限例**:
- OpenAI GPT-4V: 画像1枚あたり最大20MB
- Anthropic Claude: 画像1枚あたり最大5MB（8000x8000ピクセルまで）
- Google Gemini: リクエスト全体で最大20MB（インラインデータの場合）

**対処法例**:
```python
from PIL import Image
import io

def compress_image(image_path, max_size_mb=4):
    img = Image.open(image_path)

    # 画像を圧縮
    output = io.BytesIO()
    quality = 95

    while True:
        output.seek(0)
        output.truncate()
        img.save(output, format='JPEG', quality=quality)
        size_mb = output.tell() / (1024 * 1024)

        if size_mb <= max_size_mb or quality <= 10:
            break
        quality -= 5

    return output.getvalue()
```

### 5. URLセーフなBASE64

標準のBASE64は `+` と `/` を含みますが、これらはURLでエンコードが必要な文字です。

**URLセーフ版**: `+` → `-`、`/` → `_` に置換

```python
import base64

# 標準BASE64
standard = base64.b64encode(data)

# URLセーフBASE64
url_safe = base64.urlsafe_b64encode(data)
```

### 6. 文字コードの問題

テキストをBASE64化する場合、文字コードを明示的に指定しないと文字化けします。

```python
# NG: 文字コード未指定
base64.b64encode("日本語".encode())  # デフォルトはUTF-8だが明示しておくにこしたことない

# OK: UTF-8を明示
base64.b64encode("日本語".encode('utf-8'))
```

## なぜ代替手段がないのか

「こんなに面倒なら、他にもっと良い方法があるんじゃないの？」
というかあってくれよって思いました。令和だしスタイリッシュに行きたいじゃん、と。
確かに代替手段は存在します。しかし、それぞれに制約があります。
いつものトレードオフシリーズのお時間になります。

### multipart/form-data

ファイルアップロードで使われる形式です。
BASE64より効率的ですが、**JSONに埋め込めない**という致命的な欠点があります。

REST APIの多くはJSON形式を前提としているため、multipartはファイルアップロード専用の用途に限られます。

### バイナリプロトコル（gRPC、MessagePack等）

バイナリデータをそのまま扱えるプロトコルも存在しますが、REST APIほど普及していません。
既存システムとの互換性や開発者の学習コストを考えると、簡単には移行できません。
普及していない、ということはそういう事なんですね…。

### 直接ファイルパスを渡す

サーバー側にファイルをアップロードして、そのパスをAPIに渡す方法もあります。

**問題点**:
- ファイルアップロード用のエンドポイントが別途必要
- 2回のAPI呼び出しが必要（アップロード → 処理）
- セキュリティリスク（パストラバーサル攻撃など）

### 結論: BASE64が最も現実的

**汎用性**、**互換性**、**セキュリティ**のバランスを考えると、BASE64が最も現実的な選択肢なのです。
BASE64くんとはこれからも友達以上に会うことは避けられん、という事です。
多分また近いうちに会うんだろうな…と予感がしています。
そのうちなんかズッ友になるのか、なんて思えてきました。
私の人生の戦友くらいのポジショニング取ってきそう。

## 今後の展望

「じゃあ、いつまでBASE64使い続けるのかなあ？」

少なくとも、**あと10年、20年は使い続けることになりそう**です。
下手な友人より付き合い長くなりそうです。
技術的戦友枠もうけるか…。
言語版だとPythonくんとかGASくん、Javascriptくんが私の人生の場合座ってるところですが。

理由は以下の通り:

1. **インターネットの根本設計が変わらない**
   - HTTP、JSONといったテキストベースプロトコルは今後も主流

2. **後方互換性の重要性**
   - 既存システムを壊さないことが最優先

3. **新技術の普及には時間がかかる**
   - gRPCなどの新しいプロトコルは徐々に増えているが、REST APIを置き換えるには至っていない

4. **AI分野での需要増加**
   - マルチモーダルAI（画像、音声、動画）の普及により、バイナリデータをテキスト化する需要は増える一方

## まとめ

### BASE64が必要になる場面
- ✅ 画像をREST APIで送る時
- ✅ バイナリデータをJSONに入れる時
- ✅ Data URI形式でファイルを埋め込む時
- ✅ メールの添付ファイル
- ✅ 複雑な構造のデータを安全に運ぶ時

### チェックリスト
- [ ] 改行コードは除去したか？
- [ ] Data URIのプレフィックスは正しいか？
- [ ] MIMEタイプは適切か？
- [ ] ファイルサイズは制限内か？（元サイズ × 1.33で概算）
- [ ] URLセーフ版が必要か？
- [ ] 文字コードは明示したか？（テキストの場合）

## おわりに

BASE64は、一見すると「古臭い技術」に見えるかもしれません。
しかし、インターネットの構造的な制約とAI開発の実情を理解すると、**なぜこれが今も使われ続けているのか**が見えてきました。
少しだけ、BASE64くんの理解度が上がった気がします。
よく合うあいつ、から、色々な所で活躍している友人くらいには。

「またお前か」と思いながらも、BASE64はこれからも私たちの開発に付き合い続けるでしょう。
ポジショニングによりますがね、また会ったら「また会ったね～」くらいの気持ちで今後も彼(BASE64)と向き合いたいです。

この記事が、BASE64くんとの心の距離を近づける記事になると良いです。

## 参考文献

### 公式仕様・標準
- [RFC 2045 - MIME Part One: Format of Internet Message Bodies](https://datatracker.ietf.org/doc/html/rfc2045)
- [RFC 4648 - The Base16, Base32, and Base64 Data Encodings](https://datatracker.ietf.org/doc/html/rfc4648)
- [MDN - Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- [MDN - Base64 encoding and decoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64)

### AI API ドキュメント
- [Anthropic Claude API - Vision](https://docs.anthropic.com/claude/docs/vision)
- [OpenAI GPT-4 Vision API](https://platform.openai.com/docs/guides/images-vision)
- [Google Gemini API](https://ai.google.dev/tutorials/python_quickstart)

### ツール・プラットフォーム
- [Dify Documentation](https://docs.dify.ai/)

### その他参考資料
- [Why does base64 encoding require padding?](https://stackoverflow.com/questions/4080988/why-does-base64-encoding-require-padding)
