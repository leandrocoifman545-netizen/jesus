#!/usr/bin/env node
/**
 * Pre-flight check for script generation.
 * Runs BEFORE writing any script — checks burned leads, outputs required decisions.
 *
 * Usage: node scripts/preflight-guion.mjs
 * Returns: JSON with burned leads + required decision template
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import googleTrends from "google-trends-api";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const MEMORY_DIR = join(import.meta.dirname, "..", ".memory");

// ── 1. Check all mandatory files exist ──
const MANDATORY_FILES = [
  // .memory/
  { path: join(MEMORY_DIR, "jesus-adp.md"), label: "jesus-adp.md" },
  { path: join(MEMORY_DIR, "consejos-jesus.md"), label: "consejos-jesus.md" },
  { path: join(MEMORY_DIR, "jesus-tono-adp-nuevo.md"), label: "jesus-tono-adp-nuevo.md" },
  { path: join(MEMORY_DIR, "jesus-historia.md"), label: "jesus-historia.md" },
  { path: join(MEMORY_DIR, "avatar-frases-reales.md"), label: "avatar-frases-reales.md" },
  // inteligencia-audiencia.md fusionado en avatar-frases-reales.md (2026-03-27)
  { path: join(MEMORY_DIR, "tecnicas-retencion.md"), label: "tecnicas-retencion.md" },
  { path: join(MEMORY_DIR, "tecnicas-venta-emiliano.md"), label: "tecnicas-venta-emiliano.md" },
  { path: join(MEMORY_DIR, "formatos-visuales.md"), label: "formatos-visuales.md" },
  // .data/
  { path: join(DATA_DIR, "angulos-expandidos.md"), label: "angulos-expandidos.md" },
  { path: join(DATA_DIR, "tipos-cuerpo.md"), label: "tipos-cuerpo.md" },
  { path: join(DATA_DIR, "venta-modelo-negocio.md"), label: "venta-modelo-negocio.md" },
  { path: join(DATA_DIR, "ctas-biblioteca.md"), label: "ctas-biblioteca.md" },
  { path: join(DATA_DIR, "enciclopedia-127-ingredientes.md"), label: "enciclopedia-127-ingredientes.md" },
  { path: join(DATA_DIR, "motor-audiencia.md"), label: "motor-audiencia.md" },
  { path: join(DATA_DIR, "reglas-diversidad.md"), label: "reglas-diversidad.md" },
  { path: join(DATA_DIR, "jerarquia-decisiones.md"), label: "jerarquia-decisiones.md" },
  { path: join(DATA_DIR, "objeciones-adp.md"), label: "objeciones-adp.md" },
];

const missingFiles = MANDATORY_FILES.filter(f => !existsSync(f.path)).map(f => f.label);

// ── 2. Get burned leads ──
let burnedLeads = [];
const burnedPath = join(DATA_DIR, "burned-leads.json");
if (existsSync(burnedPath)) {
  try {
    const data = JSON.parse(readFileSync(burnedPath, "utf-8"));
    burnedLeads = (data.leads || data || []).map(l => ({
      text: (l.text || "").substring(0, 100),
      hookType: l.hookType || l.hook_type || "unknown",
    }));
  } catch { /* ignore */ }
}

