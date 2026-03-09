# Script Generator - Project Memory

## Project: Script Generator for Vertical Video Ads
- **Path:** `/Users/lean/Documents/script-generator`
- **Stack:** Next.js 15 (App Router) + Tailwind + Claude API (Sonnet 4.6 for generation, Haiku 4.5 for analysis)
- **Storage:** Local JSON files in `.data/` (briefs, generations, references, projects)

## Generating Scripts from Conversation (no API cost)
When the user asks to generate a script from conversation, follow this flow:
1. Read `jesus-adp.md` for full product/audience/angle context
2. Generate the script JSON following the schema (see `script-generator-schema.md`)
3. Save using: `echo '{"brief":{...},"script":{...}}' | node scripts/save-generation.mjs`
4. Give user the URL: `http://localhost:3000/scripts/{generationId}`
5. Update the tracking table in `jesus-adp.md` with the new generation

### Batch generation
When user asks for batch (e.g. "generame 5 guiones"), generate multiple scripts in one go:
- Each with a different angle from the 8 angles defined in jesus-adp.md
- Each targeting a different segment (A, B, C, D)
- Rotate hook types across scripts to avoid repetition
- Save each one separately with `node scripts/save-generation.mjs`
- Present all URLs at the end
- Only do batch when explicitly requested

## Key Architecture
- **AI Models:** Sonnet 4.6 (`claude-sonnet-4-6`) for script gen, Haiku 4.5 for reference analysis
- **Prompt caching:** System prompt + learned patterns as cached blocks (5-min TTL)
- **Platform/tone:** Optional - AI decides if not specified
- **References:** 51 analyzed, patterns aggregated with caps (max 10 patterns, 8 strengths, etc.)
- **Streaming:** SSE via `/api/generate/stream`

## User Preferences
- Spanish (Argentine) for all UI and communication
- Prefers minimal cost, practical solutions
- Uses Claude Max plan ($100/mo) for Claude Code - no extra API cost for conversation
- API key is for the web app only
- Doesn't want production columns (shot_type, camera_movement, etc.) - just script text

## Consejos de Jesús + Reglas de Generación (ver `consejos-jesus.md` para detalle)
- Cuerpo funciona solo sin hooks. Primero se piensa el cuerpo, después los leads.
- **UN cuerpo fijo + múltiples leads intercambiables** que todos conecten con ese cuerpo.
- **Leads, no hooks sueltos.** 2-3 oraciones: abrir gap + negar respuesta obvia + puente al cuerpo.
- Frases textuales del avatar son un complemento, no la base de todo lead.
- NUNCA "no te alcanza la plata" como hook. "Negocios" no "trabajos". Sin porcentajes.
- Máx 4 CTAs distintos. Todo video cambia una creencia. Narrativa conectada.
- NUNCA inventar anécdotas de Jesús.
- Refs de hooks: análisis de Marco Osaid, Epifanía Emprendedora, ARA Prudente (en Downloads).
- **Historia real de Jesús** en `jesus-historia.md`: origen Sarandí, México pandemia, España, golpes (muerte padre, divorcio, 100 clientes, Stripe), frases quotables reales, tono de voz. SOLO usar citas de ahí, nunca inventar.
- **Técnicas de retención** en `tecnicas-retencion.md`: micro-loops entre secciones, especificidad extrema, escalera de curiosidad, open loops, densidad de valor, show don't tell, transiciones que retienen.
- **Técnica de analogía cotidiana** en `tecnica-analogia-franco-piso.md`: estructura alternativa para cuerpos. Objeto cotidiano → desarrollo → giro "no estoy hablando de X" → conexión con ADP. Usar como variación, no abusar.
- **Técnicas de venta en ads** en `tecnicas-venta-emiliano.md`: transparencia del modelo de negocio, comparación de precio como ancla ($5 = un café), garantía como eliminador de objeción, ads nurture post-registro, "mentira" como hook, anti-expertise como prueba.
- **Tono y vocabulario del ADP nuevo** en `jesus-tono-adp-nuevo.md`: análisis de 51 guiones reales de Jesús. Muletillas ("La realidad es que...", "Me explico?"), voseo argentino, proceso de 3 pasos, frases fórmula, analogías que usa, cómo posiciona la IA, estructura de funnel. Usar para calibrar tono de guiones generados.

## Gaps identificados en guiones de Jesús (oportunidades de mejora)
- Falta big idea de nicho (casi todos genéricos)
- Cambio de creencia débil (dice "es fácil" sin construir el porqué)
- Guiones de funnel son copia-pega (38-51 misma estructura)
- Cero storytelling de alumnos reales
- Leads demasiado largos (5+ oraciones)
