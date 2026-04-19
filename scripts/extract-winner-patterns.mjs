#!/usr/bin/env node
/**
 * #1 - Winner Patterns Extraction
 *
 * Lee DOS fuentes y genera un destilado accionable en winner-patterns.md:
 *
 *   1. Generations con status "winner" / "recorded" (JSONs del sistema)
 *      → counts de ángulos, body types, hooks, segmentos, ingredientes
 *
 *   2. Archivos analisis-winner-*.md en .data/ (análisis profundos manuales)
 *      → DNA real: CPL, big idea, analogía, hallazgos accionables
 *
 * La fuente #2 es PRIORITARIA cuando existe: esos archivos tienen la
 * señal real de qué hizo funcionar cada ad. Los counts de #1 son
 * complemento estadístico.
 *
 * Usage:  node scripts/extract-winner-patterns.mjs
 * Output: .data/winner-patterns.md
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, ".data");
const GENS_DIR = join(DATA_DIR, "generations");
const OUTPUT_PATH = join(DATA_DIR, "winner-patterns.md");

// ═══════════════════════════════════════════════════════════════
// FUENTE 1: Análisis profundos (.data/analisis-winner-*.md)
// ═══════════════════════════════════════════════════════════════

function parseAnalisisFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const basename = filePath.split("/").pop();

  // Título: primera línea que empieza con "# "
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : basename;

  // CPL real (múltiples formatos posibles)
  const cplMatch =
    content.match(/\*\*Costo por lead\*\*\s*\|\s*\*?\*?\$([0-9.]+)/i) ||
    content.match(/\*\*Costo por resultado\*\*\s*\|\s*\*?\*?\$([0-9.]+)/i) ||
    content.match(/\*\*CPL\*\*\s*\|\s*\*?\*?\$([0-9.]+)/i) ||
    content.match(/\|\s*CPL\s*\|\s*\*?\*?\$([0-9.]+)/i);
  const cpl = cplMatch ? `$${cplMatch[1]}` : null;

  // Resultados / leads
  const leadsMatch =
    content.match(/\*\*Resultados\*\*\s*\|\s*([0-9,]+)/i) ||
    content.match(/\*\*Leads\*\*\s*\|\s*([0-9,]+)/i) ||
    content.match(/\| Registros \|\s*([0-9,]+)/i);
  const leads = leadsMatch ? leadsMatch[1].replace(/,/g, "") : null;

  // Nicho
  const nichoMatch =
    content.match(/\*\*Nicho:\*\*\s*(.+)/i) ||
    content.match(/- \*\*Nicho:\*\*\s*(.+)/i);
  const nicho = nichoMatch ? nichoMatch[1].trim() : null;

  // Ángulo / familia
  const angleMatch = content.match(/\*\*[ÁA]ngulo:\*\*\s*(.+)/i);
  const angle = angleMatch ? angleMatch[1].trim() : null;

  // Body / cuerpo
  const bodyMatch = content.match(/\*\*(?:Cuerpo|Body):\*\*\s*(.+)/i);
  const body = bodyMatch ? bodyMatch[1].trim() : null;

  // Segmento
  const segMatch = content.match(/\*\*Segmento:\*\*\s*(.+)/i);
  const segment = segMatch ? segMatch[1].trim() : null;

  // Hook type
  const hookMatch = content.match(/\*\*Hook type:\*\*\s*(.+)/i);
  const hookType = hookMatch ? hookMatch[1].trim() : null;

  // Duración
  const durMatch = content.match(/\*\*Duración video\*\*\s*\|\s*([0-9.]+)\s*segundos/i);
  const duration = durMatch ? `${durMatch[1]}s` : null;

  // Hallazgos: parsing por líneas (más robusto que regex con lookaheads)
  // Buscar primera sección H2 cuyo título indique hallazgos/resumen ejecutivo,
  // y dentro extraer los primeros 3 subtítulos H3 con su primer párrafo de cuerpo.
  let findings = [];
  const lines = content.split("\n");
  const headingRegex = /^##\s+(.+)$/;
  const isFindingsHeading = (s) => /TOP\s*\d*\s*HALLAZGOS|RESUMEN EJECUTIVO|\d+ hallazgos/i.test(s);

  let inSection = false;
  let currentFinding = null;
  let bodyAccum = [];

  for (const line of lines) {
    const h2 = line.match(headingRegex);
    if (h2) {
      if (inSection) {
        // salimos de la sección al toparnos con otro H2
        if (currentFinding && bodyAccum.length > 0) {
          currentFinding.body = bodyAccum.join(" ").replace(/\s+/g, " ").replace(/\*\*/g, "").trim().substring(0, 220);
          findings.push(currentFinding);
        }
        break;
      }
      if (isFindingsHeading(h2[1])) inSection = true;
      continue;
    }
    if (!inSection) continue;

    const h3 = line.match(/^###\s+(?:[0-9]+\.\s*)?(?:🏆\s*)?(.+)$/);
    if (h3) {
      // cerrar finding anterior
      if (currentFinding && bodyAccum.length > 0) {
        currentFinding.body = bodyAccum.join(" ").replace(/\s+/g, " ").replace(/\*\*/g, "").trim().substring(0, 220);
        findings.push(currentFinding);
        if (findings.length >= 3) {
          currentFinding = null;
          break;
        }
      }
      const heading = h3[1].trim().replace(/\s*—.*$/, "").replace(/\s*\([^)]*\)\s*$/, "");
      currentFinding = { heading, body: "" };
      bodyAccum = [];
      continue;
    }

    // acumular cuerpo (hasta que encuentre línea vacía y ya tenga algo)
    if (currentFinding) {
      const trimmed = line.trim();
      if (trimmed === "" && bodyAccum.length > 0) continue;
      if (trimmed.startsWith("---")) continue;
      if (trimmed === "") continue;
      bodyAccum.push(trimmed);
      // freno tras acumular ~2 líneas de cuerpo útiles
      if (bodyAccum.join(" ").length > 220) {
        currentFinding.body = bodyAccum.join(" ").replace(/\s+/g, " ").replace(/\*\*/g, "").trim().substring(0, 220);
        findings.push(currentFinding);
        if (findings.length >= 3) break;
        currentFinding = null;
        bodyAccum = [];
      }
    }
  }
  if (currentFinding && bodyAccum.length > 0 && findings.length < 3) {
    currentFinding.body = bodyAccum.join(" ").replace(/\s+/g, " ").replace(/\*\*/g, "").trim().substring(0, 220);
    findings.push(currentFinding);
  }

  // Transferencia: extraer primer principio accionable
  const transferenciaMatch = content.match(/##+\s*TRANSFERENCIA[^\n]*\n([\s\S]*?)(?=\n##\s|\Z)/i);
  let transferencias = [];
  if (transferenciaMatch) {
    const principios = transferenciaMatch[1].matchAll(/\*\*PRINCIPIO\*\*\s*\|\s*([^\n|]+)/gi);
    for (const m of principios) {
      transferencias.push(m[1].trim().substring(0, 150));
      if (transferencias.length >= 3) break;
    }
  }

  // Meta-patrón (estructura narrativa en 1 línea)
  const metaMatch = content.match(/\*\*Meta-patrón[^:]*:\*\*\s*\n*\*\*([^\n*]+)\*\*/i) ||
                    content.match(/### Meta-patrón\s*\n\s*\*\*([^\n*]+)\*\*/i);
  const metaPattern = metaMatch ? metaMatch[1].trim() : null;

  return {
    file: basename,
    title,
    cpl,
    leads,
    duration,
    nicho,
    angle,
    body,
    segment,
    hookType,
    findings,
    transferencias,
    metaPattern,
  };
}

function readAnalisisFiles() {
  const files = readdirSync(DATA_DIR)
    .filter(f => f.startsWith("analisis-winner-") && f.endsWith(".md"))
    .map(f => join(DATA_DIR, f));

  return files.map(parseAnalisisFile);
}

function readCruceReporte() {
  const path = join(DATA_DIR, "cruce-winners-t4-t6-reporte-performance.md");
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");

  // Extraer los factores que explican la mejora
  const factorsMatch = content.match(/### Los 6 factores[^\n]*\n([\s\S]*?)(?=\n###|\n##\s)/i);
  if (!factorsMatch) return null;

  const factors = [];
  const factorRegex = /\*\*Factor \d+:\s*([^—\n]+)—\s*~?([0-9]+%)/g;
  let m;
  while ((m = factorRegex.exec(factorsMatch[1])) !== null) {
    factors.push({ name: m[1].trim(), impact: m[2] });
  }
  return factors;
}

// ═══════════════════════════════════════════════════════════════
// FUENTE 2: JSONs de generations (como antes, condensado)
// ═══════════════════════════════════════════════════════════════

function readGenerationCounts() {
  if (!existsSync(GENS_DIR)) return null;
  const gens = readdirSync(GENS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      try { return JSON.parse(readFileSync(join(GENS_DIR, f), "utf-8")); }
      catch { return null; }
    })
    .filter(Boolean);

  const winners = gens.filter(g => g.status === "winner");
  const recorded = gens.filter(g => g.status === "recorded");
  const validated = [...winners, ...recorded];

  if (validated.length === 0) return { winners: 0, recorded: 0, total: 0 };

  const count = (field) => {
    const counts = {};
    validated.forEach(g => {
      const v = g.script?.[field] || "unknown";
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const hookTypeCounts = {};
  validated.forEach(g => {
    (g.script?.hooks || []).forEach(h => {
      const ht = h.hook_type || h.hookType || "unknown";
      hookTypeCounts[ht] = (hookTypeCounts[ht] || 0) + 1;
    });
  });

  return {
    winners: winners.length,
    recorded: recorded.length,
    total: validated.length,
    topAngles: count("angle_family"),
    topBodies: count("body_type"),
    topSegments: count("segment"),
    topNiches: count("niche"),
    topHooks: Object.entries(hookTypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════

function render(analisis, cruce, genCounts) {
  const now = new Date().toISOString().split("T")[0];
  let md = `# Winner Patterns — ${now}\n\n`;
  md += `> **DNA real accionable extraído de los análisis profundos en \`.data/\`.**\n`;
  md += `> Fuente primaria: \`analisis-winner-*.md\` (análisis manuales con métricas reales).\n`;
  md += `> Fuente secundaria: generations con status winner/recorded (counts estadísticos).\n\n`;

  // ── FUENTE 1: DNA de análisis profundos ──
  if (analisis.length > 0) {
    md += `## Winners con análisis profundo (${analisis.length})\n\n`;
    md += `| # | Ad | CPL | Leads | Nicho | Ángulo | Hook type | Segmento | Dur |\n`;
    md += `|---|----|-----|-------|-------|--------|-----------|----------|-----|\n`;
    analisis
      .sort((a, b) => {
        const ca = parseFloat((a.cpl || "$99").replace("$", ""));
        const cb = parseFloat((b.cpl || "$99").replace("$", ""));
        return ca - cb;
      })
      .forEach((a, i) => {
        md += `| ${i + 1} | ${a.title.replace(/^Análisis Profundo — /, "").substring(0, 50)} | ${a.cpl || "?"} | ${a.leads || "?"} | ${a.nicho || "—"} | ${a.angle || "—"} | ${a.hookType || "—"} | ${a.segment || "—"} | ${a.duration || "—"} |\n`;
      });
    md += `\n`;

    // DNA destilado por winner
    md += `## DNA por winner (hallazgos accionables)\n\n`;
    analisis.forEach(a => {
      const cleanTitle = a.title.replace(/^Análisis Profundo — /, "");
      md += `### ${cleanTitle} — ${a.cpl || "CPL ?"}\n\n`;

      if (a.metaPattern) {
        md += `**Meta-patrón:** ${a.metaPattern}\n\n`;
      }

      if (a.findings.length > 0) {
        md += `**Hallazgos que mueven la aguja:**\n`;
        a.findings.forEach((f, i) => {
          md += `${i + 1}. **${f.heading}** — ${f.body}\n`;
        });
        md += `\n`;
      }

      if (a.transferencias.length > 0) {
        md += `**Principios transferibles:**\n`;
        a.transferencias.forEach(t => {
          md += `- ${t}\n`;
        });
        md += `\n`;
      }

      md += `*Análisis completo:* \`.data/${a.file}\`\n\n---\n\n`;
    });
  } else {
    md += `## ⚠️ No hay análisis profundos en .data/\n\n`;
    md += `Para poblar este archivo, crear archivos \`analisis-winner-*.md\` en \`.data/\`.\n\n`;
  }

  // ── Cruce reporte performance (explica la evolución) ──
  if (cruce && cruce.length > 0) {
    md += `## Factores que explicaron la mejora T4 → T6 (CPL -49%)\n\n`;
    md += `Del cruce con reporte de performance Meta Ads:\n\n`;
    cruce.forEach(f => {
      md += `- **${f.name.trim()}** — impacto estimado ${f.impact}\n`;
    });
    md += `\n*Análisis completo:* \`.data/cruce-winners-t4-t6-reporte-performance.md\`\n\n---\n\n`;
  }

  // ── FUENTE 2: Counts del sistema ──
  if (genCounts && genCounts.total > 0) {
    md += `## Counts estadísticos (generations con status winner/recorded)\n\n`;
    md += `**Total validados:** ${genCounts.total} (${genCounts.winners} winners + ${genCounts.recorded} recorded)\n\n`;

    const showCounts = (label, arr) => {
      if (!arr || arr.length === 0) return "";
      let s = `**${label}:** `;
      s += arr.slice(0, 5).map(([k, v]) => `${k} (${v})`).join(", ");
      return s + "\n\n";
    };

    md += showCounts("Top ángulos", genCounts.topAngles);
    md += showCounts("Top bodies", genCounts.topBodies);
    md += showCounts("Top hooks", genCounts.topHooks);
    md += showCounts("Top segmentos", genCounts.topSegments);
    md += showCounts("Top nichos", genCounts.topNiches);
  }

  // ── Cómo usar ──
  md += `---\n\n## Cómo usar estos patterns\n\n`;
  md += `- **Sesgar hacia lo validado:** los winners con análisis profundo tienen métricas reales. Usar su estructura (ángulo, hook type, vehículo) como norte.\n`;
  md += `- **NUNCA copiar:** son patrones para SESGAR decisiones, no templates para replicar.\n`;
  md += `- **Diversidad sigue mandando:** si un tipo de lead tiene más winners, priorizarlo pero no repetirlo.\n`;
  md += `- **Leer el análisis completo** si vas a basar un guion en un winner — los hallazgos aquí son destilado, el contexto completo está en \`.data/analisis-winner-*.md\`.\n`;

  return md;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const analisis = readAnalisisFiles();
const cruce = readCruceReporte();
const genCounts = readGenerationCounts();

const md = render(analisis, cruce, genCounts);
writeFileSync(OUTPUT_PATH, md);

console.log(JSON.stringify({
  status: "OK",
  analisis_profundos: analisis.length,
  cruce_factores: cruce?.length || 0,
  generations_validadas: genCounts?.total || 0,
  winners_con_cpl: analisis.filter(a => a.cpl).length,
  output: OUTPUT_PATH,
}));
