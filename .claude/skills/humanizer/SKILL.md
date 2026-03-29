---
name: humanizer
version: 3.0.0
description: |
  Detecta y elimina patrones de escritura IA en guiones de ads para Jesús (ADP).
  Fusiona los filtros anti-IA de Wikipedia con la voz real de Jesús Tassarolo.
  Usar SIEMPRE como paso final antes de presentar un guion al usuario.
  También se puede invocar standalone con /humanizer sobre cualquier texto.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Humanizer ADP: Que suene a Jesús, no a ChatGPT

Este skill tiene dos modos:
1. **Integrado en `/guion`**: se corre automáticamente como paso final antes de presentar
2. **Standalone**: el usuario pasa un texto y se humaniza

> Basado en Wikipedia "Signs of AI writing" + 51 guiones reales de Jesús analizados.
> La regla cardinal: si cerrás los ojos y no podés ESCUCHAR a Jesús diciendo esto, está mal.

---

## PASO 1: Detectar patrones de IA en el guion

Escanear el texto completo (leads + cuerpo + transición) buscando estos 10 patrones. Cada uno tiene ejemplos de ANTES (IA) y DESPUÉS (Jesús).

### P-IA1: Regla de tres automática
**El patrón:** La IA agrupa TODO en tríos. "Encontrás, creás y vendés" aparece en cada guion.
**Detectar:** Cualquier lista de exactamente 3 elementos con estructura paralela.
**Fix:** Romper el trío. A veces son 2 cosas. A veces son 4. A veces es 1 sola bien explicada.

ANTES (IA):
> "Encontrás qué vender, lo creás con IA y lo vendés por WhatsApp."

DESPUÉS (Jesús):
> "Primero encontrás qué producto tiene demanda. Después lo armás con IA — y eso lleva una tarde, no un mes. Y lo vendés."

O mejor aún, romper completamente:
> "Lo primero es encontrar un producto que la gente ya está buscando. Eso es lo más importante. Si elegís bien, el resto es mecánica."

### P-IA2: Paralelismo negativo ("No es X, es Y")
**El patrón:** "No es falta de voluntad, es falta de sistema." / "No es más esfuerzo, es mejor dirección."
**Detectar:** Cualquier construcción "No es [cosa negativa], es [cosa positiva]" o "No se trata de X, se trata de Y."
**Fix:** Decirlo como lo diría un tipo hablando. Más desordenado, más real.

ANTES (IA):
> "No es falta de talento, es falta de dirección."

DESPUÉS (Jesús):
> "Talento te sobra. Lo que te falta es alguien que te diga 'hacé ESTO, no todo lo otro'."

### P-IA3: Sinónimo cycling (repetición disfrazada)
**El patrón:** La IA evita repetir palabras y usa sinónimos forzados: "producto/negocio/emprendimiento/proyecto" para lo mismo.
**Detectar:** Tres o más sinónimos para el mismo concepto en el mismo guion.
**Fix:** Jesús repite. Dice "producto digital" 5 veces en un guion. No le importa. La repetición es claridad.

ANTES (IA):
> "Creás tu emprendimiento digital. Este negocio online te permite generar un proyecto escalable."

DESPUÉS (Jesús):
> "Creás un producto digital. UN producto. Y ese producto lo vendés una vez, dos veces, cien veces."

### P-IA4: Filler de transición ("La realidad es que...", "Básicamente...")
**El patrón:** La IA mete conectores en CADA oración. Jesús los usa pero NO en todas las oraciones.
**Detectar:** Más de 2 "La realidad es que" / "Básicamente" / "Entonces" / "Justamente" en el mismo guion.
**Fix:** Máximo 1-2 por guion. Jesús los usa con intención, no como relleno.

ANTES (IA):
> "La realidad es que hay miles de personas buscando esto. Básicamente, lo que necesitás es un celular. Entonces, con IA creás el producto. Justamente por eso funciona."

