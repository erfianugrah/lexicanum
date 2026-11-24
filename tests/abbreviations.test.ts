/**
 * Corpus check: every abbreviation is explained the first time each doc uses it.
 * The rule, its exemptions and the three accepted forms live in
 * tests/lib/abbrev.ts; the sweep that satisfies it is scripts/abbrev-fix.ts,
 * fed by data/abbreviations.json (scripts/abbrev-glossary.ts).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { badExpansion, corpusFiles, loadGlossary, okTerms, unexpandedFirstUses } from "./lib/abbrev";
import { DOCS } from "./lib/corpus";
import { parseMdx } from "./lib/mdx";

const glossary = loadGlossary();
const words = new Set(glossary.words);
const docs = corpusFiles(DOCS).map((f) => parseMdx(f, readFileSync(join(DOCS, f), "utf8")));

describe("first use is explained", () => {
  test("the corpus is non-empty", () => {
    expect(docs.length).toBeGreaterThan(100);
  });

  // One assertion per doc so a failure names the doc, the line and the term.
  test.each(docs.map((d) => [d.path, d] as const))("%s", (_path, doc) => {
    const left = unexpandedFirstUses(doc, words).map((f) => `${f.key} (line ${f.line})`);
    expect(left).toEqual([]);
  });
});

describe("abbreviations-ok", () => {
  // The escape hatch is for deliberate exceptions; a term that is no longer
  // flagged without it (explained, removed) must be dropped from the list.
  test.each(docs.filter((d) => okTerms(d).size > 0).map((d) => [d.path, d] as const))("%s has no stale entry", (_path, doc) => {
    const needed = new Set(unexpandedFirstUses(doc, words, true).map((f) => f.key));
    const stale = [...okTerms(doc)].filter((t) => !needed.has(t));
    expect(stale).toEqual([]);
  });
});

describe("glossary", () => {
  test("every expansion is safe to insert", () => {
    const all = [
      ...Object.entries(glossary.terms).map(([k, e]) => [k, e.expansion, e.plural] as const),
      ...Object.entries(glossary.overrides).flatMap(([d, m]) => Object.entries(m).map(([k, e]) => [`${d}:${k}`, e.expansion, e.plural] as const)),
    ];
    const bad = all.flatMap(([k, ex, pl]) => [badExpansion(ex), pl ? badExpansion(pl) : null].map((r) => (r ? `${k}: ${r}` : null))).filter(Boolean);
    expect(bad).toEqual([]);
  });

  test("a term is a term, a word, ambiguous or unknown - never two", () => {
    const keys = [...Object.keys(glossary.terms), ...glossary.words, ...glossary.ambiguous, ...glossary.unknown.filter((u) => !u.includes(":"))];
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  test("overrides name docs that exist", () => {
    const have = new Set(docs.map((d) => d.path));
    expect(Object.keys(glossary.overrides).filter((d) => !have.has(d))).toEqual([]);
  });
});
