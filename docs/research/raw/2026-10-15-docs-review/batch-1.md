# Batch 1 review

21 guides, reviewed on the four axes (A structure, B prose tells, C house style, D internal
consistency) against `docs/research/raw/2026-10-15-docs-review/BRIEF.md`.

## Method

Read `BRIEF.md`, `erfi-voice` (structural AI tells + both `rg` sweeps), `AGENTS.md` and the
regex-able subset in `tests/lib/mdx.ts` (`LLM_MARKERS`, `REJECTED_MARKERS`) first, so the
rejected markers were never treated as defects. Every doc got a frontmatter and heading read
plus both erfi-voice sweeps; the smaller and prose-dense docs (arr-stack, cfd-cloud-run,
cliamp, diagnosing-llm, esphome, extending-tf, monitor-compose, mongodb-wrapper) were read in
full. The five largest (caddy-compose-waf, k3s-arm64-cluster-ops, k3s-monitoring-stack,
k3s-traefik, magic-wan-interop) were reviewed by full heading outline + targeted reads of the
lede, architecture, verification, closing and diagram-adjacent regions + the sweeps, because
they are mostly code fences; their unverified regions are declared per doc below.
`prose-lint` ran on the whole batch both ways (`--baseline` and `--before HEAD`) as triage;
gate-level numbers are quoted below.

Edits were made in place only where the called-out pattern names the exact defect and the fix
is the minimal block from the erfi-voice catalogue, on docs written since 2026-07; older docs
were reported, not swept, and heading case was only touched where the change is casing-only
(slugs are lowercased, so no anchor moved).

## Summary (recommended fix order)

1. **Two docs fail prose-lint's `mean-sentence-ceiling` gate (pre-existing, not introduced
   here).** `forgejo-primary-fleet-migration` (mean 33.5) and `forgejo-webhooks-composer-gitops`
   (mean 26.6). Both come from the same authoring session in the Forgejo migration work; split
   the long sentences in one pass so they stay consistent with each other. Everything else in
   the batch passes the gate.
2. **Verification table defect** in `esphome-fleet-ssid-migration` (empty `Expected` cell in
   the last row) - a row that renders blank in the table that is the doc's proof. The same
   defect is present in `airgradient-one-esphome-local`.
3. **`magic-wan-interop` is the structural outlier** in the batch: no lede, the heading
   hierarchy starts at h3, no verification or pitfalls section, bold Title Case headings. It
   is also the oldest doc here; decide between a conformance pass and an `<Aside
   type="caution" title="Historical since ...">` if the VyOS/Cloudflare WAN it describes is no
   longer the shape of the network.
4. **Four docs carry the same structural gap** (`gh-actions-cloudflare`, `cfd-cloud-run`,
   `kubectl-cf-access`, `extending-tf-with-api`): no lede, no verification section, no
   pitfalls section, `---` separators, and Title Case sub-headings. Pre-contract docs, so per
   `AGENTS.md` conformance they have earned their exemption; conformance is only required in
   a section you are already editing.
5. `extending-tf-with-api` does not meet the guide skeleton at all - it is a sequence of HCL
   blocks with one heading. Cheapest honest fix is a lede plus a `Verification` list; the
   alternative is re-labelling it a reference.
6. Small B/C sentences below (caddy-compose-waf participle tail, k3s-monitoring lede, k3s-traefik
   self-rating, kubectl-cf-access opener), each one sentence.
7. Six spots of `referent-rotation` at or above 1 (arr-stack, caddy-compose-waf,
   forgejo-webhooks, k3s-arm64 x2, k3s-monitoring-stack, k3s-traefik) - see the aggregate
   section.

## Fixed in place

- `src/content/docs/guides/airgradient-one-esphome-local.mdx`
- `src/content/docs/guides/caddy-compose-waf.mdx`
- `src/content/docs/guides/cfd-cloud-run.mdx`
- `src/content/docs/guides/forgejo-primary-fleet-migration.mdx`
- `src/content/docs/guides/kubectl-cf-access.mdx`
- `src/content/docs/guides/monitor-compose-postgres-prometheus.mdx`

