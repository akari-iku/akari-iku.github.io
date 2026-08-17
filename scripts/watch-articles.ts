/**
 * Watch the source articles/ repository and re-run the import on every .md
 * change, so editing an article shows up in `astro dev` without a manual step.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface ImportConfig {
  articlesDir: string;
}

const root = process.cwd();
const config: ImportConfig = JSON.parse(
  fs.readFileSync(path.join(root, 'import.config.json'), 'utf8'),
);

let debounce: NodeJS.Timeout | undefined;
let running = false;
let queued = false;

function runImport(): void {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const child = spawn('npx', ['tsx', 'scripts/import-articles.ts'], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  });
  child.on('exit', () => {
    running = false;
    if (queued) {
      queued = false;
      runImport();
    }
  });
}

fs.watch(config.articlesDir, { recursive: true }, (_event, filename) => {
  if (!filename || !filename.toString().endsWith('.md')) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`\n[watch] ${filename} changed - re-importing`);
    runImport();
  }, 300);
});

console.log(`[watch] watching ${config.articlesDir} for .md changes (Ctrl+C to stop)`);
runImport();
