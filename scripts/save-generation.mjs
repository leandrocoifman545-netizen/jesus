#!/usr/bin/env node
/**
 * Saves a script generation to .data/ so it appears in the web app.
 * Usage: echo '{"brief":{...},"script":{...}}' | node scripts/save-generation.mjs
 * Or:    node scripts/save-generation.mjs path/to/generation.json
 */
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const BRIEFS_DIR = join(DATA_DIR, "briefs");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

// Ensure directories exist
[DATA_DIR, BRIEFS_DIR, GENERATIONS_DIR].forEach((d) => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

// Read input from file arg or stdin
let input;
if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  input = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(input);
const { brief, script, batch, title, projectId } = data;

if (!script) {
  console.error("Error: se requiere al menos 'script' en el JSON");
  process.exit(1);
}

const briefId = randomUUID();
const generationId = randomUUID();
const now = new Date().toISOString();

// Save brief
const briefData = {
  id: briefId,
  projectId: projectId || brief?.projectId,
  productDescription: brief?.productDescription || "Generado desde CLI",
  targetAudience: brief?.targetAudience || "",
  hookCount: script.hooks?.length || 5,
  createdAt: now,
};
writeFileSync(join(BRIEFS_DIR, `${briefId}.json`), JSON.stringify(briefData, null, 2));

// Save generation
const genData = {
  id: generationId,
  briefId,
  projectId: projectId || brief?.projectId,
  title: title || undefined,
  batch: batch || undefined,
  script,
  createdAt: now,
};
writeFileSync(join(GENERATIONS_DIR, `${generationId}.json`), JSON.stringify(genData, null, 2));

console.log(JSON.stringify({ generationId, briefId, url: `/scripts/${generationId}` }));
