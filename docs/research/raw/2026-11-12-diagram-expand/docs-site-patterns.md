# Docs-site diagram/image enlargement patterns - survey

Surveyed 2026-11-12. Context: a static Astro Starlight site with inline SVG Graphviz diagrams rendered at build time. Diagrams wider than the ~1150px content column are scaled down by the browser to labels of ~8-9px. Two overlay designs (a full-screen dialog and a modal lightbox panel) had already been tried and set aside.

## Survey table

### Critical constraint: inline SVG vs `<img>`

Lexicanum's diagrams are inline SVG (`<svg>` elements in the HTML). Most image-zoom patterns target `<img>` tags with raster content. GitHub and Mintlify's Mermaid controls are the only patterns that work on inline SVG. This is load-bearing: `medium-zoom`, `glightbox`, `react-medium-image-zoom` all clone or reparent `<img>` elements - they do NOT work on inline SVG without adaptation.

| Site / Framework | Pattern | Trigger | Close | Mobile | Keyboard / A11y | Notes | Source URL |
|---|---|---|---|---|---|---|---|
| **Starlight image zoom** (HiDeoo) | In-place zoom animation (medium-zoom) + `<dialog>` element lightbox. Daisy-chain: click opens `<dialog>` overlay, then medium-zoom animates the image. | Click on `<img>` | Click backdrop / press Esc | `<dialog>` is native; zoom on tap. | `<dialog>` traps focus. No custom keyboard controls. | Only works on `<img>` tags, not inline SVG. Daisy-chain of two different interaction models. | https://starlight-image-zoom.vercel.app/ / https://github.com/HiDeoo/starlight-image-zoom |
| **Docusaurus plugin-image-zoom** | In-place zoom animation (medium-zoom). Image scales up in the viewport with a dimmed backdrop. | Click on `.markdown img` | Click backdrop / Esc. Scroll-to-dismiss also works. | Pinch-to-zoom; medium-zoom handles touch. | Esc to close. No focus trap (pure visual overlay). | Two competing npm packages, both wrapping medium-zoom. Configurable selector, background color (light/dark), custom container. Exclude images by wrapping in `<em>`. Not for SVG. | https://www.npmjs.com/package/docusaurus-plugin-image-zoom / https://github.com/flexanalytics/plugin-image-zoom |
| **MkDocs Material glightbox** | Lightbox overlay (glightbox library). Click opens centered overlay. Supports captions and gallery navigation (next/prev arrows). | Click on `<img>` | Close button, Esc, or click backdrop. | Touch-swipe between gallery images. Tap close button. | Esc to close, arrow keys for prev/next, Tab trapped in lightbox. | Built-in plugin. Uses glightbox JS library. Captions from `title` attribute. Full-screen button in toolbar. | https://squidfunk.github.io/mkdocs-material/reference/images/#lightbox / https://github.com/biati-digital/glightbox |
| **GitHub markdown mermaid** | Inline pan/zoom controls on rendered SVG. 3x3 button grid bottom-right: arrow pan, center/reset, zoom in/out. Also mouse-wheel zoom (cursor-following) and click-drag pan. | Controls always visible on mermaid diagrams. Wheel + drag on the diagram. | N/A - controls are persistent, not a modal. | Touch: pinch-to-zoom, drag to pan. | 3x3 buttons are standard `<button>` elements. No keyboard-only pan/zoom. | **Gold standard for inline SVG diagrams.** Controls part of diagram container, not a separate overlay. Zoom starts to-fit; controls appear when diagram is large. | https://github.com/mermaid-js/mermaid/issues/1860 (knsv comment) |
| **GitLab markdown mermaid** | No zoom/pan controls. Has "Copy" button in toolbar. | N/A | N/A | N/A | N/A | Explicitly lacks GitHub's controls. User complaints in mermaid#1860. | https://gitlab.com / mermaid#1860 comments |
| **Mintlify - Mermaid diagrams** | Inline zoom/pan buttons (similar to GitHub's 3x3 grid). Controls appear when diagram height > 120px. Placement configurable (top-left, top-right, bottom-left, bottom-right). | Controls auto-show when height > 120px. Wheel zoom also supported. | N/A - controls persistent. | Same as desktop. | Buttons focusable. No dedicated keyboard shortcuts. | Full-screen edit mode in web editor only (not published docs). Issue #5751 requests zoom-to-fill-screen for published docs. | https://www.mintlify.com/docs/components/mermaid-diagrams / https://github.com/mintlify/docs/issues/5751 |
| **Mintlify - images** | Lightbox zoom. `zoom-image-lightbox` component. Click opens centered overlay. Disable per-image with `noZoom`. | Click on image | Click backdrop or close button. Presumably Esc. | Responsive, scales to viewport. | Unconfirmed (lightbox JS chunk: `zoom-image-lightbox-*.js`). | HTML `<img>` supports `noZoom`. Markdown `![]()` images get zoom by default. Not for SVG. | https://docs.n7s.dev/mintlify-guides/essentials/images / https://www.mintlify.com/docs/components/mermaid-diagrams |
| **Wikipedia Media Viewer** | Lightbox overlay. Click thumbnail -> large image + metadata panel + fullscreen button + gallery prev/next + share/embed/download. | Click on thumbnail | Esc, close button, click backdrop. | Touch: swipe between images, tap toggle metadata, pinch-to-zoom. | Full keyboard: Esc close, arrows prev/next, Tab through controls. Focus trapped. | Gallery navigation is key feature - browse ALL images in article without closing. "Use this file" tool. | https://en.wikipedia.org/wiki/Wikipedia:Media_Viewer |
| **Nextra** | In-place zoom via `react-medium-image-zoom`. Globally enabled by default for `![]()`. Disable globally or per-image via `<ImageZoom>` / `<Image>` components. | Click on image | Click backdrop / Esc | react-medium-image-zoom handles touch/pinch. | Focusable. Esc to close. | Only works on `<img>`, not inline SVG. Does NOT apply to images inside `<a>` tags. | https://nextra.site/docs/guide/image |
| **VitePress** | No built-in zoom. Community recipes add medium-zoom via custom theme hook. Same approach as medium-zoom plugins in other frameworks. | Click on `.vp-doc img` | medium-zoom default: click/scroll/Esc | medium-zoom handles touch. | Esc to close. | Community-driven, no official plugin. Works on `<img>` only. | https://github.com/vuejs/vitepress/discussions/854 |
| **Cloudflare Developer Docs** | No zoom mechanism. Mermaid diagrams are inline SVGs at natural dimensions. Re-rendered on theme change (light/dark). Static, no interactivity. | N/A | N/A | N/A | N/A | Reference Architecture docs have dedicated diagram pages with large SVGs at natural size. No zoom, just scroll. Custom platform. | https://developers.cloudflare.com/reference-architecture/diagrams/ |
| **D2 docs (d2lang.com)** | No zoom. SVG rendered with `--scale -1` (fit-to-screen default, per the D2 manpage). Can set explicit scale. `--center` centers in viewbox. | N/A | N/A | N/A | N/A | Renderer handles sizing, viewer adds no interactivity. Large diagrams expected at readable scale or viewed in playground (which has pan/zoom). | https://d2lang.com/tour/dimensions/ |
| **Mermaid Live Editor** | Full pan/zoom: scroll-wheel zoom (cursor-following), click-drag pan. No button grid - direct SVG manipulation. | Wheel = zoom. Drag = pan. | N/A (not a modal) | Pinch-to-zoom, drag to pan. | No dedicated keyboard controls; pointer-only. | Reference implementation of Mermaid's pan/zoom. GitHub's 3x3 grid is the embedded-docs version. | https://mermaid.live/ |
| **Gwern.net** | "Image focus": images initially blurred. Hover/focus unblurs to full resolution. NOT zoom - progressive-reveal for bandwidth/attention. | Hover / focus on image. | Mouse out / blur. | Touch: tap to focus, tap elsewhere to blur. | Focusable (Tab to reach, Enter/hover to reveal). | Different pattern entirely - not for diagram readability. Blurred images as thumbnails; hover reveals detail. | https://www.gwern.net/About#image-focus |
| **CSS Grid full-bleed breakout** | No interaction - pure layout. Content in narrow reading column. Wide diagrams break out to "breakout" track (wider than content, narrower than viewport). Full-bleed spans viewport. Named grid lines: `[full-start] [breakout-start] [content-start] ...`. | Layout, not interaction. | N/A | Breakout collapses on narrow screens -> looks like full-bleed (correct behavior). | N/A | **This may be what the owner wants.** Diagrams stay in reading flow at wider width. No click, no modal, no lightbox. Breakout width declared once, shared by all wide figures. Ryan Mulligan's article is canonical. | https://ryanmulligan.dev/blog/layout-breakouts/ / https://vocab.design/breakout |
| **Observable / NYT-style** | Full-bleed breakout graphics. Content narrow; diagrams/charts/maps break out to full viewport. Sometimes scrollytelling. | Layout + scroll position. | N/A | Diagrams stack vertically or become full-bleed. | N/A | Most extreme pattern: diagram takes over the page. For data journalism, not technical docs. | Various Observable notebooks / pudding.cool |
| **svg-toolbelt** (zakariaf) | Standalone JS library for SVG pan/zoom. Wheel zoom, click-drag, touch pinch, on-screen buttons, keyboard shortcuts. Zero dependencies. | Wheel / drag / pinch on SVG | N/A (toolbar always visible) | Touch gestures supported. | Arrow keys pan, +/- zoom, 0 reset, Esc fullscreen exit. | Full feature set of inline SVG pan/zoom as a library. | https://github.com/zakariaf/svg-toolbelt |
| **@avol-io/react-mermaid** | React component for Mermaid. Two toolbars: top-right (download, draw.io, fullscreen), bottom-right 3x3 grid (pan arrows, reset, zoom in/out). Uses react-zoom-pan-pinch. | Toolbar buttons + wheel/drag on diagram | N/A (toolbars persistent) | Touch via react-zoom-pan-pinch. | Arrow keys pan, +/- zoom, 0 reset, Esc fullscreen. | GitHub's mermaid controls as reusable React component. Fullscreen is secondary feature, not primary. | https://github.com/avol-io/react-mermaid |
| **docsify-mermaid-zoom** (corentinleberre) | d3-zoom on Mermaid SVGs in Docsify. Wheel zoom + drag-pan. | Wheel + drag on rendered SVG | N/A | Pinch-to-zoom and drag via d3-zoom's built-in touch. | No explicit keyboard controls (d3-zoom adds none). | Minimal, focused: `d3.zoom()` on the SVG. ~50 lines. | https://github.com/corentinleberre/docsify-mermaid-zoom |

### Quick-reference: patterns by category

| Category | Sites / Frameworks |
|---|---|
| **Modal / lightbox overlay** (click to open, Esc to close) | Starlight-image-zoom, MkDocs glightbox, Mintlify images, Wikipedia Media Viewer |
| **In-place zoom animation** (click scales image in viewport, no new UI) | medium-zoom plugins (Docusaurus, Nextra, VitePress community) |
| **Inline pan/zoom controls** (buttons + wheel/drag on the diagram itself) | GitHub mermaid, Mintlify mermaid, @avol-io/react-mermaid, svg-toolbelt |
| **Scroll-in-place** (diagram scrollable within fixed-height container) | Uncommon in surveyed docs sites; seen in dashboards and data tools |
| **Breakout to wider layout track** (no click - diagram sits in wider column) | CSS Grid breakout pattern, WordPress alignwide, Observable |
| **Full-bleed takeover** (diagram spans full viewport) | NYT/Pudding, Cloudflare Reference Architecture (some pages) |
| **Open in new tab** | Universal fallback; no site uses it as primary UX |
| **Hover reveal / image focus** | Gwern.net (not for diagrams) |
| **No mechanism at all** | Cloudflare docs (some), GitLab mermaid, D2 docs, VitePress (built-in) |

## User complaints and praise

### Complaints

1. **Mermaid #1860 (2021-2026, 30+ comments)**: "ZOOM!!!" - user creates a large flowchart and discovers it's unreadable because Mermaid forces `width="100%"` and `max-width`. "The main problem of flowcharts is hardnailing width=100% attribute and style={max-width: ...px} that render any diagram in completely useless unreadable unscrollable and unzoomable mess." (maelstrom256). "A medium to large database schema is completely unreadable" (dgbittner-sb). "Nice tool but not suitable for any serious flowcharts" (oxijas). Issue closed April 2026 with maintainer response: pan/zoom is "viewer-level concern" and responsibility of the host platform. https://github.com/mermaid-js/mermaid/issues/1860

2. **Mintlify #5751 (May 2026)**: "[feature] Mermaid - zoom to fill screen" - user requests that zoom controls allow zooming to fill the screen, not just a small container. Currently open. https://github.com/mintlify/docs/issues/5751

3. **Docusaurus #10883**: "Support for Expanding/Zooming Images and Diagrams" - requests a built-in lightbox. Currently open (as of this survey). https://github.com/facebook/docusaurus/issues/10883

4. **Nextra #2238 (Sep 2023)**: Request for built-in image zoom - eventually implemented in Dec 2024 via `react-medium-image-zoom`. https://github.com/shuding/nextra/issues/2238

5. **GitLab**: Users in mermaid#1860 thread note GitLab lacks GitHub's zoom controls entirely. "Gitlab is lacking that feature, but having a copy button at least" (maelstrom256).

### Praise

1. **GitHub mermaid zoom controls**: "GitHub provides the lovely zoom control (recently!)" (guhuajun, Mar 2023). The 3x3 grid pattern is widely praised as the most elegant solution for embedded diagrams - it's always there, doesn't interrupt reading flow, and doesn't require discovering a click target.

2. **Mermaid Live Editor**: Users consistently cite the live editor's pan/zoom as what they WANT in rendered diagrams. "My guess it's that is not that hard given that Mermaid Editor already have that feature" (senese, Dec 2023).

3. **medium-zoom**: Generally liked for image-heavy docs - it's fast, doesn't break reading flow, and the transition animation feels natural. "Beautiful" is a common description. The main complaint is that it only works on `<img>`, not on inline SVG.

4. **CSS Grid breakout**: Praised for being the only pattern where the reader does nothing - the diagram is just wide enough to read, in the flow, no interaction required. "Nothing overflows and nothing is pulled sideways out of its box" (vocab.design).

## Key observations

1. **The inline SVG problem**: Almost every image-zoom library targets `<img>` tags and does not work on inline SVG. Lexicanum's diagrams are inline SVG `<svg>` elements. Any `<img>`-based solution would require wrapping diagrams in `<img>` tags (possible but loses text selection, linkability within the diagram, and theme-aware styling).

2. **The "click to enlarge" discoverability problem**: Users of technical docs sites often don't realize images are clickable. Reddit and HN threads mention this repeatedly. The GitHub/Mintlify approach (visible controls) solves this by making the UI permanent.

3. **The modal rejection pattern**: Every modal/lightbox approach in this survey has drawbacks that match why the two overlays were set aside: interrupts reading flow, feels heavy, adds a UI layer, creates a before/after state the reader must manage. Wikipedia's gallery navigation is the exception - it's actually MORE functional than the inline view.

4. **The breakout as the unpattern**: CSS Grid breakout is the only approach with zero interaction cost. It only works if the diagram fits at some width between content-column and full viewport. For very large decision diagrams (100+ nodes), even breakout width may not be enough.

5. **GitHub's 3x3 pattern is the most copied**: Mintlify, @avol-io/react-mermaid, svg-toolbelt, and docsify-mermaid-zoom all implement the same grid-of-buttons + wheel-zoom + drag-pan pattern. It's becoming the de facto standard for inline SVG diagrams in docs.