# Entity Graphs Reference Public Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the public-facing entity-graphs reference so it retains every measured detail and caveat while removing internal lab-status prose, private paths, operational teardown notes and audience-confusing implementation chatter.

**Architecture:** Keep this as a single-doc editorial change. The document remains an explanation-led reference: lead with the design decision, preserve measurement provenance, separate measured behaviour from documented claims, and move lifecycle or reproduction detail into a reader-appropriate reproducibility section. Do not delete numbers, dates, environments, failed probes or unresolved questions; change their placement and framing.

**Tech Stack:** Astro, Starlight, MDX, GFM footnotes, Bun test, Astro build.

---

## Scope and invariants

**Primary file:**

- Modify: `/home/erfi/lexicanum/src/content/docs/reference/postgres-entity-graphs.mdx`

**Verification files:**

- Inspect: `/home/erfi/lexicanum/tests/docs.test.ts`
- Inspect: `/home/erfi/lexicanum/tests/pins.test.ts`
- Run from: `/home/erfi/lexicanum`

Preserve these facts in the final document, even if their section or sentence changes:

- Seven public-domain US federal documents.
- 1521 citation entities, 10016 mentions and 14233 edges.
- Measurement environment: `ap-southeast-1`, Postgres 17.6, medium compute, 2 vCPU / 4 GB.
- Measurement dates 2026-08-10 and 2026-08-11.
- Query latency method: `EXPLAIN ANALYZE` execution time, cold first run discarded, database work rather than round-trip time.
- 78 available extensions and exact absence of `age`, `agensgraph`, `apache_age` and `sqlg`.
- `pgrouting` 3.4.1, 209 functions, and the listed algorithm measurements.
- Indexed depth-3 CTE: 0.22 ms versus 167.59 ms unindexed, 602 ms index build.
- Concurrent traversal: concurrency 1, 4, 16 and 64; p50 0.3-0.7 ms, p95 2.9-3.6 ms, 0 errors in 85 queries; pgrouting remains single-query data.
- SQL/PGQ committed for the PG19 cycle, with the documented rewriter/security-definer caveats.
- PDF extraction runtime table and its exact fixture byte values, HTTP statuses and page counts.
- Worker failure attribution to memory, not CPU, and the 128 MB per-isolate limit.
- Worker `Date.now()` timing caveat and 0 ms observed values.
- Storage response-header finding.
- Text/source ratios 0.048 to 1.0885, aggregate 0.7633, TOAST 0.3965.
- Person/org extraction: 561 persons, 2284 organizations, 24-row sample, truncated names, line-break splits and sentence over-capture; explicitly noisy and candidate-generation only.
- Scanned-PDF finding: 0.5 chars/page for the image-only NARA scan versus 2710-3242 for born-digital references; approximately 270 chars/page routes to OCR.
- OCR is unavailable in-database in the measured environment because `plpython3u` was absent; this is an external pipeline step.
- Maximum single-project disk size was not discoverable through the Management API; the three billing/addons endpoints and throughput-versus-size distinction stay explicit, as does the 88% disk-full observation if it is still supported by the current evidence table.
- Vector-index recall was not measured because there was no real embedding model.
- The working example URL may be offline because it runs on disposable infrastructure.

Remove from the public article, or replace with reader-facing wording:

- `Resumed 2026-08-11` and other session-state language.
- Private filesystem paths such as `~/work/supabase-lab/...`.
- `make up`, `make destroy`, tmux/session details and internal rebuild timings unless they are moved into a clearly labeled public reproduction section with a public repository link.
- Billing language and internal project lifecycle decisions.
- Cloudflare-side deployment state that is not needed to understand or reproduce the design.
- Internal labels such as `Track B1`, `Track D`, `G08`, `G09`, `G10`, `RUNLOG`, loop/judge language and machine-reboot history.
- Claims that the live project is currently online when the measured state is offline.

Do not alter the experiment repo or deploy infrastructure in this plan.

---

### Task 1: Map the existing document into reader-facing sections

**Files:**
- Read: `/home/erfi/lexicanum/src/content/docs/reference/postgres-entity-graphs.mdx`

- [ ] **Step 1: Inventory every measured claim before editing**

Create a temporary checklist outside the repository or use the scope list above. Mark each occurrence in the document's lede, TL;DR, topology, traversal sections, extension catalogue, extraction sections, reading-the-numbers section and evidence table. Do not rewrite from memory; use the current file as the source.

- [ ] **Step 2: Define the public section boundaries**

Keep the existing section anchors where possible. The final shape should be:

1. Lede: what the design answers and the current availability caveat for the demo.
2. Provenance: environment, dates, latency method and measured-vs-documented rule.
3. TL;DR: design conclusions and the noisy editorial extractor caveat.
4. Topology and traversal choice.
5. Extension catalogue and SQL/PGQ decision.
6. Extraction runtime ceilings and OCR boundary.
7. Corpus sizing and storage limits.
8. Reading the numbers.
9. Evidence: measured versus documented rows, including unresolved questions.
10. Reproduction: what a reader can reproduce from the published claims and what requires disposable infrastructure; no private path or internal command.

- [ ] **Step 3: Check anchor dependencies before changing headings**

Run:

```bash
cd /home/erfi/lexicanum
rg -n "postgres-entity-graphs|entity-graphs|#topology|#evidence|#reading-the-numbers" src tests
```

Expected: identify any internal links before changing heading text. Keep existing heading slugs unless a heading is genuinely improved and no link depends on it.

---

### Task 2: Rewrite the public status and provenance prose without dropping details

**Files:**
- Modify: `/home/erfi/lexicanum/src/content/docs/reference/postgres-entity-graphs.mdx:8-75`

- [ ] **Step 1: Replace the lede with availability plus design scope**

Use this shape, adapting only line wrapping and surrounding paragraph flow:

```md
The [working example](https://pggraph.erfi.dev) may be offline because it runs
on disposable infrastructure. The measurements below remain the reference for
the design: seven public-domain US federal documents turned into 1521 citation
entities, 10016 mentions and 14233 edges, with traversal, shortest path,
connected components and byte-exact provenance. No graph database anywhere in
it.
```

Follow it with the existing explanation of graph questions versus graph products. Do not mention the private lab path, project billing, session teardown or internal deployment state.

- [ ] **Step 2: Keep full provenance in one compact paragraph**

Preserve all of these exact facts in the provenance paragraph: disposable project, `ap-southeast-1`, Postgres 17.6, medium compute, 2 vCPU / 4 GB, 2026-08-10 and 2026-08-11, `EXPLAIN ANALYZE` execution time, cold first run discarded, database work rather than round trip, and the floor caveat for real deployments.

Use `disposable project` or `throwaway project` consistently with the rest of the public corpus. Do not call it "the current project" because it has been destroyed.

- [ ] **Step 3: Turn the status block into a durable reader caveat**

Do not retain an `Aside` titled `Status` with session language. Put the editorial extractor finding in the TL;DR or an extraction subsection:

```md
- **Editorial extraction is candidate generation.** A live extraction produced
  561 persons and 2284 organizations. A 24-row review found truncated names,
  labels split at line breaks and occasional sentence-level over-captures. The
  result is not a production named-entity recognizer.
```

Retain the exact counts and defects. The sentence must say this is a measured finding, not a quality claim.

- [ ] **Step 4: Preserve unresolved measurements without calling them session work items**

State them in the extraction/corpus-sizing sections and evidence table:

- OCR is an external step because `plpython3u` was absent in the measured environment.
- The Management API did not expose a maximum disk size for one project; include the endpoint probe details already in the evidence table.
- Vector-index recall was not measured because no real embedding model was used.

Use "not measured" or "not discoverable". Do not use "still open", "resumed", "next", "backlog" or internal track names.

---

### Task 3: Reorganize detailed findings while preserving the evidence table

**Files:**
- Modify: `/home/erfi/lexicanum/src/content/docs/reference/postgres-entity-graphs.mdx:150-end`

- [ ] **Step 1: Keep the extension and traversal measurements in their current sections**

Do not shorten the algorithm table. Preserve the measured values for recursive CTE, Dijkstra, connected components, articulation points and bridges. Keep the distinction between bounded CTE neighbourhood expansion and global pgrouting algorithms.

- [ ] **Step 2: Make the extraction section reader-oriented**

Order the section as:

1. Why parsing/OCR runs outside the database.
2. Exact runtime ceiling table with all fixture bytes, status values and page counts.
3. Memory attribution and 128 MB limit.
4. `Date.now()` caveat.
5. Scanned-PDF detection threshold and OCR boundary.
6. Editorial person/organization extractor quality finding.
7. Vector recall limitation.

Use paragraphs that explain what the number means, then retain the existing tables and caveats. Do not introduce a new production recommendation beyond the measured candidate-generation/external-OCR boundary.

- [ ] **Step 3: Preserve corpus-sizing details in a stable section**

Keep the exact extracted/source ratios, aggregate ratio, TOAST ratio, PDF byte caveat, disk probe result and the 88% disk-full observation. Explain that the Management API did not reveal a maximum disk-size field, so the experiment does not claim a provider ceiling.

- [ ] **Step 4: Rewrite the evidence table only for audience and consistency**

Keep the `Claim | How it was checked` structure. For each row:

