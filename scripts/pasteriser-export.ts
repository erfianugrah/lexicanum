// Convert a set of lexicanum docs to plain markdown for a multi-page paste on
// pasteriser.io (`pasteriser publish <outdir>`), keeping what pasteriser renders.
//
//   bun scripts/pasteriser-export.ts <outdir> src/content/docs/<a>.mdx [<b>.mdx ...]
//
// The first doc becomes the first page. Each doc is written as <outdir>/<slug>.md.
// What changes and why (contrast scripts/rentry-export.ts, which flattens):
// - frontmatter -> `# title` and the description as an italic lede (no author line)
// - footnotes kept: pasteriser renders GFM footnotes (marked-footnote)
// - ```dot fences kept: pasteriser draws them in the browser (Graphviz WASM) as
//   theme-coloured SVG, like the site's build-time rehype-graphviz
// - <Aside> and :::note blocks -> blockquotes with a bold label
// - self-contained, no trail back to the site: no canonical line, links to a doc in
//   the set -> `<slug>.md#anchor` (pasteriser switches pages), links to any other
//   site doc -> their link text only (a list item that opens with one is dropped);
//   in-page `#anchor` and external links kept
// - `\$` -> `$` outside code (pasteriser has no math parser)
// Anything left that pasteriser would render wrongly is listed on stderr.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

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

mkdirSync(outdir, { recursive: true });
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

  const fig = (body.match(/^[ \t]*```(dot|graphviz)\b/gm) ?? []).length;
  body = body
    .replace(/^import .* from ["']@astrojs\/[^"']+["'];?\n/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, "")
    .replace(/^([ \t]*):::(\w+)(?:\[([^\]]*)\])?\n([\s\S]*?)\n\1:::$/gm, (_, ind: string, t: string, h: string | undefined, x: string) =>
      ind + quote(t, h, x.replace(new RegExp(`^${ind}`, "gm"), "")).replace(/\n/g, `\n${ind}`),
    )
    .replace(/<Aside type="(\w+)"(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/Aside>/g, (_, t: string, h: string | undefined, x: string) =>
      quote(t, h, x),
    );

  // A list item that opens with a link to a doc outside the set ("Related docs")
  // points nowhere once the paste is self-contained: drop the item.
  body = body.replace(/^[ \t]*[-*] \[[^\]]*\]\((\/[a-z0-9-]+\/[a-z0-9-]+)\/?(#[^)\s]*)?\).*\n?/gm, (line, path: string) =>
    slugOf.has(`${path}/`) ? line : "",
  );

  body = outside(body, /(^[ \t]*```[\s\S]*?^[ \t]*```)/m, (prose) =>
    outside(
      // Site links: [t](/reference/x/#a) -> page in the set, else plain text t.
      prose.replace(/\[([^\]]*)\]\((\/[a-z0-9-]+\/[a-z0-9-]+)\/?(#[^)\s]*)?\)/g, (m, text: string, path: string, hash = "") => {
        const s = slugOf.get(`${path}/`);
        return s ? `[${text}](${s}.md${hash})` : text;
      }),
      /(`[^`\n]*`)/,
      (p) => p.replaceAll("\\$", "$"),
    ),
  );

  const description = field("description");
  const head = `# ${title}\n\n${description ? `*${description}*\n\n` : ""}`;
  const text = head + body.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  const problems: string[] = [];
  let inFence = false;
  text.split("\n").forEach((line, n) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) return;
    const prose = line.replace(/`[^`]*`/g, "");
    for (const re of [/\]\(\//, /:::/, /<[A-Z]/, /\{\/\*/, /\\\$/, /erfi\.dev/i]) {
      if (re.test(prose)) problems.push(`${slug}.md:${n + 1}: ${re} ${line.slice(0, 90)}`);
    }
  });
  if (problems.length) console.error(`unconverted (${problems.length}):\n${problems.join("\n")}`);

  writeFileSync(join(outdir, `${slug}.md`), text);
  console.error(`${slug}.md: ${text.length} chars, ${fig} diagram(s)`);
}
