# AGENTS.md - lexicanum docs

Astro + Starlight docs site (MDX). This file is the authoring system: doc types,
skeletons, the citation convention, and house style. Follow it for every new doc
and every edit. Build with `bun run build`; dev with `bun dev` (localhost:4321).

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
- Sidebar auto-generates from directory: `guides/` and `reference/`. No manual
  sidebar entries.

## Two traps in this repo

- **Do not assert "zero KaTeX spans" site-wide.** `guides/magic-wan-interop` renders
  MTU/MSS arithmetic as real LaTeX on purpose. Math checks are per-doc, and a doc that
  means it opts out with `{/* prose-dollar: math-intentional */}`.
- **A `dist/` path can exist with no source file.** `astro.config.mjs` declares
  redirects, and Astro emits a stub page at the old URL. Do not infer that a doc
  exists from a built directory, and do not treat an unmatched one as a stale artifact.

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

## Skeletons

Reference:
```
frontmatter (title sentence-case, rich description, author)
Lede (1-2 sentences: what this is, who it's for)
Provenance note - if it has measurements (rig / region / date; measured vs asserted)
TL;DR bullets
Topology / architecture diagram (```dot fences via @beoe/rehype-graphviz)
Early decision/payoff table ("which do I pick")
Body sections (concept-ordered; tables over prose; Asides for gotchas)
Reading-the-numbers / what-generalizes - if measured
Decision guide (closing diagram)
Reproducing / Evidence table (tested vs design-only) - if measured
References  (auto-rendered from footnotes; see Citations)
```

Guide:
```
frontmatter
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
named "Gotchas and Lessons Learned"; "File Reference" map.

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
  `reference/supabase-multitenant-platform` is the case that established this.

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
- **Spelling: American -ize** (normalize, organize, optimize). The corpus
  convention; note it diverges from British -ise used in email/reply writing.
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

## Conformance

Docs written before 2026-07 predate parts of this contract: several guides
lack a Verification or Gotchas section, and older prose contains em/en-dashes
and other non-ASCII punctuation (the ASCII rule and its guard are newer).
Do not treat the oldest docs as exemplars - the exemplars are
`reference/cloudflare-supabase-architecture.mdx` and
`guides/usb4-10gbe-windows-tuning.mdx`. New docs must conform fully. When
making a substantial edit to an older doc, bring the touched sections into
conformance (heading case, ASCII punctuation, section skeleton); a wholesale
rewrite just for style is not required.

## Verify before done

Run `bun run build` and confirm:
- the current page count (32 as of 2026-08-03), exit 0. Treat a DROP as the signal:
  a doc with `draft: true` does not build, and the count is the cheapest way to notice.
- `bun test` is green. ALL doc checks live in `tests/` and run inside `bun run build`,
  so a defect fails the build instead of appearing on the page. There is no verify
  script any more - `scripts/` is gone, and its checks are either here or were found
  to be vacuous.
  - `tests/docs.test.ts` - corpus-wide structure: split tables, footnote balance,
    smart punctuation, math-risk dollars, internal links, draft links, dot-fence
    style, built-page assertions.
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
  - The parser they share is unit-tested in `tests/lib/mdx.test.ts` against the real
    defects that produced it - add a case there when you fix a new one.
- For a doc you edited with citations: every `[^slug]` resolves (no literal `[^`
  left in the rendered HTML), and the References list item count == distinct slugs.
- No new KaTeX spans from stray `$` (`grep -c 'class="katex' dist/.../index.html`).
- Casing-only heading edits do not change anchors (slugs are lowercased), so
  internal `#anchor` links stay valid.

## Docs that publish measured numbers

Cite the method in prose: an evidence table with a "How it was checked" column that
splits measured from documented-but-not-tested. That split is the contract with the
reader, and it is maintained by hand.

Resist tooling it. An earlier attempt mapped published claims to ids in a private lab
ledger, vendored a public status snapshot so CI could resolve them, and added a
freshness check to police the snapshot. Three mechanisms, and the one doing real work
- asserting the published text still appears in the doc - never needed any of them.
The status half was circular in CI: it compared two generated files. If you reach for
this again, first answer "verified by whom, against what?" - for a private lab and a
public site, the honest answer is that the author is the guarantor and the evidence
table is how that is declared.
