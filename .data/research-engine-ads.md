# Research Engine — De Investigación a Copy (Ad Factory v2.0)

> El research no es un paso que se hace y se olvida. Es el COMBUSTIBLE de cada copy. Sin research, escribís ficción. Con research, escribís verdad que vende.

---

## 1. El Pipeline Research-to-Copy

```
SCRAPING ──→ TEARDOWN ──→ EXTRACTION ──→ APPLICATION
(buscar)      (analizar)    (extraer)      (usar en copies)
```

Cada fase produce un output concreto que alimenta la siguiente. Al final del research tenés 4 documentos que hacen que escribir copies sea como pintar por números.

---

## 2. Dónde Buscar (6 Fuentes)

### 2.1 Facebook Ad Library (FUENTE PRIMARIA)

**URL:** `https://www.facebook.com/ads/library/`

**Workflow:**
1. Filtrar por país: US primero (mercado más maduro), luego LATAM (AR, MX, CO, CL)
2. Categoría: "All ads"
3. Buscar por keywords del nicho
   - US: "digital products", "sell online", "make money AI"
   - LATAM: "productos digitales", "ganar dinero", "negocio online"
   - Salud: "diabetic recipes", "recetas diabéticos", "celiac food"
4. Filtrar: "Active ads" + Media type "Image"
5. Ordenar por fecha de inicio (más antiguos primero)

**Señales de winner:**
| Tiempo activo | Status |
|---------------|--------|
| 1-2 semanas | Testeo. No confiar. |
| 1-3 meses | Prometedor. Analizar con atención. |
| 3-6 meses | Winner confirmado. Nadie paga 3 meses por un ad que no funciona. |
| 6-12 meses | Winner sólido. Estudiar CADA elemento. |
| 1+ año | Winner absoluto. Copiar la estructura (no el copy). |

**Cuántos analizar:** Mínimo 20 winners por nicho. Ideal 50.

### 2.2 TikTok / Instagram Reels (HOOKS)

**Para qué:** Encontrar hooks virales que funcionan en el nicho.

**Workflow TikTok:**
1. Buscar keywords del nicho
2. Filtrar por "más populares" / "esta semana"
3. Descargar los top 20
4. Transcribir
5. Extraer SOLO el hook (primeros 3-5 segundos)

**Qué buscar:** La FÓRMULA del hook, no el contenido. "X le cambió la vida" no es un hook — es un template. "Le pidió algo a ChatGPT y ganó $35.000 en 9 días" es un hook con fórmula [Acción] + [Resultado específico] + [Timeline].

**Descargar:** `yt-dlp -o "research/tiktok/%(uploader)s_%(id)s.%(ext)s" "URL"`

**Reels:** Reels con más de 10K likes en cuentas de menos de 50K seguidores = contenido viral.

### 2.3 YouTube (PROFUNDIDAD)

**Para qué:** Entender cómo habla el avatar. Qué preguntan en los comentarios. Qué les duele.

**Workflow:**
1. Buscar keywords del nicho + filtrar "Este mes"
2. Ir a los comentarios de los top 10 videos
3. Copiar los 30 comentarios con más likes
4. Buscar patrones: qué preguntan, qué duele, qué quieren, qué no entienden

**Títulos de YouTube que funcionan = headlines testeados por el algoritmo.**

### 2.4 Grupos de Facebook / Reddit (VOCES REALES)

**Para qué:** Voice Mining — extraer frases EXACTAS que usa el avatar.

**Facebook:**
1. Unirse a 5-10 grupos del nicho
2. Leer posts de las últimas 2 semanas
3. Copiar frases textuales de posts con más interacción
4. Buscar posts de "ayuda", "no sé qué hacer", "alguien probó..."

**Reddit:**
1. Buscar subreddits del nicho (ej: r/emprendimientos, r/freelance, r/beermoney)
2. Ordenar por "Top — This Month"
3. Leer comments de los top 20 posts
4. Extraer frases textuales de frustración, deseo, miedo

