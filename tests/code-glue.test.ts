/**
 * src/lib/code-glue.mjs (house Starlight kit): inline code is an inline
 * block, and browsers break lines on either side of one, so a ")" after the
 * code could start a line alone (house#23). The plugin wraps code plus the
 * characters touching it in span.house-glue; these cases pin which words it
 * wraps.
 */
import { describe, expect, test } from "bun:test";
import rehypeCodeGlue from "../src/lib/code-glue.mjs";

type Node = { type: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[] };

const t = (value: string): Node => ({ type: "text", value });
const el = (tagName: string, ...children: Node[]): Node => ({ type: "element", tagName, properties: {}, children });
const code = (value: string) => el("code", t(value));

// Compact serialiser: glue spans as [..], code as `..`, other elements as <tag>..</tag>.
const show = (n: Node): string => {
  if (n.type === "text") return n.value ?? "";
  const inner = (n.children ?? []).map(show).join("");
  if (n.tagName === "code") return "`" + inner + "`";
  if ((n.properties?.className as string[] | undefined)?.includes("house-glue")) return "[" + inner + "]";
  return `<${n.tagName}>${inner}</${n.tagName}>`;
};
const run = (root: Node) => {
  rehypeCodeGlue()(root);
  return show(root);
};

describe("rehypeCodeGlue", () => {
  test("glues brackets and touching punctuation to the code", () => {
    // The three cases reported on erfi.dev.
    expect(run(el("h2", t("Why "), code("FMC"), t(" fail ("), code("Note 6"), t(" and "), code("ISPFF"), t(")"))))
      .toBe("<h2>Why `FMC` fail [(`Note 6`] and [`ISPFF`)]</h2>");
    expect(run(el("td", t("User Configuration ("), code("CONFIG0"), t(".."), code("3"), t(")"))))
      .toBe("<td>User Configuration [(`CONFIG0`..`3`)]</td>");
    expect(run(el("td", t("on an oscilloscope ("), code(">= 100 MHz"), t(")"))))
      .toBe("<td>on an oscilloscope [(`>= 100 MHz`)]</td>");
  });

  test("leaves code with spaces on both sides alone", () => {
    const root = el("p", t("run "), code("bun test"), t(" first"));
    const before = root.children;
    expect(run(root)).toBe("<p>run `bun test` first</p>");
    expect(root.children).toBe(before);
  });

  test("a no-break space does not end the word", () => {
    expect(run(el("p", t("x\u00a0"), code("y"), t(" z")))).toBe("<p>[x\u00a0`y`] z</p>");
  });

  test("glues a link holding code to the bracket after it, once", () => {
    expect(run(el("p", t("see ("), el("a", code("foo"), t(" docs")), t("), then"))))
      .toBe("<p>see [(<a>`foo` docs</a>),] then</p>");
  });

  test("block siblings end a word", () => {
    expect(run(el("tr", el("td", code("a")), el("td", t("b"))))).toBe("<tr><td>`a`</td><td>b</td></tr>");
  });

  test("does not enter pre or KaTeX", () => {
    const katex: Node = { type: "element", tagName: "span", properties: { className: ["katex"] }, children: [t("("), code("x"), t(")")] };
    expect(run(el("div", el("pre", t("("), code("x"), t(")")), katex))).toBe("<div><pre>(`x`)</pre><span>(`x`)</span></div>");
  });
});
