# AGENTS.md - lexicanum docs

Astro + Starlight docs site (MDX). This file is the authoring system: doc types,
skeletons, the citation convention, and house style. Follow it for every new doc
and every edit. Build with `bun run build`; dev with `bun dev` (localhost:4321).
Deploy with `bun run deploy` - it is `wrangler deploy` PLUS a zone cache purge
(`scripts/purge-cache.ts`): the Workers assets platform serves HTML from a
per-PoP cache (`cf-cache-status: HIT` even on `max-age=0, must-revalidate`
HTML), and without the purge some PoPs serve the previous deploy for tens of
minutes (observed 2026-08-17). The purge needs CLOUDFLARE_API_TOKEN, or
CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL, in env; it skips silently without them.

## Pipeline facts (load-bearing)

- `gfm: true` in `astro.config.mjs` -> GFM footnotes render. The citation system
  is built on them.
- `remark-math` + `rehype-katex` are ON. A literal `$` in **prose** is parsed as math.
  ALWAYS escape it as `\$` (e.g. `~\$10/mo`). An unescaped pair silently renders
  garbled math. Three places are exempt and must NOT be escaped (verified against
  built output 2026-08-03): YAML frontmatter, which is not math-processed and where a
  `\$` would emit a literal backslash into `og:description`; fenced code, including
  fences indented inside list items; and inline `` `code` `` spans. `mathRiskLines()`
  in `tests/lib/mdx.ts` models exactly this. A doc that uses math deliberately opts
  out with `{/* prose-dollar: math-intentional */}` on its own line -
  `guides/magic-wan-interop` does, for MTU/MSS arithmetic. The marker name is
  historical: it outlived the `prose-dollar.sh` that read it, and renaming it across
  the corpus would be churn for nothing.
- A custom rehype pass (`rehypeFootnoteLabelToReferences`) renames the GFM
  "Footnotes" heading to a visible **References** section. Do not rename it back.
- `src/styles/custom.css` styles `.footnotes` dense (small type, tight leading).
- Navigation is frontmatter-driven. Each doc declares `category:` (required;
  one of the providers in `TAXONOMY` in `src/lib/taxonomy.mjs`), `group:`
  (required when the category has subcategories), and optional
  `featured: true` + `blurb:` (homepage card) and `aliases:` (old published
  URLs, emitted as redirects - renaming or moving a doc means renaming the
  file and adding its old URL here). The sidebar, redirects, and homepage
  card grids are generated from frontmatter at config-load
  (`src/lib/taxonomy.mjs`, `src/components/TopicCards.astro`) and validated
  at build time (the `docsSchema` enums derive from `TAXONOMY`, so a category
  edit is `TAXONOMY`-only; the generator fails on a missing category or a
  colliding alias). Adding a doc = `bun run new` (prompts, scaffolds
  frontmatter + skeleton) or write the doc and set frontmatter by hand.
  Sidebar entries carry a Guide/Reference badge stamped from the folder.
  Order within a group is guides first, then optional `sidebar.order`, then
  title. Dev note: the sidebar and redirects are computed at server start,
  and a watcher in `astro.config.mjs` restarts the dev server automatically
  when a doc's frontmatter block changes (prose edits keep hot reload).
  Adding a CATEGORY is a deliberate edit to `TAXONOMY`, not something a doc
  can invent.

## Two traps in this repo

- **Do not assert "zero KaTeX spans" site-wide.** `guides/magic-wan-interop` renders
  MTU/MSS arithmetic as real LaTeX on purpose. Math checks are per-doc, and a doc that
  means it opts out with `{/* prose-dollar: math-intentional */}`.
- **A `dist/` path can exist with no source file.** Docs declare `aliases:`
  frontmatter for their old URLs, and Astro emits a redirect stub page at each.
  Do not infer that a doc exists from a built directory, and do not treat an
  unmatched one as a stale artifact.