DESPUÉS (Jesús):
> "Hay miles de personas buscando esto ahora mismo. ¿Qué necesitás? Un celular. La IA hace el resto."

### P-IA5: Cierre genérico motivacional
**El patrón:** "Las barreras desaparecieron. La única que queda sos vos." / "El campo de juego se niveló." / "Tu momento es ahora."
**Detectar:** Cualquier frase final que suene a poster motivacional.
**Fix:** Jesús cierra con algo CONCRETO, no inspiracional.

ANTES (IA):
> "Las barreras desaparecieron. La única que queda sos vos."

DESPUÉS (Jesús):
> "La barrera técnica no existe más. Queda una sola pregunta: ¿lo vas a hacer o vas a seguir mirando cómo otros lo hacen?"

### P-IA6: Estructura demasiado simétrica
**El patrón:** Todos los beats tienen la misma longitud, la misma estructura, el mismo ritmo. 3 oraciones, pausa, 3 oraciones, pausa.
**Detectar:** Beats con ±5 palabras de diferencia entre sí. Todas las oraciones de largo similar.
**Fix:** Variar el ritmo. Un beat corto y punchy. Otro largo y narrativo. Otro que sea una sola pregunta.

ANTES (IA):
> Beat 1 (30 palabras): "Sos masajista. Cobrás por hora. Si no trabajás, no cobrás."
> Beat 2 (28 palabras): "Tu conocimiento tiene valor. Miles buscan esto. No lo estás vendiendo."
> Beat 3 (31 palabras): "Con IA creás una guía. La subís. Se vende sola por WhatsApp."

DESPUÉS (Jesús):
> Beat 1 (15 palabras): "Sos masajista. ¿Qué pasa cuando te enfermás? No cobrás."
> Beat 2 (45 palabras): "Mirá, yo no sé nada de masajes. Pero sé que hay gente en Google ahora mismo buscando 'cómo aliviar el dolor de espalda'. Y nadie les está vendiendo algo bueno. Vos sabés cómo se alivia. Ellos quieren pagar por eso."
> Beat 3 (10 palabras): "Una tarde. Una guía. WhatsApp. Listo."

### P-IA7: Vocabulario "elevado" que Jesús nunca usaría
**Palabras prohibidas en guiones de Jesús:**
- "transformar/transformación" → "cambiar"
- "generar ingresos" → "ganar plata" / "hacer plata"
- "emprendimiento" → "negocio" o "producto"
- "potenciar" → no tiene reemplazo, eliminarlo
- "optimizar" → "mejorar" o eliminarlo
- "implementar" → "hacer" / "armar"
- "monetizar" → "vender" / "cobrar"
- "diversificar" → "tener más de una fuente"
- "sostenible" → "que dure" / "consistente"
- "paradigma" → NUNCA
- "ecosistema" (figurativo) → NUNCA
- "apalancarse" → NUNCA
- "sinergia" → NUNCA
- "disruptivo" → NUNCA

**Vocabulario que Jesús SÍ usa:**
- "plata" (no "dinero" ni "ingresos")
- "laburo" / "laburazo"
- "posta" (en serio)
- "garpa" (vale la pena)
- "re" como intensificador ("re fácil", "re importante")
- "flashear" (imaginar cosas irreales)
- "boludez" (algo simple, no insulto)
- "chamuyo" (verso/mentira)
- "piola" (bueno/copado)
- "bancar" (sostener/aguantar)

### P-IA8: Exceso de estructura expositiva
**El patrón:** La IA escribe como ensayo: tesis → desarrollo → conclusión. Cada punto tiene intro, argumento, cierre.
**Detectar:** Beats que arrancan con "El problema es que..." o "Lo interesante es que..." o "Esto significa que..."
**Fix:** Jesús habla en ráfagas. Afirma. Pregunta. Responde él mismo. No introduce sus ideas — las tira.

