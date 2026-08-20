/**
 * Tests for the parser, using the real defects it exists to prevent.
 *
 * Every case here is something that actually went wrong or actually shipped, so
 * a regression is a concrete regression rather than a hypothetical one.
 */
import { describe, expect, test } from "bun:test";
import {
  LLM_MARKERS,
  headlessTableRuns,
  markerLines,
  mathRiskLines,
  parseMdx,
  REJECTED_MARKERS,
  smartPunctLines,
  splitTables,
} from "./mdx";

const fm = (body: string) => `---\ntitle: t\ndescription: d\n---\n\n${body}`;

describe("frontmatter", () => {
  test("is not prose, so a dollar there is not a math risk", () => {
    // Verified against built output: og:description carried the raw "$" and the
    // page had zero KaTeX spans. Escaping it would emit a literal backslash.
    const doc = parseMdx("t.mdx", `---\ntitle: t\ndescription: costs ~$10/mo\n---\n\nprose\n`);
    expect(doc.frontmatter.description).toBe("costs ~$10/mo");
    expect(mathRiskLines(doc)).toHaveLength(0);
  });

  test("draft is detected", () => {
    expect(parseMdx("t.mdx", `---\ntitle: t\ndraft: true\n---\n\nx\n`).isDraft).toBe(true);
    expect(parseMdx("t.mdx", `---\ntitle: t\n---\n\nx\n`).isDraft).toBe(false);
  });
});

describe("fences", () => {
  test("indented fences inside list items are still fences", () => {
    // The bash check matched /^```/ only, so an indented block read as prose and
    // its shell variable looked like math.
    const doc = parseMdx("t.mdx", fm("1. step\n\n   ```bash\n   echo $HOME\n   ```\n"));
    expect(mathRiskLines(doc)).toHaveLength(0);
  });

  test("a longer marker is needed to close a longer fence", () => {
    const doc = parseMdx("t.mdx", fm("````\n```\nstill inside\n````\n\n$99 in prose\n"));
    const risky = mathRiskLines(doc);
    expect(risky).toHaveLength(1);
    expect(risky[0]!.raw).toContain("$99");
  });
});

describe("math risk", () => {
  test("inline code spans shield a dollar", () => {
    // Verified: `$SUPABASE_ACCESS_TOKEN` rendered as <code>$SUPABASE_ACCESS_TOKEN</code>
    // with zero KaTeX spans.
    expect(mathRiskLines(parseMdx("t.mdx", fm("set `$TOKEN` first\n")))).toHaveLength(0);
  });

  test("a bare dollar in prose is a finding", () => {
    expect(mathRiskLines(parseMdx("t.mdx", fm("it costs $10 a month\n")))).toHaveLength(1);
  });

  test("an escaped dollar is fine", () => {
    expect(mathRiskLines(parseMdx("t.mdx", fm("it costs \\$10 a month\n")))).toHaveLength(0);
  });

  test("a doc can opt out when it means the math", () => {
    // guides/magic-wan-interop writes MTU arithmetic as real LaTeX.
    const doc = parseMdx(
      "t.mdx",
      fm("{/* prose-dollar: math-intentional */}\n\n$1500 - 24 = 1476$\n"),
    );
    expect(mathRiskLines(doc)).toHaveLength(0);
  });
});

