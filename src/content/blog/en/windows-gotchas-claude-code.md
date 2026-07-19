---
title: Claude Code Ctrl+V Not Working on Windows? Fixes for Common Gotchas
description: >-
  A practical guide to Windows-specific pitfalls when using Claude Code, from
  image pasting shortcuts to shell quirks.
date: '2026-03-07'
tags:
  - claudecode
  - windows
  - vscode
  - productivity
lang: en
pair: claude-code-windows-gotchas
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2026-03-07-windows-gotchas-claude-code.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan. I find myself wondering why, in a world where **59% of developers use Windows**, so much of the Claude Code documentation reads like a love letter exclusively addressed to macOS users. Well, I suppose us Windows developers are rather accustomed to being the majority that everyone politely ignores (personally very grateful for this recurring life lesson). My favourite chapter of this saga involved spending a solid thirty minutes dissecting VS Code settings, convinced something was profoundly misconfigured, only to discover the entire ordeal was a matter of pressing **Alt+V instead of Ctrl+V**. The settings were fine. The documentation simply never mentioned it. This article is my humble attempt to organise every Windows-specific pitfall into one place, so you can skip the part where you question your own competence. Truly.

### My Setup

- OS: Windows 11
- Editor: VS Code (when visual confirmation is needed)
- Terminal: Warp (when it's not)
- Claude Code: v2.1.71 / Opus 4.6 / Agent Teams

## GUI vs Terminal: Which One Are You Running?

Before diving in, a bit of context. When running Claude Code in VS Code, there are **two modes**:

| Feature | GUI (WebView) | Terminal (CLI) |
| --- | --- | --- |
| Appearance | VS Code side panel / panel | `>` prompt in the integrated terminal |
| Base tech | WebView (browser equivalent) | CLI application |
| Image paste | <kbd>Ctrl</kbd> + <kbd>V</kbd> works normally | <kbd>Alt</kbd> + <kbd>V</kbd> (more on this below) |
| Toggle setting | `claudeCode.useTerminal: false` | `claudeCode.useTerminal: true` |

Not knowing this distinction can lead you down a rabbit hole: thinking you're stuck with the terminal version, wondering why images won't paste, and spending half an hour reviewing settings that were perfectly fine all along. That last one is from personal experience.

You can switch between them by toggling `claudeCode.useTerminal` in VS Code settings.

## The Ctrl+V Trap: Why Your Screenshots Won't Paste

Here's the main episode.

One day, I tried pasting a screenshot into terminal-mode Claude Code. <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to capture, <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste.

**Nothing happened.**

Text wouldn't paste either. Right-click paste didn't work. Dragging and dropping opened the image file in a separate tab. Not exactly helpful.

### The Settings Investigation

First suspect: VS Code terminal settings. Being on Windows, the usual "something environment-related is breaking things" instinct kicked in.

```json
{
  "terminal.integrated.enableImages": true
}
```

Checked. Enabled.

Next, GPU Acceleration, mentioned in the setting description:

```json
{
  "terminal.integrated.gpuAcceleration": "auto"
}
```

Fine.

Then the Windows-specific ConPTY setting:

```json
{
  "terminal.integrated.windowsUseConptyDll": true
}
```

Enabled. The bundled ConPTY DLL (v1.23) was in place.

**Everything was correct. Still couldn't paste.**

I even went as far as checking the ConPTY DLL version, wondering "it says v2+ is required, but where exactly is v2 in this versioning scheme?"

### The Answer

Switching my search language to English, the answer appeared almost immediately.

**In terminal-mode Claude Code, you paste images with <kbd>Alt</kbd> + <kbd>V</kbd>, not <kbd>Ctrl</kbd> + <kbd>V</kbd>.**

On Windows terminals, <kbd>Ctrl</kbd> + <kbd>V</kbd> is reserved for text paste, so Claude Code assigns image paste to <kbd>Alt</kbd> + <kbd>V</kbd>.

Tried it. Worked instantly.

Thirty minutes of settings investigation, and it was just a different shortcut key. There was virtually no information about this in Japanese, so here it is.

I also looked into whether <kbd>Alt</kbd> + <kbd>V</kbd> could be remapped to <kbd>Ctrl</kbd> + <kbd>V</kbd>, but this is a hardcoded keybinding in the Claude Code CLI. There's no user-configurable option for it. You just have to get used to it. There are open GitHub issues requesting this change, so perhaps the official team will address it eventually.

<details><summary>Quick reference: Image paste in terminal-mode Claude Code</summary>

- <kbd>Ctrl</kbd> + <kbd>V</kbd>: text paste (images are ignored)
- <kbd>Alt</kbd> + <kbd>V</kbd>: image paste
- In GUI mode, <kbd>Ctrl</kbd> + <kbd>V</kbd> handles both text and images

</details>


<a class="link-card" href="https://github.com/anthropics/claude-code/issues/9124" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/bd0c5d6d0368f1625d9a7f7e1e27aad0ba3c94852f5610649d5bef73af645d12/anthropics/claude-code/issues/9124" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">[BUG]  Image paste with Ctrl+V not working on Windows (drag-and-drop works) · Issue #9124 · anthropics/claude-code</span>
</span>
</a>



<a class="link-card" href="https://github.com/anthropics/claude-code/issues/22377" target="_blank" rel="noopener">
<img class="link-card-thumb" src="https://opengraph.githubassets.com/bbc64a670b74d550d2f168c20e625a0337b0e34f8e888ae982366612bb4e52a3/anthropics/claude-code/issues/22377" alt="" loading="lazy" referrerpolicy="no-referrer" />
<span class="link-card-body">
<span class="link-card-domain">github.com</span>
<span class="link-card-title">[VS Code] Cannot paste screenshot images with Ctrl+V · Issue #22377 · anthropics/claude-code</span>
</span>
</a>


## VS Code Terminal Image Display Settings

If you're using terminal mode, image display requires some VS Code configuration. Even if `Alt+V` works for pasting, images won't render properly without these settings.

Three settings are needed:

```json
{
  // Enable image display in the terminal (default: false)
  "terminal.integrated.enableImages": true,

  // Keep GPU acceleration enabled ("off" disables image support)
  "terminal.integrated.gpuAcceleration": "auto",

  // Use VS Code's bundled ConPTY DLL (Windows only)
  "terminal.integrated.windowsUseConptyDll": true
}
```

After changing these, a **full VS Code restart** is required. <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> followed by Reload Window may not be sufficient. Close VS Code entirely and relaunch.

## npm Scripts and Unix Syntax

Not Claude Code-specific, but you'll run into this constantly when developing alongside Claude Code.

Say your `package.json` has this:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--require ./node-compat.cjs' next dev --turbopack"
  }
}
```

The single-quote environment variable syntax (`NODE_OPTIONS='...'`) is Unix. It won't work in Windows cmd or PowerShell.

```bash
# This will fail
npm run dev
```

### Workarounds

**1. Run directly via Git Bash**

```bash
NODE_OPTIONS='--require ./node-compat.cjs' npx next dev --turbopack
```

Skip `npm run dev` and execute the command directly in Git Bash, where Unix syntax is supported.

**2. Use cross-env**

```bash
npm install --save-dev cross-env
```

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--require ./node-compat.cjs' next dev --turbopack"
  }
}
```

