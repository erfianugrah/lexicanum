# Supabase tenancy doc set: org consolidation, project transfer, shared tenancy

Status: PLANNED - harness built and green; docs not yet written.
Date: 2026-08-03
Scope: 2 new guides, 1 reference update, 1 patch to an existing guide, plus an
extension of `scripts/verify-docs.sh` to gate all four.

## Where this comes from

Two empirical labs run 2026-08-03 in the private `erfibase` repo:

| lab | claims | outcome |
|---|---|---|
| org topology + project transfer | 60 | 49 empirically proven, 1 refuted, 3 doc-verified, 7 not tested |
| hand-rolled shared tenancy | 10 (G1-G10) | portability + promotion proven; `custom_jwks` found non-functional |

Both carry a `claims.json` ledger where every row has a status, a note, and an
`evidence/` path. Nothing in the doc set may assert a measured fact that does not
trace back to an `empirically-proven` row. That traceability is mechanized below.

The trigger was a recurring question - an agency running one free Supabase account
per client wants to consolidate and pay - that has now arrived four times
(2026-06-15, -16, -17, and 2026-08-03). The answer given each time rested on doc
reads, and one of those doc reads was wrong.

## The doc set

Four pieces. Types follow the AGENTS.md test: "how does X work / which do I pick?"
-> reference; "how do I do X, step by step?" -> guide.

### 1. `guides/supabase-region-migration-e2e.mdx` - PATCH (do this first)

Smallest change, highest harm avoided. That guide walks a dump-and-restore to a new
project and currently has zero matches for `pgsodium`, `vault`, `auth.users` or
`encrypted_password`. A reader with Vault secrets who follows it literally ends up
with rows that cannot be decrypted, and no warning that it happened.

Add to its "Part 3: repoint" and "Gotchas" sections:

- The Vault root-key trap. A target project has its own encryption root key and
  cannot decrypt ciphertext carried across by `pg_dump`. Extract the source root key
  from `GET /v1/projects/{ref}/pgsodium` BEFORE decommissioning the source; after the
  project is deleted that endpoint returns `400 {"message":"Resource has been
  removed"}` and the secrets are unrecoverable.
- The `auth.users` NULL-token-column fix. Hand-migrated rows make GoTrue return
  `Database error querying schema` until eight varchar token columns are coalesced to
  empty string. bcrypt hashes themselves port fine - users do not reset passwords.

Do NOT expand this guide into a transfer guide. Region change and org change are
different operations; link to the consolidation guide for the latter.

### 2. `guides/supabase-org-consolidation.mdx` - NEW

The task: fold N Supabase accounts/orgs into one, without a dump/restore.

Owns:
- The topology decision gate: one org with a project per client, vs one org per
  client. Blast-radius reasoning (quota pooling, fair-use scope, org-scoped roles
  reaching all current and future projects), the RBAC ceiling from the entitlements
  matrix, and the cost model.
- The claim-token transfer runbook, including the preview/dry-run step.
- What transfer preserves (the 15-field fingerprint result) and what it does not.
- Downtime by direction, and why paid-to-free is the slow one.
- The free-project-limit mechanic at both create time and transfer time.
- Gotchas: partial-SMTP PATCH wiping SMTP, rate limiting into a Cloudflare
  interstitial, `ACTIVE_HEALTHY` preceding data-plane readiness, the two API
  surfaces.

Precedent for a guide carrying this much decision content: `supabase-region-
migration-e2e.mdx` (429 lines) has "Pick your path" and "Every task, three ways".
Expected size ~350-400 lines.

Deliberate call to record: the plan-matrix / RBAC-ceiling / two-API-surfaces material
(~85 lines) is reference-grade and reusable beyond consolidation. It lives in this
guide for now because a reader arriving has already decided to consolidate. If the
four dashboard-only claims ever get measured, that section outgrows a guide and
should split into its own reference. This is a decision, not an oversight.

### 3. `guides/supabase-shared-tenancy-and-promotion.mdx` - NEW

The task: build the shared-instance tenancy tier described in the multitenant
reference, and promote a tenant out of it to a dedicated project.

Owns:
- Schema + RLS keyed on an external identity claim.
- Wiring third-party auth, including the hub-project-as-IdP pattern.
- The promotion runbook.
- The G3-G9 checks as the Verification section - the tests ARE the verification
  steps, which is what a guide's Verification section is for.
- Gotchas: `custom_jwks` accepted but never resolved; `role` must be
  `authenticated`; `kid` required; asymmetric only; rotation propagation.

Does NOT own the why. Cost reasoning, tier comparison and "should I do this at all"
stay in the reference.

### 4. `reference/supabase-multitenant-platform.mdx` - UPDATE

Written 2026-07-09 with an honest "Still design-only (not yet tested)" section. Two
of its four untested items are now tested.

- Move "External-IdP portability across projects" and "The promotion migration" from
  design-only into "Verified / tested", with the new evidence.
