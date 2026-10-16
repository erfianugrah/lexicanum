# Fix batch 6

Files: 12 in `batches/batch-6.txt`. Edited: 8.

Verify (BRIEF.md, run on the nine edited docs):
`prose-lint --before HEAD --no-max` - clean, no fact/identifier/URL/slug loss.
`prose-lint --baseline .prose-terms-baseline.json --no-max --no-counters` - clean, no gate.
`bun test tests/docs.test.ts tests/pins.test.ts` - **1828 pass, 241 skip, 0 fail**.
`bun run build` NOT run (BRIEF.md forbids it; other workers share this checkout), so the
CHECK_BUILT-only assertions (241 of them) are the skipped ones.

## Number changes

None. No figure, backticked identifier, URL or footnote slug was deleted or altered anywhere in
the batch. `prose-lint --before HEAD` reports no fact loss on any of the nine files, which is the
check for exactly this. The five practice-cell justifications that moved from a Practice column
into its Evidence column carried no numbers with them (the numbers were already in Evidence and
stay there); the one row whose Practice cell carried the identifier `503 PGRST002` keeps it in the
Practice cell.

## New anchors

- `src/content/docs/reference/stripe-sync-engine.mdx`: `evidence-the-pin-is-not-just-a-stale-install`
  (heading `### Evidence the pin is not just a stale install` -> `### A fresh install gets the same pin`).
- `src/content/docs/reference/supabase-data-residency.mdx`: `the-legal-frame-dpa-sccs-and-the-cloud-act`
  (heading `## The legal frame: DPA, SCCs, and the CLOUD Act` -> `## The legal frame`).

Both are `<a id="old-slug"></a>` on the line directly under the new heading, per AGENTS.md. Neither
old slug is linked from any other file in the corpus (`rg` over `src/` and `tests/` found no
reference), so the anchors are insurance rather than a repair.

## Per file

### src/content/docs/reference/stripe-sync-engine.mdx - 10 edits

- **`not just X` heading (131)** - `### Evidence the pin is not just a stale install` ->
  `### A fresh install gets the same pin`, with the old slug anchored at 132.
- **Cross-reference bug from diff-verify (180)** - `so a \`comment on column\` warning about the null
  never reaches the model.` -> `... explaining that the column reads null never reaches the model.`
  "the null" was the referent diff-verify flagged; the column is now named.
- **Practice cells over 90 characters (7 of 7, 238-244)** - every one trimmed to the imperative,
  justification moved into Evidence, nothing else dropped:
  - 113 -> 79 chars: `Read \`current_period_end\` through \`subscription_items._raw_data\`, behind a view`,
    with "point dashboards at the view ... rather than at the typed column" moved to Evidence.
  - 148 -> 82: `Do not treat "pin the webhook" as a step you can take on the one-click integration`;
    "the webhook is managed and the projection ships with the install, so there is no pin step to take
    on the one-click path" to Evidence.
  - 92 -> 50: `Leave \`api_version\` unset on the Stripe FDW server`; "a forward pin reproduces the NULL
    column" to Evidence.
  - 108 -> 72: `Validate a sync on rows the engine still re-syncs (active subscriptions)`; "so a
    terminal-state row proves nothing about current drift" to Evidence.
  - 143 -> 80: `Never expose \`stripe\` to the Data API; give PostgREST a views schema with grants` -
    `stripe`, `PostgREST` and `Data API` all kept; the "its own schema of views, with its own grants"
    justification to Evidence.
  - 104 -> 69: `Give an MCP agent a self-describing view name or a system-prompt note`; "a column
    comment never reaches it" to Evidence.
  - 170 -> 67: `Schedule query 3 (pg_cron) against a stored copy of its last result`; "alert when the
    `except` set grows ... `where status = 'active'` is one such restriction" to Evidence.
- **Missing `## Related docs` (291)** - added, four named relationships, all targets verified present:
  `postgres-redundant-writes` (the reciprocal `n_live_tup` vs `count(*)` measurement, which already
  links here), `guides/supabase-preview-branch-compute`, `guides/supabase-own-postgrest`,
  `supabase-data-surface-lockdown`.
