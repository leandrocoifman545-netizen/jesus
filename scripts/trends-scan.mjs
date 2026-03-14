#!/usr/bin/env node

/**
 * Trends Scan — Corre queries a Google Trends y genera un reporte de tendencias.
 * Usar antes de armar estrategias semanales o buscar ángulos nuevos.
 *
 * Usage:
 *   node scripts/trends-scan.mjs                    # Scan completo
 *   node scripts/trends-scan.mjs --niches "cocina,fitness,finanzas"  # Nichos específicos
 *   node scripts/trends-scan.mjs --discover         # Modo descubrimiento (related queries)
 */

import googleTrends from "google-trends-api";

const COUNTRIES = [
  { code: "AR", name: "Argentina" },
  { code: "MX", name: "Mexico" },
  { code: "CO", name: "Colombia" },
];

// Keywords base del ecosistema ADP
const BASE_KEYWORDS = [
  "productos digitales",
  "ganar dinero con inteligencia artificial",
  "negocio online desde casa",
  "vender por internet",
  "crear curso online",
  "ingreso extra",
  "emprender con IA",
  "ChatGPT para ganar dinero",
];

// Nichos que ya usamos en guiones — validar si siguen trending
const NICHE_KEYWORDS = [
  "guías de viaje",
  "recetas saludables",
  "plantillas de Canva",
  "nutrición canina",
  "organización financiera",
  "rutinas de ejercicio",
  "guías de estudio",
  "diseño de interiores",
  "cuidado de mascotas",
  "meditación y mindfulness",
  "fotografía para redes sociales",
  "jardinería en casa",
  "manualidades para vender",
  "skincare natural",
  "educación financiera",
];

// Nichos nuevos para explorar (descubrimiento)
const DISCOVER_SEEDS = [
  "productos digitales",
  "vender ebook",
  "curso online",
  "plantillas digitales",
  "guía digital",
  "IA para emprender",
];

async function getInterestOverTime(keyword, geo = "AR") {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const raw = await googleTrends.interestOverTime({
      keyword,
      startTime: sixMonthsAgo,
      geo,
      hl: "es",
    });
    const data = JSON.parse(raw);
    const timeline = data?.default?.timelineData || [];
    if (timeline.length === 0) return null;

    const values = timeline.map((p) => p.value[0]);
    const latest = values[values.length - 1] || 0;
    const peak = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const trend = latest >= peak * 0.8 ? "subiendo" : latest >= peak * 0.5 ? "estable" : "bajando";

    return { keyword, geo, latest, peak, avg, trend };
  } catch {
    return null;
  }
}

