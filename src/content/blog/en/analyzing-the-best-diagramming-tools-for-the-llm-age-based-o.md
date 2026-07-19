---
title: Analyzing the Best Diagramming Tools for the LLM Age Based on Token Efficiency
description: >-
  What is everyone using!? The Diagram Tool Wars in the LLM Era            Our
  Shared...
date: '2025-10-21'
tags:
  - mermaid
  - tokenefficiency
  - devops
  - llm
lang: en
pair: token-efficiency-diagramming
source: dev
accent: '#00B06B'
---

<!-- generated from articles/dev/2025-10-21-analyzing-the-best-diagramming-tools-for-the-llm-age-based-o.md by scripts/import-articles.ts - do not edit -->

## What is everyone using!? The Diagram Tool Wars in the LLM Era

### Our Shared Frustration

Greetings from Japan. Let's be honest. Every time I draw a diagram with Mermaid, I secretly pray to the coding gods, **"Please, don't let the lines cross."** It's no longer a technical challenge, but more like a game of chance. To put an end to this personal ordeal and find a better, data-driven solution, let's start a discussion.

When documenting, what are people honestly using to draw diagrams!? Mermaid? PlantUML? Or are you still firing up draw.io in the end? **Come on, tell me honestly! Tell me!!**
Oh, you use them differently, I see...
And the conversation doesn't end there. As a developer (tentative). I don't know, but I feel like that kind of sentiment is important.

The common challenge developers face is always the trade-off between **"ease of use"** and **"freedom of expression."**
We want to make things easy, right...?

- **Mermaid.js:** Its ease of use is divine. It works on GitHub and Zenn. But doesn't it get frustrating when complexity arises, with lines crossing and limited freedom in node placement? Is it just my short temper?
- **draw.io (XML):** Its functionality is top-notch. You can draw the ideal diagram. But if you put it in Git, the diffs are hell. Above all, it's slow to start up... I'm sure PC specs play some part, but for existing files, some of them, I swear, I've gone to the restroom, come back, and it's still struggling to open... Does that happen to anyone else?

In fact, in the Zenn community (a Japanese technical community where Japanese engineers output technical stories like Dev.to), there have been discussions about the **limitations of layout**, such as "text wrapping and node positioning cannot be adjusted" when writing long diagrams with Mermaid.

▼How to fix overly long Mermaid diagrams

<a class="link-card" href="https://zenn.dev/yuki_2021/articles/5368532831f6ab" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://res.cloudinary.com/zenn/image/upload/s--AG7DZzA---/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:%25E9%2595%25B7%25E3%2581%2599%25E3%2581%258E%25E3%2582%258BMermaid%25E3%2581%25AE%25E5%259B%25B3%25E8%25A1%25A8%25E3%2582%2592%25E4%25BF%25AE%25E6%25AD%25A3%25E3%2581%2599%25E3%2582%258B%25E6%2596%25B9%25E6%25B3%2595%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_37:%25E3%2582%2586%25E3%2581%258D%25E3%2581%25AB%25E3%2583%25BC%2Cx_203%2Cy_121/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdGF0aWMuemVubi5zdHVkaW8vdXNlci11cGxvYWQvYXZhdGFyLzBjMjM1Zjc1OWEuanBlZw==%2Cr_max%2Cw_90%2Cx_87%2Cy_95/v1627283836/default/og-base-w1200-v2.png?_a=BACMTiAE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">長すぎるMermaidの図表を修正する方法</span>
</span>
</a>


I also like Mermaid, but I really hate its characteristic **"line crossing"** and have struggled with other tools multiple times.
You might wonder what I mean by "line crossing," so...
▼Sample image of line crossing

<a class="link-card" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xap8pu59ex5a7mqkan0e.png" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">dev-to-uploads.s3.amazonaws.com</span>
<span class="link-card-title">https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xap8pu59ex5a7mqkan0e.png</span>
</span>
</a>


It's like this. I've intentionally made it complex, and I guess it's somewhat understandable.
Initially, I tried to reflect it in code, but it was too taxing for me, so I'll resort to an image.
However, isn't it a common problem that it has to turn out this way? While I believe there are ways to compensate with clever writing, it's hard to avoid with overall diagrams or complex architectures.


