#!/usr/bin/env bun
/**
 * tell-fix - rewrite the paragraphs tell-review flags, under mechanical guards.
 *
 *   bun scripts/tell-fix.ts [--dry-run] [--report out.json] FILE...
 *
 * For each flagged paragraph a second model family (TELL_FIX_MODEL, default
 * moonshotai/kimi-k3.1-pro) rewrites only what the flags name. A rewrite is
 * applied only when all of these hold, otherwise the paragraph is left as it
 * was and reported:
 *   - no string pinned for the doc in tests/lib/pins.ts disappears;
 *   - every number, backticked span, URL, link target and footnote reference
 *     in the paragraph is still there, the same number of times, and none is
 *     added (factTokens);
 *   - it keeps at least 60% of the paragraph's words, so a fix cannot
 *     delete the paragraph's content;
 *   - no smart punctuation, no " -- ", no bare "<" outside code;
 *   - the reviewer (tell-review's model) flags nothing in the new text, after
 *     at most two rewrite rounds.
 * A model that cannot be reached stops the run (exit 2) with no file written.
 *
 * Written 2026-11-18 (lexicanum#110) after free-form agent edits of the same
 * flags lost facts in 5 of 74 docs and cleared real tells with tells-ok.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseMdx } from "../tests/lib/mdx";
import { pins } from "../tests/lib/pins";
import { type Para, ModelError, accept, allowedQuotes, ask, batches, chatJson, paragraphs } from "./tell-review";

const FIX_MODEL = process.env.TELL_FIX_MODEL ?? "moonshotai/kimi-k3.1-pro";

const FIX_PROMPT = `You edit one paragraph of a technical documentation site to remove sentence shapes that mark it as machine-written. The house voice is plain and subtractive: state the fact with its number, never announce a point before making it, never grade your own point, no maxims or slogans.

You get the paragraph and a list of flags, each with a kind and the exact text it refers to. Change only what the flags require. Every sentence not named by a flag stays word for word.

How to fix each kind:
- announce-before-stating: delete the announcing sentence or colon clause when the following text already carries the content; otherwise fold its one real fact into the next sentence.
- aphorism, self-grading, significance-inflation, vouching, fragment-punch: replace with the concrete fact it stands for, or delete it when the paragraph already states that fact.
- negative-parallelism: state what is true; keep a contrast only as a plain clause ("X, but Y") when the negated thing is a real alternative the reader would assume.
- participle-tail: delete the tail or make it its own sentence with a fact.
- rhythm-triplet: keep only the items that are true and distinct.
- metaphor: say the literal thing.
- self-narration, mystery-tease: state the content directly.

Hard rules:
- Keep every number, date, version, backticked span, URL, markdown link and footnote reference (like [^slug]) exactly as written, the same number of times. Do not add any new ones.
- Keep markdown formatting (bold, italics, links, inline code) on the words that keep it.
- ASCII punctuation only: "-" not an em or en dash, straight quotes, never " -- ". British -ise spelling in words you write.
- Do not introduce new shapes from the list above.

Reply with JSON only: {"paragraph": "<the full rewritten paragraph>"}`;

const TOKEN = /`[^`\n]+`|\]\([^)\s]+\)|https?:\/\/[^\s)>\]]+|\[\^[A-Za-z0-9_-]+\]|\d[\d.,]*\d|\d/g;

/** The facts a rewrite may not lose or invent, as a sorted multiset. */
export function factTokens(text: string): string[] {
  return (text.match(TOKEN) ?? []).sort();
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
}

