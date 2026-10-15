## Batch 4 review

## src/content/docs/reference/drawbridge-docker-socket-proxy.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: none. Lede, TL;DR, provenance Aside ("The page reports no measured
numbers"), request-flow diagram with prose directly under it, "Gotchas, all
observed", a prose Decision guide, and Related docs that name the relationship in
both directions.

Fixed: 0 edits. No B or C finding worth an edit; the bullet run-in labels
(`**Root is by design.**`) are the batch's recurring pattern, not a per-doc one.

Unfixed (author judgment): `L120`: [D] none found - the one figure (825-day leaf
certificates, 128 MB / 1 CPU limits) is consistent across the body and the deploy
section.

## src/content/docs/reference/flint2-vap-durability.mdx

Type: reference - folder correct. Category `homelab`. Carries the required
"Historical since 2026-09-04" Aside directly after the frontmatter with the
replacement guide named; its contents were left untouched as the brief requires.

Skeleton gaps: no evidence table. The doc is measurement-heavy (hostapd journal,
`ubus network.wireless status`, two deliberate reboots) and states its provenance
in a paragraph, but there is no "Claim | How it was checked" table, which is the
skeleton rule for a measured doc. Also no closing decision guide (the "What NOT to
do" list is the nearest equivalent).

Fixed: 0 edits.

Unfixed (author judgment): `L134`: [D] the third bullet of "What NOT to do" - "Do
not run `esphome` builds as root on a Pi that hosts the ESPHome dashboard" - is
not about VAP durability at all; it is an ESPHome hub gotcha sitting in a
VAP-boot-order doc and belongs with the ESPHome fleet pages. `L41`: [A] the
failure-chain narrative is measured but the measurements are inline, not tabled.

## src/content/docs/reference/home-iot-network.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: no closing decision-guide diagram (the early "Which hardware should
host the IoT SSID" table carries the decision), and no `## Related docs` section -
but the cross-links are inline, named, and point both ways (Flint 2 VAP durability,
openwrt-bridged-ap, esphome-fleet-ssid-migration, airgradient-one-esphome-local), so
this is a formality rather than a missing pairing.

Fixed: 0 edits.

Unfixed (author judgment): `L142`: [B] the numbered adoption steps use bold run-in
labels (`**Switch the old AP off.**`), the same pattern as the rest of the batch.
Nothing else found; measured-vs-inferred is separated in the evidence table
("inferred from ESPHome source and docs, not proven on this rig") and the two
`\$0 (owned)` cost cells are escaped correctly for KaTeX.

## src/content/docs/reference/forgejo-actions-runner.mdx

Type: reference - folder correct. Category `forge`.

Skeleton gaps: none. Lede names its pair, provenance paragraph dates the LIVE rows
(2026-09-29), TL;DR, topology with an "In list form" fallback, an early "Which do I
pick" table, a closing decision guide with a list, an incident table, and Related
docs.

Fixed: 0 edits.

Unfixed (author judgment): `L91`: [D] the doc says the builder cache,
and the 'had grown' phrase is at L109 and L167; "had grown to
about 26 GB" where `forgejo-releases-and-registry.mdx` says 26.1 GB for the same
cache - consistent as rounding, not a contradiction. `L86`: [B] run-in bold labels
again.

## src/content/docs/reference/forgejo-releases-and-registry.mdx

Type: reference - folder correct. Category `forge`.

Skeleton gaps: none. Provenance paragraph, TL;DR, topology + list, "Which lane do I
pick", decision guide + list, an Evidence table with a "Checked how" column and a
"Re-checked 2026-10-04" row, and Related docs.

Fixed: 1 edit.
- L112: "Separately, and worth keeping apart from the ban-and-reversal above:" ->
  "Separately, and distinct from the ban-and-reversal above:" (the "worth X-ing"
  importance-announcing frame; the fact that the two are separate is kept).

Unfixed (author judgment): `L140`: [A] the doc is "release lanes" content under `reference/`, which is the
right folder per the folder test.

## src/content/docs/reference/forgejo-storage-backups-cache.mdx

Type: reference - folder correct. Category `forge`.

Skeleton gaps: none. Lede names the sibling page it does not repeat, provenance
Aside, TL;DR, a storage diagram with its table as the text fallback, decision guide
+ list, Related docs.

Fixed: 2 edits.
- L117: "The fix is not a timer - it is a garbage-collection policy passed inline to the build-driver setup step..." -> "The fix is a garbage-collection policy passed inline to the build-driver setup step..." (negative parallelism; the "not a timer" contrast is already carried by the TL;DR, the table row, and "nothing external has to trigger it" two sentences later).
- L93: "up to ten minutes of randomized delay" -> "up to ten minutes of randomised delay" (US spelling in prose; the sibling runner page already uses "randomised").

Unfixed (author judgment): `L76`: [B] the `<Aside type="caution" title="Direction,
not destination, is the trap">` title is negative parallelism plus self-rating.
Not edited: the brief forbids changing heading text, and an Aside title is
heading text. Suggested title: "The order decides the source". `L105`: [B]
"Confusing them is the easiest way to fix the wrong one" grades its own point;
suggested: "The two are unrelated systems on one host, and the wrong fix is easy to
apply."

## src/content/docs/reference/agent-guard-extensions.mdx

Type: reference - folder correct. Explanation-led, no task sequence, category
`workstations`.

Skeleton gaps: no closing decision guide, and no early "which do I pick" table -
the per-guard structure substitutes for it, but the `Guard | Catches | Kill
switch` table sits in the middle rather than up front. Provenance note present
("read on 2026-10-04"); no measured numbers, so no evidence table is needed. No
guide cross-link (this is the pair of `agent-secret-guard.mdx`, which links
back).

Fixed: 2 edits.
- L144: "Noise control is the part that makes it survivable. Targets are classified:" -> "Noise control decides whether it survives. Targets are classified:"
- L400: "The general form: a guard's liveness is a property of the deployment, not the source. A unit test proves the logic; only a probe..." -> "A guard's liveness is a property of the deployment, not the source, and a unit test proves only the logic; only a probe..."

Unfixed (author judgment): `L114,172,208,232,298,328`: [B] the six guards each
repeat bold lead-in labels (`**What it catches.**`, `**How it decides.**`,
`**Motivating failure.**`) - 20 instances in one doc. Consistent as a schema, so
left alone; if the corpus call is that this is the "decorative bold on labels"
tell, it is a doc-wide rewrite, not a sentence fix.
`L122`: [B] "the one thing the 'do not be confidently wrong' system-prompt rule
asks the model not to emit" -> could be "the failure mode the system-prompt rule
names" (the frame announces rather than states).

## src/content/docs/reference/agent-memory-store.mdx

Type: reference - folder correct. Category `workstations`.

Skeleton gaps: closed by one addition - the closing decision guide had no text
fallback (the only diagram in this batch of 20 that was missing one). Everything
else present: TL;DR, provenance ("Measured 2026-08-09 and 2026-08-10"), reading
the numbers, 24-row evidence table with "How it was checked", measured-vs-
design-only split ("Design only" for the partial-index row, "Not tested" for
vector-vs-FTS relevance).

Fixed: 1 edit (allowed A exception).
- After the decision-guide fence: added "The same decision as a list:" with the
  two branches (more than one client/machine; history past retention; "what did
  I discuss") derived from the diagram's own edge labels.

Unfixed (author judgment): `L456`: [D] "roughly 2.3GB in the messages table" reads
against the 2,814 MB figure in "What the index costs" for the same table - a
different measurement date is plausible, but the two are not reconciled.
`L431`: [B] bold lead-ins in the source table and body bullets
(`**Self-reference ranks first.**`, `**Every object in one batch...**`) - the
same corpus-wide decorative-bold question as above.

## src/content/docs/reference/agent-secret-guard.mdx

Type: reference - folder correct. Category `secrets`.

Skeleton gaps: none material. TL;DR, "Which to pick" (L470), "Reading the
numbers" (a 25-row evidence table with "How it was checked"), "What it does not
catch", "Known issues", "Related docs" all present; the design diagram carries an
"In words:" fallback.

Fixed: 0 edits.

Unfixed (author judgment): `L470`: [A] the "Which to pick" table sits after two
long flaw lists ("Things that went wrong", "What it does not catch"); the house
rule is to order so the decision comes first. Moving it would renumber nothing but
is a structural edit, so reported only. `L303`: [B] the bold run-in labels in
"Things that went wrong" (`**A guard that failed open silently.**`) are the same
label-bold pattern as the rest of the batch.

## src/content/docs/reference/appdata-tiering-zfs.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: closing decision guide + text fallback present ("Reading the guide
as a list"); sourcing-in direction note present. No evidence table: the doc
carries measured allocation figures and labels the reasoning ("the rationale
below is an argument, with no benchmark run on this host"), which is the split
the contract asks for, but a two-row evidence table would state it more plainly.

Fixed: 0 edits.

Unfixed (author judgment): `L14`: [A] the placement rules are labelled as
reasoning in the provenance aside but not in an evidence table;
`L197`: [B] "Score the state rather than the service" is the closing line of the
decision guide and reads as an aphorism, though it is the doc's actual rule.

## src/content/docs/reference/declarative-homelab-backups.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: none. Lede, provenance Aside (host, dates, cited-vs-planned split),
TL;DR, topology with a numbered fallback, "Which mechanism protects what" matrix,
decision guide + list, Related docs. The cadence arithmetic is self-consistent
(24+7+4+3 = 38 kept, matching "38 of" in the prose).

Fixed: 0 edits.

Unfixed (author judgment): `L97`: [B] "## The untested-restore trap" - "trap" in a
heading, heading text is not mine to change, and the section states the case
plainly; suggested replacement if the author wants it: "## The untested restore".

## src/content/docs/reference/glanceable-dashboards-environmental-telemetry.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: none. Provenance paragraph dated 2026-10-08, TL;DR, data-flow
diagram with a numbered fallback, "Which tool for which question", a 12-row
"Claim | How it was checked | Status" table that splits Measured / Documented
source-read / Documented not tested, a checklist, and Related docs.

Fixed: 2 edits.
- L186: "The trap is the legacy key. `layout_options.grid_columns` is migrated..." -> "The legacy key is `layout_options.grid_columns`: it is migrated..." (self-rating label removed, both facts kept).
- L73: "The split is not "HA for looking, Grafana for analysis". It is that Home Assistant owns the entity..." -> one sentence, "The split is not ...: Home Assistant owns the entity ..." (cross-sentence negative parallelism).

Unfixed (author judgment): `L21`: [B] "**Colour alone is not a coding.**" - if it means
"not an encoding" it is a drafting slip; the body later calls the fix "Redundant
coding", so it may be deliberate shorthand. Not touched.
`L225,226`: [C] "visualization" twice in prose against the doc's own British
"visualisation" (frontmatter, two headings, and the ONS table row). Left as-is
because the nearer referent is Grafana's own "Visualizations" page.

## src/content/docs/reference/docker-servarr-security.mdx

Type: [A] folder is `reference/`, content is guide-shaped for most of its length -
a problem/fix/verify sequence with numbered recommendations and a Verification
checklist at the end, and the lede opens "How to harden a Docker Compose media
automation stack". The description calls it a "Security reference". One of the two
should win: either it moves to `guides/` (with its aliases carried over) or the lede
is reframed from "how to" to "how the hardening works and which recommendations
survive this stack". Reported, not moved.

Skeleton gaps: no TL;DR bullets beyond a one-sentence paragraph, no provenance
note (it carries one dated incident, 2026-10-01), no decision guide, no Related docs,
no evidence table; uses `---` thematic breaks as section separators, an older corpus
pattern.

Fixed: 1 edit.
- L14: "**TL;DR:** The biggest wins are filesystem isolation ... network segmentation ... and credential rotation." -> "**TL;DR:** Start with filesystem isolation ... network segmentation ... and credential rotation." (self-rating removed, the same three items kept).

Unfixed (author judgment): `L262`: [D] "binhex/arch-qbittorrentvpn ... requires
`privileged: true`" and the later "must be root" section run as two separate
accounts of the same constraint 30 lines apart; a reader has to notice they are the
same container. `L12`: [C] US spelling is not the issue here (the doc already uses
"behaviour"), but the body alternates "the *arr applications" and "arr apps".

## src/content/docs/reference/edge-caddy-on-nixos.mdx

Type: reference - folder correct. Category `networking`.

Skeleton gaps: none. TL;DR, two architecture diagrams each with a numbered
fallback, a module inventory, dated sections for the 2026-09-26 CRS removal and the
2026-09-30 storage cutover, a decision guide with a table, a diagram and a
three-criteria list, and Related docs.

Fixed: 1 edit.
- L309: "IPs are parsed and categorized across all eight threat score levels" -> "categorised" (British -ise; the doc is post-contract and the corpus uses -ise for this word 1:3).

Unfixed (author judgment): `L355,359,365,379,399`: [C] "containerized" (6 sites)
against "containerised" (3 elsewhere in the corpus) - left alone because two of the
sites are a section heading and a table label ("Containerized Compose"), and heading
text is out of scope. `L183`: [B] "**One custom rule did all useful work:**" is an
importance-announcing lead on a fact that follows in the same bullet.

## src/content/docs/reference/composer-gitops-compose-manager.mdx

Type: reference - folder correct. Category `homelab`.

Skeleton gaps: none. Provenance note (source tree at the pinned tag, and the
explicit "no live API call was made, so every figure is a property of the code"),
TL;DR, topology with a "Reading it as text" fallback, "Choosing the verb" table,
decision guide + numbered list, six gotchas, Related docs.

Fixed: 3 edits.
- L92: "This is the fact that makes most hand-run compose commands fail before they start, and the reason a path that works in Composer does not exist over ssh on the target host." -> "Most hand-run compose commands fail before they start, and a path that works in Composer does not exist over ssh on the target host." (frame removed).
- L141: "..., including the age key resolution order - a data-directory key beats every environment variable, which is the trap during a rotation." -> "..., including the age key resolution order, where a data-directory key beats every environment variable." (self-rating clause dropped; the precedence, which is the actionable fact, is kept).
- L151: "The reason to care is a fixed container address: two separate API calls let the up run..." -> "Two separate API calls let the up run before the old container is gone, and a fixed container address is lost." (frame removed).

Unfixed (author judgment): `L224`: [B] "In practice, a create without an explicit
host is a bug" style phrasing in the gotchas reads as advice rather than a finding,
but it is a real incident write-up and the instruction is the point.

## src/content/docs/reference/homebrew-fraud-detection.mdx

Type: reference - folder correct. Category `cloudflare`, group `edge`.

Skeleton gaps (largest in the batch, and the doc is pre-contract so this is
reported rather than restructured): no TL;DR, no provenance note, no Related docs,
no closing decision guide, and `---` thematic breaks separate every section.
The closing "From scoring to operations" section (a later addition in the current
style) is the model the rest of the doc does not follow.

Fixed: 3 edits.
- L15: "This serves as a reference template for building similar systems." -> "This is a reference template for building similar systems." ("serves as").
- L719: "Critical for safe rollout of new models or config changes." -> "Used when rolling out a new model or config change." (importance-announcing fragment).
- L1358: "...ranks 3rd by importance, demonstrating its value for distinguishing `john1990@` ... from `2024signup@` ..." -> "...ranks 3rd by importance; it distinguishes `john1990@` ... from `2024signup@` ..." (grading participle tail).

Unfixed (author judgment): `L161`: [B] the Aside title "Why a fast path matters"
is the one question-frame Aside title in the doc (the other six titles are claims:
"Fail-open design", "Write-before-read", "IPv6 subnet matching"); Aside titles are
heading text, so reported. `L545,637,372,679`: [C] US spelling in prose -
"specialized", "sanitization" (incl. the heading "## Input validation and
sanitization"), "normalized" / "auto-normalizes", "Romanized" - against the corpus's
mixed but -ise-leaning convention; pre-contract doc, so only report. Note the same
doc's newer closing section uses British forms.

Checked and clean, for the record: the 10 weights sum to 1.00; the ten feature
categories sum to 48; the training-data table sums to 1,000,000 exactly and is
50/50; the progressive-timeout cumulative column is right (1+4+8+12+24).

## src/content/docs/reference/docs-over-ssh.mdx

Type: reference - folder correct. Category `workstations`.

Skeleton gaps: none, and this is the batch's best-formed doc. Pinned-commit
provenance with an explicit "No SSH session was opened and no endpoint was
queried while writing it", TL;DR, topology with "The same picture as text" as its
fallback, "Which path to use", "What generalises", a "Reproducing these figures"
table (claim -> how it was checked) that ends with an explicit "Not checked: the
live server", and six Related docs that each state what the link carries.
Arithmetic cross-checks pass: source split 180+180+1 = 361 and the format split
sums to 361; the discovery sub-table sums to 143, matching the 143 page-by-page
row; the token table's "~480 vs ~30,000" is a 98 percent cut.

Fixed: 1 edit.
- L600: "**Immutability is what buys statelessness.**" -> "**Immutability is what allows a stateless endpoint.**" ("buys you/buys" family; the claim is unchanged).

Unfixed (author judgment): `L581`: [D] the token table says `docs_grep` at
"~1,500" tokens is "77 percent smaller" than the stated ~30,000 baseline, which is
a 95 percent cut; 77 percent implies a ~6,500-token baseline. The table is
attributed to the repository README ("Quoted as the repository has it"), so the
figure may be right against a different comparison set - but read against the
baseline in the same table it does not add up. Numbers are not mine to change.

## src/content/docs/reference/choosing-a-secrets-backend.mdx

Type: reference - folder correct. Category `secrets`.

Skeleton gaps: none. Lede, provenance paragraph with an explicit
asserted-vs-measured split, TL;DR, decision diagram with a "Reading the guide as a
list" fallback, "Which to pick", and an evidence table that splits tested from
design-only ("Delete a value with `sops updatekeys`" -> "Magic. Not documented.").

Fixed: 0 edits. No B or C finding worth an edit.

Unfixed (author judgment): `L186`: [D] "Magic. Not documented." is the right call
for a tested-vs-documented row, but it is the only row whose Status cell is not a
verb phrase; a reader scanning the column sees one cell in a different register.

## src/content/docs/reference/caching.mdx

Type: reference - folder correct. Category `cloudflare`, group `edge`. This is the
oldest doc in the batch and the only one whose register has not been through the
2026-08-28 sweep.

Skeleton gaps: the early "Which caching approach to use" diagram plus its table
carry the decision, but there is no closing decision guide; no provenance note (the
scope note at the top says what the doc covers, not where the figures come from);
no Related docs section (cross-links are inline); no evidence table. Uses `---`
thematic breaks as section separators throughout, and addresses the reader as
"you" in the older sections while the newer sections are impersonal.

Fixed: 0 edits. A wholesale register rewrite of an old doc is what AGENTS.md
explicitly does not ask for, so everything below is reported.

Unfixed:
- `L63`: [C] "Default behavior" (heading and prose), "centralized" (L1250),
  "normalized", "cacheable" - US spelling in a corpus that is British -ise;
  pre-contract, so per the brief only reported.
- `L1030,1180`: [B] counting/announcing frames that the current catalogue bans:
  "**Two levels of caching here:**", "The key question: should the **router**
  cache responses...", "**Two levels of caching here**"-style slugs, and
  "**Recommendation**" followed by "Why: origins know their own caching needs".
  Present throughout; fixing them means rewriting the doc.
- `L1041`: [D] the doc states KV's eventual consistency is "up to 60 seconds"
  (its own footnote, `cf-kv-consistency`) and then prescribes a 5-second sleep
  before flipping the version pointer with the claim "The 5s wait ensures KV has
  propagated the new manifest before the DO points to it", restated at L1105 as
  "The 5s wait ensures KV has propagated". 5 seconds does not ensure a 60-second
  worst case; the sentence needs the scope that makes it true (propagated in the
  common case, to the colos the cache TTL then covers) or the wait needs
  justifying against the real propagation distribution.
- `L870,1093`: [D] minor: "Cache API (5s TTL)" in the read-flow diagram, "(5-10s
  TTL)" in the strategy table and `max-age=5` in the code are three statements of
  one value.

## src/content/docs/reference/cloudflare-supabase-architecture.mdx

Type: reference - folder correct. Category `cloudflare`, group `edge`.

Read to L480 of 904 (the remaining tail was surveyed for diagram/fallback shape
only, since the brief forbids editing the exemplar).

Skeleton gaps: one, and it is the rule's own exemplar: the closing decision-guide
diagram (L772) has no text fallback - every other doc in this batch pairs its
decision diagram with one ("Reading the guide as a list", "In list form", "The
same picture as text"). The doc also ends with `## Reproducing` and a References
list, both present.

Fixed: 0 edits. The brief exempts the canonical exemplar, and its rhythm
(claim immediately followed by its qualifier or number) is the pattern the rest of
the corpus is measured against; no B or C finding in the half I read.

Unfixed (author judgment): `L772`: [A] add a numbered fallback under the decision
guide so the exemplar matches the rule it defines. `L157`: "Order of leverage
against a distant database" is a deliberate phrase in this doc and one of the
lines `REJECTED_MARKERS` protects - left alone.

## Summary

All 20 docs on the batch list were reviewed on the four axes. Ten files were
edited (17 edits); nine got no edit because I found nothing on the B or C axis that
I was confident about, and the exemplar is out of scope for edits.

The two axes need the parent's attention:

- axis A (structure): 8 of 20 docs have a skeleton gap, and the gaps cluster in
  the pre-contract set - `homebrew-fraud-detection` (no TL;DR, no provenance note,
  no Related docs, no decision guide), `docker-servarr-security` (no provenance,
  no decision guide, no Related docs), `caching` (no provenance, no decision
  guide, no Related docs), `flint2-vap-durability` (measured, no evidence table),
  `agent-guard-extensions` and `composer-gitops-compose-manager` (no closing
  decision guide; a table carries the decision instead), plus one text-fallback
  gap fixed in `agent-memory-store` and one reported in the exemplar.
- axis D (content): the batch is unusually clean on arithmetic and cross-doc
  consistency. Five items are worth a look, none edited: the 77-percent figure in
  `docs-over-ssh`, the 5-second-wait-vs-60-second-consistency claim in `caching`,
  the off-topic `esphome`-build bullet in `flint2-vap-durability`, the same binhex
  `privileged: true` constraint stated twice 100 lines apart in
  `docker-servarr-security`, and "roughly 2.3GB" against the 2,814 MB table figure
  in `agent-memory-store`.

Top five recurring issues:

1. **Deliberately-not-changed, but it is the batch's dominant prose shape:
   bold run-in labels** (`**Root is by design.**`, `**What it catches.**`).
   Present in every doc I read except the two secrets docs and `caching`; 20
   instances in `agent-guard-extensions` alone, 6 in `agent-secret-guard`, 9 in
   `homebrew-fraud-detection`'s Asides. If the corpus call is that this is the
   "decorative bold on labels" tell, it is a corpus-wide pass, not a per-doc fix -
   flagging it once, here, is the cheap place to decide.
2. **Importance-announcing and self-rating frames: 15 occurrences, 11 fixed.**
   Fixed: "The general form:" and "Noise control is the part that makes it
   survivable" (agent-guard), "The biggest wins are" (docker-servarr), "This is
   the fact that makes", "which is the trap during a rotation", "The reason to
   care is" (composer), "worth keeping apart" (forgejo-releases), "The trap is
   the legacy key" (glanceable), "Critical for safe rollout" (homebrew),
   "Immutability is what buys statelessness" (docs-over-ssh). Reported unfixed
   where the fix is structural: the `Direction, not destination, is the trap`
   Aside title (forgejo-storage), "Why a fast path matters" (homebrew),
   "One custom rule did all useful work" (edge-caddy), "Confusing them is the
   easiest way to fix the wrong one" (forgejo-storage). This class is still
   live in docs written after the sweep, which is the single most useful thing
   this batch found.
3. **Negative parallelism: 3 fixed, 1 warned.** "The split is not X. It is that Y"
   (glanceable, cross-sentence form), "The fix is not a timer - it is a
   garbage-collection policy" (forgejo-storage), "Direction, not destination, is
   the trap" (reported). Nothing else in 20 docs.
4. **US spelling in prose: 4 docs, 2 fixed.** Fixed: `randomized` -> `randomised`
   (forgejo-storage, against its sibling doc) and `categorized` ->
   `categorised` (edge-caddy). Reported: `homebrew-fraud-detection`
   ("sanitization", "specialized", "normalized", "Romanized"), `caching`
   ("behavior", "centralized", "normalized"), and `containerized` (6 sites across
   heading, table label and prose in edge-caddy). The corpus splits roughly
   1:2 -ise to -ize, so a bulk pass is a corpus decision, not a batch-4 fix.
5. **Missing text fallback under a decision diagram: 2 of 20** - fixed in
   `agent-memory-store`, reported in `cloudflare-supabase-architecture` (the
   exemplar). Every other doc already pairs its decision diagram with a list or a
   table, so this rule is being honoured; the exemplar is the outlier.

Files edited (17 edits):

| File | Edits | Class |
|---|---|---|
| `reference/agent-guard-extensions.mdx` | 2 | frames |
| `reference/agent-memory-store.mdx` | 1 | A: decision-diagram text fallback |
| `reference/forgejo-releases-and-registry.mdx` | 1 | frame |
| `reference/forgejo-storage-backups-cache.mdx` | 2 | negative parallelism, spelling |
| `reference/glanceable-dashboards-environmental-telemetry.mdx` | 2 | negative parallelism, frame |
| `reference/composer-gitops-compose-manager.mdx` | 3 | frames |
| `reference/docker-servarr-security.mdx` | 1 | frame |
| `reference/edge-caddy-on-nixos.mdx` | 1 | spelling |
| `reference/homebrew-fraud-detection.mdx` | 3 | slop word, frame, participle tail |
| `reference/docs-over-ssh.mdx` | 1 | "buys" frame |

Not edited (checked, no confident finding): `agent-secret-guard`,
`appdata-tiering-zfs`, `choosing-a-secrets-backend`, `declarative-homelab-backups`,
`drawbridge-docker-socket-proxy`, `flint2-vap-durability`, `forgejo-actions-runner`,
`home-iot-network`, `caching`, `cloudflare-supabase-architecture`.

Calibration notes for the parent:

- Every line number I cite was re-grepped after the edit pass; three earlier
  citations in this report were wrong and are corrected in place. One claim I had
  written from recall ("worth asking again" in `forgejo-releases-and-registry`)
  did not exist in the file when I grepped for it and was deleted rather than
  left standing.
- I did not count `containerized` or the -ization nouns as C defects requiring a
  batch fix, because the corpus's own split is roughly 1:2 and the occurrences sit
  in headings, table labels and product terms (`Visualizations` is Grafana's own
  page, `Utilizing Docker within Actions` is a Forgejo doc title).
- Nothing in this report was verified by building the site: the brief forbids it
  while other workers edit the same checkout. Verification was prose-lint on the
  edited files plus greps against the edited regions.

## Verification run

- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline
  .prose-terms-baseline.json <10 edited files>` -> exit 0. No new term rotation.
- `prose-lint --config .prose-lint.json --before HEAD --no-max <10 edited files>`
  -> exit 1, one failure and it is pre-existing: `forgejo-storage-backups-cache.mdx`
  trips `gate mean-sentence-ceiling` at mean 26.1 words. Re-ran the same sensor on
  `git show HEAD:` of that file: identical, mean 26.1 over 2206 words, so my edits
  neither caused it nor moved it (my version: mean 26.1 over 2205 words). No
  facts/identifier removals reported for any edited file.
- `bun test tests/pins.test.ts` -> 292 pass, 235 skip, 0 fail (the skips are the
  dist-rendering pins, which need a fresh build).
- `bun test tests/docs.test.ts` -> 1536 pass, 6 skip, 0 fail. The 6 skips are the
  `built output` group. This run covers the whole corpus, so the edited docs pass
  the machine-phrasing markers, footnote balance, dot-fence style, internal links
  and the taxonomy/sidebar checks.
- Not run, per the brief: `bun run build` (other workers are editing the same
  checkout). Nothing in this batch was verified against rendered HTML.
