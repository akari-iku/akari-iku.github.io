---
title: >-
  AI Auto-Translation, On by Default. What a Japanese Dev Platform Learnt in
  Eight Hours
description: >-
  In January 2026, Japan's dev platform Zenn shipped AI auto-translation with
  default ON. Eight hours later it was OFF. A field report on product
  development, consent, and why translation is harder than it looks.
date: '2026-01-12'
tags:
  - zenn
  - ai
  - product
  - translation
lang: en
pair: zenn-translation-feature
source: dev
accent: '#00B06B'
---

<!-- generated from articles/dev/2026-01-12-zenn-auto-translation.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

Allow me to point out the small piece of theatre you are currently participating in: you are reading, in English, an account of Japanese developers arguing about whether their articles should be automatically rendered into English. The English in front of you was assembled by hand, by me, precisely because I opted out of the machine doing it. If irony were a renewable resource, this article could power a small village. What follows is a field report from that debate: a feature shipped on a Friday afternoon, reversed before midnight, and the surprisingly deep questions about product development, consent, and language that it left behind. By the end, I suspect you'll recognise your own platform of choice somewhere in this story.

## First, Some Context, What Is Zenn?

For readers outside Japan: **Zenn** is one of Japan's major developer blogging platforms. Think dev.to, but Japanese-speaking, with a famously engineering-literate user base and a culture of long, careful technical write-ups. It started as a personal project by a developer known as catnose and was later acquired by Classmethod, a Japanese tech company. Companies host their tech blogs there; individuals build careers on it. I publish my Japanese articles there.

In other words: when Zenn sneezes, Japanese tech Twitter catches a cold.

Keep that in mind. The scale of the reaction only makes sense if you know the platform matters.

## What Happened

Let's do the timeline.

**Friday, 9 January 2026, around 4pm.** Zenn announces a new feature: AI auto-translation. Append `?locale=en` to an article URL and you get an English version.


<blockquote class="tweet-card">
<p class="tweet-card-text">📢 お知らせ 📢<br /><br />Zennは、記事の英語版生成の実験的な提供を開始します！<br /><br />記事が多言語に翻訳、展開されることで、著者のコンテンツが海外の読者にもアプローチできるようになることを期待しています。</p>
<footer class="tweet-card-meta"><span>Zenn公式 @zenn_dev</span><a href="https://x.com/zenn_dev/status/2009523822085722497" target="_blank" rel="noopener">2026-01-09 · x.com →</a></footer>
</blockquote>


The announcement, if I may file one small complaint, didn't make clear whether this was "live right now" or "coming soon". I read it as a coming-soon PR teaser.

It was live right now.

I checked my settings.

Me: "Default ON?!"

Off it goes, before I forget. ( ΦωΦ)σ

(That's a Japanese kaomoji. I used it deliberately in the original article, partly as a small translation landmine: I was genuinely curious what the machine would do with it. You'll see why this matters later.)

**Same day, around midnight.** A second announcement:


<blockquote class="tweet-card">
<p class="tweet-card-text">記事の英語版生成のデフォルト設定を「有効」としていたことについて、多くのご意見をいただきました。ユーザーの皆様にご不安とご心配をおかけしたことを深くお詫び申し上げます。<br /><br />ご指摘を受け、デフォルト設定および全ユーザーの設定を「無効」に変更いたしました（オプトイン方式）。</p>
<footer class="tweet-card-meta"><span>Zenn公式 @zenn_dev</span><a href="https://x.com/zenn_dev/status/2009649601671016678" target="_blank" rel="noopener">2026-01-09 · x.com →</a></footer>
</blockquote>


**Default changed to OFF.**

From release to reversal, roughly eight hours. The pushback was evidently louder than expected. And credit where due: the engineers shipped that reversal late on a Friday night, the sacred boundary of the Japanese three-day weekend. I sincerely hope they got to enjoy it afterwards.

**The feature in summary:**

- For articles whose authors permit translation, `?locale=en` shows an English version
- Articles without permission return a 404 for that parameter
- Translation is AI-generated
- Default ON, then reversed to OFF within the day

**Observed behaviour**, from my own poking around:

- Translated articles: English version displays
- Untranslated articles: 404, and here's the fun part, **you can't tell whether it's "author said no" or "still in the processing queue"**. Official word was that translations would roll out gradually
- Markdown text: translated
- Comments inside code blocks: translated
- Text inside images: not translated
- Locale parameters in URLs (`hl=ja-jp` and friends): not converted

