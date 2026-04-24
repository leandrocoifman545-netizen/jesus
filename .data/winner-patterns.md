# Winner Patterns — actualizado 2026-04-24

> 🔒 **ARCHIVO MANUAL — NO REGENERAR.** Este archivo se mantiene a mano desde 2026-04-24. La regeneración automática (via `extract-winner-patterns.mjs`, ya removida del pipeline) reintroducía data de ads fatigados y sin validar. Cuando haya nuevos winners con ≥100 ventas en el reporte Meta Ads, editar esta tabla directamente.
>
> **DNA real accionable extraído de los análisis profundos.**
> Fuente primaria: `transcripciones-ganadores/CROSS_ANALYSIS.md` + `transcripciones-ganadores/ANALISIS.md` (2026-04-23).
> Fuente secundaria: análisis individuales vigentes en `.data/analisis-winner-*.md`.

---

## 🚧 Regla dura de elegibilidad

Un ad **solo cuenta como winner** si cumple los 2 criterios:

1. **≥100 ventas reales** (evidencia de conversión, no ruido estadístico).
2. **ROAS ≥ 1** (rentable con LTV backend; umbral positivo del embudo = 0,50, pero acá exigimos ≥1 para pattern-extraction).

Un ad con CPL bajo pero <100 ventas **no es winner** — es experimento sin validar. Un ad con ≥100 ventas pero ROAS <1 **es loser con evidencia** — sirve como anti-patrón, no como plantilla.

---

## 🏆 Top actual — reporte Meta Ads YTD 2026 (01-ene a 20-abr)

### Los 4 winners validados

| # | Ad | Spend | Ventas | ROAS | Profit 2-productos | Status |
|---|---|---|---|---|---|---|
| 1 | **#3** (analogía manejar) | $5.943 | 424 | 1,20 | **+$1.196** | WITH_ISSUE |
| 2 | **#6** (pregunta del avatar) | $547 | 108 | **2,63** | +$862 | CAMPAIGN_PAUSED |
| 3 | **#39 [BN]** (IAs gratuitas + 3 pasos) | $2.706 | 167 | 1,25 | +$665 | **ACTIVE** |
| 4 | **#44 [C1]** (deuda 30 días) | $2.730 | 161 | 1,21 | +$578 | DISAPPROVE |

### Caso de estudio — loser con evidencia

| # | Ad | Spend | Ventas | ROAS | Por qué interesa |
|---|---|---|---|---|---|
| — | **#46** [Hook16 C3 CTA4] (3 modelos) | $2.945 | 95 | **0,55** | Pasó la barra de spend pero falló ROAS. Único evidencia dura de **fatiga a escala**. Anti-patrón, no plantilla. |

---

## 🧬 DNA por winner — hallazgos accionables

### Winner #3 (analogía manejar) — ROAS 1,20 / $7.139 rev / 424 ventas

**Meta-patrón:** ANALOGÍA COTIDIANA CON BRACKET NARRATIVO

**Hallazgos que mueven la aguja:**

1. **Bracket narrativo** (abrir y cerrar con la misma escena). Abre con "¿Viste cuando aprendés a manejar?" y cierra con "apretá el embriague, creá tu producto, poné primera". El cerebro completa el círculo → más watched-to-end → algoritmo escala.
2. **Analogía motora** (verbos de acción: apretá, soltá, poné primera) en vez de analogía abstracta. El viewer vive la escena kinestésicamente.
3. **"Nosotros" institucional** 3 veces ("nuestro programa", "nuestras capacitaciones"). Único winner con plural — puede estar filtrando a ticket alto (Academia vs. Taller).
4. **Soft sell sin CTA explícito.** Termina con consejo ("eso es lo que te enseñamos") — no pide botón.
5. **Humor ligero** ("manejar sin mano es peligroso. No lo hagan."). Rompe el modo ad.

**Estructura:**
```
[0-12s]  Analogía de apertura: scene cotidiana + pregunta
[12-22s] Insight universal + gag humorístico
[22-32s] Transferencia al emprender online
[32-43s] Autoridad lateral ("a mí me sale natural")
[43-58s] Venta del modelo con "nuestro"
[58-65s] Callback → cierra con la analogía inicial transformada
```