### 2.5 Amazon Reviews (OBJECIONES)

Las reviews 2-3 estrellas de libros del nicho contienen las objeciones REALES.

1. Buscar libros del nicho en Amazon
2. Ir a reviews de 2-3 estrellas
3. Copiar frases de insatisfacción
4. Estas frases = objeciones que tu copy debe destruir

### 2.6 Comentarios de Ads de Competidores

1. En Ad Library, hacer click en "See ad details"
2. Leer los comentarios
3. Comentarios negativos = objeciones reales
4. Comentarios positivos = ángulos que resuenan

---

## 3. Winner Teardown Template

Por cada winner encontrado, completar:

```
## WINNER #[número]

**Básicos:**
- Anunciante: [nombre/URL]
- Activo desde: [fecha — cuanto más viejo, mejor]
- País: [US/LATAM]
- Formato: [imagen/video/carrusel]

**COPY ANALYSIS:**
- Hook (primera línea): [transcribir exacto]
- Hook fórmula: [ej: Escena + hora + lugar]
- Estructura: [storytelling/lista/math/contrarian/testimonio/comparación/descubrimiento/before-after]
- Longitud: [palabras]
- Schwartz: [nivel]
- CTA: [transcribir exacto]
- CTA fórmula: [ej: Clase gratuita + registrate + baja fricción]
- Tono: [casual/formal/urgente/empático]

**VISUAL ANALYSIS:**
- Tipo imagen: [comida/persona/texto/producto/screenshot]
- Texto en imagen: [sí/no — qué dice]
- Colores dominantes: [lista]
- Personas visibles: [sí/no]

**MECANISMO:**
- ¿Tiene mecanismo único? [sí/no]
- Nombre del mecanismo: [si tiene]
- Cómo lo introduce: [en qué sección del copy]

**PRUEBA SOCIAL:**
- Tipo: [testimonio/dato/screenshot/autoridad/caso estudio]
- Formato: [nombre+edad+resultado / solo número / cita directa]

**EVALUACIÓN:**
- Por qué funciona: [hipótesis en 2-3 líneas]
- Qué robar: [elementos adaptables]
- Qué mejorar: [debilidades detectadas]
```

**Cuántos teardowns:**
| Alcance | Teardowns mínimos |
|---------|-------------------|
| Producto nuevo (0 data) | 30-50 winners |
| Producto existente (con data) | 15-20 winners |
| Iteración/escala | 10 propios + 10 nichos adyacentes |

---

## 4. Los 4 Documentos de Extraction

### 4.1 AVATAR_VOICES.md — Frases literales del avatar

**Mínimo 20 frases.** Cada copy debe usar AL MENOS 1 frase del Voice Mining.

```
## Dolores (frases textuales)
1. "No me alcanza el sueldo y ya no sé qué recortar"
2. "Tengo 41 años y le estoy pidiendo plata a mi hermana menor"
3. "Si me enfermo una semana, no cobro"
4. "Estoy preso de mi propio negocio"
5. "Tengo seguidores pero no gano un peso"

## Deseos (frases textuales)
1. "Quiero ganar plata sin depender de un jefe"
2. "Me encantaría trabajar desde casa y ver crecer a mis hijos"
3. "Solo quiero algo propio, no pido más"

## Objeciones (frases textuales)
1. "No sé nada de tecnología"
2. "Ya soy grande para esto"
3. "Seguro es una estafa"
4. "No tengo plata para invertir"
5. "Ya probé y no funcionó"

## Lenguaje del nicho
- "laburo" no "trabajo"
- "guita" no "dinero"
- "me la juego" = arriesgo
```

**Fuentes aceptadas:** Comentarios reales de Facebook, Reddit, YouTube, Amazon. NUNCA inventar frases.

### 4.2 WINNER_PATTERNS.md — Patrones de los mejores ads