- Add the hub-as-IdP finding. This changes the architecture, not just its evidence
  status: a project publishes an asymmetric JWKS at
  `/auth/v1/.well-known/jwks.json`, so a hub project can be the IdP for a fleet and
  the external-IdP dependency disappears. Record the tradeoff - the hub becomes a
  hard dependency and its key rotation is a fleet-wide event.
- Add the `custom_jwks` warning.
- Note that the portability result removes one of the gateway's harder requirements:
  it does not need to rewrite tokens, because the same token is already valid on both
  sides.
- Leave "the gateway" and "scale / noisy-neighbour" in design-only. They are still
  untested and the doc's credibility rests on that section staying honest.

Update last, since it depends on what the two guides end up owning.

## Cross-link graph

```
reference/supabase-multitenant-platform
  -> guides/supabase-shared-tenancy-and-promotion   (how to build it)
  -> guides/supabase-org-consolidation              (if project-per-tenant is right after all)

guides/supabase-org-consolidation
  -> reference/supabase-multitenant-platform        (when project-per-client is the wrong shape)
  -> guides/supabase-region-migration-e2e           (if you also change region)

guides/supabase-shared-tenancy-and-promotion
  -> reference/supabase-multitenant-platform        (the why, the cost model)

guides/supabase-region-migration-e2e
  -> guides/supabase-org-consolidation              (org change is NOT a region migration)
```

Every arrow gets a checked anchor in the verifier - the existing harness already
does this for the upgrade/region pair and it caught real breakage.

## Provenance: two kinds of claim, two mechanisms

**External factual claims** (what Supabase documents) -> IEEE-numbered footnotes per
the AGENTS.md citation contract. Inline `[^slug]` at the claim, definitions in one
block near the end, format `Vendor, "Page title," Site Name. https://full-url`. The
reference doc requires these throughout; the guides carry inline links in-step and a
footnote list only where they make standalone factual claims.

**Measured claims** (what we ran) -> a sidecar evidence map per doc, checked against
the lab ledgers.

The problem this solves: the labs are in a private repo, so a reader cannot follow a
claim id, and cluttering public prose with `A12`-style tags helps nobody. But an
unverifiable "measured" badge is exactly the thing this whole exercise exists to
avoid. So the mapping lives beside the doc, not inside it:

```
src/content/docs/guides/supabase-org-consolidation.evidence.json
{
  "lab": "erfibase:labs/supabase-org-topology",
  "rows": [
    { "claim": "A12", "must_appear": "project-claim" },
    { "claim": "A13", "must_appear": "75.2" }
  ]
}
```

The verifier asserts, for every row: the claim id exists in that lab's `claims.json`,
its status is `empirically-proven`, and `must_appear` is present in the MDX. A number
published in the doc that no longer has a green ledger row fails the build. A ledger
row that gets downgraded later fails the build.

Reader-facing, the evidence table keeps its "How it was checked" column in plain
prose, as the existing exemplars do. The claim ids are internal traceability.

**Unproven claims stay labeled.** Both labs have `doc-cited-not-tested` rows.
Anything sourced from those is written as doc-cited, never as measured, and the docs'
evidence tables keep the tested-vs-design-only split the repo already uses.

## Public-repo hygiene

lexicanum is PUBLIC and deploys to erfi.dev. The labs are private. Nothing
account-specific may reach the docs.

Feed these to the harness via `BANNED_IDENTIFIERS` (it SKIPs loudly when unset, which
would be a vacuous pass here, so CI must set it):

- org ids: the pro org, the team org, the throwaway free org
- project refs: all six scratch refs from both labs
- the four real project refs from the account inventory
- the account email and any GoTrue user UUID

Two specific redactions:

- The free-project-limit API error quotes the account handle verbatim. Publish it
  with the handle replaced by `<member>`, and say the substitution was made.
- The transfer preview payloads carry real refs. Publish the warning/error KEYS
  (`WARN_TARGET_ORGANIZATION_ON_FREE_PLAN_AND_PROJECT_ON_HIGHER_COMPUTE`,
  `ERR_TARGET_ORGANIZATION_EXCEEDS_FREE_PROJECT_LIMIT`) and message text, with refs
  replaced by `<source-ref>` / `<target-ref>`.

## The verification loop

Extend `scripts/verify-docs.sh` rather than adding a second harness. Its existing
idioms carry over and are good: `chk`/`skp` counters, footnotes checked in BOTH
directions, footnote definition counts derived from source rather than hardcoded
(added specifically because a hardcoded count broke CI at dbf6752), loud SKIP over
vacuous PASS, opt-in network checks.

New check groups:

