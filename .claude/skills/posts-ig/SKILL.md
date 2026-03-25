---
name: posts-ig
description: Genera plan semanal de posts de Instagram (carruseles + imágenes estáticas) para Jesús Tassarolo (ADP). Usar cuando el usuario pide posts, carruseles, plan de feed, o contenido orgánico que NO sea stories ni reels/videos.
argument-hint: [semana] [avatar] [tema]
---

# Generador de Posts de Instagram — ADP (Jesús Tassarolo)

**REGLA CARDINAL: Este skill es para POSTS (carruseles + imágenes estáticas). NO para reels/videos (`/guion`), NO para stories (`/stories`), NO para ads pagos (`/ad-copy`).**

**Diferencia clave:** Un post de feed es una pieza VISUAL + CAPTION que vive permanente en el perfil. Los carruseles educan en 5-10 slides. Las imágenes estáticas son frases de impacto o datos. El caption es SOLO un CTA de captura — el contenido está en las slides, no en el texto.

---

## Paso 0: Leer archivos obligatorios

### Siempre leer:
1. `.data/ig-references/patrones-organico-ig.md` — 14 patrones de 1475 posts
2. `.data/ig-references/ramiro.cubria_captions-carruseles.md` — data de carruseles (190 posts)
3. `.data/ig-references/ramiro.cubria_micro-patrones.md` — micro-patrones de engagement
4. `.data/motor-audiencia.md` — tensiones, vocabulario, objeciones, triggers
5. `.data/avatares-adp.md` — los 7 avatares con pesos
6. `.data/stories-lead-magnets.md` — lead magnets disponibles para CTA
7. `.memory/jesus-tono-adp-nuevo.md` — tono de Jesús (voseo argentino, consejero)

### Condicionales:
- Si se necesitan ángulos frescos: `.data/angulos-expandidos.md`
- Si se quiere coordinar con videos: `.data/matriz-cobertura.md`
- Si hay posts previos: `.data/posts-ig/` (para no repetir)

---

## Paso 1: Activar MOTOR DE AUDIENCIA

Mismo proceso que guiones/stories pero adaptado a posts:

1. **Tensión emocional (T1-T13)** — cada post debe atacar una tensión distinta
2. **Vocabulario del segmento** — el texto en slides debe usar las palabras EXACTAS del avatar
3. **Avatar target** — elegir 1 de los 7 por post. Respetar pesos:
   - Patricia (48) + Roberto (62) = 56% de los posts
   - Martín (26) = máximo 1 de 5

---

## Paso 2: Definir el batch semanal (3-5 posts)

### Composición del batch:

| # | Tipo | Objetivo | Frecuencia |
|---|------|----------|------------|
| 1 | Carrusel educativo (trending topic) | Awareness + captura | 2/sem (OBLIGATORIO) |
| 2 | Carrusel caso real / antes-después | Prueba social + captura | 1/sem |
| 3 | Imagen estática (frase de impacto) | Awareness + saves | 1/sem |
| 4 | Carrusel FAQ / objeciones | Conversión | 1 cada 2 sem |

### Ratio contenido:venta = 3:1
- 3 posts de contenido puro (educar, inspirar, provocar) por cada 1 de venta
- Los carruseles educativos SON contenido — no son venta aunque tengan CTA
- Dato: Tino tiene ratio 4:1 y está en explosión (+912% views). Heras repite CTA y está en declive.

### Coordinación con otros canales (NO solapar):
- `/plan-week` genera 10 guiones de video → publicados como reels
- `/stories` genera 4 secuencias semanales → efímeras
- **Posts de feed** complementan: lo que el reel dice en 60s, el carrusel lo profundiza en 7 slides

---

## Paso 3: Elegir TEMAS + KEYWORDS

### 3a. Temas (de dónde salen)

Fuentes por prioridad:
1. **Google Trends** — correr `node scripts/trends-scan.mjs` o `curl http://localhost:3002/api/trends?q=TEMA`
   - Nichos con interés SUBIENDO → carrusel educativo
   - Rising queries → ángulos frescos para slides
2. **Objeciones del motor de audiencia** → carrusel FAQ
3. **Casos reales de alumnos** (de `inteligencia-compradores.md`) → carrusel caso real
4. **Ángulos no cubiertos** (de `matriz-cobertura.md`) → profundizar en slide lo que el video no cubrió

