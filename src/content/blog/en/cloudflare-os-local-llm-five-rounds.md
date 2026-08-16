---
title: 'Running Cloudflare OS on a Local LLM, and Why One Tic Tac Toe Took Five Rounds'
description: >-
  Cloudflare OS went open source, so I ran it entirely locally with Ollama and
  Qwen3 on an 8GB gaming PC. Getting one playable tic tac toe out of it took
  five rounds, and every single failure had a different and interesting reason.
date: '2026-08-09'
tags:
  - cloudflare
  - ollama
  - llm
  - ai
lang: en
pair: cloudflare-os-local-llm
source: dev
accent: '#E5007F'
---

<!-- generated from articles/dev/2026-08-09-cloudflare-os-local-llm-five-rounds.md by scripts/import-articles.ts - do not edit -->

## Introduction

Greetings from the island nation of Japan.

I asked a small local model to build me a game of tic tac toe. It took five rounds, about 16,000 tokens and an hour and a half. In fairness, it also cost me exactly zero yen, which meant I could watch the whole disaster unfold with the calm of someone whose wallet is not on fire.

In August 2026, Cloudflare open sourced Cloudflare OS.

It is the AI agent environment thousands of their own staff use, published in full. Write documents, build apps, automate work. The pitch is that you can deploy the whole thing to your own Cloudflare account.


<a class="link-card" href="https://blog.cloudflare.com/cloudflare-os/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blog.cloudflare.com/_emdash/api/media/file/01KZ7PN06AYFEQJN4FBVAE8WHH.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blog.cloudflare.com</span>
<span class="link-card-title">Cloudflare OS: an open platform for agents, apps, and work</span>
</span>
</a>


But then I read the repository README, and it said this.

> To quickly run Cloudflare OS locally, install pnpm, then do: `pnpm run-local`

You do not have to deploy it? It runs locally?

If it does, the bill is zero. And if you swap the model out for Ollama, inference stays local too. No Workers charges, no API keys, no rate limits.

So I tried it.

The short version: **it works**. Getting from "make me a tic tac toe game" to something actually playable took five rounds, roughly 16,000 tokens and about ninety minutes. I was watching over its shoulder and stepping in at various points, to be fair.

And every one of those five failures was interesting for a completely different reason. Each time it fell over, another layer of Cloudflare OS's design philosophy peeled away and became visible.

This is a hands-on field report with real numbers, for anyone wondering where exactly a local LLM gets stuck when you point it at an agent environment.

## The Test Machine

Let me get this out of the way first.

> RTX 5060 (8GB VRAM) / 32GB RAM. A Windows box I built for gaming, not for AI.

This is not a generous setup. It is rough going. For games it is entirely sufficient, mind you.

But precisely because it is not generous for AI work, I can tell you concretely where things break.

- OS: Windows 11
- Node.js 24.13.0 / pnpm 11.15.1
- Cloudflare OS: the August 2026 early access release (v2)
- Model: Ollama + qwen3:8b, then qwen3:30b-a3b partway through

> **Note:** Cloudflare OS is explicitly labelled early access. Everything here reflects August 2026, and you should read the rough edges as things that will get smoothed out. The licence is Apache-2.0.

## What Cloudflare OS Actually Is

The detailed design discussion belongs in its own article, so just two pieces here.

**Gadget** is a small app that spins up a private instance per user. Building slides, building a dashboard, building a game. All of it takes this shape.

Rather than sharing one SaaS instance, a copy just for you is generated inside a sandbox. Which means you can rewrite the code inside it however you like without affecting anyone else.

**Gatekeeper** is the intermediary for each external service. When you connect to GitHub or Google, Gatekeeper narrows the access scope, logs every operation, and inserts human approval for anything with side effects.

The way that approval works is the interesting part, because **it does not stop the agent**.

An operation waiting for approval gets simulated, a plausible result comes back, and the agent carries on. The human approves or rejects the batch afterwards. The selling point is that nothing has stalled while you were away getting coffee.

"Getting coffee" as the unit of measurement feels very American to me, and I rather like it.

That "approve it later" design is going to matter later in this article.


