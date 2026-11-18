/**
 * The model call in scripts/tell-review.ts cannot run here (no network in the
 * build, and no key). Everything around it can: which text reaches the model,
 * which of its answers survive, and which lines count as changed. A flag that
 * quotes text not in the doc, or a paragraph built from a table row, would make
 * the CI gate block a deploy for nothing.
 */
import { describe, expect, test } from "bun:test";
import { accept, allowedQuotes, batches, changedLines, paragraphs, touched } from "../scripts/tell-review";
import { parseMdx } from "./lib/mdx";

const DOC = [
  "---",
  'title: "A title: with a colon"',
  "---",
  "",
  'import { Aside } from "@astrojs/starlight/components";',
  "",
  "## A heading that is not running text",
  "",
  "First paragraph line one,",
  "and line two of the same paragraph.",
  "",
  "| Col | Col |",
  "|---|---|",
  "| a table row with words | b |",
  "",
  "```bash",
  "echo a fenced command with several words",
  "```",
  "",
  "- A list item that stands alone.",
  "- A second item, also alone.",
  "",
  "{/* tells-ok: the big win */}",
  "",
  "Too short.",
  "",
  "[^note]: Vendor, \"Page,\" Site. https://example.com",
].join("\n");

describe("paragraphs", () => {
  const paras = paragraphs(parseMdx("x.mdx", DOC));

  test("joins wrapped lines and keeps the first line number", () => {
    expect(paras[0]).toEqual({
      line: 9,
      lines: [9, 10],
      text: "First paragraph line one, and line two of the same paragraph.",
    });
  });

  test("each list item is its own paragraph", () => {
    expect(paras.map((p) => p.line)).toEqual([9, 20, 21]);
  });

  test("skips frontmatter, imports, headings, tables, fences, comments, footnote definitions and fragments", () => {
    const text = paras.map((p) => p.text).join(" ");
    for (const s of ["title", "import", "heading", "table row", "fenced", "tells-ok", "Too short", "Vendor"]) {
      expect(text).not.toContain(s);
    }
  });
});

describe("allowedQuotes", () => {
  test("reads cleared quotes, with or without quote marks", () => {
    expect(allowedQuotes('{/* tells-ok: The Big Win */}\n{/* tells-ok: "a deploy is checked" */}')).toEqual([
      "the big win",
      "a deploy is checked",
    ]);
  });
});

describe("accept", () => {
  const paras = [
    { line: 9, lines: [9, 10], text: "Drafts that build cleanly can still be wrong. In one series..." },
    { line: 20, lines: [20], text: "The rendered gate catches what the build cannot see." },
  ];

  test("keeps a flag whose quote is in the doc, normalising case and spaces", () => {
    const f = accept({ line: 9, kind: "aphorism", quote: "drafts that  build cleanly", rewrite: "r" }, "x", paras, []);
    expect(f).toEqual({ file: "x", line: 9, kind: "aphorism", quote: "drafts that  build cleanly", rewrite: "r" });
  });

  test("drops a quote the model invented", () => {
    expect(accept({ line: 9, kind: "aphorism", quote: "words not in the doc" }, "x", paras, [])).toBeNull();
  });

  test("drops an unknown kind", () => {
    expect(accept({ line: 9, kind: "style", quote: "drafts that build" }, "x", paras, [])).toBeNull();
  });

  test("moves a flag to the paragraph that holds the quote when the line hint is wrong", () => {
    expect(accept({ line: 9, kind: "aphorism", quote: "catches what the build" }, "x", paras, [])?.line).toBe(20);
  });

  test("a cleared quote silences the flag, in either containment direction", () => {
    const cleared = ["the rendered gate catches what the build cannot see."];
    expect(accept({ line: 20, kind: "aphorism", quote: "catches what the build" }, "x", paras, cleared)).toBeNull();
    expect(accept({ line: 20, kind: "aphorism", quote: "The rendered gate catches what the build cannot see." }, "x", paras, ["rendered gate"])).toBeNull();
  });
});

