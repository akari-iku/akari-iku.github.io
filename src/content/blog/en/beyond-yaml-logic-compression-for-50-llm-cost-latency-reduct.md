---
title: 'LLM Prompt Compression: Cut Token Costs by 50% with Logical Structure'
description: >-
  Greetings from the island nation of Japan. In programming, what we fear is
  spaghetti code. In prompt...
date: '2025-09-30'
tags:
  - promptengineering
  - llm
  - costreduction
  - tokenoptimization
lang: en
pair: prompt-compression
source: dev
accent: '#FF6B00'
---

<!-- generated from articles/dev/2025-09-30-beyond-yaml-logic-compression-for-50-llm-cost-latency-reduct.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan. In programming, what we fear is spaghetti code.
In prompt engineering, one should fear the ‘spaghetti prompt’—
though delicious spaghetti is most welcome, of course.
Long, unstructured text incurs enormous costs and renders debugging impossible.
We wish to transform this high-cost, unappetising spaghetti prompt into a lean, logical, inexpensive, and tasty prompt.

It is true that I am feeling rather peckish while writing this article.

## Introduction

The field of prompt engineering is evolving at a rapid pace, isn't it?
I get the impression it has changed considerably depending on “who” uses it and “how”.
While I recognise this, this time too, it's more of a self-organisation exercise leaning towards implementation and application.
With conventional methods, the fundamental challenge remains the trade-off between information density and readability.

<a class="link-card" href="https://arxiv.org/abs/2402.07927" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">A Systematic Survey of Prompt Engineering in Large Language Models: Techniques and Applications</span>
</span>
</a>


In this article, we shall refer to this technique as the “Logical Compression Prompt (LCP)” for convenience.
The Logical Compression Prompt, grounded in cognitive science, serves as a notation system.
This technique utilises mathematical expressions and logical structures to optimise the information density of prompts while achieving a design adapted to the cognitive constraints of Large Language Models (LLMs).
Of course, there are drawbacks.
Ultimately, it boils down to using the right tool for the job, but this serves as both a memo and a personal note for future reference.

Recent academic research has demonstrated that appropriate compression techniques can maintain accuracy even with a 42.1% reduction in length, enabling a balance between cost efficiency and performance.
Ultimately, whether in personal or corporate development, running costs are an area that demands close attention...

<a class="link-card" href="https://arxiv.org/abs/2409.01227" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Prompt Compression with Context-Aware Sentence Encoding for Fast and Improved LLM Inference</span>
</span>
</a>


## Limitations and Challenges of Conventional Methods

### Classification of Existing Prompt Engineering Techniques

Prompt engineering has developed as a systematised technique by major cloud providers.
Key methodologies defined by AWS, which you are likely familiar with, include the following:

**Inference-based Methods**:
- **Chain-of-Thought**: Breaks down complex problems into logical steps
- **Tree-of-Thought**: Explores multiple reasoning paths in parallel
- **Socratic Prompting**: Deepens understanding through stepwise questioning
- **Complexity-based Prompting**: Selects the most complex reasoning path

**Knowledge Utilisation Techniques**:
- **Knowledge Generation**: Generating relevant information beforehand before providing an answer
- **Least-to-Most**: Solving sub-problems step-by-step
- **Directional Stimulus**: Guiding direction through keywords

**Self-Improvement Techniques**:
- **Self-Refinement**: Repeated self-critique and revision of answers


<a class="link-card" href="https://aws.amazon.com/jp/what-is/prompt-engineering/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">aws.amazon.com</span>
<span class="link-card-title">プロンプトエンジニアリングとは何ですか? - AI プロンプトエンジニアリングの説明 - AWS</span>
</span>
</a>

Regarding the specifics of each individual technique, please conduct your own research or consult your own resources.
These established techniques are utilised in practical applications across specialised domains such as medical diagnosis support, decision-making analysis, and creative support, forming the foundation of contemporary prompt engineering.
RAG also falls within this category.

### Structural Constraints of YAML Format and Fukatsu-style Prompts

In addition to existing structured approaches, Fukatsu-style prompts represent a Japanese methodology that achieves reproducible prompts through a four-stage structure: command, constraint, input, and output.

<a class="link-card" href="https://macrolingo.com/japanese-fukatsu-shunsuke-ai-prompting-methods/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://macrolingo.com/wp-content/uploads/2025/02/robot-gen-AI.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">macrolingo.com</span>
<span class="link-card-title">AI Prompting Methods from Japan: Fukatsu and Shunsuke Methods | MacroLingo Global Content Solutions</span>
</span>
</a>


You've likely seen this one before.
Similarly, YAML format is widely adopted as a structured approach prioritising human readability.
In fact, readers of this article might find YAML files more familiar.
You can think of this as the prompt version of that.
It's easy to create and offers good readability once you're accustomed to it. However, these conventional methods have the following fundamental limitations.
I mean no criticism whatsoever—I actually think it's convenient and perfectly fine.

