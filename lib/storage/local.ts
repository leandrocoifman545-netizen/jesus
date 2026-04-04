import { promises as fs } from "fs";
import path from "path";
import { cache as reactCache } from "react";
import type { ScriptOutput } from "../ai/schemas/script-output";
import type { LongformOutput } from "../ai/schemas/longform-output";
import type { ReferenceAnalysis } from "../ai/schemas/reference-analysis";

export type ContentType = "shortform" | "longform";

const DATA_DIR = path.join(process.cwd(), ".data");
const BRIEFS_DIR = path.join(DATA_DIR, "briefs");
const GENERATIONS_DIR = path.join(DATA_DIR, "generations");
const PLANS_DIR = path.join(DATA_DIR, "plans");
const STORIES_DIR = path.join(DATA_DIR, "stories");
const POSTS_DIR = path.join(DATA_DIR, "posts-ig");

// --- In-memory cache (survives across requests in same process) ---

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 10_000; // 10 seconds
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// Generic helper: list all JSON items from a directory with caching
async function listItemsFromDir<T extends { createdAt: string }>(
  dir: string,
  cacheKey: string,
  normalize?: (item: T) => T,
): Promise<T[]> {
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  await ensureDirs();
  try {
    const files = await fs.readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.includes(".backup"));
    const items = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(path.join(dir, file), "utf-8");
        const parsed = JSON.parse(data) as T;
        return normalize ? normalize(parsed) : parsed;
      })
    );
    const sorted = items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCache(cacheKey, sorted);
    return sorted;
  } catch {
    return [];
  }
}

// --- Projects ---

const PROJECTS_DIR = path.join(DATA_DIR, "projects");

export interface BrandDoc {
  name: string;
  content: string;
}

export interface StoredProject {
  id: string;
  clientName: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
  brandDocument?: string; // legacy single doc
  brandDocuments?: BrandDoc[];
  generationRules?: string; // project-specific rules injected as high-priority system prompt
  createdAt: string;
}

/** Get all brand docs as a single concatenated string for prompt injection */
export function getProjectBrandText(project: StoredProject): string | undefined {
  if (project.brandDocuments && project.brandDocuments.length > 0) {
    return project.brandDocuments
      .map((d) => `--- ${d.name} ---\n${d.content}`)
      .join("\n\n");
  }
  return project.brandDocument;
}

export async function saveProject(project: StoredProject): Promise<void> {
  await ensureDirs();
  await fs.writeFile(
    path.join(PROJECTS_DIR, `${project.id}.json`),
    JSON.stringify(project, null, 2)
  );
  invalidateCache("projects");
}

export async function getProject(id: string): Promise<StoredProject | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(PROJECTS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(PROJECTS_DIR, `${id}.json`));
    invalidateCache("projects");
    return true;
  } catch {
    return false;
  }
}

export async function listProjects(): Promise<StoredProject[]> {
  return listItemsFromDir<StoredProject>(PROJECTS_DIR, "projects:list");
}

export interface StoredBrief {
  id: string;
  projectId?: string;
  productDescription: string;
  targetAudience: string;
  brandTone?: string;
  platform?: string;
  durationTarget?: number;
  hookCount: number;
  additionalNotes?: string;
  references?: string[];
  brandDocument?: string;
  createdAt: string;
}

export type GenerationStatus = "draft" | "confirmed" | "recorded" | "winner";

export interface WinnerMetrics {
  ctr?: number;
  hookRate?: number;
  holdRate?: number;
  cpa?: number;
  roas?: number;
  notes?: string;
  bestLeadIndex?: number;
  recordedAt?: string;
}

export interface GenerationBatch {
  id: string;
  name: string;
}

export interface StoredGeneration {
  id: string;
  briefId: string;
  projectId?: string;
  planId?: string;
  title?: string;
  batch?: GenerationBatch;
  contentType?: ContentType;
  script: ScriptOutput;
  longform?: LongformOutput;
  status?: GenerationStatus;
  metrics?: WinnerMetrics;
  sessionNotes?: string;
  hookApprovals?: Record<number, "approved" | "rejected">; // index → status
  ctaBlockId?: string; // ID of the CTA block variant used (e.g. "clase-gratis-A")
  createdAt: string;
}

// --- CTA History ---

export interface CTAHistoryEntry {
  ctaId: string;
  channel: string;
  variant: string;
  weekStart: string; // ISO date of the Monday
  generationIds: string[]; // scripts that used this CTA
}

