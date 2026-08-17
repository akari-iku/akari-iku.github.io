---
title: Developing with Multiple Models? Make Sure You Design the Handoff
description: >-
  Handing work from a main model to a sub isn't the same genre of writing as
  talking to a human. Six surfaces worth designing into the handoff, measured
  against a frontier-to-frontier experiment in February and a feeble local 30B
  doing the implementing in August.
date: '2026-08-09'
tags:
  - ai
  - llm
  - claudecode
  - agents
lang: en
pair: multi-model-handoff
source: dev
accent: '#E5007F'
---

<!-- generated from articles/dev/2026-08-09-multi-model-handoff.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

Back in February I spent an evening standing up Ubuntu under WSL and lining up tmux panes, purely so that Claude Code and ChatGPT could talk to each other. On a Windows machine. There is a point during that sort of civil engineering where you start wondering whether it would be quicker to move house and live in Linux permanently. What the two of them were actually doing was simple enough: one writes the spec, the other implements it, and the human sits there occasionally muttering "no, not like that." Six months later I opened the newly open-sourced Cloudflare OS and found the same conclusion sitting in the source as a product decision, which was either validating or mildly deflating, and I still can't decide which. This article is about the six things worth designing when you hand work from one model to another, and why getting them right is what makes the implementer swappable.

## Introduction

Around February 2026, I was messing about with a hand-rolled setup where Claude Code and ChatGPT talked to each other to get implementation done. One writes the spec, the other implements it and hands it back. The human watches and chimes in occasionally. In terms of the models of the day, Claude was moving from Opus 4.5 to 4.6, and ChatGPT was on GPT-5.2.

The logs are long gone. What I have is a memory at roughly the granularity of "that period when I was going back and forth in English in the Dev.to comments." You can assemble the same thing with plugins now, but back then it was all manual. And by manual I mean civil engineering: Ubuntu under WSL, tmux panes side by side, all so two of them could have a conversation. On a Windows machine, no less. I do remember thinking it would probably be faster to just go back to Linux.

To be clear, sub-agents and agent combinations weren't unusual at the time. Multi-agent frameworks had been piling up since 2023, and Claude Code has had a sub-agent mechanism since July 2025. The point of the February experiment was **pairing models from different vendors**, and that part was still a minority sport, even outside Japan. Now it's completely ordinary. Good times.

Fast forward six months to August 2026. I was poking at the newly open-sourced Cloudflare OS and, sure enough, there was a sub-agent mechanism in there. What I found interesting wasn't the mechanism itself, it was **how tightly the handoff had been constrained**. Sub-agents get exactly **two** tools: `describeBinding` and `executeCode` (`agent.ts:2833`). Reading and computing get handed over. Writing and connecting do not.

The conclusion I'd stumbled into by hand and the product's design were pointing in the same direction. It felt like checking my answers against the back of the book.

Anyway, here's that August investigation:


<a class="link-card" href="https://akari-iku.github.io/en/blog/cloudflare-os-local-llm-five-rounds/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/en/blog/cloudflare-os-local-llm-five-rounds.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">Running Cloudflare OS on a Local LLM, and Why One Tic-Tac-Toe Took Five Rounds | akari.log</span>
</span>
</a>


It's a struggle report about a local qwen3 taking five rounds to produce tic-tac-toe, but something only clicked after I'd finished writing it. February and August were **the same experiment run at different sensitivities**.

February was strong models on both ends. They paper over each other's gaps with sheer intelligence, so flaws in the handoff never surface.

August had a feeble local 30B doing the implementing. The exact same flaws surface immediately, and without mercy.

So this article covers the six surfaces worth designing for model-to-model handoff, drawn from those two experiments. Pin these down and the model doing the implementation becomes swappable.

## Human to Main Is a Conversation, Main to Sub Is a Spec

Let me plant a spine for this first. **Instructions from a human to the main model, and instructions from the main model to a sub, are different genres of writing.**

A note on terminology: "sub" here isn't limited to sub-agents inside the same system. A coding agent from a different vendor, a local model behind a CLI, anything that **receives a spec and implements it** gets lumped together as "sub" in this article. February's ChatGPT and August's qwen3 both sit in that seat.