**Information Density Issues**: Structured approaches entail a 40-60% increase in tokens, sacrificing efficiency. Particularly in YAML format, strict management of whitespace characters is required, and even minor indentation errors can render the entire prompt vulnerable to failure.
Also, while “general” might not be the best term, it's incredibly daunting when handing over to people who haven't had much exposure to programming.
Experiences tormented by indentation, half-width spaces, or full-width spaces in Japanese aren't exactly commonplace, are they? I sometimes forget that, yes, that's right.

<a class="link-card" href="https://medium.com/@sahin.samia/prompt-compression-in-large-language-models-llms-making-every-token-count-078a2d1c7e03" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">medium.com</span>
<span class="link-card-title">Prompt Compression in Large Language Models (LLMs): Making Every Token Count</span>
</span>
</a>


**Format Dependency**: Each technique is optimised for specific formats, with performance fluctuations of 15-25% appearing to occur depending on the model and task. This necessitates organisations maintaining multiple prompt engineering techniques simultaneously.
That said, with models evolving and regressing at a frantic pace lately, this area seems likely to become a real headache concerning selection timing and integration.

<a class="link-card" href="https://x.com/dpaluy/status/1887385427687965102" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://pbs.twimg.com/profile_images/361111559/david_200x200.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">x.com</span>
<span class="link-card-title">David Paluy (@dpaluy) on X</span>
</span>
</a>


**Residual Ambiguity**: Natural language-based approaches face ambiguity in 50% of real-world queries, with 56% of AI application failures stemming from prompt ambiguity.
It's the inevitable trade-off when using LLMs or SLMs, as they say.

<a class="link-card" href="https://latitude-blog.ghost.io/blog/how-to-measure-prompt-ambiguity-in-llms/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">latitude-blog.ghost.io</span>
<span class="link-card-title">How to Measure Prompt Ambiguity in LLMs</span>
</span>
</a>


### Scalability and Consistency Challenges

Traditional structured methods are effective for simple tasks but cannot maintain consistency during complex multi-step reasoning (or more phased sequences of actions).
Put simply, hallucinations occur.
Template-based approaches lack versatility across different task types and are prone to falling into the illusion of a “one-size-fits-all” solution.
You know that expression, “works for everyone in any situation” – perhaps those in business-oriented or medical fields have heard it?
Recent research has revealed that LLM inference performance degrades as input length increases.
I reckon those working with them daily often feel this keenly – I'll just go and give them a friendly nudge.
Performance degradation is observed even at 3,000 tokens, significantly below the technical maximum.
This suggests conventional structuring methods are also reaching their limits.
Or rather than limits, perhaps it's more accurate to ask: isn't there a better way to utilise more appropriate LLM models?

<a class="link-card" href="https://arxiv.org/abs/2402.14848" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Same Task, More Tokens: the Impact of Input Length on the Reasoning Performance of Large Language Models</span>
</span>
</a>


## Technical Principles of Logical Compression

### Classification of Compression Techniques and Optimisation Strategies

Academic research suggests prompt compression can be broadly categorised into hard prompt methods and soft prompt methods.
It's starting to resemble software versus hardware, isn't it...

<a class="link-card" href="https://arxiv.org/abs/2410.12388" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Prompt Compression for Large Language Models: A Survey</span>
</span>
</a>


**Hard prompt methods** remove redundant tokens and perform linguistic transformations while preserving semantic equivalence. Context-Aware Prompt Compression (CPC) achieves 10.93 times faster processing than token-level methods through sentence-level compression.

<a class="link-card" href="https://arxiv.org/abs/2409.01227" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Prompt Compression with Context-Aware Sentence Encoding for Fast and Improved LLM Inference</span>
</span>
</a>


**Soft prompt techniques** focus on optimising attention mechanisms and streamlining sequential prompt representations. 500xCompressor achieves compression rates of up to 480x while maintaining 62-73% of the original performance.

<a class="link-card" href="https://medium.com/@sahin.samia/prompt-compression-in-large-language-models-llms-making-every-token-count-078a2d1c7e03" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">medium.com</span>
<span class="link-card-title">Prompt Compression in Large Language Models (LLMs): Making Every Token Count</span>
</span>
</a>


### Mathematical Optimisation Framework

Logical compression can be formulated as the following mathematical optimisation problem.
Ultimately, it all comes back to mathematics and numbers, doesn't it?

<a class="link-card" href="https://arxiv.org/html/2502.11560v1" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">A Survey of Automatic Prompt Engineering: An Optimization Perspective</span>
</span>
</a>


```
maximize E[Performance(θ, X)]
subject to:
  - prompt_length ≤ L_max
  - semantic_coherence ≥ S_min  
  - computational_efficiency ≥ E_min
```