- **MDX reads `<` in prose as JSX.** `Micro <-> Small` or a bare `<ref>`
  outside a code span fails the build with "Unexpected character". Write the
  words, or put the placeholder in backticks. `rg -n '<[a-z-]|<->'` on prose
  lines before `bun run build`.

## Doc taxonomy

Two types, matching the two folders.

**Reference** (`reference/`) = explanation-led architecture doc. Understanding- and
decision-oriented: it explains how a system works, compares options, and ends with
a "which do I pick". It is NOT austere Diataxis reference - recommendations, TL;DRs,
and measured-vs-asserted notes are wanted. Dense with tables and diagrams. Still
true in 6 months regardless of the reader's setup.

**Guide** (`guides/`) = Diataxis how-to. Task-sequenced, reproducible, follow
top-to-bottom and it works. Assumes a competent reader. Minimal tangents; link out
for concepts rather than explaining them inline.

Test: "how does X work / which do I pick?" -> reference. "how do I do X, step by
step?" -> guide.

Pair across types. Task and concept are intertwingled for the reader even
though the folders split them: a guide that rests on a reference doc links it
from the lede, and the reference doc links back. Name the relationship
("covered in X", "the implementation of this decision") - never a bare "see
also" list.

## Skeletons

Reference:
```
frontmatter (title sentence-case, rich description, author, category, group if
  the category has groups, featured+blurb if it belongs on the homepage,
  aliases on rename)
Lede (1-2 sentences: what this is, who it's for)
Provenance note - if it has measurements (rig / region / date; measured vs asserted)
TL;DR bullets
Topology / architecture diagram (```dot fences via @beoe/rehype-graphviz)
Early decision/payoff table ("which do I pick")
Body sections (concept-ordered; tables over prose; Asides for gotchas)
Reading-the-numbers / what-generalises - if measured
Decision guide (closing diagram)
Reproducing / Evidence table (tested vs design-only) - if measured
References  (auto-rendered from footnotes; see Citations)
```

Guide:
```
frontmatter (same fields as reference: title, description, author, category,
  group if the category has groups, featured+blurb if homepage-worthy,
  aliases on rename)
Lede (what you'll build + prerequisites)
Constants preamble - if measurement-heavy: the fixed facts every later claim
  depends on (hardware/IDs, physics, event IDs, GUIDs, expected numbers),
  as tables, before any steps (see usb4-10gbe-windows-tuning)
Architecture overview + Component Versions + diagram
Part 1..N / Step 1..N (sequential, each independently verifiable)
Verification
Gotchas and Lessons Learned
File Reference / File Structure
References - only if the guide makes attributable factual claims (usually optional)
```

Patterns already established in the repo, reuse them: measurement-provenance +
measured-vs-asserted separation; per-topic TL;DR; early "which to pick" table;
"Reading the numbers"; closing decision-guide diagram; "Reproducing" section;
evidence tables with a "How it was checked" column + a tested-vs-design-only split;
named "Gotchas and Lessons Learned"; "File Reference" map; inline cross-links to
the related older docs (and/or a closing "Related docs" list).

The canonical exemplar is `reference/cloudflare-supabase-architecture.mdx`.

## Citations (IEEE-numbered via footnotes)

Not APA. APA author-date collapses to `(Cloudflare, n.d.-a..-z)` when a doc cites
many pages from one vendor. Use IEEE-style numbered citations, which map onto GFM
footnotes and render numbered by first appearance.

**Reference docs**: every external factual claim gets an inline citation at the
claim, and a References list renders at the bottom. Mechanism:

- Inline, at the claim: `Hyperdrive caches deterministic reads[^hd-cache].`
- Definition (put all defs in one block near the end of the doc):
  `[^hd-cache]: Cloudflare, "Query caching," Cloudflare Docs. https://developers.cloudflare.com/hyperdrive/configuration/query-caching/`
- Entry format: `Vendor, "Page title," Site Name. https://full-url`
- Use mnemonic slugs (`cf-hyperdrive-cache`, `sb-auth-jwts`), not numbers - GFM
  numbers them automatically by appearance.
- A footnote DEFINITION with no matching inline `[^slug]` does NOT render. Every
  reference must be cited inline at least once.
- Do NOT keep a separate "Sources" section. The References list IS the sources.
- Links in an evidence / "How it was checked" table stay INLINE, even in a reference
  doc. There the link IS the evidence rather than prose-flow attribution, and
  footnoting it puts the proof one hop away from the claim it supports.
  `reference/supabase-multi-tenant-placement` is the case that established this.

**Guides**: keep links inline in the step where they're used (flow beats
attribution in a how-to). Add a References footnote list only if the guide is
reference-heavy and makes standalone factual claims (e.g. `magic-wan-interop`).

