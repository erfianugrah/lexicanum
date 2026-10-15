# Batch 3 review

16 guides, reviewed on the four axes (A structure, B prose tells, C house style, D internal
consistency) against `docs/research/raw/2026-10-15-docs-review/BRIEF.md`.

## Method

Read `BRIEF.md`, the `erfi-voice` structural-tells catalogue with both `rg` sweeps,
`AGENTS.md` and the regex-able subset in `tests/lib/mdx.ts` (`LLM_MARKERS`,
`REJECTED_MARKERS`) before judging anything, so the rejected markers (`deserve special
mention`, `the key insight`) were never treated as defects. Every file in the batch was read
in full, in chunks where the file exceeded one read. The harness pruned a few chunk outputs
mid-session; every line cited below was re-read before it was reported, and one earlier
suspicion (a stale `as of 2026-07` claim in the upgrade guide) was dropped after the re-read
showed the section is in fact re-probed `2026-10-10`.

Triage: `prose-lint` on the whole batch (`--baseline` and, on the edited files, `--before
HEAD`), plus the two `rg` sweeps for the catalogue's verbatim phrases. `--before HEAD`
reports no dropped facts on any file in this batch.

This batch is the strong end of the corpus: five of the sixteen are among the best docs in
the repo (postgres-major-upgrade, region-migration, tenant-consolidation, tenant-promotion,
wsl2-run-user), each with a constants preamble, a provenance block, a measured-vs-asserted
evidence split and a practices table. Nothing in it fails a gate. The findings below are
therefore mostly D (a figure quoted two ways) and A (sections an older guide never had),
with three edits applied in place.

## Summary (recommended fix order)

