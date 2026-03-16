#!/usr/bin/env node
import { randomUUID } from "crypto";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", ".data");
const BRIEFS_DIR = join(DATA_DIR, "briefs");
const GENERATIONS_DIR = join(DATA_DIR, "generations");
[DATA_DIR, BRIEFS_DIR, GENERATIONS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

const ctaBlocks = [
  {
    channel: "clase_gratuita", channel_label: "Clase Gratuita", variant: "C",
    layers: {
      oferta: "En 2 horas te muestro cómo encontrar algo que la gente quiere comprar, cómo crearlo con IA y cómo empezar a venderlo. Sin experiencia. Sin saber de tecnología. Desde tu celular.",
      prueba: "Lo hicieron mamás, jubilados, pibes de 20, gente que nunca vendió nada. Todos empezaron de cero.",
      riesgo_cero: "Es una clase gratis. Si no te sirve, no perdiste nada. Pero si te sirve, te puede cambiar todo.",
      urgencia: "Ya hay cientos de personas registradas para esta edición.",
      orden_nlp: "Cuando toques el botón de acá abajo y entres, vas a entender por qué miles ya lo hicieron. Te espero."
    }, timing_seconds: 18
  },
  {
    channel: "taller_5", channel_label: "Taller $5", variant: "B",
    layers: {
      oferta: "En 3 días en vivo creás tu producto digital con IA, armás tu anuncio y hacés tu primera venta. Todo con acompañamiento.",
      prueba: "Un albañil de Tucumán, una jubilada de 63 años, una mamá de 3 hijos. Todos lo hicieron.",
      riesgo_cero: "Si no te sirve, perdiste 5 dólares y 3 tardes. Menos de lo que gastás en datos del celular. Si te sirve, te cambia la vida.",
      urgencia: "Cada día que no tenés tu producto en venta son ventas que alguien más está haciendo con el conocimiento que vos tenés.",
      orden_nlp: "Tocá el botón de acá abajo y anotate. Te espero el primer día."
    }, timing_seconds: 20
  },
  {
    channel: "instagram", channel_label: "Instagram", variant: "D",
    layers: {
      oferta: "Tengo una clase gratis donde te enseño a crear un producto digital con IA y empezar a venderlo.",
      prueba: "Miles ya lo hicieron.",
      riesgo_cero: "No te voy a vender nada. Es gratis.",
      urgencia: "Si solo querés scrollear, seguí de largo.",
      orden_nlp: "Pero si querés hacer algo, comentá 'IA' y andá al link de mi perfil. Te espero."
    }, timing_seconds: 15
  }
];

const vf_split = { format_name: "Split Screen 2 Pantallas", difficulty_level: 2, setup_instructions: "Arriba: screencast o imagen. Abajo: Jesús hablando. Editar con CapCut.", recording_notes: "Grabar parte de abajo mirando a cámara. La parte de arriba se agrega en edición." };
const vf_car = { format_name: "Car Selfie", difficulty_level: 1, setup_instructions: "Desde el auto, cámara frontal en el parabrisas o sostenida. Fondo real del auto.", recording_notes: "Estilo casual, como contándole a un amigo. Energía natural, no actuada." };

const scripts = [
  // G1
  {
    title: "La IA no te va a reemplazar, pero el que la use sí",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "provocacion", script_text: "Pasás 2 horas por día pidiéndole a la IA memes, recetas y resúmenes de videos. Mientras tanto, hay gente usando la misma herramienta para generar ingresos. La diferencia no es la IA — es lo que le pedís.", estimated_duration_seconds: 9 },
        { variant_number: 2, hook_type: "confesion", script_text: "Yo antes también usaba la IA para boludeces. Chistes, traducciones, resúmenes de libros. Hasta que entendí que la misma herramienta que me hacía reír podía hacerme facturar. Te cuento qué cambié.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "contraintuitivo", script_text: "La gente que menos sabe de tecnología es la que mejor le está yendo con productos digitales. ¿Sabés por qué? No se complica. Le pide a la IA algo simple, lo empaqueta y lo vende. Sin filtros, sin excusas.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "pregunta_incomoda", script_text: "¿Cuántas horas por semana le dedicás a ChatGPT para cosas que no te dejan un peso? ¿Y si esas mismas horas las usaras para armar algo que se vende? No te estoy juzgando — me pasaba lo mismo.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "observacion_tendencia", script_text: "Hay una brecha que se agranda cada día: los que usan IA para consumir y los que la usan para crear. Los primeros pierden tiempo. Los segundos generan ingresos. Estás eligiendo un lado sin darte cuenta.", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Demolición de mito",
        sections: [
          { section_name: "Creencia vieja", script_text: "La mayoría piensa que la IA es para el laburo o para entretenerse. Le pedís que te resuma un artículo, que te arme un mail, que te cuente un chiste. Y listo. Pero eso es como tener un auto y usarlo solo para ir al kiosco de la esquina.", timing_seconds: 15, is_rehook: false },
          { section_name: "Re-hook", script_text: "Y acá es donde se pone interesante.", timing_seconds: 3, is_rehook: true },
          { section_name: "Evidencia — nicho skincare", script_text: "Hay una mina que sabía de skincare casero. Nada profesional — cremas, tónicos, rutinas que armaba para ella. Le pidió a la IA que organizara todo lo que sabía en una guía de 30 páginas. Le llevó una tarde. La subió a Hotmart por 15 dólares. En el primer mes vendió 80 copias. Con publicidad de 3 dólares por día.", timing_seconds: 20, is_rehook: false },
          { section_name: "Creencia nueva — mecanismo", script_text: "Ella no inventó nada. Organizó lo que ya sabía. La IA escribió, diseñó y estructuró. Ella solo le pidió. Tres pasos: investigás qué se vende, la IA te lo crea, lo vendés por WhatsApp.", timing_seconds: 15, is_rehook: false },
          { section_name: "Venta del modelo — Ventana de oportunidad", script_text: "Esto no existía hace 2 años. La IA cambió todo. Hoy cualquier persona con un celular y WhatsApp puede crear un producto digital y empezar a venderlo en días. Pero esta ventana no va a durar para siempre.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Confrontación → curiosidad → revelación → urgencia"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 80, word_count: 185,
      visual_format: vf_split,
      angle_family: "confrontacion", angle_specific: "3.2_consumidor_vs_creador",
      body_type: "demolicion_mito", segment: "A", funnel_stage: "TOFU",
      niche: "belleza y skincare casero",
      model_sale_type: "ventana_de_oportunidad",
      belief_change: { old_belief: "La IA es para entretenerse o para el trabajo, no para ganar plata", mechanism: "La misma IA que usás para boludeces crea un producto digital vendible", new_belief: "La IA es una herramienta de ingresos que ya tengo en el celular" },
      ingredients_used: [
        { category: "A", ingredient_number: 3, ingredient_name: "Contrariano / Anti-Gurú" },
        { category: "B", ingredient_number: 28, ingredient_name: "Dolor Silencioso" },
        { category: "C", ingredient_number: 40, ingredient_name: "Costo de la Inacción" },
        { category: "F", ingredient_number: 71, ingredient_name: "Proceso de N Pasos" },
        { category: "G", ingredient_number: 89, ingredient_name: "Prueba por Volumen" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo que te mostré con la guía de skincare es solo UNO de los productos que podés crear.",
      cta_blocks: ctaBlocks
    }
  },
  // G2
  {
    title: "Tu vecina gana plata mientras duerme",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "situacion_especifica", script_text: "Son las 11 de la noche. Acabás de mandar 15 currículums. Ninguno te contestó. Abrís el celular y ves que una vecina tuya vendió 3 guías de costura mientras cenaba. Con la misma IA que vos usás para pedir recetas.", estimated_duration_seconds: 10 },
        { variant_number: 2, hook_type: "negacion_directa", script_text: "No necesitás un título. No necesitás experiencia en ventas. No necesitás saber de tecnología. Lo único que necesitás es saber hacer algo con las manos que otra persona quiera aprender.", estimated_duration_seconds: 8 },
        { variant_number: 3, hook_type: "historia_mini", script_text: "Una señora de Córdoba cosía ropa para el barrio. Cobraba 2 mil pesos el arreglo. Un día le pidió a la IA que armara una guía con todos sus trucos. La vendió a 10 dólares. En 3 semanas ganó más que en 2 meses cosiendo.", estimated_duration_seconds: 10 },
        { variant_number: 4, hook_type: "analogia", script_text: "¿Viste cuando tu abuela te enseñaba a coser un botón y vos pensabas 'esto no me sirve para nada'? Bueno, hoy hay miles de personas pagando por aprender exactamente eso. En formato digital. Creado con IA.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "contrato_compromiso", script_text: "Si sabés coser, tejer, bordar o arreglar ropa — cualquier cosa con las manos — ya tenés un negocio digital esperándote. Solo necesitás 1 tarde y un celular. Te lo demuestro.", estimated_duration_seconds: 8 }
      ],
      development: {
        framework_used: "Contraste emocional fuerte",
        sections: [
          { section_name: "Momento oscuro", script_text: "Estás sin laburo. O con un laburo que no te da para nada. Mandás currículums todos los días y nadie te contesta. Cada mes se achica más el margen. Y lo peor no es la plata — es la sensación de que no tenés nada para ofrecer.", timing_seconds: 15, is_rehook: false },
          { section_name: "Re-hook", script_text: "Pero lo que no sabías era esto.", timing_seconds: 3, is_rehook: true },
          { section_name: "Pivote — Hasta que...", script_text: "Todo lo que aprendiste en tu vida — coser, tejer, arreglar ropa, hacer manualidades — tiene un valor que no estás viendo. Hay miles de personas buscando en Google \"cómo arreglar un cierre\" o \"cómo achicar un pantalón\". Y casi nadie vende una guía que lo explique bien.", timing_seconds: 18, is_rehook: false },
          { section_name: "Momento de luz — mecanismo", script_text: "Le pedís a la IA que organice todo lo que sabés en una guía paso a paso. Le llevás una tarde. La subís a una plataforma. Y la vendés por WhatsApp, con un anuncio de 3 dólares por día. Sin mostrar tu cara. Sin seguidores. Sin saber de tecnología.", timing_seconds: 18, is_rehook: false },
          { section_name: "Venta del modelo — Eliminación de barreras", script_text: "No necesitás invertir miles de pesos. No necesitás un local ni empleados. La IA hace el trabajo pesado — vos solo tenés que saber pedirle. Y eso se aprende en un día.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Desesperanza → revelación → esperanza concreta"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 80, word_count: 195,
      visual_format: vf_car,
      angle_family: "identidad", angle_specific: "1.3_desempleado_crisis",
      body_type: "contraste_emocional", segment: "D", funnel_stage: "TOFU",
      niche: "costura y arreglos de ropa",
      model_sale_type: "eliminacion_de_barreras",
      belief_change: { old_belief: "No tengo nada que ofrecer, no tengo estudios ni experiencia", mechanism: "Las habilidades manuales cotidianas tienen demanda digital real", new_belief: "Lo que sé hacer con las manos vale plata en internet" },
      ingredients_used: [
        { category: "A", ingredient_number: 4, ingredient_name: "Historia Personal / Confesional" },
        { category: "B", ingredient_number: 24, ingredient_name: "Situación Específica de Dolor" },
        { category: "C", ingredient_number: 47, ingredient_name: "Contraste Emocional" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "G", ingredient_number: 85, ingredient_name: "Testimonio Diverso" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo de costura es solo un ejemplo. Hay gente haciendo lo mismo con cocina, con jardinería, con fitness.",
      cta_blocks: ctaBlocks
    }
  },
  // G3
  {
    title: "Lo que no te cuentan de los cursos online",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "pregunta_incomoda", script_text: "¿Cuántos cursos compraste que no terminaste? ¿Cuántas veces dijiste 'esta vez sí' y a la semana lo dejaste? El problema no sos vos. El problema es lo que te están vendiendo.", estimated_duration_seconds: 9 },
        { variant_number: 2, hook_type: "provocacion", script_text: "La industria de los cursos online está diseñada para que sigas comprando. No para que hagas algo. Te dan información, no un camino. Y vos seguís en el mismo loop.", estimated_duration_seconds: 8 },
        { variant_number: 3, hook_type: "dato_concreto", script_text: "De cada 100 personas que compran un curso online, 87 no lo terminan. Y de las 13 que sí, menos de 3 aplican algo. No es un problema de motivación. Es un problema de estructura.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "confesion", script_text: "Yo compré todo. Cada curso que me prometía resultados. Pagué todo. Y no fue el camino fácil. Hasta que entendí que el problema no era la cantidad de información sino la falta de acción.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "simplificacion_error", script_text: "Aprender a generar ingresos online tiene 3 pasos. El error del 90% es quedarse eternamente en el paso 1: consumir información. Sin pasar nunca al paso 2: crear algo.", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Pregunta y respuesta",
        sections: [
          { section_name: "P1 — ¿Necesito saber programar?", script_text: "\"¿Necesito saber programar?\" No. \"¿Necesito diseñar?\" Tampoco. La IA hace eso por vos. Lo único que necesitás es saber qué pedirle.", timing_seconds: 10, is_rehook: false },
          { section_name: "Re-hook", script_text: "Pero acá viene lo distinto.", timing_seconds: 3, is_rehook: true },
          { section_name: "P2 — ¿Cuánta plata necesito?", script_text: "\"¿Cuánta plata necesito para arrancar?\" 10 dólares. 5 para el taller, 5 para tu primer anuncio. Menos de lo que gastás en datos del celular por mes.", timing_seconds: 10, is_rehook: false },
          { section_name: "P3 — ¿Cuánto tardo?", script_text: "\"¿Cuánto tardo en tener algo listo?\" Un fin de semana. No 6 meses, no un año. Un sábado y un domingo con la IA abierta.", timing_seconds: 10, is_rehook: false },
          { section_name: "P4 — ¿Por qué esto es distinto?", script_text: "\"¿Y por qué esto sería distinto a los otros 10 cursos que compré?\" Porque acá vendés ANTES de crear. No invertís meses en algo que nadie quiere. Validás primero, creás después. Así no perdés ni tiempo ni plata.", timing_seconds: 15, is_rehook: false },
          { section_name: "Venta del modelo — Transparencia total", script_text: "Te voy a ser honesto. Yo no gano con el taller. Gano cuando a vos te va bien y querés seguir aprendiendo. Sin letra chica. Sin promesas de millones. Un proceso real.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Frustración reconocida → preguntas resueltas → confianza"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 75, word_count: 175,
      visual_format: vf_split,
      angle_family: "confrontacion", angle_specific: "3.3_ciclo_roto",
      body_type: "pregunta_respuesta", segment: "B", funnel_stage: "MOFU",
      niche: "general — anti-curso",
      model_sale_type: "transparencia_total",
      belief_change: { old_belief: "Necesito otro curso más para aprender", mechanism: "El problema no es la información sino la falta de un camino con acción inmediata", new_belief: "Necesito UN camino claro con acción desde el día 1, no más información" },
      ingredients_used: [
        { category: "A", ingredient_number: 2, ingredient_name: "Pregunta Retórica de Dolor" },
        { category: "B", ingredient_number: 30, ingredient_name: "Patrón de Fracaso" },
        { category: "D", ingredient_number: 53, ingredient_name: "El Permiso" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "G", ingredient_number: 90, ingredient_name: "Persona Improbable" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Todo lo que te acabo de contestar lo enseño paso a paso en una clase.",
      cta_blocks: ctaBlocks
    }
  },
  // G4
  {
    title: "Un profesor de yoga vendió 400 rutinas",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "historia_mini", script_text: "Un profesor de yoga daba 4 clases por día. Ganaba bien pero si no iba, no cobraba. Un día grabó sus rutinas, le pidió a la IA que las organice en un programa y las subió por 12 dólares. Vendió 400 en dos meses.", estimated_duration_seconds: 10 },
        { variant_number: 2, hook_type: "situacion_especifica", script_text: "Si sos profe de algo — yoga, pilates, guitarra, lo que sea — estás cambiando tu tiempo por plata todos los días. Si un día no vas, no cobrás. Hay una forma de que tu conocimiento trabaje sin que vos estés.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "contraintuitivo", script_text: "Los profes de yoga que peor la pasan son los más apasionados. Porque dan más clases, cobran menos por hora y no les queda tiempo para nada. El que encontró la salida no dio MÁS clases — empaquetó lo que ya sabía.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "dato_concreto", script_text: "\"Rutinas de yoga en casa\" tiene 40 mil búsquedas por mes en Google en español. Y casi nadie vende un programa completo. Los que lo hacen, facturan más que dando clases 8 horas por día.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "provocacion", script_text: "Hay profes de yoga ganando más vendiendo una guía digital que dando 30 clases por semana. Y no es porque sean mejores — es porque entendieron algo que la mayoría no quiere ver.", estimated_duration_seconds: 8 }
      ],
      development: {
        framework_used: "Historia con giro",
        sections: [
          { section_name: "Situación inicial", script_text: "Martín daba 4 clases de yoga por día. Lunes a sábado. Ganaba bien, pero si se enfermaba o se iba de vacaciones, no entraba un peso. Cada mes arrancaba de cero.", timing_seconds: 12, is_rehook: false },
          { section_name: "Re-hook", script_text: "Hasta que un día se cansó de ese modelo.", timing_seconds: 3, is_rehook: true },
          { section_name: "Complicación", script_text: "Le preguntó a la IA: \"Organizame un programa de yoga de 30 días para principiantes\". En 2 horas tenía el programa completo. Lo empaquetó como guía digital con videos cortos que ya tenía grabados del celular.", timing_seconds: 15, is_rehook: false },
          { section_name: "Giro inesperado", script_text: "Lo subió a Hotmart por 12 dólares. Puso un anuncio de 5 dólares por día. Al primer mes vendió 140 copias. Al segundo, 400. Hoy gana más con la guía que dando clases. Y sigue dando clases — porque quiere, no porque necesita.", timing_seconds: 18, is_rehook: false },
          { section_name: "Venta del modelo — Prueba por diversidad", script_text: "Martín no es un caso aislado. Mamás que venden rutinas de crianza. Nutricionistas que venden planes alimentarios. Mecánicos que venden guías de mantenimiento. Todos empezaron de cero con la IA.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Empatía → curiosidad → asombro → inspiración"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 75, word_count: 190,
      visual_format: vf_car,
      angle_family: "historia", angle_specific: "5.2_historia_alumno",
      body_type: "historia_con_giro", segment: "C", funnel_stage: "TOFU",
      niche: "yoga y meditación",
      model_sale_type: "prueba_por_diversidad",
      belief_change: { old_belief: "Para ganar más tengo que dar más clases y trabajar más horas", mechanism: "Empaquetar conocimiento en producto digital que se vende solo", new_belief: "Mi conocimiento puede generar ingresos sin que yo esté presente" },
      ingredients_used: [
        { category: "A", ingredient_number: 4, ingredient_name: "Historia Personal" },
        { category: "B", ingredient_number: 25, ingredient_name: "Techo de Ingresos" },
        { category: "E", ingredient_number: 62, ingredient_name: "Caso de Estudio" },
        { category: "F", ingredient_number: 71, ingredient_name: "Proceso de N Pasos" },
        { category: "G", ingredient_number: 85, ingredient_name: "Testimonio Diverso" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo que hizo Martín con yoga es solo uno de los caminos que te puedo mostrar.",
      cta_blocks: ctaBlocks
    }
  },
  // G5
  {
    title: "¿Sabías que hay gente pagando por esto?",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "dato_concreto", script_text: "\"Cómo arreglar una canilla\" tiene 22 mil búsquedas por mes en Google. \"Cómo cambiar un cuerito\" tiene 12 mil. Y casi nadie vende una guía que lo explique bien. Eso es un negocio esperando.", estimated_duration_seconds: 10 },
        { variant_number: 2, hook_type: "provocacion", script_text: "Tu viejo sabe arreglar más cosas en la casa que el 90% de los tutoriales de YouTube. Pero él cobra por hora y los de YouTube cobran por millón de views. Hay un tercer camino que ninguno de los dos conoce.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "situacion_especifica", script_text: "Cada vez que se te rompe algo en la casa, abrís YouTube y buscás cómo arreglarlo. Si vos lo hacés, hay millones de personas haciendo lo mismo. Y la mayoría pagaría por una guía clara que le ahorre 3 horas de videos.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "contraintuitivo", script_text: "Las personas que más saben de reparaciones del hogar son las que menos ganan con ese conocimiento. Porque lo regalan gratis en el barrio. Mientras tanto, un pibe de 22 años que nunca agarró un destornillador vende guías de bricolaje con IA.", estimated_duration_seconds: 10 },
        { variant_number: 5, hook_type: "timeline_provocacion", script_text: "Día 1: le pedís a la IA que te arme una guía de reparaciones básicas del hogar. Día 2: la editás con lo que vos sabés. Día 3: la subís a Hotmart por 10 dólares. Día 7: ya tenés ventas. Sin mostrar tu cara.", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Demo/Proceso paso a paso",
        sections: [
          { section_name: "Mirá, te muestro", script_text: "Te voy a mostrar algo. Abrís Google y escribís \"cómo arreglar canilla que gotea\". 22 mil personas buscan eso por mes. Solo en español. Ahora buscá \"guía de reparaciones del hogar\" — casi no hay resultados pagos. Eso significa que hay demanda y no hay oferta.", timing_seconds: 15, is_rehook: false },
          { section_name: "Re-hook", script_text: "Ahora mirá lo que podés hacer con eso.", timing_seconds: 3, is_rehook: true },
          { section_name: "Paso 1 — Investigar", script_text: "Le pedís a la IA que te liste las 20 reparaciones del hogar más buscadas. En 2 minutos tenés la lista.", timing_seconds: 8, is_rehook: false },
          { section_name: "Paso 2 — Crear", script_text: "Le decís: \"Armame una guía paso a paso para cada reparación, con herramientas necesarias y nivel de dificultad\". En una hora tenés un producto de 40 páginas.", timing_seconds: 12, is_rehook: false },
          { section_name: "Paso 3 — Vender", script_text: "Lo subís a Hotmart por 10 dólares. Ponés un anuncio de 3 dólares por día apuntado a hombres de 30-55 que buscan reparaciones. Y la gente te escribe por WhatsApp para comprarlo.", timing_seconds: 12, is_rehook: false },
          { section_name: "Venta del modelo — Matemática simple", script_text: "Hacé la cuenta. 3 dólares por día en publicidad. 2-3 ventas de 10 dólares. Te queda ganancia desde el primer día. Ahora multiplicá eso por 30 días.", timing_seconds: 10, is_rehook: false }
        ],
        emotional_arc: "Descubrimiento → demostración → claridad → acción"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 75, word_count: 195,
      visual_format: vf_split,
      angle_family: "oportunidad", angle_specific: "2.3_nicho_invisible",
      body_type: "demo_proceso", segment: "A", funnel_stage: "TOFU",
      niche: "reparaciones del hogar",
      model_sale_type: "matematica_simple",
      belief_change: { old_belief: "Las reparaciones del hogar son un conocimiento sin valor comercial", mechanism: "Hay demanda masiva sin oferta digital — la IA convierte ese saber en producto", new_belief: "Lo que sé arreglar en casa es un negocio digital esperando" },
      ingredients_used: [
        { category: "A", ingredient_number: 1, ingredient_name: "Dato Impactante" },
        { category: "B", ingredient_number: 26, ingredient_name: "Oportunidad Desperdiciada" },
        { category: "F", ingredient_number: 71, ingredient_name: "Proceso de N Pasos" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "G", ingredient_number: 89, ingredient_name: "Prueba por Volumen" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo de reparaciones es solo un ejemplo. Hay cientos de nichos así esperando.",
      cta_blocks: ctaBlocks
    }
  },
  // G6
  {
    title: "Cuando perdí $150K aprendí algo",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "confesion", script_text: "Perdí 150 mil dólares en publicidad que no funcionó. Se fue una casa. Literalmente. Y lo que aprendí de eso vale más que toda esa plata. Te cuento.", estimated_duration_seconds: 9 },
        { variant_number: 2, hook_type: "historia_mini", script_text: "Gasté 15 mil dólares en salir en televisión, radio y revistas. ¿Sabés cuántos clientes me trajo? Uno. Uno solo. Ese día entendí algo que me cambió todo.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "contraintuitivo", script_text: "Mis peores errores me hicieron más plata que mis mejores decisiones. Porque de los errores aprendí las reglas que nadie te enseña. Te cuento la que me costó 150 mil dólares.", estimated_duration_seconds: 8 },
        { variant_number: 4, hook_type: "provocacion", script_text: "La diferencia entre los que ganan plata online y los que no, no es el talento. Es cuántos golpes aguantaron sin soltar. Yo me comí todos. Y por eso puedo decirte qué funciona.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "negacion_directa", script_text: "No te voy a decir que esto es fácil. No te voy a decir que te vas a hacer millonario. Te voy a contar lo que me costó aprenderlo para que vos no pagues el mismo precio.", estimated_duration_seconds: 8 }
      ],
      development: {
        framework_used: "Analogía extendida",
        sections: [
          { section_name: "Presentar la analogía", script_text: "¿Viste cuando querés llegar a un lugar y el GPS te marca 5 rutas? Hay una rápida pero con peaje. Una gratis pero con 3 horas de tráfico. Y una que parece corta pero tiene un pozo en el kilómetro 10 que te rompe el auto. Yo tomé esa tercera ruta — 6 veces.", timing_seconds: 15, is_rehook: false },
          { section_name: "Re-hook", script_text: "Pero justamente por eso hoy conozco TODAS las rutas.", timing_seconds: 3, is_rehook: true },
          { section_name: "Desarrollar — fracasos reales", script_text: "Probé afiliación: márgenes mínimos, la ganancia se la queda otro. Probé freelance: cobraba un dólar la hora. Probé agencia: 100 clientes y no dormía. Gasté 150 mil dólares en publicidad que no funcionó. 15 mil en prensa que me trajo 1 solo cliente.", timing_seconds: 18, is_rehook: false },
          { section_name: "Conectar con producto", script_text: "Después de todo eso encontré el modelo que funciona: crear algo una vez con IA y venderlo infinitas veces. Sin stock, sin empleados, sin horarios. Validás primero que alguien lo quiere. Después lo creás. Así no perdés ni tiempo ni plata en algo que nadie va a comprar.", timing_seconds: 18, is_rehook: false },
          { section_name: "Venta del modelo — Lean/Anti-riesgo", script_text: "La primera regla que enseño es: prohibido crear un producto sin vender primero. Si lo hubiera sabido antes, me ahorraba una casa.", timing_seconds: 10, is_rehook: false }
        ],
        emotional_arc: "Vulnerabilidad → conexión → credibilidad → confianza"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 80, word_count: 200,
      visual_format: vf_car,
      angle_family: "historia", angle_specific: "5.4_fracaso_como_leccion",
      body_type: "analogia_extendida", segment: "B", funnel_stage: "TOFU",
      niche: "general — historia personal",
      model_sale_type: "lean_anti_riesgo",
      belief_change: { old_belief: "Para ganar plata online necesitás invertir mucho y arriesgar todo", mechanism: "El modelo lean permite validar antes de crear, eliminando el riesgo", new_belief: "Puedo empezar con bajo riesgo si valido antes de crear" },
      ingredients_used: [
        { category: "A", ingredient_number: 4, ingredient_name: "Historia Personal / Confesional" },
        { category: "B", ingredient_number: 30, ingredient_name: "Patrón de Fracaso" },
        { category: "E", ingredient_number: 61, ingredient_name: "Credencial Anti-Héroe" },
        { category: "F", ingredient_number: 76, ingredient_name: "Metáfora / Analogía" },
        { category: "G", ingredient_number: 89, ingredient_name: "Prueba por Volumen" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Todo lo que aprendí en esos golpes es exactamente lo que enseño paso a paso.",
      cta_blocks: ctaBlocks
    }
  },
  // G7
  {
    title: "Tu profesión ya vale oro digital",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "provocacion", script_text: "Los veterinarios saben más de nutrición animal que el 99% de los ebooks que se venden en internet. Pero ningún veterinario vende uno. ¿Sabés quién los hace? Gente que buscó en Google y le pidió a la IA.", estimated_duration_seconds: 10 },
        { variant_number: 2, hook_type: "analogia", script_text: "¿Viste esos libros de recetas para perros que venden en las veterinarias? Los escribió alguien que probablemente no es veterinario. Pero cobró como si fuera. Tu conocimiento vale más. Solo que nadie te mostró cómo empaquetarlo.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "situacion_especifica", script_text: "Sos veterinaria. Atendés 15 consultas por día. El 80% te pregunta lo mismo: qué comida darle, cómo cortarle las uñas, cuándo vacunarlo. ¿Y si esas respuestas se convirtieran en un producto que se vende solo?", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "observacion_tendencia", script_text: "Cada vez más profesionales están dejando de solo atender pacientes o clientes para crear productos digitales con lo que ya saben. Psicólogos, nutricionistas, contadores, veterinarios. La IA les permite hacerlo en horas, no en meses.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "pregunta_incomoda", script_text: "¿Cuántas veces un cliente te pidió un consejo gratis por WhatsApp? ¿Cuántas veces contestaste sin cobrar? ¿Y si todo eso que regalás estuviera en una guía de 15 dólares que se vende sola?", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Un día en la vida",
        sections: [
          { section_name: "Mañana", script_text: "Te levantás. Revisás el celular. 2 ventas de tu guía de nutrición para mascotas mientras dormías. 30 dólares. No hiciste nada. La publicidad de 3 dólares por día hizo el trabajo.", timing_seconds: 12, is_rehook: false },
          { section_name: "Re-hook", script_text: "Y acá viene lo mejor.", timing_seconds: 3, is_rehook: true },
          { section_name: "Tarde", script_text: "A las 10 te sentás 30 minutos a responder mensajes de WhatsApp de gente interesada. Les explicás qué incluye la guía. Algunos compran, otros no. No importa — los que compraron ya se lo descargaron solos.", timing_seconds: 15, is_rehook: false },
          { section_name: "Noche", script_text: "A la noche seguís con tu vida. Cuidás a tus hijos, mirás una serie, lo que quieras. La guía se sigue vendiendo. Porque es digital. Se crea una vez y se vende infinitas veces. Sin stock. Sin local. Sin horarios.", timing_seconds: 15, is_rehook: false },
          { section_name: "Venta del modelo — Democratización por IA", script_text: "Antes para hacer esto necesitabas un diseñador, un editor y meses de trabajo. Hoy le pedís a la IA que organice tu conocimiento en una guía profesional. Y en una tarde tenés un producto listo.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Proyección → deseo → claridad → posibilidad"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 75, word_count: 190,
      visual_format: vf_split,
      angle_family: "oportunidad", angle_specific: "2.6_profesion_ia",
      body_type: "un_dia_en_la_vida", segment: "C", funnel_stage: "TOFU",
      niche: "veterinaria básica",
      model_sale_type: "democratizacion_por_ia",
      belief_change: { old_belief: "Mi profesión solo sirve para atender clientes uno a uno", mechanism: "La IA convierte tu conocimiento profesional en un producto digital escalable", new_belief: "Mi conocimiento profesional puede generar ingresos sin que yo esté presente" },
      ingredients_used: [
        { category: "A", ingredient_number: 3, ingredient_name: "Contrariano" },
        { category: "B", ingredient_number: 26, ingredient_name: "Oportunidad Desperdiciada" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "H", ingredient_number: 99, ingredient_name: "Future Pacing Sensorial" },
        { category: "G", ingredient_number: 85, ingredient_name: "Testimonio Diverso" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo de veterinaria es solo un ejemplo. Cualquier profesión se puede transformar así.",
      cta_blocks: ctaBlocks
    }
  },
  // G8
  {
    title: "3 pasos, 1 celular, tu primer producto",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "simplificacion_error", script_text: "Crear un producto digital tiene 3 pasos. Solo 3. El problema es que el 90% se queda investigando el paso 1 por meses y nunca pasa al 2. Te muestro cómo hacerlo en un fin de semana.", estimated_duration_seconds: 9 },
        { variant_number: 2, hook_type: "negacion_directa", script_text: "No necesitás una computadora. No necesitás saber de diseño. No necesitás hablar inglés. Un celular, WhatsApp y saber pedirle a la IA. En 3 pasos tenés tu primer producto digital.", estimated_duration_seconds: 8 },
        { variant_number: 3, hook_type: "dato_concreto", script_text: "\"Cómo aprender inglés rápido\" tiene 100 mil búsquedas por mes. Una guía de inglés básico creada con IA se vende a 10 dólares. Con 3 ventas por día ya tenés un ingreso extra. Tres pasos y un celular.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "analogia", script_text: "¿Sabés pedir un café? Entonces sabés usar la IA. Es lo mismo: le decís qué querés y te lo da. Solo que en vez de un café, te da un producto que podés vender. En 3 pasos.", estimated_duration_seconds: 8 },
        { variant_number: 5, hook_type: "contrato_compromiso", script_text: "Si me das un fin de semana, te muestro cómo crear tu primer producto digital con IA y ponerlo a la venta. Sin excusas de plata, de tecnología ni de tiempo. 3 pasos. Vos decidís.", estimated_duration_seconds: 8 }
      ],
      development: {
        framework_used: "Demo/Proceso paso a paso",
        sections: [
          { section_name: "Intro — Simplicidad", script_text: "La realidad es que crear un producto digital no es difícil. Lo hacen complicado para venderte más cursos. Son 3 pasos. Te los muestro con un ejemplo real: una guía de inglés básico para viajeros.", timing_seconds: 12, is_rehook: false },
          { section_name: "Re-hook", script_text: "Y lo hacés desde el celular.", timing_seconds: 3, is_rehook: true },
          { section_name: "Paso 1 — Investigar", script_text: "Abrís Google y buscás qué quiere la gente. \"Inglés para viajar\", \"frases en inglés para el aeropuerto\". Miles de búsquedas. Eso te dice que hay demanda.", timing_seconds: 12, is_rehook: false },
          { section_name: "Paso 2 — Crear con IA", script_text: "Abrís la IA y le pedís: \"Armame una guía de 100 frases en inglés para viajeros, con pronunciación y situaciones\". En 30 minutos tenés el producto. La IA lo escribe, lo estructura y lo diseña.", timing_seconds: 15, is_rehook: false },
          { section_name: "Paso 3 — Vender", script_text: "Lo subís a Hotmart. Ponés un anuncio de 3 dólares por día. La gente te escribe por WhatsApp. Les mandás el link. Cobran. Se lo descargan solos.", timing_seconds: 12, is_rehook: false },
          { section_name: "Venta del modelo — Tiempo vs dinero", script_text: "Lo creás una sola vez y se vende infinitas veces. Mientras dormís, mientras estás con tus hijos, mientras hacés otra cosa. Eso es lo que cambia.", timing_seconds: 10, is_rehook: false }
        ],
        emotional_arc: "Claridad → demostración → simplicidad → motivación"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 80, word_count: 200,
      visual_format: vf_car,
      angle_family: "mecanismo", angle_specific: "4.2_proceso_3_pasos",
      body_type: "demo_proceso", segment: "C", funnel_stage: "MOFU",
      niche: "idiomas — inglés para viajeros",
      model_sale_type: "tiempo_vs_dinero",
      belief_change: { old_belief: "Crear un producto digital es complicado y lleva meses", mechanism: "3 pasos simples con IA: investigar, crear, vender — en un fin de semana", new_belief: "Puedo crear mi primer producto digital este fin de semana con un celular" },
      ingredients_used: [
        { category: "A", ingredient_number: 7, ingredient_name: "Promesa Concreta" },
        { category: "B", ingredient_number: 29, ingredient_name: "Complejidad Percibida" },
        { category: "F", ingredient_number: 71, ingredient_name: "Proceso de N Pasos" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "G", ingredient_number: 89, ingredient_name: "Prueba por Volumen" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo de inglés para viajeros es solo un ejemplo. Lo podés hacer con cualquier tema que conozcas.",
      cta_blocks: ctaBlocks
    }
  },
  // G9
  {
    title: "Esto no es para gente que quiere pensar",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "anti_publico", script_text: "Si querés seguir juntando cursos que nunca terminás, este video no es para vos. Si querés seguir leyendo sobre emprender sin hacer nada, tampoco. Esto es para gente que ya se cansó de dar vueltas.", estimated_duration_seconds: 9 },
        { variant_number: 2, hook_type: "confesion", script_text: "Ya tuviste un negocio. Ya invertiste plata. Ya te fue mal. Y ahora no sabés si vale la pena intentar de nuevo. Te entiendo perfecto. A mí me pasó 6 veces antes de encontrar lo que funciona.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "provocacion", script_text: "El problema no es que te faltó ganas. El problema es que elegiste el modelo equivocado. Dropshipping, afiliación, freelance, agencia... todos tienen el mismo defecto. Y nadie te lo dice.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "pregunta_incomoda", script_text: "¿Cuánta plata perdiste en negocios que no funcionaron? ¿5 mil dólares? ¿10 mil? ¿Y si el problema nunca fue tu ejecución sino el modelo de negocio que elegiste?", estimated_duration_seconds: 8 },
        { variant_number: 5, hook_type: "situacion_especifica", script_text: "Probaste dropshipping y te comiste el stock. Probaste freelance y terminaste cobrando monedas. Probaste una agencia y casi te fundís. Conozco esa historia porque es la mía.", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Comparación de caminos",
        sections: [
          { section_name: "Camino A — Lo que todos eligen", script_text: "El camino que la mayoría elige: dropshipping, afiliación, freelance, agencia. ¿Sabés qué tienen en común? Vos asumís todo el riesgo. En dropshipping el margen se lo queda la plataforma. En freelance cambiás horas por plata. En agencia necesitás 10 clientes para pagar las cuentas.", timing_seconds: 18, is_rehook: false },
          { section_name: "Re-hook", script_text: "Pero hay otro camino que la mayoría no conoce.", timing_seconds: 3, is_rehook: true },
          { section_name: "Camino B — Productos digitales con IA", script_text: "Creás algo una sola vez — una guía, un curso, unas plantillas — con la ayuda de la IA. Lo subís a una plataforma. Ponés publicidad. Y se vende solo. Sin stock. Sin clientes que te estresen. Sin horarios. Si no funciona, perdiste 10 dólares y un fin de semana.", timing_seconds: 18, is_rehook: false },
          { section_name: "Venta del modelo — Cementerio de modelos", script_text: "Yo probé los 5 modelos. Todos tienen un techo. El único donde creás algo una vez y lo vendés infinitas veces, sin empleados, sin stock y sin empezar de cero cada mes... es este. Por eso dejé todo lo demás.", timing_seconds: 15, is_rehook: false }
        ],
        emotional_arc: "Reconocimiento → frustración validada → nueva posibilidad → convicción"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 70, word_count: 185,
      visual_format: vf_split,
      angle_family: "identidad", angle_specific: "1.7_emprendedor_quemado",
      body_type: "comparacion_caminos", segment: "B", funnel_stage: "RETARGET",
      niche: "general — comparación de modelos",
      model_sale_type: "cementerio_de_modelos",
      belief_change: { old_belief: "Ya intenté y no funciona, el emprendimiento online no es para mí", mechanism: "El problema fue el modelo, no la persona — productos digitales elimina los defectos de los otros modelos", new_belief: "No fallé yo, falló el modelo. Este modelo elimina lo que me hizo perder antes" },
      ingredients_used: [
        { category: "A", ingredient_number: 3, ingredient_name: "Contrariano" },
        { category: "B", ingredient_number: 30, ingredient_name: "Patrón de Fracaso" },
        { category: "D", ingredient_number: 52, ingredient_name: "Quiebre de Modelo" },
        { category: "F", ingredient_number: 72, ingredient_name: "New Opportunity" },
        { category: "E", ingredient_number: 61, ingredient_name: "Credencial Anti-Héroe" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Todo lo que aprendí probando esos 5 modelos es exactamente lo que enseño.",
      cta_blocks: ctaBlocks
    }
  },
  // G10
  {
    title: "Mirá lo que hizo con 55 años y ganas",
    script: {
      platform_adaptation: { platform: "TikTok/Instagram", aspect_ratio: "9:16", captions_style: "dynamic" },
      hooks: [
        { variant_number: 1, hook_type: "historia_mini", script_text: "Gloria tiene 55 años. No sabía qué era Hotmart. Nunca vendió nada por internet. Le pidió a la IA que armara un catálogo de maquillaje natural y en 3 semanas vendió 60 copias. Desde el celular.", estimated_duration_seconds: 10 },
        { variant_number: 2, hook_type: "contraintuitivo", script_text: "Las personas mayores de 50 que entran a este programa tienen mejores resultados que los de 25. ¿Sabés por qué? Porque tienen más paciencia, más conocimiento de vida y menos miedo al ridículo.", estimated_duration_seconds: 9 },
        { variant_number: 3, hook_type: "situacion_especifica", script_text: "Tenés 55 años. Te dicen que ya fue, que la tecnología no es lo tuyo, que eso es para pibes. Pero vos sabés que todavía tenés mucho para dar. Y tenés razón. Lo que te falta no es capacidad — es el cómo.", estimated_duration_seconds: 9 },
        { variant_number: 4, hook_type: "provocacion", script_text: "Tu sobrina de 22 años no sabe maquillarse ni la mitad de bien que vos. Pero si ella quisiera, podría vender una guía de maquillaje online antes que vos. ¿Sabés por qué? Porque ella sabe usar la IA. Eso es todo.", estimated_duration_seconds: 9 },
        { variant_number: 5, hook_type: "dato_concreto", script_text: "\"Maquillaje natural paso a paso\" tiene 35 mil búsquedas por mes en Google en español. Hay 3 guías pagando anuncios. Tres. Y ninguna está hecha por alguien que realmente sepa de maquillaje. Ahí está la oportunidad.", estimated_duration_seconds: 9 }
      ],
      development: {
        framework_used: "Historia con giro",
        sections: [
          { section_name: "Situación inicial", script_text: "Gloria se maquilla desde los 18 años. Conoce cada truco, cada producto, cada técnica para piel madura. Sus amigas siempre le piden consejos. Pero nunca se le ocurrió que eso podía valer plata.", timing_seconds: 12, is_rehook: false },
          { section_name: "Re-hook", script_text: "Hasta que vio uno de mis videos.", timing_seconds: 3, is_rehook: true },
          { section_name: "Complicación — el proceso", script_text: "Me escribió por WhatsApp diciendo: \"Yo no sé nada de internet\". Le dije: \"¿Sabés de maquillaje?\" \"Sí.\" \"Entonces ya tenés un producto.\" Le pidió a la IA que organizara todo lo que sabía en una guía de maquillaje natural para mujeres de 40+. Le llevó un fin de semana.", timing_seconds: 18, is_rehook: false },
          { section_name: "Giro", script_text: "La subió por 12 dólares. Puso un anuncio apuntando a mujeres de su edad. En 3 semanas vendió 60 copias. Sin mostrar su cara. Sin saber de tecnología. Desde el celular.", timing_seconds: 15, is_rehook: false },
          { section_name: "Venta del modelo — Contraste con negocio físico", script_text: "Un negocio de maquillaje requiere local, productos, stock, empleados. Esto lo arrancó con 10 dólares y un celular. Si no funcionaba, perdía menos que una salida a comer.", timing_seconds: 12, is_rehook: false }
        ],
        emotional_arc: "Identificación → esperanza → sorpresa → posibilidad concreta"
      },
      cta: { cta_type: "directo", verbal_cta: "Tocá el botón de acá abajo", reason_why: "3 bloques CTA separados" },
      total_duration_seconds: 75, word_count: 195,
      visual_format: vf_car,
      angle_family: "mecanismo", angle_specific: "4.4_detras_de_escena",
      body_type: "historia_con_giro", segment: "D", funnel_stage: "TOFU",
      niche: "maquillaje natural",
      model_sale_type: "contraste_con_negocio_fisico",
      belief_change: { old_belief: "A mi edad ya fue, la tecnología no es para mí", mechanism: "La IA hace el trabajo técnico, vos solo ponés el conocimiento que ya tenés", new_belief: "Mi experiencia de vida es mi mayor ventaja, no mi limitación" },
      ingredients_used: [
        { category: "A", ingredient_number: 4, ingredient_name: "Historia Personal" },
        { category: "B", ingredient_number: 24, ingredient_name: "Situación Específica" },
        { category: "E", ingredient_number: 62, ingredient_name: "Caso de Estudio" },
        { category: "F", ingredient_number: 74, ingredient_name: "Eliminación de Complejidad" },
        { category: "G", ingredient_number: 90, ingredient_name: "Persona Improbable" },
        { category: "I", ingredient_number: 109, ingredient_name: "CTA Directo" }
      ],
      transition_text: "Y lo que hizo Gloria con maquillaje es solo uno de los caminos que te puedo mostrar.",
      cta_blocks: ctaBlocks
    }
  }
];

// Save all 10
const now = new Date().toISOString();
const results = [];

for (const s of scripts) {
  const briefId = randomUUID();
  const generationId = randomUUID();

  const briefData = {
    id: briefId,
    productDescription: "Generado desde CLI — Plan semana 2026-03-17",
    hookCount: s.script.hooks.length,
    createdAt: now,
  };
  writeFileSync(join(BRIEFS_DIR, `${briefId}.json`), JSON.stringify(briefData, null, 2));

  const genData = {
    id: generationId,
    briefId,
    title: s.title,
    batch: { name: "Semana 2026-03-17", weekOf: "2026-03-17" },
    script: s.script,
    createdAt: now,
  };
  writeFileSync(join(GENERATIONS_DIR, `${generationId}.json`), JSON.stringify(genData, null, 2));

  results.push({ title: s.title, generationId, url: `http://localhost:3002/scripts/${generationId}` });
}

console.log(JSON.stringify(results, null, 2));