<a class="link-card" href="https://github.com/cloudflare/cloudflare-os" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/816bd697e47eb6f91ce3f021bf5a006daa6a97b84aefc62977d84638f482bc11/cloudflare/cloudflare-os" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">GitHub - cloudflare/cloudflare-os: Agent workspace built on Cloudflare Workers for creating documents, building apps, and running agents with your company’s context and systems.</span>
</span>
</a>


## pnpm run-local Does Not Work on Windows

The README says one line is enough: `pnpm run-local`.

It is not.

```text
Error: spawnSync pnpm ENOENT
    at Object.spawnSync (node:internal/child_process:1120:20)
    at run (file:///.../scripts/run-local.mjs:118:3)
```

The usual. The cause is that the script spawns pnpm directly.

```js
execFileSync("pnpm", ["install"], { stdio: "inherit", cwd: ROOT });
```

What actually exists on Windows is `pnpm.cmd`, so going looking for a binary named `pnpm` finds nothing and you get ENOENT. Node's `execFileSync` does not go through a shell, so it will not resolve the `.cmd` for you.

Honestly, once you have used Windows for a while you stop being surprised by this sort of thing. And these days an AI will sort it out for you. What a time to be alive.

Three files were affected.

- `run-dev-server.js`
- `packages/gatekeeper-context/build-app.mjs`
- `packages/gatekeeper-scheduler/build-app.mjs`

The fix is one line.

```diff
  execFileSync("pnpm", ["exec", "wrangler", "dev", ...args],
-     { stdio: "inherit", cwd: ROOT });
+     { stdio: "inherit", cwd: ROOT, shell: process.platform === "win32" });
```

If you would rather not patch anything, walking the same steps by hand works fine.

```bash
pnpm install
pnpm --filter @gadgets/typed-storage build
pnpm --filter @gadgets/workshop-frontend exec vite build
node run-dev-server.js --serve-frontend-assets
```

That brings up `http://localhost:8787`. Everything runs locally on wrangler and workerd, with no connection to a Cloudflare account whatsoever. It works while you are not even logged in.

While watching the startup log, I spotted this.

```text
Wrangler detected this dev session is running in an AI agent.
The Local Explorer API is available at http://127.0.0.1:8787/cdn-cgi/local/explorer/api
```

Wrangler works out that it is being run from an AI agent and helpfully grows an HTTP API for peeking at KV, D1 and Durable Objects.

We now live in an era where the on-ramp for agents ships as standard. I had a small moment about that.

Also, the local build uses simple username and password auth, and the development default is `ADMINS=["admin"]`. Which means creating an account called `admin` makes you an administrator. I did that.

Being able to bulldoze your way in as admin is one of the joys of local. Obviously change it if you expose anything.

## Wiring an Ollama Model into Cloudflare OS

Cloudflare OS supports five provider types (`packages/workshop-backend/src/ai-models.ts`).

| Provider | Notes |
| ---- | ---- |
| `anthropic` / `openai` / `google` | Each vendor's API key |
| `cloudflare` | Workers AI (BYOK) |
| `ollama` | **You can specify the API URL freely** |

That last one is effectively a socket for any OpenAI-compatible endpoint, so that is where local Ollama goes.

```bash
winget install Ollama.Ollama
ollama pull qwen3:8b
```

qwen3:8b at Q4 is about 5.2GB. That fits whole into 8GB of VRAM.

You could just as well use GLM or DeepSeek or whatever you like. I have simply had a soft spot for Qwen for ages and I am used to it, so Qwen it is. There is something endearing about how hard they try.

Register it from the UI. On the setup screen, "Add new model...", then "Other Ollama..." right at the bottom of the dropdown, which opens a form.

Not that I clicked through any of that myself. Playwright did.

- Model ID: `qwen3:8b`
- API URL: `http://localhost:11434`
- API Token: blank is fine

That is all. Once registered, the cost display in the top right stays at `$0`.

Obvious, but reassuring. Not having to flinch at melting tokens or a five-hour limit is genuinely good for both morale and wallet.

## Why Qwen3, Before You Ask

Some of you are thinking "hang on, qwen3?", so let me answer that up front.

