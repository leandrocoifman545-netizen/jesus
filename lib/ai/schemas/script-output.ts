export type HookType =
  | "curiosity_gap"
  | "contrarian"
  | "question"
  | "statistical"
  | "pain_point"
  | "pattern_interrupt"
  | "reveal_teaser"
  | "authority_social_proof"
  | "situacion_especifica"
  | "dato_concreto"
  | "pregunta_incomoda"
  | "confesion"
  | "contraintuitivo"
  | "provocacion"
  | "historia_mini"
  | "analogia"
  | "negacion_directa"
  | "observacion_tendencia"
  | "timeline_provocacion"
  | "contrato_compromiso"
  | "actuacion_dialogo"
  | "anti_publico";

export type CTAType =
  | "swipe_up"
  | "link_bio"
  | "comment"
  | "shop_now"
  | "learn_more"
  | "download"
  | "sign_up"
  | "custom";

export interface Hook {
  variant_number: number;
  hook_type: HookType;
  script_text: string;
  timing_seconds: number;
}

export interface DevelopmentSection {
  section_name: string;
  is_rehook?: boolean;
  script_text: string;
  timing_seconds: number;
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
  /** Ingredientes de la enciclopedia usados en este guion (categorías A-K) */
  ingredients_used?: IngredientUsed[];
  total_duration_seconds: number;
  word_count: number;
}
