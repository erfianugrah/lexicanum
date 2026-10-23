# Batch 7 - fixes and new findings

Worker: docs fix batch 7. Branch `main`, no commits made (all git left to the parent).
Files in scope: the 11 docs in `batches/batch-7.txt` (all `reference/supabase-*.mdx`).

All 11 were reviewed on the four axes of BRIEF.md. The round-1 reviewer had read 2 of
them in full; the nine others were read here, most of them line by line. Three large
docs (see "Coverage" below) were read in their D-relevant sections rather than
line-by-line, because the context budget for this worker did not survive four whole
1,000-line pages plus every table in them.

## Coverage, honestly

Read in full, this session: `supabase-image-transformations-billing`,
`supabase-dr-tiers` (417 lines), `supabase-logs-volume`, `supabase-observability-surface`,
`supabase-orioledb`, `supabase-pipelines`, `supabase-edge-function-limits` (lede, TL;DR
and everything from `## What to do about each ceiling` to the end), `supabase-jit-database-access`
(lede, `## Docs versus runtime`, `## Reading the numbers`, `## What to do about it`).

Read in their D-relevant sections only: `supabase-incident-resilience` (TL;DR,
`## Which do I pick`, `## Which classes apply to you`, `## Class 8 ... Docs against
runtime`), `supabase-multi-tenant-placement` (frontmatter, lede, TL;DR, `## Related`,
plus targeted greps for every first-person pronoun and every twin of a TL;DR figure),
`supabase-data-surface-lockdown` (lines 1-175 and 514-593; the option sections 176-513
were not re-read because that page's earlier round read them for a different batch).

## Old findings - disposition

| Finding (batch-7.md / meta.md) | Disposition |
|---|---|
| `supabase-edge-function-limits` does not link `guides/supabase-edge-function-bff-fanout` (meta.md one-way pair) | Fixed. Bullet added under `## Related docs` naming the relationship: the guide is the implementation of the ceilings, and "the guide links back here for the numbers". |
| `image-transformations-billing` line 89 "Three measured disagreements" vs what follows | Fixed. The opening sentence now names the three: the 1-2500 bound (wrong at both ends), the Pro-plan-only sentence, and what the runtime accepts as a transform request. The third paragraph now names the documented claim it contradicts (the bound's lower end), keeping `width=abc`, the 400 body, `width=0`, "no params" and `&bust=xyz`. |
| `image-transformations-billing` missing `## Modules` table (cites I02-I09) | Fixed. `## Modules` added between the Evidence table and the footnote definitions, one row per id, with the test file per id and `none published` for the artifact (the experiment has no `out/` directory). The doc contains no lab links at all, so the links were built from the lab repo and pinned to `b9bb064` (the commit that created I01-I10, matching the page's 2026-08-18 measurement date); the file list was verified against that ref through the GitHub API. |
| `supabase-dr-tiers` has no decision diagram | Fixed. A `dot` decision guide (house boilerplate, no per-node colours) after the `## Which do I pick` table, built only from that table's own rows, with the required text fallback directly under it. |
| First-person singular in `supabase-multi-tenant-placement` | Fixed, 2 places: "I confirmed the Micro figure straight from the live billing API" -> "The Micro figure comes straight from the live billing API"; "I tested it three ways" -> "It was tested three ways". The "If you are asking / Go to" routing table keeps the reader's first person ("I just want one bill") - that is the table's voice, not the author's, and was left alone. |
| TL;DR label form | Fixed in both outliers of this batch: `**TL;DR** -` -> `**TL;DR:**` (`dr-tiers` line 35, `incident-resilience` line 40). Corpus form is 48 `**TL;DR:**` against 2 of this dash form. |
| `incident-resilience` "53 of 66 reference docs" style meta findings | N/A to this batch; meta.md section 2 for these docs is the TL;DR-heading convention, not a defect (summary item 2). |

## New D findings (nine previously unread docs)

### supabase-logs-volume

**D-1. The windowed-count practice row attributed the undercount to the wrong run.**
The row read "in `run2` the windowed count was 0.98 `function_logs` rows per call against
1.9 by id", while the body says "`run1` did that and attributed 0.98 `function_logs` rows
per invocation" and "`run2` counts by `log_attributes['function_id']` from the start of
each phase". The 0.98/1.9 pair spans the two runs. **Fixed** (attribution split, module
cell now `LV01e, run1 and run2`).

**D-2. `Rows per action` / `Bytes per action` are all-sources totals while four cells
name `edge_logs`, so the same event reads two ways on one page.** `LV01j` shows
`0.97 (1.12)` and `1014 (1144)`, and its prose immediately says 100 cache HIT-reads
"produced 99 (`run1`) and 90 (`run2`) `edge_logs` rows". Settled from the published
artifacts (`out/2026-10-15`, ref `f7e86f3`): `run2` LV01j `edge_logs_rows_raw` 90,
`edge_logs_rows_per_action` 0.90, `all_sources_rows_per_action` 0.97,
`all_sources_bytes_per_action` 1014; `run1` 99 / 0.99 / 1.12 / 1144. Same pattern for
`LV01b`: run2 `edge_logs` 0.92 / 1662 bytes against `all_sources` 0.91 / 1659, and run1
0.84 / 1518 against 0.85 / 1520 - which is exactly what the table prints. So both the
table and the prose are faithful, but one column mixes per-source and all-sources
figures (`LV01d` is the only cell that says "all sources"). **Fixed** by declaring the
metric in one sentence under the table; no figure changed.

### supabase-dr-tiers

**D-3. The tested size span in the tier table excluded the largest control on the page.**
The table said "measured 30-81 s to `ACTIVE_HEALTHY` at 10-574 MB on Small", while the
same section names a 715 MB control restored in 41 s ("The 574 MB control restored in
40 s and the 715 MB control in 41 s", 40 s and 41 s being two of the five `30, 30, 40,
40, 41 s` control readings) and the pooler row reports "5-13 s on 10 MB and on a 715 MB
control". **Fixed** - see Number changes.

### supabase-pipelines

**D-4. The TL;DR asserted a causal attribution the body marks as an inference.** The
DDL bullet read "...and a later out-of-range value made the replicator process exit",
while the body says "The attribution of the failure to the out-of-range value is an
inference from the pair: row `b=1` passed and row `b=5000000000` failed after the same
type change", and the exit itself was recorded on a later `b=1` probe. **Fixed**: the
TL;DR now marks the inference; no figure changed.

**D-5 (not fixed, needs the lab owner). `safe_wal_size` does not reconcile with the
stated `max_slot_wal_keep_size`.** The page says the source's limit "was 512MB, which is
536.9 MB (10^6-byte MB throughout)". Retained plus safe readings close within each run
but not to that limit:

| Reading | retained | `safe_wal_size` | sum |
|---|---|---|---|
| run 1, before writes | 1 MB | 552.5 MB | 553.5 MB |
| run 1, after 75,000 rows | 47.2 MB | 506.3 MB | 553.5 MB |
| run 2, before writes | 0 MB | 547.7 MB | 547.7 MB |
| run 2, after 75,000 rows | 30.7 MB | 517 MB | 547.7 MB |

The two runs are internally consistent, so no single cell is a typo, and both totals sit
10.8-16.6 MB above the stated 536.9 MB. The published facts file for the run
(`experiments/pipelines/out/2026-10-10/run-2026-10-10T07-27-52-201Z.facts.md`, ref
`ddd41b2`) carries the same pair in the same cells - `max_slot_wal_keep_size_mb` 536.9
beside `safe_wal_size_mb` 552.5 with `retained_mb` 1 - so the doc is faithful to its
artifact and the mismatch is upstream (API semantics or the probe's unit conversion).
No number changed; either the limit the platform applied was not 536.9 MB, or
`safe_wal_size` is not simply limit-minus-retained here. Left for the lab owner.

### supabase-incident-resilience

**D-6. "Most readers need four of the thirteen classes" contradicted the table
directly below it,** which gives Free 6 classes (`1, 2, 4, 5, 7, 12`), Pro 9
(`1-8, 12`), Team/Enterprise all 13. **Fixed** - see Number changes.

**D-7 (low, not fixed).** In `## Which do I pick` the row "Bad DELETE / bad migration |
PITR - the standby replicates the mistake in 34ms | ~$100+/mo | Documented" places a
measured lag figure (34ms, W05) in a row whose Evidence cell says "Documented". The cell
is about PITR's documentation and the 34ms is the reason PITR and not the standby, so
it reads correctly, but the evidence class of that parenthetical is unmarked. Left as a
wording choice for the author.

### supabase-data-surface-lockdown

**D-8. "Two disagreements are recorded above" undercounts its own page.** The two named
were the `404 PGRST205` of the SELECT-only revoke against the `42501` of the
four-privilege revoke, and a removed `logs.all` still listed in the OpenAPI document.
The evidence table above it also records three documentation mismatches: `CREATE
EXTENSION ... VERSION` ignored with a warning (and every `ALTER EXTENSION ... UPDATE`
form erroring `XX000 pgaudit stack is not empty`, "where the changelog says the update
proceeds"), the Realtime-schema operations the changelog lists as refused (4 of 10
allowed), and a project created 2026-08-28 still carrying the pre-2026-05-30 grant
default. **Fixed** by re-scoping the count to API-shape disagreements and naming the
three documentation mismatches, and by widening "Filed upstream: no, for either" to
"for any of them". Every figure kept.

### supabase-multi-tenant-placement

**D-9 (structural, not fixed).** The page has no `## Evidence` table. Its measured
claims - provisioning `131-159 s`, the Micro billing figure read from
`GET /v1/projects/{ref}/billing/addons`, the session-carry `S04` results - are carried
by the practice table's Evidence column and inline artifact links instead. Every twin
of a TL;DR figure was checked against the body and they agree (131-159 s at lines 357,
370-371, 380; `$10/mo` -> `$10k/mo` at 95-96; "two instant API calls - create the user,
insert the row" at 359). Flagged, no edit: adding an evidence table is a structural
addition, and the D axis is about the numbers being wrong, not about the doc's shape.

### supabase-orioledb

**D-10 (not fixed). `orioledb.main_buffers` is reported in two units on one page.** The
crew table gives the Pro project `orioledb.main_buffers 65536` (blocks) and the Free
project `shared_buffers 224MB and orioledb.main_buffers 224MB` - a block count in one
row and an MB value in the other, so the two rows cannot be compared without a
conversion, and the reader cannot tell whether the Free read was converted by the probe
or by the API. No lab artifact was read for this, so no edit; the cheapest fix is to
print both in one unit.

### Checked and clean

- `supabase-observability-surface`: no D findings. The two denominators that look
  contradictory are not - `38 of 38` trace ids in `edge_logs` is one run, and `14 of 14`
  sending variants is `14 sending + 5 not sending = 19 variants` in run 3, which the
  page states. The lint arithmetic closes: `9 arms + 4 arms = 13 firings` and
  `306-337 s in 12 arms + 367 s in the 8% arm = 13`.
- `supabase-jit-database-access`: the four-row `## Docs versus runtime` table matches its
  own summary ("the first three are disagreements in an example; the fourth is a gap in
  two log sources"), so no count mismatch.
- `supabase-edge-function-limits`: the `## Where the docs disagree with runtime` table
  has 11 rows and the prose makes no count claim, so the failure mode that bit
  `dr-tiers` and `data-surface-lockdown` is absent here.
- `supabase-pipelines` `## Docs versus runtime`-style count ("The docs-versus-runtime
  differences here are two") is correct: it names exactly the DuckLake alpha/on-request
  mismatch and the RLS silence.

## Number changes

| File | Was | Now | Evidence |
|---|---|---|---|
| `reference/supabase-dr-tiers.mdx` (tier table, line 52) | `30-81 s to ACTIVE_HEALTHY at 10-574 MB on Small` | `... at 10-715 MB on Small` | The same section's own sentence "The 574 MB control restored in 40 s and the 715 MB control in 41 s", the five-control row `30, 30, 40, 40, 41 s`, and the pooler row "5-13 s on 10 MB and on a 715 MB control". No `out/` artifact is published for `restore-paths`, so the page's own two mentions are the evidence. `574` survives at lines 168, 171, 178, 210 and in the evidence rows; `715` was already there twice. |
| `reference/supabase-incident-resilience.mdx` (`## Which classes apply to you`) | `Most readers need four of the thirteen classes` | `Most readers need six to nine of the thirteen classes` | The table immediately below: Free `1, 2, 4, 5, 7, 12` = 6, Pro `1-8, 12` = 9, Team/Enterprise `all` = 13. |
| `reference/supabase-logs-volume.mdx` (practice row) | `in run2 the windowed count was 0.98 function_logs rows per call against 1.9 by id` | `the windowed count was 0.98 function_logs rows per call in run1 against 1.9 by id in run2` | Same doc, body: "`run1` did that and attributed 0.98"; "`run2` counts by `log_attributes['function_id']`". The figures themselves are unchanged; the runs they belong to are not. |

No other number, backticked identifier or URL was removed or altered in this batch. The
`image-transformations-billing` disagreement count stays "three" (now named); the
`data-surface-lockdown` count stays "two" (now scoped); the `pipelines` TL;DR keeps
`INTEGER`, `ready` and `PL05`.

## New anchors

- `reference/supabase-image-transformations-billing#modules` - the new `## Modules`
  heading. Nothing links to it yet and no doc's `anchors` pin needs it (the page's prose
  points at the module ids inline, not at the table), but it is a new stable anchor.
- No other anchor was added or renamed. `supabase-dr-tiers` gains a `dot` block, not a
  heading, and its existing anchors (`#pitr-restore-on-small-measured`) are untouched -
  the tier-table edit is in a cell, not a heading, and the diagram was placed after the
  `## Which do I pick` table, so no slug moved.

## Files edited

1. `src/content/docs/reference/supabase-image-transformations-billing.mdx` - third-disagreement naming, `## Modules`.
2. `src/content/docs/reference/supabase-dr-tiers.mdx` - `## Modules`-style decision guide (dot + text fallback), TL;DR label, size span.
3. `src/content/docs/reference/supabase-edge-function-limits.mdx` - back-link to the fan-out guide.
4. `src/content/docs/reference/supabase-incident-resilience.mdx` - TL;DR label, class count.
5. `src/content/docs/reference/supabase-multi-tenant-placement.mdx` - two first-person rewrites.
6. `src/content/docs/reference/supabase-logs-volume.mdx` - run attribution, all-sources metric sentence.
7. `src/content/docs/reference/supabase-pipelines.mdx` - TL;DR inference marker.
8. `src/content/docs/reference/supabase-data-surface-lockdown.mdx` - disagreement count re-scoped.
9. `docs/research/raw/2026-10-15-docs-review/fix-7.md` - this report.

Not edited (no fixable finding): `supabase-observability-surface`, `supabase-orioledb`,
`supabase-jit-database-access`.

## Verification

- `bun test` - 1929 pass, 243 skip (the dist-based pins skip without a build), 0 fail.
- `bun run build` - exit 0, 2041 pass, 131 skip, 0 fail. Includes the corpus checks
  (footnote balance, internal links, dot-fence style, taxonomy), the per-doc pins and the
  markdown-roundtrip checks, so the new `## Modules` heading, the new `dot` fence and the
  new cross-doc link all passed.
- Rendered-output spot checks in `dist/`: all 8 edited docs built (`katex=0` on each, so
  no stray `$` was introduced); `supabase-dr-tiers` carries the graphviz SVG plus "Text
  version of the diagram" and reads "at 10-715 MB"; `supabase-image-transformations-billing`
  shows the named three disagreements and 7 unique `tests/i0x-*.ts` links with 7
  `none published` artifact cells; `supabase-edge-function-limits` contains
  `href="/guides/supabase-edge-function-bff-fanout/"`; `supabase-logs-volume` shows
  "windowed count was 0.98 ... in `run1` against 1.9 by id" and the all-sources
  sentence; `supabase-incident-resilience` shows "six to nine of the thirteen";
  `supabase-pipelines` shows the inference marker; `supabase-data-surface-lockdown` shows
  "Two API-shape disagreements".

## Left for the parent

- Nothing is committed; all eight doc edits plus this report are unstaged working-tree
  changes.
- `pipelines` D-5 (`safe_wal_size` vs `max_slot_wal_keep_size`) and `orioledb` D-10
  (`main_buffers` units) are reported but unfixed: both need a lab artifact or a
  platform read that this worker could not obtain.
- `multi-tenant-placement` D-9 (no `## Evidence` table) is a structural judgement call,
  not a defect this worker should settle unilaterally.