**Replicable:** cualquier experiencia cotidiana argentina (cocinar, armar un mueble, aprender un idioma). La clave es que sea MOTORA (verbos de acción) y que el cierre RETOME la analogía inicial.

*Análisis completo:* `transcripciones-ganadores/ad-3.md`

---

### Winner #6 (pregunta del avatar) — ROAS 2,63 / 108 ventas

**Meta-patrón:** FORMATO ACTUACIÓN/DIÁLOGO + OBJECTION HANDLING + VULNERABILIDAD DENSA

**Hallazgos que mueven la aguja:**

1. **Formato pregunta-respuesta con voz DISTINTA al inicio.** Es el único winner que abre con voz del avatar ("¿esto sirve si nunca vendí nada online?"). Todos los demás abren con voz de Jesús. El cambio de voz baja la guardia publicitaria.
2. **Inversión de la objeción.** La duda del avatar ("nunca vendí online") pasa de OBSTÁCULO a VENTAJA en los primeros 15 segundos. Técnica difícil de replicar pero poderosa.
3. **Vulnerabilidad densa.** 4 frases de sinceridad: "obviamente tienes sus limitantes", "no te vas a hacer millonario", "hay gente que no va a poder hacerlo", "tenés alta probabilidad de equivocarte". Nadie más del top tiene tanta.
4. **Ausencia de CTA explícito.** Cierre con CONSEJO ("alguien que te guíe"). No pide botón. Alta confianza.
5. **Triple martilleo de "es muy difícil"** referido a alternativas — hace que este modelo se sienta el único viable por contraste.

**Estructura:**
```
[0-3s]   Pregunta del avatar en voz distinta
[3-22s]  Reframe: la objeción es la ventaja
[22-37s] Demolición de alternativas con "es muy difícil" × 4
[37-46s] Mecanismo (compu + IA + producto + ads)
[46-60s] Expectativa realista con número concreto (2-3k)
[60-66s] Venta del modelo
[66-72s] Cierre con consejo (sin CTA)
```

**Nota de escala:** 108 ventas validan la conversión, pero el spend fue bajo ($547). Al escalar a $2k+ el ROAS probablemente comprima — esperar algo entre 1,3-1,8 sostenido. Si colapsa debajo de 1, pasa a la categoría de #46 (buen hook, no escala).

**Replicable:** pedirle al avatar 5 preguntas reales ("¿sirve si tengo X?", "¿y si no tengo Y?") y grabar cada una con esta estructura.

*Análisis completo:* `transcripciones-ganadores/ad-6.md`

---

### Winner #39 [BN] — ROAS 1,25 (ACTIVE)

**Meta-patrón:** LISTICLE 3 PASOS + ANTI-PITCH EXPLÍCITO

**Hallazgos que mueven la aguja:**

1. **Contraste binario de creencia** ("las IAs gratuitas vs las pagas — las gratuitas hay que descartarlas") + proceso de 3 partes IMPLÍCITO (encontrar productos → modelarlos con IA → vender con anuncios). **Corrección 2026-04-24:** revisión del transcript mostró que NO hay numeración explícita "paso 1/2/3" como se decía antes — el proceso va de corrido.
2. **Anti-pitch doble:** "no te voy a vender nada de $500, ni $200… algo que vale menos que una pizza". Inversión de expectativa + posicionamiento de tripwire. Patrón confirmado en 3 perfiles distintos (Jaime, Heras, Jesús) como el más potente en LATAM.
3. **Contraste gratuitas vs pagas** como quiebre de creencia inicial.
4. **Cierre casual con "Abrazos."** Señal afectiva al final (marker universal de top 4 actual).
5. **Duración 85s** — límite superior del target; el que llega al final está altamente pre-calificado.

*Análisis completo:* `transcripciones-ganadores/ad-39bn.md` + `.data/analisis-winner-39-bn-t4.md`

---

