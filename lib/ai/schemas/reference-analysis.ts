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
            "curiosity_gap",
            "contrarian",
            "question",
            "statistical",
            "pain_point",
            "pattern_interrupt",
            "reveal_teaser",
            "authority_social_proof",
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
          enum: ["AIDA", "PAS", "BAB", "Hook-Story-Offer", "3_Acts", "other"],
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
}