Humans can throw things at the main model sloppily. You're right there, ready to say "no, not like that." It's communication that assumes round trips.

Main to sub is the opposite. The sub starts cold. No conversational context, no accumulated intent. And as we saw last time, environments where it can't come back and ask are perfectly normal. Which means **it has to land in one shot**. That's not the opening line of a conversation, it's a specification document.

Get this wrong and the main model starts imitating the human, lobbing things at the sub just as casually. It copies the handoff style that's been working fine in human-to-main. Worse, the longer the main model talks to a human, the more of that human's habits it absorbs. Sloppy requests, unspoken assumptions, "you know what I mean." The brains of the operation doesn't only pick up your good qualities.

So does handing spec-writing to the very best model solve it? Not quite. Asking something in the Fable class is completely reasonable, but **what the writing model considers optimal and what the receiving model actually needs are two different things**. The step of writing for the recipient doesn't disappear, however clever the writer is.

And specs come with their own bugs, courtesy of the author. In the last investigation, I told qwen3 that a `gadget` RPC stub was available, but forgot the single most important constraint: that the class name is fixed as `Gadget`. That burned an entire round. I'd already read the system prompt by then, so the constraint had become as obvious to me as air.

**You can't spot the things you already know.**

That wasted round wasn't a model failure. It was a bug in the spec.

## The Six Surfaces Worth Designing

Here's the main body, with August's measurements attached to each.

### 1. The format of the spec

Skeleton code beats prose. The measurement: four rounds of failure with explanations written out in Japanese, then a complete skeleton on round five, and it went straight through.

Code is the shared language between models, so interpretation doesn't drift when you cross model boundaries. A prose spec absorbs the author's assumptions and goes vague, whereas `export class Gadget extends DurableObject` reads the same to everybody.

### 2. The list of prohibitions

Stating the conventions isn't enough. You have to actively suppress the common sense the model brings with it.

In practice, "**don't use fetch, don't add CORS headers**" worked better than "use the `gadget` stub." Killing the high-prior wrong answer comes before teaching the right one. And the conventions were written out in full in the system prompt, yet little Qwen kept getting dragged back to her own failed approach (the fetch route) sitting there in the conversation history. "It's written down" genuinely isn't enough.

### 3. Acceptance criteria

Write them in a form the sub can check itself against. "It works" is not a criterion.

What happens without them: three green ticks lined up beside a completely blank board, followed by a confident declaration that everything is fully functional. That's a true story.

### 4. The shape of the return value

Specify a low-verification-cost format for reports, something like `file:line`. If it comes back as prose, verifying it costs you your own thinking, and the point of delegating starts to evaporate.

### 5. The verification surface

Don't trust self-reporting. Put verification somewhere external and model-independent: tests, the console, screenshots.

Self-reporting habits differ from model to model, so any workflow leaning on self-assessment breaks every time you swap the model out. An external verification surface doesn't break when you swap.

Make it leave logs. Make it write results up as a handout. For anyone whose day job is security or infrastructure, I suspect this reads as "well, obviously?" Judging on evidence rather than self-declaration is basic audit practice. All we're doing is carrying that basic across into model operations.

### 6. Escalation

Decide the distress signal up front. Something externally countable, like "hand back to the main model after N errors of the same kind."

The reason the criterion has to be external is to keep the sub from making the judgement. Working out "is this a failure?" and "is this the same failure as before?" is a call only a human or a higher model can make. Counting can live on the sub side. Judging is the job of whoever it gets handed back to.

As I wrote last time, Cloudflare OS's stop conditions have no concept of "failures are repeating," and the infinite CORS loop could only be halted by a human hitting the Stop button. If the harness has no mechanism for it, the handoff contract is the only place left to decide it.

So where do you actually write this down in Cloudflare OS? I went looking, and it turns out there's half a place for it.

Contracts you can express in a prompt (prohibitions, report formats, acceptance criteria) have an official injection point called **Instance Instructions**. It's a deployment-wide instruction block you set from the admin screen, concatenated into the system prompt. No code changes required.