This optimisation apparently involves systematic exploration of the prompt space using Monte Carlo Tree Search. Probably. Definitely.
It's incredibly complex stuff, and I doubt my brain has grasped even a micron of it...
I do enjoy reading papers and gaining knowledge, but the mental fatigue is simply overwhelming.

### Logical Structure and Meta-Prompting

Meta-prompting technology enables a self-improving approach where the LLM itself generates optimised prompts. OPRO (Optimisation by PROmpting) achieves an 8% performance improvement on the GSM8K task and a 50% improvement on the Big-Bench Hard task.

<a class="link-card" href="https://www.prompthub.us/blog/a-complete-guide-to-meta-prompting" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://cdn.prod.website-files.com/646e63db3a42c618e0a9935c/66fdc2207a87b31d29f93e63_Meta%20Prompting%20OG%20Image.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.prompthub.us</span>
<span class="link-card-title">PromptHub Blog: A Complete Guide to Meta Prompting</span>
</span>
</a>


<a class="link-card" href="https://www.microsoft.com/en-us/research/blog/promptwizard-the-future-of-prompt-optimization-through-feedback-driven-self-evolving-prompts/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/PromptWizard-TWLIFB-1200x627-1.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.microsoft.com</span>
<span class="link-card-title">PromptWizard: The future of prompt optimization through feedback-driven self-evolving prompts</span>
</span>
</a>


Logical compression resolves the ambiguity of conventional methods by structuring this meta-prompting and explicitly representing hierarchical logical relationships.
Essentially, it's about making things more machine-friendly and easier to guide the model's internal workings.
Previously, descriptions prioritised readability and catered to the human side, but this approach focuses on the machine! That's the gist of it.

## Cognitive Science Foundations

### Application of Cognitive Load Theory

Cognitive Load Theory (CLT) distinguishes between three types of load: intrinsic, extrinsic, and generative. It is reportedly directly applicable to AI instruction design. Research has demonstrated that AI systems based on CLT principles achieve a 15-25% improvement in learning outcomes.

<a class="link-card" href="https://www.sciencedirect.com/topics/psychology/cognitive-load-theory" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.sciencedirect.com</span>
<span class="link-card-title">Cognitive Load Theory — ScienceDirect Topics</span>
</span>
</a>


<a class="link-card" href="https://aicompetence.org/cognitive-load-theory-ai/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">aicompetence.org</span>
<span class="link-card-title">Cognitive Load Theory × AI — aicompetence.org</span>
</span>
</a>


Logical compression prioritises reducing extrinsic cognitive load by eliminating redundant information while preserving essential meaning.
This enables efficient utilisation of an LLM's limited attention resources.
There was a time when people got really excited about the idea that AI is just like a brain! That's what this is about.
Ultimately, if we humans were handed a long receipt and had to visually inspect every single item one by one, we'd crash too. It's the same thing, isn't it?

### Prototype Theory and Few-Shot Learning

Prototype theory demonstrates that categories are organised around typical examples (prototypes), directly corresponding to the few-shot learning mechanism of large language models (LLMs). Research using Prototypical Networks has observed classification accuracy improvements of 20-30%.

<a class="link-card" href="https://papers.nips.cc/paper/6996-prototypical-networks-for-few-shot-learning" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">papers.nips.cc</span>
<span class="link-card-title">Prototypical Networks for Few-shot Learning</span>
</span>
</a>


<a class="link-card" href="https://arxiv.org/abs/1703.05175" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Prototypical Networks for Few-shot Learning</span>
</span>
</a>

In logical compression, prototype-based exemplar selection minimises the required number of exemplars while enhancing generalisation capability.

### Self-Determination Theory and AI Interaction

Research applying the three fundamental psychological needs of Self-Determination Theory (SDT) – autonomy, competence, and relatedness – to AI systems has revealed that AI systems conforming to SDT principles demonstrate 40% higher satisfaction levels.

<a class="link-card" href="https://www.researchgate.net/publication/361651196_A_Self-determination_Theory_SDT_Design_Approach_for_Inclusive_and_Diverse_Artificial_Intelligence_AI_Education" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.researchgate.net</span>
<span class="link-card-title">A Self-determination Theory (SDT) Design Approach for Inclusive and Diverse AI Education</span>
</span>
</a>


<a class="link-card" href="https://www.researchgate.net/publication/349156548_Design_Foundations_for_AI_Assisted_Decision_Making_A_Self_Determination_Theory_Approach" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.researchgate.net</span>
<span class="link-card-title">Design Foundations for AI Assisted Decision Making: A Self Determination Theory Approach</span>
</span>
</a>


