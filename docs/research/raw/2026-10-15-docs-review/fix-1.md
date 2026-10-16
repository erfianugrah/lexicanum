# Batch 1 fix report

Round: 2026-10-15 corpus review, fix pass. Batch 1 = the 21 files listed in
`docs/research/raw/2026-10-15-docs-review/batches/batch-1.txt`, all under
`src/content/docs/guides/`.

18 of the 21 are edited and committed-ready. The three not edited
(`forgejo-primary-fleet-migration`, `forgejo-webhooks-composer-gitops`,
`monitor-compose-postgres-prometheus`) carry no fixable finding - reasoning in "Not applied".

## Verification (this batch's files only)

1. `prose-lint --config .prose-lint.json --before HEAD --no-max <21 files>` - **PASS**, 21 files,
   `TOTAL: slop 0.02/100w`, no fact-retention failure.
   - Caught and fixed: `kubectl-cf-access` initially failed `fact-retention - dropped 1 of 27
     facts: https://github.com/int128/kubelogin`. Turning the bare URL in the Prerequisites tip
     into a markdown link reads as dropping it. Restored as a bare URL (`- https://github.com/
     int128/kubelogin`), which is also the form the original used. Re-run: pass.
2. `prose-lint --config .prose-lint.json --no-max --no-counters --baseline
   .prose-terms-baseline.json <21 files>` - **PASS** after one fix.
   - Caught and fixed: `cfd-cloud-run` `score 0.09 regressed against baseline 0.00` - a
     referent-rotation on `config` / `configuration` created by a new Verification bullet
     ("confirms the NAT config") against the existing "Check NAT configuration". Reworded to
     "the NAT router's settings". Re-run: pass.
   - Two pre-existing `gate mean-sentence-ceiling` failures remain, both outside this pass's
     reach; see "Not applied".
