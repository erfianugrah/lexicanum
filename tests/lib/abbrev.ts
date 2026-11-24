/**
 * First-use abbreviation check.
 *
 * Rule (owner, 2026-11-24): every abbreviation is explained the first time each
 * doc uses it. There is no site-wide allowlist of "well-known" terms - API,
 * HTTP, URL, JSON and CPU are expanded once per doc like any other. What IS
 * exempt is a short list of named classes (EXEMPTIONS below), each of which is
 * not an abbreviation in the first place: a unit after a number, an identifier
 * such as `ES256`, a keyword written in capitals, a file name.
 *
 * What counts as an explanation, at the first occurrence only:
 *   `ABBR (two or more words)`   - expansion in a parenthetical right after
 *   `two or more words (ABBR)`   - expansion first, abbreviation in parentheses
 *   `ABBR, short for ...`        - short gloss
 * Nothing else counts, so a vague "(see below)" fails only if it is one word.
 *
 * Where the first use is: the first occurrence in a paragraph or list item.
 * Headings and table cells are not a first use, because a heading cannot carry
 * the expansion and a reader meets the paragraph's text first. A term that
 * never occurs in paragraph prose uses its first table cell instead; a term
 * that occurs only in headings has no prose to explain it in and is exempt
 * (rule `heading-only`). An occurrence joined to letters or digits by
 * - . / + & (FR-4, MS-01, GL.iNet, PM2.5, USB-C) is part of a name and never
 * the first use; a term seen only that way is exempt (rule `compound-only`).
 *
 * Never inspected: frontmatter, code fences, inline code spans, MDX comments,
 * URLs and link targets, HTML/JSX tags and attributes, footnote definitions
 * (they are citations), and `import` lines.
 *
 * Why this module masks lines itself instead of using `Line.proseNoCode`:
 * proseNoCode deletes the code spans, which shifts every column after one, and
 * scripts/abbrev-fix.ts has to insert at exact columns of the raw line. The mask
 * here is same-length (blanks), so a column in the mask is a column in the file.
 * Line kinds (frontmatter, fence, comment) still come from parseMdx.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { parseMdx, type Doc } from "./mdx";

/** data/abbreviations.json, written by scripts/abbrev-glossary.ts and reviewed by hand. */
export interface TermEntry {
  expansion: string;
  plural?: string;
}
export interface Glossary {
  terms: Record<string, TermEntry>;
  /** Capitalised words and brand names that stand for nothing (HIT, NVIDIA): not abbreviations. */
  words: string[];
  /** Per-doc meanings for terms that mean different things in different docs. */
  overrides: Record<string, Record<string, TermEntry>>;
  /** Terms with different meanings in different docs; each flagged doc needs an override. */
  ambiguous: string[];
  /** Terms nobody could expand; listed, never guessed. */
  unknown: string[];
}

export const GLOSSARY_PATH = join(new URL("../..", import.meta.url).pathname, "data/abbreviations.json");

export function loadGlossary(path = GLOSSARY_PATH): Glossary {
  const empty: Glossary = { terms: {}, words: [], overrides: {}, ambiguous: [], unknown: [] };
  if (!existsSync(path)) return empty;
  return { ...empty, ...(JSON.parse(readFileSync(path, "utf8")) as Partial<Glossary>) };
}

export type Context = "paragraph" | "table" | "heading";

export interface Occurrence {
  /** Token without its plural s: `APIs` -> `API`. The unit the rules work on. */
  key: string;
  /** As written, without the plural s. */
  token: string;
  plural: boolean;
  /** 1-indexed line. */
  line: number;
  /** Column in the raw line where the token starts. */
  start: number;
  /** Column just after the token, including a plural s. An insertion goes here. */
  end: number;
  context: Context;
  /** The occurrence carries one of the three accepted explanations. */
  expanded: boolean;
  /** Name of the exemption rule that removes it from the check, if any. */
  exempt: string | null;
  /**
   * Joined to letters or digits by - . / + & (FR-4, MS-01, GL.iNet, PM2.5,
   * USB-C, RX/TX): part of a name or compound. Such an occurrence is never the
   * first use and never takes an insertion, because `FR (flame retardant)-4`
   * splits the name; the next standalone occurrence is the first use. A term
   * that only ever appears inside compounds is explained after the WHOLE
   * compound instead (`SHA-256 (Secure Hash Algorithm)`): see `compoundEnd`.
   */
  compound: boolean;
  /** For a compound occurrence: column just after the whole compound (insertion point). */
  compoundEnd: number;
  /** For a compound occurrence: the compound already carries an explanation after it. */
  compoundExpanded: boolean;
}