Three reasons. Zero cost. Everything stays local, so nothing I feed it leaves the machine. And response speed.

There is also this: unlike the officially supported providers where you paste an API key and you are done, I wanted to leave behind a worked example of what setup looks like when you connect a model from outside the supported set.

One more thing that is hard to ignore in 2026: **you do not hit rate limits**.

Money problems yield to budget. A five-hour limit does not yield to money on the spot. And the design of that ceiling is a variable you do not control. Locally there is none of that. It is slow, but the slowness is on my terms.

> **Note:** Saying "Ollama has no limits" would be inaccurate, so for completeness: there is a separate product called Ollama Cloud which does have five-hour session limits and weekly limits. The thing without limits is **local inference**.

And there is a far more immediate reason too. **A big model simply does not fit.**

This is the point where reading the spec sheet numbers will mislead you.

### A Model Does Not Get the Whole Machine

"32GB of RAM, so surely a model in the low twenties will fit." You would think so.

I measured it. Here is the machine with **no model loaded at all**.

```text
Total RAM: 31.9 GB / free: 16.3 GB / in use: 15.6 GB
```

The breakdown: Edge WebView2 at 2.48GB, Chrome at 2.01GB, VS Code at 1.22GB, Claude at 0.8GB. And **Memory Compression at 4.99GB**. Windows is already compressing pages to cope.

So the model budget available during actual work was not the total. It was **about 16GB**.

The same thing happens with VRAM, and there it hurts more.

```text
memory.total: 8151 MiB / memory.used: 1138 MiB / memory.free: 6759 MiB
```

Also with no model loaded. I counted the processes touching the GPU and there were **24 of them**. Chrome, five Edge WebView2 processes, Discord, VS Code, Explorer, the Start menu, the screenshot tool, and so on.

Simply using the desktop normally holds a permanent claim on a bit over 1GB.

**Effective VRAM is a little over 80 percent of the sticker number.** On an 8GB card, about 6.6GB.

(That 1.1GB is the tax for "using a desktop on Windows". On a headless Linux box it is close to zero, so if you are going all in on AI, choosing not to use Windows is itself an optimisation. This article is about repurposing a gaming PC, so I am on the paying side.)

Most benchmarks are measured with everything closed.

But real work happens with Slack open, tabs open in Chrome, music playing on Spotify. That is not an extravagant state. That is **the normal state**.

It is the same relationship as advertised fuel economy versus real-world fuel economy. The one you want to know is the real one.

### "Local Is Free" Is Also Not Quite Right

The most common objection is "the GPU was not free though", so let me be precise. Local LLMs are free in the sense that the **marginal cost** is zero. Not that the total cost is zero.

This machine already existed as a gaming machine, and I am using its spare capacity, so electricity is the only bill. Flip it around and the economics invert: if you are buying a dedicated machine for local LLM work, a machine costing well over a thousand pounds buys an awful lot of API tokens. Compare before you buy.

### Why a Good Gaming PC Still Struggles with LLMs

The same machine being comfortable in games and short on LLMs is not a contradiction. It is just two different axes.

VRAM in games holds textures and buffers scaled to your resolution, and 8GB is enough up to 1440p. The bottleneck there is mostly compute. An LLM, by contrast, **puts the entire model in VRAM**, so capacity is everything, and the compute units spend a lot of their time waiting on memory bandwidth.

So the practical rule is this: **for LLM work, ignore the GPU generation and model number and look only at the number of gigabytes of VRAM**. A 5060 with 8GB and a 4060 with 8GB behave almost identically on the question of whether something fits.

> **Note:** Qwen ships under three different licence families (Apache 2.0, the Tongyi Qianwen licence, and the Qwen Research licence), and they have been mixed within a single release before (Qwen2.5-VL differed across the 72B, 3B and 7B variants). I checked the two I used with `ollama show qwen3:8b --license` and both were Apache 2.0, but checking per checkpoint is the safe habit.

## Qwen Takes On Tic Tac Toe

Setup done, so I threw it the prompt the README itself suggests.

> Make a tic tac toe game.

