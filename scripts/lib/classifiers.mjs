/**
 * Clasificadores compartidos de patrones IG.
 *
 * Fuente única de verdad para classifyOpening, classifyBody, classifyClosing.
 * Usado por: ig-patterns.mjs, ig-cross-generations.mjs
 */

export function classifyOpening(text) {
  const lower = text.toLowerCase();
  const patterns = [];

  // Question
  if (/^\s*¿/.test(text) || /\?/.test(text.split(/[.!]/)[0] || "")) patterns.push("pregunta");

  // Number/stat lead
  if (/^\s*\d/.test(text) || /\$\d|\d+%|\d+\s*(mil|dólares|pesos|euros|seguidores|views|clientes)/.test(lower)) patterns.push("dato_numero");

  // Imperative / command
  if (/^(mirá|mira|escuchá|escucha|pará|para|dejá|deja|no\s+v[ou]elv)/i.test(text.trim())) patterns.push("imperativo");

  // Story / third person
  if (/(conocí|me pasó|había una|un tipo|una señora|un amigo|historia|cuando yo)/i.test(lower)) patterns.push("historia");

  // Provocative / contrarian
  if (/(mentira|nadie|nunca|imposible|no\s+funciona|no\s+existe|no\s+sirve|mierda|pelotud|basura)/i.test(lower)) patterns.push("provocacion");

  // "If" hypothetical
  if (/^(si\s+|imagin[aá]|supongamos|¿y si|pensá|piensa)/i.test(text.trim())) patterns.push("hipotetico");

  // Identity call-out
  if (/(si sos|si eres|si tenés|si tienes|si hacés|si haces|los que|la gente que|¿sos|¿eres)/i.test(lower)) patterns.push("identidad");

  // Credibility
  if (/(facturé|gané|vendí|logré|mis clientes|en\s+\d+\s+(años|meses|días)|millones?\s+de\s+dólares)/i.test(lower)) patterns.push("credencial");

  // List / framework
  if (/(tres\s+|3\s+|cinco\s+|5\s+|siete\s+|7\s+)(pasos|formas|razones|errores|tips|cosas|maneras|secretos)/i.test(lower)) patterns.push("lista_framework");

  // Leaked / exclusive
  if (/(se\s+acaba\s+de\s+filtrar|acaba\s+de\s+lanzar|nueva\s+función|exclusiv|secreto\s+que)/i.test(lower)) patterns.push("exclusividad");

  // Negative impossibility / "nobody does this"
  if (/(no\s+entiendo|cómo\s+todavía|nadie\s+te\s+dice|nadie\s+te\s+explica|nadie\s+habla)/i.test(lower)) patterns.push("incredulidad");

  // Price anchor inverted — "esto debería costar $X... pero gratis"
  if (/(gratis|free|sin\s+costo|no\s+te\s+cob|te\s+debería\s+cobrar|vale\s+\$?\d|cuesta\s+\$?\d|cobrar\s+\$?\d)/i.test(lower) && /^\s*(\$?\d|esto|lo\s+que|te\s+debería|normalmente)/i.test(text.trim())) {
    patterns.push("ancla_precio_invertida");
  }

  // Second person direct — "Vos que estás..." / "Tú que..."
  if (/^(vos\s+que|tu\s+que|tú\s+que|a\s+vos|te\s+cuento|te\s+voy)/i.test(text.trim())) patterns.push("segunda_persona");

  // Conditional identity — "Si a los 40 todavía no..."
  if (/si\s+(a\s+los\s+)?\d+\s+(años\s+)?(todavía|aún|ya|no\s+ten)/i.test(lower)) patterns.push("condicion_edad");

  // Personal story / vulnerability — "Yo también...", "Yo probé...", "Me pasó..."
  if (/^(yo\s+(también|probé|pagué|perdí|vendí|empecé|arranqué|hice|creé)|me\s+pasó|eran\s+las\s+\d)/i.test(text.trim())) patterns.push("storytelling_personal");

  // Anti-guru / pattern interrupt — "No te voy a prometer...", "Esto no es otro..."
  if (/(no\s+te\s+voy\s+a\s+(prometer|mentir|decir)|esto\s+no\s+es\s+otro|no\s+es\s+(un|una)\s+más|olvidate\s+de|basta\s+de)/i.test(lower)) patterns.push("anti_guru");

  // Accumulation / listing pain — "X. Y. Z." rapid-fire items
  const sentences = text.split(/[.!]/).filter(s => s.trim().length > 3);
  if (sentences.length >= 3 && sentences.slice(0, 4).every(s => s.trim().length < 60)) patterns.push("acumulacion");

  // Opportunity / trend spotting — "Cada vez más gente...", "Miles buscan..."
  if (/(cada\s+vez\s+más|miles\s+buscan|el\s+nicho\s+que|crece\s+\d|está\s+creciendo|boom\s+de|tendencia)/i.test(lower)) patterns.push("oportunidad_tendencia");

  // Negation series — "No necesitás X. No necesitás Y. No necesitás Z." / "Esto no es X. No es Y."
  const negations = (text.match(/\b(no\s+(necesitás|necesitas|es|tenés|tenes|hace\s+falta|requiere))\b/gi) || []).length;
  if (negations >= 2) patterns.push("negacion_en_serie");

  // Situation mirror — "Tenés/Hacés/Sabés + algo cotidiano" → te reconocés
  if (/^(tenés|tenes|hacés|haces|sabés|sabes|cocinás|cocinas|usás|usas|trabajás|trabajas|llegás|llegas)\s/i.test(text.trim())) patterns.push("espejo_situacion");

  // Cinematic scene — "Son las 10 de la noche. Los chicos durmieron." / "Mañana a las 7:05"
  if (/^(son\s+las\s+\d|mañana\s+a\s+las|es\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)|estoy\s+en\s+(la\s+cama|el\s+auto|la\s+oficina)|llegás\s+a\s+(tu\s+casa|la\s+oficina))/i.test(text.trim())) patterns.push("escena_cinematografica");

  // Emotional heritage — "Tu viejo/abuelo/familia sabía..." → nostalgia + pérdida
  if (/(tu\s+(viejo|vieja|abuelo|abuela|mamá|papá|padre|madre|vecina|cuñada|amiga)|mi\s+(abuelo|abuela|viejo|vieja))\s/i.test(lower)) patterns.push("herencia_emocional");

  // Paradox / counterintuitive — "Cuanto más X, menos Y" / "Suena raro pero..."
  if (/(cuanto\s+más.*menos|cuantos\s+más.*menos|suena\s+raro|parece\s+(raro|absurdo|ilógico|contradictorio))/i.test(lower)) patterns.push("paradoja");

  // Personal revelation — "Lo que te voy a contar...", "Yo no debería estar acá"
  if (/(lo\s+que\s+te\s+voy\s+a\s+contar|no\s+lo\s+cuento\s+mucho|no\s+debería\s+estar\s+acá|vos\s+me\s+ves\s+acá)/i.test(lower)) patterns.push("revelacion_personal");

  // Timeline / speed — "Día 1: X. Día 2: Y." / "En una hora tenía..."
  if (/(día\s+\d|en\s+una\s+hora|en\s+\d+\s+minutos?\s+(tenía|armó|creó|hizo)|antes\s+de\s+buscar)/i.test(lower)) patterns.push("timeline_rapido");

  // Hidden math — "Hacé esta cuenta", "Dividí tu sueldo", "La cuenta que no querés hacer"
  if (/(hacé\s+(esta\s+)?cuenta|dividí|agarrá\s+tu\s+sueldo|la\s+cuenta\s+que|cuánto\s+vale\s+tu\s+hora|es\s+matemática)/i.test(lower)) patterns.push("matematica_reveladora");

  // "Hay alguien que..." / injustice frame — someone worse is winning
  if (/(hay\s+(alguien|una?\s+persona|gente)|alguien\s+está\s+(ganando|vendiendo|cobrando))/i.test(lower) && /(mejor|peor|injust|menos\s+que\s+vos)/i.test(lower)) patterns.push("injusticia");

  if (patterns.length === 0) patterns.push("neutro");
  return patterns;
}