Local verify after the edits: `bun run build` exits 0 with `2041 pass / 131 skip / 0 fail`;
`prose-lint --config .prose-lint.json --baseline .prose-terms-baseline.json <batch>` reports
only the two pre-existing sentence-length gates; `prose-lint ... --before HEAD <batch>` reports
no dropped facts. Anchors checked in `dist/`: all eight `airgradient` `step-*` slugs and
`kubectl-cf-access`'s `cloudflare-access` slug unchanged.

---

## guides/10gbe-link-tuning.mdx

The named exemplar. Constants preamble, per-step verification, Gotchas, Related docs, gates
clean, slop 0.00.

- A: nothing.
- B: nothing. Both sweeps clean.
- C: nothing.
- D: nothing found.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.

## guides/airgradient-one-esphome-local.mdx

Constants preamble, eight steps, verification, gotchas, every claim carries a number.

- A: complete guide skeleton except no `Related docs` heading - the lede cross-links
  `reference/home-iot-network` inline, so the relationship is named. Acceptable.
  **Defect:** the `## Verification` table's last row has an empty third cell (row:
  `| Home Assistant | entities out of unavailable; the ESPHome integration shows every device connected | |`),
  so it renders with a blank `Expected` column. Needs the author's value; find it with
  `rg -n 'entities out of' src/content/docs/guides/airgradient-one-esphome-local.mdx`.
- B: clean. No announce frames, no negative parallelism, no participle tails; code comments
  are dry and specific.
- C: **heading sentence case** - all eight `## Step N:` headings capitalised the first word
  after the colon (`Step 1: Start from upstream`), against 203 lowercase vs 71 capitalised
  across the guide corpus and against this author's own recent docs (`Step 1: swap the
  cable`, `Part 1: prepare the hub side`).
- D: all measured values consistent (the four 2026.x breaks, the AQI 60 s vs `skip_initial: 10`
  arithmetic, the LED bar `restore_mode` pair).
- Fixes applied: eight heading first-words lowercased after the colon (slugs unchanged, verified
  in `dist/`).
- Local verify: prose-lint slop 0.00, mean 17.9, no gate; build green.

## guides/arr-stack-docker-patterns.mdx

Read in full. Two Compose patterns with per-pattern verification, gotchas and related docs.

- A: no top-level `## Verification`; each pattern carries its own `### Verification` with a
  before/after command pair. That is the better shape for this doc - not a defect.
- B: clean. `learned the hard way` in the lede is the one dry-wit phrase and it is the one
  `AGENTS.md` blesses by name.
- C: nothing beyond the aggregate rotation note.
- D: pool paths, UID pins and the slskd to slskarr dating agree with the rest of the corpus.
- Fixes applied: none.
- Local verify: prose-lint slop 0.09/100w (highest in the batch, still far under the 25-word
  mean gate and churn-rate ceiling), referent-rotation 1, build green.

## guides/caddy-compose-waf.mdx

Large (1164 lines) stack walkthrough, pre-contract.

- A: no `## Verification`, no `## Gotchas`, no `## File reference` - the build/test and deploy
  commands are in `## Build and test` / `## Deploy workflow` instead of a verification table.
  Pre-contract, so report only.
- B:
  - `Note that the wafctl stage (5) compiles the sidecar binary ...` - importance-announcing
    frame on the `note the` pattern the erfi-voice sweep names. **Fixed.**
  - `This makes the dashboard Settings panel the single source of truth for WAF mode,
    preventing configuration drift.` - present-participle tail stating a consequence the
    preceding sentence already implies. Report.
  - `The stack applies defence in depth at every layer` - hyperbole plus a self-rating;
    "at every layer" is the part with no measurement behind it. Report.
  - `This namespacing ensures that generated rules ... never collide` - sentence restates the
    table directly above it. Report.
  - `The pre-commit hook deserves special mention` is a **rejected** marker (the author's own
    pre-contract writing uses it). Deliberately not touched.
