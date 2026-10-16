# Fix batch 2

Inputs: `batch-2.md` (every Unfixed item), `meta.md` (section 2 rows and the
one-way-link pair), `diff-verify.md` (the leftover `forward_r14` gap).
Files edited: 19 of the 23 in `batches/batch-2.txt`. No git operations run.

## Number changes

(path:line before -> after - evidence)

- `guides/supabase-own-postgrest.mdx` (8 pins: practice rows 197-198, File
  reference 221, Modules rows 236-237): commit `92f3469` -> `f703393`.
  Evidence: GitHub API, one blob sha per path at both refs -
  `experiments/security-lockdown/tests/s04-self-hosted-postgrest.ts`,
  `s20-xff-trust-boundary.ts`, `s05-rate-limit.ts`, `s06-postgrest-role.ts`,
  `ratelimit.nginx.conf`, `edge.nginx.conf` are byte-identical at `92f3469`,
  `f703393` (and `a07de3d`), so the cited content is unchanged at the newer
  commit; `f703393` is later (2026-09-14 vs 2026-09-03) and the page already
  pinned its S16/S20 rows there.
- `guides/supabase-iap-data-api.mdx` (3 pins: practice row 154, Module rows,
  the experiment tree link at 167): `a07de3d` -> `f703393`. Same evidence:
  `tests/l10-tpa-iap-issuer.ts` and `tests/l10e-labissuer-admit.ts` are
  byte-identical at both refs; the page already pinned L07/L08 there.
- `guides/self-host-matrix.mdx` Resource summary total row: CPU limit
  `14.75` -> `14.75 vCPU` (unit only). Evidence: the column sums the 13 row
  values (14750m = 14.75) and every other row in the table carries a unit.
- `guides/supabase-org-consolidation.mdx` Constants row 47: figures unchanged
  (2.3 s / 4.0 s); the label now reads "Measured claim API-call duration" and
  names the 75.2 s as the paid-to-Free data-plane outage. Evidence: Part 5's
  table is headed "Measured data-plane outage" and is polled
  `/auth/v1/health` every 250 ms, while this row is the claim-token API call.
- `guides/self-host-matrix.mdx` VyOS text fallback: added the `forward filter`
  jump targets `rule 5` (pppoe0 -> `EXTERNAL-IN`) and `rule 14` (eth1.60 ->
  `TPI`) - the node `forward_r14` the fallback omitted. No figure changed.
- `guides/postgres-corpus-entity-graph.mdx` (Constants row 39, Part 3 line
  ~187): figures unchanged (154.924 ms, 65721.220 ms, 167.59 ms, 0.22 ms);
  each pair is now labelled with the query it belongs to (level-set vs
  path-set recursive CTE; neighbour-lookup traversal of `demo.edges`).
- `guides/supabase-auth-mfa-trusted-device-and-impersonation-audit.mdx` row
  132: no figure changed; `logs.all` "has been removed since 2026-09-23" ->
  "was removed on 2026-09-23" and the footnote marker now sits on a clause
  saying the cited changelog is the 2026-07-23 migration announcement.
- Five practice cells trimmed, the removed clause moved verbatim into the
  same row's Evidence cell (no figure, path or identifier lost):
  - `supabase-auth-mfa-...mdx` 120 -> 81 chars (`...timeout); a live session is
    never re-challenged` moved to Evidence)
  - `supabase-aws-privatelink-tofu.mdx` 94 -> 63 (`before narrowing
    restrictions` moved to Evidence)
  - `supabase-grafana-monitoring.mdx` 102 -> 54 (`not the 1-minute figure from
    the Supabase docs` moved to Evidence)
  - `supabase-own-postgrest.mdx` 116 -> 60 (`Before combining this guide with
    network restrictions` moved to Evidence)
  - `supabase-per-project-cost-attribution.mdx` 129 -> 89 (`limited to the
    projects being metered` moved to Evidence)