### 3b. Keywords (para el CTA del caption)

**REGLA DURA: La keyword determina el engagement del post.**

| Tipo de keyword | Avg engagement | Usar |
|-----------------|---------------|------|
| Trending topic (IA, SEO, AGENTE, BOT) | 3787-6729 | SIEMPRE para carruseles educativos |
| Recurso concreto (PDF, DICCIONARIO, PROMPTS) | 2808-4681 | Para lead magnets tangibles |
| Genérica (YO, CLASE) | 452-1083 | EVITAR — solo como fallback |
| Nombre propio (JOSE, FRANCO, TOMAS) | 9-70 | PROHIBIDO — engagement casi nulo |

**Reglas de keyword:**
- NUNCA usar nombres propios como keyword
- NUNCA repetir la misma keyword 2 semanas seguidas
- La keyword debe ser CONTEXTUAL al contenido del carrusel (no genérica)
- Preferir keywords de 1 palabra, en MAYÚSCULAS
- Si el carrusel habla de cocina → keyword COCINA. Si habla de IA → keyword IA.

---

## Paso 4: Diseñar cada post

### 4a. Para CARRUSELES EDUCATIVOS (5-10 slides)

**Principio: el carrusel MUESTRA pero no ENTREGA.** Genera hambre por el recurso completo.

**Estructura de slides:**

| Slide | Función | Contenido |
|-------|---------|-----------|
| 1 | Hook visual | Título grande + dato/pregunta provocadora. Colores contrastantes. |
| 2 | Contexto | Por qué este tema importa AHORA (dato de trends, estadística) |
| 3-7 | Desarrollo | 1 punto por slide. Texto corto (máx 3 líneas). Visual > texto. |
| 8 | Resumen / cierre | Recapitular los puntos clave en 1 slide |
| 9 | CTA visual | "Comentá [KEYWORD] y te mando [recurso] por DM" en grande |
| 10 | (Opcional) | Prueba social micro o dato extra que refuerza |

**Reglas de slides:**
- Máximo 3 líneas de texto por slide (70% visual, 30% texto)
- Cada slide debe poder leerse en 3 segundos
- Tipografía grande, legible sin zoom
- Voseo argentino en todo el texto
- Anti-ficción: si un dato puede estar en CUALQUIER carrusel de CUALQUIER cuenta → es genérico → cambialo
- Números no-redondos: $35.000 (no $30.000), 9 días (no 1 semana)

### 4b. Para CARRUSELES DE CASO REAL (5-8 slides)

**NUNCA usar el nombre del alumno como keyword** (JOSE = 9 engagement).

| Slide | Función |
|-------|---------|
| 1 | Resultado impactante (dato + avatar) |
| 2 | Quién es esta persona (situación ANTES, sin nombre) |
| 3-4 | Qué hizo (proceso simplificado, 2-3 pasos) |
| 5 | Resultado con detalle (números, timeline) |
| 6 | La lección para el viewer |
| 7 | CTA: "Comentá [KEYWORD_TEMÁTICA] y te mando [recurso]" |

### 4c. Para IMÁGENES ESTÁTICAS

**Una frase de impacto que genere saves y shares.**

Tipos que funcionan:
- Dato provocador: "El 73% de los cursos de Hotmart los compra gente de +40 años."
- Frase confrontativa: "Tenés más de 10.000 seguidores y cero ventas. No es un problema de alcance."
- Perspectiva contrarian: "No necesitás más contenido. Necesitás UN producto que se venda solo."

**Reglas:**
- Fondo de color sólido + texto grande centrado
- Máximo 2 oraciones
- Sin emoji decorativo
- Tipografía bold, legible
- Caption: frase reflexiva corta (5-10 palabras) SIN CTA o con CTA suave

---

## Paso 5: Escribir CAPTIONS

### Fórmula validada (CLR 231.7%, n=534 posts):

```
Comenta [KEYWORD] y te mando [recurso específico] por DM

Nos vemos amigos!
```

**Variante corta (para imágenes de awareness):**
```
Comentá [KEYWORD]
```

**Variante reflexión + CTA (para casos reales):**
```
[Frase reflexiva de 1-2 oraciones sobre el caso]

Comenta [KEYWORD] y te mando [recurso] por DM

Nos vemos amigos!
```

