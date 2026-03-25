# Patrones Estructurales Prohibidos en Leads/Hooks

> Estos patrones se detectan por ESQUELETO, no por nicho. Si cambiar el sustantivo produce el mismo lead, es repetición estructural.
> Este archivo alimenta `scripts/validate-hooks.mjs` — cada patrón tiene un regex y ejemplos.

---

## P1: "¿Cuántas veces te dijeron/preguntaron [elogio]?"
**Esqueleto:** Alguien te elogia por una habilidad → vos lo regalás → eso vale plata.
**Regex:** `cuant[ao]s?\s+(veces|amigas?|personas?)\s+(te\s+)?(dijeron|pidieron|preguntaron|dijo|pidio|pregunto)`
**Quemados:** 5+ leads con esta estructura exacta.
**Por qué falla:** Halago genérico + "eso vale plata" es predecible después de la 2da vez.

## P2: "[Persona] le pidió a la IA que organice/arme todo lo que sabía → guía → vende"
**Esqueleto:** Persona común + pidió a la IA + armó producto + lo vende por $X.
**Regex:** `(le\s+pidi[oó]|arm[oó]|cre[oó]).*(IA|inteligencia artificial).*(gu[ií]a|curso|producto).*(vend|gana|cobra)`
**Quemados:** 5+ leads idénticos con distinto nicho.
**Por qué falla:** El arco "persona ignorante + IA = éxito" se agota rápido. El viewer sabe el final antes de leerlo.

## P3: "Son las [hora] de la noche. [Situación doméstica]. Tenés una hora libre."
**Esqueleto:** Hora nocturna + hijos duermen + hora libre → oportunidad.
**Regex:** `(son las|eran las)\s+\d+\s+(de la noche|de la ma[ñn]ana).*(chicos|hijos|nenes).*(dorm|libr|hora)`
**Quemados:** 3 leads con esta apertura exacta.
**Por qué falla:** Escena doméstica nocturna como gancho es reconocible como fórmula publicitaria.

## P4: "Sabés/hacés X mejor que la mayoría/99%. Y no estás vendiendo nada."
**Esqueleto:** Vos ya sabés + otros no saben tanto + no estás monetizando.
**Regex:** `(sab[eé]s|hac[eé]s|conoc[eé]s)\s+m[aá]s\s+(que|de).*(mayor[ií]a|99|gente|libros|ebooks|cursos|internet)`
**Quemados:** 4+ leads con este mecanismo.
**Por qué falla:** Flattery + guilt es un combo que el viewer detecta como manipulación después de 2 exposiciones.

## P5: "No necesitás ser X. No necesitás saber Y. No necesitás Z." (triple negación)
**Esqueleto:** Lista de 3+ negaciones de barreras comunes.
**Regex:** `no\s+necesit[aá]s.{5,40}no\s+necesit[aá]s.{5,40}no\s+necesit[aá]s`
**Quemados:** 3+ leads con esta cadena.
**Por qué falla:** El ritmo de triple negación es una fórmula de copywriting reconocible.

## P6: "¿Cuántos cursos compraste que no terminaste/no sirvieron?"
**Esqueleto:** Pregunta sobre cursos fallidos → loop de frustración → este es diferente.
**Regex:** `cuant[ao]s?\s+cursos?\s+(compraste|hiciste|empezaste|pagaste)`
**Quemados:** 3+ leads con esta pregunta.
**Por qué falla:** La audiencia RETARGET ya escuchó esta pregunta en 50 ads distintos.

## P7: "Cada vez más gente busca [X] en Google. Miles por mes. Nadie les vende."
**Esqueleto:** Tendencia de búsqueda + nadie monetiza + oportunidad.
**Regex:** `cada\s+vez\s+m[aá]s\s+(gente|personas?)\s+busc[aa]`
**Quemados:** 3+ leads con este arranque.
**Por qué falla:** "Nadie les vende" es mentira después de que 10 ads usen el mismo ángulo. El viewer lo sabe.

---

## Cómo se actualiza este archivo

