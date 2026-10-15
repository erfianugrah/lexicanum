# Batch 7 review

Batch: `reference/supabase-{data-surface-lockdown,dr-tiers,edge-function-limits,image-transformations-billing,incident-resilience,jit-database-access,logs-volume,multi-tenant-placement,observability-surface,orioledb,pipelines}.mdx` (all reference, all `category: supabase`).

## Summary

Top recurring issues, with counts out of 11 docs:

1. **No `## Reproducing` section** - 7 of 11 (`dr-tiers`, `image-transformations-billing`, `incident-resilience`, `multi-tenant-placement`, `edge-function-limits`, `logs-volume`, `observability-surface`). Most still name the experiment inline (lede or Modules/RUNLOG link), so the how-to-rerun step is present but not under the skeleton heading.
2. **No `## Related docs` closing section** - 6 of 11 (`dr-tiers`, `data-surface-lockdown`, `image-transformations-billing`, `incident-resilience` have none; `multi-tenant-placement` uses `## Related`). The other five carry one. Pairing is mostly satisfied inline in the lede, so the loss is a text-fetch/lateral-nav one.
3. **No `## Reading the numbers`** - 6 of 11 (same set as above plus `edge-function-limits` has it; missing in `dr-tiers`, `image-transformations-billing`, `incident-resilience`, `multi-tenant-placement`). `multi-tenant-placement` and `orioledb` cover the same ground under `## Still design-only` / `## Verified / tested`.
4. **No closing decision diagram** - 3 of 11 (`dr-tiers`, `image-transformations-billing`, `multi-tenant-placement`; `jit-database-access` and `observability-surface` also close on tables). `dr-tiers` has no `dot` fence at all, and `image-transformations-billing` has only the architecture diagram.
5. **TL;DR label form rotates across the batch** - 8 use `**TL;DR:**` + bullets, 1 used `**TL;DR**` + bullets (`orioledb`, fixed), 2 use `**TL;DR** - <paragraph>` (`dr-tiers` line 35, `incident-resilience` line 40, reported not fixed - a paragraph reads grammatically with the dash, and the colon form belongs to the bullet-list form).

Axis B is clean across the batch: `prose-lint` slop 0.00-0.01 per 100 words on every file, 0 em-dash and 0 marker hits, and the hand sweeps found no negative parallelism, mystery-tease, present-participle grading, decorative bold, rhythm triplet or significance inflation that was not a literal use of the word. Axis C is clean on the mechanical checks: no non-ASCII byte anywhere in the batch, no ` -- ` in prose, no unescaped `$` in prose (the three raw `$` hits are inside a JSON fence, a dot fence and an inline code span), every heading sentence-case, one name per concept per doc.

Files edited: **2**. Findings left for the author: **18** (16 skeleton rows + 2 line-anchored, listed below; the TL;DR-form issue accounts for 2 of the 16).

Coverage, since the D-axis claims depend on it: full line read of `logs-volume` and `image-transformations-billing`; lede, TL;DR, heading tree and closing sections (practices / decision guide / Evidence / Modules / Related) of the other nine; mechanical sweeps over all 11 (marker regexes, ASCII, ` -- `, `$` escaping, heading case, `-ize`, dot-fence fallback, `prose-lint --before HEAD`, `prose-lint` terms baseline, `bun test tests/docs.test.ts tests/pins.test.ts`). Middle sections of `data-surface-lockdown`, `multi-tenant-placement`, `dr-tiers`, `edge-function-limits` and `incident-resilience` were read only where a finding or a pinned span sat in them, so a D finding in an unread middle paragraph would not have been caught.

Verification run after the edits:

```
prose-lint --config .prose-lint.json --before HEAD --no-max <11 batch files>
  TOTAL: slop 0.00/100w across 11 files          exit=0
prose-lint ... --no-counters --baseline .prose-terms-baseline.json <2 edited files>   ok
bun test tests/docs.test.ts tests/pins.test.ts
  1828 pass, 241 skip, 0 fail
```

Pre-existing gate failure cleared as a side effect: `supabase-incident-resilience.mdx` failed `mean-sentence-ceiling` (mean 25.2 words > 25) before any edit in this batch, per `prose-lint --before HEAD` on the untouched file. The added text fallback is four short sentences, which drops the mean to 25.0 and the file to exit 0. Nothing else in the batch tripped a gate.

## src/content/docs/reference/supabase-incident-resilience.mdx

Type: reference - folder correct (explanation-and-decision doc over 13 failure classes, not a task sequence).

