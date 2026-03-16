# Script Generator — Design System

## Direction
**Production tool for video ad scripts.** Not a creative playground, not a cold dashboard. A director's desk — structured but with creative energy. The interface serves one person (Lean) preparing scripts for recording sessions with Jesús.

## Feel
Dense like a trading terminal, warm like a writer's notebook. Dark mode mandatory — this is a night-work tool.

## Signature Element
**The 5-beat micro-VSL visualization.** Each body section (beat) has a colored left accent bar and tinted background that maps to its persuasion function. At a glance, you can scan the emotional arc of a script without reading a word. This is the ONE thing that makes this tool feel designed for this specific purpose.

## Color System

### Brand
- **Primary:** `#7c3aed` (purple-600) — CTAs, active states, brand identity
- **Gradient:** purple-600 → blue-600 — logo, hero elements

### Beat Colors (persuasion function → color from the ad production world)
| Function | Color | Token | Rationale |
|----------|-------|-------|-----------|
| `identificacion` | Red-500 `#ef4444` | `--beat: 239 68 68` | Stop, pain, attention — the viewer's current pain |
| `quiebre` | Amber-500 `#f59e0b` | `--beat: 245 158 11` | Disruption, warning — breaking the old belief |
| `mecanismo` | Blue-500 `#3b82f6` | `--beat: 59 130 246` | Clarity, solution — the new path forward |
| `demolicion` | Purple-500 `#a855f7` | `--beat: 168 85 247` | Action, power — destroying objections |
| `prueba` | Green-500 `#22c55e` | `--beat: 34 197 94` | Validation, proof — evidence it works |
| `venta_modelo` | Zinc-400 `#a1a1aa` | `--beat: 161 161 170` | Structural, closing — neutral and grounding |

Beat colors are applied at 4% opacity for backgrounds, 12% for borders, 15% for badges, 25% for the left accent bar.

### Status Colors
- Draft: `zinc-500/600`
- Confirmed: `blue-400/500`
- Recorded: `green-400/500`
- Winner: `amber-400/500`

### Neutrals
- Background: `#09090b` (zinc-950)
- Surface 1: `zinc-900/30-40` (cards)
- Surface 2: `zinc-800/50` (badges, inputs)
- Text primary: `#fafafa`
- Text secondary: `zinc-200`
- Text tertiary: `zinc-400`
- Text muted: `zinc-500/600`
- Borders: `zinc-800/40-50`, `white/[0.04]`

## Depth Strategy
**Borders-only + subtle backdrop blur.** No drop shadows on cards (shadows reserved for CTAs and hover glows). Glassmorphism for header/overlays only, not for content cards.

## Typography
- **Headings:** Plus Jakarta Sans (600-800 weight, tight tracking)
- **Body/scripts:** Inter (400-500 weight)
- **Data/timing:** Monospace (SF Mono/Fira Code)
- **Labels:** Inter 500, 10-11px, uppercase, wide tracking

## Spacing
- Base unit: 4px (Tailwind default)
- Card padding: 24px (`p-6`)
- Section gaps: 12-16px (`gap-3` to `gap-4`)
- Component internal: 8px (`gap-2`)
- Page container: `max-w-7xl px-6 py-12`

## Border Radius
- Buttons/inputs: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Badges/pills: `rounded-lg` (8px) or `rounded-full`
- Page sections: `rounded-3xl` (24px)

## Component Patterns

### Beat Section (body)
```
<div class="beat-{function} border rounded-2xl p-6 relative">
  <div class="beat-line absolute left-0 top-4 bottom-4 w-[3px] rounded-full" />
  <span class="beat-indicator rounded-lg px-2 py-0.5 text-[10px]">{function}</span>
  <div class="beat-indicator rounded-lg px-2 py-1 text-[11px] mb-3">MC: {micro_belief}</div>
  <p class="text-zinc-200 text-sm">{script_text}</p>
</div>
```

### Status Badge
Active: `bg-{color}-500/10 text-{color}-400 border-{color}-500/20`
Default: `bg-zinc-800/50 border-zinc-700/50 text-zinc-300`

### Glass Surface
`backdrop-blur-2xl bg-zinc-950/70 border-b border-white/[0.04]`

## Transitions
- Default: `transition-all duration-200`
- Hover effects: `duration-300`
- Easing: default ease for UI, `cubic-bezier(0.34, 1.56, 0.64, 1)` for bounces