/** Pinned strings for a doc path (tests/lib/pins.ts): a rewrite must keep each one it touches. */
export function pinnedFor(file: string): string[] {
  const doc = file.replace(/^.*src\/content\/docs\//, "").replace(/\.mdx?$/, "");
  return pins.filter((p) => p.doc === doc).flatMap((p) => p.mustContain ?? []);
}

/** Why a rewrite must not be applied, or null when it passes every guard. */
export function guard(before: string, after: string, pinned: string[] = []): string | null {
  const flat = (t: string) => t.replace(/\s+/g, " ");
  if (pinned.some((pin) => flat(before).includes(flat(pin)) && !flat(after).includes(flat(pin)))) return "removes a pinned string";
  // An announcing line with no facts of its own ("Three details carry the
  // weight:") may go entirely; anything with a fact in it may not.
  if (!after.trim()) return factTokens(before).length === 0 && words(before).length <= 25 ? null : "empty rewrite";
  if (factTokens(before).join("\u0000") !== factTokens(after).join("\u0000")) return "facts changed";
  const kept = new Set(words(after));
  const old = words(before);
  if (old.length && old.filter((w) => kept.has(w)).length / old.length < 0.6) return "kept under 60% of words";
  if (/[\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/.test(after)) return "smart punctuation";
  if (/ -- /.test(after)) return "double hyphen";
  if (/<(?![^`]*`)/.test(after.replace(/`[^`]*`/g, ""))) return "bare <";
  return null;
}

/** Split a list marker off a paragraph so the model sees text only. */
export function splitMarker(text: string): [string, string] {
  const m = text.match(/^(\s*(?:[-*+]|\d+\.)\s+)/);
  return m ? [m[1] ?? "", text.slice(m[0].length)] : ["", text];
}

/** Lay the new text out like the old: one line if it was one line, else wrapped to its width. */
export function layout(oldLines: string[], marker: string, text: string): string[] {
  if (oldLines.length === 1) return [marker + text];
  const width = Math.max(60, ...oldLines.map((l) => l.length));
  const indent = " ".repeat(marker.length);
  const out: string[] = [];
  let line = marker;
  for (const w of text.split(/\s+/)) {
    const lead = out.length === 0 ? marker : indent;
    if (line.length > lead.length && (line + " " + w).length > width) {
      out.push(line);
      line = indent + w;
    } else line = line.length > lead.length ? `${line} ${w}` : line + w;
  }
  out.push(line);
  return out;
}

interface Outcome {
  file: string;
  line: number;
  status: "fixed" | "skipped";
  reason?: string;
  kinds: string[];
}

async function fixParagraph(file: string, p: Para, flags: { kind: string; quote: string }[]): Promise<{ text: string | null; reason?: string }> {
  const pinned = pinnedFor(file);
  const [marker, body] = splitMarker(p.text);
  let current = body;
  let pending = flags;
  for (let round = 0; round < 2; round++) {
    const user = `Paragraph:\n${current}\n\nFlags:\n${pending.map((f) => `- ${f.kind}: "${f.quote}"`).join("\n")}`;
    const out = String((await chatJson(FIX_MODEL, FIX_PROMPT, user, 3000)).paragraph ?? "").replace(/\s+/g, " ").trim();
    const why = guard(body, out, pinned);
    if (why) return { text: null, reason: why };
    const probe: Para = { line: p.line, lines: p.lines, text: out };
    const again = (await ask([probe]))
      .map((r) => accept(r, file, [probe], []))
      .filter((f): f is NonNullable<typeof f> => f !== null);
    if (!again.length) return { text: marker + out };
    current = out;
    pending = again;
  }
  return { text: null, reason: `still flagged: ${pending.map((f) => f.kind).join(", ")}` };
}

async function fixFile(file: string, dry: boolean): Promise<Outcome[]> {
  const raw = readFileSync(file, "utf8");
  const paras = paragraphs(parseMdx(file, raw));
  const allowed = allowedQuotes(raw);
  const byPara = new Map<number, { kind: string; quote: string }[]>();
  for (const group of batches(paras)) {
    for (const r of await ask(group)) {
      const f = accept(r, file, group, allowed);
      if (f) byPara.set(f.line, [...(byPara.get(f.line) ?? []), { kind: f.kind, quote: f.quote }]);
    }
  }
  const lines = raw.split("\n");
  const outcomes: Outcome[] = [];
  // Bottom-up so earlier line numbers stay valid while later paragraphs change length.
  for (const p of [...paras].reverse()) {
    const flags = byPara.get(p.line);
    if (!flags) continue;
    const kinds = flags.map((f) => f.kind);
    if (/^\s*>/.test(p.text)) {
      outcomes.push({ file, line: p.line, status: "skipped", reason: "blockquote", kinds });
      continue;
    }
    const { text, reason } = await fixParagraph(file, p, flags);
    if (text === null) {
      outcomes.push({ file, line: p.line, status: "skipped", reason, kinds });
      continue;
    }
    const oldLines = p.lines.map((n) => lines[n - 1] ?? "");
    const [marker, body] = splitMarker(text);
    if (!body.trim()) {
      // Deleted paragraph: also drop one blank line next to it.
      const after = p.line - 1 + p.lines.length;
      const extra = (lines[after] ?? "x").trim() === "" ? 1 : 0;
      lines.splice(p.line - 1, p.lines.length + extra);
    } else lines.splice(p.line - 1, p.lines.length, ...layout(oldLines, marker, body));
    outcomes.push({ file, line: p.line, status: "fixed", kinds });
  }
  if (!dry && outcomes.some((o) => o.status === "fixed")) writeFileSync(file, lines.join("\n"));
  return outcomes.reverse();
}

async function main(argv: string[]): Promise<number> {
  const dry = argv.includes("--dry-run");
  const ri = argv.indexOf("--report");
  const report = ri >= 0 ? argv[ri + 1] : null;
  const files = argv.filter((a, i) => !a.startsWith("--") && !(ri >= 0 && i === ri + 1));
  const all: Outcome[] = [];
  for (const f of files) {
    try {
      const o = await fixFile(f, dry);
      all.push(...o);
      for (const x of o) console.log(`${x.file}:${x.line}: ${x.status} [${x.kinds.join(", ")}]${x.reason ? ` - ${x.reason}` : ""}`);
    } catch (e) {
      if (e instanceof ModelError) {
        console.error(`tell-fix: ${f}: ${e.message}`);
        return 2;
      }
      throw e;
    }
  }
  if (report) writeFileSync(report, `${JSON.stringify(all, null, 2)}\n`);
  const fixed = all.filter((o) => o.status === "fixed").length;
  console.error(`tell-fix: ${fixed} fixed, ${all.length - fixed} skipped, ${files.length} doc(s)${dry ? " (dry run)" : ""}`);
  return 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
