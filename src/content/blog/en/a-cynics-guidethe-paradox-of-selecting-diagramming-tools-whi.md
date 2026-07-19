---
title: >-
  draw.io vs Mermaid vs PlantUML: How Engineers Actually Choose Diagramming
  Tools
description: >-
  Greetings from the island nation of Japan.  Here, surrounded by the sea and a
  deeply ingrained...
date: '2025-11-06'
tags:
  - discuss
  - diagrams
  - documentation
  - ai
lang: en
pair: diagramming-tools
source: dev
accent: '#00B06B'
---

<!-- generated from articles/dev/2025-11-06-a-cynics-guidethe-paradox-of-selecting-diagramming-tools-whi.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

Here, surrounded by the sea and a deeply ingrained corporate culture of meticulous, yet often visually unnecessarily detailed, documentation, we confront a perennial technical paradox: The relentless pursuit of the "right" diagramming tool. We are spoiled for choice: the flexible comfort of Draw.io for initial thoughts, the rigorous, Git-friendly discipline of PlantUML for those who prefer code over clicking, and the sleek, token-efficient allure of Mermaid, which promises harmony with our new AI overlords.
Yet, the true irony, a delicious dish of cynicism served daily, is that the ultimate victor in the corporate workflow remains a tool that handles data like a diagram and diagrams like a spreadsheet.
Engineers may yearn for Markdown purity, but the approval cycle is still governed by the venerable, ubiquitous—and often maddening—PowerPoint. This article cuts through the idealistic noise of the open-source world to deliver a pragmatic, slightly jaded look at tool selection, helping you navigate the delicate balance between technical efficiency and the grim reality of organizational inertia. Read on for the unvarnished truth about picking the palette that won't make your next approval meeting a tragicomic performance.

Are you wondering "**Which tool should I use?**" when drawing system architecture diagrams or sequence diagrams?


draw.io, PlantUML, Mermaid, FigJam... There are so many options that you always end up falling back to the same tool. But are you sure that's the best approach?


This article thoroughly summarises the **tools actually used by engineers in Japan** and **how to choose** them.


▼ Gussie's Tweet
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dy0fkuhfo9j4l8wyio5w.png)

He「What do people usually use to make these?」


This content is based on information gathered from the above tweet. Since various people, including designers, programmers, engineers, and management, reacted to it, I realised everyone is struggling with this... I understand... and decided to compile this information. I personally used to struggle with it a lot too. Please rest assured that I will remove it if there are any issues.

---
## Popular Diagramming and Drawing Tools: A Comprehensive Comparison

### 1. draw.io (diagrams.net) - **The All-Rounder with the Most Votes**


A completely free, high-functionality, all-purpose tool suitable for a wide range of applications.

<a class="link-card" href="https://www.drawio.com/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.drawio.com</span>
<span class="link-card-title">Security-first diagramming for teams | draw.io</span>
</span>
</a>


#### Pros
* **Completely free to use**
* Available as both a desktop and browser version
* **Rich icon libraries** for AWS, Firebase, etc.
* Editable in `drawio.png` format via VSCode plugin
* **Intuitive GUI operation**
* Supports **general diagrams and charts** such as system architecture diagrams and E-R diagrams

#### Cons
* Straight lines can sometimes appear slightly jagged
* Installation and online use may be restricted in some companies (expenses may be incurred if environment setup is required for business use)
* **Difficult for Git diff management** (verbose XML)
* Slow startup (some existing files may take time to open)

#### Main Use Cases
* **System Architecture Diagrams**
* **E-R Diagrams**
* General diagrams and charts

#### Real User Feedback and Impressions
Many users say, "I use draw.io when I'm thinking as I draw" and "I use draw.io when I can't create it well." It often serves as a **last resort when in trouble**. Indeed, it's a tool that can help you out in many situations.

---


### 2. PlantUML - **Popular with the codebase camp**


A **code-based tool** for describing diagrams with text. Java-based. A live editor is also available on the PlantUML Web Server.



<a class="link-card" href="https://plantuml.com/en/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://plantuml.com/og-index" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">plantuml.com</span>
<span class="link-card-title">Open-source tool that uses simple textual descriptions to draw beautiful UML diagrams.</span>
</span>
</a>




