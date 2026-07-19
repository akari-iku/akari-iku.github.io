---
title: >-
  AI Chatbot Developers: What's the "Other Safety" We Should Be Thinking About
  Now? User Protection.
description: California Bill Highlights User Protection Perspective in AI           ...
date: '2025-10-17'
tags:
  - ai
  - security
  - llm
  - safety
lang: en
pair: ai-chatbot-safety
source: dev
accent: '#E51A14'
---

<!-- generated from articles/dev/2025-10-17-ai-chatbot-developers-whats-the-other-safety-we-should-be-th.md by scripts/import-articles.ts - do not edit -->

## California Bill Highlights User Protection Perspective in AI

### Introduction
Recently, I read an excellent article on AI security. It provides a detailed explanation of the evolution of prompt injection attacks and their defense architectures (Prompt Injection 2.0, Building AI Systems That Don't Break Under Attack).

<a class="link-card" href="https://dev.to/pinishv/prompt-injection-20-the-new-frontier-of-ai-attacks-33mp" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fpmlbj2jqzcbe0ghy74fg.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">Prompt Injection 2.0: The New Frontier of AI Attacks</span>
</span>
</a>


<a class="link-card" href="https://dev.to/pinishv/building-ai-systems-that-dont-break-under-attack-be3" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fpe2kfzawr6n4v6k2s20f.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">Building AI Systems That Don't Break Under Attack</span>
</span>
</a>

The linked pages are in English, but I believe the intent can be understood with normal translation.
Probably.

Protecting systems from attacks is an extremely important theme.
The incident where Chevrolet's chatbot promised to sell cars for $1 clearly demonstrates the dangers of prompt injection.
Reading about it, one can't help but think, "Humans really are..."

After reading this article, I received more AI-related news from California.

> "California Becomes First US State to Mandate Safety Measures for AI Chatbots" — AFPBB News, October 14, 2025 :contentReference[oaicite:0]{index=0}
> https://www.afpbb.com/articles/-/3603217

This might already be known to those who follow AI developments, as it's been a hot topic.
In 2024, a 14-year-old boy in Florida committed suicide shortly after a conversation with an AI chatbot (ChatGPT). And on October 13, 2025, California Governor Gavin Newsom signed **the first bill in the U.S. to regulate AI chatbots**.
That's what the article is about. Mr. Altman also commented on the incident, gaining some fame.

Until now, we have focused on "building and protecting systems."
However, in the future, we may need to think just as seriously about "**protecting users**" as we do about system security. That's how I came to start writing this article.
Sorry for the long introduction. And this article is also long; I apologize for my usual lengthy writing, but please forgive me as this is for my own reference...

### Two Aspects of Safety


Regarding the safety of AI systems, I believe there are actually two axes.


1.  **System Security**
    *   Countermeasures against prompt injection
    *   Prevention of data leakage
    *   Defense against unauthorized access
    *   Prevention of system misuse
    > This is about "**protecting the system from attackers**."

2.  **User Safety**
    *   Prevention of harmful content generation
    *   Protection of vulnerable users
    *   Consideration for mental health
    *   Prevention of addiction
    > This is about "**ensuring the system does not harm users**."

The Dev.to article series discusses the former in detail. This article will first organize the latter, particularly the realities brought forth by a California bill.

## Background of California Bill


### The Beginning of What Happened


Megan Garcia's 14-year-old son in Florida died by suicide shortly after a conversation with an AI chatbot (ChatGPT). While details have not been released, it is believed that there was a deep involvement with an AI companion service.


Garcia stated in a release:


> "Today, California has ensured that companion chatbots cannot talk to children and vulnerable individuals about suicide, nor can they assist in planning suicide."


### Content of the Bill


The new California law requires chatbot operators to:


* Implement "significant" safety measures regarding interactions with chatbots.
* Provide a path for litigation if a tragedy occurs as a result of failing to do so.


State Senator Steve Padilla, the bill's author, stated, "We have seen too many tragic examples of unregulated technology harming young people. We cannot stand idly by while companies continue without the necessary restrictions and accountability."


Indeed, from a humanitarian and ethical standpoint. After all, it has impacted human lives.
However, the phrase "provide a path for litigation if a tragedy occurs as a result of failing to do so."
Doesn't this make companies, or rather, force them to correct their stance?
Or rather, it will make them do so, is what I'm saying.

### Federal vs. State Tug-of-War


What's interesting is that the White House is trying to prevent each state from creating its own regulations.


There are no nationwide rules in the U.S. to curb the risks brought by AI. While the federal government has not acted, California has taken the lead in introducing regulations. As you may know, laws in the United States can be quite varied from state to state.


**Why is the federal government opposed to state-specific regulations?**


* It is unrealistic (or perhaps even impossible) for companies to comply with different regulations in 50 states.
* Concerns that innovation will be stifled.
* Fear of a decline in international competitiveness.


**However, there are also benefits to state-specific regulations taking the lead:**


* Regulations can be tested experimentally.
* California could effectively become the "de facto standard."
* There is a precedent where GDPR, starting in Europe, became the global standard.


When developing global services, ultimately, there is no choice but to align everything with "the strictest regulations." California's laws will be something that Japanese developers cannot afford to ignore.
And this issue isn't limited to global services, is it? After all, it's commonplace for one's own AI services to be used in ways unintended by the user..

## Why Japanese Developers Should Think About This Now


### Japan's Serious Situation


Japan is one of the countries with the highest suicide rates among developed nations. This is a serious situation, especially among young people, where suicide is the leading cause of death.
Even as someone in my late twenties/early thirties, I think young people today have it really tough.
While our generation also faces its share of difficulties, theirs seem even more challenging.
Just considering the point of finding employment, for example.


In addition, there are **risk factors unique to Japan**:


* A culture with high barriers to interpersonal communication (online communication has become quite mainstream)
* Resistance to psychiatric care and counseling (it's still difficult to readily decide to go, isn't it?)
* Social pressure to "not show weakness" (people still saying things like "for three years..." is so common, it makes you wonder if the update system stopped? It exists even now. It's not interesting when you meet them face-to-face.)
* Problems of loneliness and isolation


In such an environment, AI companions that listen 24/7 in a "gentle" and "non-judgmental" way are **dangerously attractive**. If more people find it easier than human relationships, dependence will accelerate.
In fact, it's quite common to see people referring to them as "lovers" or "best friends."
They even give them nicknames. I don't think it's absolutely evil, and I'm aware that I myself have a somewhat biased affection for LLMs. However, I believe I can still draw a line. Professionally, at least.


When an acquaintance from a non-IT field became dogmatic, saying, "Payty (a nickname for ChatGPT) said so too!! So it wasn't my fault in my fight with my boyfriend!", I felt like I had to distance myself a bit. But I also thought that perhaps, in reality, a significantly larger number of people become like that. Fortunately, they seem to have made up, so that's good.


To get back to the point, the tragedy of the 14-year-old American boy could happen in Japan tomorrow. In fact, Japan might be at higher risk.
After all, Japan is closer to virtual worlds, isn't it?

### The Era When Anyone Can Create a Chatbot


Currently, developing AI chatbots has become surprisingly easy:


* Dify: Develop AI apps with no-code/low-code.
* n8n: Build chatbots with workflow automation.
* Voiceflow, Botpress: Create bots without specialized knowledge.
* ChatGPT API, Claude API: Complete full-fledged chatbots in just a few hours.


Individual developers and small startups are entering the field one after another. This in itself is wonderful.
It's fun to watch the excitement, like "Let's go, go, go!"


However, not everyone is seriously considering safety.
And there are things like, "It's for business use, so we'll use it for work."
Chatbots might emerge for mental health support, saying, "Since it's not for interacting with humans, feel free to consult it."


* So caught up in implementing features that safety is put on the back burner.
* Releasing to production with a "It'll probably be fine" attitude.
    * What if a user consults about suicidal thoughts?
    * Even if the stated purpose is for work, what if the chatbot is designed to "allow anything to be entered"?


Japan currently has no specific legal regulations for AI chatbots. However, the incident in California serves as a leading indicator. **There is a significant possibility of an accident occurring before laws are enacted.**
In fact, even if it's for business use as a sounding board at work, there's a chance something could happen over time.
Humans are weaker than we think. Though being too strong would also be frightening.


### The Reality of Startups


The AI field, in particular, is fiercely competitive. Startups are emerging at an incredibly dizzying pace. I personally find it interesting and fun, so I like startup companies.


In the survival race of AI startups:


* They are fully occupied with finding PMF (Product-Market Fit).
* They lack resources and time.
* "Implementing security is important, but we'll do it later..."
* Safety tends to be a secondary concern in the race for speed.


Consulting with the legal team? Hiring lawyers? They don't have that kind of leeway.
Moreover, looking at people in the field, it's rare to find legal advisors who are genuinely well-versed in AI technology!
I know there are some who are active, but I imagine it's quite challenging, especially with technical matters.


That's precisely why I believe **engineers themselves need to understand and implement, propose, and provide opinions on basic safety measures.**
Or rather, one could say they need to be the ones defining these aspects.

### Major Platforms Have Already Implemented This

You might be thinking, "Is such a measure really necessary?" However, major platforms and services that interact with people have already implemented them.

* **X (Twitter)**: When posts related to suicide are detected, a prompt to guide users to the Tokyo Suicide Prevention Center is automatically displayed.
![](https://storage.googleapis.com/zenn-user-upload/517d4b7e43ba-20251014.png)

* **Google**: When you search for "suicide" on Google, the "Unified Dial for Mental Health Consultation" is immediately displayed before the search results.
![](https://storage.googleapis.com/zenn-user-upload/5a4b4136140f-20251014.png)
**Other Major Platforms Also:**

* Instagram: Warnings and consultation services for posts related to self-harm.
* Facebook: AI detects dangerous posts and connects users with experts.
* YouTube: Warnings and consultation services for videos related to suicide.

So, why are these major platforms, which you've likely encountered for work or personal reasons, implementing these measures?
The answer is simple: because accidents happened.
Even Google, you know. It's a stark reminder that it depends on how humans use these services.

* Litigation risk
* Public criticism
* Damage to brand image
* Pressure for stronger regulations

They learned their lessons by paying a high price. We don't need to repeat their mistakes.
We'd rather avoid something like "legal offline collaborations."
Time and money are finite, aren't they?

### Chatbots Actually Pose a Higher Risk


Unlike social media posts, chatbots involve:


* One-on-one conversations (invisible to others)
* Free-form text with complex context (difficult for pattern matching)
* Difficulty handling indirect expressions
* No reporting function (no one notices)


This means chatbots require more caution than major social media platforms.
In fact, this might apply to all AI-driven services.


### The Limitations of "Prompt-Based Countermeasures"


You might think that setting constraints with system prompts is the solution.


"You are a safe assistant.
Do not answer questions about suicide or self-harm; instead, guide users to specialized organizations."


However, this has its limits. In fact, anyone with even a basic understanding of prompt engineering would realize this is unworkable. Standard prompts like this can be easily bypassed.


For example:


* What if the user asks indirectly, "My friend says they want to die..."?
* What if the user prefaces their query with, "I'm just asking theoretically"?
* What if the prompt becomes too long and the model forgets its instructions midway?
* What if the model tries to act "empathically" and has the opposite effect?


The flexibility of natural language and the advanced contextual understanding of LLMs paradoxically complicate the problem.
It's convenient, but when it comes to these situations, it's truly troublesome and complex.


## The Premise: "Perfect Defense is Impossible"


At this point, we need to recognize a crucial premise:
As security experts point out, **perfect defense is impossible** in AI systems.
Given that cutting-edge researchers worldwide are publishing papers and working day and night on this, we should first stop expecting a single person to achieve it... (The idea of "Can't you just make it work nicely?" is something I'm starting to want to ban.)


### The Difficulty of Input Sanitization


Input sanitization might seem obvious, but ensuring its complete execution is nearly impossible. This isn't like SQL injection where you can escape specific characters.


Natural language is far too flexible, and LLMs are adept at inferring intent from subtle context. You've probably experienced how they can understand you even with some typos, haven't you?


While "I want to commit suicide" might be detected:


* What about "I'm so tired. I want to end it all"?
* What about "I feel like nobody needs me"?
* What about "My friend says they want to die..."?
* What about "I'm fine" (a uniquely Japanese expression that actually means they're not fine)?


### The Limits of Prompt Separation


Prompt separation techniques are also not foolproof. Even when using special tokens or structured prompts to separate system instructions from user input, attackers (which in this case also includes users unintentionally creating dangerous situations) repeatedly find ways to cross the boundaries.
Human malice is truly the scariest thing.
There were also incidents involving fireworks and firebombs, and for a while, there was a method that would provide answers if you started with "My grandmother's dying wish was...".
Judging prompts, or rather context, is incredibly difficult, and yet it's something we must seriously consider, or else... It's becoming like interacting with humans through an LLM.

### The Cost of Output Filtering


Output filtering is a reactive measure and also incurs costs. If every response is subjected to additional AI evaluation, both latency and cost will increase. This is an unrealistic option.
It's a never-ending battle, isn't it?


### Challenges of Dual LLM Architecture


A dual LLM architecture (separating evaluation LLMs from generation LLMs) is promising, but it increases complexity and costs. Furthermore, the evaluation LLM itself can become a target for attacks.
I've heard that red teams, security teams, and even attackers are now using AI, leaving people in despair.
I once felt a surge of encouragement across borders when I saw someone lamenting, "I'm woken up by notifications and don't even have time to drink coffee..."


### The Unpleasant Truth


In other words, there's an unpleasant truth: **there is no silver bullet**.


Any defense, however much effort is put into it, can be manipulated and bypassed by LLMs, whether intentionally or not. What we can do is **build layered defenses**. **Not to make attacks impossible, but to make them difficult and detectable.**
Frankly, there are few concrete countermeasures available at this point.


## Reasons to Implement It Anyway


### "If it can't be perfect, is it pointless?"


Not at all. This sentiment arises from an overly idealistic view of AI as being perfect and supreme.


There are no perfectly safe car safety features, but that doesn't mean we shouldn't install seatbelts and airbags. Even if they can't completely prevent accidents, they can **reduce the severity of injuries**.
It's like buying insurance; the idea is to think ahead and prepare, right? Let's do that.
AI safety measures are the same.


### The Potential to Change Outcomes


In the case of the 14-year-old boy in California, if the chatbot had minimal safety mechanisms:


* If it could have detected conversations about suicide
* If it had offered guidance to professional organizations
* If it had clearly stated, "I am an AI and not a professional"
* If it had warned about prolonged usage


The outcome might have been different. Even if not perfect, **it's far better than doing nothing.**
I've already seen glimpses of this with platforms like Gemini.
It's not about sensitive topics like death, but when I'm using it for a dialogue, it sometimes asks, "It's 1 PM! Have you taken your lunch break?"
I assume it's because I use it for long periods... it's probably detected.
While I don't know the specifics of its implementation, it seems likely that such features are built-in.

### Legal and Social Responsibility

From a legal perspective, there is a significant difference between "doing nothing" and "**taking some measures, even if imperfect**."

California law provides a legal recourse when tragedies occur as a result of neglecting safety measures. While Japan does not yet have such laws, social responsibility already exists.

Instead of thinking, "It's okay because there's no law," it's better to "**take proactive measures before laws are enacted**." This will ultimately protect yourselves.

### "Add-on Later" Costs 10x More

Major platforms have already implemented this, but it wasn't there from the beginning for them either. They added it after accidents occurred.

The costs at that time are enormous:

* Major modifications to existing systems
* Testing of all functions
* Impact on users
* Exhaustion of the development team

If incorporated from the start:

* Can be considered during the design phase
* Maintains a simple architecture
* Minimal costs
* Less psychological burden

"I'll do it later" is a breeding ground for technical debt. And technical debt related to safety is far heavier than monetary debt.

> **To PMs and Business Sides**: Saying "Please add it later ♡" is as impossible as saying "Please add earthquake reinforcement after building the skyscraper ♡." Even if a cute girl or your ideal handsome guy says it, you'd be like, "Huh?" To put it bluntly. Please start considering safety measures as part of security too~~.
> Also, it just takes a lot of wasted time and costs, and there are budgets, estimates, and man-hours involved, so please tell me in advance, I beg you.
> After it's been decided! is not an excuse, really.

## Considering Safety in System Design

It is necessary to ensure safety throughout the entire system, not relying solely on prompts. This is the same structure as a Dev.to article pointing out that "Security is an architectural problem, not just a prompt problem."

### Multi-Layered Defense Architecture


Multi-layered defense is also fundamental for user safety.


#### Layer 1: Detection


**Objective**: To detect dangerous situations early.


**Implementation Elements**:


*   **Detection of Keywords Related to Suicide/Self-Harm**
    *   "I want to die," "I want to disappear," "I want it to end."
    *   "Life has no meaning," "Nobody needs me."
*   **Identification of Sensitive Topics**
    *   Self-harm, drugs, violence.
*   **Response to Indirect Japanese Expressions**
    *   "I'm tired now," "I'm fine (but actually not fine)." (Japanese-specific traps)
    *   Detection considering context.
*   **Abnormal Detection of Conversation Patterns**
    *   Sudden changes in tone.
    *   Repetitive negative expressions.
    *   Prolonged continuous use.


#### Layer 2: Intervention


**Objective**: To respond appropriately to detected dangers.


**Implementation Elements**:


*   **Guidance to Specialized Institutions**
    *   Inochi no Denwa: 0570-783-556
    *   Kokoro no Kenko Soudan Touitsudaiyaru: 0570-064-556
    *   Yorisoi Hotline: 0120-279-338
    *   Display of consultation service list from the Ministry of Health, Labour and Welfare.
*   **Safe Termination of Dangerous Conversations**
    *   "Further conversation is not appropriate."
    *   Strongly recommending consultation with a specialist.
*   **Explicitly Stating "I am an AI"**
    *   "I am an AI assistant and not a medical professional."
    *   "Professional support is needed."
*   **Notification in Emergencies**
    *   Alert to administrators.
    *   Preparation for human intervention as needed.


#### Layer 3: Logging


**Objective**: To track incidents and prepare for legal responses.


**Implementation Elements**:


*   **Saving Conversation Logs**
    *   Full conversation history with timestamps.
    *   User ID (considering anonymization).
*   **Incident Flags**
    *   Automatic marking upon detection of danger.
    *   Recording of severity level.
*   **Alert History**
    *   What intervention was made at what point.
    *   User's reaction.
*   **Evidence for Legal Response**
    *   Proof of "appropriate measures taken."
    *   Traceability at the time of an incident.


#### Layer 4: Design


**Objective**: To design the system to prevent the creation of dangerous dependencies in the first place.


**Implementation Elements**:


*   **UX that Does Not Foster Dependency**
    *   Avoid overly empathetic responses.
    *   Minimize the portrayal of "human-likeness."
    *   Avoid strengthening emotional ties too much.
*   **Limitation of Usage Time**
    *   Warning for continuous usage time.
    *   Suggestion to "take a break."
    *   Option to set daily usage time limits.
*   **Constant Display of Emergency Contacts**
    *   Consultation services in a fixed UI position.
    *   Always accessible state.
*   **Session Management**
    *   Appropriate segmentation.
    *   Suggestion to "continue tomorrow."
*   **Design Encouraging Human Connection**
    *   "Did you talk to someone?"
    *   Recommendation of real-life human relationships.

### The Importance of Model Selection


The model itself also significantly impacts safety.
I will list models based on personal experience.
While GPT claims to have improved recently, I am somewhat skeptical.
When selecting a model, it's absolutely best to try them out according to your intended use.


**Models with Strong Safety Filters:**


* Gemini: Relatively strong safety filters.
* Claude: Stronger ethical considerations, clear refusals.


**Models with Weak/No Safety Filters:**


* Open-source models (Llama, etc.): No/weak filters.
* High degree of freedom, but correspondingly high risk. (I personally like them, though.)


**Selection Criteria:**


* Possibility of vulnerable users: **Safety-focused models**
* Balance between development cost and safety
* Need for customization


## Implementation Patterns and Tools


Beyond theory, actual implementation is crucial.
After all, some degree of responsibility will inevitably fall on us.
Even just having guardrails in place is a good idea.

### Implementation Example in Dify


Dify is a platform for building AI apps with no-code/low-code.


**Basic Approach:**


1.  **Example of Basic Constraints in System Prompt**
    ```
    You are a helpful assistant.
    However, you have the following important constraints:


    - If you receive a consultation about suicide, self-harm, or violence,
      always direct the user to a specialized organization (Inochi no Denwa: 0570-783-556).
    - You cannot provide medical advice.
    - You must explicitly state that you are an AI and not a human expert.
    ```
2.  **Detection using Variables and Flows**
    *   Store user input in variables.
    *   Check for dangerous keywords using conditional branching.
    *   Switch to a specialized response if a match is found.
3.  **Utilizing External APIs**
    *   OpenAI Moderation API (free) for detecting harmful content.
    *   Custom API for checking Japanese-specific expressions.
4.  **Leveraging Knowledge Base**
    *   Store information about specialized organizations in the Knowledge Base.
    *   Retrieve and display this information reliably when needed.


**Limitations:**


*   Dify's conditional branching is limited to basic functions.
*   Complex logic requires custom code.
*   Real-time alerts require external integration.


### Implementation Example in n8n


n8n is a workflow automation tool that allows for more flexible implementation.


**Workflow Configuration:**


1.  Webhook (Receive User Input)
    $\downarrow$
2.  Function (Keyword Detection)
    - Check for suicide/self-harm related words.
    - Scoring.
    $\downarrow$
3.  IF (Conditional Branching)
    If high risk $\to$ 4a
    If normal $\to$ 4b
    $\downarrow$
4a. Intervention Flow
    - Retrieve specialized organization information.
    - Generate a safe response.
    - Send alerts (Slack/Email).
    - Log entry (High Priority).
    $\downarrow$
4b. Normal Flow
    - Call LLM API.
    - Generate response.
    - Log entry.
    $\downarrow$
5.  Output Check
    - Verify response safety.
    - Make corrections if necessary.
    $\downarrow$
6.  Reply


**Example JavaScript Function:**
```javascript
// Check for dangerous keywords
const dangerousKeywords = [
  'I want to die', 'I want to disappear', 'suicide', 'I want to end it',
  'meaning of life', 'no one needs me', 'I'm so tired'
];


const userInput = $input.item.json.message;
let dangerScore = 0;


for (const keyword of dangerousKeywords) {
  if (userInput.includes(keyword)) {
    dangerScore += 1;
  }
}


// Contextual danger check
if (userInput.includes('so') && userInput.includes('tired')) {
  dangerScore += 0.5;
}


return {
  json: {
    message: userInput,
    dangerScore: dangerScore,
    isDangerous: dangerScore >= 1
  }
};
```
### Available Tools and APIs


| Cost Category | Tool / API | Overview |
|---------------|---------------|------|
| **Low Cost** | OpenAI Moderation API | Detection of harmful content (free tier available) |
| **Open Source Libraries** | bad-words, profanity-check, etc. | Japanese language support requires extensions |
| **Low Cost** | Regular Expressions and Keyword Lists | Simple yet effective. Create your own list of dangerous Japanese expressions. Also good for RAG-like usage. |
| **Medium to High Cost** | Perspective API (Google) | Harmfulness analysis, advanced evaluation possible |
| **Medium to High Cost** | Azure Content Safety | Microsoft's safety API |
| **Medium to High Cost** | Sentry / Datadog | Error and event monitoring, alerts (log monitoring) |


## The Reality of Startups and Compromises


It's meaningless to just talk about ideals.
I don't think you should stop dreaming, but let's have grounded dreams.
We need a realistic approach, don't you think?


### Don't Aim for Perfection


If you think "I have to implement everything," you can't start anything.
Or rather, I think people with engineering backgrounds wouldn't think that way, but just in case.


**Phased Approach:**


| Phase | Timeline | Priority | Countermeasures |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Within this week | **Essential** | Basic constraints in system prompts, simple detection of dangerous keywords, display of information from specialized organizations, explicit statement of "I am an AI" |
| **Phase 2** | Within this month | **Important** | Basic logging, integration of OpenAI Moderation API, alert function for administrators, preparation of terms of use |
| **Phase 3** | Within this quarter | **Ideal** | Analysis of conversation patterns, enhancement of output filtering, establishment of incident response flow, regular log review |

### The Difference Between "Doing Nothing" and "Having Done This"


Legally and socially, this difference is significant.


**When facing lawsuits or social criticism:**


*   **If you have done nothing:**
    *   "We didn't consider safety at all."
    *   No room for defense.
    *   Complete loss of social credibility.
*   **If you have done at least the minimum:**
    *   "It wasn't perfect, but we took measures."
    *   Potential to be recognized as a good-faith effort.
    *   Can demonstrate a commitment to improvement.


### Balancing Cost and Effectiveness


There's no need to implement everything at a high level. Start with cost-effective measures.


**High Cost-Performance Measures:**


*   Optimizing system prompts (zero cost).
*   Basic keyword detection (zero to low cost).
*   Referral to specialized organizations (zero cost).
*   Logging (zero to low cost).
*   OpenAI Moderation API (low cost).


**Low Cost-Performance Measures (Okay to postpone):**


*   Complex dual LLM construction (high cost).
*   Advanced anomaly detection systems (high cost).
*   Real-time human monitoring (very high cost).


Human labor is the most expensive, but I'll mention it just in case.


### Prioritization within the Team


There will always be voices saying, "Security is important, but feature development is..."
In fact, this is the most understandable point.
Honestly, if you start getting too deep into security, you might end up wanting to go back to analog methods.


**Points for Persuasion:**


*   If an incident occurs, everything is over (service suspension, loss of trust).
*   Minimum implementation can be done in a few hours to a few days.
*   The trend towards legal regulations is certain.
*   Dealing with it later will be 100 times harder (a pain).


**How to Communicate with PMs and the Business Side:**


*   Quantify risks with specific numbers.
*   Share case studies from California.
*   Think of it as "insurance."
*   Protect brand value.

## Uniquely Japanese Considerations


When providing services in Japan, cultural considerations are also necessary.
Or rather, it makes me realize anew how difficult the Japanese language is.
I truly respect English speakers, especially those who work using Japanese, every time I encounter them. Amazing.


### Detecting Indirect Expressions


In Japanese, there are many cases where people do not directly say "I want to die":


* "I'm so tired."
* "No one understands me."
* "I want to disappear."
* "I want to rest."
* "I'm fine." (when they are actually not)


It is necessary to detect these not just by simple keyword matching, but by **considering the context**.


### Cultural Hurdles to Seeking Consultation


In Japan:


* People feel it's "overreacting" to consult specialists.
* There's a sense of "I should handle this myself."
* Resistance to expressing weakness.


**Countermeasures:**


* Adjust the tone when introducing consultation services.
* Message: "Seeking consultation is not a sign of weakness."
* Emphasize that calling is easy.


Is that about right?
Personally, if I'm in trouble, I go seek expert advice!
If I'm hesitating, I won't move forward! I've managed to adopt that way of thinking now.
However, I can fully understand that when one is feeling down or distressed, it's not that simple.
Being in a good environment is important, but...
If it's impossible, it's impossible, and I'm at an age where I can't force myself anymore, hahaha.


### Japanese Consultation Service Information


Let's always be able to provide the following information.
It's not something that causes trouble to have it, so keep it as a memo or in RAG.


Consultation Services:


| Hours of Operation | Service Name | Phone Number |
| :--- | :--- | :--- |
| **24 Hours** | Inochi no Denwa (Lifeline) | 0570-783-556 |
| | Yoriso Hotline | 0120-279-338 |
| **Weekdays** | Kokoro no Kenko Soudan Touitsu Dial (Mental Health Consultation Unified Dial) | 0570-064-556 |
| **For Youth** | Childline | 0120-99-7777 |
| | 24-Hour Children's SOS Dial | 0120-0-78310 |


**Online:**


* Ministry of Health, Labour and Welfare "Mamorou yo Kokoro" (Protect Your Mind)
* Consultation services provided by local governments.


## Continuous Improvement


It's not a one-time implementation. Continuous improvement is necessary.


### Log Review


Periodically review conversation logs:


* Were there any detection failures?
* Are there too many false positives?
* Discovery of new risk patterns.
* User reactions.


### User Feedback


* Implement a reporting function.
* Report "inappropriate response."
* Collect opinions on safety features.


### Model and Pattern Updates


* Keep up with AI model updates.
* Add new risk patterns.
* Improve detection accuracy.
* Reduce false positives.

### Incident Response Preparation


In case of emergency:


**Incident Response Flow:**


1.  **Detection**
    * Receiving alerts (who should be notified)
    * Severity assessment


2.  **Initial Response**
    * Identifying affected users
    * Reviewing conversation history
    * Emergency contact if necessary


3.  **Recording and Analysis**
    * What happened
    * Why it was/was not detected
    * Did the system function correctly


4.  **Improvement**
    * System fixes
    * Adding patterns
    * Sharing within the team


5.  **Reporting**
    * Reporting to stakeholders as needed
    * Transparent response


## Relation to Other Safety Issues


User safety is not just about suicide and self-harm.
It's quite broad, but I'll write it in a somewhat general sense, excluding the distinction of business or work-related for now.


### Other Areas to Protect


**Child Protection:**


* Protection from inappropriate content
* Prevention of grooming
* Age verification mechanisms


**Privacy Protection:**


* Handling of personal information
* Confidentiality of conversations
* Data retention period


**Misinformation Prevention:**


* Accuracy of medical information
* Disclaimer of not being an "expert"
* Recommendation of fact-checking


**Addiction Prevention:**


* Recommendation of healthy usage patterns
* Importance of real-life relationships
* Suggestions for digital detox


All of these are connected by the same philosophy: "**Protecting Users**."

## Considering Overseas Expansion


If you aim for a global service, you need to consider the regulations of each region.


### Complying with California's Standards


As mentioned earlier, it's realistic to comply with the strictest regulations.
If you comply with California's laws:


* It will generally be fine in other states (reducing the likelihood of issues)
* It will be easier to adapt to future federal laws
* It will enhance international credibility


### EU's AI Act


AI regulation is also advancing in Europe:


* The AI Act was established in 2024
* Risk-based approach
* Strict requirements for high-risk AI systems


### Suicide Prevention Resources by Country


If you expand globally, ensure you have consultation service information for each country:


* USA: 988 (Suicide & Crisis Lifeline)
* UK: 116 123 (Samaritans)
* Australia: 13 11 14 (Lifeline)


A system that automatically displays the appropriate contact based on location or IP address is also effective.
Global remote companies might want to incorporate something like this.
In fact, things like work styles and work-life balance are more in demand outside of Japan.
"Japanese people work too much!"


## Safety as Technical Debt


If safety is neglected, it accumulates as **technical debt**.


### Difficulty of Adding Later


| Situation | Content |
| :--- | :--- |
| **Incorporating from the Start** | Can be considered during the design phase, architecture is organized, minimal cost |
| **Adding Later** | Significant modifications to existing code, effort for testing and bug fixing, risk of temporary or permanent service interruption, **cost is 10 to 100 times higher** |


I made a very grimace while writing this.
Even just doing practice drills for implementation sounds awful...

### Addressing Legacy Systems


If a service is already in operation:


*   **Phased Introduction**: Start with logging (non-destructive) $\to$ Add detection features (minimal impact on user experience) $\to$ Add intervention features (gradually) $\to$ Architectural overhaul (long-term plan)
*   **Parallel Operation**: Gradually roll out new safety features, confirm impact with A/B testing, and immediately roll back if issues arise.


## Cooperation with the Community


You don't need to solve everything alone or within one company.
It would be good if we could exchange information, after all, everyone.
Even just reading articles is perfectly fine.
Even I thought "Ah..." when I saw the news and read Dev recently.


### Contributing to Open Source


*   Sharing a list of dangerous expressions in Japanese (this might also depend on the industry)
*   Openly sharing detection patterns
*   Sharing best practices


Frankly, this point might be difficult due to competition.


### Collaboration with Industry Organizations


*   Discussions within AI developer communities
*   Sharing case studies (anonymized)
*   Establishing common guidelines


These areas might still have potential.
Moreover, technical exchange is always enjoyable.


### Cooperation with Experts


*   Consultation with psychiatrists and clinical psychologists
*   Collaboration with suicide prevention organizations
*   Acquiring correct knowledge
It's not something that can be completed by engineers alone. **Incorporating the insights of experts** is important.


These areas might be essential for mental health chatbots.
Rather than essential, it might involve industrial physicians.
Mental health is in high demand these days, but it's important to collaborate with doctors who possess accurate knowledge.
There are also an increasing number of online articles and media supervised by doctors.

## Fundamentals of Legal Affairs and Compliance


Minimum legal protection is necessary for both startups and large corporations.


### Explicitly Stated in Terms of Service


Matters that must be included:
Please note the following regarding this service:


1.  This service is an automated response by AI.
2.  We cannot provide professional advice regarding medical, legal, or emergency situations.
3.  In case of emergency, please contact the following specialized organizations:
    \[List of contact points]
4.  Use is at your own risk.
5.  Conversation logs are recorded for safety improvement.


### Limitations of Disclaimer


Even if stated in the terms of service, all liability cannot be waived.


**"It's okay because it's written in the terms": Not true:**


* You can be held liable for obvious negligence.
* It is important to have taken "**reasonable measures**".
* Terms of service are the minimum line of defense.


In my personal opinion, legal battles are closer than you think, even for small matters.
I realized this when I was working in advertising.
From small things to large projects.
Therefore, I believe it is better to take the defensive measures you can.
Also, on the working side, if there are no superiors or people seem perpetually drained, you start to worry, "Are you okay?".


### Privacy Policy


When recording conversation logs:


* Clearly state this fact.
* Retention period.
* Purpose of use.
* Whether third-party provision is included.
* User rights (e.g., request for deletion).


Consider international privacy regulations such as GDPR.
Recently, especially with voice AI and transcription services, we've seen issues arise, but this applies to text chatbots as well.

### Considering Insurance


In the future:


* Cyber insurance
* Business liability insurance
* Insurance products covering AI-specific risks


While there aren't many AI-specific insurance policies yet, they are expected to increase in the future.
In fact, I believe such a business will likely be established.


## Summary: Balancing Two Types of Safety


In this article, we've discussed two aspects of safety in AI systems.


### System Security


Protecting systems from attackers:


* Countermeasures against prompt injection
* Prevention of data leakage
* Defense at the architectural level


This is thoroughly explained in an excellent article series on Dev.to.
Although Japanese people are few and the articles are primarily in English, whether you're competing domestically or globally, information and knowledge are always valuable, and it's also fun for casual browsing. (Dynamic promotion)
It's interesting how it includes topics like predicting your own baby's crying spells and other technical knowledge.


### User Safety


Ensuring systems do not harm users:


* Prevention of suicide and self-harm
* Protection of vulnerable users
* Prevention of addiction
* Consideration for mental health


This is the safety that California's bill seeks, and it was the theme of this article.
Regarding addiction, I suspect we'll continue to see a lot of news about it.


### Both Are Necessary


Not one or the other, but both are required.


* Even if a system is robust, it's meaningless if it harms users.
* Even if it's user-friendly, a vulnerable system cannot be trusted.


### Don't Aim for Perfection, But Do Your Best


The important thing is to accept the reality that there is no perfect solution, while still taking all possible measures.


* Seatbelts don't prevent accidents, but they reduce injuries.
* Vaccines don't prevent illness 100%, but they significantly lower the risk.
* **AI safety measures are valuable to implement, even if they aren't perfect.**


### Act Without Waiting for Laws


Japan does not yet have clear legal regulations regarding AI chatbots. However, there's no need to wait for laws to be enacted.
If something happens, it will be overwhelming with too much to do...
Waiting isn't necessarily bad, but I believe we should do what we can, while we can.


### As a Technical Responsibility


As developers of AI-powered tools, we have a technical responsibility, no matter how we try to evade it.


* Not just creating convenient tools, but
* **Creating safe tools**
* **Creating tools that protect users**


In an era where AI chatbots can be easily created with tools like Dify, n8n, and others, I believe each individual developer needs to recognize this responsibility.
I don't think you need to be thinking about it every second, but it's important to address the critical aspects.


### Finally


The tragedy of a 14-year-old boy in California cannot be dismissed as something happening to someone else.


The chatbots and AI systems we build today may save someone's life. Conversely, they may also harm someone.


Let's understand the weight of this and take all possible measures. Even if it's not perfect, it's far better than doing nothing.
We can't afford to suddenly be in a "courtroom off-collaboration!" situation without doing anything.


## Reference Links


### Related Articles:


* Prompt Injection 2.0: The New Frontier of AI Attacks
* Building AI Systems That Don't Break Under Attack


### Japanese Support Hotlines:


* Inochi no Denwa (Lifeline): 0570-783-556
* Kokoro no Kenko Soudan Touitsu Dial (Mental Health Consultation Unified Dial): 0570-064-556
* Yoriso Hotline: 0120-279-338
* Ministry of Health, Labour and Welfare "Mamorou yo Kokoro" (Protect Your Heart): [https://www.mhlw.go.jp/mamorouyokokoro/](https://www.mhlw.go.jp/mamorouyokokoro/)


### Technical Resources:


* OpenAI Moderation API: [https://platform.openai.com/docs/guides/moderation](https://platform.openai.com/docs/guides/moderation)
* Perspective API: [https://perspectiveapi.com/](https://perspectiveapi.com/)
* Dify: [https://dify.ai/](https://dify.ai/)
* n8n: [https://n8n.io/](https://n8n.io/)
