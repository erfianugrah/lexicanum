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
        }
      } else if (m) {
        fenceMarker = m[1] ?? null;
        kind = "fence";
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
  let cur: { start: number; rows: number } | null = null;
  for (const l of lines) {
    const isRow = l.kind === "prose" && TABLE_ROW.test(l.raw);
    if (isRow) {
      if (!cur) cur = { start: l.n, rows: 0 };
      if (!TABLE_SEP.test(l.raw)) cur.rows++;
    } else if (cur) {
      tables.push({ startLine: cur.start, endLine: l.n - 1, rowCount: cur.rows });
      cur = null;
    }
  }
  if (cur) tables.push({ startLine: cur.start, endLine: lines.length, rowCount: cur.rows });

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
    footnoteRefs: [...refs],
    footnoteDefs: defs,
    internalLinks: [...internalLinks],
  };
}

/** Tables broken in half by a blank line, reported as the pair of runs. */
export function splitTables(doc: Doc): { first: Table; second: Table }[] {
  const out: { first: Table; second: Table }[] = [];
  for (let i = 0; i < doc.tables.length - 1; i++) {
    const a = doc.tables[i]!;
    const b = doc.tables[i + 1]!;
    const between = doc.lines.slice(a.endLine, b.startLine - 1);
    if (between.length === 0 || !between.every((l) => l.raw.trim() === "")) continue;
    // Adjacent tables separated only by a blank line are legitimate and render
    // fine - reference/caching.mdx has two in a row with different columns. The
    // discriminator is the separator row: every genuine table opens with one, so
    // a run that lacks it is the orphaned tail of a table a blank line cut in two.
    const secondHasSeparator = doc.lines
      .slice(b.startLine - 1, b.endLine)
      .some((l) => TABLE_SEP.test(l.raw));
    if (!secondHasSeparator) out.push({ first: a, second: b });
  }
  return out;
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
