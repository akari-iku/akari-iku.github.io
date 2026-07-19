---
title: Windows環境でClaude Codeを使うときのハマりどころ
description: Windows環境でClaude Codeを使っていると、Mac勢には存在しないハマりどころに出くわします。
date: '2026-03-07'
tags:
  - claude
  - claudecode
  - windows
  - vscode
  - tips
lang: ja
pair: windows-gotchas-claude-code
source: zenn
accent: '#00A0E9'
---

<!-- generated from articles/zenn/2026-03-07-claude-code-windows-gotchas.md by scripts/import-articles.ts - do not edit -->

## はじめに

Windows環境でClaude Codeを使っていると、Mac勢には存在しないハマりどころに出くわします。
公式ドキュメントも含めてMac向けの情報は充実してきていますが、Windows環境の情報が圧倒的に少ない。

自分はWindowsをメイン開発環境にしていて、Claude Codeを使い始めてからいくつかハマりました。設定は合ってるはずなのに動かない。公式ドキュメント通りにやっても挙動が違う。英語で検索してようやくGitHub Issueにたどり着く。

そういうWindows環境特有のハマりどころを、実体験ベースでまとめました。
英語の記事やGitHub Issueにしか情報がなさそうだったので、日本語で残しておきます。

### 私の環境

- OS: Windows 11
- エディタ: VS Code（ビジュアル周りの確認が必要なとき）
- ターミナル: Warp（ビジュアル関係ないとき）
- Claude Code: v2.1.71 / Opus 4.6 / Agent Teams利用

<aside class="callout">

この記事の内容は2026年3月時点の情報に基づいています。
Claude CodeおよびVS Codeの仕様は活発に進化しているので、最新は公式ドキュメントをご確認ください。

</aside>

## GUI版とターミナル版、どっちで動いてる？

最初に前提知識を。
VS Code上でClaude Codeを使う場合、2つのモードがあります。

| | GUI版（WebView） | ターミナル版（CLI） |
|---|---|---|
| 見た目 | VS Codeのサイドパネル/パネル内 | 統合ターミナル内の `>` プロンプト |
| ベース技術 | WebView（ブラウザ相当） | CLIアプリケーション |
| 画像ペースト | `Ctrl+V` で普通に貼れる | `Alt+V`（後述） |
| 切り替え設定 | `claudeCode.useTerminal: false` | `claudeCode.useTerminal: true` |

これを知らないと、ターミナル版でしか使えないと思い込んだり、「黒い画面か…」とモテなくなったり、なぜか画像が貼れないと設定を延々と見直す羽目になります。
ショートカット（というかさすがに画像ペースト）はイコールの存在だろう、と認識していて実際なりました。

切り替えはVS Codeの設定で `claudeCode.useTerminal` を変更するだけです。

## スクショが貼れない！ Ctrl+Vの罠

ここからがメインエピソードです。

ある日、ターミナル版Claude Codeでスクリーンショットを貼り付けようとしました。`Win+Shift+S` でスクショを撮って、`Ctrl+V`。

**何も起きない。**

テキストすら貼れない。右クリックの貼り付けもダメ。ドラッグ＆ドロップすると別タブで画像ファイルが開いてしまう。

### 設定を疑う旅が始まる

まず疑ったのはVS Codeのターミナル設定です。
というか最早Windows環境なので、いつもの環境系が悪さしているのか、と思った。

```json
{
  "terminal.integrated.enableImages": true
}
```

確認済み。有効になっている。

次に、この設定の説明文に書いてあったGPU Acceleration。

```json
{
  "terminal.integrated.gpuAcceleration": "auto"
}
```

これも問題なし。

さらに、Windows固有のConPTY設定。

```json
{
  "terminal.integrated.windowsUseConptyDll": true
}
```

有効。VS Code同梱のConPTY DLL（v1.23）を使う設定もOK。

**全部合ってる。なのに貼れない。**

ConPTY DLLのバージョンまで確認して、「v2以上が必要って書いてあるけど、このバージョン体系でv2ってどこ？」と首をかしげるところまでいきました。

### オチ

検索言語を英語に切り替えて調べたところ、あっさり答えが見つかりました。

**ターミナル版Claude Codeでは `Ctrl+V` ではなく `Alt+V` で画像をペーストする。**

Windowsのターミナルでは `Ctrl+V` がテキストペースト用に予約されているため、Claude Codeは画像ペーストのショートカットを `Alt+V` に割り当てています。

試してみると、一発で貼れました。

設定を30分見直した結果がショートカットキーが違うというオチ。日本語の情報がどこにもなかったので、ここに書いておきます。

ちなみに `Alt+V` を `Ctrl+V` に変更できないかも調べましたが、これはClaude Code CLIのハードコードされたキーバインドで、ユーザー設定では変更できません。慣れるしかないです。
それか一応GitHubのissueで上がってるので、公式が対応をしてくれ……るかなあ…と思いつつも、ユーザー側で現状できることはないです。

<aside class="callout">

ターミナル版Claude Codeで画像をペーストするには `Alt+V`
- `Ctrl+V` → テキストペースト（画像は無視される）
- `Alt+V` → 画像ペースト
- GUI版なら `Ctrl+V` で画像もテキストも貼れる

</aside>