```
## Hooks que funcionan (top 10)
| # | Hook | Fórmula | Fuente |
|---|------|---------|--------|
| 1 | "Eran las 11 de la noche en una pizzería..." | Escena + hora + lugar | Ad Library US |
| 2 | "Le pidió algo a ChatGPT y ganó $35.000 en 9 días" | Acción + resultado + timeline | TikTok |

## Estructuras ganadoras (top 5)
1. Storytelling personal (pobreza → transformación) — 60% de winners LATAM
2. Math-based (el cálculo que sorprende) — 25% de winners US
3. Testimonio con cita directa — 15% en ambos

## Mecanismos que funcionan
1. "La IA hace el 80% del trabajo" — presente en 40% de winners
2. "Validar ANTES de crear" — diferenciador clave
3. "Sin seguidores, sin experiencia, sin capital" — triple anti-objeción

## CTAs que convierten
1. "Clase gratuita" + "Registrate gratis" — 70% de winners
2. "Link en bio" / "Link abajo" — 20%
3. CTA con baja fricción ("fijate si es para vos") — 10%

## Patrones visuales ganadores
1. Texto en objeto real (servilleta, ticket, post-it) — 35%
2. Screenshot de resultado (dashboard, WhatsApp) — 25%
3. Persona real en contexto cotidiano — 20%
4. Comida/producto en escena natural — 15%
5. Antes/después visual — 5%
```

### 4.3 OBJECTION_BANK.md — Objeciones con respuesta

| # | Objeción (frase exacta) | Copy que la destruye |
|---|------------------------|---------------------|
| 1 | "No sé nada de tecnología" | "Don Héctor vendió guías de asado usando solo audios de WhatsApp. Si mandás audios, sabés suficiente." |
| 2 | "Ya soy grande para esto" | "Marta tiene 58 años y vendió 42 guías de matemáticas. La edad no es excusa — es ventaja." |
| 3 | "Seguro es una estafa" | Clase GRATUITA. No pido tarjeta, no pido datos. Si no te sirve, no perdiste nada. |
| 4 | "No tengo plata para invertir" | "El costo de crear un producto digital: $0. Solo necesitás un celular y lo que ya sabés." |
| 5 | "No tengo tiempo" | "Martín armó su producto en un fin de semana. Sofía lo hizo mientras cocinaba." |
| 6 | "Ya probé y no funcionó" | "El 90% que falla crea el producto antes de validar. Este método valida PRIMERO." |
| 7 | "No sé qué vender" | "Tu producto está escondido en la pregunta que más te hacen." |
| 8 | "Eso funciona en EEUU, acá no" | "Marta en Salta. Héctor en Mendoza. Diego en Buenos Aires. Funciona acá." |
| 9 | "No tengo seguidores" | "Valeria vendió $134.750 compartiéndolo en 3 grupos de Facebook. Cero seguidores." |
| 10 | "Suena muy fácil, debe ser mentira" | "No es fácil. Es SIMPLE. Que no es lo mismo. Requiere trabajo — pero trabajo inteligente." |

### 4.4 SWIPE_FILE.md — Los 10 mejores copies para referencia

Guardar los 10 mejores copies de competidores como inspiración. NO para copiar — para entender QUÉ funciona y POR QUÉ.

---

## 5. Reglas de Aplicación del Research

1. **Cada copy usa AL MENOS 1 frase del Voice Mining** — textual o adaptada. Esto es lo que hace que el avatar sienta "eso me pasa a mí".
2. **Cada nicho ataca AL MENOS 2 objeciones del Objection Bank** — una en el copy principal, otra en la descripción o headline.
3. **Cada ángulo referencia AL MENOS 1 patrón de los winners** — usar la fórmula del hook, la estructura, o el tipo de prueba que funcionó.
4. **El mecanismo del producto está nombrado y es consistente** — una vez que lo nombrás (ej: "El Sistema de Producto en 48hs"), usalo en TODOS los copies.
5. **Los números son REALES** — si no tenés datos reales, usá datos del mercado. NUNCA inventar ventas o resultados.

