import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Explicit source allowlist: no environment values, private directories or build output.
const roots = ["src/models", "src/types", "src/lib/validation"];
const files = [
  "src/lib/content.ts", "src/lib/env.ts", "src/lib/read-time.ts", "package.json",
  "scripts/check-database.ts", "scripts/create-indexes.ts", "scripts/seed-categories.ts",
  "scripts/seed-foundation.ts", "scripts/migrate-foundation-audit.ts",
  "scripts/export-phase1.mjs", "tests/models.test.ts", "PHASE-1.md", "README.md",
];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(file.replaceAll("\\", "/"));
  }
}
for (const root of roots) await collect(root);
const sections = ["# Phase 1 — full file output\n\nComplete source for Phase 1 models, types, validation, related changes, tests, scripts and verification notes. Environment values are excluded.\n"];
for (const file of files.sort()) {
  const content = await readFile(file, "utf8");
  const fence = "`".repeat(Math.max(3, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length + 1)));
  sections.push(`## ${file}\n\n${fence}\n${content}${content.endsWith("\n") ? "" : "\n"}${fence}\n`);
}
await writeFile("PHASE-1-FILES.md", sections.join("\n"), "utf8");
console.info(`Exported ${files.length} files to PHASE-1-FILES.md.`);