## New anchors

(path: new slug / slug removed)

- `guides/nix-steam-os.mdx`: added `#verification`,
  `#gotchas-and-lessons-learned`, `#file-reference`. Renamed
  `## The "Nix Way"` -> `## How Nix works differently`, removing
  `#the-nix-way` - `rg` finds no inbound reference to it in the corpus.
- `guides/qmk-via-keymap-guide.mdx`: `#verification`,
  `#gotchas-and-lessons-learned`, `#file-reference`.
- `guides/openwrt-bridged-ap.mdx`: `#file-reference`.
- `guides/postgres-corpus-entity-graph.mdx`: `#gotchas-and-lessons-learned`,
  `#file-reference`. Nine part headings `## Part N - X` -> `## Part N: X`,
  which re-slugs them: `#part-1---provision-the-project` ->
  `#part-1-provision-the-project` and likewise for parts 2-9. No inbound
  `#part-`-style anchor exists in `src/content/docs` or `tests` (`rg` empty).
- `guides/self-host-matrix.mdx`: `#gotchas-and-lessons-learned`,
  `#related-docs`.
- `guides/sks8300-openwrt.mdx`: `#file-reference`.
- `guides/slskd-wireguard-port-forward.mdx`: `#file-reference`.
- `guides/supabase-branch-detach-git-link.mdx`:
  `#gotchas-and-lessons-learned`, `#file-reference`.
- `guides/supabase-org-consolidation.mdx`: `#file-reference`.
- `guides/supabase-own-postgrest.mdx`: `#related-docs`.
- `guides/supabase-per-project-cost-attribution.mdx`: `#file-reference`.

## Per file

- `guides/nix-steam-os.mdx` - B: emphasis bold removed from running prose
  (`immutable filesystem`, `Nix`, `Flatpak`, `Distrobox`, `Nix flakes`, the
  STEAM / Power / Switch to Desktop / Konsole button names);
  `**IMPORTANT - Reboot:**` -> `**Reboot:**` (self-grading label);
  `Finalize` -> `Finalise`. A: the scare-quoted `## The "Nix Way"` heading
  renamed; Verification, Gotchas and lessons learned and File reference added
  from the doc's own steps. Open: the standalone `---` between the frontmatter
  and `## Introduction` (matches the part separators, left); the Part 4-6 bold
  pseudo-headings left as bold - they label sections rather than doubling the
  hierarchy, and converting them would add anchors for no reader gain.
- `guides/openwrt-bridged-ap.mdx` - A: File reference added (`config/*`,
  `deploy.sh`, `authorized_keys`, the gitignored env file, the sysupgrade
  image).
- `guides/pg-analyser-bench-methodology.mdx` - B: "The preflight is the part
  that runs before any timing exists, and it is the part worth not
  overriding:" -> "The preflight runs before any timing exists. Each check
  below exists because the number it prevents would be wrong:".