// ── 3. Get recent generations (last 10) for diversity check ──
let recentGenerations = [];
let diversityAlerts = [];
const gensDir = join(DATA_DIR, "generations");
if (existsSync(gensDir)) {
  try {
    const files = readdirSync(gensDir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const data = JSON.parse(readFileSync(join(gensDir, f), "utf-8"));
        const ings = (data.script?.ingredients_used || []).map(i => `${i.category}#${i.ingredient_number}`);
        return {
          id: data.id,
          createdAt: data.createdAt,
          title: data.title || "",
          angle_family: data.script?.angle_family || "?",
          angle_specific: data.script?.angle_specific || "?",
          body_type: data.script?.body_type || "?",
          model_sale_type: data.script?.model_sale_type || "?",
          segment: data.script?.segment || "?",
          funnel_stage: data.script?.funnel_stage || "?",
          niche: data.script?.niche || "?",
          arc: data.script?.development?.emotional_arc || "?",
          ingredients: ings,
        };
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 10);
    recentGenerations = files;

    // ── Diversity alerts: detect overused arcs, vehicles, ingredients ──
    const last3 = files.slice(0, 3);
    const last5 = files.slice(0, 5);

    // Arcs used in last 3
    const recentArcs = last3.map(g => g.arc).filter(a => a !== "?");
    const arcCounts = {};
    recentArcs.forEach(a => { arcCounts[a] = (arcCounts[a] || 0) + 1; });
    const overusedArcs = Object.entries(arcCounts).filter(([, c]) => c >= 2).map(([a]) => a);
    if (overusedArcs.length > 0) {
      diversityAlerts.push(`⚠️ ARCOS REPETIDOS en últimos 3: ${overusedArcs.join(", ")} — save-generation BLOQUEARÁ si se repiten`);
    }

    // Vehicles used in last 5
    const recentVehicles = last5.map(g => g.body_type).filter(v => v !== "?");
    const vehCounts = {};
    recentVehicles.forEach(v => { vehCounts[v] = (vehCounts[v] || 0) + 1; });
    const overusedVeh = Object.entries(vehCounts).filter(([, c]) => c >= 2).map(([v, c]) => `${v} (${c}x)`);
    if (overusedVeh.length > 0) {
      diversityAlerts.push(`⚠️ VEHÍCULOS REPETIDOS en últimos 5: ${overusedVeh.join(", ")} — save-generation BLOQUEARÁ si se usan 2+ veces`);
    }

    // Gastado ingredients in last 10
    const GASTADO = new Set(["F#73", "F#74", "G#90", "B#29"]);
    const allIngs = files.flatMap(g => g.ingredients);
    const gastadoCount = allIngs.filter(i => GASTADO.has(i)).length;
    if (gastadoCount > 5) {
      diversityAlerts.push(`⚠️ Ingredientes GASTADOS (F#73/F#74/G#90/B#29) usados ${gastadoCount}x en últimos 10. Priorizar frescos: D#49, E#67, F#75, F#76, F#82, G#94, K#125-127`);
    }

    // Ingredient variety
    const uniqueIngs = new Set(allIngs);
    if (allIngs.length > 0 && uniqueIngs.size < allIngs.length * 0.5) {
      diversityAlerts.push(`⚠️ Poca variedad de ingredientes: ${uniqueIngs.size} únicos de ${allIngs.length} totales en últimos 10 guiones`);
    }

    if (diversityAlerts.length === 0) {
      diversityAlerts.push("✅ Diversidad OK — no hay arcos, vehículos ni ingredientes sobreusados");
    }
  } catch { /* ignore */ }
}

// ── 4. Google Trends — Quick scan DIRECTO (sin depender de la web) ──

// Nichos del ecosistema ADP (productos digitales que la audiencia puede crear)
const ADP_NICHES = [
  "recetas saludables", "rutinas de ejercicio", "guías de viaje",
  "cuidado de mascotas", "organización del hogar", "jardinería en casa",
  "manualidades para vender", "diseño de interiores", "educación financiera",
  "skincare natural", "meditación", "fotografía para redes",
  "crianza de hijos", "nutrición canina", "mecánica automotriz",
  "repostería", "yoga en casa", "marketing para emprendedores",
  "crochet", "costura", "uñas acrílicas", "maquillaje",
  "adiestramiento canino", "huerta urbana", "planificación de bodas",
];

// Seeds para descubrir rising queries (orientadas a nuevos nichos de productos digitales)
const DISCOVER_SEEDS = ["productos digitales", "curso online", "vender ebook"];

// Nichos usados recientemente → excluir para descubrir NUEVOS
const recentNiches = new Set(recentGenerations.map(g => g.niche.toLowerCase()).filter(n => n !== "?"));

// Elegir 3 nichos NO usados recientemente (random para que cada preflight sea distinto)
const freshNiches = ADP_NICHES.filter(n => !recentNiches.has(n.toLowerCase()));
const shuffled = freshNiches.sort(() => Math.random() - 0.5);
const nichesToCheck = shuffled.slice(0, 3);

// Si el usuario pasó un nicho específico, agregarlo al principio
const nicheArg = process.argv[2];
if (nicheArg && !nichesToCheck.includes(nicheArg)) {
  nichesToCheck.unshift(nicheArg);
}

// Helper: query Google Trends directly
async function getTrend(keyword) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const raw = await googleTrends.interestOverTime({
      keyword, startTime: sixMonthsAgo, geo: "AR", hl: "es",
    });
    const data = JSON.parse(raw);
    const timeline = data?.default?.timelineData || [];
    if (timeline.length === 0) return null;
    const values = timeline.map(p => p.value[0]);
    const latest = values[values.length - 1] || 0;
    const peak = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const trend = latest >= peak * 0.8 ? "subiendo" : latest >= peak * 0.5 ? "estable" : "bajando";
    return { keyword, trend, current_interest: latest, peak_interest: peak, avg };
  } catch { return null; }
}

