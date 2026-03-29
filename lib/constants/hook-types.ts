// Single source of truth for hook type labels and colors.
// Import from here — never redefine in components.

export const HOOK_TYPE_LABELS: Record<string, string> = {
  situacion_especifica: "Situación Específica",
  dato_concreto: "Dato Concreto",
  pregunta_incomoda: "Pregunta Incómoda",
  confesion: "Confesión",
  contraintuitivo: "Contraintuitivo",
  provocacion: "Provocación",
  historia_mini: "Historia Mini",
  analogia: "Analogía",
  negacion_directa: "Negación Directa",
  observacion_tendencia: "Tendencia",
  timeline_provocacion: "Timeline",
  contrato_compromiso: "Contrato",
  actuacion_dialogo: "Diálogo",
  anti_publico: "Anti-público",
  simplificacion_error: "Simplificación + Error",
  nadie_explica: "Nadie Explica",
  hipotetico_personal: "Hipotético Personal",
  identidad_dolor: "Identidad + Dolor",
  pregunta_limitacion: "Pregunta Limitación",
  asimetria_temporal: "Asimetría Temporal",
  // Legacy English types (for old data/references)
  curiosity_gap: "Curiosity Gap",
  contrarian: "Contrarian",
  question: "Pregunta",
  statistical: "Estadística",
  pain_point: "Pain Point",
  pattern_interrupt: "Pattern Interrupt",
  reveal_teaser: "Reveal / Teaser",
  authority_social_proof: "Social Proof",
};