1. **D, the only outright contradiction in the batch: `vyos-dot`'s hairpin claim.** The
   frontmatter description (line 3), the lede (line 14) and the Cloudflare note (line 268)
   all state that LAN hosts hairpin through Magic WAN IPsec. The same doc says the shipped
   policy-route order shadows the hairpin rules so they never match: line 187 ("shadowed by
   rule 2 unless rule 2 is moved lower"), line 190, line 273 and line 342. Three
   statements against four. Decide which is true - "move rules 5-8 above rule 2" reads like
   work the author never did - then make the lede and the description match the config.
2. **D, seven figures quoted two ways across six docs** (full list in the per-doc
   sections): `platform-management-api` "13 days" against a 2026-09-09 to 2026-09-23 window
   that is 14; `shared-tenancy` "tens of milliseconds" against its own evidence row's 249 ms;
   `preview-branch-compute` "REST and Realtime never dropped a sample" against "1.0 s of
   contiguous failure on Micro -> Small"; `resilience-runbook`'s successful initial-sync
   timings against its own "with `copy_data=true` the initial sync hangs"; `windows-build-vm`
   "about 10 s" against "The whole call took 12 s"; `region-migration`'s W05 dated 2026-08-15
   against its published `out/2026-08-16` and `out/2026-08-17` artifacts. Each is one
   sentence of reconciliation or one corrected number.
3. **A, decorative bold on mid-sentence emphasis** - `preview-branch-compute` is the outlier
   at 48 mid-sentence bold spans, then `vaultwarden-multi-site` 21, `region-migration` 16,
   `postgres-major-upgrade` 11; seven docs in the batch are at 0. Bold inside a gotcha
   bullet or a table cell is the corpus convention and is not the target; these are emphasis
   inside running prose ("and there is **no setting anywhere** to change that default",
   "**always provisions on the Micro compute tier (1 GB RAM)**"). Reported rather than
   edited: unbolding 48 spans in one pass is a corpus-level decision, not a review edit.
4. **A, two `dot` diagrams with no text restatement anywhere near them:**
   `platform-management-api` (the "shape being built" architecture diagram) and
   `resilience-runbook` (the architecture overview). Both are architecture diagrams rather
   than decision diagrams, which is what the `AGENTS.md` fallback rule names, and the other
   ten diagrams in the batch are covered - `preview-branch-compute` by its "pick by
   constraint" bullets, `windows-build-vm` by "In order: ...", `wsl2-run-user` and
   `wsl2-disk-reclaim` by the paragraph under the fence, `postgres-major-upgrade` by the
   "What you will do" path table above it. So this is a judgement call for the parent, not a
   defect: worth adding only if the rule is meant to cover architecture diagrams too.
5. **A, three older guides carry section gaps** (report only, no rewrite): `unbound-agh-mt3000`
   has no `## Verification`, no `## Gotchas and lessons learned` and no `## Related docs`;
   `vyos-dot` uses the corpus's only `## 1)`-style headings (1 of 143 docs) and has no
   `## File reference`; `vaultwarden-multi-site` is the only doc in the repo whose
   `author:` is a placeholder. Missing cross-links are corpus-wide, not a fault of these
   docs - 23 of 143 docs have zero `/guides/` or `/reference/` links, two of them here.
6. **C, one name for one thing, four spots:** `unbound-agh-mt3000` writes "AdGuard Home" and
   "AGH" for the same product; `vyos-dot` writes "Gloryhole" (title), "Glory-Hole"
   (description and first mention) and `glory-hole` (the container name, everywhere else);
   `vaultwarden-multi-site` writes "Terraform", "TF" and `tofu state show` for the same tool;
   `winfsp-rclone-stuck-drive-letter` calls the drive letter "the zombie", "the mount" and
   "the letter". The first is fixed (see below), the rest are report-only.
7. **C, two docs mix Starlight directive syntax with the `Aside` component in one file** -
   `vaultwarden-multi-site` and `vyos-dot` both `import { Aside }` and use
   `:::tip[...]` / `:::caution[...]`. Both render; the rest of the batch uses one form or the
   other consistently. Cosmetic, report-only.

## Fixed in place

- `src/content/docs/guides/vaultwarden-multi-site.mdx` - `author: "Author"` to
  `author: "Erfi Anugrah"`. It is the only doc in the corpus with the schema placeholder
  (`rg -c '^author: "Author"' src/content/docs` returns 1, this file; the other 60+ read
  `Erfi Anugrah`).
- `src/content/docs/guides/unbound-agh-mt3000.mdx` - heading `## Part 4: point AdGuard home
  at Unbound` to `AdGuard Home`. Casing-only, so the slug is unchanged; verified in
  `dist/guides/unbound-agh-mt3000/index.html` (`id="part-4-point-adguard-home-at-unbound"`).
- `src/content/docs/guides/winfsp-rclone-stuck-drive-letter.mdx` - two sentences:
  (a) the `lsvol` sentence ended with `- the one place the zombie cannot hide:`, now ends at
  `holding:` (mystery-tease tail, erfi-voice "hides a classic X" shape); (b) `One capacity
  gotcha: Windows reports...` to `Windows reports...` (importance-announcing frame). No
  number, identifier or link touched in either.

Local verify after the edits:

- `bunx astro build` exits 0, 141 pages, og-card reads 60 guides / 79 reference.
- `CHECK_BUILT=1 bun test tests/docs.test.ts tests/pins.test.ts` - 1939 pass, 129 skip,
  1 fail. The failure is `guides/sops-age-compose-stacks > contains every pinned
  correction`, a doc **not in this batch**, failing because that file carries an uncommitted
  one-line edit from another worker that dropped the pinned string "if a data-directory key
  file exists, it wins outright". Not mine, not touched.
- Filtered to this batch's edited files: `CHECK_BUILT=1 bun test tests/docs.test.ts
  tests/pins.test.ts -t 'vaultwarden-multi-site|unbound-agh|winfsp'` - 33 pass, 0 fail.
- `prose-lint --config .prose-lint.json --baseline .prose-terms-baseline.json` on the three
  edited files: total slop 0.02/100w, no gate; the only markers are semicolons and passive
  counts at the batch's usual levels (winfsp 9 semicolons, vaultwarden 3, unbound 2).
- `prose-lint ... --before HEAD` on the three edited files: no dropped facts.

---

## guides/supabase-platform-management-api.mdx

554 lines. Numbered sections 1 to 8, constants, evidence table, practices table, file
reference, modules, related. Model of the lab-backed guide shape.

- A: no lede in the `AGENTS.md` sense (it opens straight into "Who owns the project"), but
  the purpose is stated in the first paragraph and prerequisites are there. No
  `## Verification` heading - the "Verified / tested" table carries the same job. Both
  acceptable. The `dot` diagram under "The shape being built" has no text fallback (see
  summary item 4).
- B: clean. 0 mid-sentence bold spans, no announce frames, no participle tails, no triplets.
- C: nothing.
- D: **the "13 days" figure does not add up.** Line 316 says the staging nanos were "parked
  2026-09-09 and read back 13 days later", line 396 dates that read-back "2026-09-23", and
  line 446 repeats "13 days". 2026-09-09 to 2026-09-23 is 14 days. Either the park date, the
  check-back date or the day count is off by one. Everything else is careful: the "169 above
  and this 170 are different fetches on different days" note, the `120`-per-route counter at
  lock-step with the deliberate burst at request 118, and the one-way-door pause behaviour
  (`400 Project is not free-tier`) agree across the constants, the body and the evidence
  table.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-postgres-major-upgrade-e2e.mdx

1088 lines, the batch's largest. Constants-equivalent preamble, "What you will do" path
table, "Every task, three ways" matrix, verification, gotchas, file reference, modules.
Measured-vs-derived split is explicit (the 10 s/GB figure is marked "derived not measured"
and then undermined by its own eligibility-endpoint probe, correctly).

- A: nothing. The `dot` paths diagram is preceded by the three-path table, so the decision
  is in text already.
- B: 11 mid-sentence bold spans (summary item 3); otherwise clean, and the gotcha bullets
  use the corpus's bold-label convention.
- C: the pgmig rename gloss is present and dated ("named sbshift until 2026-09-28"), and the
  old slugs are pinned as explicit anchors (the live heading is
  `#optional-rehearse-pg_upgrade-itself-in-docker-pgmig-upgrade-lab`, with the `sbshift`
  variant kept for the pin).
- D: nothing found. The re-probe dates agree with the claims they cover (2026-10-10 for the
  restore-route probe, the key-name sync limit and the pg_graphql 1.6.0 introspection
  change), and the "new projects land on 17 (as of 2026-07)" line is dated for exactly the
  reason it needs to be. One earlier suspicion - a stale "as of 2026-07" for the missing
  restore endpoint - did not survive re-reading: lines 78 to 85 carry the 2026-10-10 probe.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-preview-branch-compute.mdx

684 lines. The batch's clearest B pattern; otherwise strong (three approaches, a
pick-by-constraint block, a cost table, a measured failures section, practices, modules).

