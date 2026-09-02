/**
 * One structural parse of an MDX doc, shared by every doc test.
 *
 * Written because the bash checks it replaces kept being wrong in the same way:
 * they pattern-matched raw file text and so could not tell a code fence, a
 * frontmatter value or an inline code span from prose. Concretely, in one day:
 * `prose-dollar.sh` flagged a dollar in frontmatter (not math-processed), then a
 * dollar inside an indented fence (fences were only recognised at column zero),
 * then a dollar in an inline code span (shielded from remark-math); and a
 * pipe-counting heuristic over rendered HTML reported a split table for a page
 * that merely discusses LogQL pipe syntax in prose.
 *
 * The fix is to classify each line once, here, and let the checks assert over
 * structure. This module has its own tests - a check nobody tests is a check
 * that can pass vacuously.
 */

export type LineKind = "frontmatter" | "fence" | "comment" | "prose" | "delimiter";

export interface Line {
  /** 1-indexed, matching what an editor shows. */
  n: number;
  raw: string;
  kind: LineKind;
  /** Prose with inline `code` spans blanked, for checks that must ignore them. */
  proseNoCode: string;
}

export interface Table {
  /** 1-indexed line of the header row. */
  startLine: number;
  /** 1-indexed line of the last row. */
  endLine: number;
  rowCount: number;
  /**
   * Whether the run carries a delimiter row. GFM only renders a pipe run as a
   * table when one is present; a run without it is literal pipe text.
   */
  hasSeparator: boolean;
}

export interface Fence {
  /** Info string after the opening marker, e.g. "dot", "bash", "" for none. */
  lang: string;
  /** 1-indexed line of the opening marker. */
  startLine: number;
  /** 1-indexed line of the closing marker, or the last line if unterminated. */
  endLine: number;
  /** Contents between the markers. */
  body: string;
}

export interface Doc {
  path: string;
  raw: string;
  lines: Line[];
  frontmatter: Record<string, string>;
  isDraft: boolean;
  /** Body text with frontmatter and fences removed, newlines collapsed. */
  bodyText: string;
  tables: Table[];
  /** Code fences with their language tag, so style checks can target one kind. */
  fences: Fence[];
  footnoteRefs: string[];
  footnoteDefs: string[];
  /** Site-internal links, e.g. "/guides/foo". */
  internalLinks: string[];
}

