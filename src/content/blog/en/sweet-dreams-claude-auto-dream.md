---
title: Does Claude Code Need Sleep? Inside the Unreleased Auto-dream Feature
description: >-
  Claude Code's /memory menu quietly shows an Auto-dream toggle that nobody can
  turn on. I dug into the source code and a related research paper to figure out
  what it is and why it matters.
date: '2026-03-24'
tags:
  - claude
  - ai
  - llm
  - productivity
lang: en
pair: claude-code-auto-dream
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2026-03-24-sweet-dreams-claude-auto-dream.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

There is something profoundly humbling about discovering that your AI coding assistant might need a nap. I opened Claude Code's `/memory` menu expecting the usual housekeeping options, only to find a toggle labelled **"Auto-dream: off"**, sitting there like a dormant cat on a warm keyboard, refusing to be woken. It cannot be turned on. Anthropic, it seems, has built the bedroom but has not yet handed out the pyjamas. We have reached the stage of technological evolution where the question is no longer "Can AI think?" but rather **"Can AI benefit from sleeping on it?"** (personally, I find the implications for my own work-life balance rather unsettling). This article traces the thread from a stray Twitter post through source code archaeology and a UC Berkeley research paper, assembling the circumstantial case for why your CLI might soon require a bedtime story. By the end, you will either be convinced that LLM memory consolidation is the next frontier, or at least equipped to say goodnight to your terminal with a straight face. Truly.

## What Is Auto-dream?

### How I Found It

A post drifted across my Twitter timeline:

> "just found out Claude Code has a new (unreleased?) feature called 'Auto-dream' under /memory — according to reddit, this basically runs a subagent periodically to consolidate Claude's memory files for better long-term storage"

I opened `/memory` in my local Claude Code. There it was.

```text
Memory

    Auto-memory: on
    Auto-dream: off · never

  > 1. User memory          Saved in ~/.claude/CLAUDE.md
    2. Project memory        Checked in at ./CLAUDE.md
    3. Open auto-memory folder
```

It shows up in the UI, but you cannot turn it on.

### Digging Into the Source with Claude Code

Curious, I asked Claude Code itself to investigate. We dug through the source together and found the following.

Auto-dream is controlled by a **server-side feature flag** (codename: `tengu_onyx_plover`). It is not a simple toggle in `settings.json`. **Anthropic manages the rollout** on their end.

The default values are:

```yaml
enabled: false
minHours: 24  # minimum 24-hour interval
minSessions: 5  # minimum 5 sessions accumulated
```

The UI shows it, but the feature is not yet available to the general public. Anthropic appears to be rolling it out gradually.

### What the Defaults Tell Us About the Design

These three parameters alone reveal quite a bit about the design intent.

| Parameter | Value | Meaning |
| ---- | ---- | ---- |
| `enabled` | `false` | Server-side flag. Changing `settings.json` locally has no effect |
| `minHours` | `24` | At least 24 hours must pass since the last run. Once per day at most |
| `minSessions` | `5` | Will not run unless 5 sessions have accumulated |

There is no point in tidying a small amount of memory frequently. Let it accumulate, then **consolidate once a day**. The concept closely mirrors **memory consolidation during human sleep**.

## Why Auto-dream Is Needed

Auto-memory, as it exists today, has a structural problem.

### The Write-and-Forget Problem

Auto-memory writes what it learns during conversations to memory files. However, **there is no mechanism to organise them**.

- Throwaway working notes and genuinely important learnings are stored side by side
- Similar content gets written over and over
- Notes about resolved issues or abandoned tech stacks linger indefinitely
- `MEMORY.md` is capped at 200 lines, yet the space fills up without any curation

The more sessions you run, the worse the quality of your memory gets. I actually turned Auto-memory off on my own Claude Code for this exact reason. It kept memorising things that frankly did not need memorising.

### Auto-dream Is the Missing Half