- **2-column practices table: left open, deliberately.** The page cites no module ids anywhere (its
  evidence rows are numbered prose, not `S01`-style ids), so there is no Module value to put in a
  third column and no module to attribute any row to. `Practice | Evidence` is correct for this page
  until it cites a lab module; inventing a module column would be the attribute-a-module-that-did-not-
  measure-it defect the lab-writeup checklist names. Report says keep 2 columns.

### src/content/docs/reference/supabase-aws-privatelink.mdx - 7 edits

- **Practice cells over 90 characters (6, 259-267)**:
  - 93 -> 62: `Inventory Edge Functions that open direct database connections`; the trigger
    "before narrowing restrictions" moves to the head of the Evidence cell.
  - 92 -> 61: `Restore the Data API by PATCHing the \`db_schema\` you recorded`; "never restore the
    dashboard constant" to Evidence.
  - 92 -> 76: `Monitor a real table path with the anon key; \`503 PGRST002\` is the off-state` - the
    identifier is kept, only "and treat ... there as" is reworded.
  - 91 -> 74: `Poll \`aws ram get-resource-share-invitations\` for the \`sspl-<ref>-*\` share`; "after
    the click" was already in Evidence ("the post-click readiness signal, 32s after the click").
  - 158 -> 75: `Expect \`FATAL (EADDRNOTALLOWED) address not in tenant\` on the shared pooler`; the
    error string and "shared pooler" kept, the connect-timeout half is now stated in Evidence as
    "how the same exclusion shows up as a connect timeout on `db.<ref>.supabase.co`".
  - 108 -> 66: `Keep \`pgbouncer=true\` on Prisma against Supavisor transaction mode`; "so drop it
    against the dedicated PgBouncer" appended to the Evidence row, which already carries the
    500-of-500 either-way result.
- **Missing `## Related docs` (425)** - six bullets, all targets verified: the OpenTofu build guide
  (its canonical pair), `supabase-data-surface-lockdown`, `supabase-data-residency`,
  `supabase-compute-disk`, `guides/supabase-own-postgrest`, `supabase-read-replicas`.

### src/content/docs/reference/supabase-auth-users-locks.mdx - 1 edit

- Practice cell (133) 102 -> 68 chars: `Treat an FK to \`auth.users\` as a write dependency on the
  Auth server`; "the FK is a data-integrity choice as well, but the write dependency is the part that
  can stop sign-in" to Evidence.

### src/content/docs/reference/supabase-branching-two-projects-one-repo.mdx - 2 edits

- Practice cell (500) 96 -> 59: `Wait on your project's branch list, matched on \`git_branch\``;
  "wait on it once a non-terminal status is seen" to Evidence.
- Practice cell (505) 91 -> 63: `Identify the ignored project's bot comment by its \`[supa]:\` ref`;
  the quoted "has been ignored" text moves to Evidence as a second signal.

### src/content/docs/reference/slskarr-soulseek-lidarr.mdx - 2 edits

- **Trade-cost metaphor plus self-rating (88)** - `The tradeoff is real and one-directional:
  consolidation buys a single state model and costs the privilege separation that separate containers
  gave. Everything in the ownership section below exists to pay that cost back.` ->
  `The tradeoff is one-directional: consolidation gives a single state model and removes the
  privilege separation the three-container design had. The ownership section below is what replaces
  that separation.` ("real" was the self-rating; "buys/costs/pay that cost back" the buy-cost figure.
  The claim is unchanged: an in-process design gives one state model and loses the container split.)
- **All-caps `BEFORE` (219)** - `it removes the library file it is replacing BEFORE moving the new one
  in.` -> `before`. Emphasis was doing the work the sentence already does.

### src/content/docs/reference/supabase-auth-providers.mdx - 1 edit

- **`Two things to hold loosely.` frame (54)** - the frame sentence is deleted and the paragraph now
  opens on the first caveat: `The post-update browser-flow retries ... are not instrumented, so
  whether a retry was needed ... is not recorded. An earlier AU03 attempt (artifact au03-run2,
  2026-10-10 00:08 UTC) got a 400 ...` (also drops the "And" opener). No figure, artifact id or date
  touched.

### src/content/docs/reference/supabase-compute-disk.mdx - 2 edits

- **`turns out` blurb (8)** - `... read-only triggers - and what turns out to be dashboard-only or
  just inconsistent with the docs.` -> `... and the parts that are dashboard-only or disagree with
  the docs.` Both original claims kept (dashboard-only, inconsistent-with-docs).