export const HOOK_TYPE_COLORS: Record<string, string> = {
  situacion_especifica: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  dato_concreto: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pregunta_incomoda: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confesion: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  contraintuitivo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  provocacion: "bg-red-500/10 text-red-400 border-red-500/20",
  historia_mini: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  analogia: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  negacion_directa: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  observacion_tendencia: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  timeline_provocacion: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  contrato_compromiso: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  actuacion_dialogo: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  anti_publico: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  simplificacion_error: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  nadie_explica: "bg-red-500/10 text-red-300 border-red-500/20",
  hipotetico_personal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  identidad_dolor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  pregunta_limitacion: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  asimetria_temporal: "bg-lime-500/10 text-lime-300 border-lime-500/20",
  curiosity_gap: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  contrarian: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  question: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  statistical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pain_point: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pattern_interrupt: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reveal_teaser: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  authority_social_proof: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

// All known hook types for gap detection (coverage.ts uses this)
export const ALL_HOOK_TYPES = [
  "situacion_especifica", "dato_concreto", "pregunta_incomoda", "confesion",
  "contraintuitivo", "provocacion", "historia_mini", "analogia",
  "negacion_directa", "observacion_tendencia", "timeline_provocacion",
  "contrato_compromiso", "actuacion_dialogo", "anti_publico", "simplificacion_error",
  "nadie_explica", "hipotetico_personal", "identidad_dolor", "pregunta_limitacion", "asimetria_temporal",
];

// All angle families
export const ALL_ANGLE_FAMILIES = ["identidad", "oportunidad", "confrontacion", "mecanismo", "historia"];

// All body types
export const ALL_BODY_TYPES = [
  "demolicion_mito", "historia_con_giro", "demo_proceso", "comparacion_caminos",
  "un_dia_en_la_vida", "pregunta_respuesta", "analogia_extendida", "contraste_emocional",
  "demolicion_alternativas", "qa_conversacional",
];

// All segments
export const ALL_SEGMENTS = ["A", "B", "C", "D"];

// All funnels
export const ALL_FUNNELS = ["TOFU", "MOFU", "RETARGET"];

// All avatars (formal personas from avatares-adp.md)
export const ALL_AVATARS = ["patricia", "martin", "laura", "roberto", "valentina", "diego", "camila", "soledad"];

export const AVATAR_LABELS: Record<string, string> = {
  patricia: "Patricia (48, empleada estancada)",
  martin: "Martín (26, oficinista)",
  laura: "Laura (38, mamá)",
  roberto: "Roberto (62, jubilado)",
  valentina: "Valentina (32, freelancer)",
  diego: "Diego (44, escéptico)",
  camila: "Camila (29, inmigrante)",
  soledad: "Soledad (41, profesional)",
};

export const AVATAR_COLORS: Record<string, string> = {
  patricia: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  martin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  laura: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  roberto: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  valentina: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  diego: "bg-red-500/10 text-red-400 border-red-500/20",
  camila: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  soledad: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

// Avatar → segment mapping
export const AVATAR_SEGMENT_MAP: Record<string, string> = {
  patricia: "C",
  martin: "A",
  laura: "C",
  roberto: "D",
  valentina: "B",
  diego: "D",
  camila: "A",
  soledad: "B",
};

// Avatar → buyer weight (based on 562 real buyers data)
// Patricia(48)+Roberto(62) = 56% of buyers → must dominate
// Martín(26) = 5% → max 1 of 10 scripts
export const AVATAR_BUYER_WEIGHTS: Record<string, number> = {
  patricia: 0.26,
  roberto: 0.30,
  soledad: 0.15,
  diego: 0.12,
  valentina: 0.07,
  laura: 0.05,
  camila: 0.03,
  martin: 0.02,
};

// All awareness levels (Schwartz)
export const ALL_AWARENESS_LEVELS = [1, 2, 3, 4, 5];

export const AWARENESS_LABELS: Record<number, string> = {
  1: "Unaware",
  2: "Problem Aware",
  3: "Solution Aware",
  4: "Product Aware",
  5: "Most Aware",
};

export const AWARENESS_COLORS: Record<number, string> = {
  1: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  2: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  3: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  4: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  5: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

// Awareness level → channel routing (Schwartz rules from La Máquina de Ángulos)
// Niveles 1-2: NO van en ads directos — orgánico, retargeting, email
// Niveles 3-5: Ads directos con CTA
export const AWARENESS_CHANNEL_MAP: Record<number, string[]> = {
  1: ["organico", "retargeting", "email"],
  2: ["organico", "retargeting", "email"],
  3: ["ads_directos", "organico"],
  4: ["ads_directos", "retargeting"],
  5: ["ads_directos", "retargeting"],
};

// All emotional arcs (from reglas-diversidad.md)
export const ALL_EMOTIONAL_ARCS = [
  "revelacion_oportunidad",
  "dolor_esperanza",
  "confrontacion_directa",
  "historia_personal",
  "pregunta_tras_pregunta",
  "analogia",
  "futuro_sensorial",
  "provocacion_evidencia",
];

export const ARC_LABELS: Record<string, string> = {
  revelacion_oportunidad: "Revelación",
  dolor_esperanza: "Dolor→Esperanza",
  confrontacion_directa: "Confrontación",
  historia_personal: "Historia",
  pregunta_tras_pregunta: "Pregunta×Pregunta",
  analogia: "Analogía",
  futuro_sensorial: "Futuro Sensorial",
  provocacion_evidencia: "Provocación+Evidencia",
  sin_clasificar: "Sin clasificar",
};

export const ARC_COLORS: Record<string, string> = {
  revelacion_oportunidad: "bg-emerald-500",
  dolor_esperanza: "bg-rose-500",
  confrontacion_directa: "bg-red-500",
  historia_personal: "bg-purple-500",
  pregunta_tras_pregunta: "bg-sky-500",
  analogia: "bg-indigo-500",
  futuro_sensorial: "bg-amber-500",
  provocacion_evidencia: "bg-orange-500",
  sin_clasificar: "bg-zinc-600",
};

export const SEGMENT_LABELS: Record<string, string> = {
  A: "Jóvenes 22-32",
  B: "Freelancers/Emprend.",
  C: "Mamás 30-50",
  D: "Todos/+50",
};
