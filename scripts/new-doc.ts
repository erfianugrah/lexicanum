/**
 * `bun run new` - scaffold a doc with correct taxonomy frontmatter and the
 * AGENTS.md skeleton, so authoring starts from a valid state instead of a
 * copied neighbor. The taxonomy is read from src/lib/taxonomy.mjs, so a new
 * category appears here automatically.
 */
import { writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { TAXONOMY } from "../src/lib/taxonomy.mjs";

const rl = createInterface({ input: process.stdin, output: process.stdout });
// readline/promises drops piped-in lines when a question is pending, so queue
// lines ourselves: works identically for a pipe (tests) and a TTY.
const lines: string[] = [];
let waiters: ((line: string) => void)[] = [];
rl.on("line", (line) => {
  const w = waiters.shift();
  if (w) w(line);
  else lines.push(line);
});
function nextLine(): Promise<string> {
  const buffered = lines.shift();
  if (buffered !== undefined) return Promise.resolve(buffered);
  return new Promise((resolve) => waiters.push(resolve));
}

async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  return (await nextLine()).trim();
}

async function pick(question: string, options: readonly string[]): Promise<string> {
  console.log(question);
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  for (;;) {
    const answer = await ask(`> [1-${options.length}] `);
    const n = Number(answer);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return options[n - 1]!;
    console.log("  enter a number from the list");
  }
}

const type = await pick("Doc type?", ["guide", "reference"]);
const category = await pick(
  "Category?",
  TAXONOMY.map((c) => c.id),
);
const catDef = TAXONOMY.find((c) => c.id === category)!;
const group = catDef.groups
  ? await pick("Group?", catDef.groups.map((g) => g.id))
  : undefined;

const title = await ask("Title (sentence case): ");
if (!title) {
  console.error("title is required");
  process.exit(1);
}
const slugDefault = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const slug = ((await ask(`Slug [${slugDefault}]: `)) || slugDefault).replace(/\.mdx?$/, "");
const description = await ask("Description (one rich sentence): ");
rl.close();

const outDir = type === "guide" ? "guides" : "reference";
const path = `src/content/docs/${outDir}/${slug}.mdx`;
if (existsSync(path)) {
  console.error(`${path} already exists`);
  process.exit(1);
}

const frontmatter = [
  "---",
  `title: "${title.replaceAll('"', '\\"')}"`,
  `description: ${description || "TODO"}`,
  "author: Erfi Anugrah",
  `category: ${category}`,
  ...(group ? [`group: ${group}`] : []),
  "---",
].join("\n");

const skeleton =
  type === "guide"
    ? `\n\nWhat you will build, and the prerequisites.\n\n## Architecture overview\n\n## Step 1: N\n\n## Step 2: N\n\n## Verification\n\n## Gotchas and Lessons Learned\n`
    : `\n\nWhat this is, in 1-2 sentences, and who it is for.\n\n**TL;DR:**\n\n## Overview\n\n## Decision guide\n`;

writeFileSync(path, frontmatter + skeleton);
console.log(`\nCreated ${path}`);
console.log("Frontmatter is set; the sidebar picks the doc up on the next build.");
console.log("Verify with: bun run build");
