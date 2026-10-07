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
const MULTITENANT = "reference/supabase-multi-tenant-placement";
const PLATFORM_MGMT = "guides/supabase-platform-management-api";
const TENANT_MERGE = "guides/supabase-tenant-consolidation";
const PBKDF2 = "reference/pbkdf2-supabase-auth-migration";
const OPCOST = "reference/supabase-platform-operation-cost";
const PRIVATELINK = "reference/supabase-aws-privatelink";
const PRIVATELINK_TOFU = "guides/supabase-aws-privatelink-tofu";
const MONTOPO = "reference/self-hosted-monitoring-topology";
const MONGUIDE = "guides/monitor-compose-postgres-prometheus";
const WEATHER = "guides/singapore-weather-ha-grafana";
const MEMSTORE = "reference/agent-memory-store";
const SBRESIDENCY = "reference/supabase-data-residency";
const FORGEJO = "reference/self-hosted-forgejo-router";
const AGENTGUARD = "reference/agent-secret-guard";
const PORTING_FORGEJO = "guides/porting-github-actions-to-forgejo";
const GH_ACTIONS_CF = "guides/gh-actions-cloudflare";
const FORGEJO_RUNNER = "reference/forgejo-actions-runner";
const WEBHOOKS_COMPOSER = "guides/forgejo-webhooks-composer-gitops";
const SECRETCTL = "reference/secretctl";
const SECRETCTL_ROTATION = "guides/secretctl-rotation";
const FLEET_MIGRATION = "guides/forgejo-primary-fleet-migration";
const FORGEJO_RELEASES = "reference/forgejo-releases-and-registry";
const STORAGE_BACKUPS_CACHE = "reference/forgejo-storage-backups-cache";
const RECOVERY_RUNBOOKS = "guides/forgejo-recovery-runbooks";
const SECRETCTL_REGISTRY_COVERAGE = "guides/secretctl-registry-and-coverage";
const CHOOSING_SECRETS_BACKEND = "reference/choosing-a-secrets-backend";
const SOPS_COMPOSE = "guides/sops-age-compose-stacks";

