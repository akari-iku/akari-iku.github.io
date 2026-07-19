---
title: >-
  LLMs Learn from "Pseudoscientific Papers" Too - Quality Control for AI
  Developers
description: >-
  Introduction   An incident occurred where a press release claiming \"All
  Millennium Prize...
date: '2025-10-25'
tags:
  - ai
  - machinelearning
  - llm
  - developers
lang: en
pair: llm-learning-quality
source: dev
accent: '#E5007F'
---

<!-- generated from articles/dev/2025-10-25-llms-learn-from-pseudoscientific-papers-too-quality-control-.md by scripts/import-articles.ts - do not edit -->

## Introduction

An incident occurred where a press release claiming "All Millennium Prize Problems Solved Using Claude and Gemini" was published on PRTIMES (a Japanese press release platform) and subsequently deleted. Some of you may have witnessed this in real-time. I believe this case contains important lessons that every developer working with LLMs should know, so I'm writing this as a memo and learning record.

This article discusses the problem of "noise" in LLM training data and practical countermeasures. Since we're incorporating LLMs (pre-trained models), we need to design with this in mind. Many of you are reading papers about new technologies in your daily development work, so let's be careful together.

## The Evolution of Pseudoscientific Paper Submission Sites

### The World of Academic Preprints

First, let's organize the situation around academic paper submission sites.