- C: em-dash 0, semicolons 3, no smart punctuation. `---` separators throughout (pre-contract
  house position).
- D: versions internal to the doc agree (the pinned Caddy image tag, the Coraza fork commit
  `60543c28852e`, CRS v4.21.0 to v4.23.0, one cron job, IPsum refresh by the Go scheduler not
  cron). No cross-doc check of the live stack was in scope.
- Fixes applied: dropped `Note that`, keeping every fact and the `**not**` emphasis.
- Local verify: prose-lint slop 0.04, referent-rotation 1 (pre-existing), no gate; build green.

## guides/cfd-cloud-run.mdx

Cloud Run + Cloudflare Tunnel walkthrough, pre-contract.

- A: **the architecture `dot` diagram had no text fallback** (`---` then `## Network setup`
  followed it). **Fixed** (the brief allows adding a fallback derived from the diagram's own
  labels). Still missing: lede, `## Verification`, `## Gotchas`, `## File reference`.
  Report only (pre-contract).
- B: clean on both sweeps.
- C: `#### Deploy Internal Service (httpbun)` and `#### Deploy Cloudflare Tunnel` capitalise
  the word after the colon / a generic noun. Not swept (pre-contract, section not otherwise
  touched). Report.
- D: the firewall priorities, VPC subnet and Cloudflare edge ranges inside the diagram match
  the prose below it.
- Fixes applied: added the numbered fallback ("The same thing in list form:" + the six diagram
  edges + the VPC/firewall labels). Verified rendering in `dist/`.
- Local verify: prose-lint slop 0.00, mean 9.5, no gate; build green.

## guides/cliamp-wsl2-audio.mdx

Constants, diagnostic, fix, gotchas, command reference, related docs.

- A: no `## Verification` heading; verification is embedded per step plus a
  `## Verify WSLg audio works at all` section. Acceptable, report only.
- B: clean on both sweeps.
- C: nothing found.
- D: the provider-name note (stays `navidrome` regardless of the server behind it) is
  consistent with the command reference below it.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.
- Caveat: reviewed at full-frontmatter/heading + sweep depth; the middle of the file was not
  re-read line by line.

## guides/diagnosing-llm-reasoning-cliffs.mdx

- A: complete guide skeleton (constants, six steps, verification, gotchas). No `Related docs`
  and no cross-link to any sibling session-log doc - the one place in the batch where the
  cross-reference rule bites, since the doc is a method over the same session files the other
  docs describe. Report.
- B: clean on both sweeps. The lede's three-clause symptom list (`asserts instead of
  verifying, asks answered questions, skips the tool built for the job`) is a triplet, but
  every clause is a distinct failure this doc actually diagnoses, so it is content, not
  cadence.
- C: nothing found.
- D: the constants table, the step tables and the lede agree on the worked example (K3,
  transition between 2026-08-19 00:10 and 08:00 UTC, 87-99% to 23-30%). One soft edge: the
  table label says `Aug 20-22` while the lede says the drop happened "in two days" - the table
  row is a three-day range. Report.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.
- Caveat: reviewed at full-heading + sweep depth.

## guides/esphome-fleet-ssid-migration.mdx

Thirteen-device SSID move. Constants, four parts, verification, gotchas, related docs,
footnotes.

- A: **the verification table's last row has an empty `Expected` cell** - the same defect as
  the AirGradient doc. Report; the value is the author's to state.
- B: clean on both sweeps, including the deliberately blunt gotcha lines (`captive_portal:
  without wifi.ap is nothing`, `Wrong old key looks like a dead bridge`). Those are
  statement-first, not frames.
- C: nothing found. Heading case is the corpus norm (`Part 1: prepare the hub side`).
- D: `fleet size (13 here)` agrees with the thirteen devices counted in the lede and in the
  AirGradient cross-link.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.

## guides/extending-tf-with-api.mdx

Pre-contract, 195 lines mostly HCL.

- A: **does not meet the guide skeleton** - one sentence of lede, one `##` heading, no
  verification, no gotchas, no related docs, `---` separators. Report.
