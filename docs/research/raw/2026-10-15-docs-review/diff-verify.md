# diff-verify - adversarial review of the 2026-10-15 prose batch

Scope: `git diff -- src/content/docs README.md AGENTS.md` (43 files, 90 hunks: 87 in
docs, 3 in README/AGENTS). Bar applied: hold-the-original-meaning, text fallbacks must
say exactly what the diagram's nodes and edges say, no new B/C tells, no out-of-brief
edits.

Verification run: `bun test tests/docs.test.ts tests/pins.test.ts` -> 1828 pass, 241 skip,
0 fail. No pin, structure, footnote or link regression from the batch. All added lines are
ASCII-clean, no ` -- ` in prose, no unescaped `$`, no new `-ize` spelling, no non-ASCII.

## Flagged hunks

src/content/docs/guides/self-host-matrix.mdx:12 - [over-scope deletion] deleted the whole `:::tip[What this covers]` box (7 numbered items naming k3s, MetalLB, Traefik, Cloudflare Tunnel, Synapse, PostgreSQL, Element Web, Synapse Admin, Prosody, Jicofo, JVB, Spectrum, LiveKit, lk-jwt-service, TURN, cert-manager, VyOS NAT/firewall, securityContext, health probes, OIDC, SOPS, image pinning) plus the "linear build-up" sentence, replaced by one sentence. A structural block is an A-axis item (report, do not fix); the box is also the author's own established pattern (`k3s-monitoring-stack`, `k3s-arm64-cluster-ops`, `caddy-compose-waf`, `k3s-traefik`, `vaultwarden-multi-site` all carry one) and nothing in the corpus tests would catch its loss. Fix: restore the box verbatim and drop only the sentence - i.e. keep `:::tip[What this covers]` through `   :::` and use `Each section includes the actual manifests, Terraform config, and router commands used in production.` as the lede sentence. (The worker reported this edit in batch-2.md line 180.)

src/content/docs/reference/composer-gitops-compose-manager.mdx:92 - [meaning] causality dropped. Before: "This is the fact that makes most hand-run compose commands fail before they start, and the reason a path that works in Composer does not exist over ssh on the target host." After: "Most hand-run compose commands fail before they start, and a path that works in Composer does not exist over ssh on the target host." The two facts are now unattached to the heading above them ("The checkout is on the router even when the containers are not"). Fix: "This is why most hand-run compose commands fail before they start, and why a path that works in Composer does not exist over ssh on the target host."

src/content/docs/reference/composer-gitops-compose-manager.mdx:141 - [meaning] dropped the rotation caveat. Before: "including the age key resolution order - a data-directory key beats every environment variable, which is the trap during a rotation." After: "including the age key resolution order, where a data-directory key beats every environment variable." The "trap" word is a sanctioned removal, but the clause it lived in carried the only pointer to when this matters. Fix: "including the age key resolution order, where a data-directory key beats every environment variable, which is what bites during a rotation."

src/content/docs/reference/self-hosted-research-stack.mdx:253 - [meaning, contradicts the doc] "securing endpoints against unauthorized internet traffic" -> "keeps the endpoints closed to the public internet". List item 2 two lines above explicitly serves public-internet requests that present `Authorization: Bearer <token>`, so "closed to the public internet" is false as written. Fix: "This dual-tier approach keeps secrets off local development machines and keeps the endpoints closed to unauthorized internet traffic."

src/content/docs/reference/self-hosted-research-stack.mdx:302 - [meaning] closing payoff sentence lost a claimed benefit. Before: "For autonomous coding agents, the investment pays off in total privacy, unmetered multi-step exploration, and access to documentation behind session barriers that external services cannot penetrate." After: "The agent gains unmetered queries and the walled tier's access to documentation behind a login, which a hosted scraper cannot reach." Privacy is dropped from the trade-offs summary even though the doc gives it its own section, and "multi-step" is dropped. Fix: "The agent gains privacy, unmetered multi-step exploration, and the walled tier's access to documentation behind a login, which a hosted scraper cannot reach."

src/content/docs/reference/self-hosted-research-stack.mdx:88 - [meaning, minor] "A self-hosted engine on existing homelab hardware delivers unmetered search capacity." -> "has no per-query quota." The replacement is narrower than the claim (a monthly or per-IP quota can exist while "no per-query quota" holds, and the preceding sentences are about monthly tier quotas). Fix: "A self-hosted engine on existing homelab hardware has unmetered search capacity."

