# Batch 8 review

14 docs, all in `src/content/docs/reference/`. Batch is largely clean: nothing
in the B or C axes needed a fix, and one A-axis fix was permitted (a missing
diagram fallback). The rest of this batch is author judgement.

## Summary

- **No early which-to-pick / payoff table: 5 docs** -
  `supabase-platform-operation-cost`, `supabase-realtime-surface`,
  `supabase-self-hosted-defaults`, `tailscale-homelab`,
  `vfctl-gpu-curve-tool`. A sixth, `supabase-read-replicas`, has the table but
  at line 294 of 439, after the mechanics it decides between.
- **No closing decision guide: 4 docs** -
  `supabase-platform-operation-cost`, `supabase-wrapper-delete-scope`,
  `tailscale-homelab`, `vfctl-gpu-curve-tool`.
- **Practices table ordered before the closing decision guide: 6 docs** -
  `supabase-platform-operation-cost`, `supabase-realtime-surface`,
  `supabase-rls-policy-cost`, `supabase-self-hosted-defaults`,
  `supabase-server-auth-modes`, `supabase-storage-large-objects`. (Not in
  itself a defect; reported because AGENTS.md says a lab-backed page "ends in
  practices" while the reference skeleton puts the decision guide last.)
- **`dot` diagram without a text fallback covering its branches: 3 docs** -
  `supabase-rls-policy-cost` (none) **fixed**; `zfs-on-nixos` (one sentence
  naming one of three branches); `supabase-platform-operation-cost` (a topology
  diagram, no fallback, but a two-paragraph caveat immediately above it).
- **B/C tells: 0 across the 14 docs.** The erfi-voice metaphor/pet-word sweep
  and the importance-announcing sweep returned two hits, both literal uses
  (`point it at <ref>.supabase.co` as a DNS instruction; `stateless in the way
  that matters`). No non-ASCII punctuation, no ` -- ` in prose, no -ize
  spellings outside the exempt product/API terms, no heading-case miss, no
  triplet or participle-tail hit. `prose-lint` slop 0.00/100w on all 14.
- **Soft, undated currency claims: 2** - `vfctl-gpu-curve-tool` line 168
  "Windows only today"; `tailscale-homelab` line 230 "currently needs a console
  approval". Both docs stamp the measured state elsewhere, so low severity.

files edited: 1; findings left for the author: 23

---

## src/content/docs/reference/supabase-rls-policy-cost.mdx

Type: reference - folder correct (explains what a policy costs and how the
shapes differ; no task sequence).

Skeleton gaps: none. Lede, plain-text TL;DR (no bold), early "Which shape to
pick" table, Reading the numbers, practices table, Evidence with a "How it was
checked" column, Reproducing, Modules. Both diagrams are fallback-covered now.

Fixed: 1 edit. `line 189: (nothing) -> "The same decision as a list:" plus three
numbered branches`, added directly under the Decision guide diagram at line 167.
Derived strictly from the diagram's node and edge labels (`auth helper in
predicate?` / `Wrap it: (select auth.uid())` / `Joins another table?` /
`SECURITY DEFINER helper + index the joined column` / `Index filter columns,
audit TO targets`), and phrased in the doc's own terms (`InitPlan`, `SECURITY
DEFINER`, `TO` targets). No figure, identifier or footnote changed.

Unfixed (author judgment): `line 142: [A] the practices table precedes the
closing Decision guide at 165, which other docs in this batch do the other way
round -> no change proposed, ordering only`.

## src/content/docs/reference/supabase-read-replicas.mdx

Type: reference - correct.

Skeleton gaps: which-to-pick table is late (line 294 of 439) rather than early;
its decision diagram at 307 does have a numbered fallback at 339, and the
routing diagram at 27 has a table fallback at 58.

Fixed: 0.

Unfixed (author judgment): `line 294: [A] "Which do I pick" sits after
prerequisites, replica cost, lag and the serving check -> if it is meant as the
early payoff table, it belongs near the lede`.

## src/content/docs/reference/supabase-realtime-surface.mdx

Type: reference - correct.

Skeleton gaps: no early which-to-pick table (the doc decides between Postgres
Changes, Broadcast and Replay and states the answer only in the Decision guide
at 277). Decision diagram at 279 has a numbered fallback at 305.

Fixed: 0.

Unfixed (author judgment):
- `line 30: [A] the first section is per-question findings, so a reader choosing
  a Realtime primitive has to reach the decision guide -> consider an early
  payoff table`.
- `line 259: [A] practices table precedes the Decision guide at 277`.
- `line 215: [C] heading "The realtime schema as postgres" lowercases Postgres,
  which AGENTS.md lists as a kept product name -> if the heading means the
  `postgres` role rather than the product, a backticked `postgres` would settle
  it; left alone because it reads as deliberate`.

## src/content/docs/reference/supabase-self-hosted-defaults.mdx

Type: reference - correct.

Skeleton gaps: no early which-to-pick table; Decision guide at 231 with a
numbered fallback at 253. Topology diagram at 26 is followed by prose.

Fixed: 0.

Unfixed (author judgment):
- `line 24: [A] no early payoff table for the gateway/key/database/logging
  choices -> consider one near the lede`.
- `line 212: [A] practices table precedes the Decision guide at 231`.

## src/content/docs/reference/supabase-server-auth-modes.mdx

Type: reference - correct.

Skeleton gaps: none. "Which mode for which caller" at 62 is the early payoff
table; Decision guide at 303 with a numbered fallback.

Fixed: 0.

Unfixed (author judgment): `line 286: [A] practices table precedes the Decision
guide at 303`.

## src/content/docs/reference/supabase-static-hosting.mdx

Type: reference - correct.

Skeleton gaps: none. Early "Which do I pick" at 55 with the decision diagram at
64 and its numbered fallback; practices table; "Where the docs disagree with
runtime"; Evidence, by module; Modules.

Fixed: 0. Unfixed: 0.

## src/content/docs/reference/supabase-storage-surface.mdx

Type: reference - correct.

Skeleton gaps: none material. "Which do I pick" at 25; the key-class decision
diagram at 161 has a numbered fallback; practices table; "Where the
documentation and the runtime stand" names the filed-or-not state; "Not
measured"; Evidence, by module; Modules. No closing decision guide diagram, but
the which-to-pick table carries the decision.

Fixed: 0. Unfixed: 0.

## src/content/docs/reference/supabase-storage-large-objects.mdx

Type: reference - correct.

Skeleton gaps: none. Both diagrams (31, 481) have fallbacks; "Not measured" at
514 is the honest-gap section.

Fixed: 0.

Unfixed (author judgment): `line 451: [A] practices table precedes the Decision
guide at 479`.

## src/content/docs/reference/supabase-wrapper-delete-scope.mdx

Type: reference - correct (single-question investigation, not a choice).

Skeleton gaps: no early which-to-pick table and no closing decision guide. The
doc poses no choice to make - the TL;DR answers the one question - so neither is
a real gap. Provenance Aside with date, project, versions and n; diagram at 29
has a numbered fallback at 59; practices table; Evidence; Modules.

Fixed: 0.

Unfixed (author judgment): `line 19: [A] the TL;DR is the payoff table for this
design and the page never names a decision -> no change proposed`.

## src/content/docs/reference/supabase-platform-operation-cost.mdx

Type: reference - correct.

Skeleton gaps: no early which-to-pick table and no closing decision guide; the
page is a per-operation measurement catalogue, so the "which do I pick" is
implicit in the per-path tables.

Fixed: 0.

Unfixed (author judgment):
- `line 70: [A] Method is the first section after the TL;DR; the per-path
  failure matrix at 100 is the payoff table but is titled as a finding`.
- `line 675: [A] practices table precedes Evidence, Reproducing and Modules;
  no closing decision guide`.
- `line 204: [A] the topology diagram has no text fallback. It is the one
  diagram here whose node labels are not recoverable from a table. The two
  paragraphs at 199-201 say it is an inference, not that the client, the four
  HTTP services and Postgres are arranged as drawn -> a numbered fallback would
  close it`.

## src/content/docs/reference/zfs-on-nixos.mdx

Type: reference - correct.

Skeleton gaps: no "What to do about it" practices table, but the page is not
lab-backed (no module ids) and "Gotchas and lessons learned" + Evidence carry
the same role.

Fixed: 0.

Unfixed (author judgment):
- `line 314: [A] the Decision guide diagram at 293 branches three ways
  (systemd does not need to know; needs to know with ZFS mountpoint semantics;
  needs to know without them) and the fallback is one sentence naming only the
  middle path. The other two labels appear nowhere else in prose, so a text
  fetch of this page loses them -> a numbered list of the three branches would
  match the corpus convention. Reported rather than edited: a fallback is
  present, so this is not the "missing" case the batch brief allows me to add`.
- `line 242: [B] "the root dataset is stateless in the way that matters" is the
  self-validating "that matters" frame on the erfi-voice sweep list, read
  literally -> dropping the frame ("the root dataset is stateless - on NixOS a
  bad configuration is rolled back...") keeps every fact. Left to the author
  because "in the way that matters" also distinguishes which sense of
  "stateless" applies`.

## src/content/docs/reference/windows-drive-letter-failures.mdx

Type: reference - correct (owns the decision matrix; the two ladders are guides,
linked by name from the lede).

Skeleton gaps: no TL;DR. 55 lines with an early "Decision matrix" at 29 and a
closing "Which guide do I pick" at 49, which together do the TL;DR's job for a
page this size.

Fixed: 0.

Unfixed (author judgment): `line 1: [A] no TL;DR bullet block -> likely
deliberate at this length`.

## src/content/docs/reference/tailscale-homelab.mdx

Type: reference - correct.

Skeleton gaps: has lede, a bold `**TL;DR:**` paragraph, a Provenance Aside with
re-verification dates, and an early payoff table at 33. No closing decision
guide, no Evidence section (the failure table at 240 carries a per-row Evidence
column, which is equivalent for its claims).

Fixed: 0.

Unfixed (author judgment):
- `lines 26-29, 157-168, 215-217, 229-232: [C] one-word and short-phrase bold
  labels lead roughly a dozen list items ("**Approval.**", "**Forwarding.**",
  "**tests.**", "**Tags beat users for servers.**"). The 2026-08-28 sweep removed
  "decorative bold on labels" from the corpus, and these are the same shape ->
  candidate for unbolding, but they function as index labels in a long list, so
  this is the author's call`.
- `line 230: [D] "every re-advertisement currently needs a console approval" is
  an undated currency claim, where the Provenance Aside dates live state to
  2026-08-23 -> dating the clause would settle it`.
- `line 42: [A] the Topology diagram has no text fallback (prose follows, but
  does not enumerate the nodes) -> optional, it is not a decision diagram`.
- `line 22: [A] no closing decision guide; the payoff table at 33 is the only
  decision surface`.

## src/content/docs/reference/vfctl-gpu-curve-tool.mdx

Type: reference - correct.

Skeleton gaps: measured doc with a provenance paragraph closing the lede (rig,
driver version, what is verified vs what could change), TL;DR, an NVAPI
interface reference, a "Finding | How it was checked" table for the fan-chip
registers (satisfies the measurement-contract requirement), and "Known
limitations" in place of Gotchas. No early which-to-pick table, no closing
decision guide, no full Evidence table (the sensor-polling run table at 144
gives no per-row method beyond the cited MousePlotter recordings).

Fixed: 0.

Unfixed (author judgment):
- `line 14: [A] no early payoff table for "should I use vfctl, and for which
  job" -> consider one near the lede`.
- `line 137: [A] the "What sensor polling costs an 8 kHz mouse" table has no
  "How it was checked" column; a sibling table at 133 does have one -> one line
  naming the rig and the recording tool would close the asymmetry`.
- `line 168: [D] "Windows only today." is an undated currency claim; the lede
  dates the driver (610.88) -> "Windows only (driver 610.88)" would match the
  doc's own dating`.

