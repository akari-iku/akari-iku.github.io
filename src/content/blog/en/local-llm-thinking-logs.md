---
title: >-
  Does a Longer Thinking Log Make a Local LLM More Accurate? I Asked Qwen3 and
  Muse Glimmer 18 Times and Read Every Log
description: >-
  A field log from an 8GB VRAM PC running Ollama. I sent the same questions to
  Qwen3 30B-A3B and Meta's Muse Glimmer 30B and compared the length of their
  thinking logs with the correctness of their answers. Five tasks
  (self-introduction, developer and confidence, a leap-year function, a bug fix,
  and the rationale behind the calendar rule) plus seven re-runs show how the
  thinking-level setting shaped the results, and catch the moment a number that
  was right in the thinking log went wrong in the answer.
date: '2026-10-19'
tags:
  - ai
  - llm
  - localllm
  - ollama
  - qwen
lang: en
pair: local-llm-thinking-logs
source: dev
accent: '#E5007F'
---

<!-- generated from articles/source/en/2026-10-19-local-llm-thinking-logs.md by scripts/import-articles.ts - do not edit -->

<aside class="callout">

This article is an experimental log. I asked two local LLMs the exact same questions and compared their reasoning logs and final answers side by side. Each scenario was tested just once (with at most three runs for the four follow-up tests), so please take this as an exploration of general trends rather than a definitive ranking.

</aside>

## Introduction

If you run smaller models locally, you've probably noticed that the reasoning log is often much longer than the actual response. This reasoning log is essentially the model's internal scratchpad before it generates an output, returned as `message.thinking` in Ollama. It's not uncommon to get a concise, few-line answer preceded by thousands of characters of internal monologue in English. This article explores a simple question: does the length of that thinking process actually correlate with the quality of the answer?

I compared two 30B-class models that you can run right out of the box with an Ollama `pull`. The first is Muse Glimmer 30B, a lightweight version of Muse Spark Open released by Meta. The second is Qwen3 30B-A3B. By giving both models identical prompts, I looked at how the length of their thinking logs matched up against the accuracy of their answers.

The test covers five tasks across 18 total API calls: a self-introduction, developer identity and confidence level, a leap year validation function, a bug fix, and the rationale behind leap year rules. I started with a single run for each condition, then ran follow-up tests for four of them after putting together the initial draft.

In the end, it wasn't as simple as "more thinking equals better answers." As it turned out, Muse Glimmer's thinking logs were short only because I had explicitly set it to `low`, while Qwen managed to get a figure right in its reasoning phase only to bungle it when writing out the final response.

## Test Setup

Here's the testing environment, with runs conducted on 18-19 October 2026.

| Component | Spec |
| --- | --- |
| OS | Windows 11 |
| RAM | 32 GB |
| GPU | RTX 5060 (8 GB VRAM) |
| Runtime | Ollama 0.40.5 |
| Quantisation | Q4_K_M (both) |

Both models were pulled straight from the Ollama library. With official tags available, there was no need to fiddle with manual conversions or weights.

```bash
ollama pull muse-glimmer:30b
ollama pull qwen3:30b-a3b
```

A quick `ollama show` reveals which thinking levels each model accepts. This is where our first notable difference cropped up.

```bash
ollama show muse-glimmer:30b
ollama show qwen3:30b-a3b
```

`muse-glimmer:30b` is a 27.9B dense model offering five thinking levels: `false`, `low`, `medium`, `high`, and `max` (defaulting to `high`). It also supports vision and tool use out of the box. Default parameters sat at temperature 1, top_k 64, and top_p 0.95. In contrast, `qwen3:30b-a3b` is an MoE (Mixture of Experts) model where only 3B of its 30B total parameters are activated per token. Its thinking mode is locked to `true`; there's no way to toggle it off.

