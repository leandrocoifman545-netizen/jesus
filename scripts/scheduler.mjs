#!/usr/bin/env node

/**
 * SCHEDULER ALGORÍTMICO — ADP Guiones v2
 *
 * Lee generaciones anteriores, computa cobertura por dimensión,
 * y genera constraints óptimas para el próximo guion.
 *
 * Uso:
 *   node scripts/scheduler.mjs                  → 1 constraint set
 *   node scripts/scheduler.mjs --count 3        → 3 constraint sets (para plan-3)
 *   node scripts/scheduler.mjs --count 3 --json → output JSON puro (para consumo programático)
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

// ─── CONFIG ────────────────────────────────────────────────────────
const DATA_DIR = new URL('../.data', import.meta.url).pathname;
const GEN_DIR = join(DATA_DIR, 'generations');
const V2_DIR = join(DATA_DIR, 'v2');
const RESERVES_DIR = join(V2_DIR, 'active-runs');

// Reservas que expiran: si una terminal se cuelga, no bloquean para siempre.
const RESERVE_TTL_MS = 30 * 60 * 1000; // 30 min

// ─── ESPACIO DIMENSIONAL COMPLETO ──────────────────────────────────

const VEHICULOS = [
  { id: 'demolicion_mito',        num: 1,  nombre: 'Demolición de mito',         tono: 'Confrontativo, revelador',       uso: '○' },
  { id: 'historia_con_giro',      num: 2,  nombre: 'Historia con giro',          tono: 'Narrativo, empático',            uso: '○' },
  { id: 'demo_proceso',           num: 3,  nombre: 'Demo/Proceso paso a paso',   tono: 'Práctico, directo',              uso: '●' },
  { id: 'comparacion_caminos',    num: 4,  nombre: 'Comparación de caminos',     tono: 'Lógico, contrastante',           uso: '●' },
  { id: 'un_dia_en_la_vida',      num: 5,  nombre: 'Un día en la vida',          tono: 'Aspiracional, sensorial',        uso: '○' },
  { id: 'pregunta_respuesta',     num: 6,  nombre: 'Pregunta y respuesta',       tono: 'Rápido, eliminador',             uso: '○' },
  { id: 'analogia_extendida',     num: 7,  nombre: 'Analogía extendida',         tono: 'Familiar, revelador',            uso: '○' },
  { id: 'contraste_emocional',    num: 8,  nombre: 'Contraste emocional',        tono: 'Emocional, urgente',             uso: '●' },
  { id: 'demolicion_alternativas',num: 9,  nombre: 'Demolición alternativas ⭐',  tono: 'Honesto, lógico-progresivo',     uso: '●' },
  { id: 'qa_conversacional',      num: 10, nombre: 'Q&A conversacional ⭐',       tono: 'Consejero, cero presión',        uso: '○' },
  { id: 'tier_list_rating',       num: 11, nombre: 'Tier-list/Rating',           tono: 'Opinión experta, polémico',      uso: '○' },
  { id: 'trailer_recurso',        num: 12, nombre: 'Trailer de recurso',         tono: 'Entusiasta, rápido',             uso: '○' },
  { id: 'quiz_comparacion',       num: 13, nombre: 'Quiz comparación',           tono: 'Interactivo, educativo',         uso: '○' },
];

const ARCOS = [
  { id: 'revelacion_oportunidad',  num: 1, nombre: 'Revelación de oportunidad',   energia: 'Curiosidad → descubrimiento → deseo',    ingredientes: 'B#29 + F#73' },
  { id: 'dolor_puro_esperanza',    num: 2, nombre: 'Dolor puro → esperanza',      energia: 'Oscuridad → agitación → luz',             ingredientes: 'B#23 + C#40 + D#49. SIN demo.' },
  { id: 'confrontacion_directa',   num: 3, nombre: 'Confrontación directa',       energia: 'Incomodidad → verdad → claridad',         ingredientes: 'D#51 + C#43 + F#72' },
  { id: 'historia_personal',       num: 4, nombre: 'Historia personal Jesús',     energia: 'Vulnerabilidad → conexión → lección',      ingredientes: 'E#67 + E#62 + G#92. SIN demo.' },
  { id: 'pregunta_tras_pregunta',  num: 5, nombre: 'Pregunta tras pregunta',      energia: 'Rápido → eliminación → permiso',           ingredientes: 'D#53 + D#54 + F#79' },
  { id: 'analogia_revelacion',     num: 6, nombre: 'Analogía principio a fin',    energia: 'Familiar → desarrollo → conexión',         ingredientes: 'F#76 + D#54 + F#82' },
  { id: 'futuro_sensorial',        num: 7, nombre: 'Futuro sensorial',            energia: 'Aspiración → deseo → mecanismo breve',     ingredientes: 'H#101 + H#99 + F#79' },
  { id: 'provocacion_evidencia',   num: 8, nombre: 'Provocación + evidencia',     energia: 'Shock → curiosidad → convicción',          ingredientes: 'D#48 + G#88 + E#69' },
];

const RITMOS = [
  { id: 'R1', nombre: 'Directo sin adornos',   cadencia: 'Rápido, lineal',                duracion: '65-70s' },
  { id: 'R2', nombre: 'Acertijo lógico',        cadencia: 'Lento→rápido, razonamiento',   duracion: '80-90s' },
  { id: 'R3', nombre: 'Exclusividad',           cadencia: 'Confidencial, pausas largas',   duracion: '70-80s' },
  { id: 'R4', nombre: 'Recorrido inverso',      cadencia: 'Resultado→proceso→origen',      duracion: '70-75s' },
  { id: 'R5', nombre: 'Ráfaga de preguntas',    cadencia: 'Explosivo→silencio→calma',      duracion: '60-70s' },
  { id: 'R6', nombre: 'Monólogo interno',       cadencia: 'Stream of consciousness',       duracion: '65-75s' },
  { id: 'R7', nombre: 'Ancla precio invertida',  cadencia: 'Matemática emocional, escalada',duracion: '70-80s' },
];

const VENTAS = [
  { id: 'cementerio_modelos',     num: 1,  nombre: 'Cementerio de modelos',     cluster: 'C3, C4' },
  { id: 'transparencia_total',    num: 2,  nombre: 'Transparencia total',       cluster: 'C2' },
  { id: 'ventana_oportunidad_ia', num: 3,  nombre: 'Ventana de oportunidad',    cluster: 'Todos' },
  { id: 'contraste_fisico',       num: 4,  nombre: 'Contraste con físico',      cluster: 'C1, C5' },
  { id: 'eliminacion_barreras',   num: 5,  nombre: 'Eliminación de barreras',   cluster: 'C1, C5' },
  { id: 'matematica_simple',      num: 6,  nombre: 'Matemática simple',         cluster: 'C2' },
  { id: 'lean_anti_riesgo',       num: 7,  nombre: 'Lean / Anti-riesgo',        cluster: 'C3, C4' },
  { id: 'tiempo_vs_dinero',       num: 8,  nombre: 'Tiempo vs. dinero',         cluster: 'C1' },
  { id: 'democratizacion_ia',     num: 9,  nombre: 'Democratización por IA',    cluster: 'C1, C5' },
  { id: 'prueba_diversidad',      num: 10, nombre: 'Prueba por diversidad',     cluster: 'Todos' },
];

const CLUSTERS = [
  { id: 'C1', nombre: 'La Reinventada',        pct: 35.1, avatar: 'Mujer 45+, docente/independiente, $941/mes' },
  { id: 'C2', nombre: 'El Escalador',           pct: 16.2, avatar: 'Hombre 25-40, tech-savvy, $1,052/mes' },
  { id: 'C3', nombre: 'El Profesional Estancado',pct: 12.8, avatar: '49 años, psicólogos/nutricionistas/coaches, $1,041/mes' },
  { id: 'C4', nombre: 'El Offline',             pct: 29.2, avatar: 'Emprendedor tradicional, $1,069/mes' },
  { id: 'C5', nombre: 'El Último Tren',         pct: 29.0, avatar: '55+, 60% mujer, $959/mes' },
];

const TENSIONES = [
  { id: 'T1',  nombre: 'Sacrificio vs. vivir',        clusters: ['C2'],          arco_ideal: 7 },
  { id: 'T2',  nombre: 'Esfuerzo sin dirección',      clusters: ['C2','C4'],     arco_ideal: 2 },
  { id: 'T3',  nombre: 'Comparación con otros',       clusters: ['C2'],          arco_ideal: 8 },
  { id: 'T4',  nombre: 'Urgencia de edad',            clusters: ['C2','C5'],     arco_ideal: 3 },
  { id: 'T5',  nombre: 'Autoexigencia paralizante',   clusters: ['C2'],          arco_ideal: 5 },
  { id: 'T6',  nombre: 'Querer comprar vs. no poder', clusters: ['C5','C1'],     arco_ideal: 6 },
  { id: 'T7',  nombre: 'Familia vs. ambición',        clusters: ['C1'],          arco_ideal: 4 },
  { id: 'T8',  nombre: 'Desconfianza vs. esperanza',  clusters: ['C5'],          arco_ideal: 3 },
  { id: 'T9',  nombre: 'Saber mucho vs. hacer poco',  clusters: ['C3','C4'],     arco_ideal: 8 },
  { id: 'T10', nombre: 'Dignidad vs. necesidad',      clusters: ['C5'],          arco_ideal: 2 },
  { id: 'T11', nombre: 'Geografía limitante',         clusters: ['C1','C2','C3','C4','C5'], arco_ideal: 1 },
  { id: 'T12', nombre: 'Información sin estructura',  clusters: ['C3','C1'],     arco_ideal: 5 },
  { id: 'T13', nombre: 'Hartazgo acumulado',          clusters: ['C1','C2','C3','C4','C5'], arco_ideal: 2 },
];

const PALANCAS = [
  { id: 'brecha_curiosidad',    num: 1, nombre: 'Brecha de curiosidad',   formulas: ['F1','F4','F8','F10','F11','F14','F16'] },
  { id: 'disonancia_cognitiva', num: 2, nombre: 'Disonancia cognitiva',   formulas: ['F5','F7','F9','F17','F19','F20'] },
  { id: 'efecto_cotilla',       num: 3, nombre: 'Efecto cotilla',         formulas: ['F21'] },
  { id: 'filtro_comprador',     num: 4, nombre: 'Filtro de comprador',    formulas: ['F1','F2','F3'] },
];

const FORMULAS = [
  { id: 'F1',  nombre: 'Auto-selección + memoria',   palancas: [4,1], filtro: 'hipernicho',    estado: '★', uso: '●' },
  { id: 'F2',  nombre: 'Eliminación de barreras',     palancas: [4,1], filtro: 'amplio-filtrado',estado: '★', uso: '●' },
  { id: 'F3',  nombre: 'Promesa directa',             palancas: [],    filtro: 'sin filtro',     estado: '★', uso: 'evitar' },
  { id: 'F4',  nombre: 'Pregunta espejo',             palancas: [1,4], filtro: 'hipernicho',     estado: '✧', uso: '○' },
  { id: 'F5',  nombre: 'Incredulidad posesiva',       palancas: [2,1], filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F6',  nombre: 'Hipotético personal',         palancas: [1,4], filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F7',  nombre: 'Flip contraintuitivo',        palancas: [2],   filtro: 'amplio-filtrado',estado: '✧', uso: '●' },
  { id: 'F8',  nombre: 'Nadie explica',               palancas: [1],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F9',  nombre: 'Ataque herramienta',          palancas: [2],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F10', nombre: 'Ancla precio invertida',      palancas: [1],   filtro: 'sin filtro',     estado: '✧', uso: '○' },
  { id: 'F11', nombre: 'Historia dolor sensorial',    palancas: [1,4], filtro: 'hipernicho',     estado: '✧', uso: '○' },
  { id: 'F12', nombre: 'Voz de tercero',              palancas: [1],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F13', nombre: 'Timeline proyección',         palancas: [1,4], filtro: 'hipernicho',     estado: '✧', uso: '○' },
  { id: 'F14', nombre: 'Nombrar innombrado',          palancas: [1],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F15', nombre: 'Provocación + dato',          palancas: [2],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F16', nombre: 'Inmersión 2da persona',       palancas: [1,4], filtro: 'hipernicho',     estado: '✧', uso: '○' },
  { id: 'F17', nombre: 'Anti-hype',                   palancas: [1],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F18', nombre: 'Desculpabilización',          palancas: [1,4], filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F19', nombre: 'Anti-consejo',                palancas: [2],   filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F20', nombre: 'Pregunta-trampa dual',        palancas: [2,1], filtro: 'amplio-filtrado',estado: '✧', uso: '○' },
  { id: 'F21', nombre: 'Cotilla cultural',            palancas: [3],   filtro: 'hipernicho',     estado: '✧', uso: '○' },
];

// Top ingredientes agrupados por categoría — para selección diversa
const INGREDIENTES_POR_CAT = {
  B: ['B#23','B#24','B#25','B#26','B#27','B#28','B#29','B#30','B#31','B#32','B#33','B#34','B#35','B#36','B#37'],
  C: ['C#38','C#39','C#40','C#41','C#42','C#43','C#44','C#45','C#46','C#47'],
  D: ['D#48','D#49','D#50','D#51','D#52','D#53','D#54','D#55','D#56','D#57','D#58','D#59'],
  E: ['E#60','E#61','E#62','E#63','E#64','E#65','E#66','E#67','E#68','E#69','E#70'],
  F: ['F#71','F#72','F#73','F#74','F#75','F#76','F#77','F#78','F#79','F#80','F#81','F#82','F#83','F#84'],
  G: ['G#85','G#86','G#87','G#88','G#89','G#90','G#91','G#92','G#93','G#94'],
  H: ['H#95','H#96','H#97','H#98','H#99','H#100','H#101','H#102','H#103','H#104','H#105','H#106','H#107','H#108'],
  L: ['L#128','L#129','L#130','L#131','L#132'],
};

// Ingredientes gastados — max 3 por batch de 10
const GASTADOS = ['F#73','F#74','G#90','B#29'];

// Nichos validados por compradores
const NICHOS_TIER1 = [
  'educación / enseñanza / capacitación',
  'salud / nutrición / fitness',
  'marketing / ventas / comercio',
  'diseño / arte / creatividad',
  'organización / administración / productividad',
  'terapia / psicología / bienestar',
  'cocina / gastronomía / repostería',
  'comunicación / escritura / redacci��n',
  'coaching / mentoría / desarrollo personal',
];

const NICHOS_TIER2 = [
  'oficios / plomería / electricidad / carpintería',
  'música / instrumento / canto',
  'jardinería / huerta / botánica',
  'fotografía / video / producción audiovisual',
  'costura / tejido / manualidades textiles',
  'idiomas / traducción',
  'contabilidad / finanzas personales',
  'veterinaria / cuidado animal',
  'belleza / estética / maquillaje / uñas',
  'astrología / tarot / prácticas espirituales',
  'enfermería / cuidados domiciliarios',
  'arquitectura / decoración / interiorismo',
];

// ─── VETADOS (feedback explícito del usuario) ─────────────────────
// El scheduler NUNCA propone estos. Leen MEMORY.md del usuario.
const VETADOS = {
  arcos: ['historia_personal'],               // feedback_no_historia_jesus.md
  tensiones: ['T6'],                           // feedback_no_target_sin_plata.md
  nichos: ['educación / enseñanza / capacitación'], // feedback_rotar_nichos_saturados.md
  formulas: ['F3'],                            // ya marcada "evitar" en arsenal
};

// ─── TEMPERATURA ──────────────────────────────────────────────────
// Controla qué tan determinístico es el scheduler.
// 0 = greedy puro (siempre el mejor). Mayor = más variación entre corridas.
const TEMPERATURE = 0.8;
// Cuántos top-N candidatos entran al sorteo ponderado.
const TOP_K = 4;


// ─── RESERVAS ENTRE CORRIDAS ──────────────────────────────────────
// Cuando corren 3 terminales a la vez, cada una deja un archivo de "reserva"
// con lo que eligió. Las otras terminales lo leen y lo evitan.
// Las reservas viejas (>30 min) se ignoran y limpian automáticamente.

function loadActiveReserves() {
  if (!existsSync(RESERVES_DIR)) return [];

  const now = Date.now();
  const reserves = [];
  const files = readdirSync(RESERVES_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const fullPath = join(RESERVES_DIR, file);
    try {
      const data = JSON.parse(readFileSync(fullPath, 'utf-8'));
      const age = now - (data.timestamp || 0);

      if (age > RESERVE_TTL_MS) {
        // Reserva vencida — limpiarla
        try { unlinkSync(fullPath); } catch {}
        continue;
      }

      reserves.push(data);
    } catch {
      // Archivo corrupto — borrarlo
      try { unlinkSync(fullPath); } catch {}
    }
  }

  return reserves;
}

function aggregateReserves(reserves) {
  const taken = {
    vehiculos: new Set(),
    arcos: new Set(),
    ritmos: new Set(),
    clusters: new Set(),
    tensiones: new Set(),
    nichos: new Set(),
  };

  for (const r of reserves) {
    for (const key of Object.keys(taken)) {
      (r[key] || []).forEach(v => taken[key].add(v));
    }
  }

  return taken;
}

function writeReserve(constraints) {
  if (!existsSync(RESERVES_DIR)) {
    mkdirSync(RESERVES_DIR, { recursive: true });
  }

  const id = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const data = {
    id,
    timestamp: Date.now(),
    pid: process.pid,
    vehiculos: constraints.map(c => c.vehiculo.id),
    arcos: constraints.map(c => c.arco.id),
    ritmos: constraints.map(c => c.ritmo.id),
    clusters: constraints.map(c => c.cluster.id),
    tensiones: constraints.map(c => c.tension.id),
    nichos: constraints.map(c => c.niche),
  };

  writeFileSync(join(RESERVES_DIR, `${id}.json`), JSON.stringify(data, null, 2));
  return id;
}


// ─── LEER GENERACIONES ────────────────────────────────────────────

function loadGenerations() {
  if (!existsSync(GEN_DIR)) return [];

  const files = readdirSync(GEN_DIR).filter(f => f.endsWith('.json') && !f.includes('backup'));
  const gens = [];

  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(join(GEN_DIR, file), 'utf-8'));
      if (!raw.script) continue; // skip longform/non-script

      const s = raw.script;
      gens.push({
        id: raw.id,
        createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(0),
        status: raw.status || 'draft',
        vehiculo: s.body_type || null,
        arco: s.emotional_arc || null,
        ritmo: s.rhythm_template || null,
        venta: s.model_sale_type || null,
        cluster: s.segment || null,
        niche: s.niche || null,
        angle_family: s.angle_family || null,
        ingredientes: normalizeIngredients(s.ingredients_used),
      });
    } catch (e) {
      // skip corrupt files
    }
  }

  // Sort by date, newest first
  gens.sort((a, b) => b.createdAt - a.createdAt);
  return gens;
}

function normalizeIngredients(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(ing => {
    if (typeof ing === 'string') return ing;
    if (ing.category && ing.ingredient_number) return `${ing.category}#${ing.ingredient_number}`;
    return null;
  }).filter(Boolean);
}


// ─── SCORING ENGINE ───────────────────────────────────────────────
// Score = cuanto MÁS bajo, MEJOR candidato (menos usado, más tiempo sin usar)

function buildUsageMap(gens, field) {
  const usage = {};
  gens.forEach((g, idx) => {
    const val = g[field];
    if (!val) return;
    if (!usage[val]) usage[val] = { count: 0, lastIndex: Infinity };
    usage[val].count++;
    usage[val].lastIndex = Math.min(usage[val].lastIndex, idx); // idx 0 = más reciente
  });
  return usage;
}

function buildIngredientUsage(gens) {
  const usage = {};
  gens.forEach((g, idx) => {
    for (const ing of g.ingredientes) {
      if (!usage[ing]) usage[ing] = { count: 0, lastIndex: Infinity };
      usage[ing].count++;
      usage[ing].lastIndex = Math.min(usage[ing].lastIndex, idx);
    }
  });
  return usage;
}

/**
 * Score una opción: 0 = nunca usada (ideal), más alto = más quemada
 *
 * Fórmula: count * 10 + recencyPenalty
 * - count pesa más (evitar sobre-uso absoluto)
 * - recency penaliza uso reciente (idx 0 = recién usado = máxima penalidad)
 */
