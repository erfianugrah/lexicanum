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
  fences indented inside list items; and inline `` `code` `` spans. `scripts/prose-dollar.sh`
  models exactly this. A doc that uses math deliberately opts out with
  `{/* prose-dollar: math-intentional */}` on its own line - `guides/magic-wan-interop`
  does, for MTU/MSS arithmetic.
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
- `bash scripts/verify-docs.sh` reports 0 failed AND 0 unexpected skips. It reads its
  banned-identifier list from `BANNED_IDENTIFIERS_FILE` (default
  `~/.config/lexicanum/banned-identifiers`) rather than the environment, so account
  ids never reach shell history or CI logs.
- For a doc you edited with citations: every `[^slug]` resolves (no literal `[^`
  left in the rendered HTML), and the References list item count == distinct slugs.
- No new KaTeX spans from stray `$` (`grep -c 'class="katex' dist/.../index.html`).
- Casing-only heading edits do not change anchors (slugs are lowercased), so
  internal `#anchor` links stay valid.

Reference: `docs/plans/2026-07-16-doc-structure-and-citations.md` (the plan + the
"what's already done well" catalog).

## Evidence sidecars (docs that publish measured numbers)

A doc making measured claims carries `<doc>.evidence.json` beside its `.mdx`:

```json
{
  "lab": "<repo>:labs/<lab-name>",
  "rows": [
    { "claim": "A12", "must_appear": "project-claim" },
    { "claim": "A11", "must_appear": "returns 404", "expect": "refuted" }
  ]
}
```

`verify-docs.sh` asserts that each claim id exists in that lab's `claims.json`, that
its status matches `expect` (default `empirically-proven`), and that `must_appear` is
present in the prose (whitespace-normalized, so wrapped lines match). A number that
loses its ledger backing fails the build.

The point is that a "measured" badge stays checkable when the lab lives in a private
repo the reader cannot open. Reader-facing, keep the plain-prose "How it was checked"
column in the evidence table; the claim ids are internal traceability only. Set
`expect` deliberately when citing a refuted claim - a doc may legitimately state a
refutation, but it should not happen by accident.
