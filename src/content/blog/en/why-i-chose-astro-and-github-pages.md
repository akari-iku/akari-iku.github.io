---
title: Why I Chose Astro + GitHub Pages (and Almost Picked Cloudflare)
description: >-
  The full thought process behind building my personal site with Astro + GitHub
  Pages: a Cloudflare Pages comparison, the Public Suffix List, and why an SEO
  zero-start doesn't scare me.
date: '2026-07-21'
tags:
  - astro
  - webdev
  - seo
  - github
lang: en
pair: personal-site-tech-selection
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2026-07-21-why-i-chose-astro-and-github-pages.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

I recently launched a personal site, and I want to tell you why I built it the way I did. Here is the awkward confession up front: no marketing manager on earth would have signed off on this stack. It was chosen by a committee of one, in a meeting room with no other attendees, guided by feelings I would never dare voice in an actual selection meeting. And it has been an absolute joy.

This article is the story of deciding **what to build it with**. Not how I built it (Content Collections, the article import pipeline, all that) because honestly, the selection alone turned into a full article. So this is the "choosing" chapter.

The stack, for those who like the answer first: **Astro + TypeScript + GitHub Pages**. Fully static, bilingual (Japanese and English), zero running cost.

## What I actually wanted to build

Here are the requirements, lined up:

- **A blog-first site** (porting over 40-odd articles, plus new ones going forward)
- **Bilingual, Japanese and English** (I already write and run articles in both. This matters a lot later)
- **Article assets managed in git** (plain text + history + always in a state I can migrate anywhere)
- **Fully static** (no server management, zero running cost)
- **SEO / AEO tackled head-on** (this is my personal theme for the project)

If that last one made you tilt your head, let me tell you a little about myself.

## Because it's a hobby, I can go all-in on SEO

I'm a former SEO person. "Former" isn't quite right, actually. **SEO was the primordial soup of my career.** About ten years ago, my very first job title was "SEO Specialist and Web Director." Me, fussing over an image's alt attribute because I wanted it to rank, versus a boss who felt "eh, whatever's fine." The two of us bickering over a single image: that era is where I began.

Things branched off in various directions after that, and I'm now on what I'd call my sixth chapter. The contents of "various directions" would take a while, so I'll leave those to my [profile](https://akari-iku.github.io/about/).

But it's been quite a while since I left that main battlefield. I keep my knowledge current, yet **the chance to actually roll up my sleeves and stack every technique** just doesn't come around in day-to-day work anymore. Probably not, anyway.

And if you've ever done SEO professionally, you'll know exactly what I mean when I say SEO measures **get killed in meetings.**

- "Structured data? How many pageviews does that add?"
- "hreflang? Nobody's reading the English version anyway, right?"
- "Auto-generating OGP images? Can't we just do it by hand?"

Each of those is a perfectly reasonable challenge, but every technique gets whittled down by the cost of justifying its ROI. What survives in the end is the title tag, the meta description, and maybe a sprinkle of something else.

But on a hobby site, **there are no meetings to begin with.**

The full JSON-LD spread (BlogPosting / BreadcrumbList / Person / WebSite), reciprocal hreflang across my Japanese-English article pairs, build-time OGP image generation, a robots.txt that explicitly welcomes AI crawlers, semantic HTML heading design. The whole course menu that gets you a "do we really need to go that far?" at work: I can serve all of it.

So my personal site is, to me, **an SEO/AEO testing ground.** There's a nice paradox in there: "building a site with SEO genuinely front of mind is, honestly, something you can only do as a hobby."

And a testing ground includes measurement. I register Search Console and drop in the GA4 tag with my own hands, so I **own the data myself.** On a borrowed platform, your measurement stops wherever the service decides to show you. Dev.to's built-in analytics are on the better end of the spectrum (I could see traffic coming in from claude.ai and perplexity.ai, which was genuinely fun). note, on the other hand, shows you roughly view counts and likes, with almost no visibility into referrers. Even when I ran experiments with long technical articles that named specific APIs and models, **coarse instruments give you coarse-resolution results.** For someone who wants to run tests, not being able to choose your instruments is quite painful.

Zenn is peculiar in this regard. Its built-in stats are just view counts, but **you can connect your own GA4.** It's a rare case of being able to bring your own instruments onto borrowed land, and that's exactly how I run my Zenn traffic analysis today. With my own site plus GA4, I'm free to design things like a custom channel group that pulls out AI-referred traffic as its own independent channel.

The experiment I most want to run, personally, is **measuring Gemini.** I should be able to capture the standalone referrer for gemini.google.com. But traffic coming via Google Search's AI Mode / AI Overviews gets mixed in with google.com and (I believe) can't be distinguished. How far this "Gemini inside Google" can be teased apart is something I can only verify with my own data, on my own site.