function scoreOption(id, usageMap, totalGens) {
  const u = usageMap[id];
  if (!u) return 0; // nunca usado — score perfecto

  const recencyPenalty = Math.max(0, 5 - u.lastIndex); // 5 si fue el último, 0 si hace 5+
  return u.count * 10 + recencyPenalty;
}

function pickBest(options, usageMap, totalGens, excluded = new Set(), vetoSet = null) {
  // 1) Scorear todo lo elegible (no excluido ni vetado)
  const scored = [];
  for (const opt of options) {
    const id = typeof opt === 'string' ? opt : opt.id;
    if (excluded.has(id)) continue;
    if (vetoSet && vetoSet.has(id)) continue;
    scored.push({ opt, score: scoreOption(id, usageMap, totalGens) });
  }

  if (scored.length === 0) return null;

  // 2) Ordenar ascendente (menor score = mejor) y tomar top-K
  scored.sort((a, b) => a.score - b.score);
  const topK = scored.slice(0, Math.min(TOP_K, scored.length));

  // 3) Softmax con temperatura sobre los top-K
  // Peso = exp(-score / temperature). Mayor temperatura = distribución más plana.
  if (TEMPERATURE <= 0 || topK.length === 1) {
    return topK[0].opt;
  }

  const weights = topK.map(x => Math.exp(-x.score / (TEMPERATURE * 10)));
  const total = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (let i = 0; i < topK.length; i++) {
    acc += weights[i];
    if (r <= acc) return topK[i].opt;
  }
  return topK[topK.length - 1].opt;
}