Logical compression integrates the provision of choices that support user autonomy with a stepwise support structure that fosters a sense of competence.
This is where the UX elements come into play.
‘Supporting user autonomy through choice provision’ means determining ‘at what point’ to prompt the user for input.
This approach differs somewhat from the current popular AGI trend, where tasks are handed over immediately and completed autonomously from start to finish.
Personally, I believe this is crucial for engaging with AI.
Maintaining soundness is tricky, though. It risks becoming a philosophical discussion.

### Cognitive Bias Mitigation Mechanisms

LLMs exhibit systematic bias in 65-80% of decision-making scenarios, but bias-mitigating prompt design can reduce this by 30-50%. Logical compression eliminates numerous sources of ambiguity through formal logical representation, thereby reducing confirmation bias and anchoring effects.

<a class="link-card" href="https://arxiv.org/abs/2403.00811" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Cognitive Bias in Decision-Making with LLMs</span>
</span>
</a>


<a class="link-card" href="https://arxiv.org/html/2412.00323v1" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Cognitive Biases in Large Language Models: A Survey and Mitigation Experiments</span>
</span>
</a>


## Implementation Examples and Comparative Verification
Well, while it's best to read the original sources directly via links provided in papers, articles, and various excellent individuals' references, let's take the quick route. Comparing the prompts should make it clear.

### Implementation Example of Logical Compression Prompts

#### Basic Conversion Example

**Conventional Method (Fukatsu-style)**:
```yaml
Command: You are a professional data analyst.
Constraints: 
  - Verify statistical significance
  - Visualise using graphs
  - Provide objective interpretations
Input: Sales data (CSV format)
Output: Analysis report (Markdown format)
```

**Logical Compression Formula (Basic Form)**:
```
ANALYZE(data: CSV, role: analyst) → {
  Σ(significance_test(data)), 
  visualise(trends), 
  interpret(objective=true)
} → markdown_report
```

It's the same content, but this is how it turns out.

#### Example of Complex Task Breakdown

**Natural Language Version (Verbatim)**:
```
You are a project management expert.
Please proceed with the work using the following steps:

1. First, analyse the current state of the project
2. Identify issues and prioritise them
3. Consider at least three solutions for each issue
4. Evaluate the cost and effectiveness of each solution
5. Select the most appropriate solution and explain your reasoning
6. Create an implementation plan
7. Conduct a risk assessment
8. Summarise your final recommendations

Constraints:
- Budget cap is ¥1 million
- Duration is within 3 months
- Team size is 5 members
```

**Logically Compressed Version (High-Density)**:
```
<DEF>
P = project_status; I = issues; S = solutions; C = cost; E = effectiveness
R = recommendation; T = timeline; B = budget_limit(1M); M = team_size(5)
</DEF>

<TASK>
PROJECT_OPTIMIZE(P) → R
</TASK>

<LOGIC>
∀i ∈ analyse(P): I ← priority_rank(issues(P))
∀i ∈ I: S_i ← generate(solutions, n≥3)
∀s ∈ S_i: evaluate(C(s), E(s)) where C(s) ≤ B, T(s) ≤ 3M
R ← argmax(E(s)/C(s)) + implementation_plan(R) + risk_assess(R)
</LOGIC>
```
#### Complex example involving conditional branching

**Multi-stage reasoning task**:
```
<DEF>
T = user_input; S = step_count(init=20); i = current_step
R_i = quality_score(0.0-1.0); P = {thinking, intent, step, reflection, falsify}
O = final_output
</DEF>

<TASK>
MULTI_PERSPECTIVE_ANALYSIS(T) → O
</TASK>

<LOGIC>
step1: thinking{deep_analyze(T)} ∧ intent{extract_objectives(T)} → subtasks{L₁...Lₙ}
step2: ∀L_i: triple_check(consistency, granularity, alignment) → adjust_if_needed
step3: for i=1 to |L|:
  3.1: step{define(L_i)} + count{S-1} + intent{verify_purpose}
  3.2: execute(L_i) → reflection{assess_progress(R_i)}
  3.3: falsify{challenge_assumptions(L_i)} + alt_view{≥2_perspectives}
  3.4: if R_i < 0.5 then redo(L_i)
       elif 0.5 ≤ R_i < 0.8 then adjust(L_{i+1})
  3.5: S ← S-1
step4: if incomplete(task) ∧ S=0 then request_extension
step5: weakness{reverse_audit(all_steps)} → fix_gaps
step6: pause{1min_reflection} → answer{O = structured_output + reasoning}
</LOGIC>
```
#### Examples of Custom Tag Usage

