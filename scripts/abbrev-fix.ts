#!/usr/bin/env bun
/**
 * abbrev-fix - explain each abbreviation at its first use, deterministically.
 *
 *   bun scripts/abbrev-fix.ts [--dry-run] (--all | FILE...)
 *
 * For every first use tests/lib/abbrev.ts flags, inserts ` (expansion)` right
 * after the token (after its plural s), taking the expansion from
 * data/abbreviations.json: the doc's override if there is one, else the term's
 * entry (plural form for a plural token). The `ABBR (expansion)` form only, so
 * the word before the token never changes. No model touches prose here.
 *
 * A file is written only when ALL of these hold, otherwise it is left as it was
 * and reported:
 *   - removing the inserted strings from the new text gives the old text, byte
 *     for byte (so nothing but insertions happened);
 *   - every insertion sits in a prose line that is not a heading or a footnote
 *     definition, outside frontmatter, fences and comments;
 *   - every expansion passes badExpansion (no `$`, `<`, `{`, smart punctuation);
 *   - the new text still parses as MDX, and every string pinned for the doc in
 *     tests/lib/pins.ts is still present;
 *   - re-running the check on the new text leaves only terms the glossary
 *     cannot expand.
 * Terms with no glossary entry (unknown, ambiguous without an override) are
 * listed, not guessed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  badExpansion,
  corpusFiles,
  loadGlossary,
  unexpandedFirstUses,
  type Glossary,
  type TermEntry,
} from "../tests/lib/abbrev";
import { mdxSyntaxError, parseMdx } from "../tests/lib/mdx";
import { pins } from "../tests/lib/pins";

const DOCS = join(import.meta.dir, "../src/content/docs");

export interface Insertion {
  /** Offset in the OLD text. */
  at: number;
  text: string;
  key: string;
  line: number;
}

export interface FixResult {
  file: string;
  insertions: Insertion[];
  /** Terms flagged but not expandable from the glossary. */
  unresolved: string[];
  /** Set when the file was refused; nothing is written. */
  refused?: string;
  next?: string;
  /**
   * Pinned strings (tests/lib/pins.ts mustContain) an insertion landed inside,
   * with the same insertion applied, so the pin keeps guarding the same sentence.
   */
  pinMoves?: { from: string; to: string }[];
}

/** The pinned string with every insertion that falls strictly inside it applied. */
export function followPin(old: string, pin: string, ins: Insertion[]): string | null {
  const o = old.indexOf(pin);
  if (o < 0 || old.indexOf(pin, o + 1) >= 0) return null; // absent or not unique: refuse
  let out = pin;
  for (const i of [...ins].sort((a, b) => b.at - a.at)) {
    if (i.at > o && i.at < o + pin.length) out = out.slice(0, i.at - o) + i.text + out.slice(i.at - o);
  }
  return out;
}

export function entryFor(g: Glossary, rel: string, key: string): TermEntry | undefined {
  return g.overrides[rel]?.[key] ?? g.terms[key];
}

/** The old text recovered from the new one by removing each insertion. */
export function removeInsertions(next: string, ins: Insertion[]): string | null {
  // Position of each insertion in the NEW text, then remove from the end so
  // earlier positions stay valid.
  let shift = 0;
  const at = [...ins]
    .sort((a, b) => a.at - b.at)
    .map((i) => {
      const p = { pos: i.at + shift, text: i.text };
      shift += i.text.length;
      return p;
    });
  let out = next;
  for (const p of at.reverse()) {
    if (out.slice(p.pos, p.pos + p.text.length) !== p.text) return null;
    out = out.slice(0, p.pos) + out.slice(p.pos + p.text.length);
  }
  return out;
}

