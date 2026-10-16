# Fix batch 5

Scope: `batches/batch-5.txt` minus `reference/media-transformation-architecture.mdx`
(another worker's file, untouched). 21 files reviewed against `batch-5.md`,
`meta.md` (section 2 rows) and `diff-verify.md`; **11 edited**.

Verify (all three commands from `BRIEF.md`, on the 11 edited files):

- `prose-lint --config .prose-lint.json --before HEAD --no-max <files>` -
  **1 FAIL**: `qwen38-agentic-tuning` `gate fact-retention - dropped 1 of 368
  facts from the previous revision: 45`. See "Open" for that file below.
  Every other file: no gate.
- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline
  .prose-terms-baseline.json <files>` - clean; the only rotation reported is
  `self-hosted-forgejo-router` `referent-rotation=2`, which is at HEAD and is
  left (see that file below).
- `bun test tests/docs.test.ts tests/pins.test.ts` - **1828 pass, 241 skip,
  0 fail** (1969 expect() calls), identical to the batch-5 baseline.

diff-verify leftovers for this batch were re-checked and are all already in the
tree at HEAD except the one superseded below: `self-hosted-research-stack` :253
("unauthorised internet traffic"), :302 ("gains privacy, unmetered multi-step
exploration") and :88 ("has unmetered search capacity") are present as the
review asked; `knotea-self-hosted-dns` :16 ("close relatives of this one") is
present.

## Number changes

| path:line | before | after | evidence |
|---|---|---|---|
| `reference/qwen38-agentic-tuning.mdx:21` | "NInfer holds 45-64% draft acceptance" | "NInfer holds a 64% median draft acceptance (45.5-94.4% range)" | body line 93: "acceptance held at a 64% median (45.5-94.4% range) for the whole run"; the TL;DR presented 64% as the top of a range when it is the median |
| `reference/qwen38-agentic-tuning.mdx:25` | "on real work the p99 generation is 9201 tokens and nothing has exceeded 9564" | "on real work the p99 generation is 9201 tokens, the p95 is 7,819, and nothing has exceeded 9564" | the measured table (202 requests) carries p95 7,819 and max 9,564; 9,201 appears in no percentile column, so per the fix brief both figures stay and each now says what it measures |
| `reference/self-hosted-forgejo-router.mdx:29` (TL;DR) | "206 push mirrors to GitHub, ..., all syncing on commit and on an 8h interval." | same, plus "The 2026-09-30 policy tidy enrolled two missed repos, bringing the count to 208." | line 314: the policy tidy "brought the count to 208"; 206 is the 2026-09-29 `group by` over `push_mirror` and the pin "269 repositories" is untouched |
| `reference/self-hosted-forgejo-router.mdx:290` (section lede) | "206 push mirrors exist, one per mirrored repo." | "206 push mirrors existed on 2026-09-29, one per mirrored repo (208 after the 2026-09-30 policy tidy below)." | line 314; the present-tense 206 was stale by the doc's own account |

`reference/media-player-configs.mdx:20` is a phrasing change, not a number
change: "MPCVR is the 2.7.4 default" -> "MPCVR has been the default renderer
since 2.7.4" (2.7.4 kept), against line 84 "Since 2.7.4, MPCVR is the default
renderer on modern systems".

## New anchors

- `reference/self-hosted-research-stack.mdx`: `index-diversity-and-specialized-engines`
- `reference/self-hosted-research-stack.mdx`: `context-window-optimization`
- `reference/self-hosted-research-stack.mdx`: `operational-failure-modes-and-defenses`

Each is `<a id="..."></a>` on the line after the converted heading
(`specialised`, `optimisation`, `defences`). No doc or test referenced the old
slugs, so the anchors are for external links.

## reference/qwen38-agentic-tuning.mdx

- **Fixed, D (2).** The two TL;DR figures above.
- **Open.** `prose-lint --before HEAD` fails on one loose token, `45`. It came
  only from the removed "45-64%" band; the corrected range endpoints tokenise as
  `45.5` and `94.4%`, so the bare `45` cannot survive without restoring the wrong
  band. AGENTS.md's own exception ("if a number genuinely no longer applies, drop
  it in its own commit with the reason") is the path; the reason is recorded here
  for the commit message. The alternative - keeping "45-64%" - would reinstate
  the disagreement the reviewer flagged.
- **Left for the author.** Whether 9,201 is a real p99 from the raw run data.
  If it is, the measured table is missing the column and should carry it; if it
  is not, the TL;DR can drop it (which would also clear the residual gate).

## reference/self-hosted-forgejo-router.mdx

- **Fixed, D (1).** The 206/208 staleness, both places.
- **Open, C.** `prose-lint` `referent-rotation=2` against the `repo`/`repository`
  set (repo 21 + repos 10 against repository 2 + repositories 7). The majority
  form is `repo`, but the pin `"269 repositories"` in `tests/pins.test.ts` forces
  the minority form to stay, so the rotation cannot be cleared without editing a
  test. Left, as batch-5 also left it.

## reference/self-hosted-research-stack.mdx

- **Fixed, B.** Finished the register pass on the instances batch-5 reported
  open: the setup frame ("While single-provider APIs offer straightforward
  integration, adopting ... resolves several architectural constraints" -> "A
  self-hosted metasearch aggregator such as SearXNG avoids them"), "creates
  severe performance bottlenecks" -> "is expensive", "implements a two-phase
  retrieval model that prioritises static extraction while preserving browser
  fallback capabilities" -> "prioritises static extraction and keeps the browser
  as a fallback", the lede's abstract "The architecture decouples ... into
  independent services exposed through", and the redundant second edge-proxy
  sentence folded into the first. The "browser tax" figure and the
  participle-tail TL;DR bullets stay: the first matches the doc's own heading,
  the second are descriptive benefit lists rather than grading tails.
- **Fixed, C.** The three American-spelled headings converted, with old-slug
  anchors. This supersedes the diff-verify advice to revert to "defense": the
  section is now consistently British (heading `defences`, table header
  `Mitigation and defence`, row `anti-DNS-rebinding defence`, list intro
  `Defences against silent engine degradation include:`), so no mixed spelling
  remains in it.
- **Open, A.** No which-to-pick table. `## Request routing and execution tiers`
  is a request-routing table, and the doc compares no deployable options, so per
  the fix brief nothing was forced in.

## reference/knotea-self-hosted-dns.mdx

- **Fixed, A.** Added `## Evidence` (between Reading the numbers and Decision
  guide), built entirely from the doc's own statements: a "How it was checked"
  column and a Status column (measured x5 from the repo perf harness, one dated
  operator record for the 2026-09-18 blue-green cutover, one documented backup
  row, one design-only row for the unbuilt second Knot machine).
- **Fixed, A.** The query-path `dot` fence now starts with the house boilerplate
  (`nodesep`, `ranksep`, graph `fontname`, node/edge font attributes), keeping
  `bgcolor="transparent"` and the existing `style=rounded`.
- **Open.** Nothing.

## reference/openaq-pm25-home-assistant.mdx

- **Fixed, A.** Added `## Reproducing and evidence` before Related docs: seven
  rows, five probed on the homelab install the provenance note dates
  (rate limits, the 14-station roster query, the `/v3/locations/{id}/latest`
  shape, entity-id slugification read from `core.entity_registry`, the
  projection-slug bug seen through Prometheus) and two documented (NEA five
  regions / IQAir ~30+ markers, the EPA AQI breakpoints).
- **Fixed, A.** `### Statistics-graph "No statistics found"` promoted to `## ...`:
  it is a standalone troubleshooting item, not a roster-refresh step. The slug is
  unchanged (level does not affect it).
- **Fixed, B.** "what each one actually gives you" -> "what each one gives you".
- **Open, A.** No which-to-pick section. `## Source landscape` already carries a
  `Best use` column per source, which is the pick; no second table was added.

## reference/pbkdf2-supabase-auth-migration.mdx

- **Fixed, C (4 rows).** Practice cells 350, 351, 352 and 356 (149, 120, 106,
  133 chars) now under 90 with the justification moved into Evidence, every API
  path and identifier kept (`admin.createUser({ password_hash })`,
  `email_confirm: true`, `DISABLE_LEGACY_FALLBACK`, "at the source's iteration
  count and PRF", "in a deployed Edge Function", "before the cutover").
- **Open.** Nothing.

## reference/rls-without-supabase-auth.mdx

- **Fixed, C (2 rows).** Practice cells 336 and 337 (129, 164 chars) now under
  90; the full SQL path `revoke execute on function public.claims_uid() from
  public;` is kept in the Practice cell, with the advisor run, the lint names
  and the `ENOTFOUND tenant/user` fall-through moved to Evidence.
- **Open, B.** `## Not just Cloudflare` is still the negative-parallelism shape.
  Heading text beyond casing is outside this pass's remit (only American
  spelling in a heading was authorised), so it is left for the author.

## reference/postgres-entity-graphs.mdx

- **Fixed, C (3 rows).** Practice cells 553, 554 and 560 (131, 94, 96 chars) now
  under 90; "set `cost` to the inverse evidence weight", "make no recall claim
  from synthetic vectors" and "set bulk-load timeouts in-session" moved into
  Evidence.
- **Untouched.** `organizations` and `recognizer` (lines 68-69, pinned).

## reference/print-ready-graphics.mdx

- **Fixed, C.** TL;DR `*worse*` italic removed.
- **Fixed, A.** Added `## Which file for which ask` before `## What to send`,
  built from the doc's own deliverable comparison (vector PDF master + 3600 px
  PNG fallback, CMYK with the "conversion is generic" caveat, `.ai` as a re-save
  of the same vectors, spot colour for an exact brand match decided by the
  printer).