- B: `This is the most secure method.` rates the author's own option (importance-announcing /
  self-rating). Report, not swept (pre-contract).
- C: `lacking features` in `description:` is a broken clause (`has limitations or lacking
  features`), and the same sentence ends in `to work around this`. Outside the brief's
  frontmatter exception (it is not a slop word), so reported rather than edited.
- D: the lede pins provider `4.5.2` for the pagination problem while the prerequisites say
  `4.0+`. Both can be true, but the lede's specificity should be dated or the prerequisite
  raised. Report.
- Fixes applied: none.
- Local verify: prose-lint slop 0.00 on 104 words of prose; build green.

## guides/forgejo-primary-fleet-migration.mdx

Post-contract (2026-09-29 run). Architecture with a diagram plus its list fallback, six waves,
verification table, gotchas, file reference, related docs.

- A: exemplar shape. Nothing.
- B:
  - `leaves the deploy tool quietly redeploying stale state` - `quietly` is on the
    metaphor/pet-word sweep and is figurative (a deploy tool does not quietly do anything).
    **Fixed** (word dropped, no fact lost).
  - `needed its deploy key re-registered from scratch afterward - not as a follow-up someone
    remembered to do, but as a required step of the conversion` - negative parallelism.
    **Fixed** to an appositive.
  - `**Push tags last, and only once**, not because tags are unimportant but because ...` -
    the cross-sentence form of the same tell. **Fixed** into two sentences, keeping the bold
    label and the `(Part 3)` back-reference.
  - `Two things made the visibility pass itself worth re-checking rather than trusting the
    first pass:` - count-plus-subject set-up frame in front of the two bullets. Left alone:
    the sentence carries the fact that the pass was re-checked and why, and any rewrite is a
    wash. Report.
  - Not touched: `The public-backup set is not a list maintained by hand at conversion time;
    it is read from the tool's own configuration` - an honest contrast carrying real
    information about where the list lives.
- C: `repo-fleet` as a bare CLI name in prose (backticked in the table, unbackticked in the
  closing sentences) - cosmetic, report. Otherwise clean.
- D: verification table (`47 of 47`, `269` repositories, `206` push mirrors) is internally
  consistent, and the run date (2026-09-29) matches the wave chronology (last pull mirror
  converted 2026-09-27).
- Fixes applied: three, above.
- Local verify: prose-lint slop 0.00 but **GATE `mean-sentence-ceiling` mean 33.5 > 25** (was
  33.8 before these edits, so the gate is pre-existing and not caused here). `--before HEAD`
  reports no dropped facts; build green.

## guides/forgejo-recovery-runbooks.mdx

Ten runbooks with a symptom index, verification, gotchas, file reference, related docs.

- A: complete. Nothing.
- B: clean on both sweeps. The runbook prose is the most measurement-dense in the batch
  (memcg numbers, exact error strings, container ages) and it is written in the house
  statement-first register.
- C: nothing found.
- D: **the lede says "ten distinct outages and near-misses" while runbook 10 is explicitly
  "routine rotation, not an incident"**, and the `description:` enumerates nine. Either the
  lede should say ten runbooks of which one is routine, or the description should list ten.
  Report.
- Fixes applied: none.
- Local verify: prose-lint clean, no gate, build green.

## guides/forgejo-webhooks-composer-gitops.mdx

Post-contract (2026-09-29 run), same authoring session as the fleet migration.

- A: complete (architecture + diagram, five parts, verification, gotchas, file reference,
  related docs). Nothing.
- B: no named tell in prose, but the doc is the second half of the sentence-length gate
  failure - see below. No announce frame or participle tail found on the sweeps.