#### Advantages
* **Easy to manage with Git** (text-based)
* Easy for AI to read and generate
* Peace of mind knowing the logic is correct
* Good compatibility with VSCode and GitHub Copilot
* Can cover all UML diagrams
* Supports **strict UML** (Class Diagrams, Component Diagrams, etc.)


#### Disadvantages
* Java-based (requires getting used to)
* **Positional relationships can become significantly misaligned**
* Adjusting placement can be frustrating as information volume increases
* More complex syntax than Mermaid


#### Tips
* You can use `[hidden]` lines to fix elements in invisible positions.
* It's efficient to repeat the process of having AI explain and generate a PlantUML diagram, then manually correcting it, and then having AI read it again.


#### Main Uses
* **Sequence Diagrams (most common)**
* Entity-Relationship Diagrams (ERD)
* Simple architecture diagrams
* Strict UML diagrams


#### Actual feedback and impressions
"If PlantUML works, I'll use that; if it seems difficult, I'll use drawio." or "When I've already finished the design in my head and drawing lines feels like a hassle, I use PlantUML." When drawing sequence diagrams involving roles or departments, the ability to use **swimlanes** was personally convenient.

---
### 3. Mermaid - **Highly compatible with AI**


A text-based tool that can be embedded in GitHub's Markdown and **Zenn** (a community for Japanese tech professionals). JavaScript-based. Recently, generation accuracy with AI has also improved. There is also a live editor.



<a class="link-card" href="https://mermaid.js.org/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://mermaid.js.org/mermaid-logo-horizontal.svg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">mermaid.js.org</span>
<span class="link-card-title">Mermaid</span>
</span>
</a>



By the way, there is also a live editor.

<a class="link-card" href="https://mermaid.live/edit#" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">mermaid.live</span>
<span class="link-card-title">Online FlowChart &amp; Diagrams Editor - Mermaid Live Editor</span>
</span>
</a>



#### Advantages
* **Can be handled in Markdown**
* **Easy for AI to read** (easy to pass to AI like ChatGPT)
* Easy to manage with Git
* Usable with Obsidian
* **Native display on GitHub/Zenn**
* **Optimal token efficiency** (details to be discussed later)


#### Disadvantages
* **Difficult to specify fine-grained positional relationships**
* Not suitable for complex diagrams
* Line crossing issues (constraints of automatic layout engine)


#### Main Use Cases
* **Sequence diagrams**
* **Flowcharts**
* Simple architecture diagrams
* Diagrams generated and edited by AI


#### Actual Feedback and Impressions
"I create diagrams in Mermaid format whenever possible! (To make them readable by AI)". Considering the upcoming **AI era**, it is recommended as it is cost-effective if you can handle it.

---
### 4. Other Popular Tools


| Tool Name | Features | Advantages | Disadvantages | Main Feedback and General Impressions |
| :--- | :--- | :--- | :--- | :--- |
| **FigJam / Figma** | Whiteboard-style tool strong in team collaboration | **Real-time collaborative editing is powerful**, high degree of perfection as a design tool | Slow to operate, may have usage restrictions in companies | Popular among businesses and freelancers. Easy to communicate with designers. |
| **Miro** | Whiteboard-style tool, similar position to FigJam | Ideal for team collaboration, strong in brainstorming and workshops, rich in templates | **Paid plan often required**, slightly overkill for system architecture diagrams | Online whiteboard, can also be used for task management, so it's used for purposes other than diagramming tools. |
| **Visio** | Diagram creation tool made by Microsoft | **Widely used in companies**, high affinity with Microsoft products, versatile | **Paid** (Office subscription required), slightly high learning curve | Widely used in Japanese companies. The combination of Office product plans and pricing is complex. |


---

## Specialised Tools by Use Case and How to Choose


### Tools Strong in Sequence Diagrams


* **PlantUML**: **Most frequent answer**. Easy to write code-based, ideal for Git management.
* **Mermaid**: Second place. Some favour it due to the ability to preview and share on GitHub/Zenn.
* **Swagger**: Used in cases where it's used in conjunction with API specification documents. Effective in organisations with a lot of API development.


### Tools Strong in ER Diagrams


* **draw.io**: Easy to create visually. Intuitive operation is easy to understand.
* **PlantUML**: Easy for Git management, but tends to become **difficult to adjust placement** as the amount of on-screen information increases.


### Tools Strong in System Configuration Diagrams


