# akari.log

**https://akari-iku.github.io/**

日本語 | [English](./README.en.md)

モノクロ×刺し色・データブック風の個人サイト & 日英バイリンガル技術ブログ。
白い紙に黒インク、1画面に刺し色1色 — そのルールだけでページを組んでいます。

## 構成

- `/` トップ / `/about` 自己紹介 / `/career` スキル / `/blog` 記事（日本語） / `/tags` タグ索引
- `/en/` 配下に英語版を同構成でミラー。日英ペア記事は相互リンク + `hreflang`
- 全ページ静的生成。フレームワークのクライアントランタイムなし（テーマ切替・全画面メニュー・Mermaid の遅延描画などは素の JS）

## 仕組み

- [Astro](https://astro.build/) + Tailwind CSS + TypeScript (strict)
- 記事は執筆用の正典リポジトリ（非公開）から `scripts/import-articles.ts` で取り込み。Zenn 記法と Dev.to Liquid Tags を標準 Markdown + コンポーネントに変換
- OGP 画像はビルド時に自動生成（記事ヒーローと同一のデザイン言語）
- 同じ記事を [Zenn](https://zenn.dev/akari110) / [Dev.to](https://dev.to/akari_iku) にもクロスポスト（canonical はこのサイト）
- GitHub Actions → GitHub Pages で自動デプロイ

## ライセンス

- コード: [MIT](./LICENSE)
- 記事・文章・画像等のコンテンツ（`src/content/` 以下および表示文章）: © 灯里 (akari-iku), All rights reserved.
  出典を明記した引用は歓迎です
