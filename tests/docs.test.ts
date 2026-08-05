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
import { existsSync, readFileSync } from "node:fs";
import { markerLines, mathRiskLines, smartPunctLines, splitTables } from "./lib/mdx";
import { builtPath, CHECK_BUILT, collectDocs } from "./lib/corpus";

const docs = collectDocs();

test("the corpus is non-empty", () => {
  // Guards against the whole suite passing vacuously because a path changed.
  expect(docs.length).toBeGreaterThan(10);
});

/**
 * Docs exempted from the marker check. EMPTY, and that is the goal state - the
 * whole corpus passes.
 *
 * It was seeded with the ten pre-contract docs that failed, on the assumption
 * they would be cleared opportunistically. 139 of their 145 findings turned out
 * to be ` -- ` in prose, which SmartyPants renders as an en-dash, and which a
 * fence-and-code-span-aware pass fixes without touching a table separator or a
 * shell flag. The remaining six needed a sentence reworded each. Clearing them
 * was cheaper than carrying the list.
 *
 * The mechanism stays for the next doc that needs it. Add a path, and the two
 * guards below keep the entry honest: one fails when the doc is clean again,
 * the other when the path no longer exists.
 */
const MARKER_GRANDFATHERED = new Set<string>([]);

test("the whole corpus is held to the phrasing contract", () => {
  // The empty exemption set is the assertion. Written explicitly so that
  // repopulating the list is a visible decision rather than a quiet one.
  expect([...MARKER_GRANDFATHERED]).toEqual([]);
});

test("no grandfathered marker exemption is stale", () => {
  // A grandfather list that is never re-checked becomes a list of docs nobody
  // remembers exempting. Three rationales in the pin file had already gone
  // stale this way - a doc described as a draft that ships, a cross-link check
  // described as vacuous that discriminates. If a doc on this list is now
  // clean, the entry is the defect.
  const byPath = new Map(docs.map((d) => [d.path, d]));
  const stale = [...MARKER_GRANDFATHERED].filter((p) => {
    const doc = byPath.get(p);
    return doc && markerLines(doc).length === 0;
  });
  expect(stale).toEqual([]);
});

test("every grandfathered path still exists", () => {
  const paths = new Set(docs.map((d) => d.path));
  expect([...MARKER_GRANDFATHERED].filter((p) => !paths.has(p))).toEqual([]);
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

  test.skipIf(MARKER_GRANDFATHERED.has(doc.path))("no machine-written phrasing in prose", () => {
    expect(markerLines(doc).map((h) => `${h.line.n}: ${h.marker.trim()}`)).toEqual([]);
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

  test("every dot fence is transparent and uncoloured", () => {
    // House style: graphviz diagrams inherit the page theme instead of carrying
    // their own palette, which is what makes them legible in both colour modes.
    // Asserted corpus-wide rather than for a handful of named docs - all 51 dot
    // fences already comply, so a new coloured one is a new defect, not legacy.
    const bad: string[] = [];
    for (const f of doc.fences.filter((f) => f.lang.startsWith("dot"))) {
      const problems: string[] = [];
      if (!f.body.includes('bgcolor="transparent"')) problems.push("no bgcolor=transparent");
      const colour = f.body.match(/(?:fontcolor|fillcolor)=|color="#|style=filled/);
      if (colour) problems.push(`hardcoded colour: ${colour[0]}`);
      if (problems.length) bad.push(`line ${f.startLine}: ${problems.join(", ")}`);
    }
    expect(bad).toEqual([]);
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

// Dist-dependent assertions. See CHECK_BUILT in lib/corpus.ts for why they are
// gated on more than dist/ existing.
describe.skipIf(!CHECK_BUILT)("built output", () => {
  const pages = docs
    .filter((d) => !d.isDraft)
    .map((d) => ({
      doc: d,
      html: builtPath(d.path),
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
