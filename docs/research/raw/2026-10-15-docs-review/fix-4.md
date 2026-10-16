# Fix batch 4

Files: 20 in `batches/batch-4.txt`. Edited: 9.

Verify (BRIEF.md, run on the nine edited docs):

- `prose-lint --config .prose-lint.json --before HEAD --no-max` - no fact, identifier,
  URL, slug or heading-text loss reported on any of the nine files.
- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline .prose-terms-baseline.json`
  - clean, no terms rotation. One `GATE mean-sentence-ceiling` fires on
  `forgejo-storage-backups-cache` (mean 26.0 words); it is pre-existing and not mine -
  the file measures 26.1 words at HEAD, and my edit leaves it 0.1 lower than that.
- `bun test tests/docs.test.ts tests/pins.test.ts` - **1828 pass, 241 skip, 0 fail**.
- `bun run build` NOT run (BRIEF.md forbids it; other workers share this checkout), so the
  241 built-output assertions are the skipped ones.

Scope note: BRIEF.md says old docs get American -ize fixed only in sentences already touched,
and FIX-BRIEF.md overrides only its fix policy. The prompt named homebrew's -ize words as a fix,
so the prose-only -ize occurrences there are normalised (see the per-file entry); the heading
and Aside-title changes carry the old-slug anchor where a slug exists.

## Number changes

Three cells had a figure relabelled, one claim wording reconciled, one arithmetic note added.
No figure was deleted, and no figure was changed to a different value.

- `reference/caching.mdx:944` - `DO + Cache API (5-10s TTL)`: `5-10s TTL` -> `5 s TTL`.
  Evidence: the same doc's read-flow diagram labels the object `Cache API (5s TTL)`
  (line 890) and the implementation sets `Cache-Control: max-age=5` (line 1017). The
  5-10 s band is the end-to-end latency (5 s wait plus the 5 s TTL), not a TTL, and it is
  kept in the two latency rows below.
- `reference/caching.mdx:1159` - `Worker sees new version | <=5-10s (Cache API TTL)`
  -> `<=5-10s end-to-end (5s wait + 5s TTL)`. Same evidence; the figure is unchanged, its
  label now says what it measures.
- `reference/caching.mdx:938` and `:1162` - "The 5s wait ensures KV has propagated the new
  manifest" against the doc's own footnote-backed "up to 60 seconds"
  (`[^cf-kv-consistency]`, line 628). `ensures` -> a 5 s head start against a documented
  60-second window. Both figures stay; the sentence now carries the scope that makes it true.
- `reference/docs-over-ssh.mdx:584` - added, no figure altered: `docs_grep` at ~1,500 tokens
  is called 77 percent smaller while the same table's stated baseline is ~30,000 tokens, and
  1,500 against 30,000 is a 95 percent cut. The note states the arithmetic and the implied
  ~6,500-token baseline (a derived figure, labelled as implied); the quoted 77 percent is left
  as the repository has it, per the paragraph above the table.

## New anchors

All are `<a id="old-slug"></a>` on the line directly under the renamed heading, per AGENTS.md.
`rg` over `src/` and `tests/` found no other file linking any of these slugs, so they are
insurance rather than a repair.

- `reference/caching.mdx`: `default-behavior` (heading `### Default behavior (no \`cf\` options, no Cache Rules)` -> `### Default behaviour (no \`cf\` options, no Cache Rules)`)
- `reference/caching.mdx`: `cross-zone-behavior` (`### Cross-zone behavior` -> `### Cross-zone behaviour`)
- `reference/caching.mdx`: `verified-behavior` (`#### Verified behavior` -> `#### Verified behaviour`)
- `reference/caching.mdx`: `centralized-caching` (`### Centralized caching (router handles all)` -> `### Centralised caching (router handles all)`)
- `reference/edge-caddy-on-nixos.mdx`: `decision-guide-native-service-vs-containerized-stack` (`## Decision guide: native service vs containerized stack` -> `... vs containerised stack`)
- `reference/homebrew-fraud-detection.mdx`: `input-validation-and-sanitization` (`## Input validation and sanitization` -> `## Input validation and sanitisation`)

Six anchors across three files.

## Per file

### reference/agent-guard-extensions.mdx - 1 edit

- **Importance-announcing frame (121)** - "the one thing the \"do not be confidently wrong\"
  system-prompt rule asks the model not to emit" -> "the failure mode the system prompt's
  \"do not be confidently wrong\" rule names". Claim unchanged; the self-announcing clause goes.
- **Bold labels left alone, deliberately.** The file's entire bold set is `**What it catches.**`
  (6), `**How it decides.**` (6), `**Motivating failure.**` (5), `**Motivating failures.**`,
  `**Second failure: the agent tainted its own words.**`. None grades itself, so per the
  prompt's split they stay as the descriptive run-in schema.
- Open: skeleton gaps (A). The `Guard | Catches | Kill switch` table (line 105) is the
  comparison table, but it sits after "The shared shape" rather than directly under the TL;DR,
  and there is no closing decision guide. Moving the table is a structural edit FIX-BRIEF does
  not authorise; reported for the author. The 2026-10-15 batch already fixed the other two
  frames in this file (lines 144, 400).

