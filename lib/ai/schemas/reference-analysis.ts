export const REFERENCE_ANALYSIS_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    hook: {
      type: "OBJECT" as const,
      properties: {
        text: { type: "STRING" as const },
        type: {
          type: "STRING" as const,
          enum: [
            "situacion_especifica",
            "dato_concreto",
            "pregunta_incomoda",
            "confesion",
            "contraintuitivo",
            "provocacion",
            "historia_mini",
            "analogia",
            "negacion_directa",
            "observacion_tendencia",
            "timeline_provocacion",
            "contrato_compromiso",
            "actuacion_dialogo",
            "anti_publico",
          ],
        },
        word_count: { type: "INTEGER" as const },
        estimated_seconds: { type: "NUMBER" as const },
      },
      required: ["text", "type", "word_count", "estimated_seconds"],
    },
    structure: {
      type: "OBJECT" as const,
      properties: {
        framework: {
          type: "STRING" as const,
          enum: ["AIDA", "PAS", "BAB", "Hook-Story-Offer", "3_Acts", "micro_vsl", "other"],
        },
        sections: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              summary: { type: "STRING" as const },
              estimated_seconds: { type: "NUMBER" as const },
            },
            required: ["name", "summary", "estimated_seconds"],
          },
        },
        has_rehook: { type: "BOOLEAN" as const },
        rehook_text: { type: "STRING" as const },
      },
      required: ["framework", "sections", "has_rehook"],
    },
    tone: {
      type: "OBJECT" as const,
      properties: {
        primary_tone: { type: "STRING" as const },
        formality_level: {
          type: "STRING" as const,
          enum: ["very_casual", "casual", "neutral", "formal", "very_formal"],
        },
        uses_first_person: { type: "BOOLEAN" as const },
        ugc_style: { type: "BOOLEAN" as const },
        humor_level: {
          type: "STRING" as const,
          enum: ["none", "light", "moderate", "heavy"],
        },
        key_phrases: {
          type: "ARRAY" as const,
          items: { type: "STRING" as const },
        },
      },
      required: ["primary_tone", "formality_level", "uses_first_person", "ugc_style", "humor_level", "key_phrases"],
    },
    cta: {
      type: "OBJECT" as const,
      properties: {
        text: { type: "STRING" as const },
        type: {
          type: "STRING" as const,
          enum: ["swipe_up", "link_bio", "comment", "shop_now", "learn_more", "download", "sign_up", "custom", "none"],
        },
        has_urgency: { type: "BOOLEAN" as const },
        has_reason_why: { type: "BOOLEAN" as const },
        is_dual: { type: "BOOLEAN" as const },
      },
      required: ["text", "type", "has_urgency", "has_reason_why", "is_dual"],
    },
    estimated_total_duration_seconds: { type: "NUMBER" as const },
    total_word_count: { type: "INTEGER" as const },
    emotional_arc: { type: "STRING" as const },
    strengths: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    patterns_to_replicate: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    advertiser: {
      type: "OBJECT" as const,
      properties: {
        name: { type: "STRING" as const },
        platform: { type: "STRING" as const },
        ranking_position: {
          type: "STRING" as const,
          enum: ["top_5", "top_10", "top_20", "unknown"],
        },
        language: { type: "STRING" as const },
        country: { type: "STRING" as const },
      },
    },
    generation_mapping: {
      type: "OBJECT" as const,
      properties: {
        angle_family: {
          type: "STRING" as const,
          enum: ["identidad", "oportunidad", "confrontacion", "mecanismo", "historia"],
        },
        body_type: {
          type: "STRING" as const,
          enum: [
            "demolicion_mito",
            "historia_con_giro",
            "demo_proceso",
            "comparacion_caminos",
            "un_dia_en_la_vida",
            "pregunta_respuesta",
            "analogia_extendida",
            "contraste_emocional",
            "demolicion_alternativas",
            "qa_conversacional",
          ],
        },
        persuasion_functions: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              section_name: { type: "STRING" as const },
              function: {
                type: "STRING" as const,
                enum: ["identificacion", "quiebre", "mecanismo", "demolicion", "prueba", "venta_modelo"],
              },
            },
          },
        },
        belief_change: {
          type: "OBJECT" as const,
          properties: {
            old_belief: { type: "STRING" as const },
            mechanism: { type: "STRING" as const },
            new_belief: { type: "STRING" as const },
          },
        },
        ingredients_detected: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              category: { type: "STRING" as const },
              ingredient_number: { type: "INTEGER" as const },
              ingredient_name: { type: "STRING" as const },
            },
          },
        },
        model_sale_type: { type: "STRING" as const },
        awareness_level: { type: "INTEGER" as const },
        segment_equivalent: {
          type: "STRING" as const,
          enum: ["A", "B", "C", "D"],
        },
        big_idea: { type: "STRING" as const },
      },
    },
    actionable: {
      type: "OBJECT" as const,
      properties: {
        what_to_steal: {
          type: "ARRAY" as const,
          items: { type: "STRING" as const },
        },
        what_not_to_copy: {
          type: "ARRAY" as const,
          items: { type: "STRING" as const },
        },
        craft_notes: {
          type: "ARRAY" as const,
          items: { type: "STRING" as const },
        },
      },
    },
  },
  required: [
    "hook",
    "structure",
    "tone",
    "cta",
    "estimated_total_duration_seconds",
    "total_word_count",
    "emotional_arc",
    "strengths",
    "patterns_to_replicate",
  ],
};

export interface ReferenceAnalysis {
  hook: {
    text: string;
    type: string;
    word_count: number;
    estimated_seconds: number;
  };
  structure: {
    framework: string;
    sections: { name: string; summary: string; estimated_seconds: number }[];
    has_rehook: boolean;
    rehook_text?: string;
  };
  tone: {
    primary_tone: string;
    formality_level: string;
    uses_first_person: boolean;
    ugc_style: boolean;
    humor_level: string;
    key_phrases: string[];
  };
  cta: {
    text: string;
    type: string;
    has_urgency: boolean;
    has_reason_why: boolean;
    is_dual: boolean;
  };
  estimated_total_duration_seconds: number;
  total_word_count: number;
  emotional_arc: string;
  strengths: string[];
  patterns_to_replicate: string[];
  advertiser?: {
    name: string;
    platform: string;
    ranking_position?: "top_5" | "top_10" | "top_20" | "unknown";
    language?: string;
    country?: string;
  };
  generation_mapping?: {
    angle_family?: "identidad" | "oportunidad" | "confrontacion" | "mecanismo" | "historia";
    body_type?: "demolicion_mito" | "historia_con_giro" | "demo_proceso" | "comparacion_caminos" | "un_dia_en_la_vida" | "pregunta_respuesta" | "analogia_extendida" | "contraste_emocional" | "demolicion_alternativas" | "qa_conversacional";
    persuasion_functions?: { section_name: string; function: string }[];
    belief_change?: { old_belief: string; mechanism: string; new_belief: string };
    ingredients_detected?: { category: string; ingredient_number: number; ingredient_name: string }[];
    model_sale_type?: string;
    awareness_level?: number;
    segment_equivalent?: "A" | "B" | "C" | "D";
    big_idea?: string;
  };
  actionable?: {
    what_to_steal: string[];
    what_not_to_copy: string[];
    craft_notes: string[];
  };
}