const CTA_HISTORY_FILE = path.join(DATA_DIR, "cta-history.json");

export async function getCTAHistory(): Promise<CTAHistoryEntry[]> {
  try {
    const raw = await fs.readFile(CTA_HISTORY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addCTAHistoryEntry(entry: CTAHistoryEntry): Promise<void> {
  const history = await getCTAHistory();
  // Check if entry for this CTA + week already exists
  const existing = history.find(h => h.ctaId === entry.ctaId && h.weekStart === entry.weekStart);
  if (existing) {
    existing.generationIds = [...new Set([...existing.generationIds, ...entry.generationIds])];
  } else {
    history.push(entry);
  }
  await fs.writeFile(CTA_HISTORY_FILE, JSON.stringify(history, null, 2));
}

// --- Plans ---

export interface PlanSlot {
  index: number;
  angle: string;
  segment: string;
  funnel: string;
  bodyType: string;
  visualFormat: string;
  nicheIdea?: string;
  leadTypes: string[];
  justification: string;
  generationId?: string; // linked when generated
  status: "pending" | "generated" | "recorded" | "winner";
}

export interface StoredPlan {
  id: string;
  projectId?: string;
  name: string;
  weekOf: string; // ISO date of Monday
  slots: PlanSlot[];
  visualFormats: string[]; // 2 formats chosen for the week
  recordingOrder?: number[]; // indices in suggested recording order
  notes?: string;
  createdAt: string;
}

// --- Case Studies (Casos de éxito) ---

const CASE_STUDIES_FILE = path.join(DATA_DIR, "case-studies.json");

export interface CaseStudy {
  id: string;
  fileReference: string; // e.g. "C1340" — for editor to find the clip
  name: string;
  age?: number;
  location?: string;
  situationBefore: string; // what they were doing before
  result?: string; // concrete result if any
  keyQuote: string; // most powerful quote for scripts
  objection?: string; // what objection they had before joining
  bestFor: string; // when to use: "TOFU jóvenes", "objeción edad", etc.
  useAs: "lead" | "body_fragment" | "pre_cta" | "objection_response"; // primary use
  productSource: string; // "Academia Publicistas" — to know it's NOT from current product
  active: boolean;
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const cached = getCached<CaseStudy[]>("case-studies:list");
  if (cached) return cached;

  try {
    const data = await fs.readFile(CASE_STUDIES_FILE, "utf-8");
    const result = (JSON.parse(data) as CaseStudy[]).filter((c) => c.active);
    setCache("case-studies:list", result);
    return result;
  } catch {
    return [];
  }
}

export async function saveCaseStudies(cases: CaseStudy[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(CASE_STUDIES_FILE, JSON.stringify(cases, null, 2));
  invalidateCache("case-studies");
}

// --- Burned Leads ---

export interface BurnedLead {
  text: string;
  hookType: string;
  fromGenerationId: string;
  burnedAt: string;
}

const BURNED_LEADS_FILE = path.join(DATA_DIR, "burned-leads.json");
const ACTIVE_CTAS_FILE = path.join(DATA_DIR, "ctas-activos.json");

export async function getBurnedLeads(): Promise<BurnedLead[]> {
  const cached = getCached<BurnedLead[]>("burned-leads:list");
  if (cached) return cached;

  try {
    const data = await fs.readFile(BURNED_LEADS_FILE, "utf-8");
    const result = JSON.parse(data) as BurnedLead[];
    setCache("burned-leads:list", result);
    return result;
  } catch {
    return [];
  }
}

async function saveBurnedLeads(leads: BurnedLead[]): Promise<void> {
  await fs.writeFile(BURNED_LEADS_FILE, JSON.stringify(leads, null, 2));
  invalidateCache("burned-leads");
}

// --- Active CTAs ---

export interface CTALayers {
  oferta: string;
  prueba: string;
  riesgo_cero: string;
  urgencia: string;
  orden_nlp: string;
}

export interface ActiveCTA {
  id: string;
  channel: string;
  variant: string;
  ingredients: string[];
  layers?: CTALayers;
  text: string; // full text (all layers concatenated) for backwards compat
}

const DEFAULT_CTAS: ActiveCTA[] = [
  {
    id: "clase-gratis-A",
    channel: "Clase Gratuita",
    variant: "A",
    ingredients: ["#98 Tres Deliverables", "#89 Prueba por Volumen", "#106 Garantía Implícita", "#117 Escasez Real", "#109 Directo", "#126 Presuposición"],
    layers: {
      oferta: "En la clase gratuita de esta semana te muestro las 3 cosas que necesitás para arrancar: cómo encontrar productos que la gente ya está comprando, cómo crearlos con inteligencia artificial y cómo venderlos por WhatsApp. Son 2 horas. En vivo. Conmigo.",
      prueba: "Ya pasaron más de 17 mil personas por este programa. Desde amas de casa hasta ingenieros.",
      riesgo_cero: "Es gratis. No te pido plata, no te pido experiencia. Solo 2 horas de tu tiempo.",
      urgencia: "Los cupos son limitados porque es en vivo y no puedo atender a todo el mundo.",
      orden_nlp: "Tocá el botón de acá abajo y registrate. Te espero adentro.",
    },
    text: "En la clase gratuita de esta semana te muestro las 3 cosas que necesitás para arrancar: cómo encontrar productos que la gente ya está comprando, cómo crearlos con inteligencia artificial y cómo venderlos por WhatsApp. Son 2 horas. En vivo. Conmigo. Ya pasaron más de 17 mil personas por este programa. Desde amas de casa hasta ingenieros. Es gratis. No te pido plata, no te pido experiencia. Solo 2 horas de tu tiempo. Los cupos son limitados porque es en vivo y no puedo atender a todo el mundo. Tocá el botón de acá abajo y registrate. Te espero adentro.",
  },
  {
    id: "taller-5-A",
    channel: "Taller $5",
    variant: "A",
    ingredients: ["#71 Proceso de N Pasos", "#98 Tres Deliverables", "#89 Prueba por Volumen", "#103 Reducción al Absurdo", "#118 Deadline", "#117 Escasez", "#125 Reframe", "#126 Presuposición"],
    layers: {
      oferta: "Son 3 días conmigo. En vivo. Día 1: encontrás tu producto ganador con IA. Día 2: lo armás completo. Día 3: lo vendés por WhatsApp. Salís con tu producto creado, tu anuncio listo y tu primer sistema de ventas funcionando.",
      prueba: "Ya lo hicieron más de 17 mil personas en Argentina, Colombia, México y España.",
      riesgo_cero: "¿Cuánto vale? 5 dólares. Menos que un café. ¿Por qué tan barato? Porque yo no gano con el taller. Gano cuando a vos te va bien.",
      urgencia: "El taller arranca esta semana y los cupos son limitados porque es en vivo.",
      orden_nlp: "La pregunta no es si funciona. La pregunta es si vos vas a hacer algo. Tocá el botón de acá abajo. Nos vemos adentro.",
    },
    text: "Son 3 días conmigo. En vivo. Día 1: encontrás tu producto ganador con IA. Día 2: lo armás completo. Día 3: lo vendés por WhatsApp. Salís con tu producto creado, tu anuncio listo y tu primer sistema de ventas funcionando. Ya lo hicieron más de 17 mil personas en Argentina, Colombia, México y España. ¿Cuánto vale? 5 dólares. Menos que un café. ¿Por qué tan barato? Porque yo no gano con el taller. Gano cuando a vos te va bien. El taller arranca esta semana y los cupos son limitados porque es en vivo. La pregunta no es si funciona. La pregunta es si vos vas a hacer algo. Tocá el botón de acá abajo. Nos vemos adentro.",
  },
  {
    id: "instagram-A",
    channel: "Instagram Orgánico",
    variant: "A",
    ingredients: ["#89 Prueba por Volumen", "#110 Conversacional", "#127 Embedded Command"],
    layers: {
      oferta: "En la clase gratuita te muestro cómo encontrar productos que se venden, crearlos con IA y venderlos por WhatsApp. Paso a paso. Sin experiencia.",
      prueba: "Miles de personas ya lo hicieron.",
      riesgo_cero: "Es gratis. Son 2 horas. Sin compromiso.",
      urgencia: "Los cupos se están llenando.",
      orden_nlp: "Comentá 'CLASE' y andá al link de mi perfil para registrarte. Cuando entres, vas a ver exactamente cómo funciona. Te espero.",
    },
    text: "En la clase gratuita te muestro cómo encontrar productos que se venden, crearlos con IA y venderlos por WhatsApp. Paso a paso. Sin experiencia. Miles de personas ya lo hicieron. Es gratis. Son 2 horas. Sin compromiso. Los cupos se están llenando. Comentá 'CLASE' y andá al link de mi perfil para registrarte. Cuando entres, vas a ver exactamente cómo funciona. Te espero.",
  },
];

export async function getActiveCTAs(): Promise<ActiveCTA[]> {
  const cached = getCached<ActiveCTA[]>("active-ctas:list");
  if (cached) return cached;

  try {
    const data = await fs.readFile(ACTIVE_CTAS_FILE, "utf-8");
    const parsed = JSON.parse(data) as ActiveCTA[];
    const result = parsed.length > 0 ? parsed : DEFAULT_CTAS;
    setCache("active-ctas:list", result);
    return result;
  } catch {
    return DEFAULT_CTAS;
  }
}

export async function saveActiveCTAs(ctas: ActiveCTA[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(ACTIVE_CTAS_FILE, JSON.stringify(ctas, null, 2));
  invalidateCache("active-ctas");
}

export async function burnLeadsFromGeneration(gen: StoredGeneration): Promise<number> {
  const existing = await getBurnedLeads();
  const existingTexts = new Set(existing.map((l) => l.text.toLowerCase().trim()));
  const newLeads: BurnedLead[] = [];

  for (const hook of gen.script.hooks) {
    const normalized = hook.script_text.toLowerCase().trim();
    if (!existingTexts.has(normalized)) {
      newLeads.push({
        text: hook.script_text,
        hookType: hook.hook_type,
        fromGenerationId: gen.id,
        burnedAt: new Date().toISOString(),
      });
      existingTexts.add(normalized);
    }
  }

  // Also burn longform hook if present
  if (gen.longform?.hook?.script_text) {
    const normalized = gen.longform.hook.script_text.toLowerCase().trim();
    if (!existingTexts.has(normalized)) {
      newLeads.push({
        text: gen.longform.hook.script_text,
        hookType: "longform_hook",
        fromGenerationId: gen.id,
        burnedAt: new Date().toISOString(),
      });
      existingTexts.add(normalized);
    }
  }

  if (newLeads.length > 0) {
    await saveBurnedLeads([...existing, ...newLeads]);
  }
  return newLeads.length;
}

export async function unburnLeadsFromGeneration(generationId: string): Promise<number> {
  const existing = await getBurnedLeads();
  const filtered = existing.filter((l) => l.fromGenerationId !== generationId);
  const removed = existing.length - filtered.length;
  if (removed > 0) {
    await saveBurnedLeads(filtered);
  }
  return removed;
}

export async function updateGenerationStatus(
  id: string,
  status: GenerationStatus
): Promise<StoredGeneration | null> {
  const gen = await getGeneration(id);
  if (!gen) return null;

  const oldStatus = gen.status || "draft";
  gen.status = status;
  await saveGeneration(gen);

  // Burn leads when confirmed (or skipping straight to recorded/winner)
  const burnStatuses = ["confirmed", "recorded", "winner"];
  if (burnStatuses.includes(status) && !burnStatuses.includes(oldStatus)) {
    await burnLeadsFromGeneration(gen);
  } else if (!burnStatuses.includes(status) && burnStatuses.includes(oldStatus)) {
    await unburnLeadsFromGeneration(id);
  }

  return gen;
}

const REFERENCES_DIR = path.join(DATA_DIR, "references");

let dirsEnsured = false;
async function ensureDirs() {
  if (dirsEnsured) return;
  await Promise.all([
    fs.mkdir(BRIEFS_DIR, { recursive: true }),
    fs.mkdir(GENERATIONS_DIR, { recursive: true }),
    fs.mkdir(REFERENCES_DIR, { recursive: true }),
    fs.mkdir(PROJECTS_DIR, { recursive: true }),
    fs.mkdir(PLANS_DIR, { recursive: true }),
    fs.mkdir(STORIES_DIR, { recursive: true }),
    fs.mkdir(POSTS_DIR, { recursive: true }),
  ]);
  dirsEnsured = true;
}

export async function listGenerationsByProject(projectId: string): Promise<StoredGeneration[]> {
  const all = await listGenerations();
  return all.filter((g) => g.projectId === projectId);
}

export async function saveBrief(brief: StoredBrief): Promise<void> {
  await ensureDirs();
  await fs.writeFile(
    path.join(BRIEFS_DIR, `${brief.id}.json`),
    JSON.stringify(brief, null, 2)
  );
}

// Normalize old generations: ctas[] → cta, old platform → format label
function normalizeGeneration(gen: StoredGeneration): StoredGeneration {
  if (!gen.script) return gen; // longform generations have no script
  const script = gen.script as unknown as Record<string, unknown>;

  // Fix old ctas[] array → cta object
  if (!script.cta && Array.isArray(script.ctas) && script.ctas.length > 0) {
    const old = script.ctas[0] as Record<string, unknown>;
    script.cta = {
      verbal_cta: old.script_text || old.verbal_cta || "[CTA genérico]",
      reason_why: old.strategic_rationale || old.reason_why || "",
      timing_seconds: old.timing_seconds || 5,
      cta_type: old.cta_type || "custom",
    };
    delete script.ctas;
  }

  return gen;
}

export async function saveGeneration(gen: StoredGeneration): Promise<void> {
  await ensureDirs();
  const filePath = path.join(GENERATIONS_DIR, `${gen.id}.json`);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(gen, null, 2));
  await fs.rename(tmpPath, filePath);
  invalidateCache("generations");
  // Fire-and-forget: refresh coverage cache after any generation save
  // Uses dynamic import to avoid circular dependency (coverage.ts imports from local.ts)
  import("../coverage").then((m) => m.refreshCoverageCache()).catch(() => {});
}

export async function getGeneration(id: string): Promise<StoredGeneration | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(GENERATIONS_DIR, `${id}.json`), "utf-8");
    return normalizeGeneration(JSON.parse(data));
  } catch {
    return null;
  }
}

export async function deleteGeneration(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    // Unburn leads if this generation had burned leads
    await unburnLeadsFromGeneration(id);
    await fs.unlink(path.join(GENERATIONS_DIR, `${id}.json`));
    invalidateCache("generations");
    // Fire-and-forget: refresh coverage cache after deletion
    import("../coverage").then((m) => m.refreshCoverageCache()).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export async function getBrief(id: string): Promise<StoredBrief | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(BRIEFS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function listGenerations(): Promise<StoredGeneration[]> {
  return listItemsFromDir<StoredGeneration>(GENERATIONS_DIR, "generations:list", normalizeGeneration);
}

/** Returns prev/next generation IDs (sorted by createdAt desc, same as dashboard). */
export async function getGenerationNeighbors(id: string, batchId?: string): Promise<{ prev: { id: string; title: string } | null; next: { id: string; title: string } | null }> {
  let all = await listGenerations();
  // Filter by batch if provided
  if (batchId) {
    all = all.filter((g) => g.batch?.id === batchId);
  }
  // Sort newest first (same order as dashboard)
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const idx = all.findIndex((g) => g.id === id);
  if (idx === -1) return { prev: null, next: null };
  const prev = idx > 0 ? { id: all[idx - 1].id, title: all[idx - 1].title || "Sin título" } : null;
  const next = idx < all.length - 1 ? { id: all[idx + 1].id, title: all[idx + 1].title || "Sin título" } : null;
  return { prev, next };
}

// --- References ---

export interface StoredReference {
  id: string;
  title: string;
  transcript: string;
  analysis: ReferenceAnalysis;
  folder: string; // "individuales" or "masiva-{timestamp}"
  folderLabel?: string; // display name for bulk folders
  createdAt: string;
}

export async function saveReference(ref: StoredReference): Promise<void> {
  await ensureDirs();
  await fs.writeFile(
    path.join(REFERENCES_DIR, `${ref.id}.json`),
    JSON.stringify(ref, null, 2)
  );
  invalidateCache("references");
}

export async function getReference(id: string): Promise<StoredReference | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(REFERENCES_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deleteReference(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(REFERENCES_DIR, `${id}.json`));
    invalidateCache("references");
    return true;
  } catch {
    return false;
  }
}

export async function deleteReferencesByFolder(folder: string): Promise<number> {
  const refs = await listReferences();
  const toDelete = refs.filter((r) => r.folder === folder);
  let count = 0;
  for (const ref of toDelete) {
    const deleted = await deleteReference(ref.id);
    if (deleted) count++;
  }
  return count;
}

export async function listReferences(): Promise<StoredReference[]> {
  return listItemsFromDir<StoredReference>(REFERENCES_DIR, "references:list");
}

// --- Plans CRUD ---

export async function savePlan(plan: StoredPlan): Promise<void> {
  await ensureDirs();
  await fs.writeFile(
    path.join(PLANS_DIR, `${plan.id}.json`),
    JSON.stringify(plan, null, 2)
  );
  invalidateCache("plans");
}

export async function getPlan(id: string): Promise<StoredPlan | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(PLANS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deletePlan(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(PLANS_DIR, `${id}.json`));
    invalidateCache("plans");
    return true;
  } catch {
    return false;
  }
}

export async function listPlans(): Promise<StoredPlan[]> {
  return listItemsFromDir<StoredPlan>(PLANS_DIR, "plans:list");
}

export async function linkGenerationToPlan(
  planId: string,
  slotIndex: number,
  generationId: string,
): Promise<StoredPlan | null> {
  const plan = await getPlan(planId);
  if (!plan || slotIndex < 0 || slotIndex >= plan.slots.length) return null;

  plan.slots[slotIndex].generationId = generationId;
  plan.slots[slotIndex].status = "generated";
  await savePlan(plan);

  // Also link generation back to plan
  const gen = await getGeneration(generationId);
  if (gen) {
    gen.planId = planId;
    await saveGeneration(gen);
  }

  return plan;
}

// --- React.cache() wrappers for server component deduplication ---
// These deduplicate calls within the same server render pass.
// Multiple server components calling the same function share one result.

// --- Stories ---

export type StorySequenceType =
  | "personalidad"
  | "cta_lead_magnet"
  | "cta_volumen"
  | "cta_directo"
  | "objecion"
  | "nicho"
  | "expertise"
  | "actuada_triangulo"
  | "explicativa_servicio"
  | "behind_the_scenes";

export type StoryStatus = "draft" | "recorded" | "published";

export interface StorySlide {
  number: number;
  narration: string;
  visual: string;
  format: string;
  seconds: number;
  interaction: string | null;
}

export interface StoredStory {
  id: string;
  title: string;
  sequence_type: StorySequenceType;
  status: StoryStatus;
  notes: string;
  slides: StorySlide[];
  total_seconds: number;
  rules_applied: string[];
  triggers: string[];
  highlight_name: string | null;
  createdAt: string;
  recording_notes?: string[];
  content_bank?: string[];
  objeciones_disueltas?: string[];
  avatar_target?: string;
  tension?: string;
}

export async function saveStory(story: StoredStory): Promise<void> {
  await ensureDirs();
  const filePath = path.join(STORIES_DIR, `${story.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(story, null, 2));
  invalidateCache("stories");
}

export async function getStory(id: string): Promise<StoredStory | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(STORIES_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deleteStory(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(STORIES_DIR, `${id}.json`));
    invalidateCache("stories");
    return true;
  } catch {
    return false;
  }
}

export async function listStories(): Promise<StoredStory[]> {
  return listItemsFromDir<StoredStory>(STORIES_DIR, "stories:list");
}

export const cachedListStories: typeof listStories = reactCache(listStories);

// --- Instagram Posts ---

export type PostType = "carousel" | "image";
export type PostStatus = "draft" | "scheduled" | "published";

export interface PostSlide {
  number: number;
  text: string;
  visual_concept: string;
}

export interface StoredPost {
  id: string;
  title: string;
  post_type: PostType;
  status: PostStatus;
  topic: string;
  keyword: string;
  caption: string;
  avatar_target: string;
  lead_magnet: string;
  slides: PostSlide[];
  design_notes: string;
  publish_day: string;
  metrics?: {
    likes?: number;
    comments?: number;
    saves?: number;
    reach?: number;
  };
  notes: string;
  createdAt: string;
  batch_id?: string;
}

export async function savePost(post: StoredPost): Promise<void> {
  await ensureDirs();
  const filePath = path.join(POSTS_DIR, `${post.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(post, null, 2));
  invalidateCache("posts");
}

export async function getPost(id: string): Promise<StoredPost | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(POSTS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(POSTS_DIR, `${id}.json`));
    invalidateCache("posts");
    return true;
  } catch {
    return false;
  }
}

export async function listPosts(): Promise<StoredPost[]> {
  return listItemsFromDir<StoredPost>(POSTS_DIR, "posts:list");
}

export const cachedListPosts: typeof listPosts = reactCache(listPosts);

// --- React.cache() wrappers for server component deduplication ---
// These deduplicate calls within the same server render pass.
// Multiple server components calling the same function share one result.

export const cachedListGenerations: typeof listGenerations = reactCache(listGenerations);
export const cachedListReferences: typeof listReferences = reactCache(listReferences);
export const cachedListProjects: typeof listProjects = reactCache(listProjects);
export const cachedListPlans: typeof listPlans = reactCache(listPlans);
export const cachedGetActiveCTAs: typeof getActiveCTAs = reactCache(getActiveCTAs);
