import fs from 'fs';
const ids = [
  "bbbec157-8080-4b0b-b470-14500a23cfea",
  "93700f4a-1f41-45e6-b593-6243470fa50a",
  "09251dd7-fbb0-4d70-a8d3-a180120de330",
  "ffa3a3db-73e0-4e17-8e2b-e561fe6521fe",
  "0cfa05e7-1461-4caa-b176-a136acaad1fc",
  "690611ec-f293-493b-b4e5-e8899c33a235",
  "7e790f42-c68f-4d90-9941-a8b38918d1ee",
  "e58e5f93-74c4-4a8c-84bc-73460c201c49",
];
for (const id of ids) {
  const g = JSON.parse(fs.readFileSync(`.data/generations/${id}.json`, "utf8"));
  const m = g.ad_copies_matrix;
  const t = (g.title || "?").slice(0, 45);
  if (!m) { console.log(`${t} → NO COPIES`); continue; }
  const ig = m.versions.filter(v => v.cta_label.includes("Instagram") || v.cta_label.includes("Orgánico"));
  console.log(`${t} → ${m.total_versions} copies (${ig.length} orgánicos)`);
}
