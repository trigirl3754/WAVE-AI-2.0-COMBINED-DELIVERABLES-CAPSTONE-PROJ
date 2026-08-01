/**
 * Starts the API and the Vite dev server together, and shuts both down on
 * Ctrl-C. Avoids needing `concurrently` as a dependency.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [
  spawn(process.execPath, ['--watch', 'server/index.mjs'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
  }),
  spawn(process.execPath, [viteCli], { cwd: root, stdio: 'inherit' }),
];

let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

for (const child of children) {
  child.on('exit', (code) => {
    if (!closing) {
      console.error(`\n  A dev process exited (code ${code}). Shutting the other one down.`);
      shutdown(code ?? 1);
    }
  });
  child.on('error', (err) => {
    console.error(`  Failed to start a dev process: ${err.message}`);
    shutdown(1);
  });
}