3. `bun test tests/docs.test.ts tests/pins.test.ts` - **1828 pass, 241 skip, 0 fail**
   (1969 expect() calls). The skips are the pins that render `dist/`; no build was run
   (`BRIEF.md`: never run `bun run build`), so the html-level pins are unverified here. The
   source-level pins for this batch (`gh-actions-cloudflare` "contains every pinned
   correction", "does not reintroduce a removed claim", `linksTo`) ran and passed.

## Number changes

- **`forgejo-recovery-runbooks.mdx`** - the only changed figure.
  `ten distinct outages and near-misses` -> **`nine distinct outages and near-misses`**, plus
  "runbook 10 is the routine admin-token rotation rather than an outage". Evidence: the doc's own
  ten runbooks, of which runbook 10 is admin-token rotation, and the `description:` that
  enumerates nine incident runbooks. The word `ten` survives as the runbook count ("the ten
  runbooks below"), `runbook 10` survives, and the `description:` gained the tenth item
  ("rotating the admin token without locking the runner out") so its list matches its own
  "Ten task-sequenced runbooks" claim.
- **`esphome-fleet-ssid-migration.mdx`** - filled the empty `Expected` cell with
  `fleet size (13 here)`. 13 is the doc's own fleet size (its lede and Constants preamble), not
  a new measurement.
- **`10gbe-link-tuning.mdx`** - the powercfg row in the new File reference carries the four
  GUIDs in full, copied from the doc's own settings table
  (`48e6b7a6-50f5-4782-a5d4-53bb8f07e226` under `2a737441-1930-4402-8d77-b2bebba308a3`;
  `ee12f906-d277-404b-b6da-e5fa1a576df5` under `501a4d13-42af-4429-9fd1-a8218c268e20`). An
  intermediate draft had them truncated to `2a737441-...`; that would have altered an
  identifier, so they were written out.
- **No other number changed.** Figures quoted into the new sections are copies from the same
  doc: `7844`, `216.239.32.0/19`, `35.190.0.0/16`, `130.211.0.0/22` (cfd-cloud-run);
  `1500+`, `5000`, `72`, `65535`, `24h`, `15-second`, `1-second` (k3s-monitoring-stack);
  `60-120 seconds`, `r6` (k3s-traefik); `256MB`, `90 days`, `06:00 UTC` (caddy-compose-waf);
  `162.159.137.104`, `162.159.138.104`, ports `500`, `1701`, `2408`, `4500`, DH `5/14/20`
  (magic-wan-interop); `5m`, `24h` (kubectl-cf-access); `9014` (10gbe-link-tuning).
  Counts I tallied from the same doc's own table: "six files" (the Version Sync tip's list in
  caddy-compose-waf), "four possible sources" and "four" `X-Blocked-By` values
  (k3s-traefik's 403 table).

## New anchors

Slugs are from `github-slugger` against the raw heading text (checked with the repo's own
`node_modules/github-slugger`, not by eye).

Added sections (new anchors, no inbound links exist to any of them):

| File | New anchors |
| --- | --- |
| `10gbe-link-tuning` | `#file-reference` |
| `airgradient-one-esphome-local` | `#file-reference` |
| `arr-stack-docker-patterns` | `#file-reference` |
| `caddy-compose-waf` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference`, `#related-docs` |
| `cfd-cloud-run` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference`, `#related-docs` |
| `cliamp-wsl2-audio` | `#file-reference` |
| `diagnosing-llm-reasoning-cliffs` | `#file-reference`, `#related-docs` |
| `esphome-fleet-ssid-migration` | `#file-reference` |
| `extending-tf-with-api` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference` |
| `gh-actions-cloudflare` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference`, `#related-docs` |
| `k3s-arm64-cluster-ops` | `#gotchas-and-lessons-learned` |
| `k3s-monitoring-stack` | `#gotchas-and-lessons-learned` |
| `k3s-traefik` | `#gotchas-and-lessons-learned` |
| `kubectl-cf-access` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference`, `#related-docs` |
| `magic-wan-interop` | `#verification`, `#gotchas-and-lessons-learned`, `#file-reference`, `#related-docs` |
| `mongodb-wrapper-archive-migration` | `#file-reference` |
| `nas-bulk-data-migration` | `#gotchas-and-lessons-learned`, `#file-reference` |

Renamed headings, with the old slug kept as an explicit anchor (the AGENTS.md rule for a slug
change). No doc links to either old anchor, so these are belt-and-braces; both would normally
also get a row in `tests/pins.test.ts` `anchors`, and adding that row is the parent's call
(the tests are not mine to edit):

- `k3s-arm64-cluster-ops`: `## Troubleshooting quick reference` ->
  `## Gotchas and lessons learned`, with `<a id="troubleshooting-quick-reference"></a>`.
- `nas-bulk-data-migration`: `## Failure modes from the migration` ->
  `## Gotchas and lessons learned`, with `<a id="failure-modes-from-the-migration"></a>`.

Slug-preserving heading edits (no anchors needed, verified against the slugger):

- `magic-wan-interop`: every heading moved up one level (h3 -> h2, h4 -> h3, h5 -> h4,
  h6 -> h5; deepest is now h5). Slugs unchanged because they are lowercased and level-blind.
  Three bold headings de-bolded and re-cased (`MSS clamping implementation`,
  `Step 1: discover the path MTU with \`ping\``, `Step 2: verify TCP MSS with \`tcpdump\``),
  plus `MTU/MSS calculation cheat sheet`, `Diagnostic commands and workflow`,
  `Step 2: GRE and/or IPsec tunnel prerequisites`.
- `cfd-cloud-run`: `Deploy Internal Service (httpbun)` -> `Deploy internal service (httpbun)`.
  The obvious fix would have added "the" and changed the slug to
  `deploy-the-internal-service-httpbun`; the slug-preserving form was used instead, since the
  finding was only the capitalisation of generic nouns.
- `gh-actions-cloudflare`: eight heading-casing fixes (`Concurrency control`, `Job environment`,
  `1. Repository checkout`, ... `8. Cloudflare Pages deployment`, `Bun dependencies cache`,
  `D2 CLI cache`, `Astro build cache`).
- `kubectl-cf-access`: `Cloudflare Tunnel Deployment (instead of side-car)` ->
  `Cloudflare Tunnel deployment (instead of side-car)`.

## Per file

### `10gbe-link-tuning.mdx` (meta: missing `File reference`)
- Added `## File reference`. Only one file pins the end state (`verify-10g.ps1`), so the table
  is mostly config objects: the driver-store export, the powercfg settings, the AQtion driver
  package, the AQC113 tooling, the per-adapter driver properties and the Linux-side MTU. A line
  in the section says exactly that.
- Nothing else touched. The review found no other open finding; this doc is a named exemplar.

### `airgradient-one-esphome-local.mdx` (meta: missing `File reference`)
- Added `## File reference` (this unit's yaml, the upstream pinned yaml, the vendored
  watchdog/led/PMS5003/display packages, the generated `src/main.cpp`, the hub's `secrets.yaml`,
  the router lease table).
- The review's aggregate claim that this doc has an empty `Expected` cell in the Home Assistant
  verification row does not hold in the current tree: that row is absent and the table's last
  row (`LED bar`) is complete. No edit possible or needed.

### `arr-stack-docker-patterns.mdx` (meta: missing `File reference`)
- Added `## File reference` (compose file's `services:`/`networks:` blocks, the edge Caddyfile
  site block, `/root/arr-path-migrate.sh`, the arr `.db` and its `.pre-migrate` copy, the
  hardlink-preserving media layout, the container mount paths, the two subnets).

### `caddy-compose-waf.mdx` (A: no Verification/Gotchas/File reference; B: participle tail,
hyperbole; C: `---` separators)
- Added `## Verification` (from `## Build and test` and `## Deploy workflow`: `make test` /
  `make test-go` / `make test-frontend` / single-case commands, the log-and-dashboard checks,
  the `docker exec caddy caddy reload` path for config-only changes, and the `cosign verify`
  invocation from the CI section), `## Gotchas and lessons learned` (ten bullets, all from the
  doc's own Asides and prose: the `SecRuleEngine` single source, the six-file version sync, the
  `/load` fingerprint trick, atomic writes, the IPsum three-source lifecycle, the Go-scheduler
  refresh, audit-log rotation, reserved rule-ID ranges, the pre-commit hook, `generateOnBoot`),
  `## File reference` and a `## Related docs` link to `reference/edge-caddy-on-nixos`.
- B fixed: dropped `, preventing configuration drift` (participle tail); `The stack applies
  defence in depth at every layer:` -> `The stack hardens at these layers:` (hyperbole +
  self-rating).
- Removed the 17 bare `---` separators (fence-aware check first: none inside a code fence) and
  collapsed the double blank lines they left. Diff reviewed: deletions are separators, blank
  lines and the two edited sentences only.

### `cfd-cloud-run.mdx` (A: lede, Verification/Gotchas/File reference, `---`; C: heading casing)
- Lede rewritten: what the pattern is, the v4 provider note, and the deployment order the
  tunnel token forces; prerequisites line added (project with billing, `gcloud` or Terraform,
  a zone whose CNAME the tunnel takes).
- Added `## Verification` (four `gcloud ... describe` / `logs read` checks that already exist in
  `## Useful commands`, plus the end-to-end hostname check), `## Gotchas and lessons learned`
  (eight bullets from the doc's own Important notes, firewall comments and troubleshooting
  section: dynamic Google ranges, the Cloudflare IP list, port 7844's two protocols,
  `min_instance_count = 1`, internal-ingress egress, the token chicken-and-egg, the `trimprefix`
  of the Cloud Run URI, the v4 pin), `## File reference` (VPC/subnet, router/NAT, the three
  firewall rules with priorities, both Cloud Run services, the three Cloudflare resources, the
  secret, the dynamic IP locals) and `## Related docs` (k3s-traefik, vaultwarden-multi-site).
- `#### Deploy Internal Service (httpbun)` -> `Deploy internal service (httpbun)`.
- Separators removed, as above.

### `cliamp-wsl2-audio.mdx` (meta: missing `File reference`)
- Added `## File reference` (`~/.config/cliamp/config.toml`, the `pulseaudio-alsa` drop-in,
  `/mnt/wslg/PulseServer`, absent `/dev/snd`, the test tone, the shell rc files that break
  WSLg audio, the three `NAVIDROME_*` variables).

### `diagnosing-llm-reasoning-cliffs.mdx` (A: no Related docs/cross-link; D: `Aug 20-22` vs
"two days")
- D fixed in the constants table's check cell: the row now says the drop lands on Aug 20, two
  days after the last healthy full day (Aug 18), and that Aug 20-22 is the window the level
  held in. Both figures survive; neither the lede's "two days" nor the label changed.