### reference/caching.mdx - 21 edits

- **US spelling (C)** - prose `behaviour` for `behavior` at 121, 253, 610, and the three
  headings with anchors above; `centralised` for `centralized` at 873, 1184, 1228, 1304
  (the Aside body too, 1312); the table cells at 1226 and 1262. Left as-is: `cacheable`
  (Cloudflare's own term), `Normalization Form D` (a Unicode standard name), the footnote
  titles `"Default cache behavior,"` and the `cache-behavior` URL (vendor page titles).
- **Frames (B)** - "The key question: should the **router** cache..." -> the question alone;
  "**Two levels of caching here:**" -> "The two caches serve different consumers:";
  "Why: origins know their own caching needs..." -> the sentence without the "Why:";
  `**Recommendation**` kept (an imperative, not a rating).
- **D reconcile** - the two TTL cells and the two "5s wait ensures" sentences, above.
- **Provenance note added (A)** - the doc's measurements now say where they come from: the
  Cache API ceiling at the AMS colo on 2026-02-22 (lines 638-640), the intermediate-domain
  override tested with two zones on different Cloudflare accounts (line 378), and the
  cache-read failover finding from the edge-resilience W24 drill of 2026-08-16 (line 94).
  W24 stays inline-linked to its pinned commit, so no Modules table is implied.
- **`## Related docs` added (A)** - three entries, each naming what it carries:
  cloudflare-supabase-architecture (the same Worker cache and KV patterns in a two-provider
  system), media-transformation-architecture (the range-request and chunked-KV retrieval
  side), edge-caddy-on-nixos (the self-hosted edge cache the scope note rules out).
- Open: no closing decision guide and no evidence table. The early "Which caching approach to
  use" diagram is paired with a table (its text fallback), and batch-4's own reading was that
  together they carry the decision; a closing guide would repeat them. The `---` thematic
  breaks and the older sections' second-person register are a whole-doc rewrite, which
  AGENTS.md does not ask for.

### reference/cloudflare-supabase-architecture.mdx - 1 edit (the exemplar)

- **Decision-guide text fallback (A)** - the "Decision guide" dot block (ends line 815) now has
  "The same decision as a list:" directly under it: four numbered lines built only from the
  diagram's own node and edge labels (data access -> REST/Hyperdrive/Cache API; auth check ->
  edge JWT verify or `getUser()`; realtime push -> browser-direct socket or Durable Object
  relay; per-PR preview -> preview binding or per-branch Hyperdrive). No other edit; batch-4
  found no B or C finding in the whole doc, and the tail survey confirms the other diagrams
  already carry their fallbacks.

### reference/docker-servarr-security.mdx - 2 edits

