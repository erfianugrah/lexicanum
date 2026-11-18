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
import { CHECK_BUILT, readBuilt, readSource } from "./lib/corpus";
import { pins } from "./lib/pins";


describe.each(pins.map((p) => [p.doc, p] as const))("%s", (_name, pin) => {
  const src = readSource(pin.doc);
  const isDraft = /^draft:\s*true/m.test(src?.text ?? "");

  test("the pinned doc exists", () => {
    // A pin for a doc that was renamed or deleted is a stale pin, and silence
    // about it is how a whole group of checks stops checking.
    expect(src, `no source found for ${pin.doc}`).toBeDefined();
  });

  test.skipIf(!src || !pin.mustContain?.length)("contains every pinned correction", () => {
    const missing = (pin.mustContain ?? []).filter((s) => !src!.text.includes(s));
    expect(missing).toEqual([]);
  });

  test.skipIf(!src || !pin.mustNotContain?.length)("does not reintroduce a removed claim", () => {
    const back = (pin.mustNotContain ?? []).filter((s) => src!.text.includes(s));
    expect(back).toEqual([]);
  });

  test.skipIf(!src || !pin.sections?.length)("has the sections its doc type requires", () => {
    const missing = (pin.sections ?? []).filter((re) => !re.test(src!.text)).map(String);
    expect(missing).toEqual([]);
  });

  test.skipIf(!src || !pin.linksTo?.length)("links to the docs it is supposed to link to", () => {
    const missing = (pin.linksTo ?? []).filter((t) => !src!.text.includes(`/${t}`));
    expect(missing).toEqual([]);
  });

  // A draft has no page, which is legitimate rather than a failure. readBuilt
  // returns undefined outside the post-build pass (see CHECK_BUILT in lib/corpus).
  const built = isDraft ? undefined : readBuilt(pin.doc);

  test.skipIf(!built || !pin.anchors?.length)("keeps the anchors other docs link to", () => {
    const missing = (pin.anchors ?? []).filter((a) => !built!.includes(`id="${a}"`));
    expect(missing).toEqual([]);
  });

  test.skipIf(!built || !pin.htmlContains?.length)("renders the pinned html content", () => {
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

// Every lab-backed Supabase page ends in practices (lab-writeup skill, "Every
// lab-backed page ends in practices"). The audit of 2026-09-03 added the section
// to 34 pages; a rewrite that drops it regresses the page to measurements only.
// Two pages carry the practices under an older heading and are pinned to it.
const PRACTICES_HEADING = /^## What to do about it$/m;
const practicePages: Array<[doc: string, heading: RegExp]> = [
  ["guides/mongodb-wrapper-archive-migration", PRACTICES_HEADING],
  ["guides/postgres-corpus-entity-graph", PRACTICES_HEADING],
  ["guides/supabase-auth-mfa-trusted-device-and-impersonation-audit", PRACTICES_HEADING],
  ["guides/supabase-aws-privatelink-tofu", PRACTICES_HEADING],
  ["guides/supabase-branch-detach-git-link", PRACTICES_HEADING],
  ["guides/supabase-edge-function-bff-fanout", PRACTICES_HEADING],
  ["guides/supabase-grafana-monitoring", PRACTICES_HEADING],
  ["guides/supabase-iap-data-api", PRACTICES_HEADING],
  ["guides/supabase-management-api-logs-endpoint", /^## Traps, each measured$/m],
  ["guides/supabase-org-consolidation", PRACTICES_HEADING],
  ["guides/supabase-own-postgrest", PRACTICES_HEADING],
  ["guides/supabase-per-project-cost-attribution", PRACTICES_HEADING],
  ["guides/supabase-platform-management-api", PRACTICES_HEADING],
  ["guides/supabase-postgres-major-upgrade-e2e", PRACTICES_HEADING],
  ["guides/supabase-preview-branch-compute", PRACTICES_HEADING],
  ["guides/supabase-region-migration-e2e", PRACTICES_HEADING],
  ["guides/supabase-resilience-runbook", PRACTICES_HEADING],
  ["guides/supabase-shared-tenancy", PRACTICES_HEADING],
  ["guides/supabase-tenant-consolidation", PRACTICES_HEADING],
  ["guides/supabase-tenant-promotion", PRACTICES_HEADING],
  ["reference/cloudflare-supabase-architecture", PRACTICES_HEADING],
  ["reference/pbkdf2-supabase-auth-migration", PRACTICES_HEADING],
  ["reference/pgmig-logical-replication-migrator", PRACTICES_HEADING],
  ["reference/postgres-entity-graphs", PRACTICES_HEADING],
  ["reference/postgres-redundant-writes", PRACTICES_HEADING],
  ["reference/rls-without-supabase-auth", PRACTICES_HEADING],
  ["reference/sqlite-edge-vs-supabase-postgres", PRACTICES_HEADING],
  ["reference/stripe-sync-engine", PRACTICES_HEADING],
  ["reference/supabase-auth-end-to-end", PRACTICES_HEADING],
  ["reference/supabase-auth-users-locks", PRACTICES_HEADING],
  ["reference/supabase-aws-privatelink", PRACTICES_HEADING],
  ["reference/supabase-branching-two-projects-one-repo", PRACTICES_HEADING],
  ["reference/supabase-compute-disk", /^## Ops playbook$/m],
  ["reference/supabase-data-api-capacity", PRACTICES_HEADING],
  ["reference/supabase-data-residency", PRACTICES_HEADING],
  ["reference/supabase-data-surface-lockdown", PRACTICES_HEADING],
  ["reference/supabase-dr-tiers", PRACTICES_HEADING],
  ["reference/supabase-edge-function-limits", /^## What to do about each ceiling$/m],
  ["reference/supabase-image-transformations-billing", PRACTICES_HEADING],
  ["reference/supabase-incident-resilience", PRACTICES_HEADING],
  ["reference/supabase-logs-volume", PRACTICES_HEADING],
  ["reference/supabase-multi-tenant-placement", PRACTICES_HEADING],
  ["reference/supabase-pg-cron-behaviour", PRACTICES_HEADING],
  ["reference/supabase-pg-net-under-load", PRACTICES_HEADING],
  ["reference/supabase-pgjdbc-poolers", PRACTICES_HEADING],
  ["reference/supabase-platform-operation-cost", PRACTICES_HEADING],
  ["reference/supabase-read-replicas", PRACTICES_HEADING],
  ["reference/supabase-rls-policy-cost", PRACTICES_HEADING],
  ["reference/supabase-wrapper-delete-scope", PRACTICES_HEADING],
];

describe.each(practicePages)("%s ends in practices", (doc, heading) => {
  const src = readSource(doc);
  test("exists in the source tree", () => {
    expect(src).toBeDefined();
  });
  test.skipIf(!src)("carries a practices section", () => {
    expect(heading.test(src!.text)).toBe(true);
  });
});
