# Fix batch 3

Batch: 16 files (`batches/batch-3.txt`). 14 edited, 2 unchanged (no open findings:
`supabase-tenant-consolidation`, `wsl2-run-user-docker-desktop`).

Axis order followed: D (accuracy) first, then A structure, then B/C prose.

## Number changes

No measured figure was deleted. Three kinds of change appear below: a figure added
from the doc's own evidence row, a figure pair reconciled so each carries what it
measures, and one rounding replaced by the measurement it rounded.

- `guides/supabase-shared-tenancy.mdx:103` - "in tens of milliseconds" -> "(`oidc_issuer_url`
  in 59ms and 249ms across two runs)". Evidence: the same doc's evidence row at line 392
  ("`oidc_issuer_url` in 59ms and 249ms across two runs"); 249 ms is not tens of milliseconds.
  The evidence row is unchanged; the prose now quotes it.
- `guides/supabase-preview-branch-compute.mdx:58` - "while REST and Realtime never dropped a
  sample (platform-downtime D03/D04, 2026-08-04)" -> "while REST and Realtime never dropped a
  sample at that probe's 500 ms resolution (platform-downtime D03/D04, 2026-08-04; the same
  Micro -> Small resize sampled at 250 ms on another rig shows 1.0 s of contiguous REST
  failure - compute-disk D09, 2026-08-19)". Evidence: `platform-downtime` RUNLOG at the pinned
  commit b100447 ("REST and Realtime never failed under any of the four", 500 ms resolution)
  against `compute-disk` RUNLOG ("upgrade micro->small 105s, max contiguous REST outage 1.0s",
  250 ms sampling). Both figures stay; each now names its sampling resolution.
- `guides/supabase-preview-branch-compute.mdx:645` (practice row) - "1.0 s of contiguous failure
  on Micro -> Small, 17.0 s on Small -> Large; both measured downgrades were 0 s." -> "... both
  at 250 ms sampling; a 500 ms-sampled run of the same two resizes saw no REST gap at all, so
  the sampling resolution is what differs between the two readings, not the operation. Both
  measured downgrades were 0 s." Same evidence as above. No figure changed.
- `guides/supabase-resilience-runbook.mdx:406-416` - "With `copy_data=true` the initial sync
  hangs in pg_subscription_rel state `d` ... Instance size is not the variable" -> same two
  states, now scoped and attributed: "on those platform-managed schemas the sync never
  completes: ... (edge-resilience W14, 2026-08-15, a manual drill)". Evidence: the
  `edge-resilience` RUNLOG at 6d42c55, W05 ("Initial sync ~3.1-6.5s", public tables) against
  W14 ("auth.* with copy_data=true: initial sync stalls in 'd' at any size"; the wall is
  specific to platform-managed schemas). This is what reconciles the hang with the
  successful 3.1-6.5s / 22.7s / 12.5s initial-sync figures earlier in the same doc.
- `guides/windows-build-vm-forgejo-ci.mdx:24` - constants row "Stop | about 10 s, an ACPI
  shutdown" -> "Stop | about 10 s of ACPI shutdown, 12 s for the whole stop call". Evidence:
  Part 5's narrative "The whole call took 12 s". Both figures stay; the row now separates the
  guest shutdown from the call total the reader plans against.