Cite the source path when answering from docs.erfi.io in chat, too.

## House style

- **Voice: plain and subtractive.** State the fact with its number; never an
  adjective doing a number's job. No slogan contrasts ("measurements instead of
  folklore"), no rating your own points ("the big win", "the nasty one", "the
  trap that bites last", "lock it in"), no "not X, it's Y" constructions.
  Order steps so the important one is first; don't announce which matters. Dry
  wit is fine sparingly and in passing ("learned the hard way") - never a bit
  you build up to. When a step has a measured delta, give the delta and the
  command that reproduces it; that IS the persuasion.
- **One name for one thing.** Do not mix an abbreviation with its expansion in
  the same doc (config/configuration, database/db, auth/authentication). Pick
  the form the doc already uses most and hold it; introducing a third form is
  worse than either. Enforced by the `prose-terms` sensor against
  `.prose-lint.json`, ratcheted from `.prose-terms-baseline.json` so only NEW
  rotation fails - docs predating the check are frozen where they stand rather
  than retro-fixed. Terms of art that only look like synonyms are deliberately
  absent from that config: `client` is a client library, not a person, and in
  the tenancy docs a customer has users, so collapsing those would make the
  prose wrong.
- **Never delete a measured number to shorten a sentence.** Any figure,
  backticked identifier or URL in the committed revision must survive the edit.
  The `prose-facts` sensor diffs them against HEAD. If a number genuinely no
  longer applies, drop it in its own commit with the reason - not as a side
  effect of tightening prose. This corpus is worth reading because of its
  numbers; a sentence that reads better without them is a worse sentence.
- **Spelling: British -ise** (normalise, organise, optimise). The corpus
  convention, same as email/reply writing. Post-contract docs were
  normalised 2026-08-28; pre-contract docs still carry American -ize in
  places - normalise those opportunistically when touching a section, do
  not bulk-rewrite for style alone. Product/API terms are exempt:
  Supabase's "organization", OAuth's "authorize", the `Authorization`
  header, HTTP's "Unauthorized", product names like Vectorize stay
  verbatim.
- **Headings: sentence case.** Capitalize only the first word and proper nouns /
  product names / acronyms. Keep: Cloudflare, Supabase, Hyperdrive, Postgres,
  Traefik, Vaultwarden, Grafana, Prometheus, Docker, Nix, Go, VyOS, KEDA, etc.;
  all-caps acronyms (RLS, DNS, TLS, API, JWT, WAF); camelCase / product phrases
  (PostgREST, WebSocket, Cache Rules, Data API, Edge Functions, Docker Compose).
  Lowercase generic nouns (Overview -> overview, Configuration -> configuration).
- **ASCII punctuation only** in prose/headings/commits. No em/en dashes (use `-`),
  no smart quotes, no ellipsis char. The `ascii-punctuation-guard` enforces this.
