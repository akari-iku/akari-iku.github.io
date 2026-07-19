---
title: How to Stop Claude Code Skills from Drifting with Per-Step Constraint Design
description: >-
  Why Claude Code Skills drift, and how per-step constraint design reduces those
  'no, not like that' moments
date: '2026-02-28'
tags:
  - claudecode
  - ai
  - llm
  - promptengineering
lang: en
pair: skill-constraint-design
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2026-02-28-per-step-constraint-design-claude-code-skills.md by scripts/import-articles.ts - do not edit -->

Greetings from Japan.

There's a particular breed of frustration reserved for watching an AI confidently produce exactly what you didn't ask for. It's the development equivalent of explaining your dream home to an architect, only to receive blueprints for a structurally immaculate building that somehow faces a car park. Claude Code Skills should, in theory, prevent this. In practice, many of us have found that writing a Skill is less like programming and more like leaving cooking instructions for a flatmate who interprets "season to taste" as carte blanche to add wasabi to the pasta. This article proposes a quiet rebellion: instead of assigning one freedom level to the whole Skill, tune each step individually. By the end, you'll have a framework for Skills that drift less and leave you with fewer reasons to sigh "no, not like that" at your screen.

> **Note:** This article reflects the state of Claude Code Skills as of February 2026. The Skill system is evolving rapidly, so check the [official documentation](https://code.claude.com/docs/) for the latest.

## What Anthropic's "Degrees of Freedom" Actually Says

Let's start with what the official Skill Creator recommends.

From the SKILL.md:

> Match the level of specificity to the task's fragility and variability.

In practice, three levels:

| Freedom | When to use | How to write |
|---------|------------|--------------|
| **High** | Multiple approaches valid, context-dependent | Text-based instructions |
| **Medium** | Recommended patterns exist, some variation OK | Pseudocode, parameterised scripts |
| **Low** | Operations are fragile, consistency essential | Concrete scripts, few parameters |

> Think of Claude as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

The metaphor is solid. The direction is entirely correct.

**But stopping here is where problems start.**

## One Freedom Level Per Skill Isn't Enough

The official guideline asks you to choose **one freedom level for the entire Skill**.

But real-world Skills contain steps that need to *diverge* and steps that need to *converge*, living side by side.

Consider this Skill (based on a real example I've encountered):

```markdown
### Step 5: Select recommendation
- Narrow down to one tool and recommend it

### Step 6: Calculate ROI
- Estimate cost reduction
- Show payback period

### Step 7: Compile proposal
- Write executive summary
- Keep it to roughly 5 A4 pages
```

Every step is written the same way: **procedural instructions only**. It tells Claude *what to do* but never *to what standard* or *by what criteria*.

The result:

- "Narrow down to one tool" → **Based on what?** LLM's mood
- "Calculate ROI" → **What precision? What timeframe? What format?** Different every time
- "Roughly 5 pages" → Volume specified, **quality unspecified**

Setting the whole Skill to High freedom won't fix this. Setting it to Low won't either. The problem is that each step needs a **different type and strength** of constraint, but they're all written the same way (procedural listing).

Does it work? Sure, it works. The job gets done. But every correction loop costs tokens, costs time, and (for those of us who've hit the rate limit mid-flow) costs momentum.

"Just iterate until it's right" is one philosophy. The agentic AI crowd might even call it the mainstream approach. Personally, though, I prefer fewer correction loops. Subscriptions may feel unlimited, but rate limits are very real. I've watched more than a few people hit the ceiling mid-task, and it's not fun.

So my stance: **iterate when needed, but minimise iterations through upfront design**. Constraint design is an investment in first-shot accuracy.

## Drift Isn't a Bug. It's a Design Variable.

Here's the reframe.

LLM output variance (drift) isn't a bug to eliminate. It's a **design variable to control intentionally**. LLMs are inference machines that produce "plausible-looking" outputs by nature, so there will always be drift you love and drift you don't.

In some steps, you *want* drift. A research phase where Claude casts a wide net? Brilliant, let it explore.

In other steps, drift is unacceptable. An ROI calculation that uses different axes every time? That's a problem.

What you need is to **intentionally design, for each step, where to leave freedom and where to lock things down**.

## Four Constraint Types

When designing per-step constraints, I classify them into four types:

| Type | Purpose | Constraint strength |
|------|---------|-------------------|
| **Procedural (HOW)** | Sequential, repeatable tasks | Medium (sequence fixed, judgement free) |
| **Criteria (WHAT)** | Tasks where quality/judgement matters | Strong (criteria and thresholds explicit) |
| **Template** | Fixed output formats | Medium to Strong (structure fixed, content free) |
| **Guardrail** | Things that must never happen | Strong (boundaries defined by prohibition) |

### Procedural (HOW)

"Do it in this order."

Most Skills are written entirely in this type. It's not inherently bad. For sequential, repeatable operations, it's optimal. But when you write procedures without judgement criteria, the content of each step becomes the LLM's free call. This is why procedural-only Skills work well for deployment scripts and Git workflows, but struggle with analytical tasks.

**Good fit:**

- Deployment procedures
- Git operation flows
- File conversion pipelines

### Criteria (WHAT)

"Meet this standard."

Use this for steps where you most need to suppress drift. Instead of writing HOW to do something, write WHAT the output must achieve. Claude can figure out the how on its own. Give it clear criteria, and it'll get there. Good model, honestly.

**Good fit:**

- Code review judgement criteria
- Writing quality standards
- Numerical precision and formatting

### Template

"Output it in this shape."

Fix the structure while leaving the content flexible. Anthropic's own output-patterns.md describes strict and flexible template patterns, but frames it as a choice for the entire Skill. The per-step approach says: "this particular step's output should be strict, even if the rest of the Skill is flexible."

**Good fit:**

- Meeting minutes format
- PR description templates
- Report structures

### Guardrail

"Never do this."

No procedures, no criteria. Just **boundaries defined by what's forbidden**. This is surprisingly effective in many situations. Claude (and Claude Code in particular) tends to be naturally cautious, likely because Anthropic takes safety seriously enough to have public disagreements with governments about it. In my experience, Claude often proactively flags guardrail-type concerns before I even write them explicitly. Not perfect, but noticeably more careful than other models.

**Good fit:**

- Security checks
- Pre-publication review
- Sensitive information handling

## Mixing Types Within a Single Skill

This is the key point.

**Types are chosen per step, not per Skill.**

Let's rewrite the proposal Skill from earlier, mixing types:

<details><summary>Before: 100% Procedural (drifts)</summary>


```markdown
### Step 1: Market research
- Research competing tools
- Compare features of 3-5 major tools

### Step 2: Select recommendation
- Narrow down to one tool

### Step 3: Calculate ROI
- Estimate cost reduction
- Show payback period

### Step 4: Compile proposal
- Write executive summary
- Keep to roughly 5 A4 pages
```


</details>

<details><summary>After: Per-step type selection (stable)</summary>


```markdown
### Step 1: Market research ← Procedural (divergence OK)
- Research tools broadly across the target category
- Gather from multiple sources: Gartner, G2, Reddit, etc.
- Always cite information sources explicitly

### Step 2: Select recommendation ← Criteria (converge)
- Evaluate on these 3 axes, recommend the highest overall score:
  - Adoption cost (initial + annual running)
  - Integration ease with existing systems (API availability, auth methods)
  - Team learning cost (documentation quality, language support)
- State recommendation rationale for each of the 3 axes

### Step 3: ROI estimate ← Criteria (no drift on numbers)
- Calculate on a 3-year TCO basis
- Quantify benefits on 3 axes:
  - Time saved (person-hours/month)
  - Cost reduction (currency/month)
  - Error rate reduction (%)
- Express payback period in months
- Surface all assumptions and source figures as text

### Step 4: Proposal format ← Template (fix the shape)
Output in this structure:
1. Executive summary (200 words max, conclusion → rationale → impact)
2. Current challenges (bullet list, max 3)
3. Recommended solution (Step 2 evaluation as table)
4. ROI estimate (Step 3 results as table)
5. Implementation roadmap (3-month Gantt format)

### Overall guardrails ← Guardrail (things to never do)
- Never present unverified numbers without marking them as estimates
- Never use vendor marketing figures at face value
- Never include confidential internal information (project codenames, etc.)

### Constraint operations ← Escalation design
- If the above constraints don't fit the situation, propose alternatives with reasoning
- In Agent Teams contexts, escalate to the relevant agent or team lead
```


</details>

Same "write a proposal" Skill, but each step has a different constraint type:

- **Step 1 (Research)** → Procedural. Divergence desired, keep it loose
- **Step 2 (Recommendation)** → Criteria. Three evaluation axes force convergence
- **Step 3 (ROI)** → Criteria. Lock down numerical formats to prevent drift
- **Step 4 (Output)** → Template. Fix the structure, align the shape
- **Overall** → Guardrail. Define boundaries by prohibition

## Anti-Patterns That Make Skills Drift

Here are common anti-patterns I've found in my own early Skills and in community Skills that made me go "hmm." I use this as a checklist when reviewing my own Skills.

### 1. 100% Procedural, 0% Criteria

Every step is a list of "do X." What to do is specified, but to what standard and by what criteria is undefined.

```markdown
# Drifts
- Calculate ROI
- Show payback period

# Stable
- Calculate ROI on a 3-year TCO basis
- Quantify benefits on "time saved," "cost reduced," and "error rate reduced" axes
- Express payback period in months
```

### 2. Selection Without Criteria

"Pick one" without specifying what to base the selection on. The LLM will dutifully pick one, but the rationale is up to its mood.

```markdown
# Drifts
- Recommend the optimal tool

# Stable
- Evaluate on cost, integration ease, and learning cost, then recommend the highest scorer
```

### 3. Volume Without Quality

"About 5 pages" is a volume constraint, not a quality constraint. You'll get 5 pages, but they might be hollow. Plenty of words, so it *looks* fine at first glance. That's the trap.

```markdown
# Drifts
- Keep it to roughly 5 A4 pages

# Stable
- Executive summary: max 200 words, structured as conclusion → rationale → impact
- Every section must include at least one supporting data point
```

## Even More Critical for Agent Teams

Recently, Claude Code's Agent Teams feature has made it increasingly common to run multiple agents using the same Skill in parallel.

In this context, **per-step constraint design matters even more**.

When one Claude runs one Skill, a human can catch drift and course-correct: "No, not like that." But when multiple agents run the same Skill in parallel, **monitoring everyone's output in real time simply isn't realistic**. You can keep half an eye on things, sure, but once the agent count exceeds your cognitive bandwidth, you're not really supervising anymore. Essentially, you want to give instructions and have things work out reasonably well without having to helicopter-parent every agent.

Hand a 100%-procedural Skill to five agents, and you'll get five interpretations. Fix the judgement axes with criteria and align the output with templates, and even without human oversight, they'll land at **roughly the same standard**. You still get diverse perspectives (that's the point of multiple agents), but within the frame you defined, in a format you can actually read. Call it controlled divergence, if you like.

Constraint design, then, is also **a design for reducing human supervision cost**.

"I want to trust Claude and delegate. But I can't afford drift." Per-step constraint design is my answer to that operational dilemma.

## Limitations and Caveats

I've made the case, but this isn't a silver bullet. Since I had Claude Code itself right here, I asked the interested party to run a counter-argument check. Only fair.

### Over-constraining kills flexibility

If you lock Step 2 to "evaluate on 3 axes" and a case clearly needs a 4th, the agent faces a dilemma: obey the constraint and ignore the obvious, or break it and add the 4th?

The mitigation is **escalation design** baked into the Skill:

```markdown
## Constraint operations
- If these constraints don't fit, propose alternatives with reasoning
- In Agent Teams, escalate to the relevant agent or team lead
```

Constraints should be "defaults, not absolutes. If they don't fit, escalate." Same principle as any human team, really.

### Constraint quality depends on the writer

You can write "evaluate on 3-year TCO basis" all you want, but if that criterion is wrong for the domain, you'll just converge confidently in the wrong direction. Sometimes a vague procedural step, left to the LLM's discretion, accidentally produces better results.

Ultimately, **Skill design is requirements engineering**. Tools evolve, but the human skill of defining "what, to what standard, by what criteria" doesn't go away. That hasn't changed, and it won't.

If you're in tech, you've probably seen the "tree swing" illustration (sometimes titled "what the customer actually needed"). It's a brilliantly savage cartoon satirising how projects go wrong at every handoff: what the customer described, what the project leader understood, what the developer built, and so on, until the final panel reveals what the customer actually needed all along. The lesson applies here: facing what's actually needed, rather than what's easy to specify, is worth doing. Even when the "customer" is your future self. If you haven't seen it, give it a search. Painfully relatable.

### The types are for humans, not the LLM

Honestly, the LLM doesn't recognise "procedural type" or "criteria type" as categories. All it sees is instruction specificity.

These four types are a **thinking framework for humans designing Skills**. When you're staring at a step thinking "how should I write this?", having the mental model of "this step needs criteria, not procedures" helps you write more specific instructions. It doesn't change the LLM's internal processing.

But the practical result is the same: deciding "this is a criteria step" leads you to write more specific instructions, which stabilises the LLM's output. The framework's value is indirect but real.

## Summary

- Anthropic's **"Degrees of Freedom"** points in the right direction
- But choosing one freedom level for the whole Skill leaves room for drift in practice
- LLM drift isn't a **bug**. It's a **design variable**
- Control it per step, not per Skill
- Four constraint types: **Procedural, Criteria, Template, Guardrail**
- **Choose the type per step**. Loose where you want divergence, tight where you need convergence

Claude is smart. Genuinely a good model. But it's still occasionally unpredictable. It doesn't need step-by-step hand-holding. Give it clear criteria, and it'll get there on its own.

That's precisely why **intentionally designing what to constrain and what to delegate** is the key to stable Skill output.

## References

- [Anthropic Skill Creator](https://github.com/anthropics/skills) — "Set Appropriate Degrees of Freedom" section
- [Claude Skills: The Controllability Problem](https://paddo.dev/blog/claude-skills-controllability-problem/) — Analysis of non-deterministic Skill invocation
- [Prompt Engineering Guide (Lakera)](https://www.lakera.ai/blog/prompt-engineering-guide) — "Clarity = reducing degrees of freedom"
- [7 Prompt Engineering Tricks to Mitigate Hallucinations](https://machinelearningmastery.com/7-prompt-engineering-tricks-to-mitigate-hallucinations-in-llms/) — Constraint-based hallucination reduction