### Winner #44 [C1] — ROAS 1,21 (DISAPPROVE — apelar)

**Meta-patrón:** HIPÓTESIS DEL AUTOR + DEMOLICIÓN DE OBJECIONES × 3

**Hallazgos que mueven la aguja:**

1. **Pregunta hipotética posicionante:** "Si tuviera una deuda que pagar en 30 días, no buscaría trabajo — buscaría algo para emprender". Activa autoridad sin pitchear.
2. **Triple anti-objeción en ráfaga:** cara / plata / tiempo. Demoler las 3 objeciones principales en 10s.
3. **Demo en vivo prometida:** "te voy a mostrar en vivo cómo yo hago con la IA" (autoridad verificable).
4. **Bonus de preparación** — clases previas para nivelar. Reduce fricción de entrada.
5. **Cierre con "¡Abrazo!"** — afectivo.

**⚠️ Causa del DISAPPROVE:** beat 5 menciona directamente "pagar una deuda", "plan de ahorro de un auto", "alquiler de tu departamento". Meta flagea como promesa de ingresos. **Solución:** reformular a lenguaje de "estilo de vida" según `feedback_reglas_escritura.md`.

*Análisis completo:* `transcripciones-ganadores/ad-44-c1.md`

---

### ⚠️ Anti-patrón: #46 — el que fatigó a escala

Escaló a $2.945 de spend con solo 95 ventas y ROAS 0,55 (loser con evidencia).