- Added `## File reference` (the session jsonl glob, `models.json`, the harness binary, the
  dotfiles `git log` window) and `## Related docs`: `reference/agent-memory-store` (the store
  built on the same jsonl files, with its retention limits) and `reference/qwen38-agentic-tuning`
  (the serving-side reasoning-effort analogue).

### `esphome-fleet-ssid-migration.mdx` (A: empty `Expected` cell; meta: missing `File reference`)
- Filled the cell (see Number changes).
- Added `## File reference` (the thirteen device yamls, the live hub `secrets.yaml`, the sops
  copy, the dashboard `storage/*.yaml.json` and `*.validated.yaml` cache, HA
  `core.config_entries`, `/etc/config/wireless` on the AP, the AP env file, `.esphome/build/`,
  the DHCP reservations). Placed before `## Related docs`, which stays last.

### `extending-tf-with-api.mdx` (A: lede, Verification/Gotchas/File reference, `---`; B: `This is
the most secure method.`; C: broken `description:` clause; D: provider 4.5.2 vs 4.0+)
- The lede's 4.5.2 observation and the prerequisites' 4.0+ floor are now reconciled in one
  place: the lede says `cloudflare_accounts` does not paginate in 4.5.2 and that the examples
  work on any 4.x provider because the pagination happens in the `http` data sources. The
  prerequisites keep `cloudflare/cloudflare 4.0+`.
- `This is the most secure method.` -> `which is narrower than the global key.`
- `description:` broken clause fixed: "has limitations or lacks features, you can use ...
  and work around them".
- Added `## Verification` (the module's own outputs: `success`, `error`, `total_accounts`
  compared against the dashboard, `account_names`/`account_ids` - phrased as the standard
  `terraform output` invocation for outputs the doc defines, no new logic), `## Gotchas and
  lessons learned` (token scope vs global key, the optional `cloudflare` provider, the
  failed-first-request path that yields an empty list rather than an error, the stringified
  `for_each` page keys, duplicate names collapsing in `accounts_by_name`, the substring match in
  the prod filter) and `## File reference` (the root module's objects, with a note that the
  blocks are one `.tf` file and no path is pinned).
