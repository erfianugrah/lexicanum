/**
 * Per-doc pins: the assertions that are true of ONE doc rather than of the
 * corpus.
 *
 * Two kinds live here.
 *
 * 1. Corrections that must not silently regress. Each `mustContain` string is a
 *    fact a previous revision of that doc got wrong, or a caveat someone will be
 *    tempted to trim. `mustNotContain` is the inverse: a claim that was removed
 *    because it was false, pinned so it cannot creep back.
 * 2. Structure another doc depends on. A guide that links to
 *    `#every-task-three-ways` breaks silently if that heading is renamed, so the
 *    anchor is asserted in the BUILT html, where the slug actually exists.
 *
 * These were the only checks in the old verify-docs.sh that were not either
 * duplicated by docs.test.ts or environment-shaped. Adding a pin is a row in a
 * table; the assertions are generic over it.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DOCS = join(ROOT, "src/content/docs");
const DIST = join(ROOT, "dist");

interface Pin {
  /** Path under src/content/docs, without extension. */
  doc: string;
  /** Substrings that must be present in the source. */
  mustContain?: string[];
  /** Substrings that must NOT be present in the source. */
  mustNotContain?: string[];
  /** Headings the doc type requires, as regexes against the source. */
  sections?: RegExp[];
  /** Anchor ids other docs link to, asserted in the built html. */
  anchors?: string[];
  /** Doc slugs this doc must link to. */
  linksTo?: string[];
  /** Substrings that must appear in the built html. */
  htmlContains?: string[];
}

const UPGRADE = "guides/supabase-postgres-major-upgrade-e2e";
const REGION = "guides/supabase-region-migration-e2e";
const CONSOLIDATION = "guides/supabase-org-consolidation";
const TENANCY = "guides/supabase-shared-tenancy-and-promotion";
const MULTITENANT = "reference/supabase-multitenant-platform";

const pins: Pin[] = [
  {
    doc: UPGRADE,
    mustContain: [
      // The manual fallback silently loses schema_migrations without this.
      "SELECT-only",
      "second pass the same day",
      "transfer separately here",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    anchors: [
      "path-b-cut-over-to-a-new-pg-17-project-with-sbshift",
      "optional-rehearse-pg_upgrade-itself-in-docker-sbshift-upgrade-lab",
      "measured-run-2026-07-30",
      "what-carries-over-and-what-does-not",
      "storage-metadata-copies-bytes-do-not",
      "every-task-three-ways",
    ],
    linksTo: [REGION],
    htmlContains: ["Manual checklist", "UI / API", "sbshift", "https://github.com/erfianugrah/sbshift"],
  },
  {
    doc: REGION,
    mustContain: [
      "fails two different ways",
      "400 'Bucket not found' = visibility not restored".replace(/'/g, '"'),
      "schedules do not carry",
      "bucket metadata does not arrive at all",
      "max_rows=777",
      "re-plans the schema",
      "## Every task, three ways",
    ],
    // Removed because the two failure modes ARE distinguishable in the listing.
    mustNotContain: ["the dashboard listing looks complete either way"],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    anchors: ["measured-run-2026-07-30"],
    linksTo: [UPGRADE],
  },
  {
    doc: CONSOLIDATION,
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    linksTo: [REGION, TENANCY],
  },
  {
    doc: TENANCY,
    mustContain: [
      // The shape the API accepts and never honours, and the control that makes
      // the portability result mean anything. Both were hard-won.
      "custom_jwks",
      "PGRST301",
      "app_metadata",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    linksTo: [CONSOLIDATION, REGION],
  },
  {
    doc: MULTITENANT,
    sections: [/^#{2,3} .*(TL;DR|Decision)/m, /^#{2,3} .*Verified/m, /^#{2,3} .*design-only/m],
    // No linksTo: this doc is still a draft and links nowhere yet. The old bash
    // matrix asserted it linked to two guides and PASSED - by grepping built
    // HTML, where Starlight renders the whole sidebar on every page, so every
    // slug matches every page. Five cross-link checks could never fail.
  },
];

const source = (doc: string) => {
  for (const ext of [".mdx", ".md"]) {
    const p = join(DOCS, `${doc}${ext}`);
    if (existsSync(p)) return { path: p, text: readFileSync(p, "utf8") };
  }
  return undefined;
};
const html = (doc: string) => {
  const p = join(DIST, doc, "index.html");
  return existsSync(p) ? readFileSync(p, "utf8") : undefined;
};

describe.each(pins.map((p) => [p.doc, p] as const))("%s", (_name, pin) => {
  const src = source(pin.doc);
  const isDraft = /^draft:\s*true/m.test(src?.text ?? "");

  test("the pinned doc exists", () => {
    // A pin for a doc that was renamed or deleted is a stale pin, and silence
    // about it is how a whole group of checks stops checking.
    expect(src, `no source found for ${pin.doc}`).toBeDefined();
  });

  test.skipIf(!src)("contains every pinned correction", () => {
    const missing = (pin.mustContain ?? []).filter((s) => !src!.text.includes(s));
    expect(missing).toEqual([]);
  });

  test.skipIf(!src)("does not reintroduce a removed claim", () => {
    const back = (pin.mustNotContain ?? []).filter((s) => src!.text.includes(s));
    expect(back).toEqual([]);
  });

  test.skipIf(!src)("has the sections its doc type requires", () => {
    const missing = (pin.sections ?? []).filter((re) => !re.test(src!.text)).map(String);
    expect(missing).toEqual([]);
  });

  test.skipIf(!src)("links to the docs it is supposed to link to", () => {
    const missing = (pin.linksTo ?? []).filter((t) => !src!.text.includes(`/${t}`));
    expect(missing).toEqual([]);
  });

  // Anchors and rendered assertions need the build. A draft has no page, and
  // that is legitimate rather than a failure.
  const built = isDraft ? undefined : html(pin.doc);

  test.skipIf(!built)("keeps the anchors other docs link to", () => {
    const missing = (pin.anchors ?? []).filter((a) => !built!.includes(`id="${a}"`));
    expect(missing).toEqual([]);
  });

  test.skipIf(!built)("renders the pinned html content", () => {
    const missing = (pin.htmlContains ?? []).filter((s) => !built!.includes(s));
    expect(missing).toEqual([]);
  });

  test.skipIf(!built)("renders exactly one References heading", () => {
    // A custom rehype pass renames GFM's "Footnotes" to "References"; two would
    // mean the pass ran over a heading the author also wrote by hand.
    const n = (built!.match(/<h2[^>]*>References/g) ?? []).length;
    expect(n).toBeLessThanOrEqual(1);
  });

  test.skipIf(!built || !src)("renders every footnote definition the source declares", () => {
    // Derived from the source, not a hardcoded count: the old bash check pinned
    // a magic number and broke on the next commit that added a citation.
    const declared = new Set(
      [...src!.text.matchAll(/^\[\^([A-Za-z0-9-]+)\]:/gm)].map((m) => m[1]!),
    );
    const rendered = new Set(
      [...built!.matchAll(/id="user-content-fn-([A-Za-z0-9-]+)"/g)].map((m) => m[1]!),
    );
    const missing = [...declared].filter((d) => !rendered.has(d));
    expect(missing).toEqual([]);
  });
});
