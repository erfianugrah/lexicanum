# Batch 6 review

## Summary

- **A dot decision diagram with no text fallback directly under it** - 3 diagrams in 3 files
  (`stripe-sync-engine`, `supabase-aws-privatelink`, `supabase-data-residency`). Fixed, since
  the brief allows this one A-category fix derived from the diagram's own labels.
- **Practices-table cells over the 90-character ceiling** - 16 rows across 4 files
  (`stripe-sync-engine` 7, `supabase-aws-privatelink` 6, `supabase-branching-two-projects-one-repo` 2,
  `supabase-auth-users-locks` 1). Reported, not trimmed: every candidate shortening touches an
  API path or an identifier, and the brief forbids dropping those to hit the length.
- **No `## Related docs` list** - 4 files (`stripe-sync-engine`, `supabase-aws-privatelink`,
  `supabase-compute-disk`, `supabase-data-residency`). AGENTS.md does not mandate the section, but the
  other eight pages in the batch close with one, and these four are the only pages with no closing
  cross-link. Reported.
- **Report-only prose items (B/C, judgment calls)** - 6 across 5 files: the `not just X` heading in
  `stripe-sync-engine`, the trade-cost metaphor and the all-caps `BEFORE` in `slskarr-soulseek-lidarr`,
  the `Two things to hold loosely.` frame in `supabase-auth-providers`, the mean-sentence gate and the
  colon heading in `supabase-data-residency`, the `turns out` blurb in `supabase-compute-disk`.
  Left to the author per the brief's "when unsure, report it".
- **One page's practices table is 2 columns on a lab-backed page** - `stripe-sync-engine` has
  `Practice | Evidence` where the contract says `Practice | Evidence | Module`, and the page is listed
  in `tests/pins.test.ts` `practicePages`. Reported; it cannot be fixed here because the page cites no
  module ids to put in the missing column.

Files edited: 3. Findings left for the author: 28 (16 practice-cell lengths, 4 missing Related docs,
1 two-column practices table, 6 prose items, 1 sentence-length gate).

## src/content/docs/reference/slskarr-soulseek-lidarr.mdx

Type: reference - folder correct (a retired-design explanation plus the replacement architecture).
Skeleton gaps: none material. Provenance aside present, TL;DR, "What replaced what", dot diagram with a
text fallback, "Reading the numbers", "What generalises". No evidence table and no practices table, but
the page is not lab-backed and its figures are attributed per component in the Provenance aside.
Fixed: 0 edits.
Unfixed (author judgment):
- `line 88` [B] `The tradeoff is real and one-directional: consolidation buys a single state model and
  costs the privilege separation that separate containers gave.` - self-rating ("real") plus a
  buy/cost figure. -> state the trade literally (one state model, no privilege separation).
- `line 219` [C] `it removes the library file it is replacing BEFORE moving the new one in` - mid-sentence
  all-caps emphasis, which the same statement does not use in the TL;DR at `line 23`. -> drop the caps.

## src/content/docs/reference/stripe-sync-engine.mdx

Type: reference - folder correct.
Skeleton gaps: no `## Modules` table (nothing here cites a supabase-lab module id, so this is correct);
no `## Related docs`; the practices table is `Practice | Evidence`, missing the `Module` column the
contract specifies for a page listed in `practicePages`; 7 of its 7 practices exceed 90 characters
(running to 170).
Fixed: 2 edits.
- `line 179`: `a comment on column explaining the trap never reaches the model` -> `... explaining the
  failure never reaches the model` [B: "the trap" as a verdict noun].
- `line 227`: added the missing text fallback under the `## Decision guide` diagram, derived from its
  labels (join/aggregate -> Sync Engine; not, and current to the second -> FDW; needs transformations
  neither path gives you -> hand-rolled; otherwise -> Sync Engine).
Unfixed (author judgment):
- `line 131` [B] heading `### Evidence the pin is not just a stale install` - negative parallelism. The
  content supports it (the second install was created that morning), but the heading text cannot be
  changed here. -> `### The pin is not a stale install` or a positive form.
- `lines 233-239` [A] 7 practices over 90 characters, and the missing `Module` column.
- `line 15-23` [B] TL;DR bolds `**2020-08-27**`, `**Stripe account**`, `**under 1 ms**`,
  `**418 to 1292 ms**`. Reported only: the same TL;DR figure-bolding is used across the batch, so it
  reads as the author's convention rather than a tell.

## src/content/docs/reference/supabase-audit-trail-integrity.mdx

Type: reference - folder correct.
Skeleton gaps: none. Provenance, TL;DR, evidence table with "How it was checked", "Not covered",
practices table with Module, Modules, Related docs. Every figure is tied to a module id and a plan,
and the docs-vs-runtime table carries a filed-upstream column.
Fixed: 0 edits. No findings.

## src/content/docs/reference/supabase-auth-end-to-end.mdx

Type: reference - folder correct.
Skeleton gaps: the `## Topology` `dot` diagram has no text fallback. The brief's A-axis wording is
"every `dot` decision diagram", and this one is topology rather than a decision fork, so it is reported
rather than fixed; the four reference pages that do carry a decision diagram now all have fallbacks.
Fixed: 0 edits.
Unfixed (author judgment):
- `line 31-63` [A] topology diagram without a fallback.
- `lines 434-503` [C] the practices table is the longest in the batch; a spot check of the cells shows
  none over 90 characters, so the only note is mechanical: referent rotation `config`/`configuration`
  (28/3) sits inside the frozen baseline.

