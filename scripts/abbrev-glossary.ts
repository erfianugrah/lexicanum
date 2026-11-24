#!/usr/bin/env bun
/**
 * abbrev-glossary - build data/abbreviations.json, the expansions the
 * first-use sweep inserts. A model proposes; nothing here rewrites prose, and
 * scripts/abbrev-fix.ts only ever inserts what this file holds.
 *
 *   sx OPENROUTER_API_KEY=OPENROUTER_API_KEY -- bun scripts/abbrev-glossary.ts [--redo] [--max N]
 *
 * Pass 1: every abbreviation with an unexplained first use gets up to 3 context
 * snippets (from different docs where possible) and the model answers one of
 *   EXPANSION  - what it stands for, with a plural form;
 *   WORD       - a capitalised word or brand name that stands for nothing;
 *   AMBIGUOUS  - the snippets show different meanings;
 *   UNKNOWN    - it cannot tell. Unknowns are listed, never guessed.
 * Pass 2, for AMBIGUOUS terms: one question per doc, with an excerpt around that
 * doc's first use, answered into `overrides`.
 * An answer the sweep could not insert safely (badExpansion) is dropped to UNKNOWN.
 * Existing entries are kept (hand fixes survive); --redo asks again for all.
 * Exit 2: the model could not be asked - nothing is written.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  GLOSSARY_PATH,
  badExpansion,
  corpusFiles,
  loadGlossary,
  unexpandedFirstUses,
  type Glossary,
  type TermEntry,
} from "../tests/lib/abbrev";
import { parseMdx } from "../tests/lib/mdx";
import { chatJson } from "./tell-review";

const MODEL = process.env.ABBREV_MODEL ?? "google/gemini-4-argon";
const DOCS = join(import.meta.dir, "../src/content/docs");
const BATCH = 35;

interface Use {
  doc: string;
  line: number;
  snippet: string;
}

const RULES = `Rules for an expansion:
- What the abbreviation stands for, in the words people say it: "application programming interface" for API. Lower case unless a proper noun or a product name ("Amazon Web Services", "Cloudflare Workers KV" stays as the product writes it).
- Short: at most 8 words, no explanation, no definition, no parentheses, no quotes, plain ASCII, none of $ < > { } | backtick [ ] * _.
- Use the meaning the snippets show, not the most famous one. In a networking doc PID is not a controller.
- "plural" is the plural of the expansion's last noun ("application programming interfaces"); "expansions" of an uncountable term repeat the expansion.`;

const SYSTEM1 = `You expand abbreviations for a technical documentation site. For each term you get up to 3 snippets from the docs where it is used.

For every term answer with one of these kinds:
- "EXPANSION": it stands for something; give "expansion" and "plural".
- "WORD": it is an ordinary word, brand name or status label written in capitals (HIT, MISS, NVIDIA, LOGIN) that does not stand for anything, or an SQL keyword. Product names that are acronyms of something (IBM, AMD, NASA) are EXPANSION.
- "AMBIGUOUS": the snippets show it meaning different things. List the meanings in "meanings".
- "UNKNOWN": you cannot tell what it stands for from your knowledge and the snippets. Never guess; UNKNOWN is the right answer for an invented or local name.

${RULES}

Answer JSON only: {"items":[{"term":"API","kind":"EXPANSION","expansion":"application programming interface","plural":"application programming interfaces"},{"term":"HIT","kind":"WORD"},{"term":"PID","kind":"AMBIGUOUS","meanings":["process ID","proportional-integral-derivative"]},{"term":"XQZ","kind":"UNKNOWN"}]}. One item per term, same spelling as the input.`;

const SYSTEM2 = `You expand one abbreviation for one document of a technical documentation site. You get the term, the document's title and an excerpt around the term's first use. Decide what it stands for IN THAT DOCUMENT.

${RULES}

Answer JSON only: {"expansion":"...","plural":"..."} or {"expansion":"UNKNOWN"} when the excerpt does not settle it. Never guess.`;

function snippet(raw: string, start: number, end: number): string {
  return raw.slice(Math.max(0, start - 110), Math.min(raw.length, end + 110)).replace(/\s+/g, " ").trim();
}

/** Up to 3 uses, from different docs where possible, first-use occurrences only. */
function pick(uses: Use[]): Use[] {
  const seen = new Set<string>();
  const out: Use[] = [];
  for (const u of uses) {
    if (seen.has(u.doc)) continue;
    seen.add(u.doc);
    out.push(u);
    if (out.length === 3) break;
  }
  return out;
}

