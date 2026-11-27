/**
 * In-site anchors resolve. Built-html check (CHECK_BUILT): every internal link
 * with a fragment - `/guides/x/#heading` or a same-page `#heading` - must name
 * an `id` that exists on the target page. The source-level link test in
 * docs.test.ts only checks that the target DOC exists, so a renamed or removed
 * heading broke its inbound links silently (two found 2026-11-27 with lychee:
 * a CrowdSec section removed from k3s-traefik, and a `#two-tier-debit` that
 * was never a heading).
 *
 * Only links inside the doc body are checked; Starlight's own chrome (sidebar,
 * table of contents, skip links) is generated from the same headings.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CHECK_BUILT, COLLECTIONS, DIST } from "./lib/corpus";

function pages(): string[] {
  const out: string[] = [];
  for (const dir of COLLECTIONS) {
    const d = join(DIST, dir);
    if (!existsSync(d)) continue;
    for (const slug of readdirSync(d)) {
      const f = join(d, slug, "index.html");
      if (existsSync(f)) out.push(`/${dir}/${slug}/`);
    }
  }
  return out;
}

const ids = new Map<string, Set<string>>();
function idsOf(page: string): Set<string> | undefined {
  if (!ids.has(page)) {
    const f = join(DIST, page, "index.html");
    if (!existsSync(f)) return undefined;
    const html = readFileSync(f, "utf8");
    ids.set(page, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]!)));
  }
  return ids.get(page);
}

/** The doc body: Starlight wraps the rendered MDX in `.sl-markdown-content`. */
function body(html: string): string {
  const i = html.indexOf("sl-markdown-content");
  return i < 0 ? html : html.slice(i);
}

describe.skipIf(!CHECK_BUILT)("in-site anchors", () => {
  test("every fragment link names an id on its target page", () => {
    const broken: string[] = [];
    for (const page of pages()) {
      const html = body(readFileSync(join(DIST, page, "index.html"), "utf8"));
      for (const m of html.matchAll(/\bhref="(\/[^"#?]*)?#([^"]+)"/g)) {
        let target = m[1] ?? page;
        if (!target.endsWith("/")) target += "/";
        const frag = decodeURIComponent(m[2]!);
        if (frag.startsWith("user-content-fn") || frag.startsWith("footnote")) continue;
        const known = idsOf(target);
        if (!known) continue; // a missing page is docs.test.ts's job
        if (!known.has(frag)) broken.push(`${page} -> ${target}#${frag}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
