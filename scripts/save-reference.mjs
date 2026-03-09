#!/usr/bin/env node
/**
 * Saves a reference (analyzed transcript) to .data/references/
 * Usage: echo '{"id":"ref-name","title":"...","transcript":"...","analysis":{...}}' | node scripts/save-reference.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const REFS_DIR = join(import.meta.dirname, "..", ".data", "references");

if (!existsSync(REFS_DIR)) mkdirSync(REFS_DIR, { recursive: true });

let input;
if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  input = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(input);

if (!data.id || !data.transcript) {
  console.error("Error: se requiere 'id' y 'transcript' en el JSON");
  process.exit(1);
}

// Add timestamp if missing
if (!data.createdAt) {
  data.createdAt = new Date().toISOString();
}

const filePath = join(REFS_DIR, `${data.id}.json`);
writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(JSON.stringify({ id: data.id, path: filePath }));
