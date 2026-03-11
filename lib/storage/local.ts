import { promises as fs } from "fs";
import path from "path";
import type { ScriptOutput } from "../ai/schemas/script-output";
import type { ReferenceAnalysis } from "../ai/schemas/reference-analysis";

const DATA_DIR = path.join(process.cwd(), ".data");
const BRIEFS_DIR = path.join(DATA_DIR, "briefs");
const GENERATIONS_DIR = path.join(DATA_DIR, "generations");

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
  const cached = getCached<StoredProject[]>("projects:list");
  if (cached) return cached;

  await ensureDirs();
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const projects = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(path.join(PROJECTS_DIR, file), "utf-8");
        return JSON.parse(data) as StoredProject;
      })
    );
    const sorted = projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCache("projects:list", sorted);
    return sorted;
  } catch {
    return [];
  }
}

export interface StoredBrief {
  id: string;
  projectId?: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
  platform: "tiktok" | "reels" | "shorts";
  durationTarget?: number;
  hookCount: number;
  additionalNotes?: string;
  references?: string[];
  brandDocument?: string;
  createdAt: string;
}

export type GenerationStatus = "draft" | "recorded" | "winner";

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

export interface StoredGeneration {
  id: string;
  briefId: string;
  projectId?: string;
  title?: string;
  script: ScriptOutput;
  status?: GenerationStatus;
  metrics?: WinnerMetrics;
  sessionNotes?: string;
  createdAt: string;
}

// --- Burned Leads ---

export interface BurnedLead {
  text: string;
  hookType: string;
  fromGenerationId: string;
  burnedAt: string;
}

const BURNED_LEADS_FILE = path.join(DATA_DIR, "burned-leads.json");

export async function getBurnedLeads(): Promise<BurnedLead[]> {
  try {
    const data = await fs.readFile(BURNED_LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveBurnedLeads(leads: BurnedLead[]): Promise<void> {
  await fs.writeFile(BURNED_LEADS_FILE, JSON.stringify(leads, null, 2));
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

  // Burn/unburn leads based on status change
  if ((status === "recorded" || status === "winner") && oldStatus === "draft") {
    await burnLeadsFromGeneration(gen);
  } else if (status === "draft" && (oldStatus === "recorded" || oldStatus === "winner")) {
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

export async function saveGeneration(gen: StoredGeneration): Promise<void> {
  await ensureDirs();
  await fs.writeFile(
    path.join(GENERATIONS_DIR, `${gen.id}.json`),
    JSON.stringify(gen, null, 2)
  );
  invalidateCache("generations");
}

export async function getGeneration(id: string): Promise<StoredGeneration | null> {
  await ensureDirs();
  try {
    const data = await fs.readFile(path.join(GENERATIONS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data);
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
  const cached = getCached<StoredGeneration[]>("generations:list");
  if (cached) return cached;

  await ensureDirs();
  try {
    const files = await fs.readdir(GENERATIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const generations = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(path.join(GENERATIONS_DIR, file), "utf-8");
        return JSON.parse(data) as StoredGeneration;
      })
    );
    const sorted = generations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCache("generations:list", sorted);
    return sorted;
  } catch {
    return [];
  }
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
  const cached = getCached<StoredReference[]>("references:list");
  if (cached) return cached;

  await ensureDirs();
  try {
    const files = await fs.readdir(REFERENCES_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const refs = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(path.join(REFERENCES_DIR, file), "utf-8");
        return JSON.parse(data) as StoredReference;
      })
    );
    const sorted = refs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCache("references:list", sorted);
    return sorted;
  } catch {
    return [];
  }
}
