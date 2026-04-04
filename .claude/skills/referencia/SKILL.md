---
name: referencia
description: Transcribe y analiza videos/links/textos como referencia para guiones de ADP. Usar cuando el usuario pasa un video, link o contenido para analizar.
argument-hint: [archivo.mp4 o URL o texto]
---

# Analizador de Referencias — ADP

Recibís un video, link de redes sociales, archivo de audio o texto. Tu trabajo es transcribirlo (si hace falta), analizarlo y guardarlo mapeando al sistema de generación de ADP.

## Paso 1: Obtener la transcripción

Si es un archivo de video/audio o URL de redes sociales, transcribir con:
```bash
export PATH="/Users/lean/Library/Python/3.9/bin:/opt/homebrew/bin:$PATH"
node /Users/lean/Documents/script-generator/scripts/transcribe-youtube.mjs "$ARGUMENTS"
```

Si es texto plano, usarlo directamente.

## Paso 1b: Leer metodología de análisis profundo

**OBLIGATORIO:** Leer `.data/metodologia-analisis-profundo.md` ANTES de analizar.
Contiene: 7 axiomas + 8 pasadas de profundidad + 5 lentes + 7 dimensiones + transferencia sistemática + predicción + autocrítica de 24 preguntas.
Aplicar la metodología COMPLETA a cada referencia. No hacer análisis superficial.

## Paso 2: Leer reglas de ADP