* **draw.io**: **Most frequent answer**. Rich icon library and easy to create visually.
* **icepanel.io**: Specialised tool specifically for system configuration diagrams. Features unique functions such as design merging after development actions are completed.


---

## Reality in the Business Environment: The PowerPoint / Excel Camp


A significant number of engineers also mentioned using Office tools, highlighting the **gap between ideals and reality** in their work environments.


### Opinions from the PowerPoint Camp
* **Essential for explaining and gaining approval from non-engineer superiors.**
* Practically free (Office is already installed) and runs smoothly as a desktop application.
* Allows for quick page copying and iterative trial-and-error.
* **Company security policies** prevent the use of specialized tools.
* Very useful when treated as a vector drawing tool.


> "In Japan, projects cannot begin without presenting to and obtaining approval from non-engineer superiors, so we end up concluding that PowerPoint or Excel is more versatile than using specialized tools."


### Opinions from the Excel Camp
* Due to tool restrictions or specific environments, there are cases where engineers **have no choice but to use Excel**... (this is the unspoken truth)


Ultimately, Office products are introduced in many companies, and considering document management and approval processes, it's a common scenario ("aruaru") that Office tools are often chosen due to their **high versatility**.

---
## Real-World Usage Patterns of Engineers


Many engineers flexibly use tools according to the situation.


| Pattern | Criteria for Usage | Adopted Tool |
| :--- | :--- | :--- |
| **Thought Process** | Writing while thinking vs. Design complete | draw.io (Trial and error) vs. PlantUML (Skipping lines) |
| **Case by Case** | AI integration vs. Free placement | Mermaid (AI integration/Cost-performance) vs. draw.io (Layout adjustment) |
| **Target Audience** | Engineers vs. Clients/Non-engineers | Mermaid/PlantUML (Git management) vs. draw.io/PowerPoint (Visual) |
| **By Use Case** | Architecture diagram vs. Sequence diagram vs. E-R diagram | draw.io vs. Mermaid/Swagger vs. PlantUML/draw.io |
| **Environmental Constraints** | Ideal vs. Reality | Mermaid (Ideal) vs. draw.io (Placement requirements/Environmental constraints) |
| **VSCode Integration** | Completing development environment in one place | draw.io VSCode plugin |
| **Evolution of the Times** | Past vs. Present | OmniGraffle/Visio vs. draw.io |


---


## Future Outlook: The Optimal Solution in the AI Era


Diagramming tools are no longer just for humans to draw by hand, but are also becoming **interfaces for instructing AI (LLMs) to generate and edit them.**


I've discussed cost-performance in another article, so if you're interested, feel free to check that out as well.


<a class="link-card" href="https://dev.to/_768dd7ab130016ab8b0a/analyzing-the-best-diagramming-tools-for-the-llm-age-based-on-token-efficiency-5891" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fq2ewlq8luaa7e93e5l8s.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">Analyzing the Best Diagramming Tools for the LLM Age Based on Token Efficiency</span>
</span>
</a>


### Final Conclusion with an Eye on the LLM Era


**Conclusion: No Single Best Choice**


There are too many factors to consider, meaning there is **no silver bullet**.


* Ease of drawing (familiarity)
* Colleagues' and team environment
* Company rules and security policies
* **Compatibility with AI (token efficiency)**
* Scale and complexity of the diagram
* Purpose (internal documentation vs. customer-facing materials)
* Necessity of Git management
* Whether explanations are needed for non-engineers


---


### Nevertheless, these two are worth keeping in mind


| Tool | Reason |
| :--- | :--- |
| **draw.io** | **All-rounder and highly versatile**. Free, feature-rich, low learning curve, and serves as a reliable fallback. |
| **Mermaid** | **The optimal solution for the LLM era**. Outstanding token efficiency (some tests show it's **1/24th that of draw.io**). Excels at AI generation/editing, display in GitHub/Zenn, and Git diff management, making it **highly compatible with AI workflows**. |


In the future, it's highly probable that "diagramming languages" like Mermaid, which are token-efficient and have simple structures, will become standardised within the code and documentation generated by AI.


Getting accustomed to data formats that are AI-friendly from now on will surely become an asset for you.


We hope this serves as a helpful reference when choosing the optimal palette for your projects.

I'd love to know if you're using this tool in your country or company! In Japan, it was like this this time, but I'm curious about how it is around the world!
