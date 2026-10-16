# Fix batch 8

Files: the 14 listed in `batches/batch-8.txt`. Edits landed in 7 of them; the
other 7 had no open finding left to act on (details per file below).

## Number changes

None. No figure, identifier, URL or footnote slug was changed anywhere in this
batch.

Numbers that appear in the added prose are all restatements of figures already
in the same doc, copied verbatim:

- `reference/vfctl-gpu-curve-tool.mdx:23` - "54 missed polls a minute" and
  "driver 610.88", from the sensor-polling table (row `FanControl running ... 54`)
  and the lede's measured-on sentence.
- `reference/supabase-platform-operation-cost.mdx:242` - "75-131 s" and
  "2026-08-04", from the diagram's own cluster labels.
- `reference/supabase-realtime-surface.mdx:30` - `0 of 25`, `40 of 40`,
  `0 of 2` / `2 of 2`, `limit` 26 / 100 / 25, from the TL;DR and evidence rows.
- `reference/supabase-self-hosted-defaults.mdx:24` - Postgres 17.6, host port
  8443, `/auth/v1`, from the TL;DR bullets.
- `reference/tailscale-homelab.mdx:295` - the `2026-08-23` re-verification date
  moved from the Provenance Aside into the currency clause.
- `reference/supabase-read-replicas.mdx` - the moved section is verbatim
  (30.2 to 31.6 s and 30.2 to 31.3 s included).

## New anchors

New H2s added (a new slug, no old slug to preserve):
`which-do-i-pick` in `reference/supabase-realtime-surface.mdx`,
`reference/supabase-self-hosted-defaults.mdx` and
`reference/vfctl-gpu-curve-tool.mdx`; `decision-guide` in
`reference/vfctl-gpu-curve-tool.mdx` and `reference/tailscale-homelab.mdx`.

No anchor was removed or renamed. `reference/supabase-read-replicas.mdx` keeps
`which-do-i-pick` (the section moved, the heading text did not), and no doc
links to an anchor in that file, so nothing resolved against the old position.

## Per file: what was fixed, and any finding left open with the reason

### reference/supabase-read-replicas.mdx
Fixed: 1 move. The whole `## Which do I pick` section (table, decision diagram,
numbered fallback, 54 lines verbatim) moved from line 294 to line 25, directly
after the TL;DR and before `## Where each request lands`. Mechanism: extracted
between the `## Which do I pick` and `## What to do about it` headings and
re-inserted before `## Where each request lands`; `git diff` shows a 54-line
add / 54-line remove with no content change, and both seams were read back.
Section order now: Which do I pick (25), Where each request lands (79) ...
What to do about it (348), Evidence, Modules, Related docs.
Trade-off, for the author: the decision diagram now sits early with the table,
so the page has an early decision guide and no closing one. That matches
`supabase-static-hosting` (early "Which do I pick" with the decision diagram at
64) and `supabase-storage-surface` (the reviewer's own note that the early table
carries the decision), but if the closing diagram is wanted, the only clean
option is to copy the diagram back to the end - the heading cannot be renamed to
give the two halves different slugs.
Left open: none.

### reference/supabase-realtime-surface.mdx
Fixed: 1 edit. `line 30`: added `## Which do I pick`, a four-row
needs -> primitive -> first-thing-to-check table built from the existing
Decision guide branches and TL;DR rows, plus one closing sentence naming the
shared failure mode (a healthy status that hides a drop).
Left open, with reasons:
- `line 259` practices table precedes the Decision guide - the parent's
  instruction is to leave this order; not a defect.
- `line 215` heading "The realtime schema as `postgres`" lowercases the product
  name - left alone. The section and the Evidence rows are about the `postgres`
  role as the Realtime schema's owner ("Realtime schema operations as
  `postgres`", DD03), so the lowercase name is the role, not the product.

### reference/supabase-self-hosted-defaults.mdx
Fixed: 1 edit. `line 24`: added `## Which do I pick`, five rows (gateway, API
keys, database, logs and analytics, external URL and SAML) with the default and
the check that settles it, all read from the existing TL;DR, the per-section
"measured" paragraphs and the practices table. The existing `## Decision guide`
at 241 (which files to add) is unchanged and keeps the closing position.
Left open: `line 212` practices table before the Decision guide - leave, per
instruction.