async function getRising(seed) {
  try {
    const raw = await googleTrends.relatedQueries({ keyword: seed, geo: "AR", hl: "es" });
    const data = JSON.parse(raw);
    const rising = (data?.default?.rankedList?.[1]?.rankedKeyword || [])
      .slice(0, 8)
      .map(k => ({ query: k.query, growth: k.value }));
    return rising;
  } catch { return []; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

let trendsData = {
  niche_specific: null,
  niche_scans: [],
  rising_queries: [],
  suggestions: [],
};

try {
  // 4a. Check specific niches (3 fresh + optional user niche)
  for (const niche of nichesToCheck) {
    const result = await getTrend(niche);
    if (result) {
      const entry = { ...result, niche, is_user_requested: niche === nicheArg };
      if (niche === nicheArg) trendsData.niche_specific = entry;
      trendsData.niche_scans.push(entry);
    }
    await sleep(300); // Rate limiting
  }

  // 4b. Discover rising queries from 1 random ADP seed
  const seed = DISCOVER_SEEDS[Math.floor(Math.random() * DISCOVER_SEEDS.length)];
  const rising = await getRising(seed);
  trendsData.rising_queries = rising.map(r => ({ ...r, seed }));

  // 4c. Generate suggestions
  const subiendo = trendsData.niche_scans.filter(n => n.trend === "subiendo");
  const bajando = trendsData.niche_scans.filter(n => n.trend === "bajando");

  if (subiendo.length > 0) {
    trendsData.suggestions.push(`NICHOS SUBIENDO: ${subiendo.map(n => n.niche).join(", ")} → priorizar`);
  }
  if (bajando.length > 0) {
    trendsData.suggestions.push(`NICHOS BAJANDO: ${bajando.map(n => n.niche).join(", ")} → evitar o buscar ángulo distinto`);
  }
  if (trendsData.rising_queries.length > 0) {
    const topRising = trendsData.rising_queries.slice(0, 3).map(r => r.query).join(", ");
    trendsData.suggestions.push(`RISING QUERIES (desde "${seed}"): ${topRising} → posibles ángulos nuevos`);
  }
  if (trendsData.niche_scans.length === 0 && trendsData.rising_queries.length === 0) {
    trendsData.suggestions.push("Google Trends no respondió — posible rate limit. Reintentar en 1 minuto.");
  }
} catch {
  trendsData.suggestions.push("Error conectando a Google Trends.");
}

// ── 5. Load winner patterns (if file exists) ──
let winnerPatterns = null;
const winnerPatternsPath = join(DATA_DIR, "winner-patterns.md");
if (existsSync(winnerPatternsPath)) {
  const content = readFileSync(winnerPatternsPath, "utf-8");
  // Extract just the key stats (first 30 lines)
  winnerPatterns = content.split("\n").slice(0, 30).join("\n");
}

// ── 6. Load session insights (if file exists) ──
let sessionInsights = null;
const sessionPath = join(DATA_DIR, "session-insights.md");
if (existsSync(sessionPath)) {
  const content = readFileSync(sessionPath, "utf-8");
  sessionInsights = content.split("\n").slice(0, 30).join("\n");
}

// ── 7. Output ──
const result = {
  status: missingFiles.length === 0 ? "READY" : "MISSING_FILES",
  missing_files: missingFiles,
  burned_leads: {
    total: burnedLeads.length,
    leads: burnedLeads,
  },
  recent_generations: recentGenerations,
  diversity_alerts: diversityAlerts,
  trends: trendsData,
  winner_patterns_summary: winnerPatterns,
  session_insights_summary: sessionInsights,
  decision_template: {
    _instructions: "COMPLETAR TODOS estos campos ANTES de escribir el guion. Si alguno está vacío, el guion no se puede guardar.",
    tension_emocional: "[T1-T12 de motor-audiencia.md]",
    vocabulario_segmento: "[A/B/C/D — palabras exactas del segmento]",
    objecion_central: "[si aplica — de motor-audiencia.md sección 2]",
    intento_fallido_para_lead: "[al menos 1 lead de la tabla de intentos fallidos]",
    trigger_engagement: "[de motor-audiencia.md sección 6]",
    big_idea: "[específica, no genérica — viene del ángulo]",
    creencia_central: "[la UNA cosa que hace la venta inevitable]",
    micro_creencias: ["[barrera 1]", "[barrera 2]", "[barrera 3 opcional]"],
    familia_angulo: "[1-5]",
    angulo_especifico: "[ej: 2.3]",
    vehiculo_narrativo: "[1 de 8 de tipos-cuerpo.md]",
    arco_narrativo: "[1 de 8 de reglas-diversidad.md]",
    venta_modelo: "[1 de 10 de venta-modelo-negocio.md]",
    segmento: "[A/B/C/D]",
    funnel: "[TOFU/MOFU/RETARGET]",
    nicho: "[específico]",
    formato_visual: "[de formatos-visuales.md]",
    ingredientes: ["[categoría#número nombre]"],
    duracion_objetivo: "[60-90s]",
  },
};

console.log(JSON.stringify(result, null, 2));