- C: referent-rotation 1 (pre-existing baseline). Nothing else.
- D: consistent with the fleet-migration doc it pairs with, including the run date
  (`### Run on 2026-09-29`) and the no-delete recipe.
- Fixes applied: none.
- Local verify: prose-lint slop 0.03 but **GATE `mean-sentence-ceiling` mean 26.6 > 25**
  (pre-existing). Build green.

## guides/gh-actions-cloudflare.mdx

Pre-contract (2026-09-24 handover note), the GitHub-hosted variant of the deploy workflow.

- A: no lede (frontmatter, then `:::note`, then `---`), no `## Verification`, no `## Gotchas`,
  no `## File reference`, `---` separators. **The handover note is a plain `:::note` inside the
  body, not the `<Aside type="caution" title="Historical since ...">` directly after the
  frontmatter that `AGENTS.md` prescribes** for a replaced system - the one structural item
  worth fixing here, since the note is the reader's pointer to the successor doc. Both `dot`
  diagrams do have adjacent fallbacks (the compatibility tables, and `Workflow overview` plus
  `Step-by-step breakdown` mirroring the pipeline), so no diagram edit was needed.
- B: clean on both sweeps.
- C: Title Case sub-headings from the pre-contract era (`#### Concurrency Control`,
  `#### Job Environment`, `#### 1. Repository Checkout` ... twelve of them), and emoji status
  glyphs in the comparison tables. Report, not swept (pre-contract, sections not otherwise
  touched; a casing fix would leave the slugs unchanged if the author wants it done).
- D: the Pages/Workers feature matrix and the "this site used it until 2026-09-24" note agree
  with each other and with the Forgejo-side doc this batch also reviews.
- Fixes applied: none.
- Local verify: prose-lint slop 0.00, mean clean; build green.

## guides/k3s-arm64-cluster-ops.mdx

Pre-contract k3s operations manual, 1167 lines, mostly manifests.

- A: no top-level `## Verification` and no `## Gotchas` heading - both are per-part
  (`### Verification`) and inside the known-issue and troubleshooting sections;
  `## Troubleshooting quick reference` and `## File reference` close the doc. Report.
- B: `Everything here was learned the hard way through actual cluster failures. Each section
  includes the root cause analysis, the fix, and the gotchas encountered along the way.` - the
  second sentence narrates the doc's own structure and duplicates the `What this covers` list
  immediately below it. (`learned the hard way` itself is the one blessed dry-wit phrase.)
  Report; the fix is to delete the second sentence.
- C: highest `referent-rotation` in the batch at 2, plus passive 23 - see the aggregate note.
- D: nothing found; version pins and node names are consistent with the k3s companion docs.
- Fixes applied: none.
- Local verify: prose-lint slop 0.06, mean 14.5, no gate; build green.
- Caveat: reviewed at full heading outline + lede/troubleshooting/file-reference reads + sweeps;
  the manifest-heavy middle was not read line by line.

## guides/k3s-monitoring-stack.mdx

Pre-contract, 2267 lines, the largest doc in the batch.

- A: no `## Gotchas` heading (the twelve LogQL pitfalls in `Part 8` carry them), no
  `## Related docs` (the `Historical since` Aside links the successor reference doc, which is
  the relationship that matters). Report.
- B:
  - `The entire stack is deployed as raw Kustomize manifests. No Helm. This gives full
    visibility into every resource, avoids Helm's template abstraction layer, and makes it
    straightforward to patch individual fields.` - the punch fragment `No Helm.` plus a
    three-item cadence list. Report; the fix is one sentence carrying the three facts.
  - The lede's second paragraph narrates the doc's own structure (`The guide is structured as
    a linear build-up: Prometheus Operator and core metrics first, ...`) and closes with
    `Each section includes the actual manifests used in production.` Report.
- C: referent-rotation 1, passive 33 (highest passive count in the batch) - aggregate note.
- D: nothing found; the resource budget total, dashboard counts (16) and component versions
  agree with the file reference below them.
