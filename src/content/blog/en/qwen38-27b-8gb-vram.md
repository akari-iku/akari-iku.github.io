---
title: I Squeezed a 27B Into 1-bit on 8GB of VRAM. The 8B at 4-bit Won Anyway
description: >-
  Field notes from stuffing a local LLM into 8GB. Unsloth's 1-bit quant of
  Qwen3.8-27B does load and does 31 tok/s, but qwen3:8b at 4-bit in the same
  footprint was faster and more accurate. And the endless Japanese loops were
  never the quantisation's fault: the culprit was a missing presence_penalty,
  which Ollama supports but leaves out of the Modelfile table.
date: '2026-08-20'
tags:
  - ollama
  - llamacpp
  - llm
  - localllm
lang: en
pair: qwen38-27b-8gb-vram
source: dev
accent: '#E5007F'
---

<!-- generated from articles/source/en/2026-08-20-qwen38-27b-8gb-vram.md by scripts/import-articles.ts - do not edit -->

We are a nation that takes quiet pride in fitting entire worlds into small containers (bonsai, bento, capsule hotels), so naturally I spent my weekend trying to fit a 27-billion-parameter language model into a gaming GPU with 8GB of VRAM. The menu now goes down to **1-bit quantisation**, which I can only describe as freeze-drying a whale and insisting it can still sing. And to be fair, the whale did fit, and it did sing at 31 tokens per second (mostly about cherry blossoms blooming in summer, then again in autumn). Meanwhile, the small 8B model I once patronised as "a sweet, hardworking kid" solved everything on the first try and went home early. I believe there is a lesson here about knowing one's size, in silicon as in life. By the end of this read, you'll know precisely where compression turns into cruelty, and why the real culprit was **a single missing parameter** all along. Seriously.

## Introduction

This isn't a strict benchmark, just a quick log of me messing around with 1-bit models on an 8GB card.

In my last post, I wrote about running Cloudflare OS on an 8GB VRAM gaming PC, where it took a whole 5 rounds just to play a single game of tic-tac-toe.


<a class="link-card" href="https://akari-iku.github.io/en/blog/cloudflare-os-local-llm-five-rounds/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/en/blog/cloudflare-os-local-llm-five-rounds.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">Running Cloudflare OS on a Local LLM, and Why One Tic-Tac-Toe Took Five Rounds | akari.log</span>
</span>
</a>


