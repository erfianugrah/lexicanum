/**
 * scripts/abbrev-fix.ts: the sweep may only insert, and only what the glossary holds.
 */
import { describe, expect, test } from "bun:test";
import type { Glossary } from "./lib/abbrev";
import { applyPinMoves, entryFor, fixSource, followPin, removeInsertions } from "../scripts/abbrev-fix";

const g: Glossary = {
  terms: {
    API: { expansion: "application programming interface", plural: "application programming interfaces" },
    JWT: { expansion: "JSON Web Token", plural: "JSON Web Tokens" },
    JSON: { expansion: "JavaScript Object Notation", plural: "JavaScript Object Notations" },
    PID: { expansion: "process ID", plural: "process IDs" },
    BAD: { expansion: "costs $5 more", plural: "costs $5 more" },
  },
  words: [],
  overrides: { "guides/usb.mdx": { PID: { expansion: "USB product ID", plural: "USB product IDs" } } },
  ambiguous: [],
  unknown: [],
};
const doc = (body: string) => `---\ntitle: The API\ndescription: API notes\n---\n\n${body}`;

describe("fixSource", () => {
  test("inserts after the token and after a plural s, nothing else changes", () => {
    const old = doc("Many APIs and one API.\n");
    const r = fixSource("guides/x.mdx", old, g);
    expect(r.refused).toBeUndefined();
    expect(r.next).toBe(doc("Many APIs (application programming interfaces) and one API.\n"));
    expect(removeInsertions(r.next!, r.insertions)).toBe(old);
  });

  test("frontmatter, code, headings and footnote definitions are not touched", () => {
    const old = doc("## The API\n\nRun `API` now.[^a]\n\n```\nAPI\n```\n\n[^a]: Vendor, \"API guide.\"\n");
    const r = fixSource("guides/x.mdx", old, g);
    expect(r.next).toBeUndefined(); // the only prose use is none: heading-only, so no change
    expect(r.insertions).toEqual([]);
  });

  test("an expansion that names another term does not make it flagged twice", () => {
    const r = fixSource("guides/x.mdx", doc("A JWT is signed. JSON follows.\n"), g);
    expect(r.refused).toBeUndefined();
    expect(r.next).toContain("JWT (JSON Web Token) is signed. JSON (JavaScript Object Notation) follows.");
  });

  test("a per-doc override beats the glossary", () => {
    expect(entryFor(g, "guides/usb.mdx", "PID")?.expansion).toBe("USB product ID");
    expect(entryFor(g, "guides/other.mdx", "PID")?.expansion).toBe("process ID");
    const r = fixSource("guides/usb.mdx", doc("The PID is 0x1.\n"), g);
    expect(r.next).toContain("The PID (USB product ID) is 0x1.");
  });

  test("a term the glossary lacks is listed, not guessed", () => {
    const r = fixSource("guides/x.mdx", doc("The ZZQ and the API.\n"), g);
    expect(r.unresolved).toEqual(["ZZQ"]);
    expect(r.next).toContain("API (application programming interface)");
    expect(r.next).not.toContain("ZZQ (");
  });

  test("an unsafe expansion refuses the file", () => {
    const r = fixSource("guides/x.mdx", doc("The BAD one.\n"), g);
    expect(r.refused).toContain("BAD");
    expect(r.next).toBeUndefined();
  });

  test("an already explained first use is left alone", () => {
    const r = fixSource("guides/x.mdx", doc("The API (application programming interface) is used.\n"), g);
    expect(r.insertions).toEqual([]);
  });

  test("removeInsertions detects a changed insertion", () => {
    expect(removeInsertions("a (xx) b", [{ at: 1, text: " (yy)", key: "K", line: 1 }])).toBeNull();
  });
});

describe("pinned strings follow their sentence", () => {
  const old = "The API answers. Keep: the API path is fixed.";
  const ins = [{ at: old.indexOf("API path") + 3, text: " (application programming interface)", key: "API", line: 1 }];
  test("an insertion inside a pin moves into the pin", () => {
    expect(followPin(old, "the API path is fixed", ins)).toBe("the API (application programming interface) path is fixed");
  });
  test("an insertion at the pin's end leaves the pin unchanged", () => {
    expect(followPin(old, "the API", ins)).toBe("the API");
  });
  test("a pin that is not unique is refused", () => {
    expect(followPin("API x API x", "API x", ins)).toBeNull();
  });
  test("pins.ts literal is rewritten only on exactly one match", () => {
    const src = `mustContain: ["the API path is fixed"],`;
    expect(applyPinMoves(src, [{ from: "the API path is fixed", to: "the API (a b) path is fixed" }])).toBe(`mustContain: ["the API (a b) path is fixed"],`);
    expect(Array.isArray(applyPinMoves(src + src, [{ from: "the API path is fixed", to: "x" }]))).toBe(true);
  });
});
