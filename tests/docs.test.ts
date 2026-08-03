/**
 * Structural checks over every doc in the corpus.
 *
 * Replaces the equivalent bash checks. The difference that matters is not the
 * language: it is that the parsing these assertions rest on is itself tested
 * (tests/lib/mdx.test.ts), so a check cannot quietly stop checking. Two did
 * exactly that - one matched its own declaration and passed for every doc, and
 * one reported "nothing to check" on a runner that lacked ripgrep.
 *
 * Runs as part of `bun run build`, so a structural defect fails the build rather
 * than being noticed on the published page.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { mathRiskLines, parseMdx, smartPunctLines, splitTables, type Doc } from "./lib/mdx";

const ROOT = new URL("..", import.meta.url).pathname;
const DOCS = join(ROOT, "src/content/docs");
const DIST = join(ROOT, "dist");

function collect(): Doc[] {
  const out: Doc[] = [];
  for (const dir of ["guides", "reference"]) {
    const d = join(DOCS, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (!f.endsWith(".mdx") && !f.endsWith(".md")) continue;
      const p = join(d, f);
      out.push(parseMdx(`${dir}/${f}`, readFileSync(p, "utf8")));
    }
  }
  return out;
}

const docs = collect();

test("the corpus is non-empty", () => {
  // Guards against the whole suite passing vacuously because a path changed.
  expect(docs.length).toBeGreaterThan(10);
});

describe.each(docs.map((d) => [d.path, d] as const))("%s", (_path, doc) => {
  test("no table is split by a blank line", () => {
    const splits = splitTables(doc).map(
      (s) => `rows ${s.first.startLine}-${s.first.endLine} then ${s.second.startLine}-${s.second.endLine}`,
    );
    expect(splits).toEqual([]);
  });

  test("no smart punctuation outside code", () => {
    expect(smartPunctLines(doc).map((l) => `${l.n}: ${l.raw.trim().slice(0, 70)}`)).toEqual([]);
  });

  test("no unescaped dollar that could become math", () => {
    expect(mathRiskLines(doc).map((l) => `${l.n}: ${l.raw.trim().slice(0, 70)}`)).toEqual([]);
  });

  test("every footnote reference has a definition", () => {
    const missing = doc.footnoteRefs.filter((r) => !doc.footnoteDefs.includes(r));
    expect(missing).toEqual([]);
  });

  test("every footnote definition is referenced", () => {
    const orphans = doc.footnoteDefs.filter((d) => !doc.footnoteRefs.includes(d));
    expect(orphans).toEqual([]);
  });

  test("no duplicate footnote definitions", () => {
    const dupes = doc.footnoteDefs.filter((d, i) => doc.footnoteDefs.indexOf(d) !== i);
    expect(dupes).toEqual([]);
  });

  test("has a title and a description", () => {
    expect(doc.frontmatter.title ?? "").not.toBe("");
    expect(doc.frontmatter.description ?? "").not.toBe("");
  });
});

describe("cross-document", () => {
  const slugs = new Set(docs.map((d) => `/${d.path.replace(/\.(mdx|md)$/, "")}`));
  const drafts = new Set(
    docs.filter((d) => d.isDraft).map((d) => `/${d.path.replace(/\.(mdx|md)$/, "")}`),
  );

  test("every internal link points at a doc that exists", () => {
    const broken: string[] = [];
    for (const doc of docs) {
      for (const href of doc.internalLinks) {
        if (!slugs.has(href)) broken.push(`${doc.path} -> ${href}`);
      }
    }
    expect(broken).toEqual([]);
  });

  test("no published doc links to a draft", () => {
    // A draft does not build, so such a link 404s on the live site.
    const bad: string[] = [];
    for (const doc of docs) {
      if (doc.isDraft) continue;
      for (const href of doc.internalLinks) {
        if (drafts.has(href)) bad.push(`${doc.path} -> ${href} (draft)`);
      }
    }
    expect(bad).toEqual([]);
  });
});

// dist-dependent assertions. Skipped rather than failed when there is no build,
// but the skip says so instead of reporting nothing to check.
const built = existsSync(DIST);
describe.skipIf(!built)("built output", () => {
  const pages = docs
    .filter((d) => !d.isDraft)
    .map((d) => ({
      doc: d,
      html: join(DIST, `${d.path.replace(/\.(mdx|md)$/, "")}/index.html`),
    }));

  test("every non-draft doc produced a page", () => {
    expect(pages.filter((p) => !existsSync(p.html)).map((p) => p.doc.path)).toEqual([]);
  });

  test("no page leaks an unrendered footnote marker", () => {
    // Scoped to the footnote shape and to text outside code, because "[^" is
    // regex character-class syntax: pages that show a pattern like [^"]* are not
    // leaking anything. A bare "[^" search reported every such page.
    const leaks: string[] = [];
    for (const p of pages) {
      if (!existsSync(p.html)) continue;
      const prose = readFileSync(p.html, "utf8")
        .replace(/<pre[\s\S]*?<\/pre>/g, "")
        .replace(/<code[\s\S]*?<\/code>/g, "");
      const found = prose.match(/\[\^[A-Za-z0-9-]+\]/g);
      if (found) leaks.push(`${p.doc.path}: ${found.slice(0, 3).join(" ")}`);
    }
    expect(leaks).toEqual([]);
  });

  test("only docs that opt in render KaTeX", () => {
    // Site-wide "zero KaTeX" would be wrong: one guide renders MTU arithmetic as
    // real LaTeX on purpose. The assertion is that nothing ELSE does.
    const unexpected: string[] = [];
    for (const p of pages) {
      if (!existsSync(p.html)) continue;
      const intentional = /prose-dollar:\s*math-intentional/.test(p.doc.raw);
      const hasKatex = readFileSync(p.html, "utf8").includes('class="katex');
      if (hasKatex && !intentional) unexpected.push(p.doc.path);
    }
    expect(unexpected).toEqual([]);
  });
});