describe("tables", () => {
  test("a contiguous table is one table", () => {
    const doc = parseMdx("t.mdx", fm("| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n"));
    expect(doc.tables).toHaveLength(1);
    expect(doc.tables[0]!.rowCount).toBe(3); // header + 2 data rows
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("a blank line inside a table is reported as a split", () => {
    // This shipped to a live page: an edit removed a row and left the blank line,
    // so the rows below rendered as one run-on paragraph of pipes.
    const doc = parseMdx("t.mdx", fm("| a | b |\n|---|---|\n| 1 | 2 |\n\n| 3 | 4 |\n"));
    const splits = splitTables(doc);
    expect(splits).toHaveLength(1);
    expect(splits[0]!.second.startLine).toBeGreaterThan(splits[0]!.first.endLine);
  });

  test("two genuinely separate tables are not a split", () => {
    const doc = parseMdx(
      "t.mdx",
      fm("| a |\n|---|\n| 1 |\n\nSome prose between them.\n\n| b |\n|---|\n| 2 |\n"),
    );
    expect(doc.tables).toHaveLength(2);
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("prose discussing pipe syntax is not a table", () => {
    // The heuristic this replaces flagged guides/k3s-monitoring-stack, which
    // merely writes about LogQL: "| json | FieldName = value".
    const doc = parseMdx("t.mdx", fm("Use `| json` instead of parsing every line.\n"));
    expect(doc.tables).toHaveLength(0);
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("two adjacent tables separated only by a blank line are both real", () => {
    // reference/caching.mdx does this: a mechanism table immediately followed by
    // a pros/cons table. The earlier discriminator called it a split.
    const doc = parseMdx(
      "t.mdx",
      fm("| a | b |\n|---|---|\n| 1 | 2 |\n\n| c | d |\n|---|---|\n| 3 | 4 |\n"),
    );
    expect(doc.tables).toHaveLength(2);
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("a tail with no separator row is a split", () => {
    const doc = parseMdx("t.mdx", fm("| a | b |\n|---|---|\n| 1 | 2 |\n\n| 3 | 4 |\n"));
    expect(splitTables(doc)).toHaveLength(1);
  });

  test("rows, blank line, a paragraph, then more rows is a split", () => {
    // guides/supabase-postgres-major-upgrade-e2e shipped this shape: the
    // trailing rows lazy-continue the paragraph, so GFM renders them as
    // literal pipe text. The gap between the runs is not blank-only, which is
    // what the old check required - and what let it through.
    const doc = parseMdx(
      "t.mdx",
      fm("| a | b |\n|---|---|\n| 1 | 2 |\n\nprose paragraph\n| 3 | 4 |\n"),
    );
    const splits = splitTables(doc);
    expect(splits).toHaveLength(1);
    expect(splits[0]!.second.startLine).toBeGreaterThan(splits[0]!.first.endLine);
  });

  test("a leading run with no separator row is headless, not a split", () => {
    // No preceding table to pair it with, so splitTables cannot name it - the
    // headless helper is the only check that catches it.
    const doc = parseMdx("t.mdx", fm("| 1 | 2 |\n| 3 | 4 |\n"));
    expect(headlessTableRuns(doc)).toHaveLength(1);
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("a real table is neither a split nor headless", () => {
    const doc = parseMdx("t.mdx", fm("| a | b |\n|---|---|\n| 1 | 2 |\n"));
    expect(headlessTableRuns(doc)).toHaveLength(0);
    expect(splitTables(doc)).toHaveLength(0);
  });

  test("a pipe table inside a fence is not a table", () => {
    const doc = parseMdx("t.mdx", fm("```\n| a | b |\n|---|---|\n```\n"));
    expect(doc.tables).toHaveLength(0);
  });
});

describe("footnotes", () => {
  test("refs and defs are collected separately", () => {
    const doc = parseMdx("t.mdx", fm("claim[^a] and claim[^b]\n\n[^a]: A\n[^b]: B\n"));
    expect(doc.footnoteRefs.sort()).toEqual(["a", "b"]);
    expect(doc.footnoteDefs.sort()).toEqual(["a", "b"]);
  });

  test("a reference before a sentence colon is a reference, not a definition", () => {
    // Four real docs write "From How the Cache works[^slug]:" to introduce a
    // quote. Matching [^slug]: anywhere counted that as a definition and hid the
    // reference, manufacturing duplicate and orphan definitions.
    const doc = parseMdx("t.mdx", fm("From the docs[^a]:\n\n> quoted\n\n[^a]: A\n"));
    expect(doc.footnoteRefs).toEqual(["a"]);
    expect(doc.footnoteDefs).toEqual(["a"]);
  });

  test("a definition is not counted as a reference", () => {
    const doc = parseMdx("t.mdx", fm("[^a]: A\n"));
    expect(doc.footnoteRefs).toHaveLength(0);
    expect(doc.footnoteDefs).toEqual(["a"]);
  });
});

describe("MDX comments", () => {
  test("a footnote-looking token inside a comment is not a reference", () => {
    // reference/cloudflare-supabase-architecture.mdx documents its own citation
    // syntax in a comment: "cited inline as [^slug]".
    const doc = parseMdx("t.mdx", fm("{/* cited inline as [^slug]; list renders below. */}\n"));
    expect(doc.footnoteRefs).toEqual([]);
    expect(doc.footnoteDefs).toEqual([]);
  });

  test("a multi-line comment is fully excluded", () => {
    const doc = parseMdx("t.mdx", fm("{/* open\nstill inside [^x]\nclose */}\n\nreal prose\n"));
    expect(doc.footnoteRefs).toEqual([]);
    expect(doc.bodyText).toContain("real prose");
  });
});

describe("fence extraction", () => {
  test("language tag, bounds and body are captured", () => {
    const doc = parseMdx("t.mdx", fm("before\n\n```dot\ndigraph { a -> b }\n```\n\nafter\n"));
    expect(doc.fences).toHaveLength(1);
    expect(doc.fences[0]!.lang).toBe("dot");
    expect(doc.fences[0]!.body).toBe("digraph { a -> b }");
    // fm() prepends 4 frontmatter lines plus a blank, so "before" is line 6.
    expect(doc.fences[0]!.startLine).toBe(8);
    expect(doc.fences[0]!.endLine).toBe(10);
  });

  test("an indented fence keeps its language, so style checks still see it", () => {
    // Same defect class as the dollar check: matching /^```dot/ at column zero
    // silently exempts every fence nested in a list item.
    const doc = parseMdx("t.mdx", fm("1. step\n\n   ```dot\n   digraph { a }\n   ```\n"));
    expect(doc.fences.map((f) => f.lang)).toEqual(["dot"]);
  });

  test("a longer inner marker does not split one fence into two", () => {
    const doc = parseMdx("t.mdx", fm("````md\n```bash\necho hi\n```\n````\n"));
    expect(doc.fences).toHaveLength(1);
    expect(doc.fences[0]!.lang).toBe("md");
    expect(doc.fences[0]!.body).toContain("echo hi");
  });

  test("consecutive fences are separate", () => {
    const doc = parseMdx("t.mdx", fm("```dot\na\n```\n\n```bash\nb\n```\n"));
    expect(doc.fences.map((f) => f.lang)).toEqual(["dot", "bash"]);
  });
});

describe("internal links", () => {
  test("site-internal doc links are extracted", () => {
    const doc = parseMdx("t.mdx", fm("see [x](/guides/foo/) and [y](/reference/bar)\n"));
    expect(doc.internalLinks.sort()).toEqual(["/guides/foo", "/reference/bar"]);
  });

  test("external links are ignored", () => {
    expect(parseMdx("t.mdx", fm("[x](https://example.com/guides/foo)\n")).internalLinks).toEqual([]);
  });
});

describe("smart punctuation", () => {
  test("em dashes and smart quotes in prose are findings", () => {
    expect(smartPunctLines(parseMdx("t.mdx", fm("a \u2014 b\n")))).toHaveLength(1);
    expect(smartPunctLines(parseMdx("t.mdx", fm("\u201Cquoted\u201D\n")))).toHaveLength(1);
  });

  test("ASCII punctuation is clean", () => {
    expect(smartPunctLines(parseMdx("t.mdx", fm("a - b, \"quoted\", three dots...\n")))).toHaveLength(0);
  });
});

describe("machine-written phrasing", () => {
  const names = (text: string) => markerLines(parseMdx("t.mdx", fm(`${text}\n`))).map((h) => h.name);

  test("every rule name is unique", () => {
    // Names key the per-rule cases below and appear in build failures, so a
    // duplicate would let one rule's case vouch for another's.
    const seen = LLM_MARKERS.map((r) => r.name);
    expect(seen.filter((n, i) => seen.indexOf(n) !== i)).toEqual([]);
  });

  // The table is the test. Each rule carries the line it must flag and, where a
  // near-collision exists in the corpus, the line it must not - so a rule cannot
  // be added without a case, and deleting a rule deletes its case rather than
  // leaving a passing test behind that no longer guards anything.
  describe.each(LLM_MARKERS.map((r) => [r.name, r] as const))("%s", (name, rule) => {
    test("fires on its own hit", () => {
      expect(names(rule.hit)).toContain(name);
    });

    // Registered only when there is one, so the run does not report two dozen
    // skips that mean "no near-collision exists" rather than "not checked".
    if (rule.miss !== undefined) {
      test("stays quiet on its near-miss", () => {
        expect(names(rule.miss!)).toEqual([]);
      });
    }
  });

  test("the roots rejected during calibration stay unbanned", () => {
    for (const line of REJECTED_MARKERS) expect(names(line)).toEqual([]);
  });
});

describe("body text", () => {
  test("excludes frontmatter and fences, collapses whitespace", () => {
    const doc = parseMdx("t.mdx", fm("first\nsecond\n\n```\nnot prose\n```\n\nthird\n"));
    expect(doc.bodyText).toContain("first second");
    expect(doc.bodyText).toContain("third");
    expect(doc.bodyText).not.toContain("not prose");
    expect(doc.bodyText).not.toContain("title: t");
  });
});