- `guides/porting-github-actions-to-forgejo.mdx` - A: the lede now names the
  runner reference with its relationship ("the runner this guide's
  `runs-on:` step depends on - its labels, regenerated config template and
  restart posture"), and a Related docs bullet names what step 2 resolves
  against. B: both announce-before-stating openers gone ("Two runner settings
  shape everything below." deleted; "Two conditions gate whether the workflow
  runs at all." -> "The repo must be native and the Actions unit must be
  enabled, or the workflow never runs.").
- `guides/postgres-corpus-entity-graph.mdx` - C: nine part headings
  `Part N -` -> `Part N:`. D: the two measurement pairs labelled. A: Gotchas
  (15 bullets, all from the doc's own Asides, step warnings and Lifecycle
  rules) and File reference (manifest, loader, extraction SQL, read RPCs,
  Worker, UI, Playwright suite, `make up`, tfvars, runbook).
- `guides/qmk-via-keymap-guide.mdx` - B: four bold directives de-bolded
  (`Don't use qmk compile` -> "Do not use `qmk compile`..."; the
  ATmega32U4/STM32 and RP2040 branch labels; the "Linux permissions issue?"
  label). A: Verification, Gotchas and lessons learned and File reference
  added from the doc's own compile/flash/verify steps. Open: the doc predates
  2026-07, so its American -ize spelling is left alone per the old-doc rule.
- `guides/secretctl-registry-and-coverage.mdx` - no edit. Open: pre-existing
  `mean-sentence-ceiling` gate, 30.2, identical on the HEAD copy.
- `guides/secretctl-rotation.mdx` - no edit. Open: same gate, 27.2, identical
  on the HEAD copy (`batch-2.md` counted two such files; this is a third).
- `guides/self-host-matrix.mdx` - A: the VyOS fallback now names rule 5 and
  rule 14 (the round-1 fallback omitted `forward_r14`); Gotchas and lessons
  learned (14 bullets from the doc's Asides, `:::danger` blocks and Part 6
  findings) and Related docs (Traefik on k3s, ARM64 k3s cluster operations,
  Gloryhole DoT / VyOS) added. B: the ad-copy lede sentence rewritten; the
  three capsule labels (`**Critical configuration details:**`, `**Gotchas:**`,
  `**Diagnosis flow:**`) removed, leaving their tables; the two `<Aside>`
  blocks converted to `:::caution[...]` and the now-unused Starlight import
  dropped so the file uses one form (it already had nine `:::` directives).
  D: the total-row unit. Open: the 13 `| :--- |`-padded tables (old-doc
  alignment style, mechanical churn, no reader effect - left for the author);
  no evidence/provenance line (A-axis sourcing, reported only); the tip box
  for "What this covers" is present and untouched.
- `guides/singapore-weather-ha-grafana.mdx` - no edit, no open finding.
- `guides/sks8300-openwrt.mdx` - A: File reference added (the six `files/`
  overlay entries, the CI workflow, the deploy script, the 17-check script,
  the eaves inventory file, `~/.ssh/id_sks8300`, the stock partition dump,
  the two CI images).
- `guides/slskd-wireguard-port-forward.mdx` - A: File reference added
  (compose file, `scripts/update-port.sh`, `./pia-state` and `./pia-shared`,
  `./slskd-app`, the data mounts, the edge Caddy block). `meta.md` marks this
  file historical/frozen; the table is additive and `batch-2.md` listed it as
  the last open `[A]` item, so it is here - drop it if the freeze is meant to
  cover skeleton additions too.
- `guides/sops-age-compose-stacks.mdx` - no edit. Open: pre-existing
  `mean-sentence-ceiling` gate, 26.9, identical on the HEAD copy.
- `guides/supabase-auth-mfa-trusted-device-and-impersonation-audit.mdx` -
  D: the citation/removal-date contradiction reconciled (marker moved, the
  2026-07-23 announcement named as such). Practice-cell trim above. Open: no
  Modules table, and none is missing - the page cites no module id, so the
  Evidence table's dates are the only provenance (reported in round 1).
- `guides/supabase-aws-privatelink-tofu.mdx` - A: text fallback added under
  the architecture diagram, node-by-node (`client` -> PHZ -> endpoint ->
  Resource Configuration -> Postgres/PgBouncer, RAM share accept-first).
  Practice-cell trim above.
- `guides/supabase-branch-detach-git-link.mdx` - A: Gotchas and lessons
  learned (7 bullets from the `:::caution` and step findings) and File
  reference (no files: `$SUPABASE_ACCESS_TOKEN`, `$REF`, `$BID` and `curl`
  only, stated as such). Open: "What to do about it" is a bullet list where
  sibling pages use a Practice table - acceptable (round 1), left.
- `guides/supabase-edge-function-bff-fanout.mdx` - A: text fallback added
  (app -> gateway -> fanout-api -> four upstreams + two RPCs -> table).
  Open: the missing back-link in `reference/supabase-edge-function-limits`
  belongs to another batch.
- `guides/supabase-grafana-monitoring.mdx` - A: text fallback added (Metrics
  API -> one-click / managed agent / self-hosted scrape -> Grafana Cloud or
  self-hosted Grafana). Practice-cell trim above.
- `guides/supabase-iap-data-api.mdx` - D: pins unified (see Number changes).
  No open finding.
- `guides/supabase-management-api-logs-endpoint.mdx` - D: the frontmatter
  description brought in line with the aside and body ("was removed on
  2026-09-23"). Open (frozen, the "Out of date since 2026-09-23" aside and
  `meta.md`'s historical marker): no Verification, Gotchas or File reference;
  `meta.md` also flags the page as a reference-shaped misfiled candidate - a
  move is the author's call, no move made.
- `guides/supabase-org-consolidation.mdx` - D: Constants row labelled.
  A: File reference added - no files, the steps are `curl` against the
  Management API, and the measurements live in the Modules experiments.
- `guides/supabase-own-postgrest.mdx` - D: one commit per cited file.
  A: Related docs added, naming the relationships (the lockdown reference
  this guide is option 3 of; the IAP guide as option 1 of the same decision).
  Practice-cell trim above.
- `guides/supabase-per-project-cost-attribution.mdx` - A: File reference
  added (tenant map, hourly usage rows, monthly join, scoped-key gateway,
  the `experiments/usage-metering/` implementation). Practice-cell trim
  above. Open: the evidence heading `## Verified / tested` where the corpus
  uses `## Evidence` - a heading rename is the author's call (round 1), left.

## Verification run on these 23 files

- `prose-lint --config .prose-lint.json --before HEAD --no-max <23 files>`:
  no fact drift except the intended commit-pin replacements - `fact-retention`
  FAILs on `supabase-iap-data-api` (3 of 101 facts) and `supabase-own-postgrest`
  (9 of 169), and every dropped item is one of the old `a07de3d` / `92f3469`
  URLs replaced by the new pin (blob identity verified above). Plus the three
  pre-existing gates below.
- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline .prose-terms-baseline.json <23 files>`: no terms rotation; the
  same three `mean-sentence-ceiling` FAILs, each identical on the HEAD copy
  (`secretctl-registry-and-coverage` 30.2, `secretctl-rotation` 27.2,
  `sops-age-compose-stacks` 26.9) - not caused by these edits.
- `bun test tests/docs.test.ts tests/pins.test.ts`: 1828 pass, 241 skip,
  0 fail. No pin changed.
- `bun test tests`: 1929 pass, 243 skip, 0 fail (the checkout also carries
  other batches' files).

## Left open for the author

- 33 practice cells remain over 90 characters, every one of them carrying at
  least one backticked API path or identifier inside the same cell:
  `postgres-corpus-entity-graph` 4, `supabase-auth-mfa-...` 4,
  `supabase-aws-privatelink-tofu` 4, `supabase-grafana-monitoring` 6,
  `supabase-iap-data-api` 3, `supabase-org-consolidation` 4,
  `supabase-own-postgrest` 4, `supabase-per-project-cost-attribution` 4.
  AGENTS.md: "Do not drop an API path or an identifier to hit that." All five
  cells that carried no identifier were trimmed (Number changes).
- `guides/self-host-matrix.mdx`: the 13 padded table alignments and the absent
  evidence/provenance line (reported in round 1, not sourced here).
- Frozen skeleton gaps on the two historical pages
  (`supabase-management-api-logs-endpoint`, `slskd-wireguard-port-forward`)
  per `meta.md`'s own legend, and the misfiled-candidate question on the
  former.
- `reference/supabase-edge-function-limits` still has no link to
  `guides/supabase-edge-function-bff-fanout` (that file is outside this batch),
  and the remaining pre-existing prose-lint gates listed above.
