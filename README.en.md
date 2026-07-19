# akari.log

**https://akari-iku.github.io/**

[日本語](./README.md) | English

A personal site & bilingual (ja/en) tech blog in monochrome with one accent
colour per screen — white paper, black ink, and a single splash of colour is
the entire rule set.

## Structure

- `/` top / `/about` / `/career` skills / `/blog` posts (Japanese) / `/tags` index
- English mirror under `/en/`; paired articles cross-link with `hreflang`
- Fully static. No client-side framework runtime — theme toggle, fullscreen
  menu and lazy Mermaid rendering are plain JS

## How it works

- [Astro](https://astro.build/) + Tailwind CSS + TypeScript (strict)
- Articles are imported from a private writing repository by
  `scripts/import-articles.ts`, converting Zenn syntax and Dev.to Liquid Tags
  into standard Markdown + components
- OG images are generated at build time in the same design language as the
  article heroes
- Posts are cross-posted to [Zenn](https://zenn.dev/akari1106) /
  [Dev.to](https://dev.to/akari_iku) with canonical URLs pointing here
- Deployed to GitHub Pages via GitHub Actions

## License

- Code: [MIT](./LICENSE)
- Content — articles, copy and imagery (everything under `src/content/` and
  the rendered text): © Akari (akari-iku), all rights reserved.
  Quoting with attribution is welcome
