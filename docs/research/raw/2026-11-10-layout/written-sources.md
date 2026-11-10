# Layout & Hierarchy Research: Written Sources
## 2026-11-10 · Raw sources for lexicanum#82

---

## 1. Josh Comeau, "Full-Bleed Layout Using CSS Grid" (2020)

**URL**: https://www.joshwcomeau.com/css/full-bleed/

**Key guidance and numbers**:
- Ideal line length: ~65 characters (45-85 acceptable in Roman alphabet)
- Grid solution: `grid-template-columns: 1fr min(42rem, 100%) 1fr;`
- All children default to column 2. Full-bleed children span `1 / 4`.
- Two padding approaches: (a) `gap` between columns + reduce centre width, or (b) `padding-inline` on wrapper + negative margin on `.full-bleed`
- The 42rem value gives ~65 characters for his font/size
- Called "gold-standard" layout for long-form content

**Assessment**: Practitioner pattern, widely adopted. No empirical study cited, but references research on line length. The CSS technique is sound.

---

## 2. Ryan Mulligan, "Layout Breakouts with CSS Grid" (2022)

**URL**: https://ryanmulligan.dev/blog/layout-breakouts/

**Key guidance and numbers**:
- Extension of Comeau's pattern with NAMED grid lines and five tiers:
  - `content`: `min(50ch, 100% - var(--gap) * 2)` (prose measure)
  - `popout`: `minmax(0, 2rem)` either side (slight breakout, e.g. images)
  - `feature`: `minmax(0, 5rem)` either side (medium breakout)
  - `full`: `minmax(var(--gap), 1fr)` (full bleed to viewport edges)
- CSS variables define column sizes; grid-template-columns uses named lines
- Uses `minmax()` to collapse breakouts on small screens
- **Known failure**: loses ability to float elements (no text-wrap around images)
- Visual bloom: content -> popout -> feature -> full

**Assessment**: Pattern, evolved from Comeau. Multi-tier breakout explicit and flexible. The float loss is a material limitation. No empirical study.

---

## 3. Tufte CSS (Dave Liepmann / Edward Tufte project)

**URL**: https://edwardtufte.github.io/tufte-css/

**Key guidance and numbers**:
- Two heading levels only (h2 section, h3 sub-section). Cites Feynman: "3 volumes, 1800 pages, only 2 levels"
- Main column + wide margin for sidenotes, margin notes, small figures
- `fullwidth` class: figure breaks out of column to "almost the full width of the screen"
- Sidenotes: in the margin on wide screens; collapsed (toggle) on narrow ones
- Body: ~55% main column width (per CSS source), leaving ~45% for margin notes
- Serif (ETBook) for body; "sans" class for Gill Sans
- Off-white `#fffff8` on `#111111` for reduced contrast
- `newthought` small-caps opening instead of headings as alternative

**Assessment**: Practitioner pattern. The "one left edge, extend right" pattern is one of the cleanest alternatives to centred-breakout. Margin notes need wide enough viewports; fail below ~760px where notes collapse.

---

## 4. GOV.UK Design System -- Layout

**URL**: https://design-system.service.gov.uk/styles/layout/

**Key guidance and numbers**:
- Two-thirds column for main content; optional one-third sidebar
- Max 75 characters per line
- Default page width: 1020px max
- Design for small screens first, single column
- Main content ALWAYS in two-thirds column, even without sidebar
- Full-width column available for exceptions

**Assessment**: Government design standard. Evidence-backed via user testing. Two-thirds = ~66% of 1020px = ~673px measure. No specific breakout mechanism for wide tables documented on this page.

---

## 5. GOV.UK Design System -- Type Scale

**URL**: https://design-system.service.gov.uk/styles/type-scale/

**Key guidance and numbers**:
- 80px (exceptional) / 48px (xl) / 36px (l) / 27px / 24px (m, body-l) / 19px (s, body) / 16px (body-s)
- Line heights in multiples of 5px: 80/50/40/30/25/20
- Responsive: scales down for <640px screens
- CSS in em/rem; docs show px for clarity
- Uses `govuk-font-size` and `govuk-font` Sass mixins

**Assessment**: Government standard. Empirically tested for readability. No modular scale -- sizes chosen by iteration and user testing.

---

## 6. GOV.UK Design System -- Headings

**URL**: https://design-system.service.gov.uk/styles/headings/

**Key guidance and numbers**:
- Sentence case for all headings
- Two hierarchies: (a) long-form content: `xl` -> `l` -> `m`; (b) question/service pages: `l` -> `m` -> `s`
- All heading levels have corresponding CSS classes

**Assessment**: Government standard. Practical, minimal. No decorative elements; pure hierarchy through size.

---

## 7. Butterick, "Headings" (Practical Typography)

**URL**: https://practicaltypography.com/headings.html

**Key guidance and numbers**:
- "Limit yourself to three levels of headings. Two is better."
- Best emphasis: space above and below
- Use bold, not italic
- "Make the point size bigger, but just a little" -- e.g. 12 to 12.5, not 12 to 14
- Don't use all caps, don't underline, don't centre
- Two levels of indenting maximum
- **Explicitly REJECTS modular scales**: "I've never used a modular scale to size type. And never will."
- If using bold heading, try reducing point size by half/full point

