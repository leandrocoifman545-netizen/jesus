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
- P-IA detectados: [lista o "ninguno"]
- Checks de voz: V1 ✅/❌ | V2 ✅/❌ | V3 ✅/❌ | V4 ✅/❌ | V5 ✅/❌ | V6 ✅/❌
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
