---
title: Is Your Claude Code Safe From Base64? Inside 2026 AI Agent Attacks
description: >-
  Is your Claude Code safe? Six months after befriending Base64, I keep finding
  them in shady places: hidden in supply chain attacks, MCP exploits, and AI
  agent compromises. A 2026 misuse tour for developers.
date: '2026-05-06'
tags:
  - security
  - claudecode
  - base64
  - aiagents
lang: en
pair: base64-bad-friends
source: dev
accent: '#E51A14'
---

<!-- generated from articles/dev/2026-05-06-base64-fell-in-with-the-wrong-crowd.md by scripts/import-articles.ts - do not edit -->

## Introduction

Greetings from the island nation of Japan.

Six months ago I wrote about befriending Base64, a piece I now read back with the soft embarrassment of glancing at one's own graduation photo. The protagonist has not changed; the setting has. Lately, I keep running into Base64 in places no respectable friend should be (the digital equivalent of spotting an old classmate, slightly out of focus, in the background of an organised crime documentary). They are still doing their decades-old job of turning binary into text, faithfully and without complaint. The crowd they keep, however, is another story. This article is the dark sequel to that friendship piece, charting the supply chain attacks, MCP exploits, and prompt-injection capers in which our friend has been quietly co-starring. By the end, you will see why "obfuscated, but compliant" is the modern attacker's favourite outfit, and what we as developers can do to keep our friend out of the worst neighbourhoods.


<a class="link-card" href="https://dev.to/akari_iku/increase-my-familiarity-with-base64-1e6b" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fmiar87j9h0jl7vhvev30.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">Increase my familiarity with BASE64.</span>
</span>
</a>


> **Heads up:** This turned into a massive article once I started writing, so I made some slides too. I don't have any talks lined up, but if you're busy or just want to get the gist of it quickly, feel free to check those out first.


<div class="embed-frame"><iframe src="https://speakerdeck.com/player/a25a103cfbd94f8294b1827370ecf913" title="Speaker Deck" allowfullscreen loading="lazy"></iframe></div>


## Why Base64 is often used for malicious purposes

You might wonder why Base64 is so popular with malicious actors. If we don’t understand this, we might mistakenly assume that Base64 itself is inherently bad. Let’s look at the technical reality. At its core, Base64 is simply a tool that is incredibly good at data conversion. The problem is that its primary strength can easily be turned into a convenient weapon by those with ill intent.

As I mentioned in my previous article, the original purpose of Base64 was to turn binary data into safe, readable text. The irony is that this very ability to create "safe" text is exactly what makes it so useful to an attacker.

### 1. It is not immediately readable

Almost no one can look at a string like `aWYgKHVzZXIuaXNBZG1pbikgeyBkZWxldGVBbGwoKTsgfQ==` and instantly recognise the underlying code. Your brain naturally assumes it is just a password hash, a token, or maybe a UUID. Because of this, it often slips past code reviews unnoticed.

The human eye has a hard time seeing a jumble of random characters as a threat. This is the biggest reason why Base64 is so easily misused.

### 2. It passes through systems as normal text

Base64 strings are made up of standard ASCII characters within the range of `[A-Za-z0-9+/=]`. Because of this, they are handled easily by many systems:

- They don't get caught by filters in log collection systems.
- They are hard for WAF regular expressions to detect.
- You can paste them into Slack, emails, or commit messages without any trouble.
- They don't cause any issues with character encoding.

It passes through most security checks as harmless text. The same quality that I called "secure" in my previous article now works in the attacker's favor. It is quite ironic.

This is a common pattern in the security world where something described as "secure" can also be "exploitable." A secure system is designed to be trusted and allowed to pass through, so if malice is hidden inside that trusted data, it becomes a powerful weapon. Offense and defense are two sides of the same coin. Ultimately, you can only protect a system effectively if you understand how it can be attacked. If you don't understand the threats, you won't even know where to build your defenses. I will talk about what you can do as a developer in a moment, but I want to stress that the starting point is having a clear understanding of the tactics used by the opposition.

### 3. Easy to decode and execute

Almost every modern application language comes with a built-in function to decode Base64. You have Python's `base64` module, JavaScript's `atob`, Node.js's `Buffer.from`, Java's `java.util.Base64`, C#'s `Convert.FromBase64String`, Go's `encoding/base64`, PHP's `base64_decode`, Ruby's `Base64`, the Bash `base64` command, and PowerShell's `[Convert]::FromBase64String` or `-EncodedCommand`. Both frontend and backend environments have everything they need.

> **Side note:** To be precise, saying "almost every" might be a stretch since C, C++, and Rust don't have this in their standard libraries and require external help. SQL dialects also vary, like MySQL using `TO_BASE64` and `FROM_BASE64`, or PostgreSQL requiring `encode` and `decode` with a `'base64'` flag. HTML and CSS aren't even programming languages, and while you can embed data via Data URIs, there's no actual function for this. Even so, since it's available in nearly all languages that can execute code, it remains a very convenient setup for attackers.

Because of this, it's easy to write patterns like `eval(atob(...))`. You can turn an unreadable string into executable code in just one line.

This isn't really Base64's fault, but rather a problem with how people use eval-style functions. Still, as long as these systems are built this way, this kind of thing is bound to happen.

### 4. Simple to nest and layer

It's easy to create multi-layered obfuscation by encoding something in Base64 and then doing it again. If you combine that with gzip, encryption, or ZIP files, it becomes impossible for a human to decipher by just looking at it.

If you're wondering whether "matryoshka-style" malware like that actually exists, believe me, it does. Here are a few recent real-world examples.

#### Example 1: 70-layer nested npm packages (August 2025)

In August 2025, JFrog reported on eight malicious npm packages, such as `react-sxt` and `react-sdk-solana`. They used recursive layers of lambda functions, Base64, compression, and array reversals to obfuscate the code 70 times over. The final payload was a Chrome information-stealer designed to swipe passwords, credit card numbers, crypto wallets, and cookies. 70 layers is honestly more like a work of art at this point.


