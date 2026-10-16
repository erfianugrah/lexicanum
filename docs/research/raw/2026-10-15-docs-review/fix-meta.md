# Fix meta - media-transformation-architecture.mdx (local worker, 2026-10-15)

Restructured the repo README into the AGENTS.md reference skeleton, using only
content already in the file. No number, backticked identifier, URL, footnote
slug or anchor changed (only two inbound links exist, both page-level from
`reference/caching.mdx`; no pins in `tests/pins.test.ts`; no internal anchors).

## New section layout

```
frontmatter (unchanged)
Lede - real prose, written from the doc's own description (folds in the old
  fragment lede + intro paragraph; drops the decorative bold on the repo name)
Provenance note - 725MB figures measured on videos.erfi.io; tier latency
  ranges stated, not benchmarked; test counts are what the repo commands report
## TL;DR - 5 bullets, figures copied verbatim (tier table latencies, the
  "Verified" 725MB .mov -> 31MB .mp4 / 0.1s line, _transformed/ revalidation)
## Request flow - topology diagram (the detailed TB one, promoted from
  Core concepts) + numbered text fallback derived from its node/edge labels
## Which tier for what - early decision table: the tier table + modes list +
  container-only routing paragraph, moved up from the intro block
## Core concepts - Design patterns (v1 -> v2), Cache hierarchy, Headers,
  Mode capabilities, Bindings (moved up from Development; it explains the
  resource architecture)
## Three-tier transform routing - Tier 1/2/3, unchanged
## Container FFmpeg - Architecture, Outbound handler, Container server,
  ffmpeg features, Quality presets, Container async flow (diagram moved up
  from Architecture diagrams + text fallback), Queue-based async flow,
  Source dedup, Spritesheet via ffmpeg
## Parameters - Canonical transform params, Akamai/IMQuery compatibility,
  Derivatives, Responsive sizing
## Caching - Cache key, Source freshness revalidation, Cache busting,
  Caching layers (diagram moved up + text fallback), Storage flow
## Multi-origin routing - config, Origins resolution (diagram moved up +
  text fallback), Auth types
## Error handling - unchanged
## Dedup stack - unchanged
## Dashboard - unchanged
## Development - Project structure only (module map; kept because it
  carries the ~95 lines / 84 smoke tests figures and maps src/ dirs to
  responsibilities; Testing/Operations commands moved out)
## Live examples - unchanged
## Reproducing - the Testing + Operations command blocks from Development
## Evidence - Claim | How it was checked | Status, splitting measured
  (the Verified 725MB line, the live examples) from stated
  (tier latency ranges, test counts)
## Related docs - caching (the one-way pair from meta.md; adds the
  back-link) and cloudflare-supabase-architecture, both with named
  relationships
Footnote definitions - unchanged
```

## What was deleted

- `## Architecture diagrams` section: the trailing `Request flow` diagram
  was a duplicate of the richer one kept at the top (resolved the duplicated
  `#request-flow` anchor while it was there); `Container async flow`,
  `Caching layers` and `Origins resolution` moved into their owning sections
  with slugs unchanged. Every one of the 5 remaining dot fences now has a
  numbered text fallback under it (the 5 fallbacks reported in batch-5).
- `### Testing` / `### Operations` headings: content moved verbatim into
  `## Reproducing`.

## Number changes

None.

## New anchors

None needed - no heading text changed beyond moving existing headings to a
different level (slugs are level-independent). New sections added: `tldr`,
`which-tier-for-what`, `reproducing`, `evidence`, `related-docs`.

## Verify results

- `prose-lint --config .prose-lint.json --before HEAD --no-max <file>`: pass,
  slop 0.00/100w, no fact-loss report.
- `prose-lint --config .prose-lint.json --no-max --no-counters --baseline
  .prose-terms-baseline.json <file>`: pass.
- `bun test tests/docs.test.ts tests/pins.test.ts`: 1828 pass, 241 skip,
  0 fail.
- Line-level check: every line of the HEAD version outside the deleted
  duplicate diagram block appears verbatim in the new file.

## Left open

- The 31MB vs 38MB pair (the "Verified" line vs the `?imwidth=320` live
  example) is kept as-is in both places; the doc gives no record that
  settles which transform produced which, so both figures survive and the
  Evidence table lists them as separate measured rows.
- `## Development` keeps the project-structure tree. The review said it
  belongs in the repo README, but it carries the only occurrence of the
  ~95 lines figure and maps src/ directories to responsibilities, so it is
  the architecture-explaining part; only the build/run commands moved to
  Reproducing, per the fix instruction.
