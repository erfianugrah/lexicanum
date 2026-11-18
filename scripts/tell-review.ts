#!/usr/bin/env bun
/**
 * tell-review - flag machine-written sentence shapes in doc prose with a model.
 *
 *   bun scripts/tell-review.ts FILE...          review every prose paragraph
 *   bun scripts/tell-review.ts --changed [REV]  only paragraphs touched since REV
 *                                               (default HEAD, working tree incl.)
 *
 * Exit 0: no flags. Exit 1: flags (the CI job blocks the deploy on this).
 * Exit 2: the model could not be asked or answered garbage - fail closed.
 *
 * The regex rows in tests/lib/mdx.ts (LLM_MARKERS) catch words and fixed
 * phrases inside the build. This catches the shapes a regex cannot decide -
 * announce-before-stating sentences, aphorisms, self-grading, metaphors - which
 * on 2026-11-18 a page passed every other gate carrying about 20 of.
 *
 * A flag that a person judges wrong is silenced for that doc with an MDX
 * comment holding the quote, which does not render:
 *   {/* tells-ok: exact quoted text *\/}
 *
 * Model and endpoint: TELL_MODEL (default google/gemini-4-argon), TELL_ENDPOINT
 * (default OpenRouter chat completions), key in OPENROUTER_API_KEY.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Doc, parseMdx } from "../tests/lib/mdx";

export interface Para {
  /** 1-indexed first line. */
  line: number;
  /** Every 1-indexed line the paragraph spans. */
  lines: number[];
  text: string;
}

export interface Flag {
  file: string;
  line: number;
  kind: string;
  quote: string;
  rewrite: string;
}

export const KINDS = new Set([
  "negative-parallelism",
  "announce-before-stating",
  "aphorism",
  "self-grading",
  "significance-inflation",
  "participle-tail",
  "rhythm-triplet",
  "mystery-tease",
  "metaphor",
  "self-narration",
  "vouching",
  "fragment-punch",
]);

