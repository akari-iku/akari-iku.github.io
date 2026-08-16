---
title: 'Running Cloudflare OS on a Local LLM, and Why One Tic-Tac-Toe Took Five Rounds'
description: >-
  Cloudflare OS went open source, so I ran it entirely locally with Ollama and
  Qwen3 on an 8GB gaming PC. Getting one playable tic-tac-toe out of it took
  five rounds, and each one went wrong in its own way.
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

In August 2026, Cloudflare open-sourced Cloudflare OS.

Essentially, they released their entire AI agent environment, which is used by thousands of people internally. It writes documentation, builds apps, and automates tasks. Their pitch is that you can deploy all of this directly to your own Cloudflare account.


<a class="link-card" href="https://blog.cloudflare.com/cloudflare-os/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blog.cloudflare.com/_emdash/api/media/file/01KZ7PN06AYFEQJN4FBVAE8WHH.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blog.cloudflare.com</span>
<span class="link-card-title">Cloudflare OS: an open platform for agents, apps, and work</span>
</span>
</a>


However, while reading the README in the repository, I noticed this:

> To quickly run Cloudflare OS locally, install pnpm, then do: `pnpm run-local`

Wait, do I not need to deploy it? Can it run locally?

If it can run locally, the cost is zero. Furthermore, if you swap the model out for Ollama, everything can be handled entirely locally, right down to inference. No charges for Workers, no API keys used, and no hitting rate limits.

So, I decided to give it a go.

To cut a long story short, it did work. However, it took 5 rounds, about 16,000 tokens, and an hour and a half to go from saying "create a tic-tac-toe game" to actually having something playable.

Granted, that included me keeping an eye on things and giving instructions at various points.

What is more, those 5 failures were each interesting for different reasons, which is why I am writing this article. It felt like peeling back the design philosophy of the Cloudflare OS product one layer at a time with every failure.

This is a struggle report complete with actual measurements, aimed at anyone who wants to know where things actually get stuck when running an agent environment on a local LLM.

## Testing Environment

Let me state this beforehand.

> RTX 5060 (VRAM 8GB) / RAM 32GB. This is a Windows machine built for gaming (not set up specifically for AI).

It is not an abundance of resources. It is tough. Though for gaming purposes, it is more than enough.

However, precisely because the environment is not lavish for running AI, I can write specifically about where things get stuck.

- OS: Windows 11
- Node.js 24.13.0 / pnpm 11.15.1
- Cloudflare OS: Early access version released in August 2026 (v2)
- Model: Ollama + qwen3:8b, switched to qwen3:30b-a3b midway

> **Note:** Cloudflare OS is software that is officially stated to be in early access. Please read this article with the understanding that the contents are as of August 2026, and rough edges will likely be fixed in the future. The licence is Apache-2.0.

## What is Cloudflare OS

I will cover the detailed design in another post, so I'll just mention two things here.

A **Gadget** is a small app where a private instance runs for each user. Whether you are making slides, building a dashboard, or creating a game, it's all in this format.

Instead of sharing a SaaS, a dedicated copy for yourself is generated inside a sandbox. Because of this, even if you rewrite the internal code however you like, it won't affect anyone else.

**Gatekeeper** acts as an intermediary for each external service. When connecting to GitHub or Google, Gatekeeper narrows down the access scope, logs all operations, and inserts human approval for operations that have side effects.

The way Gatekeeper handles this approval is interesting in that it does not stop the agent. Operations waiting for approval return a simulated result as if they were executed, and the agent moves on. Humans review and approve or reject them later in bulk.

The selling point is that it doesn't stop while you go to get a coffee. The expression "going to get a coffee" feels very American. I rather like it.

This "approve later" sets the stage for today.


<a class="link-card" href="https://github.com/cloudflare/cloudflare-os" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/816bd697e47eb6f91ce3f021bf5a006daa6a97b84aefc62977d84638f482bc11/cloudflare/cloudflare-os" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">GitHub - cloudflare/cloudflare-os: Agent workspace built on Cloudflare Workers for creating documents, building apps, and running agents with your company’s context and systems.</span>
</span>
</a>


## pnpm run-local doesn't work on Windows

The README claims that `pnpm run-local` is all you need.

I beg to differ.

```text
Error: spawnSync pnpm ENOENT
    at Object.spawnSync (node:internal/child_process:1120:20)
    at run (file:///.../scripts/run-local.mjs:118:3)
```