参考:
- [Image paste with Ctrl+V not working on Windows (Issue #9124)](https://github.com/anthropics/claude-code/issues/9124)
- [Cannot paste screenshot images with Ctrl+V (Issue #22377)](https://github.com/anthropics/claude-code/issues/22377)

## VS Code統合ターミナルの画像表示設定

ターミナル版を使う場合、画像の表示にはVS Code側の設定が必要です。`Alt+V` でペーストできても、設定が足りないと画像が正しく表示されません。

必要な設定は3つ。

```json
{
  // ターミナルでの画像表示を有効にする（デフォルト: false）
  "terminal.integrated.enableImages": true,

  // GPU Accelerationを有効にする（"off"だと画像非対応）
  "terminal.integrated.gpuAcceleration": "auto",

  // VS Code同梱のConPTY DLLを使う（Windowsのみ）
  "terminal.integrated.windowsUseConptyDll": true
}
```

設定変更後は**VS Codeの完全再起動**が必要です。`Ctrl+Shift+P` → Reload Window だけでは反映されないことがあります。一度VS Codeを完全に閉じてから起動し直してください。

## npm scriptsのUnix構文問題

Claude Code固有の話ではないですが、Claude Codeと一緒に開発しているとよく遭遇します。

`package.json` のscriptsにこういう記述があるとします。

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--require ./node-compat.cjs' next dev --turbopack"
  }
}
```

`NODE_OPTIONS='...'` というシングルクォートでの環境変数設定はUnix構文です。WindowsのcmdやPowerShellでは通りません。

```bash
# これは失敗する
npm run dev
```

### 回避策

**1. Git Bash経由で直接実行する**

```bash
NODE_OPTIONS='--require ./node-compat.cjs' npx next dev --turbopack
```

`npm run dev` を使わず、Git Bashから直接コマンドを実行すればUnix構文が使えます。

**2. cross-envを使う**

```bash
npm install --save-dev cross-env
```

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--require ./node-compat.cjs' next dev --turbopack"
  }
}
```

`cross-env` はWindows、Mac、Linux共通で環境変数を設定できるパッケージです。チーム開発なら入れておくのが無難です。

Claude Codeが `npm run dev` を実行して失敗した場合、Claude自身はなぜ失敗したか理解できずに別の原因を探し始めることがあります。Windows固有の構文問題だと知っていれば、すぐに回避策を指示できます。

## シェルの使い分け: Git Bash / PowerShell / WSL2

Claude CodeがVS Codeの統合ターミナルでコマンドを実行するとき、どのシェルで実行されるかが地味に効いてきます。

Git Bash、PowerShell、WSL2はそれぞれ挙動が異なり、同じコマンドでも結果が変わることがあります。

### パス変換の罠

Git Bashは内部でWindowsパスをUnixパスに変換します。これが一部のコマンドで問題を起こします。

```bash
# Git Bashでrobocopyを使うとパスが変換されて失敗する
robocopy C:\src C:\dst  # パスが /c/src /c/dst に変換されてしまう
```

ファイル操作はPowerShellコマンドを使う方が安全です。

```powershell
# PowerShellなら確実
Move-Item -Path "C:\src\file.txt" -Destination "C:\dst\"
Copy-Item -Path "C:\src\*" -Destination "C:\dst\" -Recurse
```

### シンボリックリンク

Unix系の `ln -s` はWindows上のGit Bashでは期待通りに動かないことがあります。代わりにNTFSジャンクションを使います。

```cmd
mklink /J "C:\link" "C:\target"
```

### Claude Codeへの伝え方

CLAUDE.mdにシェルの方針を書いておくと、Claude Codeが適切なコマンドを選んでくれます。

```markdown
## プラットフォーム注意事項
- ファイル操作はPowerShellコマンド（Move-Item, Copy-Item）を優先
- Git Bashでのrobocopyはパス変換問題で失敗するため避ける
- シンボリックリンクはNTFSジャンクション（mklink /J）を使用
```

自分の環境ではこういったルールをCLAUDE.mdに書いています。
初期段階である程度設定してましたが、最近はほぼこの辺り追記せずやってます。
Claude Codeは律儀にこれを守ってくれるので、同じ失敗を繰り返さなくなります。
時折まだ、やんちゃな少年の冒険という名の暴走をしますが。

## まとめ: ハマりどころ早見表

| ハマりどころ | 症状 | 解決策 |
|---|---|---|
| 画像ペースト | `Ctrl+V` で何も起きない | `Alt+V` を使う |
| ターミナルの画像表示 | 画像が表示されない | `enableImages`, `gpuAcceleration`, `windowsUseConptyDll` の3点セット |
| npm scripts | `npm run dev` が失敗する | Git Bashで直接実行 or `cross-env` 導入 |
| パス変換 | Git Bashでコマンドが失敗する | PowerShellコマンドを使う |
| シンボリックリンク | `ln -s` が動かない | `mklink /J`（NTFSジャンクション）を使う |
| GUI版 vs ターミナル版 | 挙動の違いに混乱する | `claudeCode.useTerminal` で切り替え |

Windowsは最初のセットアップでひと手間多いですが、一度整えてしまえば快適です。

## 参考

- [Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [Image paste with Ctrl+V not working on Windows (Issue #9124)](https://github.com/anthropics/claude-code/issues/9124)
- [Cannot paste screenshot images with Ctrl+V in VS Code (Issue #22377)](https://github.com/anthropics/claude-code/issues/22377)
- [CTRL+V to paste images not working in Claude Code? [SOLVED]](https://www.jdhodges.com/blog/ctrlv-not-working-in-claude-code-heres-the-simple-fix-solved/)
- [How to Paste Images in Claude Code: The Control+V Fix](https://www.arsturn.com/blog/claude-code-paste-image-guide)