## src/content/docs/reference/supabase-auth-providers.mdx

Type: reference - folder correct.
Skeleton gaps: no diagram at all - no topology and no decision guide - where the reference skeleton asks
for one. Reported (sourcing a diagram is A-category work). Everything else is complete: provenance,
TL;DR, per-module rig paragraphs, docs-vs-runtime table with a filed column, evidence table, Modules,
Related docs.
Fixed: 0 edits.
Unfixed (author judgment):
- `line 54` [B] `Two things to hold loosely.` - a setup sentence standing in front of the two caveats it
  names, before either is stated. -> lead with the caveat (`The post-update browser-flow retries are not
  instrumented ...`) and let the second follow. Left unfixed because the frame does carry real meaning
  (these two are the unresolved ones) and the brief says to report rather than guess.

## src/content/docs/reference/supabase-auth-users-locks.mdx

Type: reference - folder correct.
Skeleton gaps: none; the diagram has a text fallback at `line 50` ("Reading the diagram as text"), practices table has
Module, evidence table splits measured from documented.
Fixed: 0 edits.
Unfixed (author judgment):
- `line 133` [A] one practice cell at 102 characters:
  `Treat an FK to auth.users as a write dependency on the Auth server, not only a data-integrity choice`
  -> the clause after the comma is the evidence, not the imperative.

## src/content/docs/reference/supabase-aws-privatelink.mdx

Type: reference - folder correct.
Skeleton gaps: no `## Related docs`, beyond the fallback now added. Provenance, early which-path table,
evidence table per section, practices table with Module, Decision guide, Reproducing, Modules.
Fixed: 1 edit.
- `line 333`: added the missing text fallback under `## Decision guide`, derived from its labels
  (DB clients in your AWS VPC -> PrivateLink endpoint 5432/6543 on Team or Enterprise; not in it or on
  other clouds -> the public paths, IPv6 or the IPv4 add-on for direct 5432, Supavisor 6543 for an
  IPv4-only client; no DB socket needed -> stay on HTTPS).
Unfixed (author judgment):
- `lines 259, 260, 263, 265, 266, 267` [A] 6 practice cells over 90 characters (up to 158). Each one is
  an API path, an error string or a named command, which is why they are reported rather than cut.

## src/content/docs/reference/supabase-branching-two-projects-one-repo.mdx

Type: reference - folder correct.
Skeleton gaps: none; diagram has a text fallback, evidence-by-module, Modules, Related docs, and the
docs-vs-runtime table carries a filed-upstream line.
Fixed: 0 edits.
Unfixed (author judgment):
- `lines 500, 505` [A] practice cells at 96 and 91 characters.

## src/content/docs/reference/supabase-cli-schema-diff.mdx

Type: reference - folder correct.
Skeleton gaps: none; the largest decision diagram in the batch already has a numbered fallback, and the
practices table carries Module. Headings are sentence case, prose is ASCII, no ` -- `.
Fixed: 0 edits. No findings.

## src/content/docs/reference/supabase-client-keyed-objects.mdx

Type: reference - folder correct.
Skeleton gaps: none; diagram has a fallback, "Not measured" is explicit, evidence-by-module, Modules,
Related docs, and every practice row names its module id.
Fixed: 0 edits.
Unfixed (author judgment):
- `line 60-66` [B] topology TL;DR and parity rows are clean; the only note is the frozen
  `directory`/`dir` rotation (3/2) inside the baseline.

## src/content/docs/reference/supabase-compute-disk.mdx

Type: reference - folder correct (sizing/decision reference, not a how-to).
Skeleton gaps: no `## Related docs`. "Ops playbook" is the page's pinned equivalent of the practices
heading (`tests/pins.test.ts:1772`), so that is not a gap.
Fixed: 0 edits.
Unfixed (author judgment):
- `description:` blurb [B] `... - and what turns out to be dashboard-only or just inconsistent with the
  docs.` - reveal framing ("turns out") plus a dismissive "just". -> `... and where the runtime disagrees
  with the docs.` Editable in place, but it is the homepage card and the blurb already reads as
  deliberate compression, so it is reported rather than rewritten without a second opinion.

## src/content/docs/reference/supabase-data-residency.mdx

Type: reference - folder correct.
Skeleton gaps: no `## Related docs` (the page cross-links inline in the checklist, but establishes no
closing list); the page has no `## Reproducing` and instead closes with "What the docs do not answer",
which is a deliberate shape for a doc whose open items are questions for the vendor.
Fixed: 1 edit.
- `line 246`: added the missing text fallback under `## Decision guide`, derived from its labels
  (bytes on specific soil -> managed in a named region plus the checklist; the vendor must not be able
  to read the data -> self-host; no vendor in the chain -> self-host, placed where counsel requires).
Unfixed (author judgment):
- whole file [C] `prose-lint` fails the mean-sentence-ceiling gate: `mean 25.4 words > 25`. Pre-existing
  (25.6 before this edit; the added fallback lines are short and lowered it). The dense per-surface
  paragraphs are the cause. -> split the longest per-surface paragraph in "The per-surface map" and
  "Compliance programs"; not a sentence-level fix.
- `line 185` [B] heading `## The legal frame: DPA, SCCs, and the CLOUD Act` - colon-headline with a
  three-item list. It names the section's contents rather than pitching them, so this is a weak
  instance; reported for consistency with the colon-stamp rule.