- No `## Related docs`: there is no sibling doc in the corpus to point at, and an invented one
  would be worse than none.
- Separators removed, as above.

### `forgejo-primary-fleet-migration.mdx` - **not edited**
- A: nothing missing. B: already fixed in the previous pass. The remaining review items are the
  `Two things made the visibility pass ... worth re-checking:` count-plus-subject frame (the
  reviewer judged any rewrite a wash, and the sentence carries the reason for the re-check) and
  the `repo-fleet` mention in the `## Part 2` heading, which the frontmatter and prose spell
  consistently between themselves; backticking the heading is a text change beyond casing, which
  the brief forbids. Reported, not applied.
- The `mean-sentence-ceiling` gate failure (mean 33.5) is pre-existing; see "Not applied".

### `forgejo-recovery-runbooks.mdx` (D: ten outages vs runbook 10 being routine)
- Fixed both the lede and the `description:` (see Number changes). No other edit.

### `forgejo-webhooks-composer-gitops.mdx` - **not edited**
- The only open finding is the `mean-sentence-ceiling` gate (mean 26.6); see "Not applied".

### `gh-actions-cloudflare.mdx` (A: lede, Verification/Gotchas/File reference, `---`; the
historical note; C: heading casing)
- The body `:::note` historical statement is now the prescribed
  `<Aside type="caution" title="Historical since 2026-09-24">` directly after the frontmatter
  (with `Aside` added to the existing Starlight import). Its text is unchanged, so the pinned
  `GitHub-hosted variant` string and the "does not reintroduce a removed claim" pin both still
  pass.
