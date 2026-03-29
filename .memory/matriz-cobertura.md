# Matriz de Cobertura — Estado Actual

## Resumen: 53 Generaciones (al 2026-03-27)

---

### Clasificación por Familia de Ángulo

| Familia | Cantidad | % |
|---------|----------|---|
| confrontacion | 9 | 17% |
| identidad | 8 | 15% |
| oportunidad | 7 | 13% |
| mecanismo | 6 | 11% |
| historia / historia_personal | 6 | 11% |
| (por número: 1-5) | 7 | 13% |
| unknown (pre-sistema) | 10 | 19% |

**Gaps:** `historia` tiene menos cobertura que `confrontacion` y `identidad`. Equilibrar.

### Clasificación por Tipo de Cuerpo (Vehículo Narrativo)

| Tipo | Cantidad | % |
|------|----------|---|
| conversacion_experto_novato | 10 | 19% |
| victor_elas_conversation | 10 | 19% |
| pregunta_respuesta | 10 | 19% |
| listicle | 3 | 6% |
| storytelling_hollywood | 2 | 4% |
| contraste_emocional | 2 | 4% |
| comparacion_caminos | 1 | 2% |
| un_dia_en_la_vida | 1 | 2% |
| historia_con_giro | 1 | 2% |
| demolicion_mito | 1 | 2% |
| demolicion_alternativas | 1 | 2% |
| analogia_extendida | 1 | 2% |
| unknown (pre-sistema) | 10 | 19% |

**Gaps:** 3 vehículos dominan (57% entre los 3). Faltan: tier_list_rating, trailer_recurso, quiz_comparacion. Muy poco: storytelling_hollywood, contraste_emocional, comparacion_caminos.

### Clasificación por Segmento

| Segmento | Cantidad | % |
|----------|----------|---|
| A (Emprendedor frustrado) | 17 | 32% |
| D (Escéptico) | 8 | 15% |
| B (Principiante 45+) | 7 | 13% |
| C (Mamá/papá) | 7 | 13% |
| Todos | 1 | 2% |
| unknown (pre-sistema) | 13 | 25% |

**Gaps:** A sigue sobre-representado (32%). D mejoró (15%). B y C necesitan más.

### Clasificación por Avatar

| Avatar | Cantidad | % | Peso real (compradores) |
|--------|----------|---|------------------------|
| martin | 16 | 30% | 5% |
| unknown | 12 | 23% | — |
| patricia | 9 | 17% | 26% |
| roberto | 4 | 8% | 30% |
| diego | 3 | 6% | — |
| laura | 3 | 6% | — |
| soledad | 2 | 4% | — |
| valentina | 2 | 4% | — |
| camila | 1 | 2% | — |

**PROBLEMA CRITICO:** Martín (5% de compradores reales) tiene 30% de guiones. Patricia+Roberto (56% de compradores) solo tienen 25% de guiones. **Invertir urgente.**

### Clasificación por Etapa de Funnel

| Etapa | Cantidad | % |
|-------|----------|---|
| TOFU | 24 | 45% |
| unknown | 13 | 25% |
| MOFU | 10 | 19% |
| RETARGET | 6 | 11% |
| BOFU | 0 | 0% |
| EVERGREEN | 0 | 0% |

**Gaps:** BOFU y EVERGREEN siguen en 0. RETARGET mejoró (de 0 a 6). TOFU bajó de 89% a 45%.

### Cruce Familia × Cuerpo

| Familia | Cuerpos usados | Cuerpos NO usados |
|---------|---------------|-------------------|
| confrontacion (9) | victor_elas(3), pregunta_respuesta(2), experto_novato(2), demolicion_alt(1), analogia(1) | listicle, storytelling, contraste, historia_giro, comparacion |
| identidad (8) | contraste_emocional(2), victor_elas(2), pregunta_respuesta(2), un_dia_vida(1), experto_novato(1) | listicle, storytelling, demolicion, analogia |
| oportunidad (7) | listicle(3), pregunta_respuesta(2), comparacion(1), demolicion_mito(1) | storytelling, contraste, victor_elas, experto_novato |
| mecanismo (6) | pregunta_respuesta(3), victor_elas(3) | TODO el resto — muy concentrado |
| historia (4) | victor_elas(2), pregunta_respuesta(1), historia_giro(1) | storytelling_hollywood(!), contraste |
| historia_personal (2) | storytelling_hollywood(2) | solo 1 tipo usado |

**Gaps de cruce:** `mecanismo` solo usa 2 vehículos (muy monótono). `historia` no usa storytelling_hollywood (contradictorio). `oportunidad` no usa formatos conversacionales.

---

## HUECOS CRITICOS (prioridades)

### 1. Avatar desbalanceado (P0)
- Martín = 30% de guiones pero 5% de compradores → **FRENAR**
- Patricia+Roberto = 25% de guiones pero 56% de compradores → **DUPLICAR**

### 2. Vehículos concentrados
- 3 vehículos = 57% de todo. Faltan 3 vehículos (tier_list, trailer, quiz) con 0 uso.
- `mecanismo` solo usa 2 vehículos distintos.

### 3. Funnel incompleto
- BOFU = 0, EVERGREEN = 0
- RETARGET mejoró (6) pero necesita más

### 4. Familias por número
- 7 guiones usan familias como "1", "2", "3" en vez de nombres → son del sistema viejo, no se pueden cruzar bien

---

## Ideas de Nicho

### Usadas
- Cocina/recetarios (3 guiones)
- Mascotas/cuidado de perros (1)
- Finanzas personales (3)
- Repostería/tortas (1)

### Disponibles (no usadas)
- Crianza / maternidad
- Fitness / ejercicio en casa
- Jardinería / huerta
- Manualidades / tejido
- Idiomas (inglés básico)
- Belleza / skincare casero
- Organización del hogar
- Nutrición / alimentación saludable
- Fotografía con celular
- Reparaciones del hogar
- Yoga / meditación guiada
- Educación para niños
- Veterinaria básica
- Maquillaje
- Costura / arreglos de ropa

---

## Resumen de Prioridades

1. **Avatar:** Más Patricia y Roberto. Frenar Martín (máx 1 de 10).
2. **Vehículos:** Menos pregunta_respuesta/experto_novato/victor_elas. Más listicle, storytelling, contraste, tier_list.
3. **Funnel:** Crear BOFU y EVERGREEN. Más RETARGET.
4. **Cruces:** Diversificar vehículos dentro de cada familia (especialmente mecanismo e historia).
5. **Nichos:** Usar los 15 disponibles sin repetir cocina/finanzas.