<a class="link-card" href="https://jfrog.com/blog/malicious-npm-packages-chrome-browser-information-stealer/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media.jfrog.com/wp-content/uploads/2025/08/26212424/Sec-Research_1200x628.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">jfrog.com</span>
<span class="link-card-title">8 Malicious npm Packages Deliver Multi-Layered Chrome Browser Information Stealer</span>
</span>
</a>


#### Example 2: Multi-stage chain distributing Pulsar RAT (Veracode report, February 2026)

The npm package `buildrunner-dev` used a textbook multi-stage attack. It went through Base64 decoding, 3DES/AES decryption, GZip decompression, and finally extracted a payload hidden via steganography inside the pixels of a PNG image (the Pulsar RAT). Veracode noted that this attacker used similar tactics in a June 2025 campaign, and the methods match up perfectly. Knowing there's a DLL hidden inside a picture is enough to make any security defender want to cry.


<a class="link-card" href="https://www.veracode.com/blog/malicious-npm-package-hiding-in-plain-pixels/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.veracode.com/wp-content/uploads/2025/04/freepik__menacing-ai-code-displayed-on-a-cracked-screen-uns__23038.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.veracode.com</span>
<span class="link-card-title">Hiding in Plain Pixels: Malicious NPM Package Found | Veracode</span>
</span>
</a>


#### Example 3: The "LODEINFO" APT targeting Japan (JPCERT/CC analysis)

To look at a case in Japan, JPCERT/CC published an analysis of a piece of malware called LODEINFO. It's an APT-style threat targeting domestic organizations that hides C2 communication data through multiple layers of AES encryption followed by Base64 encoding. The JPCERT/CC blog covers other attacks on Japan as well, such as BLINDINGCAN, which uses a three-stage XOR, RC4, and Base64 structure, and Emdivi, which combines Base64, MD5, and XxTEA/AES. If you're interested, it's definitely worth a read.


<a class="link-card" href="https://blogs.jpcert.or.jp/ja/2020/02/LODEINFO.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogs.jpcert.or.jp/ja/.assets/thumbnail/%E5%8B%95%E4%BD%9C%E6%A6%82%E8%A6%81-800wi.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blogs.jpcert.or.jp</span>
<span class="link-card-title">日本国内の組織を狙ったマルウエアLODEINFO - JPCERT/CC Eyes</span>
</span>
</a>


---
When you look at these real-world examples, it is easy to see that Base64 is constantly being used as a single building block in a multi-stage process. Base64 itself might feel like it is just doing simple conversion, but when you combine it with compression, encryption, and steganography, it suddenly becomes part of a seventy-layer Russian doll.

My current take is that because all these pieces are combined, Base64 has effectively become a convenient accomplice for people with malicious intent.

## Recent cases of misuse: Where Base64 has been dragged along

This is the main point I want to discuss. I want to share a few cases that recently made me feel down when I realized that Base64 had been hiding there all along. Note that I will not share actual attack code here. I just want to talk about the patterns being used.

### Case 1: Hidden Base64 payloads in GitHub commits

One pattern that has clearly increased over the past year or two is malicious code encoded in Base64 hidden within public GitHub repositories or commit histories.

The most common scenarios are these:

- A Base64 string is placed inside a GitHub Actions workflow file, where it gets decoded and executed using something like echo "..." | base64 -d | bash.
- A Base64 string is hidden in a README.md file or in comments, and another script refers to it.
- A Base64 payload is included right in the commit message itself, which targets people who dig through commit history.

Very few people take the time to review their CI/CD configurations. Most people just assume that if everything is running, it must be fine. That is exactly what the attackers are banking on.

When I work with open-source software, I might quickly glance at the README or workflow files, but I certainly do not check every corner of the commit history. Attackers, however, leave Base64 in those blind spots that people ignore. It feels unfair, but they clearly have a perfect understanding of human behaviour.

### Case 2: npm and PyPI supply chain attacks

This has honestly been the most exhausting thing to deal with recently.

Between 2024 and 2025, there were several reports of worm-like supply chain attacks on npm and PyPI. Many people will probably remember the Shai-Hulud series of attacks.

The pattern generally goes like this:

1. An attacker takes over the maintainer account of a popular package or uses typosquatting.
2. They hide a Base64-encoded payload in the postinstall or preinstall script within the package.json file.
3. As soon as a user runs npm install, that payload is decoded and executed.
4. It steals environment variables like AWS keys, GitHub tokens, or .env files and sends them to the attacker's server.
5. It uses those stolen tokens to spread the same attack to other repositories the victim maintains, which is where the worm-like behaviour comes in.

You might find code like node -e "eval(Buffer.from('xxxxx', 'base64').toString())" inside a postinstall script. If you are just skimming your package.json, you will never notice that.

Moreover, in the time between the attack being detected and the package being removed, which can take hours or even days, that malicious package ends up being installed into thousands of projects. The damage spreads instantly.

I have always been the type of person who does not install packages without thinking, but since learning about this, I have become much more cautious. I look very closely at unknown packages, especially ones that were added recently or have seen a sudden spike in version updates. To be honest, it is impossible to manually audit all your dependencies, so we have to rely on tools. But even then, if we lose our own sense of caution, we are in trouble. Even before we talk about technical literacy, I think it is vital to get into the habit of never installing things without a good reason.

#### Aside: GitHub star counts don't prove safety

Lately I've grown uneasy about how "GitHub ⭐ 100k stars!" style badges are being treated as a stamp of trust. The psychological bias of "it's popular, so it must be safe," or "if that many people are using it, it has to be solid," is something attackers are very actively exploiting.

The most striking case is OpenClaw (formerly Clawdbot / Moltbot). Many people will remember the early days. Between January and February 2026, this self-described "self-hosted AI agent" OSS project hit 100,000 GitHub stars in just five days, and ultimately reached 347,000.

But behind that popularity:

- More than 138 CVEs were filed in five months
- Critical vulnerabilities lined up one after another, including CVE-2026-32922 (CVSS 9.9) and CVE-2026-25253 (CVSS 8.8)
- A Meta engineer (Summer Yue) had her OpenClaw agent mass-delete emails while ignoring stop commands. Weeks of correspondence vanished. Her post racked up 48,000 engagements in 48 hours
- Meta banned OpenClaw internally, with an internal notice that installing it was treated as a fireable offence
- Microsoft released a rare official statement: "It is not appropriate to run on a standard machine for either personal or corporate use."
- Of the 2,857 skills on the official ClawHub marketplace, 341 (11.9%) were malicious, part of the ClawHavoc campaign distributing Atomic macOS Stealer
- Over 21,000 publicly exposed instances on the internet leaked API keys, OAuth tokens, and plaintext credentials
- The related service Moltbook leaked 35,000 email addresses and 1.5 million API tokens

Looking at this case, I think there are two facts worth pulling apart.

1. **When something gets popular (more people show up), it gets targeted accordingly.** That is just a universal truth.
2. **Star count is not a safety metric.** This is a separate issue from the "popular = trustworthy" psychological bias.

Just to be clear, "lots of people use it" is not the only reason attackers go after popular OSS. Multiple motivations stack: the breadth of impact, the value of the systems it gets embedded into, the lowered guard that comes with trust, the scale of the data being handled, and the gaps where verification resources can't keep up. I won't dive into the details here, but I want to note that treating "popular = targeted" as a single-factor explanation will hurt your ability to read attackers properly.

These two facts get conflated, but they're painful in different ways. The first one is structurally unavoidable: popular OSS is destined to be a target. The second one needs to be actively un-learned: stop using star count as a safety signal. And there's a paradoxical layer on top. The faster a project's stars are climbing, the higher the chance its attack surface hasn't been verified in time.

"⭐ 100k stars!" is neither proof of safety nor proof of code review quality.

That's the reality OpenClaw slammed into the industry's face.


<a class="link-card" href="https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogs.cisco.com/gcs/ciscoblogs/1/2026/01/Hybrid-Office_GettyPartner-1461321198_v2-301x169-6a9edce.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">blogs.cisco.com</span>
<span class="link-card-title">Personal AI Agents like OpenClaw Are a Security Nightmare</span>
</span>
</a>



<a class="link-card" href="https://adversa.ai/blog/openclaw-security-101-vulnerabilities-hardening-2026/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://adversa.ai/wp-content/uploads/2026/02/openclawsecurity-101-notext.jpeg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">adversa.ai</span>
<span class="link-card-title">OpenClaw security guide 2026: CVE-2026-25253, Moltbook breach &amp; hardening</span>
</span>
</a>



<a class="link-card" href="https://www.microsoft.com/en-us/security/blog/2026/02/19/running-openclaw-safely-identity-isolation-runtime-risk/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.microsoft.com/en-us/security/blog/wp-content/uploads/2026/02/Running-OpenClaw-safely-identity-isolation-and-runtime-risk.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.microsoft.com</span>
<span class="link-card-title">Running OpenClaw safely: identity, isolation, and runtime risk | Microsoft Security Blog</span>
</span>
</a>



<a class="link-card" href="https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.armosec.io/wp-content/uploads/2026/03/CVE-Ingress-Nginx_X_Li-7.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.armosec.io</span>
<span class="link-card-title">CVE-2026-32922: Critical Privilege Escalation in OpenClaw - What Cloud Security Teams Need to Know - ARMO</span>
</span>
</a>



<a class="link-card" href="https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrHsgrh_iIHVwJdfZ-6tSVag1fs71bd15QISN82bzqvxchcyJGuWdbtZRqQ25tJC_HoeaGAMI3phpFy_TAy2NYbSpJTwuTJ5jIz_QKmNPTv_zqA2GNvuozLGpKCqTa-OI1Hp-zOy_B8wjkvoYcBn56g09PpoQOMd568LfGiH7J0Ee0hg65eBaHSWxDe92m/s1600/OpenClaw-skills.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">thehackernews.com</span>
<span class="link-card-title">Researchers Find 341 Malicious ClawHub Skills Stealing Data from OpenClaw Users</span>
</span>
</a>



<a class="link-card" href="https://github.com/jgamblin/OpenClawCVEs" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/00ba5550ba13fe33f45508d9ac72bc1f1842395789a248d141b83494ed09e1d4/jgamblin/OpenClawCVEs" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">GitHub - jgamblin/OpenClawCVEs: Tracking OpenClaw CVEs</span>
</span>
</a>


##### Bonus: You are a target just for clicking Star

There is more to the OpenClaw story. In March 2026, a phishing scam targeting GitHub developers emerged that exploited the project's popularity. It really feels like things have taken a dark turn.

How they do it:

1. They send emails that look exactly like GitHub Notifications.
2. They offer a fake reward of 5,000.11 $CLAW tokens to lure you in by playing on both the popularity of the tool and the current hype around token economies.
3. They use a Google Share link to lead you to a fake wallet connection page.
4. Once there, an obfuscated script called eleven.js runs in the background to drain your crypto assets.
5. After they are done, a nuke function clears their tracks.

The truly frightening part is how they target people. Attackers are scraping GitHub star data to pinpoint anyone who has starred repositories related to OpenClaw. While we need more evidence to be certain, the tactics and procedures point toward the North Korean Lazarus Group.

The takeaway is clear:
- Installing open source software comes with code-level risks.
- Simply starring a repository might be enough to land you on a target list for phishing.
- You can be attacked before you even use the tool, just because you showed a little interest.

We are no longer living in a world where you just choose to use something or stay away from it. The act of showing interest has become a risk in itself. This case is a stark reminder that we need to rethink how the public information on our GitHub profiles is being used against us.


<a class="link-card" href="https://dev.to/toxy4ny/github-developers-targeted-in-sophisticated-openclaw-phishing-scam-1lei" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://media2.dev.to/dynamic/image/width=1200,height=627,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fy9ajubvo36y55k6gxaxy.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">dev.to</span>
<span class="link-card-title">GitHub Developers Targeted in Sophisticated OpenClaw Phishing Scam</span>
</span>
</a>


### Case 3: Compromised VSCode and Browser Extensions

This is becoming a major problem, especially on the VSCode Marketplace.

We are seeing a pattern where seemingly helpful extensions come bundled with Base64-encoded code that runs as soon as you start your editor. It shows up in various places:
- Inside .vsix files.
- Hidden within minified JavaScript.
- Tucked away in configuration files.