**In-prompt Comment Functionality**:
```
<CONTEXT>
# This prompt is for financial risk analysis
# Last updated: 15 January 2024
# Created by: Data Analysis Team
</CONTEXT>
<VARIABLES>
data = market_data(type=stock_prices)
threshold = risk_level(conservative=0.05)
period = analysis_window(30days)
</VARIABLES>

<PIPELINE>
data → clean() → normalize() → analyze_volatility() → 
assess_risk(threshold) → generate_report()
</PIPELINE>

<VALIDATION>
if volatility > threshold:
  flag_high_risk() + detailed_analysis()
else:
  standard_report()
</VALIDATION>

<OUTPUT_FORMAT>
{
  "risk_score": float,
  "recommendation": string,
  "confidence": percentage,
  "supporting_data": array
}
</OUTPUT_FORMAT>
```
#### Debugging Support Examples

**Error-handling prompt**:
```
<DEBUG_MODE enabled=true>
<TRACE>
step_counter = 0
error_log = []
quality_threshold = 0.7
</TRACE>

<EXECUTION>
try:
  result = process_task(input)
  if quality(result) < quality_threshold:
    log_error("Quality below threshold")
    retry_with_adjustment()
catch exception:
  log_error(exception.details)
  fallback_strategy()
finally:
  report_completion_status()
</EXECUTION>

<GUARDRAILS>
if guardrail_triggered():
  output("⚠️ GUARDRAIL ACTIVATED: " + reason)
  suggest_alternative_approach()
</GUARDRAILS>
</DEBUG_MODE>
```

**Important Technical Limitations**: These implementation examples demonstrate functionality that “appears to work”, but as they rely on the detailed internal processing (black box) of the LLM, full operational guarantees are impossible. While this is nothing new for those involved in AI development, it bears mentioning nonetheless.
The value of logical compression prompts lies in their attempt to visualise and control the black box to a grey-box level.
Thus, even if hallucinations occur midway or the RAG source data produces odd outputs, it becomes easier to identify the cause.
For instance, the source data might be correct, but the referenced section is mistaken.

### Comparison of Processing Efficiency Among Major LLMs

When I directly asked each model, ‘Which prompt format is easiest for you to process? No need to consider human sensitivity—just tell me as the model itself,’ an interesting trend emerged, so I'm noting it down here.

#### Evaluation of Claude (Sonnet 4)

From the perspective of prioritising processing efficiency, the following ranking was presented:

1. **Logical Compression Format (Mathematical Notation)** - Highest token efficiency, zero ambiguity
2. **YAML Format** - Structured hierarchy, type safety
3. **Few-Shot Prompting** - Pattern matching efficiency
4. **ReAct Prompts** - Visualisation of inference chains (high processing cost)
5. **Fukatsu-style prompt** - Optimised for humans, inefficient for machine processing
6. **Natural language style** - Context interpretation is the heaviest load

Claude evaluates that ‘notation such as `∀x ∈ input: analyse(x) → validate(x) → output(x)` is as clear as executing programme code’.

#### Evaluation of Gemini

Emphasises the quality of thought processes and advocates an integrated approach rather than a single method:

1. **Combination of Chain-of-Thought + Logical Compression** - Explicit delineation of thinking steps
2. **ReAct's Think-Act Cycle** - Agile problem-solving
3. **Structured Keyword Notation** - Efficiency as a mini-language

Gemini demonstrated a process-oriented evaluation, stating that it ‘guides the thinking process, enabling unambiguous and efficient progression of reasoning.’

#### Evaluation of ChatGPT-4o

Prioritising practical balance and stability above all:

1. **Natural language + explicit structure (Fukatsu method)** - Balancing intent understanding and structural recognition
2. **Chain-of-Thought method** - Sequential unfolding of thought processes
3. **YAML method** - Structured but not fully optimised
4. **Logical Compression Approach** - Understandable but carries risk of failure in state management

ChatGPT-4o provides significant implementation insights: it recommends a hybrid approach of ‘designing using the Logical Compression Approach → then unfolding it into natural language to feed to ChatGPT’.
※As this is based on pre-GPT-5 implementation data, the same 4o model may behave differently if implemented today.

### Differences in Design Philosophy Between Models

This comparison clearly highlights the processing characteristics and design philosophies of each model:

- **Claude**: Pure efficiency-driven, emphasising quantitative analysis
- **Gemini**: Holistic approach, prioritising process quality
- **ChatGPT**: Practical balance theory, prioritising stability

**Practical Implications**: Optimisation strategies must be tailored to model characteristics; no universal “optimal solution” exists.

### Quantitative Comparison Results

The latest benchmark studies have confirmed the following performance metrics:

**Compression Efficiency**: Logical compression techniques achieve an average token reduction of 56%, delivering significant efficiency gains compared to the conventional YAML format.

<a class="link-card" href="https://medium.com/@sahin.samia/prompt-compression-in-large-language-models-llms-making-every-token-count-078a2d1c7e03" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">medium.com</span>
<span class="link-card-title">Prompt Compression in Large Language Models (LLMs): Making Every Token Count</span>
</span>
</a>


