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
const TENANT_MERGE = "guides/supabase-tenant-consolidation";
const PBKDF2 = "guides/pbkdf2-supabase-auth-migration";

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
      // Pinned after an edit split this heading in two, leaving "## Gotchas" plus a
      // stray " and lessons learned" paragraph. Nothing in the suite noticed,
      // because a section-presence regex for /Gotchas/ still matched the wreckage.
      // The SLUG is the sensitive part - it changes the moment the text does.
      "gotchas-and-lessons-learned",
      "what-carries-over-and-what-does-not",
    ],
    linksTo: [REGION],
    htmlContains: ["Manual checklist", "UI / API", "sbshift", "https://github.com/erfianugrah/sbshift"],
  },
  {
    doc: REGION,
    mustContain: [
      "fails two different ways",
      '400 "Bucket not found" = visibility not restored',
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
      // Measured 2026-08-04. The gateway left the architecture: placement is a
      // runtime lookup and ref-hiding is a project setting. A doc that drifts
      // back to "we would need a proxy" is asserting something disproven.
      "the discovery endpoint is enough",
      "vanity-subdomain/activate",
      // The rotation window belongs to the consumer's cache, not the issuer.
      // The earlier text let a reader blame publication lag and hope for a fix.
      "the window is the consumer's cache",
      // Promotion covers MFA-enrolled accounts, and the source identity has to
      // be retired explicitly or two projects issue for one tenant.
      "MFA travels",
      "refresh_token_not_found",
    ],
    mustNotContain: [
      // Both were true when written and are now measured false.
      "Neither approach was built or tested in this run",
      "Neither discovery endpoint nor gateway was built",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    linksTo: [CONSOLIDATION, REGION],
  },
  {
    doc: TENANT_MERGE,
    mustContain: [
      // The index is over the RAW column, so a SQL copy lands a second row for
      // one human and the login reaches either of them. This is the finding the
      // guide exists for and the easiest one to soften into "watch out for
      // duplicate emails".
      "users_email_partial_key",
      "two rows differing only by case",
      // A bulk insert is one statement: the conflict costs the customer, not the
      // row. Pinned because the number is what makes it land.
      "0 of 2",
      // Without this, an RLS write test reports an open hole as closed.
      "return=minimal",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    // Not MULTITENANT: that link is real but the doc is still a draft, and a pin
    // should not encode a state another change is in the middle of.
    linksTo: [TENANCY, PBKDF2],
  },
  {
    doc: PBKDF2,
    // The bcrypt row of the accepted-set table is what makes a
    // Supabase-to-Supabase merge cheap, and the 500 applies to formats GoTrue
    // cannot verify rather than to password_hash as such.
    mustContain: ["password_hash"],
    linksTo: [TENANT_MERGE],
  },
  {
    doc: MULTITENANT,
    mustContain: [
      // The gateway was removed from the architecture on 2026-08-04 after the
      // discovery endpoint carried a promotion with nothing in the data path.
      // These pins are inert while the doc is a draft (the built page does not
      // exist, so the pin suite skips it) and become live the moment it ships.
      "Placement discovery, not a gateway",
      "vanity subdomain",
      // Provisioning: healthy is not writable, measured over five projects.
      "131-159 s",
    ],
    mustNotContain: [
      "Gateway (stable facade)",
      // A "not yet tested" section listing three struck-through measured items
      // reads as though the work was never done. The strikethroughs went; the
      // history is one sentence now.
      "~~**The gateway**~~",
      // n=1 at 138 s was superseded by n=5 at 131-159 s, and for a while the
      // evidence table carried both as separate rows.
      "Create -> healthy = 138 s",
    ],
    sections: [/^#{2,3} .*(TL;DR|Decision)/m, /^#{2,3} .*Verified/m, /^#{2,3} .*design-only/m],
    // No linksTo: this doc is still a draft and links nowhere yet. The old bash
    // matrix asserted it linked to two guides and PASSED - by grepping built
    // HTML, where Starlight renders the whole sidebar on every page, so every
    // slug matches every page. Five cross-link checks could never fail.
  },
];

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