const pins: Pin[] = [
  // The two PrivateLink docs went unpinned through the corrections that made
  // them worth reading, and the gap showed: the evidence table said "5
  // API-triggered restarts" while its own prose described three by psql plus
  // three through a Lambda. That is the second time this table drifted from the
  // paragraph above it (RUNLOG run 7 records the first, where a partly-applied
  // multi-edit left the table quoting a ceiling the prose had already
  // corrected). Both docs publish numbers that moved repeatedly, so the pins
  // below are weighted toward the corrections and their caveats rather than
  // toward structure.
  {
    doc: PRIVATELINK,
    mustContain: [
      // The ceiling was published wrong three times - 200, then 213, then 287 -
      // each time because one measurement read as authoritative. All four
      // samples have to stay on the page: a reader who sees a single number
      // will size against it, which is the exact mistake this doc made.
      "174th, 213th, 213th, 287th and 288th",
      "Do not quote a precise ceiling from this.",
      "Size against the published number",
      // What actually reproduces. If the integers ever go, this must not.
      "queue, then refuse",
      // The page's own confession, and the reason the caveats above are not
      // hedging. Losing it turns a corrected doc back into a confident one.
      "wrong three times",
      // The 2026-08-07 re-measurement: both private paths sampled at 500ms on
      // one restart, and they did NOT move together (45s vs 60s, different
      // failure modes). This replaced a single-path probe whose 49-131s spread
      // was conflating the two. The methodology has to stay on the page with
      // the numbers - sustained recovery and a baseline gate are what make
      // these comparable with the operation-cost page's public-path figures,
      // and the earlier numbers were not.
      "direct 5432 down 45s",
      "the paths do not move together",
      "recovery counted only once success was sustained",
      // T24 disproved a claim this doc previously asserted from vendor docs:
      // that multi-VPC means an endpoint each or a Lattice service network.
      // A peered VPC reached the ORIGINAL endpoint given a PHZ association and
      // an SG rule. If this softens back, the doc is wrong again.
      "but it does not need one of its own either",
      // Confirmed over a transit gateway too, which is the transport that
      // actually matters - a peering mesh stops being practical past about
      // three VPCs. Attributed, not assumed: the run checked 0 active
      // peerings against 2 gateway attachments, because a stale peering
      // connection would have carried the traffic and made the pass empty.
      "It generalises to a transit gateway.",
      // The platform refuses to strand clients: an account cannot be removed
      // while any consumer attachment remains. This is why the "what happens
      // to live clients on removal" question has no answer - the state is
      // unreachable. Verbatim so it stays greppable by someone who hit it.
      "There are still Endpoint Associations attached",
      // 2026-08-07: the Dashboard Data API toggle turned out to BE db_schema,
      // which killed three claims here at once ("not equivalent", "remains a
      // Dashboard action", "not expressible in IaC"). Pinned because the
      // wrong version was load-bearing for the runbook advice.
      "the same lever",
      // The trap, and the reason the advice inverted. Off-then-on returns a
      // CONSTANT, so any project with extra exposed schemas loses them.
      "rewrites `db_schema` to the constant `public`",
      "the dashboard click is the destructive one",
      // What a client actually sees once a schema is dropped - greppable by
      // someone debugging it.
      "406 PGRST106",
      // eu-central-2 moved from asserted to measured. The control is the whole
      // value of the claim: same org, same day, section renders elsewhere.
      "no AWS PrivateLink entry",
      "Region is the only variable",
      // Create-time-only constraint. Read as "IPv6 unsupported" it costs an
      // endpoint replacement and a DNS event for every private client.
      "Build it dualstack from the start",
      // The finding that makes the association a permanent manual step. If this
      // softens, the guide's ops-procedure framing stops being justified.
      "reject personal access tokens (PATs) categorically",
    ],
    mustNotContain: [
      // Shipped, and wrong in the worst way: it agreed with the published
      // figure, so nothing looked suspicious. Four probes since gave four
      // different numbers.
      "at exactly 200",
      // Drift corrected 2026-08-07: the table said 5 restarts, the prose said
      // 3 + 3. Both are moot now that the per-path measurement replaced them,
      // but the string stays pinned out so a revert cannot resurrect it.
      "5 API-triggered restarts",
      // The claim T24 disproved. It was asserted from AWS documentation and
      // read as authoritative for months. Peering ALONE genuinely does not
      // carry the endpoint - but that does not make an endpoint-per-VPC or a
      // service network the only options, which is what this sentence said.
      "the options are one endpoint per VPC",
      // Three phrasings of the Data API claim disproved on 2026-08-07. The
      // last one told readers to prefer the dashboard click, which is the
      // destructive path - actively harmful advice, not merely stale. Both
      // cases are pinned out: the corpus normalised to lowercase "dashboard"
      // (171 vs 30 elsewhere) after these were written, so a revert could
      // reintroduce the claim in either form and one spelling would miss it.
      "remains a Dashboard action",
      "remains a dashboard action",
      "leave the config alone",
      "it is not equivalent",
    ],
    sections: [/^## Reading the numbers$/m, /^## Gotchas$/m, /^## Reproducing$/m],
    // Both are linked from the guide with a fragment, so renaming either
    // heading breaks an inbound link silently.
    anchors: ["what-the-off-switches-do", "gotchas"],
    linksTo: [PRIVATELINK_TOFU],
  },
  {
    doc: PRIVATELINK_TOFU,
    mustContain: [
      // The one-line gap in the official walkthrough. Symptom is a silent drop
      // on 6543 that reads as a platform fault, and the worst case is an app
      // falling back to the public pooler unnoticed.
      "5432 and 6543 inbound",
      // Not a slow apply - a plan error. Skipping it blocks the build.
      "two-pass",
      // A plan file is a zip embedding tfstate, so committing one publishes the
      // database password and the PAT however well the tfvars are encrypted.
      "Never commit a plan file.",
      // The caveat the lab accepts and a customer environment must not.
      "SSM retains command parameters",
      // Without contrib the benchmark phases exit 127 and a suite that greps
      // for numbers records zeros.
      "postgresql16-contrib",
      // The same four samples as the reference. The guide is read on its own by
      // anyone following the build, so the caveat cannot live only next door.
      "174, 213, 213, 287 and 288",
      "The pooler queues before it refuses.",
      // Verbatim AWS error. Reworded it stops being greppable by someone who
      // just hit it.
      "Modifying IpAddressType to DUALSTACK is not supported",
    ],
    mustNotContain: [
      // Was true when written, false by the time it was checked: the lists have
      // 7 entries in common, 3 only in the reference (all HTTP-tier) and 4 only
      // here (all build mechanics). A cross-reference that overstates what it
      // points at sends a reader looking for something that is not there.
      "carries the same list with the measured evidence inline",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [PRIVATELINK],
  },
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
      "path-b-cut-over-to-a-new-pg-17-project-with-pgmig",
      "optional-rehearse-pg_upgrade-itself-in-docker-pgmig-upgrade-lab",
      // Pre-rename slugs (sbshift -> pgmig, 2026-09-28), kept as explicit
      // <a id> anchors so links made before the rename still land.
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
    htmlContains: ["Manual checklist", "UI / API", "pgmig", "https://github.com/erfianugrah/pgmig"],
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
    doc: PLATFORM_MGMT,
    // The 2026-08-24 platform-plan correction: nano is the plan's create
    // default, not a gated catalogue variant. The pre-correction framing
    // ("Nano-only and gated") is forbidden so it cannot drift back in. This
    // doc had no pins at all until 2026-08-25 - the only one of the tenancy
    // four without them, and the one that missed the correction because of it.
    mustContain: ["the platform plan's create default"],
    mustNotContain: ["Scale-to-zero pricing is Nano-only and gated"],
    linksTo: [MULTITENANT],
  },
  {
    doc: CONSOLIDATION,
    // Retitled off "Consolidating Supabase accounts...", which read as a
    // near-twin of the tenant-consolidation guide's title while describing an
    // unrelated operation. The sidebar sorts by filename so the two were never
    // adjacent, but both being visible and both opening on "Consolidating" was
    // enough to confuse the two moves.
    mustContain: [
      // The 2026-08-24 platform-plan measurements, carried in the prose
      // rather than only in evidence rows - the 2026-08-25 review found the
      // table and the paragraphs asserting opposites.
      "provisions Nano by default",
      "accepted and echoed",
    ],
    mustNotContain: [
      "Consolidating Supabase accounts into one organization",
      // Both were true when written, measured false on 2026-08-24; each
      // contradicted a Measured row in this doc's own evidence table.
      "we could not test it on this account",
      "That is untested here and is",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    linksTo: [REGION, SHARED, MULTITENANT],
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
      // The lede's cost premise, qualified 2026-08-25: pausing exists on the
      // platform plan (measured 2026-08-24) and the premise holds because
      // that plan is gated, not because pausing is impossible.
      "The exception (the `platform` plan",
    ],
    mustNotContain: [
      // True when written, measured false since. Inert here but kept as a
      // regression guard on both halves.
      "Neither approach was built or tested in this run",
      "Neither discovery endpoint nor gateway was built",
      // The unqualified form of the premise. Measured false on a platform
      // org 2026-08-24 (this doc's own evidence row L371 said so while the
      // lede asserted it) - the qualified form scopes it to Pro/Team.
      "a project on a paid plan cannot be paused",
    ],
    sections: [/^#{2,3} .*Verification/m, /^#{2,3} .*Gotchas/m],
    // The two halves must reach each other. A split guide whose halves do not
    // cross-link is worse than the single doc was. MULTITENANT because every
    // guide in the set has to reach the doc that argues the decision - its
    // absence is what let a runbook get asked to argue one.
    linksTo: [PROMOTION, TENANT_MERGE, MULTITENANT],
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
    linksTo: [SHARED, REGION, MULTITENANT],
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
      // (This block once carried a note calling these pins inert because the doc
      // was a draft. It ships and builds; the note outlived the state it
      // described. Fourth stale rationale found in this file.)
      "Placement discovery, not a gateway",
      "vanity subdomain",
      // Provisioning: healthy is not writable, measured over five projects. The
      // method table for this now lives in the operation-cost reference; the
      // figure stays here because the cost comparison is this doc's own argument.
      "131-159 s",
      // Why the two directions cannot share a mechanism. Without this the doc
      // reads as though one of the guides picked the wrong approach.
      "cannot carry a session",
      // Structure the reference skeleton requires
      // (anchor pinned below: both migration guides deep-link to this section) and this doc lacked until it
      // shipped: an up-front summary and a closing decision diagram. TL;DR is a
      // bold label here rather than a heading, matching the exemplar, so the
      // sections regex below cannot see it - pin the literal.
      "**TL;DR:**",
      "Where should a tenant live?",
      // The provenance paragraph must own the 2026-08-24 platform-plan
      // measurements; "five dates" silently excluded the newest and most
      // load-bearing rows.
      "six dates",
    ],
    mustNotContain: [
      "Gateway (stable facade)",
      "They span five dates",
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
      // The first version of "Moving users between projects" claimed both guides
      // "rest on the same four primitives" and prescribed the admin API over a
      // SQL copy. Both halves are false: promotion does a SQL copy of
      // auth.users + identities + sessions + refresh_tokens ON PURPOSE, because
      // the admin API mints a user but cannot carry the refresh token that user
      // is holding, and promotion's whole claim is zero re-logins. The error was
      // in the task spec, so the loop implemented it faithfully and the judge
      // validated against it - no sensor can catch a wrong specification.
      "the same four primitives",
      "Move users through the admin API, not a SQL copy",
      // Unsourced commercial speculation about the SfP programme's pricing.
      // The SfP page mentions no fee; the claim appeared in prose with only
      // the page itself cited. Dropped 2026-08-27 per the cited-or-proven rule.
      "platform fee",
      // The fee claim's hedged replacement - a commercial claim has no business
      // in the cited-or-measured corpus at all, hedged or not.
      "pays off at your scale",
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
    // Both migration guides deep-link here to explain why they use opposite
    // mechanisms. Renaming the heading silently breaks two inbound anchors.
    anchors: ["moving-users-between-projects"],
    // linksTo was off here with a note that the old bash matrix grepped built
    // HTML - where Starlight renders the whole sidebar on every page, so every
    // slug matched and the check could never fail. That rationale is stale: this
    // implementation tests the SOURCE text, and it was canaried to confirm it
    // fails when a link is removed. The hub has to reach every doc it routes to.
    linksTo: [SHARED, PROMOTION, TENANT_MERGE, CONSOLIDATION, OPCOST],
  },
  {
    doc: "guides/wsl2-disk-reclaim",
    mustContain: [
      // The one-step-precondition the whole guide hangs on. An edit that
      // drops the trim-first rule turns the compact part into a no-op.
      "Trim before compact is non-negotiable",
      // The measured anchors. The guide is worth keeping because these are
      // real; without them it is a retelling of the Microsoft page.
      "860 GB to 150 GB",
      "~700 GB freed on C:",
      // The version gates a reader will size their attempt against.
      "WSL 2.3.11",
      // The honest verdict on sparse mode; rewording it into a
      // recommendation reverses the guide's advice.
      "sparse mode is not the answer",
    ],
    sections: [/^#{2,3} .*Verification$/m, /^## Gotchas and lessons learned$/m],
  },
  // 2026-08-10 monitoring + memory-store trio. These publish numbers that were
  // measured once, on one rig, during the deploy that produced them: the
  // throughput matrix in particular is the whole reason the memory-store page
  // is worth reading, and its inversion row (8 CPU slower than 4) is the part
  // a later editor would most plausibly "clean up" as a typo.
  {
    doc: MONTOPO,
    mustContain: [
      // The failure that motivated host mode. If this softens to "may not
      // work", the page stops being actionable.
      "policy-drop host",
      "answers on its bridge IP and nowhere else",
      // The measured series count is the proof the nft rule works end to end.
      "717",
      // The lock incident: an idempotent-looking DDL is not lock-free, and the
      // queue-blocking half is the part people do not know.
      "ACCESS EXCLUSIVE",
      "all new queries queued behind it",
      // The interval floor exists because panels went blank, not on taste.
      "holds one sample",
    ],
    mustNotContain: [
      // The k3s guide covers the orchestrated case; this page must keep
      // saying which case it is rather than claiming generality.
      "works the same on Kubernetes",
    ],
    sections: [/^## Evidence$/m, /^## Decision guide$/m, /^## Topology$/m],
    anchors: ["evidence", "decision-guide"],
  },
  {
    doc: MONGUIDE,
    mustContain: [
      // A guide that drops its verification step is a blog post.
      "docker exec prometheus wget",
      // The two floors, and why.
      "15s",
      "30s",
      // The single-source-address rule IS the access model here.
      "ip saddr 192.168.22.59",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m, /^## File reference$/m],
    linksTo: ["reference/self-hosted-monitoring-topology"],
  },
  {
    doc: MEMSTORE,
    mustContain: [
      // The inversion. Losing this row turns the matrix into "more cores is
      // faster", which is the opposite of what was measured.
      "8 CPU, 1 worker, batch 32 | 106",
      "inverted past four",
      // What actually scaled, and the mechanism that makes it safe.
      "FOR UPDATE SKIP",
      // The caveat that keeps a reader from sizing against one number.
      "content-dependent",
      "measure your own corpus",
      // The silent-worker incident and its one-line prevention.
      "never been created",
      "heartbeat",
      // Ingest correctness details that cost a live failure each.
      "PGRST102",
      "session rows have to land first",
    ],
    mustNotContain: [
      // The store holds session history, not a claim about model quality.
      "improves model accuracy",
    ],
    sections: [/^## Evidence$/m, /^## Topology$/m, /^## Reading the numbers$/m],
    anchors: ["evidence", "embedding-throughput-on-cpu"],
  },
  {
    doc: SBRESIDENCY,
    mustContain: [
      // The four measured claims. Each is re-runnable against the live
      // platform by .pi/sensors/residency-live.sh, and each was wrong or
      // absent in an earlier draft.
      "17 specific regions and 3 smart groups",
      "Need to use one of available regions",
      "x-sb-edge-region",
      "server: cloudflare",
      // Legal wording that three verification passes had to correct. The
      // carve-out is the difference between what the DPA promises and what
      // an earlier draft claimed it promised.
      "as necessary to provide Services requested by Customer",
      "projects that contain Customer's data",
      "possession, custody, or control",
      "Supabase Pte. Ltd",
      // The region pin's actual scope, and the surfaces outside it.
      "Postgres database, the Auth service, and Storage objects",
      // Pasal 20(2) reads and/or, and the committee sits in 20(4).
      "manage, process and/or store",
    ],
    mustNotContain: [
      // Quotation marks around words the security page does not contain.
      "at the CDN level via Cloudflare",
      // Legal conclusions this doc deliberately does not draw. If one comes
      // back, it needs a source that adjudicates it.
      "cannot answer a strict foreign-jurisdiction-exclusion",
      "Self-hosting is the only full answer",
      // The claim the Supabase for Platforms page contradicts.
      "Smart groups are not accepted by the public project-creation API",
    ],
    sections: [
      /^## The per-surface map$/m,
      /^## What the docs do not answer$/m,
      /^## Reading the numbers$/m,
    ],
  },
  {
    doc: "reference/postgres-entity-graphs",
    mustContain: [
      "The [working example](https://pggraph.erfi.dev)",
      "561 persons and 2284 organizations",
      "candidate-generation example",
      "not a production named-entity recognizer",
      "Not discoverable via the Management API.",
    ],
    mustNotContain: [
      "~/work/supabase-lab",
      "make up rebuilds",
      "the project bills",
      "Resumed 2026-08-11",
      "Cloudflare-side state",
    ],
    sections: [
      /^## Topology$/m,
      /^## Which traversal option$/m,
      /^## What the extension catalogue holds$/m,
      /^## Apache AGE and SQL\/PGQ$/m,
      /^## Extraction, and where it can run$/m,
      /^## Reading the numbers$/m,
      /^## Evidence$/m,
    ],
  },
  {
    // Public-reference anonymization: the generic names are the pinned state.
    // The original home identifiers (SSIDs, MACs, subnets, hostnames) live in
    // ~/.config/lexicanum/banned-identifiers, NOT here - this file is public.
    doc: "reference/home-iot-network",
    mustContain: [
      "SSID `home-iot`",
      "`pi-iot`",
      "pi-hub",
      "10.40.0.0/24",
      "cc:8d:a2:00:00:01",
      "cc:8d:a2:00:00:04",
      "PVID 40",
    ],
    sections: [
      /^## Topology$/m,
      /^## The segment design$/m,
      /^## The adoption path that works$/m,
      /^## Reading the numbers$/m,
      /^## What generalises$/m,
    ],
  },
  {
    // Pinned 2026-08-16 after the W09-W24 measured round landed: these are
    // the claims most likely to rot back into the pre-measurement versions
    // (auth replication "untested", failover on 5xx-only, cache-buster
    // forwarded to the origin).
    doc: "reference/supabase-incident-resilience",
    mustContain: [
      // The W14 boundary - the single most-cited correction of the round
      // (was "untested" / the disproved worker-ceiling hypothesis).
      "do not replicate at any tested size",
      "max_worker_processes` is 6 on both",
      // W24: the 403 wrap as a failover trip condition (was >=500-only).
      "failover condition",
      // Review-round corrections: rotate-after, reader gating, the
      // standby/logical-corruption asymmetry, the SLA plan axis, the
      // Class 6 re-scope, usage-vs-plan gating, Team-severity precision.
      "rotate the secret after any break-glass use",
      "Which classes apply to you",
      "replicates the mistake in 34ms",
      "99.9% per product per month",
      "is a commercial decision, not an incident class",
      "USAGE-gated, not plan-gated",
      "business-hours limits start at High",
      // Public links, not machine-relative paths (this is a public site).
      "github.com/erfianugrah/supabase-lab",
    ],
    linksTo: ["guides/supabase-resilience-runbook", "reference/supabase-dr-tiers"],
  },
  {
    // The commercial half (PITR / backups / Fair Use / cost), keyed on
    // RPO/RTO/spend. Every number below is doc-cited in footnotes; the pins
    // are the figures a pricing page change would silently invalidate.
    doc: "reference/supabase-dr-tiers",
    mustContain: [
      // The PITR price ladder - the most-quoted commercial fact on the page.
      "~\\$100, ~\\$200 or ~\\$400 per month for 7, 14 or 28 days",
      // The two restore traps most likely to be forgotten mid-incident.
      "Enabling PITR stops the daily backups",
      "only the Realtime slot is exempted and handled",
      // Fair Use: the signature and the org-wide scope.
      "402",
      "projects paused, databases switched to read-only, new launches blocked",
      // The SLA section is the canonical contract text (plan axis + credits).
      "The uptime SLA is Enterprise-only",
    ],
    sections: [
      /^## The tiers on one axis$/m,
      /^## Class zero: your own billing state$/m,
      /^## Which do I pick$/m,
    ],
    linksTo: [
      "reference/supabase-incident-resilience",
      "guides/supabase-resilience-runbook",
    ],
  },
  {
    doc: "guides/supabase-resilience-runbook",
    mustContain: [
      // 4.2: the measured negative replaces the old "untested" hedge.
      "zero changes stream at any tested size",
      // 4.2: the backfill path. This pin used to guard "not portable via the
      // admin API" (W09, 2026-08-15); tenant-consolidation C03 (2026-08-04)
      // had already measured the admin API accepting a bcrypt password_hash
      // with the original password working, and the end-to-end auth
      // reference (2026-09-02) reconciled the two. The corrected sentence is
      // pinned so the retracted claim cannot come back.
      "accepts the source's bcrypt `password_hash`",
      // 4.2: the enterprise IdP escape hatch.
      "is an external IdP",
      // 4.1 Aside: standby-first DDL ordering with the resume number.
      "migrate the standby first",
      // Gotchas: the ordered wedged-subscription recovery.
      "slot_name = none",
      // Part 1: the 402 billing row is in the signal table.
      "| 402 | billing restriction",
      // Part 3: the example code IS origin-first (not just an aside).
      "Origin-first: fresh reads in normal operation",
      // Part 1: the non-engineering half of detection.
      "status.supabase.com",
      "at least 2 weeks' notice",
      // Part 5: why the dump goes over the pooler (docs point at direct).
      "legitimate dump path",
      // Gotchas: rotate after break-glass.
      "rotate it after any break-glass use",
      // Part 3: the param-strip is IN the code example, not only the gotchas.
      "PostgREST treats unknown query params as column filters",
      // Gotchas: the failover trip condition includes 403 (line-wrapped in
      // prose, so pin the constants-table phrasing instead).
      "never `>=500` alone",
      // File reference links out to the public repo.
      "github.com/erfianugrah/supabase-lab/blob/a07de3d/experiments/edge-resilience/worker/worker.ts",
    ],
    linksTo: ["reference/supabase-incident-resilience"],
  },
  {
    doc: "guides/supabase-grafana-monitoring",
    mustContain: [
      // The vantage correction: the rule set covers resource/process state,
      // and that is NOT every incident - review proved this was missing.
      // (Heading renamed pack -> rule set 2026-08-20 when the doc standardized
      // the term; the pinned thing is the section existing, not its label.)
      "When the rule set helps, and when it cannot",
      "Coverage is a property of vantage points, not of rule count",
      // PG17 verified empirically 2026-08-17: the endpoint still serves
      // bgwriter checkpoint counters. Pin so nobody "fixes" the rule to
      // the upstream pg_stat_checkpointer naming.
      "pg_stat_bgwriter_checkpoints_req_total",
    ],
    linksTo: ["guides/supabase-resilience-runbook"],
  },
  {
    doc: WEATHER,
    mustContain: [
      // The 502 root cause. If this softens to "a header issue", the next
      // person loses hours to what looks like a network problem.
      "application/json;q=0.9,text/plain",
      // The empty-result parser split.
      "no results found",
      "frontend",
      // The multi-word-name verification bug - Pioneer was the WRONG pick.
      "mis-picked Pioneer",
      // Endpoint paths that are not guessable.
      "weather?api=lightning",
      // The distance-math constant and its ground-truth pair.
      "12392.1",
      "20.92 km",
    ],
    sections: [
      /^## Constants$/m,
      /^## Verification$/m,
      /^## Gotchas and lessons learned$/m,
      /^## File reference$/m,
    ],
    linksTo: ["reference/home-iot-network", "guides/airgradient-one-esphome-local"],
  },
  {
    doc: "reference/supabase-edge-function-limits",
    mustContain: [
      // The genuine size rejection is a 413 with this body on BOTH paths. An
      // earlier draft quoted a different error string that never appeared; if
      // this softens to "a size error", the 413-under-parallelism caveat loses
      // its point.
      "413 request entity too large",
      // Silent loss reproduced with no throttle visible. The two ratios are
      // one run's numbers and must stay next to their denominators.
      "10 of 24",
      "9 of 24",
      // The value ceiling counts characters; the docs' two figures are one
      // number in two units. This corrected a draft that tested at exactly
      // 48 KiB and could not tell the units apart.
      "73,728 bytes",
      // Platform SUPABASE_* rows do not count toward the 100 - a run that
      // counted them read the ceiling wrong.
      "do not count toward the 100",
      // The restriction that did not hold. Two runs, TCP connect only.
      "Port 587",
      // Both runtime ceilings return one code.
      "546 WORKER_RESOURCE_LIMIT",
      // Second wave: the documented recursive cap did not bite, and the only
      // refusal was this code; the active wall clock cut and the truncation
      // marker are the two figures that turn "not run" rows into measured ones.
      "RATE_LIMIT_EXCEEDED",
      "last tick at 395 s",
      "....[truncated]",
      // The docs define the wall clock per worker; the page must keep saying
      // the single-request run does not cover a shared warm worker.
      "the shared-worker case not run",
    ],
    mustNotContain: [
      // The error string the platform did not return.
      "exceeds the maximum deployment size",
    ],
    sections: [
      /^## What to do about each ceiling$/m,
      /^## Where the docs disagree with runtime$/m,
      /^## Reading the numbers$/m,
      /^## Evidence, by module$/m,
    ],
    linksTo: [
      "reference/supabase-incident-resilience",
      "reference/supabase-multi-tenant-placement",
      "reference/supabase-data-surface-lockdown",
    ],
  },
  {
    doc: "reference/supabase-audit-trail-integrity",
    mustContain: [
      // A06 (2026-09-08, two fresh projects in two organizations): the
      // in-database copy is OFF by default and the API PATCH is a no-op. Both
      // halves are load-bearing - a reader who takes only the first half
      // automates a switch that silently does nothing.
      "audit_log_disable_postgres",
      "answers `200` and leaves it unchanged",
      // A01b/A02a: the API roles hold nothing at all, and postgres cannot
      // assume the two Dashboard roles, so the matrix covers 4 of 6.
      "not even select",
      "permission denied to set role",
      // A03: the positive control is what licenses the two misses. If the
      // control sentence goes, the claim becomes an unsupported absence. The
      // second string also holds the line that stops the window bound being
      // read as an ingestion latency, which is how it was first published.
      "189 s",
      "so the misses are misses and not lag",
      // A04a: statement-level DML logging is not a platform toggle.
      'Unrecognized key',
      // A05e: the divergence that makes reconciliation a real check.
      "6 rows to 0 and left the stream at 6",
      // A07b plus the Dashboard read: the platform audit log records
      // control-plane calls and no SQL execution.
      "SQL execution is absent from it",
      // A09e: a chain does not catch truncation. This is the one most likely
      // to be softened into "a chain detects tampering".
      "it does not detect truncation",
      // A12b/A12c: both variants are refused at the schema.
      "permission denied for schema auth",
    ],
    sections: [/^## What to do about it$/m, /^## Evidence$/m, /^## Reading the numbers$/m, /^## Reproducing$/m],
  },
  {
    doc: "reference/supabase-auth-users-locks",
    mustContain: [
      // AL01a/AL01b: the mode and the conflict that makes it an outage. The
      // lock name and the refusal text together are the claim; either alone
      // turns into "a migration was slow".
      "`ShareRowExclusiveLock` (with `AccessShareLock` and `RowShareLock`)",
      "55P03 canceling statement due to lock timeout",
      // AL01c: the customer-visible symptom, which is a hang rather than an
      // error, and the 15 s is the probe's client, not the platform's.
      "hung until the probe's 15 s HTTP client timeout",
      "The 15 s is the probe's own client timeout, not a platform timeout",
      // AL02b: the reason the two-statement path works. Softening this to
      // "takes a weaker lock" loses the mode that does not conflict.
      "`AccessShareLock, RowShareLock`",
      // AL03a/AL03b: the reverse direction, and the control that proves the
      // reader was the cause.
      "`55P03 canceling statement due to lock timeout`",
      "succeeded once the reader committed",
    ],
    mustNotContain: [
      // The FK was never added to auth.users: the platform restricts DDL on
      // the auth schema, and the doc must not read as though it were.
      "ADD CONSTRAINT to auth.users itself",
    ],
    sections: [
      /^## Which form do I pick$/m,
      /^## What to do about it$/m,
      /^## Reading the numbers$/m,
      /^## Reproducing$/m,
      /^## Evidence$/m,
      /^## Related docs$/m,
    ],
  },
  {
    doc: "reference/supabase-wrapper-delete-scope",
    mustContain: [
      // X01b: the statement and the scope. The measure is the wrapper, not the
      // row that was clicked, and that is the whole doc.
      "`drop foreign data wrapper if exists <name> cascade`",
      "servers 5 -> 0",
      // X01c: Edit is as destructive as Delete, which is the row people
      // disbelieve.
      "Edit is a delete plus a create, so saving a row unchanged is as destructive as deleting it",
      // X01b's Vault half: the secrets are not cleaned up.
      "all five credentials stayed in Vault",
      // X01d: the RESTRICT refusals that make the safe path demonstrable.
      "`2BP01 ... because other objects depend on it`",
      // X01e: where a shared wrapper comes from at all.
      "`42710: foreign-data wrapper \"...\" already exists`",
      // The provenance limit: the SQL is generated from a pinned commit, not
      // captured from a browser, so a Studio change is out of scope.
      "a later Studio release could change it",
    ],
    mustNotContain: [
      // Run 1's hand copy is superseded and its secret name was wrong; it must
      // not be reintroduced as evidence.
      "`<fdw>_sa_key`, where Studio deletes",
    ],
    sections: [
      /^## What each Dashboard action runs$/m,
      /^## Removing one connection$/m,
      /^## What to do about it$/m,
      /^## Reading the numbers$/m,
      /^## Reproducing$/m,
      /^## Evidence$/m,
      /^## Related docs$/m,
    ],
  },
  {
    doc: "reference/supabase-data-surface-lockdown",
    mustContain: [
      // S21 (2026-09-03): the anon-only revoke left every RPC callable; the
      // PUBLIC grantee is the fix, and only the global default-privilege form
      // holds for new functions. If either sentence softens, the recipe is
      // wrong again.
      "REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public",
      "ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM public",
      // S17: FORCE binds only a non-BYPASSRLS owner, with the platform's own
      // refusal text for the obvious workaround.
      'is a reserved role, only superusers can modify it',
      // S16: the hosted edge appends and passes cf-connecting-ip; the
      // pre-request hook survived neither reload nor restart.
      "cf-connecting-ip",
      "by reload or by restart",
      // S18: the trail is the logs endpoint, not the admin audit table.
      "returned 200 with 0 entries",
      // A01d plus A03b/A03c (2026-09-08): the default statement class is
      // `ddl`, so the deletion of an audit row is not itself logged - and
      // pgaudit is an install, not a toggle. Both halves are load-bearing.
      "17.1 available to install",
      "in a 191 s search",
    ],
    mustNotContain: [
      // S19 drove HIBP at signup; the old hedge must not return.
      "signup was not driven in the lab",
      "was not driven in the lab",
    ],
  },
  {
    doc: "guides/supabase-own-postgrest",
    mustContain: [
      // S20: the through-edge behaviour is measured, with the lab config named.
      "edge.nginx.conf",
      "one RFC 1918 address and no client value",
    ],
    mustNotContain: ["the through-nginx behaviour is not measured", "reasoned, not measured"],
  },
  {
    doc: "reference/supabase-auth-end-to-end",
    mustContain: [
      // The verifier asymmetry the self-hosted run found: PostgREST refuses an
      // HS256 token carrying any kid, GoTrue accepts it. Reproduced on three
      // projects; if this softens to "kid mismatch", the no-kid rule is lost.
      "HS256 token carrying a `kid`",
      "must leave the header without a `kid`",
      // The role fact that makes the self-hosting compose file wrong on a
      // managed project, with the platform's own error text.
      "is a reserved role, only superusers can modify it",
      "search_path=auth",
      // Revoke timing and the collateral, measured together; the range is
      // stated because three projects gave three values.
      "3 s, 6 s and 4 s on three projects",
      "the same self-hosted token was refused by the managed",
      "legacy `anon` API key answered 401",
      // The correction to two earlier docs: bcrypt password_hash IS portable
      // via the admin API (consolidation C03). Pinned so the old claim cannot
      // creep back through a merge of older prose.
      "accepts a bcrypt `password_hash` as-is",
      // Refresh tokens belong to the issuer - the verbatim refusal body.
      "refresh_token_not_found",
      // The cache-window numbers that make the rotation warning concrete.
      "282 probes in 37 minutes",
      "116 probes in 20 minutes",
      // The rate-limit boundary and the throughput ceiling, so neither drifts
      // back to "the docs say 30" without a run behind it.
      "`429` at request **31** of 60 on a fresh bucket",
      "refused `429 over_email_send_rate_limit",
      "102/105/110ms sequential to 411/368/366ms at concurrency 8",
      "`db_max_pool_size=10`",
      // The unresolved unit rather than a tidy number: AR01c read 150 and the
      // page then quoted 1800/hour, and the run did not settle which unit the
      // field carries.
      "agree only if the field is per five minutes rather than per hour",
      // identity-transfer ITL1b (2026-09-11): the lookup reads the
      // `provider_id` column and not the JSON copy, which is what makes the
      // one-column remap safe to publish.
      "The column is what the lookup reads",
      "provider_email_needs_verification",
    ],
    mustNotContain: [
      // The retracted claim.
      "is not portable via the admin API",
    ],
    sections: [
      /^## Which shape do I pick$/m,
      /^## Rate limits and sign-up throughput$/m,
      /^## What to do about it$/m,
      /^## Where the docs disagree with runtime$/m,
      /^## Reading the numbers$/m,
      /^## Evidence$/m,
    ],
    linksTo: [
      "reference/supabase-incident-resilience",
      "reference/rls-without-supabase-auth",
      "reference/supabase-data-surface-lockdown",
      "reference/pbkdf2-supabase-auth-migration",
      "reference/supabase-multi-tenant-placement",
      "guides/supabase-iap-data-api",
      "guides/supabase-shared-tenancy",
      "guides/supabase-tenant-promotion",
      "guides/supabase-tenant-consolidation",
      "guides/supabase-own-postgrest",
    ],
  },
  {
    // Rewritten 2026-09-29 from an August cutover page that had drifted hard:
    // it still described a fresh GitHub-pull-mirror install with no backups,
    // when the fleet had since flipped to Forgejo-primary with GitHub as a
    // push-mirror backup. These pins guard the corrected facts and keep the
    // retired numbers (old versions, old mirror count, old runner capacity,
    // the bridge's internal subnet) from creeping back in a future edit.
    doc: FORGEJO,
    mustContain: [
      "269 repositories",
      "206 push mirrors",
      "16.0.5",
      "PostgreSQL | `postgres:18-alpine`",
      "capacity 4",
      "Silo",
      "effectively root on the router",
      "recorded in the migration plan",
    ],
    mustNotContain: [
      // The old description's mirror count and mirror-enrolment framing -
      // superseded by push mirrors once Forgejo became primary.
      "248 repos",
      "248 GitHub pull mirrors",
      // The pre-upgrade database version.
      "PostgreSQL 17",
      // The pre-upgrade Forgejo image tag.
      "16.0.3",
      // The runner's old concurrency before the capacity 1 -> 4 change.
      "capacity: 2",
      "Capacity 2 means",
    ],
    sections: [/^## Topology$/m, /^## Decision guide$/m],
    linksTo: [
      "reference/nixos-fleet",
      "reference/declarative-homelab-backups",
      "reference/knotea-self-hosted-dns",
      "reference/appdata-tiering-zfs",
    ],
  },
  {
    // 2026-09-29 update: the digest cache gained a systemd-timer writer, and
    // that timer silently failed open for six days because the user service
    // manager's PATH did not include the binary's directory. These pins
    // guard the corrected facts (the PATH fix, the fail-open behaviour, the
    // three-writer/two-lock-file reality replacing a "single writer"
    // design claim, the vault-store cost note) and block a regression that
    // would describe `uci:` as a registered store when it is only a
    // supported, unregistered scheme on this fleet.
    doc: AGENTGUARD,
    mustContain: [
      // The PATH/fail-open finding and its fix.
      "`secretctl: command not found`",
      "31 runs in the journal's 8-day window logged",
      "Wherever no cache existed, the known-value",
      "`Environment=PATH=`",
      "fails the unit on empty output",
      // The liveness signal, added 2026-09-29.
      "Since 2026-09-29 both guards report the cache's health",
      // The three-writer lock history and the single protocol that replaced
      // it on 2026-09-29.
      "**Three writers, three lock schemes.**",
      "`flock -w 40`: waits for an in-flight pass",
      // The 2026-09-29 registry-scale row.
      "402, unresolved 0",
      // Vault stores: name-glob expansion and the opt-in cost note.
      "registering the whole vault is opt-in",
      "`rbw:` is read-only to `secretctl set`",
    ],
    mustNotContain: [
      // `uci:` is a supported scheme, not a registered store on this fleet -
      // a future edit must not claim otherwise.
      "uci store is registered",
      "registered uci store",
      "uci: store is registered on this fleet",
      // Fixed 2026-09-29; must not read as still open.
      "it is not done",
      "a fix is planned but does not exist",
    ],
    sections: [
      /^## Known issues$/m,
      /^### Vault items as stores$/m,
      /^### The digest cache and its writers$/m,
    ],
  },
  {
    // New guide (2026-09-29): the Forgejo port of this site's own GitHub
    // Actions deploy. Its fact pack held two claims the drafting pass is
    // prone to overstate - Forgejo documents artifact support for its own
    // v3 / patched-v4 forks, it does not lack artifacts outright; and its
    // enable-openid-connect key exists and is documented, it was just never
    // exercised on this runner, which is not "no OIDC". Review also caught
    // and removed a gitleaks release version (8.18.4) the draft invented
    // with no source in the fact pack.
    doc: PORTING_FORGEJO,
    mustContain: [
      "v3 or patched v4",
      "enable-openid-connect",
      "effectively root on the host",
      // The unresolved weekly-link-check failure (H05): the ported
      // issue-filing step was never confirmed to actually file.
      "unverified until a run confirms it files",
    ],
    mustNotContain: [
      "Forgejo has no artifact API",
      "there is no artifact API",
      "no OIDC",
      "OIDC is not supported",
      "Forgejo does not support artifacts",
      // The fabricated gitleaks version; replaced with a GITLEAKS_VERSION
      // placeholder the reader pins themselves.
      "8.18.4",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [FORGEJO, GH_ACTIONS_CF],
  },
  {
    // The GitHub-hosted sibling, corrected 2026-09-29: this site moved its
    // own deploy to a self-hosted Forgejo runner on 2026-09-24, so every
    // "(this site)" / "like this one" / "this very website" framing that
    // implied GitHub Actions still runs it was false. Also drops the dead
    // erfi-dev-docs deploy.yml link (301 to a 404).
    doc: GH_ACTIONS_CF,
    mustContain: [
      "GitHub-hosted variant",
    ],
    mustNotContain: [
      "(this site)",
      "like this one",
      "this very website",
      "erfianugrah/erfi-dev-docs/blob/main/.github/workflows/deploy.yml",
    ],
    linksTo: [PORTING_FORGEJO],
  },
  {
    // New reference (2026-09-29): the runner posture in depth. Guards the
    // live cache-prune policy against the router's stale nix comment
    // (14-day/20 GiB) being read back as current.
    doc: FORGEJO_RUNNER,
    mustContain: [
      "RUNNER_CONFIG_REV",
      "does not survive the next deploy",
      "capacity 4",
      "stop_grace_period: 15m",
      "effectively root on the router",
      "3-day TTL and a 10 GiB cap",
    ],
    mustNotContain: [
      // The stale nix comment must not be read back as the CURRENT policy.
      "currently a 14-day TTL",
      "the cache prune runs a 14-day TTL and a 20 GiB cap",
    ],
    sections: [
      /^## Topology$/m,
      /^## Which do I pick$/m,
      /^## Decision guide$/m,
      /^## Incidents that shaped this runner$/m,
    ],
    linksTo: [FORGEJO, PORTING_FORGEJO],
  },
  {
    doc: WEBHOOKS_COMPOSER,
    mustContain: [
      // The provider-pairing mechanism: this is the fact a reader most needs
      // and is most likely to get backwards (provider gitea, not github, for
      // a native Forgejo hook).
      "with a Composer webhook whose provider is `gitea`",
      "A native Forgejo hook satisfies a `gitea`-provider webhook",
      // The host-reachability pin: without this the whole mechanism reads as
      // a mystery (how does a bridge container reach a host-bound service).
      "`[webhook] ALLOWED_HOST_LIST = private`",
      "traffic from any docker bridge to that one host-bound address on 443 is allowed",
      // The git source URL and the port distinction that makes it work.
      "`ssh://git@git.erfi.io:2223/erfi/<repo>.git`",
      "not the router's own sshd on 22 and not Forgejo's docker-network-only SSH bind on 2222",
      // Composer cannot update repo_url in place - the reason the no-delete
      // recipe exists at all, and the easiest claim to get backwards later.
      "no endpoint that updates a git-backed stack's `repo_url` in place",
      "The only Composer path that actually clones a repository is stack creation",
      // The 2026-09-29 audit counts, load-bearing and easy to silently drift.
      "5 classified CLEAN, 9 DEDUPE, 1 KEEP-GITHUB",
      "9 orphaned Composer `github`-provider webhook rows",
      // The SSH auth fallback regression and its fix.
      "returns the first key file that decrypts and parses, in directory-listing order",
    ],
    mustNotContain: [
      // Genericised per the parent session's HELD decision: no Composer
      // stack names beyond the deliberately-named exceptions (Silo, knotea,
      // the forge's own stack).
      "atuin",
      "copyparty",
      // There is no dedicated Forgejo docs page for deploy keys - do not
      // imply one exists via a fabricated citation or URL.
      "forgejo.org/docs/latest/user/deploy-keys",
      // The opposite of the load-bearing claim above would be a real
      // regression: Composer does NOT support updating repo_url through the
      // stack update endpoint.
      "`PUT /stacks/{name}` accepts a `repo_url` field",
      "updates the repo_url field directly",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [FORGEJO, PORTING_FORGEJO],
  },
  {
  doc: SECRETCTL,
  mustContain: [
    // The `set`-canonicalisation fix and the commit that shipped it.
    "fixed 2026-09-29 in commit `cc242ca`",
    // Scope of that fix: dotenv/sops/bw-notes only, keyfile stays byte-for-byte.
    "the source byte-for-byte, trailing newline included",
    // The 2026-08-30 key-derivation invariant: hex string, not decoded bytes.
    "The key material is the salt's hex string",
    // classify's inverted exit-code polarity relative to cmp.
    "`classify`'s polarity is the inverse of `cmp`'s",
    // The 2026-09-29 exclude label-matching fix and its worked example.
    "exclude rbw:ITEM_NAME#*",
  ],
  mustNotContain: [
    // The fix reaches the dotenv codec path only - these would overclaim it.
    "keyfile destinations canonicalise",
    "bw custom field is canonicalised",
    // Stale 'not yet committed' wording must not creep back.
    "uncommitted in this repo's working tree",
  ],
  sections: [/^## Topology$/m, /^## Decision guide$/m],
  linksTo: [AGENTGUARD],
  },
  {
    // New guide (2026-09-29): the task-sequenced rotation how-to that pairs
    // with reference/agent-secret-guard. Its fact pack's HELD decision #4
    // matters here: `secretctl set`'s dotenv-newline refusal was overly
    // strict until 2026-09-29 (it did not canonicalise a trailing newline
    // before checking, unlike fp/cmp) and was fixed the same day; this page
    // states the fixed behaviour, re-verified this run against HEAD
    // `730896f4`, and must not describe the old refusal as a still-open
    // trap. It also keeps the Postgres role-rotation aside generic (no
    // named stack), per the same HELD list.
    doc: SECRETCTL_ROTATION,
    mustContain: [
      // The 2026-09-29 fix statement itself.
      "As of 2026-09-29, `set` applies that same canonicalisation",
      // The narrower guard rail that must survive alongside the fix: an
      // interior newline or a second trailing newline still refuses.
      "A value with an interior newline is still refused, and so is a value with two trailing newlines",
      // The freshly-minted-value blind spot (C4/C5) and its incident.
      "the guard had nothing to compare it against",
      // The forced post-`set` refresh's lock behaviour (C20).
      "flock -w 60",
      // The empty-salt-file refusal, exact CLI wording (C19).
      "salt file salt-file is too short (0 bytes, need >= 16)",
      // The Postgres aside kept generic - no stack named.
      "a stack whose database role password is rotating",
    ],
    mustNotContain: [
      // The pre-fix framing: this page must not describe the dotenv-newline
      // refusal as a standing trap once the fix is stated.
      "cannot be `set` into a dotenv or sops destination without regenerating it newline-free",
      "a genuine day-one trap",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [AGENTGUARD],
  },
  {
  doc: FLEET_MIGRATION,
  mustContain: [
    // The live re-count this run, load-bearing and the easiest thing for a
    // future edit to quietly drift out of sync with the sibling FORGEJO pin.
    "47 of 47 active repositories report `OK`, exit 0",
    "206, one per enrolled repository, none doubled up",
    // The tag-storm mechanism: evaluated against CURRENT main workflow files,
    // not against what existed when the tag was made. Easy to state backwards.
    "Forgejo evaluates a tag-push trigger against the *default branch's current* workflow files",
    // Why native recreate is unavoidable for a CI repo - the load-bearing
    // reason a reader must not "just enable it via the API" instead.
    "there is no API or CLI to add the unit to an existing repository",
    // Disabling GitHub Actions is not a full stop to GitHub-side automation -
    // the Dependabot gap this migration had to close separately.
    "does not stop GitHub's own Dependabot",
  ],
  mustNotContain: [
    // The pre-migration repo total (superseded by the live 269 recount) -
    // same stale figure the FORGEJO pin already guards.
    "248 repos",
    // The opposite of the tag-storm fix: pushing tags before main is
    // "prove one green run" done backwards.
    "push tags before main",
    // No such thing exists on Forgejo 16.0.x; guards against a regression
    // that reintroduces this migration's very first blocker.
    "Actions unit can be enabled through the API",
  ],
  sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
  linksTo: [FORGEJO, PORTING_FORGEJO, FORGEJO_RUNNER, WEBHOOKS_COMPOSER],
  },
  {
  // New page (2026-09-29): the release/registry follow-up self-hosted-forgejo-router
  // named as planned. Pins cover the three-lane split, the two-flip policy history,
  // the registry decision's four reasons, the buildkit/QEMU cross-compile fix, and
  // the per-repo evidence split (fjctl proven; secretctl and eaves workflow-only) -
  // the fact this page's own audit found and that a plan document elides by grouping
  // all three CLIs together as "done".
  doc: FORGEJO_RELEASES,
  mustContain: [
    // The three-lane split itself, and that each repo uses exactly one.
    "each repo uses exactly one",
    // Lane 1 mechanism: ghcr push, no Forgejo release row.
    "No Forgejo release row is created",
    // Lane 2 mechanism: the automatic per-run token, not a PAT.
    "the token Forgejo creates automatically for the duration of the workflow run",
    // The two-date policy flip - both dates must survive together, not just one.
    "banned fleet-wide on 2026-09-24",
    "reinstated on 2026-09-28",
    // The registry purge figure - a measured number that must not be dropped.
    "7.4 GB down to 892 MB",
    // The registry decision's core reason (availability coupling), stated plainly.
    "An outage of either one would block every image pull fleet-wide",
    // The QEMU hang diagnosis and its fix, both load-bearing.
    "runner's CPU sitting near idle the whole time",
    "FROM --platform=$BUILDPLATFORM",
    // The per-repo evidence split this page's own audit found - the fact most likely
    // to erode if a later edit assumes parity across the three lane-2 repos.
    "only `fjctl` is proven end to end as of this run",
    "`secretctl` and `eaves` have the workflow committed but have not fired it",
  ],
  mustNotContain: [
    // Would overclaim parity across the three lane-2 repos - the plan document's
    // own framing, which this page explicitly corrects.
    "all three CLIs are proven",
    "all three repos have shipped a release",
    // Would misdate the flip or collapse it to one event.
    "banned and reinstated the same day",
    // Would restate the pre-Silo reason as still current for the registry decision.
    "the registry stays off because of router disk space",
  ],
  sections: [
    /^## Topology$/m,
    /^## Which lane do I pick$/m,
    /^## Decision guide$/m,
    /^## Evidence$/m,
  ],
  linksTo: [FORGEJO, FORGEJO_RUNNER, PORTING_FORGEJO],
  },
  {
    doc: STORAGE_BACKUPS_CACHE,
    mustContain: [
      "copies data FROM the storage type currently configured TO the destination named by its own flags",
      "silently copies the new store onto itself",
      "aborts at the first missing file, with no skip-missing flag",
      "grew to about 26 GB before anyone added one",
      "keepDuration = \"72h\"",
      "no off-pool copy of it, which is an accepted risk",
      "3 days and 10 GiB",
    ],
    mustNotContain: [
      // Prior cache-prune values, superseded by the 2026-09-28 tightening -
      // must read as history, not current policy.
      "14 days and 20 GiB is the current",
      // Never state the migrate-storage direction backwards.
      "copies data TO the storage type currently configured",
    ],
    sections: [
      /^## Where each kind of data lives$/m,
      /^## The migrate-storage order trap$/m,
      /^## Decision guide$/m,
    ],
    linksTo: [
      FORGEJO,
      FORGEJO_RUNNER,
      "reference/declarative-homelab-backups",
      "reference/appdata-tiering-zfs",
    ],
  },
  {
    doc: RECOVERY_RUNBOOKS,
    mustContain: [
      // The live memcg-OOM-fix verification (RestartCount + uptime), checked
      // this session - the number that proves the 2026-09-26 fix is holding.
      "0 2026-09-27T00:18:04.568535343Z",
      // The live action_run status-code count, checked this session - ties
      // the Constants table's status codes to a real, current distribution.
      "289 success, 1278 failure, 129 cancelled",
      // The live job-logs-endpoint check on this site's own repo, checked
      // this session - the reason the logs-over-API runbook is not a guess.
      "GET /api/v1/repos/erfi/lexicanum/actions/jobs/6532/logs",
      // The grace period that fixed the orphaned-container incident; easy to
      // quote as a different duration later.
      "stop_grace_period: 15m",
      // The one absolute rule in the repo_unit runbook - it must survive
      // any future trim of that section.
      "Never insert a `repo_unit` row by hand for any reason",
    ],
    mustNotContain: [
      // The memory-limit fix direction, reversed. The incident raised the
      // limit 1024M -> 2048M; the reverse would describe the fix backwards.
      "2048M to 1024M",
      // The runner-version fix direction, reversed. The fix was upgrading
      // TO 13.2.0, not to the version that caused the hang.
      "upgrade the runner image to 13.0.0",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [FORGEJO, FORGEJO_RUNNER, PORTING_FORGEJO, WEBHOOKS_COMPOSER, SECRETCTL, SECRETCTL_ROTATION],
  },
  {
    // New guide (2026-09-29): the task-sequenced how-to for building and
    // checking the secretctl registry itself (declare stores, exclude
    // configuration keys, verify with sources/digests, sweep with coverage,
    // wire a consumer to the digest cache) - distinct from
    // guides/secretctl-rotation, which assumes the registry already exists.
    // Its fact pack reused the published 2026-09-29 registry-scale and
    // coverage-sweep numbers from reference/agent-secret-guard rather than
    // re-deriving a second, possibly-drifted count from this dev box's live
    // registry (HELD decision #1); the nightly coverage timer's real unit
    // name (secret-coverage, not secretctl-coverage) is pinned because it
    // is the opposite of the guessable name and was confirmed live this run.
    doc: SECRETCTL_REGISTRY_COVERAGE,
    mustContain: [
      // The registry's fail-loud-on-empty design (C4).
      "an empty registry silently protects nothing",
      // The 2026-09-29 exclude label-matching fix's worked example (C6/C7).
      "exclude rbw:ITEM_NAME#*",
      // The real nightly-timer unit name, which does not match the
      // secretctl- prefix a reader would otherwise guess (C25).
      "does not follow the `secretctl-` prefix the digests timer uses",
      // The published first-run coverage-sweep numbers, reused not
      // re-measured (C32).
      "flagged 280 files, of which 70 were already covered and 210 were not",
      // The digest-cache publish rule: a partial/garbage pass must never
      // replace a good cache (C27).
      "first byte `{`, last non-space byte `}`",
    ],
    mustNotContain: [
      // The guessable-but-wrong nightly-timer unit name.
      "secretctl-coverage.timer",
      "secretctl-coverage.service",
      // The exclude-label fix landed 2026-09-29, not 2026-09-23 (that date
      // is the unrelated digest-herd incident) - must not conflate the two.
      "committed on 2026-09-23",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [AGENTGUARD, SECRETCTL, SECRETCTL_ROTATION],
  },
  {
    // New reference doc (2026-09-29): the decision behind the fleet's split
    // across SOPS+age, Vaultwarden+rbw, OpenBao and Infisical. OpenBao is
    // design-only (never deployed) and Infisical is cut; the pins below guard
    // both the load-bearing vendor facts (re-verified against each vendor's
    // own repo/docs this run) and the public-safety redactions the fact pack
    // applied on top of the fleet's internal secrets-architecture notes -
    // vault content counts, the vault's hostname, personal email, and the
    // named machine-secret env vars must never creep back into this page.
    doc: CHOOSING_SECRETS_BACKEND,
    mustContain: [
      // The stated constraint the whole comparison is scored against.
      "services create and set their own secrets, a human memorises exactly one master key, and nothing needs to read a secret programmatically as a routine operation",
      // The maintainer statement that makes Bitwarden Secrets Manager a dead
      // end on Vaultwarden specifically, not a general product comparison.
      "I don't think anything similar to secrets manager will be coming to Vaultwarden",
      // OpenBao's own migration-plan status - must read as unimplemented, not
      // as a running system.
      'migration plan status is, in its own words, "NOT STARTED."',
      // The CLI shape that makes OpenBao's single-item read leak-safe.
      "bao kv get -field=<name>",
      // HashiCorp Vault's licensor, re-verified against its own LICENSE file.
      "names the licensor as IBM Corp",
      // Infisical's open-core licence split, re-verified against its own
      // LICENSE file rather than inferred from marketing copy.
      "MIT core, separate licence under its `ee/` (Enterprise) directories",
    ],
    mustNotContain: [
      // Vendor version pins go stale; the decision does not depend on them.
      "OpenBao 2.6.2",
      "Infisical v0.165.14",
    ],
    sections: [/^## Topology$/m, /^## Decision guide$/m, /^## Which do I pick$/m],
    linksTo: [AGENTGUARD, SECRETCTL, "guides/vaultwarden-multi-site"],
  },
  {
    doc: SOPS_COMPOSE,
    mustContain: [
      // The absolute-git-dir mechanism is the load-bearing reason the global
      // hooksPath chain reaches the templateDir-seeded SOPS check at all,
      // rather than looping back on itself.
      "The chain resolves the repo-local hook through `git rev-parse --absolute-git-dir` rather than",
      // The corrected, two-release account of the self-heal fixes - the
      // composer skill doc's own "since v0.26.10" phrasing undersells this by
      // one release; both version numbers have to survive together.
      "That fix shipped in `v0.26.10`. A second, related fix landed the same day in `v0.26.12`",
      // The age-key-resolution gotcha that explains the rotation incident
      // below it: a stale data-directory key file always wins over env vars.
      "if a data-directory key file exists, it wins outright",
      // The incident lesson itself.
      "A rotated age key does not reach an already-running container by itself.",
      // The false-positive this page warns against when writing a manual
      // ciphertext check.
      "an encrypted dotenv's first line is simply the first key's name",
    ],
    mustNotContain: [
      // The imprecise single-version simplification of the self-heal fixes -
      // guards against re-collapsing the two-release account above.
      "self-healing since v0.26.10",
      // The over-broad, corrected verb list for what wraps decrypt/re-encrypt:
      // `sync` does not run docker compose and was removed from this list
      // during drafting after checking the source's call sites.
      "`sync`, `deploy` and others - wraps the compose call",
    ],
    sections: [/^## Verification$/m, /^## Gotchas and lessons learned$/m],
    linksTo: [AGENTGUARD, SECRETCTL, SECRETCTL_ROTATION, "reference/nixos-fleet"],
  },
  {
    doc: PLATFORM_MGMT,
    mustContain: [
      // Z01 (2026-09-09): the parked-project sweep answers empty `200`s on
      // three project-scoped reads, so a status-code sweep reports parked
      // tenants healthy. The count is three, not the four the first pass
      // listed - `/advisors/security` is empty on a fresh project too.
      "scores every parked tenant clean",
      "and is not one - a fresh project's lint list is empty awake as well",
      "/advisors/security` looks like a",
      // The auto-pause arm is untestable on the staging control plane, which
      // is the reason Z04 cannot fire; losing this line sends the next reader
      // back to staging to re-learn it.
      "never exercised auto-pause",
      // The hibernation arm returned a null, not a pending result.
      "Hibernation was not reachable on any account available here",
    ],
    sections: [/^## 8\. Gotchas and lessons learned$/m, /^## Verified \/ tested$/m],
  },
  {
    doc: "reference/supabase-branching-two-projects-one-repo",
    mustContain: [
      // MS15d (2026-09-30): a merge is accepted and applies nothing without
      // migration files. The tempting softening is "the branch merges its
      // schema", which is exactly what the run rules out.
      "applies nothing when there are no migration\nfiles",
      "Cannot delete persistent branch.",
      // The push timing is the one number that makes the branch a usable
      // staging database, and the only figure a rewrite tends to drop.
      "14859 ms",
    ],
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
  ["reference/postgres-entity-graphs", PRACTICES_HEADING],
  ["reference/rls-without-supabase-auth", PRACTICES_HEADING],
  ["reference/stripe-sync-engine", PRACTICES_HEADING],
  ["reference/supabase-auth-end-to-end", PRACTICES_HEADING],
  ["reference/supabase-auth-users-locks", PRACTICES_HEADING],
  ["reference/supabase-aws-privatelink", PRACTICES_HEADING],
  ["reference/supabase-branching-two-projects-one-repo", PRACTICES_HEADING],
  ["reference/supabase-compute-disk", /^## Ops playbook$/m],
  ["reference/supabase-data-residency", PRACTICES_HEADING],
  ["reference/supabase-data-surface-lockdown", PRACTICES_HEADING],
  ["reference/supabase-dr-tiers", PRACTICES_HEADING],
  ["reference/supabase-edge-function-limits", /^## What to do about each ceiling$/m],
  ["reference/supabase-image-transformations-billing", PRACTICES_HEADING],
  ["reference/supabase-incident-resilience", PRACTICES_HEADING],
  ["reference/supabase-multi-tenant-placement", PRACTICES_HEADING],
  ["reference/supabase-platform-operation-cost", PRACTICES_HEADING],
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
