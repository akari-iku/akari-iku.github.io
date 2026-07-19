---
title: >-
  【GAS x Gemini】Prompt to Create an In-house Web App with UI/UX Awareness in 15
  Minutes
description: >-
  Greetings from the island nation of Japan. We live in an era of AI-driven
  dreams, yet we still spend...
date: '2026-01-24'
tags:
  - gas
  - gemini
  - ai
  - webapp
lang: en
pair: gas-webapp-prompt
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2026-01-24-gas-x-geminiprompt-to-create-an-in-house-web-app-with-uiux-a.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan. We live in an era of AI-driven dreams, yet we still spend our afternoons wrestling with Google Sheets as if they were ancient stone tablets. Google Apps Script (GAS) has long been the "utility closet" of the digital workplace—functional, but usually aesthetically offensive enough to make a designer weep. I, too, have committed the sin of building tools that look like they were designed by a caffeinated toddler. But why settle for mere "vibes" when a 1,200-line prompt can weaponize high-end design guidelines to force elegance onto a humble spreadsheet? This isn't just about aesthetics; it's about tricking your colleagues into believing you have a secret design department in your home office. By the end of this, you'll be wielding a prompt that transforms a "mere macro" into a web app that finally respects human dignity.

## Introduction

With Gemini 3, you can now create a variety of things, but when it comes to daily use for work, wouldn't you say it's things like spreadsheets and slides?

I've created a prompt for developing GAS (Google Apps Script) web apps, for when you want to quickly build a web app without thinking about servers, and want to solve it with your Google account.

With a single command like "Make a to-do list app," a sufficiently level app is generated for v0.1.

## What is this?

This is a **Gemini Gem prompt** to rapidly accelerate UI/UX development for internal Google-like applications.

- **Generated a 96-point application with a single instruction: "Make a to-do list app."**
- 20 UI/UX items compliant with HIG (Human Interface Guidelines)
- Supports GAS-specific constraints (asynchronous processing, logical deletion, etc.)
- Standard implementation includes 6 themes, English UI, loading indicators, and Undo functionality.

*Note: The generated code is a "sample." A certain level of GAS knowledge (deployment, debugging, etc.) is required, and modifications through "vibe coding" (intuitively adjusting the code) are assumed.

## Demo App

I've put the app I made earlier here. Anyone should be able to run it (Google account login is required).

▽Prompting Task Management App


<a class="link-card" href="https://script.google.com/macros/s/AKfycbyQXBptLNkxcBBmKTTPWjy7mE_eXMAGqNcfFOsYQTvQwuPxYKuqpAs3O3Bu__ZM4lT2/exec" target="_blank" rel="noopener">
<span class="link-card-body">
<span class="link-card-domain">script.google.com</span>
<span class="link-card-title">https://script.google.com/macros/s/AKfycbyQXBptLNkxcBBmKTTPWjy7mE_eXMAGqNcfFOsYQTvQwuPxYKuqpAs3O3Bu__ZM4lT2/exec</span>
</span>
</a>


I wondered what to make, but since it's apparently a gateway to personal development, I just decided to go with this.
Basically, if you give it detailed instructions like "I want to create something like a WBS," "using JSON paste," and "expecting to export to Google Sheets," it will do it accordingly.
It's still a game of vocabulary.

---
## Recommended for

✅ Those who want to build Google-based tools for internal use
✅ When spreadsheets are sufficient as a database
✅ Those who don't want to spend time on server management and authentication
✅ Those who want to build an MVP at lightning speed
✅ But who don't want to hear "there's no UI/UX" or "it looks a bit shabby"
✅ **Those with a certain level of basic knowledge of GAS** (deployment, debugging, etc.)

---
## Not Recommended For These People

❌ Want to build a full-fledged web app (Next.js, Firebase recommended)
❌ Want to release to users outside of Google
❌ Require large amounts of data and high-speed processing (tens of thousands of rows or more)
❌ Require enterprise-level security

<aside class="callout">

**Caution**: This is a "choice when confined to the Google environment."
Accessibility, full responsiveness, and production security will require separate measures.
Please use this for "internal use," "drafts," "initial versions," "v1.0," or "for personal use."
You are welcome to distribute what you create using this prompt, but I cannot take responsibility for that.
Use it wisely.

</aside>

---
## What is a GAS Web App?

Google Apps Script is more than just "spreadsheet macros." Although that's a strong image.
Using `HtmlService`, you can create **web applications**.

### Conclusion: Can Web Apps Be Built with GAS?

