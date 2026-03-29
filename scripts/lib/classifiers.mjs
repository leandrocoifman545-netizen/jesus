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
  if (/(mentira|nadie|nunca|imposible|no\s+funciona|no\s+existe|no\s+sirve|mierda|pelotud|basura|le\s+decís\s+a\s+tus)/i.test(lower)) patterns.push("provocacion");

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
  if (/^(tenés|tenes|hacés|haces|sabés|sabes|cocinás|cocinas|usás|usas|trabajás|trabajas|llegás|llegas|guardás|guardas|comprás|compras)\s/i.test(text.trim())) patterns.push("espejo_situacion");

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

  // Observación directa — "Abrís ChatGPT...", "Seguís comprando...", "Estás scrolleando..."
  // Describe lo que el avatar ESTÁ haciendo ahora mismo → identificación inmediata
  if (/^(abrís|abris|seguís|seguis|estás\s+scroll|estas\s+scroll|agarrás|agarras|entrás\s+a|entras\s+a|te\s+ponés|te\s+pones|le\s+pedís|le\s+decís)/i.test(text.trim())) patterns.push("observacion_directa");

  // Confesión temporal — "Tardé 5 años...", "Yo odiaba...", "Yo pensaba que..."
  // Experiencia personal con verbo en pasado, setup de transformación
  if (/^(yo\s+(odiaba|pensaba|tardé|tarde|sentía|sentia|creía|creia|tenía|tenia)|tardé|tarde\s+\d)/i.test(text.trim())) patterns.push("confesion_temporal");

  // Contraste/juxtaposición — "Tu jefe duerme... Vos no dormís" / "X gana... vos no"
  // Dos realidades opuestas en la misma apertura
  if (/(pero\s+vos\s+no|mientras\s+vos|y\s+vos\s+no|la\s+diferencia\s+no\s+es|vos\s+no\s+dorm)/i.test(lower)) patterns.push("contraste_juxtaposicion");

  // Diálogo/actuación — "—Jesús, ¿de verdad..." / formato pregunta-respuesta
  if (/^[-—–]/.test(text.trim()) || /^["""]/.test(text.trim())) patterns.push("dialogo_actuacion");

  // Promesa directa — "Te los voy a explicar...", "Te cuento cómo se hace"
  // Ofrece algo concreto al espectador como apertura
  if (/(te\s+(los\s+)?voy\s+a\s+(explicar|mostrar|enseñar|contar)|te\s+explico\s+(por\s+qué|cómo|en)|te\s+cuento\s+cómo|estos\s+son\s+los\s+\d)/i.test(lower)) patterns.push("promesa_directa");

  // Analogía abierta — "Sos como un médico que..." / "Es como si..."
  if (/^(sos\s+como|eres\s+como|es\s+como\s+si|esto\s+es\s+como)/i.test(text.trim())) patterns.push("analogia_abierta");

  // Contraintuitivo declarativo — "Las personas que menos saben..." / "Los nichos más aburridos..."
  // Patrón "Los/Las [sustantivo] que [más/menos/mejor/peor] X son los que Y"
  if (/^(las?\s+personas?\s+que\s+(más|menos|mejor|peor)|los?\s+nichos?\s+(más|menos)|la\s+persona\s+que\s+(más|menos))/i.test(text.trim())) patterns.push("contraintuitivo_declarativo");

  // Cita directa del avatar — "Vos mismo lo dijiste: '...'" / "'Me fuerzo y...'"
  if (/(vos\s+mismo|vos\s+misma|tú\s+mismo|tú\s+misma)\s+(lo\s+)?dij/i.test(lower) || /^['""''].+['""'']/.test(text.trim())) patterns.push("cita_avatar");

  // Acusación directa — "El modelo que estás siguiendo fue diseñado para..."
  if (/(fue\s+diseñad\w*|está\s+diseñad\w*|fue\s+hech\w*|está\s+hech\w*)\s+para\s+que/i.test(lower)) patterns.push("acusacion_directa");

  // Situación avatar narrativa — "Trabajaba de delivery...", "Hace dos semanas me llegó..."
  // Arranca contando una situación concreta de un tercero o escena sin ser historia clásica
  if (/^(trabajaba|hace\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(semanas?|meses?|días?|años?)\s|en\s+latam\s+hay|la\s+última\s+vez\s+que)/i.test(text.trim())) patterns.push("situacion_narrativa");

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

/**
 * Caption classifier — categorizes IG captions by function.
 * Returns array of detected types.
 */
export function classifyCaption(caption) {
  if (!caption || caption.trim().length === 0) return ["vacia"];
  const lower = caption.toLowerCase();
  const patterns = [];

  // Length classification
  const words = caption.split(/\s+/).filter(w => w.length > 0).length;
  if (words <= 10) patterns.push("corta");
  else if (words <= 30) patterns.push("media");
  else if (words <= 60) patterns.push("larga");
  else patterns.push("muy_larga");

  // CTA keyword inbound — "comenta X", "escribe X"
  if (/(comenta|comentá|escrib[eí]|comment)\s+["'""'']?\w/i.test(lower)) patterns.push("cta_keyword");

  // CTA generic — "comenta", "deja tu opinión" without specific keyword
  else if (/(comenta|comentá|escrib[eí]|comment|👇|⬇️|deja\s+tu)/i.test(lower) && !patterns.includes("cta_keyword")) patterns.push("cta_generico");

  // Link / bio CTA
  if (/(link\s+(en\s+)?(la\s+)?bio|enlace\s+en|bio\s+link)/i.test(lower)) patterns.push("link_bio");

  // DM CTA
  if (/(mensaje\s+directo|hablamos\s+por\s+mensaje|dm|por\s+mensaje|te\s+cuento\s+por)/i.test(lower)) patterns.push("dm_cta");

  // Second hook — caption opens with a new hook, not a summary
  if (/^(esta\s+es|así\s+(es|puedes)|el\s+(secreto|método|truco)|la\s+(verdad|razón)|lo\s+que\s+nadie|sab[eí]as\s+que)/i.test(lower.trim())) patterns.push("segundo_hook");

  // Summary / resumen del video
  if (/(en\s+este\s+video|en\s+este\s+reel|aquí\s+te|acá\s+te|te\s+(explico|cuento|muestro)\s+(cómo|como|por\s+qué))/i.test(lower)) patterns.push("resumen");

  // Storytelling — narrative caption
  if (/(me\s+pasó|historia|conocí|cuando\s+yo|hace\s+\d|un\s+día)/i.test(lower)) patterns.push("storytelling");

  // Question — asks the audience
  if (/\?/.test(caption.split('\n')[0] || "")) patterns.push("pregunta");

  // Hashtags
  const hashCount = (caption.match(/#\w/g) || []).length;
  if (hashCount > 5) patterns.push("hashtag_heavy");
  else if (hashCount > 0) patterns.push("hashtag_light");
  else patterns.push("sin_hashtags");

  // Emojis density
  const emojiCount = (caption.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 5) patterns.push("emoji_heavy");

  // Scarcity / urgency
  if (/(últim|solo\s+hoy|se\s+acaba|plazas?\s+limitad|cupos?\s+limitad|antes\s+de\s+que)/i.test(lower)) patterns.push("urgencia");

  // Social proof in caption
  if (/(clientes?|alumnos?|estudiantes?|personas?\s+ya|resultados)/i.test(lower) && /\d/.test(caption)) patterns.push("prueba_social");

  // Value promise
  if (/(gratis|gratuito|free|sin\s+costo|regalo)/i.test(lower)) patterns.push("promesa_gratis");

  if (patterns.length <= 1) patterns.push("minimalista"); // only length classification
  return patterns;
}
