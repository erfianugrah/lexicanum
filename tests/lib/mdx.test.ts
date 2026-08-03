/**
 * Tests for the parser, using the real defects it exists to prevent.
 *
 * Every case here is something that actually went wrong or actually shipped, so
 * a regression is a concrete regression rather than a hypothetical one.
 */
import { describe, expect, test } from "bun:test";
import { mathRiskLines, parseMdx, smartPunctLines, splitTables } from "./mdx";

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

describe("body text", () => {
  test("excludes frontmatter and fences, collapses whitespace", () => {
    const doc = parseMdx("t.mdx", fm("first\nsecond\n\n```\nnot prose\n```\n\nthird\n"));
    expect(doc.bodyText).toContain("first second");
    expect(doc.bodyText).toContain("third");
    expect(doc.bodyText).not.toContain("not prose");
    expect(doc.bodyText).not.toContain("title: t");
  });
});
