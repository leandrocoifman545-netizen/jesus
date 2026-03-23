import { readFileSync, writeFileSync } from "fs";

const files = [
  ".data/generations/09251dd7-fbb0-4d70-a8d3-a180120de330.json",
  ".data/generations/0cd5c680-57b4-4d77-a7cd-fd422dcc254f.json",
  ".data/generations/0cfa05e7-1461-4caa-b176-a136acaad1fc.json",
  ".data/generations/6195915f-86a0-4ce1-bd88-81f16d254a5c.json",
  ".data/generations/93700f4a-1f41-45e6-b593-6243470fa50a.json",
  ".data/generations/bbbec157-8080-4b0b-b470-14500a23cfea.json",
];

for (const file of files) {
  const data = JSON.parse(readFileSync(file, "utf-8"));
  const sections = data.script?.development?.sections;
  if (!sections) continue;

  let changed = false;
  for (const section of sections) {
    const text = section.script_text;
    if (!text) continue;

    // Extract all [iPad: ...] annotations
    const regex = /\s*\[iPad:\s*([^\]]+)\]/g;
    const directions = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      directions.push(match[1].trim());
    }

    if (directions.length > 0) {
      // Remove annotations from script_text
      section.script_text = text.replace(regex, "").replace(/\s{2,}/g, " ").trim();
      section.ipad_directions = directions;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log(`✓ ${file} — ${sections.filter(s => s.ipad_directions).length} secciones con iPad directions`);
  }
}