export interface Finding {
  key: string;
  line: number;
  start: number;
  end: number;
  plural: boolean;
  context: Context;
  /** The first use sits inside a compound; `end` is the end of the whole compound. */
  compound?: boolean;
}

/** What a rule sees: the token and the masked text around it on its line. */
export interface Info {
  key: string;
  prefix: string;
  core: string;
  suffix: string;
  before: string;
  after: string;
  context: Context;
}

export interface Exemption {
  name: string;
  /** One line: why this is not an abbreviation the reader needs expanded. */
  reason: string;
  test: (i: Info, words: Set<string>) => boolean;
  /** Test fixtures: a body where the rule exempts `term`, and a near-miss where it must not. */
  term: string;
  exempt: string;
  flagged: string;
  /** The term the `flagged` fixture must draw a finding for. */
  flaggedKey: string;
}

const set = (s: string) => new Set(s.split(/\s+/).filter(Boolean));

const HTTP_METHODS = set("GET POST PUT PATCH DELETE HEAD OPTIONS");
const SQL_KEYWORDS = set(
  "SELECT INSERT UPDATE CREATE ALTER DROP GRANT REVOKE FROM WHERE JOIN LIMIT UNION VALUES INTO TABLE INDEX " +
    "BEGIN COMMIT ROLLBACK WITH CASE WHEN THEN ELSE END ORDER GROUP HAVING DISTINCT USING RETURNING " +
    "NULL TRUE FALSE AND OR NOT IS IN ON AS BY IF SET ALL ANY NO",
);
const UNITS = set("KB MB GB TB PB EB KiB MiB GiB TiB GHz MHz THz GT MT");
const FILE_NAMES = set("README AGENTS RUNLOG LICENSE CHANGELOG");
// Capitals used for emphasis or as plain words, not as abbreviations.
const CAPS_WORDS = set(
  "NOTE WARNING NEVER ALWAYS ONLY MUST SHOULD MAY OK YES TODO FIXME STOP DONE FAIL PASS PASSED FAILED ERROR WARN INFO DEBUG",
);
// Roman numerals count only after a word that numbers things; otherwise IV, VI,
// XI collide with real abbreviations (initialisation vector, vi, X11).
const ROMAN = /^(?:II|III|IV|VI|VII|VIII|IX|XI|XII|XIII|XIV|XV|XVI)$/;
const NUMBERING_WORD = /\b(?:Part|Phase|Step|Stage|Section|Chapter|Type|Class|Tier|Level|Annex|Appendix|Volume|Vol|Round|Gen|Generation|Rev|Revision)\s*$/;