export function classifyBody(text) {
  const lower = text.toLowerCase();
  const patterns = [];

  // Pain/agitation
  const painWords = (lower.match(/(dolor|problem|sufr|frust|hart|cansa|miedo|angustia|estrés|ansiedad|bronca|enojo|rabia|jod|mierda)/g) || []).length;
  if (painWords >= 2) patterns.push("agitacion_fuerte");
  else if (painWords >= 1) patterns.push("agitacion_leve");

  // Social proof / case study
  if (/(un cliente|una alumna|un alumno|me escribió|me mandó|caso de|ejemplo real|me dijo)/i.test(lower)) patterns.push("caso_real");

  // Demo / process
  if (/(paso\s+\d|primero|segundo|tercero|abrís|abres|hacés|haces|click|vas a|entrás|entras|copias)/i.test(lower)) patterns.push("demo_proceso");

  // Math / numbers
  const numbers = (lower.match(/\$?\d+[\.\,]?\d*\s*(dólares|pesos|euros|usd|mil|k|mensual|diario|al\s+mes|al\s+día|por\s+día)/g) || []).length;
  if (numbers >= 2) patterns.push("matematica");

  // Objection handling
  if (/(pero\s+(vos|tú|usted)|la excusa|no\s+tengo\s+tiemp|no\s+sé|no\s+puedo|no\s+tengo\s+plata|no\s+me\s+animo|me\s+da\s+miedo)/i.test(lower)) patterns.push("demolicion_objecion");

  // Comparison / alternatives
  if (/(en\s+vez\s+de|en\s+lugar\s+de|mientras\s+otros|la\s+diferencia|por\s+un\s+lado|alternativa)/i.test(lower)) patterns.push("comparacion");

  // Analogy
  if (/(es\s+como|imaginate|¿viste\s+cuando|sería\s+como|igual\s+que)/i.test(lower)) patterns.push("analogia");

  // Future pacing
  if (/(imaginá|imagina|tu\s+vida|vas\s+a\s+poder|podrías|en\s+\d+\s+(días|meses|semanas))/i.test(lower)) patterns.push("future_pacing");

  // Authority / credibility
  if (/(mi\s+experiencia|en\s+\d+\s+años|cientos\s+de|miles\s+de|millones|factur[eéo])/i.test(lower)) patterns.push("autoridad");

  // Q&A / rapid fire
  const questions = (text.match(/\?/g) || []).length;
  if (questions >= 3) patterns.push("qa_rapido");

  // Tension / stakes
  if (/(lo\s+peor|lo\s+grave|peligro|riesgo|perder|perdés|pierdes|la\s+trampa|el\s+error)/i.test(lower)) patterns.push("tension");

  if (patterns.length === 0) patterns.push("narrativa_general");
  return patterns;
}