- Arrows in prose: `->` (renders literally; SmartyPants leaves it alone).
- Never ` -- ` in prose (SmartyPants turns it into an en-dash). Use ` - `.
- Literal `$` -> `\$` (see Pipeline facts).
- Diagrams: `dot` (graphviz) for architecture; Mermaid also available. Theming is
  NOT automatic - custom.css maps black text/strokes to `currentColor` and gives
  nodes/clusters neutral fills, but only if the dot source carries NO colors and
  opts out of the graph background. Every `dot` fence must start with the house
  boilerplate (copy from `reference/caching.mdx`):
  ```
  digraph {
    rankdir=LR; bgcolor="transparent"; nodesep=0.3; ranksep=0.7;
    fontname="Helvetica,Arial,sans-serif";
    node [fontname="Helvetica,Arial,sans-serif", fontsize=11, shape=box];
    edge [fontname="Helvetica,Arial,sans-serif", fontsize=9];
  ```
  Without `bgcolor="transparent"` Graphviz emits a white graph polygon and the
  diagram renders as a white card with low-contrast text in dark mode. Never set
  color/fill/fontcolor attributes on individual nodes or edges.
- **Every `dot` decision diagram gets a text fallback** directly under it: a
  numbered list or a table saying the same thing. Reviewers, search indexers
  and anything fetching the page as text get the node labels run together
  (`"deploys are breaking"1. the error string2. deploys in flight...`), which
  turns the most useful section into noise. Learned on
  `reference/supabase-edge-function-limits` (2026-09-02).

## Conformance

Docs written before 2026-07 predate parts of this contract: several guides
lack a Verification or Gotchas section, and older prose contains em/en-dashes
and other non-ASCII punctuation (the ASCII rule and its guard are newer).
Do not treat the oldest docs as exemplars - the exemplars are
`reference/cloudflare-supabase-architecture.mdx` and
`guides/usb4-10gbe-windows-tuning.mdx`. The reverse also holds: docs written
since the AI-assisted era began are not a style source either - pattern-match
the two named exemplars only, regardless of a doc's age. A corpus-wide sweep
(2026-08-28) removed the known AI prose tells (decorative bold on labels,
importance-announcing, colon-headline stamps, negative parallelism) from the
post-contract docs and normalised their prose spelling to British -ise; the
regex-able subset of those tells gates the build via `LLM_MARKERS` in
`tests/lib/mdx.ts`, and `REJECTED_MARKERS` there records the candidates
rejected because the author's own pre-contract writing uses them. New docs
must conform fully. When
making a substantial edit to an older doc, bring the touched sections into
conformance (heading case, ASCII punctuation, section skeleton); a wholesale
rewrite just for style is not required.

Cross-reference the corpus: before drafting a new doc, grep `src/content/docs`
for the systems it touches and read the matches (often the older human-written
docs), then link them inline or in a closing "Related docs" list. The build
verifies that links resolve; it does not verify that a new doc established any -
that check is on the author.

## Verify before done

Run `bun run build` and confirm:
- exit 0. The page count is no longer a number to keep in your head: `tests/
  docs.test.ts` asserts built pages minus redirect stubs equals the doc count,
  so a doc that stops building fails the build instead of quietly shrinking the
  site. That check exists because this line used to carry the count by hand and
  had already drifted - it read "37 docs plus two redirect stubs" when the
  corpus was 36 docs and three stubs, and only summed correctly by accident.
  A doc with `draft: true` does not build, which is the case this catches.