- Added the lede (Pages vs Workers static assets, the purge difference, prerequisites).
- Added `## Verification` (the `d2 --version` guard, what a green Pages run means, the
  `if: success()` gate on the purge job, and that Pages needs none), `## Gotchas and lessons
  learned` (the `install.sh` API rate limit, the `github.sha` cache key, `fetch-depth: 2`, the
  Pages feature gaps, the artifact actions failing on Forgejo), `## File reference` (the workflow
  YAML, `wrangler.jsonc`, `dist/`, the cache keys, the D2 install prefix) and `## Related docs`
  (the Forgejo port, the Forgejo runner reference).
- Eight heading-casing fixes.
- Separators removed.

### `k3s-arm64-cluster-ops.mdx` (A: no top-level Gotchas; B: structure-narrating sentence)
- `## Troubleshooting quick reference` renamed to `## Gotchas and lessons learned` (its 16-row
  symptom/cause/fix table is the doc's own gotcha collection, so no duplicate section was
  written), with the old slug kept as an anchor.
- Deleted the second lede sentence (`Each section includes the root cause analysis, the fix, and
  the gotchas encountered along the way.`), which narrated the doc's own structure and
  duplicated the `What this covers` list below it. The first sentence (`learned the hard way`)
  stays - it is the documented dry-wit exception.

### `k3s-monitoring-stack.mdx` (A: no Gotchas; B: `No Helm.` fragment + cadence list, lede
structure narration)
- Added `## Gotchas and lessons learned`: a twelve-bullet one-line index of Part 8's LogQL
  pitfalls, each linking to its pitfall anchor (slugs computed with `github-slugger`, including
  the two odd ones: `#2-unwrap-aggregations-dont-support-by-` and
  `#11-selective--json-reduces-query-cost-dramatically`). Each gloss is the pitfall's own
  content, checked against Part 8.
