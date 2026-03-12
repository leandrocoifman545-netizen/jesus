#!/usr/bin/env node

import { readFileSync } from 'fs';

const input = readFileSync(process.argv[2] || '/dev/stdin', 'utf-8');

// Parse the plain text pack
const lines = input.split('\n');

// Extract header info
const dateMatch = input.match(/(\w+, \d+ de \w+ de \d+)/);
const countMatch = input.match(/(\d+) guiones seleccionados/);
const date = dateMatch?.[1] || 'Sin fecha';
const count = countMatch?.[1] || '10';

// Extract CTAs
const ctas = [];
const ctaSection = input.match(/3 CTAs.*?\n-+\n([\s\S]*?)\n\n\n/);
if (ctaSection) {
  const ctaText = ctaSection[1];
  const ctaBlocks = ctaText.split(/> CTA \d+ — /);
  for (const block of ctaBlocks) {
    if (!block.trim()) continue;
    const nameMatch = block.match(/^(.+)\n/);
    const textMatch = block.match(/"(.+)"/s);
    if (nameMatch && textMatch) {
      ctas.push({ name: nameMatch[1].trim(), text: textMatch[1] });
    }
  }
}

// Extract order
const orderSection = input.match(/ORDEN DE GRABACION\n-+\n([\s\S]*?)\n\n\n/);
const orderLines = orderSection ? orderSection[1].trim().split('\n').filter(l => l.match(/^\s+\d+\./)) : [];

// Extract scripts
const scriptBlocks = input.split(/={60}\n\s+GUION \d+ de \d+ — /).slice(1);