- Keep measured/documented/not-discoverable/not-measured labels.
- Keep dates, fixture values, counts, statuses and commands or query descriptions that are meaningful to a reader.
- Replace internal run labels with the actual test description.
- Remove private paths, `RUNLOG`, loop/judge references and lifecycle details.
- Keep external links inline where the table currently uses them; do not create a second Sources section.

- [ ] **Step 5: Add a public reproduction section only if it can be truthful**

If the article already has a reproduction section, rewrite it to describe the fixed corpus, schema, query set and measurement method without private paths or commands. If no public repository or reproducible command is linked from the article, do not invent one and do not claim one-command rebuildability. State that the figures are measurements from the described disposable setup and that the evidence table identifies how each was checked.

---

### Task 4: Update pins only if the public wording needs regression protection

**Files:**
- Modify: `/home/erfi/lexicanum/tests/pins.test.ts` only if needed

- [ ] **Step 1: Inspect whether this document already has pins**

Run:

```bash
cd /home/erfi/lexicanum
rg -n "POSTGRES|entity-graphs|postgres-entity" tests/pins.test.ts
```

Expected: no existing pin for `reference/postgres-entity-graphs` unless another revision added one after this plan.

- [ ] **Step 2: Add pins for durable corrections, not every number**

If the doc has no existing pin, add one only for the public-facing boundaries most likely to regress:

```ts
{
  doc: "reference/postgres-entity-graphs",
  mustContain: [
    "The [working example](https://pggraph.erfi.dev)",
    "561 persons and 2284 organizations",
    "not a production named-entity recognizer",
    "not discoverable via the Management API",
    "not measured",
  ],
  mustNotContain: [
    "~/work/supabase-lab",
    "make up rebuilds",
    "the project bills",
    "Resumed 2026-08-11",
    "Cloudflare-side state",
  ],
}
```

Use the exact final wording if it differs. Do not pin transient status such as "currently offline" if the demo may later be brought back.

- [ ] **Step 3: Add no new test when generic checks already cover the change**

The editorial change does not add runtime logic. Do not create a new test file. The existing MDX, citation, structure, machine-written phrasing, built-page and pin checks are sufficient.

---

### Task 5: Verify the public document and commit the cleanup

**Files:**
- Verify: `/home/erfi/lexicanum/src/content/docs/reference/postgres-entity-graphs.mdx`
- Verify: `/home/erfi/lexicanum/tests/pins.test.ts`

- [ ] **Step 1: Search for internal leakage and lost details**

Run:

```bash
cd /home/erfi/lexicanum
rg -n -i "Resumed|~/work|supabase-lab|make up|make destroy|bills while|Cloudflare-side|RUNLOG|Track B|Track D|G08|G09|G10|tmux|judge|reboot" src/content/docs/reference/postgres-entity-graphs.mdx
```

Expected: no matches.

Then check the retained facts:

```bash
rg -n "1521|10016|14233|17\.6|ap-southeast-1|2026-08-10|2026-08-11|561|2284|0\.22|167\.59|602|0\.048|1\.0885|0\.7633|0\.3965|2504695|14034445|128 MB|270 chars|88%|not measured|not discoverable" src/content/docs/reference/postgres-entity-graphs.mdx
```

Expected: every required value has at least one match in the public document.

- [ ] **Step 2: Run the full documentation build**

Run:

```bash
bun run build
```

Expected: exit 0, all document tests pass, no footnote or built-page failures.

- [ ] **Step 3: Inspect the final diff for detail deletion**

Run:

```bash
git diff --check
git diff --stat
git diff -- src/content/docs/reference/postgres-entity-graphs.mdx tests/pins.test.ts
```

Expected: only the intended reference doc and optional pin changes are present; no measured number, date, URL or caveat disappears without an explicit replacement.

- [ ] **Step 4: Commit the editorial cleanup**

```bash
git add src/content/docs/reference/postgres-entity-graphs.mdx tests/pins.test.ts
git commit -m "docs: clean up entity graph reference for public readers"
```

Expected: commit succeeds using the user's configured identity and contains no AI attribution.

---

## Self-review checklist

- [ ] No internal path, experiment track, session state, billing note or teardown command remains in the public doc.
- [ ] The demo URL remains, with availability phrased as optional/disposable rather than as a promise of uptime.
- [ ] Every measured count, latency, date, environment, status code, ratio and caveat listed under Scope and invariants remains in the final document.
- [ ] The person/organization result is described as noisy candidate generation, not as a production-quality extractor.
- [ ] OCR, disk ceiling and vector recall are described as bounded findings, not roadmap promises or private internal work items.
- [ ] Evidence still separates measured, documented, not discoverable and not measured.
- [ ] `bun run build` passes before completion.