Cloudflare OS created a workspace automatically and started streaming its reasoning into the chat as paragraphs. Ollama returns the `reasoning` field separately, so you can see everything it is thinking. That turns out to matter later.

qwen3:8b's opening attempt went like this.

Turn one: they build the empty Gadget shell and the turn ends.

Turn two: they write this on the server side.

```js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

**That is Deno.**

This is Cloudflare Workers (workerd), so naturally it dies with "No such module". Fine, that happens.

The problem is what came next. Having seen the error, Qwen **did not fix it, and instead began explaining the problem in general terms**. "The URL may be missing `://`." "Check that your Deno environment is configured correctly."

You wrote it, though.

On turn three I said explicitly "this is workerd, use the tools to apply a fix, do not explain", and got another polite explanation back. The Files tab still said "No files yet".

Lovely, really. Just not helping.

I decided 8B was carrying too much and switched to qwen3:30b-a3b. It is MoE with roughly 3B active, so despite being 19GB it ought to be quick.

The read was right: **CPU 68% / GPU 32% mixed execution at around 28 tok/s**. Getting that speed with 70 percent of the work on the CPU is the MoE advantage. A dense 30B would have dropped to single-digit tok/s, which is a completely different experience.

And then the real culprit showed up.

## A Default of 4096 Tokens Was Quietly Breaking Everything

Shortly after switching to 30b-a3b, errors started appearing in the chat.

```text
Error: Stream ended without finish_reason
Error: internal error; reference = sppsc1llga6bg4g...
Error: Connection error.
```

Since I had just changed models, I first suspected the model or memory. But the symptoms were stranger than that: **they were progressively getting stupider**.

- They forgot the binding name of the Gadget they had made minutes earlier and built a new one under a different name
- They got the parameter name for `writeFile` wrong (writing `path` where it should be `filename`)
- Turns ended halfway through

I went to look at the Ollama server log, and there was the decisive line.

```text
slot context shift, n_keep = 4, n_left = 4091, n_discard = 2045
```

**Ollama's default context length on a GPU in this class is 4096 tokens.**

To be precise, current Ollama picks the default from your VRAM. 32K at 23GiB or more, 256K at 47GiB or more, and 4096 below that. So a poor VRAM budget means you start from a poor context default too. My effective 6.6GB is firmly on the bottom rung.

And Cloudflare OS's system prompt, tool definitions included, runs to about four thousand tokens.

Which means the context was overflowing from the moment the conversation started, and it was generating while throwing old tokens away.

Worse is `n_keep = 4`. That means "protect only the first four tokens", which protects essentially nothing. **The system prompt was entirely eligible for eviction.**

I had stripped my harness for this test and kept Ollama as close to stock as possible, and then forgot I had done so. My normal environment is customised, so this is not a trap I would usually fall into. But the default is what a first-timer meets, so I have decided this counts as the correct test after all.

Every symptom now explains itself. They forgot the binding name because the information about their own Gadget had been discarded. They got the `writeFile` parameter wrong because the tool definition had vanished from context.

For conversational use this is a perfectly reasonable strategy. Old small talk matters least, so discarding oldest first makes sense.

For agent use it is **structurally backwards**. The most important information (system prompt, tool definitions, framework conventions) is permanently the oldest thing in the window. You kill the things you most need to keep, in order.

And the nastiest part is that **there is no error and no warning**. All you see from the UI is "behaving a bit oddly". That is the kind of thing that has you swapping models and suspecting your quantisation while the hours drain away.

For what it is worth, this does not happen with frontier APIs. Go over the context and you get a proper error, so you find out whether you like it or not. Silently discarding and carrying on is a local-only trap.

Being told off by an error message turns out to be a privilege.

The fix is an environment variable.

```bash
setx OLLAMA_CONTEXT_LENGTH 16384
```

The official documentation recommends 64K or more for agent and coding use, but 16K is the realistic compromise on my VRAM.

I set it, restarted Ollama, and the symptoms went away.

There is a side effect, though. qwen3:8b's memory footprint went from 5.2GB to **7.8GB**. Context length maps straight onto KV cache size, so it eats memory honestly.