1. Después de cada batch, revisar hooks quemados y buscar patrones nuevos.
2. Si un patrón aparece 3+ veces en el histórico → agregarlo acá.
3. El regex no tiene que ser perfecto — es heurístico. Falsos positivos se revisan manualmente.
4. Los patrones se validan en `scripts/validate-hooks.mjs` ANTES de guardar.

---

## Qué SÍ funciona (anti-patrones = patrones frescos)

Hooks que pasaron la validación de "genuinamente distintos":
- **Historia personal con fracaso concreto** (G4: "Perdí $15K en prensa") — dato verificable + vulnerabilidad
- **Voz de un tercero** (diálogo hijo: "Ma, ¿por qué siempre estás tejiendo?") — rompe la 4ta pared
- **Curiosidad geográfica** ("El negocio más rentable de un pueblo de 3.000 no es un kiosco") — setup inesperado
- **Flip contraintuitivo genuino** ("El problema no es que no aprendés. Es que aprendés demasiado.") — contradice la expectativa
- **Timeline con proyección a futuro** ("Hace 5 años tejías por hobby. Hoy por plata. Dentro de 5...") — urgencia temporal
- **Analogía concreta no-digital** ("Querés clavar un clavo y lo intentás con una piedra") — sale del mundo online
- **Provocación con dato específico** ("$15K en tele, radio, revistas. Resultado: 1 cliente.") — el número ancla
- **Nadie Explica** ("Todos te dicen [consejo obvio] pero NADIE te explica cómo verga hacerlo.") — frustración con el consejo genérico, el "cómo" es el hook real
- **Hipotético Personal** ("Si mañana me despertara en [situación jodida] y quisiera [resultado soñado] en [menor tiempo posible], esto es exactamente lo que haría.") — empatía + plan concreto + urgencia temporal

#### Variante ADP: "Si empezara de cero a los 50" 🆕
**Fórmula:** "Si tuviera [edad avatar], [limitación 1], [limitación 2], [limitación 3], y quisiera [resultado modesto]... esto es lo que haría."

**Ejemplo completo:**
> "Si tuviera 50 años, no supiera nada de internet, no tuviera seguidores, y quisiera ganar $50 extra por día... esto es exactamente lo que haría."

**Por qué funciona para ADP:**
1. La edad (50) matchea el avatar dominante (Patricia 48, Roberto 62 = 56% de compradores)
2. Las limitaciones son las REALES de la audiencia (no internet, no seguidores, no saber de tecnología)
3. El resultado es modesto ($50/día) → creíble → no activa el filtro de "scam"
4. Jesús hablando desde hipotético = empatía sin condescendencia
5. Validado: @hormozi — posts con esta estructura tienen CLR 24.30% (top 5)

**Variantes para rotar:**
- "Si tuviera 55 años y mi único ingreso fuera una jubilación mínima..."
- "Si supiera cocinar pero no tuviera idea de qué es un producto digital..."
- "Si quisiera dejar de depender de un sueldo pero no supiera ni abrir una cuenta de Gmail..."

**Regla:** El resultado soñado SIEMPRE modesto ($50/día, "plata extra", "un ingreso más"). NUNCA "$10K/mes" ni "libertad financiera". La limitación debe ser REAL del avatar, no inventada.
**Avatar ideal:** Patricia, Roberto, Carlos (los 3 de mayor peso en compradores reales).
**Awareness ideal:** Nivel 4-5 (Problem Aware / Most Aware) — la persona ya sabe que quiere algo pero cree que no puede.
- **Identidad + Dolor** ("Si sos [identidad amplia] y no querés volver a [problema que duele], mirá esto.") — filtra audiencia + activa dolor de repetición
- **Pregunta Limitación** ("¿Se puede [lograr resultado soñado] incluso si [insertar limitación] en solo [tiempo concreto]?") — la limitación hace que se sientan representados, el tiempo concreto da credibilidad
- **Asimetría Temporal** ("Tardé [tiempo largo] en aprender esto, pero te lo enseño en menos de [tiempo corto].") — contraste de esfuerzo largo vs entrega corta = valor percibido altísimo
