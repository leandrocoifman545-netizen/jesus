export type HookType =
  | "curiosity_gap"
  | "contrarian"
  | "question"
  | "statistical"
  | "pain_point"
  | "pattern_interrupt"
  | "reveal_teaser"
  | "authority_social_proof";

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

export interface ScriptOutput {
  platform_adaptation: {
    platform: string;
    recommended_duration_seconds: number;
    content_style: string;
    key_considerations: string;
  };
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
  total_duration_seconds: number;
  word_count: number;
}