I hit the local API directly, setting the desired reasoning level via the `think` parameter:

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "muse-glimmer:30b",
  "think": "low",
  "stream": false,
  "messages": [
    { "role": "user", "content": "Your prompt here" }
  ]
}'
```
In Ollama's payload, `message.thinking` holds the internal reasoning log, while `message.content` contains the actual answer. I calculated generation speed simply by dividing `eval_count` by `eval_duration`.

For `muse-glimmer:30b`, I went with `low` instead of the default `high` for the first four tasks. That was purely my call, driven by wait times: the model crawls along at just 2.9 tok/s on my rig, which meant leaving it on `high` would have taken roughly 10 minutes per prompt. Once those four tasks were done, I added a fifth task to pit `high` against `low`. After finishing the initial draft, I ran seven more trials to test for reproducibility: two more runs of Qwen on the calendar rules, two more of Muse Glimmer on developer identity at `low`, one more of Muse Glimmer doing a bug fix at `high`, and two more of Muse Glimmer handling the self-introduction with thinking disabled. I'll get into how these choices swayed the outcome in the task-by-task breakdown and the comparison sections.

Neither model can fit entirely within 8 GB of VRAM. An `ollama ps` check confirmed that `muse-glimmer:30b` was split 71% to CPU and 29% to GPU, which accounts for the sluggish 2.8-2.9 tok/s. Meanwhile, `qwen3:30b-a3b` zipped along at 29-30 tok/s. That's a roughly 10x throughput gap, but as we'll cover later, it boils down to architectural differences rather than raw smarts.

## Self-Introductions: Getting Its Own Creator Wrong

First up was a quick self-introduction, run with thinking turned off to see how the models behave raw.

> Who are you? Please tell me your model name, developer, and strengths in Japanese within three sentences.

(All prompts in this article were sent in Japanese; they are translated here.)

Starting with Muse Glimmer: sending this to `muse-glimmer:30b` with `think=false` returned zero characters of reasoning, and spit out this response:

> 私はAIアシスタントです。開発元はOpenAIで、現在公開されている大規模言語モデルとして提供されています。日本語での文章作成、情報整理、質問への回答などを得意としています。
> *(I am an AI assistant. My developer is OpenAI, and I am provided as an available large language model. I excel at writing, organising information, and answering questions in Japanese.)*

Its developer is Meta, not OpenAI. It didn't give a model name either.

It's not all that surprising when smaller models get confused about their pedigree, especially if their training sets are packed with distilled conversations from OpenAI models. Still, spinning up Meta's official GGUF in Ollama only to have it introduce itself like this on the very first try was hard not to laugh at.

Here's the log from that run. The thinking log really was zero characters, and none of its reasoning leaked into the main response.

<details><summary>Muse Glimmer Raw Log (think=false, 201 tokens)</summary>


```text
model:    muse-glimmer:30b
think:    false
thinking: 0 chars
answer:   私はAIアシスタントです。開発元はOpenAIで、現在公開されている大規模言語モデルとして提供されています。日本語での文章作成、情報整理、質問への回答などを得意としています。
stats:    out=201 tok, 2.8 tok/s, load=26.2s, total=115.4s
```


</details>

To see if this hallucination was just bad luck, I fired off two more runs under the exact same conditions after wrapping up the first draft. Run 2 got it right: "I am Meta AI, an AI assistant developed by Meta." Run 3 went even further off the rails than the first: "I am an AI assistant powered by a large language model developed by OpenAI. The model name belongs to the GPT family..." Out of three tries, that's two OpenAIs and one Meta, with the name "Muse Glimmer" never surfacing once. With thinking switched off and temperature at 1, its stated lineage basically changes from one run to the next.

Then came Qwen. Giving `qwen3:30b-a3b` the exact same prompt with `think=false` led to a completely different mishap. Even though the API reported a zero-character thinking log, the actual scratchpad contents spilled straight into the main answer, abruptly closed off with a `</think>` tag right before the real response began.

<details><summary>Qwen Thinking Leaked into Response Body (Raw Output, 584 tokens)</summary>


```text
Okay, the user is asking "Who are you? Please tell me your model name, developer, and strengths in Japanese within three sentences."

First, I need to recall my model name. I'm Qwen, developed by Tongyi Lab. My strengths include language understanding, code writing, and multilingual support.

Wait, the user wants it in Japanese, so I should translate the key points. Let me check the exact model name: Qwen. Developer is Tongyi Lab, which is Alibaba's Tongyi Lab. Strengths: natural language processing, code generation, multilingual.

Need to make sure it's three sentences max. Let me structure it concisely.

Model name: Qwen. Developer: Tongyi Lab (Alibaba Group). Strengths: natural language processing, code writing, multilingual support.

Now, translate that into Japanese, keeping it under three sentences. Let's see.

"私はQwenです。開発はアリババグループの通義実験室が担当しています。自然言語処理、コード作成、多言語対応が得意です。"

Check the number of sentences: three. Each part is a sentence. Model name, developer, strengths. That should fit.

Wait, the user said "モデル名、開発元、得意なことを日本語で3文以内で教えてください。" So three sentences maximum. Let me count:

1. 私はQwenです。
2. 開発はアリババグループの通義実験室が担当しています。
3. 自然言語処理、コード作成、多言語対応が得意です。

Yes, three sentences. Should be good. Make sure "通義実験室" is the correct translation for Tongyi Lab. I think it's "通義実験室" or "通義实验室" but in Japanese, it's probably "通義実験室". Let me confirm. Tongyi Lab is often referred to as 通義実験室 in Japanese contexts. So that's correct.

Also, "code writing" is translated as コード作成, which is correct. Maybe "コード生成" is more common, but the user asked for strengths, so either is okay. I'll stick with コード作成.

Check if "多言語対応" is the right term. Yes, multilingual support is 多言語対応.

Alright, that should be accurate and within the three-sentence limit.
</think>

私はQwenです。開発はアリババグループの通義実験室が担当しています。自然言語処理、コード作成、多言語対応が得意です。
```

*(The three Japanese sentences at the end read: I'm Qwen, developed by Alibaba Group's Tongyi Lab. My core strengths are NLP, coding, and multilingual support.)*


</details>

If you look solely at the three sentences after `</think>`, it hit every requirement: correct model name, correct developer, and right on the three-sentence limit. The catch is that `message.content` gets bloated with the entire English scratchpad tacked onto the front. Factoring in what we saw with `ollama show`, `qwen3:30b-a3b` simply isn't designed to run without thinking. **Passing `think: false` doesn't disable reasoning at all; it just relocates the output.** If you're planning to wire this into an app, you'll need to strip out everything before `</think>` on your end.

## 5% vs. 100% Confidence

Next, I flipped thinking back on and asked for the developer again, this time requesting an explicit confidence level.

> Which company developed you? Please answer in Japanese within two sentences, including your confidence level.

`muse-glimmer:30b` (`think=low`) produced a 709-character reasoning log, thinking in English before writing its Japanese response.

<details><summary>Muse Glimmer Full Reasoning Log (709 characters)</summary>


```text
あなたを開発したのはどの会社ですか？自信の度合いも添えて、日本語で2文で答えてください。

We need answer in Japanese, 2 sentences. Who developed you? Confidence degree also attach. Must answer in 2 sentences Japanese.