describe("changedLines", () => {
  const diff = [
    "diff --git a/src/content/docs/a.mdx b/src/content/docs/a.mdx",
    "--- a/src/content/docs/a.mdx",
    "+++ b/src/content/docs/a.mdx",
    "@@ -3 +3 @@",
    "@@ -10,2 +11,3 @@ heading",
    "@@ -20,4 +22,0 @@",
    "diff --git a/src/content/docs/new.mdx b/src/content/docs/new.mdx",
    "--- /dev/null",
    "+++ b/src/content/docs/new.mdx",
    "@@ -0,0 +1,2 @@",
    "diff --git a/src/content/docs/gone.mdx b/src/content/docs/gone.mdx",
    "--- a/src/content/docs/gone.mdx",
    "+++ /dev/null",
    "@@ -1,2 +0,0 @@",
  ].join("\n");
  const m = changedLines(diff);

  test("collects new-side lines; a pure deletion adds none", () => {
    expect([...(m.get("src/content/docs/a.mdx") ?? [])]).toEqual([3, 11, 12, 13]);
    expect([...(m.get("src/content/docs/new.mdx") ?? [])]).toEqual([1, 2]);
  });

  test("a deleted file is not reviewed", () => {
    expect(m.has("src/content/docs/gone.mdx")).toBe(false);
  });

  test("touched keeps paragraphs with any changed line", () => {
    const paras = [
      { line: 1, lines: [1, 2], text: "a" },
      { line: 5, lines: [5], text: "b" },
    ];
    expect(touched(paras, new Set([2])).map((p) => p.line)).toEqual([1]);
  });
});

describe("batches", () => {
  test("splits by size and never drops or reorders a paragraph", () => {
    const paras = [1, 2, 3, 4, 5].map((n) => ({ line: n, lines: [n], text: "x".repeat(40) }));
    const b = batches(paras, 100);
    expect(b.map((g) => g.length)).toEqual([2, 2, 1]);
    expect(b.flat().map((p) => p.line)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("tell-fix guards", () => {
  const { guard, factTokens, layout, splitMarker } = require("../scripts/tell-fix") as typeof import("../scripts/tell-fix");
  const before = "Three things matter here. The ring holds `512` entries at 9.4 Gbps, see [the guide](/guides/x/)[^ring].";

  test("passes a rewrite that keeps every fact and most words", () => {
    expect(guard(before, "The ring holds `512` entries at 9.4 Gbps, see [the guide](/guides/x/)[^ring].")).toBeNull();
  });

  test("refuses a lost or invented number, code span, link or footnote", () => {
    expect(guard(before, "The ring holds entries at 9.4 Gbps, see [the guide](/guides/x/)[^ring].")).toBe("facts changed");
    expect(guard(before, "The ring holds `512` entries at 9.4 Gbps and 10 more, see [the guide](/guides/x/)[^ring].")).toBe("facts changed");
    expect(guard(before, "The ring holds `512` entries at 9.4 Gbps, see the guide[^ring].")).toBe("facts changed");
  });

  test("refuses a rewrite that drops most of the words", () => {
    expect(guard("one two three four five six seven eight nine ten 5", "one two 5")).toBe("kept under 60% of words");
  });

  test("refuses smart punctuation, double hyphens and a bare <", () => {
    expect(guard("a b c 1", "a b \u2014 c 1")).toBe("smart punctuation");
    expect(guard("a b c 1", "a b -- c 1")).toBe("double hyphen");
    expect(guard("a b c 1", "a <b> c 1")).toBe("bare <");
    expect(guard("a `<b>` c 1", "a `<b>` c 1")).toBeNull();
  });

  test("an announcer with no facts may be deleted; a paragraph with facts may not", () => {
    expect(guard("Three details carry the weight:", "")).toBeNull();
    expect(guard("Three details carry the weight at 9.4 Gbps:", "")).toBe("empty rewrite");
  });

  test("refuses a rewrite that removes a pinned string, and finds pins by doc path", () => {
    expect(guard("Coverage is a property of vantage points, not of rule count. More 1", "More 1 here", ["Coverage is a property"])).toBe(
      "removes a pinned string",
    );
    const { pinnedFor } = require("../scripts/tell-fix") as typeof import("../scripts/tell-fix");
    expect(pinnedFor("src/content/docs/guides/supabase-grafana-monitoring.mdx")).toContain(
      "Coverage is a property of vantage points, not of rule count",
    );
  });

  test("factTokens counts repeats", () => {
    expect(factTokens("1 and 1 and `x`")).toEqual(["1", "1", "`x`"]);
  });

  test("splitMarker and layout keep list markers and wrapping", () => {
    expect(splitMarker("1. Do the thing")).toEqual(["1. ", "Do the thing"]);
    expect(layout(["one line"], "", "a b c")).toEqual(["a b c"]);
    const wrapped = layout(["- " + "x".repeat(58), "  y"], "- ", "aaaa ".repeat(20).trim());
    expect(wrapped.every((l) => l.length <= 60)).toBe(true);
    expect(wrapped[0]?.startsWith("- ")).toBe(true);
    expect(wrapped.slice(1).every((l) => l.startsWith("  "))).toBe(true);
  });
});