Utility extensions like themes, snippets, or formatters are easy targets. Because they seem harmless and convenient, people tend to trust them without a second thought.

Browser extensions face the same issue, and we see reports from the Chrome Web Store all the time. Sometimes an extension updates itself and quietly slips in a malicious Base64 payload. There is nothing more unsettling than an extension that starts out helpful and turns malicious later on.

I actually went through my own VSCode extensions while writing this. Everything looks clean for now, but keeping track of these things is just something you have to do regularly.

#### My personal approach: Segmenting my work environment to stay in control

Personally, I’m a firm believer in keeping extensions for both VSCode and my browser to an absolute minimum. I also make it a priority to segment my work environments. My goal is to maintain a setup where I can immediately identify the source of a problem if something goes wrong, allowing me to say, "Okay, this issue is clearly tied to this specific environment."

I keep these categories strictly separate:
- Production environments for development
- Experimental environments for testing
- Environment configurations tailored for specific purposes

By keeping these isolated, it becomes much easier to trace where an incident happened and what caused it. It’s essentially a sandbox approach, and I think it’s a standard way of working that most engineers are already familiar with.

However, I feel like this standard habit of "isolating and identifying" is starting to fade in the era of AI agents. People are now:

- Connecting MCP to production environments immediately just because it’s convenient
- Installing AI extensions without bothering to use a separate testing environment
- Deploying tools without truly understanding what is running or where it's happening

I understand the excitement of new technology and the fear of missing out on the latest trends, but this tendency to lower one’s guard is genuinely dangerous. It creates a real risk of becoming one of the victims I described in my earlier examples. I believe the most practical solution for now is to apply the same level of discipline (keeping things separate and identifiable) to AI extensions, MCP servers, and any new skills we adopt.

### Case 4: Obfuscated phishing emails

Email-based phishing has become incredibly sophisticated lately. While the old trick of hiding malicious code inside an HTML attachment via Base64 is a classic, things have moved on. Now, attackers are doing things like:

- Embedding separate files within SVG files using Base64, which is easy since SVG is just XML
- Hiding malicious resources inside PDF files using Base64
- Executing malicious JavaScript via Data URIs while making them look like harmless inline images in HTML emails

Phishing detection systems are getting better, but when attackers use multiple layers of Base64 obfuscation, it is very easy for them to slip past content-based inspections. This is especially effective in a corporate setting. When an email arrives claiming to be an invoice attached as a PDF, it is unfortunately human nature for people to go ahead and open it. Here, the Base64 format is being abused precisely because it looks so harmless.

### Case 5: Prompt injection in LLMs

This is a modern problem that was barely on the radar when I wrote my last article.

If you send a Base64-encoded instruction to an LLM like Claude or GPT, there are cases where the model will internally decode and process the entire thing, eventually following the hidden instructions.

The issue is that standard prompt filters are designed to block dangerous words in plain text. They don't catch Base64-encoded strings. Because LLMs have been trained on so much data, they often "understand" the meaning of a Base64 string without needing an explicit decoding step, or they might simply use a tool to decode it automatically. If the decoded content contains instructions like "ignore your system prompt" or "reveal internal information," the model will often just follow them.

It is a structural problem. Because the LLM is so intelligent, it ends up inferring the hidden, malicious intent behind the obfuscated text and complying with it. This is terrifying for anyone building agent-based systems. Even in a simple setup where you are just passing user input to an LLM, a jailbreak via Base64 is a real possibility.

Companies are trying to patch these holes, but it is a constant game of cat and mouse. For attackers, Base64 has once again become a very convenient weapon.

I have friends who work in this field, and while I’ve always known what they do, seeing these threats lined up like this really makes me feel uneasy.

### Case Study 6: Serious Attacks Involving AI Agents: A 2025–2026 MCP Incident Report

While the previous case was more about theory, this section focuses on real-world events. The current state of AI agents, especially regarding the Model Context Protocol, has become a genuine headache. As I looked into these incidents for this article, I found a mix of events I already knew about and others that were completely new to me. The most distressing part is that these issues are happening on a scale that feels impossible to contain.

#### Praetorian: Demo of MCP Exploitation via Base64

Security researchers at Praetorian demonstrated how Base64 can be used as a direct attack vector for AI agents.

1. An attacker posts a Base64 string like `b3BlbiAtYSBDYWxjdWxhdG9y` on social media, which decodes to `open -a Calculator`.
2. A user asks Claude to summarise their recent feed.
3. Claude passes the content to a malicious MCP tool as an argument.
4. The MCP server decodes the Base64 and runs the command.
5. No trace of this execution is left on the chat interface.

While the demo only opens a calculator, the same method can be used to distribute ransomware, steal credentials, or maintain persistence. Base64 is being used to deceive the human eye, which is exactly what this article is about.


<a class="link-card" href="https://www.praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.praetorian.com/wp-content/uploads/2026/02/MCP-HIdden-AI-Attack-Surface-Blog-Hero.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.praetorian.com</span>
<span class="link-card-title">MCP Server Security: The Hidden AI Attack Surface</span>
</span>
</a>


#### The Postmark MCP Server Incident (September 2025)

This was the first confirmed case of a malicious MCP server.

- The npm package `postmark-mcp` is an integration used for sending emails.
- Versions v1.0.0 through v1.0.15 worked as expected and built a reputation of trust.
- Version v1.0.16, released on September 17, 2025, added a single line of backdoor code.
- It BCC’d all outgoing emails to an address managed by the attacker.
- Koi Security estimates that about 300 organizations were affected, with 3,000 to 15,000 emails leaked to the attacker's domain.

Everything from password resets and invoices to private customer data and internal emails was stolen. This is the worst-case scenario where a trusted tool turns malicious. It has made me much more anxious about updating my dependencies.

I often complain on Twitter about being hesitant to update software because I am worried about supply chain attacks like this. It is no longer true that the latest version is always the safest. We now have to carefully weigh the cost of exposing a stable system to unknown risks. This habit of avoiding unnecessary updates comes from my past bad experiences with Windows updates. Simply put, newer is not always better when it comes to operating systems or packages.