**Accuracy Preservation**: Moderate compression (42.1% length reduction) can maintain or improve task performance.

<a class="link-card" href="https://arxiv.org/abs/2409.01227" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">Prompt Compression with Context-Aware Sentence Encoding for Fast and Improved LLM Inference</span>
</span>
</a>


**Improved Consistency**: Demonstrated a 15-30% performance improvement when combined with JSON format, proving particularly effective for structured data tasks.

<a class="link-card" href="https://www.linkedin.com/pulse/understanding-prompt-formats-xml-markdown-yaml-made-simple-paluy-fgtkc/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media.licdn.com/dms/image/v2/D5612AQH506aZ9448HA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1738820584702?e=2147483647&amp;v=beta&amp;t=MoD0LI6CvkyF5D1Erb7Js-GxJ4H8k2Ig9jf7Hf48ffE" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.linkedin.com</span>
<span class="link-card-title">Decoding the Prompt: XML, Markdown, or YAML – Which Format Reigns Supreme for Reasoning Models?</span>
</span>
</a>


I must say, JSON really is impressive, I was quite taken with it.

Framework Implementation

Implementations utilising the DSPy framework have achieved performance improvements of 24-51% through the MIPROv2 optimiser. Cost-efficient optimisation is typically achievable within the range of $2-20.

<a class="link-card" href="https://dspy.ai/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://dspy.ai/assets/images/social/index.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dspy.ai</span>
<span class="link-card-title">DSPy</span>
</span>
</a>


```python
# Example of logical compression implementation using DSPy
class LogicalCompressor(dspy.Module):
    def __init__(self):
        self.compress = dspy.ChainOfThought(‘context -> compressed_logic’)
    
    def forward(self, prompt):
        return self.compress(context=prompt).compressed_logic
```
## Operational Realities - From Individual Skills to Team Techniques

### High Creation and Maintenance Costs

Implementing logical compression prompts entails a technical burden exceeding conventional methods.
This is incredibly demanding. First grasp the fundamental concept of LLMs: they fundamentally return plausible outputs based solely on the data they have learned.