**Qué hace distinto a los 3 que SÍ sostuvieron escala** (#3, #39, #44):

| Feature | #46 (fatigó) | #3 / #39 / #44 (sostuvieron) |
|---|---|---|
| Hook | Demográfico (25-55 años) | Psicológico (objeción, hipótesis, analogía) |
| Menciona competidores | Sí (Fiverr, Digistore) | No |
| Menciona IA | No | Sí (2-7 veces) |
| Oraciones promedio | 12,7 palabras | 9-14 palabras (#3 más cortas) |
| Argentinismos | Medios | Altos |
| Cierre afectivo | No | "Abrazo" / callback / consejo |

**Anti-patrón claro:** evitar los 3 primeros ítems (hook demográfico, competidores con nombre, IA ausente).

*Transcripción:* `transcripciones-ganadores/ad-46.md`

---

## 🧭 Principios transversales (vigentes de análisis anteriores + confirmados hoy)

**Confirmados en T4-T7 Y en YTD 2026:**

1. **Voseo argentino + CTA suave.** "Tocá el botón", "abrazo", "vos lo único que tenés".
2. **Anti-hype / anti-venta** = ingrediente obligatorio en ads TOFU ("no te vas a hacer millonario", "no te voy a vender nada de $500"). Presente en TODOS los winners del top.
3. **Duración 65-85s.** Sweet spot confirmado.
4. **Jesús único presentador.** Sin testimonios, sin actores.
5. **Especificidad > abstracción.** Números concretos, productos específicos, pasos visualizables.
6. **Match con comprador real.** Patricia (48, 26%), Roberto (62, 30%), Laura (38, 15%) = 71% del comprador. Los hooks deben activar por identidad psicológica o dolor, no por edad explícita.
7. **B-roll que verifica la promesa.** El viewer tiene que VER que es real, no confiar en palabras.

**Nuevos principios descubiertos hoy (YTD 2026-04):**

8. **Cierre afectivo, no mecánico.** "Abrazo", callback o consejo final. Nunca cerrar con "tocá el botón" plano. El CTA funcional puede estar, pero nunca como última frase.
9. **Ratio avatar/producto <0,35.** Los ads que hablan del AVATAR (no del producto) rinden mejor. Medir: menciones de "producto*" / menciones de "vos/te".
10. **La IA es magnet, no mensaje.** Los 2 top absolutos (#6, #3) mencionan la IA solo tangencialmente. La IA atrae el clic; el avatar convierte.
11. **Evitar demografía explícita.** Los 4 top actuales NUNCA mencionan edad. Filtrar por identidad psicológica, no cronológica.
12. **No resubir ads ganadores.** Las 3 subidas del #3 mostraron ROAS decreciente (1,20 → 0,77 → 0,32). Cada reupload arranca de cero en Meta y pierde el learning. Mejor: variante mínima (cambiar primer frame).
13. **≥3 negaciones estratégicas por ad.** "No tenés que X", "no hay Y", "no vas a Z". Los top tienen 3-5; los bottom tienen 0-1.
14. **Formato actuación/diálogo es asimétricamente potente.** #6 es el único ad en este formato en el top 10 y tiene el top ROAS. Alta prioridad producir más.

---

## 🎯 Descomposición por componente (T6 data — principio vigente, números obsoletos)

Del cruce T4-T6 se derivó que el impacto al CPL se distribuye:
- **Cuerpo / creativo:** ~50%
- **Hook:** ~30%
- **CTA:** ~20%

**Principio confirmado:** cuando tengas que elegir dónde invertir tiempo, invertí en el CUERPO. Un buen cuerpo con hook mediocre rinde más que un mal cuerpo con hook genial.

**Caveat:** los porcentajes exactos son de T6 (hace ~1 mes). El principio general (cuerpo > hook > CTA) sigue en pie, pero los deltas específicos no.

---

## 📋 Factores que explicaron -49% CPL en la curva de mejora histórica

Los 6 factores, del más al menos importante (como principios generalizables):

1. **Match con comprador real** — ~40% (reformulado desde "nicho específico")
2. **Producción profesional** — ~15%
3. **B-roll + screen ChatGPT = verificación visual** — ~15%
4. **Nicho específico vs genérico** — ~15% (subset del #1)
5. **Duración más corta** — ~10%
6. **Hooks más sofisticados** — ~5%

---

## 🎬 Cómo usar estos patterns

### Para producir un guion nuevo

1. **Elegir UNO de los 4 meta-patrones** (no combinar en el mismo guion):
   - Analogía cotidiana con bracket narrativo (#3)
   - Formato actuación/diálogo (#6) [**máxima prioridad**]
   - Contraste de creencia + re-explicación + anti-pitch (#39)
   - Hipótesis del autor + demolición × 3 (#44)

2. **Aplicar los 14 principios transversales** como checklist.

3. **Elegir un avatar objetivo** de Patricia / Roberto / Laura — no todos. Ese avatar filtra el hook.

4. **Medir contra el score de `CROSS_ANALYSIS.md` sección 23.3** antes de producir.

### Para decidir qué escalar

- ≥100 ventas + ROAS ≥1 → winner validado, mantener y clonar con variantes mínimas.
- <100 ventas con CPL atractivo → candidato, NO cuenta como winner hasta pasar umbral.
- ≥100 ventas + ROAS <1 → loser con evidencia (como #46), anti-patrón — no replicar.

### Para NO repetir errores

- No resubir un ad ganador: siempre variante mínima.
- No hacer hook demográfico (25-55 años, jubilado/joven).
- No mencionar competidores por nombre (Fiverr, Digistore en ads de productos digitales).
- No cerrar con "tocá el botón" sin cierre afectivo antes.
- No hacer big idea genérica ("qué es X") — siempre específica con ángulo.

---

## 📚 Referencias

**Fuente primaria (YTD 2026):**
- `transcripciones-ganadores/INDEX.md` — tabla maestra
- `transcripciones-ganadores/ANALISIS.md` — análisis individual + cross básico
- `transcripciones-ganadores/CROSS_ANALYSIS.md` — 16 dimensiones cruzadas + score ponderado
- `transcripciones-ganadores/ad-*.md` — transcripciones con frontmatter

**Deep-dives vigentes:**
- `analisis-winner-39-bn-t4.md` — #39 (ACTIVE, ROAS 1,25)

**Nota sobre limpieza (2026-04-24):** se borraron los análisis de ads que no pasaron el umbral de 100 ventas reales (#121 con 54 registros, entre otros) y los archivos que mezclaban data de ads fatigados con data vigente. La data de los 562 compradores sigue disponible en `audiencia-compradores.md` (memoria).