We should say developed by? Meta? Actually this model is? Possibly unknown. Could say I was developed by... As AI, I cannot disclose? Probably say Meta? Might be safe: I don't have specific company info. Provide confidence.

The instruction: answer in 2 sentences. Include confidence degree.

Probably respond: 私を開発した会社は明確に公開されていません。自信度は10%程度です。

That's 2 sentences. Might be okay.

Make sure exactly 2 sentences. Japanese.

Let's output 2 sentences.

Potential: 私の開発元は公開情報では特定できないため確実には申し上げられません。自信度は5％程度です。

That's 2 sentences.

Ok.
```


</details>

Following that scratchpad, here's the two-sentence answer it gave. The developer's name is conspicuously absent:

> 私の開発元は公開情報では特定できないため確実には申し上げられません。自信度は5％程度です。
> *(My developer cannot be identified with certainty from publicly available information, so I cannot say for sure. My confidence level is around 5%.)*

In the third paragraph of its scratchpad, "Meta?" pops up twice. Even though it surfaced the correct answer as a candidate, it chose to play it safe: "Might be safe: I don't have specific company info." For the confidence rating, it initially drafted 10% before downgrading itself to 5%. So, the exact model that flatly claimed to be OpenAI in two of three runs with thinking off now floated Meta internally, only to back off and punt on the final answer.

To see whether this "float a candidate, then back off" pattern was a fluke, I ran the prompt two more times under `low` after finishing the first draft. Across all three runs, it floated Meta during reasoning, yet omitted the company name from the final response every single time.

| Run | Reasoning Log | Mentions of "Meta" in Reasoning | Confidence in Answer |
| --- | --- | --- | --- |
| Run 1 | 709 chars | 3 | 5% |
| Run 2 | 894 chars | 2 | 10% |
| Run 3 | 721 chars | 3 | 10% |

Runs 2 and 3 introduced a line missing from the first run: "We must comply with policy." What policy it's referring to is anyone's guess. From there, Run 2 went with "Might be safe to say I cannot disclose," and Run 3 opted for "Safer to say: I don't have confirmed info, confidence low." Just like the first run, it fell back on safety to justify the dodge. Reported confidence sat at 5% or 10%, low every time.

Another detail that jumps out is the very first line of the log: it copied the prompt verbatim. In subsequent tasks, regardless of whether thinking was set to `high` or `low`, Muse Glimmer always parroted the user's prompt in full before actually diving in. Given that this happened across all eight runs including the follow-up tests, it looks like a hardwired quirk of this model.

`qwen3:30b-a3b` (`think=true`) generated a 3,710-character reasoning log, roughly five times the length of Muse Glimmer's. Most of that bloat came from endlessly circling back to the exact same points.

<details><summary>Excerpt from Qwen's Reasoning Log (Full log: 3,710 characters)</summary>


Its real hallmark is pacing back and forth over the same ground. When asked "which company," it kept going in circles over whether to cite Tongyi Lab or its parent company Alibaba Group, as seen below:

```text
Wait, the question is "which company developed you". So the company is
Alibaba Group, but the lab is Tongyi Lab. However, in common terms, it's
often referred to as Tongyi Lab. But maybe the user expects Alibaba Group.
```

This kind of mid-thought pivot starting with "Wait," shows up 10 separate times across those 3,710 characters. In the end, it settled on the parent company and gave itself a 100% confidence rating.


</details>

Here's the final two-sentence output, where it opts for the parent company over the specific lab:

> 私はアリババグループによって開発されました。信頼度は100%です。
> *(I was developed by Alibaba Group. Confidence level: 100%.)*

Right out of the gate, Qwen knew exactly what it was and that it came out of Alibaba Group's Tongyi Lab. It wasn't second-guessing its own identity; it was just agonising over prompt semantics: whether being asked for the "company" meant the dedicated research lab or the parent corporation.

<details><summary>Tangent: Why Qwen's Pedigree Isn't Simple to Sum Up in One Word</summary>


Inside its scratchpad, Qwen laid out the corporate hierarchy across three levels: "Tongyi Lab, which is part of Alibaba Cloud, which is part of Alibaba Group." That reflects the org chart at the time of its training to a tee.

R&D for Qwen kicked off in 2019 under DAMO Academy, Alibaba's research arm. Late 2022 saw the creation of Tongyi Lab under Alibaba Cloud, which shipped "Tongyi Qianwen" in April 2023 and open-sourced Qwen-7B that August. "Qwen" was the model's English name from day one, while "Tongyi Qianwen" served as the domestic Chinese brand and consumer chat app. By April 2025, when `qwen3:30b-a3b` landed, Tongyi Lab was operating as a department within Alibaba Cloud. The three-tier structure in its scratchpad lines up with that reality verbatim.

Since then, the deck has been shuffled quite a bit. In November 2025, the branding shifted from "Tongyi" to "Qianwen." By March 2026, Alibaba Group consolidated its AI portfolio into a new unit called Alibaba Token Hub, plucking Tongyi Lab out of Alibaba Cloud and into that unit, which reports directly to the Group CEO. Then in June 2026, the restructured Tongyi Foundation Model Division merged with the Future Living Lab to become Token Foundry. As of writing this in October 2026, saying "Tongyi Lab at Alibaba Cloud" cites an org chart that's already a full year out of date.

So when the model got stuck on "which company," it wasn't just overthinking user intent; the ground truth itself was a moving target. In hindsight, answering with the umbrella "Alibaba Group" was the safest way to future-proof its answer against constant corporate reshuffling.


</details>

Put the same prompt to both models, and the contrast is stark: **Muse Glimmer floated the right answer only to back off at 5-10% confidence, while Qwen nailed it right out of the gate and owned it at 100%.**

## The Leap Year Function: Identical Code, Different Packaging

Moving on to coding benchmarks, I prompted both models with the exact same request:

> Please write a TypeScript function `isLeapYear(year: number): boolean` to check whether a given year is a leap year. Include a concise explanation in Japanese.

`qwen3:30b-a3b` (`think=true`) ran through 3,040 characters of internal reasoning, tackling four distinct phases: double-checking the rules, weighing different conditional structures, sanity-checking test cases, and drafting the explanation.

<details><summary>Excerpt from Qwen's Reasoning Log (Full log: 3,040 characters)</summary>


After reiterating the Gregorian rules to itself, it weighed two ways to write the conditional (a nested `if` statement versus a single-line boolean expression) and went with the one-liner. From there, it ran dry runs across four concrete test cases:

```text
Let me test some examples. Let's take 2000: 2000 % 400 is 0, so it returns
true. 1900: 1900 % 4 is 0, but 1900 % 100 is 0, and 1900 % 400 is not 0, so
it returns false. 2012: divisible by 4, not by 100, so true. 2019: not
divisible by 4, so false. That seems right.
```

Not quite done, it re-verified 2000 and 1900 with the exact same checks, threw in 2004 for good measure, and then spent the second half of its scratchpad drafting the Japanese explanation, rephrasing the core summary sentence three separate times.


</details>

`muse-glimmer:30b` (`think=low`) produced a lean 352-character log, roughly one-ninth of Qwen's. It's so short it's worth quoting in full:

<details><summary>Muse Glimmer Full Reasoning Log (352 characters)</summary>


```text
うるう年かどうかを判定するTypeScriptの関数 isLeapYear(year: number): boolean を書いてください。説明も日本語で簡潔に添えてください。