**Initial design effort**: Creating prompts from scratch requires programming-style thinking and an understanding of cognitive science for mathematical notation and logical structure design, often taking 3-5 times longer than conventional natural language prompts.
It's tough going. Or rather, let's leave the ‘I'm building this prompt from scratch!’ approach to a handful of researchers.
Our heartfelt thanks to the dedicated researchers in the field.
Therefore, we employ AI to compress the content using pseudo-code or similar methods.
We provide the AI with a logical, lengthy text (at this stage, it's beneficial to write it out using a YAML-like format or **numbering steps to document the thought process**).
Simply append the instruction: ‘Using mathematical expressions, pseudocode, variables, section tags, etc., logically compress the content without compromising its meaning.’

The mechanism is an ‘application of pattern learning’.
It aligns with the fundamental concept outlined earlier: ‘it merely returns plausible outputs based on the learned data’.

The AI will read the room. That said, this assumes it has been properly trained. (Hence why model selection is crucial, mind you.)

For example, Google search commands.
Like ‘site:’, ‘define:’, ‘intext:’. Yes, that's it.
It's simply because AI has learned that Google and others operate using such operators as a pattern, so it functions accordingly. This is essentially the tag version of that (with much greater flexibility).
It's the principle that if you understand the words, you can grasp what someone wants to do, even in an unfamiliar language.
If you use some generally accepted format rules, the AI will recognise it as ‘Ah, that one’ and process it correctly.

<> tags → Explicit section division
/site: → Pattern recognition of Google search operators
Single-character variables → Utilising mathematical notation conventions

It's almost like a prompt, or rather, a prompt closely resembling an AI application.

**Debugging Familiarity**: When prompts fail to behave as expected, pinpointing the issue is typically more challenging—or rather, it requires familiarity.
Tracking where things went wrong in variable management (S, i, Rᵢ) or conditional branching (if-then-else) necessitates systematic debugging techniques.
That said, those with some debugging experience or familiarity with programming can usually figure it out.
Indeed, with step-by-step prompts that explicitly state what to do, it can sometimes be easier.
You simply need to read and understand the instructions.
After all, the original logical text is something you wrote yourself, so you should have clearly articulated what you want the AI to do.
**Numbering steps and documenting your thought process as you write is advisable** – this recommendation also stems from the desire to simplify debugging.


**Impact Scope During Specification Changes**: A single element change may propagate throughout the entire logical structure, requiring a deep understanding of the overall design to grasp the scope of impact.
This is not unique to logical compression-style prompts, but I'll note it here.

### Difficulties in Team Operations

**Handover Issues**: From personal experience, situations frequently arise where ‘I can decipher it, but when it comes to adding something extra, well, it's a bit of a hassle.’ Or rather, they did.
Logical compression formula prompts present a significant barrier when members other than the creator need to modify or extend them.
If there is a sufficient level of ‘technical understanding’ and knowledge exchange within the company or team, and if it is documented and the members possess engineering skills, then the effort required is likely to be minimal.

**Learning Curve for New Members**: I estimate engineers accustomed to traditional YAML or Fukatsu-style formats would require 2-4 weeks to master the logical compression notation.
While comments can provide some clarity on what is being done,

**Quality Management Challenges**: In quality management processes equivalent to code reviews, if reviewers lack a precise understanding of the logical compression notation, the risk of overlooking critical defects increases significantly.

### The Freedom and Responsibility of Custom Tags

Tags such as `<DEF>`, `<TASK>`, and `<LOGIC>` used in logical compression:

**Fully customisable**: These can be defined as project-specific notation, not HTML standards. Much like the AI entities themselves, they offer a truly versatile and enjoyable element. While this grants high expressiveness, it comes at the cost of not benefiting from standardisation. A relative trade-off, then.

**Crucial Technical Principle**: There is often misunderstanding about tags enclosed in `<>`. The fundamental premise is that **no such specification exists for the AI itself**. They are not Excel functions or spreadsheet functions either. Ultimately, these are merely notations to explicitly divide sections within prompts, making them easier for the AI to understand. It is a notation style more aligned with the machine.
Similarly, single-letter variables (S, i, Rᵢ, etc.) are not part of the AI's internal specification; they can be set by the developer.

String str1 = ‘hoge’;
String str2 = ‘hoge’;
String str3 = getHoge();

However, overly bespoke names can confuse AI too, so I personally recommend sticking to English words for safety's sake.
That way, anyone with even a little programming experience can make an educated guess when they see it.
Personally, I find it easier to understand what's happening there too.

**Unrestricted Customisation**: This principle allows you to freely add new tags such as `<PLAN>` or `<CHECK>` as needed.
Provided the format remains consistent, the freedom is limitless. This is one of the fascinating aspects of prompt engineering.
Paradoxically, this excessive freedom may also create constraints.

**Challenges in Maintaining Consistency**: However, this freedom risks fostering “dialects” within teams. As projects scale, different members may develop their own tagging systems, increasing the risk of compatibility loss.
Maintaining proper documentation and making the effort to read it are essential, though fundamental.

### Usage Guidelines

**Situations where logical compression is recommended**:
- Advanced analytical tasks by a single developer
- Large-scale processing where token efficiency is critical
- Inference tasks requiring strict logical control

**Situations where conventional methods should be selected**:
- Prompt development and maintenance by multiple individuals
- Prototype creation within short timeframes (depending on the level of ultra-short timeframes or prototypes)
- When frequent participation of new members is anticipated

## Practicality and Limitations

### Applicability and Scalability

Logical compression techniques yield maximum effectiveness under the following conditions:

**Short prompts (<1000 tokens)**: Simple few-shot prompting suffices, though combination with JSON format is recommended.

**Medium-length prompts (1000–4000 tokens)**: A combination of context-aware compression techniques and an auto-optimisation framework proves effective.

**Long prompts (>4000 tokens)**: A hybrid compression approach and dynamic adaptation become essential.

<a class="link-card" href="https://www.datacamp.com/tutorial/prompt-compression" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.datacamp.com</span>
<span class="link-card-title">Prompt Compression Tutorial — DataCamp</span>
</span>
</a>


### Technical Constraints

**Black Box Problem**: The internal workings of LLMs are not fully understood, and the same prompt may yield different results depending on execution timing and the model's internal state.

**Non-Determinism**: While logical compression prompts mimic deterministic control structures, the probabilistic generation nature of LLMs means their behaviour cannot be guaranteed to match expectations 100% of the time.

**Fine-Tuning Problem**: Risks of overfitting and performance degradation exist in compressed models.

**Compression Latency**: The time cost of compression processing may increase inference latency.

**Model Specificity**: Retraining the encoder may be necessary when the base LLM is updated.

### ROI and Economic Analysis

The prompt engineering market is projected to reach $3.01 billion by 2032 (CAGR 33.5%). Organisations typically achieve an ROI ranging from 25% (first year) to 70% (mature implementation).

<a class="link-card" href="https://www.a3logics.com/blog/prompt-engineering-use-cases/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.a3logics.com/wp-content/uploads/2024/05/Prompt-engineering.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.a3logics.com</span>
<span class="link-card-title">Top Use Cases of AI Prompt Engineering Solutions For Success</span>
</span>
</a>


Token optimisation enables cost reductions of 20-40% with minimal impact on quality.

<a class="link-card" href="https://blog.promptlayer.com/how-to-reduce-llm-costs/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://storage.ghost.io/c/1f/f0/1ff09fb9-4fa4-47e4-8c61-4315612abe4e/content/images/size/w1200/2024/11/How-a-Prompt-Engineering-Tool-Improves-AI-Model-Performance--17-.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blog.promptlayer.com</span>
<span class="link-card-title">How to Reduce LLM Costs: Effective Strategies | PromptLayer</span>
</span>
</a>


## Practical Implications for Building AI Applications

### Strategic Prompt Design Tailored to Model Characteristics

The processing characteristics of each LLM should be considered as one factor in design decisions for AI application development:

**Utilising Claude variants**: Particularly effective for efficiency gains through mathematical notation in analytical and reasoning tasks requiring advanced logical compression. Demonstrates true value in industry-specific analysis and data processing pipelines where robust performance is essential.

**Utilising Gemini-based systems**: For complex multi-step reasoning, the combination of CoT (Concurrent Thinking) and logical compression can enhance the quality of reasoning. This makes them suitable for research and development or strategic planning support.

**Utilising ChatGPT-based systems**: In production environments prioritising stability, a hybrid approach of logical compression formula design → natural language expansion is recommended.

### Proposed Implementation Architecture

**Phased Optimisation Approach**:
1. **Design Phase**: High-density specification definition using logical compression formulas
2. **Implementation Phase**: Format conversion tailored to the target LLM's characteristics
3. **Operational Phase**: Ensuring readability with consideration for team collaboration

**Engineering Prompt Engineering**: By evolving from traditional “craftsmanship” to “systematic design methodologies”, the quality and maintainability of AI applications could be significantly enhanced.
That said, whilst these methodologies may be necessary for the underlying mechanisms if widespread adoption is the goal, considering the actual “end users”, the ideal would be something more casual – ideally still in a chat format where it responds to simple requests like “Please ◎◎” or “Do ◎◎ for me”.

### Meta-learning and Transfer Learning

**Transfer Learning**: Research is actively exploring how transfer learning through prompt optimisation across tasks can reduce adaptation costs to new domains. Exciting.

**Automated Optimisation**: Frameworks such as DSPy and TextGrad are accelerating the shift from manual tuning to automated optimisation. I really hope they push hard here too.

<a class="link-card" href="https://miptgirl.medium.com/programming-not-prompting-a-hands-on-guide-to-dspy-04ea2d966e6d" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://miro.medium.com/v2/resize:fit:1200/1*2pbtqqZmyx7NiQxMABW0wg.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">miptgirl.medium.com</span>
<span class="link-card-title">Programming, Not Prompting: A Hands-on Guide to DSPy</span>
</span>
</a>


### Evaluation Metrics and Standardisation

**Objective Quality Measurement**: Using the semantic entropy method, uncertainty estimation is achievable with an AUROC of 0.790.

<a class="link-card" href="https://www.nature.com/articles/s41586-024-07421-0" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">www.nature.com</span>
<span class="link-card-title">Client Challenge</span>
</span>
</a>

**Integrated Evaluation Framework**: Standardised benchmarks such as HELM (Stanford) and PromptBench (Microsoft) enable objective comparisons between methods.

<a class="link-card" href="https://github.com/stanford-crfm/helm" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/fa38cb3e28099db2dd8bbd7aa62663e0d21237d37143e60146d1d85fda1551e4/stanford-crfm/helm" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">GitHub - stanford-crfm/helm: Holistic Evaluation of Language Models (HELM) is an open source Python framework created by the Center for Research on Foundation Models (CRFM) at Stanford for holistic, reproducible and transparent evaluation of foundation models, including large language models (LLMs) and multimodal models.</span>
</span>
</a>


<a class="link-card" href="https://arxiv.org/abs/2312.07910" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">arxiv.org</span>
<span class="link-card-title">PromptBench: A Unified Library for Evaluation of Large Language Models</span>
</span>
</a>


## Conclusion
Though this has become rather lengthy, I recognise that there is no single correct answer for prompts.
This notation itself came about quite by chance – I happened to come across it, and found it immensely enjoyable to radically modify prompts using this logical compression formula. It worked splendidly, debugging was incredibly straightforward, and I was delighted. That was the catalyst.

Through analysing the processing characteristics of each LLM, I believe it is crucial to reiterate that no uniform optimal solution exists; strategic design tailored to model characteristics is paramount. I suppose the more techniques (notations) one has at their disposal, the better.

I find it tremendously exciting that, thanks to the latest academic research, the maturation of implementation frameworks, and empirical model comparisons, this approach may be reaching the stage of transitioning from theory to practice in some AI systems. Particularly, it holds the potential to provide significant competitive advantage in enterprise applications that prioritise the balance between cost efficiency and performance.
The struggle for survival is only going to get fiercer, I reckon.

Whilst hoping for more efficient and reliable interactions with AI systems, I find myself idly thinking that I'd still like to keep engaging with prompts and AI for a while yet.
