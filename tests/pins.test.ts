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
const SHARED = "guides/supabase-shared-tenancy";
const PROMOTION = "guides/supabase-tenant-promotion";
const MULTITENANT = "reference/supabase-multitenant-platform";
const TENANT_MERGE = "guides/supabase-tenant-consolidation";
const PBKDF2 = "guides/pbkdf2-supabase-auth-migration";
const OPCOST = "reference/supabase-platform-operation-cost";

const pins: Pin[] = [
  {
    doc: OPCOST,
    mustContain: [
      // Absorbed here from the docs that measured them, so the operation-cost
      // facts live in one place instead of inside whichever doc needed them
      // first. Provisioning came from the multi-tenant reference (n=5, median
      // 131 s); the paid-to-Free figure came from the org-consolidation guide,
      // where the instance is resized to Nano on arrival.
      "131-159 s",
      "75.2 s",
      // The restriction dwell is a chosen test parameter. Naming the caveat
      // without the value leaves the 62 s window unreconstructable.
      "60 s",
      // The probe timeout is 5 s and the sample loop is serial, so a path
      // failing BY TIMEOUT is sampled far coarser than the nominal interval.
      // The restart pooler window is the one number this applies to, and the
      // page argues about resolution, so the limit has to be on the page.
      "5000",
      // The whole point of the page: a single duration is the wrong shape.
      // If an edit ever softens this into "a restart takes about a minute",
      // the page has lost its argument.
      "the paths do not move together",
      // Every number on the page is unreadable without its sampling interval,
      // and n=1 is the honest caveat that stops it being read as a SLA.
      "500 ms",
      "n=1",
      // Measured, and the most counter-intuitive result here.
      "REST and Realtime never failed",
      // The dwell is a test parameter, not a platform property. Losing this
      // sentence turns a chosen constant into a published measurement.
      "artifact of the test",
      // Verbatim server strings - the reason they are worth logging is that
      // they differ per operation. Reworded, they stop being greppable.
      "EADDRNOTALLOWED",
      "terminating connection due to administrator command",
      // The upgrade row is absent for a structural reason, not an oversight.
      "deprecated and typed null",
      // The page is one account's observations, not a platform claim. Losing
      // either of these turns a measurement into an assertion about Supabase.
      "against my own organization",
      "not a claim about what anyone else would see",
      // The topology story predicts the ordering but was never inspected.
      "inference from the result, not something measured here",
    ],
    mustNotContain: [
      // duration_estimate_hours is the platform's published estimate. It is
      // NOT a measured outage, and this page exists to keep that distinction.
      "measured upgrade window",
      // Corrections checked against the lab that produced the numbers
      // (~/supabase-lab experiments/platform-downtime). Each of these shipped
      // and each is contradicted by the harness source or RUNLOG.
      //
      // The hypothesis table listed six; the lede and description said five.
      "and four related ones",
      "Five hypotheses",
      // sampler.ts sets t0 at SAMPLING START and dispatches the operation
      // inside the sampled window, so first-fail is dispatch-relative, not
      // response-relative. Also over-general: the restriction bit at 1 s while
      // the restart and both resizes bit at 2-3 s.
      "2-3 seconds after the API returned",
      // 207/196 is +5.6 %.
      "within 5 %",
      // Auth 131/75 = 1.75x but pooler 207/158 = 1.31x, and that pooler pair is
      // quoted in the same sentence.
      "cost roughly twice",
      // The restriction was run twice (RUNLOG: "zero failed samples, twice"),
      // so a blanket every-window-is-n=1 undercuts the one repeatability claim
      // the page actually has.
      "Every window is",
    ],
    sections: [/^## Evidence$/m, /^## Reading the numbers$/m],
    anchors: ["reading-the-numbers", "evidence"],
  },
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
    linksTo: [REGION, SHARED],
  },
  // The 694-line shared-tenancy-and-promotion guide was two guides: building the
  // shared tier, and moving one tenant off it. Its pins split by which half's
  // EXCLUSIVE line range the string came from, checked rather than guessed.
  // PGRST301 is pinned to both because it occurs in Part 1 (build) and Part 5
  // (promotion) independently, not only in the sections they shared.
  {
    doc: SHARED,
    mustContain: [
      // A shape the API accepts and never honours. Belongs with wiring the
      // trust, which is the only place a reader would try to use it.
      "custom_jwks",
      "PGRST301",
      "app_metadata",
    ],
    mustNotContain: [
      // True when written, measured false since. Inert here but kept as a
      // regression guard on both halves.
      "Neither approach was built or tested in this run",
      "Neither discovery endpoint nor gateway was built",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    // The two halves must reach each other. A split guide whose halves do not
    // cross-link is worse than the single doc was.
    linksTo: [PROMOTION, TENANT_MERGE],
  },
  {
    doc: PROMOTION,
    mustContain: [
      "PGRST301",
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
      "Neither approach was built or tested in this run",
      "Neither discovery endpoint nor gateway was built",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    linksTo: [SHARED, REGION],
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
    // This guide used to ask a GUIDE to "argue the case" for shared tenancy,
    // which is the reference's job - a symptom of the reference having had no
    // inbound links at all. The lede now routes all three ways: the reference
    // for the decision, the build guide for the tier this lands on, the
    // promotion guide for the opposite direction. Pinned so it cannot collapse
    // back into one link doing three jobs.
    linksTo: [MULTITENANT, SHARED, PROMOTION, PBKDF2],
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
      // Structure the reference skeleton requires and this doc lacked until it
      // shipped: an up-front summary and a closing decision diagram. TL;DR is a
      // bold label here rather than a heading, matching the exemplar, so the
      // sections regex below cannot see it - pin the literal.
      "**TL;DR:**",
      "Where should a tenant live?",
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
      // The doc framed itself as a reaction to a Supabase product - "hand-rolling
      // SfP" - which only parses for a reader who already knows the product. SfP
      // stays as a compared option and a branch of the decision tree; it stops
      // being the premise.
      "Hand-rolling",
      // Both labs that produced the proofs used `items` (41 occurrences in the
      // erfibase SFP lab, 34 in supabase-lab). `app_notes` appears in neither -
      // it was invented for the doc, so it misreported the table the live Data
      // API tests actually hit, and it made one pattern look like two across the
      // reference and the guides.
      "app_notes",
    ],
    sections: [
      /^#{2,3} .*(TL;DR|Decision)/m,
      /^#{2,3} .*Verified/m,
      /^#{2,3} .*design-only/m,
      // This doc is the entry point for the tenancy set and had no Related
      // section at all, which is why it had zero inbound links while three
      // guides competed to be the front door.
      /^## Related/m,
    ],
    // linksTo was off here with a note that the old bash matrix grepped built
    // HTML - where Starlight renders the whole sidebar on every page, so every
    // slug matched and the check could never fail. That rationale is stale: this
    // implementation tests the SOURCE text, and it was canaried to confirm it
    // fails when a link is removed. The hub has to reach every doc it routes to.
    linksTo: [SHARED, PROMOTION, TENANT_MERGE, CONSOLIDATION, OPCOST],
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