- B fixed: the lede's second paragraph no longer narrates the doc's structure
  ("Prometheus Operator and core metrics come first, ..." and "The manifests are the ones from
  production."); the raw-manifests paragraph is now one sentence carrying the three facts
  instead of `No Helm.` plus a cadence list.
- No `## Related docs` added: the `Historical since` Aside already links the successor reference
  doc, which is the relationship that matters (the reviewer's own conclusion). The Aside was not
  touched.

### `k3s-traefik.mdx` (A: no Gotchas; B: `concise`)
- Added `## Gotchas and lessons learned` (seven bullets, each from the doc's own cautions,
  notes and 403-debugging section: ServiceLB without MetalLB, the plugin `import`/mount-path
  triple, DNS-challenge propagation, `allowCrossNamespace`, the four 403 sources, the Logpush
  false positive and rule r6, and the fact that the cluster is retired). Three bullets link to
  their sections; slugs computed with `github-slugger`.
- B fixed: `The rule engine uses a concise expression syntax with short field names, a
  recursive descent parser, and a tokenizer - all in pure Go stdlib:` ->
  `The rule engine uses short field names, a recursive descent parser and a tokenizer, all in
  pure Go stdlib:`.

### `kubectl-cf-access.mdx` (A: lede, Verification/Gotchas/File reference, `---`, historical
note; B: opener frame, `essentially`)
- The historical paragraph moved out of `## Architecture diagram` into the prescribed
  `<Aside type="caution" title="Historical since 2026-09-29">` after the frontmatter (with the
  `Aside` import added); the diagram section keeps a one-line pointer ("Retired topology, kept
  for the routing detail it documents.").
- Added the lede (what Access for SaaS does here, and the six things the guide sets up).
- `Before we begin we need this set up:` replaced by a real prerequisite list (three items, the
  kubelogin URL kept as a bare URL for fact retention).
- `PKCE essentially replaces "something you know" (shared secret) with "something you
  generated" (unique proof key).` -> `PKCE replaces a shared secret you know with a proof key you
  generate per login.`
- `#### Cloudflare Tunnel Deployment (instead of side-car)` -> `... deployment ...`.
- Added `## Verification` (the cloudflared `/ready` probe on port 50000 and the metrics Service,
  the `kubectl oidc-login setup` comparison against the kubeconfig template, the Access audit
  log, the `${EMAIL}` ClusterRoleBinding subject), `## Gotchas and lessons learned` (PKCE and the
  secret, the 5m access token with the 24h refresh, the `no_tls_verify`/`http2_origin` ingress,
  `config_src = "cloudflare"`, the k3s restart, the lack of load balancing and graceful drain
  across replicas, the `failure_threshold = 1` probe, the NFS `ReadWriteMany` log volume),
  `## File reference` (k3s config, `.kubeconfig`, the Cloudflare resources, the random secret,
  the deployment/secret/service/PVC, the sensitivity-carrying output) and `## Related docs`
  (magic-wan-interop, k3s-traefik - both link back).
- Separators removed.

### `magic-wan-interop.mdx` (A: lede, Verification/Gotchas/File reference, h2 headings; B: four
tells; C: bold Title Case headings)
- Lede added after the frontmatter (what the guide covers, prerequisites, the v4 provider note).
  The `prose-dollar: math-intentional` marker and the `LatexBlock` import are unchanged.
- Heading hygiene: every heading up one level, three bold headings de-bolded and re-cased (see
  New anchors).
- B fixed:
  - `The key information is \`mss 1350\`, which confirms ... This is invaluable for confirming
    ...` -> `\`mss 1350\` is what the source host advertises. Read against the interface MTU, it
    tells you whether the MSS clamping on the firewall or router is taking effect.`
  - `... you can ensure that not only you're managing the devices and the policies but also the
    WARP client itself.` -> `... you manage the devices, the policies and the WARP client
    itself.` (both links on that line kept)
  - `Let's use \`arch-2\` as an example as the same steps will be replicated on the other node.`
    -> `\`arch-2\` is the worked example; the same steps run on the other node.`
- Added `## Verification` (health checks, the tcpdump MSS read, the iterative `ping -M do`
  Path MTU, `traceroute -T`, the `curl icanhazip.com` egress check), `## Gotchas and lessons
  learned` (eleven bullets from the doc's own cautions: `rp_filter`, RFC 1918 prefixes, the
  single DH group, WARP Connector vs Magic WAN, double encapsulation and the excluded IPs/ports,
  Cloudflare Tunnel's ingress-only and route precedence, Virtual Networks on overlap, tunnel and
  route together, default-VNET LB origins, Spectrum always-proxied plus the hostname collision,
  the v4 provider and the private PAC worker repo), `## File reference` (the sysctl file, the
  worker files, the WARP Connector dir and iptables rules, `.tfvars`, and the Terraform resource
  groups by section) and `## Related docs` (kubectl-cf-access - which links back - and vyos-dot).

### `mongodb-wrapper-archive-migration.mdx` (A: no lede; meta: missing `File reference`)
- Lede added before `## The problem` (what the guide does, and the prerequisites: hosted
  project, connection string, `psql`).
- Added `## File reference` before `## Modules` (landing table, the foreign server/table, the
  Vault secret, the `last_id` cursor, the dump and bucket, the CLI and the
  `pg_replication_slots` pre-drain check). `## What to do about it` and the Modules table are
  untouched.

### `monitor-compose-postgres-prometheus.mdx` - **not edited**
- Skeleton complete (Verification, Gotchas, File reference). The one review item is the
  `Two jobs, two different intervals.` opener, whose second sentence carries the intervals
  themselves; the reviewer judged it a report-only item, and every rewrite moves the fact
  without gaining anything. Reported, not applied.

### `nas-bulk-data-migration.mdx` (A: pitfalls heading name; meta: missing Gotchas + File
reference)
- `## Failure modes from the migration` -> `## Gotchas and lessons learned`, old slug kept as an
  anchor. The section's content is unchanged.
- Added `## File reference` before `## Related docs` (`plan.json`, the event log, run
  snapshots, logs, the original shell scripts, `status.md`, the two repos, the three pools).

## Not applied, with reasoning