function entry(o: Record<string, unknown>): TermEntry | null {
  const expansion = String(o.expansion ?? "").trim();
  if (!expansion || expansion === "UNKNOWN" || badExpansion(expansion)) return null;
  let plural = String(o.plural ?? "").trim();
  if (!plural || badExpansion(plural)) plural = expansion;
  return { expansion, plural };
}

async function main(argv: string[]): Promise<number> {
  const redo = argv.includes("--redo");
  const maxIdx = argv.indexOf("--max");
  const max = maxIdx >= 0 ? Number(argv[maxIdx + 1]) : Infinity;
  const g: Glossary = loadGlossary();

  // term -> uses (first-use occurrences that lack an explanation)
  const uses = new Map<string, Use[]>();
  const docRaw = new Map<string, string>();
  for (const f of corpusFiles(DOCS)) {
    const raw = readFileSync(join(DOCS, f), "utf8");
    docRaw.set(f, raw);
    const lines = raw.split("\n");
    for (const x of unexpandedFirstUses(parseMdx(f, raw), new Set(g.words))) {
      const l = lines[x.line - 1] ?? "";
      const list = uses.get(x.key) ?? [];
      list.push({ doc: f, line: x.line, snippet: snippet(l, x.start, x.end) });
      uses.set(x.key, list);
    }
  }

  const known = (k: string) => k in g.terms || g.words.includes(k) || g.unknown.includes(k) || g.ambiguous.includes(k);
  let todo = [...uses.keys()].filter((k) => redo || !known(k)).sort();
  todo = todo.slice(0, max);
  console.error(`${uses.size} unexplained terms, ${todo.length} to ask about`);

  try {
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      const user = batch
        .map((t) => `TERM ${t}\n` + pick(uses.get(t)!).map((u) => `  - [${u.doc}] ${u.snippet}`).join("\n"))
        .join("\n\n");
      const obj = await chatJson(MODEL, SYSTEM1, user, 8000);
      const items = Array.isArray(obj.items) ? (obj.items as Record<string, unknown>[]) : [];
      const byTerm = new Map(items.map((it) => [String(it.term), it]));
      for (const t of batch) {
        const it = byTerm.get(t);
        for (const list of [g.words, g.unknown, g.ambiguous]) {
          const at = list.indexOf(t);
          if (at >= 0) list.splice(at, 1);
        }
        delete g.terms[t];
        const kind = String(it?.kind ?? "UNKNOWN");
        if (kind === "WORD") g.words.push(t);
        else if (kind === "AMBIGUOUS") g.ambiguous.push(t);
        else if (kind === "EXPANSION") {
          const e = it ? entry(it) : null;
          if (e) g.terms[t] = e;
          else g.unknown.push(t);
        } else g.unknown.push(t);
      }
      console.error(`pass 1: ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
    }

    // Pass 2: per doc, for every ambiguous term that still has unexplained docs.
    for (const t of g.ambiguous) {
      for (const u of uses.get(t) ?? []) {
        if (g.overrides[u.doc]?.[t] && !redo) continue;
        const raw = docRaw.get(u.doc) ?? "";
        const lines = raw.split("\n");
        const title = parseMdx(u.doc, raw).frontmatter.title ?? u.doc;
        const excerpt = lines.slice(Math.max(0, u.line - 4), u.line + 3).join("\n").slice(0, 1400);
        const obj = await chatJson(MODEL, SYSTEM2, `TERM ${t}\nDOC ${u.doc} (${title})\n\n${excerpt}`, 1000);
        const e = entry(obj);
        const docOv = (g.overrides[u.doc] ??= {});
        if (e) docOv[t] = e;
        else {
          delete docOv[t];
          if (!g.unknown.includes(`${u.doc}:${t}`)) g.unknown.push(`${u.doc}:${t}`);
        }
      }
    }
  } catch (e) {
    console.error(`model failure, nothing written: ${e}`);
    return 2;
  }

  const sortObj = <T>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const out: Glossary = {
    terms: sortObj(g.terms),
    words: [...new Set(g.words)].sort(),
    overrides: sortObj(Object.fromEntries(Object.entries(g.overrides).map(([d, v]) => [d, sortObj(v)]))),
    ambiguous: [...new Set(g.ambiguous)].sort(),
    unknown: [...new Set(g.unknown)].sort(),
  };
  writeFileSync(GLOSSARY_PATH, JSON.stringify(out, null, 2) + "\n");
  const nOv = Object.values(out.overrides).reduce((n, v) => n + Object.keys(v).length, 0);
  console.log(
    `terms ${Object.keys(out.terms).length}, words ${out.words.length}, ambiguous ${out.ambiguous.length}, overrides ${nOv}, unknown ${out.unknown.length}`,
  );
  if (out.unknown.length) console.log("UNKNOWN: " + out.unknown.join(" "));
  return 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