**To put it bluntly, yes, you can.**

What's more,

*   No server construction required
*   Authentication can be delegated to your Google account
*   Frontend and backend are in the same project

With these features, it's highly compatible with **small to medium-sized business web applications**.
Or rather, when you think about needing to do something unnecessarily, you want fewer things to consider, so I personally recommend GAS web apps quite a bit.

### What You Can Do

-   **Turn your spreadsheet into a database**: CRUD operations, search, aggregation
-   **Integrate with Gmail**: Get information from your inbox and display it on a dashboard
-   **Integrate with Google Drive**: File management UI, automation of sharing settings
-   **Internal application forms**: Approval workflows + automatic Slack/email notifications

### Advantages

✅ **No server required** (managed by Google)
✅ **Free** (requires a Google account)
✅ **Authentication is handled by Google** (no OAuth implementation needed)
✅ **Deployment is lightning fast** (one button)
✅ **Easy integration between frontend and backend** (direct calls with `google.script.run`)

### Disadvantages

❌ **Execution time limits** (up to 6 minutes per execution)
❌ **Concurrent connection limits** (slows down with 30 simultaneous accesses)
❌ **No WebSocket** (real-time communication is not possible)
❌ **Not suitable for full-fledged web applications**
❌ **Learning curve** (unique APIs, debugging methods)
❌ **Cannot use Node.js / npm** (cannot use build environments like Webpack / Vite)
❌ **Cannot be publicly released if created with a Google Workspace account**
    -   Basically for internal deployment (specified domain) only
    -   Cannot set public access to "everyone with the URL" (can be set for everyone in the company)
    -   If you want external people to use it, you need to create it with a personal account

---
## When to Choose GAS Web Apps and When Not To

### ✅ Useful in These Situations

1. **Google-based tools within a company or department**
2. **When spreadsheets suffice as a database** (up to several thousand rows)
3. **When you don't want to manage servers** (no infrastructure knowledge needed)
4. **When you want to delegate authentication to Google Accounts** (managing authentication is a real pain)
5. **When you want to build something that works lightning fast** (15 minutes to 1 hour)

### ❌ Consider Other Options in These Cases

1. **Full-fledged web applications**
2. **When large amounts of data and high-speed processing are required** (tens of thousands of rows or more)
3. **When publishing to users outside of Google**
4. **For processes that take longer than 6 minutes to execute**

### Comparison with Other Options

| Use Case | Recommended Technology |
|---|---|
| Directly interacting with models, API integration | **Google AI Studio** |
| Enterprise-level ML | **Vertex AI** |
| Full-fledged web apps (Google environment) | **Firebase + Cloud Functions** |
| Modern full-stack | **Next.js + Vercel** |
| General-purpose development (AI assistance) | **Claude Projects** |
| **Internal Google-based apps (Spreadsheet DB)** | **GAS Web Apps** ← This time |

Additionally, recent trends involving integrating AI tend to go beyond the scope of GAS, as they involve APIs.

---
## 20 UI/UX Points to Keep in Mind

To avoid being told that your app "lacks UI/UX," here are 20 essential points, handpicked and refined from the **HIG (Human Interface Guidelines)**.

<aside class="callout">

**What is HIG?**
Industry-standard UI/UX principles that even Apple, Google, and Microsoft adhere to.
It's not about difficulty, but rather the difference between "knowing" and "not knowing."

</aside>

### Phase 1: Essential for All Apps (7 Items)

| # | Item | Overview |
|---|------|----------|
| 1 | **User Control** | Mandatory cancel buttons; avoid imposing actions unilaterally. |
| 2 | **Constraints** | Disable actions that cannot be performed. |
| 3 | **Feedback** | Visually indicate selected items. |
| 4 | **Visually Clear and Clutter-Free** | Hide unnecessary elements. |
| 5 | **Specific Action Verbs for Buttons** | Avoid "OK"; use "Save," "Delete," etc. |
| 6 | **Constructive Errors** | Clearly state what happened and how to resolve it. |
| 7 | **Actionable Without Confirmation** | Eliminate unnecessary confirmation dialogues. |

### Phase 2: Forms and Input UI (8 Items)