export const EXEMPTIONS: Exemption[] = [
  {
    name: "unit-after-number",
    reason: "a unit of measure directly after a number is read as a unit, not as a term",
    test: (i) => UNITS.has(i.key) && /[0-9][0-9.,]*[ \u00a0]?$/.test(i.before),
    term: "GB",
    exempt: "The card has 16 GB of memory.",
    flagged: "The GB figure is a limit.",
    flaggedKey: "GB",
  },
  {
    name: "identifier",
    reason: "a token with two or more digits is a module id, part number or algorithm name (RM03, SS03b, ES256, AQC113, nRF52840)",
    test: (i) => (i.core.match(/[0-9]/g) ?? []).length >= 2,
    term: "ES256",
    exempt: "Tokens are signed with ES256 here.",
    flagged: "The I2C bus is slow.",
    flaggedKey: "I2C",
  },
  {
    name: "http-method",
    reason: "an HTTP method written in capitals is the method's name, a word of the protocol",
    test: (i) => HTTP_METHODS.has(i.key),
    term: "POST",
    exempt: "Send a POST to the endpoint.",
    flagged: "Send a PUSH to the endpoint.",
    flaggedKey: "PUSH",
  },
  {
    name: "sql-keyword",
    reason: "SQL keywords and boolean literals are words of the language, not abbreviations",
    test: (i) => SQL_KEYWORDS.has(i.key),
    term: "SELECT",
    exempt: "Run SELECT against the view.",
    flagged: "Run the SQL against the view.",
    flaggedKey: "SQL",
  },
  {
    name: "caps-word",
    reason: "an ordinary English word or log level written in capitals for emphasis",
    test: (i) => CAPS_WORDS.has(i.key),
    term: "NEVER",
    exempt: "NEVER run this on the primary.",
    flagged: "Never run the DDL on the primary.",
    flaggedKey: "DDL",
  },
  {
    name: "capitalised-word",
    reason: "a word, brand or identifier in capitals that a reader does not need expanded (HIT, NVIDIA, EUR, a register name used across docs); the list is data/abbreviations.json `words`, reviewed by hand",
    test: (i, words) => words.has(i.key),
    term: "HIT",
    exempt: "The status is HIT here.",
    flagged: "The status is SLA here.",
    flaggedKey: "SLA",
  },
  {
    name: "file-name",
    reason: "an all-caps file name (README, AGENTS, RUNLOG) names a file; a name followed by an extension is also one",
    test: (i) => FILE_NAMES.has(i.key) || /^\.(?:md|mdx|json|ya?ml|toml|txt|tsx?|jsx?|sh|nix|conf|ini|csv|log|xml)\b/.test(i.after),
    term: "RUNLOG",
    exempt: "The RUNLOG records every run.",
    flagged: "The RTT records every run.",
    flaggedKey: "RTT",
  },
  {
    name: "tl-dr",
    reason: "TL;DR is one conventional heading word, tokenised by the semicolon",
    test: (i) => (i.key === "TL" && i.after.startsWith(";DR")) || (i.key === "DR" && i.before.endsWith("TL;")),
    term: "TL",
    exempt: "TL;DR: it works.",
    flagged: "The TL cache is warm.",
    flaggedKey: "TL",
  },
  {
    name: "attached-paren",
    reason: "a token with a parenthesis attached, no space (HTTP(S), COM(2026)), is a name or reference whose parenthesis is part of it",
    test: (i) => i.after.startsWith("("),
    term: "COM",
    exempt: "See COM(2026) 502 final.",
    flagged: "See COM 502 final.",
    flaggedKey: "COM",
  },
  {
    name: "currency-prefix",
    reason: "a country prefix on a currency amount (US\\$146) is part of the currency, not a term",
    test: (i) => /^\\?\$\d/.test(i.after),
    term: "US",
    exempt: "It costs US\\$146 here.",
    flagged: "It ships from the US here.",
    flaggedKey: "US",
  },
  {
    name: "roman-numeral",
    reason: "a Roman numeral after a numbering word (Part IV, Phase II) numbers a section",
    test: (i) => ROMAN.test(i.key) && NUMBERING_WORD.test(i.before),
    term: "IV",
    exempt: "Phase IV starts here.",
    flagged: "The IV is reused across messages.",
    flaggedKey: "IV",
  },
];

/** Same-length blanking, so columns in the result are columns in the raw line. */
function blank(s: string, re: RegExp): string {
  return s.replace(re, (m) => " ".repeat(m.length));
}

interface MaskState {
  inTag: boolean;
  inFootnote: boolean;
  math: boolean;
}