So the single most important requirement in this whole selection was: **being able to freely build a structure that's easy for search engines and AI to read.**

## Why Astro

Before that, let me nail down one premise.

This site is fully static not out of endurance or compromise, but because **there was not a single reason it needed to be dynamic.** No comment section, tag indexes are enough for search, no three.js razzle-dazzle required.

(The no-comments call comes from lived experience, by the way. The moment an article of mine popped off a little on Dev.to, the AI bots and repo-promo accounts came charging in, and I ended up having to consult the moderators each time. There's a strange sense of "ah, so I've reached the level where that happens," but the point stands: open an inbox and you inherit an obligation to manage it. Reactions I can receive perfectly well through the reposted articles on the platform side.)

To be clear, it's not that the site has no motion. Theme switching, a full-screen menu, hover effects: my site moves plenty. It's just that **that level of motion is entirely covered by CSS and plain JS.** There simply wasn't any motion in a blog that required shipping a framework runtime to produce.

A blog is a place for reading words, and the more you pile on, the further you drift from the actual text. If the requirements are static, static is the natural shape. Or put more bluntly: **you don't need what you don't need.** That's all. And in the age of AI, for both reader and author, the less cognitive load the better, wouldn't you say?

Once that premise is set, the candidates narrow fast. In the order I ruled them out.

### Next.js: overkill for a blog

The first name everyone reaches for. But the requirement here is "a static blog." App Router, SSR, ISR, all that powerful machinery goes unused. What's left is the complexity and client runtime for features I'll never touch.

High-powered frameworks have this quality where **the features you don't use still turn into maintenance cost.** Specifically, the cost of judging "is this change relevant to us?" on every single update.

### Hugo / 11ty: fast, but growing in the wrong direction

The old guard of static site generators. Blazing build times, and totally fine if all you're doing is parking a blog somewhere.

The reason I passed was the direction of extensibility. My preference is to write the article import pipeline and OGP generation **in TypeScript, protected by types** (I want it continuous with my everyday development). Against that, Hugo means Go templates, and 11ty sits somewhere in between. Nothing wrong with either. Just not the direction that fits my hands.

### WordPress: my old home from chapter one

In the earliest days of my career, my job was building sites in WordPress. So there's real nostalgia there. But it falls out the moment "operations" (a server, a database, security updates) attaches itself to a requirement that's perfectly happy being static. I'm not paying dynamic upkeep for something that can be static.

And on top of that, security. WordPress reigns over global CMS market share, which, from an attacker's point of view, also makes it **the single most cost-effective target.** Brute-forcing wp-login, plugin vulnerabilities, themes that stopped getting updates. Bots don't discriminate about who they crawl, so **merely owning it generates a duty to defend it.** As much as my old home once looked after me, I couldn't find a reason to shoulder that defensive burden for a personal blog today.

### Astro: a philosophy that lined up with mine

Which brings us to Astro. Three deciding factors.

1. **Content-first design.** Content Collections let me manage articles as types backed by a Zod schema. Frontmatter type errors surface before the build. For the blog use case, the philosophy points straight at what I need.
2. **Zero JS by default.** The output is plain HTML. Only the parts that need interaction ship JS, as "islands" (the islands architecture). Static-site performance is guaranteed out of the box, which ties directly to the SEO requirement.
3. **I'd never touched it.** Being allowed to count this as a reason is exactly what a hobby is for.

That third one looks like a joke, but I mean it.

Touching a new framework is, in itself, an asset. Case in point: because I'd been playing with Astro, when TypeScript 7 hit GA I could immediately do the "verify it in a real project and write an article about it" thing. **The more tools you've actually touched, the more current events you can react to.**

It also happened to be a moment where I wanted to poke around architecture. The islands architecture: I'd heard about it, but what's it actually like in practice? Frameworks are tools, but architecture is a way of thinking, so once you've learned it by hand you can carry it back to any other job. A **casual "let's give the islands architecture a go" challenge** is a perfectly respectable selection reason on its own. (How that actually turned out, incidentally, has a rather amusing punchline, so I'll save it for its own article.)

The vibe of an ecosystem (what's active, what's waiting on 7.1, that sort of thing) doesn't reach you from reading the docs. It only reaches you from the place where your hands are actually moving.

## GitHub Pages vs Cloudflare Pages

This, honestly, is what I agonised over more than the framework.

### Should I even run my own server?

Let's start with the biggest fork. Renting a VPS and running everything myself is, technically, an option. Maximum freedom.

But recall the state of the modern web's neighbourhood. The vulnerability scans that begin the instant you go public, the carpet-bombing bots, the CVE notifications for your dependencies. Am I really going to shoulder a life of patching and log-monitoring for the sake of a single static blog?

**"Simply not having an attack surface" is, in itself, a perfectly respectable security strategy.** If there's nothing to defend in the first place, no defensive work arises.

If the site grows and eventually needs something dynamic, I can take that on then. So rather than a retreat, I left myself "room to enter later" and, for now, fell on the side of not having a server.

Just to be careful: going fully static doesn't drop the attack surface to zero. What remains is the dependency supply chain and the build pipeline. Those don't vanish just because you chose "not to own a server," so they need to be locked down separately. (That topic is worth a whole article of its own, so, someday.)

### The candidates

- **GitHub Pages:** free, deploys via Actions, unified with git
- **Cloudflare Pages:** generous free tier, fast CDN, works with private repos, flexible header control and redirects
- **Vercel / Netlify:** best-in-class DX. But the free tier comes with personal/non-commercial conditions, and there's a gradient in the terms

I ruled out Vercel / Netlify early. I didn't want to worry about the gradient in the terms on a hobby site, and the DX advantages don't really shine on a static site anyway. So as of 2026, I think **a personal static site is effectively a two-horse race: GitHub Pages or Cloudflare Pages.**

I'll be honest: **if you're setting up a personal site to run gently these days, Cloudflare Pages is a very strong pick.** You can deploy while keeping the repo private, and you get control via `_headers` and `_redirects`. Compared with GitHub Pages' constraints ("public repo required" for the free tier, and "client-side redirects only"), Cloudflare wins on features across the board, more or less.

### Why GitHub Pages anyway

1. **Because GitHub is where I live.** My code and my profile are on GitHub, so the site's repo becomes a piece of my portfolio itself (I can pin it on my profile). Full confession: for a "place I live," my contribution graph was pretty sparse (a lot of my work stays local in git). But publishing the site doubled as tidying up a GitHub profile I'd left to gather dust, so this is **a selection that comes with a declaration to start actually living here.**
2. **I didn't want to add moving parts.** An account, a dashboard, another place to check for outages. The fewer things to manage, the longer it lasts. A hobby's survival rate is decided by how little friction it carries.
3. **A static site doesn't need the high-end features.** Header control, edge functions: none of them have a role on a fully static site. Freedom you don't use is just complexity.
4. **It probably won't blow up.** The history of running a personal site is also a history of being jerked around by blog services shutting down and changing their specs. A timeline where GitHub itself vanishes is a timeline where the world's code assets go down with it, so as a longevity worry it belongs at the very bottom of the list.

So on a feature comparison, Cloudflare wins. On a **friction comparison, GitHub Pages wins.** I took the latter. Slow and steady is my objective function.

For what it's worth, there are plenty of Cloudflare people around me too. They were already using Workers, or building around a custom domain from the start. **If Cloudflare is where you live, Cloudflare is the right answer.** Which is to say: this two-way choice is best decided not by a feature table but by "which of these is your home turf." That's the minimum-friction answer.

And here's where I cash in one of the requirement's setups. As someone already writing and running articles in two languages, there's enormous value in **having all my article assets unified as plain text + git.** Managing, updating, and migrating two languages' worth of articles and their pair relationships all happens inside one repository.

This "it's in my own hands" value is something note taught me the hard way. Between what's published and the mountain of drafts I haven't yet set adrift on the internet, I've got four digits' worth of writing piled up over there. And around the point the count reached that size, the accuracy of the in-account search noticeably dropped. The search leans toward exact matching, so get a single particle wrong and it won't surface. I'm the type who remembers what I wrote, so I search by typing a passage in verbatim, and even then it sometimes just won't come up (occasionally it won't appear even when it should, somehow, be an exact match).

