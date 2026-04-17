// Active hook types — 1:1 aligned with the 15 structural formulas in system.ts
export type HookType =
  // Probadas (CPL real)
  | "auto_seleccion_memoria"    // F1
  | "eliminacion_barreras"      // F2
  | "promesa_directa"           // F3
  // Hipótesis fuertes
  | "pregunta_espejo"           // F4
  | "incredulidad_posesiva"     // F5
  | "hipotetico_personal"       // F6
  | "flip_contraintuitivo"      // F7
  | "nadie_explica"             // F8
  | "ataque_herramienta"        // F9
  | "ancla_precio_invertida"    // F10
  | "historia_dolor_sensorial"  // F11
  | "voz_tercero"               // F12
  | "timeline_proyeccion"       // F13
  | "nombrar_innombrado"        // F14
  | "provocacion_dato"          // F15
  // Legacy types (old generations)
  | "exclusividad_artificial" | "imperativo" | "anti_hype" | "provocacion"
  | "dato_concreto" | "pregunta" | "credencial" | "historia_mini" | "identidad_dolor"
  | "situacion_especifica" | "pregunta_incomoda" | "confesion" | "contraintuitivo"
  | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion"
  | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico" | "simplificacion_error"
  | "pregunta_limitacion" | "asimetria_temporal";

export type CTAType =
  | "directo"
  | "reframe"
  | "embedded_command"
  | "micro_compromiso"
  | "exclusion"
  | "conversacional"
  | "custom";

export interface Hook {
  variant_number: number;
  hook_type: HookType;
  script_text: string;
  timing_seconds: number;
}

/** Funciones persuasivas del micro-VSL (mapeadas de los actos de Benson) */
export type PersuasionFunction =
  | "identificacion"    // Acto 2: "Este problema es MÍO" — dolor + agitación
  | "quiebre"           // Acto 3a: "Lo que creía está mal" — destruir creencia vieja
  | "mecanismo"         // Acto 3b: "Existe un camino nuevo" — nueva oportunidad
  | "demolicion"        // Acto 4: "Mi excusa no aplica" — anticipar objeciones
  | "prueba"            // Acto 3 casos: "Gente como yo lo hizo" — evidencia
  | "venta_modelo";     // Cierre lógico: POR QUÉ este modelo es el correcto

export interface DevelopmentSection {
  section_name: string;
  /**
   * Función persuasiva de este beat (micro-VSL).
   * Obligatorio en generaciones nuevas. Optional solo para backwards-compat con data vieja.
   */
  persuasion_function?: PersuasionFunction;
  /**
   * Micro-creencia que este beat instala. Frase corta que el viewer DEBE aceptar tras este beat.
   * Obligatorio en generaciones nuevas. Optional solo para backwards-compat con data vieja.
   */
  micro_belief?: string;
  is_rehook?: boolean;
  script_text: string;
  timing_seconds: number;
  ipad_directions?: string[];
  ipad_status?: "pending" | "ready" | "rejected";
}

export interface VisualFormat {
  format_name: string;
  difficulty_level: number;
  setup_instructions: string;
  recording_notes: string;
}

// Maps old platform values (TikTok, Reels, etc.) to format labels
const PLATFORM_TO_FORMAT: Record<string, string> = {
  tiktok: "Vertical Ad (9:16)",
  reels: "Vertical Ad (9:16)",
  shorts: "Vertical Ad (9:16)",
  "instagram reels": "Vertical Ad (9:16)",
  "youtube shorts": "Vertical Ad (9:16)",
};

export function resolveFormatLabel(platform: string): string {
  // If it already looks like a format label, return as-is
  if (platform.includes("Vertical") || platform.includes("Horizontal")) return platform;
  // Map old platform values
  return PLATFORM_TO_FORMAT[platform.toLowerCase()] || "Vertical Ad (9:16)";
}

/** Ingrediente usado de la enciclopedia de 127 ingredientes */
export interface IngredientUsed {
  category: string; // "A" through "K"
  ingredient_number: number; // 1-127
  ingredient_name: string;
}

/** Micro-creencia que el viewer necesita aceptar para que la creencia central sea inevitable */
export interface MicroBelief {
  belief: string; // La micro-creencia en una frase
  installed_via: string; // Técnica/vehículo usado para instalarla (ej: "historia de alumno", "demo en vivo", "dato concreto")
  persuasion_function?: PersuasionFunction; // Función persuasiva del beat donde se instala
  section_name?: string; // Nombre de la sección del body donde se instala (opcional, para tracking)
}

export interface ScriptOutput {
  platform_adaptation: {
    platform: string; // format label (e.g. "Vertical Ad (9:16)") — old data may have "TikTok"
    recommended_duration_seconds: number;
    content_style: string;
    key_considerations: string;
  };
  visual_format?: VisualFormat;
  hooks: Hook[];
  development: {
    framework_used: string;
    emotional_arc: string;
    sections: DevelopmentSection[];
  };
  cta: {
    verbal_cta: string;
    reason_why: string;
    timing_seconds: number;
    cta_type: CTAType;
  };
  /** Ingredientes de la enciclopedia usados en este guion (categorías A-K). Obligatorio en generaciones nuevas. */
  ingredients_used?: IngredientUsed[];
  /** Tipo de venta del modelo de negocio usado (1-10). Obligatorio en generaciones nuevas. */
  model_sale_type?: string;
  /** Puente a la oferta: vende QUÉ se lleva al hacer clic (clase/taller). Va entre body y CTA. */
  offer_bridge?: {
    product_type: "webinar_gratis" | "taller_5" | "custom";
    script_text: string;
    timing_seconds: number;
  };
  /** Cuerpo completo como texto (alternativa a development.sections para generaciones manuales) */
  body?: string;
  /** Tipo de cuerpo usado. Obligatorio en generaciones nuevas. */
  body_type?: string;
  /** Familia de ángulo (1-5) y ángulo específico. Obligatorio en generaciones nuevas. */
  angle_family?: string;
  angle_specific?: string;
  /** Segmento objetivo (A/B/C/D) */
  segment?: string;
  /** Etapa del funnel: TOFU/MOFU/RETARGET */
  funnel_stage?: string;
  /** Avatar formal al que se dirige el guion (martin/laura/roberto/valentina/diego/camila/soledad) */
  avatar?: string;
  /** Nivel de conciencia de Schwartz (1-5): 1=Unaware, 2=Problem Aware, 3=Solution Aware, 4=Product Aware, 5=Most Aware */
  awareness_level?: number;
  /** Nicho específico del guion */
  niche?: string;
  /** Cambio de creencia explícito */
  belief_change?: { old_belief: string; mechanism: string; new_belief: string };
  /** Micro-creencias que sostienen la creencia central. Cada una indica qué se instala y con qué técnica. */
  micro_beliefs?: MicroBelief[];
  /** Oración de transición Layer 1 que conecta el cuerpo con el CTA */
  transition_text?: string;
  /** Bloques CTA completos (6 capas) para los 3 canales: clase gratuita, taller $5, instagram */
  cta_blocks?: CTABlock[];
  total_duration_seconds: number;
  word_count: number;
}

/** Bloque CTA completo de 6 capas para un canal específico */
export interface CTABlock {
  channel: "clase_gratuita" | "taller_5" | "instagram";
  channel_label: string;
  variant: string;
  layers?: {
    oferta: string;
    prueba: string;
    riesgo_cero: string;
    urgencia: string;
    orden_nlp: string;
  };
  /** Fallback: texto plano del CTA cuando no hay layers separadas */
  text?: string;
  timing_seconds?: number;
}
