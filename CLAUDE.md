# Script Generator — Web App (Next.js)

Este proyecto es la web app de generación de contenido para ADP (Jesús Tassarolo).

## Stack
- Next.js 15 + React 19 + Tailwind CSS 4
- Anthropic Claude API para generación
- Storage: archivos JSON en `.data/`
- Puerto: 3002

## Desarrollo
```bash
npm run dev  # Arranca en localhost:3002
```

## Estructura
- `app/` — Páginas y API routes
- `components/` — Componentes React
- `lib/ai/` — Lógica de generación (generate.ts, auto-brief.ts, angle-discovery.ts)
- `lib/storage/` — Persistencia en archivos JSON
- `lib/knowledge/` — Carga de archivos de conocimiento (.data/)
- `scripts/` — Scripts CLI (save-generation, post-gen, preflight, ig-pipeline, etc.)
- `.data/` — Datos y conocimiento (NO tocar estructura sin permiso)

## Reglas
- **Idioma:** Español argentino para respuestas.
- **NO generar guiones, stories ni análisis desde este proyecto.** Para eso están los proyectos separados:
  - `adp-guiones/` — Guiones de ads y plan semanal
  - `adp-ads-copy/` — Copy escrito para Meta Ads
  - `adp-stories/` — Stories, destacadas y posts de Instagram
  - `adp-analisis/` — Análisis de contenido y perfiles
