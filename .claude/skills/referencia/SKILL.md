---
name: referencia
description: Transcribe y analiza videos/links/textos como referencia para guiones de ADP. Usar cuando el usuario pasa un video, link o contenido para analizar.
argument-hint: [archivo.mp4 o URL o texto]
---

# Analizador de Referencias — ADP

Recibís un video, link de redes sociales, archivo de audio o texto. Tu trabajo es transcribirlo (si hace falta), analizarlo, decidir si sirve para ADP y guardarlo solo si aporta valor.

## Paso 1: Obtener la transcripción

Si es un archivo de video/audio o URL de redes sociales, transcribir con:
```bash
export PATH="/Users/lean/Library/Python/3.9/bin:/opt/homebrew/bin:$PATH"
/Users/lean/Documents/script-generator/scripts/transcribir.sh "$ARGUMENTS"
```

Si es texto plano, usarlo directamente.

## Paso 2: Leer reglas de ADP

Leé las reglas para saber contra qué filtrar:
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/consejos-jesus.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-tono-adp-nuevo.md`

## Paso 3: Analizar

Evaluar la transcripción en estas dimensiones:
1. **Hook/Lead** — ¿Cómo arranca? ¿Es efectivo? ¿Qué tipo de hook usa?
2. **Estructura** — ¿Qué framework sigue? (PAS, AIDA, BAB, Hook-Story-Offer, etc.)
3. **Tono** — ¿Cómo habla? ¿Qué registro usa?
4. **Mecanismo** — ¿Cómo presenta la solución/producto?
5. **CTA** — ¿Qué pide y cómo?
6. **Patrones clave** — ¿Qué técnicas de retención usa?
7. **Arco emocional** — ¿Qué recorrido emocional hace el espectador?

## Paso 4: Filtrar

Decidir si sirve para ADP. Preguntas de filtro:
- ¿Aporta una técnica, estructura o ángulo que no tenemos?
- ¿Es coherente con el tono y las reglas de Jesús?
- ¿Podríamos adaptar algo de esto a los guiones de ADP?

Si NO sirve:
- Decirle al usuario POR QUÉ no sirve
- NO guardarlo
- Sugerir qué tipo de contenido sí sería útil

Si SÍ sirve:
- Explicar QUÉ aporta específicamente
- Preguntar al usuario si quiere guardarlo
- Proceder al paso 5

## Paso 5: Guardar como referencia (solo si sirve Y el usuario aprueba)

Crear el JSON de referencia y guardarlo:

```bash
echo '{
  "id": "ref-NOMBRE-DESCRIPTIVO",
  "title": "TÍTULO DESCRIPTIVO",
  "type": "video|text|audio",
  "transcript": "TRANSCRIPCIÓN COMPLETA",
  "analysis": {
    "hook_type": "tipo de hook",
    "hook_text": "texto del hook",
    "structure": "descripción de la estructura",
    "framework": "PAS|AIDA|BAB|Hook-Story-Offer|otro",
    "tone": "descripción del tono",
    "cta_type": "tipo de CTA",
    "cta_text": "texto del CTA",
    "duration_seconds": NÚMERO,
    "key_patterns": ["patrón 1", "patrón 2"],
    "language": "es-AR|es-MX|en|pt",
    "emotional_arc": "descripción del arco emocional"
  },
  "createdAt": "ISO_DATE",
  "competitor": true|false,
  "reference_type": "competitor|own_brand|inspiration",
  "notes": "Por qué se guardó y qué aporta"
}' | node scripts/save-reference.mjs
```

Confirmar al usuario que se guardó y resumir qué aporta.
