# Anti-Patrones de Sesiones — Registro de errores

> Registro tipificado de errores cometidos en generación para evitar repetirlos.
> Se actualiza después de cada sesión con problemas reales.
> `preflight-guion.mjs` lo lee y alerta si detecta patrones similares.

---

## [2026-04-16] — Batch "Carta a las 3 AM" descartado

### Contexto
Intento de batch con 3 conceptos que rompían el patrón "X empaquetó Y con IA": Carta 3 AM / Objeción burbuja / Futuro hiper-específico. Se llegó a generar Guion 1 (Carta 3 AM) pero se descartó por problemas sistémicos. Se reestructuró el skill `/guion` en 5 gates duros.

### Errores tipificados

**ERR-01 · Concepto sin pivote de venta validado**
- Manifestación: "Carta a las 3 AM" pasó a escritura de hooks sin validación.
- Síntoma: el guion terminó sonando a monólogo de coach emocional, no a ad de Jesús. El pivote entre "insomnio" y "producto digital" quedó forzado.
- Root cause: el skill no tenía gate de "concepto validado vs. winners".
- Arreglo aplicado: Gate 1 del nuevo skill `/guion` con 3 preguntas canónicas (pivote venta / nombra mecanismo / conecta con producto).

**ERR-02 · Causalidad violada (0/7 bisagras)**
- Manifestación: 0 conectores causales/adversativos entre beats. Todo secuencia.
- Root cause: regla estaba en `reglas-duras.md §2` pero NO en el skill `/guion`, NI en `save-generation.mjs`. Grep en scripts: 0 matches para "causalidad".
- Arreglo aplicado: Gate 4 del skill pide tabla de 7 bisagras con conector explícito + `save-generation.mjs` chequea conectores prohibidos (además/también/por otro lado) + bloquea si 0/N bisagras causales.

**ERR-03 · Hooks que asumen momento presente**
- Manifestación: "Son las 3 AM", "ahora estás despierta", "03:12". Filtra por HORA, no por avatar.
- Root cause: el hook estaba anclado al concepto literal en vez de a experiencia duradera. Los hooks efectivos filtran por OBJECIÓN / HIPÓTESIS / ANALOGÍA (#3, #6, #44) o por IDENTIDAD PSICOLÓGICA, nunca por momento presente ni por edad.
- Arreglo aplicado: Gate 3 aplica las 10 reglas de Víctor como check obligatorio. La regla 7 (congruencia) y 8 (no hablar de lo obvio) detectan asunciones de momento.

**ERR-04 · Errores de lenguaje local**
- Manifestación: "no hace falta que tengas cara" (debía ser "mostrar tu cara"). "La hora que hace meses la venís pasando despierta" (construcción rara).
- Root cause: validación lingüística manual, requiere oído.
- Arreglo parcial: Gate 5 incluye check "un taxista de Buenos Aires o maestra de Entre Ríos diría esto". No automatizable.

**ERR-05 · Mecanismo vago, no nombrado con precisión**
- Manifestación: "armar algo mío chiquito con lo que ya sabía". Los winners de Jesús SIEMPRE nombran ("publicista digital", "aprender algo y ofrecerlo como servicio").
- Root cause: falta de check de "mecanismo nombrado" + no se leyeron los refs de winners antes de planificar.
- Arreglo aplicado: pre-flight P.3 obliga leer los 3 refs de Jesús + `save-generation.mjs` advierte si el beat de mecanismo no tiene nombre preciso.

**ERR-06 · Venta modelo redundante con demolición**
- Manifestación: demolición y venta modelo repetían la misma lista de "no hace falta X, Y, Z".
- Root cause: falta de distinción clara de funciones. Los winners siempre agregan TIEMPO + GEOGRAFÍA + ESCENAS en la venta del modelo.
- Arreglo aplicado: ejemplo explícito en Gate 2 del nuevo skill.

**ERR-07 · Transición pre-asumiendo CTA específico**
- Manifestación: "La otra mitad te la muestro gratis" rompe si el CTA es taller $5 pagado.
- Root cause: los 3 CTAs son intercambiables pero la transición puede acoplarse al equivocado.
- Arreglo aplicado: Gate 4 pide transición neutra compatible con los 3 CTAs.

**ERR-08 · Supuestos universales**
- Manifestación: "mientras estás con tus hijos" (solo 35% Cluster 1), "ahora mismo", "esta noche".
- Root cause: el guion habla a un perfil específico sin verificar que sea universal.
- Arreglo aplicado: `save-generation.mjs` detecta supuestos (hijos/pareja/ahora mismo/esta noche/son las X).

### Meta-lecciones

1. **Ejecución discrecional = calidad inconsistente.** El skill tenía fases blandas con outputs mentales. Se convirtió en 5 gates duros con output tabular obligatorio.
2. **Los gaps entre proceso (skill) y validación (save-generation) producen errores silenciosos.** Todo check que depende del juicio humano sin output se pierde.
3. **La calibración requiere LEER, no solo ver metadata.** `/plan-3` ahora obliga leer 3 refs de Jesús completos antes de planificar.
4. **Cuando itero un hook 4 veces, el problema no es el hook — es el proceso.** Si los anti-patrones se aplican al escribir (no a posteriori), el primer draft sube.

---

## Template para nuevas entradas

```
## [FECHA] — [Nombre del batch/sesión]

### Contexto
[Qué se intentaba hacer]

### Errores tipificados
**ERR-XX · [Tipo]**
- Manifestación: [qué pasó]
- Root cause: [por qué pasó]
- Arreglo aplicado: [cómo se resuelve sistémicamente]

### Meta-lecciones
[1-3 principios generales derivados]
```