- **Missing `## Related docs` (577)** - six bullets, all targets verified: `supabase-dr-tiers`
  (RP02, in this page's evidence table), `supabase-orioledb` (OR02), `supabase-pipelines`,
  `supabase-read-replicas`, `supabase-aws-privatelink`, `guides/supabase-preview-branch-compute`.
  Placed after `## Modules`, before the footnote definitions, per AGENTS.md.

### src/content/docs/reference/supabase-data-residency.mdx - 12 edits

- **Colon heading (185)** - `## The legal frame: DPA, SCCs, and the CLOUD Act` -> `## The legal frame`,
  old slug anchored at 186.
- **Missing `## Related docs` (347)** - seven bullets, all targets verified: `supabase-read-replicas`,
  `supabase-incident-resilience`, `supabase-edge-function-limits`, `supabase-realtime-surface`,
  `supabase-observability-surface`, `supabase-storage-large-objects`,
  `cloudflare-supabase-architecture`. Most of these already link back into this page.
- **Mean-sentence gate CLEARED** - `prose-lint` reported `GATE mean-sentence-ceiling: mean 25.4 words
  > 25` (25.7 in `.pi/harness-run.log`, so a long-standing failure), and batch-6.md left it open as
  "not a sentence-level fix". It is clearable without a rewrite: ten independent-clause semicolons in
  the densest paragraphs (44, 99, 101, 103, 117, 132, 136, 140, 148, 152) became full stops, which
  raises the sentence count and leaves every word and figure in place - `; and a pinned request` ->
  `. A pinned request`, `IPv4-only; its connection string` -> `IPv4-only. Its connection string`, and
  so on. Result: **mean 25.4 -> 23.7, no gate line**, and `prose-lint --before HEAD` confirms nothing
  was dropped. No sentence was reworded, shortened or reordered; only the punctuation between two
  already-independent clauses changed.

## Findings left open (with the reason)

- `supabase-auth-end-to-end.mdx` **topology diagram without a text fallback** (line 31-63). batch-6.md
  reported it rather than fixing it: the A-axis wording is "every `dot` *decision* diagram", and this
  one is a topology map, not a decision fork. My brief does not list it either, so it stays reported.
- `supabase-auth-end-to-end.mdx` **`config`/`configuration` rotation (28/3)** and
  `supabase-client-keyed-objects.mdx` **`directory`/`dir` rotation (3/2)**, plus
  `supabase-aws-privatelink.mdx`'s `referent-rotation=2` - all inside the frozen
  `.prose-terms-baseline.json` ratchet, so `prose-lint` passes them (they print as counters, not
  gates). Fixing them means editing one or two words in a TL;DR written by someone else; the repo's
  rule for this class is opportunistic normalisation when a section is touched anyway, and neither
  file needs a section touch. Left, so the ratchet keeps holding them.
- `stripe-sync-engine.mdx` **2-column practices table** - see above; keep 2 columns, no module ids
  exist to cite.
- `slskarr-soulseek-lidarr.mdx`, `supabase-auth-end-to-end.mdx`,
  `supabase-client-keyed-objects.mdx`, `supabase-aws-privatelink.mdx`, `supabase-branching-two-projects-one-repo.mdx`,
  `supabase-compute-disk.mdx` all report `long-paragraph=N` / `passive=N` counters. These are triage
  counters, not gates, and were not findings in batch-6.md. Untouched.
- `supabase-audit-trail-integrity.mdx`, `supabase-cli-schema-diff.mdx` - zero findings, 0 edits.

## Edits by file

| File | Edits |
|---|---|
| reference/stripe-sync-engine.mdx | 10 |
| reference/supabase-data-residency.mdx | 12 |
| reference/supabase-aws-privatelink.mdx | 7 |
| reference/slskarr-soulseek-lidarr.mdx | 2 |
| reference/supabase-auth-users-locks.mdx | 1 |
| reference/supabase-auth-providers.mdx | 1 |
| reference/supabase-branching-two-projects-one-repo.mdx | 2 |
| reference/supabase-compute-disk.mdx | 2 |
| reference/supabase-audit-trail-integrity.mdx | 0 |
| reference/supabase-auth-end-to-end.mdx | 0 |
| reference/supabase-cli-schema-diff.mdx | 0 |
| reference/supabase-client-keyed-objects.mdx | 0 |
