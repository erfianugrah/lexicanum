# Batch 5 review

22 reference docs (`batches/batch-5.txt`). Every doc in the batch is post-2026-07,
so full conformance was in scope, not the pre-contract leniency.

## Method

- Whole-batch sweeps: `prose-lint --config .prose-lint.json --no-max --no-counters`
  and again against `--baseline .prose-terms-baseline.json`; an American-spelling
  regex over `-ize/-ized/-izer/-ization`, `center`, `behavior`, `defense`,
  `judgment` and friends; the erfi-voice importance-announcing / self-rating /
  `and that matters` list; the metaphor and pet-word watchlist; the negative-
  parallelism shapes; a practice-table cell-length check; a dot-fence
  text-fallback check; heading outlines for all 22; and a lede + TL;DR + closing
  extract per doc (script `/tmp/lede.py`, output read in full).
- Full reads: `self-hosted-research-stack`, `knotea-self-hosted-dns`,
  `print-ready-graphics`, `self-hosted-forgejo-router`, and the lede + closing +
  practice table of `rls-without-supabase-auth`.
- Targeted reads (lede, TL;DR, evidence/practices table, references) for the rest.
  The four code-heavy docs - `nixos-router-network-design`,
  `postgres-redundant-writes`, `postgres-entity-graphs`,
  `media-transformation-architecture` - were reviewed by heading outline + lede +
  closing + every sweep hit, not by full read.
- Baseline before edits: `bun test tests/docs.test.ts tests/pins.test.ts` →
  **1828 pass, 0 fail**. After edits: **1828 pass, 0 fail**.
- One edit was reverted by hand: `organizations` and `recognizer` in
  `postgres-entity-graphs` are PINNED in `tests/pins.test.ts` (lines 674 and 676),
  so the American spelling there is frozen by contract. The attempt failed the pin
  and was edited back to the original text.

## Summary