- Fixes applied: none.
- Local verify: prose-lint slop 0.02, mean 12.6, no gate; build green.
- Caveat: reviewed at full heading outline + lede/closing reads + sweeps; the manifest and
  dashboard-generator middle was not read line by line.

## guides/k3s-traefik.mdx

Pre-contract, 1287 lines.

- A: `### Verification` exists per part; no top-level `## Gotchas`; `## File reference` closes
  it. Report.
- B: `The rule engine uses a concise expression syntax with short field names, a recursive
  descent parser, and a tokenizer - all in pure Go stdlib` - `concise` is the author rating his
  own surface, and the clause is the third item in a list, so the adjective is doing no work.
  Report.
- C: referent-rotation 1, passive 27 - aggregate note.
- D: nothing found.
- Fixes applied: none.
- Local verify: prose-lint slop 0.03, mean 13.7, no gate; build green.
- Caveat: reviewed at full heading outline + lede/file-reference reads + sweeps; the CRD and
  manifest middle was not read line by line.

## guides/kubectl-cf-access.mdx

Pre-contract, 707 lines, mostly YAML and a large architecture diagram.

- A: no lede (frontmatter, then `:::tip[Prerequisites]`, then `---`), no `## Verification`, no
  `## Gotchas`, no `## File reference`, `---` separators. The historical statement is a body
  `:::note` rather than the prescribed `Aside type="caution"` after the frontmatter. Report.
  The architecture `dot` **does** have its text fallback (`### Traffic flow details`, inbound
  and outbound numbered) - no edit needed.
- B:
  - `Before we begin we need this set up:` - opener frame with no content. Report (pre-contract
    doc, section not otherwise touched).
  - `PKCE essentially replaces "something you know" (shared secret) with "something you
    generated" (unique proof key).` - accurate, but `essentially` hedges a definition that is
    already exact. Report.
- C: **`## Cloudflare access` was lowercased and had trailing whitespace**, and the Step 1
  heading said `Google workspace`. Both are product-name casing against the house rule.
  **Fixed** (casing only; slugs are lowercased, so `cloudflare-access` is unchanged - verified
  in `dist/`). Not swept: the remaining Title Case sub-headings in this old doc.
- D: nothing found; the diagram's flows, the OIDC paths and the RBAC steps agree.
- Fixes applied: two casing fixes, above.
- Local verify: prose-lint slop 0.00, mean 7.4, no gate; anchor and build checked.

## guides/magic-wan-interop.mdx

Pre-contract (2025 hand-typed original), 1328 lines, the only doc in the batch with intentional
math (`{/* prose-dollar: math-intentional */}`).

- A: **the structural outlier.**
  - No lede at all: frontmatter, then the prose-dollar marker, then `import`, then
    `### Step 1`.
  - No `##`-level headings anywhere: the hierarchy starts at `###` and descends to `######`.
  - No verification section, no gotchas section, no `Related docs`, no `References` - and it
    carries two footnote definitions with no numbered reference list attached to a claims
    section.
  - Report all of it. If the interop it describes is no longer the shape of the network, the
    `Aside type="caution" title="Historical since ..."` path is the alternative to a
    conformance pass.
- B:
  - `The key information is mss 1350, ... This is invaluable for confirming that the
    firewall's MSS clamping is working.` - importance-announcing frame plus a self-rating
    adjective where the number should carry the point. Report.
  - `Let's use arch-2 as an example as the same steps will be replicated on the other node.`
    - `Let's` opener and a duplicated `as`. Report.
  - `not only you're managing the devices and the policies but also the WARP client itself` -
    the additive form of the negative-parallelism tell. Report.
  - `It shares the same functionality as Cloudflare Tunnel does but with bidirectional
    support. This means that only you can expose private services/applications which require
    two-way traffic` - `This means that` filler, and the claim as written does not parse
    (bidirectional supports both directions; `only you can expose` contradicts that). Flagged
    as the one place in the batch where a sentence may be factually wrong rather than merely
    poorly written - needs the author, not an edit.