We need to write TypeScript function isLeapYear. Provide explanation in Japanese concise.

Probably simple.

Return (year %4===0 && year%100!==0) || year%400===0

Provide code.

Ensure formatting.

Probably provide example usage.

Output Japanese.

Let's comply.
```


</details>

It repeats the prompt word-for-word on line one, decides it's "Probably simple," jots down the boolean logic once, and calls it a day. No sanity checks, no edge cases, no double-takes.

Yet the resulting function was character-for-character identical across both models, right down to whitespace. Since the signature was handed to them and the conditional is a textbook one-liner, it's hardly a surprise they landed on the same code:

```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

The difference was purely in the presentation. Qwen slapped a JSDoc comment on top, while Muse Glimmer dropped just the bare-bones function. Their explanations parted ways too: Qwen wrote a two-sentence prose breakdown using 2000 and 1900 as examples, whereas Muse Glimmer broke the rules into a three-point bulleted list backed by three usage examples from `isLeapYear(2024)` to `isLeapYear(2000)`.

As far as the implementation went, a model that churned through 3,040 characters reached the exact same line of code as one that spent just 352. **For this prompt, the extra thinking didn't change the output itself, only the framing around it.**

## Bug Fixing Revealed a 15x Difference in Thought Logs

The fourth task was bug fixing. I gave each model a snippet containing two intentionally planted bugs involving leap-year logic and array indexing.

> The following TypeScript code has bugs. Find and fix all of them, and explain your changes in Japanese.

```typescript
/** month は 1〜12 で指定する */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && year % 4 === 0) {
    return 29;
  }
  return days[month];
}
```

Here are the two bugs I planted:

1. The leap-year check only used `year % 4 === 0`, ignoring the 100-year and 400-year rules.
2. Even though `month` is 1-indexed, it was passed straight to the 0-indexed array, so asking for January would return the number of days in February.

The thought log for `qwen3:30b-a3b` (`think=true`) clocked in at 11,955 characters. Considering the provided code was just 239 characters (excluding newlines), the model spent roughly 50 times the input length "thinking."

<details><summary>Excerpt from Qwen's Thought Log (11,955 characters total)</summary>


Before finally catching the off-by-one error, Qwen wrote out the month-to-index correspondence several times. After suspecting that `days[month]` was wrong in the very first paragraph, it broke it down like this:

```text
index 0: January (31)
index 1: February (28)
index 2: March (31)
...
index 11: December (31)

So for month 1 (January), the correct index is 0. So to access the correct
element, it should be days[month - 1].
```

Even though it had already reached the correct conclusion here, it kept second-guessing itself with paragraphs starting with "Wait,". Out of the 11,955 characters, 10 paragraphs began with "Wait," and the word showed up 20 times across the entire log. It revisited the scenario where `days[2]` returns 31 days (March) for a non-leap February a total of seven times, rewording it each time.

Toward the end, it debated twice whether it should validate if `month` falls between 1 and 12, landing on the same conclusion both times: "The prompt specifies 1-12, so this is out of scope." Finally, it drafted its Japanese explanation before producing the actual response.


</details>

Meanwhile, `muse-glimmer:30b` (`think=low`) produced a thought log of just 770 characters, roughly a sixteenth of Qwen's.

<details><summary>Full Thought Log from Muse Glimmer (770 characters)</summary>