- **B - corporate/whitepaper register, one doc.** `self-hosted-research-stack` is
  written in a different register from the rest of the corpus: abstract openers
  ("A self-hosted research stack provides local coding agents with..."),
  self-rating ("The most insidious failure mode"), an ad-copy closer ("the
  investment pays off in total privacy, unmetered multi-step exploration, and..."),
  and vague adjectives ("substantial overhead", "a significant share", "several
  architectural constraints"). 18 edits applied; the register pattern is reported
  below as a whole-doc finding rather than finished.
- **C - American spelling in post-contract prose, 8 instances in 3 docs.**
  Fixed: 5 body instances. Reported only: 3 heading instances
  (`### Index diversity and specialized engines`, `### Context window optimization`,
  `## Operational failure modes and defenses`), because heading text beyond casing
  is off-limits to this pass and the slug change is the author's call.
- **C - the "X that matters" family, 1 instance.** `rls-without-supabase-auth`
  line 319. Fixed.
- **C - practice-table cells over the 90-character rule, 9 rows in 3 docs.**
  Longest 164 characters. Reported, not rewritten.
- **D - TL;DR figures that disagree with the body, 3 docs.** `qwen38-agentic-tuning`
  (2), `self-hosted-forgejo-router` (1), `media-player-configs` (1, phrasing).
  Reported only, per the brief.
- **A - `media-transformation-architecture` is a repo README in reference
  clothing.** No lede prose, no provenance, no TL;DR, no which-to-pick, no
  evidence table, no Related docs, a `## Development` section of repo-internal
  material, duplicated sections, and 5 dot fences with no text fallback.
  Report-only: the fix is a restructure, not a sentence.
- **A - other structural gaps, report-only.** No evidence table in
  `knotea-self-hosted-dns`, `openaq-pm25-home-assistant` or
  `print-ready-graphics`. **12 of the 22 docs have no `## Decision guide`
  section**, and **11 have no `## Related docs` section** - both are the majority
  of the batch, so they are convention rather than per-doc defects (AGENTS.md
  allows inline cross-links instead of a Related docs list, and an early
  which-do-I-pick table is what carries the decision in most of the 12).
  Cross-referenced against `meta.md`, which already records the missing
  which-to-pick sections from a headings-only pass.
- **Files edited: 5.** `self-hosted-research-stack` (18 edits),
  `knotea-self-hosted-dns` (3), `rls-without-supabase-auth` (1),
  `self-correcting-agent-loop` (1), `media-transformation-architecture` (2).
- **Docs with no B, C or D finding: 9** - `kanban-board-for-coding-agents`,
  `llmc-single-gpu-stack`, `local-model-bench`, `multigres-failover`,
  `nixos-fleet`, `nixos-router-network-design`,
  `pgmig-logical-replication-migrator`, `postgres-redundant-writes`, `secretctl`.
  Their per-doc sections below carry only the corpus-convention observations.

## self-hosted-research-stack.mdx

- **B, systemic.** The whole doc is in a vendor-whitepaper register, unlike every
  other doc in the batch. Fixed the confident instances: abstract openers, the
  self-rating opener of the zero-result section, the ad-copy closing paragraph,
  vague adjectives, and two participle-tail sentences. **Left and reported**: the
  `While single-provider APIs offer straightforward integration, adopting ...`
  setup frame at line 84 (the three subsections below it are the content), the
  "browser tax" figure (it matches the doc's own heading, so removing it here
  would desynchronise the two), and the participle-tail TL;DR bullets.
- **C.** Body `-ize`/`-or` fixed: `centralized`, `customized`, `behavior`,
  `localized`, `utilization`, `unauthorized` (prose, not the HTTP status). Three
  headings still carry American spelling and are reported, not fixed.
- **A.** No closing decision guide. `## Request routing and execution tiers` is a
  routing table, not a which-do-I-pick table; `meta.md` flags P for this doc too.

## knotea-self-hosted-dns.mdx

- **A, fixed.** The query-path `dot` fence had no text fallback. Added a numbered
  list derived strictly from the diagram's own node and edge labels. The fence
  itself omits the house boilerplate (`nodesep`, `ranksep`, `fontname`, node/edge
  font attributes) but carries `bgcolor="transparent"` and no colours, so it
  passes the gate - reported, not touched.
- **B, fixed.** "This is the big sibling of two smaller DNS setups" (metaphor plus
  self-rating) and "the check that matters is the registry-side one" (the
  "that matters" family).
- **A, reported.** The doc publishes measured latency figures (166 ns/op at 7
  allocs, cached UDP ~4.3 ms, DoT handshake ~19.6 ms, ECDSA ~1.8x RSA-2048) and
  cites its method in prose ("the repo's perf-harness notes") but has no evidence
  table with a "How it was checked" column.

## rls-without-supabase-auth.mdx

- **C, fixed.** Line 319, "your verifier is the only clock that matters" →
  "only your verifier's clock is left" (drops the watchlist phrase and the clock
  figure).
- **C, reported.** Two practice-table Practice cells exceed the 90-character rule
  (line 336, 129 chars; line 337, 164 chars). The justification is inline in the
  Practice cell where the rule wants it in Evidence.
- **C, reported.** The `## Not just Cloudflare` heading is the negative-parallelism
  shape. Heading text beyond casing is off-limits here.
- Everything else checks out: the practice table's module ids and commit-pinned
  test links, the `## Modules` table, and the measured-versus-design split all
  read as intended.

## self-correcting-agent-loop.mdx

- **C, fixed.** Line 142, `judgment` → `judgement`.
- **B, reported, borderline.** "once you read them rather than their summaries" and
  "named as unverified rather than smoothed over" both carry a mild self-praise
  tail. Neither is a watchlist phrase, so they were left.
- **A.** No gaps - Provenance, TL;DR, Decision guide, Evidence table and Related
  docs are all present and the provenance section separates measured, design-only
  and asserted.

## media-transformation-architecture.mdx

- **A, the largest structural finding in the batch, report-only.** This is the
  video-resizer-2 README in reference clothing: the body opens with a bare
  fragment lede ("How [**video-resizer-2**] handles media transformation on
  Cloudflare Workers.") followed by a `---` and a bullet list, and there is no
  provenance note, no TL;DR, no which-do-I-pick section, no "Reading the numbers",
  no Evidence table and no Related docs. `## Development` carries repo-internal
  material (Project structure, Bindings, Testing, Operations) that belongs in the
  repository README. `## Architecture diagrams` at the end duplicates
  `### Request flow`, `### Container async flow` and `### Caching layers` from
  earlier sections.
- **A, reported.** All 5 `dot` fences lack a text fallback. Not added: the doc's
  section structure is already duplicated, so adding fallbacks first would
  cement the duplication. The author's restructure should carry them.
- **C, fixed.** "Per data center" → "Per data centre"; "prioritized sources" →
  "prioritised sources".

## qwen38-agentic-tuning.mdx

- **D, reported.** TL;DR line 21 says "NInfer holds 45-64% draft acceptance across
  a whole multi-milestone build-out". The body (line 93) reports "acceptance held
  at a 64% median (45.5-94.4% range)". The TL;DR presents 64% as the top of the
  range rather than the median.
- **D, reported.** TL;DR line 25 quotes "the p99 generation is 9201 tokens". The
  measured table at lines 319-323 carries p95 7,819 and max 9,564; no percentile
  column holds 9,201, and the prose at line 329 only repeats 9,564 as the largest
  ever observed.
- Everything else in the TL;DR was re-checked against the tables and the
  arithmetic holds: 294.6 against 188.8 tok/s, HumanEval 0.671, 10/10 at 262144,
  the 17% sampled-A/B decode drop, the 1308.5 s versus 19.7 s xhigh pair, and
  +93-100% for `ngram-mod`.

## self-hosted-forgejo-router.mdx

- **D, reported.** TL;DR line 29 and the section lede at line 289 both state 206
  push mirrors in the present tense; line 314 says the same-day tidy "brought the
  count to 208". The 206 is the 2026-09-29 `group by` over the `push_mirror`
  table and 208 is after the 2026-09-30 policy tidy, so the present-tense 206 is
  stale by the doc's own account.
- **C, reported.** `prose-lint` reports `referent-rotation=2` here against the
  `repo`/`repository` synonym set (repo 21 + repos 10 against repository 2 +
  repositories 7). Not in `.prose-terms-baseline.json`, so it would fail a
  `prose-terms` run. Left alone: both forms are idiomatic in git prose and picking
  one is a whole-doc choice.
- Nothing else: provenance, which-to-pick, decision guide, component versions,
  the restore-drill numbers and Related docs all read as intended.

## openaq-pm25-home-assistant.mdx

- **A, reported.** No evidence table with a "How it was checked" column, despite a
  dated provenance statement ("Everything here was verified on a personal
  homelab, 2026-10-08") and published counts (~14 active locations within 25 km).
- **A, reported.** `### Statistics-graph "No statistics found"` is a
  troubleshooting item nested inside `## Refreshing the station roster`; it is not
  about the roster refresh.
- **A, reported.** No closing decision guide (`meta.md` flags P).
- **B, reported.** "what each one actually gives you" - filler "actually".
- The TL;DR counts match the source table (NEA 5 regions, IQAir ~30+ markers,
  OpenAQ ~14 active within 25 km) and the HA entity-id example matches its stated
  slugification rule.

## pbkdf2-supabase-auth-migration.mdx

- **C, reported.** Four practice-table Practice cells exceed 90 characters (lines
  350, 351, 352, 356 - 149, 120, 106 and 133 characters).
- Skeleton is complete (TL;DR, Which strategy to pick, What to do about it,
  Security checklist, Reproducing) and the evidence rows carry Measured / asserted
  inline against the provenance note's own split. No other finding.

## media-player-configs.mdx

- **D, reported, phrasing.** TL;DR line 20 says "MPCVR is the 2.7.4 default". Line
  84 says "Since 2.7.4, MPCVR is the default renderer on modern systems" and the
  table at line 90 says "2.8.x default on modern systems". The TL;DR reads as
  "the default in 2.7.4" rather than "default since 2.7.4".
- Nothing else: the provenance note dates both installs and points at the evidence
  table, and the evidence table's Status column (measured / source-verified /
  documented) covers every row.

## print-ready-graphics.mdx

- **B, reported.** `## The real print gotchas in an SVG` - "real" is the
  self-rating shape and "gotchas" is the doc's own heading choice. Heading text
  beyond casing is off-limits here.
- **C, reported.** The TL;DR italicises `*worse*` for emphasis.
- **A, reported.** No provenance note, no evidence table, no closing decision
  guide, no Related docs. The doc publishes no measurements, so the provenance and
  evidence gaps are the weaker half of this.
- Arithmetic re-checked: 1000 px across 300 mm is ~85 DPI, and 3600 px at 30 cm is
  ~305 DPI. Both correct as stated.

## local-model-bench.mdx

No B, C or D finding. Provenance note dates the rig, the TL;DR arithmetic holds
against the tables (+15.1% gen, +38.1% prompt processing, -20% TTFT, 2.7x decode,
0.944 case-hit, 10-45 minutes against 75), and the evidence table splits measured
from community-reported. `## Which model for which job` is the which-to-pick
section; the doc has no `## Decision guide` (one of the 12 noted in the aggregate
section).

## secretctl.mdx

No B, C or D finding, no edits. The TL;DR counts were re-checked against the
command list (five verbs on one source reference, four on the registry), the
`## Worked example` is a live run against a scratch registry, and the provenance
note says which parts were read from source. `prose-lint` gates this file on
`mean-sentence-ceiling` (mean 26.8 words over 3,174) - identical at HEAD, so it
predates this pass and is the author's call.

## nixos-fleet.mdx

No B, C or D finding, no edits. The evidence table has both a "How it was
checked" column and a Status column, and the doctor check count is dated against
its own growth ("18 runtime checks, offline-capable (16 when this page was written
on 2026-09-02)").

## multigres-failover.mdx

No B, C or D finding, no edits. The most complete lab-backed doc in the batch:
topology with a text fallback, Reading the numbers, What to do about it, Evidence,
Modules with both test and artifact links pinned to commits, and Related docs. The
Modules table honestly records "none published for the MG06 re-run".

## llmc-single-gpu-stack.mdx

No B, C or D finding, no edits. The evidence table splits design-read / measured /
documented and states plainly that "No figure on this page was measured for it",
pointing at the two pages that carry the numbers. `## Which control for which
situation` is the which-to-pick section; no `## Decision guide`.

## self-hosted-monitoring-topology.mdx

No B, C or D finding, no edits. The evidence table's Status column includes
"Design only" and "Partly measured", and the design-only row says no link failure
has been ridden out since the second store was added. The cross-links are inline
rather than in a `## Related docs` section (one of the 11 noted in the aggregate
section).

## pgmig-logical-replication-migrator.mdx

No B, C or D finding, no edits. The rename gloss is present in the shape AGENTS.md
wants (`pgmig` now, `sbshift` until 2026-09-28, `pgshift` before the 2026-07-03
rename, with the `CHANGELOG.md` reference), and every footnote link is pinned to
commit `ba5f88c` rather than a branch.

## nixos-router-network-design.mdx

No B, C or D finding, no edits. The 18-check table (`Check | Command | Asserts`)
is the evidence and the doc claims no measurements, so the absent evidence table
is not a gap. Register observation only, reported not edited: the lede's
participle plus rule-of-four construction ("runs NixOS ... terminating public WAN
traffic and providing inter-VLAN routing, stateful firewalling, DHCP, and edge
proxying").

## postgres-redundant-writes.mdx

No B, C or D finding, no edits. The provenance block is the most precise in the
batch (image tags, fixture shape, rep count, and an explicit note that every
figure outside the OrioleDB section ran on the local rig and nothing ran on a
hosted project). The skeleton is complete including `## Modules`.

## postgres-entity-graphs.mdx

- **C, reported and deliberately left.** Lines 68-69 read "not a production
  named-entity recognizer: a 24-row review of 561 persons and 2284 organizations",
  against the doc's own British "organisation" in the same section's heading and
  at line 253. Both strings are PINNED in `tests/pins.test.ts` (lines 674, 676),
  so the American spelling is frozen by contract. An edit was attempted, failed
  the pin, and was reverted by hand.
- **C, reported.** Three practice-table Practice cells exceed 90 characters (lines
  553, 554, 560).
- Otherwise complete: Modules, Evidence, What to do about it, Reading the numbers,
  and a provenance statement at line 36 naming the rig and version.

## kanban-board-for-coding-agents.mdx

No B, C or D finding, no edits. Decision guide with a text fallback, an Evidence
table, and a Related docs list; no numeric claims to cross-check.

## Aggregate findings

- **American spelling outside the exempt categories.** 8 instances in 3 docs. 5
  body instances fixed; 3 heading instances reported. Exempt and deliberately left
  alone: `## Operational failure modes and defenses` (heading), `"utilization"` at
  `qwen38-agentic-tuning` line 41 (a quoted metric label), `sitecustomize` at
  `local-model-bench` line 155 (a Python module name), `catalog-pg-class.html` at
  `postgres-redundant-writes` line 581 (a URL), `bgcolor=` in the `knotea` dot
  fence (an attribute name), the quoted PostgreSQL sentence "the normal behavior
  which always performs a" at `postgres-redundant-writes` line 92, the HTTP
  `Authorization`/`Unauthorized` forms, and the PINNED `organizations` /
  `recognizer` pair.
- **Practice-table cells over the 90-character rule.** 9 rows across 3 docs
  (`pbkdf2-supabase-auth-migration` 4, `postgres-entity-graphs` 3,
  `rls-without-supabase-auth` 2), longest 164 characters. AGENTS.md wants the
  imperative alone in Practice with the justification in Evidence; several rows
  carry the justification inline. Not rewritten - shortening them means moving
  text between columns, which is a judgement about what each row is evidence for.
- **Missing text fallback under a `dot` diagram.** `knotea-self-hosted-dns` (1,
  added) and `media-transformation-architecture` (5, reported - see that doc's
  section). Every other `dot` fence in the batch has a fallback. All fences in the
  batch carry `bgcolor="transparent"` and no colours, so the gate passes
  everywhere.
- **Bolded `**TL;DR**` rather than a `## TL;DR` heading.** 15 of the 22 docs.
  `meta.md`'s headings-only audit records these as a missing section; the corpus
  has both forms and the convention note in `meta.md` says it is not a defect, so
  none was changed.
- **`---` horizontal-rule separators** appear throughout the reference corpus,
  including in the named exemplar `cloudflare-supabase-architecture`, so they are
  convention rather than a gap.
- **Clean across the whole batch**: no LLM marker, no em-dash, no smart
  punctuation, no math-risk dollar, no broken internal link, no split table, no
  footnote imbalance. Those are the build-gated classes and the gate was green
  before and after.