- `bun test` is green. ALL doc checks live in `tests/` and run inside `bun run build`,
  so a defect fails the build instead of appearing on the page. `scripts/` holds
  tooling only (`new-doc.ts`, the scaffolder) - checks live here in `tests/`,
  after the old verify scripts were either absorbed or found to be vacuous.
  - `tests/docs.test.ts` - corpus-wide structure: split tables, footnote balance,
    smart punctuation, math-risk dollars, internal links, draft links, dot-fence
    style, built-page assertions, and the taxonomy checks (every doc in the
    generated sidebar, every alias emitting a redirect stub, no dead blurb).
  - `tests/pins.test.ts` - per-doc pins: corrections that must not regress, claims
    that must not creep back, required sections, and the anchors other docs link to.
    Adding a pin is a row in the table.
  - `tests/identifiers.test.ts` - banned identifiers, read from `BANNED_IDENTIFIERS`
    or `BANNED_IDENTIFIERS_FILE` (default `~/.config/lexicanum/banned-identifiers`)
    so account ids never reach shell history or CI logs. An absent list FAILS; the
    bash version reported PASS for weeks with the list unset.
  - `tests/links.test.ts` - external reachability, opt-in via
    `bun run verify:docs:links`. Never gates the build: someone else's 503 is not a
    defect here.
  - `tests/harness.test.ts` - checks about the checks, and it stops at two: every
    `verify:*` / `check:*` script is invoked by `build` or by a workflow (a check
    nobody runs is an intention, and intentions do not fail), and no test spawns a
    subprocess (the dist walk that shelled out to `rg` worked here and died on the
    runner). Both classes had already bitten. Do not grow this file into a harness
    that verifies itself more than the corpus.
  - The parser they share is unit-tested in `tests/lib/mdx.test.ts` against the real
    defects that produced it - add a case there when you fix a new one. The phrasing
    rules are a TABLE there (`LLM_MARKERS`), each row carrying the line it must flag
    and, where a near-collision exists, the line it must not; the suite iterates the
    table, so a rule cannot be added without its cases and deleting a rule deletes
    them rather than leaving a passing test that guards nothing.
- For a doc you edited with citations: every `[^slug]` resolves (no literal `[^`
  left in the rendered HTML), and the References list item count == distinct slugs.
- No new KaTeX spans from stray `$` (`grep -c 'class="katex' dist/.../index.html`).
- Casing-only heading edits do not change anchors (slugs are lowercased), so
  internal `#anchor` links stay valid.

## Docs that publish measured numbers

Cite the method in prose: an evidence table with a "How it was checked" column that
splits measured from documented-but-not-tested. That split is the contract with the
reader, and it is maintained by hand.

Five rules that review passes on 2026-09-02 and 2026-09-03 kept re-deriving, now fixed:

- **Quote numbers by paste, not recall.** The lab renders a run artifact as
  tables (`pvlab --facts run.json --only EF08`) and publishes a redacted copy
  under `experiments/<name>/out/<date>/`. Every retyped figure that day was
  wrong somewhere (12,022 for a recorded 12,019; a per-second rate in the wrong
  unit; a 15 s pass band quoted as the measurement). Copy from the facts table.
- **Name the side, the key and the project on every measured row** when the
  doc has more than one of them (managed vs self-hosted GoTrue; PostgREST vs
  GoTrue as verifier; ES256 vs legacy HS256 signing key vs API key; project 1
  of 4). A reader must not reconstruct which one a number belongs to.
- **A docs-vs-runtime table row states whether the disagreement has been
  filed upstream**, or the table carries one line saying none has. That is what
  tells a reader whether to expect the docs to change.
- **Evidence links pin to a commit** (`/tree/<sha>/...`, never `/tree/main/`)
  and point at the published `out/` artifact where one exists, so module ids in
  the evidence table stay resolvable after the lab moves on.
- **Every lab-backed page ends in practices.** A "What to do about it"
  section (or the page's older equivalent) with imperative rows and a "Rests
  on" column naming the module id that measured the claim; `tests/pins.test.ts`
  requires the heading on every such page. A row whose figure has no lab
  record says so in the cell. The 2026-09-03 pass over 34 pages found that
  most defects were attribution, not prose: a module cited for something it
  did not measure, or a figure that exists only in this corpus.

The `lab-writeup` skill carries the full pre-publish checklist (ambiguity
classes, provenance, sweeps) and the reviewer brief. Three of its regex-able
rows gate the build via `LLM_MARKERS` (`undated-earlier-run`,
`pass-band-as-measurement`, `unsourced-reported-to`).

Resist tooling it. An earlier attempt mapped published claims to ids in a private lab
ledger, vendored a public status snapshot so CI could resolve them, and added a
freshness check to police the snapshot. Three mechanisms, and the one doing real work
- asserting the published text still appears in the doc - never needed any of them.
The status half was circular in CI: it compared two generated files. If you reach for
this again, first answer "verified by whom, against what?" - for a private lab and a
public site, the honest answer is that the author is the guarantor and the evidence
table is how that is declared.