export function fixOnce(rel: string, old: string, g: Glossary): FixResult {
  const doc = parseMdx(rel, old);
  const words = new Set(g.words);
  const starts: number[] = [];
  let pos = 0;
  for (const l of old.split("\n")) {
    starts.push(pos);
    pos += l.length + 1;
  }
  const insertions: Insertion[] = [];
  const unresolved: string[] = [];
  for (const f of unexpandedFirstUses(doc, words)) {
    const e = entryFor(g, rel, f.key);
    if (!e) {
      unresolved.push(f.key);
      continue;
    }
    const expansion = f.plural ? (e.plural ?? e.expansion) : e.expansion;
    const bad = badExpansion(expansion);
    if (bad) return { file: rel, insertions: [], unresolved, refused: `${f.key}: ${bad}` };
    const at = starts[f.line - 1]! + f.end;
    // Two terms in one compound (AES-GCM) share the insertion point: one
    // parenthetical, expansions in reading order, joined by '; '.
    const same = insertions.find((i) => i.at === at);
    if (same) {
      same.text = same.text.slice(0, -1) + `; ${expansion})`;
      same.key += `+${f.key}`;
    } else insertions.push({ at, text: ` (${expansion})`, key: f.key, line: f.line });
  }
  const res: FixResult = { file: rel, insertions, unresolved };
  if (insertions.length === 0) return res;

  // Apply right to left so earlier offsets stay valid.
  let next = old;
  for (const i of [...insertions].sort((a, b) => b.at - a.at)) next = next.slice(0, i.at) + i.text + next.slice(i.at);

  if (removeInsertions(next, insertions) !== old) return { ...res, refused: "removing the insertions does not give the old file" };
  for (const i of insertions) {
    const line = doc.lines[i.line - 1]!;
    if (line.kind !== "prose" || /^\s{0,3}#{1,6}\s/.test(line.raw) || /^\[\^[^\]]+\]:/.test(line.raw)) {
      return { ...res, refused: `${i.key} at line ${i.line} is not in a plain prose line` };
    }
  }
  const syntax = mdxSyntaxError(next);
  if (syntax && !mdxSyntaxError(old)) return { ...res, refused: `new text does not parse as MDX: ${syntax}` };
  const slug = rel.replace(/\.mdx?$/, "");
  const pinMoves: { from: string; to: string }[] = [];
  for (const p of pins.filter((x) => x.doc === slug)) {
    // htmlContains strings that also appear in the source follow their sentence too.
    for (const s of [...(p.mustContain ?? []), ...(p.htmlContains ?? [])]) {
      if (!old.includes(s) || next.includes(s)) continue;
      const to = followPin(old, s, insertions);
      if (!to || !next.includes(to)) return { ...res, refused: `pinned string no longer present: ${s.slice(0, 60)}` };
      pinMoves.push({ from: s, to });
    }
  }
  return { ...res, next, pinMoves };
}

/**
 * Run the insertion pass until nothing is left to insert (at most 4 rounds):
 * an insertion can move a term's first use (a compound's new explanation now
 * holds an earlier occurrence), which only the next round sees. Each round is
 * checked as above; the rounds' insertions are then re-verified together
 * against the original text, so the whole result is still insertions only.
 */
export function fixSource(rel: string, old: string, g: Glossary): FixResult {
  const words = new Set(g.words);
  let cur = old;
  const all: Insertion[] = [];
  const moves: { from: string; to: string }[] = [];
  let unresolved: string[] = [];
  for (let round = 0; round < 4; round++) {
    const r = fixOnce(rel, cur, g);
    unresolved = r.unresolved;
    if (r.refused) return { file: rel, insertions: [], unresolved, refused: r.refused };
    if (!r.next) break;
    // Map this round's offsets (in `cur`) back to offsets in `old`.
    const prior = [...all];
    for (const i of r.insertions) all.push({ ...i, at: toOldOffset(prior, i.at) });
    for (const m of r.pinMoves ?? []) {
      const prev = moves.find((x) => x.to === m.from);
      if (prev) prev.to = m.to;
      else moves.push(m);
    }
    cur = r.next;
  }
  const left = unexpandedFirstUses(parseMdx(rel, cur), words).map((f) => f.key);
  const stuck = left.filter((k) => !unresolved.includes(k));
  if (stuck.length) return { file: rel, insertions: [], unresolved, refused: `still flagged after the fix: ${stuck.join(" ")}` };
  if (all.length === 0) return { file: rel, insertions: [], unresolved };
  // Insertions at the same old offset from different rounds apply in round order.
  if (applyAll(old, all) !== cur || removeInsertions(cur, all) !== old) {
    return { file: rel, insertions: [], unresolved, refused: "removing the insertions does not give the old file" };
  }
  return { file: rel, insertions: all, unresolved, next: cur, pinMoves: moves };
}

