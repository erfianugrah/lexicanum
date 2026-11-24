/**
 * Tests for the first-use abbreviation check, one case per rule.
 *
 * The exemption rules are a TABLE in abbrev.ts (EXEMPTIONS), each row carrying
 * the line it must exempt and a near-miss it must still flag, and the suite
 * iterates the table: a rule cannot be added without its cases, and deleting a
 * rule deletes them (same shape as LLM_MARKERS in mdx.test.ts).
 */
import { describe, expect, test } from "bun:test";
import { EXEMPTIONS, badExpansion, checkSource, occurrences, okTerms } from "./abbrev";
import { parseMdx } from "./mdx";

const fm = (body: string, extra = "") => `---\ntitle: t\ndescription: d\n${extra}---\n\n${body}`;
const NO_WORDS = new Set<string>();
/** Keys flagged in a doc body, in the order the reader meets them. */
const flagged = (body: string, extra = "", words: Set<string> = NO_WORDS) =>
  checkSource("t.mdx", fm(body, extra), words).map((f) => f.key);

describe("exemption table", () => {
  test("rule names are unique", () => {
    const seen = EXEMPTIONS.map((r) => r.name);
    expect(seen.filter((n, i) => seen.indexOf(n) !== i)).toEqual([]);
  });

  describe.each(EXEMPTIONS.map((r) => [r.name, r] as const))("%s", (_name, rule) => {
    const words = new Set(["HIT"]); // what the capitalised-word rule reads from the glossary
    test("exempts its own hit", () => {
      expect(flagged(rule.exempt, "", words)).not.toContain(rule.term);
    });
    test("still flags its near-miss", () => {
      expect(flagged(rule.flagged, "", words)).toContain(rule.flaggedKey);
    });
  });

  test("a unit is exempt only after a number, in any spacing", () => {
    expect(flagged("Needs 3.3 GHz.")).toEqual([]);
    expect(flagged("Needs 120 MB/s.")).toEqual([]);
    expect(flagged("Needs 8\u00a0GB.")).toEqual([]);
    expect(flagged("The units are MB or GB.")).toEqual(["MB", "GB"]);
  });

  test("a unit in one place does not hide the term elsewhere", () => {
    // 16 GB is a unit; the bare GB later is the first use of the term.
    expect(flagged("It has 16 GB. The GB figure is a limit.")).toEqual(["GB"]);
  });

  test("an identifier needs two digits, so one-digit names are terms", () => {
    expect(flagged("RM03 and SS03b and ES256 and nRF52840.")).toEqual([]);
    expect(flagged("The EC2 and WPA2 and FTS5 names.")).toEqual(["EC2", "WPA2", "FTS5"]);
  });

  test("a file name followed by an extension is exempt", () => {
    expect(flagged("Edit CHANGELOG.md first.")).toEqual([]);
    expect(flagged("Edit the SLA.md-style text.")).toEqual([]);
    expect(flagged("The SLA. Next.")).toEqual(["SLA"]);
  });
});

describe("candidate tokens", () => {
  test.each([
    ["API", ["API"]],
    ["HTTPS", ["HTTPS"]],
    ["JWKS", ["JWKS"]],
    ["mTLS", ["mTLS"]],
    ["GSa", ["GSa"]],
    ["IPv4", ["IPv4"]],
    ["PCIe", ["PCIe"]],
    ["PoE", ["PoE"]],
    ["I2C", ["I2C"]],
    ["eBPF", ["eBPF"]],
    // not candidates
    ["Cloudflare", []],
    ["WebSocket", []],
    ["PostgREST", []],
    ["GitHub", []],
    ["S3", []],
    ["R2", []],
    ["A", []],
    ["SUPABASE_URL", []],
    ["10GbE", []],
  ])("%s", (token, want) => {
    expect(flagged(`The ${token} thing.`)).toEqual(want);
  });

  test("a plural s is part of the term, not a second term", () => {
    expect(flagged("Many APIs and one API.")).toEqual(["API"]);
    const f = checkSource("t.mdx", fm("Many APIs here."), NO_WORDS)[0]!;
    // an insertion goes after the s
    expect(f.plural).toBe(true);
    expect("Many APIs here.".slice(f.start, f.end)).toBe("APIs");
  });
});

describe("what counts as an explanation", () => {
  test.each([
    ["API (application programming interface) is used.", false],
    ["APIs (application programming interfaces) are used.", false],
    ["application programming interface (API) is used.", false],
    ["The application programming interfaces (APIs) are used.", false],
    ["API, short for application programming interface, is used.", false],
    ["DB (database) is used.", false],
    ["API is used.", true],
    ["API (v2) is used.", true],
    ["The (API) is used.", true], // one word before the parenthesis
    // an expansion the fixer inserted for an earlier term is read through
    ["the programming (a b) interface (API) is used.", false],
    ["API (see below) is used.", false], // the check cannot read meaning; two words pass
    ["API, as they say, is used.", true], // only the three forms count
    ["API is the application programming interface.", true], // a later sentence is not a gloss
  ])("%s", (line, isFlagged) => {
    expect(flagged(line)).toEqual(isFlagged ? ["API"] : []);
  });

  test("one word in capitals is not an explanation", () => {
    expect(flagged("API (REST) is used.")).toEqual(["API", "REST"]);
  });

  test("a one-word lower-case gloss passes, a one-word term in capitals does not", () => {
    expect(flagged("JS (JavaScript) runs.")).toEqual([]);
    expect(flagged("JS (CSS) runs.")).toEqual(["JS", "CSS"]);
  });

  test("the words of an explanation are not themselves uses", () => {
    // JSON inside the expansion of JWT is part of its name, not a use of JSON.
    expect(flagged("JWT (JSON Web Token) is used. JSON is next.")).toEqual(["JSON"]);
    expect(flagged("JWT (JSON Web Token) is used.")).toEqual([]);
  });

  test("only the first occurrence is checked", () => {
    expect(flagged("API (application programming interface) first. API again, API twice.")).toEqual([]);
    expect(flagged("API first. Then API (application programming interface).")).toEqual(["API"]);
  });
});