/** The raw prose line with everything the check must not look at replaced by spaces. */
export function maskLine(raw: string, st: MaskState): string {
  if (/^\[\^[^\]]+\]:/.test(raw)) {
    st.inFootnote = true;
    return " ".repeat(raw.length);
  }
  if (st.inFootnote) {
    if (raw.trim() === "" || /^[ \t]/.test(raw)) return " ".repeat(raw.length);
    st.inFootnote = false;
  }
  if (/^\s*(?:import|export)\s/.test(raw)) return " ".repeat(raw.length);
  let s = raw;
  if (st.inTag) {
    const close = s.indexOf(">");
    if (close === -1) return " ".repeat(raw.length);
    s = " ".repeat(close + 1) + s.slice(close + 1);
    st.inTag = false;
  }
  s = blank(s, /(`+)(?:(?!\1)[^])+?\1/g); // inline code, before anything that may sit inside it
  s = blank(s, /\{\/\*.*?\*\/\}/g);
  s = blank(s, /\]\((?:[^()]|\([^()]*\))*\)/g); // link targets
  s = blank(s, /\bhttps?:\/\/[^\s<>)\]]+/g);
  s = blank(s, /<\/?[A-Za-z][^<>]*>/g); // tags with their attributes
  const open = s.match(/<\/?[A-Za-z][^<>]*$/);
  if (open && open.index !== undefined) {
    s = s.slice(0, open.index) + " ".repeat(s.length - open.index);
    st.inTag = true;
  }
  if (st.math) s = blank(s, /\$[^$]+\$/g);
  return s;
}

const WORD = /(?<![A-Za-z0-9_])[A-Za-z][A-Za-z0-9]*(?![A-Za-z0-9_])/g;
// [lowercase prefix] CORE [one lowercase letter and digits]: mTLS, API, GSa, IPv4, PCIe.
const SHAPE = /^([a-z]?)([A-Z][A-Z0-9]*)([a-z][0-9]*)?$/;
// PoE, DoH, QoS: capital, lowercase, capital.
const SHAPE3 = /^[A-Z][a-z][A-Z]$/;

function parseToken(w: string): { prefix: string; core: string; suffix: string; plural: boolean; key: string } | null {
  let plural = false;
  let base = w;
  const m = w.match(SHAPE);
  if (m && m[3] === "s") {
    base = w.slice(0, -1);
    plural = true;
  }
  const t = base.match(SHAPE);
  if (t && (t[2]!.match(/[A-Z]/g) ?? []).length >= 2) {
    return { prefix: t[1]!, core: t[2]!, suffix: t[3] ?? "", plural, key: base };
  }
  if (SHAPE3.test(base)) return { prefix: "", core: base, suffix: "", plural, key: base };
  // PoEs: SHAPE would not have taken the plural s of a three-letter shape.
  if (!plural && /^[A-Z][a-z][A-Z]s$/.test(w)) return { prefix: "", core: w.slice(0, 3), suffix: "", plural: true, key: w.slice(0, 3) };
  return null;
}

const wordsIn = (s: string) => (s.match(/[A-Za-z]{2,}/g) ?? []).length;

/**
 * A parenthetical right after the token explains it when it holds two words, or
 * one word of 4+ letters that is not itself in capitals (`DB (database)`,
 * `JS (JavaScript)`, but not `API (REST)`). It cannot check meaning: the glossary
 * and its review do that.
 */
function explainsInline(inner: string): boolean {
  const words = inner.match(/[A-Za-z]{2,}/g) ?? [];
  if (words.length >= 2) return true;
  return words.length === 1 && words[0]!.length >= 4 && /[a-z]/.test(words[0]!);
}

/** Why an expansion may not be inserted into prose, or null when it is safe. */
export function badExpansion(s: string): string | null {
  if (s.trim() === "" || s !== s.trim()) return "empty or padded";
  if (s.length > 90) return "longer than 90 characters";
  if (!/^[\x20-\x7e]+$/.test(s)) return "non-ASCII or control character";
  if (/[$<>{}|`\\[\]()*_]/.test(s)) return "character that MDX, KaTeX or markdown would read";
  if (/ -- /.test(s)) return "' -- ' becomes an en-dash";
  if (!explainsInline(s)) return "not an explanation the check accepts (two words, or one 4+ letter word)";
  return null;
}

/** Compound flags for the occurrence at [start, end) of the masked line. */
function compoundInfo(masked: string, start: number, end: number): { compound: boolean; compoundEnd: number; compoundExpanded: boolean } {
  const compound = /[A-Za-z0-9][-./+&]$/.test(masked.slice(0, start)) || /^[-./+&][A-Za-z0-9]/.test(masked.slice(end));
  if (!compound) return { compound, compoundEnd: end, compoundExpanded: false };
  // Back to the compound's first character, then forward over the whole compound.
  let s = start;
  while (s > 0 && /[A-Za-z0-9]/.test(masked[s - 1]!) || (s > 1 && /[-./+&]/.test(masked[s - 1]!) && /[A-Za-z0-9]/.test(masked[s - 2]!))) s--;
  const m = masked.slice(s).match(/^[A-Za-z0-9]+(?:[-./+&][A-Za-z0-9]+)*/);
  const compoundEnd = s + (m ? m[0].length : 0);
  return { compound, compoundEnd, compoundExpanded: isExpanded(masked, s, compoundEnd) };
}