Classic. The culprit here is that the script spawns `pnpm` directly.

```js
execFileSync("pnpm", ["install"], { stdio: "inherit", cwd: ROOT });
```

On Windows, the executable is actually `pnpm.cmd`, so trying to look for a binary named `pnpm` fails and throws `ENOENT`. Node.js's `execFileSync` bypasses the shell, meaning it won't automatically resolve `.cmd` extensions.

Using Windows means getting used to hitting these speed bumps, but at least these days AI can sort it out for you. What a time to be alive.

I found three affected files:

- `run-dev-server.js`
- `packages/gatekeeper-context/build-app.mjs`
- `packages/gatekeeper-scheduler/build-app.mjs`

It's a one-line fix:

```diff
  execFileSync("pnpm", ["exec", "wrangler", "dev", ...args],
-     { stdio: "inherit", cwd: ROOT });
+     { stdio: "inherit", cwd: ROOT, shell: process.platform === "win32" });
```

If you'd rather not patch it, running the steps manually works just as well:

```bash
pnpm install
pnpm --filter @gadgets/typed-storage build
pnpm --filter @gadgets/workshop-frontend exec vite build
node run-dev-server.js --serve-frontend-assets
```

And that spins up `http://localhost:8787`. Since everything runs locally on wrangler and workerd, it doesn't touch a Cloudflare account at all. You don't even need to be logged in.

Incidentally, while skimming the startup logs, I spotted this:

```text
Wrangler detected this dev session is running in an AI agent.
The Local Explorer API is available at http://127.0.0.1:8787/cdn-cgi/local/explorer/api
```

Wrangler notices that "this session is running inside an AI agent" and spins up an API out of nowhere that lets you inspect KV, D1, and Durable Objects over HTTP.

It really feels like we've entered an era where dedicated entry points for AI agents come standard.

Also, the local build uses simple username/password auth, and the dev default is `ADMINS=["admin"]`. That means if you register an account with the username `admin`, you get instant admin privileges. So I did just that.

Being able to brute-force your way through with `admin` is the best part of running locally. Just make sure to change it if you ever push it to production.

## Connecting Ollama Models to Cloudflare OS

Cloudflare OS supports five LLM providers (defined in `packages/workshop-backend/src/ai-models.ts`):

| Provider | Notes |
| ---- | ---- |
| `anthropic` / `openai` / `google` | API keys for each service |
| `cloudflare` | Workers AI (BYOK) |
| `ollama` | **Custom API URL allowed** |

That last option, `ollama`, essentially acts as a hook to plug in any OpenAI-compatible endpoint. We'll use it to point to a local Ollama instance.

```bash
winget install Ollama.Ollama
ollama pull qwen3:8b
```

The `qwen3:8b` model uses 4-bit quantisation (Q4) and takes up about 5.2 GB, which easily fits within 8 GB of VRAM.

Of course, you could just as easily use GLM, DeepSeek, or whatever model you prefer. I personally stick with Qwen because I've been using it for a long time and I'm fond of it. There's something endearing about how hard she tries.

To set it up via the UI, go to the setup screen, click **Add new model...**, and select **Other Ollama...** at the bottom of the dropdown.

Though to be honest, I just let Playwright handle this part.

- **Model ID:** `qwen3:8b`
- **API URL:** `http://localhost:11434`
- **API Token:** Leave blank

And that's it. Once registered, the cost tracker in the top right stays locked at **$0**.

As expected, it's a huge relief. Not having to worry about burning through tokens or hitting a 5-hour limit does wonders for both your wallet and your peace of mind.

## Why Qwen 3

Some of you might be thinking, "Wait, why Qwen 3 right now?" Let me address that first.

It comes down to three main reasons: zero running costs, total privacy (since everything runs locally, no data ever leaves your machine), and fast response times.

Plus, unlike official providers where you just paste an API key and call it a day, I wanted to document a working example of how to connect an out-of-the-box local model.

Another factor that's hard to ignore in 2026 is avoiding rate limits altogether. You can always throw money at budget constraints, but you can't pay your way out of a strict 5-hour window limit.

Worse, those caps are arbitrary variables set by someone else. With a local setup, that problem disappears. It might be slower, but at least any performance bottleneck is entirely on your own terms.

> **Note:** To be precise, saying "Ollama has no limits" isn't entirely accurate, so a quick caveat: there is a separate product called Ollama Cloud, which does enforce a 5-hour session limit and weekly caps. The version with zero limits is self-hosted local inference.