### Let's consider a diagram language that is "friendly" to LLMs

However, considering recent advancements in AI, particularly LLMs, I've paused to think.
In this era, is the **visual beauty** or **human-centric usability** really all that matters?
Diagramming tools are no longer just for **humans to draw by hand**. They are also becoming **interfaces for AI (LLMs) to instruct and generate/edit diagrams**.
You could even use them for AI workflows (I haven't experimented with this yet, but I'm pretty sure it's possible).


From this perspective, the criteria for evaluating tools change. What's important is not just **visual appeal**, but also an awareness of **"friendliness" to LLMs, in other words, "efficiency."** This is what I've reconfirmed. It's inevitable considering the future.


In this article, we will explore the optimal diagramming tool based on the data of **token efficiency**, which is one of the selection criteria, even with the excellent tools that emerge in the LLM era.

---


## 1. Costs and Token Efficiency in the AI Era


### 1-1. The "Redundancy" of JSON/XML is the Enemy of LLMs


First, let's consider why intuitively user-friendly tools like Excalidraw (JSON) and draw.io (XML) are at a disadvantage in the LLM era.


The conclusion is their **redundancy**.
Even though GUI operations are intuitive for humans, the underlying data is very complex and contains a lot of unnecessary information. This is understandable as they become richer.


- **XML (draw.io, etc.):** Contains a vast amount of metadata unrelated to the visual appearance of the diagram. It is highly inefficient for LLMs to interpret and edit this. It's not impossible, but...
- **JSON (Excalidraw, etc.):** Defines a large amount of detailed information such as element position, size, and style, which **voraciously consumes tokens**.


### 1-2. Comparing "Estimated Token Consumption" by Diagramming Format Using Data


We compared the estimated token counts for representing a simple sequence diagram in each format. This directly relates to **AI processing costs and speed**.


| Tool (Data Format) | Estimated Token Count | LLM Affinity |
| :--- | :--- | :--- |
| **Mermaid.js** (Markdown-like) | **50** | 🥇 Highest |
| **PlantUML** (Markdown-like) | **80** | 🥈 High |
| **Excalidraw** (JSON) | 500 | ❌ Low |
| **draw.io** (XML) | 1200 | ❌ Lowest |


This is a comparison based on a simple sequence diagram, so the token counts are estimates, but the difference is quite stark.


**What we can understand:**
Compared to Markdown-like formats, XML/JSON consumes up to 24 times more tokens. This overwhelming efficiency difference will determine the superiority of diagramming tools in the LLM era.


In fact, presentations on LLM research earlier this year showed that Retrieval Augmented Generation (RAG) systems utilizing Knowledge Graphs (structured formats like Mermaid and PlantUML) can **significantly reduce token usage (e.g., by 80%)** compared to traditional text-based RAG.

▼Research article link

<a class="link-card" href="https://aclanthology.org/2025.genaik-1.6/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://aclanthology.org/thumb/2025.genaik-1.6.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">aclanthology.org</span>
<span class="link-card-title">GraphRAG: Leveraging Graph-Based Efficiency to Minimize Hallucinations in LLM-Driven RAG for Finance Data</span>
</span>
</a>



This research supports how **providing information to LLMs in a structured and concise format** greatly contributes to **efficiency and cost improvement**.

---


## 2. "Efficiency" vs. "Expressiveness"


### 2-1. LLM Affinity vs. Freedom of Expression


Ultimately, diagramming tools are forced into a strict either/or choice between **"LLM Affinity (Efficiency)"** and **"Freedom of Expression (Visual Aesthetics)."**

>
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/27ju8fgsw1cx27mjer4o.png)

- **Mermaid/PlantUML (Text-based):** Scores high for **ease of generation** and **token efficiency.**
- **Excalidraw/draw.io (Structured Data):** Overwhelmingly superior in **freedom of expression.**


I understand that not all text-based tools are the same, so it's not possible to definitively say which is the strongest or safest option. Mermaid is JavaScript-based and easy to use in a web browser, but PlantUML covers UML diagrams in general and can create more complex charts.

▼Comparison of Mermaid and PlantUML