Back then, I was using `qwen3:8b`. She was a sweet, hardworking little model, even if she did insist on trying to import Deno into Cloudflare Workers. (I'm really attached to the Qwen model, so I refer to it as "she" on my site.)

Then, on August 18th, Unsloth dropped this:

> Qwen3.8-27B Unsloth GGUF is now the #2 trending model on Hugging Face with 2.7M downloads! 💗
>
> Unsloth also reached #3 trending on GitHub!
>
> Thanks so much for the love!


<blockquote class="tweet-card">
<p class="tweet-card-text">Qwen3.8-27B Unsloth GGUF is now the #2 trending model on Hugging Face with 2.7M downloads! 💗<br /><br />Unsloth also reached #3 trending on GitHub!<br /><br />Thanks so much for the love!<br /><br />Model: https://t.co/xIdNwm7CLQ<br />GitHub: https://t.co/aZWYAtakBP</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2089541444466090064" target="_blank" rel="noopener">2026-08-18 · x.com →</a></footer>
</blockquote>


2.7 million downloads and #2 trending.
Seeing that, I thought, "Alright, here we go." With that many downloads, I figured there had to be a quantised version that could actually fit on an 8GB card.

Since it was a weekday and I had work, I figured I'd wait for the weekend to play around with it, maybe starting casually with the 2-bit version.

My peaceful wait lasted less than two days.

The second I looked away, a 1-bit quantised version popped up. The tweet went out at **0:47 the exact same day**, though I didn't notice it until that evening.

<blockquote class="tweet-card">
<p class="tweet-card-text">We’re releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.<br /><br />Unsloth Dynamic V3 outperforms others by &amp;gt;10% on Div-300, KLD &amp;amp; more benchmarks.<br /><br />We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.<br /><br />Blog: https://t.co/tHsBexyh2K<br />GGUF: https://t.co/xIdNwm7CLQ</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2090103470015828184" target="_blank" rel="noopener">2026-08-19 · x.com →</a></footer>
</blockquote>


Talk about fast. Way too fast for someone just trying to casually appreciate Qwen between work hours.

From there, it turned into a full 1-bit test session, and I ended up digging out `qwen3:8b` from my last post just to compare.

The takeaway: **In the same 8GB bucket, running an 8B model at 4-bit is both faster and more accurate.** It’s pretty common sense: you’re better off using a smaller model with higher precision than heavily crushing a larger one. But you never really know *how* big the gap is until you measure it. In a simple leap year check, the 27B 1-bit model agonized for 700 tokens and couldn't pull it off, while the 8B model nailed it in 43 tokens.

That 8B model is the same sweet kid I mentioned earlier.

I managed to push the speed from 5.82 all the way to 31.87 tok/s.
I got it running fast, but **I hit a quality wall way before speed became the bottleneck**. The culprit wasn't the bit depth. It was a single missing parameter: `presence_penalty`. I had gone through all my testing wrongly assuming you couldn't specify this in Ollama.

At this point, you're beyond the "just casually messing with local LLMs in Ollama" phase. If Ollama gets the job done, great; it’s much easier that way. But once you start making crazy demands, you end up taking your first steps down the rabbit hole of tinkering with llama.cpp.
I have a feeling that once you get a taste of llama.cpp, there's no going back to Ollama.

## Setup

Same machine as last time.
Built for gaming, definitely not set up for AI work.

| Item | Value |
| --- | --- |
| OS | Windows 11 |
| GPU | RTX 5060 / VRAM 8151 MiB |
| RAM | 32 GB |
| Ollama | 0.32.14 |

## Test Methodology

- Single run per task (didn't average out multiple runs with the same prompt)
- Seed was not fixed
- For the 8B model, I just fed it the raw `qwen3:8b` Ollama blob without checking the quantisation format
- Truncated tok/s values using `jq` (which is why 8B shows as "47" across all three tasks)
- `llama-server` was the version bundled with Ollama (forgot to note the build number)
- File sizes aren't unified: 27B uses Hugging Face's display size (6.19GB), while 8B uses `ls -lh` GiB (4.9G). Note that `ollama list` shows the same `qwen3:8b` as 5.2GB

Since it's all based on a single sample, I'm only looking at differences big enough that the rankings won't flip.

## "Runs on 8GB" Didn't Mean 8GB VRAM

This is where I tripped up first.
Here's the hardware requirements table from Unsloth's docs:


<a class="link-card" href="https://unsloth.ai/docs/models/qwen3.8" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F2815821428-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FHpyELzcNe0topgVLGCZY%252Fsites%252Fsite_mXXTe%252Fsocialpreview%252FOeFDVbzp4cgwaId7PbvL%252Funsloth%2520docs%2520pic.png%3Falt%3Dmedia%26token%3Df34a6bcc-db15-449a-bc2d-e0e8f52fe953&amp;width=1200&amp;height=630&amp;sign=9a9d6aae5e35625d4a32adaf8cf74290&amp;sv=3" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">unsloth.ai</span>
<span class="link-card-title">Qwen3.8 - How to Run Locally | Unsloth Documentation</span>
</span>
</a>


| 1-bit | 2-bit | 3-bit | 4-bit | 6-bit | 8-bit | BF16 |
| --- | --- | --- | --- | --- | --- | --- |
| 7-8GB | 9-11GB | 12-14GB | 16-19GB | 23-26GB | 31GB | 56GB |

**These numbers mean total System RAM + VRAM**, not VRAM alone. It's written right there in the table header. Since unified memory Macs are lumped into the same category, Unsloth's logic makes total sense. The runtimes listed on the page are llama.cpp, vLLM, and Unsloth Desktop. **Ollama isn't even mentioned** (though you'll find the `ollama run` command on their Hugging Face model page).

The confusion happens when you read this assuming a single 8GB VRAM card. Thinking "2-bit takes 9–11GB, so my 8GB card should handle it" was answering a completely different question than what the table was actually saying.

Here are the actual file sizes (unsloth/Qwen3.8-27B-GGUF):

| Quant | Size |
| --- | --- |
| UD-IQ2_XXS | 7.27 GB |
| UD-IQ2_S | 8.37 GB |
| UD-Q2_K_XL | 9.83 GB (Unsloth's recommended baseline for minimum quality) |
| UD-Q3_K_XL | 13.1 GB |

If we're talking VRAM (8151 MiB), the only one that fits "just for the weights" is UD-IQ2_XXS. Since Unsloth's recommended minimum quality baseline is 9.83GB, you're forced to pick a tier below that. The odds are stacked against you before you even start.
Seriously, I need a dedicated rig stacked with VRAM (or just tons of memory in general) as soon as possible.

## Ollama handled qwen3.8 like a champ

Since it's a brand new architecture, I was worried the backend might not support it yet, but those fears turned out to be completely groundless.

- `qwen3.8:27b` (18GB, 256K context) is already in the official Ollama library → the runner handles the `qwen3.8` architecture just fine
- Pulling the Unsloth GGUF straight from `hf.co/` worked flawlessly
- Didn't run into any `mmproj` (vision projector) headaches

That last one is a huge relief behind the scenes. Back in the Qwen3.6 days, loading a GGUF with `mmproj` into Ollama caused `families` to get flagged as `['qwen35moe', 'clip']`, which broke model loading for a lot of people ([#14730](https://github.com/ollama/ollama/issues/14730)). With Qwen3.8 + Ollama 0.32.14, I managed to dodge that landmine entirely.

```bash
ollama pull hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS
# → Download finished at 8.2 GB, ran inference right out of the box
```

## Squeezing every last bit of performance out of Ollama

Here's the untouched baseline:

```text
SIZE       9.0 GB
PROCESSOR  40%/60% CPU/GPU
CONTEXT    16384
eval rate  5.82 tokens/s
```

40% of the workload is still stuck on the CPU. Time to start trimming the fat.

### Closing all my apps only saved a lousy 555 MiB

I figured, "I might as well close Chrome and whatever else is running," so I actually checked the numbers.

| State | VRAM Usage | Free VRAM |
| --- | --- | --- |
| Model loaded | 6891 MiB | 1006 MiB |
| Model unloaded | **555 MiB** | 7342 MiB |

Discord, VS Code, EdgeWebView, and Windows shell processes combined were only eating up 555 MiB. And since you can't exactly kill `explorer.exe` or essential system shells, the actual gain was maybe 300–400 MB. The model was already short by 1.7 GB, so this was a total drop in the bucket.
Seriously, this is one of those things I absolutely hate about Windows.
Switching back to Linux would be the ideal move here, but there are just way too many friction points.
For my day-to-day personal use, Windows is still the most practical choice, so I'm staying put.

In my last post with this setup, I mentioned that "desktop background processes take up 1.1 GB," but it was even lower this time around. I was actively working with a bunch of Chrome tabs open last time, which probably explains the difference. Either way, it's not the kind of margin that moves the needle.

The real tweaks need to happen in the settings. Let's dig in.

### It's KV cache quantisation that drives speed, not context length

Quantizing the KV cache to `q8_0`:

```text
SIZE       8.5 GB   (-500MB)
PROCESSOR  39%/61% CPU/GPU
CONTEXT    16384
eval rate  6.21 tokens/s   (+7%)
```

That chopped off 500 MB while keeping the full context length intact, more than double what I could save by closing every app on my PC.

Next, I dropped the context length from 16384 down to 4096 (via Modelfile).

```text
SIZE       8.1 GB
PROCESSOR  33%/67% CPU/GPU
CONTEXT    4096
eval rate  6.30 tokens/s (generated 4029 tokens)
```

**Slashing `num_ctx` barely made a dent in speed** (6.21 → 6.30 tok/s). VRAM usage dropped from 8.5 to 8.1 GB and CPU offloading dropped from 39% to 33%, but none of that translated into faster inference. I haven't isolated why it barely budged. I'll just leave this key takeaway as is: **freeing up VRAM doesn't automatically equal a speed boost**.

By the way, during testing I briefly hit 8.19 tok/s, but **I tossed that run out as invalid because it only generated 9 tokens**. With a tiny 9-token output, slight token-to-token variance heavily distorts the average, making the numbers jump around wildly. You need at least a few hundred tokens to get a meaningful comparison.

I almost wrote "+30% speed boost!" right into the draft.
Glad I caught myself before calling out my own bogus metric.

## Switching to llama.cpp gave me a +48% boost

Once I hit a wall with Ollama, I moved over to llama.cpp. The result: **with the exact same model and VRAM usage, inference sped up from 6.30 to 9.35 tok/s**.

```text
gen_per_s   9.35 tokens/s
VRAM        7779 MiB / 8151 MiB
Params      -c 4096 -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja
```

### `llama-server` comes bundled right inside Ollama

You don't even need to install anything extra to try it.
**Ollama actually includes a fully featured `llama-server.exe` right out of the box.**

```text
%LOCALAPPDATA%\Programs\Ollama\lib\ollama\llama-server.exe
```

I was initially worried it might be a stripped-down fork with missing features, but it turned out to be the complete build; it even supports `-ot` (device allocation per tensor) and `-ncmoe` (offloading only MoE expert layers to the CPU).
What a relief. Windows often suffers from random missing features or poor support in these tools, so I was glad this wasn't the case.

You don't need to re-download GGUF files either.
You can just pass the blobs Ollama already downloaded straight to `-m`:

```bash
ollama show --modelfile <model> | grep FROM
# → %USERPROFILE%\.ollama\models\blobs\sha256-e792d8fb3142...  (model weights)
#   %USERPROFILE%\.ollama\models\blobs\sha256-83ee4f4f205f...  (mmproj)
```

### Three options you can't touch in Ollama

These are the settings Ollama doesn't expose:

- **Splitting `-ctk` and `-ctv` independently**: Ollama only lets you set K and V together (`OLLAMA_KV_CACHE_TYPE`). llama.cpp lets you tweak them separately, like `-ctk q8_0 -ctv q4_0`. This time, I kept K at `q8` and squeezed V down to `q4`. I’d heard that quantizing V hurts quality less than K, though I haven't benchmarked that myself.
- **Manual `-ngl` control**: Ollama's auto-detection leaves a safety margin. If you want to push your VRAM to the absolute limit, you need manual overrides.
- **`-ot` (`--override-tensor`)**: Allows tensor-level placement, like assigning attention layers to the GPU and FFN layers to the CPU. It gives you much finer control than offloading entire layers. Ollama doesn't even have a concept for this.

That said, I only actually used the first two this time; **I left `-ot` untouched**. Since I didn't isolate which specific setting delivered that +48% jump, all I can really say is that "I gained access to settings Ollama doesn't offer."

All three of these options fall under "things you don't care about if you have enough VRAM."
You only need them when you're running out of room.

I know, I know. I'm just airing out my hardware limitations here. Painful to admit, but you can't use what you don't have.

## How to choose between Ollama and llama.cpp

This isn't about "ditching" Ollama. Since `llama-server.exe` lives right inside Ollama's install folder, both are available on your machine from day one. Stick with Ollama for daily use, and drop down to the bundled executable whenever you run into a bottleneck.

### Feature breakdown

| Feature | Ollama | llama-server |
| --- | --- | --- |
| KV Cache Quantisation | Set K/V **together** (`OLLAMA_KV_CACHE_TYPE`) | Set K/V **independently** (`-ctk` / `-ctv`) |
| `presence_penalty` | Supported (missing from Modelfile docs table) | Supported |
| GPU Layer Count | Manual control via `num_gpu` | Manual control via `-ngl` |
| Tensor-level Placement | No concept of this | Supported via `-ot` (e.g., Attention on GPU, FFN on CPU) |
| Offload MoE Experts to CPU | Not supported | Supported via `-ncmoe` |
| Chat Template | Converts to its own format | Uses GGUF's built-in template directly via `--jinja` |
| Thinking Control | `think` (bool or low/medium/high/max) | `chat_template_kwargs` |
| Passing Configuration | Env vars (**prone to silent failures**) | CLI arguments (foolproof) |

### Day-to-day usability: Ollama wins easily

Looking at the feature list alone, llama.cpp seems like an absolute blowout, but for daily workflow, Ollama is way more convenient.
Or rather, it's just plain easier.

- **`ollama ps` is amazing.** It shows GPU/CPU split, context length, and model size in a single command. I did almost all my testing using this. With `llama-server`, you're stuck digging through raw startup logs.
- **Model management.** Pulling directly from Hugging Face via `ollama pull hf.co/...` handles blob storage automatically. With `llama-server`, you're on the hook for managing GGUF file paths yourself.
- **Auto-unloading.** Automatically frees up VRAM after 5 minutes of idle time. `llama-server` sits in memory until you manually kill the process.
- **Model switching.** Change models per API request. `llama-server` is strictly one model per process.

Without `ollama ps`, this whole testing session would've taken me twice as long.

### Which one should you use?

| Scenario | Recommendation |
| --- | --- |
| Running models built for your VRAM tier (e.g., 8B 4-bit) | **Ollama is plenty** |
| Want to cram every last byte into VRAM | llama-server (`-ngl` / `-ot`) |
| Output gets stuck in endless repetition loops | **Ollama is fine** (`presence_penalty` works on both) |
| Need to squeeze the KV cache just a tiny bit more | llama-server (drop just `-ctv` to `q4`) |
| Suspect chat template issues | llama-server (`--jinja`) |

I only needed llama.cpp this time because I attempted the absurd task of crushing a 27B model down to 1-bit. The 8B 4-bit model I tested later finished naturally with `finish: stop` across all three tasks without cutting off once. As long as you stick to models that actually fit your setup, Ollama won't hold you back.

## Gotchas

### `setx` alone won't pass env vars to Ollama

This is what ate up most of my time.

Even if you run:

```bash
setx OLLAMA_FLASH_ATTENTION 1
setx OLLAMA_KV_CACHE_TYPE q8_0
```

Run that, restart Ollama, and **the settings still won't take effect**. I only realised this because the `SIZE` in `ollama ps` wasn't budging.

- `setx` writes to User environment variables and broadcasts `WM_SETTINGCHANGE`.
- But the environment block of an already running process never gets updated.
- If you launch the Ollama tray app through another process (a shell, `cmd`, etc.), it inherits the old, stale environment from its parent.

The insidious part is that the User environment variables themselves *are* saved correctly.

```powershell
[Environment]::GetEnvironmentVariable('OLLAMA_FLASH_ATTENTION','User')  # → 1
[Environment]::GetEnvironmentVariable('OLLAMA_KV_CACHE_TYPE','User')    # → q8_0
```

They're sitting right there in the registry, but doing absolutely nothing. Because checking them shows no anomalies, you stop suspecting your configuration and start looking in all the wrong places.

The workaround is to launch Ollama with the variables explicitly passed in:

```powershell
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe"
```

You can confirm it worked by watching the `SIZE` column in `ollama ps` drop (e.g., from 9.0GB down to 8.5GB).

### Don't slash `OLLAMA_CONTEXT_LENGTH` globally

This runs head-first into a lesson I learned the hard way in my last post.

- Ollama defaults to a 4096 context length (whenever VRAM is under 23 GiB).
- If it's too short, long system prompts get quietly chopped off without a single error or warning.
- I fell into this exact trap last time, which is why I set `OLLAMA_CONTEXT_LENGTH=16384` globally.

If you drop this back to 4096 just to free up VRAM, you're stepping right back onto that same landmine for agent tasks. That issue just causes the model to gradually lose its mind without saying a word, definitely not something I want to debug twice.

**The proper fix is setting it per-model in a `Modelfile`, not via global env vars.**
Looking back, that was totally on me: last time, I lazily asked the system to "just mess with env vars or whatever."
Note to self: give clear, precise instructions. If you feed it Garbage In, Garbage Out, the blame lies entirely with the person behind the keyboard. My bad.

```dockerfile
FROM hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS

PARAMETER num_ctx 4096
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER top_k 20
PARAMETER min_p 0.0
```

```bash
ollama create qwen38-8g -f Modelfile
```

Now you can have the best of both worlds: 4096 for the heavy 27B model, and 16384 for agent workloads.

### Windows won't give you per-process VRAM via `nvidia-smi`

```bash
nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv
```

The process list shows up fine, but `used_gpu_memory` reads `[N/A]` across the board. This is a WDDM driver model limitation; Windows just can't report GPU memory broken down by process.

That's why that "555 MiB" number earlier was calculated old-school style: by taking total VRAM usage before and after loading/unloading the model and doing the math. Primitive, but it's the only option.
Honestly, moving away from Windows altogether might be the real solution here.

### The bundled `llama-server` won't pick up the GPU out of the box

```text
warning: no usable GPU found, --gpu-layers option will be ignored
```

Even with `-ngl 99` set, it was completely ignored. It only allocated 602 MiB of VRAM and fell back to running on the CPU.

Turns out, **the CUDA backend DLLs aren't in the same directory as the executable**. `llama.cpp` looks for backend DLLs in its own folder, but Ollama lays out its directory tree like this:

```text
lib\ollama\llama-server.exe
lib\ollama\cuda_v12\ggml-cuda.dll
lib\ollama\cuda_v13\ggml-cuda.dll   ← RTX 50xx (Blackwell) lives here
lib\ollama\vulkan\
lib\ollama\rocm_v7_1\
```

Since `cuda_v13` also holds dependent DLLs like `cublas64_13.dll`, you have to prepend that directory to your `PATH` and explicitly point to the DLL using `GGML_BACKEND_PATH`.

```powershell
$cuda = "$base\cuda_v13"
$env:PATH = "$cuda;$base;$env:PATH"
$env:GGML_BACKEND_PATH = "$cuda\ggml-cuda.dll"
& "$base\llama-server.exe" -m $model -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja
```

With that fix, VRAM usage shot up from 602 MiB to 7779 MiB.

### Japanese comments in PowerShell blew up `param()` completely

```text
代入式が無効です。
+     [int]$Ngl = 99,
```

The first line reads "the assignment expression is invalid." The entire `param()` block threw a parse error. The issue wasn't the code logic. It was the **file encoding**. Windows PowerShell 5.1 tried parsing a UTF-8 (no BOM) file containing Japanese comments as CP932 (Shift-JIS), corrupting the lines and taking the `param()` block down with it.

The line flagged in the error message was completely innocent. Lesson learned: write your PowerShell comments in English or save your scripts as UTF-8 with BOM.
Honestly, at this point, weird PowerShell quirks just feel like a Tuesday. If stuff like this rattled me, I wouldn't last a day on Windows anyway.

## A 1-bit model dropped out of nowhere mid-testing

On August 20th, right while I was tinkering with 2-bit models and taking notes, this tweet popped up the second I looked away. Posted at 0:47:

> We're releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.
>
> Unsloth Dynamic V3 outperforms others by >10% on Div-300, KLD & more benchmarks.
>
> We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.


<blockquote class="tweet-card">
<p class="tweet-card-text">We’re releasing new Qwen3.8-27B GGUFs with 10% higher accuracy.<br /><br />Unsloth Dynamic V3 outperforms others by &amp;gt;10% on Div-300, KLD &amp;amp; more benchmarks.<br /><br />We also release 1-bit quants that retain 77% accuracy. Run on 8GB RAM.<br /><br />Blog: https://t.co/tHsBexyh2K<br />GGUF: https://t.co/xIdNwm7CLQ</p>
<footer class="tweet-card-meta"><span>Unsloth AI @UnslothAI</span><a href="https://x.com/UnslothAI/status/2090103470015828184" target="_blank" rel="noopener">2026-08-19 · x.com →</a></footer>
</blockquote>


Wait, 1-bit?!

I checked the Hugging Face collection and saw "Updated 6 hours ago." What started as a lazy afternoon playing with models immediately pivoted into a full-on 1-bit testing session.

And notice that line: "Run on 8GB RAM." **That 8GB target was actually referring to 1-bit, not 2-bit.** Looking back at the requirements table from the intro, 1-bit specifies "7-8GB," while 2-bit calls for "9-11GB."

That said, when I first started, the smallest option on Hugging Face was UD-IQ2_XXS at 7.27GB; no 1-bit quants were listed yet. I only grabbed 2-bit initially because it was literally the absolute bottom tier available; **more options simply dropped later**.

Instead of going back to 2-bit, I decided to dive straight into 1-bit.
Benchmarking high-bit quants, running tests on enterprise VRAM setups, measuring actual throughput on DGX Sparks or high-bandwidth rigs: people with those setups are already covering that.
I see those posts all over my X timeline every single day.
**Getting a chance to push a 1-bit model on a modest 8GB card only happens in moments like this.** Plus, it felt like almost nobody else was going to do a semi-serious 1-bit deep dive anyway, so why not take the plunge?

Keep in mind that accuracy claims vary depending on where you look. The tweet says 77%, while the docs claim around 72% (for UD-IQ1_S). Both refer to top-1% accuracy retention, but since neither explicitly cites the benchmark used, I took it with a grain of salt. I'll circle back to this later.

| Quant | Size | Fits in 8GB VRAM? |
| --- | --- | --- |
| UD-IQ1_S | **6.19 GB** | **Fits completely** |
| UD-IQ1_M | 6.73 GB | Barely fits |
| UD-IQ2_XXS | 7.27 GB | Doesn't fit (33% offloaded to CPU) |

Going down to 1-bit was the first time **CPU offloading dropped to zero**.

```text
VRAM        6974 MiB / 8151 MiB (923 MiB free)
gen_per_s   30.47 tokens/s
prompt/s    95.0 tokens/s (was 0.92 on 2-bit)
```

Prompt processing jumping from 0.92 to 95.0 tok/s (a **100x speedup**) is absolute proof that every single layer is sitting natively on the GPU.
While token generation only tripled, prompt evaluation operates in a totally different universe depending on whether layers spill over onto the CPU.
Seeing that number blew my mind.

So, the speed issue was officially solved. Now onto the real meat of the problem.

## The culprit wasn't bit depth: it was `presence_penalty`

While tuning for speed, one issue drove me crazy: even when explicitly instructed to write "about 200 characters," the model would spew out 4,000+ tokens and refuse to stop. I initially blamed it on the 2-bit quantisation.

### The symptom: Endless Japanese output loops

Here's an actual run from the 2-bit model (UD-IQ2_XXS) when asked to "Describe Japan's four seasons in roughly 200 Japanese characters":

```text
**Spring**
In Japan, spring is when cherry blossoms bloom, cherry blossoms are in full bloom, and it becomes the cherry blossom season. Spring is when cherry blossoms bloom, cherry blossoms are in full bloom, and it becomes the cherry blossom season.
Spring is when cherry blossoms bloom, cherry blossoms are in full bloom, and it becomes the cherry blossom season. (Repeated 9 more times)

**Summer**
Summer is hot, summer is hot, summer is hot, summer is hot, summer is hot, (Repeated 18 times)
```

(The actual output was in Japanese; translated here for readability.)

The exact same thing happens with the 1-bit model during its thinking phase.
Except it's even more absurd: **cherry blossoms start blooming in both summer and autumn**.
How lovely.

```text
**夏 (Summer):**
- Cherry blossoms (桜) bloom
**秋 (Autumn):**
- Cherry blossoms (桜) bloom
```

Both the Japanese seasons and the Japanese language completely fell apart. Hard to miss.

### Fixed instantly with `presence_penalty 1.5` and disabled thinking

Unsloth's recommended parameters explicitly specify an aggressive `presence_penalty=1.5`. The moment I set this, the bug vanished.

| Setup | Result |
| --- | --- |
| 2-bit, no penalty | Japanese body text loops for 4029 tokens (`finish: length`) |
| 1-bit, no penalty | Thinking phase loops (cherry blossoms in summer and fall), hard cut at 2500 tokens |
| 1-bit, penalty 1.5 + thinking ON | Stops at 281 tokens, but **gets stuck thinking and never gives an answer** |
| **1-bit, penalty 1.5 + thinking OFF** | **Finishes normally at 90 tokens (`finish: stop`)** |

You also have to turn off thinking. Since Unsloth's recommended numbers were tuned for Instruct (non-thinking) mode to begin with, this makes complete sense.

```json
{
  "temperature": 0.7, "top_p": 0.8, "top_k": 20, "min_p": 0.0,
  "presence_penalty": 1.5,
  "chat_template_kwargs": {"enable_thinking": false}
}
```

The output finally cleaned up:

```text
Spring: Season of sprouting buds and cherry blossoms in full bloom. Warmly repelling(?), the air turns gentle.
Summer: Hot and scorching season. Also a season for rain, thunder, and greenery.
Autumn: Season of falling leaves. Landscapes in red and orange. Cooling down, a season for harvest.
Winter: Season of snow. A time for nature and people to rest in the quiet.
```

(Again translated from the Japanese output, except that "warmly repelling" part, which I've kept literal on purpose.)

The original phrase, 「温かくはじいて」, is broken Japanese, and at 30–40 characters per season, the output fell way short of the "200 characters total" request. But at least the seasons are logically distinct, and cherry blossoms only bloom in spring.
I suppose "warmly repelling" could almost pass as poetic license if you really squint, though I have no clue what's supposedly being repelled.

At this point, I assumed `presence_penalty` wasn't supported in Ollama, simply because it wasn't listed in the "Valid Parameters and Values" table in the Modelfile docs. The only penalties listed there were `repeat_penalty` and `repeat_last_n`.

Turns out I was wrong.

While writing this post, I checked Ollama's source code and spotted this in `api/types.go`:

```go
RepeatPenalty    float32 `json:"repeat_penalty,omitempty"`
PresencePenalty  float32 `json:"presence_penalty,omitempty"`
FrequencyPenalty float32 `json:"frequency_penalty,omitempty"`
```

Ollama's Modelfile parameter validation simply uses `FormatParams` to inspect the struct's JSON tags via reflection. Which means `PARAMETER presence_penalty 1.5` works totally fine even if it's missing from the doc table. You can pass it via `/api/chat` `options` or through the OpenAI-compatible endpoint. In fact, it's even used in an example in `docs/api.md`, set to `1.5`, no less.

**It was literally just missing from the Modelfile docs table.** Since I was tuning settings through a Modelfile, I took that table at face value and assumed it didn't exist.

So in the end, the only real justification left for moving to `llama.cpp` was the +48% speed boost. The quality fix was totally achievable in Ollama all along.

That said, whether setting it in Ollama yields 100% identical results to `llama-server` is another story, and one I haven't tested.

## Checking the official docs after the fact

Only after wrapping up my testing did I finally check the [official Qwen model card](https://huggingface.co/Qwen/Qwen3.8-27B) and [Unsloth's documentation](https://unsloth.ai/docs/models/qwen3.8). Turns out, they match 100%.

| Parameter | Thinking | Instruct (non-thinking) |
| --- | --- | --- |
| temperature | **1.0** | 0.7 |
| top_p | **0.95** | 0.80 |
| top_k | 20 | 20 |
| min_p | 0.0 | 0.0 |
| **presence_penalty** | **0.0** | **1.5** |
| repetition_penalty | 1.0 | 1.0 |

Yeah, I really should have read these first.

Then again, doing things backwards actually brought a few interesting things to light. If I had known about `presence_penalty 1.5` from the start, I never would have caught the 2-bit model chanting "Summer is hot" 18 times in a row. Seeing that mess with my own eyes was what made me question whether the quantisation level was actually to blame. If I’d run recommended settings from day one, I probably would’ve just shrugged and gone, "Well, it's 1-bit, what did I expect?"

Though from a purely time-saving perspective, RTFM first would've been the much smarter call.

### My thinking mode tests were off-spec

Comparing my setup against the official matrix above, my thinking mode runs were definitely using off-label settings:

- The recommended `presence_penalty` for thinking mode is 0.0, but I ran it at 1.5.
- The recommended temperature and top_p for thinking mode are 1.0 and 0.95, but I kept them at 0.7 and 0.80 (the Instruct defaults) the whole time.

To be fair, this wasn't just me blindly ignoring the docs. **I specifically wanted to see how thinking mode held up with `presence_penalty` jacked up to suppress loops**. So when "pp1.5 + thinking enabled" choked at 281 tokens and failed to output an answer, that should be taken as its behaviour under those exact, forced conditions, not a reflection of thinking mode's actual capabilities.

Honestly, looking back, pretty much every test I ran strayed from the recommended specs.
That’s just life on a low-VRAM setup, I guess.

On the flip side, the final setup I landed on ("thinking disabled + presence_penalty 1.5 + temperature 0.7 + top_p 0.80") aligns perfectly with official Instruct mode guidelines. So those results (clean Japanese text, code generation, and the 8B benchmark) seem fair enough, condition-wise.

### Even the official docs warn about "language mixing"

The official Qwen model card includes this explicit warning:

> Adjusting `presence_penalty` between 0 and 2 can help reduce endless repetition.
> However, using higher values may cause **language mixing** and a slight degradation in performance.

**This described the exact bug I hit: prompting in Japanese, only for the model to think endlessly in English.** It wasn't some random fluke I stumbled upon; it's a known side effect.
If you're comfortable enough in English, just prompting in English might be the easiest workaround.
Given Qwen's background, though, Simplified Chinese would probably yield even better results.
Of course, that puts a pretty high bar on the user's language skills.
English is easy enough, but typing out Simplified Chinese via Pinyin is still relatively new to me, and it melts my brain every time I try.

At the end of the day, `presence_penalty` isn't a magic fix, just a dial for tuning repetition behaviour. Turn it up, and language mixing creeps in. You're just picking your poison; there's no free lunch.
If you plan to use this setup in production, you'll definitely need to tweak it as you go.

### Turns out there's a `reasoning_effort` setting

I noticed an option in the Unsloth docs for controlling how much the model thinks.

```bash
--chat-template-kwargs '{"reasoning_effort":"medium"}'
```

> Note: You'll need to escape the double quotes in Windows PowerShell.

I didn't use it for this run, but it turns out bumping up `presence_penalty` wasn't the only way to keep the reasoning from spiraling out of control. Dialing down `reasoning_effort` might have reined in the output without causing that weird mixed-language side effect.

Plus, Ollama's `think` flag actually accepts `"low"`, `"medium"`, `"high"`, and `"max"`. So the ability to cap the reasoning was there the whole time, even without switching tools.

For completeness, here are the official specs:

| Item | Value |
| --- | --- |
| Layers | 64 |
| Hidden size | 5120 |
| Context length | 262,144 (Scalable up to 1,000,000 with YaRN) |
| Rec. output length (thinking) | 262,144 tokens |
| Rec. output length (final response) | 131,072 tokens |

Considering the **recommended output length is a whopping 130k tokens**, capping this test at `max_tokens 700` was a pretty strict cutoff. Blowing through 700 tokens on a simple 5-line "code only" request is definitely abnormal, but it's worth keeping in mind that these test conditions were way tighter than what the creators envisioned.

## Testing its code generation capabilities to the limit

For this round, everything was set to 1-bit (UD-IQ1_S) + presence_penalty 1.5 with thinking turned off. I actually ran every single piece of generated code to verify it.

### Single-branch logic? No problem

"Write a function to remove duplicates from a list while keeping the original order." I tried it twice with different penalty settings.

```python
# presence_penalty 1.5 (53 tok)
def dedupe(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
```

```python
# presence_penalty 0.3 (20 tok)
def dedupe(lst):
    return list(dict.fromkeys(lst))
```

Both solutions are solid. The 0.3 version leverages the fact that `dict`s preserve insertion order, which actually makes it cleaner and more concise.

I was a bit worried that raising the penalty would break repetitive code structures; after all, re-using variable names is essential to coding, so penalising repetition sounds like a recipe for broken syntax. Turns out it handled it fine.

### Code that actually runs without crashing is the worst of all

"Write a generator that chunks an iterable into sizes of n, yielding the last chunk even if it's shorter than n." Out of the three prompts I ran, this was the only one that made it across the finish line without getting cut off.

```python
def chunked(iterable, n):
    def gen():
        try:
            while True:
                buf = [next(iterable) for _ in range(n)]
                yield from (buf,)
        except StopIteration:
            pass
    return gen()
```

At a glance, it looks pretty reasonable.
Until you actually run it:

```text
Pass a plain list → TypeError: 'list' object is not an iterator
Pass an iterator  → [[1, 2, 3], [4, 5, 6]]        ← The final [7] just vanishes
```

There are two major bugs here. First, it doesn't call `iter()`, so passing a standard list blows up instantly. Second, if `StopIteration` gets raised inside the list comprehension, `buf` gets dropped entirely, meaning **it fails the single most important requirement: returning the last chunk even if it's under n.**

On top of that, it throws in a uselessly roundabout `yield from (buf,)`, which is literally just a fancy way of writing `yield buf`.

The syntax is valid, it looks convincing enough to fly right past a code review, and you won't catch it until you actually write a unit test for it.

### Two problems it couldn't solve, even after spiraling for 700 tokens

The leap year check and binary search. Both got cut off halfway through at the 700-token limit.

First up, leap years. This is a five-line problem max, but here was its opening attempt:

```python
def is_leap_year(year):
    return year % 4 == 0 and not isinstance(year, int)
```

That `isinstance` check makes zero sense. Here's the wild part, though: the model actually catches its own mistake right after:

```text
Wait, that's wrong. Let me think again.
...
Correct logic:
- if year % 4 != 0: False
- if year % 100 != 0: True (divisible by 4 but not 100)
- else False
```

**The logic in its reasoning is 100% correct.**
Yet, the moment it tries to convert that thought into Python code, this comes out:

```python
def is_leap_year(year):
    return year % 4 == 0 and not (year % 100 == 0) if year % 4 == 0 else False
```

It went through this exact loop three times (realising "No that's wrong" and "I'm overcomplicating"), only to **write the exact same broken code three times in a row** until hitting the 700-token hard limit.

Interestingly, the number `400` actually shows up three times in its output. So it's not that the model doesn't know the century exception rule; it knows it, but it completely fails to translate that knowledge into code.

As for the binary search, I spotted this gem in its thoughts:

```text
If target is smaller, move right; if larger, move left.
```

That's literally backwards. In a sorted array, if the target is smaller, you move left toward `lo`. Directional logic is the entire point of binary search, so once that's inverted, the whole thing is dead in the water.

All in all, it's a good reminder that depending on the task, you really have to draw a sharp line on what you can trust an LLM to do.

## 5 Ways It Breaks

Comparing the four tasks, a clear pattern of failure modes emerges:

1. **Self-correction doom loops**: The model can still detect its own mistakes, but its proposed fixes keep circling back to the exact same faulty code. It explicitly admits it's "wrong," yet outputs the same code over and over until it hits the token cap.
2. **Reasoning and code generation degrade independently**: It can state the logic perfectly in plain English, but completely falls apart when translating that into actual code. Since the reasoning sounds right, these bugs are sneaky and easy to miss.
3. **Flipping symmetrical concepts**: Left vs. right, greater vs. less, before vs. after. Once quantisation pushes the probabilities too close, the model loses its grip on these distinctions.
4. **It breaks on nesting depth, not code length**

   | Task | Branching | Result |
   | --- | --- | --- |
   | dedupe | 1 level | Flawless (20–53 tok) |
   | chunked | 1 level + exception | Finishes, but with 2 bugs (64 tok) |
   | is_leap_year | 3 nested levels | Hit 700-tok cap, incomplete |
   | binary_search | 3 branches + directional logic | Hit 700-tok cap, incomplete |

   The leap year check requires way less code than `dedupe`, yet it fails miserably. The issue isn't code size; it's nesting depth.

5. **When stuck, it throws instructions out the window**: Even with thinking mode disabled, the moment it gets blocked, it starts monologuing in the output. The "code only" constraint holds up for quick tasks, but gets completely ignored the second things get tough.

## Pushing speed up by 5.5x

Here is the breakdown of the tuning optimisations:

| Configuration | tok/s |
| --- | --- |
| Ollama default (2-bit, KV f16, ctx 16384) | 5.82 |
| Ollama + KV q8_0 | 6.21 |
| Ollama + KV q8_0 + num_ctx 4096 | 6.30 |
| llama.cpp 2-bit (-ctk q8_0 -ctv q4_0) | 9.35 |
| **llama.cpp 1-bit (100% GPU offload)** | **30.47** |
| llama.cpp 1-bit + thinking disabled | **31.87** |

The biggest performance gains came from: 1-bit quantisation (full GPU offload) > switching to llama.cpp > KV cache quantisation >>> closing background apps.

Hitting 31.87 tok/s is genuinely usable speed. If I had stopped there, this could have been a nice feel-good post titled *"How I got a 27B model running on an 8GB GPU."*
Though honestly, while speed is nice, I've been feeling lately that raw throughput isn't everything once it's fast enough.

## Within the same 8GB budget, 8B 4-bit was faster AND smarter

Up to this point, the takeaway seemed to be "1-bit works as long as logic stays within a single branch level." But we need to challenge the core premise: **Given an 8GB VRAM limit, is it really worth squeezing a 27B down to 1-bit, or are you better off just running an 8B at 4-bit?**

I ran the `qwen3:8b` model from the previous test (4.9GB) under identical conditions: llama.cpp / `-c 4096 -ngl 99 -fa on -ctk q8_0 -ctv q4_0 --jinja` / presence_penalty 1.5 / thinking disabled.

| Task | 27B 1-bit (6.19GB) | 8B 4-bit (4.9GB) |
| --- | --- | --- |
| Leap year | Hit 700-tok cap • **Incomplete** | **43 tok • Flawless** |
| Binary search | Hit 700-tok cap • **Incomplete** | **89 tok • Flawless** |
| chunked | 64 tok • **2 bugs** | 34 tok • 1 minor constraint missed |
| Speed | 31.87 tok/s | **47 tok/s** |
| VRAM | 6974 MiB | 5722 MiB |

Faster, lighter, and way more accurate. The leap year logic that choked the 27B model for 700 tokens was nailed by the 8B model in just 43 tokens.

```python
# 8B 4-bit, nailed it on the first attempt
def is_leap_year(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
```

```python
# 8B 4-bit, binary search on the first try too, direction logic is completely spot on
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

This is the exact same model that tried to import Deno in my previous post. It might struggle with internalizing obscure constraints, but it handles textbook algorithms with zero issues.

### The real dealbreaker is *how* they fail

Neither model nailed the `chunked` task. Here’s what the 8B output looked like:

```python
# 8B 4-bit: Relies on len(), so pure iterators cause it to choke
def chunked(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i+n]
```

When I actually put both to the test, here’s what happened:

```text
Expected: [[1, 2, 3], [4, 5, 6], [7]]

[27B 1-bit]
  ERR  list:     TypeError: 'list' object is not an iterator
  NG   iterator: [[1, 2, 3], [4, 5, 6]]      ← Silently swallows [7] without throwing an error

[8B 4-bit]
  OK   list:     [[1, 2, 3], [4, 5, 6], [7]]
  ERR  iterator: TypeError: object of type 'list_iterator' has no len()
```

**Across these three tasks, the 8B model was simple: it either worked or blew up loudly.** The 27B 1-bit model, however, had a nasty habit of silently dropping data without throwing a single exception.

This distinction makes or breaks hooks and test harnesses. The whole premise of an automated retry loop is that **failures must be loud and detectable**. A `TypeError` gets caught immediately by a simple unit test. But `[[1,2,3],[4,5,6]]` passes without a squeak, slipping right through unless you have strict assertions checking the exact return value.

### The real cost of running retry loops

| | Per attempt | Result |
| --- | --- | --- |
| 27B 1-bit | 700 tok ÷ 31.87 tok/s = **22 sec** | Never gets it right (keeps looping back to the same bug) |
| 8B 4-bit | 43 tok ÷ 47 tok/s = **1 sec** | Nailed it on the first try |

It took 22 times longer, only to completely fail anyway.

To make matters worse, the 27B model kept calling itself out ("wrong!") three times in a row, only to output the exact same broken code every single time. Telling an LLM "the test failed" is useless if it just defaults right back to the same mistake. Automated loops only work for models that fail stochastically; if a model is locked in a doom loop, throwing more retries at it just burns time.

Everyone's talking about building AI feedback loops right now, but honestly, setting up a loop that *actually* works is surprisingly tricky, whether you're using a top-of-the-line frontier model or a fragile 1-bit local toy.

## Generation collapsed, but self-evaluation stayed intact

Watching the 1-bit model crumble revealed something fascinating: **Its ability to spot errors survived until the very end.**

In the leap year task, it repeatedly flagged its own work ("Wait, that's wrong," "I'm overcomplicating"), yet it couldn't actually write the right logic. Generation broke first, while self-criticism proved remarkably resilient.

If that's the case, asking it to write code from scratch is a lost cause, but maybe it can handle "pick the correct option" or "fill in the blank"? I tested three approaches.

### Option 1: Give it the answer and ask it to verify → Works like a charm

I gave it three different leap year implementations and asked it to pick the right one. For the exact expression it failed to write on its own, it responded:

```text
Option A: 100 would be considered a leap year, but 100 is NOT a leap year
          under Gregorian calendar rules. So this is WRONG.

1900: True and (False or False) = False  ✓
2000: True and (False or True)  = True   ✓
2008: True and (True or ...)    = True   ✓
Wait, that's exactly what B says.
```

**It picked its own edge cases and accurately dry-ran all three through manual calculation.** It even got the 1900 / 400 rule right. A piece of code it couldn't write after burning through 700 tokens was something it verified effortlessly once it was right in front of it.

### Ask it to locate a bug in broken code → Total disaster

Next, I showed it **its own broken code** (the exact response it spit out three times earlier) in isolation and asked, "Is this correct?"

```python
def is_leap_year(year):
    return year % 4 == 0 and not (year % 100 == 0) if year % 4 == 0 else False
```

It got the verdict right: *"No, this implementation is incorrect."* But every single reason it gave was pure hallucination.

```text
1. **Invalid syntax**: ... This is invalid Python syntax.
   → Completely false. It's perfectly valid Python using a ternary operator.

2. Counterexample: year = 1900 → Returns False.
   However, 1900 is NOT a leap year (so returning False is actually correct).
   → That's not a counterexample! It literally contradicted itself in the same breath.
```

The year where this code actually breaks is 2000 (it returns `False` because `True and not True`), but the number `2000` didn't show up once in its output. Instead, **it just made up a fake syntax error out of thin air**.

The high-level signal of "something is wrong" is still firing, but its ability to explain *where* or *why* is totally shot. **Bottom line: do not trust a 1-bit model with code reviews.** In this case, it confidently flagged a bug that didn't even exist.
Not that anyone in their right mind would delegate code reviews to a 1-bit model, but if you tried, this is the kind of mess you'd get.

### Give it a skeleton function to fill in → Works like a charm

I laid out the logic in comments and left only the return line blank:

```python
def is_leap_year(year):
    # Condition 1: Not divisible by 4 -> Not a leap year
    # Condition 2: Divisible by 100 -> Not a leap year
    # Condition 3: EXCEPT divisible by 400 -> IS a leap year
    return  # TODO: Write a single expression that satisfies conditions 1-3
```

108 tokens later, clean exit, and it nailed it on the very first try:

```python
return (year % 4 == 0 and not (year % 100 == 0) or (year % 400 == 0))
```

It's structured a bit differently than usual, but since `and` takes precedence over `or`, it's logically rock-solid. I ran a full test suite against Python's built-in `calendar.isleap` to double-check.

```text
Exhaustive check from year 1 to 4000 → Mismatches: 0
```

**The exact same model that spiraled for 700 tokens when generating from scratch filled in the blank flawlessly in 108 tokens.**

### How you format the prompt makes or breaks the result

| Prompt approach | Result |
| --- | --- |
| Generate from scratch | Spiraled for 700 tok, incomplete |
| Verify a given solution | ◯ Picked edge cases on its own and calculated them correctly |
| Spot the bug in broken code | ✗ Got the verdict right, but completely fabricated the reasons |
| **Fill in a skeleton function** | **◎ 108 tok, 100% accurate (passed exhaustive tests)** |

This sheds light on why "providing a complete implementation example allowed it to accurately transcribe" in Round 5 of my previous post. It wasn't just a win for prompt constraints; it exploited a core trait: **generation capabilities collapse first, while evaluation and completion remain functional.**

When working with a 1-bit model, the line between what works and what fails comes down to these three takeaways:

- **Don't ask it to write. Ask it to fill in.** If you set up the type hints, function signatures, and logic comments, letting it write just the single expression works surprisingly well.
- **Keep it away from code reviews.** It can't pinpoint actual defects and will invent bugs that don't exist.
- **Selecting from options works.** As long as the right answer is in the choices, it can evaluate and pick the winner.

The weaker the model, the more prompt architecture and input design matter. In this test, tweaking a single parameter, `presence_penalty`, was the difference between a broken infinite loop and fluent output. Frontier models are smart enough to decipher messy prompts, which makes it easy to overlook just how critical prompt design really is.

I actually wrote about designing handoff structures between models a while back:


<a class="link-card" href="https://akari-iku.github.io/en/blog/multi-model-handoff/" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://akari-iku.github.io/og/en/blog/multi-model-handoff.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">akari-iku.github.io</span>
<span class="link-card-title">Developing with Multiple Models? Make Sure You Design the Handoff | akari.log</span>
</span>
</a>


The core idea is identical. I just wanted to see what happens when you push that philosophy to its absolute limit with a 1-bit model.

## Why it’s useless in practice despite “retaining 77% accuracy”

I’ve painted a pretty grim picture so far, but **that doesn't mean Unsloth is selling snake oil**. It actually fits in 6.19GB of VRAM, it really runs at 31 tok/s, and "runs on 8GB RAM" is 100% factual. Their benchmark numbers probably aren't fake either; they're just measuring a completely different metric than real-world usage.

Unsloth highlights two key benchmarks:

- **Divergence-300 @32**: Tracks how closely the model matches BF16 over a **32-token** window across 300 unseen samples.
- **KL Divergence**: Measures how closely the output probability distribution aligns with BF16.

Both metrics test whether the model predicts the next token accurately *given a perfectly clean context*. In terms of my experiments, this evaluates **verification ability**, and as we saw, that part actually held up remarkably well. Since the model successfully picked 1900/2000/2008 and calculated them correctly by hand, a 72–77% distribution match makes total sense.

The catch is that tracking stops after just 32 tokens.

Real-world generation is autoregressive: once the model slips up slightly, every single subsequent token compounds on top of that error. The leap year prompt spiraled for 700 tokens without finishing, and the 2-bit Japanese prompt got trapped in a 4029-token loop. **At the 32-token mark, the wheels haven't fallen off yet.**

| What benchmarks measure | How we actually use it |
| --- | --- |
| Next-token distribution given a clean context | Continuous generation built on its own prior context |
| 32-token tracking window | Consistency over hundreds to thousands of tokens |
| **Instantaneous** drift | **Compounded** drift |

So "retains 77% accuracy" and "completely useless in practice" aren't mutually exclusive. Measuring 32 tokens to judge an LLM is like **trying to predict a marathon finish time based on a 100-meter dash**. The core asymmetry I found (evaluation stays rock-solid while generation completely crumbles) explains the massive gap between benchmarks and reality.

This isn't unique to Unsloth, either. Whenever you see accuracy numbers for quantised models, it pays to check **how many tokens they actually tested**. Some metrics do evaluate long-form generation, so not every benchmark relies on short bursts.

## Don't use a 1-bit model to write code, use it as a stress test

Looking at these results, it’s easy to dismiss 1-bit models as totally useless, but I think that’s missing the point. There's almost zero reason to delegate actual coding tasks to a 1-bit model; its value simply doesn't lie in code generation.

The most helpful thing about the 1-bit model was how *blatantly* it broke. "This is a syntax error" (false), "1900 is a counterexample" (it isn't). Because it fails so loudly and unapologetically, it exposes every flaw in your prompt. Frontier models tend to gloss over vague instructions and figure out what you meant anyway, masking the prompt's weaknesses.

So, why not flip the workflow? **Once you write a spec, run it through a 1-bit model first.**

- If it passes, your instructions were clear and unambiguous.
- If it fails, **your spec is too vague**. Don't blame the model.

The leap year test proved this perfectly. "Write a leap year function" choked for 700 tokens and failed. But breaking it down into a 3-line comment skeleton with a blank to fill passed a 4,000-year exhaustive test in just 108 tokens. The issue wasn't the model's capability; it was the clarity of the spec.

In my previous post, "providing a complete skeleton made it succeed" was a workaround after five failed attempts. But you can move that exact step to the very beginning as a pre-flight sanity check for your prompts.

It's the exact same logic as rewriting a prompt so "a high schooler could understand it." It's like using lower-tier models like Sonnet or Haiku to test if a prompt is airtight, something many of us used to do.

As I mentioned in that post:

> "A prompt structure that works on a weak model will work on a strong model, but the reverse isn't true."

If that holds up, a specification clear enough to pass on a 1-bit model will breeze through higher-tier models. Think of it like a pawn in chess. It’s the weakest piece on the board, but if you position it right, it still plays a vital role.

## Bringing this into air-gapped environments

Where all of these findings really come together is in **strict, air-gapped corporate environments**, where there's no internet access and you're locked into whatever hardware you're given. What can you actually get done on a laptop with a single 8GB VRAM GPU and zero internet access?
After all, getting procurement or management approval for a decent rig or cluster is an absolute nightmare.
I thought folks at big tech hardware companies might have it easier, but considering how many solo devs and contractors are out there, I guess this red tape is universal.

### The Pack List

- **Go with an 8B 4-bit model (4.9GB).** It fits entirely inside 8GB VRAM at 47 tok/s, hitting a bullseye on both leap year logic and binary search on the first try. It’s faster, smaller, and vastly more reliable than crushing a 27B model down to 1-bit.
- **Bring raw GGUF files directly.** You can't rely on `ollama pull` offline. Ollama's internal blob cache uses hash filenames without extensions, which is a pain to manage manually. Just download raw GGUF files from Hugging Face and carry those over.
- **The default Ollama runtime is all you need.** If you ever need to fine-tune low-level flags, `llama-server` is actually bundled right inside the standard Ollama installer, allowing you to drop down a level without filing a request for a new binary.

### The real bottleneck offline isn't "not being able to Google things"

**Ollama alone gives you enough control.** Since it accepts both `presence_penalty` and `think` parameters, those bizarre infinite loops (like repeating "summer is hot" 18 times) can be squashed within Ollama itself. Keeping your toolchain minimal is just a cleaner way to live.

The real trap in an air-gapped setup is figuring out parameter names. I originally assumed an option "didn't exist" simply because it wasn't listed in a docs table. With internet access, you'd just check `api.md` or glance at the source code. But if you don't think to do that on-site, you hit a dead end. What you need to bring isn't "good Googling skills," but a **pre-verified list of exact parameters**.

That's the sneaky thing about air-gapped work: the problem isn't that you "can't look stuff up"; it's that **"you can't bring new stuff in."** You can always search on your phone or tether a hotspot. But if your research tells you "just download llama.cpp separately," you're stuck, because you can't download a new binary past the security gate.

| Roadblock | Can you fix it on the spot? |
| --- | --- |
| `no usable GPU found` → set `GGML_BACKEND_PATH` | **Yes** (just set an env var manually) |
| Need to install a new runtime | **No** (you're locked into what you brought in) |

In short, what saves your hide on-site isn't knowing "how to troubleshoot"; it's having a solid **pack list**.

### The Launch Script

You definitely don't want to be hand-typing `$env:GGML_BACKEND_PATH` while staring at code snippets on your phone, so bring a pre-made script. This single file handles everything from loading CUDA backends to setting up the KV cache.

**`start-llama.ps1`**

```powershell
param(
    [Parameter(Mandatory=$true)][string]$Model,
    [int]$Ngl = 99,
    [int]$Ctx = 4096,
    [string]$Ctk = "q8_0",
    [string]$Ctv = "q4_0",
    [int]$Port = 18080
)

# Comments must be ASCII: Windows PowerShell 5.1 reads BOM-less UTF-8 as cp932
# and a broken comment line takes the whole param() block down with it.
$base = "$env:LOCALAPPDATA\Programs\Ollama\lib\ollama"
$cuda = "$base\cuda_v13"   # cuda_v12 for older GPUs

$env:PATH = "$cuda;$base;$env:PATH"
$env:GGML_BACKEND_PATH = "$cuda\ggml-cuda.dll"

& "$base\llama-server.exe" `
    -m $Model `
    -c $Ctx `
    -ngl $Ngl `
    -fa on `
    -ctk $Ctk `
    -ctv $Ctv `
    --jinja `
    --host 127.0.0.1 `
    --port $Port
```

```powershell
.\start-llama.ps1 -Model "C:\models\Qwen3-8B-Q4_K_M.gguf"
```

On the client request side, don't forget to set `presence_penalty` and turn off thinking mode. If you drop these, Japanese generation will spin into an infinite loop.

```json
{
  "messages": [{"role": "user", "content": "..."}],
  "temperature": 0.7, "top_p": 0.8, "top_k": 20, "min_p": 0.0,
  "presence_penalty": 1.5,
  "chat_template_kwargs": {"enable_thinking": false}
}
```

## Key Takeaways

- **If you've got an 8GB budget, running an 8B model at 4-bit is faster and far more accurate than crushing a 27B model down to 1-bit.** We're talking 47 vs 31.87 tok/s, and 4.9 vs 6.19GB. The 8B model nailed leap years and binary search on the first try, whereas the 1-bit 27B model couldn't finish either. There *is* a way to make local LLMs genuinely usable on 8GB VRAM, but it's not about heavy compression; it's about picking a sensible model and running it properly.
- **You'll hit the quality ceiling long before you hit the speed limit.** And the main culprit for poor quality wasn't the quantisation bit rate; it was missing `presence_penalty`. I assumed Ollama didn't support it, but it turns out it actually does; it was just left off the Modelfile docs table.
- **1-bit isn't built for "generation"; it's for "completion" and "validation."** Ask it to write code from scratch and it falls apart. Give it a skeleton, though, and it'll churn out code that passes every check in 108 tokens. In practice, its limits stop at utility functions with a single conditional branch. A cleverer trick is to **run your specs through the 1-bit model, and if it chokes, fix the specs instead**.
- Speed jumped from 5.82 to 31.87 tok/s (a 5.5x speedup). The game-changer was dropping to 1-bit (keeping all layers pinned to the GPU), followed by moving to llama.cpp, and finally KV cache quantisation.
- Type systems can only catch so much. A missing `.iter()` call will get flagged by TypeScript, but logic bugs, like the final chunk getting dropped in a chunked operation, will pass right through. **If you're relying on hooks, running `tsc --noEmit` isn't enough; you need to run your test suite.**
- **It's the wrong tool for hard-to-verify tasks** like analysis or summarisation. This is a model that will casually claim "cherry blossoms bloom in both summer and autumn," quietly sneaking errors into your output. But for code, where you can actually execute and verify the result, you can let automated tooling manage the risk.

That covers the practical side. What follows is the post-mortem.

## Wrapping Up

In my last post, I mentioned that `qwen3:8b` was endearing because of how hard she tried. You know, the kid that imported Deno, got an error, and immediately started lecturing on general principles instead of fixing the code.

Well, that same kid just took down a 6.19GB behemoth in 43 tokens flat. The task? Leap year logic. The 27B model blew through 700 tokens, realised "Wait, that's wrong" three times, wrote the *exact same* broken code all three times, and finally gave up.

I can't really call her "a good kid who tries hard" anymore. She's just plain good.

What caught my attention was how 1-bit broke in the exact same pattern as before. Last time, I blamed the CORS infinite loop on the harness, arguing there was no feedback mechanism to tell the agent it was stuck. But this time, with zero loops and a single standalone prompt, the raw model did the same thing. It clearly retained the ability to notice "this is wrong," yet it kept resetting to the exact same starting point.

So it wasn't just a harness issue after all. Adding exit conditions won't save you if the model keeps looping back to the same bad state; it just reduces the loop count.

To be fair, my benchmark with thinking enabled wasn't run under official recommended settings. I was intentionally observing how thinking behaved with `presence_penalty` jacked up to 1.5 to curb repetition, and I didn't test `reasoning_effort`. So I can't claim "this is how 1-bit breaks across the board," only that "under these specific conditions, this is how it broke."

That said, the head-to-head against the 8B model was a fair test, so those findings stand.

Still, I wouldn't have bothered messing around with 1-bit otherwise, so I'm glad I did. Even if the takeaway was "don't bother using it". Hey, that's just how experiments go sometimes.

Faced with an 8GB ceiling, I used to focus entirely on how much smaller I could shrink the model: 2-bit, 1-bit, KV caching, context windows: always trimming the model side.

In hindsight, the two things that made the biggest difference were setting `presence_penalty` to 1.5 and passing in empty function stubs. **And neither of those shaved off a single byte from the model.**

<details><summary>Commands used</summary>


```bash
# Pull model
ollama pull hf.co/unsloth/Qwen3.8-27B-GGUF:UD-IQ2_XXS

# Check GPU/CPU offload and context length (the single most important diagnostic command)
ollama ps

# Measure VRAM usage
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv

# Unload model (for baseline benchmarks)
ollama stop <model>

# Benchmark generation speed
echo "prompt" | ollama run --verbose <model>

# Build model from Modelfile
ollama create qwen38-8g -f Modelfile

# Override context length on the fly inside an interactive session
>>> /set parameter num_ctx 4096
```


</details>