**Assessment**: Practitioner judgment, strongly held. No experiments cited. Direct contradiction to Tim Brown and many design systems.

---

## 8. Butterick, "Line Length" (Practical Typography)

**URL**: https://practicaltypography.com/line-length.html

**Key guidance and numbers**:
- 45-90 characters per line (including spaces)
- "2-3 alphabets" test: `abcdefghijklmnopqrstuvwxyz` repeated 2.31 times
- Shorter = more comfortable. Longer = eye travels farther.

**Assessment**: Practitioner standard. Matches Bringhurst (45-75) and web research.

---

## 9. Butterick, "Page Margins" (Practical Typography)

**URL**: https://practicaltypography.com/page-margins.html

**Key guidance and numbers**:
- Web needs big margins too -- "let go of 1994 habits"
- Focus on line length, not margin sizes: margins derive from line length
- "No publication uses 8.5x11 paper with one-inch margins for single-column text"
- Books: single column. Magazines: multi-column. Nobody uses letter-size single column.

**Assessment**: Practitioner judgment. The argument that line length should drive margins rather than vice versa is a key framing.

---

## 10. Every Layout, "Axioms" (Heydon Pickering / Andy Bell)

**URL**: https://every-layout.dev/rudiments/axioms/

**Key guidance and numbers**:
- Measure as a global axiom: "the measure should never exceed 60ch"
- Use `max-inline-size: 60ch` pervasively, not per-element
- Use `ch` units so measure adapts to font-size changes
- Exception-based styling: `* { max-inline-size: 60ch }` then reset on layout containers
- CSS variable as single source of truth for the measure value
- "Designing for the web is designing without seeing"

**Assessment**: Practitioner pattern, reasoned from first principles. The 60ch is a specific recommendation backed by Bringhurst's 45-75 range.

---

## 11. GitLab Pajamas, "Headings" (Design System)

**URL**: https://design.gitlab.com/product-foundations/type-headings/

**Key guidance and numbers**:
- Every page must have an h1 (can be visually hidden if context is clear)
- Headings must not skip levels
- `gl-heading-{1-6}` classes: font size, weight, line height, letter spacing, color, margins in one place
- Margins: default `margin-bottom` only, remove `margin-top`; opt out with `!gl-mb-0`
- Display heading class for promotional h1
- Scale classes `gl-heading-scale-{100-800}` for contextual overrides (use sparingly)

**Assessment**: Design system convention. Heading margin discipline (bottom-only) instructive for CSS architecture.

---

## 12. IBM Carbon Design System, "Typography"

**URL**: https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview

**Key guidance and numbers**:
- Two type sets: Productive (condensed, for product UI) and Expressive (editorial)
- Productive headings: fixed sizes. Expressive headings: responsive.
- Type scale (rem): 0.75 / 0.875 / 1 (body) / 1.125 / 1.25 / 1.5 / 1.75 / 2 / 2.25 / 2.625 / 3 / 3.375 / 3.75 / 4.25 / 4.75 / 5.25 / 5.75
- Weights: Light (300), Regular (400), Semibold (600) -- only three recommended for digital
- Semibold "ideal for section headers, but should not be used for long text"
- Font family: IBM Plex (Sans, Serif, Mono)

**Assessment**: Large-org design system. 17-step scale is comprehensive. Productive/Expressive split maps to docs pages needing both readable prose (Expressive) and dense tables (Productive).

---

## 13. Material Design 3, "Type Scale"

**URL**: https://m3.material.io/styles/typography/type-scale-tokens

**Key guidance and numbers**:
- 15 baseline + 15 emphasized type styles
- Display -> Headline -> Title -> Body -> Label
- Emphasized styles: higher weight, for selection/actions/headlines
- Brand typeface (Display/Headline) vs Plain typeface (Body/Label)
- Font size on web: `rem` (SP/16 = rem); default web 16px root

**Assessment**: Large-org design system. The emphasized/baseline dual track is interesting for docs.

---

## 14. Prior Research (lexicanum, 2026-11-10)

**Path**: `/home/erfi/lexicanum/docs/research/raw/2026-11-10-typography/`

**Key findings -- Measure**:
- Dyson & Haselgrove (2001): 55 cpl highest comprehension (empirical)
- Bringhurst: 45-75 cpl, most cited "optimal" is 66 cpl
- Shaikh (2005): 75-85 cpl fastest reading; users preferred 65-85
- **Consensus**: 50-75 cpl. At Newsreader 18px, that's roughly 34-42rem.

**Key findings -- Hierarchy**:
- NN/g F-pattern (evidence-backed): horizontal scan across top -> shorter horizontal -> vertical scan left
- Tim Brown (2011): modular scales produce "visual harmony." His own caveat: "math is no substitute for an experienced designer's eye"
- Butterick vs Brown: two poles of the modular-scale debate

---

## Sources read: 14 sources, 10+ distinct publications