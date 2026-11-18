#!/usr/bin/env bun
/**
 * unbox-numbers - strip backticks from measured quantities in prose
 * (AGENTS.md backtick rule). Conservative: unboxes only
 *   - a number with a unit, spaced (`13.70 s`, `200 kHz`) or a multi-letter
 *     or symbol unit unspaced (`128KB`, `66.8%`, `24x`);
 *   - a number with a thousands comma (`8,651`);
 *   - a range of those (`4`-`128 ns` -> 4-128 ns).
 * Bare integers (`201`, `5432`, `0`) and unspaced durations (`30s`) stay
 * boxed: they are often status codes, ports or config literals.
 * Headings, fences, frontmatter and comments are left alone.
 *
 *   bun scripts/unbox-numbers.ts FILE...   (prints count per file)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseMdx } from "../tests/lib/mdx";

const SPACED = "(?:%|x|ms|us|ns|s|min|h|days?|B|KB|MB|GB|TB|KiB|MiB|GiB|TiB|kHz|MHz|GHz|Hz|MS/s|V|mV|A|mA|W|dBm|bytes?|bits/byte|ns/sample|rows|pages|ms/req|req/s|rps|tok/s)";
const TIGHT = "(?:%|x|KB|MB|GB|TB|KiB|MiB|GiB|TiB|kHz|MHz|GHz|Hz|mV|mA|dBm)";
const NUM = "~?\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|~?\\d+(?:\\.\\d+)?";
const QTY = `(?:(?:${NUM}) ${SPACED}|(?:${NUM})${TIGHT}|~?\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?)`;
const BARE = `(?:${NUM})`;
const RANGE = new RegExp("`(" + BARE + ")`-`(" + QTY + ")`", "g");
const ONE = new RegExp("`(" + QTY + ")`(?!`)", "g");

export function unbox(line: string): [string, number] {
  let n = 0;
  // Never touch a span that is part of a longer code run like `a`..`b`.
  let out = line.replace(RANGE, (_m, a, b) => (n++, `${a}-${b}`));
  out = out.replace(ONE, (m, q, off, s) => (s[off - 1] === "`" ? m : (n++, q)));
  return [out, n];
}

if (import.meta.main) {
  for (const p of process.argv.slice(2)) {
    const raw = readFileSync(p, "utf8");
    const doc = parseMdx(p, raw);
    let total = 0;
    const out = raw.split("\n").map((line, i) => {
      if (doc.lines[i]?.kind !== "prose" || /^\s*#/.test(line)) return line;
      const [l, n] = unbox(line);
      total += n;
      return l;
    });
    if (total) writeFileSync(p, out.join("\n"));
    console.log(`${total}\t${p}`);
  }
}
