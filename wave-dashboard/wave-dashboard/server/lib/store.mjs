/**
 * File-backed state store. No database engine required — state is held in
 * memory and flushed to server/data/state.json (debounced, atomic rename).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED } from '../seed.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const FILE = path.join(DIR, 'state.json');
const TMP = FILE + '.tmp';

const CURRENT_SCHEMA = 3;

function freshState() {
  return {
    schema: CURRENT_SCHEMA,
    createdAt: new Date().toISOString(),
    transactions: SEED.transactions.map((t) => ({ ...t })),
    audit: [],
    favorites: [],
    usage: {},
    counters: { transaction: SEED.transactions.length },
  };
}

let state = load();
let flushTimer = null;

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (raw.schema !== CURRENT_SCHEMA) {
      console.warn(
        `[store] state.json schema ${raw.schema} != ${CURRENT_SCHEMA}; reseeding from seed data`
      );
      return freshState();
    }
    return raw;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`[store] could not read state.json (${err.message}); starting from seed data`);
    }
    return freshState();
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushNow();
  }, 250);
}

export function flushNow() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(TMP, JSON.stringify(state, null, 2));
    fs.renameSync(TMP, FILE);
  } catch (err) {
    console.error(`[store] flush failed: ${err.message}`);
  }
}

/** Read-only access to the current state. */
export function read() {
  return state;
}

/**
 * Mutate state through a callback, then persist.
 * @param {(s: any) => any} fn
 */
export function write(fn) {
  const result = fn(state);
  scheduleFlush();
  return result;
}

export function nextId(kind, prefix, width = 3) {
  return write((s) => {
    s.counters[kind] = (s.counters[kind] || 0) + 1;
    return `${prefix}-${String(s.counters[kind]).padStart(width, '0')}`;
  });
}

/** Wipe persisted state and reload the seed dataset. */
export function reset() {
  state = freshState();
  flushNow();
  return state;
}

export const dataFile = FILE;

process.on('SIGINT', () => {
  flushNow();
  process.exit(0);
});
process.on('SIGTERM', () => {
  flushNow();
  process.exit(0);
});