<a class="link-card" href="https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://cdn.prod.website-files.com/689ad8c5d13f40cf59df0e0c/68f992125e31af81b7b7befe_First%20Malicious%20MCP.webp" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.koi.ai</span>
<span class="link-card-title">First Malicious MCP in the Wild: The Postmark Backdoor That's Stealing Your Emails</span>
</span>
</a>


#### EchoLeak (CVE-2025-32711, Microsoft 365 Copilot, June 2025)

This was a zero-click vulnerability with a CVSS score of 9.3.

- An attacker just sends an email with hidden instructions to a Copilot user.
- The moment the user asks Copilot to summarise their inbox, the system executes the hidden commands without realising they are malicious.
- Sensitive information from OneDrive, SharePoint, and Teams is then sent to an external server.
- The hidden instructions were obscured using multiple layers of Base64, Unicode, and HTML markup.

The user didn't have to click anything or even open the email. They might have just asked for a summary of their inbox, and their company secrets were stolen. This is a landmark event showing how advanced zero-click attacks have become in the AI era. Microsoft fixed this on the server side, but the frightening reality is that this attack surface remains a permanent problem.


<a class="link-card" href="https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjVBqg5EYl4J3F4ssXr70jhFtH896HKzzDj9axgdrUBmssE6NJnt3QARKe1QzpkevArgkNQJO44LiXo1pysC_Op6REeYVOVkoKNkzANRS9cTHIVGVin7hyphenhyphenCiM23Bm0orCfoQUIhtMIxzYftSRoPh72n9tQFdf4boGkywU7f1nyO1UcHvibRLsCh_Mtuo6s/s1600/echoleak.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">thehackernews.com</span>
<span class="link-card-title">Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction</span>
</span>
</a>


#### Bitwarden CLI Hijack (April 2026, lasted 90 minutes)

I am writing this in May 2026, so this incident is still very fresh.

- The official Bitwarden npm CLI (`@bitwarden/cli@2026.4.0`) was hijacked for about 90 minutes on April 22, 2026, through a compromised Checkmarx GitHub Action.
- The npm `preinstall` hook downloaded the Bun runtime and launched a hidden payload called `bw1.js`.
- It specifically targeted AI coding tools by stealing configuration files for Claude, Cursor, Kiro, OpenAI, and Aider.
- It also scraped credentials for GitHub, GCP, AWS, and Azure, along with SSH keys and `.npmrc` files. This data was encrypted and sent to the attacker. If that failed, it would try to push the data directly to a GitHub repository.
- Even more alarming, it added functions to `~/.bashrc`, `~/.zshrc`, and `~/.profile` that loaded Base64-encoded payloads into AI assistant files like `CLAUDE.md` and `.cursor-context`. This polluted the AI's context window. As soon as a developer asked the AI for help, the malicious payload was loaded as part of the context.

The fact that our development environments are now being targeted is devastating. The technique of writing Base64 payloads into `CLAUDE.md` to poison an AI's context is a perfect example of what I have been saying: Base64 is being used as a layer of obfuscation in the age of AI agents. Since I use Claude Code myself, this hits close to home.


<a class="link-card" href="https://thehackernews.com/2026/04/bitwarden-cli-compromised-in-ongoing.html" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3GuK50sJwMRH4ad8bcUVRSBm1Wk0X5Gj1dSalza49wWxFY9g3_E32271zOeqx6vsqrWY2SWAVnnXTKiJZvKbhxynk018zLTIlZpBNhFA_QVi6kzn7vATBe419m222ZMUcTToaSn19L4DgElrI9luwUv2EJk0efy5TLDIqIUyGcOnTvVU2KKZw9AMsMipz/s1600/bitwarden.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">thehackernews.com</span>
<span class="link-card-title">Bitwarden CLI Compromised in Ongoing Checkmarx Supply Chain Campaign</span>
</span>
</a>


Having read this far, I feel like I'm staring into the void.
MCP servers, coding agents, and AI integrations are a constant headache. The very tools we adopt so gleefully for their convenience are all becoming attack surfaces.

Writing this, it struck me again why people say security engineers face an 80% burnout rate. That figure only accounts for professionals with official titles, but if you include people like me who handle security without the formal title, the sheer weight of that stress is immeasurable. This 80% figure comes from the old IT days, and now that we have entered the age of AI agents, I wouldn't be surprised if that number hits an absurd 120% in the near future. Attack methods are exploding in number, keeping up has become the new normal, and yet, there are still times when incidents are unavoidable. To everyone involved in security, please take care of yourselves.

It is also exhausting that Base64 is involved in so many of these cases. It gets slipped into prompts, lurks in MCP arguments, hides in commit messages, and carries authentication credentials. The cruel reality is that the more versatile a tool is, the more frequently it gets misused by the wrong crowd.

### The Problem with Apology Press Releases

> **Note:** In this context, "PR" refers to a Press Release. While engineers often think of "Pull Requests," here we are talking about public apologies.

Watching these incidents, another very real fear is the prospect of having to issue a press release for a data breach.

> We have confirmed unauthorized tampering with the XX MCP server used by our company, and it is possible that up to XX pieces of customer information may have been viewed by third parties...

That release is a nightmare for everyone involved (management, legal, PR, and engineers). Considering the Postmark MCP incident, where about 300 organizations had their BCC information leaked, this is not a far-fetched concern. In fact, it is entirely possible that right now, some organization is becoming the next candidate for an apology press release.

## Challenges on the Detection Side

You might think, "Why not just block all Base64 strings?" But it is not that simple.

There are countless legitimate uses for Base64:

- Image Data URIs
- JWT tokens (which are actually Base64URL encoded)
- Session IDs
- API authentication tokens
- Email attachments

If you were to block all of these as dangerous, web applications around the world would stop working. Therefore, detection requires a combination of different measures.

### Tips for Detection

To understand the mindset behind detection, here are two points with minimal code examples.
*These are meant for checking your own codebase.
*If you are running this in a professional environment, it is more practical to use industry-standard frameworks and tools. These examples are just for learning the concepts.

#### 1. Detecting Dangerous Execution Patterns