`cross-env` handles environment variables across Windows, Mac, and Linux. If you're working in a team, it's worth adding.

When Claude Code runs `npm run dev` and it fails, it sometimes can't identify the cause and starts investigating unrelated issues. Knowing this is a Windows syntax problem lets you point it in the right direction immediately.

## Shell Juggling: Git Bash / PowerShell / WSL2

When Claude Code executes commands in VS Code's integrated terminal, which shell is active matters more than you'd expect.

Git Bash, PowerShell, and WSL2 each behave differently, and the same command can produce different results depending on where it runs.

### The Path Conversion Trap

Git Bash internally converts Windows paths to Unix paths. This breaks certain commands.

```bash
# robocopy in Git Bash: paths get converted and the command fails
robocopy C:\src C:\dst  # Paths become /c/src /c/dst
```

For file operations, PowerShell commands are safer:

```powershell
# PowerShell: reliable
Move-Item -Path "C:\src\file.txt" -Destination "C:\dst\"
Copy-Item -Path "C:\src\*" -Destination "C:\dst\" -Recurse
```

### Symbolic Links

The Unix `ln -s` doesn't work as expected in Git Bash on Windows. Use NTFS junctions instead:

```cmd
mklink /J "C:\link" "C:\target"
```

### Teaching Claude Code

Writing shell guidelines in your CLAUDE.md helps Claude Code pick the right commands:

```markdown
## Platform Notes
- Prefer PowerShell commands (Move-Item, Copy-Item) for file operations
- Avoid robocopy in Git Bash due to path conversion issues
- Use NTFS junctions (mklink /J) instead of ln -s
```

I have rules like these in my own CLAUDE.md. Most of them were set up early on, and I haven't had to add much since. Claude Code respects them reliably, which prevents the same mistakes from recurring. It still goes on the occasional unsupervised adventure, but that's becoming rarer.

## Cheat Sheet

| Gotcha | Symptom | Fix |
|---|---|---|
| Image paste | <kbd>Ctrl</kbd> + <kbd>V</kbd> does nothing | Use <kbd>Alt</kbd> + <kbd>V</kbd> |
| Terminal image display | Images don't render | Enable `enableImages`, `gpuAcceleration`, `windowsUseConptyDll` |
| npm scripts | `npm run dev` fails | Run directly in Git Bash or add `cross-env` |
| Path conversion | Commands fail in Git Bash | Use PowerShell commands |
| Symbolic links | `ln -s` doesn't work | Use `mklink /J` (NTFS junction) |
| GUI vs Terminal | Confused by different behaviour | Toggle `claudeCode.useTerminal` |

Windows requires a bit more setup upfront, but once everything is configured, it runs smoothly.

## References

- [Claude Code Official Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Image paste with Ctrl+V not working on Windows (Issue #9124)](https://github.com/anthropics/claude-code/issues/9124)
- [Cannot paste screenshot images with Ctrl+V in VS Code (Issue #22377)](https://github.com/anthropics/claude-code/issues/22377)
- [CTRL+V to paste images not working in Claude Code? [SOLVED]](https://www.jdhodges.com/blog/ctrlv-not-working-in-claude-code-heres-the-simple-fix-solved/)
- [How to Paste Images in Claude Code: The Control+V Fix](https://www.arsturn.com/blog/claude-code-paste-image-guide)