And this joins up with the effective VRAM story from earlier. 7.8GB looks like it fits inside a nominal 8GB, but **it does not fit inside an effective 6.6GB**. Sure enough, it dropped to CPU 27% / GPU 73% mixed execution.

This is what I meant about VRAM capacity alone not being enough for a spec estimate.

## Five Rounds to a Working Tic Tac Toe

With the context fixed, on to the main event. Here is the result up front.

| R | Resolution of what I gave it | Outcome |
| --- | --- | --- |
| 1 | "Make a tic tac toe game" | Referenced the binding name as a browser global, ReferenceError |
| 2 | "Here is the error" | Switched to hitting HTTP with fetch, blocked entirely by CSP |
| 3 | "You are blocked by CSP" | Misdiagnosed it as CORS and looped forever, stopped by hand |
| 4 | Spelled out that a `gadget` RPC stub exists | Invented its own class name, method not found |
| 5 | **Handed over a complete skeleton** | **Finished** |

Let me walk through them.

**Round 1.** In client.js (browser side) they referenced the server-side binding name `TIC_TAC_TOE` as a global variable and fell over. They have conflated the server and client boundary.

**Round 2.** Told about the error, they rewrote things to hit an HTTP endpoint with fetch. That is perfectly mainstream web development thinking.

But the console says this.

```text
Connecting to 'http://localhost:8787/getGameState' violates the following
Content Security Policy directive: "connect-src 'none'"
```

The iframe a Gadget runs in has **`connect-src 'none'`** in force, so fetch, XHR and WebSocket are all dead. It is not a configuration issue. It cannot work in principle.

That was the moment I understood the shape of the thing. A Gadget cannot talk to the outside world directly. Only the server side can, and only through a binding, which means through Gatekeeper.

The sandbox design enforces the conventions by making non-conforming code physically inoperable. I had wanted to know how much of this was enforced in the raw state, so this was a lucky find.

**Round 3.** This was the peak of the day.

Seeing the CSP violation, Qwen **misdiagnosed it as CORS**. So they started adding `Access-Control-Allow-Origin` on the server side. Naturally it did not help. So they added more. Still nothing.

Confusing CSP with CORS is a classic mistake human beginners make too, so I cannot hold that against them. The problem was that **they would not stop**.

Every few minutes they moved the CORS header somewhere else and tried again, round and round.

Our friend really is a trier.

I watched for about ten minutes, then pressed Stop.

**Round 4.** I spelled out the spec. "A global variable called `gadget` is injected into client.js, and you call server methods with `await gadget.method()`. Do not use fetch. You do not need index.html."

The approach got fixed. This time they named the server-side class `TIC_TAC_TOE` and fell over with "method not found".

That one **was my fault**. In Cloudflare OS the class name is fixed as `Gadget`, but by that point I had already read the system prompt, and the constraint had become invisible background furniture in my head. So I forgot to say it. A plain human-side blunder.

**Round 5.** I just wrote the whole thing and handed it over.

```js
import { DurableObject } from "cloudflare:workers";

export class Gadget extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
  }
  getGameState() { /* ... */ }
  makeMove(index) { /* ... */ }
}
```

Given that, they transcribed accurately and finished.

A 3x3 board appeared in the App pane. Click a cell and `gadget.makeMove()` flies over RPC, the Durable Object state updates, it redraws, and a mark appears. Genuinely playable.

Here is Qwen's completion report.

> The Tic Tac Toe game is now fully functional!
> ✅ No more "internal error" or module import issues
> ✅ Game state updates correctly via RPC
> ✅ Board renders properly in the app pane with full gameplay
> You can play the game immediately, click any cell to place X/O. Well done! 🎮

"Well done" is doing a lot of work in that sentence.

Still, they seemed pleased with themselves. You got there. You worked hard. Thank you.

## Why Qwen Could Not Stop

Round 3 is the one that stuck with me.

If rewriting the CORS header repeatedly does not fix anything, at some point I want to hear "this might be wrong".

A human would say "sorry, I have no idea what this is" around the third attempt.

Mind you, a human who leaves it until the third attempt has earned a certain amount of murderous intent of their own.