<a class="link-card" href="https://ones.com/ja/blog/knowledge/mermaid-plantuml-comparison/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://ones.com/ja/blog/wp-content/uploads/2025/04/JA-Blog.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">ones.com</span>
<span class="link-card-title">MermaidとPlantUMLの対比：図表作成ツールの王者対決！どちらが開発効率を上げるか</span>
</span>
</a>



In other words, as mentioned on Zenn, **"Mermaid is suitable for quick information sharing, while PlantUML is appropriate for detailed UML diagrams."**

▼Comparing Mermaid and PlantUML: Which should you adopt?

<a class="link-card" href="https://zenn.dev/manase/scraps/415300a7a0631f" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://static.zenn.studio/user-upload/avatar/e02c9a9f0e.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">zenn.dev</span>
<span class="link-card-title">Mermaid記法とPlantUMLを比較する、どちらを採用すべきか？</span>
</span>
</a>


Furthermore, the point that Mermaid notation seems to have an edge because it can be previewed and shared on GitHub is something I strongly agree with. I feel the same way. However, I'm also someone who tends to make excuses.


### 2-2. Mermaid's "Line Crossing Problem" is a Trade-off


I'm re-evaluating a drawback of Mermaid (the line crossing problem) that I personally found most dissatisfying.
Mermaid's limited layout freedom is because it employs an **automatic layout engine.**


- **Merit:** Both humans and LLMs only need to describe the relationships (edges) between nodes, and it will automatically arrange them.
- **Demerit:** It's difficult to reflect fine-grained intentions, such as "lines not crossing," which a human might ideally want.


**Conclusion:** Mermaid intentionally sacrifices some "visual aesthetics" to prioritize the "structure" that is easiest for LLMs to understand. The line crossing is, in my personal view, a **minimal trade-off** that must be accepted in exchange for the significant benefit of **efficient document management by AI.**
While it's familiar to engineers, there are times when I regularly wonder if it's usable when clients request overall diagrams for understanding customer-facing documents.
Towards non-engineers, reactions like "Wow" are often fresh.
I feel kindness from kind non-engineers who give gentle impressions like, "The system is this complex, isn't it?"
I also think, "I hope they stay that way..."

## 3. The Final Conclusion on Diagramming Tools in the LLM Era


In conclusion, the optimal diagramming tool for the LLM era, in the end, depends on the specific purpose.
It's the usual case of using the right tool for the right job.


| Rank      | Tool             | Recommended Use                                                                 | LLM/Git Integration | Compromises                           |
| :-------- | :--------------- | :------------------------------------------------------------------------------ | :------------------ | :------------------------------------ |
| **Best**  | **Mermaid.js**   | When **automatic updates by AI** in documents, READMEs, Wikis, etc., are prioritized. | **Excellent** (lightweight, Zenn/GitHub native) | Line crossing, node placement limitations |
| **Runner-up** | **PlantUML**     | When strict **UML (Class diagrams, Component diagrams, etc.)** is required.     | **High** (text-based) | More complex syntax than Mermaid      |
| **Visually Focused** | **Excalidraw/draw.io** | When brainstorming, UI mockups, and **visual appeal** are the top priorities.    | **Lowest** (verbose JSON/XML) | Not suitable for AI generation/editing or Git diff management |


It is inevitable that lightweight, simple-structured "diagram languages" like Mermaid will become standardized within the code and documentation that AI generates in the future. Or rather, it will probably happen. While this is just a possibility and might be considered wishful thinking.
Even when instructing major AIs (ChatGPT, Gemini, Claude) to output in their respective syntaxes, they can return reasonably good results. However, they don't always produce perfect output.
There are also occasional issues like the AI freezing due to the processing load while trying to generate something, or other various problems depending on what you want to create.
While the training data for LLM models is not disclosed, so we can't say for sure, we have confirmed that it's generally possible to generate complex diagrams as a base and then make minor edits, especially if you don't want to write them yourself. I've been using it this way recently.
(However, complex architectural diagrams are still challenging!!)


It might be beneficial to familiarize yourself with and understand data formats that are "AI-friendly" from now on.
We hope this serves as a reference when choosing the optimal palette for your projects.