Zenn's own sample article had English body text, Japanese screenshots, and links still pointing at Japanese-locale Google Cloud docs. Experimental stage, granted, but the overall impression sat somewhere around "half-finished".

## Why Translation Is Technically Hard

Before the pitchforks, some sympathy. This problem is genuinely difficult.

### Text Inside Images

Technical articles lean on diagrams and screenshots. Fully automating their translation means: OCR the text out, translate it, regenerate the image with identical layout, adjust fonts and positioning. Expensive, slow, and hard to quality-assure. (OCR is having a moment, mind you, and the demos get more exciting every month. But "regenerating" someone's image also wanders into a legal thicket of its own, and the rules differ between Japan and everywhere else.)

### Cognitive Load on the Reader

Language-switching taxes the reader more than we admit. You're reading English body text, an image appears in Japanese, and your brain stalls: "wait, what does that say?" Technical articles are mostly read by people who are *stuck* and in a hurry. Adding friction there is precisely where you don't want it.

Or at least, I don't want it. My brain does a full context switch with a measurable dumb-moment in the middle. Possibly a me-problem.

### Linguistic Distance

English and German are cousins; an English speaker can squint at *gehen* and guess. Japanese and English are not cousins. They're not even distant acquaintances.

More fundamentally, linguists argue the two languages **see the world from different camera positions**. Takehiro Kanaya (formerly head of the Japanese programme at the University of Montreal's East Asian studies institute) describes Japanese as the **insect's-eye view** and English as the **god's-eye view**:

- **Insect's eye (Japanese)**: immersed inside the scene, describing the world from within. The famous opening of Kawabata's *Snow Country*, 「国境の長いトンネルを抜けると雪国であった」, has no subject at all. You are simply *in* the train, emerging into snow
- **God's eye (English)**: hovering above, describing objectively. "The train came out of the long tunnel into the snow country." A camera in the sky, watching the train

If you're a gamer: FPS versus TPS. Same scene, fundamentally different camera.

This is why Japanese-particular expressions ("〜してみた", "〜していく", the whole gentle-narration register) resist translation: they're wired to the insect's eye. It's also why I regularly clutch my head writing English articles despite Japanese being my native language. Five drafts in, I no longer understand either language. What even is this island tongue. Truly a MIYABI language. Truly.

**References (both in Japanese):**

- Takehiro Kanaya, *Nihongo to Seiougo* (Japanese and Western Languages), Kodansha Academic Bunko, 2019. ISBN 978-4065160695
- Takehiro Kanaya, *Eigo nimo Shugo wa Nakatta* (English Had No Subject Either), Kodansha, 2004. ISBN 978-4062582889

### A Word from Leon, on What Great Localisation Looks Like

For the gamers, one concrete example of the craft at its best.

In Resident Evil (*Biohazard*, back home), Leon has the English line "Story of my life." The official Japanese rendering is 「泣けるぜ」(*nakeru ze*), something like "brings a tear to my eye", delivered with maximum tough-guy nonchalance.

Open any dictionary: there is no path from one to the other. A literal translation would be a subtitle-shaped car crash. What the localiser translated wasn't the words but the *posture*: wry, resigned, still cool. Japanese players celebrate that line to this day, precisely because the leap took taste.

That taste is the part I don't believe AI has cracked, however fluent the output has become. Machine translation walks the dictionary path very quickly. Localisation, the kind worth putting your name on, regularly requires leaving the dictionary entirely.

And plenty of Japanese vocabulary doesn't even offer a dictionary path to leave: words that simply fail to exist as standalone equivalents, where a literal translation isn't clumsy but impossible. (You've already met *moyamoya*.)

### URL Localisation

Links keeping their `?hl=ja-jp` parameters is a small thing that quietly grates. Redirects usually save you, browsers translate, and yet: you came for the English version, and the plumbing still says otherwise. A faint, persistent moyamoya (that's Japanese for a fog of mild unresolved discomfort, and yes, I note the irony of having to gloss it).

## A Debate Only an Engineer Community Could Have

Here's the part I found genuinely interesting.

**This much scrutiny happened precisely because Zenn's users are engineers.**

Within hours, the community had mapped the whole surface: why image text can't be translated, why locale parameters leak through, whether code-comment translation is even desirable, and, crucially, the opt-in versus opt-out framing arrived almost immediately. Specific, testable, constructive complaints. As a community member I found the whole thing rather heartwarming. People cared, in detail.

### What If This Were an Ordinary Platform?

Picture the same launch on a general-audience platform. My honest guess: **quiet acceptance drowns everything**. "Free translation? Lucky me." "Not bothered enough to opt out." "What's an opt-out?" Default ON persists, the sharp edges never surface, and problems calcify:

```text
[Vicious loop]
Default ON
  -> Users: "eh, whatever" (no feedback)
  -> Operator: "seems fine"
  -> Nothing improves
  -> Problems surface much later, at scale
```

Zenn got the other loop:

```text
[Virtuous loop]
Default ON
  -> Users: "this specific thing is wrong" (concrete feedback)
  -> Operator: "...noted. Reversing."
  -> Default OFF within the day
  -> Room to improve preserved
```

A community that gets properly, articulately angry is a *healthy* community. Cherish your angriest literate users.

### But Don't Worship the Feedback Either

Counterweight time. The classic cautionary tale is **McDonald's and the salad**.

Surveys kept saying customers wanted healthy options. McDonald's shipped the salad. Nobody bought it. Meanwhile the decidedly unhealthy Quarter Pounder items sold explosively.

People lie in surveys. Not maliciously; they report the person they'd like to be. "I want healthy food" is the model-student answer. The actual order, at the actual counter of an actual McDonald's, is junk. (If salad were the true desire, there are entire restaurants for that. You *came to McDonald's*.)

So: **watch what users do, not what they say**. If the data shows English-version traffic growing, overseas engagement rising, and few people opting out, that's the truth regardless of the loud voices. If nobody reads the translations and everyone opts out, that's the truth too.

The mature position is boringly balanced:

```text
User voices (qualitative)
  + actual behaviour (quantitative)
  = decisions worth making
```

Voices locate the problem. Data confirms whether it's real. Zenn's reversal used the first; their next move should use the second.

## The Three Camps

### "This Is Great!"

"Automatic English versions? More reach, zero effort." Entirely valid, especially for terminology-heavy technical writing where the author has no particular attachment to prose style.

### "Hold On a Moment"

"I can't control the quality." "It ships under my name; I want responsibility for it." "My essay pieces will not survive this."

Also entirely valid. For idea pieces, management essays, anything poem-adjacent (Zenn has a whole "idea" category for these), the *texture* of the writing is the content. Japanese onomatopoeia alone is a translation minefield: how exactly does one auto-translate 「ぬるっとした挙動」 (roughly, "behaviour that moves like something smooth and slightly viscous")? My own register, polite-form Japanese with heavy colloquial seasoning, is exactly the sort of input that makes machine translation hallucinate cheerfully.

That kaomoji earlier? Same category. I genuinely wanted to see the machine try. But not under my byline.

### "Trust Has Been Damaged"

Some authors left the platform over this. "Default ON without prior explanation is unacceptable." "It's my content and it was changed without asking." For them it was never a features question; it was a trust question.

## Why It Blew Up

### Authorship and Control

Prose style is identity. A translation is, in a real sense, "as if someone else wrote it", and it still carries your name. For technical reference material that's tolerable. For essays, the style *is* the substance.

### "Wanting to Be Read" vs "Wanting to Be Read a Certain Way"

The whole reason to publish on a platform rather than a personal blog is reach. But reach and fidelity are different desires, and they don't always travel together. Wanting many readers is the platform's promise; wanting to be understood *as intended* is the author's prerogative. Usually compatible. Occasionally at war.

### Opt-in vs Opt-out

"Just turn it off if you don't like it." I did. Takes a minute.

But the issue was never the toggle. **It was the default.** Default ON means: unless you actively check your settings, your work is being transformed without your knowledge. Default OFF means: the feature is announced, the curious try it, adoption grows deliberately, and nobody discovers anything "had been happening" to their work.

To be fair to the operator: default ON gathers data enormously faster, and lots of AI-era services (especially Western ones, I note from this side of the ocean) ship exactly this way, sometimes without any toggle at all. That pattern is its own ongoing argument. Zenn at least had the toggle, and then had the humility to flip the default within hours.

### Platform Dependence

Publishing on a platform is borrowing someone's land. The terms of service always meant the ground could shift. The honest framing is a trade:

```text
[What Zenn gives]
Reach, community, monetisation plumbing

[What you accept in return]
Policy changes, feature surprises, partial loss of control
```

Where that trade stops being acceptable differs per person. I wobbled, honestly. I'm here rent-free, the off switch exists, and I caught the news in time. But companies host official tech blogs on this platform; the once-a-year Advent Calendar crowd was never going to catch a same-day settings change. The release process took a gamble it didn't need to take.

### The Legal Wrinkle, "Public" Does Not Mean "Do Whatever"

One more layer, because it's important and widely misunderstood.

"You published it, so anything goes" is legally wrong, at least under Japanese copyright law, which governs both the platform and most of its authors. **The right of public transmission and the rights of translation and adaptation are separate rights.** Consenting to publication is not consenting to translation. Zenn's terms cover hosting and distribution; they contain no explicit licence for translation or adaptation.

A fellow author (@philomagi) wrote an excellent three-layer analysis of this, spanning copyright law, terms of service, and Creative Commons: [Zennの自動翻訳から考える『公開』の概念](https://philomagi.dev/articles/2026-01-11_zenn%E3%81%AE%E8%87%AA%E5%8B%95%E7%BF%BB%E8%A8%B3%E3%81%8B%E3%82%89%E8%80%83%E3%81%88%E3%82%8B%E5%85%AC%E9%96%8B%E3%81%AE%E6%A6%82%E5%BF%B5/) (in Japanese, fittingly).

Reversing to default OFF largely resolved the legal exposure. That the exposure existed at all on launch day is the sort of thing one hopes generated some internal learning. I'll leave it at that; I don't run Zenn's compliance department, thankfully.

## In Defence of Experimentation

Now let me argue the other side, because it deserves arguing.

"You can't know without shipping" is simply true. Everyone could predict *that* some authors would love it and some would hate it. Nobody could predict the *ratios*: opt-out rates, English-referral traffic, engagement shifts, mistranslation incidents. That data does not exist until the feature does.

And Zenn is a company product now, not a hobby project. It moved from personal stewardship to corporate operation years ago, and companies need growth, which needs experiments, which need data. That's not cynicism; that's how the platform stays lit.

(The handover story itself is a lovely read on stewardship, if your Japanese is up to it: [catnose's notes on the transfer](https://catnose.me/notes/zenn-with-classmethod).)

There's also a failure mode on the critics' side worth naming:

1. **Constructive criticism**: problem + alternative + how
2. **Non-constructive criticism**: problem, full stop
3. **Emotional rejection**: "I just hate it"

Only the first moves anything forward. The Zenn debate, to the community's credit, was heavy on type 1. But every platform team knows the exhaustion of being pelted with types 2 and 3. Operators are people. Morale is a resource.

## The Real Dilemma of AI Automation

Zoom out and this is not a Zenn story at all. It's the central trade of the AI era:

```text
Fully manual translation:
  full authorial control, absurd time cost

Fully automatic translation:
  zero time cost, zero control

The ideal (semi-automatic):
  AI drafts, author reviews and edits
  ...which reintroduces the time cost you were escaping
```

And "what can be delegated to AI" has no universal answer. Technical terminology? Half the room says "fine, jargon translates cleanly", the other half says "the subtle differences are exactly where it hurts". Nuance and voice? Almost nobody delegates that willingly. The boundary sits differently in every author, **which is precisely why choosing a default is so hard**. A default is a single answer imposed on a population that doesn't share one.

Translation is not word substitution. It carries culture, context, intent. Full automation without human review isn't there yet; adding human review dilutes the point of automation. This dilemma applies to every AI content workflow, not just translation. Get comfortable with it; it's not leaving.

## Constructive Proposals

Complaining is easy, so here's the fun part: what would *better* look like? (Dreaming up feature specs for other people's products is a delightful hobby. Implementation not guaranteed.)

**Per-article translation settings.** Account-wide ON/OFF is the wrong granularity. A tech tutorial wants an English version; a poem-adjacent essay wants to stay Japanese; a diary post is for the home crowd:

```text
[ ] Enable translation for this article

Settings defaults by article type:
  tech articles: translation ON
  idea articles: translation OFF
```

**Draft-mode workflow.** The single biggest issue: authors can't edit the output.

```text
1. Write the Japanese version
2. Click "Generate English version"
3. AI translation appears as a draft
4. Author reviews and edits
5. Publish when satisfied
```

Efficiency of AI, control of the author, quality assured. (Though one must ask honestly: authors capable of reviewing English output could just translate elsewhere themselves. And spotting the *wrongness* in a fluent-looking translation is its own advanced skill.)

**A language-switching editor.** `[日本語] [English]` tabs on the edit screen, so the English version can carry extra cultural context where needed. I want this one personally. "Obvious to Japanese readers" and "obvious to everyone" are very different sets.

**Per-language images.** `diagram_ja.png` / `diagram_en.png`. Costly to implement, transformative for the reading experience.

**An "AI translated" banner.**

```text
This article was automatically translated from Japanese using AI.
[View original] [Report translation issue]
```

Expectations calibrated, author responsibility scoped, mistranslations forgiven more readily. Cheap and honest.

**Better 404s.** "Translation not enabled by the author" versus "translation still being generated" are completely different situations currently sharing one unhelpful status code.

**Feedback and community translation.** A "this translation looks off" report button; a pull-request-style flow where volunteers propose improvements and authors approve. People who can catch subtle translation breakage *and* read the tech are genuinely rare treasures; a platform that surfaces them is doing something right.

The counterweight to all of the above: every added option is added complexity. Feature-creep the settings screen and you've traded one usability problem for another. Somewhere in there is a balance point, and finding it is, well, the job.

## Writing to Be Translated

While waiting for the platform, writers can meet the machine halfway.

**Put text in text.** Explanations that live inside images are invisible to translation. Keep images simple; carry the meaning in markdown.

**Simple sentence structures.** Deeply nested, comma-spliced, four-clause Japanese sentences shatter in translation. (My own long polite-colloquial style is, I confess, close to worst-case input. Hence the opt-out.)

**Go easy on slang and onomatopoeia**, or gloss them inline when you can't resist.

**Critical information belongs in text**, with images as supplements, so an untranslated image never removes anything essential.

Do I enjoy writing with all this in mind? Absolutely not. It's exhausting, and it sands off exactly the texture that makes writing fun. English business idiom is equally untranslatable in the other direction, so the discomfort is at least mutual. But if reach matters to you, these are the levers you actually hold.

## Lessons in Product Development

What the whole episode taught me, or re-taught me:

**You cannot satisfy everyone.** Every feature delights some authors and alienates others. The answer is rarely "pick a side"; it's "provide real choices".

**Process matters as much as the feature.** Prior notice, beta periods, feedback channels, staged rollouts. Zenn skipped the staging and paid for it in trust. But then:

**Speed of response builds trust back.** Announcement at 4pm, default reversed by midnight, on a Friday. Whatever went wrong in planning, the response was fast, humble, and user-respecting. That flexibility is why I concluded I'm happy to keep renting this particular plot of land. Some authors left anyway, and that's real feedback too; understanding *why* people leave is as much a part of product development as shipping.

**Experiments are legitimate, and stageable.** "We had to ship to learn" is true. Beta cohorts, gradual rollouts, and clear communication are how you learn without burning trust as fuel.

## Where I Landed

I turned it off. My reasons: I already write my English versions by hand (you're reading the evidence), I want nuance control, and I have my own SEO/AEO experiments running that machine translation would muddy.

But the deepest reason is not technical at all.

My analytics once showed a reader in Germany spending over seven minutes on one of my Japanese articles, machine-translating their way through it as they read. Friends from outside this island nation ping me with "this looks interesting!" about pieces written in a language they cannot read. When people extend that much effort toward my words, hand-crafting the English version myself is one of the few ways I have of extending respect back.

And this isn't really a technical-blog thing. It's an internet thing, and it flowed toward me first. Years ago, drifting through Twitch, I wandered into a French streamer's channel where the entire audience was me. He picked up his guitar and played "Take Me Home, Country Roads", an acoustic set for one. The sea between us did not matter in the slightest. I've been receiving small kindnesses like that through an internet connection my whole online life.

These days a growing share of everyone's visitors are AI crawlers, which only sharpens the feeling: the humans who still show up get my respect, deliberately, every time. It's a small stubbornness. I intend to keep it.

It isn't distrust of the machine. It's courtesy toward the humans.

So no, even on a technical blog, I don't want translation happening to my writing without me in the room. That was my policy before this feature shipped, and the feature only confirmed it.

That's my choice, not the correct choice.

Because the possibility is real. Technical knowledge doesn't care about borders. A world where Japanese engineers' articles are read everywhere, and where I can read overseas write-ups in my own language, is straightforwardly good. The technical gaps and the process stumbles are all fixable things.

So: ganbare, Zenn. Iterate in the open, listen without capitulating, and I'll keep sending constructive noise from my corner. (And if things go properly sideways again, I reserve the user's eternal right to grumble about moving out while not actually moving out.)

There is no correct answer here. Efficiency versus control, experimentation versus caution, global reach versus local texture: all of these are right, which is exactly why this is hard. Product development never finishes; it only keeps improving.

If this made you glance, slightly nervously, at the settings page of your own favourite platform, then the article has done its job.
