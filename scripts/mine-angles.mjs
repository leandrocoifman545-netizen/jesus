#!/usr/bin/env node
/**
 * WhatsApp Angle Miner — CLI
 *
 * Analiza los verbatims de la audiencia WhatsApp y descubre
 * tensiones/perspectivas nuevas para ángulos de guiones.
 *
 * Uso: node scripts/mine-angles.mjs
 * Requiere: ANTHROPIC_API_KEY en .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

// Load env
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("⛏️  WhatsApp Angle Miner\n");

  // Dynamic import of the mining module (needs to be compiled by Next.js)
  // Instead, we call the API endpoint
  const port = process.env.PORT || 3002;
  const url = `http://localhost:${port}/api/miner`;

  console.log(`📡 Llamando a ${url}...`);
  console.log("   (el server de Next.js tiene que estar corriendo)\n");

  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();

    if (data.error) {
      console.error(`❌ Error: ${data.error}`);
      process.exit(1);
    }

    console.log(`✅ Mining completado`);
    console.log(`   Verbatims analizados: ${data.total_verbatims_analyzed}`);
    console.log(`   Clusters encontrados: ${data.clusters.length}`);

    const newClusters = data.clusters.filter(c => c.is_new);
    console.log(`   Ángulos NUEVOS: ${newClusters.length}\n`);

    // Print clusters
    for (const cluster of data.clusters) {
      const badge = cluster.is_new ? "🆕" : "📎";
      const conf = cluster.confidence === "high" ? "🟢" : cluster.confidence === "medium" ? "🟡" : "🔴";
      console.log(`${badge} ${conf} ${cluster.tension_name} (${cluster.mapped_family}, score: ${cluster.score})`);
      console.log(`   ${cluster.perspective}`);
      if (cluster.proposed_big_idea) {
        console.log(`   💡 "${cluster.proposed_big_idea}"`);
      }
      if (cluster.proposed_angle) {
        console.log(`   🎯 Ángulo propuesto: ${cluster.proposed_angle}`);
      }
      console.log(`   Segmentos: ${cluster.segment_affinity.join(", ")}`);
      console.log(`   Verbatims: ${cluster.verbatims.length}`);
      console.log();
    }

    console.log(`📁 Guardado en .data/research/mined-angles-${new Date().toISOString().split("T")[0]}.json`);

  } catch (e) {
    console.error(`❌ Error de conexión. ¿Está corriendo el server en puerto ${port}?`);
    console.error(`   ${e.message}`);
    process.exit(1);
  }
}

main();