async function getRelatedQueries(keyword, geo = "AR") {
  try {
    const raw = await googleTrends.relatedQueries({ keyword, geo, hl: "es" });
    const data = JSON.parse(raw);
    const rankedList = data?.default?.rankedList || [];

    const top = (rankedList[0]?.rankedKeyword || [])
      .slice(0, 10)
      .map((k) => ({ query: k.query, value: k.value }));
    const rising = (rankedList[1]?.rankedKeyword || [])
      .slice(0, 10)
      .map((k) => ({ query: k.query, value: k.value }));

    return { keyword, geo, top, rising };
  } catch {
    return { keyword, geo, top: [], rising: [] };
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scanBase() {
  console.log("\n📊 SCAN BASE — Keywords del ecosistema ADP\n");
  console.log("=" .repeat(70));

  const results = [];
  for (const kw of BASE_KEYWORDS) {
    const r = await getInterestOverTime(kw, "AR");
    if (r) {
      results.push(r);
      const icon = r.trend === "subiendo" ? "🟢" : r.trend === "estable" ? "🟡" : "🔴";
      console.log(`${icon} "${r.keyword}" — ${r.trend} (actual: ${r.latest}, pico: ${r.peak}, avg: ${r.avg})`);
    }
    await sleep(300); // Rate limiting
  }

  // Multi-country comparison for top keywords
  console.log("\n📍 Comparación por país (top 3 keywords):\n");
  for (const kw of BASE_KEYWORDS.slice(0, 3)) {
    const byCountry = [];
    for (const country of COUNTRIES) {
      const r = await getInterestOverTime(kw, country.code);
      if (r) byCountry.push({ ...r, country: country.name });
      await sleep(200);
    }
    if (byCountry.length > 0) {
      console.log(`  "${kw}":`);
      byCountry.sort((a, b) => b.latest - a.latest);
      for (const c of byCountry) {
        console.log(`    ${c.country}: ${c.latest} (${c.trend})`);
      }
    }
  }

  return results;
}

async function scanNiches(customNiches) {
  const niches = customNiches || NICHE_KEYWORDS;
  console.log(`\n🎯 SCAN NICHOS — ${niches.length} nichos\n`);
  console.log("=".repeat(70));

  const results = [];
  for (const niche of niches) {
    const r = await getInterestOverTime(niche, "AR");
    if (r) {
      results.push(r);
      const icon = r.trend === "subiendo" ? "🟢" : r.trend === "estable" ? "🟡" : "🔴";
      console.log(`${icon} "${r.keyword}" — ${r.trend} (actual: ${r.latest}, avg: ${r.avg})`);
    } else {
      console.log(`⚪ "${niche}" — sin datos suficientes`);
    }
    await sleep(300);
  }

  // Sort by interest
  results.sort((a, b) => b.latest - a.latest);

  console.log("\n📈 TOP 5 nichos por interés actual:");
  for (const r of results.slice(0, 5)) {
    console.log(`  1. "${r.keyword}" — ${r.latest}/100 (${r.trend})`);
  }

  console.log("\n🆕 Nichos SUBIENDO:");
  const subiendo = results.filter((r) => r.trend === "subiendo");
  if (subiendo.length > 0) {
    for (const r of subiendo) {
      console.log(`  ↗ "${r.keyword}" — ${r.latest}/100`);
    }
  } else {
    console.log("  Ninguno claramente subiendo en este período");
  }

  return results;
}

async function discoverNew() {
  console.log("\n🔍 MODO DESCUBRIMIENTO — Buscando ángulos nuevos\n");
  console.log("=".repeat(70));

  const allRising = new Map();

  for (const seed of DISCOVER_SEEDS) {
    console.log(`\n  Seed: "${seed}"`);
    const related = await getRelatedQueries(seed, "AR");

    if (related.rising.length > 0) {
      console.log("  Rising:");
      for (const q of related.rising.slice(0, 5)) {
        console.log(`    ↗ "${q.query}" (+${q.value}%)`);
        allRising.set(q.query, (allRising.get(q.query) || 0) + q.value);
      }
    }
    if (related.top.length > 0) {
      console.log("  Top:");
      for (const q of related.top.slice(0, 5)) {
        console.log(`    ★ "${q.query}" (${q.value})`);
      }
    }
    await sleep(500);
  }

  // Consolidated rising queries (appeared in multiple seeds)
  console.log("\n🌟 QUERIES RISING CONSOLIDADAS (aparecen en múltiples seeds):\n");
  const sorted = [...allRising.entries()].sort((a, b) => b[1] - a[1]);
  for (const [query, score] of sorted.slice(0, 15)) {
    console.log(`  "${query}" — score acumulado: ${score}`);
  }

  return sorted;
}

// --- Main ---

const args = process.argv.slice(2);
const isDiscover = args.includes("--discover");
const nichesArg = args.find((a) => a.startsWith("--niches"));
const customNiches = nichesArg
  ? args[args.indexOf(nichesArg) + 1]?.split(",").map((n) => n.trim())
  : null;

console.log("🔄 Trends Scan — " + new Date().toISOString().split("T")[0]);
console.log("Consultando Google Trends...\n");

(async () => {
  try {
    if (isDiscover) {
      await discoverNew();
    } else {
      await scanBase();
      await scanNiches(customNiches);
      // Always run discovery at the end
      await discoverNew();
    }

    console.log("\n✅ Scan completo.\n");
    console.log("Usá estos datos para:");
    console.log("  1. Elegir nichos calientes para la estrategia semanal");
    console.log("  2. Validar que los nichos que planeamos siguen trending");
    console.log("  3. Descubrir ángulos nuevos desde las rising queries");
    console.log("  4. Comparar interés entre países para ads segmentados\n");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