- `guides/supabase-platform-management-api.mdx:316-322` - "parked 2026-09-09 and read back 13
  days later" -> "parked 2026-09-09 and read back on 2026-09-23 (the lab's 13-day check-back)".
  The 13-day figure is kept because the source carries it: the `s2z-wake` RUNLOG at the pinned
  commit 7dd32bd ("## 2026-09-23 - the check-back, 13 days in"; "Both fleets were parked
  2026-09-09 and read back 13 days later"). The two dates are 14 calendar days apart, which is
  exactly why the end date and the label are now in the sentence. The evidence row at line 396
  and the practice row at line 446 are unchanged and still read consistently against it.
- `guides/supabase-tenant-promotion.mdx:69` - constants JWKS row gains "with its cached kid set
  still unchanged across 282 probes in 37 minutes". Evidence: the doc's own Part 4 and evidence
  row at line 612 ("Re-read ... for 37 minutes ... the consumer never re-resolved, 282 probes
  (2026-08-04)"), which the constants row was understating as 20 minutes only.
- `guides/supabase-postgres-major-upgrade-e2e.mdx:106` - table cell quote "bucket
  configurations are **NOT** copied" -> "bucket configurations are not copied". The caps+bold
  was added emphasis over a source phrase, not the source's own casing.

## New anchors

None. No American-spelled heading was changed in this batch, so no old-slug anchor was
needed. The two heading edits in `guides/vyos-dot.mdx` ("Glory-hole policy routing" ->
"Glory-Hole policy routing", "Capture traffic on glory-hole interface" -> same with
"Glory-Hole") are casing only, and slugs are lowercased, so `#glory-hole-policy-routing` and
`#capture-traffic-on-glory-hole-interface` are unchanged.

## Per file

### guides/supabase-platform-management-api.mdx
D: the 13-day figure reconciled (above). A: text fallback added under the "shape being
built" `dot` diagram (summary item 4), built from the diagram's own node and edge labels -
product -> control plane -> credential-proxy gateway -> `api.supabase.com/v1` -> tenant pool,
with the direct control-plane-to-API edge. No other finding open.

### guides/supabase-postgres-major-upgrade-e2e.mdx
B: 11 mid-sentence bold spans checked. Ten are labels under the author's convention (the three
method names at 277-279, numbered-step labels at 309-326, bold paragraph labels at 887-957)
and one was added emphasis over a quoted phrase (the `NOT` above) - that one is unbolded.
D: nothing found; the re-probe dates and the pgmig rename gloss hold up. A/C: nothing.

### guides/supabase-preview-branch-compute.mdx
D: the REST/resolution contradiction reconciled in both places (above). B: 48 mid-sentence
bold spans -> 10. Kept: one bullet label (`-> **C**` in the pick-by-constraint list), the
danger-aside safety bold ("**restarts Postgres**" in the add-on row, the section's one safety
warning) and the run-in `**Fix:**` paragraph label. The other 7 are inside table cells
(including the two price cells), which is the corpus convention. Removed are the ordinary
emphasis spans ("**no setting anywhere**", "**three approaches**", "**at branch creation**",
"**IPv6-only**" and the rest). A: `## File reference` added (the gap meta.md flags) - the two
workflow files, `supabase/config.toml`, `supabase/seed.sql`, `supabase/.env.preview` and
`supabase/.env.keys`, plus the lab harness paths, all read off the doc's own steps.

### guides/supabase-region-migration-e2e.mdx
D: the W05 date reconciled with a preamble sentence on the `## Modules` table (line 602):
artifact cells date the battery re-run, the prose date is the module's first run. Evidence:
the `edge-resilience` RUNLOG at 6d42c55 dates W05 2026-08-15 ("## W05 - standby replication +
token portability (2026-08-15, green)") and both the 2026-08-16 and 2026-08-17 batteries
re-ran W01-W13 / W01-W26, so both Artifact links are correct for the module; `out/2026-08-15`
does not exist in the experiment's `out/` (the 08-15 battery artifact is
`evidence/final/run-2026-08-15T07-41-58-013Z`). No date or link changed. B: the two
mid-sentence emphasis spans at the old lines 436 and 456 unbolded; the remaining spans are the
three method names being defined, numbered-step labels and cell value marks.

### guides/supabase-resilience-runbook.mdx
D: the unattributed initial-sync hang scoped and attributed (above); the cold-DR recipe's
`aws-0-<region>.pooler.supabase.com` -> `aws-<N>-<region>.pooler.supabase.com` with a comment
saying the index is a per-project pooler-cluster number and to read the host from
`GET /v1/projects/<ref>/config/database/pooler` (matches the region-migration guide and
`reference/supabase-jit-database-access`). A: text fallback added under the architecture
diagram (summary item 4), from its own node and edge labels. Left open (report only): the
cross-doc TPA range - "~60-122ms" here against 59 ms / 249 ms in shared-tenancy. Each doc
quotes its own rig, and this one's constants table is dated 2026-08-15/16, so both stay.

### guides/supabase-shared-tenancy.mdx
D: "tens of milliseconds" replaced by the evidence figures; the constants `role` row now reads
"documented, not tested - see [what this does not settle](#what-this-does-not-settle)", the
same status the evidence table gives it. B: the practice cell at line 284 lost its trailing
justification clause ("when the app connects through a transaction pooler") - 161 chars -> 109
- because the Evidence cell already states it ("A session-level `SET` does not survive
transaction pooling"); the two backticked GUC names are the reason the cell is still over 90
and were kept.
**Left open, with the reason:** meta.md's `F` flag (no `## File reference`). This guide touches
no files - every step is Management-API or SQL state (`items` table, RLS policy, index,
third-party-auth integration, users). A File reference table would be empty, and the RUNLOG
mapping it would duplicate is already the `## Modules` table.

### guides/supabase-tenant-consolidation.mdx
No open finding from any of the three inputs (A/B/C/D all clean in batch-3.md, no meta row, no
diff-verify item). Unchanged.

### guides/supabase-tenant-promotion.mdx
D: the constants JWKS row now carries the 37-minute / 282-probe run (above).

### guides/unbound-agh-mt3000.mdx
C: "AdGuard Home" / "AGH" rotation normalised to AdGuard Home at the four prose sites (the two
inside the `conf` fence left untouched, as fences are out of scope). A: added the three missing
skeleton sections, each collected from the doc's own content - `## Verification` (the
`netstat` expected output, the `nslookup -port=5335` test, the green "Test upstreams" check,
the port-53 recursion check), `## Gotchas and lessons learned` (nine bullets, every one of them
already an Aside, a step warning or a prose caveat, each linking to the section that explains
it) and `## File reference` (the five `/etc/unbound` and init-script paths, the UCI-generated
`/var/lib/unbound/unbound.conf`, `/etc/sysupgrade.conf`, and the AdGuard Home upstream list as
the one config object). Anchors verified against `github-slugger`. B: 6 bold spans, all UI
element names in the Part 4 procedure or the Troubleshooting paragraph labels - nothing
decorative.
**Left open:** the "GL.iNet firmware upgrades preserve a curated set of config files" claim is
still undated. It is a platform behaviour I have no dated source for, and the doc's own edit
instructions forbid inventing one.

### guides/vaultwarden-multi-site.mdx
C: "TF" -> "Terraform" at the five prose sites (the `# In k3s tunnel TF directory:` fence
comment is the only survivor, inside a fence). C/mix: all 11 `:::tip[...]` / `:::caution[...]`
blocks converted to `<Aside type="tip" title="...">` / `<Aside type="caution" ...>`, so the
file now uses one callout form; the mandated `<Aside type="caution" title="Historical since
2026-09-29">` is untouched, per AGENTS.md and the fix brief. B: 8 mid-sentence emphasis spans
unbolded; the 15 further spans that the reviewer's count of 21 included are numbered-list
labels and table-cell labels, kept by convention. D: the pgloader lesson now names the method
the guide actually uses - "the load file's `EXCLUDING TABLE NAMES LIKE` line does it, and
`--excluding-table-names` does the same for a flag-based run" - keeping the flag identifier.
Frozen and reported, not fixed: the `## File reference` seam (meta's `F`) - the doc is
historical ("Historical since" caution, no `featured`/`blurb`), and meta.md's legend freezes
skeleton gaps on a historical doc. From `diff-verify.md`: the `author:` field stays as
`"Erfi Anugrah"`. Reverting it to the schema placeholder would be a regression - it was the
only placeholder of its kind in the corpus - and the round-1 change is the parent's decision,
not a defect to re-open here.

### guides/vyos-dot.mdx
D: the hairpin contradiction resolved toward what the shipped config shows. Rule 1 sends
cf-ipv4 to table 20, Magic WAN source-NATs hairpin traffic into the Cloudflare group (the
doc's own captures: "Inbound: Packets with `src=172.71.x.x` (Magic WAN edge IP)"), and
`172.71.0.0/16` sits inside the group's `172.64.0.0/13` - so the reply rides rule 1, while the
hairpin rules 5-8 are shadowed by the rule 2 catch-all and only matter for a reply addressed
to a raw LAN host address. Brought in line: the lede, the description, the rule 1 / rules 5-8
bullets and the "Current order" line, "Rule order implications", the "Catch-all ordering
matters" and "Optional return-path rule" pitfalls, and the Notes bullet about rule order. The
"Cloudflare routing limitation" aside and the troubleshooting expectations now agree with the
mechanism instead of contradicting it. C: prose normalised to "Glory-Hole" (title, description,
lede, diagram label, prerequisites, and the eight lowercase prose/heading uses); the backticked
identifiers (`glory-hole`, `magic-wan-ipsec-glory-hole`) and fences are unchanged. Mix: the two
`:::note` blocks converted to `<Aside type="note">`; the file now uses one callout form.
Frozen and reported: the `## N)` heading style and `## File reference` (meta's `F`/`G`) - the
doc is historical, and meta.md's legend freezes both.

### guides/windows-build-vm-forgejo-ci.mdx
D: the stop-time reconciliation (above). No other finding; the constants-versus-narrative
agreement elsewhere (5m54s / 7m02s builds, 10-16 s cold boot, artifact byte counts) was
re-checked and holds.

### guides/windows-smb-credentials-nixos-samba.mdx
A: `## File reference` added (meta's `F`) - the sops file, the decrypted secret path under
`/run/secrets`, `passdb.tdb`, the `samba-set-password` oneshot and its ordering, the
`make deploy` target, and Windows Credential Manager as the client-side object. Every path is
in the doc's own steps. C (soft note, left as authored): "Credential Manager" and "the vault" /
"the credential vault" still alternate. The product name is at first mention in each section
and the short form then holds, so this reads as the author's deliberately compact form rather
than a rotation; the brief says to report rather than edit when it may be voice.

### guides/winfsp-rclone-stuck-drive-letter.mdx
A: `## File reference` added (meta's `F`) - `fsptool-x64.exe`, the rclone config and log, the
rclone binary, the four registry keys the steps query, and the `rclone-copyparty` service.
Left open (report only): step 5's heading is the colon-headline shape
("Driver reload: the test that finds a live re-mounter") but heading text cannot change beyond
casing under the fix brief's rules; "the zombie" / "the mount" / "the letter" for one object is
the author's vocabulary, reported in round 1 and left alone here.

### guides/wsl2-disk-reclaim.mdx
A: `## File reference` added (meta's `F`) - the two VHDX path patterns plus Docker Desktop's,
`.wslconfig`, `/etc/wsl.conf`, `/etc/fstab`, `vhdctl.ps1` and `%TEMP%`, all from the doc's own
parts. C (soft note, left as authored): "my dotfiles" here against the sibling docs' "the
dotfiles repo". That is first-person voice, not a rotation.

### guides/wsl2-run-user-docker-desktop.mdx
No open finding from any input. Unchanged.

## Verify

Run on the 14 edited files only:

```bash
prose-lint --config .prose-lint.json --before HEAD --no-max <14 files>          # exit 0
prose-lint --config .prose-lint.json --no-max --no-counters \
  --baseline .prose-terms-baseline.json <14 files>                              # exit 0
bun test tests/docs.test.ts tests/pins.test.ts                                  # 1828 pass, 0 fail
```

`prose-lint --before HEAD` reports no dropped fact on any of the 14; the terms run reports no
new rotation against the ratchet (the pre-existing `referent-rotation=1` markers on
`vaultwarden-multi-site` and `supabase-postgres-major-upgrade-e2e` are in the baseline).
`bun run build` was not run: the fix brief and BRIEF.md forbid it while other workers edit this
same checkout. As a substitute for the MDX half of the build, every file in the batch
(including the 2 unchanged) was compiled with `@mdx-js/mdx` under the same
remark-frontmatter/gfm/math plugins - 16/16 OK - which is what catches a broken `<Aside>`
conversion or an unescaped `<`/`{` in the new tables. The anchors added in
`unbound-agh-mt3000` were slugified with the repo's `github-slugger` and match.

Edits are unstaged working-tree changes in the 14 files listed under "Per file". Nothing
committed, no file outside `batches/batch-3.txt` and this report touched.
