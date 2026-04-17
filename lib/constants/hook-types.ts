// Single source of truth for hook type labels and colors.
// Import from here — never redefine in components.

export const HOOK_TYPE_LABELS: Record<string, string> = {
  // Active types — 1:1 with 15 formulas
  auto_seleccion_memoria: "Auto-selección",
  eliminacion_barreras: "Eliminación Barreras",
  promesa_directa: "Promesa Directa",
  pregunta_espejo: "Pregunta Espejo",
  incredulidad_posesiva: "Incredulidad",
  hipotetico_personal: "Hipotético Personal",
  flip_contraintuitivo: "Flip Contraintuitivo",
  nadie_explica: "Nadie Explica",
  ataque_herramienta: "Ataque Herramienta",
  ancla_precio_invertida: "Ancla Precio",
  historia_dolor_sensorial: "Historia Sensorial",
  voz_tercero: "Voz Tercero",
  timeline_proyeccion: "Timeline",
  nombrar_innombrado: "Nombrar Innombrado",
  provocacion_dato: "Provocación + Dato",
  // New formulas from competitor research (F16-F20)
  inmersion_segunda_persona: "Inmersión 2da Persona",
  anti_hype: "Anti-Hype",
  desculpabilizacion: "Desculpabilización",
  anti_consejo: "Anti-Consejo",
  pregunta_trampa_dual: "Pregunta Trampa",
  // Previous active types (now legacy)
  exclusividad_artificial: "Exclusividad",
  imperativo: "Imperativo",
  provocacion: "Provocación",
  dato_concreto: "Dato Concreto",
  pregunta: "Pregunta",
  credencial: "Credencial",
  historia_mini: "Historia Mini",
  identidad_dolor: "Identidad + Dolor",
  // Legacy types (backwards-compat — old generations still render)
  situacion_especifica: "Situación Específica",
  pregunta_incomoda: "Pregunta Incómoda",
  confesion: "Confesión",
  contraintuitivo: "Contraintuitivo",
  analogia: "Analogía",
  negacion_directa: "Negación Directa",
  observacion_tendencia: "Tendencia",
  timeline_provocacion: "Timeline",
  contrato_compromiso: "Contrato",
  actuacion_dialogo: "Diálogo",
  anti_publico: "Anti-público",
  simplificacion_error: "Simplificación + Error",
  pregunta_limitacion: "Pregunta Limitación",
  asimetria_temporal: "Asimetría Temporal",
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
  // Active types — 1:1 with 15 formulas
  auto_seleccion_memoria: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  eliminacion_barreras: "bg-green-500/10 text-green-400 border-green-500/20",
  promesa_directa: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  pregunta_espejo: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  incredulidad_posesiva: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  hipotetico_personal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  flip_contraintuitivo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  nadie_explica: "bg-red-500/10 text-red-300 border-red-500/20",
  ataque_herramienta: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ancla_precio_invertida: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  historia_dolor_sensorial: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  voz_tercero: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  timeline_proyeccion: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  nombrar_innombrado: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  provocacion_dato: "bg-red-500/10 text-red-400 border-red-500/20",
  // New formulas from competitor research (F16-F20)
  inmersion_segunda_persona: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  anti_hype: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  desculpabilizacion: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  anti_consejo: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  pregunta_trampa_dual: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  // Previous active types (now legacy)
  exclusividad_artificial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  imperativo: "bg-red-500/10 text-red-300 border-red-500/20",
  provocacion: "bg-red-500/10 text-red-400 border-red-500/20",
  dato_concreto: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pregunta: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  credencial: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  historia_mini: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  identidad_dolor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  // Legacy types (keep colors for old data rendering)
  situacion_especifica: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pregunta_incomoda: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confesion: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  contraintuitivo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  analogia: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  negacion_directa: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  observacion_tendencia: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  timeline_provocacion: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  contrato_compromiso: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  actuacion_dialogo: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  anti_publico: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  simplificacion_error: "bg-pink-500/10 text-pink-400 border-pink-500/20",
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

// Active hook types — 1:1 aligned with the 15 structural formulas in system.ts
// Each type = one formula. The model picks a type = uses that formula.
export const ALL_HOOK_TYPES = [
  // PROBADAS (CPL real de Meta Ads ADP)
  "auto_seleccion_memoria",    // F1: "Si hacés [NICHO] seguro ya te pasó" → $0.38 CPL
  "eliminacion_barreras",      // F2: "No importa si [OBJECIÓN]..." → $0.99 CPL
  "promesa_directa",           // F3: "[BENEFICIO] con [HERRAMIENTA]" → $1.31 CPL
  // HIPÓTESIS FUERTES (IG + cross-profile + patrones universales)
  "pregunta_espejo",           // F4: "¿[PREGUNTA INTERNA DEL AVATAR EN 1RA PERSONA]?"
  "incredulidad_posesiva",     // F5: "No entiendo cómo todavía no..."
  "hipotetico_personal",       // F6: "Si tuviera [EDAD], [LIMITACIÓN]..."
  "flip_contraintuitivo",      // F7: "El problema no es [OBVIO]. Es [CONTRARIO]"
  "nadie_explica",             // F8: "Todos te dicen X pero nadie explica CÓMO"
  "ataque_herramienta",        // F9: "Dejá de [ACCIÓN] con [HERRAMIENTA]"
  "ancla_precio_invertida",    // F10: "[MONTO ALTO] debería cobrar. Pero hoy..."
  "historia_dolor_sensorial",  // F11: "[SITUACIÓN VIVIDA CON DETALLE SENSORIAL]"
  "voz_tercero",               // F12: "[PERSONA CERCANA] dice algo que incomoda"
  "timeline_proyeccion",       // F13: "Hace [X] años por hobby. Hoy por plata..."
  "nombrar_innombrado",        // F14: "Eso se llama [NOMBRE PARA PATRÓN]"
  "provocacion_dato",          // F15: "[GASTO REAL]. Resultado: [MALO]"
  // NUEVAS — de investigación de competencia (Heras, Jaime, Tino, cross-profile)
  "inmersion_segunda_persona",  // F16: "Son las 8. Tu último paciente se fue..." (Heras 175% CLR)
  "anti_hype",                  // F17: "No es flashero. Es aburrido. Pero funciona." (cross-profile ~59% CLR)
  "desculpabilizacion",         // F18: "No es tu culpa. Nadie te lo explicó." (6/8 perfiles, axioma)
  "anti_consejo",               // F19: "Crear contenido de valor. Eso no vende." (Heras 59.77% CLR)
  "pregunta_trampa_dual",       // F20: "¿Usás X? Sí. ¿Ganás? No." (Tino 70%+ CLR)
] as const;

// Legacy hook types — kept for backwards-compat with old generations in the UI.
// The model no longer generates these, but they still render correctly.
export const LEGACY_HOOK_TYPES = [
  // Previous active types now replaced by formula-aligned types
  "exclusividad_artificial", "imperativo", "provocacion",
  "dato_concreto", "pregunta", "credencial", "historia_mini", "identidad_dolor",
  // Original legacy types
  "situacion_especifica", "pregunta_incomoda", "confesion", "contraintuitivo",
  "analogia", "negacion_directa", "observacion_tendencia", "timeline_provocacion",
  "contrato_compromiso", "actuacion_dialogo", "anti_publico", "simplificacion_error",
  "pregunta_limitacion", "asimetria_temporal",
  // English legacy
  "curiosity_gap", "contrarian", "question", "statistical",
  "pain_point", "pattern_interrupt", "reveal_teaser", "authority_social_proof",
] as const;

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