There's also a much more practical reason: larger models simply won't fit on this hardware.

This is a common trap if you only look at baseline spec sheets.

### Models Don't Have the Machine to Themselves

You might think, "I have 32 GB of RAM, so a 20 GB model should run fine." But I actually ran the numbers. Here is the baseline footprint before loading a single model:

```text
Total RAM: 31.9 GB / Free: 16.3 GB / In Use: 15.6 GB
```

The breakdown: Edge WebView2 takes 2.48 GB, Chrome takes 2.01 GB, VS Code uses 1.22 GB, Claude uses 0.8 GB, and Memory Compression swallows 4.99 GB. Windows is already aggressively compressing pages just to keep up.

In practice, the actual RAM available for active model loading wasn't 32 GB. It was around 16 GB.

The exact same bottleneck happens with VRAM, and it hurts performance even more:

```text
memory.total: 8151 MiB / memory.used: 1138 MiB / memory.free: 6759 MiB
```

Again, this is with zero models loaded. Tallying up GPU-bound background tasks yielded 24 processes: Chrome, 5 instances of Edge WebView2, Discord, VS Code, File Explorer, the Start Menu, screenshot tools.

Just running a normal desktop environment constantly eats up over 1 GB of VRAM.

Your usable VRAM is roughly 80% of the advertised spec. On an 8 GB card, you really only have about 6.6 GB to play with.