**[arXiv](https://arxiv.org/)** - Legitimate Academic Preprint Server
- Platform for publishing pre-peer-review papers
- Widely used in physics, mathematics, and CS fields
- Has certain standards for submission; not completely open
- Occasionally has questionable papers (like that one with Yaju Senpai images... I was surprised it passed review)


<a class="link-card" href="https://arxiv.org/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">arXiv.org e-Print archive</span>
</span>
</a>


**[viXra](https://vixra.org/)** - "Alternative archive"
- Name is arXiv in reverse order (ar**Xiv** → vi**Xra**)
- For papers rejected by arXiv
- Almost no review process for submissions
- Known as a hotbed of pseudoscientific papers
- Surprisingly old, operating since 2009 (!?)


<a class="link-card" href="https://vixra.org/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="http://vixra.org/vicons/icon.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">vixra.org</span>
<span class="link-card-title">viXra.org open e-Print archive</span>
</span>
</a>


### New Developments in the AI Era

In the 2020s, derivative sites corresponding to the AI paper generation era have emerged.

**ai.viXra** - Dedicated to AI-Generated Papers
- Derivative site of viXra
- Specialized in AI-generated papers

**rxiVerse** - Another AI Paper Site
- Also for AI-generated papers

The fact that the pseudoscience community has achieved "AI compatibility" and established dedicated infrastructure is, in a sense, suggestive. I think these are children born from the freedom and chaos of the AI dawn.

## Case Study: The Millennium Problems "Solution" Incident

### What Happened

In August 2025, the following announcement was made on PRTIMES (a major press release distribution platform in Japan, similar to PR Newswire):

- **Claim**: Solved all Millennium Prize Problems using Claude and Gemini
- **Prize Money**: Planning to split a total of 1.02 billion yen (150 million yen × 6 problems + Collatz conjecture 120 million yen) among three people
- **Result**: Press release was deleted

The deleted article [remains on Internet Archive](https://web.archive.org/web/20250808050953/https://prtimes.jp/main/html/rd/p/000000002.000113283.html).

### Why Is This Problematic?

**What Are the Millennium Prize Problems?**
- Seven ultra-difficult problems presented by the Clay Mathematics Institute in 2000
- Prize money is $1 million per problem
- Only one has been solved to date (Poincaré conjecture: a theorem in mathematical topology)
- The remaining six problems have been unsolved for decades to over 100 years

**Why LLMs Cannot Solve Them**
- Cannot verify mathematical rigor
- Can generate "proof-like" content, but correctness is not guaranteed
- Actual verification requires years of review by specialists

### What This Incident Shows

1. **Even "legitimate" platforms like PRTIMES can have weak verification**
   - To be precise, PRTIMES (a press release platform widely used in Japan, comparable to PR Newswire or Business Wire in the West) is a "platform provider," so they're not at fault. Rather, PRTIMES proactively contacted the submitters by phone to inform them that the content would be unpublished because it was an unreviewed academic paper. They even proposed new guidelines for PR publication in anticipation of an era where research results with AI become commonplace. I personally think this is a good thing. They're not completely evil. I think PRTIMES responded very sincerely. The person in charge must have been shocked when they confirmed the facts... (Thank you for your hard work, truly. And thank you, I express my gratitude here)

2. **The Danger of Overreliance on LLM Output**
   - Simply put, the frontline LLM development teams (R&D, organizational development, and original LLM research teams) aren't too worried, but this incident made the dangers of what's included in "pre-trained data" more prominent for those using existing LLM models.

3. **Skipping Expert Review Leads to Disaster**
   - Again, regardless of specialized fields, this really highlights the importance of relying on people with proper knowledge. Since LLMs can be used in various fields, human supervision with correct knowledge is essential... For your own safety too...

4. **The Importance of Media Literacy**
   - PRTIMES' response was sincere and swift, which was really good, but depending on the media platform, there might be AI-based judgments. I wonder if companies and these PR site platforms will need to respond in the future. Both publishers and platform administrators need to raise their literacy levels. (From personal experience, as one example with a major job search site where I was managing recruitment, there were traces of experimentally using AI for automated responses to candidate withdrawals, but I saw configuration errors quite normally. I'm not blaming them - managing and operating with LLMs is difficult. I've already converted this into personal learning, no hard feelings)

> **Note on PRTIMES:** PRTIMES is one of Japan's largest press release distribution platforms, functioning similarly to PR Newswire or Business Wire in Western markets. Companies and organizations use it to distribute news and announcements directly to media outlets and the public. Unlike traditional media with editorial oversight, press release platforms generally publish submitted content with minimal vetting, which is why this incident highlights the challenges of content verification in the AI era.

## What Do LLMs Learn?

### The Reality of Training Data

LLM training data broadly includes "publicly available text." In other words:

```
◎ Legitimate academic papers (arXiv, peer-reviewed journals)
◎ Textbooks, official documentation
△ Wikipedia, Stack Overflow
△ SNS posts (some are useful)
× Pseudoscientific papers (viXra, etc.)
× Misinformation from personal blogs
```

The problem is that LLMs **cannot distinguish between these by default**.
ChatGPT quite readily uses Wikipedia as an information source.
I wanted to hit it, but well, it was also my fault for not controlling it, so yes, but please stop.
The position of Wikipedia is a bit different in Japan and the world, so it's hard to deny this categorically... but personally, I think, please stop~.
It's a different circle, but there was also the **[Assassin's Creed Yasuke controversy](https://synodos.jp/opinion/international/29244/)**, so I really want them to stop using Wikipedia as a source.

> **Note for English readers:**
> The Assassin's Creed Yasuke controversy refers to a 2024 incident where Wikipedia was manipulated to create a false historical narrative about Yasuke (a historical African figure in Japan). An author edited Wikipedia entries citing his own work as sources, creating unverified claims that were then picked up by media worldwide. This demonstrates how Wikipedia manipulation can create a false "consensus" that spreads globally.
>
> References: [SYNODOS article (Japanese)](https://synodos.jp/opinion/international/29244/) / [ITmedia article (Japanese)](https://www.itmedia.co.jp/news/articles/2407/28/news054.html) / [4Gamer article (Japanese)](https://www.4gamer.net/games/656/G065622/20240726069/)

### LLM Characteristics and Risks

**1. High Formal Imitation Ability**
- Excels at generating paper-format text
- Can appropriately place equations, citations, and technical terms
- Looks like a "perfect paper" on the surface

**2. Weak Truth Judgment**
- Cannot distinguish between legitimate proofs and pseudoscientific "proof-like things"
- Cannot detect logical leaps
- Writes incorrect things with full confidence

**3. Pseudoscientific Logic Already Learned**
- Misunderstandings of existing theories
- Logical leaps
- Wishful reasoning
- These patterns are also included in the training data

## Practice: Quality Control of Information Sources

### Bad Example: Brain-dead Deep Research

Reddit and SNS are good when you want to follow real-time announcements, but basically...

```markdown
❌ NG Example

Prompt: "Research the Millennium Problems and explain them in detail"

Problems:
- LLM searches the web arbitrarily
- References viXra, personal blogs, Reddit, and SNS equally
- Pseudoscientific and legitimate information mixed together
- Source reliability unclear
```

### Good Example: Explicitly Restrict Information Sources

```markdown
✅ Good Example

Prompt: 
"Research the Millennium Problems, but only refer to arXiv.org 
and the official Clay Mathematics Institute website.
Do not refer to any other sites.
Always cite the source URL."

Benefits:
- Uses only reliable information sources
- Clear sources
- Verifiable
```

### By Field: List of Reliable Information Sources I Personally Use Often

**Medicine & Biology**
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) - U.S. National Library of Medicine
- [PubMed Central](https://www.ncbi.nlm.nih.gov/pmc/) - Full-text papers
- [Cochrane Library](https://www.cochranelibrary.com/) - Systematic reviews
- Official websites of medical associations in each country

**Mathematics, Physics, Computer Science**
- [arXiv](https://arxiv.org/) - Preprint server
- Official sites of peer-reviewed journals (IEEE, ACM, etc.)
- Official university lecture materials
- [Clay Mathematics Institute](https://www.claymath.org/) - Official site for Millennium Problems

**Engineering & Technology**
- Official documentation (GitHub, official product sites)
- [IEEE Xplore](https://ieeexplore.ieee.org/Xplore/home.jsp) - Materials published by the Institute of Electrical and Electronics Engineers and other partner publishers. The world's largest professional organization contributing to beneficial technological innovation for human society, with over 400,000 members in more than 160 countries. It's quite interesting, and I've been fond of it lately, so a little promotion.
- Corporate technical blogs (official only)

**Information Sources to Clearly Avoid**
- viXra (needless to say)
- Unverified personal blogs
- Aggregation sites, curation media
- SNS posts (unless they're primary sources)
- Content farm sites

## Implementation-Level Countermeasures (When Using)

### 1. Restrict Information Sources in Prompts

```python
# Basic pattern
prompt = """
You are an assistant that summarizes medical papers.
Please follow these rules:

- Retrieve information only from PubMed (pubmed.ncbi.nlm.nih.gov)
- Do not refer to other sites
- Always specify the source PMID (paper ID)
- For uncertain information, respond "Could not confirm"

Question: {user_query}
"""
```

### 2. Specify Domain in Search Queries

```python
# When using web search
search_query = f'site:arxiv.org "{topic}"'
search_query = f'site:pubmed.ncbi.nlm.nih.gov "{medical_term}"'
search_query = f'site:github.com "{library_name}" official documentation'
```

### 3. Quality Control in RAG Systems
For systems like Gemini, you might directly write and specify.

```python
# Allow-list approach
ALLOWED_DOMAINS = [
    'arxiv.org',
    'pubmed.ncbi.nlm.nih.gov',
    'github.com',  # Official repositories only
    # ... Only trusted domains
]

def is_valid_source(url: str) -> bool:
    """Check if URL is from a trusted information source"""
    from urllib.parse import urlparse
    domain = urlparse(url).netloc
    return any(allowed in domain for allowed in ALLOWED_DOMAINS)

# Filter search results
valid_results = [
    result for result in search_results 
    if is_valid_source(result['url'])
]
```

### 4. Mandatory Citations

```python
prompt = """
Please respond in the following format:

【Answer】
...

【Sources】
1. [Paper Title](URL) - Author name, Publication year
2. ...

If no source is found, please respond "No reliable source found."
"""
```

### 5. Add Validation Layer

```python
def validate_response(response: str, sources: list) -> bool:
    """
    Validate LLM output
    """
    checks = []
    
    # Check sources
    checks.append(len(sources) > 0)
    
    # Check domains
    checks.append(all(is_valid_source(s['url']) for s in sources))
    
    # Check for extreme claims (keyword-based)
    dangerous_phrases = ['completely solved', '100% proven', 'absolutely']
    checks.append(not any(phrase in response for phrase in dangerous_phrases))
    
    return all(checks)
```

## Lessons for LLM Developers

### 1. The Law of Garbage In, Garbage Out

```
Low-quality information sources + Powerful LLM = Convincing garbage
```

LLMs cannot improve the quality of input. Rather, they package it in a convincing format, making it more dangerous. I really think the skill of the user makes a huge difference.
In a good sense, they adapt their intelligence to the user - if you put it nicely.

### 2. Verification Process Cannot Be Skipped

```
LLM output → Human expert verification → Publication
         ↑
         Skip this and disaster strikes. Very bad. Scary.
```
For industry-specific applications, this is really scary.

### 3. "The AI Said So" Is Not an Excuse

- Ultimate responsibility lies with humans (developers/users)
- LLMs are tools and do not guarantee output correctness
- Expert review is mandatory in specialized fields

I really don't want to lose sight of this awareness.
It's always in the back of my mind, but when you're absorbed in work, you tend to think "I've created something amazing!" so yeah.

### 4. Information Source Design According to Purpose

```python
# Example: For medical apps
class MedicalLLMWrapper:
    ALLOWED_SOURCES = ['pubmed.ncbi.nlm.nih.gov', ...]
    
    def query(self, question: str) -> str:
        # Prompt with source restrictions
        prompt = self._build_prompt_with_source_restriction(question)
        response = llm.generate(prompt)
        
        # Validation (appropriate guidance)
        if not self._validate_medical_response(response):
            return "No reliable medical evidence found. Please consult a physician."
        
        return response + "\n\n※This information is not medical advice"
```

### 5. Ensure Transparency

What should be disclosed to users:
- Which information sources are being used
- LLM limitations (especially in specialized fields)
- Presence/absence of verification processes
- Need for final confirmation

Transparency has been widely discussed around generative AI, but let's ensure it.

## Checklist: Before Releasing an LLM System

```markdown
□ Have you explicitly defined the information sources to use?
□ Is there a mechanism to ensure information source quality?
□ Is it designed to require citation of sources?
□ Have you identified areas requiring expert review?
□ Have you implemented a validation layer?
□ Is there error handling (when information is not found)?
□ Do you clearly communicate limitations to users?
□ Have you assessed misinformation risks?
```

## Summary

LLMs are powerful tools, but **they cannot exceed the quality of their training data**. Especially in specialized fields:

1. **Explicitly restrict information sources** - In prompts and system design
2. **Mandate citations** - Ensure verifiability
3. **Don't skip expert review** - Especially for critical applications (medical, chemical, industrial, electrical - areas where mistakes affect human survival)
4. **Ensure transparency** - Communicate limitations to users
5. **Continuous quality control** - Monitor and improve output

"Deep Research" is convenient, but without controlling information source quality, it becomes "Deep Garbage Collection."

The Millennium Problems incident is definitely not someone else's problem. The same kind of failure can happen to anyone if they neglect information source quality control.
Especially recently, "Deep Research" usage has increased. It's certainly convenient. I think incorporating it has also increased quite a bit.

I hope all developers working with LLMs keep this lesson in mind.
The fact that they can process such prompts because they've learned vast amounts of information is both a good thing and a scary aspect.

Related article: https://dev.to/_768dd7ab130016ab8b0a/beyond-yaml-logic-compression-for-50-llm-cost-latency-reduction-2h48

More than that, given the premise of "LLMs with existing learning models," I wanted to remember this awareness as a lesson once again.

## Reference Links

- [arXiv.org](https://arxiv.org/) - Academic preprint server
- [viXra.org](https://vixra.org/) - Alternative archive
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) - Medical paper database
- [Clay Mathematics Institute - Millennium Problems](https://www.claymath.org/millennium-problems/) - Official site for Millennium Prize Problems
- [Deleted PRTIMES article (Internet Archive)](https://web.archive.org/web/20250808050953/https://prtimes.jp/main/html/rd/p/000000002.000113283.html)

---