Skeleton gaps: lede, TL;DR, class ladder, early "Which do I pick" table, `## What to do about it` practices table, `## Decision guide`, `## Evidence table` (`How it was checked` column), `## Modules` all present. Missing: `## Related docs` - the doc links `dr-tiers` and the runbook inline in the lede instead, and `dr-tiers` links back, so the pair requirement holds.

Fixed: 1 edit.

- line 929 (new): added the missing text fallback directly under the `## Decision guide` dot diagram, derived from the diagram's node and edge labels only - `"Text version of the decision guide, keyed on what is failing:"` plus the four `What is failing?` -> action pairs (`Reads 5xx / origin down -> cache-first Worker (W04)`; `401 PGRST303 wave -> raise jwt_exp (W03) + alert on code`; `Logins / refresh dead -> longer TTL: existing tokens still validate`; `Project or region lost -> warm standby + TPA cutover (W05), rehearsed`). Before this, line 929 was `## Evidence table`, so a text fetch got the node labels run together.

Unfixed (author judgment): `line 40: [C] "**TL;DR** - Durability has its own tier ladder" -> the batch's dominant bullet form is "**TL;DR:**"; left alone because the dash form introduces a paragraph, not a list`. `line 1009: [A] the doc ends at `## Modules` with no `## Related docs` section -> add one if the sibling links in the lede are not enough`.

## src/content/docs/reference/supabase-orioledb.mdx

Type: reference - folder correct (which-setting-to-pick table up front, engine behaviour after).

Skeleton gaps: none. It carries lede, provenance paragraph, TL;DR, `## Which setting to pick`, `## Reading the numbers`, `## Reproducing`, `## What to do about it`, `## Evidence`, `## Decision guide` with a numbered text fallback (lines 250-253), `## Modules` and `## Related docs`.

Fixed: 1 edit.

- line 15: `**TL;DR**` -> `**TL;DR:**`. The label introduces a bullet list, and the other 8 bullet-list TL;DRs in the batch (and the pinned form in `multi-tenant-placement`) use the colon.

Unfixed (author judgment): none.

## src/content/docs/reference/supabase-pipelines.mdx

Type: reference - folder correct.

Skeleton gaps: none. TL;DR, `## Scope and provenance`, `## Which question has which answer` table, `## Reading the numbers`, `## Reproducing`, `## What to do about it`, `## Decision guide` with a text list, `## Evidence`, `## Modules`, `## Related docs`; both `dot` fences have a numbered text version directly under them. This is the batch's most complete skeleton.

Fixed: 0 edits.

Unfixed (author judgment): none.

## src/content/docs/reference/supabase-jit-database-access.mdx

Type: reference - folder correct.

Skeleton gaps: `## The paths` diagram + `The same facts as a table:` fallback, TL;DR, `## Reading the numbers`, `## What to do about it`, `## Reproducing`, `## Evidence`, `## Modules`, `## Related docs` all present. Missing: no "which do I pick" table or closing decision diagram - the connection matrix table carries the decision instead.

Fixed: 0 edits.

Unfixed (author judgment): none on the line level.

## src/content/docs/reference/supabase-logs-volume.mdx

Type: reference - folder correct.

Skeleton gaps: none that matter. `## Reading the numbers`, `## Decision guide` with `Text version of the decision guide:`, `## What to do about it`, `## Modules` (artifact links), `## Related docs`; both diagrams have text versions. No `## Reproducing` heading - the Modules table's `out/` links and the RUNLOG reference serve it.

Fixed: 0 edits.

Unfixed (author judgment): none.

## src/content/docs/reference/supabase-observability-surface.mdx

Type: reference - folder correct.

Skeleton gaps: TL;DR, `## Which surface answers which question`, `## Reading the numbers`, `## What to do about it`, `## Modules`, `## Related docs`, diagram text version at line 106. No `## Reproducing` heading; the Modules section links the experiment and RUNLOG instead. No closing decision diagram (the opening "which surface answers which question" table does that job).

Fixed: 0 edits.

Unfixed (author judgment): none.

## src/content/docs/reference/supabase-edge-function-limits.mdx

Type: reference - folder correct.

Skeleton gaps: TL;DR, `## The order of questions` diagram with `The same order, as text:` fallback (line 107), `## What to do about each ceiling` (the practices table under the older heading the pins allow), `## Where the docs disagree with runtime`, `## Reading the numbers`, `## Evidence, by module`, `## Modules`, `## Related docs` all present. No `## Reproducing`.

Fixed: 0 edits.

Unfixed (author judgment): none.

## src/content/docs/reference/supabase-dr-tiers.mdx