Incidentally, this "matches but won't show up" isn't me misremembering. There's a [record from someone who actually chased down the cause](https://note.com/thracia776/n/n28d32520c712). A user running 1,348 articles found pieces that wouldn't surface even on an exact match, reported it to the platform, and it was ultimately fixed as a "search display bug." And their hypothesis, remarkably, was that "a misfire in the AI auto-translation feature's filter might be involved." So the aftershocks of a translation feature reach even here.

**Being unable to dig up your own writing yourself.**

A platform's search is borrowed, so however inconvenient it gets, you can't fix it yourself. With plain text + git, it's a single grep.

The same applies to the search on the outside. Even if an article of mine failed to get indexed by Google, on my own site I can check the sitemap, look at the indexing status in Search Console, and go from URL inspection all the way to re-requesting, **all with my own hands.** That's in stark contrast to a platform, where "report it to the operators and pray" is just about the only move available. Articles going missing from search can happen. The difference between borrowed and owned land is whether, when it happens, you can act yourself.

And being under git management also means hosting lock-in is effectively zero. If I want to move to Cloudflare, I just reconnect the repo. "Choosing GitHub Pages" is actually **choosing while staying in a state where I can switch away at any time.** I chose it on friction, yet I've kept my escape route open. A slightly sneaky setup, having it both ways.

This escape route, as insurance, I take fairly seriously. I wrote earlier that "GitHub won't blow up," but that's about the service. **An account getting suspended is entirely plausible.** I recently watched an acquaintance get their account banned over something adjacent to security research. Whatever the circumstances, a single operator judgement can freeze an account. And then it doesn't come back. AI-driven moderation and enforcement have grown, for better or worse. Platform-dependency risk isn't something GitHub is exempt from either. But git is distributed, so a complete copy of the repo always lives locally too. **The land may be borrowed, but the luggage is always in my hands.** Even if my account froze tomorrow, not a single byte of my article assets would be lost.

## The github.io subdomain and the SEO zero-start

Here's something I want to address as someone raised in the SEO fields: the `github.io` subdomain.

You might think, "I can ride on GitHub's domain authority." You cannot. Because `github.io` is **registered in the Public Suffix List (PSL).**

The PSL is a list of boundaries that says "from here on, treat each of these as a separately registered domain." Since `github.io` is on it, `username.github.io` is effectively an independent domain unto itself. Cookies are isolated, and your standing in the eyes of search engines is **a complete start from zero.**

Incidentally, this isn't specific to GitHub Pages. `pages.dev` (Cloudflare Pages), `netlify.app`, `vercel.app`: the default subdomains of every major host are registered in the PSL. Given the cookie-isolation security requirement, it would be stranger if they weren't. Which means **whichever you choose, the default subdomain is a zero-start.**

From an SEO standpoint, a github.io subdomain and a freshly registered custom domain are on roughly the same footing. "Then isn't buying a custom domain for a bit over 1,000 yen a year better?" is a fair point, and in fact I've built the site so I can move it to a custom domain later (holding off for now. The reason is simple: if it's a zero-start either way, there's no reason to rush).

But there's a reason I'm not all that afraid of the zero-start. Across note, Zenn, and Dev.to (all borrowed domains), **I've already finished verifying every angle of attack other than domain authority.** Title design tuned to search intent, structures that get quoted by AI, a writing style where 90% of traffic ends up organic. The playbook is in my hands.

(The write-up I did as the capstone of that verification is [my AEO findings as of January 2026](https://note.com/akari_iku/n/na35d6107b77c). I'd been running character-count experiments long before that, and the article itself is the final specimen for "what happens if I deliberately pack character count and information density to the limit." It happened to coincide with note officially announcing "you can now write more characters," and the measured answer was: "the appropriate character-count line lies elsewhere. Even if the ceiling rises, there's no point using all of it." Curiously, the biggest catch I left behind on note, my old testing ground, is that very verification article.)

The only remaining variable is domain trust, and that only grows with time and article count. Article count alone won't do it, and the number of likes is another variable, mind you. So I've made peace with this being a phase of growing things slowly, without rushing.

How I'm actually faring in this zero-start fight is something I might write about somewhere once the measured data has accumulated.

## Hobby tech selection optimises for something else entirely

Tech selection at work is decided by risk, maintainability, the team's skill set, and exit-ability. "Why not, I want to touch something new" is the weakest possible opinion in a team selection meeting. And it *should* rightly be the weakest.

But a hobby is different.

- **Learning:** the value of touching something you've never touched. What you played with as a hobby quietly gets added to your professional toolkit.
- **Constraints:** zero running cost, minimal management surface, low enough friction to keep going.
- **Fun:** does it feel good to build?

You're allowed to optimise on these three. Or rather, **drop "fun" and a hobby project dies**, so you mustn't drop it.

Bring the work criteria into a hobby and you end up with "let's build it on a proven, boring stack," which drains both learning and fun. Bring the hobby criteria into work and you'll cause an accident. The criteria differ not because one of them is wrong, but because **they're optimising for different things.**

## Closing thoughts

So there it is: Astro + GitHub Pages. Fully static, zero running cost, everything you can do in this era piled on. I chose the framework on "I'd never touched it" and the hosting on "it carries the least friction."

Say that in a selection meeting at work and I'm fairly sure you'd get shot down on the spot. But this is a hobby, so there are no meetings. Bliss.

The articles are in git. I can move house any time. I'm here now, while staying in a state where I can switch away whenever I like. This is the phase of gently raising a zero-start domain with a playbook already validated on borrowed land.

The thing I picked on "why not, might as well" turns out to be the thing I can keep tinkering with the longest. That, I think, is just what a hobby is.

The implementation chapter (Content Collections design, the article import pipeline, build-time OGP generation) and the zero-start SEO measured-data chapter are both coming in separate articles.