ANTES (IA):
> "Lo interesante es que tu conocimiento ya tiene valor en internet. Esto significa que podés crear un producto digital sin experiencia previa."

DESPUÉS (Jesús):
> "Lo que vos sabés? Ya vale plata. El tema es que no lo estás vendiendo. Todavía."

### P-IA9: Datos sin anclaje emocional
**El patrón:** La IA tira datos sueltos: "Miles buscan X", "200 copias por mes", "$800 dólares extra".
**Detectar:** Números o datos que no están conectados a una emoción o imagen concreta.
**Fix:** Anclar cada dato a algo que se SIENTA.

ANTES (IA):
> "Vendió 200 copias el primer mes. Hace $600 extra."

DESPUÉS (Jesús):
> "Vendió 200 copias. Doscientas. En un mes. Eso es una cuota del auto. Sin levantarse del sillón."

### P-IA10: Preguntas retóricas predecibles
**El patrón:** La IA hace preguntas donde la respuesta es obvia: "¿Y si pudieras cambiar eso?" / "¿Te imaginás?" / "¿Qué pasaría si...?"
**Detectar:** Preguntas donde el viewer ya sabe la respuesta antes de que termine.
**Fix:** Las preguntas de Jesús tienen FILO. No son retóricas — son confrontativas.

ANTES (IA):
> "¿Y si pudieras ganar plata con lo que ya sabés?"

DESPUÉS (Jesús):
> "¿Cuánto tiempo más vas a regalar lo que sabés?"

### P-IA11: Data interna filtrada al copy (CRÍTICO)
**El patrón:** Los datos de 562 compradores, 8074 leads, porcentajes de segmentación aparecen en el guion. Jesús lo dijo: "La gente no le importa eso. Eso es data interna nuestra, solo la usás vos para vos."
**Detectar:**
- Cualquier porcentaje estadístico de audiencia (46%, 14%, 56%)
- Referencias a "562 compradores", "8074 leads", "encuesta", "muestra"
- Frases como "según datos", "estudios muestran", "la data dice", "estadísticas indican"
- Porcentajes de conversión o demografía presentados como argumento de venta
**Fix:** La data informa QUÉ dolores atacar y en qué orden. NUNCA aparece en el copy. Reemplazar dato estadístico por anécdota concreta o detalle anti-ficción.

ANTES (filtración):
> "El 46% de las personas que compraron tenían más de 40 años."

DESPUÉS (anti-ficción):
> "María tiene 52 años. No sabía ni prender una notebook. Hoy vende guías de repostería."

### P-IA12: Palabras que MATAN el CLR
**El patrón:** Hay palabras específicas que están concentradas en los videos con PEOR rendimiento. Data de 191 videos analizados.
**Detectar (flaggear SIEMPRE que aparezcan):**
- "pero bueno" (rendición narrativa — 0 apariciones en top 25%)
- "de todos modos" (desconexión emocional)
- "en fin" (afterthought — 6.3x más en videos bottom)
- "como sea" (descarta lo anterior)
- "nos vemos amigos" / cualquier despedida como última frase hablada
- "boludo" en contexto de ad (no como intensificador entre amigos)
- "funnel" / "embudo" (hasta 18x más en videos bottom)
- "curso" como nombre del producto (usar "clase", "sistema", "método")
- "lanzamiento" / "leads" / "call-to-action" / "orgánico" (como estrategia)
**Fix:** Reemplazar por equivalentes que SUBEN CLR:
- "pero bueno" → eliminar, reformular con energía igual o mayor
- "funnel/embudo" → "clientes", "gente que te compra"
- "curso" → "sistema", "clase", "método"
- "nos vemos" → terminar con INSTRUCCIÓN ("Lo único que tenés que hacer es...")
- despedida → acción ("Comentá [KEYWORD]", "Tocá el link")