- C: `#### **MSS Clamping Implementation**`, `#### **Step 1: Discover the Path MTU with
  ping**`, `#### **Step 2: Verify TCP MSS with tcpdump**` - bold plus Title Case in headings,
  and `### Step 2: GRE and/or IPsec Tunnel prerequisites` capitalises a generic noun. Report
  (pre-contract, not swept; a casing-only fix would leave all four slugs unchanged).
- D: MSS arithmetic, MTU values and the tunnel/GRE setup agree across the doc; the two
  footnote definitions are referenced.
- Fixes applied: none.
- Local verify: prose-lint clean on the gate, build green.
- Caveat: reviewed at full heading outline + lede-adjacent, MSS and Cloudflare-side reads +
  sweeps; the Spectrum/Load-Balancer HCL at the tail was not read line by line.

## guides/monitor-compose-postgres-prometheus.mdx

Post-contract. Constants, architecture, four parts, verification, file reference.

- A: **the architecture `dot` diagram had no text fallback** (the `## Part 1` heading followed
  it). **Fixed** with a list derived from the diagram's own nodes and edge labels. Otherwise
  complete.
- B: `Two deliberate choices.` - count-plus-subject set-up frame in front of the two choices.
  **Fixed**: the frame is deleted and the paragraph opens with the first choice, keeping every
  fact (host networking, the DNAT/`forward` chain reasoning, the loopback bind).
  Kept: `Two jobs, two different intervals.` - same family, but the sentence carries the
  interval fact and the YAML below shows it. Report.
- C: nothing found. `\$__rate_interval` is escaped correctly and the table is clean.
- D: addresses agree between the diagram, the exporter configuration and the verification
  table (`192.168.22.59`, `192.168.22.1:9187`, `172.20.3.10`). No contradiction found.
- Fixes applied: two, above.
- Local verify: prose-lint slop 0.00, mean 16.6, no gate; fallback renders in `dist/`; build
  green.

## guides/mongodb-wrapper-archive-migration.mdx

Post-contract, lab-backed (F06, W20), measured provenance, Modules table, `What to do about
it`.

- A: **no lede** - the frontmatter is followed directly by `## The problem`, so the one-line
  "what this is and who it is for" is missing; the reader meets the problem before the tool.
  Report. Everything else is the exemplar shape for a lab-backed page.
- B: clean on both sweeps - and the best-written doc in the batch (no frame, no participle
  tail, every claim carries its measurement or says `not measured`).
  One judgement call: bold/italic on single words in prose (`**static**`, `*live*`, `**whole
  document**`). These are contrastive, not decorative, so left alone.
- C: nothing found. `\$0.125/GB/month` and `\$0.0213/GB/month` escape correctly; the 6x ratio
  arithmetic holds.
- D: nothing found. The `0.0.0.0/0` allow-list, the 10-70x compression range and the
  storage-versus-disk break-even are each declared as design choices or unfixtured ranges.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.

## guides/nas-bulk-data-migration.mdx

Post-contract, featured, measurements with a provenance Aside.

- A: complete except the pitfalls heading is `## Failure modes from the migration` rather than
  `## Gotchas and lessons learned`. The content is right; the deviation is from the corpus's
  heading vocabulary only. Report (low). The verification-chain diagram is followed by one
  subsection per node, so its fallback exists.
- B: clean. `Understand what you are moving before you move it.` is a flat imperative opener
  rather than a frame - it carries the instruction. No named tell found.
- C: nothing found.
- D: nothing found; `zfs list` vs `zpool list`, the hardlink/dataset reasoning and the byte
  counts agree with each other and with the reproducibility claim in the Aside.
- Fixes applied: none.
- Local verify: prose-lint clean, build green.

---

## Cross-doc / aggregate

- **prose-lint, whole batch (21 files):** `TOTAL slop 0.02/100w`. No file is near the churn
  ceiling; `em-dash 0` in all 21, semicolons highest at 19 (forgejo-primary-fleet, 3221 words).
