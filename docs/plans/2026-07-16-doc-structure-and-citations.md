# Doc structure + citation system

Status: PILOT DONE (CF+Supabase doc) - awaiting review before repo-wide rollout.
Decisions taken: IEEE-numbered via footnotes; sentence-case; AUTHORING.md + memory
(pending); pilot first.
Date: 2026-07-16
Scope: lexicanum docs repo (Astro Starlight, MDX). 24 docs: 6 reference, 18 guides.

## Goal

1. Codify how a *reference* doc is structured vs how a *guide* is structured -
   grounded in the patterns already used well in this repo, not generic advice.
2. Replace the ad-hoc `## Sources` / `(more)` link dump with inline numbered
   citations at each point + a numbered reference list at the bottom. Repo-wide.
3. Fix the CF+Supabase doc as the pilot: "Data residency and compliance" prose wall
   into tables; convert its Sources section to the new citation system.

## Research findings (2026-07-16)

### Diataxis (diataxis.fr)

Four doc types on two axes (action vs cognition; study vs work):
- tutorial   = action + study  ("teach me")
- how-to     = action + work   ("how do I X")
- reference  = cognition + work ("what is X") - austere, neutral, NO opinion,
  "boring and unmemorable", lists + tables, structured like the machinery
- explanation = cognition + study ("why X") - discursive, permits opinion +
  perspective, "something you could read in the bath"

KEY REFRAME: this repo's `reference/` docs are NOT pure Diataxis reference. They
are explanation-LED architecture docs (recommendations, TL;DRs, "which to pick",
narrative, measured-not-asserted callouts) BLENDED with reference tables and a
decision payoff. That blend is deliberate and good. The system codifies the blend;
it does not force a dogmatic Diataxis split. Folder name `reference/` stays; the
type is "architecture reference" = explanation + reference tables + decision guide.

### Citation style: IEEE numbered, not APA

Source: BCcampus Technical Writing Essentials 5.5; APA Style guidelines.
- APA = author-date `(Cloudflare, n.d.)`, alphabetical list. For SOCIAL SCIENCES.
  Fails here: ~42 Cloudflare/Supabase pages all collapse to `(Cloudflare, n.d.-a
  .. -z)`. Unreadable, unmaintainable.
- IEEE = `[n]` numbered inline, numbered in order of first appearance, each source
  keeps its number for the whole doc, numbered reference list at the end with
  working URLs. THE STANDARD FOR ENGINEERING / COMPUTER SCIENCE.
- IEEE maps exactly onto GFM footnotes (already rendering in this build) AND onto
  the "inline at each point + list at bottom" ask.

RECOMMENDATION: IEEE-numbered citations via GFM footnotes.
- Inline: `Hyperdrive caches deterministic reads[^hd-cache].` -> renders superscript
  number, links down + back.
- Entry (web-source format, IEEE-flavored, clean + retrievable):
  `[^hd-cache]: Cloudflare, "Query caching," Cloudflare Docs. https://developers.cloudflare.com/hyperdrive/configuration/query-caching/`
- Relabel auto "Footnotes" heading to "References" via Starlight i18n override.
- If the APA *look* is preferred, keep the footnote mechanism + appearance order
  but format each entry APA-style: `Cloudflare. (n.d.). Query caching. Cloudflare
  Docs. URL`. (Ordering stays by-appearance, not alphabetical - the pragmatic call.)

## What's already done well (codify these)

From cloudflare-supabase-architecture (strongest), media-transformation,
homebrew-fraud-detection, supabase-multitenant, and the k3s/vaultwarden guides:

- Rich self-summarizing `description` frontmatter.
- One-sentence lede: "what this is / who it's for."
- Measurement-provenance paragraph: exactly how numbers were obtained (rig, region,
  date) and an explicit "measured vs asserted" separation. (cf-supabase)
