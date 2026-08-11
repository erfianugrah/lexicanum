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
const TENANT_MERGE = "guides/supabase-tenant-consolidation";
const PBKDF2 = "guides/pbkdf2-supabase-auth-migration";
const OPCOST = "reference/supabase-platform-operation-cost";
const PRIVATELINK = "reference/supabase-aws-privatelink";
const PRIVATELINK_TOFU = "guides/supabase-aws-privatelink-tofu";
const MONTOPO = "reference/self-hosted-monitoring-topology";
const MONGUIDE = "guides/monitor-compose-postgres-prometheus";
const MEMSTORE = "reference/agent-memory-store";
const SBRESIDENCY = "reference/supabase-data-residency";

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
    // Retitled off "Consolidating Supabase accounts...", which read as a
    // near-twin of the tenant-consolidation guide's title while describing an
    // unrelated operation. The sidebar sorts by filename so the two were never
    // adjacent, but both being visible and both opening on "Consolidating" was
    // enough to confuse the two moves.
    mustNotContain: ["Consolidating Supabase accounts into one organization"],
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
    ],
    mustNotContain: [
      // True when written, measured false since. Inert here but kept as a
      // regression guard on both halves.
      "Neither approach was built or tested in this run",
      "Neither discovery endpoint nor gateway was built",
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
      "ip saddr 10.0.71.59",
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
      /^## Sources$/m,
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