Type: reference - folder correct (RPO/RTO/cost comparison and a "which do I pick").

Skeleton gaps: lede, provenance, TL;DR, tier-by-tier sections, `## Which do I pick` (line 319), `## What to do about it`, `## Evidence`, `## Modules` present. Missing: `## Related docs` (the lede links `incident-resilience` and the runbook inline and both link back); no `dot` fence anywhere, so no architecture diagram and no closing decision diagram; no `## Reading the numbers` / `## Reproducing` - the Evidence table's `How it was checked` column carries the split.

Fixed: 0 edits.

Unfixed (author judgment): `line 35: [C] "**TL;DR** - Daily backups are already on" -> the batch's dominant form is "**TL;DR:**"; same paragraph-form caveat as incident-resilience`. `line 236: [D] none - "34ms-1057ms" is stated in full at lines 236 and 373, so the "34ms-1s" shorthand in the TL;DR (line 42) and the tier table (line 53) is a deliberate rounding that both docs repeat consistently`.

## src/content/docs/reference/supabase-data-surface-lockdown.mdx

Type: reference - folder correct.

Skeleton gaps: lede, `## Which option fits the goal`, three option sections, `## Which option to pick` (line 436) with `The same decision, as text.` (line 465), `## What to do about it` (476), `## Reading the numbers` (515), `## Reproducing` (519), `## Modules` (564) present. Missing: `## Related docs`; no `## Evidence` heading - the evidence is a prose section (`## The evidence side`, line 377) plus inline links, so the tested-vs-documented split lives in the `What to do about it` Evidence column rather than a table with a `How it was checked` column.

Fixed: 0 edits.

Unfixed (author judgment): none on the line level.

## src/content/docs/reference/supabase-multi-tenant-placement.mdx

Type: reference - folder correct.

Skeleton gaps: `## Decision` (477) with a bullet decision list and a `dot` decision diagram whose text equivalent is the bullet list *above* it plus the prose conclusion at lines 522-525 - present, but not directly under the diagram as the rule asks. `## What to do about it`, `## Still design-only (not yet tested)`, `## Verified / tested` (578, with a `How it was checked` column), `## Modules`, `## Related` (659) all present. Missing: no `## Reading the numbers` (the two sections above cover it); heading is `## Related`, not `## Related docs` (the other six batch docs with a Related section use `## Related docs`, so this is a sub-family convention rather than a typo).

Fixed: 0 edits.

Unfixed (author judgment):
- `line 85: [C] "I confirmed the Micro figure straight from the live billing API" -> repo-wide grep for "\bI (tested|confirmed|ran|measured)" matches this file only; lines 260 ("I tested it three ways") and 339 ("so I") are the same voice. The corpus is impersonal elsewhere, so consider "Confirmed against the live billing API" / "tested three ways" - reported rather than edited: the doc holds that register consistently and the choice may be deliberate`.
- `line 659: [A] "## Related" -> "## Related docs" to match the other six, if the family convention is not deliberate`.

## src/content/docs/reference/supabase-image-transformations-billing.mdx

Type: reference - folder correct (billing mechanics, which-surfaces answer, abuse surface with ranked mitigations).

Skeleton gaps: lede, provenance, TL;DR, `## Which URL surfaces transform`, `## Where the docs disagree with the runtime`, `## Caching behaviour`, `## The abuse surface`, `## Mitigations and workarounds` (the decision as a ranked table), `## What to do about it` (152), `## What was not provable`, `## Evidence` (174 - no `How it was checked` column; the second column holds the check inline as `Measured - ...`, which is the same split in a different shape). Missing:
- **no `## Modules` table** although the page cites module ids on nearly every measured row (`I02`, `I03`, `I04`, `I05`, `I06`, `I08`, `I09` and an unnamed ad-hoc probe) - the AGENTS.md rule is that a page citing lab module ids ends in a Modules table, and this is the one page in the batch that does not have one;
- no `## Related docs` (the page has no sibling cross-reference section at all);
- no `## Reading the numbers` and no `## Reproducing` (the provenance paragraph names the three passes but not the experiment entry point or a run command).

Fixed: 0 edits.

Unfixed (author judgment): `line 89: [D] "Three measured disagreements, all reproducible with one curl each." -> the section names two documented claims (the 1-2500 bound at line 91, the Pro-plan-only sentence at line 95) and then a third paragraph on parameter handling that quotes runtime behaviour without naming the documented claim it disagrees with; the Evidence table has a "Docs' 1-2500 bound wrong" row and a Free-plan render row, so the count is two there. Name the third claim, or drop the count to two`.
