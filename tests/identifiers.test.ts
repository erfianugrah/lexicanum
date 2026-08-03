/**
 * Identifier hygiene: account ids and throwaway project refs must never reach
 * src/.
 *
 * This is the one genuinely environment-shaped check in the suite - the list is
 * not in the repo, because publishing the list of strings that must not be
 * published defeats the exercise. It comes from BANNED_IDENTIFIERS (CI secret)
 * or BANNED_IDENTIFIERS_FILE (a local file outside the repo).
 *
 * An absent list is a FAILURE, not a skip. The check it replaces spent weeks
 * reporting a cheerful PASS on a runner where the list was unset.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const DEFAULT_FILE = join(homedir(), ".config/lexicanum/banned-identifiers");

function bannedList(): { terms: string[]; from: string } {
  const env = process.env.BANNED_IDENTIFIERS?.trim();
  if (env) return { terms: env.split(/\s+/).filter(Boolean), from: "BANNED_IDENTIFIERS" };
  const file = process.env.BANNED_IDENTIFIERS_FILE || DEFAULT_FILE;
  if (existsSync(file)) {
    const terms = readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    return { terms, from: file };
  }
  return { terms: [], from: "nowhere" };
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else out.push(p);
  }
  return out;
}

describe("identifier hygiene", () => {
  const { terms, from } = bannedList();

  test("a list of banned identifiers is available", () => {
    expect(
      terms.length,
      `no banned identifiers found (looked at BANNED_IDENTIFIERS, then ${
        process.env.BANNED_IDENTIFIERS_FILE || DEFAULT_FILE
      }). This check is mandatory: set one.`,
    ).toBeGreaterThan(0);
  });

  test.skipIf(terms.length === 0)(`no banned identifier appears in src/ (list from ${from})`, () => {
    const files = sourceFiles(SRC);
    const hits: string[] = [];
    for (const f of files) {
      let text: string;
      try {
        text = readFileSync(f, "utf8");
      } catch {
        continue; // binary asset
      }
      for (const t of terms) {
        // Report the file and a prefix only - the point is to keep the value out
        // of CI logs, which are as public as the repo.
        if (text.includes(t)) hits.push(`${f.replace(ROOT, "")}: ${t.slice(0, 6)}...`);
      }
    }
    expect(hits).toEqual([]);
  });
});