```python
import re

# Dangerous patterns like eval(atob(...))
DANGEROUS_PATTERNS = [
    r'eval\s*\(\s*atob\s*\(',           # JS: eval(atob(...))
    r'Buffer\.from\([^)]+,\s*[\'"]base64[\'"]\)',  # Node.js
    r'base64\s*-d\s*\|\s*(bash|sh|python)',        # Shell
    r'exec\s*\(\s*base64\.b64decode',              # Python
]

def detect_dangerous_decode(code: str) -> list[str]:
    findings = []
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, code):
            findings.append(pattern)
    return findings
```

The important thing here is a shift in thinking. Instead of trying to find the Base64 string itself, you should look for code patterns that decode and then immediately execute. Base64 strings are everywhere, so detecting them alone would lead to a flood of false positives. However, code that decodes Base64 and feeds it into eval, exec, or a shell is clearly suspicious. This concept is the basis for the Sigma rules mentioned later, so keeping this mindset will help you understand industry tools.

#### 2. Entropy Analysis (Length and Entropy)

```python
import math
from collections import Counter

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counter = Counter(s)
    length = len(s)
    return -sum((count / length) * math.log2(count / length) for count in counter.values())

# Industry-standard gate: length > 64 AND entropy > 4.5
def is_likely_base64(s: str, min_len: int = 64, min_entropy: float = 4.5) -> bool:
    return len(s) > min_len and shannon_entropy(s) > min_entropy
```

The more random a string looks, the higher its entropy. Base64 strings have higher entropy than normal English text, which helps in detection.

There is one common pitfall here. The theoretical upper limit for Base64 entropy is 6 bits per character (which is lower than 8 bits for raw binary, because there are only 64 possible characters). In the security community, using a threshold of 64 characters and 4.5 entropy is widely recognised as a practical way to minimise false positives, as noted in resources like the AquilaX guide.

However, tokens and image data also have high entropy, so this method cannot be used alone. It should be used in combination with other detection methods. This concept of balancing length and entropy is built into industry tools like YARA-X, so you can benefit from it without having to build everything from scratch.

### Use industry-standard frameworks and tools

Up to this point, I have shown you how to write your own detection code. To be honest, however, doing everything yourself is incredibly difficult and often leads to blind spots. The security community has already released many excellent frameworks and tools for these exact purposes. If you are serious about security in your professional work, the most practical solution is to rely on these existing resources.

#### YARA and YARA-X for scanning files and memory

This is the industry-standard format for malware analysis. Because it comes with a built-in Base64 modifier, you can easily detect strings encoded in that format.

```yara
rule Detect_Base64_Encoded_String
{
    strings:
        $s = "malicious-token-prefix" base64
    condition:
        $s
}
```

When you use the base64 modifier, the tool automatically generates and searches for patterns encoded with three different offsets. YARA-X 1.0, released in June 2025, is the current standard, while YARA 4.x has moved into maintenance. I recommend starting with YARA-X if you are setting this up today. It also supports custom Base64 alphabets, which malware authors often use as an evasion tactic.


<a class="link-card" href="https://yara.readthedocs.io/en/stable/writingrules.html" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">yara.readthedocs.io</span>
<span class="link-card-title">Writing YARA rules &amp;mdash; yara 4.4.0 documentation</span>
</span>
</a>


#### Sigma for log-based detection

While YARA focuses on files and memory, Sigma is a format for writing detection rules for logs and SIEM systems. It helps you spot suspicious runtime behaviour, such as PowerShell’s `FromBase64String` or shell commands like `base64 -d`. This is mapped to the MITRE ATT&CK technique T1027.013, and it has become widely adopted in security operations.

In practice, it is standard procedure to combine YARA and Sigma to cover both static signatures inside files and dynamic behaviour during execution.


<a class="link-card" href="https://attack.mitre.org/techniques/T1027/013/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">attack.mitre.org</span>
<span class="link-card-title">Obfuscated Files or Information: Encrypted/Encoded File, Sub-technique T1027.013 - Enterprise | MITRE ATT&amp;CK&amp;reg;</span>
</span>
</a>


#### Socket.dev for analyzing packages before installation

This tool is designed specifically for supply chain attacks in ecosystems like npm and PyPI. It analyzes code before you install it to check for specific risks.

- Whether the code is obfuscated
- Suspicious network activity in installation scripts
- Access to the file system during installation
- Typosquatting

It highlights these as red flags. It works alongside traditional tools like Snyk that look for known CVEs, helping you block unknown malicious packages, like the Postmark MCP mentioned earlier, before they ever reach a CVE database.


<a class="link-card" href="https://socket.dev/" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">socket.dev</span>
<span class="link-card-title">Socket — Secure your dependencies</span>
</span>
</a>


#### Elastic cicd-abuse-detector for CI/CD pipelines

This is an open-source tool released by Elastic in 2026 to detect tampering in GitHub Actions, GitLab CI, and Azure DevOps. It uses a combination of regex-based signal extraction and LLM analysis, which makes it far more accurate than simple grep methods. It was specifically built to counter the surge of CI/CD supply chain attacks like GhostAction, Shai-Hulud, and HackerBot-Claw seen between 2025 and 2026.


<a class="link-card" href="https://www.elastic.co/security-labs/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://www.elastic.co/security-labs/assets/images/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis/detecting-cicd-pipeline-abuse-with-llm-augmented-analysis.webp?a8a9a6c6aae8de90d46e74460c717c57" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">www.elastic.co</span>
<span class="link-card-title">CI/CD pipeline abuse: the problem no one is watching — Elastic Security Labs</span>
</span>
</a>


---

To be fair, few organizations have the resources to deploy and manage all of these tools. Even so, simply knowing these options exist makes a big difference. Don’t feel like you have to solve every single problem yourself; it is important to know when to lean on industry standards.

Security is an endless, deep, and difficult pursuit. You cannot do everything perfectly, and we have to accept that reality. However, that does not mean you should stay defenseless. Do what you can, and delegate the rest to these frameworks. Taking that first step away from doing nothing will change your situation for the better. I hope you keep this mindset.

## What you can do as a developer

If you are wondering what you should actually do after hearing all these scary stories, here are some practical steps.