**Palabras que SUBEN CLR (sugerir si no hay ninguna en el guion):**
- "es una puta locura" / "una locura" (5.2x más en top)
- "literalmente" (8.3x más en top)
- "lo único que tenés que hacer es" (CLR 2.00 vs "si querés" 1.51)
- "se acaba de filtrar" (novedad > escasez)
- "en menos de un minuto" (speed promise — 2.4x en top vs 1.1 en bottom)
- "nuevo/nueva" (8.7x más en top)
- "prompt", "acceso", "gratis"

### P-IA13: Jerga de marketing en el body
**El patrón:** La IA usa vocabulario de marketero, no de persona normal. Dato: jerga de marketing concentrada hasta 18x más en videos de peor CLR.
**Detectar estas palabras en el CUERPO del guion (no en metadata):**
- "funnel", "embudo", "lanzamiento", "call-to-action", "CTA"
- "leads", "orgánico" (como estrategia), "monetizar", "escalable"
- "conversión", "retargeting", "awareness", "branding"
- "copywriting", "hook", "engagement"
**Fix:** El avatar NO habla así. Reemplazar:
- "leads" → "clientes" / "gente que te compra"
- "funnel" → eliminar concepto o decir "proceso de venta"
- "monetizar" → "vender" / "cobrar"
- "escalable" → "que crece solo"
- "orgánico" → "sin pagar publicidad" / "gratis"
**Excepción:** "anuncios" y "campañas" sí se pueden usar.

---

## PASO 2: Test de la voz de Jesús

Después de limpiar patrones de IA, verificar que el guion pase estos 6 checks de voz:

### V1: ¿Hay al menos 1 pregunta retórica con filo? (no genérica)
- ❌ "¿Te imaginás ganar plata desde casa?"
- ✅ "¿Cuánto te sale la hora de tu laburo? ¿Y cuánto cobrás por lo que sabés? Hacé la cuenta."

### V2: ¿Hay variación de ritmo? (oraciones cortas Y largas)
- ❌ Todas las oraciones tienen 10-15 palabras
- ✅ "Un celular. WhatsApp. Y lo que ya sabés." + una oración de 30+ palabras

### V3: ¿Hay al menos 1 muletilla de Jesús bien ubicada?
- "La realidad es que..." (máx 1 por guion)
- "Me explico?" (solo después de algo complejo)
- "Entonces..." (solo como transición real, no relleno)
- "Mirá..." (arranque confrontativo)
- Si hay más de 2 muletillas distintas → sacar una. Jesús no mete todas juntas.

### V4: ¿El cierre es concreto, no motivacional?
- ❌ "Tu momento es ahora. Las barreras desaparecieron."
- ✅ "Eso es lo que enseño en la clase gratuita. 2 horas. Conmigo. En vivo."

### V5: ¿Suena a monólogo hablado o a texto escrito?
Leer el guion EN VOZ ALTA mentalmente. Si suena a alguien leyendo un paper → reescribir.
Señales de texto escrito: oraciones subordinadas largas, conectores formales ("sin embargo", "no obstante", "cabe destacar"), ninguna interrupción ni cambio de dirección.

### V6: ¿Hay al menos 1 momento de "tough love"?
Jesús no es 100% empático. Mezcla cariño con cachetazo. Si el guion es puro cariño → meter un "Dale, basta de excusas" o un "¿Hasta cuándo vas a seguir mirando?".
- ❌ Todo empático: "Entiendo tu frustración. Es normal sentirse así."
- ✅ Tough love: "Mirá, yo entiendo. Pero si seguís haciendo lo mismo, vas a seguir teniendo lo mismo. ¿O no?"

### V7: ¿La transición mantiene la energía? (no se rinde)
La transición al CTA NUNCA baja la energía. Dato: "pero bueno" tiene 0 apariciones en el top 25% de 191 videos. "En fin" aparece 6.3x más en videos bottom.
- ❌ "Pero bueno, si te interesa..."
- ❌ "De todos modos, te dejo el link..."
- ❌ "En fin, si querés saber más..."
- ✅ "Eso que te acabo de mostrar con [EJEMPLO] es solo el principio."
- ✅ "Y esto es solo UNO de los productos que podés crear."
**Regla:** La energía de la transición debe ser IGUAL o MAYOR que la del cuerpo.