| # | Item | Overview |
|---|------|----------|
| 8 | **Order and Grouping** | Group related items and present them in a logical order. |
| 9 | **Button Gravity** | Place action buttons at the end of the flow. |
| 10 | **Positive Labels** | Use affirmative statements like "Do X" instead of negative ones like "Don't do X." |
| 11 | **Choice by Outcome** | Allow users to choose based on results, e.g., sliders instead of numerical input. |
| 12 | **Forgiving Input** | Automatically convert between full-width and half-width characters. |
| 13 | **Input Suggestions** | Implement auto-completion. |
| 14 | **Fail Safes** | Provide Undo functionality and soft deletes. |
| 15 | **Proximity Feedback** | Display errors close to the input field. |

### Phase 3: Enhancing UX (5 Items)

| # | Item | Overview |
|---|------|----------|
| 16 | **Minimise Memory Load** | Use placeholder text for input examples. |
| 17 | **Communicate Information Effectively** | Display "80% remaining" instead of "123MB." |
| 18 | **Instant Gratification** | Provide sample data upon first launch. |
| 19 | **Defer Decisions** | Minimise the number of required fields. |
| 20 | **Progressive Disclosure** | Collapse advanced settings. |

---
## Prompt Content

These 20 items were combined with **GAS-specific constraints** (asynchronous processing, logical deletion, etc.) to create the prompt.

### Main Features

#### 1. Handling GAS Constraints

- **Asynchronous processing delays** (1-3 seconds) → Loading display is essential
- **Uninterruptible processes** (cannot be stopped while GAS is running) → Client-side cancellation support
- **Irreversible operations** (spreadsheet editing) → Logical deletion (archiving) recommended
- **Real-time limitations** (no WebSocket) → Polling implementation

#### 2. Design System

- **6 Themes**: Light, Dark, Ocean, Forest, Sunset, Sakura
- **12-Colour Palette**: 2 background colours, 3 text colours, 4 UI element colours, 3 semantic colours
- **English UI Required**: All UI text in English

#### 3. Functional Requirements

- Smooth fade-out of the loading screen
- Theme switching (saved in localStorage)
- Tour function using Driver.js (5+ steps)
- Closing modal by clicking outside

#### 4. Checklist

An **AI self-check list of over 40 items** before output:

- Essential element check (9 items)
- English language check (4 items)
- HIG compliance check Phase 1-3 (20 items)
- GAS constraint compliance check (7 items)

### Prompt Body

The prompt is approximately 1,200 lines long, with detailed implementation and code examples.
I feel this is probably around the limit of a Gem's cognitive load.
There was actually more, but the rate of errors increased, so this seems like a good current balance.

<details><summary>Prompt Structure (Click to expand)</summary>


```markdown
# Gemini Gem Prompt for GAS Web App Boilerplate Development (HIG Compliant)

## Overview of the Application to be Developed
- App Name: English naming
- Purpose/Function: Defined from user instructions

## UI/UX Design System Requirements
### UI Text & Naming Conventions
- Use English for all UI text

### Human Interface Guideline Compliance
#### Phase 1: Mandatory for all Apps (7 items)
1. Ensure user control
2. Leverage constraints
3. Objects should embody their states
4. All interactive elements should have meaning
5. Use specific verbs for default buttons
6. Display errors constructively
7. Execute without silent (eliminate unnecessary confirmations)

(Detailed explanations and code examples for each item)

#### Phase 2: Forms & Input UI (8 items)
8. Give input forms a sense of narrative
9. Create a flow of operations (button gravity)
...

#### Phase 3: UX Enhancement (5 items)
16. Don't rely on user memory
...

### GAS-Specific Constraints and HIG Implementation Notes
1. Asynchronous processing and waiting times
2. Uninterruptible processes
3. Irreversible operations
4. Real-time limitations
5. Session management constraints

(Countermeasures and code examples for each constraint)

### Required Libraries and Fonts
- Arial (system font)
- Material Icons
- Driver.js

### CSS Design System
- 6 themes defined
- 12-colour palette
- CSS variables

### Functional Requirements & UI Logic
- Loading process
- Settings modal
- Tour function

### HTML Structure Template

## Strict Rules for Code Modification
- Modification algorithm
- Prohibited operation checklist

## Pre-Output Self-Checklist
- Essential element check
- English language check
- HIG compliance check Phase 1-3
- GAS constraint compliance check

## Output File Requirements
- Code.gs
- Index.html (all-in-one)
```


</details>

