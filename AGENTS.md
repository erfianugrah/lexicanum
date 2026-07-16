# AGENTS.md - lexicanum docs

Astro + Starlight docs site (MDX). This file is the authoring system: doc types,
skeletons, the citation convention, and house style. Follow it for every new doc
and every edit. Build with `bun run build`; dev with `bun dev` (localhost:4321).

## Pipeline facts (load-bearing)

- `gfm: true` in `astro.config.mjs` -> GFM footnotes render. The citation system
  is built on them.
- `remark-math` + `rehype-katex` are ON. A literal `$` in prose is parsed as math.
  ALWAYS escape it as `\$` (e.g. `~\$10/mo`). An unescaped pair silently renders
  garbled math.
- A custom rehype pass (`rehypeFootnoteLabelToReferences`) renames the GFM
  "Footnotes" heading to a visible **References** section. Do not rename it back.
- `src/styles/custom.css` styles `.footnotes` dense (small type, tight leading).
- Sidebar auto-generates from directory: `guides/` and `reference/`. No manual
  sidebar entries.

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

**Guides**: keep links inline in the step where they're used (flow beats
attribution in a how-to). Add a References footnote list only if the guide is
reference-heavy and makes standalone factual claims (e.g. `magic-wan-interop`).

Cite the source path when answering from docs.erfi.io in chat, too.

## House style

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
- Diagrams: `dot` (graphviz) for architecture, already themed; Mermaid also
  available.

## Verify before done

Run `bun run build` and confirm:
- `24 page(s) built` (or current count), exit 0.
- For a doc you edited with citations: every `[^slug]` resolves (no literal `[^`
  left in the rendered HTML), and the References list item count == distinct slugs.
- No new KaTeX spans from stray `$` (`grep -c 'class="katex' dist/.../index.html`).
- Casing-only heading edits do not change anchors (slugs are lowercased), so
  internal `#anchor` links stay valid.

Reference: `docs/plans/2026-07-16-doc-structure-and-citations.md` (the plan + the
"what's already done well" catalog).