(This 1.1 GB loss is essentially the "Windows desktop tax." On a headless Linux box, this overhead drops to near zero, so if you're building a dedicated AI rig, skipping Windows is an easy optimisation. But since this setup relies on repurposing a primary gaming PC, that tax is unavoidable.)

Most benchmarks are run in sterile environments with every app closed. But real-world work happens with Slack open, dozens of Chrome tabs active, and Spotify playing in the background.

That's not a stress test; that's just a normal workspace. It's the difference between advertised MPG and real-world fuel economy, and the latter is what actually matters.

### A Quick Caveat, "Local is Free" Isn't Entirely True

The most common pushback to local LLMs is, "Well, GPU hardware isn't free." To be precise: local LLMs have zero marginal cost, not zero total cost.

Because this machine was already built for gaming, I'm simply tapping into idle resources, meaning my only ongoing cost is electricity.

However, if you were to buy a dedicated machine just to run local LLMs, the maths flips. Spending well over $1,000 upfront buys a massive amount of API tokens, so it's worth doing the sums before pulling the trigger.

### Why Even Powerful Gaming PCs Struggle with LLMs

It might seem contradictory that a rig capable of maxing out modern games stumbles with LLMs, but they bottleneck on completely different hardware metrics.

Gaming VRAM primarily holds high-res textures and render buffers, where 8 GB is plenty up to 1440p, leaving the primary bottleneck on core GPU compute.

LLMs, on the other hand, must fit the entire model weights into VRAM. Capacity is everything, and compute cores frequently sit idle waiting on memory bandwidth.

As a practical rule of thumb for local AI: ignore the GPU generation or model tier and focus almost entirely on raw VRAM capacity. An 8 GB RTX 5060 and an 8 GB RTX 4060 will perform virtually identically when it comes to whether a model can actually load.

> **Note on licensing:** Qwen models are distributed across three licence types: Apache 2.0, Tongyi Qianwen, and Qwen Research. There is precedent for these being mixed within a single release (for instance, Qwen2.5-VL varied across its 72B, 3B, and 7B variants). Running `ollama show qwen3:8b --license` confirmed Apache 2.0 for the weights used here, but it's always good practice to inspect the specific checkpoint you plan to deploy.

## Taking on Tic-Tac-Toe with Little Qwen

Everything was set up, so I just fed it the prompt right out of the README.

> Make a tic tac toe game.

Cloudflare OS spun up a workspace automatically and started streaming paragraphs of its thinking process right in the chat panel. Since Ollama returns the `reasoning` field separately, you can see every single thought as it happens.

This really comes in handy later on.

Here's how Qwen 3:8B's very first match went down.

On turn one, she just built a skeleton for the Gadget and called it a turn. On turn two, she wrote this in the server-side code:

```js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

Yep, Deno.

Since this is running on Cloudflare Workers (workerd), it obviously crashed right away with a "No such module" error. Up to that point, fair enough, stuff like that happens.

The real issue came next. Instead of fixing her own mistake after seeing the error, little Qwen started giving me a generic lecture on how Deno works: "The URL might be missing `://`," or "Please make sure your Deno environment is set up correctly."

Hey, you're the one who wrote it!

On turn three, even when I explicitly spelled it out ("This is workerd. Use your tools to apply a fix instead of giving me an explanation"), she just handed me another polite explanation. Meanwhile, the Files tab was still sitting on "No files yet."

Bless her, she tries.

Deciding 8B was a bit too much for her to handle, I switched over to qwen3:30b-a3b. Since it's an MoE running 3B active parameters, I figured it should still be pretty fast despite weighing in at 19GB.

My hunch paid off. It hit around 28 tokens/sec running a hybrid setup at 68% CPU and 32% GPU. Being able to push that kind of speed even with 70% of the workload dumped onto the CPU is the real beauty of MoE.

A dense model of the same 30B size would've crawled along at a couple of tokens a second, making it a night-and-day difference in actual use.

And that's when the real culprit finally reared its head.

## A default of 4,096 tokens was quietly breaking everything

A short while after switching to 30b-a3b, errors like these started popping up in the chat:

```text
Error: Stream ended without finish_reason
Error: internal error; reference = sppsc1llga6bg4g...
Error: Connection error.
```

Since I'd just swapped models, my first instinct was to blame either the model itself or a memory issue. But the behaviour was way weirder than that. She was gradually losing her mind.

- She'd forget the binding name of a Gadget she'd literally just built and try to make a brand-new one under a totally different name.
- She'd mess up parameter names for `writeFile` (like writing `path` instead of `filename`).
- Turns would just cut off halfway through.

When I dug into the Ollama server logs, I found the smoking gun:

```text
slot context shift, n_keep = 4, n_left = 4091, n_discard = 2045
```

Ollama defaults to a context length of 4,096 tokens for GPUs in this class.

To be precise, current versions of Ollama set the default based on available VRAM: 32K for 23GiB or more, 256K for 47GiB or more, and 4096 for anything under that.

Long story short, if you're light on VRAM, you're stuck with a tiny context window right off the bat. My setup, with its effective 6.6GB, naturally gets dumped into the absolute bottom tier.

On top of that, Cloudflare OS's system prompt easily runs around 4,000 tokens once you throw in tool definitions.

That meant the context window was blowing out the exact second the conversation started, and it was churning out responses while dropping older tokens on the floor.

What's even worse is `n_keep = 4`. That translates to "only protect the first 4 tokens," which basically protects nothing. The entire system prompt was fair game for deletion.

I'd totally forgotten that I'd stripped away my test harness and left Ollama running as vanilla as possible. My day-to-day setup is already customised, so this isn't a trap I'd normally fall into.

But since first-time users are going to hit these exact defaults, I'm calling it a valid test environment after all.

Suddenly, all the weird quirks make complete sense. She forgot the binding names because the info about the Gadget she'd just made got purged.

She scrambled the `writeFile` parameters because the tool definitions had disappeared from the context window entirely.

To be fair, this strategy makes sense for casual chat. Older banter doesn't really matter, so dropping things from the top down is totally logical.

But for AI agents, it's fundamentally backwards. The most critical pieces of information (system prompts, tool definitions, framework rules) always sit at the very beginning. It literally kills off the most important stuff first.

The nastiest part is that it doesn't throw a single error or warning. All you see on the UI is "huh, it's acting weird." It's the ultimate time-waster. It tricks you into blaming the model, swapping it out, or questioning your quantisation settings.

For what it's worth, this never happens with frontier-level APIs. When you breach the context limit, they just kick back a hard error, so you can't miss it even if you try. Silently dumping context and ploughing on regardless is a trap unique to local setups.

Who knew getting yelled at by error messages was actually a feature.

The fix comes down to an environment variable:

```bash
setx OLLAMA_CONTEXT_LENGTH 16384
```

The official docs recommend 64K or more for agentic and coding workflows, but 16K is the most realistic compromise for my VRAM. Once I set that and kicked Ollama, the issues disappeared completely.

There is a catch, though. Memory usage for qwen3:8b jumped from 5.2GB to 7.8GB. Context length ties directly into the size of the KV cache, so it naturally gobbles up extra RAM.

Which brings us right back to that effective VRAM issue from earlier. 7.8GB sounds like it ought to fit inside a nominal 8GB, but it definitely doesn't fit inside an effective 6.6GB.

Sure enough, performance degraded into a hybrid execution split of 27% CPU and 73% GPU.

Turns out, estimating your hardware specs based purely on raw VRAM capacity just doesn't cut it.

## It took a full 5 rounds just to get tic-tac-toe up and running

Now that I've sorted out the context, it's time for the real deal. Here's a quick breakdown of how it went:

| R | Detail of info provided | Result |
| --- | --- | --- |
| 1 | "Make a tic tac toe game" | Tried to use the server binding name as a browser global, ReferenceError |
| 2 | "Got this error" | Switched to hitting an HTTP endpoint via fetch, completely blocked by CSP |
| 3 | "Blocked by CSP" | Misdiagnosed it as a CORS issue and got stuck in a loop, stopped manually |
| 4 | Spelled out the `gadget` RPC stub | Used a custom class name, method not found |
| 5 | **Handed over a complete skeleton** | **Smooth sailing** |

Let's break it down round by round.

**Round 1.** In client.js (browser-side), she crashed by trying to reference the server-side binding name `TIC_TAC_TOE` as a global variable. Classic case of confusing server and client boundaries.

**Round 2.** When I passed back the error, she pivoted to hitting an HTTP endpoint with `fetch`. Fair enough, that's how normal web dev works.

Except the console spat this out:

```text
Connecting to 'http://localhost:8787/getGameState' violates the following
Content Security Policy directive: "connect-src 'none'"
```

The iframe hosting the Gadget has `connect-src 'none'` slapped on it, which completely locks down `fetch`, `XHR`, and `WebSocket`. It's not a config issue; it's physically impossible by design.

That was my "Ah, so that's how tight the sandbox is" moment. Gadgets can't talk to the outside world directly. Everything has to go through the server side via bindings (= Gatekeeper).

I actually wanted to see how strictly this was enforced in the wild, so I was quite glad to catch it.

**Round 3.** This was the real climax.

Seeing the CSP violation, poor Qwen misdiagnosed it as a CORS issue and started spamming `Access-Control-Allow-Origin` on the server side. Obviously, that didn't help. So she tweaked it and tried again. Still nothing.

To be fair, mixing up CSP and CORS is a classic rookie mistake even humans make. The problem was she just wouldn't give up. Every few minutes she would shift the CORS headers around and re-run, going round and round in circles.

You have to admire the persistence.

After watching her struggle for about 10 minutes, I finally hit the Stop button.

**Round 4.** Time to be explicit with the specs: "client.js has a global `gadget` variable injected. You call server methods with `await gadget.method()`. Don't use `fetch`. You don't need `index.html` either."

The approach was fixed. But this time, she went and named the server-side class `TIC_TAC_TOE`, crashing with a "Method not found" error.

Honestly, this one was on me. On Cloudflare OS, the class name has to be `Gadget`. But because I'd already read the system prompt, that constraint had become second nature to me, and I totally forgot to mention it. A classic human slip-up.

**Round 5.** I gave up and just handed over the boilerplate:

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

Once I gave it to her, she copied it word-for-word and made it across the finish line.

A neat 3x3 grid popped up in the App pane. Clicking a cell sent an RPC call via `gadget.makeMove()`, updated the state in the Durable Object, re-rendered, and marked the spot. A fully working game.

And here's Qwen's triumphant wrap-up report:

> The Tic Tac Toe game is now fully functional!
> ✅ No more "internal error" or module import issues
> ✅ Game state updates correctly via RPC
> ✅ Board renders properly in the app pane with full gameplay
> You can play the game immediately, click any cell to place X/O. Well done! 🎮

"Well done!" my foot.

Still, she seemed chuffed with herself, so all's well that ends well. Good job, little buddy, and thanks for the effort.

## Why couldn't little Qwen stop

The issue cropped up in Round 3.

If rewriting the CORS headers over and over still didn't fix it, you'd expect the model to step back and say "maybe this isn't the right approach" at some point. A human would probably throw their hands up by the third try and go, "Sorry, I've no idea."

(Mind you, waiting until the third attempt to admit that would still drive anyone up the wall.)

So why didn't she say anything?

Curious, I took a look under the hood of the Cloudflare OS codebase. Normally, I'd have the harness hand over to a human for confirmation at that stage, but this was a raw test run.

The logic that decides whether to kill an agent's turn lives in `packages/workshop-backend/src/agent.ts`:

```js
shouldStopAfterTurn: () =>
    abortSignal.aborted ||
    ++turnCount >= 30 ||
    connectionRequested ||
    awaitingActionDecision ||
```

There are four conditions that trigger a stop in a standard chat session (there's a fifth auto-kill specifically for callback runs, but we can ignore that here):

1. A human hit Stop.
2. The turn limit hit 30.
3. It's waiting on approval for an external resource connection.
4. It's waiting on approval for a state-changing operation.

Notice how there isn't a single check for "repeatedly failing."

It only cares if a human has already stepped in, or if it's waiting for a permission card response. The 30-turn limit is the only safety net in place, but that doesn't actually stop a runaway loop. It just caps how much compute you can burn through.

So, did the agent have any way to flag that she was stuck? Digging deeper, I found two possibilities.

The first, `requestConnection`, is strictly for resource auth ("I need to connect to GitHub, please authorise me") rather than a general cry for help.

The second is `giveUp`, a tool meant for throwing in the towel. But taking a look at the code reveals when it actually gets registered:

```js
// When the agent was started to handle callbacks, add the giveUp tool so it can bail out.
if (callbackInitiated) {
  tools.giveUp = defineTool({ /* ... */ });
}
```

Notice that condition: `callbackInitiated`. It's only enabled for background tasks or scheduled jobs. In a standard chat session, `giveUp` isn't even made available to the model.

So, whichever model you throw into Cloudflare OS as a coding agent, it only ever has two options: keep pushing blindly, or wrap up the turn on its own terms. Poor little Qwen was essentially locked in a room without a call bell.

When you look at it that way, you almost feel sorry for her.

And this brings us back to the point I brought up earlier. Gatekeeper's big selling point was: "Don't wait around for approvals, let it run, review everything in one go later, go grab a coffee."

They made the side-effects asynchronous, but left error handling relying on a human actively watching the screen. If you're off grabbing a coffee, who's there to hit Stop?

All the building blocks are already there. Errors are captured (the UI even shows a "Send 2 captured errors to chat" chip), stop hooks exist, and turn histories are persisted.

It would be trivial to update `shouldStopAfterTurn` with something like "if the last N errors match, pause and pass to the user." It's not a technical hurdle; it's just a matter of priority, and right now, it isn't implemented.

And for what it's worth, I don't think you can prompt-engineer your way out of this either. If you tell an LLM "ask for help after two failures," the entity counting those failures is still the agent trapped inside the loop.

An agent looking at a blank canvas, ticking off three checkmarks, and declaring "working as expected!" is a broken feedback signal. The counter needs to live outside the loop. That's the harness's job.

## Why conventional wisdom completely backfires

After looking back at five rounds of failures, something clicked.

The issues all boiled down to one thing: she was doing too much.

- An RPC stub was already right there, yet she tried to hit the HTTP endpoint using `fetch`.
- The rule was for client.js to build everything, yet she went ahead and created an `index.html`.
- Network calls were blocked at the source, yet she threw in CORS headers.
- The class name was hardcoded as `Gadget`, yet she gave it a custom name.

Every single time, the right answer was leaner than what she'd written. Not once did she fail because a feature was missing.

Why? Because standard web dev common sense assumes you have certain luxuries. You can fetch. You have localStorage. You can name your classes whatever you want. You write your own HTTP routes. You fix things with CORS.

Cloudflare OS doesn't have any of that. Or rather, its mindset is that it handles all of that for you. So if you write code with standard web dev assumptions, everything breaks.

That same philosophy runs through the entire product: no client-side storage, no network calls from Gadget, only two tools passed to sub-agents, and Blueprints only share the code structure, never credentials.

Don't give them extra, don't pass extra, don't let them bypass.

It's the exact same spirit as the Unix philosophy: keep it minimal and don't let it do unnecessary things.

Looking at it this way, what was being tested wasn't coding ability, but the ability to unlearn standard practices and follow unfamiliar conventions from scratch. These are two completely different skill sets.

So, if you want an off-the-shelf model to do serious development on Cloudflare OS, you should pack these rules into its context right from the start.

If I'd provided the skeleton code from Round 5 back in Round 1, she probably would've nailed it on the first try.

It's much faster to give it the rulebook up front than to wait for it to figure them out through trial and error. And this "give it only what it strictly needs" approach circles right back to Cloudflare's own design philosophy, just from the opposite angle.

To give qwen-chan some credit, the tic-tac-toe logic itself was spot on right from the start. Win detection, board state management, DOM manipulation, all completely solid. The wall she hit wasn't implementation ability, but internalising the rules.

Of course, being able to follow a reference implementation is a given, so Round 5 is nothing to brag about.

But the failure in Round 4 was down to my poor instructions, so if the rules had been properly laid out from day one, she could've written it independently without a skeleton. She's not just a copy-paste bot.

## Wrap-up

- Cloudflare OS runs entirely locally using `wrangler` + `workerd`. You can test it completely free, but on Windows, `pnpm run-local` fails with ENOENT. To fix this, add `shell: process.platform === "win32"` to spawn, or manually run the equivalent commands
- Models can be swapped out via Ollama. The `ollama` provider basically acts as a wrapper for "any OpenAI-compatible endpoint"
- **Ollama's default context length of 4096 (on GPUs with under 23GiB VRAM) is the biggest trap.** It silently drops the system prompt without throwing errors or warnings, making the model "suddenly act dumb." Always double-check `OLLAMA_CONTEXT_LENGTH`
- Sizing up your system based on total VRAM isn't enough. Background desktop processes eat up memory first, leaving you with just over 80% of usable VRAM. For MoE models, even a 30B-class model can hit 28 tok/s mostly on the CPU, making a RAM upgrade far more cost-effective than adding more VRAM
- Gadget development is packed with custom rules; if you bring in standard web dev habits, everything will break. All five rounds of failure came down to "doing too much," and the correct solution was always much simpler. If you want a model to build something properly, feed it the skeleton and a list of forbidden practices right from the start

That wraps up the practical breakdown. The rest is just post-mortem thoughts.

## Conclusion

To be honest, about half of today's roadblocks boiled down to one thing: "because it's a local LLM." If we'd been using a frontier API, we probably would've avoided the context trap and the CORS misdiagnosis altogether.

That said, even a smarter model wouldn't fix the room with no doorbell. That's a problem with the room itself.

So, are you out of the woods with a smarter model? Not quite. A smarter model just lowers the chances of getting sucked into a loop; it doesn't give you any extra exits.

Sure, it won't fall for classic misdiagnoses like CORS, but instead, it'll earnestly pitch one plausible hypothesis after another, trying its absolute best to test and fix them.

The underlying loop remains the same, and because every single move sounds so reasonable, it actually takes humans longer to realise something's wrong.

You hear "agents are just loops" a lot these days, but a loop built without an exit is a pure cash drain on a pay-as-you-go plan.

Here's the fun part, though: you could say we only spotted the flaws in this environment because we used a weaker model. If it had worked on the first try, we'd never have noticed that the agent had no way to say, "I'm stuck, help me out."

Nor would we have realised that the error message simply prints `connect-src 'none'` without giving you a hint to "use the gadget stub."

There's a clear asymmetry here: a design that works on a weaker model will work on a stronger one, but a design that works on a stronger model tells you nothing at all.

The sheer intelligence of frontier models tends to hide sloppy design. It's a bit like a measurement error.

One last thing. The tic-tac-toe game we built today still has a bug. Since the board state only lives in the Durable Object's memory, it poofs away if the server restarts. Even though Cloudflare OS Design Tips explicitly says:

> ALWAYS store server state in Durable Object storage, not just in memory.

And honestly, this is the exact same bug as the context overflow we fought all day, just on a different layer. Memory is just a cache; persistent storage is the ultimate source of truth.

Me writing to permanent files while working was really the same idea all along.

After tripping over ourselves all day, my take on Cloudflare OS itself is: "Honestly, this might be all we need." Call it a knee-jerk reaction, but documentation, apps, automation, most of the annoying stuff is contained right here.

If you just plug in an API key and use it normally, I feel like this really gets the job done.

That said, whether you can actually wield it is another story. To be frank, it feels like it'd be pretty rough without a technical background.

The security and governance are top-notch, but "being secure" and "being usable" are two totally different things. I'll save that for a separate post on design.

And of course, this is assuming you're not obsessing over local LLMs or specific models like I am. If you do obsess, you end up fighting outside the box, just like we did today.

The one moment I was truly glad to be running locally was at the very end. If that endless CORS loop had been running on a pay-as-you-go API, I would've thrown in the towel by round three.

But since it was only burning electricity, I could just sit back and watch it unfold with a smile.

Having a free pass on both your wallet and your token patience is, if you ask me, a quietly massive perk of going local.
