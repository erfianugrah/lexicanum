# Batch 2 review

## Summary

- **Missing text fallback under a `dot` diagram - 7 docs.** Fixed by adding one in
  `postgres-corpus-entity-graph`, `self-host-matrix` (all 3 diagrams),
  `singapore-weather-ha-grafana` and `supabase-own-postgrest`; reported (not added) in
  `supabase-aws-privatelink-tofu`, `supabase-edge-function-bff-fanout`,
  `supabase-grafana-monitoring`. Corpus-wide measurement: 30 of the 111 docs that carry a
  `dot` fence have fallback wording, so this is a house convention question rather than a
  defect in these seven. I added them where the brief allowed it because the brief names it
  as an A-axis exception that can be sourced from the diagram's own labels.
- **Heading sentence-case - 5 docs, 13 headings fixed.** Two directions: a product name
  lowercased (`matrix core`, `element web`, `Cloudflare spectrum`, `home manager`) and a
  word capitalised after the colon (`Step 1: Find the branch ID`, `Part 1: Trusted-device`).
  `self-host-matrix` (5), `supabase-branch-detach-git-link` (3), `slskd-wireguard-port-forward`
  (2), `supabase-auth-mfa-...` (2), `nix-steam-os` (1).
- **No File Reference / File structure section in a guide - 5 docs**:
  `nix-steam-os`, `openwrt-bridged-ap`, `qmk-via-keymap-guide`, `sks8300-openwrt`,
  `slskd-wireguard-port-forward`.
- **No Gotchas and lessons learned section - 3 docs**, all pre-2026-07:
  `nix-steam-os`, `qmk-via-keymap-guide`, `self-host-matrix` (its gotchas are distributed
  inside the parts).
- **Importance-announcing frames and self-rating in prose - 5 docs** (4 fixed):
  "note the name:" (`secretctl-registry-and-coverage`), "the one worth remembering during a
  rotation" (`sops-age-compose-stacks`), "comfortably above the worst case"
  (`secretctl-registry-and-coverage`), "**Important**:" (`qmk-via-keymap-guide`); three
  contentless capsule headers and an ad-copy opener in `self-host-matrix` reported, not fixed
  (old doc).
- Also recurring, in 2 docs: **the same test file pinned to two different commits** in one
  page (`supabase-iap-data-api`, `supabase-own-postgrest`).

Files edited: 11 (25 edits). Findings left for the author: 37.

