import { promises as fs } from "fs";
import path from "path";
import type { ScriptOutput } from "../ai/schemas/script-output";
import type { ReferenceAnalysis } from "../ai/schemas/reference-analysis";

const DATA_DIR = path.join(process.cwd(), ".data");
const BRIEFS_DIR = path.join(DATA_DIR, "briefs");
const GENERATIONS_DIR = path.join(DATA_DIR, "generations");

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
    return true;
  } catch {
    return false;
  }
}

export async function listProjects(): Promise<StoredProject[]> {
  await ensureDirs();
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const projects: StoredProject[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = await fs.readFile(path.join(PROJECTS_DIR, file), "utf-8");
        projects.push(JSON.parse(data));
      }
    }
    return projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

export interface StoredGeneration {
  id: string;
  briefId: string;
  projectId?: string;
  script: ScriptOutput;
  createdAt: string;
}

const REFERENCES_DIR = path.join(DATA_DIR, "references");

async function ensureDirs() {
  await fs.mkdir(BRIEFS_DIR, { recursive: true });
  await fs.mkdir(GENERATIONS_DIR, { recursive: true });
  await fs.mkdir(REFERENCES_DIR, { recursive: true });
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
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
  await ensureDirs();
  try {
    const files = await fs.readdir(GENERATIONS_DIR);
    const generations: StoredGeneration[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = await fs.readFile(path.join(GENERATIONS_DIR, file), "utf-8");
        generations.push(JSON.parse(data));
      }
    }
    return generations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
  await ensureDirs();
  try {
    const files = await fs.readdir(REFERENCES_DIR);
    const refs: StoredReference[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = await fs.readFile(path.join(REFERENCES_DIR, file), "utf-8");
        refs.push(JSON.parse(data));
      }
    }
    return refs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}