export function classifyClosing(text, caption) {
  const lower = text.toLowerCase();
  const captionLower = (caption || "").toLowerCase();
  const patterns = [];

  // CTA keyword detection (in video closing)
  if (/(comenta|comentá|escribí|escribe|dejame|dejá)\s/i.test(lower)) patterns.push("cta_video");

  // CTA in caption
  if (/(comenta|comentá|comment|escribí|escribe)\s/i.test(captionLower)) patterns.push("cta_caption");

  // Both = CTA doble
  if (patterns.includes("cta_video") && patterns.includes("cta_caption")) patterns.push("cta_doble");

  // Link in bio
  if (/(link|enlace|bio|descripción)/i.test(lower + " " + captionLower)) patterns.push("link_bio");

  // DM
  if (/\b(dm|mensaje|md|directo)\b/i.test(lower + " " + captionLower)) patterns.push("dm");

  // Summary / lesson wrap
  if (/(entonces|así que|en resumen|la lección|lo que aprendí|lo importante)/i.test(lower)) patterns.push("cierre_resumen");

  // Open loop / cliffhanger
  if (/(pero eso|en la parte|mañana|la semana que viene|próximo video|si querés saber)/i.test(lower)) patterns.push("open_loop");

  // Challenge / dare
  if (/(te reto|atreve|probá|proba esto|hacelo|hazlo)/i.test(lower)) patterns.push("desafio");

  // Future pacing
  if (/(imaginá|imagina|vas a|tu vida|en\s+\d+\s+días|dentro de)/i.test(lower)) patterns.push("future_pacing");

  // Reframe / perspective shift
  if (/(la pregunta no es|lo que importa|pensalo|piénsalo|la verdad es)/i.test(lower)) patterns.push("reframe");

  // Abrupt cut (short closing, no CTA structure)
  if (text.length < 40 && !patterns.some(p => p.startsWith("cta"))) patterns.push("corte_seco");

  if (patterns.length === 0) patterns.push("sin_cta");
  return patterns;
}