const scripts = scriptBlocks.map(block => {
  const titleMatch = block.match(/^(.+)\n/);
  const frameworkMatch = block.match(/Framework: (.+)/);
  const durationMatch = block.match(/Duracion: (.+)/);
  const arcMatch = block.match(/Arco: (.+)/);
  const formatMatch = block.match(/Formato: (.+)/);
  const setupMatch = block.match(/Setup: (.+)/);
  const notesMatch = block.match(/Notas: (.+)/);

  // Extract body sections
  const bodySection = block.match(/> CUERPO\n-+\n([\s\S]*?)> 5 LEADS/);
  const bodySections = [];
  if (bodySection) {
    const bodyText = bodySection[1].trim();
    const sectionRegex = /\[(.+?)(?:\s*\[RE-HOOK\])?\]\n([\s\S]*?)(?=\n\[|$)/g;
    let match;
    while ((match = sectionRegex.exec(bodyText)) !== null) {
      const isRehook = match[0].includes('[RE-HOOK]');
      bodySections.push({
        name: match[1].trim(),
        text: match[2].trim(),
        isRehook
      });
    }
  }

  // Extract leads
  const leadsSection = block.match(/> 5 LEADS.*?\n-+\n([\s\S]*?)(?:\n={60}|$)/);
  const leads = [];
  if (leadsSection) {
    const leadRegex = /Lead (\d+) \((\w+)\):\n\s+"(.+?)"/gs;
    let match;
    while ((match = leadRegex.exec(leadsSection[1])) !== null) {
      leads.push({ num: match[1], type: match[2], text: match[3] });
    }
  }

  return {
    title: titleMatch?.[1]?.replace(/\n.*/, '').trim() || 'Sin título',
    framework: frameworkMatch?.[1] || '',
    duration: durationMatch?.[1] || '',
    arc: arcMatch?.[1] || '',
    format: formatMatch?.[1] || '',
    setup: setupMatch?.[1] || '',
    notes: notesMatch?.[1] || '',
    bodySections,
    leads
  };
});

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pack de Grabación — ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  :root {
    --purple: #7c3aed;
    --purple-light: #ede9fe;
    --purple-dark: #5b21b6;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-500: #6b7280;
    --gray-700: #374151;
    --gray-900: #111827;
    --green: #059669;
    --green-light: #ecfdf5;
    --amber: #d97706;
    --amber-light: #fffbeb;
    --blue: #2563eb;
    --blue-light: #eff6ff;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--gray-900);
    background: white;
    line-height: 1.6;
    font-size: 11pt;
  }

  @media print {
    body { font-size: 10pt; }
    .page-break { page-break-before: always; }
    .no-break { page-break-inside: avoid; }
    @page { margin: 1.5cm 2cm; size: A4; }
    .cover { height: 100vh; }
  }

  @media screen {
    body { max-width: 210mm; margin: 0 auto; background: var(--gray-100); }
    .page { background: white; margin: 20px auto; padding: 40px 50px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .cover { min-height: 100vh; }
  }

  /* Cover */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px 40px;
  }

  .cover-logo {
    width: 80px;
    height: 80px;
    background: var(--purple);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
  }

  .cover-logo svg { width: 44px; height: 44px; }

  .cover h1 {
    font-size: 32pt;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .cover .subtitle {
    font-size: 14pt;
    color: var(--gray-500);
    font-weight: 400;
    margin-bottom: 48px;
  }

  .cover-meta {
    display: flex;
    gap: 32px;
    color: var(--gray-500);
    font-size: 10pt;
  }

  .cover-meta span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cover-divider {
    width: 60px;
    height: 4px;
    background: var(--purple);
    border-radius: 2px;
    margin: 40px 0;
  }

  /* TOC */
  .toc { padding: 40px 50px; }
  .toc h2 {
    font-size: 18pt;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--gray-900);
  }

  .toc-item {
    display: flex;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-100);
  }

  .toc-num {
    font-weight: 700;
    color: var(--purple);
    min-width: 28px;
    font-size: 12pt;
  }

  .toc-title { font-weight: 500; flex: 1; }
  .toc-duration { color: var(--gray-500); font-size: 9pt; }

  /* CTA section */
  .cta-section {
    background: var(--purple-light);
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
  }

  .cta-section h3 {
    font-size: 11pt;
    font-weight: 700;
    color: var(--purple-dark);
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cta-item {
    background: white;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 10px;
    border-left: 3px solid var(--purple);
  }

  .cta-item:last-child { margin-bottom: 0; }

  .cta-name {
    font-weight: 600;
    font-size: 9pt;
    color: var(--purple);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .cta-text {
    color: var(--gray-700);
    font-size: 10pt;
    line-height: 1.5;
  }

  /* Script card */
  .script-header {
    background: linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%);
    color: white;
    padding: 28px 32px;
    border-radius: 12px 12px 0 0;
    margin-bottom: 0;
  }

  .script-num {
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.7;
    margin-bottom: 6px;
  }

  .script-title {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 16px;
  }

  .script-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 9pt;
    opacity: 0.85;
  }

  .script-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .script-meta-label { font-weight: 600; }

  .script-details {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-top: none;
    padding: 16px 24px;
    font-size: 9pt;
    color: var(--gray-700);
    border-radius: 0 0 12px 12px;
    margin-bottom: 24px;
  }

  .script-details p { margin-bottom: 4px; }
  .script-details strong { color: var(--gray-900); }

  /* Body section */
  .body-label {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--purple);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .body-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-200);
  }

  .body-section {
    margin-bottom: 16px;
    padding: 14px 18px;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
  }

  .body-section-name {
    font-size: 8pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gray-500);
    margin-bottom: 6px;
  }

  .body-section.rehook {
    background: var(--amber-light);
    border-color: var(--amber);
    border-left: 3px solid var(--amber);
  }

  .body-section.rehook .body-section-name { color: var(--amber); }

  .body-section-text {
    font-size: 11pt;
    line-height: 1.7;
    color: var(--gray-900);
  }

  /* Leads */
  .leads-label {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--green);
    margin: 28px 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .leads-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-200);
  }

  .lead-card {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    padding: 14px 16px;
    background: var(--green-light);
    border-radius: 8px;
    border: 1px solid #d1fae5;
  }

  .lead-num {
    font-size: 16pt;
    font-weight: 800;
    color: var(--green);
    min-width: 28px;
    line-height: 1;
    padding-top: 2px;
  }

  .lead-content { flex: 1; }

  .lead-type {
    font-size: 8pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--green);
    margin-bottom: 4px;
  }

  .lead-text {
    font-size: 11pt;
    line-height: 1.6;
    color: var(--gray-900);
  }

  /* Footer */
  .footer {
    text-align: center;
    padding: 40px;
    color: var(--gray-500);
    font-size: 9pt;
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <div class="cover-logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>
  <h1>Pack de Grabación</h1>
  <p class="subtitle">${date}</p>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <span><strong>${count}</strong>&nbsp;guiones</span>
    <span><strong>${scripts.reduce((a, s) => a + (parseInt(s.duration) || 0), 0)}</strong>s&nbsp;total</span>
    <span><strong>${ctas.length}</strong>&nbsp;CTAs</span>
  </div>
</div>

<!-- TOC + CTAs -->
<div class="page toc page-break">
  <h2>Orden de grabación</h2>
  ${scripts.map((s, i) => `
  <div class="toc-item">
    <span class="toc-num">${i + 1}</span>
    <span class="toc-title">${s.title}</span>
    <span class="toc-duration">${s.duration.split('|')[0].trim()}</span>
  </div>`).join('')}

  <div class="cta-section" style="margin-top: 32px;">
    <h3>CTAs — grabar una vez, se pegan a cualquier cuerpo</h3>
    ${ctas.map(c => `
    <div class="cta-item">
      <div class="cta-name">${c.name}</div>
      <div class="cta-text">"${c.text}"</div>
    </div>`).join('')}
  </div>
</div>

<!-- SCRIPTS -->
${scripts.map((s, i) => `
<div class="page page-break">
  <div class="script-header">
    <div class="script-num">Guión ${i + 1} de ${count}</div>
    <div class="script-title">${s.title}</div>
    <div class="script-meta">
      <span class="script-meta-item"><span class="script-meta-label">Framework:</span> ${s.framework}</span>
      <span class="script-meta-item"><span class="script-meta-label">Duración:</span> ${s.duration}</span>
      ${s.format ? `<span class="script-meta-item"><span class="script-meta-label">Formato:</span> ${s.format}</span>` : ''}
    </div>
  </div>

  <div class="script-details">
    ${s.arc ? `<p><strong>Arco:</strong> ${s.arc}</p>` : ''}
    ${s.setup ? `<p><strong>Setup:</strong> ${s.setup}</p>` : ''}
    ${s.notes ? `<p><strong>Notas:</strong> ${s.notes}</p>` : ''}
  </div>

  <div class="body-label">Cuerpo</div>
  ${s.bodySections.map(sec => `
  <div class="body-section ${sec.isRehook ? 'rehook' : ''} no-break">
    <div class="body-section-name">${sec.name}</div>
    <div class="body-section-text">${sec.text}</div>
  </div>`).join('')}

  <div class="leads-label">5 Leads</div>
  ${s.leads.map(l => `
  <div class="lead-card no-break">
    <div class="lead-num">${l.num}</div>
    <div class="lead-content">
      <div class="lead-type">${l.type.replace(/_/g, ' ')}</div>
      <div class="lead-text">"${l.text}"</div>
    </div>
  </div>`).join('')}
</div>`).join('')}

<div class="footer">
  ADP — Academia de Productos Digitales · Pack generado automáticamente
</div>

</body>
</html>`;

process.stdout.write(html);