// ─── INGREDIENT SELECTION ─────────────────────────────────────────

function pickIngredients(arco, ingUsage, totalGens, existingPicks = []) {
  const picked = [];
  const usedIds = new Set(existingPicks);

  // El arco sugiere ingredientes típicos — intentar incluir al menos 1
  const arcoObj = ARCOS.find(a => a.id === arco);
  const arcoIngredients = arcoObj ? arcoObj.ingredientes.match(/[A-Z]#\d+/g) || [] : [];

  // Categorías obligatorias para un guion de 60-90s: B, C/D, F, G, L
  const requiredCats = ['B', 'D', 'F', 'G', 'L'];

  for (const cat of requiredCats) {
    const candidates = INGREDIENTES_POR_CAT[cat] || [];

    // Priorizar: (1) arco-suggested, (2) least-used, (3) not-gastado
    let best = null;
    let bestScore = Infinity;

    for (const ing of candidates) {
      if (usedIds.has(ing)) continue;
      if (GASTADOS.includes(ing) && picked.filter(p => GASTADOS.includes(p)).length >= 2) continue;

      let score = scoreOption(ing, ingUsage, totalGens);

      // Bonus si es sugerido por el arco
      if (arcoIngredients.includes(ing)) score -= 3;

      if (score < bestScore) {
        bestScore = score;
        best = ing;
      }
    }

    if (best) {
      picked.push(best);
      usedIds.add(best);
    }
  }

  // Agregar 1-2 opcionales de C o H (agitación u oferta)
  for (const cat of ['C', 'H']) {
    const candidates = INGREDIENTES_POR_CAT[cat] || [];
    const best = candidates
      .filter(c => !usedIds.has(c))
      .sort((a, b) => scoreOption(a, ingUsage, totalGens) - scoreOption(b, ingUsage, totalGens))[0];
    if (best) {
      picked.push(best);
      usedIds.add(best);
    }
  }

  return picked;
}


// ─── NICHE SELECTION ──────────────────────────────────────────────

function pickNiche(gens, excluded = new Set()) {
  const nicheUsage = {};
  for (const g of gens) {
    if (!g.niche) continue;
    const normalized = g.niche.toLowerCase().trim();
    nicheUsage[normalized] = (nicheUsage[normalized] || 0) + 1;
  }

  const vetoSet = new Set(VETADOS.nichos);
  const allNiches = [...NICHOS_TIER1, ...NICHOS_TIER2].filter(n => !vetoSet.has(n));

  // Scorear todos los nichos elegibles
  const scored = [];
  for (const n of allNiches) {
    if (excluded.has(n)) continue;
    const normalized = n.toLowerCase().trim();
    const count = nicheUsage[normalized] || 0;
    const tier = NICHOS_TIER1.includes(n) ? 0 : 2;
    scored.push({ n, score: count * 10 + tier });
  }

  if (scored.length === 0) return NICHOS_TIER1.filter(n => !vetoSet.has(n))[0];

  // Top-K + temperatura (igual que pickBest)
  scored.sort((a, b) => a.score - b.score);
  const topK = scored.slice(0, Math.min(TOP_K, scored.length));

  if (TEMPERATURE <= 0 || topK.length === 1) return topK[0].n;

  const weights = topK.map(x => Math.exp(-x.score / (TEMPERATURE * 10)));
  const total = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (let i = 0; i < topK.length; i++) {
    acc += weights[i];
    if (r <= acc) return topK[i].n;
  }
  return topK[topK.length - 1].n;
}


// ─── TENSION SELECTION (compatible con cluster) ───────────────────

function pickTension(cluster, tensionUsage, totalGens, excluded = new Set()) {
  const vetoSet = new Set(VETADOS.tensiones);
  const compatible = TENSIONES.filter(t => t.clusters.includes(cluster) && !vetoSet.has(t.id));

  if (compatible.length === 0) {
    // Fallback: universales no vetadas
    return TENSIONES.find(t => !vetoSet.has(t.id) && (t.id === 'T13' || t.id === 'T11'));
  }

  return pickBest(compatible, tensionUsage, totalGens, excluded, vetoSet);
}


// ─── FORMULA SELECTION (compatible con palanca) ───────────────────

function pickFormula(palanca, formulaUsage, totalGens, excluded = new Set()) {
  const palancaObj = PALANCAS.find(p => p.id === palanca);
  if (!palancaObj) return FORMULAS[0];

  const vetoSet = new Set(VETADOS.formulas);
  const compatibleIds = new Set(palancaObj.formulas);
  const compatible = FORMULAS.filter(f => compatibleIds.has(f.id) && !vetoSet.has(f.id));

  return pickBest(compatible, formulaUsage, totalGens, excluded, vetoSet) || compatible[0];
}


// ─── CONSTRAINT GENERATOR ─────────────────────────────────────────

function generateConstraints(gens, count = 1) {
  const totalGens = gens.length;

  // Build usage maps
  const vehUsage = buildUsageMap(gens, 'vehiculo');
  const arcoUsage = buildUsageMap(gens, 'arco');
  const ritmoUsage = buildUsageMap(gens, 'ritmo');
  const ventaUsage = buildUsageMap(gens, 'venta');
  const clusterUsage = buildUsageMap(gens, 'cluster');
  const ingUsage = buildIngredientUsage(gens);

  // Para fórmulas y palancas no tenemos tracking directo — usar count 0
  const formulaUsage = {};
  const palancaUsage = {};
  const tensionUsage = {};

  // Reservas activas de otras terminales corriendo en paralelo.
  // Las tratamos igual que "ya usado en este batch" — el scheduler las evita.
  const activeReserves = loadActiveReserves();
  const taken = aggregateReserves(activeReserves);

  const results = [];
  const usedVehiculos = new Set(taken.vehiculos);
  const usedArcos = new Set(taken.arcos);
  const usedRitmos = new Set(taken.ritmos);
  const usedVentas = new Set();
  const usedClusters = new Set(taken.clusters);
  const usedNiches = new Set(taken.nichos);
  const usedTensiones = new Set(taken.tensiones);
  const usedPalancas = new Set();
  const usedIngredients = new Set();

  for (let i = 0; i < count; i++) {
    // 1. Vehículo — el menos usado, no repetir en batch
    const vehiculo = pickBest(VEHICULOS, vehUsage, totalGens, usedVehiculos);
    usedVehiculos.add(vehiculo.id);

    // 2. Arco — el menos usado, no repetir en batch (respeta vetados)
    const arcoVeto = new Set(VETADOS.arcos);
    const arco = pickBest(ARCOS, arcoUsage, totalGens, usedArcos, arcoVeto);
    usedArcos.add(arco.id);

    // 3. Ritmo — el menos usado, no repetir en batch
    const ritmo = pickBest(RITMOS, ritmoUsage, totalGens, usedRitmos);
    usedRitmos.add(ritmo.id);

    // 4. Venta — la menos usada, no repetir en batch
    const venta = pickBest(VENTAS, ventaUsage, totalGens, usedVentas);
    usedVentas.add(venta.id);

    // 5. Cluster �� distribuir por peso real (pct), pero priorizar sub-usados
    const cluster = pickBest(CLUSTERS, clusterUsage, totalGens, usedClusters);
    usedClusters.add(cluster.id);

    // 6. Tensión — compatible con cluster, no repetir
    const tension = pickTension(cluster.id, tensionUsage, totalGens, usedTensiones);
    usedTensiones.add(tension.id);

    // 7. Palanca — la menos usada, no repetir en batch
    const palanca = pickBest(PALANCAS, palancaUsage, totalGens, usedPalancas);
    usedPalancas.add(palanca.id);

    // 8. Fórmula — compatible con palanca
    const formula = pickFormula(palanca.id, formulaUsage, totalGens);

    // 9. Ingredientes — basados en arco + diversidad
    const ingredientes = pickIngredients(arco.id, ingUsage, totalGens, [...usedIngredients]);
    ingredientes.forEach(ing => usedIngredients.add(ing));

    // 10. Nicho
    const niche = pickNiche(gens, usedNiches);
    usedNiches.add(niche);

    results.push({
      index: i + 1,
      vehiculo: { id: vehiculo.id, num: vehiculo.num, nombre: vehiculo.nombre, tono: vehiculo.tono },
      arco: { id: arco.id, num: arco.num, nombre: arco.nombre, energia: arco.energia },
      ritmo: { id: ritmo.id, nombre: ritmo.nombre, cadencia: ritmo.cadencia, duracion: ritmo.duracion },
      venta_modelo: { id: venta.id, num: venta.num, nombre: venta.nombre },
      cluster: { id: cluster.id, nombre: cluster.nombre, avatar: cluster.avatar },
      tension: { id: tension.id, nombre: tension.nombre },
      palanca_hook: { id: palanca.id, nombre: palanca.nombre },
      formula_hook: { id: formula.id, nombre: formula.nombre },
      ingredientes,
      niche,
    });
  }

  return results;
}


// ─── OUTPUT ───────────────────────────────────────────────────────

function formatConstraint(c) {
  const lines = [
    `## Guion #${c.index}`,
    '',
    `| Dimensión | Asignado | Detalle |`,
    `|-----------|----------|---------|`,
    `| Vehículo | #${c.vehiculo.num} ${c.vehiculo.nombre} | ${c.vehiculo.tono} |`,
    `| Arco | #${c.arco.num} ${c.arco.nombre} | ${c.arco.energia} |`,
    `| Ritmo | ${c.ritmo.id} ${c.ritmo.nombre} | ${c.ritmo.cadencia} (${c.ritmo.duracion}) |`,
    `| Venta modelo | #${c.venta_modelo.num} ${c.venta_modelo.nombre} | — |`,
    `| Cluster | ${c.cluster.id} ${c.cluster.nombre} | ${c.cluster.avatar} |`,
    `| Tensión | ${c.tension.id} ${c.tension.nombre} | — |`,
    `| Palanca hook | ${c.palanca_hook.nombre} | — |`,
    `| Fórmula hook | ${c.formula_hook.id} ${c.formula_hook.nombre} | — |`,
    `| Nicho | ${c.niche} | — |`,
    '',
    `**Ingredientes:** ${c.ingredientes.join(', ')}`,
    '',
  ];
  return lines.join('\n');
}

function formatCoverageReport(gens) {
  const totalGens = gens.length;
  const lines = ['## Cobertura actual', ''];

  // Vehiculos
  const vehUsage = buildUsageMap(gens, 'vehiculo');
  lines.push('**Vehículos:**');
  for (const v of VEHICULOS) {
    const u = vehUsage[v.id];
    const count = u ? u.count : 0;
    const bar = '█'.repeat(count) + '░'.repeat(Math.max(0, 5 - count));
    lines.push(`  ${bar} #${v.num} ${v.nombre}: ${count}`);
  }

  // Arcos
  lines.push('');
  lines.push('**Arcos:**');
  const arcoUsage = buildUsageMap(gens, 'arco');
  for (const a of ARCOS) {
    const u = arcoUsage[a.id];
    const count = u ? u.count : 0;
    const bar = '█'.repeat(count) + '░'.repeat(Math.max(0, 5 - count));
    lines.push(`  ${bar} #${a.num} ${a.nombre}: ${count}`);
  }

  // Clusters
  lines.push('');
  lines.push('**Clusters:**');
  const clusterUsage = buildUsageMap(gens, 'cluster');
  // Map segment letters to cluster IDs
  const segmentMap = { A: 'C1', B: 'C2', C: 'C3', D: 'C4', E: 'C5' };
  for (const c of CLUSTERS) {
    // Check both old segment format and new cluster format
    const oldKey = Object.entries(segmentMap).find(([, v]) => v === c.id)?.[0];
    const countNew = clusterUsage[c.id]?.count || 0;
    const countOld = oldKey ? (clusterUsage[oldKey]?.count || 0) : 0;
    const count = countNew + countOld;
    const bar = '█'.repeat(count) + '░'.repeat(Math.max(0, 5 - count));
    lines.push(`  ${bar} ${c.id} ${c.nombre}: ${count}`);
  }

  // Top 10 ingredientes más usados
  lines.push('');
  lines.push('**Top 10 ingredientes (quemados):**');
  const ingUsage = buildIngredientUsage(gens);
  const topIng = Object.entries(ingUsage).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
  for (const [ing, u] of topIng) {
    lines.push(`  ${ing}: ${u.count} usos`);
  }

  // Ingredientes nunca usados (por categoría)
  lines.push('');
  lines.push('**Ingredientes nunca usados (oportunidad):**');
  for (const [cat, ings] of Object.entries(INGREDIENTES_POR_CAT)) {
    const unused = ings.filter(i => !ingUsage[i]);
    if (unused.length > 0) {
      lines.push(`  ${cat}: ${unused.join(', ')}`);
    }
  }

  lines.push('');
  lines.push(`**Total generaciones analizadas:** ${totalGens}`);

  return lines.join('\n');
}


// ─── MAIN ─────────────────────────────────────────���───────────────

const args = process.argv.slice(2);
const countIdx = args.indexOf('--count');
const count = countIdx >= 0 ? parseInt(args[countIdx + 1]) || 1 : 1;
const jsonMode = args.includes('--json');

const gens = loadGenerations();
const activeReservesBefore = loadActiveReserves();
const constraints = generateConstraints(gens, count);

// Escribir reserva para que otras terminales sepan qué eligió esta corrida
const reserveId = writeReserve(constraints);

if (jsonMode) {
  console.log(JSON.stringify({ reserveId, constraints }, null, 2));
} else {
  console.log('# Scheduler ADP — Constraints para próxim' + (count > 1 ? `os ${count} guiones` : 'o guion'));
  console.log('');
  console.log(`_Temperatura: ${TEMPERATURE} · Top-K: ${TOP_K}_`);
  console.log(`_Vetados — Arcos: ${VETADOS.arcos.join(', ') || '—'} · Tensiones: ${VETADOS.tensiones.join(', ') || '—'} · Nichos: ${VETADOS.nichos.join(', ') || '—'}_`);

  if (activeReservesBefore.length > 0) {
    const takenBefore = aggregateReserves(activeReservesBefore);
    console.log(`_Otras terminales activas: ${activeReservesBefore.length} (evitando ${takenBefore.vehiculos.size} vehículos, ${takenBefore.arcos.size} arcos, ${takenBefore.clusters.size} clusters ya tomados)_`);
  }
  console.log(`_Reserva creada: ${reserveId}_`);
  console.log('');
  console.log(formatCoverageReport(gens));
  console.log('');
  console.log('---');
  console.log('');
  for (const c of constraints) {
    console.log(formatConstraint(c));
  }
}
