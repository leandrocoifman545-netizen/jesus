/**
 * text-patterns.mjs — fuente única de los patrones textuales detectables.
 * Usado por:
 *   - scripts/check-big-idea.mjs (evalúa una candidata)
 *   - scripts/update-coverage.mjs (reporta saturación en la matriz)
 */

/**
 * FORBIDDEN_ANGLES — ángulos que ADP NUNCA puede usar (auto-sabotaje o bloqueo Meta).
 * Cualquier big idea que matchee uno de estos → verdict "forbidden" (más fuerte que "block").
 *
 * Fuente: feedback_reglas_escritura.md sección "Prohibiciones duras".
 */
export const FORBIDDEN_ANGLES = [
  {
    id: "anti_cursos_comportamiento",
    // Cualquier mención de "cursos" a <90 chars de palabra negativa
    // o "N cursos" con verbo de consumo ("hiciste/compraste/tenés/historial de")
    regex: /\bcursos?\b.{0,120}(\b(no|sin|ning[uú]n|ninguno|ninguna|nunca|jam[aá]s|tampoco)\s+(aplic|termin|funcion|monetiz|sirv|result|pas[oó]|hiciste|hicist)|f[aá]brica|humo|estafa|otro\s+m[aá]s|plata\s+tirada|perdist|gastast|vendieron|tirada)|((historial|pila|mont[oó]n|pila\s+de)\s+de?|hiciste|compraste|gastaste|probaste|viste|ten[eé]s|acumul[aá])\s+(\d+|varios|muchos|tantos|mil|un\s+mont[oó]n\s+de|pila\s+de)?\s*cursos?/i,
    reason: "ADP vende un curso. No se puede atacar el comportamiento de comprar cursos como eje del guion. Regla: feedback_reglas_escritura.md §3 'No atacar el comportamiento de comprar cursos'.",
  },
  {
    id: "dejá_de_comprar_cursos",
    regex: /(dej[aá]\s+de|pará\s+de|bastá\s+de)\s+(comprar|hacer|ver)\s+cursos/i,
    reason: "Contradicción directa con la oferta (ADP es un curso).",
  },
  {
    id: "promesa_plata_meta_bloquea",
    // (a) verbo + plata/dinero/ingresos; (b) número + moneda (2000 dólares, $5000 al mes)
    regex: /(ganar|generar|hacer|sacar|embolsar|llevarte)\s+(plata|dinero|pesos|d[oó]lares|ingresos|\$\s?\d+)|\$?\s?\d+[.,]?\d*\s?(d[oó]lares|usd|eur|pesos|k)\s*(al\s+mes|por\s+mes|mensual|mensuales|por\s+d[ií]a|diario|diarios|por\s+semana|semanal|semanales|cada\s+mes)/i,
    reason: "Meta bloquea promesas de plata. Reemplazar por estilo de vida / libertad / IA como gancho. Regla: feedback_reglas_escritura.md §3 'No promesas de plata'.",
  },
  {
    id: "kiosco_papa",
    regex: /kiosco\s+(del|de\s+mi)\s+(pap[aá]|viejo)/i,
    reason: "El kiosco del papá NO es parte del origin story. Es actual.",
  },
  {
    id: "enfermedades_como_nicho",
    regex: /\b(diabet|ansied|depresi[oó]n|c[aá]ncer|fibromialg|crohn|l[uú]pus|parkinson|alzheimer)\w*/i,
    reason: "No usar enfermedades como nicho. Usar decoración, organización, manualidades, etc.",
  },
  {
    id: "dato_interno_562",
    regex: /\b(562|8[.,]?074|971|9[.,]?441|22[.,]?819|535)\s+(compradores|leads|conversac|citas|se[ñn]ales)/i,
    reason: "Los datos internos (562 compradores / 8074 leads) NUNCA van en el copy.",
  },
];