/** Lines that are prose to the parser but not running text to a reader. */
const NOT_RUNNING = /^\s*(\||#|import\s|export\s|<|\[\^[^\]]+\]:|:::|\{)/;
const LIST_ITEM = /^\s*([-*+]|\d+\.)\s/;

/** Running-text paragraphs: blank lines, non-prose lines and list items end one. */
export function paragraphs(doc: Doc): Para[] {
  const out: Para[] = [];
  let cur: Para | null = null;
  const flush = () => {
    if (cur && cur.text.trim().split(/\s+/).length >= 4) out.push(cur);
    cur = null;
  };
  for (const l of doc.lines) {
    const running = l.kind === "prose" && l.raw.trim() !== "" && !NOT_RUNNING.test(l.raw);
    if (!running) {
      flush();
      continue;
    }
    if (LIST_ITEM.test(l.raw)) flush();
    const text = l.raw.trim();
    if (cur) {
      (cur as Para).lines.push(l.n);
      (cur as Para).text += ` ${text}`;
    } else {
      cur = { line: l.n, lines: [l.n], text };
    }
  }
  flush();
  return out;
}

/** Quotes a person has cleared for this doc. */
export function allowedQuotes(raw: string): string[] {
  return [...raw.matchAll(/\{\/\*\s*tells-ok:\s*([\s\S]*?)\s*\*\/\}/g)].map((m) =>
    norm((m[1] ?? "").replace(/^["']|["']$/g, "")),
  );
}

export function norm(s: string): string {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** New-side line numbers per file from `git diff -U0` output. */
export function changedLines(diff: string): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  let file: string | null = null;
  for (const line of diff.split("\n")) {
    const f = line.match(/^\+\+\+ (?:b\/)?(.+)$/);
    if (f) {
      file = f[1] === "/dev/null" ? null : (f[1] ?? null);
      if (file && !out.has(file)) out.set(file, new Set());
      continue;
    }
    const h = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (h && file) {
      const start = Number(h[1]);
      const count = h[2] === undefined ? 1 : Number(h[2]);
      for (let i = 0; i < count; i++) out.get(file)?.add(start + i);
    }
  }
  return out;
}

export function touched(paras: Para[], changed: Set<number>): Para[] {
  return paras.filter((p) => p.lines.some((n) => changed.has(n)));
}

/** Keep a model flag only if its quote is really in the paragraph it names and nobody cleared it. */
export function accept(raw: unknown, file: string, paras: Para[], allowed: string[]): Flag | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const kind = String(r.kind ?? "");
  const quote = String(r.quote ?? "");
  if (!KINDS.has(kind) || quote.trim().length < 4) return null;
  const q = norm(quote);
  // The model's line number is a hint; the quote decides which paragraph it is.
  const hit =
    paras.find((p) => p.line === Number(r.line) && norm(p.text).includes(q)) ??
    paras.find((p) => norm(p.text).includes(q));
  if (!hit) return null;
  if (allowed.some((a) => a && (q.includes(a) || a.includes(q)))) return null;
  return { file, line: hit.line, kind, quote, rewrite: String(r.rewrite ?? "") };
}

/** Paragraph batches small enough for one request each. */
export function batches(paras: Para[], maxChars = 12000): Para[][] {
  const out: Para[][] = [];
  let cur: Para[] = [];
  let size = 0;
  for (const p of paras) {
    if (cur.length && size + p.text.length > maxChars) {
      out.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(p);
    size += p.text.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

const PROMPT = readFileSync(join(import.meta.dir, "tell-review-prompt.md"), "utf8");
const MODEL = process.env.TELL_MODEL ?? "google/gemini-4-argon";
const ENDPOINT = process.env.TELL_ENDPOINT ?? "https://openrouter.ai/api/v1/chat/completions";

export class ModelError extends Error {}

/**
 * One JSON-mode chat call. Retries 429/5xx and unparseable answers; throws
 * ModelError when it cannot get a usable object, so callers fail closed.
 */
export async function chatJson(model: string, system: string, user: string, maxTokens = 4000): Promise<Record<string, unknown>> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ModelError("OPENROUTER_API_KEY is not set");
  const body = {
    model,
    temperature: 0,
    seed: 7,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180_000),
      });
      const text = await res.text();
      if (!res.ok) {
        last = `HTTP ${res.status}: ${text.slice(0, 200)}`;
        if (res.status === 429 || res.status >= 500) {
          await Bun.sleep(2000 * (attempt + 1));
          continue;
        }
        throw new ModelError(last);
      }
      const content = String(JSON.parse(text)?.choices?.[0]?.message?.content ?? "");
      const json = content.replace(/^\s*```(?:json)?/, "").replace(/```\s*$/, "");
      const obj = JSON.parse(json);
      if (!obj || typeof obj !== "object") throw new Error("answer is not an object");
      return obj as Record<string, unknown>;
    } catch (e) {
      if (e instanceof ModelError) throw e;
      last = String(e);
      await Bun.sleep(2000 * (attempt + 1));
    }
  }
  throw new ModelError(`no usable answer after 3 attempts (${last})`);
}

export async function ask(group: Para[]): Promise<unknown[]> {
  const obj = await chatJson(MODEL, PROMPT, group.map((p) => `L${p.line}: ${p.text}`).join("\n\n"));
  if (!Array.isArray(obj.flags)) throw new ModelError("answer has no flags array");
  return obj.flags;
}

export async function reviewFile(file: string, only?: Set<number>): Promise<Flag[]> {
  const raw = readFileSync(file, "utf8");
  let paras = paragraphs(parseMdx(file, raw));
  if (only) paras = touched(paras, only);
  const allowed = allowedQuotes(raw);
  const flags: Flag[] = [];
  for (const group of batches(paras)) {
    for (const r of await ask(group)) {
      const f = accept(r, file, group, allowed);
      if (f && !flags.some((g) => g.line === f.line && norm(g.quote) === norm(f.quote))) flags.push(f);
    }
  }
  return flags.sort((a, b) => a.line - b.line);
}

function git(args: string[]): string {
  const p = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
  if (p.exitCode !== 0) throw new ModelError(`git ${args.join(" ")}: ${p.stderr.toString().trim()}`);
  return p.stdout.toString();
}

async function main(argv: string[]): Promise<number> {
  let jobs: { file: string; only?: Set<number> }[] = [];
  let concurrency = 4;
  let jsonOut: string | null = null;
  const files: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (a === "--changed") {
      const rev = argv[i + 1] && !argv[i + 1]?.startsWith("-") ? argv[++i] : "HEAD";
      const diff = git(["diff", "-U0", rev ?? "HEAD", "--", "src/content/docs"]);
      for (const [file, lines] of changedLines(diff)) {
        if (/\.mdx?$/.test(file) && lines.size) jobs.push({ file, only: lines });
      }
    } else if (a === "--concurrency") concurrency = Number(argv[++i]);
    else if (a === "--json") jsonOut = argv[++i] ?? null;
    else if (a === "-h" || a === "--help") {
      console.log(readFileSync(import.meta.path, "utf8").split("*/")[0]);
      return 0;
    } else files.push(a);
  }
  jobs = jobs.concat(files.map((file) => ({ file })));
  if (!jobs.length) {
    console.error("tell-review: no docs to review");
    return 0;
  }

  const all: Flag[] = [];
  const queue = [...jobs];
  let failed: string | null = null;
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      for (let job = queue.shift(); job && !failed; job = queue.shift()) {
        try {
          all.push(...(await reviewFile(job.file, job.only)));
        } catch (e) {
          failed = `${job.file}: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
    }),
  );
  if (failed) {
    console.error(`tell-review: ${failed}`);
    return 2;
  }
  all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  for (const f of all) console.log(`${f.file}:${f.line}: ${f.kind}: "${f.quote}"\n    -> ${f.rewrite}`);
  if (jsonOut) await Bun.write(jsonOut, `${JSON.stringify(all, null, 2)}\n`);
  console.error(
    `tell-review: ${all.length} flag(s) in ${jobs.length} doc(s) (${MODEL})` +
      (all.length ? "; reword, or clear a wrong flag with {/* tells-ok: <quote> */} in that doc" : ""),
  );
  return all.length ? 1 : 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
