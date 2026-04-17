#!/usr/bin/env node
/**
 * Updates generation JSONs with corrected teleprompter content.
 * Maps each teleprompter .md to its generation JSON and updates:
 * - hooks[].script_text
 * - development.sections[].script_text
 * - transition_text
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA = join(process.cwd(), '.data');
const GEN = join(DATA, 'generations');
const TEL = join(DATA, 'teleprompter-v2.0');

// Mapping: teleprompter file → generation JSON id
const MAP = [
  { md: 'b2-04-amo-coser-futuro-silla.md', id: '4fd690f2-e862-4f60-a9d5-e08931b75b7b' },
  { md: 'b2-03-nadie-valora-peluquera.md', id: 'b505863f-b86f-4bc6-85f8-fc5fb22a0e53' },
  { md: 'b2-05-solo-soy-mama.md', id: '59aed381-6428-4a49-9914-adb2636256a3' },
  { md: 'b2-06-cambio-de-epoca-jubilados.md', id: '4155f615-5f12-4a1f-ab89-45cac5b728d3' },
  { md: 'b2-08-2-comercios-vender-internet.md', id: '39594d9a-9796-440b-abbd-a240eccaebd5' },
  { md: 'b2-10-ya-probe-4-cursos-feria.md', id: 'fe9e9d45-38f9-456d-b670-c550bcd5be0e' },
  { md: 'b3-08-viuda-artesana-62.md', id: '7c44d989-f222-48ae-a51e-4a3aba9a43fe' },
  { md: 'b2-01-cobras-15-la-hora-docente.md', id: '5d63b660-5440-4564-aa20-bd18e27df049' },
];

function parseTeleprompter(text) {
  // Split at "---" to separate body from hooks section
  const [bodyPart, hooksPart] = text.split('\n---\n');

  // Parse body: join teleprompter lines into flowing text per section
  // Sections are separated by double blank lines
  const bodyLines = bodyPart.trim().split('\n');
  const bodyText = bodyLines
    .map(l => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // normalize multiple blanks

  // Parse hooks from the hooks section
  const hooks = [];
  if (hooksPart) {
    const hookBlocks = hooksPart.split(/\nH\d+ \(/);
    for (let i = 1; i < hookBlocks.length; i++) {
      const block = hookBlocks[i];
      const typeMatch = block.match(/^([^)]+)\)?.*?:/);
      const type = typeMatch ? typeMatch[1].replace(' — DEFAULT', '').trim() : 'unknown';
      const isDefault = block.includes('DEFAULT');
      // Get the text after the first colon+newline
      const textStart = block.indexOf(':\n');
      const hookText = textStart >= 0
        ? block.substring(textStart + 2).trim()
        : block.trim();
      hooks.push({ type, text: hookText, isDefault });
    }
  }

  return { bodyText, hooks };
}

function splitBodyIntoSections(bodyText) {
  // Split body into sections by double newlines
  const paragraphs = bodyText.split('\n\n').filter(p => p.trim());

  // We need to map paragraphs to: puente, quiebre, mecanismo, demolicion, prueba, venta_modelo, transicion
  // The structure varies per script, but generally:
  // - First 1-2 paragraphs = lead (hook integrated)
  // - Next paragraph = puente
  // - Then quiebre, mecanismo, demolicion, prueba
  // - Last 1-2 paragraphs = transition + CTA

  // Return all paragraphs joined as flowing text for each section
  return paragraphs;
}

function joinTeleprompterLines(text) {
  // Convert teleprompter format (short lines) to flowing sentences
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([.,?!;:])/g, '$1')
    .trim();
}

for (const { md, id } of MAP) {
  try {
    const teleText = readFileSync(join(TEL, md), 'utf-8');
    const jsonPath = join(GEN, `${id}.json`);
    const gen = JSON.parse(readFileSync(jsonPath, 'utf-8'));

    const { bodyText, hooks: parsedHooks } = parseTeleprompter(teleText);

    // Split body into paragraphs (separated by double newlines)
    const paragraphs = bodyText.split('\n\n').filter(p => p.trim());

    // Update hooks in JSON
    if (gen.script.hooks && parsedHooks.length > 0) {
      for (let i = 0; i < Math.min(gen.script.hooks.length, parsedHooks.length); i++) {
        const hookFlowing = joinTeleprompterLines(parsedHooks[i].text);
        gen.script.hooks[i].script_text = hookFlowing;
        // Update hook_type if we parsed it
        if (parsedHooks[i].type && parsedHooks[i].type !== 'unknown') {
          gen.script.hooks[i].hook_type = parsedHooks[i].type;
        }
      }
      // If we have more hooks than before, add them
      while (gen.script.hooks.length < parsedHooks.length) {
        const h = parsedHooks[gen.script.hooks.length];
        gen.script.hooks.push({
          variant_number: gen.script.hooks.length + 1,
          hook_type: h.type,
          hypothesis: '',
          emotional_lever: '',
          script_text: joinTeleprompterLines(h.text),
          timing_seconds: 8,
        });
      }
    }

    // Update body sections with the full body text
    // Map paragraphs to existing section structure
    const sections = gen.script.development?.sections || [];

    // Build the full body as flowing text (without hooks section)
    const bodyOnly = bodyText.split('\n\n').filter(p => p.trim());
    const fullBodyFlowing = bodyOnly.map(p => joinTeleprompterLines(p)).join('\n\n');

    // Strategy: assign paragraphs to sections based on existing section count
    // First find where the "CTA" / transition starts (usually "Te muestro cómo" or "Tocá el botón")
    const ctaIdx = bodyOnly.findIndex(p =>
      p.includes('Tocá el botón') || p.includes('clase gratuita')
    );

    const transitionIdx = ctaIdx > 0 ? ctaIdx - 1 : bodyOnly.length - 2;

    // The content paragraphs (excluding last 2 which are transition + CTA)
    const contentParas = bodyOnly.slice(0, transitionIdx);
    const transitionPara = bodyOnly[transitionIdx] || '';

    // Distribute content paragraphs across sections
    if (sections.length > 0 && contentParas.length > 0) {
      // Group paragraphs into section-sized chunks
      const parasPerSection = Math.ceil(contentParas.length / sections.length);

      for (let i = 0; i < sections.length; i++) {
        const start = i * parasPerSection;
        const end = Math.min(start + parasPerSection, contentParas.length);
        const sectionParas = contentParas.slice(start, end);
        if (sectionParas.length > 0) {
          sections[i].script_text = sectionParas
            .map(p => joinTeleprompterLines(p))
            .join(' ');
        }
      }

      // Rename first section from "Identificación" to "Puente" if needed
      if (sections[0] && sections[0].section_name === 'Identificación') {
        sections[0].section_name = 'Puente';
        sections[0].persuasion_function = 'puente';
      }
    }

    // Update transition
    if (transitionPara) {
      gen.script.transition_text = joinTeleprompterLines(transitionPara);
    }

    // Update word count
    const allText = fullBodyFlowing;
    gen.script.word_count = allText.split(/\s+/).filter(w => w).length;

    // Save
    writeFileSync(jsonPath, JSON.stringify(gen, null, 2), 'utf-8');
    console.log(`✅ ${md} → ${id.slice(0,8)} (${gen.script.hooks.length} hooks, ${sections.length} sections)`);

  } catch (err) {
    console.error(`❌ ${md}: ${err.message}`);
  }
}

console.log('\nDone. Refresh the web to see changes.');
