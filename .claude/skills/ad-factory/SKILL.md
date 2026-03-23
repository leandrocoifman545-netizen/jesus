# Skill: Ad Factory — Producción Masiva de Anuncios World-Class

> De CERO a 100+ creativos listos para Meta Ads. Cada copy es de clase mundial. Cada imagen es única.

---

## Cuándo usar este skill

- Cuando el usuario pide producción MASIVA de ads (100+ copies)
- Cuando hay un lanzamiento nuevo y se necesitan muchos creativos
- Cuando se quiere testear un producto nuevo en 20 nichos × 5 ángulos
- **NO usar para copies individuales** → usar `/ad-copy` en su lugar

---

## Archivos obligatorios a leer

1. `.data/copy-engine-ads.md` — El corazón: 8 estructuras, scorecard, anti-patrones
2. `.data/copies-ejemplo-clase-mundial.md` — 5 copies de referencia
3. `.data/research-engine-ads.md` — Pipeline de investigación
4. `.data/niche-mapping-ads.md` — Nichos, avatares, ángulos, matrices
5. `.data/image-patterns-ads.md` — 100 entornos para imágenes
6. `.data/avatares-adp.md` — 8 avatares formales con data real
7. `.data/inteligencia-compradores.md` — Frases reales de 562 compradores
8. `.memory/jesus-tono-adp-nuevo.md` — Tono y voz de Jesús

---

## Las 7 Fases

### FASE 0: INPUT
Recopilar del usuario:
- Producto, URL, tipo (infoproducto, SaaS, etc.)
- Avatar principal, promesa central, prueba social
- Historia del founder, 4 objeciones principales
- CTA deseado, tono
- API key OpenAI (para imágenes, Fase 5)
- Credenciales Meta (para campaña, Fase 7)

### FASE 1: RESEARCH
Seguir pipeline de `research-engine-ads.md`:
1. Buscar 50+ ads activos en Ad Library
2. Teardown de 20+ winners con template
3. Extraer: AVATAR_VOICES.md, WINNER_PATTERNS.md, OBJECTION_BANK.md, SWIPE_FILE.md
4. Definir mecanismo único (nombrado, con metáfora, validado)

### FASE 2: NICHOS
1. Listar 20 motivaciones de entrada al producto
2. Para cada nicho: avatar, dolor, deseo, creencia limitante
3. Validar con Niche Validation Checklist
4. Asignar nivel Schwartz dominante por nicho

### FASE 3: ÁNGULOS
1. Asignar 5 ángulos emocionales por nicho (de `niche-mapping-ads.md`)
2. Usar Angle-to-Structure Matrix para asignar estructura de copy
3. Verificar diversidad: 5 copies del nicho = 5 ESTRUCTURAS DIFERENTES
4. Pre-llenar Diversity Tracking Table

### FASE 4: COPIES
1. Para cada nicho (20), escribir 5 copies (uno por ángulo)
2. Cada copy usa la estructura asignada en Fase 3
3. Aplicar Quality Scorecard (mínimo 4.0)
4. Verificar Diversity Engine (tracking table)
5. Si un copy no pasa 4.0 → reescribir
6. Verificar compliance según vertical

**Reglas duras:** 200-250 palabras, escena siempre (no pregunta), números no-redondos, mecanismo con nombre, anti-ficción, CTA ≤ prueba, 5 estructuras diferentes por nicho, score ≥ 4.0, español argentino.

### FASE 5: IMÁGENES
1. Para cada copy, diseñar imagen única con texto camuflado
2. Generar JSON spec por imagen (ver `image-patterns-ads.md`)
3. Ejecutar: `python3 scripts/ad-generate-images.py specs.json --output ./output`

### FASE 6: ORGANIZACIÓN
```
output/[PRODUCTO]/
├── research/ (AVATAR_VOICES, WINNER_PATTERNS, OBJECTION_BANK, SWIPE_FILE)
├── nicho_01_nombre/ (COPY_01.txt + img_01.png × 5)
├── ... (hasta nicho_20)
├── master_sheet.csv
├── DIVERSITY_TABLE.md
└── QUALITY_REPORT.md
```

### FASE 7: CAMPAÑA META ADS
1. Ejecutar: `python3 scripts/ad-create-campaign.py config.json --creds credentials/meta_ads.json`
2. Estructura: 1 campaña → 20 ad sets → 100 ads (todo PAUSED)
3. Post-lanzamiento: activar → esperar 48hs → matar CPA > 2x → duplicar ganadores → escalar con La Matriz

---

## Formato de archivo por copy

```
ÁNGULO: [nombre del ángulo]
NICHO: [número y nombre]
SCHWARTZ: [nivel]
ESTRUCTURA: [1-8, nombre]
HEADLINE: [headline, max 40 chars]
DESCRIPCIÓN: [descripción, max 125 chars]
SCORE: [promedio del Quality Scorecard]

TEXTO PRINCIPAL:

[copy completo]
```

---

## Verificación Pre-publicación

| Check | Criterio |
|-------|----------|
| Quality | Todos los copies ≥ 4.0 en scorecard |
| Diversity | 5 estructuras por nicho, no repetición |
| Compliance | Sin palabras prohibidas, sin claims |
| Format | 200-250 palabras, párrafos cortos, vos/tenés |
| Completeness | 100 filas en master_sheet.csv con copy + imagen |
