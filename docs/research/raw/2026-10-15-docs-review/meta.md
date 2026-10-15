# Meta review (repo-level) - 2026-10-15 docs review

Scope: README.md + AGENTS.md accuracy and prose; corpus-wide Diataxis audit
from headings only (139 docs, index.mdx excluded); src/content/docs/index.mdx.
Headings-only by design - prose axes B/C on the 139 docs belong to the per-doc
workers.

## Summary

- Top recurring issues:
  1. Guide skeleton gap: missing File reference / File structure - 29 of 73
     guides (25 non-historical).
  2. Reference docs without a TL;DR heading - 49 of 66; the corpus convention
     is an early "Which do I pick" section, which 55 of 66 have, so this is a
     convention, not a defect.
  3. Guide skeleton gap: missing Gotchas - 11 non-historical guides.
  4. Guide skeleton gap: missing Verification - 7 non-historical guides.
  5. One-way guide<->reference links on the same system - 2 pairs.
- Files edited: 2 (README.md, AGENTS.md). Findings left for the author: 4
  (section 1).
- Misfiled candidates: 2 (section 2, below the table). No reference/ doc
  carries a task sequence; no guide/ doc is a pure concept doc besides the two
  flagged.

## 1. README.md and AGENTS.md

Verified accurate against the repo (no finding): `bun run new` prompts
(type/category/title, scripts/new-doc.ts); the frontmatter claims (schema enum
in src/content.config.ts, generator throw on missing/unknown category/group,
alias collision, watcher restart on frontmatter hash change in
astro.config.mjs); `overrides.better-sqlite3 = 13.0.3` and
`@beoe/sqlitecache` asking for `^11.9.1` (bun.lock); the gfm/remark-math/
rehype-katex and `rehypeFootnoteLabelToReferences` claims (astro.config.mjs);
`mathRiskLines()` at tests/lib/mdx.ts:289; `LLM_MARKERS` at :339,
`REJECTED_MARKERS` at :502; the math-intentional marker in
guides/magic-wan-interop.mdx; all five test files' described checks
(docs/pins/identifiers/links/harness, tests/lib/mdx.test.ts); the
`~/.config/lexicanum/banned-identifiers` default (exists); `.prose-lint.json`
and `.prose-terms-baseline.json` (exist); the cited exemplar and case-study
docs (all exist); `src/components/TopicCards.astro` importing TAXONOMY.

### Fixed