### Checklist pre-escritura

Antes de escribir el primer copy, verificar:
- [ ] Tengo 20+ frases del Voice Mining
- [ ] Tengo 20+ teardowns de winners
- [ ] Tengo 10 objeciones con respuesta
- [ ] Tengo 10 hooks probados para adaptar
- [ ] Tengo el mecanismo único nombrado
- [ ] Tengo 5+ resultados reales (del producto o del mercado)
- [ ] Tengo la tracking table de diversidad lista

---

## 6. Research por Nicho Específico

| Vertical | Dónde buscar | Qué buscar | Patrón dominante |
|----------|-------------|-----------|-----------------|
| Info-products | Ad Library: "curso", "clase gratuita", "masterclass" | Fórmulas de hook storytelling, CTAs baja fricción | Historia personal pobreza → transformación |
| Salud | Ad Library: "diabetes", "recetas", "sin azúcar" | Imágenes de comida, antes/después, compliance | Foto de comida con texto en pizarra/servilleta |
| Finanzas | Ad Library: "invertir", "trading", "ingresos pasivos" | Screenshots de resultados, math-based copies | Número impactante + timeline + anti-hype |
| Coaching | Ad Library + LinkedIn: "empresario", "escalar", "delegar" | Copies identitarios (Schwartz N5), mecanismos únicos | "Si desaparecés 2 semanas, tu negocio sobrevive?" |
| E-commerce | Ad Library + TikTok: producto específico | UGC, unboxing, before/after del producto | "Mirá lo que me llegó" + reacción genuina |

---

## 7. Template de Avatar para Research

```
AVATAR: [nombre ficticio]
=====================================
Edad: [rango]
Situación: [empleado/desempleado/mamá/jubilado/etc]
Ingreso: [rango mensual]
Ubicación: [ciudad tipo]

DOLOR PRINCIPAL:
- ¿Qué le quita el sueño?
- ¿Qué busca en Google a las 2AM?
- ¿De qué se queja con amigos?

DESEO PRINCIPAL:
- ¿Qué quiere lograr en 6 meses?
- ¿Qué envidia de otros?
- Si tuviera una varita mágica, ¿qué cambiaría?

CREENCIA LIMITANTE:
- ¿Por qué cree que NO puede lograrlo?
- ¿Qué le dijeron que le quedó grabado?
- ¿Qué excusa se repite?

CONSUMO DE CONTENIDO:
- ¿Qué ve en YouTube?
- ¿A quién sigue en Instagram?
- ¿Qué grupos de Facebook/WhatsApp tiene?

VOCABULARIO:
- ¿Qué palabras usa para describir su problema?
- ¿Cómo habla? (formal/informal/slang)
- ¿Qué frases repite?

MOMENTO DE COMPRA:
- ¿Qué tiene que pasar para que actúe?
- ¿Qué lo frena?
- ¿Cuánto pagaría?
```

---

## 8. Integración con el Sistema ADP

Este research engine se conecta con los sistemas existentes del Script Generator:

| Documento research | Se conecta con | Cómo |
|-------------------|----------------|------|
| AVATAR_VOICES.md | `.memory/avatar-frases-reales.md` + `.data/inteligencia-compradores.md` | Las frases del voice mining enriquecen las frases reales existentes |
| WINNER_PATTERNS.md | `.data/winner-patterns.md` | Los patrones de winners de copies complementan los de guiones |
| OBJECTION_BANK.md | `.data/objeciones-adp.md` | Las objeciones de copies se suman a las 4 objeciones universales |
| Winner Teardown | `.data/analisis-mejores-practicas.md` | Los teardowns de ads complementan el análisis de prácticas |

**Regla:** El research de copies y el research de guiones de video se ALIMENTAN mutuamente. Un hook que funciona en un copy escrito probablemente funciona como lead de video, y viceversa.
