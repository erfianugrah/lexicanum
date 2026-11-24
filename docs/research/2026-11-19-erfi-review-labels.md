---
title: erfi-review blind label sheet (30 paragraphs)
date: 2026-11-19
---

# erfi-review blind label sheet

Thirty paragraphs from this corpus, in no meaningful order. For each one, mark
which (if any) of these you see, in your own words: announcement before the
content, aphorism/maxim, self-grading or self-praise, mystery tease, negative
parallelism, participle tail, rhythm triplet, broken metaphor, or "fine". Mark
a paragraph even when the fact it carries is correct - this is about sentence
shape, not truth. Do not run erfi-review or tell-review before labelling.

## P01

Do all of this before a single device moves. Afterwards, the moment a device associates and takes its reservation, the dashboard badge turns ONLINE and the Home Assistant entities return with nothing left to click.

Your marks: 

## P02

Microsoft's USB Audio Class 2.0 driver, built on its Audio Class Extensions (ACX) framework[^ms-lla], is the open-source replacement for the inbox `usbaudio2` class driver. Building it normally requires the full Windows Driver Kit - a multi-gigabyte install that ties the build to the machine that installed it. This guide builds it without the WDK, using only the WDK NuGet packages and VS Build Tools, so the build is self-contained in a single PowerShell script and runs in CI on a fresh Windows VM with no toolchain installed.

Your marks: 

## P03

Prometheus Operator and core metrics come first, then Loki and log collection, then Jaeger tracing, then Grafana with dashboards and SSO, then the Cloudflare Logpush pipeline with its custom Traefik plugin. The manifests are the ones from production.

Your marks: 

## P04

- The cache saved 158 ms (run 1) and 182 ms (run 2) of server time hosted, and 130 ms locally (derived from the first two rows); the first row includes a cache write, so this overstates the read-path saving by that write. A hit removes the two slowest upstreams, so the screen is then bounded by `inbox` plus the cache read, which costs 66-89 ms hosted against 4 ms locally.

Your marks: 

## P05

Coverage is a property of vantage points, not of rule count - so pair the rule set with a synthetic probe that exercises the real surfaces from OUTSIDE, with a real token (the probe table in [the resilience runbook](/guides/supabase-resilience-runbook/) Part 1 is exactly that), and treat the billing/status-page signals as their own channel. The dashboard's System Timesync panel is adjacent to one of these failure modes but ships collapsed with no rule attached.

Your marks: 

## P06