### V8: ¿La última frase hablada es INSTRUCCIÓN? (no despedida)
Dato duro: cierre con acción = CLR 1.48-1.61 vs cierre con despedida = CLR 0.92 (-37%).
- ❌ "Nos vemos amigos" / "Hasta la próxima" / "Éxitos" / "Abrazo"
- ❌ "Espero que te haya servido"
- ✅ "Lo único que tenés que hacer es comentar [KEYWORD]"
- ✅ "Tocá el link en la bio"
- ✅ "Escribime [KEYWORD] por DM"
**Excepción:** Videos de awareness puro (sin CTA) pueden cerrar con despedida cálida.

---

## PASO 3: Reescribir y presentar

### Si está integrado en `/guion`:
1. Escanear leads + cuerpo + transición contra los 10 patrones P-IA
2. Correr los 6 checks de voz V1-V6
3. Si hay 3+ problemas → reescribir las secciones afectadas ANTES de presentar
4. Si hay 1-2 problemas → presentar pero marcar con ⚠️ qué ajustar
5. Si pasa todo → presentar sin comentarios

### Si es standalone (/humanizer):
1. Leer el texto
2. Escanear contra los 10 patrones P-IA
3. Correr los 6 checks de voz V1-V6
4. Presentar versión humanizada con cambios marcados
5. Anti-AI pass final: "¿Qué sigue sonando a IA?" → arreglar → versión final

### Output del paso de humanización (cuando se integra en /guion):
```
## Check de humanidad
- P-IA detectados (1-10): [lista o "ninguno"]
- P-IA11 (data interna): ✅/❌ [detalle si falla]
- P-IA12 (palabras CLR killer): ✅/❌ [palabras encontradas]
- P-IA12 (palabras CLR booster): [lista de boosters presentes o "⚠️ Ninguna — considerar agregar"]
- P-IA13 (jerga marketing): ✅/❌ [palabras encontradas]
- Checks de voz: V1 ✅/❌ | V2 ✅/❌ | V3 ✅/❌ | V4 ✅/❌ | V5 ✅/❌ | V6 ✅/❌ | V7 ✅/❌ | V8 ✅/❌
- Ajustes hechos: [lista de cambios o "ninguno necesario"]
```

---

## Referencia rápida: IA vs Jesús

| La IA dice | Jesús dice |
|-----------|-----------|
| "Transformá tu conocimiento en ingresos" | "Vendé lo que ya sabés" |
| "Genera ingresos pasivos" | "Hacé plata mientras dormís" |
| "Implementá un sistema escalable" | "Armá algo que se venda solo" |
| "La barrera de entrada es mínima" | "Cuesta 5 dólares. Menos que una pizza." |
| "Monetizá tu expertise" | "Cobrá por lo que sabés" |
| "El ecosistema digital permite..." | "Hoy podés..." |
| "No es X, es Y" | "X te sobra. Lo que te falta es Y." |
| "Encontrás, creás y vendés" | "Primero encontrás. Después creás. Y lo vendés." |
| "Las barreras desaparecieron" | "¿Qué te frena? Nada. Literalmente nada." |
| "¿Y si pudieras cambiar eso?" | "¿Hasta cuándo vas a seguir así?" |

---

## Fuentes
- Wikipedia "Signs of AI writing" (WikiProject AI Cleanup) — patrones P-IA 1-6, 8, 10
- `jesus-tono-adp-nuevo.md` — 51 guiones de Jesús analizados (voz, muletillas, vocabulario)
- `reglas-diversidad.md` — frases muleta prohibidas
- `patrones-prohibidos-leads.md` — esqueletos quemados
