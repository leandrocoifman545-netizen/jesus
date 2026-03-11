#!/usr/bin/env node

/**
 * Research Angles — Descubre y rankea ángulos para guiones ADP
 *
 * Flujo:
 * 1. Google Suggest (client=chrome) → descubre búsquedas reales + relevance score
 * 2. Consulta por cada país LATAM → score combinado = popularidad real
 * 3. Clasifica por ángulo ADP, nicho y tipo
 * 4. Guarda en .data/research/
 *
 * Uso:
 *   node scripts/research-angles.mjs                    # Keywords por defecto
 *   node scripts/research-angles.mjs "keyword1,keyword2" # Keywords custom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.data', 'research');

// --- CONFIG ---

const DEFAULT_KEYWORDS = [
  'ganar plata por internet',
  'vender por internet',
  'negocio desde casa',
  'productos digitales',
  'ganar dinero con inteligencia artificial',
  'negocio online sin experiencia',
  'vender con inteligencia artificial',
  'generar ingresos extra',
  'trabajar desde casa',
  'emprender sin dinero',
  'crear curso online',
  'vender en hotmart',
  'negocio digital',
  'ingresos en dolares desde latinoamerica',
  'como usar chatgpt para ganar dinero',
];

const PREFIXES = [
  '', 'cómo ', 'por qué ', 'se puede ', 'es posible ',
  'qué es ', 'dónde ', 'cuánto ', 'sin ', 'con ',
  'para ', 'desde ', 'mejor ', 'peor ',
];

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colombia' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'PE', name: 'Perú' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// --- GOOGLE SUGGEST WITH RELEVANCE SCORES ---

async function getSuggestionsWithScores(query, gl = 'AR') {
  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'chrome');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'es');
  url.searchParams.set('gl', gl);

  try {
    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const data = await res.json();
    const suggestions = data[1] || [];
    const relevance = data[4]?.['google:suggestrelevance'] || [];

    return suggestions.map((s, i) => ({
      keyword: s,
      relevance: relevance[i] || 0,
    }));
  } catch {
    return [];
  }
}

// --- PHASE 1: DISCOVER ---

async function discoverSuggestions(keywords) {
  console.log(`\n🔍 Fase 1: Descubriendo búsquedas reales (${keywords.length} keywords base)...\n`);
  const allSuggestions = new Map();

  for (const kw of keywords) {
    process.stdout.write(`  "${kw}" `);
    let count = 0;

    // Prefixes
    for (const prefix of PREFIXES) {
      const query = prefix + kw;
      const results = await getSuggestionsWithScores(query, 'AR');
      for (const r of results) {
        const key = r.keyword.toLowerCase().trim();
        if (!allSuggestions.has(key)) {
          allSuggestions.set(key, {
            keyword: r.keyword,
            source_keyword: kw,
            source_query: query,
            discovery_relevance: r.relevance,
          });
          count++;
        }
      }
      await sleep(80);
    }

    // Alphabet expansion
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const results = await getSuggestionsWithScores(`${kw} ${letter}`, 'AR');
      for (const r of results) {
        const key = r.keyword.toLowerCase().trim();
        if (!allSuggestions.has(key)) {
          allSuggestions.set(key, {
            keyword: r.keyword,
            source_keyword: kw,
            source_query: `${kw} ${letter}`,
            discovery_relevance: r.relevance,
          });
          count++;
        }
      }
      await sleep(50);
    }

    console.log(`→ ${count} nuevas`);
  }

  const total = allSuggestions.size;
  console.log(`\n  ✅ ${total} búsquedas únicas descubiertas\n`);
  return Array.from(allSuggestions.values());
}

// --- PHASE 2: RANK BY MULTI-COUNTRY RELEVANCE ---

async function getScoreForKeyword(keyword, gl) {
  // Truncate keyword to ~60% so Google returns it as a suggestion with relevance score
  const truncated = keyword.slice(0, Math.max(10, Math.floor(keyword.length * 0.6)));
  const results = await getSuggestionsWithScores(truncated, gl);

  // Find best match (exact or starts with)
  const lower = keyword.toLowerCase();
  const exact = results.find(r => r.keyword.toLowerCase() === lower);
  if (exact) return exact.relevance;

  const startsWith = results.find(r => r.keyword.toLowerCase().startsWith(lower.slice(0, 20)));
  if (startsWith) return Math.round(startsWith.relevance * 0.8); // Slightly discount partial matches

  return 0;
}

async function rankByCountry(suggestions) {
  console.log(`📊 Fase 2: Rankeando las mejores por volumen en ${COUNTRIES.length} países LATAM...\n`);

  // Select top candidates to rank (by discovery_relevance + question priority)
  const scored = suggestions.map(s => ({
    ...s,
    priority: s.discovery_relevance + questionBonus(s.keyword),
  }));
  scored.sort((a, b) => b.priority - a.priority);

  // Take top 300 to rank across countries
  const toRank = scored.slice(0, 300);
  const rest = scored.slice(300);

  console.log(`  → Rankeando top ${toRank.length} keywords en ${COUNTRIES.length} países...\n`);

  let done = 0;
  for (const item of toRank) {
    const countryScores = {};
    let totalScore = 0;

    for (const country of COUNTRIES) {
      const score = await getScoreForKeyword(item.keyword, country.code);
      countryScores[country.name] = score;
      totalScore += score;
      await sleep(80);
    }

    item.total_score = totalScore;
    item.score_by_country = countryScores;

    done++;
    if (done % 25 === 0) {
      console.log(`  ${done}/${toRank.length} keywords rankeadas...`);
    }
  }

  // Mark unranked
  for (const item of rest) {
    item.total_score = -1;
    item.score_by_country = null;
  }

  // Combine and sort
  const all = [...toRank, ...rest];
  all.sort((a, b) => b.total_score - a.total_score);

  console.log(`\n  ✅ Ranking completo\n`);
  return all;
}

function questionBonus(kw) {
  const lower = kw.toLowerCase();
  let score = 0;
  if (/^(cómo|como)\b/.test(lower)) score += 200;
  if (/^(por qué|por que)\b/.test(lower)) score += 200;
  if (/^(qué es|que es)\b/.test(lower)) score += 150;
  if (/^(se puede|es posible)\b/.test(lower)) score += 150;
  if (/^(cuánto|cuanto)\b/.test(lower)) score += 100;
  if (/sin\b/.test(lower)) score += 50;
  if (/desde casa/.test(lower)) score += 50;
  if (/inteligencia artificial|chatgpt|ia\b/.test(lower)) score += 100;
  return score;
}

// --- CLASSIFICATION ---

function classifySuggestion(keyword) {
  const lower = keyword.toLowerCase();

  let type = 'general';
  if (/^(cómo|como)\b/.test(lower)) type = 'how_to';
  else if (/^(por qué|por que|porque)\b/.test(lower)) type = 'why';
  else if (/^(qué|que|cuál|cual)\b/.test(lower)) type = 'what';
  else if (/^(se puede|es posible)\b/.test(lower)) type = 'can_i';
  else if (/^(dónde|donde)\b/.test(lower)) type = 'where';
  else if (/^(cuánto|cuanto)\b/.test(lower)) type = 'how_much';
  else if (/\bvs\b|\bo\b.*\bmejor\b/.test(lower)) type = 'comparison';

  let angles = [];
  if (/plata|dinero|ingreso|ganar|sueldo|cobrar/.test(lower)) angles.push('dolor_economico');
  if (/tecnología|celular|computadora|app|programa/.test(lower)) angles.push('barrera_tecnologica');
  if (/libertad|sueño|independ|propio|renunci/.test(lower)) angles.push('libertad_sueno');
  if (/estafa|mentira|funciona|verdad|real|confiar|paga/.test(lower)) angles.push('desconfianza');
  if (/mamá|papá|hijo|familia|tiempo|hora|mujer/.test(lower)) angles.push('mama_tiempo');
  if (/paso|proceso|cómo|como|tutorial|aprender/.test(lower)) angles.push('proceso_demo');
  if (/edad|\b50\b|\b60\b|mayor|jubil|reinvent/.test(lower)) angles.push('edad_reinvencion');
  if (/argentin|mexic|colomb|venezuel|peru|latam|latino|chile|ecuador|urugua/.test(lower)) angles.push('latam_regional');
  if (/\bia\b|inteligencia artificial|chatgpt|gpt/.test(lower)) angles.push('ia');

  let niche = null;
  if (/cocin|receta|comida|reposter|gastronom/.test(lower)) niche = 'cocina';
  if (/mascota|perro|gato|veterin/.test(lower)) niche = 'mascotas';
  if (/fitness|ejercicio|gym|deporte|entren/.test(lower)) niche = 'fitness';
  if (/finanza|ahorro|gasto|presupuesto|inver|trading|cripto/.test(lower)) niche = 'finanzas';
  if (/crianza|bebé|niño|maternidad|embaraz/.test(lower)) niche = 'crianza';
  if (/belleza|maquillaje|skincare|cosmét|uñas/.test(lower)) niche = 'belleza';
  if (/idioma|inglés|english/.test(lower)) niche = 'idiomas';
  if (/foto|video|edici|youtube/.test(lower)) niche = 'fotografia_video';
  if (/salud|nutrici|dieta|natural|bienestar/.test(lower)) niche = 'salud_nutricion';
  if (/jardín|huerta|planta/.test(lower)) niche = 'jardineria';
  if (/manualidad|tejido|costura|artesaní|crochet/.test(lower)) niche = 'manualidades';
  if (/diseño|logo|marca|canva/.test(lower)) niche = 'diseno';
  if (/música|instrumento|guitarra/.test(lower)) niche = 'musica';
  if (/programación|código|web|software|develop/.test(lower)) niche = 'programacion';
  if (/marketing|ventas|redes social|instagram|tiktok|copywriting/.test(lower)) niche = 'marketing';
  if (/tarot|astrolog|horóscopo/.test(lower)) niche = 'tarot_astrologia';
  if (/ebook|libro|escrib/.test(lower)) niche = 'escritura';
  if (/psicolog|terapia|coaching|autoayuda/.test(lower)) niche = 'psicologia_coaching';
  if (/inmobil|departamento|alquil|bienes raíces/.test(lower)) niche = 'inmobiliaria';
  if (/whatsapp/.test(lower)) niche = 'whatsapp';
  if (/amazon|mercado libre|shopify|ecommerce|tienda online/.test(lower)) niche = 'ecommerce';
  if (/freelance|fiverr|upwork/.test(lower)) niche = 'freelance';

  return { type, angles, niche };
}

// --- REPORT ---

function generateReport(results) {
  const ranked = results.filter(r => r.total_score > 0);

  const byAngle = {};
  const byNiche = {};
  const byType = {};

  for (const r of results) {
    r.classification = classifySuggestion(r.keyword);
    for (const angle of r.classification.angles) {
      if (!byAngle[angle]) byAngle[angle] = [];
      byAngle[angle].push(r);
    }
    if (r.classification.niche) {
      if (!byNiche[r.classification.niche]) byNiche[r.classification.niche] = [];
      byNiche[r.classification.niche].push(r);
    }
    const t = r.classification.type;
    if (!byType[t]) byType[t] = [];
    byType[t].push(r);
  }

  // Sort within groups by score
  for (const arr of Object.values(byAngle)) arr.sort((a, b) => b.total_score - a.total_score);
  for (const arr of Object.values(byNiche)) arr.sort((a, b) => b.total_score - a.total_score);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_suggestions: results.length,
      ranked_count: ranked.length,
      by_angle: Object.fromEntries(
        Object.entries(byAngle).map(([k, v]) => [k, { total: v.length, top3: v.slice(0, 3).map(i => i.keyword) }])
      ),
      by_niche: Object.fromEntries(
        Object.entries(byNiche).map(([k, v]) => [k, { total: v.length, top3: v.slice(0, 3).map(i => i.keyword) }])
      ),
      by_type: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length])),
    },
    top_100: ranked.slice(0, 100).map(r => ({
      keyword: r.keyword,
      total_score: r.total_score,
      score_by_country: r.score_by_country,
      classification: r.classification,
    })),
    by_angle: Object.fromEntries(
      Object.entries(byAngle).map(([k, v]) => [k, v.slice(0, 20).map(i => ({
        keyword: i.keyword, total_score: i.total_score, score_by_country: i.score_by_country,
      }))])
    ),
    by_niche: Object.fromEntries(
      Object.entries(byNiche).map(([k, v]) => [k, v.slice(0, 15).map(i => ({
        keyword: i.keyword, total_score: i.total_score,
      }))])
    ),
    all_results: results.map(r => ({
      keyword: r.keyword,
      source_keyword: r.source_keyword,
      total_score: r.total_score,
      score_by_country: r.score_by_country,
      classification: r.classification,
    })),
  };
}

function printSummary(report) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RESEARCH COMPLETO — Resumen');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`  Total búsquedas: ${report.summary.total_suggestions}`);
  console.log(`  Con score de volumen: ${report.summary.ranked_count}`);

  console.log('\n  📐 POR ÁNGULO ADP:');
  const angles = Object.entries(report.summary.by_angle).sort((a, b) => b[1].total - a[1].total);
  for (const [angle, data] of angles) {
    console.log(`\n    ${angle.toUpperCase()} (${data.total} keywords)`);
    for (const kw of data.top3) {
      console.log(`      • ${kw}`);
    }
  }

  console.log('\n\n  🏷️  POR NICHO:');
  const niches = Object.entries(report.summary.by_niche).sort((a, b) => b[1].total - a[1].total);
  for (const [niche, data] of niches) {
    console.log(`    ${niche} (${data.total}) → ${data.top3[0]}`);
  }

  console.log('\n\n  🔝 TOP 30 BÚSQUEDAS (mayor volumen LATAM):');
  for (let i = 0; i < Math.min(30, report.top_100.length); i++) {
    const item = report.top_100[i];
    const countries = item.score_by_country
      ? Object.entries(item.score_by_country)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => `${k.slice(0,3)}:${v}`)
          .join(' ')
      : '';
    const tags = [
      ...(item.classification.angles || []),
      item.classification.niche,
    ].filter(Boolean).join(', ');
    console.log(`    ${String(i + 1).padStart(2)}. [${String(item.total_score).padStart(4)}] ${item.keyword}`);
    if (tags) console.log(`        → ${tags}`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// --- UTILS ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- MAIN ---

async function main() {
  const customKw = process.argv[2];
  const keywords = customKw
    ? customKw.split(',').map(k => k.trim())
    : DEFAULT_KEYWORDS;

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  Research Angles — ADP Script Generator               ║');
  console.log('║  Google Suggest (relevance scores) × 5 países LATAM   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  const start = Date.now();

  // Phase 1: Discover
  const suggestions = await discoverSuggestions(keywords);

  // Phase 2: Rank by multi-country relevance
  const ranked = await rankByCountry(suggestions);

  // Phase 3: Report
  const report = generateReport(ranked);

  // Save
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `research-${timestamp}.json`;
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'latest.json'), JSON.stringify(report, null, 2));

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`💾 Guardado en .data/research/${filename} y .data/research/latest.json`);
  console.log(`⏱️  Tiempo total: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s\n`);

  printSummary(report);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
