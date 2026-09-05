import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = "PHASE-0-FILES.md";
const excluded = new Set(["node_modules", ".next", ".git", ".vercel", output]);
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (excluded.has(entry.name) || entry.name.endsWith(".tsbuildinfo")) continue;
    if (entry.name.startsWith(".env") && entry.name !== ".env.example") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await collect(fullPath));
    else if (entry.isFile()) results.push(fullPath);
  }
  return results;
}
const sections = ["# Phase 0 — complete file output\n\nAll project files are reproduced below with relative paths, including the dependency lockfile. Empty .gitkeep files retain reserved directories. Generated build output, installed dependencies, secrets and this export itself are excluded.\n"];
for (const file of await collect(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const content = await readFile(file, "utf8");
  const fence = "`".repeat(Math.max(3, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length + 1)));
  sections.push(`## ${relative}\n\n${fence}\n${content}${content.endsWith("\n") ? "" : "\n"}${fence}\n`);
}
await writeFile(path.join(root, output), sections.join("\n"), "utf8");
console.info(`Exported ${sections.length - 1} files to ${output}.`);