It seems natural to think Auto-memory and Auto-dream were **designed as a pair** from the start.

- **Auto-memory**: the writing phase. Jot down notes during conversations
- **Auto-dream**: the organising phase. Consolidate, deduplicate, and prune accumulated notes

Only one half shipped first, leaving us in a halfway state: taking notes but never tidying the notebook.

## The Sleep-time Compute Paper

Auto-dream's design philosophy has a theoretical backing in a paper published in April 2025.

### Overview

**Sleep-time Compute: Beyond Inference Scaling at Test-time**
Kevin Lin, Charlie Snell et al. (Letta + UC Berkeley)


<a class="link-card" href="https://arxiv.org/abs/2504.13171" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Sleep-time Compute: Beyond Inference Scaling at Test-time</span>
</span>
</a>


### Core Idea

Conventional LLMs think only after a question arrives (test-time compute). This paper proposes **thinking ahead of time by predicting queries from the context** (sleep-time compute).

1. **Sleep-time**: using only the context `c`, prompt the LLM to predict likely queries and pre-compute inferences. This produces a restructured context `c'`
2. **Test-time**: when the actual query `q` arrives, use the pre-computed `c'` to answer quickly

Expressed formally:

$$
S(c) \rightarrow c'
$$

$$
T_b(q, c') \rightarrow a \quad (b \ll B)
$$

By doing the heavy lifting in advance, the test-time compute budget $b$ can be made far smaller than the conventional budget $B$.

### Experimental Results

| Metric | Effect |
| ---- | ---- |
| Test-time compute | ~5x reduction at equal accuracy |
| Accuracy improvement | Up to +13% (GSM-Symbolic), +18% (AIME) |
| Cost per query (multiple queries) | 2.5x reduction (amortisation) |

### Query Predictability

A particularly suggestive finding: **the more predictable the query, the greater the benefit of sleep-time compute**.

Applied to Auto-dream, this means memory consolidation gets more precise as user work patterns accumulate. The `minSessions: 5` threshold can be interpreted as ensuring a minimum amount of data for meaningful prediction.

### The Authors' Background

The authorship sits at the intersection of two threads.

- **Letta** (formerly MemGPT): the team behind the 2023 MemGPT paper, which proposed giving LLMs OS-like memory management
- **Charlie Snell**: a UC Berkeley researcher who did pioneering work on test-time compute scaling

Memory management experts and compute scaling experts joined forces to produce research on organising memory while sleeping. Some members had previously worked on GPT-family models, and one could read this as pursuing an approach distinct from OpenAI's o1/o3 scaling trajectory within a smaller team. Knowing that Anthropic's own founding members departed from OpenAI, there is a certain wry irony to the whole affair.

## Mapping the Paper to Auto-dream

Laying the paper's theory alongside Auto-dream's implementation, the correspondence is quite clean.

| Sleep-time Compute (paper) | Auto-dream (Claude Code) |
| ---- | ---- |
| Pre-compute by predicting user queries | Consolidate and organise past memory |
| 5x reduction in test-time compute | More efficient context loading at session start |
| Process offline (sleep-time) | Run once per day asynchronously (`minHours: 24`) |
| Amortise across multiple queries | Batch-process across sessions (`minSessions: 5`) |

That said, the paper addresses pre-inference over arbitrary contexts, whereas Auto-dream **limits its scope to memory file consolidation**. It is not the full application of the theory but rather a pragmatic extraction of the most immediately useful piece. I think this scoping decision is genuinely clever. You can see the pain that would come from expanding further, so they drew the line and kept it contained.

## How Do You Implement "Sleep"?

### The Paper's Premise

The paper defines sleep-time as "idle time when the user is not sending queries". The LLM is not sleeping. **The user is idle while the LLM works behind the scenes.** It is the reverse.

### Claude Code's Case

Claude Code is a CLI tool. It is not a daemon, so running background work while the user sleeps seems difficult at first glance.

But Anthropic already has the infrastructure to solve this. Scheduled execution is available in a **three-tier structure**.

| Method | Runs on | After restart | Machine off |
| ---- | ---- | ---- | ---- |
| `/loop` (in-session) | Local | Gone | No |
| Desktop scheduled tasks | Local | Persists | No |
| Cloud scheduled tasks | Anthropic cloud | Persists | Yes |


<a class="link-card" href="https://code.claude.com/docs/en/scheduled-tasks" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://claude-code.mintlify.app/_next/image?url=%2F_mintlify%2Fapi%2Fog%3Fdivision%3DAutomation%26appearance%3Dsystem%26title%3DRun%2Bprompts%2Bon%2Ba%2Bschedule%26description%3DUse%2B%252Floop%2Band%2Bthe%2Bcron%2Bscheduling%2Btools%2Bto%2Brun%2Bprompts%2Brepeatedly%252C%2Bpoll%2Bfor%2Bstatus%252C%2Bor%2Bset%2Bone-time%2Breminders%2Bwithin%2Ba%2BClaude%2BCode%2Bsession.%26logoLight%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fc5r9_6tjPMzFdDDT%252Flogo%252Flight.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Dc5r9_6tjPMzFdDDT%2526q%253D85%2526s%253D78fd01ff4f4340295a4f66e2ea54903c%26logoDark%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fc5r9_6tjPMzFdDDT%252Flogo%252Fdark.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Dc5r9_6tjPMzFdDDT%2526q%253D85%2526s%253D1298a0c3b3a1da603b190d0de0e31712%26primaryColor%3D%25230E0E0E%26lightColor%3D%2523D4A27F%26darkColor%3D%25230E0E0E%26backgroundLight%3D%2523FDFDF7%26backgroundDark%3D%252309090B&amp;w=1200&amp;q=100" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">code.claude.com</span>
<span class="link-card-title">Run prompts on a schedule - Claude Code Docs</span>
</span>
</a>


`/loop` is a lightweight in-session scheduler. Desktop tasks persist locally. Cloud tasks run on Anthropic's infrastructure, so they execute even when the user's machine is off.

Which tier Auto-dream will use is unknown, but **all three are already running in production**. The technical barrier is essentially zero.

## When Might It Ship?

### What Is Already in Place

- Theoretical backing (Sleep-time Compute paper, April 2025)
- Scheduling infrastructure (Desktop schedule, CLI cron commands, Cloud scheduled tasks)
- UI readiness (`/memory` already displays it)
- Feature flag mechanism (server-side, just flip to `true`)

### Remaining Questions

Technically, it looks ready to ship any time. What remains is likely a business decision.

- Who bears the cost of subagent executions the user did not explicitly request?
- How to explain that memory content is processed via the API during consolidation
- Should it default to ON, or require explicit opt-in?

Given recent feature releases and the Team plan's approach, I would guess it will be a settings toggle. But I genuinely do not know.

### Enterprise Demand

Long-running agents with long-term memory are in strong demand from the enterprise segment.

- Context carries over to new sessions, reducing onboarding cost
- Infrastructure operation knowledge accumulates (incident history, operational know-how)
- Demand exists for sharing knowledge across teams, from individual memory to project-scoped memory

Anthropic announced a $100 million investment in the Claude Partner Network in March 2026, accelerating its enterprise expansion. An Auto-dream release aligns with this business strategy.


<a class="link-card" href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.anthropic.com/api/opengraph-illustration?name=Hand%20ShapeBuild&amp;backgroundColor=fig" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.anthropic.com</span>
<span class="link-card-title">Anthropic invests $100 million into the Claude Partner Network</span>
</span>
</a>


## Counter-arguments

Everything discussed so far is circumstantial evidence. Here are the points that could counter this article's hypotheses.

### Auto-dream May Have Nothing to Do with Sleep-time Compute

This article drew parallels between Auto-dream's design and the Sleep-time Compute paper, but there is no direct evidence that Anthropic referenced the paper in their design. Anthropic does not typically disclose such things, so the absence of confirmation is not surprising, but it is worth noting.

The idea of periodically tidying memory is hardly novel. Cron-based cleanup, defragmentation, log rotation. These are bread-and-butter patterns in infrastructure operations. You do not need an academic paper to think of applying them to LLM memory management.

Furthermore, the paper's sleep-time compute is about "pre-inferring future queries from context", whilst Auto-dream is about "organising past memory". The paper looks forward; Auto-dream looks backward. They may resemble each other on the surface whilst solving different problems entirely.

That said, both share the structure of **"using compute during user idle time to improve the efficiency of the next session"**. Even if the implementation details differ, I believe there is a genuine connection at the design philosophy level.

### Enterprise and Auto-dream May Not Connect

The article argued alignment with enterprise demand, but current Auto-memory has a constraint.

The official documentation states clearly:

> Auto memory is machine-local.

Auto-memory is **machine-local**. It cannot be shared across team members. This is a fundamentally different design from the team-shared knowledge base that enterprises want.

CLAUDE.md does offer Project scope (shared via source control) and Managed policy (organisation-wide), and the `autoMemoryDirectory` setting allows changing the storage location. Pointing it at shared storage could enable pseudo-sharing.

However, team-shared memory is an area where **the gap between "want" and "can implement" is large**.

- How do you merge when multiple people write to memory simultaneously? CLAUDE.md can be managed with git, but merging unstructured Auto-memory is messy
- Individual memory is already cluttered from the write-and-forget problem. Mix in an entire team's notes and it becomes chaos. With Auto-dream not yet implemented even for individual memory consolidation, team sharing is premature
- What scope of memory should be shared? Project-specific knowledge is worth sharing, but individual workflow quirks mixed in would just be noise

The natural sequence is Auto-dream (individual memory consolidation) first, team sharing second. The current design is squarely focused on individual memory, and team-shared memory will likely be designed as a separate feature.

Though, being a dream feature, it does carry a certain aspirational quality.

### It Might Never Ship

Feature flags appearing in the UI does not guarantee a release. Plenty of product features have been experimented with and then quietly retired. Auto-dream could follow the same fate.

A feature for dreaming that ends up being just a dream. That too would be a form of goodnight.

Beyond this point, speculation begets speculation. It is a fun exercise, but this article will say its own goodnight here.

## Summary

Auto-dream is a poetic concept (giving an LLM sleep), but its substance is grounded in computation theory.

- A subagent automatically consolidates and organises memory files
- It solves Auto-memory's write-and-forget problem, creating a cycle where the tool gets smarter the more you use it
- The theoretical backdrop is the Sleep-time Compute paper's finding that "pre-computation costs are recovered through test-time savings"
- The UI and infrastructure are in place. It is one feature flag away from release

When Auto-memory and Auto-dream begin working as a pair, Claude Code's memory management will shift from "write and forget" to "write, sleep, organise, and remember".

I think the day we say "sweet dreams" to Claude Code is not far off. If the feature ships, that is.

## References

- Sleep-time Compute: Beyond Inference Scaling at Test-time (arXiv:2504.13171)

<a class="link-card" href="https://arxiv.org/abs/2504.13171" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Sleep-time Compute: Beyond Inference Scaling at Test-time</span>
</span>
</a>

- MemGPT: Towards LLMs as Operating Systems (arXiv:2310.08560)

<a class="link-card" href="https://arxiv.org/abs/2310.08560" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">MemGPT: Towards LLMs as Operating Systems</span>
</span>
</a>

- Scaling LLM Test-Time Compute Optimally Can Be More Effective Than Scaling Model Parameters (arXiv:2408.03314)

<a class="link-card" href="https://arxiv.org/abs/2408.03314" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters</span>
</span>
</a>