Loop policy, on the other hand, has no slot at all. The stop conditions are literals hardcoded in `agent.ts`, exposed neither to configuration nor to hooks. If you genuinely want "stop after N errors of the same kind," it's Apache-2.0 and self-hosted, so you're patching the kernel directly. The prompt layer has a door; the side that can't be solved with prompts doesn't. You'd rather it were the other way round, wouldn't you.

None of this is a qwen problem, incidentally. The conditions of the seat are identical whichever model you plug in, so anyone running ChatGPT or Claude in that slot inherits the same thing.

## Failure Logs Are That Model's Instruction Manual

This is probably the part that pays off most in practice.

Left to her own devices, qwen3 wrote Deno imports and tried to solve a CSP violation with CORS. Those are habits you only need to observe once, and from then on you can head them off in the prohibitions list.

In other words, **the shape of the failures shows you that model's priors directly**. Bring in a new model, give it a small task, let it fail once and collect the habits. That works perfectly well as an operational routine. How something falls over in your environment feeds the spec far more directly than a benchmark score does.

And it isn't only the model's habits you collect. **What the environment actually enforces** comes out too: what CSP really blocks, how fixed a class name really is. Failure told me before the documentation did. Honestly, there was no way to know how far the enforcement went without trying it. Failure logs double as the manual for the environment.

The teacher makes mistakes as well, mind you. The sample code inside Cloudflare OS's own system prompt imports a class it defines itself from `cloudflare:workers` (the equivalent sample on the implementation side is correct). Noise in the document that teaches the conventions gets absorbed most faithfully by the weakest models.

## The Test for Whether You Can Delegate

Whether you can write out all six surfaces is itself the test for whether you can delegate. The question to ask yourself:

**"Would this prompt survive a small model?"**

It's the same shape as the old advice about writing so a new graduate can follow it, or explaining it to a sixteen-year-old. It comes down to whether you've thought about the recipient at all.

If it wouldn't survive, you're not in a position to delegate yet. And that usually means you don't understand it yet either. Writing the spec is itself the design work, and skipping it to lob the whole thing over the wall is how you end up spinning. Those five rounds last time were also a record of me sitting that test over and over.

There are three axes for drawing the line.

- **Verification cost**: if checking the result costs as much effort as doing it yourself, there's no point sending it out
- **Whether integration is needed**: gathering materials can go out; joining the materials together can't (it degrades when split)
- **Asymmetry of authority**: reading and computing get handed over. Writing and connecting stay with the parent

Cloudflare OS giving its sub-agents exactly two tools is that third axis, precisely. That's the answer-checking I mentioned at the start.

## Conclusion

Settle the six surfaces and the implementer becomes swappable.

A setup where a clever model and a human write the spec while a cheap (or local) model implements it is probably close to the economic optimum right now. In August's terms, design ran on the paid model and implementation ran on the electricity bill. As long as the handoff is designed, the performance gap on the implementation side stops being an impassable wall. What's left is how far your design and harness can support it, and which model you assign to which purpose. **The model's performance problem turns into your design problem.**

The bottleneck collapses into the quality of the handoff spec. Which also means polishing that one thing makes the whole thing better.

None of this is anything other than basic engineering, admittedly. How much the basics matter depends on the environment, though. With everyday tools, where the harness quietly catches all sorts of things for you, sloppy handoffs somehow keep working. In an environment like Cloudflare OS, with its own conventions, a harness that doesn't catch failures, and any model you fancy pluggable into the seat, **the handoff contract is the only safety net there is**.

Gadget development is a pile of bespoke conventions with its own vocabulary, but once you understand Cloudflare's philosophy it really isn't frightening. What they want you to do, and where they've drawn the line on what you can't, is guessable from the philosophy without memorising the conventions. The conventions are a compressed version of the philosophy.

And then you read the philosophy and unpack it into a form the recipient model can follow. That's what the job of translating a spec actually consists of.

Looking back at the last investigation, it was a miniature development organisation: qwen as implementer, Claude as spec translator, human as approver. What decided whether it worked wasn't individual ability. It was the interface.

Same as a human team, really.