export const PATTERN_PHRASES = [
  { id: "x_años_experiencia",    regex: /\b(\d+|veinte|treinta|cuarenta|diez|quince|veinticinco)\s+años\b/i, weight: 0.25 },
  { id: "empaqueto_algo",        regex: /\bempaquet[oóaeáéó]\w*/i, weight: 0.30 },
  { id: "cambias_horas_plata",   regex: /cambi[aá]s?\s+horas?\s+por\s+(plata|dinero|pesos)/i, weight: 0.35 },
  { id: "cada_mes_cero",         regex: /cada\s+mes.*(de\s+cero|otra\s+vez|cansad|arranc)/i, weight: 0.35 },
  { id: "sueldo_techo",          regex: /(sueldo|salario)\s+(no\s+alcanza|no\s+sube|con\s+techo|igual\s+que\s+hace)/i, weight: 0.30 },
  { id: "x_cursos_sin_resultado",regex: /\b(\d+|varios|muchos)\s+cursos?\b.*\b(no|sin|ningun)\s+(aplic|termin|funcion|monetiz|result)/i, weight: 0.40 },
  { id: "probaste_y_fallaste",   regex: /(ya\s+prob[eé]|intent[eé]|hiciste).*\bno\s+(funcion|sirvi|pas|result)/i, weight: 0.30 },
  { id: "boca_en_boca",          regex: /boca\s+en\s+boca/i, weight: 0.25 },
  { id: "abris_chatgpt",         regex: /abr[ií]s\s+chat\s?gpt/i, weight: 0.25 },
  { id: "regalas_vale_plata",    regex: /(regal[aá]s|gratis|por\s+whatsapp).*(vale|pag[aá]n?|cobr[aá]n?)\s+(plata|dinero|monedas)/i, weight: 0.30 },
  { id: "haces_gratis_otros_pagan", regex: /(hac[eé]s|regal[aá]s)\s+gratis|gratis.*pag(a|án)|vendiendo\s+lo\s+que\s+vos/i, weight: 0.35 },
  { id: "en_el_cuaderno",        regex: /(en\s+el\s+cuaderno|recetas\s+en\s+el|el\s+mate\s+y\s+la\s+gu[ií]a)/i, weight: 0.25 },
  { id: "diplomas_cobras_igual", regex: /\d+\s+diplomas?.*cobr[aá]s/i, weight: 0.30 },
  { id: "cobras_monedas",        regex: /cobr[aá]s?\s+(poco|monedas|por\s+hora|una\s+miseria|un\s+sueldo)/i, weight: 0.30 },
  { id: "nadie_valora",          regex: /nadie\s+(valora|sabe)\s+lo\s+que\s+hac[eé]s/i, weight: 0.30 },
  { id: "pie_x_horas",           regex: /(de\s+pie|parad[ao])\s+\d+\s+horas?/i, weight: 0.25 },
  { id: "familia_estafa",        regex: /(novi[oa]|familia|pareja|mari)\s+(dice|piensa|cree).*estaf/i, weight: 0.30 },
  { id: "metodo_adentro",        regex: /tenés?\s+un?\s+(m[eé]todo|libro|manual|sistema)\s+(adentro|dentro)/i, weight: 0.35 },
  { id: "ia_pone_en_papel",      regex: /(ia|inteligencia)\s+.*(pone|arma|convierte|saca).*(papel|producto|guía|ebook)/i, weight: 0.25 },
  { id: "persona_edad_tecnologia",regex: /(\d+|cincuenta|sesenta|setenta)\s+años,?\s+(0|cero|sin)\s+(tecnolog|computad)/i, weight: 0.35 },
  { id: "uber_horas_poco",       regex: /(uber|delivery|rappi|pedidos\s?ya).*(\d+\s+horas?|queden\s+\$)/i, weight: 0.30 },
  { id: "peluqu_estetica_horas", regex: /(peluquer|estetic|manicur).*(\d+\s+horas?|pie)/i, weight: 0.30 },
];

export const STOPWORDS = new Set([
  "de","la","el","en","y","a","los","del","las","un","por","con","no","una","su",
  "para","es","al","lo","como","más","o","pero","sus","le","ya","que","este","sí",
  "porque","esta","entre","cuando","muy","sin","sobre","también","me","hasta","hay",
  "donde","quien","desde","todo","nos","durante","todos","uno","les","ni","contra",
  "otros","ese","eso","había","ante","ellos","e","esto","mí","antes","algunos",
  "qué","unos","yo","otro","otras","otra","él","tanto","esa","estos","mucho","cosa",
  "así","cada","bien","sólo","solo","gran","unos","unas","hace","hacer","hacés",
  "sabes","sabés","tenés","tiene","tener","sos","son","voy","vas","va","decir",
  "vos","mi","mis","tus","tu","me","te","lo","se","sé","son","soy","eres",
]);

export function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchedPatterns(text) {
  const out = [];
  for (const p of PATTERN_PHRASES) if (p.regex.test(text || "")) out.push(p);
  return out;
}

export function matchedForbidden(text) {
  const out = [];
  for (const p of FORBIDDEN_ANGLES) if (p.regex.test(text || "")) out.push(p);
  return out;
}
