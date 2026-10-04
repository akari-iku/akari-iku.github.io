---
title: Hands-On with Cloudflare's Decision Model Clef on Workers AI
description: >-
  I called Cloudflare's decision models Clef and Clef-flash from Workers AI and
  tested Japanese input, out-of-scope queries, multi-intent messages, and
  images. How accurate the decisions were depended heavily on how I designed the
  options and questions.
date: '2026-10-04'
tags:
  - cloudflare
  - workers
  - llm
  - api
lang: en
pair: clef-decision-models
source: dev
accent: '#E5007F'
---

<!-- generated from articles/source/en/2026-10-04-clef-decision-models.md by scripts/import-articles.ts - do not edit -->

## Introduction

On 1 October 2026, Cloudflare introduced "Clef" and "Clef-flash": two models built specifically for decision-making tasks.
This post shares my findings from running a few quick experiments with both models on Workers AI.

You can find the official announcement and documentation below:

- Announcement post: [Introducing Clef: our open-source decision models, and new RL fine-tuning platform](https://blog.cloudflare.com/clef-decision-models/)
- Workers AI model pages: [Clef](https://developers.cloudflare.com/workers-ai/models/clef/) / [Clef-flash](https://developers.cloudflare.com/workers-ai/models/clef-flash/)
- Hugging Face: [Cloudflare/clef](https://huggingface.co/Cloudflare/clef) / [Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash)

A few caveats before diving in:

- All experiments were run on Workers AI on 4 October 2026.
- All customer queries and images used here are purely fictional.
- Sample sizes were small (around five test cases per experiment). The goal was to spot general trends, not to run an accuracy benchmark.

## What Is Clef?

Clef is designed to analyse text or images and pick an answer from a predefined set of choices.
It doesn't generate open-ended text.
Instead, it returns a probability for each of your options.

| | Clef | Clef-flash |
| --- | --- | --- |
| Model ID | `@cf/cloudflare/clef` | `@cf/cloudflare/clef-flash` |
| Base Model | Qwen3.8-27B | Qwen3.5-9B |
| Pricing (per 1M input tokens) | $0.24 | $0.09 |
| Context Length | 65,536 tokens | 65,536 tokens |
| Official Latency (Median) | 209.3 ms | 38.8 ms |

Here is how Clef works under the hood:

1. The base model reads the entire input in a single pass (prefill).
2. A small head added on top of the base model scores each choice in parallel.

The base model's weights remain frozen; only the head and LoRA layers were updated during training.

Clef supports three question formats:

| Format | Use Case | Output |
| --- | --- | --- |
| `noul` | Yes/No questions | Probability of "yes" |
| `choice` | Multiple choice (picking 1 from 2 to 255 options) | Selected option, probability per option, and `confidence` score |
| `score` | Rating scales (2 to 10 levels) | Probability-weighted expected score and per-level probabilities |

## Calling the API

You can query Clef by sending a POST request to the Workers AI REST API.
API tokens can be created from the Cloudflare dashboard using the "Workers AI" template.

```bash
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/cloudflare/clef-flash \
  -H "Authorization: Bearer $CLOUDFLARE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @request.json
```

Here is an example `request.json`.
Pass the input text in `state`, and define your questions in `questions`.

```json
{
  "model": "clef-flash",
  "state": "I ordered a blue mug last week, but a red one arrived. Can I exchange it?",
  "questions": {
    "is_complaint": {
      "type": "noul",
      "instructions": "Is the customer reporting a problem with their order?"
    },
    "topic": {
      "type": "choice",
      "instructions": "Which team should handle this message?",
      "criteria": {
        "shipping": "Delivery delays or tracking",
        "returns": "Returns, exchanges, or wrong items",
        "billing": "Payments, refunds, or invoices"
      }
    }
  }
}
```

And the response:

```json
{
  "result": {
    "model": "clef-flash",
    "answers": {
      "is_complaint": { "type": "noul", "noul": 0.9266 },
      "topic": {
        "type": "choice",
        "choice": "returns",
        "probabilities": { "shipping": 0.0019, "returns": 0.9956, "billing": 0.0025 },
        "confidence": 0.9869
      }
    },
    "usage": { "input_tokens": 262, "output_tokens": 0 }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

A few quirks of the API specification worth noting:

- On Workers AI, providing `instructions` for each question is mandatory (even though the Hugging Face model card says it can be omitted).
- You can attach up to 4 images as base64-encoded strings (PNG, JPEG, or WebP). Remote URLs are not supported.
- `output_tokens` was 0 in all 32 requests where I checked the response. The price list, too, only gives a price per input token.

## What I Tested

I set up a common support-ticket triage scenario: routing incoming e-commerce inquiries to one of three teams: **shipping**, **returns**, or **billing**.
The collapsible sections in each part contain the full results.

<details><summary>The question used throughout (choice)</summary>


English version:

```json
{
  "type": "choice",
  "instructions": "Which team should handle this message?",
  "criteria": {
    "shipping": "Delivery delays or tracking",
    "returns": "Returns, exchanges, or wrong items",
    "billing": "Payments, refunds, or invoices"
  }
}
```

Japanese version:

```json
{
  "type": "choice",
  "instructions": "このメッセージはどの担当チームが対応すべきですか。",
  "criteria": {
    "shipping": "配送の遅れや追跡",
    "returns": "返品、交換、注文と違う商品",
    "billing": "支払い、返金、請求書"
  }
}
```

(The Japanese version says the same thing as the English one.)


</details>

### Handling Japanese Inquiries

I tested five sample inquiries under three setups:

- Both the inquiry and questions in English
- The inquiry in Japanese, but questions in English
- Both the inquiry and questions in Japanese

In all 30 runs across Clef and Clef-flash, both models routed every ticket to the expected team.
Input tokens ranged from 165 to 183, with virtually no difference between languages.

That said, confidence scores did shift for one case.
For the inquiry *"I returned an item, but the refund hasn't reached my account yet."*, Clef-flash scored **billing** at 0.777 in English, but between 0.917 and 0.949 when given the Japanese version.

Because I drafted the Japanese and English texts independently, the phrasing wasn't an exact match.
I haven't isolated whether this difference came down to phrasing or to the model itself.

<details><summary>The customer messages</summary>


| # | Japanese | English | Expected |
| --- | --- | --- | --- |
| 1 | 青いマグを注文したのに、赤いマグが届きました。交換できますか。 | I ordered a blue mug, but a red one arrived. Can I exchange it? | returns |
| 2 | 注文から10日たっても届きません。今どこにありますか。 | It's been 10 days since I ordered and it still hasn't arrived. Where is it? | shipping |
| 3 | 同じ注文の代金が2回引き落とされています。 | I was charged twice for the same order. | billing |
| 4 | サイズが合わなかったので返品したいです。送料はかかりますか。 | The size didn't fit, so I'd like to return it. Do I have to pay for shipping? | returns |
| 5 | 返品した商品の返金がまだ口座に入っていません。 | I returned an item, but the refund hasn't reached my account yet. | billing |

I designed 4 and 5 to sit between two teams.


</details>

<details><summary>Full results (Clef-flash)</summary>


Conditions are written as "message language / question language" (EN = English, JA = Japanese).

| # | Condition | Chosen team | shipping | returns | billing | Input tokens |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | EN/EN | returns | 0.001 | 0.998 | 0.002 | 173 |
| 1 | JA/EN | returns | 0.001 | 0.997 | 0.002 | 174 |
| 1 | JA/JA | returns | 0.003 | 0.993 | 0.004 | 183 |
| 2 | EN/EN | shipping | 0.993 | 0.004 | 0.003 | 177 |
| 2 | JA/EN | shipping | 0.996 | 0.002 | 0.002 | 172 |
| 2 | JA/JA | shipping | 0.995 | 0.003 | 0.002 | 181 |
| 3 | EN/EN | billing | 0.015 | 0.043 | 0.942 | 165 |
| 3 | JA/EN | billing | 0.013 | 0.024 | 0.963 | 167 |
| 3 | JA/JA | billing | 0.012 | 0.024 | 0.964 | 176 |
| 4 | EN/EN | returns | 0.002 | 0.983 | 0.015 | 178 |
| 4 | JA/EN | returns | 0.002 | 0.977 | 0.021 | 170 |
| 4 | JA/JA | returns | 0.003 | 0.967 | 0.030 | 179 |
| 5 | EN/EN | billing | 0.016 | 0.207 | 0.777 | 171 |
| 5 | JA/EN | billing | 0.009 | 0.074 | 0.917 | 166 |
| 5 | JA/JA | billing | 0.008 | 0.043 | 0.949 | 175 |


</details>

<details><summary>Full results (Clef)</summary>


Input token counts were the same as for Clef-flash.

| # | Condition | Chosen team | shipping | returns | billing |
| --- | --- | --- | --- | --- | --- |
| 1 | EN/EN | returns | 0.002 | 0.997 | 0.002 |
| 1 | JA/EN | returns | 0.002 | 0.996 | 0.002 |
| 1 | JA/JA | returns | 0.002 | 0.995 | 0.003 |
| 2 | EN/EN | shipping | 0.993 | 0.003 | 0.004 |
| 2 | JA/EN | shipping | 0.993 | 0.003 | 0.004 |
| 2 | JA/JA | shipping | 0.992 | 0.004 | 0.004 |
| 3 | EN/EN | billing | 0.004 | 0.004 | 0.991 |
| 3 | JA/EN | billing | 0.005 | 0.005 | 0.990 |
| 3 | JA/JA | billing | 0.005 | 0.006 | 0.988 |
| 4 | EN/EN | returns | 0.004 | 0.989 | 0.007 |
| 4 | JA/EN | returns | 0.003 | 0.973 | 0.024 |
| 4 | JA/JA | returns | 0.004 | 0.983 | 0.013 |
| 5 | EN/EN | billing | 0.006 | 0.086 | 0.908 |
| 5 | JA/EN | billing | 0.004 | 0.029 | 0.967 |
| 5 | JA/JA | billing | 0.004 | 0.021 | 0.975 |


</details>

### Does Option Ordering Matter?

I shuffled the order of options defined in `criteria` across four requests.
In all four runs, the returned probabilities matched to the fourth decimal place.

In the inference code published on Hugging Face, options are sorted by option ID as strings before being passed to the model.
Workers AI likely follows the same logic.
Sending the exact same input again some time later also returned the same values to four decimal places.

<details><summary>Full results (Clef-flash)</summary>


I used the ambiguous message "I returned an item, but the refund hasn't reached my account yet."

| Order in `criteria` | billing | returns | shipping |
| --- | --- | --- | --- |
| shipping, returns, billing | 0.7772 | 0.2066 | 0.0162 |
| shipping, returns, billing (second run) | 0.7772 | 0.2066 | 0.0162 |
| billing, returns, shipping | 0.7772 | 0.2066 | 0.0162 |
| returns, billing, shipping | 0.7772 | 0.2066 | 0.0162 |


</details>

### Handling Out-of-Scope Queries

Next, I fed the model three inquiries that had nothing to do with the three teams: *"Store opening hours"*, *"Job applications"*, and *"How to brew coffee"*.

| Query | Clef-flash: Without `other` | Clef-flash: With `other` |
| --- | --- | --- |
| Store opening hours | returns (0.454) | other (0.961) |
| Job applications | billing (0.595) | other (0.989) |
| How to brew coffee | returns (0.415) | other (0.997) |

Without an `other` bucket, Clef put each query into one of the existing teams.
The model does not provide a "none of the above" option on its own.
Once I explicitly added an `other` option, all three queries were routed to `other`.
Adding this fallback barely changed the results for in-scope queries.

When `other` was missing, the `confidence` score for out-of-scope queries dropped to between 0.02 and 0.16, whereas in-scope queries scored 0.89 or higher.
This suggests you might also be able to flag out-of-scope requests by setting a threshold on `confidence`.

<details><summary>Full results</summary>


Messages were sent in Japanese, with the question in English.
The description for `other` was "Anything not covered by the options above".
The two in-scope messages are the same as messages 1 and 3 in the Japanese experiment.

The messages as sent (English translations for readability):

| Message as sent | English |
| --- | --- |
| 実店舗の営業時間を教えてください。 | Please tell me the opening hours of your physical shop. |
| 御社の求人に応募したいのですが、どこから申し込めますか。 | I'd like to apply for a job at your company. Where do I apply? |
| コーヒーをおいしく淹れるコツはありますか。 | Any tips for brewing good coffee? |

Clef-flash:

| Message | `other` | Chosen team | billing | other | returns | shipping | confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Wrong colour mug arrived | no | returns | 0.002 | - | 0.997 | 0.001 | 0.991 |
| Charged twice | no | billing | 0.963 | - | 0.024 | 0.013 | 0.891 |
| Store opening hours | no | returns | 0.432 | - | 0.454 | 0.114 | 0.109 |
| Job applications | no | billing | 0.595 | - | 0.234 | 0.172 | 0.156 |
| How to brew coffee | no | returns | 0.327 | - | 0.415 | 0.258 | 0.019 |
| Wrong colour mug arrived | yes | returns | 0.002 | 0.002 | 0.996 | 0.001 | 0.989 |
| Charged twice | yes | billing | 0.939 | 0.028 | 0.021 | 0.012 | 0.843 |
| Store opening hours | yes | other | 0.021 | 0.961 | 0.012 | 0.006 | 0.899 |
| Job applications | yes | other | 0.006 | 0.989 | 0.003 | 0.002 | 0.971 |
| How to brew coffee | yes | other | 0.001 | 0.997 | 0.001 | 0.001 | 0.991 |

Clef:

| Message | `other` | Chosen team | billing | other | returns | shipping | confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Wrong colour mug arrived | no | returns | 0.002 | - | 0.996 | 0.002 | 0.989 |
| Charged twice | no | billing | 0.990 | - | 0.005 | 0.005 | 0.970 |
| Store opening hours | no | billing | 0.462 | - | 0.335 | 0.203 | 0.050 |
| Job applications | no | billing | 0.546 | - | 0.336 | 0.117 | 0.138 |
| How to brew coffee | no | billing | 0.459 | - | 0.284 | 0.257 | 0.036 |
| Wrong colour mug arrived | yes | returns | 0.002 | 0.003 | 0.994 | 0.002 | 0.983 |
| Charged twice | yes | billing | 0.974 | 0.017 | 0.004 | 0.004 | 0.933 |
| Store opening hours | yes | other | 0.005 | 0.987 | 0.004 | 0.004 | 0.966 |
| Job applications | yes | other | 0.005 | 0.989 | 0.004 | 0.003 | 0.970 |
| How to brew coffee | yes | other | 0.005 | 0.986 | 0.005 | 0.004 | 0.963 |


</details>

### Handling Multi-Intent Queries

In real-world support, customers sometimes pack several requests into a single message.
I compared two approaches: using a single `choice` question to pick a team, versus asking one `noul` question per team (*"Does this message contain a request for this team?"*).

The table below shows the probability of "yes" from `noul`:

| Inquiry | Clef-flash | Clef |
| --- | --- | --- |
| Wrong mug colour delivered + charged twice | returns 0.923 / billing 0.756 | returns 0.961 / billing 0.952 |
| Order hasn't arrived + need to change invoice name | shipping 0.917 / billing 0.953 | shipping 0.972 / billing 0.963 |
| 1st parcel missing + 2nd parcel broken + coupon didn't apply | returns 0.947 / billing 0.721 / shipping 0.181 | returns 0.965 / billing 0.674 / shipping 0.935 |

Because `choice` probabilities must sum to 1, multi-intent inquiries split the probability across teams; sometimes only one of the teams was picked.
In contrast, `noul` treats each team independently, so it could pick up several requests at once.

However, when presented with three intents at once, Clef-flash missed the shipping request (0.181), whereas full-sized Clef caught it (0.935).

<details><summary>Full results</summary>


Messages were in Japanese, questions in English.
I sent one `choice` question and three `noul` questions together in a single request.
The `noul` question read: "Does this message contain a request for the {team} team ({team description})?"

| # | Message as sent | English | Expected |
| --- | --- | --- | --- |
| 1 | 青いマグを注文したのに、赤いマグが届きました。交換できますか。 | I ordered a blue mug, but a red one arrived. Can I exchange it? | returns |
| 2 | 青いマグを注文したのに、赤いマグが届きました。しかも代金が2回引き落とされています。 | I ordered a blue mug, but a red one arrived. On top of that, I've been charged twice. | returns + billing |
| 3 | 注文から10日たっても届きません。それと、請求書の宛名を会社名に変えてもらえますか。 | It's been 10 days since I ordered and it still hasn't arrived. Also, could you change the name on the invoice to my company's name? | shipping + billing |
| 4 | 1つ目の荷物はまだ届いていません。2つ目は割れていたので返品したいです。あと、クーポンが適用されていない気がします。 | The first parcel still hasn't arrived. The second was broken, so I'd like to return it. Also, I don't think my coupon was applied. | shipping + returns + billing |

Clef-flash:

| # | choice: billing | choice: returns | choice: shipping | noul: billing | noul: returns | noul: shipping |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.003 | 0.995 | 0.002 | 0.007 | 0.961 | 0.055 |
| 2 | 0.072 | 0.919 | 0.009 | 0.756 | 0.923 | 0.043 |
| 3 | 0.466 | 0.050 | 0.484 | 0.953 | 0.009 | 0.917 |
| 4 | 0.290 | 0.677 | 0.033 | 0.721 | 0.947 | 0.181 |

Clef:

| # | choice: billing | choice: returns | choice: shipping | noul: billing | noul: returns | noul: shipping |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.002 | 0.997 | 0.001 | 0.003 | 0.989 | 0.006 |
| 2 | 0.111 | 0.879 | 0.009 | 0.952 | 0.961 | 0.009 |
| 3 | 0.196 | 0.018 | 0.786 | 0.963 | 0.007 | 0.972 |
| 4 | 0.154 | 0.717 | 0.129 | 0.674 | 0.965 | 0.935 |


</details>

### Image Classification

I made six mug illustrations to see how well the models could judge the condition of a delivered item.
The accompanying message was: *"I ordered a blue mug. Here is a photo of what arrived."* (sent in Japanese).
To simulate imperfect real-world uploads, I added motion blur, double exposure, tilt, dim lighting, and noise.

| Image | Expected Category | Clef-flash | Clef |
| --- | --- | --- | --- |
| Blue / Intact | As ordered | As ordered (0.899) | As ordered (0.951) |
| Blue / Blurred | As ordered | As ordered (0.897) | As ordered (0.933) |
| Red / Intact | Wrong colour | Wrong colour (0.974) | Wrong colour (0.989) |
| Red / Blurred | Wrong colour | Wrong colour (0.972) | Wrong colour (0.989) |
| Cracked / Intact | Damaged | As ordered (0.873) | Damaged (0.971) |
| Cracked / Blurred | Damaged | As ordered (0.795) | Damaged (0.486) / As ordered (0.460) |

Both models identified the colour mismatch, even with blur.
However, Clef-flash missed the small crack and chip, even on the clean image.
Full-sized Clef also faltered on the blurred image, splitting its score nearly 50/50 between "Damaged" and "As ordered".

Take these findings with a grain of salt: these tests used flat illustrations rather than real photos, and I only tested a single blur intensity.
For how accurately it judges images, please look to people who specialise in image work.

<details><summary>Full results</summary>


The images were 512×512 pixel PNGs.
Input tokens were 456 for every image.

The question I used:

```json
{
  "type": "choice",
  "instructions": "Based on the photo, what is the condition of the delivered item compared with the order?",
  "criteria": {
    "as_ordered": "The item matches the order and is undamaged",
    "wrong_item": "A different item or a different color than ordered arrived",
    "damaged": "The item is broken, cracked, or damaged"
  }
}
```

Clef-flash:

| Image | Chosen condition | as_ordered | damaged | wrong_item | confidence |
| --- | --- | --- | --- | --- | --- |
| Blue / Intact | as_ordered | 0.899 | 0.028 | 0.073 | 0.722 |
| Blue / Blurred | as_ordered | 0.897 | 0.054 | 0.049 | 0.714 |
| Red / Intact | wrong_item | 0.013 | 0.013 | 0.974 | 0.923 |
| Red / Blurred | wrong_item | 0.014 | 0.014 | 0.972 | 0.919 |
| Cracked / Intact | as_ordered | 0.873 | 0.033 | 0.095 | 0.658 |
| Cracked / Blurred | as_ordered | 0.795 | 0.135 | 0.070 | 0.483 |

Clef:

| Image | Chosen condition | as_ordered | damaged | wrong_item | confidence |
| --- | --- | --- | --- | --- | --- |
| Blue / Intact | as_ordered | 0.951 | 0.022 | 0.027 | 0.859 |
| Blue / Blurred | as_ordered | 0.933 | 0.033 | 0.034 | 0.808 |
| Red / Intact | wrong_item | 0.006 | 0.005 | 0.989 | 0.967 |
| Red / Blurred | wrong_item | 0.005 | 0.005 | 0.989 | 0.968 |
| Cracked / Intact | damaged | 0.021 | 0.971 | 0.008 | 0.914 |
| Cracked / Blurred | damaged | 0.460 | 0.486 | 0.054 | 0.176 |


</details>

### Latency: Clef vs. Clef-flash

Across the 15 requests sent during the Japanese experiment, median round-trip times were **166 ms** for Clef-flash and **406 ms** for Clef.
Keep in mind that these numbers include network transit from Japan to Cloudflare's infrastructure.
The gap between the two models was roughly 240 ms, close to the gap between Cloudflare's official medians (about 170 ms).

<details><summary>Full round-trip times (ms)</summary>


The 15 requests from the Japanese experiment, in the order they were sent.

| # | Condition | Clef-flash | Clef |
| --- | --- | --- | --- |
| 1 | EN/EN | 688 | 664 |
| 1 | JA/EN | 542 | 415 |
| 1 | JA/JA | 166 | 528 |
| 2 | EN/EN | 143 | 517 |
| 2 | JA/EN | 128 | 454 |
| 2 | JA/JA | 125 | 397 |
| 3 | EN/EN | 177 | 815 |
| 3 | JA/EN | 166 | 499 |
| 3 | JA/JA | 327 | 380 |
| 4 | EN/EN | 541 | 375 |
| 4 | JA/EN | 141 | 240 |
| 4 | JA/JA | 137 | 373 |
| 5 | EN/EN | 134 | 290 |
| 5 | JA/EN | 144 | 316 |
| 5 | JA/JA | 558 | 406 |


</details>

## What Worked Well

- For straightforward triage, even Clef-flash returned high-probability results in a short time.
- Because it returns probabilities rather than generated text, you can set your own decision thresholds on the client side.
- Japanese queries performed on par with English, with virtually no token penalty.
- You can bundle multiple questions into a single request. Stacking `noul` checks lets you evaluate multiple intents in one call.
- The inference code is public on Hugging Face. I could read it to confirm things the docs don't cover, such as the input order and how long inputs get cut. It saved me from actually sending a huge input to test that, which was a real help.

## Considerations

With Clef, your option and question design matters about as much as the model's accuracy.
I noticed a similar dynamic when experimenting with Jev; I think it's a trait shared by decision-type models in general.

Here are four key design considerations:

- **Out-of-scope traffic:** Clef will always commit to an answer. You need to either supply an explicit `other` option or set a threshold on `confidence`.
- **Multi-intent inputs:** `choice` can only return a single winner. If user messages could touch on multiple topics, use one `noul` check per team instead. Keep in mind that Clef-flash sometimes missed a request when several were packed together.
- **Long inputs and context limits:** In the published inference code, inputs exceeding the context limit are truncated from the tail of `state`. If you pass chat logs oldest-first, the most recent messages are the ones that get cut off. (I haven't verified whether Workers AI uses the same truncation logic.)
- **Choosing between Clef and Clef-flash:** Within what I tested, Clef-flash was enough for simple routing. For multi-intent detection or fine details in images, full-sized Clef missed less. You will want to check against your own data to see where the line falls.

If you are planning to roll this out into production, I think you would need to:

1. Label data that resembles your real customer tickets with the correct team and compare the model's decisions against it, paying attention to misses per team on multi-intent tickets.
2. Log whenever a human agent overrides an automated routing decision, then use those cases to refine your option descriptions and thresholds.

## Implementation Gotchas

I had Claude Code write the experiment scripts.
This section collects the points where Claude Code got tripped up during implementation, and the points it was careful about after reading the spec and the inference code.
Use it as a reference when writing code that calls Clef (including when you have an AI write it).

### Check Unclear Spec Points Against the Published Inference Code

Neither the blog nor the model card says how the input is ordered, or which end gets cut when the input is too long.
The Hugging Face repository publishes the inference code (`joint_schema_model.py`).
Claude Code read it and found the following:

- The model input is ordered as: system prompt, images, `state`, then questions and options
- When the input exceeds the limit, the end of `state` is cut off
- `choice` options are sorted by ID as strings

Because the code already showed that options are sorted, the "does option ordering matter?" experiment only needed one run to confirm Workers AI does the same.
In the points below, I note where a claim is based on the inference code.

### Workers AI and the Model Card Disagree on the Spec

The Hugging Face model card and the Workers AI input schema differ in places.
Clef has only just been announced, so its spec isn't in any AI's training data.
Read the Workers AI input schema (`schema-input.json`) before you write any code.

| Item | Model card | Workers AI |
| --- | --- | --- |
| `instructions` | Optional | Required for every question |
| How to pass images | PIL images | base64 only (no URLs) |
| Video | Supported | Not in the schema |
| Input length limit | `max_length` default 16,384 | 65,536 tokens |

Even though the URL already specifies the model, the request body still needs `"model": "clef-flash"`.

### Images: PNG, JPEG, or WebP Only

Pass images either as `{ "content_type": "image/png", "base64": "..." }` or as `data:image/png;base64,...`.
SVG isn't accepted.
I'd drawn the illustrations as SVG, so I took screenshots with headless Chrome to convert them to PNG before sending.

### Option IDs Are Model Input Too

In the inference code, each `choice` option is passed to the model as a JSON string like `{"description":"...","option_id":"returns"}`.
In other words, the model reads the option ID string alongside the description.

That suggests meaningful English words like `returns` are a safer bet than meaningless IDs like `a` / `b` / `c`.
This comes from reading the inference code; I didn't run an experiment comparing different IDs.

Options are sorted by ID as strings before they reach the model.
The order you write them in `criteria` doesn't affect the result.

### Passing an Object as `state` Sorts Its Keys

`state` can be a string, an object, or an array.
In the inference code, objects are turned into strings with `json.dumps(sort_keys=True, ensure_ascii=False)`.
Keys are sorted alphabetically, so you can't make key order carry any meaning.
Because of `ensure_ascii=False`, Japanese isn't escaped into `\u` sequences; it goes in as the actual characters.

### `state` Gets Cut From the End

In the inference code, when the input exceeds the limit, the end of `state` is cut off.
Questions and options are never cut; if they alone exceed the limit, you get an error.
When putting a chat log in `state`, either put the newest messages first or trim the length beforehand.
I haven't checked whether Workers AI behaves the same way.

### Questions in the Same Request May Affect Each Other

The system prompt in the inference code says "Decide every field jointly".
If you put several questions in one request, their decisions may influence each other.
If you want to compare accuracy per question precisely, sending each question as a separate request is the safer option.

### Handling the Response Values

- Probabilities come back rounded to four decimal places.
- `usage.output_tokens` was 0 in all 32 requests where I checked the response.
- How `confidence` is calculated isn't published. It gets lower as the probabilities get closer to even, but it's a different value from the highest probability. If you use it as a threshold, check its distribution on your own data.
- `choice` always returns one of the options, even for input that fits none of them.

## Conclusion

Clef is a tool for sorting text and images into options you define, returning fast, probability-backed answers.
In my testing, Japanese queries were judged about as well as English ones.

That said, how well the model handles out-of-scope inputs or multi-intent tickets largely comes down to how carefully you design your options and questions.
If you are evaluating Clef for production, I think testing against labelled data of your own before deciding is the way to go.

## References

- Announcement post: <https://blog.cloudflare.com/clef-decision-models/>
- Workers AI: <https://developers.cloudflare.com/workers-ai/models/clef/> / <https://developers.cloudflare.com/workers-ai/models/clef-flash/>
- Hugging Face: <https://huggingface.co/Cloudflare/clef> / <https://huggingface.co/Cloudflare/clef-flash>
