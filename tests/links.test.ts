/**
 * External link reachability. Opt-in, because it is network-dependent and
 * therefore flaky by nature: a 503 from someone else's docs site is not a defect
 * in this repo, and gating the build on it would train everyone to ignore the
 * failure.
 *
 *   CHECK_LINKS=1 bun test tests/links.test.ts
 *
 * Every external http(s) URL cited by a non-draft doc is checked, rather than a
 * hand-maintained list of six - the old script's list had drifted to a subset of
 * one guide's citations while the corpus grew past twenty docs.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { COLLECTIONS, DOCS } from "./lib/corpus";

const ENABLED = process.env.CHECK_LINKS === "1";

function urls(): Map<string, string[]> {
  const byUrl = new Map<string, string[]>();
  for (const dir of COLLECTIONS) {
    const d = join(DOCS, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (!/\.mdx?$/.test(f)) continue;
      const text = readFileSync(join(d, f), "utf8");
      if (/^draft:\s*true/m.test(text)) continue;
      // Markdown link targets only: bare URLs inside fences are commands and
      // examples, not citations, and some are deliberately unreachable.
      for (const m of text.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) {
        const u = m[1]!.replace(/[.,]$/, "");
        byUrl.set(u, [...(byUrl.get(u) ?? []), `${dir}/${f}`]);
      }
    }
  }
  return byUrl;
}

describe.skipIf(!ENABLED)("external links", () => {
  const all = [...urls().entries()];

  test("the corpus cites external sources at all", () => {
    expect(all.length).toBeGreaterThan(10);
  });

  test(
    "every cited URL is reachable",
    async () => {
      const dead: string[] = [];
      // Serial with a short timeout: politeness to the hosts, and a parallel
      // burst is what gets a runner rate-limited into a false negative.
      for (const [url, docs] of all) {
        let status = 0;
        for (const method of ["HEAD", "GET"] as const) {
          try {
            const res = await fetch(url, {
              method,
              redirect: "follow",
              signal: AbortSignal.timeout(15000),
              headers: { "user-agent": "lexicanum-link-check" },
            });
            status = res.status;
            if (status < 400) break;
          } catch {
            status = 0;
          }
        }
        // 405 and 403 to a HEAD-hostile or bot-hostile host are not dead links.
        if (status === 0 || status >= 400) dead.push(`${status || "no response"} ${url} (${docs[0]})`);
      }
      expect(dead).toEqual([]);
    },
    { timeout: 300000 },
  );
});