| # | group | asserts |
|---|---|---|
| 7 | new-doc mechanics | for each of the 3 new/updated docs: exists, ASCII punctuation, footnotes balanced both ways, no unescaped `$`, required skeleton sections present for its type |
| 8 | built HTML | no literal `[^`, zero katex spans, exactly one References h2, footnote defs in HTML == defs in source |
| 9 | cross-links | every arrow in the graph above resolves to a real `id=` anchor in the target's built HTML, both directions |
| 10 | evidence provenance | every `*.evidence.json` row: claim id exists in the named lab ledger, status is `empirically-proven`, and `must_appear` is present in the MDX |
| 11 | identifier hygiene | `BANNED_IDENTIFIERS` must be SET (a skip here is a failure for this doc set, unlike the general case) |
| 12 | dot fences | every dot block starts with the house boilerplate and carries `bgcolor="transparent"`; no per-node color/fill/fontcolor attributes |
| 13 | external links (opt-in) | every footnote URL in the new docs returns 200 |

Group 10 is the one that makes "no doubt" mechanical rather than aspirational.
Group 12 catches the dark-mode white-card failure the AGENTS.md warns about, which
no current check covers.

### Loop procedure

Per doc, repeat until the harness is green:

1. Write or patch the doc.
2. Write/extend its `.evidence.json` sidecar.
3. `bun run build`
4. `BANNED_IDENTIFIERS="..." bash scripts/verify-docs.sh`
5. Fix every FAIL. A SKIP in group 11 counts as a FAIL for this doc set.

Then once across the whole set:

6. `bash scripts/verify-docs.sh --check-links` (network, non-gating but must be run
   and read before calling it done).
7. Secret scan over the repo.
8. Read each doc top to bottom against the AGENTS.md house style: sentence-case
   headings, American -ize, no adjective doing a number's job, no rating your own
   points, no "not X, it's Y".

## Acceptance criteria

- `bun run build` exits 0 and reports 33 pages (34 if the reference is un-drafted).
- `verify-docs.sh` reports 0 failed and 0 skipped.
- `--check-links` reports 0 failed.
- Every measured number in all four docs traces to an `empirically-proven` ledger row
  via a sidecar entry.
- Every not-tested claim that appears is labeled as not tested.
- Secret scan clean over `src/`.
- No banned identifier anywhere in `src/`.
- The multitenant reference's design-only section still honestly lists the gateway
  and scale/noisy-neighbour.

## Risks

| risk | mitigation |
|---|---|
| Publishing an account identifier to a public site | group 11, made mandatory rather than skippable |
| A measured number drifting from its ledger row | group 10 fails the build |
| Duplicating content across the two guides and the reference | explicit ownership boundaries above; review the cross-link graph before writing each section |
| Over-claiming from the shared-tenancy lab, which used 2 tenants and 3 rows | the scale limitation is carried into the guide verbatim, not dropped |
| The reference's credibility resting on its honesty | the gateway and scale items stay in design-only |
| Writing the reference first and having the guides contradict it | reference is written last, deliberately |

## Findings from building the harness (2026-08-03)

Building the verification loop before the docs turned up five things about the repo
that change the plan. Recorded here because each one would otherwise have been
discovered as a confusing failure mid-write.

**The multitenant reference is `draft: true`.** It does not build and is not
published. It is the only draft in the repo. Since two of its four design-only items
are now proven, this is the natural moment to publish it - but that is a call to make
deliberately, not a side effect of editing it. Until it is un-drafted, every
dist-based check against it SKIPs, so the harness reports drafts explicitly rather
than silently passing.

**Page count is 31, not the 24 in AGENTS.md.** Target after this work: 33 with the
two guides, 34 if the reference is un-drafted. The AGENTS.md "Verify before done"
number is stale and should be updated to say "current count" rather than a literal.

**`prose-dollar.sh` had a frontmatter false positive.** It flagged the multitenant
reference for `~$10/mo` in its `description`. Escaping that would have been the wrong
fix: frontmatter is YAML and is not run through remark-math. Verified by publishing
the doc temporarily - the built page had 0 katex spans and `og:description` carried
the raw `$` intact, so `\$` there would emit a literal backslash. The script now skips
frontmatter, with that reasoning in a comment so nobody "fixes" it back.

**A site-wide "zero katex spans" sensor would be wrong.** `guides/magic-wan-interop`
has 23 katex spans on purpose - it writes MTU/MSS arithmetic as real LaTeX
(`$1500 - 24 = 1476$`). The katex check must stay per-doc, asserted only for docs that
do not intend math. The existing harness already does this correctly; do not
generalize it.

**A `dist/` path can exist with no source file.** `/reference/pbkdf2-supabase-auth-
migration` is an intentional redirect stub declared in `astro.config.mjs`, left behind
when that doc moved to `guides/`. Do not infer "this doc exists" from a dist
directory, and do not treat an unmatched dist path as a stale artifact.

### Harness status

Groups 7-11 are implemented and syntax-clean; group 12 (dot fences) folded into group
7 as `dot_fences_ok`. Against the current tree the harness reports 51 passed, 0
failed, and SKIPs for everything not yet written - which is the correct pre-work
state.

Still to wire once the docs exist:

- Add the new docs' footnote URLs to the opt-in `--check-links` group.
- Set `BANNED_IDENTIFIERS` in CI. Group 11 turns its absence into a hard FAIL the
  moment either new guide lands, so this cannot be forgotten silently.