- A: nothing missing.
- B: **48 mid-sentence bold spans**, 2.4x the next highest doc in the batch and 3 to 4x
  its Supabase siblings. They bold ordinary emphasis rather than identifiers or labels:
  "and there is **no setting anywhere** to change that default", "That branch **always
  provisions on the Micro compute tier (1 GB RAM)**", "**at branch creation**", "**after
  creation**", "**three approaches**". This is the erfi-voice "decorative bold in short
  prose" tell at scale. Reported, not edited (summary item 3).
- C: nothing. The dollar signs are correctly escaped in the cost table, ASCII throughout.
- D: **the resize figures disagree between the table and the practices table.** Line 58
  (in the "where compute size can be set" table) says the Micro -> Small project resize cost
  "131 s of Auth downtime up and 99 s down, with the pooler out for 207 s / 196 s, while
  REST and Realtime never dropped a sample (platform-downtime D03/D04, 2026-08-04)". Line 645
  (practices) says "Expect REST to drop during an upgrade. 1.0 s of contiguous failure on
  Micro -> Small, 17.0 s on Small -> Large" (compute-disk D09). Same resize step, one says
  zero, the other says 1.0 s, and nothing reconciles them. Both are attributed to a module,
  so this is a sampling-resolution or rig difference that the doc should say out loud.
  Everything else holds up (the `ci_micro` and `ci_small` hourly rates convert to the quoted
  monthly figures, the API caps creation at `medium` while the add-on reaches `ci_xlarge`,
  the branch compute exclusion from the Spend Cap is consistent in both places).
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-region-migration-e2e.mdx

