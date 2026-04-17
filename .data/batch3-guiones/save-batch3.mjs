#!/usr/bin/env node
/**
 * Batch 3 — 10 guiones ADP. Genera JSONs y los guarda via save-generation.mjs
 */
import { execFileSync } from "child_process";
import { join } from "path";
import { writeFileSync } from "fs";

const SCRIPTS_DIR = join(import.meta.dirname, "..", "..", "scripts");
const SAVE_SCRIPT = join(SCRIPTS_DIR, "save-generation.mjs");

const CTA_BLOCKS = [
  {
    channel: "clase_gratuita",
    channel_label: "Clase Gratuita",
    variant: "C",
    layers: {
      oferta: "Tengo una clase gratis de 2 horas donde te muestro cómo encontrar productos digitales que ya se están vendiendo, cómo crearlos con IA y cómo empezar a venderlos. Sin experiencia. Sin saber de tecnología y desde tu casa.",
      orden_1: "Tocá el botón de acá abajo y registrate.",
      prueba: "Lo hicieron mamás que nunca habían vendido nada, jubilados que solo sabían usar WhatsApp, pibes de 20 que vivían del sueldo mínimo. Todos empezaron de cero.",
      riesgo_cero: "Es una clase gratis. Si no te sirve, no perdiste nada. Pero si te sirve, estamos hablando de 50, 60 dólares por día extra. ¿O no te serviría esa plata? Yo creo que sí.",
      urgencia: "La clase es en vivo, conmigo. Y porque es en vivo, los cupos son limitados.",
      cierre: "Son 2 horas que te pueden ahorrar meses de estar buscando solo. Registrate ahora. Te espero adentro."
    }
  },
  {
    channel: "taller_5",
    channel_label: "Taller $5",
    variant: "A",
    layers: {
      oferta: "Son 3 días conmigo. En vivo. Día 1: encontrás tu producto ganador con IA. Día 2: lo armás completo. Día 3: lo vendés por WhatsApp.",
      prueba: "Ya lo hicieron más de 17 mil personas en Argentina, Colombia, México y España.",
      riesgo_cero: "¿Cuánto vale? 5 dólares. Menos que un café.",
      urgencia: "El taller arranca esta semana.",
      cierre: "Tocá el botón de acá abajo. Son 5 dólares y 3 tardes."
    }
  },
  {
    channel: "instagram",
    channel_label: "Instagram Orgánico",
    variant: "C",
    layers: {
      oferta: "Tengo una clase gratis de 2 horas donde te muestro paso a paso cómo encontrar un producto digital, crearlo con IA y empezar a venderlo.",
      orden_1: "Comentá 'CLASE' acá abajo y andá a registrarte en el link de mi perfil.",
      cierre: "Comentá 'CLASE' y registrate en el link de mi perfil. Te espero adentro, abrazo."
    }
  }
];

const BATCH = { id: "batch-3-2026-04-08", name: "Batch 3 — Nuevos Nichos" };