### Reglas de caption:
- **11-15 palabras** (sweet spot validado con data de 1078 posts)
- **CERO hashtags** (Ramiro usa 0 en 1078 posts)
- **Emojis funcionales SOLAMENTE:** solo usar cuando cumplen función de acción
- **NUNCA preguntas** en el caption (solo 23 de 1078 posts las usan, CLR mediocre)
- **NUNCA captions largos** (+30 palabras bajan CLR)
- **La creatividad está en las SLIDES, no en el caption** — el caption es una máquina de captura

---

## Paso 6: Definir LEAD MAGNET por post

De `.data/stories-lead-magnets.md`:

| LM | Keyword natural | Para qué tipo de post |
|----|-----------------|----------------------|
| LM-1: 5 Prompts de IA | PROMPTS | Carruseles de IA/herramientas |
| LM-2: 10 Nichos LATAM | NICHOS | Carruseles de oportunidad/tendencias |
| LM-3: Checklist lanzamiento | CHECK | Carruseles de proceso/paso a paso |
| LM-4: Estructura página venta | ESTRUCTURA | Carruseles de ventas/copy |
| LM-5: Clase gratuita | CLASE | Cualquiera (pero keyword genérica, menor engagement) |

**Regla:** Nunca repetir el mismo LM 2 semanas seguidas. Alternar entre documento (LM1-4) y clase (LM5).

---

## Paso 7: Asignar DÍAS de publicación

Coordinar con reels y stories:

| Día | Feed (posts) | Reels (videos) | Stories |
|-----|-------------|----------------|---------|
| Lunes | -- | -- | Personalidad |
| **Martes** | **Carrusel educativo #1** | Reel de venta | CTA LM #1 |
| Miércoles | -- | Reel de contenido | Descanso |
| **Jueves** | **Carrusel caso/FAQ** | -- | CTA LM #2 |
| Viernes | -- | Reel de contenido | Descanso |
| **Sábado** | **Imagen estática** | -- | Personalidad |
| Domingo | -- | -- | Expertise |

**Reglas de timing:**
- Publicar cada 4-7 días tiene mejor CLR que publicar diario
- Martes = máximo CLR (engagement). Miércoles = máximo reach (views).
- NUNCA publicar post + reel + stories el mismo día sobre el mismo tema

---

## Paso 8: Validar REGLAS DURAS

### Checklist obligatorio:

- [ ] Batch tiene 3-5 posts (no más, no menos)
- [ ] Mínimo 2 carruseles educativos con trending topic
- [ ] Ratio 3:1 contenido:venta respetado
- [ ] Cada post tiene avatar target distinto (o al menos 2 avatares distintos)
- [ ] Cada post tiene tensión emocional distinta
- [ ] Keywords son CONTEXTUALES al contenido (no genéricas)
- [ ] NINGUNA keyword es un nombre propio
- [ ] NINGUNA keyword se repitió de la semana anterior
- [ ] Captions son 11-15 palabras (fórmula validada)
- [ ] CERO hashtags en todos los captions
- [ ] Carruseles tienen máximo 10 slides con texto corto (3 líneas máx)
- [ ] Slide 1 de cada carrusel tiene hook visual fuerte
- [ ] Último slide tiene CTA claro con keyword en grande
- [ ] Lead magnets no repetidos vs semana anterior
- [ ] Voseo argentino en todo el texto de slides
- [ ] Anti-ficción: cada slide tiene al menos 1 dato específico
- [ ] Números no-redondos usados donde aplique
- [ ] Tono "consejero" (no "bro tech") — Jesús habla como un amigo mayor, no como un influencer de 25

### Check de tono (Jesús vs Ramiro):
Ramiro es un pibe tech de 25 que dice "puta locura" y "literalmente". Jesús es un tipo de 40+ que dice "la realidad es que" y "mirá lo que pasa". Los patrones de Ramiro se ADAPTAN, no se copian:
- Ramiro dice "es una puta locura" → Jesús dice "esto es impresionante"
- Ramiro dice "cualquier pelotudo puede" → Jesús dice "cualquiera puede, no importa la edad"
- La estructura es de Ramiro. La voz es de Jesús.

---

## Paso 9: Presentar al usuario

