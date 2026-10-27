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
      // could not finish inside any sane timeout (lexicanum#31). The per-host
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
      const check = async (url: string, docs: string[]) => {
        let status = 0;
        for (const method of ["HEAD", "GET"] as const) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const res = await fetch(url, {
                method,
                redirect: "follow",
                signal: AbortSignal.timeout(15000),
                headers: { "user-agent": "lexicanum-link-check" },
              });
              status = res.status;
              if (status !== 429 || attempt === 1) break;
              // Rate limited: honour Retry-After once (capped), then retry.
              const wait = Math.min(Number(res.headers.get("retry-after")) || 10, 30);
              await new Promise((r) => setTimeout(r, wait * 1000));
            } catch {
              status = 0;
              break;
            }
          }
          if (status < 400 && status !== 0) break;
        }
        checked++;
        // A host still throttling after a retry is not evidence the page is gone.
        if (status === 429) limited.push(`${url} (${docs[0]})`);
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
      console.log(`checked ${checked} URLs on ${byHost.size} hosts; rate-limited (not counted dead): ${limited.length}`);
      for (const l of limited) console.log(`  429 ${l}`);
      expect(dead).toEqual([]);
    },
    { timeout: 900000 },
  );
});