const guiones = [
  // ─── GUION 1 ───
  {
    title: "Regalás lo que más sabés — terapeuta que regala consejos gratis",
    script: {
      angle_family: "identidad",
      angle_specific: "1.6_freelancer_profesional",
      body_type: "contraste_emocional",
      segment: "C",
      funnel_stage: "TOFU",
      niche: "psicología / salud mental / terapia",
      model_sale_type: "tiempo_vs_dinero",
      emotional_arc: "dolor_puro_esperanza",
      transition_text: "Si querés ver cómo funciona esto paso a paso, te lo muestro.",
      total_duration_seconds: 75,
      word_count: 182,
      belief_change: {
        old_belief: "Mi conocimiento solo vale dentro del consultorio, por sesión",
        mechanism: "Mostrar que miles buscan guías de ansiedad/sueño y las compran a gente con menos formación",
        new_belief: "Lo que ya sé se puede empaquetar con IA y vender sin atender una sesión más"
      },
      micro_beliefs: [
        { belief: "Estudio mucho y cobro poco", installed_via: "contraste entre formación y cobro por sesión", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Otros con menos conocimiento me están ganando", installed_via: "dato de que miles buscan guías y las compran a otros", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Puedo armar un producto en una tarde con IA", installed_via: "mecanismo simple de empaquetar conocimiento", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No me falta aprender, me falta un sistema", installed_via: "frase textual de César invertida", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "Otros profesionales ya lo están haciendo", installed_via: "prueba social de profesionales empaquetando conocimiento", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "pregunta_incomoda", hypothesis: "la terapeuta se identifica con regalar consejos gratis por DM", emotional_lever: "reconocimiento", script_text: "¿Cuántas veces te escribieron un DM pidiéndote un consejo gratis? ¿Y cuántas veces contestaste? Ese conocimiento que regalás vale mucho más de lo que te imaginás.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "situacion_especifica", hypothesis: "la rutina de atender + subir reels gratis genera identificación visceral", emotional_lever: "hartazgo", script_text: "Atendés 6 pacientes por día. Llegás a tu casa vacía. Y a las 10 de la noche subís un reel con tips de ansiedad. Gratis. Para desconocidos. Hay otra forma de usar eso.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "contraintuitivo", hypothesis: "la paradoja de saber mucho y cobrar poco genera curiosidad", emotional_lever: "curiosidad", script_text: "Las personas que más saben de salud mental son las que peor cobran por lo que saben. No es falta de demanda. Es falta de un camino claro.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Estudio mucho y cobro poco", timing_seconds: 12, script_text: "Estudiaste años. Posgrados, supervisión, congresos. Y hoy cobrás por sesión lo mismo que una app cobra por mes." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Otros con menos conocimiento me están ganando", timing_seconds: 15, script_text: "La realidad es que miles de personas buscan guías de manejo de ansiedad, técnicas para dormir mejor, ejercicios de regulación emocional. Y las están comprando. Pero no a vos. Se las compran a gente que sabe la mitad.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Puedo armar un producto en una tarde con IA", timing_seconds: 15, script_text: "Con la IA podés agarrar lo que ya sabés, organizarlo en una guía, y tenerlo listo en una tarde. Un producto que se vende por WhatsApp mientras vos seguís atendiendo." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No me falta aprender, me falta un sistema", timing_seconds: 12, script_text: "Ya sé lo que estás pensando. \"No me decido a comenzar, siempre me falta aprender algo más.\" No te falta aprender. Te sobra conocimiento. Te falta un sistema para venderlo." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "Otros profesionales ya lo están haciendo", timing_seconds: 10, script_text: "Profesionales como vos ya están empaquetando lo que saben. Les llegan ventas mientras atienden, mientras duermen, mientras viven." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Cambiar horas por plata tiene techo; un producto digital no", timing_seconds: 11, script_text: "En tu trabajo cambiás horas por plata. No atendés, no cobrás. Con un producto digital lo creás una vez y se sigue vendiendo. Sin horario. Sin techo." }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "pregunta_retórica", phrase: "¿Cuántas veces te escribieron un DM pidiéndote un consejo gratis?" },
        { location: "beat_1", technique: "afirmación", phrase: "cobrás por sesión lo mismo que una app cobra por mes" },
        { location: "beat_2", technique: "afirmación", phrase: "Se las compran a gente que sabe la mitad" },
        { location: "beat_3", technique: "afirmación", phrase: "tenerlo listo en una tarde" },
        { location: "beat_4", technique: "afirmación", phrase: "Te sobra conocimiento" },
        { location: "beat_5", technique: "afirmación", phrase: "mientras atienden, mientras duermen, mientras viven" }
      ],
      ingredients_used: ["B#31", "C#43", "D#49", "F#82", "H#101"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 2 ───
  {
    title: "Tu cuerpo ya te avisó — veterinario que no da más",
    script: {
      angle_family: "confrontacion",
      angle_specific: "3.5_costo_invisible",
      body_type: "demolicion_alternativas",
      segment: "B",
      funnel_stage: "TOFU",
      niche: "veterinaria / salud animal",
      model_sale_type: "cementerio_modelos",
      emotional_arc: "confrontacion_directa",
      transition_text: "Te muestro cómo funciona en una clase gratuita. Básicamente, son 3 pasos.",
      total_duration_seconds: 80,
      word_count: 190,
      belief_change: {
        old_belief: "La única forma de ganar más es atender más pacientes",
        mechanism: "Presentar 3 alternativas donde las primeras 2 destruyen el cuerpo y la tercera usa IA para empaquetar conocimiento",
        new_belief: "Puedo vender lo que sé sin mover el cuerpo"
      },
      micro_beliefs: [
        { belief: "Sé más de nutrición animal que los ebooks que se venden", installed_via: "dato concreto de 90% de ebooks", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Más consultas = más desgaste, no más plata", installed_via: "demolición de alternativa 1 (más consultas)", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Existe una tercera vía que no requiere mi cuerpo", installed_via: "presentación del modelo digital con IA", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No necesito nada especial para arrancar", installed_via: "eliminación de barreras paso a paso", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "Otros profesionales de salud ya lo hacen", installed_via: "lista de profesionales vendiendo guías", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "situacion_especifica", hypothesis: "el espejo de la rutina del veterinario genera identificación visceral", emotional_lever: "hartazgo", script_text: "Te levantás a las 6. Arrancás con una cirugía. Después consultas hasta las 7. Llegás a tu casa con olor a clínica y lo primero que hacés es sentarte a hacer facturas.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "provocacion", hypothesis: "la frase textual de 41 años genera impacto emocional directo", emotional_lever: "indignación", script_text: "41 años trabajando 10 horas diarias. Poca valoración. Y el que te vacuna al perro cobra lo mismo que un plomero. ¿Hasta cuándo?", timing_seconds: 7 },
        { variant_number: 3, hook_type: "confesion", hypothesis: "la historia de Jesús con 100 clientes genera conexión por vulnerabilidad", emotional_lever: "conexión", script_text: "Tuve 100 clientes. Ganaba bien. Y fue el peor momento de mi vida. Porque no dormía, no paraba, y mi cuerpo me lo cobró. Te cuento qué cambié.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Sé más de nutrición animal que los ebooks que se venden", timing_seconds: 15, script_text: "Sabés más de nutrición animal que el 90 por ciento de los ebooks que se venden por internet. Pero cada día cambiás ese conocimiento por consultas de 20 minutos que no te alcanzan para nada." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Más consultas = más desgaste, no más plata", timing_seconds: 15, script_text: "Hay 3 formas de ganar un ingreso extra como profesional. La primera es dar más consultas. Pero tu cuerpo ya te avisó que no da para más. La segunda es dar cursos presenciales. Pero eso es otro laburo encima.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Existe una tercera vía que no requiere mi cuerpo", timing_seconds: 15, script_text: "La tercera es distinta. Agarrás lo que ya sabés, le pedís a la IA que lo organice en una guía paso a paso, y lo vendés por WhatsApp. Sin consultorio. Sin horario. Sin que tu espalda opine." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No necesito nada especial para arrancar", timing_seconds: 12, script_text: "No necesitás saber de marketing. No necesitás seguidores. Necesitás saber algo que otro quiera aprender. Y eso ya lo tenés de sobra." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "Otros profesionales de salud ya lo hacen", timing_seconds: 10, script_text: "Veterinarios, kinesiólogos, nutricionistas. Profesionales que estaban donde vos estás hoy venden guías desde el celular con lo que ya sabían." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Los modelos lineales tienen techo, el digital no", timing_seconds: 13, script_text: "Freelance, consultoría, agencia... Todos esos modelos tienen lo mismo. Si no laburás, no cobrás. Acá creás algo una vez y sigue vendiendo." }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "Llegás a tu casa con olor a clínica" },
        { location: "beat_1", technique: "afirmación", phrase: "consultas de 20 minutos que no te alcanzan para nada" },
        { location: "beat_2", technique: "afirmación", phrase: "tu cuerpo ya te avisó que no da para más" },
        { location: "beat_3", technique: "afirmación", phrase: "Sin consultorio. Sin horario" },
        { location: "beat_4", technique: "afirmación", phrase: "eso ya lo tenés de sobra" },
        { location: "beat_6", technique: "afirmación", phrase: "Si no laburás, no cobrás" }
      ],
      ingredients_used: ["B#23", "C#42", "D#51", "F#72", "G#88"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 3 ───
  {
    title: "Nadie te encuentra — fotógrafa invisible en internet",
    script: {
      angle_family: "oportunidad",
      angle_specific: "2.3_nicho_invisible",
      body_type: "historia_con_giro",
      segment: "A",
      funnel_stage: "TOFU",
      niche: "fotografía / videografía / edición visual",
      model_sale_type: "transparencia_total",
      emotional_arc: "revelacion_oportunidad",
      transition_text: "Si querés ver cómo funciona, te lo muestro en una clase.",
      total_duration_seconds: 75,
      word_count: 185,
      belief_change: {
        old_belief: "Si no me llaman no hay forma de cobrar por lo que hago",
        mechanism: "Mostrar que el conocimiento de fotografía se empaqueta en guías/presets/cursos que se venden sin depender de llamadas",
        new_belief: "Puedo vender mi conocimiento como producto digital sin esperar que me encuentren"
      },
      micro_beliefs: [
        { belief: "Tengo talento pero dependo de que me recomienden", installed_via: "descripción de la dependencia del boca en boca", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Si no estoy visible, no existo para el mercado", installed_via: "frase textual sobre investigar y buscar", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Puedo crear un producto con lo que ya sé", installed_via: "ejemplos concretos de guía/presets/curso", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No necesito ser influencer para vender", installed_via: "negación de barreras de seguidores", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "El proceso es transparente y simple", installed_via: "Jesús explica los 3 pasos sin letra chica", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "historia_mini", hypothesis: "el anti-testimonio genera curiosidad al negar la promesa típica", emotional_lever: "curiosidad", script_text: "No te voy a mostrar a alguien que factura 50 mil dólares desde la playa. Te voy a contar qué le pasó a una fotógrafa de 44 años cuando se cansó de esperar que la encuentren en internet.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "provocacion", hypothesis: "la invisibilidad digital es un dolor concreto del creativo", emotional_lever: "frustración", script_text: "Sacás fotos que la gente admira. Te dicen \"qué talento\". Pero cuando buscás tu nombre en Google, no aparecés. Sos invisible en internet. Y eso tiene solución.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "contraintuitivo", hypothesis: "la frase textual de conocer a Jesús por hablar mal genera intriga", emotional_lever: "intriga", script_text: "La persona que habló mal de él le hizo el mejor favor de su vida. Porque así empezó a investigar. Y lo que encontró le cambió todo. Te cuento.", timing_seconds: 7 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Tengo talento pero dependo de que me recomienden", timing_seconds: 12, script_text: "Sos fotógrafa. O videógrafa. O editora. Tenés un ojo que la mayoría no tiene. Pero tu negocio depende de que alguien te recomiende, de que te encuentren en Instagram, de que te llamen. Y si no te llaman, no cobrás." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Si no estoy visible, no existo para el mercado", timing_seconds: 15, script_text: "Alguien me dijo algo que me quedó: \"Lo conocí por alguien que habló mal de él, y entré a investigar.\" ¿Sabés qué significa eso? Que la gente busca. Investiga. Compara. Y si vos no estás ahí, no existís.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Puedo crear un producto con lo que ya sé", timing_seconds: 15, script_text: "Pero hay algo que podés hacer con lo que ya sabés. Armás una guía de fotografía, un kit de presets, un curso de edición con IA. Lo creás en una tarde. Y lo vendés sin depender de que alguien te llame." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No necesito ser influencer para vender", timing_seconds: 10, script_text: "No necesitás ser influencer. No necesitás 10 mil seguidores. Necesitás saber algo que otro quiera aprender. ¿Me explico?" },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "El proceso es transparente y simple", timing_seconds: 13, script_text: "Y te voy a ser honesto. Esto no es magia. Es un proceso de 3 pasos. Investigás qué se busca, lo creás con IA, y lo vendés con un anuncio simple. Sin letra chica." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Transparencia total: así funciona el negocio", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "Sacás fotos que la gente admira" },
        { location: "beat_1", technique: "afirmación", phrase: "si no te llaman, no cobrás" },
        { location: "beat_2", technique: "afirmación", phrase: "la gente busca. Investiga. Compara" },
        { location: "beat_3", technique: "afirmación", phrase: "Lo creás en una tarde" },
        { location: "beat_4", technique: "pregunta_retórica", phrase: "¿Me explico?" },
        { location: "beat_5", technique: "afirmación", phrase: "te voy a ser honesto" }
      ],
      ingredients_used: ["B#31", "D#49", "F#82", "E#63", "G#92"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 4 ───
  {
    title: "20 años enseñando y la cuenta no se enteró — profe de música",
    script: {
      angle_family: "identidad",
      angle_specific: "1.4_jubilado_reinventandose",
      body_type: "qa_conversacional",
      segment: "B",
      funnel_stage: "TOFU",
      niche: "música / profesor de instrumento",
      model_sale_type: "democratizacion_ia",
      emotional_arc: "pregunta_tras_pregunta",
      transition_text: "Te muestro cómo en una clase gratuita.",
      total_duration_seconds: 80,
      word_count: 195,
      belief_change: {
        old_belief: "Con 50 años y dando clases de guitarra no puedo hacer nada digital",
        mechanism: "Dato real de que el 29% de alumnos tiene más de 55 + la IA elimina la barrera técnica",
        new_belief: "Mi experiencia de 20 años es exactamente lo que se vende, y la IA hace el resto"
      },
      micro_beliefs: [
        { belief: "Mi realidad es levantarme temprano para ganar el mínimo", installed_via: "frase textual del avatar sobre la rutina", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Si sé enseñar, ya tengo el 90% resuelto", installed_via: "Jesús responde directamente que sí funciona para profes", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "La IA me permite armar un método sin saber de diseño", installed_via: "explicación simple de cómo la IA organiza el conocimiento", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No es tarde, la experiencia es mi ventaja", installed_via: "dato del 29% mayores de 55", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "La IA niveló la cancha para todos", installed_via: "contraste antes/después de IA", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "negacion_directa", hypothesis: "la cadena de noes destruye barreras y el cierre con música genera identificación", emotional_lever: "permiso", script_text: "No tenés que renunciar. No tenés que saber de tecnología. No tenés que tener seguidores. Lo único que necesitás es saber algo que otro quiera aprender. Y vos sabés tocar.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "pregunta_incomoda", hypothesis: "la matemática simple del techo de horas genera incomodidad productiva", emotional_lever: "confrontación", script_text: "¿Cuánto cobrás la hora de clase? ¿Y cuántas horas tiene tu día? Hacé la cuenta. Ese es tu techo. A menos que cambies lo que estás vendiendo.", timing_seconds: 7 },
        { variant_number: 3, hook_type: "situacion_especifica", hypothesis: "la rutina del profe que vuelve a arrancar de cero cada lunes", emotional_lever: "hartazgo", script_text: "Hace 20 años que enseñás. Tus alumnos te adoran. Pero tu cuenta bancaria no se enteró. Y cada lunes volvés a arrancar de cero.", timing_seconds: 7 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Mi realidad es levantarme temprano para ganar el mínimo", timing_seconds: 15, script_text: "Me preguntan mucho esto. \"Jesús, yo soy profe de música. ¿Esto sirve para mí?\" Mirá, te lo digo simple. Si sabés enseñar algo, ya tenés el 90 por ciento resuelto." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Mi conocimiento vale más que lo que me pagan", timing_seconds: 15, script_text: "Alguien me escribió hace poco. \"Levantarme a las 4 y media, hacer un viaje de hora y media para ganar el mínimo.\" Eso no es un trabajo. Eso es supervivencia. Y vos tenés un conocimiento que vale mucho más que eso.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "La IA me permite armar un método sin saber de diseño", timing_seconds: 15, script_text: "La IA hoy te permite agarrar lo que sabés de música, armarlo en un método paso a paso, y tenerlo listo sin saber de diseño ni de nada. Vos ponés el conocimiento. La IA pone el resto." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No es tarde, la experiencia es mi ventaja", timing_seconds: 15, script_text: "\"Pero Jesús, tengo 50 años, ¿no es tarde para esto?\" Te doy un dato. El 29 por ciento de los que empezaron tienen más de 55. No es tarde. Es el mejor momento. Porque tenés algo que los pibes no tienen. Experiencia real." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "La IA niveló la cancha para todos", timing_seconds: 10, script_text: "Antes para hacer esto necesitabas un programador, un diseñador, un equipo. Hoy la IA niveló la cancha. La única habilidad que necesitás es saber pedirle lo que querés. Y eso se aprende en un día." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "La IA democratizó el acceso", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "No tenés que renunciar" },
        { location: "beat_1", technique: "afirmación", phrase: "Si sabés enseñar algo, ya tenés el 90 por ciento resuelto" },
        { location: "beat_2", technique: "afirmación", phrase: "Eso no es un trabajo. Eso es supervivencia" },
        { location: "beat_3", technique: "afirmación", phrase: "Vos ponés el conocimiento. La IA pone el resto" },
        { location: "beat_4", technique: "afirmación", phrase: "No es tarde. Es el mejor momento" },
        { location: "beat_5", technique: "afirmación", phrase: "eso se aprende en un día" }
      ],
      ingredients_used: ["B#37", "D#53", "F#79", "E#63", "G#92"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 5 ───
  {
    title: "Tu hijo usa IA y vos no — ingeniero freelance con tarjetas al límite",
    script: {
      angle_family: "mecanismo",
      angle_specific: "4.3_antes_vs_despues_ia",
      body_type: "comparacion_caminos",
      segment: "B",
      funnel_stage: "TOFU",
      niche: "arquitectura / ingeniería independiente",
      model_sale_type: "matematica_simple",
      emotional_arc: "provocacion_evidencia",
      transition_text: "Te muestro el proceso completo en una clase gratuita.",
      total_duration_seconds: 75,
      word_count: 178,
      belief_change: {
        old_belief: "Solo puedo facturar si me contratan para una obra o proyecto",
        mechanism: "Comparación de camino lineal (presupuesto→obra) vs digital (guía→anuncio→WhatsApp) con matemática simple",
        new_belief: "Mi conocimiento de 20 años puede trabajar para mí 24 horas sin esperar que me llamen"
      },
      micro_beliefs: [
        { belief: "Si no me llaman, no facturo", installed_via: "descripción del camino lineal del freelancer", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Hasta un profesional con 20 años puede tener las tarjetas al límite", installed_via: "frase textual de tarjetas con problemas", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Puedo armar un producto con lo que ya sé", installed_via: "lista concreta de formatos posibles", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "La matemática cierra con números creíbles", installed_via: "cálculo simple de 1 dólar → 30 dólares/día", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "No tengo que dejar mi profesión, solo sumar un ingreso", installed_via: "aclaración de que es complementario", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "provocacion", hypothesis: "la comparación generacional IA genera urgencia", emotional_lever: "urgencia", script_text: "Tu hijo usa IA para hacer en 10 minutos lo que a vos te lleva 3 horas. ¿Y si usaras esa misma IA para vender lo que ya sabés?", timing_seconds: 7 },
        { variant_number: 2, hook_type: "dato_concreto", hypothesis: "el contraste entre experiencia y cero presencia digital", emotional_lever: "frustración", script_text: "Tenés 20 años de experiencia en arquitectura o ingeniería. Sabés cosas que no están en ningún manual. Y no estás vendiendo nada de eso. Hay gente que sí.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "contraintuitivo", hypothesis: "la paradoja del más capacitado que menos gana online", emotional_lever: "curiosidad", script_text: "El profesional más capacitado suele ser el que menos gana online. No porque no sepa. Sino porque nadie le mostró que lo que sabe es exactamente lo que se vende.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Si no me llaman, no facturo", timing_seconds: 12, script_text: "Hay dos caminos para un profesional independiente hoy. El primero es el que ya conocés. Presupuesto, obra, cliente. Si no te llaman, no facturás. Y cada mes arrancás de cero." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Hasta un profesional con 20 años puede tener las tarjetas al límite", timing_seconds: 15, script_text: "Alguien me dijo algo fuerte. \"Por primera vez en mi vida, tengo mis tarjetas con problemas.\" Un profesional con 20 años de carrera. Con problemas de tarjeta. ¿Sabés por qué? Porque su ingreso depende de que alguien lo llame.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Puedo armar un producto con lo que ya sé", timing_seconds: 15, script_text: "El segundo camino es este. Agarrás lo que ya sabés, lo organizás en una guía, una planilla, un curso corto. La IA te ayuda a armarlo. Y lo vendés con un anuncio que cuesta menos que un café por día." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "La matemática cierra con números creíbles", timing_seconds: 12, script_text: "Invertís un dólar. Te llegan 10 mensajes. Vendés a 2. Tu producto vale 15 dólares. Hacé la cuenta. Ahora multiplicá por 30 días." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "No tengo que dejar mi profesión, solo sumar un ingreso", timing_seconds: 11, script_text: "No te digo que dejes tu profesión. Te digo que tu conocimiento puede trabajar para vos las 24 horas. Sin presupuesto, sin obra, sin esperar que te llamen." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Los números cierran solos", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "pregunta_retórica", phrase: "¿Y si usaras esa misma IA para vender lo que ya sabés?" },
        { location: "beat_1", technique: "afirmación", phrase: "Si no te llaman, no facturás" },
        { location: "beat_2", technique: "afirmación", phrase: "su ingreso depende de que alguien lo llame" },
        { location: "beat_3", technique: "afirmación", phrase: "cuesta menos que un café por día" },
        { location: "beat_4", technique: "afirmación", phrase: "Hacé la cuenta" },
        { location: "beat_5", technique: "afirmación", phrase: "tu conocimiento puede trabajar para vos las 24 horas" }
      ],
      ingredients_used: ["B#29", "C#39", "D#48", "F#71", "G#88"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 6 ───
  {
    title: "Cocinar hasta romperse — chef que hace uber para llegar a fin de mes",
    script: {
      angle_family: "historia",
      angle_specific: "5.4_fracaso_leccion",
      body_type: "contraste_emocional",
      segment: "D",
      funnel_stage: "TOFU",
      niche: "gastronomía / chef independiente / catering",
      model_sale_type: "contraste_fisico",
      emotional_arc: "dolor_puro_esperanza",
      transition_text: "Te muestro cómo en una clase. Sin compromiso. Sin letra chica.",
      total_duration_seconds: 80,
      word_count: 192,
      belief_change: {
        old_belief: "Solo puedo ganar plata cocinando físicamente, cargando ollas y entregando viandas",
        mechanism: "Visualización de futuro donde el conocimiento gastronómico empaquetado reemplaza el desgaste físico",
        new_belief: "15 años de cocina son un activo digital que se vende sin mover una olla"
      },
      micro_beliefs: [
        { belief: "Mi cuerpo no aguanta más esta rutina", installed_via: "frase textual de Saúl sobre uber y cansancio", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "El peor panorama es dentro de 10 años", installed_via: "proyección a futuro del desgaste físico", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Mi conocimiento de cocina se empaqueta en un producto", installed_via: "lista de productos posibles con IA", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No necesito local ni inversión grande", installed_via: "eliminación de barreras físicas", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "El riesgo es ridículamente bajo", installed_via: "contraste con negocio físico y dato de 10 dólares", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "situacion_especifica", hypothesis: "el espejo de la rutina del chef genera identificación visceral", emotional_lever: "hartazgo", script_text: "Te levantás a las 5. Preparás 40 viandas. Entregás, cobrás, volvés a comprar mercadería. Y a la noche calculás si te quedó algo. Todos los días lo mismo.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "confesion", hypothesis: "la frase textual de Saúl genera conexión emocional directa", emotional_lever: "empatía", script_text: "Alguien me escribió algo que no me puedo sacar de la cabeza. \"Haciendo uber me lleva entre 7 y 8 horas. Pero muy cansado. Es la única que me saca de apuro.\" Me rompió.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "provocacion", hypothesis: "el desgaste físico como trigger urgente en segmento D", emotional_lever: "urgencia", script_text: "Tu cuerpo no aguanta más. Las rodillas, la espalda, las manos. ¿Cuántos años más vas a poder sostener esto? Hay una salida que no requiere fuerza física.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Mi cuerpo no aguanta más esta rutina", timing_seconds: 15, script_text: "Saúl tiene 39 años. Hace uber 7 u 8 horas por día. Muy cansado. \"Es la única que me saca de apuro.\" ¿Sabés cuántos Saúles hay? Miles. Gente que se rompe el lomo para llegar a fin de mes." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "El peor panorama es dentro de 10 años", timing_seconds: 12, script_text: "Y lo peor no es el cansancio. Lo peor es saber que dentro de 10 años vas a estar peor. Porque tu cuerpo no va a aguantar. Y no tenés un plan B.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Mi conocimiento de cocina se empaqueta en un producto", timing_seconds: 18, script_text: "Ahora imaginá esto. Agarrás lo que sabés de cocina, lo que aprendiste en 15 años de catering, de viandas, de menús para eventos. Y lo metés en un producto digital. Un recetario, un plan de comidas, una guía de emprendimiento gastronómico. Lo creás en una tarde con IA." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No necesito local ni inversión grande", timing_seconds: 10, script_text: "No necesitás cargar una olla más. No necesitás un local. No necesitás inversión grande. Un celular, tu conocimiento, y un sistema de 3 pasos." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "El riesgo es ridículamente bajo", timing_seconds: 15, script_text: "Un negocio físico te pide local, mercadería, empleados. Y el 90 por ciento cierra el primer año. Esto lo arrancás con 10 dólares y si no funciona perdiste menos que una salida a comer." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "El digital no pide cuerpo", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "Todos los días lo mismo" },
        { location: "beat_1", technique: "afirmación", phrase: "Gente que se rompe el lomo para llegar a fin de mes" },
        { location: "beat_2", technique: "afirmación", phrase: "tu cuerpo no va a aguantar" },
        { location: "beat_3", technique: "afirmación", phrase: "Lo creás en una tarde con IA" },
        { location: "beat_4", technique: "afirmación", phrase: "Un celular, tu conocimiento" },
        { location: "beat_5", technique: "afirmación", phrase: "perdiste menos que una salida a comer" }
      ],
      ingredients_used: ["B#23", "C#47", "D#49", "E#67", "H#101"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 7 ───
  {
    title: "El eterno Bucle — abogada que no puede salir del loop",
    script: {
      angle_family: "confrontacion",
      angle_specific: "3.3_ciclo_roto",
      body_type: "pregunta_y_respuesta",
      segment: "A",
      funnel_stage: "TOFU",
      niche: "abogacía / asesoría legal / derecho",
      model_sale_type: "lean_anti_riesgo",
      emotional_arc: "pregunta_tras_pregunta",
      transition_text: "Te lo muestro en una clase gratuita.",
      total_duration_seconds: 75,
      word_count: 185,
      belief_change: {
        old_belief: "Estoy atrapada en un bucle de impuestos y gastos que no me deja avanzar",
        mechanism: "Formato Q&A que destruye objeciones una por una + modelo lean donde se valida antes de crear",
        new_belief: "Puedo salir del bucle con un proyecto que valida antes de invertir"
      },
      micro_beliefs: [
        { belief: "No necesito renunciar ni saber de marketing", installed_via: "cadena de noes directa", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Estoy en un bucle que no se rompe solo", installed_via: "frase textual de Daniela sobre el eterno bucle", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Mi conocimiento de leyes tiene demanda digital", installed_via: "ejemplos de temas legales que la gente busca", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "Si no vendo, no pierdo nada", installed_via: "modelo lean que valida antes de crear", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "Gente con menos conocimiento ya lo hace", installed_via: "prueba social por contraste de conocimiento", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "negacion_directa", hypothesis: "la cadena de noes destruye todas las barreras de una abogada", emotional_lever: "permiso", script_text: "No tenés que cerrar tu estudio. No tenés que dejar de ejercer. No tenés que saber de marketing. Lo único que necesitás es saber algo que otro quiera aprender. Y vos sabés de leyes.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "pregunta_incomoda", hypothesis: "la abogada se identifica con el asesoramiento gratis", emotional_lever: "reconocimiento", script_text: "¿Cuántas veces un conocido te pidió asesoramiento gratis? ¿Cuántas veces le explicaste algo de herencias, contratos, monotributo? Eso que regalás se vende todos los días en internet.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "situacion_especifica", hypothesis: "la frase textual de Daniela genera identificación directa", emotional_lever: "hartazgo", script_text: "Daniela tiene 55 años. Tiene un comercio a la calle. Los impuestos la abruman. \"Es estar en un eterno Bucle.\" Si te sentís identificada, esto es para vos.", timing_seconds: 7 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "No necesito renunciar ni saber nada nuevo", timing_seconds: 12, script_text: "\"Jesús, ¿necesito renunciar?\" No. \"¿Necesito saber programar?\" No. \"¿Necesito seguidores?\" No. \"¿Necesito invertir mucha plata?\" Tampoco." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Estoy en un bucle que no se rompe solo", timing_seconds: 15, script_text: "Daniela me escribió algo que repiten muchos. \"Tengo un comercio a la calle, me abruman los impuestos. Es estar en un eterno Bucle.\" ¿Sabés qué es un bucle? Es hacer lo mismo esperando un resultado distinto.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Mi conocimiento de leyes tiene demanda digital", timing_seconds: 18, script_text: "Y la salida no es trabajar más. Es trabajar diferente. Vos sabés de derecho laboral, de contratos, de herencias, de monotributo. Eso que para vos es obvio, para otros es oro. La IA te ayuda a organizarlo en una guía clara y en un par de horas lo tenés listo." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "Si no vendo, no pierdo nada", timing_seconds: 12, script_text: "\"¿Y si no vendo nada?\" Mirá, te voy a ser honesto. No te puedo garantizar ventas. Pero la primera regla que enseño es: se valida antes de crear. Si nadie lo quiere, no perdiste ni tiempo ni plata. Ese es el sistema. Bajo riesgo." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "Gente con menos conocimiento ya lo hace", timing_seconds: 10, script_text: "Lo que sí te puedo decir es que gente con menos conocimiento que vos ya lo está haciendo. Y no porque sean genios. Porque tienen un camino de 3 pasos." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Bajo riesgo, resultado rápido", timing_seconds: 8, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "beat_1", technique: "pregunta_retórica", phrase: "¿Necesito renunciar?" },
        { location: "beat_2", technique: "afirmación", phrase: "Es hacer lo mismo esperando un resultado distinto" },
        { location: "beat_3", technique: "afirmación", phrase: "Eso que para vos es obvio, para otros es oro" },
        { location: "beat_4", technique: "afirmación", phrase: "te voy a ser honesto" },
        { location: "beat_4", technique: "afirmación", phrase: "no perdiste ni tiempo ni plata" },
        { location: "beat_5", technique: "afirmación", phrase: "tienen un camino de 3 pasos" }
      ],
      ingredients_used: ["B#30", "C#44", "D#53", "F#71", "E#63"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 8 ───
  {
    title: "Reinventarse a los 62 — viuda artesana que necesita empezar de cero",
    script: {
      angle_family: "oportunidad",
      angle_specific: "2.5_caso_real_trending",
      body_type: "un_dia_en_la_vida",
      segment: "D",
      funnel_stage: "TOFU",
      niche: "artesanía / manualidades / crochet",
      model_sale_type: "eliminacion_barreras",
      emotional_arc: "futuro_sensorial",
      transition_text: "Te muestro cómo funciona en una clase gratuita. Paso a paso. A tu ritmo.",
      total_duration_seconds: 80,
      word_count: 185,
      belief_change: {
        old_belief: "Con 62 años, viuda, sin experiencia laboral, no puedo reinventarme",
        mechanism: "Dato del 29% mayores de 55 + future pacing sensorial de un día vendiendo desde el celular",
        new_belief: "Mis manos ya saben crear; solo me falta un camino para vender lo que hago"
      },
      micro_beliefs: [
        { belief: "Hay miles de mujeres como yo en esta situación", installed_via: "frase textual de María Marta que genera identificación", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Tengo un talento real pero sin camino claro", installed_via: "reconocimiento del talento manual sin canal de venta", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Mi día puede verse completamente distinto", installed_via: "future pacing sensorial de ventas por celular", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No necesito nada que no tenga ya", installed_via: "eliminación de barreras una por una", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "Esto es dignidad, no promesa de lujo", installed_via: "cierre con la posibilidad de elegir", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "dato_concreto", hypothesis: "el dato del 29% de mayores de 55 genera permiso inmediato", emotional_lever: "permiso", script_text: "Tenés más de 50 y pensás que ya es tarde. Te doy un dato. El 29 por ciento de los que empezaron con esto tienen más de 55 años. No es tarde. Escuchame.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "historia_mini", hypothesis: "la historia real de María Marta genera empatía instantánea", emotional_lever: "empatía", script_text: "María Marta tiene 62 años. Es recientemente viuda. Durante 25 años le pidieron que no trabaje. Y ahora necesita reinventarse. En forma urgente. Esta historia puede ser la tuya.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "confesion", hypothesis: "la honestidad sobre la dificultad genera confianza", emotional_lever: "confianza", script_text: "Yo no voy a decirte que es fácil empezar de nuevo. Pero sí te puedo decir que hay una forma que no requiere experiencia, ni plata, ni tecnología. Requiere lo que ya sabés.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "Hay miles de mujeres como yo en esta situación", timing_seconds: 15, script_text: "\"Soy recientemente viuda. Durante 25 años me pidieron que no trabaje. Debo reinventarme en forma urgente.\" María Marta tiene 62 años. Y esas palabras me partieron." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Tengo un talento real pero sin camino claro", timing_seconds: 12, script_text: "Porque hay miles de mujeres en la misma situación. Con un talento real, con manos que saben crear, pero sin un camino claro para cobrar por eso.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Mi día puede verse completamente distinto", timing_seconds: 18, script_text: "Ahora imaginá tu día así. Te levantás sin alarma. Desayunás tranquila. Abrís el celular y tenés 3 mensajes de gente que quiere comprar tu guía de crochet, tus patrones, tus tutoriales. No saliste de tu casa. No cargaste nada. No dependés de nadie." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No necesito nada que no tenga ya", timing_seconds: 12, script_text: "Sin mostrar tu cara. Sin saber de tecnología. Sin seguidores. Sin inversión grande. La IA hace el trabajo pesado. Vos solo ponés lo que ya sabés hacer con las manos." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "Esto es dignidad, no promesa de lujo", timing_seconds: 13, script_text: "Esto no es una promesa de lujo. Es la posibilidad de elegir. De no depender de nadie para llegar a fin de mes." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Las barreras no existen", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "pensás que ya es tarde" },
        { location: "beat_1", technique: "afirmación", phrase: "esas palabras me partieron" },
        { location: "beat_2", technique: "afirmación", phrase: "sin un camino claro para cobrar por eso" },
        { location: "beat_3", technique: "afirmación", phrase: "No saliste de tu casa. No cargaste nada" },
        { location: "beat_4", technique: "afirmación", phrase: "lo que ya sabés hacer con las manos" },
        { location: "beat_5", technique: "afirmación", phrase: "la posibilidad de elegir" }
      ],
      ingredients_used: ["B#31", "D#53", "F#79", "H#101", "G#92"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 9 ───
  {
    title: "Vendiste tus ahorros para otro curso — emprendedor MLM quemado",
    script: {
      angle_family: "confrontacion",
      angle_specific: "3.7_modelo_equivocado",
      body_type: "demolicion_alternativas",
      segment: "B",
      funnel_stage: "TOFU",
      niche: "emprendedor MLM / Hotmart / Shopify frustrado",
      model_sale_type: "cementerio_modelos",
      emotional_arc: "confrontacion_directa",
      transition_text: "Te muestro el proceso completo en una clase gratuita.",
      total_duration_seconds: 85,
      word_count: 200,
      belief_change: {
        old_belief: "Ya probé todo y nada funciona, soy yo el problema",
        mechanism: "Demolición de alternativas (dropshipping/MLM/afiliación) + dato real del 11% + historia de Jesús perdiendo $150K",
        new_belief: "No era yo, era el modelo. Productos digitales tiene márgenes reales y riesgo mínimo"
      },
      micro_beliefs: [
        { belief: "No soy el único que se quemó con otros modelos", installed_via: "dato del 11% que venían de Hotmart/MLM/Shopify", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Hasta Jesús la pasó mal y perdió plata", installed_via: "historia real de perder $150K en publicidad", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Cada modelo alternativo tiene un problema estructural", installed_via: "demolición de dropshipping, MLM, afiliación", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "Productos digitales es distinto porque el margen es mío", installed_via: "contraste de márgenes y stock", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "El riesgo es mínimo y se valida antes", installed_via: "modelo lean de 5 dólares", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "historia_mini", hypothesis: "el anti-testimonio con dato real genera credibilidad", emotional_lever: "curiosidad", script_text: "No te voy a mostrar capturas de facturación. No te voy a prometer que vas a ganar 10 mil dólares. Te voy a contar por qué el 11 por ciento de las personas que me compraron ya habían probado Hotmart, Shopify, MLM o Amazon FBA. Y por qué esta vez fue distinto.", timing_seconds: 9 },
        { variant_number: 2, hook_type: "pregunta_incomoda", hypothesis: "enumerar intentos fallidos genera identificación directa", emotional_lever: "reconocimiento", script_text: "¿Cuánta plata perdiste en negocios que prometían todo? ¿Dropshipping? ¿Network? ¿Esa página de afiliados que nunca te dio un peso? Yo también perdí. Te cuento qué aprendí.", timing_seconds: 8 },
        { variant_number: 3, hook_type: "provocacion", hypothesis: "la frase 'vendí mis ahorros' genera empatía inmediata", emotional_lever: "empatía", script_text: "Vendiste tus ahorros para inscribirte en algo. Y no funcionó. Pero el problema no fuiste vos. Fue el modelo.", timing_seconds: 7 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "No soy el único que se quemó con otros modelos", timing_seconds: 12, script_text: "11 de cada 100 personas que se sumaron a esto venían de intentar con Hotmart, Shopify, MLM o Amazon. Ya habían gastado plata. Ya habían perdido tiempo. Ya estaban quemados." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Hasta Jesús la pasó mal y perdió plata", timing_seconds: 15, script_text: "Y te voy a ser honesto. Yo también la pasé mal. Perdí 150 mil dólares en publicidad que no funcionó. \"Se fue una casa\", básicamente. Así que cuando alguien me dice \"vendí mis ahorros para inscribirme\", lo entiendo. No de oído. De vivirlo.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Cada modelo alternativo tiene un problema estructural", timing_seconds: 15, script_text: "El problema con dropshipping es que competís con Amazon. Con MLM, el que gana es el que entró primero. Con afiliación, los márgenes son tan chicos que laburás gratis." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "Productos digitales es distinto porque el margen es mío", timing_seconds: 15, script_text: "Productos digitales es distinto. Vos creás algo con lo que sabés. La IA te ayuda. No necesitás stock, ni envíos, ni proveedores. Lo vendés por WhatsApp. Y el margen es tuyo." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "El riesgo es mínimo y se valida antes", timing_seconds: 15, script_text: "\"Ya invertí tanto que una deuda más no cambia nada.\" Mirá, esto no te pide deuda. Son 5 dólares el taller. Y la primera regla es: se vende antes de crear. Así no arriesgás nada." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "Los otros modelos tienen techo, este no", timing_seconds: 13, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "lead", technique: "afirmación", phrase: "No te voy a mostrar capturas de facturación" },
        { location: "beat_1", technique: "afirmación", phrase: "Ya habían gastado plata. Ya habían perdido tiempo" },
        { location: "beat_2", technique: "afirmación", phrase: "lo entiendo. No de oído. De vivirlo" },
        { location: "beat_3", technique: "afirmación", phrase: "Con MLM, el que gana es el que entró primero" },
        { location: "beat_4", technique: "afirmación", phrase: "Lo vendés por WhatsApp. Y el margen es tuyo" },
        { location: "beat_5", technique: "afirmación", phrase: "Son 5 dólares el taller" }
      ],
      ingredients_used: ["B#30", "C#44", "D#51", "F#72", "E#70"],
      cta_blocks: CTA_BLOCKS
    }
  },

  // ─── GUION 10 ───
  {
    title: "Cuidar hasta quebrarse — enfermera que no puede más con el cuerpo",
    script: {
      angle_family: "identidad",
      angle_specific: "1.3_desempleado_crisis",
      body_type: "analogia_extendida",
      segment: "D",
      funnel_stage: "TOFU",
      niche: "cuidadora / enfermería domiciliaria",
      model_sale_type: "democratizacion_ia",
      emotional_arc: "analogia_principio_fin",
      transition_text: "Te muestro cómo funciona en una clase gratuita. Paso a paso. Sin presión.",
      total_duration_seconds: 80,
      word_count: 195,
      belief_change: {
        old_belief: "Lo que sé de cuidado no se puede vender, solo se ejerce con el cuerpo",
        mechanism: "Analogía del mate (preparar con cuidado algo valioso para otro) + dato de que la IA niveló la cancha",
        new_belief: "20 años cuidando gente me dieron un conocimiento que se vende como guía digital sin cargar a nadie"
      },
      micro_beliefs: [
        { belief: "Mariano de 66 años se convenció, yo también puedo", installed_via: "frase textual de Mariano que genera permiso por edad", persuasion_function: "identificacion", section_name: "Identificación" },
        { belief: "Mi trabajo de cuidado se paga con monedas y vale oro", installed_via: "contraste entre el valor real y el pago miserable", persuasion_function: "quiebre", section_name: "Quiebre" },
        { belief: "Mi conocimiento se puede organizar y vender", installed_via: "lista de temas de cuidado que se empaquetan", persuasion_function: "mecanismo", section_name: "Mecanismo" },
        { belief: "No necesito título formal para esto", installed_via: "20 años de experiencia valen más que un título", persuasion_function: "demolicion", section_name: "Demolición" },
        { belief: "La IA niveló la cancha para todos", installed_via: "contraste antes/después de IA", persuasion_function: "prueba", section_name: "Prueba" }
      ],
      hooks: [
        { variant_number: 1, hook_type: "dato_concreto", hypothesis: "la frase de Mariano genera intriga y permiso por edad", emotional_lever: "permiso", script_text: "Tenés 50 años y pensás que la tecnología no es para vos. Mariano tiene 66. Al principio no le gusté. Pero después se convenció. Escuchame un minuto.", timing_seconds: 8 },
        { variant_number: 2, hook_type: "situacion_especifica", hypothesis: "la rutina de la cuidadora genera identificación visceral", emotional_lever: "hartazgo", script_text: "Te levantás a las 5. Cuidás a alguien que no es tu familia. Le das de comer, lo bañás, lo acompañás. Volvés a tu casa rota. Y mañana, lo mismo. Hay algo que podés hacer con lo que ya aprendiste cuidando.", timing_seconds: 9 },
        { variant_number: 3, hook_type: "contraintuitivo", hypothesis: "la paradoja de saber mucho y cobrar poco", emotional_lever: "indignación", script_text: "Las personas que más saben de cuidado y salud son las que peor cobran. No porque no valgan. Sino porque nadie les mostró que ese conocimiento se vende todos los días en internet.", timing_seconds: 8 }
      ],
      development: {
        sections: [
          { section_name: "Identificación", persuasion_function: "identificacion", micro_belief: "La analogía del mate me conecta con algo que sé hacer bien", timing_seconds: 15, script_text: "¿Sabés lo que es un mate? Lo preparás con cuidado. Calentás el agua justa. Ponés la yerba de una forma especial. Y se lo dás a alguien. Cuando cuidás a una persona hacés exactamente lo mismo. Ponés atención, paciencia, conocimiento que aprendiste con los años." },
          { section_name: "Quiebre", persuasion_function: "quiebre", micro_belief: "Mi trabajo se paga con monedas y vale oro", timing_seconds: 15, script_text: "La diferencia es que el mate se comparte con amor. Pero tu trabajo de cuidado se paga con monedas. Alguien me escribió: \"Al principio no me gustaste. Pero luego me convenciste.\" Mariano, 66 años. ¿Sabés qué lo convenció? Que le mostré que lo que ya sabe hacer se puede empaquetar y vender.", is_turning_point: true },
          { section_name: "Mecanismo", persuasion_function: "mecanismo", micro_belief: "Mi conocimiento se puede organizar y vender", timing_seconds: 15, script_text: "Vos sabés de cuidado de adultos mayores, de alimentación especial, de rutinas de rehabilitación, de acompañamiento. Con la IA podés organizar todo eso en una guía paso a paso y venderla desde tu celular. Sin cargar a nadie. Sin horario." },
          { section_name: "Demolición", persuasion_function: "demolicion", micro_belief: "No necesito título formal para esto", timing_seconds: 12, script_text: "No necesitás ser profesional de la salud para esto. Necesitás saber algo que otro quiera aprender. Y 20 años cuidando gente te dieron más conocimiento del que te imaginás." },
          { section_name: "Prueba", persuasion_function: "prueba", micro_belief: "La IA niveló la cancha para todos", timing_seconds: 13, script_text: "Antes necesitabas saber programar, diseñar, hacer marketing. Hoy la IA hace todo eso. La cancha se niveló." },
          { section_name: "Venta del modelo", persuasion_function: "venta_modelo", micro_belief: "La IA democratizó el acceso para todos", timing_seconds: 10, script_text: "" }
        ]
      },
      micro_yes_chain: [
        { location: "beat_1", technique: "afirmación", phrase: "Lo preparás con cuidado" },
        { location: "beat_1", technique: "afirmación", phrase: "conocimiento que aprendiste con los años" },
        { location: "beat_2", technique: "afirmación", phrase: "tu trabajo de cuidado se paga con monedas" },
        { location: "beat_3", technique: "afirmación", phrase: "Sin cargar a nadie. Sin horario" },
        { location: "beat_4", technique: "afirmación", phrase: "20 años cuidando gente te dieron más conocimiento del que te imaginás" },
        { location: "beat_5", technique: "afirmación", phrase: "La cancha se niveló" }
      ],
      ingredients_used: ["B#23", "D#53", "F#76", "E#63", "H#101"],
      cta_blocks: CTA_BLOCKS
    }
  }
];

// ─── SAVE ALL ───
let saved = 0;
let failed = 0;

for (let i = 0; i < guiones.length; i++) {
  const g = guiones[i];
  const payload = JSON.stringify({
    title: g.title,
    batch: BATCH,
    script: g.script
  });

  const tmpFile = `/tmp/batch3-guion-${i + 1}.json`;
  writeFileSync(tmpFile, payload);

  try {
    const result = execFileSync("node", [SAVE_SCRIPT, tmpFile], {
      encoding: "utf-8",
      timeout: 30000
    });
    console.log(`✅ Guion ${i + 1}: ${g.title}`);
    if (result.trim()) console.log(result.trim().split("\n").map(l => `   ${l}`).join("\n"));
    saved++;
  } catch (err) {
    console.log(`❌ Guion ${i + 1}: ${g.title}`);
    console.log(err.stderr || err.stdout || err.message);
    failed++;
  }
  console.log("");
}

console.log(`\n=== RESULTADO: ${saved} guardados, ${failed} fallidos ===`);
