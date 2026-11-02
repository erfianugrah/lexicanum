// Convert one lexicanum doc to rentry.co markdown, for sharing a copy off-site.
//
//   bun scripts/rentry-export.ts src/content/docs/guides/<doc>.mdx [out.md]
//
// Writes to stdout without an out path. What changes and why:
// - frontmatter -> `# title`, plus `[TOC2]` after the lede (rentry builds a table of contents)
// - footnotes -> the source URL inline at the claim; the definitions are dropped
// - ```dot fences dropped (rentry cannot render them; each has a text fallback under it)
// - :::note/:::caution and <Aside> -> rentry `!!!` admonitions
// - site-internal and in-page links -> plain text, "Related docs" dropped (no author trail)
// - outside code: ` -> ` becomes an arrow glyph (rentry reads `->` as alignment), `\$` -> `$`
// Anything it could not convert is listed on stderr; publish with the rentry skill.
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
if (!src) {
  console.error("usage: bun scripts/rentry-export.ts <doc.mdx> [out.md]");
  process.exit(2);
}

const raw = readFileSync(src, "utf8");
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
if (!fmMatch) throw new Error(`${src}: no frontmatter`);
const title = fmMatch[1].match(/^title: (.*)$/m)?.[1].trim().replace(/^["']|["']$/g, "");
if (!title) throw new Error(`${src}: no title`);
let body = raw.slice(fmMatch[0].length);

const KIND: Record<string, string> = { note: "note", tip: "info", caution: "warning", danger: "danger" };
const admonition = (type: string, heading: string | undefined, text: string) =>
  `!!! ${KIND[type] ?? "note"} ${heading ?? (type === "caution" || type === "danger" ? "Careful" : "Note")}\n    ` +
  text.trim().replace(/\n/g, "\n    ");

// Footnotes: inline the definition's first URL, or its text when it has none (lab records).
const defs = new Map<string, string>();
body = body.replace(/^\[\^([\w-]+)\]: (.*)$\n?/gm, (_, slug: string, def: string) => {
  defs.set(slug, def.match(/https?:\/\/[^\s)>]+/)?.[0].replace(/[.,]$/, "") ?? def.trim());
  return "";
});

body = body
  .replace(/^import .* from ["']@astrojs\/[^"']+["'];?\n/gm, "")
  .replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, "")
  .replace(/```dot\n[\s\S]*?```\n\n/g, "")
  .replace(/^([ \t]*):::(\w+)(?:\[([^\]]*)\])?\n([\s\S]*?)\n\1:::$/gm, (_, ind: string, t: string, h: string | undefined, x: string) =>
    ind + admonition(t, h, x.replace(new RegExp(`^${ind}`, "gm"), "")).replace(/\n/g, `\n${ind}`),
  )
  .replace(/<Aside type="(\w+)"(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/Aside>/g, (_, t: string, h: string | undefined, x: string) =>
    admonition(t, h, x),
  )
  .replace(/\n## Related docs\n[\s\S]*?(?=\n## |$)/, "\n")
  .replace("Text version: the ", "The ");

// Prose-only edits: fenced code stays byte-exact; arrows and dollars also skip inline code.
const outside = (s: string, re: RegExp, f: (p: string) => string) =>
  s.split(re).map((p, i) => (i % 2 ? p : f(p))).join("");
body = outside(body, /(^[ \t]*```[\s\S]*?^[ \t]*```)/m, (prose) =>
  outside(
    prose
      .replace(/\[\^([\w-]+)\]/g, (m, slug: string) => (defs.has(slug) ? ` (${defs.get(slug)})` : m))
      .replace(/\[([^\]]+)\]\((?:#|\/)[^)]*\)/g, "$1"),
    /(`[^`\n]*`)/,
    (p) => p.replaceAll(" -> ", " → ").replaceAll("\\$", "$"),
  ),
);

body = body.replace(/\n{3,}/g, "\n\n").trim() + "\n";
const lede = body.indexOf("\n\n");
const text = `# ${title}\n\n${body.slice(0, lede)}\n\n[TOC2]${body.slice(lede)}`;

// Leftovers rentry would render wrongly, checked outside code.
const problems: string[] = [];
let inFence = false;
text.split("\n").forEach((line, n) => {
  if (/^\s*```/.test(line)) inFence = !inFence;
  if (inFence) return;
  const prose = line.replace(/`[^`]*`/g, "");
  for (const re of [/^\s*->/, /\[\^/, /\]\(\//, /:::/, /<[A-Z]/, /\{\/\*/, /erfi\.dev/]) {
    if (re.test(prose)) problems.push(`${n + 1}: ${re} ${line.slice(0, 90)}`);
  }
});
if (problems.length) console.error(`unconverted (${problems.length}):\n${problems.join("\n")}`);

if (out) {
  writeFileSync(out, text);
  console.error(`${out}: ${text.length} chars`);
} else process.stdout.write(text);