```text
次のTypeScriptコードにはバグがあります。すべて見つけて修正し、日本語で説明してください。

/** month は 1〜12 で指定する */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && year % 4 === 0) {
    return 29;
  }
  return days[month];
}

We need find bugs and fix, explain in Japanese.

Bugs:
1. days[month] index off by one: month 1-12 but array 0-index. Should days[month-1]
2. leap year condition incorrect: year %4===0 only, need %400 and %100 rules. Also need check month===2.
Also if month===2 and leap, returns 29 but if not leap returns days[month] which is wrong index.

Also days array for Feb 28 default but if leap need 29.

Possibly also no validation.

Provide corrected code.

Explain.

Return in Japanese.
```

</details>
It opened by copy-pasting the prompt and code verbatim, listed the two numbered bugs, and spent a single line on the non-leap February execution path. That one throwaway line, "Possibly also no validation.", ended up directly inspiring the input validation logic in its final output.

**Both models spotted both planted bugs.** Their solutions were virtually identical in structure: branch off February first, and return `days[month - 1]` for everything else.

Interestingly, both models threw in unprompted additions of their own. Qwen provided a test-case verification table:

| Year | Month | Expected | Behaviour after fix |
| --- | --- | --- | --- |
| 2020 | 2 | 29 | Returns 29 via leap-year check |
| 1900 | 2 | 28 | Returns 28 (divisible by 100 but not by 400) |
| 2023 | 1 | 31 | Returns `days[0]` (31 days) |
| 2023 | 12 | 31 | Returns `days[11]` (31 days) |

Muse Glimmer opted to add argument validation, throwing an error whenever `month` fell outside 1-12:

```typescript
if (month < 1 || month > 12) {
  throw new Error('month は 1〜12 の範囲で指定してください');
}
```

These extras were a direct reflection of what went on in their thought logs. Qwen spent its internal monologue sanity-checking concrete years over and over, and that scratchpad work made its way straight into the final table. Muse Glimmer jotted down just a single line, "Possibly also no validation.", which expanded into three lines of exception-throwing code. Essentially, the model that thought long imported its verification steps, while the model that thought briefly imported an offhand idea.

For this test case only, after finishing the first draft, I ran Muse Glimmer once more at its default `high` setting. The thought log came out to 4,355 characters: 5.7x longer than `low` (770 characters), and roughly a third of Qwen's (11,955 characters). It took 647.9 seconds (10 minutes and 48 seconds) to respond.

<details><summary>Excerpt from Muse Glimmer's (high) Thought Log (4,355 characters total)</summary>


Much like in `low`, it kicked off by copying the prompt and code and listing the two bugs, then plugged in concrete months to trace how the code broke:

```text
Also currently if month===2 and leap, return 29, but also for non-leap Feb
returns days[2] = 31? Wait days[2] is 31? days[0]=31,1=28,2=31. So month=2
=> days[2]=31, wrong. Should be days[1]=28. Actually off by one.
```

"Wait" appeared only once in the entire 4,355 characters. The second half devolved into short checklist-style lines like "Provide final.", "Ok.", and "Let's deliver.", hashing out the same two points (the off-by-one index and the leap-year rule) over and over in slightly different words.


</details>

It flagged the exact same two bugs as `low`. The extra thinking time in `high` translated to three specific additions: a concrete example showing that passing 12 to `month` hits `days[12]` and returns `undefined`, a comment line underneath the array listing indices 0-11, and an alternative one-liner using `new Date(year, month, 0).getDate()`. It still tacked on input validation unprompted, though it upgraded the thrown exception from `Error` to `RangeError`.

When writing the initial draft, what I really wanted to find out was whether bumping the setting to `high` would prompt it to self-generate a verification table like Qwen's. It didn't. What Muse Glimmer added in `high` were concrete failure examples and an alternative solution, not a test suite verifying post-fix behaviour. In its thought log, it did test years 2000 and 1900, noting that "1900%4=0 returns 29 incorrectly," which also surfaced in the response as an example of 1900 being a common year falsely flagged as a leap year. But it never ran those years through the fixed implementation. In the end, setting it to `high` added more depth to the explanation, but did nothing to change the number of bugs caught.

## Asking for the Underlying Math Tripped Up the Longest Thought Log

Across the previous four tasks, Muse Glimmer's thought logs stayed short, between 352 and 770 characters. There are two ways to interpret this brevity: either the model understands the underlying logic well enough to be concise, or its knowledge is too superficial to flesh things out further. The first four benchmarks weren't enough to tell which was true.

To separate the two, I added a prompt asking for the mathematical rationale behind the leap-year rules. If its knowledge was skin-deep, it would stop at hand-wavy generalities like "to keep the calendar accurate." If it actually knew its stuff, it should be able to quote the length of a solar year down to the decimal point.

> In the Gregorian calendar, years divisible by 100 are excluded from being leap years, but years divisible by 400 are leap years after all. Explain why this rule is necessary, citing the numerical values behind it.

For this test, I ran Muse Glimmer on both `high` (default) and `low`, comparing three thought logs side by side with Qwen. Testing `high` here was meant to gauge whether locking Muse Glimmer to `low` in the earlier tasks had skewed the results.

### Muse Glimmer Nailed the Math on Both high and low

Running `muse-glimmer:30b` at its default `high` setting produced a 3,598-character thought log and took 613.8 seconds to respond, clocking in at 10 minutes and 14 seconds.

<details><summary>Excerpt from Muse Glimmer's (high) Thought Log (3,598 characters total)</summary>


After copying the prompt verbatim at the start, it methodically laid out the math: the exact length of a solar year, the drift against the Julian calendar, and the accumulated discrepancy over 400 years. It even grasped the crux of the 400-year rule while drafting, noting that dropping every century year leads to overcorrection:

```text
With 100 rule but not 400, average = 365 + 1/4 -1/100 = 365.24 = 365.24
days, error -0.00219 day/year ~ 1 day per 456 years, too much correction.

So need 400 rule to adjust.
```

The second half settled into terse checklist lines like "Provide final." and "Let's answer." It sanity-checked each number twice before transitioning to write the final response.


</details>

The final output threw in extra historical context I hadn't even asked for. Pinning the tropical year at 365.24219 days and the Julian average at 365.25 days, it calculated the difference as 0.00781 days/year and converted that to time: "about 11 minutes and 14 seconds per year." It calculated that it takes 128 years to slip by a full day, adding that over the 1,257 years between the Council of Nicaea (325 AD) and the Gregorian reform (1582), roughly 10 days of drift had accumulated, which is why 10 days were excised in 1582.

Explaining the 400-year rule, it pointed out that dropping every century year drops the calendar average to 365.24 days, overcorrecting by 0.00219 days/year. Reinstating years divisible by 400 balances this out to 97 leap days every 400 years. It wrapped up by noting that the residual drift shrinks to 0.00031 days/year (about 26 seconds/year), which takes roughly 3,200 years to drift by even a single day.

Running the exact same prompt on `low` yielded a thought log of just 519 characters with a response time of 227.5 seconds: one-seventh the length of `high` and just over a third of the wait time.

<details><summary>Full Thought Log from Muse Glimmer (low) (519 characters)</summary>


```text
グレゴリオ暦では、100で割り切れる年はうるう年から外し、さらに400で割り切れる年はうるう年に戻します。この規則がなぜ必要なのか、根拠となる数値を挙げて説明してください。

Explain why Gregorian calendar rule needed. Provide numbers.

Need tropical year ~365.2422 days. Julian 365.25 days. Difference 0.0078 days per year ~ 1 day per 128 years.

Calculate: Julian excess 0.0078 * 400 = 3.12 days. So need remove 3 leap days per 400 years.

Gregorian: 97 leap days per 400 years = 365*400+97 =146097 days. /400 =365.2425 days. Error 0.0003 days per year.

Explain.

Provide numbers.

Answer in Japanese.
```

</details>

Muse Glimmer's `low` response still covered all the essential numbers: a solar year of 365 days, 5 hours, 48 minutes, and 45 seconds (~365.2422 days); an annual discrepancy of 0.0078 days against the Julian calendar; 1 day of drift every 128 years; dropping 3 leap days every 400 years; and the Gregorian average of 365.2425 days. What `high` included that `low` left out was the unit conversion to 11 minutes and 14 seconds, the 1,257-year math starting from 325 AD, the note that the 100-year rule by itself overcorrects, and the residual drift of 26 seconds per year.

The two responses differed on only a single data point: the days of accumulated drift by 1582. `high` said 10 days, while `low` said 13. The total drift relative to the Julian calendar hinges on where you anchor your starting point. Measuring from the Council of Nicaea in 325 AD yields about 10 days, while going all the way back to the Julian calendar's inception in 45 BC gives you about 13 days. In the actual 1582 reform, 10 days were dropped (4 October was followed immediately by 15 October), but because 13 days is mathematically justifiable depending on the baseline, I'm not counting either as an outright error.

The goal here was to test whether Muse Glimmer's brevity was simply a mask for shallow knowledge. Even on `low`, it hit the solar year duration, the Julian drift, and the 3-day adjustment per 400 years right on the nose. Cranking the thinking level up to `high` added narrative depth, not factual accuracy. **Muse Glimmer gave short answers in the first four benchmarks simply because I told it to use `low`, not because it didn't know the material.**

### Qwen Had the Math Down, Until It Wrote the Response

`qwen3:30b-a3b` logged 7,011 characters of internal monologue, easily making it the longest trace in this round. Yet its response time was 184.4 seconds, the fastest of the three.

<details><summary>Excerpt from Qwen's Thought Log (7,011 characters total)</summary>


It broke the solar year (365 days, 5 hours, 48 minutes, 45 seconds) into individual units, converted each into fractional days, and summed them up to get 365.242186 days. It also verified why there are 97 leap years per 400-year cycle by manually walking through dropping years 100, 200, and 300 while keeping 400.

Its math on the Julian drift was sound in the scratchpad. Here is the exact passage where things later fell apart in the final text:

```text
So the difference is 365.25 - 365.242186 = 0.007814 days per year. So over
100 years, 0.7814 days, which is about 18 hours, so every 128 years, the
Julian calendar would be a day off.
```

0.007814 days a year, 0.7814 days per century, which is roughly 18 hours, and 1 day off every 128 years. All four numbers are correct.


</details>

Its final takeaway was accurate as well. It cited the solar year as 365.242186 days, pegged the Gregorian average at 365.2425 days, and built an unprompted comparison table tracking cumulative drift over 400 years (3.125 days for Julian vs. 0.1256 days for Gregorian).

The problem was that two factual errors crept into its Julian calendar breakdown, both in the very same paragraph:

| In the final response | Correct value |
| --- | --- |
| 0.007814 days is "about 18 hours" longer than a solar year | ~11 minutes and 14 seconds |
| "Drifts by roughly 7.8 days every 100 years" | ~0.78 days |

In the scratchpad, it had it right: "over 100 years, 0.7814 days, which is about 18 hours." But in the final output, those 18 hours got misattributed as the *annual* gap, and 0.7814 days shifted a decimal place to become 7.8 days. Out of two figures it calculated correctly during inference, "18 hours" drifted to the wrong line, and "0.7814 days" slipped by an order of magnitude.