- Per-topic TL;DR bullets. (cf-supabase)
- Topology / architecture diagram up front (graphviz ```dot fences). (all strong refs)
- Early decision/payoff table ("Which path to use"). (cf-supabase)
- Data tables with median/p95/notes; tier tables with latency + memory columns.
- Aside/Callout components (Note / Caution) for gotchas + graceful-degradation notes.
- "Reading the numbers": what is setup-specific vs what generalizes. (cf-supabase)
- Decision-guide diagram as the closing payoff. (cf-supabase)
- Reproducing section: how to re-run the benchmark. (cf-supabase)
- Evidence tables with a "How it was checked" column + a "Still design-only (not yet
  tested)" vs "Verified / tested" split. (supabase-multitenant)
- Links to the source repo(s) up front. (media-transformation, homebrew)
- Guides: "Architecture Overview" + "Component Versions" up front; numbered Parts
  each independently verifiable; "Verification" section; named "Gotchas and Lessons
  Learned" (each a mini-postmortem); "File Reference" / "File Structure" map.

Gaps to fix: (1) heading casing drifts Title vs sentence; (2) citations unstructured
(1/24 docs has Sources); (3) data-residency prose that should be tabular (a lapse
from the doc's own table-heavy norm); (4) ending-section naming varies (Sources /
File Reference / Gotchas / See also).

## Environment facts (verified)

- `gfm: true` in astro.config.mjs unified() -> GFM footnotes render. Confirmed
  `data-footnotes` in built HTML (dist/guides/magic-wan-interop).
- `remark-math` + `rehype-katex` ON -> literal `$` in prose must be `\$` (cause of
  the egress-line bug fixed earlier this session).
- Sidebar autogenerates from directory: `guides/` and `reference/`.

## Part 1 - Doc taxonomy + skeletons (codified)

ARCHITECTURE REFERENCE (`reference/`) = explanation-led + reference tables + payoff:
- frontmatter (title sentence-case, rich description, author)
- Lede (what this is, who it's for)
- Provenance note (if it has measurements: rig/region/date, measured-vs-asserted)
- TL;DR bullets
- Topology / architecture diagram
- Early decision/payoff table ("which do I pick")
- Body sections (concept-ordered, tables over prose, Asides for gotchas)
- Reading-the-numbers / what-generalizes (if measured)
- Decision guide (closing diagram)
- Reproducing (if measured) / Evidence table (tested vs design-only)
- References (numbered, footnote-backed)

GUIDE (`guides/`) = Diataxis how-to, task-sequenced:
- frontmatter
- Lede (what you'll build + prerequisites)
- Architecture overview + Component Versions + diagram
- Part 1..N / Step 1..N (sequential, each independently verifiable)
- Verification
- Gotchas and Lessons Learned
- File Reference / File Structure
- References (numbered, footnote-backed)

House style: sentence-case headings, ASCII punctuation (guard-enforced), `->` arrows
in prose, `\$` for literal dollars.

## Part 2 - Citation system

See Research findings. IEEE-numbered via GFM footnotes; relabel "Footnotes" ->
"References"; entries retrievable with working URLs; ordered by first appearance.
Convention written to repo AUTHORING.md + saved to pi memory for auto-application.

## Part 3 - CF+Supabase pilot

1. Data residency -> 3 tables (nuance kept as short prose notes under each):
   - At rest: Surface | Default location | How to pin | Compliance note
     rows: Supabase project / Read replica / Durable Object / Edge cache
   - In transit: Hop | Default | Make it private/regional
     rows: Browser->PoP->Worker / Worker->Supabase / DO transport+storage
     prose note: PrivateLink caveat + managed-Supabase "can't run cloudflared inside"
   - Logs & audit: Surface | Default | Residency control
     rows: CF Customer Logs / DO logs+analytics (US-only) / PG connection logging /
     wrangler tail + broadcast payload
   - Checklist stays as checklist (already right).
2. Kill Sources / (more) -> ~42 links become inline `[^...]` citations at their
   claims + a numbered `## References` (footnotes) list.
3. Rebuild + verify: footnotes render, no orphan citations, no `\$`/katex regressions.

## Part 4 - Repo-wide rollout

- Migrate remaining 23 docs to citation convention + skeleton.
- Batches of 3-4, each verified by rebuild. Reference docs first (5 remaining),
  then guides (18). Do after pilot lands and is eyeballed.

## Open decisions (BLOCKING execution)

1. Citation style: IEEE-numbered entries (REC, CS-correct) vs APA-formatted entries
   in footnote order (the "APA look" you asked for) vs strict APA author-date (NOT
   recommended - breaks with this many same-author sources).
2. Convention home: AUTHORING.md + pi memory (REC) vs README.md vs published
   `/reference/authoring` page.
3. Heading casing: standardize all to sentence case (REC) vs apply going forward only.
4. Rollout scope now: pilot only, vs pilot + start repo-wide migration.

## Progress log

- 2026-07-16: Fixed egress-line `$` katex bug + Storage ` -- ` en-dash in
  cloudflare-supabase-architecture.mdx (UNSTAGED, not committed).
- 2026-07-16: Plan drafted, then revised with Diataxis + IEEE-vs-APA research and a
  "what's already done well" catalog.
- 2026-07-16: PILOT executed on cloudflare-supabase-architecture.mdx:
  * astro.config.mjs: added rehypeFootnoteLabelToReferences (renames GFM
    "Footnotes" -> visible "References", drops sr-only).
  * Data residency section: 3 prose blocks -> 3 tables (at rest / in transit /
    logs+audit) + prose notes for PrivateLink/managed-Supabase/HIPAA nuance.
  * Sources dump (5 groups incl. weird "(more)") -> 43 IEEE footnote defs +
    43 inline [^slug] citations at their claims; 2 pre-existing inline links
    (rate-limiting, realtime-benchmarks) folded in.
  * Verified: build clean (24 pages), 43 refs all cited inline + ordered by
    appearance, 0 unresolved markers, 0 katex regressions.
  * STILL UNCOMMITTED (this + the earlier egress/en-dash fixes + config change).
- 2026-07-16 (cont.): R2 SQL section added to the pilot (46 refs, all resolve).
  Sentence-case sweep applied to 274 headings across 19 docs (script + protected
  proper-noun/phrase allowlist; build clean, anchors intact). Repo AGENTS.md
  written (taxonomy + skeletons + citation system + house style + verify). pi
  memory saved.
- REFINEMENT: citation load is concentrated - ~5 reference docs + magic-wan-interop
  carry almost all external links; 12 guides have 0-1 links. So the rule is:
  reference docs get footnote citations; guides keep inline links in steps
  (footnotes only for reference-heavy guides). This is now in AGENTS.md.
- 2026-07-16 (cont.): citation rollout done in batches, each build-verified:
  * homebrew (2 refs), docker-servarr (3), media-transformation (4, killed the
    :::note[Reference] block), caching (19 refs, 3 source-repo links kept inline).
  * All resolve, 0 literal [^ left, References heading renders per doc.
  * supabase-multitenant DEFERRED: draft:true (unpublished) + its links are the
    "How it was checked" evidence-table column (link IS the evidence, not
    prose-flow attribution). RULE: evidence/how-checked-table links stay inline;
    only prose-flow links become footnotes. Revisit when un-drafted.
  * magic-wan-interop CONFIRMED NO-OP: it's a guide; its 41 links are in-step
    navigation ("configure your [tunnels]", 15-vendor device-guide list). Per the
    guide rule they stay inline. Validates the reference-vs-guide citation split.
- STATUS: system built + proven across all published reference docs + codified in
  AGENTS.md + memory. Everything still UNCOMMITTED. Optional remaining: skeleton
  conformance pass (docs already largely conform), supabase-multitenant when
  un-drafted.