/** The occurrence carries one of the three accepted explanations. */
function isExpanded(masked: string, start: number, end: number): boolean {
  const after = masked.slice(end);
  const a = after.match(/^\s?\(([^()]*)\)/);
  if (a && explainsInline(a[1]!)) return true;
  if (/^, short for\s+\S/.test(after)) return true;
  const before = masked.slice(0, start);
  // `expansion (ABBR)` and `expansion (ABBR - gloss)` / `(ABBR, ...)`.
  if (before.endsWith("(") && /^(?:\)|\s?[-,;:]\s)/.test(after)) {
    // Complete parentheticals inside the lead are read through, so an expansion
    // inserted for an earlier term (`port VLAN (virtual local area network) ID
    // (PVID)`) does not cut the run of words that explains this one.
    const lead = before.slice(0, -1).replace(/\([^()]*\)/g, "").replace(/[\s"'*_]+$/, "");
    // The words just before the parenthesis, up to the previous sentence break.
    const run = lead.slice(lead.search(/[^.!?:;(]*$/));
    if (wordsIn(run) >= 2) return true;
  }
  return false;
}

function contextOf(raw: string): Context {
  if (/^\s{0,3}#{1,6}\s/.test(raw)) return "heading";
  if (/^[ \t]*\|.*\|[ \t]*$/.test(raw)) return "table";
  return "paragraph";
}

/** Frontmatter `abbreviations-ok`: a flow list or a block list of terms. */
export function okTerms(doc: Doc): Set<string> {
  const fm = doc.lines.filter((l) => l.kind === "frontmatter").map((l) => l.raw).join("\n");
  if (!/^abbreviations-ok:/m.test(fm)) return new Set();
  try {
    const v = (parseYaml(fm) as Record<string, unknown>)["abbreviations-ok"];
    return new Set(Array.isArray(v) ? v.map(String) : []);
  } catch {
    return new Set();
  }
}

let cachedWords: Set<string> | null = null;
export function glossaryWords(): Set<string> {
  return (cachedWords ??= new Set(loadGlossary().words));
}

/** Every candidate occurrence in the doc's prose, exempt ones included (with their rule). */
export function occurrences(doc: Doc, words: Set<string> = glossaryWords()): Occurrence[] {
  const out: Occurrence[] = [];
  const st: MaskState = {
    inTag: false,
    inFootnote: false,
    math: doc.lines.some((l) => l.kind === "comment" && /prose-dollar: math-intentional/.test(l.raw)),
  };
  // Masked prose lines, grouped into blocks the reader meets as one unit: a
  // paragraph or list item is consecutive paragraph lines (an explanation may
  // wrap onto the next line); a heading or a table row is a block of its own.
  type Row = { n: number; masked: string; context: Context };
  const blocks: Row[][] = [];
  let cur: Row[] = [];
  for (const l of doc.lines) {
    const masked = l.kind === "prose" ? maskLine(l.raw, st) : "";
    const context = contextOf(l.raw);
    const listItem = /^\s*(?:[-*+]|\d+[.)])\s/.test(l.raw);
    if (masked.trim() === "" || context !== "paragraph" || listItem) {
      if (cur.length) blocks.push(cur);
      cur = [];
      if (masked.trim() === "") continue;
      if (context !== "paragraph") {
        blocks.push([{ n: l.n, masked, context }]);
        continue;
      }
    }
    cur.push({ n: l.n, masked, context });
  }
  if (cur.length) blocks.push(cur);

  for (const rows of blocks) {
    // One string per block, lines joined by "\n"; quotations blanked so a quoted
    // message (`"JWT expired"`) is never a first use and never takes an insertion.
    const text = blankQuotes(rows.map((r) => r.masked).join("\n"));
    const lineStart: number[] = [];
    let p = 0;
    for (const r of rows) {
      lineStart.push(p);
      p += r.masked.length + 1;
    }
    const where = (pos: number) => {
      let i = lineStart.length - 1;
      while (i > 0 && lineStart[i]! > pos) i--;
      return { row: rows[i]!, col: pos - lineStart[i]! };
    };
    // [skipFrom, skipUntil): the parenthetical of an inline explanation. Only
    // tokens inside the parentheses belong to it; the rest of the compound
    // (`HC` in `MPC-HC (Home Cinema)`) is still a term of its own.
    let skipFrom = 0;
    let skipUntil = 0;
    for (const m of text.matchAll(WORD)) {
      const t = parseToken(m[0]);
      if (!t) continue;
      const start = m.index!;
      if (start >= skipFrom && start < skipUntil) continue;
      // A joined suffix belongs to the token: SFP+, PKCS#7.
      const tail = text.slice(start + m[0].length).match(/^(?:\+(?![A-Za-z0-9])|#\d+)/);
      const end = start + m[0].length + (tail ? tail[0].length : 0);
      const comp = compoundInfo(text, start, end);
      // The explanation sits right after the token, or after the whole compound
      // (`AAAA-only (IPv6 address record)`); its words belong to it either way.
      const at = comp.compound ? comp.compoundEnd : end;
      const inline = text.slice(at).match(/^\s?\(([^()]*)\)/);
      if (inline && explainsInline(inline[1]!) && at + inline[0].length > skipUntil) {
        skipFrom = at;
        skipUntil = at + inline[0].length;
      }
      const { row, col } = where(start);
      const info: Info = {
        key: t.key,
        prefix: t.prefix,
        core: t.core,
        suffix: t.suffix,
        before: text.slice(0, start),
        after: text.slice(end),
        context: row.context,
      };
      const rule = EXEMPTIONS.find((r) => r.test(info, words));
      // Insertion points must stay on the token's own line: a compound never
      // spans a line break (WORD and the joiners exclude "\n").
      out.push({
        key: t.key,
        token: t.key,
        plural: t.plural,
        line: row.n,
        start: col,
        end: col + (end - start),
        context: row.context,
        expanded: isExpanded(text, start, end),
        exempt: rule?.name ?? null,
        compound: comp.compound,
        compoundEnd: col + (comp.compoundEnd - start),
        compoundExpanded: comp.compoundExpanded,
      });
    }
  }
  return out;
}

/** Blank double-quoted spans (same length), so quotations stay verbatim. */
function blankQuotes(s: string): string {
  return s.replace(/"[^"]{1,400}"/g, (q) => q.replace(/[^\n]/g, " "));
}

/**
 * The abbreviations whose first use has no explanation, one finding per
 * abbreviation, at the occurrence the reader meets first.
 */
export function unexpandedFirstUses(doc: Doc, words: Set<string> = glossaryWords(), ignoreOk = false): Finding[] {
  const ok = ignoreOk ? new Set<string>() : okTerms(doc);
  const first = new Map<string, Occurrence>();
  const live = occurrences(doc, words).filter((o) => !o.exempt && !ok.has(o.key));
  // Standalone occurrences first; a term that never stands alone takes its
  // first compound occurrence, explained after the whole compound.
  for (const compound of [false, true]) {
    for (const ctx of ["paragraph", "table"] as const) {
      for (const o of live) {
        if (o.compound === compound && o.context === ctx && !first.has(o.key)) first.set(o.key, o);
      }
    }
  }
  // Headings never set a first use: a key seen only there is the `heading-only` exemption.
  return [...first.values()]
    .filter((o) => !(o.compound ? o.compoundExpanded : o.expanded))
    .map(({ key, line, start, end, plural, context, compound, compoundEnd }) =>
      compound ? { key, line, start, end: compoundEnd, plural: false, context, compound } : { key, line, start, end, plural, context },
    )
    .sort((a, b) => a.line - b.line || a.start - b.start);
}

/** Convenience for tests and scripts: parse a source string and check it. */
export function checkSource(path: string, raw: string, words?: Set<string>): Finding[] {
  return unexpandedFirstUses(parseMdx(path, raw), words);
}

/** Every doc the check covers, as paths under src/content/docs (guides, reference and the homepage). */
export function corpusFiles(docsRoot: string): string[] {
  return (readdirSync(docsRoot, { recursive: true }) as string[])
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.split("\\").join("/"))
    .sort();
}