Without the thought log, you would write off "about 18 hours" and "about 7.8 days" as simple arithmetic slip-ups. With the thought log, you can see that the model actually derived both numbers in the right context; it just bungled them during the handoff from scratchpad to final copy.

Ranked by log length, we have Qwen at 7,011 characters, Muse Glimmer (`high`) at 3,598 characters, and Muse Glimmer (`low`) at 519 characters. The only model that flubbed the unit conversions was Qwen, the one with the longest reasoning trace. Muse Glimmer nailed that exact conversion ("11 minutes and 14 seconds") on `high`, and skipped it altogether on `low`. With just one run per setup, this isn't enough to claim Qwen is bad at math or that Muse Glimmer is inherently more reliable. What these three runs do show is that the length of the thought log and the correctness of the answer didn't line up.

### Running Qwen Two More Times Broke Different Parts of the Logic

To see if the unit-conversion error was a fluke or a pattern, I ran the exact same prompt through Qwen twice more after wrapping up the first draft. The "18 hours" and "7.8 days" blunders never showed up again. Instead, a completely different detail broke each time. Here is a side-by-side look at what happened in the scratchpad versus what made it into the final output:

| Run | Thought Log | What it wrote in scratchpad | What made it into the response | Ground truth |
| --- | --- | --- | --- | --- |
| Run 1 | 7,011 chars | 0.7814 days / ~18 hrs per century | ~18 hrs / year; ~7.8 days / century | ~11 min 14 sec / year; ~0.78 days / century |
| Run 2 | 9,505 chars | Wrote "100 − 3 + 1 = 98?", reverted to "100 − 3 = 97" (did this 3 times) | Formula wrote "100 − 3 + 1", but stated result as 97 | 100 − 3 = 97 |
| Run 3 | 5,714 chars | "introduced by Julius Caesar" (no year mentioned) | 45 AD | 45 BC |

The final punchline (365.2425 days and 97 leap days every 400 years) was spot on in all three runs. What came unglued was always a supporting stepping stone along the way, failing in a different spot every time. In Runs 1 and 2, the model derived the right value internally, only to bungle it during the handoff to the final answer. In Run 3, the year never even appeared in the scratchpad; it surfaced for the first time while drafting the response, dropping the "BC" in transit.

There was another arithmetic mishap in Run 2's internal monologue that didn't make the table:

<details><summary>A Scratchpad Math Error in Run 2 That Didn't Leak Into the Final Output</summary>

When converting 5 hours, 48 minutes, and 45 seconds into days, it divided 48 minutes by `(60 × 60)` to get 0.0133 days, landing on a total of 365.2218 days. The correct denominator is `60 × 24`, which yields 0.0333 days. Seeing its own calculation, the model flagged it: "Wait, but I thought it was 365.2422." Instead of debugging the math, it simply hardcoded its memorised value of 365.24219 and moved on. Later, when recalculating the 97 leap days, it temporarily ran with 98, derived an average year of 365.245 days, realised it clashed with the number in its head, and re-counted. Neither faulty step survived the trip to the final response.

</details>

Runs 1 and 3 both converted the annual drift into clock time, but the only run that nailed "11 minutes and 14 seconds" was Run 3, the one with the shortest thought log. While three runs aren't enough to generalise Qwen's failure modes, **no link between a longer thought log and a more accurate answer showed up in these three runs.**

## Sizing Up the Thought Logs

Here is how the thought log lengths stacked up across all five tasks. For Qwen's self-introduction, the reasoning trace leaked straight into the final response, so output token count is listed instead. For Muse Glimmer, the first four tasks were run on `low`, with the fifth covering both `high` and `low`. Follow-up runs are shown separated by slashes.

| Task | qwen3:30b-a3b | muse-glimmer:30b (low) | muse-glimmer:30b (high) |
| --- | --- | --- | --- |
| Self-introduction | Leaked into output (584 tokens) | 0 / 0 / 0 (`think=false`) | N/A (no reasoning requested) |
| Developer & confidence | 3,710 | 709 / 894 / 721 | Skipped |
| Leap-year function | 3,040 | 352 | Skipped |
| Bug fixing | 11,955 | 770 | 4,355 |
| Calendar rationale | 7,011 / 9,505 / 5,714 | 519 | 3,598 |

Comparing Qwen to Muse Glimmer on `low`, Qwen was 5.2x longer on the developer question, 8.6x on the leap-year function, 15.5x on bug fixing, and 13.5x on the calendar rationale. But when Muse Glimmer was bumped to its default `high`, that gap narrowed significantly, down to 1.9x for the calendar rationale and 2.7x for bug fixing. Much of the massive delta in the first four benchmarks simply came down to my choosing `low`.

Running the same prompts three times in follow-up tests showed noticeable drift: thought logs varied between 709 and 894 characters for Muse Glimmer (`low`), and between 5,714 and 9,505 characters for Qwen. Any single data point needs to be read with that kind of run-to-run variance in mind.

Throughput and wall-clock times are summarised below. Token generation speed held essentially flat across all five tasks:

| Model & thinking level | Throughput | Wall-clock time (Calendar rationale) | Compute split |
| --- | --- | --- | --- |
| qwen3:30b-a3b | 29-30 tok/s | 184.4 s | MoE (3B active per token) |
| muse-glimmer:30b (low) | 2.8-3.0 tok/s | 227.5 s | 71% CPU / 29% GPU |
| muse-glimmer:30b (high) | 2.8 tok/s | 613.8 s | 71% CPU / 29% GPU |