620 lines. Paths A and B, the three-ways matrix, the validation window, the measured-run
table, practices, modules. The variant-selection and the resume-point arithmetic are the
clearest in the repo.

- A: nothing. The move diagram is followed by the "Pick your path" table, which is the text
  rendering of the same choice.
- B: 16 mid-sentence bold spans (summary item 3), no announce frames, no participle tails.
- C: nothing.
- D: **W05 is dated 2026-08-15 in prose but has no artifact before 2026-08-16.** Lines 374
  and 376 attribute the "old token reads the new project" result and the ~302 ms warm case to
  "(W05, 2026-08-15)". The Modules table's W05 row (line 607) publishes `out/2026-08-16` and
  `out/2026-08-17` only. A run that started on the 15th and was published on the 16th is
  plausible; the doc does not say so. Everything else cross-checks: the pooler host index
  warning ("`aws-<N>-` is a pooler-cluster number, not always `0`") is repeated in both the
  body and the practice row, and the storage-surface caveat stays a documented-but-not-called
  claim in both places.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-resilience-runbook.mdx

799 lines. Detection, replication, failover, cold DR, practices, verification, gotchas,
modules. Best-in-corpus structure.

- A: the architecture diagram has no text restatement (summary item 4).
- B: 0 mid-sentence bold spans, no tells. The phrase that looks closest to a tell
  ("the failure mode that does not announce itself") is a factual description in a gotcha
  heading, not an announce frame.
- C: nothing. British spelling throughout, ASCII only.
- D: two findings.
  **First, the initial-sync claim contradicts the constants.** Lines 35 and 36 and line 402
  give successful initial-sync timings (3.1 to 6.5 s on a small table, 22.7 s and 12.5 s for
  1M rows, lag ~245 to 276 ms after). Lines 406 to 408 then say that "with `copy_data=true`
  the initial sync hangs in `pg_subscription_rel` state `d` (sync worker stuck at
  IPC/BgworkerStartup); with `copy_data=false` the WAL sender connects but `received_lsn`
  stays NULL". Both cannot be the whole story, and the hangs line carries no date, no module
  id and no caveat, so it is the one unattributed measured-sounding claim in a doc that
  attributes everything else.
  **Second, `aws-0-` is hardcoded.** Line 569's cold-DR recipe uses
  `aws-0-<region>.pooler.supabase.com`, while the region-migration guide documents the index
  as a per-project cluster number that is not always 0 and warns against assuming it. The
  resilience recipe should carry the same warning or the same enumeration step.
  Cross-doc, TPA resolution is quoted as "~60-122ms" here (line 33) and as 59 ms and 249 ms
  in the shared-tenancy guide; different rigs and dates, but the two ranges do not overlap at
  the top.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-shared-tenancy.mdx

435 lines. The tier the consolidation lands on. Constants, measurement provenance, three
parts, verification, gotchas, practices, modules, related.

- A: nothing. Lede, prerequisites, verification, gotchas, evidence, practices and modules all
  present; cross-links name the relationship in both directions.
- B: 2 mid-sentence bold spans, both in the "what you will build" bullets where the bold
  names the two components. Correct use.
