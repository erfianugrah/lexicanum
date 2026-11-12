# Reading wide diagrams: zoom in place, not a lightbox

> 2026-11-12. Problem: Graphviz diagrams are inline SVG scaled to the
> content column; 151 of 240 render below their intrinsic size at a
> 1152px column, and wide left-to-right ones (one is 2049x153 intrinsic
> in a 1150px column) become unreadable. Card: house#21. Raw worker
> dumps: `raw/2026-11-12-diagram-expand/` (`docs-site-patterns.md`,
> `techniques.md`).

## Constraints

- Inline `<svg>` that inherits theme colours (`currentColor`) from the
  page; anything that turns it into an `<img>` loses dark mode.
- Static Astro Starlight site; vanilla script, no framework runtime.
- Two overlay designs were tried and set aside on 2026-11-12: a
  full-screen dialog (house v0.1.34) and a centred modal lightbox panel
  over a dimmed page (v0.1.35); the brief became a lighter, in-page
  approach. Reference mechanics: the revista-3 photo lightbox (zoom and
  pan, `src/scripts/lightbox.ts` in that repo).
- No scroll trap: a plain wheel over a diagram must still scroll the page.
- House frame: no tinted boxes, caps labels, optical centring gate.

## Longlist

| Option | Seen at | Status | Why |
| --- | --- | --- | --- |
| Full-screen dialog | v0.1.34 | eliminated | tried and set aside |
| Modal lightbox panel | v0.1.35, MkDocs Material glightbox, Starlight image zoom | eliminated | tried and set aside |
| medium-zoom style animated zoom | Docusaurus, VitePress recipes, starlight-image-zoom | eliminated | works on `<img>` only; inline SVG needs serialising to a data URL, which drops `currentColor` theming (medium-zoom#190, its "generated SVG" guide) |
| Always-visible inline pan/zoom controls | GitHub mermaid, Mintlify | eliminated as specified | controls overlay the diagram; users asked GitHub to hide them ("get in the way of content, especially on mobile", community discussion #178929, 10 upvotes) |
| Plain-wheel pan/zoom library (svg-pan-zoom, anvaka/panzoom) | many | eliminated | scroll-trap complaints across 14 issues (techniques.md, adversarial 1-14) |
| Popover API overlay | none surveyed in docs | eliminated | still an overlay; the brief is to stay on the page |
| `<details>` fit/actual toggle | none surveyed | folded in | same result as zoom-in-place with less control |
| CSS breakout wider than the column | WordPress `alignwide` | not chosen now | a 2049px diagram still does not fit at 1920px; changes the kit layout every page uses |
| Horizontal scroll at readable size, no zoom | some blogs | not chosen | scroll by default on 151 diagrams; loses the overview |
| Open SVG in a new tab | Wikipedia-like | fallback only | leaves the page |
| Hover loupe | none | eliminated | no touch, poor a11y |
| Zoom in place inside the figure box (revista mechanics, ctrl-wheel gating from @beoe/pan-zoom) | revista-3, @beoe/pan-zoom (same author as @beoe/rehype-graphviz), docsify-mermaid-zoom | chosen | stays on the page, no overlay, native scroll gives touch and trackpad pan, vector re-render stays sharp |

## Decision

Zoom in place. The figure keeps its place in the page and becomes a
scroll box when zoomed:

- Click a shrunk diagram: it zooms to its readable size (the svg's
  width/height attributes, 1.5x its viewBox) with the clicked point kept
  under the pointer. Click again (without dragging) or Escape returns
  it to fit.
- Drag with the mouse to pan; touch and trackpad pan through native
  scrolling of the box.
- Ctrl+wheel (also what a trackpad pinch sends) zooms continuously
  between fit and 2x readable, anchored at the cursor. Plain wheel is
  never intercepted (the @beoe/pan-zoom rule against scroll traps).
- The zoom sets the svg's layout width/height, not a transform, so the
  vector re-renders sharp (revista needed a commit-to-layout step for the
  same reason, measured there at 37.18 -> 50.39 dB PSNR for photos).
- A quiet caps button under the diagram (ZOOM / FIT) is the keyboard
  path; no controls overlay the diagram.

## Evidence checked by the parent

- @beoe/pan-zoom README: Ctrl+wheel zooms, plain wheel scrolls, gestures
  "intentionally selected to not interfere with the system's default
  scroll gestures, to avoid scroll traps":
  https://github.com/stereobooster/beoe/tree/main/packages/pan-zoom
- GitHub's inline mermaid controls and the request to hide them:
  https://github.com/orgs/community/discussions/178929
- revista-3 lightbox mechanics: `src/scripts/lightbox.ts` in that repo
  (zoom anchor formula, exponential wheel zoom, ctrl-wheel pinch scale)
  and its research `docs/research/2026-10-30-lightbox-comparison.md`.