const FENCE = /^[ \t]*(`{3,}|~{3,})/;
const TABLE_ROW = /^[ \t]*\|.*\|[ \t]*$/;
const TABLE_SEP = /^[ \t]*\|[\s:|-]+\|[ \t]*$/;

export function parseMdx(path: string, raw: string): Doc {
  const src = raw.split("\n");
  const lines: Line[] = [];

  let inFrontmatter = false;
  let fenceMarker: string | null = null;
  // Fence bounds are recorded HERE rather than re-derived from the classified
  // lines, because the "only a marker at least as long as the opener closes it"
  // rule lives in this loop; a second pass that ignored it split one fence into
  // three and would have exempted the inner block from style checks.
  const fences: Fence[] = [];
  let openFence: { lang: string; start: number; body: string[] } | null = null;
  // MDX comments do not render, so their contents are not prose. One doc
  // documents the citation syntax inside one - `cited inline as [^slug]` - which
  // read as a real footnote reference with no definition.
  let inComment = false;

  for (let i = 0; i < src.length; i++) {
    const raw = src[i] ?? "";
    const n = i + 1;
    let kind: LineKind;

    if (n === 1 && raw.trim() === "---") {
      inFrontmatter = true;
      kind = "delimiter";
    } else if (inFrontmatter && raw.trim() === "---") {
      inFrontmatter = false;
      kind = "delimiter";
    } else if (inFrontmatter) {
      kind = "frontmatter";
    } else {
      const m = raw.match(FENCE);
      const stripped = raw.replace(/\{\/\*.*?\*\/\}/g, "");
      if (inComment) {
        kind = "comment";
        if (/\*\/\}/.test(raw)) inComment = false;
        lines.push({ n, raw, kind, proseNoCode: "" });
        continue;
      }
      if (/\{\/\*/.test(stripped)) {
        inComment = true;
        kind = "comment";
        lines.push({ n, raw, kind, proseNoCode: "" });
        continue;
      }
      if (/\{\/\*.*?\*\/\}/.test(raw) && stripped.trim() === "") {
        lines.push({ n, raw, kind: "comment", proseNoCode: "" });
        continue;
      }
      if (fenceMarker) {
        // Only a marker at least as long as the opener closes the fence.
        kind = "fence";
        if (m && (m[1]?.[0] ?? "") === fenceMarker[0] && (m[1]?.length ?? 0) >= fenceMarker.length) {
          fenceMarker = null;
          if (openFence) {
            fences.push({
              lang: openFence.lang,
              startLine: openFence.start,
              endLine: n,
              body: openFence.body.join("\n"),
            });
            openFence = null;
          }
        } else if (openFence) {
          // A shorter inner marker is fence CONTENT, not a closer - a ````md
          // block quoting a ```bash block is one fence, not three.
          openFence.body.push(raw);
        }
      } else if (m) {
        fenceMarker = m[1] ?? null;
        kind = "fence";
        openFence = { lang: raw.replace(FENCE, "").trim(), start: n, body: [] };
      } else {
        kind = "prose";
      }
    }

    lines.push({
      n,
      raw,
      kind,
      proseNoCode: kind === "prose" ? raw.replace(/`[^`]*`/g, "") : "",
    });
  }

  if (openFence) {
    fences.push({
      lang: openFence.lang,
      startLine: openFence.start,
      endLine: lines.length,
      body: openFence.body.join("\n"),
    });
  }

  const frontmatter: Record<string, string> = {};
  for (const l of lines) {
    if (l.kind !== "frontmatter") continue;
    const m = l.raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m?.[1]) frontmatter[m[1]] = (m[2] ?? "").trim();
  }

  const prose = lines.filter((l) => l.kind === "prose");
  const bodyText = prose
    .map((l) => l.raw)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // A table is a run of consecutive pipe rows in prose context. A blank line
  // ends the run, which is exactly the failure mode worth reporting: markdown
  // stops the table there and renders everything after it as a paragraph.
  const tables: Table[] = [];
  let cur: { start: number; rows: number; hasSeparator: boolean } | null = null;
  for (const l of lines) {
    const isRow = l.kind === "prose" && TABLE_ROW.test(l.raw);
    if (isRow) {
      if (!cur) cur = { start: l.n, rows: 0, hasSeparator: false };
      if (TABLE_SEP.test(l.raw)) cur.hasSeparator = true;
      else cur.rows++;
    } else if (cur) {
      tables.push({
        startLine: cur.start,
        endLine: l.n - 1,
        rowCount: cur.rows,
        hasSeparator: cur.hasSeparator,
      });
      cur = null;
    }
  }
  if (cur)
    tables.push({
      startLine: cur.start,
      endLine: lines.length,
      rowCount: cur.rows,
      hasSeparator: cur.hasSeparator,
    });

  // A definition is line-anchored; a reference can appear anywhere, including
  // immediately before a colon that is ordinary sentence punctuation. Matching
  // `[^slug]:` anywhere counted "works[^cf-how-cache-works]:" as a definition
  // AND excluded it from references, which manufactured duplicate definitions,
  // orphan definitions and missing references across four real docs.
  const refs = new Set<string>();
  const defs: string[] = [];
  for (const l of lines) {
    if (l.kind === "fence" || l.kind === "comment") continue;
    const def = l.raw.match(/^\[\^([A-Za-z0-9-]+)\]:/);
    if (def) {
      defs.push(def[1]!);
      continue;
    }
    for (const m of l.raw.matchAll(/\[\^([A-Za-z0-9-]+)\]/g)) refs.add(m[1]!);
  }

  const internalLinks = new Set<string>();
  for (const l of lines) {
    if (l.kind === "fence" || l.kind === "comment") continue;
    for (const m of l.raw.matchAll(/\]\((\/(?:guides|reference)\/[a-z0-9-]+)\/?\)/g)) {
      internalLinks.add(m[1]!);
    }
  }

  return {
    path,
    raw,
    lines,
    frontmatter,
    isDraft: frontmatter.draft === "true",
    bodyText,
    tables,
    fences,
    footnoteRefs: [...refs],
    footnoteDefs: defs,
    internalLinks: [...internalLinks],
  };
}

/**
 * Tables broken in half, reported as the pair of runs. Two shapes ship this
 * way: a blank line between the two halves, and a prose paragraph the
 * orphaned rows lazy-continue (rows, blank line, paragraph, then more rows
 * with no blank line - guides/supabase-postgres-major-upgrade-e2e shipped the
 * second). In GFM a pipe run is a table only if it carries a delimiter row,
 * so a second run that lacks one renders as literal pipe text regardless of
 * what sits between the runs - while a second run with one is always a
 * genuine table (reference/caching.mdx has two in a row with different
 * columns).
 */
export function splitTables(doc: Doc): { first: Table; second: Table }[] {
  const out: { first: Table; second: Table }[] = [];
  for (let i = 0; i < doc.tables.length - 1; i++) {
    const a = doc.tables[i]!;
    const b = doc.tables[i + 1]!;
    if (!b.hasSeparator) out.push({ first: a, second: b });
  }
  return out;
}

/**
 * The first run in a doc lacking a delimiter row, with no preceding table to
 * pair it with. GFM never renders it as a table, so it is the same defect as a
 * split tail - splitTables just cannot name a pair.
 */
export function headlessTableRuns(doc: Doc): Table[] {
  const first = doc.tables[0];
  return first && !first.hasSeparator ? [first] : [];
}

/**
 * Unescaped dollars that remark-math could pair into a formula. Frontmatter,
 * fences and inline code are exempt - verified against built output: a dollar in
 * frontmatter renders literally in og:description, and one in a code span
 * renders literally in <code>, while a bare paired dollar in prose does become
 * KaTeX.
 */
export function mathRiskLines(doc: Doc): Line[] {
  if (/prose-dollar:\s*math-intentional/.test(doc.raw)) return [];
  return doc.lines.filter((l) => l.kind === "prose" && /(?<!\\)\$/.test(l.proseNoCode));
}

export const SMART_PUNCT = /[\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/;

export function smartPunctLines(doc: Doc): Line[] {
  return doc.lines.filter((l) => l.kind !== "fence" && SMART_PUNCT.test(l.raw));
}

/** One phrasing rule, carrying the cases that prove it works. */
export interface Marker {
  /** Stable slug, reported on failure and used to key this rule's own tests. */
  name: string;
  re: RegExp;
  /**
   * A line this rule MUST flag. Required by the type, so a rule cannot be added
   * without the case that proves it fires.
   */
  hit: string;
  /**
   * A near-collision that must flag NOTHING. Present where the root word or a
   * shorter form has legitimate use in this corpus, or where an exemption in
   * the parser (fence, code span) is what keeps the rule honest.
   */
  miss?: string;
}

/**
 * Phrasings that mark prose as machine-written, plus the house-style bans from
 * AGENTS.md that a regex can enforce.
 *
 * A table rather than a bare list of regexes, because an absent rule and a rule
 * that finds nothing emit identical output. The sentence-initial connective
 * rule was lost once and nothing noticed. Here the rule and its test are the
 * same object: the suite iterates this table, so deleting a rule deletes its
 * test instead of silently widening the gate.
 *
 * Calibrated against this corpus, not copied from a listicle: every entry was
 * checked for existing legitimate use first, and the roots that had some are in
 * REJECTED_MARKERS below rather than here.
 *
 * Matching runs on `proseNoCode`, so fenced code and inline code spans are
 * exempt. That exemption is load-bearing rather than defensive: ` -- ` is
 * banned because SmartyPants renders it as an en-dash, which it does not do
 * inside a fence, and the tenancy reference's RLS policy carries `-- reads` and
 * `-- writes` as ordinary SQL comments. A fence-blind version of this check
 * flagged both.
 */
export const LLM_MARKERS: Marker[] = [
  { name: "delve", re: /\bdelv\w*/i, hit: "we delve into the pooler internals" },
  { name: "seamless", re: /\bseamless(ly)?\b/i, hit: "the rollout was seamless" },
  { name: "crucial", re: /\bcrucial(ly)?\b/i, hit: "it is crucial to reboot" },
  {
    name: "essential",
    re: /\bessential\b/i,
    hit: "an essential prerequisite for the cutover",
    miss: "PKCE essentially replaces something you know",
  },
  { name: "comprehensive", re: /\bcomprehensive\b/i, hit: "a comprehensive overview of the stack" },
  {
    name: "robust",
    re: /\brobust\b/i,
    hit: "a robust failover path",
    // The code-span exemption, which is what makes a word ban survivable.
    miss: "pass `--robust` to the CLI",
  },
  {
    name: "significantly",
    re: /\bsignificantly\b/i,
    hit: "throughput improved significantly",
    // Only the adverb is banned: the adjective carries a number after it.
    miss: "the difference is significant at 40 ms",
  },
  { name: "streamline", re: /\bstreamlin\w*/i, hit: "this streamlines the cutover" },
  { name: "empower", re: /\bempower\w*/i, hit: "empowering the operator to self-serve" },
  { name: "cutting-edge", re: /\bcutting-edge\b/i, hit: "a cutting-edge approach to caching" },
  { name: "game-changer", re: /\bgame[- ]chang\w*/i, hit: "the pooler is a game changer" },
  { name: "worth-noting", re: /worth noting/i, hit: "it is worth noting that the pooler drops" },
  {
    name: "worth-flagging",
    re: /worth flagging/i,
    hit: "it is worth flagging that the clone bills at mirrored compute",
    // The bare word is legitimate: "a copy's worth of WAL" is a quantity, not a tell.
    miss: "set maxRetainedWalMb generous enough to hold a full copy's worth of WAL",
  },
  {
    name: "worth-reading-twice",
    re: /worth reading twice/i,
    hit: "the carries-over table is worth reading twice",
    // "Worth reading" alone is an ordinary recommendation.
    miss: "the migration guide is worth reading before the window",
  },
  { name: "important-to-note", re: /important to note/i, hit: "it is important to note the TTL" },
  {
    name: "worth-hedges",
    // The wider "worth X-ing" importance-announcing family, added after the
    // 2026-08-28 corpus sweep found the banned "worth noting" reappearing in
    // costume: "worth knowing", "worth recording", "worth recognising", "worth
    // raising", "worth a thought". Same tell, same fix: drop the frame, keep
    // the fact.
    re: /worth (knowing|recording|mentioning|recognising|recognizing|raising|a thought)\b/i,
    hit: "two properties worth knowing before the cutover",
    // "worth reading" and quantity uses ("a copy's worth of WAL") stay legal.
    miss: "the migration guide is worth reading before the window",
  },
  {
    name: "honest-gap-label",
    // "the honest gap" as prose is the house move (state what is real, then
    // the gap); "Honest gap:" as a label stamp is announce-before-stating.
    re: /honest gap:/i,
    hit: "Honest gap: no per-service egress bytes",
    miss: "and one honest gap - no per-service egress bytes in the API",
  },
  {
    name: "the-fix-colon",
    // Line-anchored: "The fix: X" is a colon-headline stamp; "The fix is to X"
    // and "The fix was moving X" are ordinary sentences and stay legal.
    re: /^The fix:\s/,
    hit: "The fix: disable the UCI-managed service.",
    miss: "The fix is to convert text to outlines before handoff.",
  },
  { name: "dive-into", re: /\b(dive|deep dive) into\b/i, hit: "let us dive into the schema" },
  { name: "in-todays", re: /in today's\b/i, hit: "in today's cloud landscape" },
  { name: "heres-the-thing", re: /here's the thing/i, hit: "here's the thing about replication" },
  { name: "end-of-the-day", re: /at the end of the day/i, hit: "at the end of the day it is DNS" },
  { name: "when-it-comes-to", re: /when it comes to/i, hit: "when it comes to pooling" },
  { name: "testament-to", re: /testament to/i, hit: "a testament to the design" },
  { name: "harness-the-power", re: /harness the power/i, hit: "harness the power of RLS" },
  {
    name: "navigate-complexities",
    re: /navigate the complexities/i,
    hit: "navigate the complexities of tenancy",
  },
  {
    name: "plays-a-role",
    re: /plays a (key|crucial|vital|central) role/i,
    hit: "the pooler plays a key role",
  },
  {
    name: "sentence-initial-connective",
    // Anchored, because mid-sentence "additionally wants" is ordinary English and
    // is in the corpus. Only the sentence-initial connective is the tell.
    re: /^(Furthermore|Moreover|Additionally)[ ,]/,
    hit: "Additionally, the pooler drops.",
    miss: "the branch additionally wants a direct connection",
  },
  // AGENTS.md house-style bans: rating your own points, and the SmartyPants
  // en-dash trap.
  { name: "the-big-win", re: /the big win/i, hit: "the big win is fewer round trips" },
  {
    name: "the-big-one",
    re: /\bthe big one(s)?\b/i,
    hit: "the big one is the schema restore",
    miss: "one of the big pieces is the reconfiguration",
  },
  { name: "the-nasty-one", re: /the nasty one/i, hit: "the nasty one is DNS" },
  { name: "the-trap-that", re: /the trap that/i, hit: "the trap that bites last is MTU" },
  {
    name: "the-trap-label",
    // The colon is what makes it a heading or TL;DR prefix. "That framing is
    // the trap." and "explaining the trap" are in the corpus without it, so a
    // bare-word ban would flag ordinary prose.
    re: /the trap\s*:/i,
    hit: "**The trap:** the pooler drops idle connections",
    miss: "that framing is the trap",
  },
  { name: "lock-it-in", re: /lock it in/i, hit: "lock it in before the cutover" },
  {
    name: "double-hyphen",
    re: / -- /,
    hit: "a -- b",
    // The defect that produced the fence-aware parser: the tenancy reference's
    // RLS policy carries " -- reads" as an ordinary SQL comment.
    miss: "```sql\nselect 1 -- reads\n```",
  },
  {
    // Three rows from the 2026-09-02 review passes on the measured Supabase
    // pages. Each is a shape a reviewer flagged more than once and a regex can
    // catch; the wording rule behind each is in the lab-writeup skill.
    name: "undated-earlier-run",
    // "an earlier run saw it ignored" - which run? Dates and module ids, not
    // relative time. "an earlier version of this paragraph" is legitimate
    // (two docs use it about their own history), so `version` is excluded.
    re: /\b(an|the) (earlier|later) (run|measurement|probe)\b/i,
    hit: "an earlier run saw it silently ignored",
    miss: "an earlier version of this paragraph said the opposite",
  },
  {
    name: "pass-band-as-measurement",
    // "within 15 s of the documented 400 s" quotes the test's tolerance as if
    // it were the observation; the observation was a 5 s tick.
    re: /\bwithin \d+ ?s of the documented\b/i,
    hit: "that is within 15 s of the documented 400 s figure",
    miss: "the cut fell within one 5 s tick; the module's pass band is 15 s",
  },
  {
    name: "unsourced-reported-to",
    // "is reported to corrupt" with no footnote reads as a non-public report
    // stream. Cite the public source or say what this battery was built to
    // look for.
    re: /\b(is|are|was|were) reported to\b/i,
    hit: "a path that is reported to corrupt function metadata",
    miss: "a public issue reports 138 of 237 functions absent",
  },
];

/**
 * Roots considered for the table and rejected, with the corpus usage that
 * rejected them. Asserted as non-findings so that adding one later fails here
 * first, next to the reason it was left out.
 */
export const REJECTED_MARKERS = [
  "order of leverage against a distant database",
  "the unlock combo is a keymap feature",
  "requires an elevated ephemeral ID score",
  // Candidates from the 2026-08-28 sweep, rejected: both phrasings appear in
  // pre-contract docs that are the author's own blog-era writing
  // (reference/homebrew-fraud-detection, guides/caddy-compose-waf), so a ban
  // would flag the voice the corpus calibrates against.
  "age-aware classification is the key insight",
  "the pre-commit hook deserves special mention",
];

export function markerLines(doc: Doc): { line: Line; name: string; marker: string }[] {
  const out: { line: Line; name: string; marker: string }[] = [];
  for (const l of doc.lines) {
    if (l.kind !== "prose") continue;
    for (const rule of LLM_MARKERS) {
      const m = rule.re.exec(l.proseNoCode);
      if (m) out.push({ line: l, name: rule.name, marker: m[0] });
    }
  }
  return out;
}