- C: nothing.
- D: **"tens of milliseconds" is not the measured range.** Line 103 says the `oidc_issuer_url`
  and `jwks_url` shapes both "resolve on the create response - in tens of milliseconds, to
  identical key material". The evidence row for that claim (line 392) reports "`oidc_issuer_url`
  in 59ms and 249ms across two runs". 249 ms is a quarter second, not tens of milliseconds.
  Second, minor: the constants table states "Required token claim | `role`, valued
  `authenticated` for ordinary end users" as a fact while the evidence table marks the `role`
  claim "Documented, not tested" and "What this does not settle" repeats that only an anon
  bearer was tried. The constants row should carry the same status as the evidence row.
  Everything else is consistent, including the rotation window (20 minutes, 116 probes) shared
  with the promotion guide.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-tenant-consolidation.mdx

470 lines. Two independently provisioned projects merging onto one. Full skeleton, three
explicitly-named collision namespaces, a 31-row evidence table with a "Not tested" tail,
practices, verification with the "version of each check that passes while broken" line.

- A: nothing.
- B: 0 mid-sentence bold spans, no tells. The one explanatory sentence with a flourish in it
  ("That number is the size of the only part of this migration you cannot automate") is a
  fact with a number in it.
- C: nothing. Dollar escaping is correct in the bcrypt examples.
- D: nothing found. The 34-column figure, the 33 pass / 1 fail run, the 5-attempt
  case-variant login mapping, the 0-of-2 bulk-loss result and the `23505` sequence failure
  all agree between the prose, the gotchas and the evidence table. The claim that promotion
  moves users the other way and cannot use `POST /auth/v1/admin/users` because the endpoint
  cannot carry a session checks out against the promotion guide, which says exactly that at
  its line 260.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/supabase-tenant-promotion.mdx

669 lines. The opposite direction to consolidation, session-carry included. Same shape, same
discipline.

- A: nothing. The paragraph before the `dot` fence describes exactly what the diagram shows,
  so the fallback exists in front of it.
- B: 1 mid-sentence bold span, no tells.
- C: nothing.
- D: one soft finding. The constants row (and the matching row in the shared-tenancy guide)
  says a trusting project "did not accept new-key tokens within 20 minutes" of a rotation,
  while Part 4's third run reports the consumer "never re-resolved" across 37 minutes. The
  body reconciles it explicitly, so this is an understated summary rather than a
  contradiction; worth a "(37 minutes in the 2026-08-04 run)" clause in the constants row.
  Everything else - the 282 probes, the 140 old-token probes, the 3600 s lifetime against the
  hub's `jwt_exp`, the `previously_used` signing-key cap of 3, the 450882 ms publication lag -
  is quoted the same way in the body and the evidence table.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/unbound-agh-mt3000.mdx

323 lines, pre-contract-era guide, still accurate and useful.

- A: **no `## Verification`, no `## Gotchas and lessons learned`, no `## Related docs`, and
  zero links to any other doc in the corpus** (`rg -o '\]\(/(guides|reference)/'` returns 0).
  The Troubleshooting section carries a "Test resolution directly" bullet, which is
  verification in substance without being a section the skeleton recognises. The zero-link
  case is shared with 22 other corpus docs, so it is an aggregate gap rather than a defect
  unique to this file (summary item 5).
- B: 5 mid-sentence bold spans, no announce frames. The `:::caution` and `:::tip` asides carry
  the lessons in place of a gotchas section.
- C: **"AdGuard Home" and "AGH" for the same product**, and the part-4 heading had "AdGuard
  home". The heading is fixed; the AGH abbreviation is used consistently from its first
  definition onward, so it is defensible as an in-doc short form.
- D: nothing found. The `serve-expired-*`, `cache-*`, `jostle-timeout` and `num-threads` values
  agree between the config block and the prose that explains each, and the duplicate
  `netstat` line is explained by `num-threads: 2` in the same section. One claim is undated
  rather than wrong: "GL.iNet firmware upgrades preserve a curated set of config files from
  `/etc/` when 'Keep Settings' is enabled" - a platform behaviour with no date and no
  reference, the only such claim in the file.
