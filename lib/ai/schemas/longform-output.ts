// --- Long-form YouTube content schema ---
// Separate from ScriptOutput (short-form ads) to avoid polluting that schema.

export type LongformOutputMode = "full_script" | "structure" | "both";

export type LongformFramework =
  | "educational"        // Enseñar algo paso a paso
  | "storytelling"       // Historia con arco narrativo
  | "listicle"           // "5 formas de...", "3 errores que..."
  | "case_study"         // Analizar un caso real en profundidad
  | "debate"             // Presentar dos lados, dar opinión
  | "tutorial"           // Hacer algo en vivo, paso a paso
  | "reaction_analysis"; // Reaccionar/analizar contenido existente

export interface LongformChapter {
  number: number;
  title: string;
  /** En modo "full_script": texto completo para leer. En modo "structure": bullet points con ideas clave. */
  content: string;
  key_points: string[];
  estimated_duration_seconds: number;
  /** Notas de producción: qué mostrar en pantalla, B-roll, gráficos */
  visual_notes?: string;
}

export interface LongformTransition {
  from_chapter: number;
  to_chapter: number;
  transition_text: string;
}

export interface LongformHook {
  /** Texto completo del hook de apertura (primeros 30-60 segundos) */
  script_text: string;
  /** Qué se muestra en pantalla durante el hook */
  visual_notes: string;
  estimated_duration_seconds: number;
}

export interface LongformCTA {
  /** CTA principal (suscribirse, ver otro video, link en descripción) */
  primary_text: string;
  /** CTA secundario mid-roll (si aplica) */
  midroll_text?: string;
  /** Descripción del end screen */
  end_screen_notes?: string;
}

export interface LongformSEO {
  title: string;
  description: string;
  tags: string[];
  thumbnail_idea: string;
}

export interface LongformOutput {
  output_mode: LongformOutputMode;
  title: string;
  framework: LongformFramework;
  hook: LongformHook;
  chapters: LongformChapter[];
  transitions: LongformTransition[];
  conclusion: {
    content: string;
    estimated_duration_seconds: number;
  };
  cta: LongformCTA;
  seo: LongformSEO;
  total_duration_seconds: number;
  word_count: number;
  /** Arco emocional del video completo */
  emotional_arc: string;
  /** Notas generales de producción */
  production_notes: string;
}