- **Two gate failures, both pre-existing, both in the same authoring session:**
  `forgejo-primary-fleet-migration` (mean 33.5, was 33.8) and
  `forgejo-webhooks-composer-gitops` (mean 26.6). Fix both together - they share a voice and
  the same run dates.
- **referent-rotation >= 1 (all pre-existing, none introduced):** `k3s-arm64-cluster-ops` (2),
  `arr-stack-docker-patterns`, `caddy-compose-waf`, `forgejo-webhooks-composer-gitops`,
  `k3s-monitoring-stack`, `k3s-traefik`. `k3s-arm64-cluster-ops` is the one to look at first -
  it is the only doc at 2, and the k3s trio share vocabulary (`control plane`/`server node`,
  `manifest`/`yaml`) that should be pinned to one form per doc.
- **passive counts are high in the pre-contract manuals** (`k3s-monitoring-stack` 33,
  `k3s-traefik` 27, `k3s-arm64-cluster-ops` 23, `caddy-compose-waf` 21) and near zero in the
  newer guides (2-8). Not actionable per doc, but it is the clearest age signal in the batch.
- **Two docs carry the same verification-table defect** (empty `Expected` cell):
  `airgradient-one-esphome-local` and `esphome-fleet-ssid-migration`. Same author, same week -
  fix together.
- **Four pre-contract docs carry the same skeleton gap** (no lede, no verification, no
  pitfalls, `---` separators): `gh-actions-cloudflare`, `cfd-cloud-run`, `kubectl-cf-access`,
  `extending-tf-with-api`. Per `AGENTS.md` conformance they are exempt until a section is
  edited; two of them also keep a historical statement as a body `:::note` rather than the
  prescribed `Aside type="caution"` after the frontmatter, which is the one structural fix
  worth doing on its own.
- **No `Related docs` heading:** `diagnosing-llm-reasoning-cliffs` (the only post-contract doc
  in the batch with no cross-reference at all), plus the pre-contract docs already listed.

## Not edited, needs author decision

1. `esphome-fleet-ssid-migration` and `airgradient-one-esphome-local`: the missing `Expected`
   value in the Home Assistant verification row.
2. `forgejo-primary-fleet-migration` + `forgejo-webhooks-composer-gitops`: the
   `mean-sentence-ceiling` gate (33.5 and 26.6).
3. `magic-wan-interop`: whether the doc gets a conformance pass (lede, h2 headings,
   verification, pitfalls) or a `Historical since` Aside; and the bidirectional-support
   sentence, which may be wrong rather than just unclear.
4. `gh-actions-cloudflare` and `kubectl-cf-access`: convert the body `:::note` historical
   statement to the prescribed `<Aside type="caution" title="Historical since ...">` after the
   frontmatter.
5. `extending-tf-with-api`: guide skeleton or re-label as reference; and the broken
   `description:` clause.
6. `forgejo-recovery-runbooks`: "ten distinct outages" vs runbook 10 being routine; the
   `description:` lists nine.
7. `k3s-monitoring-stack` and `k3s-arm64-cluster-ops`: structure-narration in the lede
   (delete the "each section includes ..." sentence), and `No Helm.` plus its cadence list in
   the raw-manifests section.
8. `caddy-compose-waf`: the participle tail and the two self-ratings listed under that doc.
9. `kubectl-cf-access`: `Before we begin we need this set up:` and the `essentially` hedge.
10. `diagnosing-llm-reasoning-cliffs`: add a `Related docs` link to the sibling docs that read
    the same session files, and reconcile the `Aug 20-22` table label with the lede's "two
    days".

## Working-tree note for the parent

`git diff --stat` already shows other workers' edits in this checkout (`AGENTS.md`,
`src/content/docs/reference/*`). Only the six files listed under "Fixed in place" plus this
report belong to batch 1; stage explicitly, not `git commit -a`.