**Full Prompt Here**:
👉 [GitHub: gas-webapp-prompt_en](https://github.com/akari-iku/gas-webapp-prompt_en)

---
## Verification: "Make a to-do list app"

### Instructions

After registering the prompt in Gemini Gem, enter the following single line:

```
Make a to-do list app
```

That's all. No detailed functional instructions were given.

### Generated Result

In approximately 30 seconds, the following files were generated:

1.  **Code.gs** (approx. 35 lines)
    *   Simulated server-side processing
    *   Task archiving support
    *   Sample data generation

2.  **Index.html** (approx. 400 lines)
    *   HTML/CSS/JS all-in-one
    *   6 themes implemented
    *   Driver.js tour
    *   Toast notifications with Undo functionality

A generation example can be viewed at [GitHub: examples_en/task-manager_en](https://github.com/akari-iku/gas-webapp-prompt_en/tree/main/examples_en/task-manager_en).

### Features

#### Core Functionality
- Add and delete tasks
- Completion check
- Archiving (soft delete)
- Priority levels (1-3 stars)

#### UI/UX
- 6 theme options for switching
- Visualisation of priority (star rating)
- Inline error display
- Undo feature (with toast notification)
- Automatic generation of sample data on first launch
- Automatic tour activation

#### GAS Integration
- Client-side storage with server simulation
- Soft delete (`archived` flag)
- Loading indicators
- Error handling

### Evaluation Results

Based on an evaluation using a 20-item checklist:

| Category           | Number of Items | Max Score | Score Obtained | Achievement Rate |
|--------------------|-----------------|-----------|----------------|------------------|
| **Level 1: Basic** | 4               | 40        | 40             | **100%**         |
| **Level 2: HIG Phase 1** | 7               | 70        | 68             | **97%**          |
| **Level 3: GAS Constraints** | 3               | 30        | 30             | **100%**         |
| **Level 4: Details** | 6               | 60        | 54             | **90%**          |
| **Overall**        | **20**          | **200**   | **192**        | **96%**        |

Please refer to the [Evaluation Sheet](https://github.com/akari-iku/gas-webapp-prompt_en/blob/main/docs_en/evaluation.md) for details.

### Particularly Excellent Points

#### 1. Logical Deletion Properly Implemented

```javascript
function archiveTask(id) {
  const task = tasks.find(t => t.id === id);
  task.archived = true;
  renderTasks();
  
  google.script.run
    .withSuccessHandler(() => {
      showToast('Task archived', 'info', {
        action: 'Undo',
        callback: () => {
          task.archived = false;
          renderTasks();
        }
      });
    })
    .archiveTaskOnServer(id);
}
```

A "Undo" button appears in a toast notification, and it can be restored by clicking.
Nice job, well done.

#### 2. Inline Error Display

```javascript
if (!titleInput.value.trim()) {
  document.getElementById('titleError').style.display = 'block';
  titleInput.style.borderColor = 'var(--error)';
  return;
}
```

Errors appear immediately next to the input field with visual indication.
Excellent adherence to HIG proximity feedback principle.

#### 3. Good First-Time Experience

```javascript
function checkFirstVisit() {
  if (!localStorage.getItem('hasVisited')) {
    localStorage.setItem('hasVisited', 'true');
    setTimeout(startTour, 800);
  }
}
```

Instead of an empty app, sample data that can be interacted with immediately is provided.
And automatically showing a tour on the first visit is extremely well done.
This is important because the concept of "read me" often gets lost when one doesn't read primary sources (based on my own fruitless past experiences).

#### 4. Appropriate Handling of GAS Constraints

For all GAS calls:
- `withSuccessHandler` / `withFailureHandler`
- Loading indicators
- Button disabling (to prevent double-clicks)

### Areas Requiring Improvement

#### 1. Generic Error Messages (-2 points)

No solutions were suggested. Ideally, specific troubleshooting steps like "Please enter a task title" should be provided.

This is perhaps a bit strict. If that were the case, telling the user to ask the AI would suffice.

#### 2. Lack of Statistical Information Display (-3 points)

While priority visualization and pending count are implemented, there's no completion rate display. There's room for improvement based on the principle of "information over data."

This is also fine, as with "vibe coding," if you mention "I want this feature" in a conversation started with Gem, it will suggest modifications to the source code or specify locations, so there's no problem.

#### 3. Weak Visual Grouping of Forms (-3 points)

While the logical order of items is good, there's no visual separation (sections).

This might have been difficult to check as it's a simple task management app. This might be an issue with my own selection.

---
## How to Use

### 1. Create a Gemini Gem

1. Access [Gemini](https://gemini.google.com/)
2. Click "Gem" in the left sidebar
3. Click "Create new Gem"
4. Gem name: `GAS Web App Development Assistant`
5. Description: `Generates HIG-compliant GAS Web Apps`

### 2. Register the Prompt

Copy the [GitHub prompt](https://github.com/akari-iku/gas-webapp-prompt_en/blob/main/prompt_en/gas-webapp-prompt-hig_en.md) and paste it into the "Instructions" field of your Gem.

### 3. Try it out

In the chat with your Gem:

```
Make a to-do list app
```

or

```
Create a dashboard to display spreadsheet data
```
Tell it what you want to build.

### 4. Deploy to GAS

Copy and paste the generated code into the GAS editor:

1. Access [Google Apps Script](https://script.google.com/)
2. Click "New project"
3. Paste the content of `Code.gs`
4. Click the "+" button, select "HTML", and create it with the name `Index`
5. Paste the content of `Index.html`
6. Click "Deploy", then "New deployment", and select "Web app"
7. Set the access permissions and click "Deploy"

---
## Usage Notes

### ✅ What You Can Do

- **Create a "plausible" UI in 15 minutes.**
- **Rapidly accelerate UI/UX development for internal Google Workspace apps.**
- **Achieve a sufficient level for an initial draft or a stepping stone.**

### ❌ What You Cannot Do (Requires Additional Action)

- **Accessibility features** (screen readers, keyboard navigation, etc.)
- **Full responsive design** (smartphone optimisation, touch UI, etc.)
- **Production-level security** (XSS prevention, CSRF prevention, etc.)
- **Performance optimisation** (handling large data, complex aggregations, etc.)

### Prerequisites

**Basic knowledge of Google Apps Script (GAS) is required:**
- Deployment methods
- Using PropertiesService or interacting with Google Sheets
- Debugging errors
- Understanding the `google.script.run` mechanism

The generated code is a "sample." While it may work as-is, adjustments and modifications may be necessary. As usual (?), use it with the understanding that you'll need to fine-tune it through "vibe coding."

<aside class="callout callout-alert">

**This is a "stepping stone," an "initial draft," or a "demo before the demo."**

It is ideal for prototyping internal tools, validating MVPs, and visualising ideas. However, for externally facing web services, systems handling personal information, or mission-critical applications, additional security measures and testing are essential.

</aside>

---

## How to Customise

### I want to add a theme

Edit the following part of the prompt:

```markdown
### 2. CSS Design System (Style)

Make sure to include all of the following **6 types** of theme definitions.
→ Increase the number, change the colours
```

### I want to reduce the HIG items

If the prompt is too long, you can remove Phase 2/3 and keep only Phase 1 (7 items):

```markdown
#### 【Phase 1】Basic Principles for All Apps (7 items)
(Keep only this)

#### 【Phase 2】Principles for Forms and Input UIs (8 items)
(Remove)

#### 【Phase 3】Principles for UX Improvement (5 items)
(Remove)
```

### I want to strengthen GAS constraint support

Add items to the "GAS Specific Constraints" section of the prompt:

```markdown
#### 6. Handling Large Amounts of Data

**Constraint**: Spreadsheets with tens of thousands of rows or more experience delays.

**Countermeasures**:
- Implement pagination.
- Perform filtering on the GAS side.
- Utilise caching.
```

---

## Summary

"No UI/UX"

Even in an era where AI writes code at lightning speed, generated UIs can still feel "a bit off."

From a product designer's perspective, there's likely a lot of room for improvement.
However, there's a certain baseline that's good to keep in mind when creating a "draft," "MVP," or "demo before the demo."

This baseline has been distilled into a 1,200-line prompt to accelerate UI/UX development for web applications built using Google services for internal use.

For fine-tuning, use vibe coding.

## Links

- **Prompt Core**: [GitHub: gas-webapp-prompt_en](https://github.com/akari-iku/gas-webapp-prompt_en)
- **Example (FocusFlow)**: [examples_en/task-manager_en](https://github.com/akari-iku/gas-webapp-prompt_en/tree/main/examples_en/task-manager_en)
- **Evaluation Sheet**: [docs_en/evaluation.md](https://github.com/akari-iku/gas-webapp-prompt_en/blob/main/docs_en/evaluation.md)
- **Related HIG Reference**: [Sociomedia HIG](https://www.sociomedia.co.jp/category/shig)
- **Official GAS Documentation**: [Google Apps Script](https://developers.google.com/apps-script)

---
## About Distributing Prompts
This was a minor but useful realisation. Consequently, it was quite a hassle to set up all the links.
I've tried my best to be careful, but please forgive any mistakes as I am only human.