src/content/docs/reference/self-hosted-research-stack.mdx:259 - [consistency] table header "Mitigation and defense" -> "Mitigation and defence" (and the same row's "anti-DNS-rebinding defense" -> "defence") while the heading four lines above stays `## Operational failure modes and defenses` (line 255) and the list intro stays "Defenses against silent engine degradation include:" (line 273). Mixed spelling inside one section. Fix: revert both to "defense" (the doc was already mixed before the edit, so completing the conversion would be a bulk rewrite the brief forbids).

src/content/docs/reference/knotea-self-hosted-dns.mdx:16 - [meaning] the comparison target moved. Before: "This is the big sibling of two smaller DNS setups documented elsewhere here: the [Gloryhole DoT / VyOS interop] guide ... and [Unbound + AdGuard Home on a travel router], a standalone recursive resolver for a single device class." After: "Two smaller DNS setups documented elsewhere here are close relatives: ...". The two setups are now relatives of each other rather than of knotea, and the claim that knotea is the larger descendant is gone from that sentence (the next sentence only partly restores it). Fix: "Two smaller DNS setups documented elsewhere here are close relatives of this one: ...".

src/content/docs/reference/docker-servarr-security.mdx:14 - [meaning, minor] TL;DR "The biggest wins are filesystem isolation (...), network segmentation (...), and credential rotation." -> "Start with filesystem isolation (...), network segmentation (...), and credential rotation." Turns a ranking claim (these matter most) into an ordering instruction (do these first), which the original did not assert. Fix: "The three that matter most are filesystem isolation (...), network segmentation (...), and credential rotation."

src/content/docs/reference/agent-guard-extensions.mdx:401 - [meaning, minor] "A unit test proves the logic" -> "a unit test proves only the logic". The added "only" narrows the original claim and puts two "only"s in one sentence. Fix: "A guard's liveness is a property of the deployment, not the source, and a unit test proves the logic; only a probe against the live load path proves the guard is there."

src/content/docs/reference/homebrew-fraud-detection.mdx:719 - [meaning, minor] "- **`actionOverride`**: Set to `"allow"` for monitoring mode - runs all detection and logs decisions but never blocks. Critical for safe rollout of new models or config changes." -> "... Used when rolling out a new model or config change." The criticality/safety claim is dropped and the singular "config change" no longer matches the plural case the field covers. Fix: "Required for a safe rollout of a new model or config change."

src/content/docs/reference/stripe-sync-engine.mdx:179 - [meaning, minor] "so a `comment on column` explaining the trap never reaches the model." -> "... explaining the failure never reaches the model." "The trap" is a sanctioned removal, but "the failure" has no referent in the paragraph (what fails is that the typed column reads `null` on every row). Fix: "so a `comment on column` explaining that the column reads null never reaches the model."

src/content/docs/guides/self-host-matrix.mdx:718,732 - [meaning, minor] hard requirements weakened. Line 718 "The key **must** be named `api-token`" -> "The key needs to be named `api-token`"; line 732 (inside `:::danger`) "Both secret files **must** be SOPS-encrypted before committing to git" -> "need to be SOPS-encrypted". The doc's own register is "must" elsewhere (line 1253, "rules must be in `EXTERNAL-IN`"), so this is not a consistency fix. Fix: "The key must be named `api-token` (cert-manager's Cloudflare solver requires this):" and "Both secret files must be SOPS-encrypted before committing to git:".

src/content/docs/guides/qmk-via-keymap-guide.mdx:391 - [meaning, minor] same weakening. "The keymap **must** be named `vial`:" -> "The keymap needs to be named `vial`:". Fix: "The keymap must be named `vial`:".

src/content/docs/reference/edge-caddy-on-nixos.mdx:309 - [consistency] "categorized" -> "categorised" in a numbered list whose next item is "**Rule synchronization:**" (line 310) and whose same doc already carries "Dynamic DNS record synchronization" (line 135). Fix: revert to "categorized".

src/content/docs/guides/vaultwarden-multi-site.mdx:4 - [out of brief] frontmatter `author: "Author"` -> `author: "Erfi Anugrah"`. The brief allows frontmatter only for a slop word in `description:`; this is an authorship assertion the worker cannot source. It is almost certainly the intended value (it was the only `"Author"` placeholder at HEAD; the other 138 docs already say `Erfi Anugrah`), so this is a parent decision rather than a revert - but it should not ride in silently.

## Checked and clean (not flagged)

- All 7 new `dot` text fallbacks verified against their diagram source, node by node and
  edge by edge: `cfd-cloud-run` (6 steps + VPC/firewall sentence match rules 443/7844/deny-all),
  `monitor-compose-postgres-prometheus` (3 steps match prom->exporter/proxy->app/exporter->pg),
  `postgres-corpus-entity-graph`, `self-host-matrix` x3 (all three; the only gap is the
  isolated `forward_r14` node "rule 14: eth1.60 jump TPI" in the VyOS diagram, which the
  fallback does not mention - minor omission, not a wrong branch), `singapore-weather-ha-grafana`,
  `supabase-own-postgrest`, `agent-memory-store`, `knotea-self-hosted-dns`,
  `stripe-sync-engine`, `supabase-aws-privatelink`, `supabase-data-residency`,
  `supabase-incident-resilience`, `supabase-rls-policy-cost`. No invented branch, no
  outcome attached to the wrong condition.
- README.md: `bun run build` -> "Test the corpus, build to `./dist/`, re-test the built
  output" matches `bun test tests --bail && astro build && bun run verify:docs`; `bun run
  deploy` -> "Deploy via Wrangler, then purge the zone cache" matches `wrangler deploy &&
  bun scripts/purge-cache.ts`; the `scripts/` tree fix (`new-doc.ts` and `purge-cache.ts`
  as siblings) matches the directory.
- AGENTS.md: "it warns and skips without them" matches `console.warn("purge-cache: ...")`
  in `scripts/purge-cache.ts`.
- Heading casing edits are casing-only (slugs lowercase, so no anchor moved) and product
  names were corrected to their real forms: AdGuard Home, Cloudflare Access, Cloudflare
  Spectrum, Element Web, Matrix, Synapse Admin, Google Workspace, Home Manager. Lowercase
  after "Step N:" matches the corpus majority (217 lowercase vs 57 capitalised).
- Remaining rewrites read as genuine B/C fixes with meaning held: negative-parallelism
  removals in `forgejo-primary-fleet-migration`, `glanceable-dashboards` and
  `forgejo-storage-backups-cache`; self-rating removals ("the trap", "the big win",
  "One capacity gotcha", "the one place the zombie cannot hide"); `agent-guard-extensions:144`,
  `docs-over-ssh`, `winfsp-rclone-stuck-drive-letter`, `sops-age-compose-stacks`,
  `monitor-compose-postgres-prometheus:100`, `secretctl-registry-and-coverage`,
  `media-transformation-architecture`, `self-correcting-agent-loop`, `kubectl-cf-access`.

Hunks checked: 90. Hunks flagged: 15.