- Fixes applied: one (heading casing, see the fixed-in-place list).
- Local verify: prose-lint slop 0.00, build green, anchor unchanged in `dist/`.

## guides/vaultwarden-multi-site.mdx

1456 lines, the batch's longest, and a retired-system doc (correctly carrying
`<Aside type="caution" title="Historical since 2026-09-29">` and no `featured`/`blurb`).

- A: no `## Related docs` and zero corpus cross-links, same aggregate gap as above. Module
  paths are given as file-comment headers rather than a file reference table, which is
  sufficient here. The doc is a template rather than a record: the domain, the timezone, an
  example Gmail address and an R2 account id stand in as placeholders, so every command in
  Parts 3 to 7 needs editing before it runs. For a historical doc that is a deliberate
  choice, but it is why this file reads differently from the rest of the corpus.
- B: 21 mid-sentence bold spans (summary item 3), no announce frames, no participle tails.
- C: **the `author:` field was the schema placeholder** - fixed. Two more: the doc uses
  "Terraform", "TF" and `tofu state show` for one tool, and it mixes `:::tip[...]` directives
  with the `Aside` component in the same file (one of two docs in the batch doing that).
  The heading table syntax `| :---- | :---- |` differs from the corpus's `|---|---|` but
  renders identically.
- D: one finding. The pgloader lesson names a CLI flag the guide's own method does not use:
  "Always exclude this table with `--excluding-table-names`" (the gotchas section) against
  the load file's `EXCLUDING TABLE NAMES LIKE` syntax in Part 2. The flag exists on the
  command line, so the sentence is not wrong, but a reader following the guide's file-based
  method will look for it in the wrong place.
  Everything else holds together, including the restore CronJob's `suspend: true` (the
  caution explains it before the failover section relies on the 15-minute staleness bound) and
  the WebSocket port timeline (deprecated in 1.29.0, removed in 1.31.0) which is stated
  identically in the tip and in the gotchas.
- Fixes applied: one (`author:` field, see the fixed-in-place list).
- Local verify: prose-lint slop 0.04/100w, build green.

## guides/vyos-dot.mdx

557 lines, pre-contract, retired (VyOS replaced, Glory-Hole retired 2026-09-18, repos archived
2026-09-29), and correctly carries the historical aside with a link to the replacement.

- A: the only doc in the corpus using `## 1)`-style headings (`rg -l '^## [0-9]+\)'
  src/content/docs` returns this file alone, 1 of 143). No `## File reference`. The validation
  section is verification in substance, "Common pitfalls" is the gotchas section in substance,
  so the skeleton is present under other names. Report only - this is a pre-contract doc and
  `AGENTS.md` exempts it from a conformance rewrite.
- B: 4 mid-sentence bold spans, no tells. The configuration is quoted as `.txt` fences rather
  than `bash`/`text`, consistent with the other router-config docs.
- C: **three spellings of the product in one file**: the title says "Gloryhole", the
  description and the opening paragraph say "Glory-Hole", and the body uses `glory-hole`
  throughout (matching the container name and the repo). The rename gloss convention
  ("named X until DATE") is applied to the tool's retirement but not to the spelling.
- D: **the lede claims hairpin works; the config section says the shipped order stops it.**
  The description (line 3) is "for hairpin traffic", the lede (line 14) says "LAN hosts
  hairpin through Magic WAN IPsec", and the Cloudflare aside (line 268) says "hairpin access
  to glory-hole from LAN works". Against that, line 187 says rules 5 to 8 are "shadowed by
  rule 2 unless rule 2 is moved lower", line 190 gives the current order and the move needed,
  line 273 repeats "the broad catch-all rule 2 matches before the hairpin rules", and line
  342 says the same again. One side is the intended design and the other is the shipped
  config; the doc should state which, because the frontmatter description is what a search
  result shows.