/** An offset in the text after earlier rounds' insertions, mapped to the original text. */
function toOldOffset(prior: Insertion[], at: number): number {
  let shift = 0;
  for (const p of [...prior].sort((a, b) => a.at - b.at)) {
    // A prior insertion counts when it sits at or before `at` in the current text.
    if (p.at + shift + p.text.length <= at) shift += p.text.length;
    else if (p.at + shift >= at) break;
    else throw new Error("insertion inside an earlier insertion");
  }
  return at - shift;
}

/** Apply insertions to the original text; same-offset ones keep their order in the list. */
function applyAll(old: string, ins: Insertion[]): string {
  const sorted = ins.map((x, k) => ({ ...x, k })).sort((a, b) => a.at - b.at || a.k - b.k);
  let out = "";
  let pos = 0;
  for (const i of sorted) {
    out += old.slice(pos, i.at) + i.text;
    pos = i.at;
  }
  return out + old.slice(pos);
}

/** Rewrite each moved pin's string literal in tests/lib/pins.ts (exactly one match each, or refuse). */
export function applyPinMoves(src: string, moves: { from: string; to: string }[]): string | string[] {
  const errs: string[] = [];
  let out = src;
  for (const m of moves) {
    const lit = JSON.stringify(m.from);
    const n = out.split(lit).length - 1;
    if (n !== 1) {
      errs.push(`${n} literal matches for pin ${lit.slice(0, 60)}`);
      continue;
    }
    out = out.replace(lit, JSON.stringify(m.to));
  }
  return errs.length ? errs : out;
}

function main(argv: string[]): number {
  const dry = argv.includes("--dry-run");
  const rest = argv.filter((a) => !a.startsWith("--"));
  const files = argv.includes("--all") ? corpusFiles(DOCS) : rest.map((f) => relative(DOCS, resolve(f)).split("\\").join("/"));
  if (files.length === 0) {
    console.error("usage: abbrev-fix.ts [--dry-run] (--all | FILE...)");
    return 2;
  }
  const g = loadGlossary();
  let n = 0;
  let written = 0;
  let refused = 0;
  const moves: { from: string; to: string }[] = [];
  const unresolved = new Map<string, number>();
  for (const rel of files) {
    const path = join(DOCS, rel);
    const old = readFileSync(path, "utf8");
    const r = fixSource(rel, old, g);
    for (const k of r.unresolved) unresolved.set(k, (unresolved.get(k) ?? 0) + 1);
    if (r.refused) {
      refused++;
      console.error(`REFUSED ${rel}: ${r.refused}`);
      continue;
    }
    if (!r.next) continue;
    n += r.insertions.length;
    if (!dry) writeFileSync(path, r.next);
    moves.push(...(r.pinMoves ?? []));
    written++;
  }
  if (moves.length) {
    const pinsPath = join(import.meta.dir, "../tests/lib/pins.ts");
    const res = applyPinMoves(readFileSync(pinsPath, "utf8"), moves);
    if (Array.isArray(res)) {
      for (const e of res) console.error(`PIN ${e}`);
      refused++;
    } else if (!dry) writeFileSync(pinsPath, res);
    console.log(`${dry ? "would move" : "moved"} ${moves.length} pinned strings in tests/lib/pins.ts`);
  }
  console.log(`${dry ? "would insert" : "inserted"} ${n} expansions in ${written} files, ${refused} refused`);
  if (unresolved.size) {
    console.log(`unresolved (${unresolved.size} terms): ` + [...unresolved].sort().map(([k, v]) => `${k}x${v}`).join(" "));
  }
  return refused ? 1 : 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