### Formato de presentación:

```markdown
## Plan de Posts IG — Semana [fecha]

### Resumen del batch

| # | Tipo | Tema | Avatar | Keyword | Lead Magnet | Día |
|---|------|------|--------|---------|-------------|-----|
| 1 | Carrusel educativo | [tema trending] | [nombre] | [KEYWORD] | [LM-#] | Martes |
| 2 | ... | ... | ... | ... | ... | ... |

---

### Post 1: [Título]

**Tipo:** Carrusel educativo | **Avatar:** Patricia (48) | **Tensión:** T4
**Keyword:** [KEYWORD] | **Lead magnet:** LM-2 (10 Nichos)

#### Slides:

| # | Texto en pantalla | Concepto visual |
|---|-------------------|-----------------|
| 1 | [hook visual] | [descripción del diseño] |
| 2 | ... | ... |
| ... | ... | ... |

#### Caption:
```
Comenta [KEYWORD] y te mando [recurso] por DM

Nos vemos amigos!
```

#### Notas de diseño:
- Paleta: [colores]
- Tipografía: bold sans-serif, legible
- Estilo: [minimalista / datos / storytelling visual]

---

[Repetir para cada post]
```

---

## Paso 10: Guardar

Guardar en `.data/posts-ig/` como JSON:

```json
{
  "id": "uuid",
  "type": "ig_post",
  "post_type": "carrusel_educativo|carrusel_caso|carrusel_faq|imagen_estatica",
  "topic": "tema del post",
  "avatar": "nombre_del_avatar",
  "tension_id": "T3",
  "keyword": "IA",
  "lead_magnet_id": "LM-1",
  "caption": "Comenta IA y te mando el recurso por DM\n\nNos vemos amigos!",
  "slides": [
    {
      "number": 1,
      "function": "hook",
      "text_on_screen": "5 herramientas de IA que cambiaron todo en 2026",
      "visual_concept": "Fondo azul oscuro, texto blanco bold, iconos de IA"
    }
  ],
  "design_notes": "Paleta azul/blanco, tipografía Inter Bold",
  "planned_day": "martes",
  "week": "2026-W13",
  "status": "borrador",
  "createdAt": "2026-03-25T...",
  "metrics": {
    "likes": null,
    "comments": null,
    "saves": null,
    "shares": null,
    "reach": null
  }
}
```

---

## DATOS DUROS (referencia rápida)

| Dato | Fuente | Implicancia |
|------|--------|-------------|
| Carruseles = 3.9x más comments que videos | ramiro_captions (190 vs 888) | Priorizar carruseles para captura |
| Keywords trending (IA, SEO) = 3787 avg eng | ramiro_captions s5.5 | Usar keywords de trending topics |
| Nombres propios = <100 engagement | ramiro_captions bottom 10 | NUNCA usar nombres como keyword |
| Caption 11-15 palabras = sweet spot | ramiro_captions s4.7 | No escribir captions largos |
| "Comenta X y te mando" = 231.7% CLR | ramiro_captions s4.6 | Fórmula fija, no innovar |
| 0 hashtags en 1078 posts | ramiro_captions s4.3 | No usar hashtags |
| Ratio 3:1 contenido:venta | patrones-organico-ig s13 | Tino sube, Heras cae |
| Publicar cada 4-7 días = mejor CLR | patrones-organico-ig s11 | No publicar diario |
| Martes = máx CLR, Miércoles = máx views | patrones-organico-ig s11 | Carrusel de venta el martes |

---

## CROSS-REFERENCE: Cómo Posts usa los sistemas de Ads/Stories

| Sistema | Cómo se usa en Posts |
|---------|---------------------|
| Motor de Audiencia (tensiones) | Arco emocional del carrusel |
| Motor de Audiencia (vocabulario) | Texto en slides |
| Avatares (7 con pesos) | A quién va cada post. Mismos pesos |
| Ángulos Expandidos (5 familias) | Tema/big idea del carrusel |
| Lead Magnets (stories) | Recurso que se ofrece en el CTA |
| Winner Patterns (ads) | Qué temas/ángulos funcionaron → sesgar posts |
| Google Trends | Fuente #1 de temas para carruseles educativos |
| Patrones orgánico IG | Estructura, keywords, timing, ratio contenido:venta |
