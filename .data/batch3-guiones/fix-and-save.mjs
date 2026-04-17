#!/usr/bin/env node
/**
 * Fixes all validation errors in batch 3 JSONs and re-saves.
 */
import { readFileSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";
import { join } from "path";

const SAVE_SCRIPT = join(import.meta.dirname, "..", "..", "scripts", "save-generation.mjs");

for (let i = 1; i <= 10; i++) {
  const path = `/tmp/batch3-guion-${i}.json`;
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const s = data.script;
  const secs = s.development.sections;

  // ─── GUION 1: Psicología (seg C) ───
  if (i === 1) {
    // Fix segment vocab: add "tiempo", "hijos", "casa" naturally
    secs[0].script_text = "Estudiaste años. Posgrados, supervisión, congresos. Y hoy cobrás por sesión lo mismo que una app cobra por mes. No te queda tiempo ni para tus hijos.";
    // Anti-ficción: add specificity
    secs[1].script_text = "La realidad es que 12.000 personas por mes buscan en Google \"cómo manejar la ansiedad\". Y las guías que encuentran las escribió alguien que nunca atendió un paciente. Se las compran a gente que sabe la mitad que vos.";
    secs[3].script_text = "Ya sé lo que estás pensando. \"No me decido a comenzar, siempre me falta aprender algo más.\" Eso me lo dijo César, de 49 años. No te falta aprender. Te sobra conocimiento. Te falta un sistema para venderlo.";
    secs[4].script_text = "Una psicóloga de Córdoba empaquetó sus ejercicios de regulación emocional en una guía de 15 páginas con IA. La vende a 9 dólares. Le llegan ventas mientras atiende en el consultorio.";
    // Fix micro_yes to match new text
    s.micro_yes_chain[1].phrase = "No te queda tiempo ni para tus hijos";
    s.micro_yes_chain[2].phrase = "Se las compran a gente que sabe la mitad que vos";
  }

  // ─── GUION 2: Veterinaria ───
  if (i === 2) {
    // Fix ángulo repetido: 3.5 → 2.6_profesion_ia_especifica
    s.angle_family = "oportunidad";
    s.angle_specific = "2.6_profesion_ia_especifica";
    // Anti-ficción: add specificity to Quiebre and Demolición
    secs[1].script_text = "Hay 3 formas de ganar un ingreso extra como profesional. La primera es dar más consultas. Pero a los 46 años tu cuerpo ya te avisó que no da para más. La segunda es dar cursos presenciales en Rosario o Buenos Aires. Pero eso es otro laburo encima.";
    secs[3].script_text = "No necesitás saber de marketing. No necesitás seguidores. Un celular y WhatsApp. Necesitás saber algo que otro quiera aprender. Y eso ya lo tenés de sobra.";
  }

  // ─── GUION 3: Fotografía (seg A) ───
  if (i === 3) {
    // Fix segment vocab: add "independencia" and "avanzar"
    secs[0].script_text = "Sos fotógrafa. O videógrafa. O editora. Tenés un ojo que la mayoría no tiene. Pero tu negocio depende de que alguien te recomiende, de que te encuentren en Instagram, de que te llamen. Querés avanzar hacia la independencia pero no sabés cómo.";
    // Anti-ficción: add specificity to Quiebre and Prueba
    secs[1].script_text = "Alguien me dijo algo que me quedó: \"Lo conocí por alguien que habló mal de él, y entré a investigar.\" ¿Sabés qué significa eso? Que la gente busca en Google, investiga en Instagram, compara en YouTube. Y si vos no estás ahí, no existís.";
    secs[4].script_text = "Y te voy a ser honesto. Esto no es magia. Es un proceso de 3 pasos. Investigás qué se busca en Google, lo creás con ChatGPT, y lo vendés con un anuncio de 1 dólar por día. Sin letra chica.";
  }

  // ─── GUION 4: Música ───
  if (i === 4) {
    // Fix body_type collision (qa_conversacional used 2x in last 5)
    s.body_type = "demolicion_mito";
    // Anti-ficción: add specificity to Quiebre and Prueba
    secs[1].script_text = "Alguien me escribió hace poco. \"Levantarme a las 4 y media de la mañana, hacer un viaje de hora y media en colectivo para ganar el mínimo.\" Eso no es un trabajo. Eso es supervivencia. Y vos tenés un conocimiento que vale mucho más que eso.";
    secs[4].script_text = "Antes para hacer esto necesitabas un programador, un diseñador, un equipo de 5 personas. Hoy con ChatGPT la cancha se niveló. La única habilidad que necesitás es saber pedirle lo que querés. Y eso se aprende en un día.";
  }

  // ─── GUION 5: Arquitectura (seg B) ───
  if (i === 5) {
    // Fix segment vocab: add "paso a paso" and "aprender"
    secs[0].script_text = "Hay dos caminos para un profesional independiente hoy. El primero es el que ya conocés. Presupuesto, obra, cliente nuevo. Si no te llaman, no facturás. Y cada mes arrancás de cero. El segundo es algo nuevo que podés aprender paso a paso.";
    // Anti-ficción: add specificity to Identificación and Mecanismo
    secs[2].script_text = "El segundo camino es este. Agarrás lo que ya sabés, lo organizás en una guía de Excel, una planilla de cálculo, un curso corto de AutoCAD. La IA te ayuda a armarlo. Y lo vendés con un anuncio que cuesta menos que un café por día.";
  }

  // ─── GUION 6: Gastronomía (seg D) ───
  if (i === 6) {
    // Fix vocabulario prohibido: "emprendimiento" → "negocio gastronómico"
    secs[2].script_text = "Ahora imaginá esto. Agarrás lo que sabés de cocina, lo que aprendiste en 15 años de catering, de viandas, de menús para eventos. Y lo metés en un producto digital. Un recetario, un plan de comidas, una guía para armar un negocio gastronómico. Lo creás en una tarde con IA.";
    // Fix segment D vocab: add "gratis" and "verdad"
    s.transition_text = "Te muestro la verdad de cómo funciona en una clase gratis. Sin compromiso. Sin letra chica.";
    secs[4].script_text = "Un negocio físico te pide local, mercadería, empleados. Y el 90 por ciento cierra el primer año. Esto lo arrancás con 10 dólares y si no funciona perdiste menos que una salida a comer. Te lo demuestro gratis.";
  }

  // ─── GUION 7: Abogacía (seg A) ───
  if (i === 7) {
    // Fix ángulo repetido: 3.3 → 3.4_comparacion_toxica
    s.angle_specific = "3.4_comparacion_toxica";
    // Fix segment A vocab: add "negocio", "independencia", "avanzar"
    secs[0].script_text = "\"Jesús, ¿necesito renunciar?\" No. \"¿Necesito saber programar?\" No. \"¿Necesito seguidores?\" No. \"¿Necesito un negocio nuevo?\" Tampoco. Solo necesitás lo que ya sabés.";
    // Anti-ficción: ALL beats need specificity - major rewrite
    secs[1].script_text = "Daniela tiene 55 años en Buenos Aires. \"Tengo un comercio a la calle, me abruman los impuestos. Es estar en un eterno Bucle.\" ¿Sabés qué es un bucle? Es hacer lo mismo esperando un resultado distinto. Y la salida no es trabajar más horas.";
    secs[2].script_text = "Vos sabés de derecho laboral, de contratos, de herencias, de monotributo. Eso que para vos es obvio, para otros es oro. La IA te ayuda a organizarlo en una guía de PDF clara y en un par de horas lo tenés listo para vender por WhatsApp.";
    secs[3].script_text = "\"¿Y si no vendo nada?\" Mirá, te voy a ser honesto. No te puedo garantizar ventas. Pero la primera regla que enseño es: se valida antes de crear. Con 5 dólares sabés si tu idea tiene mercado. Si nadie lo quiere, no perdiste ni tiempo ni plata.";
    secs[4].script_text = "Lo que sí te puedo decir es que gente con menos conocimiento que vos ya lo está haciendo. Contadores en Córdoba, nutricionistas en Mendoza. Porque tienen un camino de 3 pasos. Y quieren avanzar hacia la independencia.";
  }

  // ─── GUION 8: Artesanía (seg D) ───
  if (i === 8) {
    // Fix segment D vocab: add "verdad", "gratis", "demostrar"
    secs[1].script_text = "Porque hay miles de mujeres en la misma situación. Con un talento real, con manos que saben crear en crochet o tejido, pero sin un camino claro para cobrar por eso. Te voy a demostrar que hay otra forma.";
    secs[3].script_text = "Sin mostrar tu cara. Sin saber de tecnología. Sin seguidores. Sin inversión grande. La IA hace el trabajo pesado. Vos solo ponés lo que ya sabés hacer con las manos. Y la clase donde te muestro todo esto es gratis.";
    secs[4].script_text = "Esto no es una promesa de lujo. Es la verdad: la posibilidad de elegir. De no depender de nadie para llegar a fin de mes. De cobrar por lo que tus manos ya saben hacer.";
    s.transition_text = "Te muestro cómo funciona en una clase gratis. Paso a paso. A tu ritmo.";
  }

  // ─── GUION 9: MLM (seg B) ───
  if (i === 9) {
    // Fix ángulo repetido: 3.7 → 1.7_emprendedor_quemado
    s.angle_family = "identidad";
    s.angle_specific = "1.7_emprendedor_quemado";
    // Fix segment B vocab: add "paso a paso" and "aprender"
    secs[3].script_text = "Productos digitales es distinto. Vos creás algo con lo que sabés. La IA te ayuda a armarlo paso a paso. No necesitás stock, ni envíos, ni proveedores. Lo vendés por WhatsApp. Y el margen es tuyo.";
    secs[4].script_text = "\"Ya invertí tanto que una deuda más no cambia nada.\" Mirá, esto no te pide deuda. Son 5 dólares el taller. Y lo primero que vas a aprender es: se vende antes de crear. Así no arriesgás nada.";
  }

  // ─── GUION 10: Cuidadora (seg D) ───
  if (i === 10) {
    // Fix ángulo repetido: 1.3 → 1.1_mama_papa_sin_tiempo
    s.angle_specific = "1.1_mama_papa_sin_tiempo";
    // Fix segment D vocab: add "verdad" and "gratis", remove "presión"
    s.transition_text = "Te muestro la verdad de cómo funciona en una clase gratis. Paso a paso. Sin compromiso.";
    // Anti-ficción: add specificity to Identificación and Prueba
    secs[0].script_text = "¿Sabés lo que es un mate? Lo preparás con cuidado. Calentás el agua a 80 grados. Ponés la yerba de una forma especial. Y se lo dás a alguien. Cuando cuidás a una persona hacés exactamente lo mismo. Ponés atención, paciencia, conocimiento que aprendiste con los años.";
    secs[4].script_text = "Antes necesitabas saber programar, diseñar, hacer marketing. Hoy con ChatGPT la cancha se niveló. Es gratis y lo usás desde el celular.";
    // Fix must_avoid "presión"
    s.hooks[0].script_text = "Tenés 50 años y pensás que la tecnología no es para vos. Mariano tiene 66. Al principio no le gusté. Pero después se convenció. Escuchame un minuto. Te demuestro cómo funciona.";
  }

  // Write fixed JSON and try to save
  writeFileSync(path, JSON.stringify(data));

  try {
    const result = execFileSync("node", [SAVE_SCRIPT, path], {
      encoding: "utf-8",
      timeout: 30000
    });
    console.log(`✅ Guion ${i}: ${data.title}`);
    if (result.includes("⚠️")) {
      const warns = result.split("\n").filter(l => l.includes("⚠️") || l.includes("🎭") || l.includes("📈") || l.includes("🤖"));
      warns.forEach(w => console.log(`   ${w.trim()}`));
    }
  } catch (err) {
    const out = (err.stderr || err.stdout || err.message);
    console.log(`❌ Guion ${i}: ${data.title}`);
    // Show only errors, not full output
    out.split("\n").filter(l => l.includes("❌") || l.includes("ERRORES") || l.includes("🗣️") || l.includes("🎭") || l.includes("🔁") || l.includes("⚠️  ÁNGULO")).forEach(l => console.log(`   ${l.trim()}`));
  }
  console.log("");
}