### reference/supabase-platform-operation-cost.mdx
Fixed: 1 edit. `line 242`: added "The same topology as a list:" plus four
numbered branches directly under the topology diagram, enumerating the client,
the four HTTP services and their ~75-131 s recovery, the pooled Supavisor path,
the service -> Postgres edges and the untested direct 5432 path. Derived from
the diagram's node, cluster and edge labels only.
Left open, both marked n/a rather than forced:
- No early which-to-pick table. The page is a per-operation measurement
  catalogue; the per-path failure matrix at line 100 sits about 30 lines below
  the TL;DR and is the payoff table (the reviewer's own reading). Retitling a
  heading is forbidden by the fix policy, so the "titled as a finding" half of
  that finding is not actionable here.
- No closing decision guide. The doc does not compare alternatives to pick from;
  its decision content is per-path survival per operation, already carried by
  the matrix and the practice table. Adding a diagram would restate the matrix.
  If the author disagrees, the material for one decision guide exists in the
  matrix at 100 and can be turned into a three-branch diagram cheaply.

### reference/supabase-wrapper-delete-scope.mdx
No edit, n/a for both axis-A items: the page poses no choice (the TL;DR answers
its single question), the reviewer recorded both as not a real gap, and the
diagram already has its numbered fallback at 59. Practices table, Evidence and
Modules unchanged.

### reference/tailscale-homelab.mdx
Fixed: 2 edits.
- `line 230`: `"every re-advertisement currently needs a console approval"` ->
  `"needs a console approval (re-verified live on 2026-08-23)"`. The date comes
  from the doc's own Provenance Aside, which re-verified subnet-routing state
  live on that day. The currency word is gone; the fact is unchanged.
- `line 277`: added a closing `## Decision guide` after the Verification
  checklist - a five-branch dot diagram (OOB path, SSH from an arbitrary
  network, VLAN-only device, SSH identity without key distribution, unattended
  rejoin) with the same five jobs as a numbered list, plus one line keeping
  bulk site-to-site traffic on the IPsec/GRE tunnels. Every branch is a
  configuration the doc already describes; no new claim, no new figure.
Left open, with reasons:
- The bold run-in labels in the list items (`**Approval.**`, `**Forwarding.**`,
  `**tests.**`, `**Tags beat users for servers.**`) - kept. The fix brief
  requires keeping bold run-in labels at the start of list items; none of these
  grades itself.
- `line 42` topology diagram fallback - left. It is not a decision diagram, the
  reviewer marked it optional, and the batch prompt named only two diagrams
  (zfs-on-nixos, platform-operation-cost). Can be added the same way if wanted.

### reference/vfctl-gpu-curve-tool.mdx
Fixed: 4 edits.
- `line 23`: added `## Which do I pick` - three rows (undervolting with the
  offsets read back, fan curves with no software in the loop, telemetry and the
  stability search) with the commands and what each replaces, built from the
  TL;DR, the persistence section and the fan-chip section.
- `line 158`: added `"How it was checked: MousePlotter recordings of the OP1 8k
  on the RTX 5090 FE with driver 610.88, one configuration per run, mouse moving
  throughout."` under the sensor-polling table, closing the asymmetry with the
  fan-chip table above it. The preceding prose already names the tool and the
  light; this names the rig, the driver and the run protocol.
- `line 178`: `"Windows only today."` -> `"Windows only (driver 610.88)."`,
  dated from the lede's measured-on sentence.
- `line 185`: added a closing `## Decision guide` - a three-branch dot diagram
  (curve that survives a driver reload; fan curves on the chip; telemetry and
  the stability cliff) with the same three jobs as a numbered list, using only
  commands the doc already names (`set`, `persist`, `hold`, `watch`, `test`,
  `vfctl fan restore`). Placed after `## Known limitations`, matching
  `zfs-on-nixos` (Gotchas then Decision guide).
Left open: none.

### reference/zfs-on-nixos.mdx
Fixed: 1 edit. `line 314`: added "The same three paths as a list:" plus three
numbered branches directly under the Decision guide diagram, naming all three
labels the diagram carries (no `fileSystems` entry with the pool in
`boot.zfs.extraPools`; `fileSystems` with `nofail` and `zfsutil`; `fileSystems`
plus `mountpoint=legacy`). The sentence that named only the middle path is
unaffected and still follows.
Left open: `line 242` `[B]` "the root dataset is stateless in the way that
matters" - not edited. The reviewer left it to the author because the phrase
distinguishes which sense of "stateless" applies (boot-generation rollback, not
filesystem restore), and the fix brief says to report rather than edit when the
tell may be the author's voice.

### reference/supabase-rls-policy-cost.mdx
No edit. Its one axis-A item (the numbered fallback under the Decision guide)
was already fixed by the review round and is present at line 189. The remaining
item is the practices/decision-guide order, which the parent's instruction
leaves as is.

### reference/supabase-server-auth-modes.mdx, reference/supabase-storage-large-objects.mdx
No edit. Only item each: practices table before the Decision guide - leave per
instruction. Nothing else open.

### reference/supabase-static-hosting.mdx, reference/supabase-storage-surface.mdx
No edit. Zero open findings in the batch report; both already carry an early
which-to-pick table and a fallback-covered decision diagram.

### reference/windows-drive-letter-failures.mdx
No edit. The only item is the missing TL;DR block, which the reviewer called
deliberate at 55 lines; the early Decision matrix at 29 and the closing "Which
guide do I pick" at 49 already carry it. Marked n/a.

## Verification run

- `prose-lint --config .prose-lint.json --before HEAD --no-max <the 8 batch
  files>` - exit 0, slop 0.00/100w across all 8 (no number, identifier, URL or
  slug removed or changed against HEAD).
- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline
  .prose-terms-baseline.json <the 8 batch files>` - exit 0, no new term
  rotation.
- `bun test tests/docs.test.ts tests/pins.test.ts` - 1828 pass, 241 skip
  (dist-gated), 0 fail.
- `CHECK_BUILT=1 bun test tests/docs.test.ts` against a fresh `dist/` - 1542
  pass, 0 fail, including the built-output assertions; all seven edited files
  produced a page at 22:19, the new `which-do-i-pick` and `decision-guide`
  anchors are in the built HTML, and the three new graphviz diagrams rendered as
  SVG with their labels present as text.
- Note: `bun run build` was run once before the fix brief's "never run it" line
  was read; it exited 0 and only rewrote the gitignored `dist/`. No other
  worker's file was touched, and no git command was run.

## Commit note for the parent

One commit, batch 8 only, with the seven edited docs plus this report:

```
src/content/docs/reference/supabase-read-replicas.mdx
src/content/docs/reference/supabase-realtime-surface.mdx
src/content/docs/reference/supabase-self-hosted-defaults.mdx
src/content/docs/reference/supabase-platform-operation-cost.mdx
src/content/docs/reference/tailscale-homelab.mdx
src/content/docs/reference/vfctl-gpu-curve-tool.mdx
src/content/docs/reference/zfs-on-nixos.mdx
docs/research/raw/2026-10-15-docs-review/fix-8.md
```

The working tree also holds other workers' in-progress edits across the corpus;
stage the explicit paths above rather than `git commit -a`.