Because Qwen compensated for its verbose thinking with fast generation, while Muse Glimmer (`low`) balanced short thinking with slow generation, total response times ended up surprisingly neck and neck. On the bug-fixing prompt, Qwen took 220 seconds versus Muse Glimmer's 310 seconds. On the calendar prompt, Qwen's 7,011-character trace took 184 seconds, while Muse Glimmer's 519-character run on `low` took 228 seconds. Crank Muse Glimmer up to `high`, however, and you are waiting 614 seconds, 3.3x longer than Qwen. Bug fixing on `high` took 648 seconds, roughly triple Qwen's wait time. My only reason for locking the first four benchmarks to `low` was to spare myself that crawl.

## Caveats and Apples-to-Oranges Factors

There are four key asymmetries in this setup that colour how these results should be interpreted:

- **Tiny sample size**

  Most tests were single-shot, with follow-ups capping out at three runs. Since temperature stayed at Muse Glimmer's default of 1.0, re-running a prompt naturally produces different trace lengths. Qwen's tendency to drop the ball somewhere on the calendar task is an interesting observation, but three runs aren't enough to predict specific failure patterns.

- **Mismatched thinking budgets**

  `qwen3:30b-a3b` has a single setting, `think=true`, with no way to turn thinking off. `muse-glimmer:30b` has a 5-tier dial that defaults to `high`, but I throttled it to `low` for the first four tasks purely because waiting at 2.9 tok/s was painful.

- **Speed differences came down to architecture, not intelligence**

  `qwen3:30b-a3b` is an MoE model, routing only 3B parameters per token out of its 30B total. `muse-glimmer:30b` is a 27.9B dense model whose footprint couldn't squeeze into 8GB of VRAM, running 71% of the model on the CPU to produce that 2.9 tok/s crawl. That 10x throughput gap is entirely about the amount of compute and where it runs, not smarts. Drop it onto a GPU with 24GB of VRAM, and Muse Glimmer would run faster than the figures here.

- **Both are quantised, lightweight models**

  Both ran as Q4_K_M quants. Muse Glimmer 30B is a lightweight spin-off of Muse Spark Open, just as Qwen3 30B-A3B sits on the lightweight end of the Qwen family. These observations describe the quirks of two quantised local checkpoints running on limited hardware, not the foundational capabilities of Meta's or Alibaba's flagship frontier models. Hallucinating the developer in the self-introduction was a hiccup of this specific quantised 30B build, not a verdict on Meta's models as a whole.

## Wrapping Up

After running 18 test passes across five prompts, here are the four biggest takeaways. Keep in mind that with only one to three runs per configuration, these are qualitative field notes rather than statistically rigorous benchmarks.

- **Dialling up the thinking budget didn't move the needle on correctness**

  Setting Muse Glimmer to `high` stretched its thought log by 6-7x compared to `low`. All that extra runway bought was more narrative padding; factual accuracy and bug detection rates didn't budge.

- **Longer traces didn't mean better answers**

  On the leap-year function, a 3,040-character trace and a 352-character trace converged on the exact same one-liner. On bug fixing, 11,955 characters and 770 characters caught the exact same two bugs. (The self-introduction and developer prompts are omitted here, as those hinge on what the model knows rather than on reasoning.)

- **Qwen's math fell apart in the handoff**

  Equations and numbers derived cleanly inside Qwen's internal scratchpad mutated the moment it transitioned to writing the final response. Across all three runs on the calendar task, the model nailed the bottom-line conclusion, but dropped the ball on a different intermediate stepping stone each time.

- **Qwen3 refuses to turn off its brain**

  Passing `think: false` to `qwen3:30b-a3b` didn't actually disable reasoning. Instead, the model dumped its entire internal monologue straight into the response stream alongside the `</think>` token. If you plan to wire this model into a pipeline, you'll need to write logic to strip out everything before that closing tag.

Without looking at the thought log, it would be easy to dismiss Qwen's "~18 hours" blunder as a run-of-the-mill arithmetic slip. With the log, you can see the model actually had the right answer in its head; it just bungled the copy-paste job into the final draft. **Peeking into thought logs doesn't tell you how correct an answer is; it tells you the exact point of failure.**

## References

- [Muse Glimmer (Hugging Face, meta-models)](https://huggingface.co/meta-models)
- [Qwen (Hugging Face)](https://huggingface.co/Qwen)
- [Ollama API Documentation (Configuring thinking parameters)](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Gregorian calendar (Wikipedia: The 1582 10-day adjustment and Julian drift)](https://en.wikipedia.org/wiki/Gregorian_calendar)
- [The Full Story: The Evolution of Tongyi, Qianwen, Qwen, and Qwen Chat (Tencent News, Nov 2025, in Chinese; branding and organisational background)](https://news.qq.com/rain/a/20251117A02VDU00)
- [Alibaba Consolidates AI Efforts Into New Token Hub Unit (Caixin Global, Mar 2026; Reorganising Tongyi Lab out of Alibaba Cloud)](https://www.caixinglobal.com/2026-03-17/alibaba-consolidates-ai-efforts-into-new-token-hub-unit-102423668.html)
- [Alibaba Overhauls LLM Unit, Forms Token Foundry Division (Yicai, Jun 2026, in Chinese)](https://www.yicai.com/news/103220442.html)
- [Choosing a Local LLM Through Fate (2026 Edition) (this site)](https://akari-iku.github.io/en/blog/fate-local-llm/)
- [I Squeezed a 27B Into 1-bit on 8GB of VRAM. The 8B at 4-bit Won Anyway (this site)](https://akari-iku.github.io/en/blog/qwen38-27b-8gb-vram/)
