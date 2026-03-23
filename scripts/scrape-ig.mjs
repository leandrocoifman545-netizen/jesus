#!/usr/bin/env node
/**
 * Scrapea captions de Instagram usando Apify REST API (sin SDK).
 *
 * Uso:
 *   node scripts/scrape-ig.mjs @username1 @username2 --limit 30
 *
 * Requiere APIFY_TOKEN en .env.local
 * Guarda en .data/ig-references/{username}.json
 */

import fs from "fs";
import path from "path";

// Load env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error("Falta APIFY_TOKEN en .env.local");
  console.error("Creá tu cuenta gratis en https://apify.com y copiá tu API token.");
  process.exit(1);
}

const ACTOR_ID = "apify~instagram-post-scraper";
const BASE_URL = "https://api.apify.com/v2";
const OUT_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let limit = 30;
const usernames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[i + 1], 10);
    i++;
  } else {
    usernames.push(args[i].replace(/^@/, ""));
  }
}

if (usernames.length === 0) {
  console.error("Uso: node scripts/scrape-ig.mjs @username1 @username2 --limit 30");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

async function scrapeProfile(username) {
  console.log(`\nScrapeando @${username} (${limit} posts)...`);

  // Start the actor run
  const startRes = await fetch(`${BASE_URL}/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: [username],
      resultsLimit: limit,
    }),
  });

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Error iniciando actor: ${startRes.status} ${err}`);
  }

  const runData = await startRes.json();
  const runId = runData.data.id;
  console.log(`  Run iniciado: ${runId}`);

  // Poll until finished
  let status = "RUNNING";
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await fetch(`${BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const statusData = await statusRes.json();
    status = statusData.data.status;
    process.stdout.write(`  Status: ${status}\r`);
  }
  console.log(`  Status: ${status}`);

  if (status !== "SUCCEEDED") {
    throw new Error(`Run falló con status: ${status}`);
  }

  // Get dataset items
  const datasetId = runData.data.defaultDatasetId;
  const itemsRes = await fetch(`${BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`);
  const items = await itemsRes.json();

  // Extract only what necesitamos
  const captions = items
    .filter((item) => item.caption || item.text)
    .map((item) => ({
      caption: item.caption || item.text || "",
      likes: item.likesCount || item.likes || 0,
      comments: item.commentsCount || item.comments || 0,
      timestamp: item.timestamp || item.takenAt || item.date || "",
      type: item.type || "post",
      url: item.url || item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : "",
    }))
    .filter((c) => c.caption.length > 20); // solo captions con contenido real

  // Sort by engagement (likes + comments)
  captions.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));

  const output = {
    username,
    scraped_at: new Date().toISOString(),
    total_posts: items.length,
    captions_with_text: captions.length,
    captions,
  };

  const outFile = path.join(OUT_DIR, `${username}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
  console.log(`  Guardado: ${outFile} (${captions.length} captions)`);

  return output;
}

// Run all
console.log(`Scrapeando ${usernames.length} perfil(es) con límite de ${limit} posts cada uno...`);

for (const username of usernames) {
  try {
    await scrapeProfile(username);
  } catch (err) {
    console.error(`  Error con @${username}: ${err.message}`);
  }
}

// Summary
console.log("\n--- Resumen ---");
const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"));
let totalCaptions = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  console.log(`@${data.username}: ${data.captions_with_text} captions`);
  totalCaptions += data.captions_with_text;
}
console.log(`Total: ${totalCaptions} captions de referencia en .data/ig-references/`);