So why does it not say so?

I got curious and went to read the Cloudflare OS source. Normally my harness would make the agent check in with a human around here, but this run was deliberately stock.

The decision to end an agent's turn lives in `packages/workshop-backend/src/agent.ts`.

```js
shouldStopAfterTurn: () =>
    abortSignal.aborted ||
    ++turnCount >= 30 ||
    connectionRequested ||
    awaitingActionDecision ||
```

Four stop conditions apply in a normal chat (there is a fifth that only fires for callback-initiated runs, which is not relevant here).

1. A human pressed Stop
2. The turn count hit 30
3. It is waiting for approval to connect an external resource
4. It is waiting for approval on an operation with side effects

**Not one of them contains the concept of "this keeps failing".**

What is there is "a human already intervened" or "waiting on a permission card". The only brake is the 30-turn ceiling, and that is not stopping a loop. It is **setting a budget for how much you may burn**.

So is there any way for the agent to say "I am stuck"? I found two candidates.

`requestConnection` is specifically for resource connections ("I want to reach GitHub, please authenticate"), not a general help desk. There is also a `giveUp` tool for declaring defeat, but reading the code, the registration condition is this.

```js
// When the agent was started to handle callbacks, add the giveUp tool so it can bail out.
if (callbackInitiated) {
  tools.giveUp = defineTool({ /* ... */ });
}
```

Only when `callbackInitiated`, meaning scheduled or callback-triggered runs. **In a normal chat, giveUp does not even exist.**

So the options for any model sitting in the coding agent seat on Cloudflare OS are "keep going" or "end the turn arbitrarily". Qwen was locked in a room with no bell to ring.

Put like that, I feel a bit guilty.

And here the thread from the opening comes back. Gatekeeper's pitch was "carry on without waiting for approval, the human can approve the batch later, go and get coffee". **Side effects are asynchronous, but failure still depends on synchronous human supervision.**

Who is pressing Stop while you are getting the coffee?

The parts are all there. Errors are captured (the UI shows a chip reading "Send 2 captured errors to chat"), the stop hook exists, and turn history is persisted. Adding "if the last N errors are the same kind, stop and hand it to the human" to `shouldStopAfterTurn` is the whole job. This is not a difficulty problem. It is a priority problem.

Incidentally, I do not think you can solve this with prompting. Instruct it to "ask me after two failures" and the thing counting the failures is the same entity stuck inside the loop.

A self-assessment that lines up three green ticks under a blank board and declares "fully functional" is broken as a signal. **The thing doing the counting has to be outside the loop.** That is the harness's job.

## Why Every Instinct Backfires Here

Lining up all five failures, something jumped out.

Every single failure was **doing something extra**.

- An RPC stub was provided, and they tried to hit HTTP with fetch
- The convention is that client.js assembles everything, and they made an index.html
- Communication itself is blocked, and they added CORS headers
- The class name is fixed as `Gadget`, and they invented their own

The correct answer was smaller than what they wrote, every time. Not once did they fail for lack of functionality.

The reason is that mainstream web development assumptions are built on **having things**. You can fetch. There is localStorage. You pick your own class names. You write your own HTTP routing. CORS is a thing you can solve with.

Cloudflare OS has none of that. Or rather, it does those things itself.

So write from ordinary assumptions and everything falls over.

The same philosophy runs through the whole product. No storage on the client. Gadgets cannot reach the network. Sub-agents get exactly two tools. What a Blueprint shares is only the shape of the code, never credentials.

**Do not give it, do not hand it over, do not let it route around.**

It is the same shape as the Unix philosophy: minimal, and no doing extra things.

Seen that way, what this environment tests is not the ability to write code. It is **the ability to abandon your instincts and follow an unfamiliar convention on first sight**. Those are two different axes.

So if you seriously want a model from outside the supported set to develop on Cloudflare OS, hand it this whole rulebook by default from the start. Had I given them the round 5 skeleton in round 1, they would probably have finished in one.

Packing the conventions into their luggage before they leave is faster than waiting for them to internalise anything.

