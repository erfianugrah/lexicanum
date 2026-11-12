# Diagram Expand: Lighter-than-Lightbox Techniques

Research dump for lexicanum's Graphviz diagrams (inline `<svg>` inside `<figure class="beoe graphviz">`), currently rendered at 1.5x viewBox with CSS `max-width:100%; max-height:80vh`, making wide diagrams (e.g. 2049x153 px) shrink to ~1150px and become unreadable.

**Context**: Two overlay designs were already set aside: (1) full-screen modal dialog, (2) centred lightbox panel over a dimmed page. A lighter, in-page approach is wanted. A related photo site uses a custom lightbox with `transform: scale()+translate3d`, wheel zoom (delta-proportional, ctrl-wheel for trackpad pinch), two-pointer pinch, drag pan clamped, double-click zoom two steps.

**Date**: 2026-11-12
**Site**: lexicanum (Astro + Starlight, static, no framework runtime, vanilla TS inline scripts OK)

---

## Technique Longlist

### (a) In-place zoom/pan inside the figure box (library-based)

**How it works**: A JS library wraps the SVG in a container with `overflow: hidden`, applies CSS `transform: scale()+translate()` on wheel/drag/pinch, and exposes methods for programmatic control. The diagram stays in its original place in the page flow; the user zooms and pans within the constrained container.

**Candidates**:

| Library | Size | Wheel strategy | Touch | Notes |
|---------|------|---------------|-------|-------|
| `@beoe/pan-zoom` v0.0.4 | PanZoom.js 8.1KB + PanZoomUi.js 2.4KB + utils ~3KB (~14KB total, gzip unknown; 0 deps) | **Ctrl+wheel to zoom**, plain wheel scrolls page. Intentionally avoids scroll traps. Cmd+click zoom in, Alt+click zoom out. | Two-finger drag pan, pinch zoom, double-tap zoom. | **Same author as @beoe/rehype-graphviz** (stereobooster). Headless mode available (no UI). Has optional PanZoomUi with +/-/reset buttons. Requires CSS: `overflow:hidden; touch-action:pan-x pan-y;`. Known Safari bug: `will-change:transform` / `matrix3d` causes pixelation on zoom. Weekly downloads: ~76, 2 dependents. MIT. |
| `@panzoom/panzoom` v4.6.2 (timmywil) | ~3.7KB gzipped, 0 deps | `zoomWithWheel()` convenience method. Must be bound manually to `wheel` event on parent. No built-in ctrl-gate; user must add `if (!event.shiftKey) return` guard themselves. | Pointer Events with fallback. Pinch zoom, focal-point zoom. | 668K weekly downloads, 91 dependents. TypeScript types included. `setTransform` option for custom transforms. `canvas: true` for pan-from-parent. Known: `pinchAndPan` option has known issues with `contain` (#512, #606). |
| `panzoom` v9.4.4 (anvaka) | dist/panzoom.min.js 33KB (gzip ~8-10KB est.), 3 deps (wheel, amator, ngraph.events). Unpacked 702KB. | `beforeWheel` callback - user returns truthy to IGNORE. README says "Sometimes zooming interferes with scrolling." Default: wheel zooms (no ctrl required). | "Aggressively preventDefault + stopPropagation" on touch events (README). Customizable via `onTouch` callback. Default: 1-finger pan, 2-finger pinch zoom. Arrow keys + +/- for zoom. | 147K weekly downloads, 103 dependents. Separate DOM vs SVG controllers. `smoothScroll` option for momentum. Known: dispose() didn't remove wheel listener (#26, fixed); smooth zoom with wheel not supported (#252). |

**Deps/KB**: 0-14KB for @beoe or @panzoom, ~10KB gzipped for anvaka.

**a11y**: No ARIA roles or keyboard controls by default in any of them. @beoe has optional button UI (+/-/reset). No focus management. All three support programmatic API, so a toggle button can be wired in. `prefers-reduced-motion` NOT checked by any library.

**Mobile**: Touch-action conflicts possible. @beoe uses `touch-action: pan-x pan-y`, anvaka "aggressively" cancels touch events (page can't scroll when starting on diagram). @panzoom uses Pointer Events with fallback.

**Wheel-hijack risk**: **High for anvaka and @panzoom** (wheel zooms by default - must add ctrl-gate manually). **Low for @beoe** (ctrl-wheel zoom by design, plain wheel scrolls page). This is the library's explicit design goal.

**Fit for wide-short (2049x153)**: Excellent. User zooms into the part they need. Works equally well for tall diagrams.

**Source URLs**:
- https://github.com/stereobooster/beoe#readme (monorepo root)
- https://www.npmjs.com/package/@beoe/pan-zoom
- https://beoe.stereobooster.com/other/pan-zoom/
- https://astro-digital-garden.stereobooster.com/recipes/svg-pan-zoom/
- https://www.npmjs.com/package/@panzoom/panzoom
- https://github.com/timmywil/panzoom
- https://www.npmjs.com/package/panzoom (anvaka)
- https://github.com/anvaka/panzoom

---

### (b) medium-zoom style: click-to-zoom-in-place with backdrop

**How it works**: Click an image to animate it from its in-page position to fill the viewport (or near it, with margins). Click/scroll/Esc to dismiss back to original position. Like Medium's image zoom. The image stays in the document; a cloned/full-size version is shown in an overlay.

**Candidates**:

| Library | Size | Notes |
|---------|------|-------|
| `medium-zoom` v1.1.0 | ~2-3KB gzipped (est.), 0 deps | Framework-agnostic. Requires `<img>` elements - **does not work with inline `<svg>` directly**. Must convert SVG to data URL and inject into `<img>`. Generated SVG guide: https://medium-zoom.francoischalifour.com/docs/guides/generated-svg/ |
| `starlight-image-zoom` v0.16.2 | Starlight plugin, uses native `<dialog>`, **no client-side third-party deps** | Starlight-specific. Wraps images in `<Zoom>` component using `<dialog>` for light dismiss + Esc. Caption support. V0.16.x supports Astro v7, Starlight >=0.42.0. Has explicit `<Zoom>` component for manual wrapping of SVGs. |

**Deps/KB**: 2-3KB for medium-zoom standalone; starlight-image-zoom is a Starlight plugin (server-side only, zero runtime JS beyond `<dialog>` and small inline scripts).

**a11y**: medium-zoom: keyboard-friendly (Esc closes, scroll-to-close). starlight-image-zoom: uses `<dialog>` which has built-in focus trapping, Esc light dismiss. Has accessible zoom trigger buttons.

**Mobile**: Pinch on zoomed image? medium-zoom shows image at viewport scale - no further zoom. starlight-image-zoom: `<dialog>` is top-layer; touch outside dismisses.

**Wheel-hijack risk**: **None.** Scroll-to-close is a feature (scrollOffset default 40px). No wheel capture for zooming.

**Fit for wide-short (2049x153)**: **Poor.** The zoomed image fills viewport width ~1280-1920px. A 2049px-wide diagram is STILL shrunk to viewport width. medium-zoom has a `margin` option but no zoom/pan beyond viewport.

**Fit for tall diagrams**: Good - fills viewport height, scroll to see rest.

**Key problem for this use case**: medium-zoom needs `<img>`, not inline `<svg>`. starlight-image-zoom wraps `<img>` elements. Lexicanum diagrams are inline `<svg>` inside `<figure>` - they'd need conversion or a custom approach. Inline SVG serialization to data URL loses CSS theme inheritance.

**Source URLs**:
- https://medium-zoom.francoischalifour.com/
- https://github.com/francoischalifour/medium-zoom
- https://medium-zoom.francoischalifour.com/docs/guides/generated-svg/
- https://github.com/francoischalifour/medium-zoom/issues/190
- https://starlight-image-zoom.vercel.app/
- https://github.com/HiDeoo/starlight-image-zoom
- https://starlight-image-zoom.vercel.app/components/zoom/

---

### (c) Breakout: expand in normal flow to full viewport width

**How it works**: On click, the `<figure>` toggles a CSS class that makes it break out of the content column to full viewport width, and the SVG renders at its intrinsic width with `overflow-x: auto` for horizontal scrolling. The page layout below it shifts down; no overlay, no z-index tricks. Second click (or a close button) collapses back.

Purely CSS (or minimal JS for class toggle). Key CSS:
```css
.diagram-breakout {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow-x: auto;
}
.diagram-breakout svg {
  width: auto;
  max-width: none;
  height: auto;
}
```

**Deps/KB**: 0KB (inline JS only, under 200 bytes for toggle). CSS under 300 bytes.

**a11y**: Stays in document flow - screen readers see it naturally. No focus trap needed. Need a button with `aria-expanded`. Keyboard: button is tabbable, Enter/Space toggles. `prefers-reduced-motion`: not needed if no animation, or wrap transition in `@media (prefers-reduced-motion: no-preference)`.

**Mobile**: Horizontal scroll is native browser behaviour - works with touch drag. No touch-action conflicts (only `overflow-x: auto` on the container). Pinch-to-zoom works as normal browser zoom.

**Wheel-hijack risk**: **None.** The diagram container uses native `overflow-x: auto`. Wheel scrolls the page vertically; horizontal scroll is via shift-wheel or touch drag. No JS wheel listener at all.

**Fit for wide-short (2049x153)**: **Good** at wide viewports, **limited** at narrow. At 1920px viewport, 2049px diagram is only ~129px wider - horizontal scroll works but barely needed. At 1280px viewport, 2049px is significantly wider - horizontal scroll is natural. The diagram renders at full intrinsic height (153px) so it fills only a small vertical band. At 390px mobile, the diagram is 5x viewport width - horizontal scroll is essential. Diagram height stays small so the page below it is not pushed far down.

**Fit for tall diagrams**: Less ideal. A 1440x720 diagram in breakout mode at 1280px viewport uses the full column width for horizontal but 720px of height pushes content far down. Add `max-height: 80vh; overflow-y: auto` on the expanded container for tall diagrams.

**Key advantage**: The diagram stays in context. Reader sees surrounding text above and below; the diagram just "gets wider." No layer/backdrop/z-index issues.

**Source URLs**:
- https://stackoverflow.com/questions/76179675/horizontal-scrollbar-on-wide-image-in-mkdocs
- https://ada.is/blog/2020/03/11/horizontally-scrolling-panes-with-clean-html-and-modern-css/
- https://css-tricks.com/full-width-containers-limited-width-parents/

---

### (d) Horizontal scroll at readable size inside the column (CSS-only, no JS)

**How it works**: The figure container gets `overflow-x: auto` and the SVG gets `width: <intrinsic>px; max-width: none`. A fade/shadow hint at the right edge signals scrollability. No JS, no click needed. The diagram always renders at full width and the reader scrolls horizontally to see it.

```css
.beoe.graphviz {
  overflow-x: auto;
}
.beoe.graphviz svg {
  width: auto;
  max-width: none;
  height: auto;
}
```

**Deps/KB**: 0KB. Pure CSS.

**a11y**: No JS needed. Scrollable region is natively accessible. Focusable with `tabindex="0"` if desired, so keyboard users can arrow-scroll. Screen readers announce scrollable regions.

**Mobile**: Native touch scroll works for horizontal. `-webkit-overflow-scrolling: touch` for iOS smooth scroll.

**Wheel-hijack risk**: **None.** Native overflow scroll. Wheel scrolls page vertically; shift-wheel scrolls the diagram horizontally.

**Fit for wide-short (2049x153)**: **Good but with a layout cost.** The diagram takes only 153px of vertical space but forces the column to accommodate 2049px of horizontal overflow. The horizontal scrollbar appears at the bottom of the 153px-tall figure. On a 1280px viewport, the reader sees ~62% of the diagram at once and scrolls to see the rest. The narrow content column (34rem ~= 612px) shows only ~30% of the diagram at a time.

**Fit for tall diagrams**: Works - `overflow-y: auto` with `max-height` if needed.

**Key concern**: A scrollbar on a 153px-tall container is cramped. The scrollbar thumb is tiny. Could combine with setting a `max-height` trigger: only enable horizontal scroll when diagram width exceeds container width.

**Source URLs**:
- https://stackoverflow.com/questions/26950796/showing-a-diagram-within-a-scrollable-area
- https://developer.mozilla.org/en-US/docs/Web/CSS/overflow

---

### (e) `<details>`-style toggle between fit and actual size

**How it works**: A `<details>`/`<summary>` (or button-toggled div) wraps the figure. Collapsed: SVG at `max-width:100%` (fit). Expanded: SVG at intrinsic width, container `overflow-x:auto`. The toggle button acts as the summary/disclosure.

```html
<details class="diagram-expand">
  <summary>Expand diagram</summary>
  <div class="diagram-full">
    <svg ... style="width:2049px; max-width:none">...</svg>
  </div>
</details>
```

Or with a button + JS toggle for more control:
```html
<button aria-expanded="false" class="diagram-toggle">Expand</button>
<div class="diagram-container collapsed" data-diagram>
  <svg ...></svg>
</div>
```

**Deps/KB**: 0KB with `<details>` (native HTML). ~200 bytes JS if using button toggle.

**a11y**: `<details>` is natively accessible - keyboard operable, screen readers announce state. `aria-expanded` on button variant. Focus management is automatic with `<details>`.

**Mobile**: Same as (d) - native horizontal scroll. Touch works.

**Wheel-hijack risk**: **None.** Same as (d).

**Fit for wide-short (2049x153)**: Same tradeoffs as (d) but reader explicitly opts in. Collapsed state: diagram fits column (possibly unreadable for wide ones). Expanded: full width with horizontal scroll. The toggle gives control - the diagram doesn't force scrollbars on every page load.

**Fit for tall diagrams**: Same as (d) - needs `overflow-y: auto`.

**Key advantage over (d)**: No permanent scrollbar on the page. Reader chooses to expand. Pages don't have horizontal scroll indicators on every diagram. **This is probably the lightest option that still makes wide diagrams readable.**

**Source URLs**:
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details

---

### (f) View Transitions API for animating between fit and expanded

**How it works**: Use `document.startViewTransition()` (same-document) to animate between the collapsed (fit-to-column) and expanded (breakout/horizontal-scroll) states. The browser takes snapshots of old/new states and animates between them.

```js
button.addEventListener('click', () => {
  document.startViewTransition(() => {
    figure.classList.toggle('expanded');
  });
});
```

**Deps/KB**: 0KB (browser API). ~300 bytes JS. Astro has built-in View Transitions support (opt-in per page or site-wide) with `<ViewTransitions />` component.

**a11y**: `prefers-reduced-motion` is automatically respected by the View Transitions API (browser-level). No focus trap needed. Button with `aria-expanded` as in (c).

**Mobile**: Same as (c) - native overflow scroll after transition.

**Wheel-hijack risk**: **None.** Same as (c).

**Fit for wide-short**: Same layout result as (c). The animation is polish.

**Key caveat**: Browser support: Chrome 111+, Edge 111+, Safari 18+ (Sep 2024), Firefox: not yet supported (as of 2026-11, behind flag). Astro's `<ViewTransitions />` falls back to full-page navigation for unsupported browsers. For same-document transitions (this use case), unsupported browsers just get the instant toggle - no animation but functionality works.

**Source URLs**:
- https://developer.chrome.com/docs/web-platform/view-transitions
- https://docs.astro.build/en/guides/view-transitions/
- https://events-3bg.pages.dev/library/Zoom/

---

### (g) Popover API (native `popover` attribute) instead of modal dialog

**How it works**: Use `popover="auto"` on a div that contains the expanded diagram. The browser promotes it to the top layer, handles light dismiss (click outside, Esc), and manages focus. No z-index fights. No JavaScript for show/hide if using `popovertarget` on the trigger button.

```html
<button popovertarget="diagram-1">Expand diagram</button>
<div id="diagram-1" popover>
  <svg ... style="width:2049px">...</svg>
</div>
```

**Deps/KB**: 0KB (browser API). Zero JS if using declarative `popovertarget`. Under 200 bytes JS if programmatic `showPopover()`/`hidePopover()`.

**a11y**: **Excellent.** Native: focus moves to popover on open, Esc dismisses, light dismiss on click outside. `popover="auto"` closes other auto popovers. Screen readers: popover role is implicit. No focus trapping code needed - browser handles it.

**Mobile**: Top layer renders above everything. Light dismiss on tap outside. No scroll lock (unlike `<dialog>` with `showModal()`).

**Wheel-hijack risk**: **None** if popover uses `overflow: auto` for scroll. The popover is top-layer but doesn't capture wheel events unless you add listeners.

**Fit for wide-short (2049x153)**: Popover can be styled to full viewport width. At 1280px, 2049px diagram scrolls horizontally inside the popover. Need `width: calc(100vw - 2rem); max-height: 80vh; overflow: auto`.

**Fit for tall diagrams**: Same - `max-height: 80vh; overflow-y: auto`.

**Key advantage over the current lightbox**: No JS for show/hide. Browser handles a11y. Lighter weight (0 bytes vs current lightbox's zoom/pan JS). Still a "panel over the page" but not a full lightbox with backdrop/zoom. It's a "light dismiss popover" - what the owner might mean by "we don't have to full on lightbox."

**Key caveat**: Browser support: Chrome 114+, Edge 114+, Safari 17+, Firefox 125+. Good coverage by late 2024.

**Source URLs**:
- https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
- https://developer.chrome.com/blog/introducing-popover-api
- https://html.spec.whatwg.org/multipage/popover.html

---

### (h) Open SVG standalone in new tab

**How it works**: Add a button that opens the SVG as a standalone file in a new tab/window using a blob URL.

```js
button.addEventListener('click', () => {
  const svg = figure.querySelector('svg').outerHTML;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  window.open(URL.createObjectURL(blob), '_blank');
});
```

**Deps/KB**: Under 300 bytes JS. Zero deps.

**a11y**: Button is accessible. New tab is standard browser behaviour. Not ideal: context switch, loses page context.

**Mobile**: New tab on mobile is disruptive. Many users have tab-opening blocked or constrained.

**Wheel-hijack risk**: None (new tab, browser-native).

**Fit for wide-short (2049x153)**: Viewer gets a full-viewport SVG with native browser zoom. At 2049x153, it's still small on a 1920px screen but the browser's native zoom (Ctrl++) handles it.

**Concerns**: Loses all site context (theme, surrounding text, navigation). The SVG is raw - no dark mode adaptation unless the SVG has its own theme handling. Blob URLs need cleanup.

**Source URLs**:
- https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- https://developer.mozilla.org/en-US/docs/Web/API/Blob

---

### (i) CSS zoom / transform on hover (loupe)

**How it works**: On hover (or focus-within), the figure container gets `overflow: visible` and the SVG scales up with a CSS transform.

```css
.beoe.graphviz { overflow: hidden; }
.beoe.graphviz:hover, .beoe.graphviz:focus-within { overflow: visible; }
.beoe.graphviz:hover svg, .beoe.graphviz:focus-within svg {
  transform: scale(1.5);
  transform-origin: top left;
}
```

**Deps/KB**: 0KB. Pure CSS.

**a11y**: `:focus-within` works for keyboard focus (but only if something inside is focusable). No button for touch/mobile users (no hover). No `prefers-reduced-motion` by default. Screen readers don't know the diagram changed size.

**Mobile**: **Fundamentally broken.** No hover on touch devices.

**Wheel-hijack risk**: None (no wheel listener).

**Fit for wide-short (2049x153)**: At 1.5x scale, 2049x153 becomes 3073x229 - overflows viewport. The `overflow: visible` means it spills over surrounding content.

**Verdict**: Novelty. Not suitable as the primary mechanism for a docs site.

---

## Comparison Matrix

| # | Technique | JS (KB) | Wheel-hijack | A11y | Mobile | Wide-short fit | Tall fit |
|---|-----------|---------|-------------|------|--------|---------------|----------|
| a | In-place pan-zoom (@beoe) | ~14 | Low (ctrl-gate) | Poor | Good | Excellent | Excellent |
| a | In-place pan-zoom (@panzoom) | ~4 | High (manual gate) | Poor | Good | Excellent | Excellent |
| a | In-place pan-zoom (anvaka) | ~10 | High (default on) | Poor | Fair* | Excellent | Excellent |
| b | medium-zoom style | ~3-5 | None | Good | Good | Poor | Good |
| b | starlight-image-zoom | ~1 | None | Good | Good | Poor | Good |
| c | CSS breakout | 0.2 | None | Good | Good | Good | Fair |
| d | CSS overflow scroll | 0 | None | Good | Good | Good | Fair |
| e | `<details>` toggle | 0 | None | Excellent | Good | Good | Fair |
| f | View Transitions polish | 0.3 | None | Good | Good | Depends on base | Depends on base |
| g | Popover API | 0-0.2 | None | Excellent | Good | Good | Good |
| h | New tab SVG | 0.3 | None | OK | Poor | Good | Good |
| i | CSS hover zoom | 0 | None | Poor | Broken | Poor | Poor |

\* anvaka "aggressively prevents" touch events; page may not scroll when touching diagram.

---

## Adversarial Findings

### Scroll-jacking / wheel-trap complaints

1. **svg-pan-zoom (bumbu)**: Chromium 73+ made wheel events passive by default, breaking `preventDefault()` in all pan-zoom libraries. Issue #141 (Mar 2019): "Trying to zoom in or out using the scroll wheel results in the page scrolling not only the image." Source: https://github.com/chrvadala/react-svg-pan-zoom/issues/141

2. **svg-pan-zoom (ariutta/bumbu)**: Issue #122 "Scroll-zoom too sensitive" (Jun 2015). User complaint that one wheel notch zooms too aggressively. Source: https://github.com/ariutta/svg-pan-zoom/issues/122

3. **svg-pan-zoom (ariutta/bumbu)**: Issue #156 "Method for only disabling the click listener's preventDefault()" (Oct 2015, still open). When `preventMouseEventsDefault: false`, "I scroll the screen when trying to pan via touch or zoom with the mousewheel." Source: https://github.com/bumbu/svg-pan-zoom/issues/156

4. **svg-pan-zoom (ariutta/bumbu)**: Issue #131 "Allowing Touch Scrolling When Pan is Disabled?" (Jul 2015). User wants page to scroll when touching SVG but pan to work when zoomed. Source: https://github.com/bumbu/svg-pan-zoom/issues/131

5. **svg-pan-zoom (ariutta/bumbu)**: Issue #459 "Panning on two fingers drag/scroll" (May 2024). Two-finger drag should pan SVG but sometimes scrolls page. Source: https://github.com/bumbu/svg-pan-zoom/issues/459

6. **svg-pan-zoom (ariutta/bumbu)**: Issue #458 "How to pan-x but not pan-y to let page scroll?" (Mar 2024). No built-in support for directional pan that lets page scroll work in the other axis. Source: https://github.com/bumbu/svg-pan-zoom/issues/458

7. **svg-pan-zoom (ariutta/bumbu)**: Issue #261 "Infinite pan on touch devices" (Sep 2017). "On mobile devices users cant scroll page, because drag in infinite." Source: https://github.com/ariutta/svg-pan-zoom/issues/261

8. **svg-pan-zoom (ariutta/bumbu)**: Issue #468 "Zoom doesn't work on touch screens" (Sep 2025). Broken on modern touch devices. Source: https://github.com/bumbu/svg-pan-zoom/issues/468

9. **svg-pan-zoom (ariutta/bumbu)**: Issue #467 "Anchor tag around path elements don't work" (Sep 2025). Interactive SVG elements broken by pan-zoom. Source: https://github.com/bumbu/svg-pan-zoom/issues/467

10. **svg-pan-zoom (ariutta/bumbu)**: Issue #408 "[Violation] Added non-passive event listener to a scroll-blocking event" (May 2021, still open). Chrome console warnings. Source: https://github.com/bumbu/svg-pan-zoom/issues/408

11. **anvaka/panzoom**: Issue #26 "dispose() does not remove mouse wheel zoom" (Mar 2018). After destroying the instance, wheel zoom listener survived. Fixed in #27. Source: https://github.com/anvaka/panzoom/issues/26

12. **anvaka/panzoom**: README itself warns: "The library will handle ontouch events very aggressively, it will preventDefault, and stopPropagation for the touch events inside container. Sometimes this is not a desirable behavior." Source: https://github.com/anvaka/panzoom#handling-touch-events

13. **anvaka/panzoom**: README also states: "Sometimes zooming interferes with scrolling. If you want to alleviate it you can provide a custom filter." Source: https://github.com/anvaka/panzoom#ignore-mouse-wheel

14. **@panzoom/panzoom (timmywil)**: `pinchAndPan` option docs note: "the zoom has not yet painted and therefore the pan is working with old dimensions." Related: https://github.com/timmywil/panzoom/issues/512, https://github.com/timmywil/panzoom/issues/606. Source: https://www.npmjs.com/package/@panzoom/panzoom

### medium-zoom / SVG-specific issues

15. **medium-zoom**: Issue #190 "SVG images sometimes don't have a '.svg' extension" (May 2022, still open). Inline SVG doesn't work because it's not an `<img>`. Source: https://github.com/francoischalifour/medium-zoom/issues/190

16. **medium-zoom**: "Generated SVGs" guide confirms the workaround is to serialize SVG to data URL + `<img>`. Fragile for theme-adaptive SVGs (like lexicanum's currentColor diagrams) which need to be in live DOM to inherit CSS. Source: https://medium-zoom.francoischalifour.com/docs/guides/generated-svg/

### Diagram zoom UX criticism (general)

17. **Mermaid GitHub issue #4022**: "Mermaid diagrams on GitHub should be zoomable and scrollable." (open). Even developers find un-zoomable diagrams frustrating. Source: https://github.com/mermaid-js/mermaid/issues/4022

18. **Scroll-jacking UX research**: The SitePoint article (2014) documents that ANY wheel interception breaks: keyboard navigation (Space/PageUp/PageDown), screen readers (DOM flow disruption), vestibular disorders (unexpected motion), and mobile (touch event capture preventing page scroll). Source: https://www.sitepoint.com/scrolljacking-accessibility/

19. **mermaid-diagram-pan-zoom plugin**: This plugin's README explicitly documents the wheel-zoom conflict and offers `wheelZoomRequiresCtrl` as mitigation. Uses svg-pan-zoom underneath with `mouseWheelZoomEnabled: false` and custom handler. Source: https://github.com/im-bravo/mermaid-diagram-enhancements/blob/main/mermaid-diagram-pan-zoom/README.md

### A11y of lightboxes/zoom (general)

20. **Lightbox a11y critique**: Common problems with modal/image zoom overlays: focus not trapped, Esc not handled, no ARIA role, backdrop not announced to screen readers, close button not labeled, scroll position lost on close. The WAI-ARIA Dialog pattern requires: focus trap, `aria-modal="true"`, `aria-labelledby`, Esc dismissal, focus return to trigger on close. Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

21. **`prefers-reduced-motion`**: None of the pan-zoom libraries (a) check this media query. View Transitions API (f) and `<dialog>`/popover animations can be wrapped.

### Specific library bugs

22. **@beoe/pan-zoom**: Safari pixelation bug documented in README: `will-change: transform`, `transform: matrix3d()`, and `transition-property: transform` all cause SVG pixelation on zoom in Safari. Source: https://beoe.stereobooster.com/other/pan-zoom/#pixelation-in-safari

23. **svg-pan-zoom (ariutta/bumbu)**: Issue #469 "After using PanZoom, the drawing will become faint." (Oct 2025, open). Source: https://github.com/bumbu/svg-pan-zoom/issues/469

24. **svg-pan-zoom (ariutta/bumbu)**: No scrollbar support: "There is no way to have scrollbars by default inside of svg-pan-zoom as it's essentially an SVG, and inside of an SVG things behave like they're overflow: hidden." Source: https://stackoverflow.com/questions/48416078/how-to-display-scrollbar-in-svg-pan-zoom

---

## Observations

1. **@beoe/pan-zoom is the most wheel-safe pan-zoom library.** Its explicit design goal of avoiding scroll traps (ctrl+wheel for zoom, plain wheel for page scroll) makes it the best candidate among technique (a). Same author as the site's graphviz renderer. But it requires the user to learn the ctrl+wheel gesture.

2. **Techniques (c), (d), (e), and (g) have zero wheel-hijack risk** because they use native browser scroll, not JS wheel listeners. This is the strongest argument for them.

3. **Technique (e) - `<details>` toggle - is the absolute lightest approach** that still makes diagrams readable. Zero JS. Zero CSS beyond the scroll container. Native a11y. The tradeoff: expanded state is in-flow and pushes content down, which may be disruptive for tall diagrams.

4. **Technique (g) - Popover API - is the best "lightbox-lite."** It's an overlay (like the current lightbox) but with zero JS, native a11y, and light dismiss. It's the approach most likely to satisfy "we don't have to full on lightbox" - it IS a popover, not a lightbox. No backdrop dimming (or minimal), no zoom/pan complexity, just the diagram at readable size with horizontal scroll.

5. **Technique (c) - breakout - has the best in-flow reading experience** for wide-short diagrams. The diagram stays in context; the reader doesn't lose their place. But at narrow viewports, the horizontal scroll experience may feel cramped (153px-tall diagram with a scrollbar).

6. **Technique (f) - View Transitions - is polish, not a solution by itself.** It can animate any of (c), (e), or (g).

7. **Technique (i) - CSS hover zoom - should be dropped.** Broken on mobile, terrible a11y.

8. **Technique (h) - new tab - is a fallback, not a primary UX.**

9. **Lexicanum's inline SVG advantage**: SVGs are inline in the DOM (not images), so they inherit CSS (currentColor for theme adaptation). Any approach that converts to `<img>` (medium-zoom) loses this.

10. **The existing custom lightbox (the related photo site)** uses CSS `transform: scale()+translate3d` with drag pan and double-click zoom. This is technique (a) built by hand. The owner is comfortable with this approach for photos - the question is whether it's right for documentation diagrams where the primary need is "read the labels," not "explore the image."

---

## Techniques Not Included

- **Full-screen modal** (set aside - attempt 1)
- **Centred lightbox panel over dimmed page** (set aside - attempt 2, house kit v0.1.35)
- **iframe embedding** (adds layout complexity, loses theme)
- **Canvas-based renderer** (would need to replace the entire Graphviz pipeline)
- **Server-side image gen** (SVG is already images; the issue is display, not generation)