1. **`mean-sentence-ceiling` on `forgejo-primary-fleet-migration` (mean 33.5, 3221 words) and
   `forgejo-webhooks-composer-gitops` (mean 26.6, 3402 words).** Left open deliberately. The
   gate is a whole-doc metric, not a sentence-level tell: at ~96 sentences, bringing 33.5 under
   25 means splitting most of the prose, which `BRIEF.md`'s policy rules out ("Rewrite the
   offending sentence, not the paragraph", "record the reasoning") and which no regex-able tell
   can drive. Both are also the docs the parent may want to re-voice as one session (they share a
   voice and run dates, per the batch report). The prescribed verify invocations both pass
   `--no-max`, so neither is gated by this pass's verify commands; the tool still prints the
   gate line for whoever takes them on.
2. **`caddy-compose-waf` "This namespacing ensures that generated rules from the Policy Engine
   never collide with baked-in custom rules or the CRS itself."** Left in place. The reviewer
   called it a restatement of the table above it, but the table only lists ID ranges - the
   non-collision guarantee is stated here and nowhere else, so deleting it would lose a fact.
3. **`magic-wan-interop` "It carries the same functionality as Cloudflare Tunnel, with
   bidirectional support, so you can expose private services that need two-way traffic such as
   communication services."** Fixed minimally (the original read "This means that only you can
   expose ...", which contradicts the bidirectional clause it follows). The intended meaning is
   settled by the doc's own Step 7 danger block, which recommends the WARP Connector for
   bidirectional requirements; if the author meant something else, this is the one edit to
   reverse.
4. **`gh-actions-cloudflare` compatibility table uses emoji status glyphs** (pre-contract
   section not otherwise touched). Not swept: the table is a whole section, and the ASCII
   rules do not cover emoji.
5. **Bare `---` separators remain in the three pre-contract k3s manuals**
   (`k3s-arm64-cluster-ops`, `k3s-monitoring-stack`, `k3s-traefik`). The review flagged the
   separators as part of the four-doc Cloudflare gap and in `caddy-compose-waf` only, which are
   the ones removed here; the k3s separators were not flagged, so removing them would be work
   beyond the findings.
6. **New one-way link pairs.** The `Related docs` entries added here create pairs where the
   other side may not link back: `cfd-cloud-run` -> `k3s-traefik` and `vaultwarden-multi-site`,
   `caddy-compose-waf` -> `edge-caddy-on-nixos`, `magic-wan-interop` -> `vyos-dot`,
   `diagnosing-llm-reasoning-cliffs` -> `agent-memory-store` and `qwen38-agentic-tuning`. The
   ones that are mutual are `magic-wan-interop` <-> `kubectl-cf-access` (both in this batch,
   both linking the other from `Related docs`) and `kubectl-cf-access` -> `k3s-traefik`
   (`k3s-traefik` links back from its new Gotchas bullet rather than from a `Related docs`
   section, because it has none and adding one is outside its findings).

## Commit note for the parent

Stage explicitly, never `git commit -a`: this checkout carries other workers' edits
(`AGENTS.md`, `src/content/docs/reference/*`, `porting-github-actions-to-forgejo.mdx`).

Batch 1 files, in `docs/research/raw/2026-10-15-docs-review/batches/batch-1.txt` order:

```
src/content/docs/guides/10gbe-link-tuning.mdx
src/content/docs/guides/airgradient-one-esphome-local.mdx
src/content/docs/guides/arr-stack-docker-patterns.mdx
src/content/docs/guides/caddy-compose-waf.mdx
src/content/docs/guides/cfd-cloud-run.mdx
src/content/docs/guides/cliamp-wsl2-audio.mdx
src/content/docs/guides/diagnosing-llm-reasoning-cliffs.mdx
src/content/docs/guides/esphome-fleet-ssid-migration.mdx
src/content/docs/guides/extending-tf-with-api.mdx
src/content/docs/guides/forgejo-recovery-runbooks.mdx
src/content/docs/guides/gh-actions-cloudflare.mdx
src/content/docs/guides/k3s-arm64-cluster-ops.mdx
src/content/docs/guides/k3s-monitoring-stack.mdx
src/content/docs/guides/k3s-traefik.mdx
src/content/docs/guides/kubectl-cf-access.mdx
src/content/docs/guides/magic-wan-interop.mdx
src/content/docs/guides/mongodb-wrapper-archive-migration.mdx
src/content/docs/guides/nas-bulk-data-migration.mdx
```

Plus this report. `fix-2.md`-style siblings belong to the other batches.