- README.md commands table: `bun run build` row said "Run all doc tests, then
  build to `./dist/`" - the real script is `bun test tests --bail && astro
  build && bun run verify:docs` (re-tests the built output with
  CHECK_BUILT=1). Row now: "Test the corpus, build to `./dist/`, re-test the
  built output".
- README.md commands table: `bun run deploy` row said "Deploy via Wrangler" -
  the real script is `wrangler deploy && bun scripts/purge-cache.ts`. Row now:
  "Deploy via Wrangler, then purge the zone cache".
- README.md structure tree listed only `scripts/new-doc.ts`; added
  `purge-cache.ts`. (`scripts/set-lab-pin.sh` is dev tooling, left out of the
  curated tree.)
- AGENTS.md: "the purge ... skips silently without them" - scripts/
  purge-cache.ts prints a console.warn ("skipping purge") before exiting 0.
  Now: "it warns and skips without them".

### Left for the author (report only)

- AGENTS.md, "PUSHING TO MAIN ALSO DEPLOYS": the cache-purge job's condition is
  `always() && needs.build-and-deploy.result == 'success' && (refs/heads/main
  || workflow_dispatch)`, not `if: refs/heads/main`; and there is a second
  inline "Purge zone cache" step inside `build-and-deploy` (using
  CLOUDFLARE_PURGE_TOKEN/WRANGLER_TOKEN) in addition to the job (which uses
  CLOUDFLARE_CACHE_PURGE_TOKEN). The doc names only one purge mechanism.
  deploy.yml:24-40, 120-148.
- AGENTS.md, "Verify before done": "scripts/ holds tooling only (new-doc.ts,
  the scaffolder)" - the parenthetical omits purge-cache.ts and
  set-lab-pin.sh. "Tooling only" is still true.
- No axis B/C findings in README.md or AGENTS.md that are not the author's own
  voice (AGENTS.md's aphorisms - "a sentence that reads better without them
  is a worse sentence" - read as authored, not generated; REJECTED_MARKERS
  territory). index.mdx is also clean (section 3).

## 2. Corpus-wide Diataxis audit (headings only)

Legend: missing-section column - guides: V = Verification, G = Gotchas,
F = File reference; reference: T = TL;DR, P = which-to-pick/decision section.
"historical aside" = carries a Historical/Out of date/Superseded caution,
where skeleton gaps are frozen by the Conformance section and are not
actionable. "no Part/Step labels" = task sequence present but unlabelled
(numbered, Runbook N, Layer N, Approach X, imperative H2s); that is an
established corpus variant, not a gap.

| guides/10gbe-link-tuning.mdx | G | F | - | - |
| guides/airgradient-one-esphome-local.mdx | G | F | - | - |
| guides/arr-stack-docker-patterns.mdx | G | F | - | - |
| guides/caddy-compose-waf.mdx | G | V G | - | no Part/Step labels, historical aside |
| guides/cfd-cloud-run.mdx | G | V G F | - | no Part/Step labels |
| guides/cliamp-wsl2-audio.mdx | G | F | - | no Part/Step labels |
| guides/diagnosing-llm-reasoning-cliffs.mdx | G | F | - | - |
| guides/esphome-fleet-ssid-migration.mdx | G | F | - | - |
| guides/extending-tf-with-api.mdx | G | V G F | - | no Part/Step labels |
| guides/forgejo-primary-fleet-migration.mdx | G | - | - | - |
| guides/forgejo-recovery-runbooks.mdx | G | - | - | - |
| guides/forgejo-webhooks-composer-gitops.mdx | G | - | - | - |
| guides/gh-actions-cloudflare.mdx | G | V G F | - | - |
| guides/k3s-arm64-cluster-ops.mdx | G | G | - | historical aside |
| guides/k3s-monitoring-stack.mdx | G | G | - | historical aside |
| guides/k3s-traefik.mdx | G | G | - | historical aside |
| guides/kubectl-cf-access.mdx | G | V G F | - | - |
| guides/magic-wan-interop.mdx | G | V G F | - | - |
| guides/mongodb-wrapper-archive-migration.mdx | G | F | - | no Part/Step labels |
| guides/monitor-compose-postgres-prometheus.mdx | G | - | - | - |
| guides/nas-bulk-data-migration.mdx | G | G F | - | no Part/Step labels |
| guides/nix-steam-os.mdx | G | V G F | - | - |
| guides/openwrt-bridged-ap.mdx | G | F | - | - |
| guides/pg-analyser-bench-methodology.mdx | G | - | - | - |
| guides/porting-github-actions-to-forgejo.mdx | G | - | - | - |
| guides/postgres-corpus-entity-graph.mdx | G | G F | - | - |
| guides/qmk-via-keymap-guide.mdx | G | G F | - | - |
| guides/secretctl-registry-and-coverage.mdx | G | - | - | - |
| guides/secretctl-rotation.mdx | G | - | - | - |
| guides/self-host-matrix.mdx | G | G | - | - |
| guides/singapore-weather-ha-grafana.mdx | G | - | - | - |
| guides/sks8300-openwrt.mdx | G | F | - | - |
| guides/slskd-wireguard-port-forward.mdx | G | F | - | historical aside |
| guides/sops-age-compose-stacks.mdx | G | - | - | - |
| guides/supabase-auth-mfa-trusted-device-and-impersonation-audit.mdx | G | - | - | - |
| guides/supabase-aws-privatelink-tofu.mdx | G | - | - | - |
| guides/supabase-branch-detach-git-link.mdx | G | G F | - | - |
| guides/supabase-edge-function-bff-fanout.mdx | G | - | - | - |
| guides/supabase-grafana-monitoring.mdx | G | - | - | - |
| guides/supabase-iap-data-api.mdx | G | - | - | - |
| guides/supabase-management-api-logs-endpoint.mdx | G | V G F | - | no Part/Step labels, historical aside |
| guides/supabase-org-consolidation.mdx | G | F | - | - |
| guides/supabase-own-postgrest.mdx | G | - | - | - |
| guides/supabase-per-project-cost-attribution.mdx | G | F | - | no Part/Step labels |
| guides/supabase-platform-management-api.mdx | G | - | - | - |
| guides/supabase-postgres-major-upgrade-e2e.mdx | G | - | - | - |
| guides/supabase-preview-branch-compute.mdx | G | F | - | no Part/Step labels |
| guides/supabase-region-migration-e2e.mdx | G | - | - | - |
| guides/supabase-resilience-runbook.mdx | G | - | - | - |
| guides/supabase-shared-tenancy.mdx | G | F | - | - |
| guides/supabase-tenant-consolidation.mdx | G | - | - | - |
| guides/supabase-tenant-promotion.mdx | G | - | - | - |
| guides/unbound-agh-mt3000.mdx | G | V G F | - | - |
| guides/vaultwarden-multi-site.mdx | G | F | - | historical aside |
| guides/vyos-dot.mdx | G | G F | - | historical aside |
| guides/windows-build-vm-forgejo-ci.mdx | G | - | - | - |
| guides/windows-smb-credentials-nixos-samba.mdx | G | F | - | - |
| guides/winfsp-rclone-stuck-drive-letter.mdx | G | F | - | - |
| guides/wsl2-disk-reclaim.mdx | G | F | - | - |
| guides/wsl2-run-user-docker-desktop.mdx | G | - | - | - |
| reference/agent-guard-extensions.mdx | R | P | - | - |
| reference/agent-memory-store.mdx | R | - | - | - |
| reference/agent-secret-guard.mdx | R | - | - | - |
| reference/appdata-tiering-zfs.mdx | R | T | - | - |
| reference/caching.mdx | R | T | - | - |
| reference/choosing-a-secrets-backend.mdx | R | T | - | - |
| reference/cloudflare-supabase-architecture.mdx | R | T | - | - |
| reference/composer-gitops-compose-manager.mdx | R | - | - | - |
| reference/declarative-homelab-backups.mdx | R | T | - | - |
| reference/docker-servarr-security.mdx | R | T | - | - |
| reference/docs-over-ssh.mdx | R | - | - | - |
| reference/drawbridge-docker-socket-proxy.mdx | R | T | - | - |
| reference/edge-caddy-on-nixos.mdx | R | - | - | - |
| reference/flint2-vap-durability.mdx | R | T P | - | - |
| reference/forgejo-actions-runner.mdx | R | - | - | - |
| reference/forgejo-releases-and-registry.mdx | R | - | - | - |
| reference/forgejo-storage-backups-cache.mdx | R | T | - | - |
| reference/glanceable-dashboards-environmental-telemetry.mdx | R | T | - | - |
| reference/home-iot-network.mdx | R | T | - | - |
| reference/homebrew-fraud-detection.mdx | R | T | - | - |
| reference/kanban-board-for-coding-agents.mdx | R | T | - | - |
| reference/knotea-self-hosted-dns.mdx | R | T | - | - |
| reference/llmc-single-gpu-stack.mdx | R | - | - | - |
| reference/local-model-bench.mdx | R | T | - | - |
| reference/media-player-configs.mdx | R | T | - | - |
| reference/media-transformation-architecture.mdx | R | T P | - | - |
| reference/multigres-failover.mdx | R | T P | - | - |
| reference/nixos-fleet.mdx | R | T P | - | - |
| reference/nixos-router-network-design.mdx | R | - | - | - |
| reference/openaq-pm25-home-assistant.mdx | R | T P | - | - |
| reference/pbkdf2-supabase-auth-migration.mdx | R | T | - | - |
| reference/pgmig-logical-replication-migrator.mdx | R | T | - | - |
| reference/postgres-entity-graphs.mdx | R | T | - | - |
| reference/postgres-redundant-writes.mdx | R | T | - | - |
| reference/print-ready-graphics.mdx | R | T P | - | - |
| reference/qwen38-agentic-tuning.mdx | R | T | - | - |
| reference/rls-without-supabase-auth.mdx | R | T | - | - |
| reference/secretctl.mdx | R | T | - | - |
| reference/self-correcting-agent-loop.mdx | R | - | - | - |
| reference/self-hosted-forgejo-router.mdx | R | - | - | - |
| reference/self-hosted-monitoring-topology.mdx | R | - | - | - |
| reference/self-hosted-research-stack.mdx | R | P | - | - |
| reference/slskarr-soulseek-lidarr.mdx | R | T | - | - |
| reference/stripe-sync-engine.mdx | R | - | - | - |
| reference/supabase-audit-trail-integrity.mdx | R | T P | - | - |
| reference/supabase-auth-end-to-end.mdx | R | T | - | - |
| reference/supabase-auth-providers.mdx | R | T | - | - |
| reference/supabase-auth-users-locks.mdx | R | T | - | - |
| reference/supabase-aws-privatelink.mdx | R | T | - | - |
| reference/supabase-branching-two-projects-one-repo.mdx | R | T | - | - |
| reference/supabase-cli-schema-diff.mdx | R | T | - | - |
| reference/supabase-client-keyed-objects.mdx | R | T | - | - |
| reference/supabase-compute-disk.mdx | R | - | - | - |
| reference/supabase-data-residency.mdx | R | T | - | - |
| reference/supabase-data-surface-lockdown.mdx | R | T | - | - |
| reference/supabase-dr-tiers.mdx | R | T | - | - |
| reference/supabase-edge-function-limits.mdx | R | T | - | - |
| reference/supabase-image-transformations-billing.mdx | R | T | - | - |
| reference/supabase-incident-resilience.mdx | R | T | - | - |
| reference/supabase-jit-database-access.mdx | R | T | - | - |
| reference/supabase-logs-volume.mdx | R | T | - | - |
| reference/supabase-multi-tenant-placement.mdx | R | T | - | - |
| reference/supabase-observability-surface.mdx | R | T | - | - |
| reference/supabase-orioledb.mdx | R | T | - | - |
| reference/supabase-pipelines.mdx | R | T | - | - |
| reference/supabase-platform-operation-cost.mdx | R | T | - | - |
| reference/supabase-read-replicas.mdx | R | T | - | - |
| reference/supabase-realtime-surface.mdx | R | T | - | - |
| reference/supabase-rls-policy-cost.mdx | R | T | - | - |
| reference/supabase-self-hosted-defaults.mdx | R | T | - | - |
| reference/supabase-server-auth-modes.mdx | R | T | - | - |
| reference/supabase-static-hosting.mdx | R | T | - | - |
| reference/supabase-storage-large-objects.mdx | R | T | - | - |
| reference/supabase-storage-surface.mdx | R | T | - | - |
| reference/supabase-wrapper-delete-scope.mdx | R | T P | - | - |
| reference/tailscale-homelab.mdx | R | T P | - | - |
| reference/vfctl-gpu-curve-tool.mdx | R | P | - | - |
| reference/windows-drive-letter-failures.mdx | R | T | - | - |
| reference/zfs-on-nixos.mdx | R | T | - | - |

### Misfiled candidates

- guides/supabase-management-api-logs-endpoint.mdx - reference shaped (full
  query / converting queries / "Traps, each measured" / Evidence / Modules;
  measured API behaviour, not a task sequence). It also carries an "Out of
  date since 2026-09-23" aside, so a move would land in a frozen doc. Flag for
  the author: reference/ would fit the content shape.
- guides/arr-stack-docker-patterns.mdx - a catalog of two self-contained
  patterns (Problem / Pattern / Compose block / Verification per pattern).
  Borderline: each pattern is a doable task, so guides/ is defensible; a
  reference would fit the "which pattern do I use" shape. No other guide/ doc
  is reference-shaped.

### Heading case

No sentence-case violations in any H2/H3 (checked against a proper-noun
allowlist; all mid-heading capitals are product names - Cache Rules, Edge
Functions, Supabase plan tiers, Auth, etc.). One Americanism in a heading:
reference/caching.mdx:125 "Default behavior" (should read "Default behaviour";
heading text, so not fixed - that change belongs to the doc's worker).

### Guide/reference pairs that do not link each other

- guides/porting-github-actions-to-forgejo <-> reference/forgejo-actions-runner
  - the reference names the guide twice (lede + Related docs); the guide has
  zero mention of the runner reference. The runner's labels are what the
  guide's `runs-on:` step depends on; a named link from the guide to the
  reference is missing.
- guides/supabase-edge-function-bff-fanout <-> reference/supabase-edge-function-limits
  - the guide links the reference three times; the reference has zero mention
  of the guide. The reference is the "how it works" half of the same system.
- (Not a defect: reference/secretctl links guides/secretctl-rotation, its
  canonical pair; guides/secretctl-registry-and-coverage is an adjacent task
  and links back to the reference itself.)

## 3. src/content/docs/index.mdx

No findings. Lede is plain, no axis B tells, ASCII punctuation, sentence case.
Facts check out: "Guides are task-sequenced how-tos; reference docs explain
how a system works and which option to pick" matches AGENTS.md; the Edit-link
claim matches the Starlight `editLink` config (GitHub source); the
description's topic list (networking, Kubernetes, Cloudflare, Supabase,
self-hosting, observability) matches TAXONOMY. No edits made.