- **Open.** Provenance note - the doc states no measurements, so there is
  nothing to date; evidence table - **n/a**, the only figures are the DPI
  conversions (1000 px / 300 mm, 3600 px / 30 cm) which are arithmetic, not
  measurements; Related docs - no sibling doc exists in the corpus
  (`print-ready-graphics` has no inbound or outbound pair to name);
  `## The real print gotchas in an SVG` still carries the self-rating "real"
  (heading text beyond casing is out of scope).

## reference/media-player-configs.mdx

- **Fixed, D (1, phrasing).** The TL;DR now says the default holds since 2.7.4.
- **Open.** The doc still holds both "Since 2.7.4, MPCVR is the default renderer
  on modern systems" (line 84) and "2.8.x default on modern systems" (renderer
  table). Nothing in the doc settles which is right and the cited source is the
  2.8.2 release notes, so both figures are kept and the tension is left for the
  author to resolve with the 2.7.4 notes.

## reference/self-correcting-agent-loop.mdx

- **Fixed, B (2, borderline, reported by batch-5).** Lede "and what the primary
  sources from 2026 actually say once you read them rather than their summaries"
  -> "and what the primary sources from 2026 say"; Provenance "Anything the
  research left unverified is named as unverified rather than smoothed over."
  -> "Anything the research left unverified is named as unverified."
- **Open.** Nothing.

## Files with no open finding, not edited

- `kanban-board-for-coding-agents.mdx`, `llmc-single-gpu-stack.mdx`,
  `local-model-bench.mdx`, `multigres-failover.mdx`, `nixos-fleet.mdx`,
  `nixos-router-network-design.mdx`, `pgmig-logical-replication-migrator.mdx`,
  `postgres-redundant-writes.mdx`, `secretctl.mdx`,
  `self-hosted-monitoring-topology.mdx` - clean on all axes at HEAD (batch-5
  agrees: no B, C or D finding).
- Which-to-pick marked **n/a** for `multigres-failover` and `nixos-fleet`
  (single-system docs; their comparisons are of fault scenarios and fleet
  members, not of options to pick) and for `nixos-router-network-design` /
  `postgres-redundant-writes` / `secretctl` / `self-hosted-monitoring-topology`
  where the decision content is already inline.
- Bold `**TL;DR**` rather than a `## TL;DR` heading: left, per batch-5's
  aggregate finding that the corpus carries both forms.
