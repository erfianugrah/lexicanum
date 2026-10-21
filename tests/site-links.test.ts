/**
 * The site's link graph (src/lib/links.mjs): the extractor behind every
 * page's "Linked from" list and neighbourhood graph. The built-output checks
 * in docs.test.ts compare its rendered results against the test parser;
 * these cases pin the parts those checks cannot see, such as label escaping.
 */
import { describe, expect, test } from "bun:test";
import { Graphviz } from "@hpcc-js/wasm/graphviz";
import { backlinks, docLinks, neighbourhoodDot, outlinks } from "../src/lib/links.mjs";

const entry = (id: string, title: string, body: string, draft = false) => ({ id, body, data: { title, draft } });

describe("docLinks", () => {
  test("counts fragments, skips fences and comments", () => {
    const body = "[a](/guides/a/#x)\n```md\n[b](/guides/b/)\n```\n{/* [c](/guides/c/) */}\n[d](/reference/d)\n";
    expect(docLinks(body).sort()).toEqual(["guides/a", "reference/d"]);
  });
});

describe("link maps", () => {
  const entries = [
    entry("guides/a", "A", "[b](/reference/b/) [self](/guides/a/) [gone](/guides/missing/)"),
    entry("reference/b", "B", "[a](/guides/a/)"),
    entry("guides/draft", "D", "[b](/reference/b/)", true),
  ];

  test("drop self-links, missing targets and drafts", () => {
    expect(backlinks(entries).get("reference/b")).toEqual([{ id: "guides/a", title: "A" }]);
    expect(outlinks(entries).get("guides/a")).toEqual([{ id: "reference/b", title: "B" }]);
    expect(outlinks(entries).has("guides/draft")).toBe(false);
  });
});

describe("neighbourhoodDot", () => {
  const page = { id: "guides/p", title: "The page" };

  test("no neighbours, no graph", () => {
    expect(neighbourhoodDot(page, [], [])).toBeUndefined();
  });

  test("a two-way link is one double-headed edge", () => {
    const both = { id: "reference/x", title: "X" };
    const dot = neighbourhoodDot(page, [both], [both])!;
    expect(dot).toContain('"guides/p" -> "reference/x" [dir=both];');
    expect(dot.match(/->/g)).toHaveLength(1);
  });

  test("renders: long titles wrap, quotes survive, nodes link", async () => {
    const title = 'Auditing Supabase: where each copy of an "event" lives, and who can erase it';
    const dot = neighbourhoodDot(page, [{ id: "reference/q", title }], [])!;
    const svg = (await Graphviz.load()).dot(dot);
    expect(svg).toContain('xlink:href="/reference/q/"');
    // Wrapped: the label is several <text> lines, none longer than the width.
    const lines = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
    expect(lines.length).toBeGreaterThan(3);
    expect(lines.join(" ")).toContain("&quot;event&quot;");
    expect(lines.every((l) => l.length <= 40)).toBe(true);
  });
});
