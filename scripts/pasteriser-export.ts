// Convert a set of lexicanum docs to plain markdown for a multi-page paste on
// pasteriser.io (`pasteriser publish <outdir>`), keeping what pasteriser renders.
//
//   bun scripts/pasteriser-export.ts <outdir> src/content/docs/<a>.mdx [<b>.mdx ...]
//
// The first doc becomes the first page. Each doc is written as <outdir>/<slug>.md.
// What changes and why (contrast scripts/rentry-export.ts, which flattens):
// - frontmatter -> `# title`, the description as an italic lede, a canonical erfi.dev link
// - footnotes kept: pasteriser renders GFM footnotes (marked-footnote)
// - ```dot fences -> PNG via the local graphviz `dot` (white background, so it reads in
//   both themes), referenced as fig/<slug>-<n>.png; publish uploads them same-origin
// - <Aside> and :::note blocks -> blockquotes with a bold label
// - links to a doc in the set -> `<slug>.md#anchor` (pasteriser switches pages);
//   other site links -> absolute https://erfi.dev URLs; in-page `#anchor` links kept
// - `\$` -> `$` outside code (pasteriser has no math parser)
// Anything left that pasteriser would render wrongly is listed on stderr.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const SITE = "https://erfi.dev";
const [outdir, ...srcs] = process.argv.slice(2);
if (!outdir || srcs.length === 0) {
  console.error("usage: bun scripts/pasteriser-export.ts <outdir> <doc.mdx>...");
  process.exit(2);
}

// /guides/x/ and /reference/x/ -> slug, for every doc in the set.
const sitePath = (src: string) => {
  const m = src.match(/src\/content\/docs\/(.+)\.mdx?$/);
  if (!m) throw new Error(`${src}: not under src/content/docs`);
  return `/${m[1]}/`;
};
const slugOf = new Map(srcs.map((s) => [sitePath(s), basename(s).replace(/\.mdx?$/, "")]));

mkdirSync(join(outdir, "fig"), { recursive: true });
const LABEL: Record<string, string> = { note: "Note", tip: "Tip", caution: "Caution", danger: "Danger" };
const quote = (type: string, heading: string | undefined, text: string) =>
  `> **${heading ?? LABEL[type] ?? "Note"}:** ` + text.trim().replace(/\n/g, "\n> ");

// Prose-only edits: fenced code stays byte-exact; inline code is skipped too.
const outside = (s: string, re: RegExp, f: (p: string) => string) =>
  s.split(re).map((p, i) => (i % 2 ? p : f(p))).join("");

for (const src of srcs) {
  const slug = basename(src).replace(/\.mdx?$/, "");
  const raw = readFileSync(src, "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(`${src}: no frontmatter`);
  const field = (k: string) =>
    fm[1].match(new RegExp(`^${k}: (.*)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");
  const title = field("title");
  if (!title) throw new Error(`${src}: no title`);
  let body = raw.slice(fm[0].length);

  let fig = 0;
  body = body.replace(/```dot\n([\s\S]*?)```/g, (_, dot: string) => {
    const name = `fig/${slug}-${++fig}.png`;
    const png = execFileSync("dot", ["-Tpng", "-Gdpi=144", "-Gbgcolor=white", "-Gpad=0.2"], { input: dot });
    writeFileSync(join(outdir, name), png);
    return `![Diagram ${fig}](${name})`;
  });

  body = body
    .replace(/^import .* from ["']@astrojs\/[^"']+["'];?\n/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, "")
    .replace(/^([ \t]*):::(\w+)(?:\[([^\]]*)\])?\n([\s\S]*?)\n\1:::$/gm, (_, ind: string, t: string, h: string | undefined, x: string) =>
      ind + quote(t, h, x.replace(new RegExp(`^${ind}`, "gm"), "")).replace(/\n/g, `\n${ind}`),
    )
    .replace(/<Aside type="(\w+)"(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/Aside>/g, (_, t: string, h: string | undefined, x: string) =>
      quote(t, h, x),
    );

  body = outside(body, /(^[ \t]*```[\s\S]*?^[ \t]*```)/m, (prose) =>
    outside(
      // Site links: (/reference/x/#a) or (/reference/x#a) -> page in the set, else erfi.dev.
      prose.replace(/\]\((\/[a-z0-9-]+\/[a-z0-9-]+)\/?(#[^)\s]*)?\)/g, (m, path: string, hash = "") => {
        const s = slugOf.get(`${path}/`);
        return s ? `](${s}.md${hash})` : `](${SITE}${path}/${hash})`;
      }),
      /(`[^`\n]*`)/,
      (p) => p.replaceAll("\\$", "$"),
    ),
  );

  const description = field("description");
  const head = `# ${title}\n\n${description ? `*${description}*\n\n` : ""}Canonical: ${SITE}${sitePath(src)}\n\n`;
  const text = head + body.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  const problems: string[] = [];
  let inFence = false;
  text.split("\n").forEach((line, n) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) return;
    const prose = line.replace(/`[^`]*`/g, "");
    for (const re of [/\]\(\//, /:::/, /<[A-Z]/, /\{\/\*/, /\\\$/]) {
      if (re.test(prose)) problems.push(`${slug}.md:${n + 1}: ${re} ${line.slice(0, 90)}`);
    }
  });
  if (problems.length) console.error(`unconverted (${problems.length}):\n${problems.join("\n")}`);

  writeFileSync(join(outdir, `${slug}.md`), text);
  console.error(`${slug}.md: ${text.length} chars, ${fig} diagram(s)`);
}