- A DNS challenge takes 60-120 seconds to propagate, so the first request to a new hostname hangs until the certificate is issued. Pre-warm the hostname after adding an IngressRoute ([TLS configuration](#acme-via-cloudflare-dns-challenge)).

Your marks: 

## P07

If both sites received writes during a split-brain scenario (e.g., LB flapped), you'll need to manually merge the databases. This is the fundamental limitation of the R2 dump/restore approach - there's no conflict resolution. For a password manager with a single user, this is unlikely but worth understanding.

Your marks: 

## P08

The branch is a genuinely isolated instance with no production data copied. Counting rows over REST against each project confirms it - the branch has its own ref and keys and starts empty, while the parent still has its data:

Your marks: 

## P09

The build method - using WDK NuGet packages without the full WDK, plus the toolset shim and CI setup on a Windows VM - is in [Building a USB Audio 2.0 ACX driver without the WDK](/guides/usb-audio2-acx-driver-without-wdk/).

Your marks: 

## P10

- **The remote must allow Supabase's egress, and that egress is dynamic.** Allow `0.0.0.0/0` on the Mongo side, or front it with a fixed-IP proxy and safelist only that; skip this and the first connection fails with a TLS reject while your own allowlisted machine connects fine.

Your marks: 

## P11

- **The session state lies.** `user@1000.service` reading active means systemd was never told the mount went away, not that the session is healthy. Trust `stat` and `mountpoint` on the directory, not `systemctl status`.

Your marks: 

## P12

- **RLS reads a GUC.** `auth.uid()` reads `request.jwt.claims`; set it over the wire and per-user RLS works with no PostgREST and no GoTrue. The transaction pooler leaks a bare `SET` across clients; use `set_config(..., true)` inside a transaction.

Your marks: 

## P13

Full microsegmentation (one network per service pair) is impractical - the *arr stack has complex interdependencies. The highest-value isolation is separating databases and caches from the application tier.

Your marks: 

## P14

The control plane - `api.supabase.com`, the dashboard, org and project metadata, billing - is a separate SOC 2 environment from your project, and the DPA treats support requests and account contact details as Covered Data.[^sb-soc2][^sb-dpa] Its hosting location is not documented (Vercel and Fly.io appear as hosting subprocessors).[^sb-subprocessors] Branches are separate instances with their own credentials and start without production data "to better protect your sensitive production data," but the region a branch runs in is not documented.[^sb-branching]

Your marks: 

## P15

A cross-repo work queue that coding agents can read and move, on a board that is not the git host. This page covers what the checkbox-per-plan status system was doing wrong, which self-hosted board won the comparison, how the stack is hosted, and how the agent half is wired.

Your marks: 

## P16

IBM Research's AI Attribution Toolkit, partly inspired by CRediT, generates a statement appended to a work from three questions: "How much work did the human do relative to the AI? What were the AI's contributions? Who reviewed and approved the final work?" Its own paper carries "This work was produced without AI assistance (AIA No AI 1.0)."[^ibm-aia] The toolkit also asks "Who initiated AI contributions?", where AI-initiated means "AI made proactive contributions without human request, such as auto-completed suggestions or additions".[^ibm-aia-src] That records who triggered each AI contribution, not who conceived the work. It records review, which 0rwx does not.

Your marks: 

## P17

- **The architecture wins are ratios, and they generalise.** A cached read (~10ms) is ~20x faster than the round trip; edge JWT verify (~0ms) removes a ~207ms round trip outright; Hyperdrive's pooled write (~172ms) shaves the PostgREST layer off the wire. Those relationships hold at any region pairing.

Your marks: 

## P18

The `Rows per action` and `Bytes per action` columns are all-sources totals - the idle-subtracted sum across log sources - for every row except LV01d, whose figure is `edge_logs` only and gives its all-sources total beside it. The `Where the bytes are` column names the source the figure is read from, and the prose below quotes the `edge_logs`-only counts where they differ.

Your marks: 

## P19

The Supabase blog of 2026-05-05 says: "If a client disconnects for 30 seconds and reconnects, the changes that happened during those 30 seconds are gone."[^sb-rt-pipelines] That is documented; this section is the measurement. The table `rt02_t` had RLS off and an `anon` Postgres Changes subscriber, with rows written by the service key over PostgREST at 1 per second. The socket was closed by the client with code 4000, so the server saw a clean close. This is not a network partition.

Your marks: 

## P20

- In-region Edge Function clients with a mixed load (point, range, RPC, insert, `count=exact`) took 4XL to 6,148 req/s at c=3072, a step that added 5 % for about 25 % more requests in flight (derived; one run, one step, nothing above it run), with at most 7 of 71 `authenticator` backends active in that step (14 at most in the ramp). `db_pool` 150 and 250 did not raise throughput or lower p50 there, and p95 and p99 were higher (one step each). The generator under-delivered its requested concurrency.

Your marks: 

## P21

The first bench on the production graph (215k entities, 591k mentions, 419k relations) missed the 500 ms budget badly: `search_entities` p95 1623.0 ms and `resolve_entity` p95 3522.2 ms (max 7352.6 ms, past the 5-second timeout), with `bridging` p50 945.6 ms and `cross_document` p50 881.5 ms. Three fixes:

Your marks: 

## P22

The idea is not new. Hindsight, an MIT-licensed agent memory system from Vectorize[^hindsight-readme], hit the same failure and reached for the same statistic: its tsvector backend OR-joins a long recall query, `ts_rank_cd` runs for every matched row, and queries that matched thousands of memories timed out (its source names a 60-second hang). Its fix reads `most_common_elems` to estimate each token's document frequency and keeps only the N tokens with the lowest one; on any failure to read the statistics it falls back to the first N tokens[^hindsight]. This page's version was written before finding Hindsight's, and the two differ in what happens to the common words:

Your marks: 

## P23

Five automated reviewer agents ran in parallel (electrical, PCB and fab, firmware, mechanical, tooling and docs) after rev 1 was ordered, and a judge agent checked the evidence behind each finding that affects the design. Of 17 findings, this is the one that bears on the 8 kHz goal:

Your marks: 

## P24

Navigation comes from frontmatter only. Each doc declares a `category` (one of the providers in `src/lib/taxonomy.mjs`), a `group` when that category has subgroups, and optionally `featured` with a `blurb` for a homepage card and `aliases` for old URLs. The sidebar, the homepage card grids and the redirects are generated from those fields when the config loads, and the content schema derives its enums from the same taxonomy, so an unknown category fails the build. A doc cannot invent a category; to add one, edit the taxonomy file. To rename a doc, rename the file and add the old URL to `aliases`. `bun run new` prompts for type, category and title and scaffolds the frontmatter and skeleton. The largest categories are split by subject: Supabase and Postgres has eight groups (auth, network access, database, platform services, operations and so on), homelab four, workstations three. Group ids appear in no URL, so regrouping moves no page.

Your marks: 

## P25

It was left unbuilt because the queue drained, and that turned out to be the expensive call. A new backlog of 143,000 rows appeared later, and because `FOR UPDATE SKIP LOCKED` blocks the top-N sort, every poll sorted all pending rows with an external merge on disk: 8.1 TB of temporary files on the host's NVMe in 46 days, on a drive rated for 600 TBW. The index was built then (migration 038 of the session-history store), with a predicate copied literally from the worker's query so the planner can use it. The hourly snapshot refreshes had the same disk problem at a smaller scale: at the default 16 MB `work_mem` each run spilled about 1.5 GB of sorts, fixed by `SET work_mem = '256MB'` on the refresh functions only (migration 039). A `CREATE OR REPLACE FUNCTION` resets such a per-function setting, so every later redefinition has to repeat it.

Your marks: 

## P26

The HTTP status is `200` in every state, so a GraphQL probe sends `{ __typename }` and reads the body. The lab's inventory probe sent `{ __schema }` and read `200` in all three states; it was changed on 2026-10-10, so a `graphql=200` line in an older iap-lockdown RUNLOG for a project created after 2026-06-29 means only that the endpoint answered HTTP 200. Not measured: the corrected probe inside iap-lockdown L01 and L02 themselves, and a project created before 2026-06-29 with pg_graphql on and then upgraded to 1.6.0.

Your marks: 

## P27

Two failures produced this shape. The original gate prompted for every mutating command: over 30 days it raised 3,833 prompts across 205 sessions and the user denied 4, two of them misclicks. A prompt answered yes 99.9% of the time was not catching the leaks that had needed a history rewrite (tokens in committed files, internal context in a public repo). The protection moved to scanners that read the bytes being pushed, and the prompt now covers only what a scanner cannot judge.

Your marks: 

## P28

On the identical batch: 0 new versions, 0 dead tuples, and the VACUUM afterwards removed 0 tuples and wrote 0 bytes. Every row still carried the statement's transaction id as a lock in `xmax` (1,000,000 of 1,000,000), which is a WAL record per row and a modified page per heap page: 130271034 bytes and 9346 full-page images, one per heap page (76562432 bytes / 8192). With the pages already logged this checkpoint cycle the same statement wrote 54000000 bytes, 54 per locked row. `IS DISTINCT FROM` is used over `<>` because "if both inputs are null it returns false"[^pg-comparison]: a NULL that stays NULL counts as unchanged.

Your marks: 

## P29

The server holds no session state. Each request builds a fresh server and transport with `sessionIdGenerator: undefined`, and responses are plain JSON with `enableJsonResponse: true` rather than an event stream. That is possible because the tree is immutable for the container's lifetime, which makes all seven operations idempotent reads with no ordering between them. The consequences are the ones you want from a read-only service: no session store to lose, instances behind a load balancer with no affinity, and responses a CDN can cache.

Your marks: 

## P30

3. **Catch-up by playback rate.** Within a band, e.g. `<PlaybackRate max="1.04" min="0.96"/>`, a 4% band. The actual dash.js default is more aggressive: up to 1.5x, hard-capped at 2.0x.[^dashjs-constants] While a player is stalled, dash.js holds the rate at 1.0 until the buffer is back above half the target, rather than racing ahead into another stall.[^dashjs-low-latency]

Your marks: 