describe("where the first use is", () => {
  test("a heading is not a use: the paragraph under it is", () => {
    expect(flagged("## The API\n\nThe API is used.\n")).toEqual(["API"]);
    expect(flagged("## The API\n\nThe API (application programming interface) is used.\n")).toEqual([]);
  });

  test("a heading cannot carry the expansion", () => {
    expect(flagged("## The API (application programming interface)\n\nThe API is used.\n")).toEqual(["API"]);
  });

  test("a term only in headings has no prose to explain it in", () => {
    expect(flagged("## Using the API\n\nNothing else here.\n")).toEqual([]);
  });

  test("a table cell before the paragraph does not count; a table-only term does", () => {
    const table = "| Name | Meaning |\n|---|---|\n| API | a thing |\n\n";
    expect(flagged(table + "The API (application programming interface) is used.\n")).toEqual([]);
    expect(flagged(table + "The API is used.\n")).toEqual(["API"]);
    expect(flagged(table)).toEqual(["API"]);
    expect(flagged("| Name |\n|---|\n| API (application programming interface) |\n")).toEqual([]);
  });

  test("a list item is a paragraph", () => {
    expect(flagged("- the API is used\n")).toEqual(["API"]);
  });
});

describe("what is never inspected", () => {
  test.each([
    ["inline code", "Run `API` now."],
    ["a code fence", "```\nAPI call\n```\n"],
    ["an indented fence", "1. step\n\n   ```bash\n   API call\n   ```\n"],
    ["an MDX comment", "{/* API note */}\n"],
    ["an inline MDX comment", "Text {/* API note */} here.\n"],
    ["a multi-line MDX comment", "{/* one\n   API two */}\n"],
    ["a URL", "See https://example.com/API/v1 for more.\n"],
    ["a link target", "See [the page](/guides/API-notes) for more.\n"],
    ["a tag attribute", '<Aside title="API note" type="note">\n\nplain\n\n</Aside>\n'],
    ["a tag attribute across lines", '<Aside\n  title="API note"\n  type="note"\n>\n\nplain\n'],
    ["a footnote definition", "Text[^a].\n\n[^a]: Vendor, \"API guide,\" Docs. https://example.com\n"],
    ["a footnote definition continuation", "Text[^a].\n\n[^a]: Vendor guide,\n    API notes\n"],
    ["an import line", "import API from './x';\n"],
  ])("%s", (_what, body) => {
    expect(flagged(body)).toEqual([]);
  });

  test("frontmatter is not prose", () => {
    const doc = `---\ntitle: The API\ndescription: API notes\n---\n\nplain\n`;
    expect(checkSource("t.mdx", doc, NO_WORDS)).toEqual([]);
  });

  test("link text is prose, its target is not", () => {
    expect(flagged("See [the API](/guides/API-notes).\n")).toEqual(["API"]);
  });

  test("math-intentional docs do not read inline math", () => {
    expect(flagged("{/* prose-dollar: math-intentional */}\n\nSize is $MTU - MSS$ here.\n")).toEqual([]);
    expect(flagged("Size is $MTU$ here.\n")).toEqual(["MTU"]);
  });
});

describe("frontmatter escape hatch", () => {
  test("a flow list exempts the named terms only", () => {
    expect(flagged("The API and the CLI.", "abbreviations-ok: [API]\n")).toEqual(["CLI"]);
  });

  test("a block list works too", () => {
    expect(flagged("The API and the CLI.", "abbreviations-ok:\n  - API\n  - CLI\n")).toEqual([]);
  });

  test("a doc without the field has none", () => {
    expect(okTerms(parseMdx("t.mdx", fm("x")))).toEqual(new Set());
  });
});

describe("occurrences", () => {
  test("exempt occurrences name their rule", () => {
    const o = occurrences(parseMdx("t.mdx", fm("Send a POST with 16 GB.")), NO_WORDS);
    expect(o.map((x) => [x.key, x.exempt])).toEqual([
      ["POST", "http-method"],
      ["GB", "unit-after-number"],
    ]);
  });
});

describe("badExpansion", () => {
  test.each([
    ["application programming interface", null],
    ["Amazon Web Services", null],
    ["database", null],
    ["", "empty or padded"],
    [" padded", "empty or padded"],
    ["costs $5 more", "character that MDX, KaTeX or markdown would read"],
    ["a < b", "character that MDX, KaTeX or markdown would read"],
    ["set {x}", "character that MDX, KaTeX or markdown would read"],
    ["a | b", "character that MDX, KaTeX or markdown would read"],
    ["a (nested) one", "character that MDX, KaTeX or markdown would read"],
    ["caf\u00e9 au lait", "non-ASCII or control character"],
    ["smart \u2019 quote", "non-ASCII or control character"],
    ["one -- two", "' -- ' becomes an en-dash"],
    ["API", "not an explanation the check accepts (two words, or one 4+ letter word)"],
    ["x".repeat(91), "longer than 90 characters"],
  ])("%j", (s, want) => {
    expect(badExpansion(s)).toBe(want);
  });
});