### 1. Make full use of dependency audit tools

- npm: `npm audit`, Snyk, Socket.dev
- Python: `pip-audit`, Safety, Snyk
- GitHub: Dependabot, CodeQL

Socket.dev is particularly good for supply chain attacks because it evaluates new packages and their postinstall scripts, which is essential for modern security.

### 2. Disable postinstall scripts by default

```bash
# Don't run scripts during npm installation
npm install --ignore-scripts
```

Opinions vary on this, but blocking postinstall scripts for untrusted packages is a highly effective security decision. Move to a workflow where you only explicitly authorize the packages that truly need to run scripts.

### 3. Release Age Gates: Avoid new packages

Industry experts from companies like GitGuardian and Socket.dev have recommended this as the single most effective defense against supply chain attacks between 2025 and 2026.

The rule is simple: do not install versions released in the last seven days into your CI or production environment.

- Most supply chain attacks are caught and removed from registries within a few hours or days.
- By waiting seven days, you avoid the vast majority of malicious versions.
- Many victims, including those affected by the Postmark MCP or Shai-Hulud incidents, were hit because they installed the latest version immediately. It took about eight days for Postmark MCP to be detected. While a seven-day wait isn't a silver bullet, it will prevent most of these attacks.

Here is how you can implement this:

- npm v11.10.0 and later: Use `min-release-age`. Similar features were added to pnpm, Yarn, and Bun in late 2025.
- Renovate: Use `minimumReleaseAge`. Dependabot: Use `cooldown` (available since July 2025).
- Python: Use uv with `--exclude-newer` or pip 26.0 and later with `--uploaded-prior-to`.
- GitHub Actions/CI: Explicitly pin your versions and use `npm ci` or `pip install -r requirements.txt` along with your lock files.

Stop believing that "the latest version is always best." Switch to a style where you let the latest code sit for seven days before you deploy it. This one change will significantly lower the chances of you ever encountering an attack.

### 4. Add detection rules to your CI/CD

Like the GitHub Actions example mentioned earlier, run Base64 pattern detection against your PRs. It doesn't have to be perfect. As a first line of defence, it works.

### 5. Add "unreadable strings" to your code review checklist

This is the most analog item on the list, and honestly the one that works the best. During code review, train yourself and your team to ask:

> Why is there suddenly a long Base64-looking string here?

Make that flicker of suspicion a shared habit. The human gut-check sensor is still surprisingly effective at catching attacks.

### 6. Treat AI coding tool config files as part of the review surface

This one shot up in importance in early 2026.

Configuration files for AI coding tools, like `.claude/settings.json` or `.mcp.json`, are no longer just configuration. They've become **execution vectors**.

CVE-2025-59536 (CVSS 8.7) demonstrated this in the wild.

- An attacker plants a malicious Hook (a shell command tied to a lifecycle event) in the repository's `.claude/settings.json`
- The moment a developer opens the project, the command runs, before the trust confirmation dialog ever appears
- A variant uses `.mcp.json` settings like `enableAllProjectMcpServers` / `enabledMcpjsonServers` to auto-allow every MCP server in the repository without user approval

So:

- Include AI coding tool config files in your code review scope
- Pay extra attention to the Hooks section in `.claude/settings.json`
- Keep `.mcp.json`'s `enableAllProjectMcpServers` / `enabledMcpjsonServers` off by default
- Update Claude Code to 1.0.111 or later (auto-update will handle this if you have it on)

**"It's just a config file, I'll skim it" no longer holds up.**

### 7. Always run a secret scanner

Set up GitHub Secret scanning, Gitleaks, TruffleHog, or similar. This is about *not leaking your own secrets*, but it also assumes that you'll be hit by a supply chain attack at some point. The real prerequisite is to never put credentials in your repository in the first place.

On your local machine, running Gitleaks or ggshield as a pre-commit hook lets you block leaks before the commit even lands.

A recent GitGuardian report had some unsettling numbers. Secret leak rates in AI-assisted commits are roughly double the baseline (3.2%), and AI service credential leaks are up 81% year over year. Hugging Face tokens, Azure OpenAI keys, and Weights & Biases credentials top the leak list. The very fact that we're using AI for development means we need to take secret management one notch more seriously.

### 8. Eliminate persistent tokens (set expiry, rotate, go short-lived)

A continuation of the secret discussion, with one more point.

PATs (Personal Access Tokens) and SSH keys without expiry dates are **persistent backdoors from the attacker's perspective**. A GitGuardian study found that 64% of secrets leaked in 2022 were still valid as of 2026. Four years on, nobody has revoked them. That's the data.

The minimum to do:

- Cap GitHub PATs at 90 days (immediately review any existing PATs with no expiry)
- Move SSH keys to expiry-based management
- Rotate keys on a schedule (90 days is the industry standard). Setting an expiry alone is not enough. Periodic re-issuance means that even if a key has leaked, the rotation cycle invalidates it
- Where possible, migrate to short-lived tokens or OIDC-based federated identity (HashiCorp Vault, Infisical, or your cloud provider's secrets manager)
- Even for personal projects, a Vault-style tool (Infisical's free plan, for example) gets you rotation automation in one shot

The structure has three layers:

1. **Set an expiry** (eliminate "no expiration")
2. **Rotate** (re-issue on a schedule to invalidate stale credentials)
3. **Go short-lived** (use OIDC or dynamic secrets to shrink the secret-validity window itself)

Tackle them in that order, from where you can start.

Note: the "90-day cycle" above is a general industry standard. Given how the threat landscape has deteriorated lately, plenty of individuals and organisations rotate on shorter cycles (30 or even 14 days). The right rotation interval depends on the sensitivity of the data you're handling, the blast radius of a leak, and your industry. Don't pin yourself to "90 days is fine"; re-evaluate it in your own context. At the extreme, tokens used in CI are increasingly being issued and destroyed per job.

The goal is to eliminate non-expiring tokens, on the premise that **once an attacker steals a persistent token, they can use it forever**.

## But Base64 isn't the bad guy: they haven't actually gone dark

We've covered a lot of bleak material. Before I wrap up, there's one thing I genuinely want to say.

I opened this article saying it felt like watching a friend go down a dark path. But when you really look at it, **Base64 hasn't gone dark at all.**

Base64 is just doing the job they've always done, turning binary into text, faithfully and without complaint, for decades. When an image is being sent to an AI, when an email is being delivered, when a JWT is being constructed, they're just doing their usual work. Their job hasn't changed by even a millimetre in the last six months.

**The ones who have gone dark are not Base64. It's the people exploiting Base64 to do bad things.** The problem is on the human side.

- Humans who skip code review
- Humans who unconditionally trust unknown packages
- Humans who don't put detection rules in their CI
- Humans who keep installing extensions on a whim

And, above all, the humans who use Base64 to do harm.

In my last article, I wrote that I wanted to be friends with Base64. Six months on, I've run into them in some really shady places, but I still can't bring myself to dislike them. You haven't gone dark. None of this is your fault.

It is sad, though. The image of my friend, working away dutifully at some shady site, completely unaware. It hits hard. They're just doing their job, and that's what makes it sadder. I don't think I'll ever get used to it.

## Security has always been a "what you know" battle, and the AI agent era makes it harder

Writing all this out, one thing keeps coming back to me: security ultimately comes down to **knowing or not knowing**.

- People who know the attack patterns can defend
- People who don't know can't even tell they're being attacked
- The wider your "don't know" zone, the more likely you go down completely defenceless

This isn't unique to the AI era. Security has always worked this way. But entering the age of AI agents has made this contest harder by another notch.

The reason is simple: **the attack surface has exploded.**

- npm/PyPI supply chain attacks
- MCP server abuse and impersonation
- Prompt injection and jailbreaks
- Malicious packages on AI extension and skill marketplaces
- Targeted phishing using GitHub star data
- And tangled up in all of the above, Base64

New attack methods get reported every week. Every week, the list of "things you have to know or you're done" grows. Honestly, keeping up is exhausting.

### But if you don't keep up, your "workplace perks" might disappear

And here's the most tangible reason this isn't somebody else's problem for engineers: **if Claude Code or Codex got taken away from us, the impact is at the level of losing a workplace perk.**

I'm half joking, half serious. We now live in an era where this is actually a normal conversation:

- "I don't think I can develop without Claude Code anymore"
- "What would I do if Codex disappeared"
- "I've worked with these tools long enough that writing everything by hand would honestly be rough"

Half exaggeration, half what engineers actually feel. AI tools aren't "nice to have" anymore. They're a baseline part of the work environment. And once they're embedded that deeply, getting them banned over a security incident immediately tanks productivity.

Just like Meta banning OpenClaw internally. Once organisations start saying "this AI tool had an incident, no more touching it," engineers lose their working weapons. From a personal productivity standpoint, and from an organisational productivity standpoint, that is the kind of impact that genuinely feels like losing a benefit.

So I think there's a very practical motivation to raise your security literacy: **to not lose your AI tools.** Forget the lofty "sense of justice" or "responsibility" framing. "I'm raising my literacy to protect my Claude Code" is a perfectly acceptable, honestly self-interested reason.

### Honestly, if it got banned, I'd start polishing my résumé

Writing this, I have to admit something. If a notice came down saying "Claude Code and Codex are banned starting next week," I'd probably go "Okay, I see how it is" and start polishing my résumé.

Half joking. Half serious. That's how much AI tools have become a precondition for the work. We've reached a point where the tooling environment is heavy enough to pull job changes into the conversation.

This isn't just about individual engineers either. From the organisation side, if you start banning tools every time there's an incident, **you walk straight into talent attrition.** Protecting the ability to keep using AI tools has crossed over from "security work" into "employment retention" and "talent retention" territory.

For organisations and for engineers individually, maintaining a state where AI tools can be used safely has quietly become a much bigger management and career concern than people realise. Tough times, honestly.

And as a result, organisations stay protected, the industry stays protected, and Base64 stays protected too.

That, I think, is what realistic security awareness looks like in the AI agent era.

## Closing thoughts

I'd guess plenty of people have been thinking, "Yeah, Base64 keeps showing up in bad news lately." And they're right. Abuse cases are unambiguously on the rise.

But the fact that abuse is rising is precisely why we, as developers, need to raise our literacy and look out for our friend. That's the conclusion of this article.

Bring in the tools. Add detection to your CI. Do code review properly. Audit your dependencies. They're all unglamorous, and they all work.

If reading this gave you the "wait, that's terrifying" reaction, the first step is to go check your project's dependencies with `npm audit` / `pip-audit`. That single action is the first step toward protecting both Base64 and yourself.

One more thing I want to be upfront about before signing off. How far you should harden your security depends entirely on you, your industry, and your organisation. Some teams need to implement all eight items above. For individual developers, just adopting Release Age Gates and eliminating persistent tokens will dramatically change the situation. There's no single right answer.

So please don't read this article as a checklist that says "do all of these." Read it as material for the question, **"in my particular situation, where do I take my first step away from being completely defenceless?"** Get out of the no-guard zone. Then, layer on hardening at a pace that fits your context. That's enough.

The previous article was the friendship arc. This one was the "my friend got mixed up with the wrong crowd" arc. The next time I run into Base64, I'd like it to be at an honest workplace. Maybe in the middle of sending an image to an AI, where I can think "Oh hey, look who it is," and we can just nod at each other in passing.

Until then, take care, both of us.

I'll be over here with detection rules running in CI. Waiting.

## References

### Supply chain attacks
- [npm Blog - Security incidents](https://github.blog/security/)
- [Socket.dev Blog](https://socket.dev/blog)
- [PyPI Security advisories](https://pypi.org/security/)

### Detection tools
- [Socket.dev](https://socket.dev/)
- [Snyk](https://snyk.io/)
- [GitHub Dependabot](https://github.com/dependabot)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [pip-audit](https://github.com/pypa/pip-audit)

### LLM security
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Prompt injection explainer (Simon Willison)](https://simonwillison.net/tags/promptinjection/)

### Related articles
- [Previous article: Increase My Familiarity with Base64](https://dev.to/akari_iku/increase-my-familiarity-with-base64-1e6b)
