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
      // Hosts run in parallel, each host's URLs through a small pool: the corpus
      // cites ~1,000 URLs (900+ on github.com), and the old fully-serial loop
      // could not finish inside any sane timeout. The per-host
      // cap keeps the politeness that serial bought - no burst against one
      // host - which is what gets a runner rate-limited into false negatives.
      const byHost = new Map<string, [string, string[]][]>();
      for (const entry of all) {
        const host = new URL(entry[0]).host;
        byHost.set(host, [...(byHost.get(host) ?? []), entry]);
      }
      const dead: string[] = [];
      const limited: string[] = [];
      let checked = 0;
      // 429 and the gateway errors are the host saying "not now", not "gone":
      // github.com answered 112 cited URLs with 504 in one run (2026-11-09) while every one of them loaded in a browser.
      const TRANSIENT = new Set([429, 502, 503, 504]);
      const check = async (url: string, docs: string[]) => {
        let status = 0;
        for (const method of ["HEAD", "GET"] as const) {
          for (let attempt = 0; attempt < 3; attempt++) {
            let retryAfter = 0;
            try {
              const res = await fetch(url, {
                method,
                redirect: "follow",
                signal: AbortSignal.timeout(20000),
                headers: { "user-agent": "lexicanum-link-check" },
              });
              status = res.status;
              retryAfter = Number(res.headers.get("retry-after")) || 0;
            } catch {
              status = 0;
            }
            if (!(TRANSIENT.has(status) || status === 0) || attempt === 2) break;
            // Honour Retry-After (capped), else back off 5 s, 10 s.
            const wait = Math.min(retryAfter || 5 * (attempt + 1), 30);
            await new Promise((r) => setTimeout(r, wait * 1000));
          }
          if (status < 400 && status !== 0) break;
        }
        checked++;
        // A host still throttling after retries is not evidence the page is gone.
        if (TRANSIENT.has(status)) limited.push(`${status} ${url} (${docs[0]})`);
        else if (status === 0 || status >= 400) dead.push(`${status || "no response"} ${url} (${docs[0]})`);
      };
      const PER_HOST = 4;
      await Promise.all(
        [...byHost.values()].map(async (entries) => {
          let next = 0;
          const worker = async () => {
            while (next < entries.length) {
              const [url, docs] = entries[next++]!;
              await check(url, docs);
            }
          };
          await Promise.all(Array.from({ length: Math.min(PER_HOST, entries.length) }, worker));
        }),
      );
      console.log(`checked ${checked} URLs on ${byHost.size} hosts; throttled (not counted dead): ${limited.length}`);
      for (const l of limited) console.log(`  ${l}`);
      expect(dead).toEqual([]);
    },
    { timeout: 900000 },
  );
});