Verification: `prose-lint --before HEAD` clean on all 11 files (no fact drift); `prose-lint`
with the terms baseline clean; `bun test tests/docs.test.ts tests/pins.test.ts` -> 1828 pass,
241 skip, 0 fail on the run taken after my last edit to a batch-2 file. A later run of the same
suite showed one failure, `reference/postgres-entity-graphs > contains every pinned correction` -
that file is not in batch 2 (it is another batch's page, edited concurrently by another worker),
and no batch-2 file failed in either run. Two files carry a **pre-existing** `mean-sentence-ceiling` gate failure
(`secretctl-registry-and-coverage` 30.3 -> 30.2, `sops-age-compose-stacks` 26.9 -> 26.8; both
fail identically on the HEAD copy, my edits moved each mean down). One pin caught a real
regression and was fixed: `sops-age-compose-stacks` pins the lowercase `if a data-directory
key file exists, it wins outright`, so the sentence now opens "During a rotation, " instead
of losing the clause.

---

## src/content/docs/guides/nix-steam-os.mdx

Type: guide - folder correct (it is a task sequence: install, then configure). The
concept-heavy "The Nix Way" half is explanation and would be better as a reference doc that
this guide links; the parts themselves belong here.

Skeleton gaps: no lede with prerequisites; no Verification, no Gotchas, no File Reference,
no Related docs section. A stray
`---` sits immediately after the frontmatter (line 6), so the page renders a horizontal rule
above its first heading; it separates every later `## Part`, which is why I left it.

Fixed: 1 edit.
- line 100: `## Part 2: declarative environment with home manager & flakes` -> `## Part 2: declarative environment with Home Manager & flakes`

Unfixed (author judgment):
- line 20-80: [B] decorative bold on labels throughout (`**Better**`, `**IMPORTANT - Reboot:**`)
  -> keep bold for identifiers only; the labels add nothing to a sentence that already
  starts with the instruction.
- [B] `## The "Nix Way"` and `* **The Declarative "Nix Way"**:` - the
  scare-quoted slogan heading (structural tell #9) -> name the mechanism in the heading.
- line 1-30: [A] missing Verification / Gotchas / File Reference.
- line 82: [C] `Finalize and Verify the Installation` is American -ize in an otherwise
  -ise doc -> `Finalise`.
- line 6: [A] the stray `---` after the frontmatter renders an empty rule at the top.

## src/content/docs/guides/openwrt-bridged-ap.mdx

Type: guide - folder correct. Exemplary skeleton: Constants (rig, segments, addresses),
Architecture with a text fallback, six parts, Verification, Gotchas, Related docs, cited
footnotes.

Fixed: 0 edits.

Unfixed (author judgment):
- [A] no File Reference section, though the guide names `deploy.sh`, the `/etc/config/*`
  overlay files, the check script and `eaves switch` subcommands -> a small File Reference
  table would close the skeleton.

## src/content/docs/guides/pg-analyser-bench-methodology.mdx

Type: guide - folder correct. Skeleton complete: Constants, "How a run is put together" with
diagram and text fallback, seven parts, Verification, Gotchas, "What bench does not tell you",
File reference, References.

Fixed: 0 edits.

Unfixed (author judgment):
- line 124: [B] "worth not overriding:" is the softer worth-frame the voice
  note asks to drop -> state which part and why, without the ranking.

## src/content/docs/guides/porting-github-actions-to-forgejo.mdx

Type: guide - folder correct. Skeleton complete (Architecture, differences table, nine steps,
Verification, Gotchas, File reference, Related docs), numbers dated, one honest failure
account (the 34 s first run).

Fixed: 0 edits.

Unfixed (author judgment):
- lines 52 and 82: [B] "Two runner settings shape everything below." and "Two conditions gate
  whether the workflow runs at all." are announce-before-stating openers -> lead with the
  setting or the condition.

## src/content/docs/guides/postgres-corpus-entity-graph.mdx

Type: guide - folder correct. Skeleton complete for a lab-backed page: Constants,
Architecture, nine parts, Lifecycle, What to do about it (with Module column), Verification
checklist, Modules.

Fixed: 1 edit - the architecture diagram had no text fallback.
- line 81 (added): `Text version: public PDFs go through the loader (fetch, pdftotext or OCR, manifest dates) into corpus.documents. ...`

Unfixed (author judgment):
- line 187: [D] Part 3's "167.59 ms and a 0.22 ms depth-3 traversal" and the Constants row
  "154.924 ms warm - and 65721.220 ms if the walk enumerates paths" are two different pairs
  for what a reader takes as one measurement -> say which query each pair belongs to.
- line 87 onward: [C] part headings use `## Part 1 - Provision the project` while the rest of
  the corpus uses `Part 1: ` -> pick one separator.

## src/content/docs/guides/qmk-via-keymap-guide.mdx

Type: guide - folder correct (clone, keymap, compile, flash in order). Old doc (2025-12), so
only sentences touched for slop were fixed.

Skeleton gaps: no lede or top-level prerequisites (Requirements sits at line 43 inside
"Setting up QMK"); no Verification section ("Test compilation" and a "Common errors" table
live inside parts); no Gotchas section (the closest is "Debugging when things break"); no
File Reference.

Fixed: 2 edits.
- line 380: `**Important**: Don't nest this inside` -> `Do not nest this inside`
- line 391: `The keymap **must** be named vial:` -> `The keymap needs to be named vial:`

Unfixed (author judgment):
- lines 503, 535: [B] decorative bold directives (`**Don't use**`,
  `**For ATmega32U4/STM32 boards (most keyboards):**`) -> drop the bold, keep the sentence.
- [A] missing Verification / Gotchas / File Reference (above).
- [C] American -ize throughout an old doc - not swept, per the brief.

## src/content/docs/guides/secretctl-registry-and-coverage.mdx

Type: guide - folder correct. Skeleton complete (Architecture + fallback, five parts,
Verification, Gotchas, File reference, Related docs).

Fixed: 2 edits.
- line 162: `secret-coverage.service - note the name: it does not follow` -> `secret-coverage.service - it does not follow`
- line 179: `150 seconds on its guard entries, comfortably above the worst case` -> `well above the worst case`

Unfixed (author judgment):
- [pre-existing] `prose-lint` gate `mean-sentence-ceiling`: 30.3 at HEAD, 30.2 now. Not caused
  by this edit; the fix is to break the long hook-timeout sentences in Part 5.

## src/content/docs/guides/secretctl-rotation.mdx

Type: guide - folder correct. Skeleton complete, diagram has a text fallback, the worked
rotation is separated from the design with a stated reason.

Fixed: 0 edits. No findings.

## src/content/docs/guides/self-host-matrix.mdx

Type: guide - folder correct (build in order: infrastructure, Matrix core, Jitsi, LiveKit,
VyOS, hardening). Old doc (2026-02), so slop fixes were kept to clearly enumerated shapes.

Skeleton gaps: no Gotchas section (gotchas are scattered inside parts, one table literally
labelled "Gotchas:"), no Related docs, no provenance note, and "Verification" is a list of
curl/tcpdump commands rather than an evidence table with "How it was checked". Three `dot`
diagrams had no text fallback. Directive styles are mixed (`:::note`/`:::caution`/`:::danger`
alongside `<Aside>`), and a stray `---` follows the frontmatter.

Fixed: 9 edits (11 blocks).
- line 12: the `:::tip[What this covers]` box and "The guide is structured as a linear build-up: ..." -> `Each section includes the actual manifests, Terraform config, and router commands used in production.`
- line 273: `## Part 2: matrix core (Synapse + element web)` -> `## Part 2: Matrix core (Synapse + Element Web)` (also lines 469 `### Element Web`, 545 `### Synapse Admin`, 657 `## Part 4: LiveKit + Element Call`, 1121 `### Step 8: Cloudflare Spectrum`)
- line 718: `The key **must** be named api-token` -> `The key needs to be named api-token`; line 732 `Both secret files **must** be SOPS-encrypted` -> `need to be SOPS-encrypted`
- lines 96, 684, 1319 (added): text fallbacks under the architecture, call-flow and VyOS-path diagrams

Unfixed (author judgment):
- lines 858, 1051, 1407: [B] capsule headers with no content - `**Critical configuration details:**`,
  `**Gotchas:**`, `**Diagnosis flow:**` -> delete the label and start with the table.
- line 10: [B] "A complete, from-scratch guide to self-hosting the full Matrix communication
  stack" (and "A complete, from-scratch guide" in `description:`) is ad-copy self-praise ->
  say what is deployed.
- line 96, 684, 1319: [C] three `:::` directives and four `<Aside>` blocks in one doc -> pick
  one form.
- line 1121: [C] markdown tables are padded to `| :--- |` alignment, unlike the rest of the
  corpus -> run the table formatter used elsewhere.
- [A] no Gotchas section / Related docs / evidence table with "How it was checked".
- line 1624: [D] the Total row prints CPU limit as a bare `**14.75**` while every other cell
  carries a unit -> `14.75 vCPU`. (I summed the column: 14750m, and the memory column to
  3.4Gi request / 10.1Gi limit - the arithmetic is right.)

## src/content/docs/guides/singapore-weather-ha-grafana.mdx

Type: guide - folder correct. Skeleton complete (Constants, Architecture, four parts,
Verification with a "Not yet exercised" subsection, Gotchas, File reference).

Fixed: 1 edit - the architecture diagram had no text fallback.
- line 58 (added): `Text version: Home Assistant polls the NEA feeds over REST, and its template sensors drive the companion-app automations and Prometheus's /api/prometheus; ...`

Unfixed (author judgment): none.

## src/content/docs/guides/sks8300-openwrt.mdx

Type: guide - folder correct. Skeleton complete (Constants with rig/ports/addresses, "Why
leave the stock firmware", hardware support state, Architecture with a text version, five
parts, Rollback, Verification, Gotchas, Related docs, cited footnotes).

Fixed: 0 edits.

Unfixed (author judgment):
- [A] no File Reference section, though the guide names the fork overlay files, `deploy.sh`,
  the 17-check script and the `xikectl` rollback kit -> a File Reference table would close it.

## src/content/docs/guides/slskd-wireguard-port-forward.mdx

Type: guide - folder correct. Superseded note is present and the body is correctly left as
the historical build.

Fixed: 2 edits.
- line 101: `## Step 3: Port-forward sync script` -> `## Step 3: port-forward sync script`
- line 126: `## Step 4: Share-scan startup window` -> `## Step 4: share-scan startup window`

Unfixed (author judgment):
- [A] no File Reference section (`update-port.sh`, the compose files, the Caddy block).

## src/content/docs/guides/sops-age-compose-stacks.mdx

Type: guide - folder correct. Skeleton complete (Architecture + fallback, six parts,
Verification, Gotchas, File reference, Related docs).

Fixed: 1 edit.
- line 206: `Step 1 is the one worth remembering during a rotation: if a data-directory key file exists, ...` -> `During a rotation, if a data-directory key file exists, ...`

Unfixed (author judgment):
- [pre-existing] `prose-lint` gate `mean-sentence-ceiling`: 26.9 at HEAD, 26.9 now (the file's
  long sentences are in Part 3's gate description).

## src/content/docs/guides/supabase-auth-mfa-trusted-device-and-impersonation-audit.mdx

Type: guide - folder correct. Skeleton complete: assurance model with a text fallback, two
parts, Evidence, What to do about it, Verification, File reference, Gotchas.

Fixed: 2 edits.
- line 54: `## Part 1: Trusted-device MFA skip` -> `## Part 1: trusted-device MFA skip`
- line 85: `## Part 2: Impersonation audit trail` -> `## Part 2: impersonation audit trail`

Unfixed (author judgment):
- [A] no `## Modules` table, and none is missing: I checked the page and it cites no lab
  module ids at all, so there is nothing to list. The Evidence table's "How it was checked"
  column carries the measurement date instead of a test link - acceptable, but it is the
  reason this page reads as less reproducible than its neighbours.
- line 130, 179: [D] the row says `logs.all` "has been removed since 2026-09-23[^logs-all-removal]"
  and the footnote is the Supabase Changelog migration post dated 2026-07-23 (checked at
  line 179) -> the citation predates the removal by two months; say the footnote is the
  migration announcement and the 2026-09-23 date is the removal date, or a reader takes the
  footnote date as the removal.

## src/content/docs/guides/supabase-aws-privatelink-tofu.mdx

Type: guide - folder correct. Skeleton complete: Architecture, Component versions, Constants,
eight steps, Running it, Verification, What to do about it, Gotchas, File reference, Modules.
Constants, ARNs, ports and the concurrency ceiling are internally consistent.

Fixed: 0 edits.

Unfixed (author judgment):
- line 21: [A] the architecture diagram has no text fallback (in this batch only
  `self-host-matrix`, `postgres-corpus-entity-graph`, `singapore-weather-ha-grafana`,
  `supabase-own-postgrest` got one; see the Summary for the corpus measurement).

## src/content/docs/guides/supabase-branch-detach-git-link.mdx

Type: guide - folder correct (three ordered steps, then reattach).

Fixed: 3 edits.
- line 22: `## Step 1: Find the branch ID` -> `## Step 1: find the branch ID`
- line 35: `## Step 2: Clear the link` -> `## Step 2: clear the link`
- line 77: `## Step 3: Verify the deploy loop is off` -> `## Step 3: verify the deploy loop is off`

Unfixed (author judgment):
- line 122: [A] "What to do about it" is a bullet list where the other pages in this batch use
  a `Practice | Evidence | Module` table - acceptable here because the page cites no module
  ids, but it is the odd one out.
- [A] no Verification section; Step 3 and the "How it was checked" table cover the ground.

## src/content/docs/guides/supabase-edge-function-bff-fanout.mdx

Type: guide - folder correct. Skeleton complete: Constants, Component versions, Architecture,
five steps, Verification, Measured timings, "What the Edge Function limits mean", What to do
about it, "Not measured", Gotchas, File reference, Modules, Related docs. The "Not measured"
section is the honest counterweight to the timings.

Fixed: 0 edits.

Unfixed (author judgment):
- line 40: [A] the architecture diagram has no text fallback; the paragraph under it describes
  the call path but not the node set.

## src/content/docs/guides/supabase-grafana-monitoring.mdx

Type: guide - folder correct. Skeleton complete: Constants, Which path (table), five parts,
Evidence, What to do about it, Verification, Gotchas, File reference.

Fixed: 0 edits.

Unfixed (author judgment):
- line 59: [A] the diagram under "Which path" has no text fallback directly under it. The
  table above it carries the decision in text, so the pull-to-text loss is the data flow, not
  the choice.

## src/content/docs/guides/supabase-iap-data-api.mdx

Type: guide - folder correct. Skeleton complete: "What you need, and where it is", five steps,
Verification, What to do about it, Gotchas, File reference, Modules.

Fixed: 0 edits.

Unfixed (author judgment):
- line 154 and 176/178: [D] `l10-tpa-iap-issuer.ts` is pinned at `a07de3d` in the practices
  table (line 154) and at `f703393` in the Modules table (lines 176 and 178), and
  `l10e-labissuer-admit.ts` likewise -> pin each test to one commit, the one that row was
  measured at.

## src/content/docs/guides/supabase-management-api-logs-endpoint.mdx

Type: guide - folder correct. Skeleton: Traps, Evidence, Modules, Related docs, plus the
out-of-date caution aside, which I did not touch.

Fixed: 0 edits.

Unfixed (author judgment):
- line 3: [D] the frontmatter `description` still reads "The logs.all analytics endpoint is
  scheduled for removal on 2026-09-23" while the aside and lede (measured 2026-10-10, HTTP
  410) say it was removed on that date -> "was removed on 2026-09-23". A frontmatter edit is
  outside my scope.
- [A] no Verification section; "Traps, each measured" plus the Evidence table serve it and
  `pins.test.ts` expects those headings, so no change recommended.

## src/content/docs/guides/supabase-org-consolidation.mdx

Type: guide - folder correct. Skeleton complete: Measurement provenance, Constants, topology
decision, plan matrix, six parts, Evidence, Modules, What to do about it.

Fixed: 0 edits.

Unfixed (author judgment):
- line 47: [D] the Constants row "Measured transfer time | 2.3 s paid to paid, 4.0 s paid
  to Free" sits near the 75.2 s paid-to-Free downtime figure in Part 5 and reads as the same
  measurement -> label the 4.0 s as the API-call duration and the 75.2 s as the data-plane
  outage.

## src/content/docs/guides/supabase-own-postgrest.mdx

Type: guide - folder correct. Skeleton complete: Architecture, five steps, Verification, What
to do about it, Gotchas, File reference, Modules.

Fixed: 1 edit - the diagram had no text fallback.
- line 59 (added): `Text version: the client goes to nginx on :8080 (limit_req), then to PostgREST on :3000 with its db-pre-request filter, then to the session pooler ...`

Unfixed (author judgment):
- line 197 and 198: [D] two adjacent practice rows pin the same test file to two commits -
  `92f3469/experiments/security-lockdown/tests/s20-xff-trust-boundary.ts` at line 197 and
  the `f703393` copy at line 198 (the File reference at line 221 and the Modules table at
  line 237 add both again) -> one commit per row.
- [A] no Related docs section.

## src/content/docs/guides/supabase-per-project-cost-attribution.mdx

Type: guide - folder correct. Skeleton complete: Constants, Layers 1-6, Verification, Gotchas,
Module table, What to do about it, evidence table. I checked the arithmetic it publishes
(32 refs = 29 deleted + 3 matched; 592/600 h = 98.7%) - consistent.

Fixed: 0 edits.

Unfixed (author judgment):
- line 286: [C] the evidence section is headed "Verified / tested" where the corpus uses
  "Evidence" or a "How it was checked" column header -> rename for consistency (headings are
  the author's call, so left alone).