- **TL;DR and the diff-verify ranking loss (14)** - the two-sentence paragraph becomes four
  bullets. The first bullet restores the ranking claim diff-verify flagged
  ("The three that matter most are filesystem isolation ... network segmentation ... and
  credential rotation"). The other three add nothing new: the CIS/s6-overlay finding and
  `UMASK=0002` (line 288), the in-process WireGuard case needing `CAP_NET_ADMIN` with dirs
  0775 and files 0664 (lines 280-282), and the verification checklist's own layers (line 385).
  Every figure in the original two sentences survives.
- **`## Related docs` added (A)** - appdata-tiering-zfs (where the appdata share lives) and
  arr-stack-docker-patterns (the compose shapes the mounts and networks are applied to).
- Open: the binhex `privileged: true` constraint is stated twice, at lines 269 and 280. They
  agree - the second is the premise of the ownership argument - so it is a repetition, not a
  contradiction, and nothing is settled by deleting either. No decision guide: single-system
  doc, n/a.

### reference/docs-over-ssh.mdx - 1 edit

- **D reconcile (584)** - the arithmetic note described under Number changes. Batch-4 marked the
  figure as not the reviewer's to change because the table is quoted from the repository README;
  the note keeps the quote and states the mismatch instead.

### reference/edge-caddy-on-nixos.mdx - 8 edits

- **US spelling (C)** - all six `containerized` sites: prose (12), the decision-guide heading
  (355, anchored), the table label and the storage row (357, 366), the dot node label (379),
  and the Related docs link text (400).
- **Importance-announcing bullet (183)** - "**One custom rule did all useful work:**" -> "**One
  custom rule:**". The bullet's fact is unchanged.
- **`categorized` kept** - diff-verify asked for a revert of batch-4's `categorised` (line 309)
  on mixing grounds. Kept, because this pass converts the same doc's six `containerized` sites
  to -ise, so reverting one word would reintroduce the mix in the other direction; the corpus
  converts -ize to -ise when it touches a heading at all (see the anchor at
  `reference/self-hosted-research-stack.mdx:91`). `synchronization` (135, 310) is left: it was
  not a reported item.

### reference/flint2-vap-durability.mdx - 1 edit

- **`## Evidence` table added (A)** - seven rows, each restating a measured item already in the
  doc with the check the doc itself names (`iwinfo ra0 info` plus a phone scan; the missing
  `.dat` template; `ubus call network.wireless status`; the phantom `iot_new` section;
  the restart-then-`wifi` recovery; two deliberate reboots with clients back within 30 seconds),
  plus the two-layer START=15/START=20 boot order marked as the firmware's own init scripts
  read rather than a test. Closing line splits measured from source-read.
- Open: the `[^esphome-build]` footnote (observed 2026-08-30, an ESPHome build failure during a
  fleet WiFi password rotation) is off-topic for this doc, but footnote definitions are out of
  scope per BRIEF.md. No decision guide: single-system doc, n/a.

### reference/forgejo-storage-backups-cache.mdx - 2 edits

- **Aside title (B)** - `title="Direction, not destination, is the trap"` ->
  `title="The order decides the source"`. Aside titles are not headings and have no slug, so no
  anchor is involved; the body is untouched.
- **Self-rating sentence (105)** - "Confusing them is the easiest way to fix the wrong one." ->
  "Confusing them means fixing the wrong one." Kept as its own sentence (not merged into the
  one before it) so the file's mean sentence length does not rise: HEAD is 26.1 words, the
  merged form measured 26.4, the shipped form 26.0. The `mean-sentence-ceiling` gate fails at
  HEAD too, on 21 other sentences.

### reference/homebrew-fraud-detection.mdx - 19 edits

- **TL;DR added (A)** - five bullets from the doc's own conclusions: the two Workers and their
  RPC binding, the layer order and the D1 fast path, fail-open with weight redistribution
  against the two fail-secure checks, config-loaded weights with normalisation and the
  deterministic floors plus corroboration bonus, and the `ScoringDecision` audit trail with the
  20-tree Random Forest in KV guarded on the 25 MB limit.
- **Aside title (B)** - "Why a fast path matters" -> "The fast path avoids one API call".
- **US spelling (C)** - prose-only `sanitisation` (547, 550, 560, 585-586, heading 553 with
  anchor), `specialised` (645), `Romanised` and `NFD-normalised` (687), `serialised` (757, 1324),
  `centralised` (994), `normalised`/`auto-normalised` (556, 1050, 380), `optimisation` (1221),
  `normalisation` (1452, 1463). Left: `Normalization Form D` (Unicode standard name), and the
  code comment, dot label and JSON string at 332, 430 and 1354 (fences and diagram labels).
- **diff-verify restore (728)** - "Needed for a safe rollout..." -> "Required for a safe rollout
  of a new model or config change."
- **`## Related docs` added (A)** - caching, for KV's 25 MB value limit and eventual consistency,
  the two properties the model artifact and the hot-reloaded config sit under.
- Open: `behavior`/`behavioral` (704, 784, 214, and one more) are left - not -ize, not reported.
  The provenance role is played by "All patterns are derived from production code" (line 16);
  there is no separate provenance note.

## Files in the batch with no edit, and why

- `reference/agent-secret-guard.mdx` - only open item is structural (the which-to-pick table sits
  before the per-guard sections); bold run-in labels stay by the prompt's rule.
- `reference/agent-memory-store.mdx` - D item left open on purpose: "The corpus is 642k messages
  and roughly 2.3GB in the messages table" (456) against the doc's own table "Table including
  TOAST 2,814 MB" (221, i.e. 2.75 GB) and "the same table measured 4,395 MB" (458). The doc's
  evidence does not say what the 2.3 GB measures - pre-embedding text? the table before growth? -
  so a reconcile would be a guess. Author decision; all three figures are internal to this doc.
- `reference/appdata-tiering-zfs.mdx` - evidence table missing (A, not in FIX-BRIEF's fix list);
  no B or C finding.
- `reference/declarative-homelab-backups.mdx` - the `## The untested-restore trap` heading is
  heading text (BRIEF.md freezes it); no other finding.
- `reference/drawbridge-docker-socket-proxy.mdx` - clean on all four axes in batch-4.
- `reference/forgejo-actions-runner.mdx` - clean; its one open item is a missing back-link that
  lives in `guides/porting-github-actions-to-forgejo` (not in this batch), reported here for
  whichever batch owns the guide.
- `reference/forgejo-releases-and-registry.mdx` - clean.
- `reference/glanceable-dashboards-environmental-telemetry.mdx` - two left open: `**Colour alone
  is not a coding.**` (21) reads as a drafting slip for "not an encoding", but the body's fix is
  named "Redundant coding" and batch-4 was unsure it is a tell, so it stands; and
  `visualization`/`visualisation` (225) sits against Grafana's own "Visualizations" page, treated
  as a product term.
- `reference/home-iot-network.mdx` - bold run-in labels only, author's convention.
- `reference/composer-gitops-compose-manager.mdx` - no edit: both diff-verify items (92, 141) are
  already resolved in the committed text, and the doc's own `## Decision guide` (line 222) plus
  its "Choosing the verb" table contradict batch-4's summary line claiming it has none.
- `reference/choosing-a-secrets-backend.mdx` - clean.