- Fixes applied: none (the fix needs an author decision on which side is true).
- Local verify: prose-lint clean, tests green.

## guides/windows-build-vm-forgejo-ci.mdx

284 lines. Constants, architecture with a text fallback, six parts, verification table,
gotchas, file reference, related docs. Excellent Windows-family doc.

- A: nothing.
- B: 0 mid-sentence bold spans, no tells.
- C: nothing.
- D: one minor finding. The constants row says "Stop | about 10 s, an ACPI shutdown" (line 24)
  while Part 5's narrative says "The whole call took 12 s" (line 218). Both refer to the same
  call; "about 10 s" and 12 s are close but the constants table is where a reader takes
  numbers from. Everything else agrees: 5m54s builds on runs 11 and 12, 7m02s on run 14,
  the 10 to 16 s cold-boot-to-ssh window, the 64,535,441 and 88,696,199 byte artifacts, and
  the 8 GB / 6 vCPU guest split with the 10 GB / 6 CPU container limit.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/windows-smb-credentials-nixos-samba.mdx

157 lines, newest doc in the batch (2026-08-28, updated 2026-09-14). Complete skeleton.

- A: nothing. Lede with prerequisites, constants, four steps, verification, gotchas with a
  related-docs list that names the relationship in both directions.
- B: 4 mid-sentence bold spans, all inside table cells where the bold marks the operative
  noun ("**exact server string**", "**one credential context per server string per logon
  session**"). That is the Windows-family convention and it reads as deliberate emphasis,
  not decoration.
- C: one soft note - "Credential Manager" and "the credential vault" / "the vault" are used
  for the same object. The product name is used at first mention in every section, so a
  reader is never lost.
- D: nothing found. The 2026-09-14 share change is disclosed and reconciled with the
  verification listing (`anugrah` gone as a share, still present as a folder inside the
  `servarr` hub), and the stale-credential fix sequence is dated back to the `1219` error
  without pretending the demo is current.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/winfsp-rclone-stuck-drive-letter.mdx

215 lines. Constants, steps 1 to 6, verification, gotchas, related docs.

- A: nothing.
- B: 4 mid-sentence bold spans; two tells fixed (the "one place the zombie cannot hide"
  mystery-tease tail and the "One capacity gotcha:" announce frame). What remains is the
  bold-label convention in the gotchas and the step headings. One more is report-only: step 5
  is headed `## Step 5 - Driver reload: the test that finds a live re-mounter`, which is the
  colon-headline stamp shape (`X: the thing that does Y`). Heading text cannot be changed
  beyond casing under the brief's rules, so it stays.
- C: "the zombie", "the mount" and "the letter" name the same object; the driver and ledger
  vocabulary otherwise holds to one form each.
- D: nothing found. The `fsptool` verb list matches between the constants table and step 4,
  the 1060-from-`sc query` red herring is labelled as one, and the free-space mismatch
  (858 GB shown against a 28 TB pool) agrees between the prose and the share-root
  explanation.
- Fixes applied: two sentences (see the fixed-in-place list).
- Local verify: prose-lint slop 0.00, build green.

## guides/wsl2-disk-reclaim.mdx

475 lines. Constants in two parts (why the space is stuck, the rig), a which-part-do-I-need
table, eleven parts, a playbook, verification, gotchas, a command reference, a risk table,
related docs. The best doc in the batch on provenance: every figure names which run it came
from and the May and September runs are kept separate throughout.

- A: nothing.
- B: 7 mid-sentence bold spans, no announce frames. `if anything below surprises you` in the
  Part 7 pre-flight comment is the one phrase close to the importance-announcing family; it
  reads as an ordinary warning, so it was left alone.
- C: "my dotfiles" (the author's possessive) against the sibling doc's neutral "the dotfiles
  repo (a private repo, so no link)". Cosmetic drift between two docs describing the same
  repo; the sibling's phrasing is the one that keeps the corpus voice.
- D: nothing found, and this is the hardest doc in the batch to keep consistent - two runs,
  two WSL versions, three disks. The 931 GB to 901.66 GB second run, the 901.66 to 703.66 to
  653.75 follow-up, the 123.36 GB of orphan swap, the 24.95 GiB pacman freeing, the 87% vs
  93% filesystem-versus-`df` distinction and the 860 GB to 150 GB first run all agree
  between the constants, the body, the playbook and the verification table.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

## guides/wsl2-run-user-docker-desktop.mdx

277 lines. Constants with three observed incidents, a peer-group diagram with the mechanism
explained underneath, three parts, static and live verification with the measured result,
gotchas, file reference, related docs, one footnote.

- A: nothing.
- B: 2 mid-sentence bold spans ("**Prevention.**" and "**Backstop.**" as the two named
  layers), which is the corpus's numbered-list convention in prose form. No tells.
- C: nothing.
- D: nothing found. The unit comment's "Verified 2026-10-01 11:43" matches the verification
  section's install-at-11:41 / stop-at-11:43:50 account, the peer-group id `shared:333` is
  the same in the constants table and in the diagram's cluster label, and the four health
  facts are identical in the constants row, the gotcha and the script comment.
- Fixes applied: none.
- Local verify: prose-lint clean, tests green.

---

## Aggregate measurements

Commands behind the counts in the summary, all run from the repo root over
`$(cat docs/research/raw/2026-10-15-docs-review/batches/batch-3.txt)`:

- mid-sentence bold spans (a `**` pair with a non-space, non-bullet character before it, so
  bullet labels and table cell leads are excluded):
  `rg -o '[^ |*-]\s\*\*[^*]+\*\*' <file> | wc -l`
  preview-branch-compute 48, vaultwarden-multi-site 21, region-migration 16,
  postgres-major-upgrade 11, wsl2-disk-reclaim 7, unbound-agh 5, vyos-dot 4, windows-smb 4,
  winfsp 4, shared-tenancy 2, wsl2-run-user 2, tenant-promotion 1; platform-management-api,
  resilience-runbook, tenant-consolidation and windows-build-vm 0.
- total `**` marks per file (any position): preview-branch-compute 173, postgres-major-upgrade
  72, region-migration 70, vaultwarden 52, wsl2-disk-reclaim 44, shared-tenancy 40,
  resilience-runbook 36, tenant-promotion 36, vyos-dot 30, winfsp 24, tenant-consolidation 22,
  windows-smb 20, wsl2-run-user 20, windows-build-vm 18, unbound-agh 16,
  platform-management-api 4.
- docs mixing `<Aside>` with `:::` directives: `rg -l 'import \{ Aside \}' <files> | xargs -I{}
  sh -c 'rg -q "^:::(tip|note|caution|danger)" {} && echo {}'` gives vaultwarden-multi-site
  and vyos-dot; the other fourteen use one form throughout.
- heading style `## N)`: `rg -l '^## [0-9]+\)' src/content/docs` returns vyos-dot only.
- zero internal doc links: `for f in $(rg --files -g '*.mdx' src/content/docs); do ...` gives
  23 of 143 files (including `index.mdx`), of which this batch contributes
  `unbound-agh-mt3000` and `vaultwarden-multi-site`.
- `author:` placeholder: `rg -c '^author: "Author"' src/content/docs` returns exactly one
  file, `vaultwarden-multi-site.mdx`.
- prose-lint markers: no `em-dash`, and no `mean-sentence-ceiling` gate fires in this batch.
  The highest semicolon count is winfsp's 9 in 1399 words (a style marker, not a banned
  character); the highest passive count is vaultwarden's 19, which the brief places at the
  noise floor.
- `prose-lint --before HEAD` on all sixteen files: no dropped facts.