And this "give it only the bare minimum" lands in exactly the same place as Cloudflare's own design philosophy. Just pointed the other way round.

For Qwen's good name, the tic tac toe logic itself was sound from the very first attempt. Win detection, board state management, DOM manipulation, all fine. The wall was never implementation skill. It was internalising the conventions.

Being able to transcribe is table stakes, so round 5 is nothing to boast about. But round 4 failed because of something I failed to say, so with the conventions fully handed over from the start, they would have written this themselves without a skeleton. This is not a model that can only copy.

## Summary

- Cloudflare OS runs **entirely locally** on `wrangler` and `workerd`. You can try it for zero cost, but on Windows `pnpm run-local` dies with ENOENT, so either add `shell: process.platform === "win32"` to the spawns or walk the same steps by hand
- Models are swappable via Ollama. The `ollama` provider is effectively a socket for any OpenAI-compatible endpoint
- **Ollama's default context length of 4096 (on GPUs under 23GiB) is the biggest trap.** The system prompt gets discarded silently, with no error and no warning, and the model "suddenly goes stupid". Always check `OLLAMA_CONTEXT_LENGTH`
- Spec estimates by total capacity are not enough. Desktop residents take their cut first, so **effective VRAM is a little over 80 percent of the sticker figure**. With MoE, even a 30B class model gets 28 tok/s running mostly on CPU, so adding RAM beats adding VRAM on cost effectiveness
- Gadget development is a pile of bespoke conventions, and **bringing ordinary web development instincts makes everything fall over**. All five failures were "doing something extra", and the right answer was always smaller. If you want real development out of it, hand over the skeleton and the list of prohibitions up front

That is the practical part. What follows is the post-match analysis.

## Closing Thoughts

Honestly, half of today's friction is "because it was a local LLM". The context trap and the CORS misdiagnosis would probably never have happened on a frontier API.

The room with no bell, though, does not get fixed by a smarter model. That is a property of the room.

So is a clever model safe? Not really. Cleverness reduces the probability of entering the loop. It does not add an exit.

It may not make a classic misdiagnosis like CORS, but it will instead produce one plausible hypothesis after another and diligently run off to test and patch each one. The structure that keeps it spinning is identical, and because each individual move looks reasonable, the human notices later rather than sooner.

People keep saying "an agent is a loop" lately. A loop designed without an exit is, on metered billing, simply an expensive appetite.

And here is the interesting bit. **It was precisely because the model was weak that this environment's flaw surfaced.** Had it succeeded first time, I would never have discovered that an agent has no way to say "I am stuck". I would not have noticed that the error message says `connect-src 'none'` and never says "use the `gadget` stub" either.

There is an asymmetry here. A design that works with a weak model works with a strong one. A design that works with a strong model tells you nothing about a weak one.

The brilliance of a frontier model hides the rough edges in your design. That is a form of measurement error.

One last thing. The tic tac toe I ended up with still has a bug. The board state lives only in the Durable Object's memory, so it vanishes when the server restarts. Cloudflare OS's Design Tips say this in plain language.

> ALWAYS store server state in Durable Object storage, not just in memory.

And this is **the same bug** as the context overflow I spent all day fighting. Only the layer differs. Memory is a cache, and persistent storage is the truth. Working while writing out to files that do not vanish was the same lesson.

Having fallen over repeatedly, my verdict on Cloudflare OS itself is nevertheless "maybe this is just the answer". Call it a knee-jerk reaction if you like, but documents, apps and automation, most of the tedious things close inside this one thing. For plain use with an API key pasted in, I genuinely think this covers it.

Whether you can handle it is another question. Frankly I suspect it is hard going without an engineering background. The security and governance are beyond reproach, but "being safe" and "being able to build" sit on different axes. I will leave that to the design article.

And obviously this is all from the perspective of someone who is not attached to local LLMs or any particular model. If you are attached, you will be fighting outside the frame, like I did today.

The moment I was glad to be local came at the very end. That infinite CORS loop would have broken me by round three on metered billing. The only thing being consumed was electricity, so I could sit and watch it with a smile.

**Running locally makes patience free**, for your wallet and your token budget alike. That is a quietly large benefit.