Leé las reglas para saber contra qué filtrar:
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/consejos-jesus.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-tono-adp-nuevo.md`

## Paso 3: Analizar (mapeo completo al sistema ADP)

Evaluar la transcripción en estas dimensiones:

### Análisis básico
1. **Hook/Lead** — ¿Cómo arranca? ¿Qué tipo de hook usa? (mapear a nuestros 20 tipos)
2. **Estructura** — ¿Qué framework sigue? (PAS, AIDA, BAB, Hook-Story-Offer, micro_vsl, otro)
3. **Tono** — ¿Cómo habla? ¿Qué registro usa? ¿UGC? ¿Humor?
4. **CTA** — ¿Qué pide y cómo? ¿Tiene urgencia? ¿Es dual?
5. **Arco emocional** — ¿Qué recorrido emocional hace?

### Mapeo ADP (NUEVO — obligatorio)
6. **Familia de ángulo** — ¿identidad, oportunidad, confrontacion, mecanismo o historia?
7. **Vehículo narrativo** — ¿Cuál de los 13 tipos de cuerpo usa?
8. **Funciones persuasivas** — ¿Qué beats tiene? (identificacion, quiebre, mecanismo, demolicion, prueba)
9. **Cambio de creencia** — ¿Creencia vieja → mecanismo → creencia nueva?
10. **Ingredientes** — ¿Qué ingredientes de la enciclopedia ADP (A-K) se detectan?
11. **Venta del modelo** — ¿Qué tipo de los 10 usa? (si aplica)
12. **Awareness Schwartz** — ¿A qué nivel habla? (1-5)
13. **Segmento equivalente** — ¿A, B, C o D?
14. **Big idea** — ¿Cuál es LA idea central en una frase?

#### Análisis de Copy Escrito (si es un ad de imagen/texto)
Si la referencia es un ad de imagen (no video), analizar también con el Winner Teardown Template:
- **Copy structure:** ¿Cuál de las 8 estructuras usa? (storytelling/testimonio/math-based/contrarian/listicle/before-after/descubrimiento/comparación)
- **Anatomía de 6 bloques:** Identificar HOOK (15-25 palabras) → AGITACIÓN → PIVOTE → PRUEBA → PUENTE → CTA
- **Anti-ficción:** ¿Tiene detalles que nadie inventaría? Listar los mejores.
- **Mecanismo:** ¿Tiene nombre propietario? ¿Cómo lo introduce?
- **Quality Scorecard:** Evaluar 1-5 en: hook power, especificidad, emoción visceral, prueba creíble, CTA baja fricción, voz (si es en español)
- **Señales de winner:** Tiempo activo (3+ meses = winner confirmado), múltiples variantes del mismo anunciante = están testeando
- **Qué robar para copies ADP:** Elementos adaptables a nuestro sistema

### Extracción accionable (NUEVO — obligatorio)
15. **Qué robar** — Técnicas específicas que podemos adaptar para ADP
16. **Qué NO copiar** — Qué no aplica o sería contraproducente
17. **Notas de craft** — Observaciones sobre calidad de escritura a nivel de oración

## Paso 4: Preguntar metadata al usuario

Antes de guardar, preguntar lo que no se puede inferir:
- **Anunciante** (si no es obvio del contenido)
- **Ranking** — ¿Estaba en el top 5/10/20 por impresiones en Ad Library?
- **Plataforma** — ¿Meta, TikTok, YouTube?

## Paso 5: Guardar como referencia

El guardado usa la web (POST /api/references) que analiza con AI automáticamente. Pero cuando se guarda desde conversación, construir el JSON completo:

```bash
echo '{
  "id": "ref-NOMBRE-DESCRIPTIVO",
  "title": "TÍTULO DESCRIPTIVO",
  "transcript": "TRANSCRIPCIÓN COMPLETA",
  "analysis": {
    "hook": {
      "text": "texto del hook",
      "type": "tipo_de_hook",
      "word_count": N,
      "estimated_seconds": N
    },
    "structure": {
      "framework": "PAS|micro_vsl|otro",
      "sections": [{ "name": "nombre", "summary": "resumen", "estimated_seconds": N }],
      "has_rehook": true|false,
      "rehook_text": "texto o null"
    },
    "tone": {
      "primary_tone": "confrontativo|empático|curioso|urgente|etc",
      "formality_level": "very_casual|casual|neutral",
      "uses_first_person": true|false,
      "ugc_style": true|false,
      "humor_level": "none|light|moderate",
      "key_phrases": ["frase 1", "frase 2"]
    },
    "cta": {
      "text": "texto del CTA",
      "type": "directo|reframe|embedded_command|micro_compromiso|exclusion|conversacional|custom|none",
      "has_urgency": true|false,
      "has_reason_why": true|false,
      "is_dual": true|false
    },
    "estimated_total_duration_seconds": N,
    "total_word_count": N,
    "emotional_arc": "descripción del arco",
    "strengths": ["fortaleza 1", "fortaleza 2"],
    "patterns_to_replicate": ["patrón 1", "patrón 2"],
    "advertiser": {
      "name": "Nombre del anunciante",
      "platform": "meta|tiktok|youtube|unknown",
      "ranking_position": "top_5|top_10|top_20|unknown",
      "language": "es|en|pt",
      "country": "AR|US|BR|etc"
    },
    "generation_mapping": {
      "angle_family": "identidad|oportunidad|confrontacion|mecanismo|historia",
      "body_type": "demolicion_mito|historia_con_giro|demo_proceso|comparacion_caminos|un_dia_en_la_vida|pregunta_respuesta|analogia_extendida|contraste_emocional",
      "persuasion_functions": [
        { "section_name": "nombre", "function": "identificacion|quiebre|mecanismo|demolicion|prueba|venta_modelo" }
      ],
      "belief_change": {
        "old_belief": "creencia vieja",
        "mechanism": "mecanismo que la refuta",
        "new_belief": "creencia nueva"
      },
      "ingredients_detected": [
        { "category": "B", "ingredient_number": 29, "ingredient_name": "Dolor comparativo social" }
      ],
      "model_sale_type": "tipo o none",
      "awareness_level": 1-5,
      "segment_equivalent": "A|B|C|D",
      "big_idea": "La idea central en una frase"
    },
    "actionable": {
      "what_to_steal": ["técnica 1", "técnica 2"],
      "what_not_to_copy": ["razón 1"],
      "craft_notes": ["observación sobre escritura"]
    }
  }
}' | node scripts/save-reference.mjs
```

Confirmar al usuario que se guardó y resumir:
- Big idea del ad
- Qué se puede robar para ADP
- Qué mapeo tiene (ángulo, cuerpo, awareness)
